Template['views_newProposal'].created = function(){
	Meta.setSuffix(TAPi18n.__("dapp.newProposal.title"));
    TemplateVar.set('state', {});
};

Template['views_newProposal'].rendered = function(){
    var _kind = objects.params._kind,
        template = this;
    TemplateVar.set(this, 'selectedKind', BoardRoom.kinds[0]);
	TemplateVar.set(this, 'dataChunks', [{chunkID: 0}]);
	TemplateVar.set(this, 'userStatus', {canTable: false});
    
    _.each(BoardRoom.kinds, function(kind, kindIndex){
        if(kind.code == _kind)
            TemplateVar.set(template, 'selectedKind', BoardRoom.kinds[kind.id]);
    });
	
	objects.defaultComponents.Voting.canTable(boardroomInstance.address, 1, web3.eth.defaultAccount, function(err, result){
		if(!err)
			TemplateVar.set(template, 'userStatus', {canTable: result});
	});
};

Template['views_newProposal'].helpers({
    'update': function(){
        var query = Router.current().params.query;
        
        Meteor.setTimeout(function(){ //timeout hack.
            $('.datetimepicker').datetimepicker();
        }, 300);
    },
	'hashOfMethod': function(value){
		return '0x' + String(web3.sha3(value)).slice(0, 8);
	},
	'personaAddress': function(){
		return LocalStore.get('personaAddress');	
	},
	'boardroomAddress': function(){
		return boardroomInstance.address;	
	},
	'proposalKinds': function(){
		return BoardRoom.kinds;	
	},
});
		
ethUTIL.escapeSpecialChars = function(jsonString) {
	return jsonString.replace(/\n/g, "\\n")
		.replace(/\r/g, "\\r")
		.replace(/\t/g, "\\t")
		.replace(/\0/g, "")
		.replace(/[^\x00-\x7F]/g, "")
		.replace(/\f/g, "\\f");
}

