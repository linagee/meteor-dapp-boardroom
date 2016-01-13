Template['views_newProposal'].created = function(){
	Meta.setSuffix(TAPi18n.__("dapp.newProposal.title"));
    TemplateVar.set('state', {});
};

Template['views_newProposal'].rendered = function(){
    var _kind = objects.params._kind,
        template = this;
    TemplateVar.set(this, 'selectedKind', BoardRoom.kinds[0]);
	TemplateVar.set(this, 'dataChunks', [{chunkID: 0}]);
    
    _.each(BoardRoom.kinds, function(kind, kindIndex){
        if(kind.code == _kind)
            TemplateVar.set(template, 'selectedKind', BoardRoom.kinds[kind.id]);
    });
	
	objects.defaultComponents.Voting.canTable(boardroomInstance.address, 1, web3.eth.defaultAccount, function(err, result){
		console.log('can table', err, result);
	});
};

Template['views_newProposal'].helpers({
    'update': function(){
        var query = Router.current().params.query;
        
        /*TemplateVar.set('proposalName', query.name);
        TemplateVar.set('proposalAddress', query.address);
        TemplateVar.set('proposalValue', query.value);
        TemplateVar.set('proposalData', query.data);
        TemplateVar.set('proposalExpiry', query.expiry);*/
        
        // NameReg helper
        /*if(TemplateVar.get('kind') == '15'
          || TemplateVar.get('kind') == '16')
            TemplateVar.set('proposalAddress', LocalStore.get('nameregAddress'));*/
        
        Meteor.setTimeout(function(){ //timeout hack.
            $('.datetimepicker').datetimepicker();
        }, 300);
    },
	'methodHash': function(value){
		return '0x' + String(web3.sha3(value)).slice(0, 8);
	},
	'methodProcessorHash': function(kind){
		//return objects.defaultComponents.Processor.methodName(kind);
	},
	'methodHashesMatch': function(value, kind){
		//return (String('0x' + String(web3.sha3(value)).slice(0, 8)) == String(objects.defaultComponents.Processor.methodName(kind)));
	},
	'proposalKinds': function(){
		return BoardRoom.kinds;	
	},
});

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
		var kind = parseInt($('#proposalKind').val()),
			kindObject = BoardRoom.kinds[kind],
			dataSize = kindObject.data.length,
            name = String($('#proposalName').val()),
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
				method: kindObject.method,
				abi: kindObject.abi,
				blocks: [],
				created: moment().unix()
			},
			valueArray = [],
			dataArray = [],
			addressArray = [];
		
		//if(kind == 0)
		//	transactionBytecode = String($('#proposalBytecode').val());
		
		for(var c = 0; c < chunks.length; c++){
			var chunk_id = chunks[c].chunkID,
				address = $('#proposalAddress_' + chunk_id).val(),
				value = parseInt($('#proposalValue_' + chunk_id).val()),
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
					dataType = kindObject.data[d].type;
				
				ipfsBlock.raw.push(dataValue);
			}
			
			if(kind == 0)
				ipfsBlock.bytecode = proposalBytecode == '' ? 0 : proposalBytecode;
			else
				ipfsBlock.bytecode = ethABI.rawEncode(kindObject.methodShort, kindObject.abi, ipfsBlock.raw);
			
			// ERROR HERE WITH TYPE 0
			ipfsBlock.hash = '0x' + ethABI.soliditySHA3(["address", "uint256", "bytes"], [new ethABI.BN(ethUTIL.stripHexPrefix(address), 16), value, ipfsBlock.bytecode]).toString('hex');
			
			if(kind > 0)
				ipfsBlock.bytecode = ipfsBlock.bytecode.toString('hex');
			
			ipfsData.blocks.push(ipfsBlock);
			dataArray.push(ipfsBlock.hash);
		}
	
		console.log(boardroomInstance.address, name, kind, dataArray, valueArray, addressArray, ipfsData);
		
		/*
		(address _board, string _name, uint _kind,
				bytes32[] _data, uint[] _value, address[] _addr, 
				bytes _transactionBytecode)*/
		
		ipfs.cat('Qmc7CrwGJvRyCYZZU64aPawPj7CJ56vyBxdhxa38Dh1aKt', function(err, result){
			if(err)
				throw err;
			
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
    },
});