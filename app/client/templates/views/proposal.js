var template;

Template['views_proposal'].rendered = function(){
	Meta.setSuffix(TAPi18n.__("dapp.proposal.title"));
    TemplateVar.set('state', {isVotable: true});
	template = this;
	
	var proposals = objects.defaultComponents.Proposals;
	
	proposals.numProposals.call(boardroomInstance.address, function (err, result){	

		if(isNaN(objects.params._proposal) && result.toNumber(10) > 0)
			 Router.go('/boardroom/' + boardroomInstance.address + '/proposal/' + (result.toNumber(10) - 1));

		Boards.update({address: boardroomInstance.address}, {$set: {numProposals: result.toNumber(10)}});
	});
	
	BoardRoom.importProposal(boardroomInstance.address, objects.params._proposal);
	
    /*Meteor.setTimeout(function(){
        $('#pdfContent').empty();
        Helpers.loadPDF('#pdfContent', 1, 'http://crossorigin.me/http://boardroom.to/BoardRoom_WhitePaper.pdf');
    }, 1000);*/
};

Template['views_proposal'].events({
	'click .btn-register-ipfs': function(event, eventTemplate){
		var backup = IPFS_Backup.findOne({boardroom: boardroomInstance.address, proposalID: objects.params._proposal}),
			proposalID = objects.params._proposal,
			txObject = {gas: 3000000, from: web3.eth.defaultAccount},
			registryTransactionHash = '';
		
		if(_.isUndefined(backup))
			return false;
		
		ipfs.addJson(backup.data, function(err, IPFS_hash){
			if(err)
				return TemplateVar.set(template, 'ipfs-state', {isError: true, error: String(err)});

			TemplateVar.set(template, 'ipfs-state', {isIPFSAdded: true, hash: IPFS_hash});

			objects.defaultComponents.HashRegistry.register(boardroomInstance.address, proposalID, IPFS_hash, txObject, function(err, registryTransactionHash){
				if(err)
					return TemplateVar.set(template, 'ipfs-state', {isError: true, error: String(err)});
				
				console.log(registryTransactionHash);

				TemplateVar.set(template, 'ipfs-state', {isRegisteringHash: true, transactionHash: registryTransactionHash});
			});
			
			objects.defaultComponents.HashRegistry.Registered({_board: boardroomInstance.address, _proposalID: proposalID}, function(err, result){
				if(err)
					return TemplateVar.set(template, 'ipfs-state', {isError: true, error: String(err)});
				
				console.log(result);

				TemplateVar.set(template, 'ipfs-state', {isMined: true, proposalID: proposalID, registryTransactionHash: registryTransactionHash, IPFS_hash: IPFS_hash});
			});
		});
	},
});

Template['views_proposal'].helpers({
	'methodHash': function(value){
		return '0x' + String(web3.sha3(value)).slice(0, 8);
	},
	'ipfsDataAvailable': function(){
		var backup = IPFS_Backup.findOne({boardroom: boardroomInstance.address, proposalID: objects.params._proposal});
		
		if(_.isUndefined(backup))
			return false;
		else
			return true;
	},
	'hashOfMethod': function(value){
		return '0x' + String(web3.sha3(value)).slice(0, 8);
	},
	'proposal': function(){
		var proposal = Proposals.findOne({boardroom: boardroomInstance.address, id: objects.params._proposal});
		
		if(_.isUndefined(proposal)
		  || _.isUndefined(BoardRoom.kinds[proposal.kind]))
			return;
		
		var dataLength = BoardRoom.kinds[proposal.kind].data.length,
			proposalKind = BoardRoom.kinds[proposal.kind];
		
		var backup = IPFS_Backup.findOne({boardroom: boardroomInstance.address, proposalID: objects.params._proposal});
		
		if((_.isUndefined(proposal.ipfsData) 
			|| proposal.ipfsData == null
			|| !_.has(proposal.ipfsData, 'blocks')
			|| proposal.ipfsData == null) 
		   && !_.isUndefined(backup)) {
			proposal.ipfsData = backup.data; 
			proposal.ipfsHash = 'unknown';
			proposal.ipfsBackup = true;
		}
		
		for(var blockID = 0; blockID < proposal.numAddresses; blockID++) {
			if(proposal.ipfsData == null
			   || _.isUndefined(proposal.ipfsData)
				|| !_.has(proposal.ipfsData, 'blocks'))
				break;
			
			proposal.ipfsData.blocks[blockID].parsed = [];
			proposal.ipfsData.blocks[blockID].id = 0;
			proposal.ipfsData.blocks[blockID].bytecodeVerified = false;
			proposal.ipfsData.blocks[blockID].hashVerified = false;
			
			var addr = proposal.ipfsData.blocks[blockID].destination;
			var value = proposal.ipfsData.blocks[blockID].value;
			var rawBlockData = [];
			
			proposal.ipfsData.blocks[blockID].destination = {raw: addr, kind: BoardRoom.kinds[proposal.kind].address};
			proposal.ipfsData.blocks[blockID].value = {raw: value, ether: web3.fromWei(value, 'ether'), kind: BoardRoom.kinds[proposal.kind].value};
			
			try {
				for(var rawID = 0; rawID < proposal.ipfsData.blocks[blockID].raw.length; rawID++) {
					var rawData = proposal.ipfsData.blocks[blockID].raw[rawID],
						bytecodeData = rawData,
						kind_index = rawID,
						parseData = rawData;

					// Handle Bytes and Encoding
					if(BoardRoom.kinds[proposal.kind].data[kind_index].type == "bytes"){
						bytecodeData = ethUTIL.stripHexPrefix(bytecodeData);

						if(_.has(BoardRoom.kinds[proposal.kind].data[kind_index], 'encodeBase58')) {
							parseData = ipfs.utils.hexToBase58(bytecodeData);
							bytecodeData = new Buffer(bytecodeData, 'hex');
						}else{
							bytecodeData = new Buffer(bytecodeData);
						}
					}

					// State Kind Index
					if(kind_index >= BoardRoom.kinds[proposal.kind].data.length)
						kind_index = kind_index - BoardRoom.kinds[proposal.kind].data.length;

					// Setup Parsed IPFS blocks for template
					proposal.ipfsData.blocks[blockID].parsed[rawID] = {
						raw: rawData,
						bytecode: bytecodeData,
						parsed: parseData,
						kind: BoardRoom.kinds[proposal.kind].data[kind_index],
					};

					// Push raw data for bytecode recreation
					rawBlockData.push(bytecodeData);
				}
				
				var bytecode = new Buffer([0]);

				// rebuild bytecode and verify validity
				if(proposal.kind > 0 && _.isString(proposal.ipfsData.blocks[blockID].bytecode))
					bytecode = ethABI.rawEncode(proposalKind.methodShort, proposalKind.abi, rawBlockData);

				var hash = '0x' + ethABI.soliditySHA3(["address", "uint256", "bytes"], [new ethABI.BN(ethUTIL.stripHexPrefix(addr), 16), value, bytecode]).toString('hex');
				bytecode = bytecode.toString('hex');

				if(!_.isString(proposal.ipfsData.blocks[blockID].bytecode))
					proposal.ipfsData.blocks[blockID].bytecode = '0';

				if(bytecode == proposal.ipfsData.blocks[blockID].bytecode)
					proposal.ipfsData.blocks[blockID].bytecodeVerified = true;

				if(hash == proposal.ipfsData.blocks[blockID].hash)
					proposal.ipfsData.blocks[blockID].hashVerified = true;
			}catch(e){}
		}
		
		return proposal;
	},
});