Template['views_newProposal'].events({
    'click .btn-data-compress': function(event, template){
        var data = $('#proposalData').val();
        data = Helpers.compressURL(data);
        $('#proposalData').val(data);
    },
    
    'click .btn-add-chunk': function(event, template){
		var chunks = TemplateVar.get(template, 'dataChunks'),
			latest = {chunkID: 0},
			newID = 0;
		
		if(chunks.length) {
			latest = chunks[chunks.length - 1],
			newID = latest.chunkID + 1;
		}
		
		chunks.push({chunkID: newID});
		TemplateVar.set(template, 'dataChunks', chunks);
    },
    
    'click .btn-remove-chunk': function(event, template){
		var chunks = TemplateVar.get(template, 'dataChunks');
		
		if(chunks.length == 1)
			return;
		
		chunks.pop();
		TemplateVar.set(template, 'dataChunks', chunks);
    },
    
    'change #proposalKind': function(event, template){
        var val = parseInt($('#proposalKind').val());
        $('.datetimepicker').datetimepicker();
        
        TemplateVar.set(template, 'selectedKind', BoardRoom.kinds[val]);
    },
    
    'click .btn-table': function(event, template){
		TemplateVar.set(template, 'state', {isTabling: true});
		
		
		try {
			var kind = parseInt($('#proposalKind').val()),
				kindObject = BoardRoom.kinds[kind],
				dataSize = kindObject.data.length,
				name = ethUTIL.escapeSpecialChars(String($('#proposalName').val())),
				proposalBytecode = String($('#proposalBytecode').val()),
				transactionBytecode = '',
				chunks = TemplateVar.get(template, 'dataChunks'),
				txObject = {
					gas: 3000000,
					from: web3.eth.defaultAccount
				},
				ipfsData = {
					version: '0.0.1',
					board: boardroomInstance.address,
					member: web3.eth.defaultAccount,
					kind: kind,
					description: ethUTIL.escapeSpecialChars(String($('#proposalDescription').val()).replace(/[^\u0000-\u007E]/g, "")),
					method: kindObject.method,
					abi: kindObject.abi,
					blocks: [],
					created: moment().unix()
				},
				valueArray = [],
				dataArray = [],
				addressArray = [];

			for(var c = 0; c < chunks.length; c++){
				var chunk_id = chunks[c].chunkID,
					address = $('#proposalAddress_' + chunk_id).val(),
					value = web3.toWei(parseInt($('#proposalValue_' + chunk_id).val()), 'ether'),
					parsed = [],
					ipfsBlock = {
						bytecode: 0,
						hash: '',
						raw: [],
						destination: address,
						value: value,
					};

				addressArray.push(address);
				valueArray.push(value);

				for(var d = 0; d < dataSize; d++){
					var dataValue = $('#proposalData_' + d + '_' + chunk_id).val(),
						dataParsedValue = dataValue,
						dataType = kindObject.data[d].type;

					if(dataType == "address")
						dataParsedValue = new ethABI.BN(ethUTIL.stripHexPrefix(dataValue), 16);

					if(_.has(kindObject.data[d], 'encodeBase58')) {
						dataParsedValue = new Buffer(ipfs.utils.base58ToHex(dataValue), 'hex');
						dataValue = '0x' + ipfs.utils.base58ToHex(dataValue);
					}else{
						if(dataType == "bytes" || dataType == "string")
							dataParsedValue =  new Buffer(dataParsedValue);
					}

					if(dataType == "bytes" && (dataValue == "" || dataValue == 0))
						dataParsedValue =  new Buffer([0]);

					parsed.push(dataParsedValue);
					ipfsBlock.raw.push(dataValue);
				}

				if(kind == 0)
					ipfsBlock.bytecode = proposalBytecode == '' ? new Buffer([0]) : ethUTIL.stripHexPrefix(proposalBytecode);
				else
					ipfsBlock.bytecode = ethABI.rawEncode(kindObject.methodShort, kindObject.abi, parsed);

				// ERROR HERE WITH TYPE 0
				ipfsBlock.hash = '0x' + ethABI.soliditySHA3(["address", "uint256", "bytes"], [new ethABI.BN(ethUTIL.stripHexPrefix(address), 16), value, ipfsBlock.bytecode]).toString('hex');

				if(kind == 0 && _.has(ipfsBlock.bytecode, 'isBuffer'))
					ipfsBlock.bytecode = ipfsBlock.bytecode.toString('hex');

				if(kind > 0)
					ipfsBlock.bytecode = ipfsBlock.bytecode.toString('hex');

				ipfsData.blocks.push(ipfsBlock);
				dataArray.push(ipfsBlock.hash);
			}
			
			console.log('value array', valueArray);

			ipfs.cat('Qmc7CrwGJvRyCYZZU64aPawPj7CJ56vyBxdhxa38Dh1aKt', function(err, result){
				if(err)
					return TemplateVar.set(template, 'state', {isError: true, error: String(err)});

				var tableTransactionHash = '';

				objects.defaultComponents.Proposals.table.sendTransaction(boardroomInstance.address, name, kind, 
																		  dataArray, valueArray, addressArray, txObject, function(err, result){
					if(err)
						return TemplateVar.set(template, 'state', {isError: true, error: String(err)});

					tableTransactionHash = result;			
					TemplateVar.set(template, 'state', {isTabling: true, transactionHash: result});
				});

				objects.defaultComponents.Proposals.Tabled({_board: boardroomInstance.address}, function(err, result){
					if(err)
						return TemplateVar.set(template, 'state', {isError: true, error: String(err)});

					var proposalID = result.args._proposalID.toNumber(10),
						IPFS_hash = '',
						registryTransactionHash = '';

					TemplateVar.set(template, 'state', {isAddingIPFS: true, proposalID: proposalID});

					IPFS_Backup.upsert({boardroom: boardroomInstance.address, proposalID: proposalID}, {boardroom: boardroomInstance.address, proposalID: proposalID, data: ipfsData});

					ipfs.addJson(ipfsData, function(err, result){
						if(err)
							return TemplateVar.set(template, 'state', {isError: true, error: String(err)});

						IPFS_hash = result;

						TemplateVar.set(template, 'state', {isIPFSAdded: true, hash: result});

						objects.defaultComponents.HashRegistry.register(boardroomInstance.address, proposalID, IPFS_hash, txObject, function(err, result){
							if(err)
								return TemplateVar.set(template, 'state', {isError: true, error: String(err)});

							registryTransactionHash = result;

							TemplateVar.set(template, 'state', {isRegisteringHash: true, transactionHash: result});
						});
					});

					objects.defaultComponents.HashRegistry.Registered({_board: boardroomInstance.address, _proposalID: proposalID}, function(err, result){
						if(err)
							return TemplateVar.set(template, 'state', {isError: true, error: String(err)});

						TemplateVar.set(template, 'state', {isMined: true, proposalID: proposalID, tableTransactionHash: tableTransactionHash, registryTransactionHash: registryTransactionHash, IPFS_hash: IPFS_hash});
					});
				});
			});
		}catch(err){
			return TemplateVar.set(template, 'state', {isError: true, error: String(err)});
		}
    },
});