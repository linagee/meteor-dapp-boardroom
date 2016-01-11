BoardRoom.info = function(boardroomInstance, callObject, callback){
    if(_.isFunction(callObject))
        callback = callObject;
    
    if(_.isUndefined(callback))
        callback = function(err, result){};
    
    if(_.isUndefined(callObject))
        callObject = {};
    
    var properties = ['numExecuted', 'numProposals', 'numMembers', 'parent', 'configAddr', 'numMembersActive', 'chair', 'numChildren', 'numChildrenActive', 'balance'],
        batch = web3.createBatch(),
        return_object = {address: boardroomInstance.address};
    
    _.each(properties, function(property, propertyIndex){
        batch.add(boardroomInstance[property](function(err, result){ //callObject
            if(web3.isBigNumber(result))
                result = result.toNumber(10);
                
            return_object[property] = result;
            
            if(propertyIndex == properties.length - 1)
                callback(err, return_object);
        }));
    });
    
    try {
        batch.execute();
    }catch(e){ 
        //console.log(e);   
    }
};

var BoardroomMinimongoImport = function(methodName, filter, args, mongodb){
    var boardroomAddress = args[0],
        indexFrom = args[1],
        indexTo = indexFrom + 1,
        callObject = {},
        callback = function(e, r){};

    _.each(args, function(arg, argIndex){
        if(argIndex > 1 && _.isNumber(arg))
            indexTo = arg;

        if(_.isFunction(arg))
            callback = arg;

        if(_.isObject(arg) 
           && !_.isFunction(arg) 
           && !_.isNumber(arg))
            callObject = arg;
    });
    
    if(indexTo < 0)
        indexTo = 0;
    
    if(_.isUndefined(filter))
        filter = function(id, result){ return true; };
    
    var batch = web3.createBatch(),
        abi = BoardRoom.abi,
        boardroomInstance = BoardRoom.Contract.at(boardroomAddress);
    
    var addToBatch = function(batchInstance, id){
        batchInstance.add(boardroomInstance[methodName](id, function(err, result){ 
            if(err)
                return;

            result = web3.returnObject(methodName, result, abi);
            var idObject = {id: id, boardroom: boardroomAddress};
            
            if(!filter(id, result))
                return;
            
            if(mongodb.find(idObject).fetch().length) {
                mongodb.update(mongodb.findOne(idObject)._id, {$set: _.extend(idObject, result), $setOnInsert: _.extend(idObject, result)}, {upsert: true});
            } else {
                mongodb.upsert(idObject, {$set: _.extend(idObject, result)});
            }
        }));
    };
    
    try{
        // add fromIndex item
        addToBatch(batch, indexFrom);

        // add other items to fromTo index
        for(var id = indexFrom; id < indexTo; id++) {
            addToBatch(batch, id);
        }
        
        batch.execute();
    }catch(e){
        //console.log(e);
    }
};

BoardRoom.ProposalsMinimongo = function(mongodb){
    mongodb.import = function(){
        var args = Array.prototype.slice.call(arguments),
            filter = function(id, proposal){
            if(proposal.kind == 0)
                return false;
            
            return true;
        };
        
        BoardroomMinimongoImport('proposals', filter, 
                                 args, mongodb);
    };
};

BoardRoom.ChildrenMinimongo = function(mongodb){
    mongodb.import = function(){
        var args = Array.prototype.slice.call(arguments),
            filter = function(id, child){
                
            console.log(id, child);
                
            if(child.addr == web3.address(0))
                return false;
            
            return true;
        };
        BoardroomMinimongoImport('children', filter, 
                                 args, mongodb);
    };
};

BoardRoom.MembersMinimongo = function(mongodb){
    mongodb.import = function(){
        var args = Array.prototype.slice.call(arguments);
        var filter = function(id, member){
            if(member.addr == web3.address(0))
                return false;
            
            return true;
        };
        BoardroomMinimongoImport('members', filter, 
                                 args, mongodb);
    };
};

BoardRoom.DelegationsMinimongo = function(mongodb){
    mongodb.import = function(){
        var args = Array.prototype.slice.call(arguments);
        BoardroomMinimongoImport('delegations', args, function(id, child){return true;}, mongodb);
    };
};

BoardRoom.BoardsMinimongo = function(mongodb){
    mongodb.import = function(){
        var args = Array.prototype.slice.call(arguments),
            address = args[0],
            callObject = {},
            callback = function(err, result){};
        
        BoardRoom.info(BoardRoom.Contract.at(address), callObject, function(err, result){
            if(err)
                return;
            
            if(result.numMembers == 0)
                return;            
            
            if(mongodb.find({address: result.address}).fetch().length) {
                mongodb.update(mongodb.findOne({address: result.address})._id, {$set: _.extend({address: result.address}, result)});
            } else {
                mongodb.upsert({address: result.address}, {$set: _.extend({address: result.address}, result)});
            }
                           
        });
    };
};

BoardRoom.importProposal = function(board, proposalID){
	if(!_.isNumber(proposalID)
	   || _.isUndefined(proposalID)
	   || isNaN(proposalID)
	   || proposalID == NaN)
		return;
	
	objects.defaultComponents.Proposals.proposals.call(board, proposalID, function(err, result){	
		var proposalObject = Proposals.findOne({boardroom: board, id: proposalID});
		
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
			proposalObject["hasWon"] = false;
			proposalObject["expiry"] = proposalObject.created + (30*24*3600);
			
			if(proposalObject["expiry"] < moment().unix()
			   || proposalObject["executed"] == true) {
				proposalObject["isExecutable"] = false;
				proposalObject["isVotable"] = false;
			} else {
				proposalObject["isVotable"] = true;
			}
		}
		
		var proposalObjectParsed = web3.returnObject('proposals', result, objects.defaultComponents.Proposals.abi);
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

		objects.defaultComponents.Proposals.numValuesIn(board, proposalID, function(err, valueCount){
			objects.defaultComponents.Proposals.numAddressesIn(board, proposalID, function(err, addressCount){
				objects.defaultComponents.Proposals.numDataIn(board, proposalID, function(err, dataCount){
					objects.defaultComponents.Proposals.voteCountOf(board, proposalID, function(err, voteCount){
						proposalObject['numValues'] = valueCount.toNumber(10);
						proposalObject['numAddresses'] = addressCount.toNumber(10);
						proposalObject['numData'] = dataCount.toNumber(10);
						proposalObject['numVotes'] = voteCount.toNumber(10);
						
						Proposals.upsert({boardroom: board, id: proposalID}, proposalObject);

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

											Proposals.update({boardroom: boardroomInstance.address, id: objects.params._proposal}, {$set: {numWeightFor: numWeightFor, numWeightAgainst: numWeightAgainst, numFor: numFor, numAgainst: numAgainst}});	
										}
									});
								});
							});
						}

						for(var v = 0; v < proposalObject['numValues']; v++){
							insertValue(v);
							insertAddress(v);
						}

						for(var voteID = 0; voteID < proposalObject['numVotes']; voteID++){
							insertVote(voteID);
						}

						for(var d = 0; d < proposalObject['numData']; d++){
							insertData(d);
						}
					});
				});
			});
		});
	});
}