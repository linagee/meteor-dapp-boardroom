BoardRoom.importProposal = function(board, proposalID){
	if(!_.isNumber(proposalID)
	   || _.isUndefined(proposalID)
	   || isNaN(proposalID)
	   || proposalID == NaN)
		return;
	
	objects.defaultComponents.Proposals.proposals.call(board, proposalID, function(err, result){	
		var proposalObject = Proposals.findOne({boardroom: board, id: proposalID});
		var proposalObjectParsed = web3.returnObject('proposals', result, objects.defaultComponents.Proposals.abi);
		
		if(_.isUndefined(proposalObject)) {
			proposalObject = {boardroom: board, id: proposalID, value: {}, data: {}, addr: {}, votes: {}};
			proposalObject['numValues'] = 0;
			proposalObject['numAddresses'] = 0;
			proposalObject['numData'] = 0;
			proposalObject['numVotes'] = 0;
			proposalObject['numFor'] = 0;
			proposalObject['numAgainst'] = 0;
			proposalObject['numAbstains'] = 0;
			proposalObject["isExecutable"] = false;
			proposalObject["isVotable"] = true;
			proposalObject["ipfsHash"] = '';
			proposalObject["ipfsData"] = {};
			proposalObject["hasWon"] = false;
			
			if(proposalObject["expiry"] < moment().unix()
			   || proposalObject["executed"] == true) {
				proposalObject["isExecutable"] = false;
				proposalObject["isVotable"] = false;
			} else {
				proposalObject["isVotable"] = true;
			}
		}
		
		proposalObject["expiry"] = proposalObjectParsed.created + (30*24*3600);
		proposalObject = _.extend(proposalObject, proposalObjectParsed);		
		
		if(proposalObject.created == 0
		  || proposalObject.from == web3.address(0)
		  || !_.isNumber(proposalID)
		  || proposalID == 'NaN'
		  || proposalID == NaN
		  || _.isUndefined(proposalID)
		  || _.isUndefined(proposalObject.id)
		  || isNaN(proposalID)
		  || isNaN(proposalObject.id)
		  || !_.isNumber(proposalObject.id)
		  || proposalObject.id == NaN)
			return;

		delete proposalObject._id;
		Proposals.upsert({boardroom: board, id: proposalID}, {$set: proposalObject});

		objects.defaultComponents.Voting.hasWon(board, proposalID, function(err, hasWon){
			var updateObject = {hasWon: hasWon};

			if(hasWon && proposalObject["expiry"] > moment().unix()) {
				updateObject.isExecutable = true;
				updateObject.isVotable = false;
			}

			Proposals.update({boardroom: board, id: proposalID}, {$set: updateObject});
		});

		objects.defaultComponents.Voting.canExecute(board, proposalID, web3.eth.defaultAccount, function(err, canExecute){
			var updateObject = {canExecute: canExecute};

			Proposals.update({boardroom: board, id: proposalID}, {$set: updateObject});
		});

		objects.defaultComponents.Voting.canVote(board, proposalID, web3.eth.defaultAccount, function(err, isVotable){
			var updateObject = {isVotable: isVotable};

			Proposals.update({boardroom: board, id: proposalID}, {$set: updateObject});
		});
						
		try {
			objects.defaultComponents.HashRegistry.hashOf(board, proposalID, function(err, result){
				if(err || result == "")
					return;
				
				try {
					var updateObject = {ipfsHash: result};

					ipfs.catJson(updateObject.ipfsHash, function(err, result){				
						
						try {
							updateObject.ipfsData = result;

							Proposals.update({boardroom: board, id: proposalID}, {$set: updateObject});
						}catch(e){console.log(e);}
					});
				}catch(e){console.log(e);}
			});
		}catch(e){console.log(e);}
		
		objects.defaultComponents.Proposals.voteCountOf(board, proposalID, function(err, voteCount){
			var updateObject = {numVotes: voteCount.toNumber(10)};
			
			Proposals.update({boardroom: board, id: proposalID}, {$set: updateObject});
			
			// UNTESTED!!!
			function insertVote(voteID){
				objects.defaultComponents.Proposals.memberOf(board, proposalID, voteID, function(err, member){
					objects.defaultComponents.Proposals.positionOf(board, proposalID, voteID, function(err, position){
						var updateObject = {};
						updateObject["votes." + voteID] = {weight: 0, member: member, position: position.toNumber(10)};

						Proposals.update({boardroom: board, id: proposalID}, {$set: updateObject});

						var token = Standard_Token.at(boardroomInstance.addressOfArticle(objects.defaultArticles.Token));

						token.balanceOf.call(member, function(err, tokenBalance){
							var updateObject = {};
							updateObject["votes." + voteID + '.weight'] = tokenBalance.toNumber(10);

							Proposals.update({boardroom: board, id: proposalID}, {$set: updateObject});

							if(voteID == proposalObject['numVotes'] - 1){
								var proposal = Proposals.findOne({boardroom: board, id: proposalID});
								var numWeightFor = 0, numWeightAgainst = 0, numFor = 0, numAgainst = 0;

								for(var voterID = 0; voterID < proposalObject['numVotes']; voterID++){
									if(proposal.votes[voterID].position == 1) {
										numWeightFor += proposal.votes[voterID].weight;
										numFor += 1;
									}

									if(proposal.votes[voterID].position == 0) {
										numWeightAgainst += proposal.votes[voterID].weight;
										numAgainst += 1;
									}
								}

								Proposals.update({boardroom: boardroomInstance.address, id: proposalID}, {$set: {numWeightFor: numWeightFor, numWeightAgainst: numWeightAgainst, numFor: numFor, numAgainst: numAgainst}});	
							}
						});
					});
				});
			}

			for(var voteID = 0; voteID < updateObject.numVotes; voteID++){
				insertVote(voteID);
			}
		});

		objects.defaultComponents.Proposals.numAddressesIn(board, proposalID, function(err, addressCount){
			var updateObject = {numValues: addressCount.toNumber(10), numAddresses: addressCount.toNumber(10), numData: addressCount.toNumber(10)};

			Proposals.update({boardroom: board, id: proposalID}, {$set: updateObject});

			function insertValue(v){
				objects.defaultComponents.Proposals.valueAt(board, proposalID, v, function(err, value){
					var updateObject = {};
					updateObject["value." + v] = value.toNumber(10);

					Proposals.update({boardroom: board, id: proposalID}, {$set: updateObject});
				});
			}

			function insertAddress(a){
				objects.defaultComponents.Proposals.addressAt(board, proposalID, a, function(err, value){
					var updateObject = {};
					updateObject["addr." + a] = value;

					Proposals.update({boardroom: board, id: proposalID}, {$set: updateObject});
				});
			}

			function insertData(d){
				objects.defaultComponents.Proposals.dataAt(board, proposalID, d, function(err, value){
					var updateObject = {};
					updateObject["data." + d] = value;

					Proposals.update({boardroom: board, id: proposalID}, {$set: updateObject});
				});
			}

			for(var v = 0; v < proposalObject['numValues']; v++){
				insertValue(v);
				insertAddress(v);
			}

			for(var d = 0; d < proposalObject['numData']; d++){
				insertData(d);
			}
		});
	});
}