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
		return objects.defaultComponents.Processor.methodName(kind);
	},
	'methodHashesMatch': function(value, kind){
		return (String('0x' + String(web3.sha3(value)).slice(0, 8)) == String(objects.defaultComponents.Processor.methodName(kind)));
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
			transactionBytecode = '',
			chunks = TemplateVar.get(template, 'dataChunks'),
			txObject = {
				gas: 3000000,
				from: web3.eth.defaultAccount
			},
			valueArray = [],
			dataArray = [],
			addressArray = [];
		
		if(kind == 0)
			transactionBytecode = String($('#proposalBytecode').val());
		
		for(var c = 0; c < chunks.length; c++){
			var chunk_id = chunks[c].chunkID,
				address = $('#proposalAddress_' + chunk_id).val(),
				value = $('#proposalValue_' + chunk_id).val();
			
			addressArray.push(address);
			valueArray.push(value);
			
			var util = BytesUTIL.at('0xae9ab0dfb18226af8b6f5c2b37d9e017edfa865d');
			
			for(var d = 0; d < dataSize; d++){
				var dataValue = $('#proposalData_' + d + '_' + chunk_id).val(),
					dataType = kindObject.data[d].type;
				
				if(dataType == "uint")
					dataValue = util.numToBytes(dataValue);
				
				if(dataType == "address")
					dataValue = util.addressToBytes(dataValue);
				
				dataArray.push(dataValue); // convert to bytes32!!!!
			}
		}
		
		/*
		(address _board, string _name, uint _kind,
				bytes32[] _data, uint[] _value, address[] _addr, 
				bytes _transactionBytecode)*/
		
		objects.defaultComponents.Proposals.table.sendTransaction(boardroomInstance.address, name, kind, 
																  dataArray, valueArray, addressArray, 
																  transactionBytecode, txObject, function(err, result){
			if(err)
                return TemplateVar.set(template, 'state', {isError: true, error: String(err)});
			
            TemplateVar.set(template, 'state', {isMining: true});
		});
		objects.defaultComponents.Proposals.Tabled({_board: boardroomInstance.address}, function(err, result){
			if(err)
                return TemplateVar.set(template, 'state', {isError: true, error: String(err)});
            
            TemplateVar.set(template, 'state', {isMined: true});
		});
		
		
        /*var kind = parseInt($('#proposalKind').val()),
            name = String($('#proposalName').val()),
            address = $('#proposalAddress').val(),
            data = $('#proposalData').val(),
            value = parseInt($('#proposalValue').val()),
            expiry = new Date($('#proposalExpiry').val())
                    .getTime() / 1000;
        
        if($('#proposalData').hasClass("set-due-date"))
            value = new Date($('#proposalValue').val())
                    .getTime() / 1000;
        
        if($('#proposalValue').hasClass("set-due-date"))
            value = new Date($('#proposalValue').val())
                    .getTime() / 1000;
        
        console.log(value);
        
        if(_.isNaN(value))
            value = 0;
        
        if(_.isUndefined(name))
            name = '';
        
        if(_.isUndefined(data))
            data = '';
        
        if(_.isUndefined(address))
            address = '';
        
        var obj = {
                kind: kind, 
                name: name, 
                data: data, 
                value: value, 
                expiry: expiry
            },
            requiredKey = false,
            invalidKey = false;
        
        _.each(_.keys(obj), function(key, keyIndex){
            if(String(obj[key]).length > 32)
                invalidKey = key;
        });
            
        if(invalidKey)
            return TemplateVar.set(template, 'state', {
                isError: true, 
                error: "The proposal '" 
                        + invalidKey 
                        + "' was too long and must be below 32 characters, and is currently " 
                        + String(obj[invalidKey]).length 
                        + " characters long"
            });*/
        
        /*var member = Members.findOne({
            boardroom: boardroomInstance.address, 
            addr: web3.eth.defaultAccount
        });
        
        TemplateVar.set(template, 'state', {isMining: true});
        
        if(_.isUndefined(member))
            return TemplateVar.set(template, 'state', {
                isError: true, 
                error: 'Invalid member attempting to table proposal'
            });
        
        var watcher = boardroomInstance.onProposal({_kind: kind, _from: member.id}, function(err, result){
            if(err) {
                TemplateVar.set(template, 'state', {
                    isError: true, 
                    error: String(err)
                });
                watcher.stopWatching();
            }
            
            if(!err)
                TemplateVar.set(template, 'state', {
                    isMined: true
                });
        });
        
        boardroomInstance.table.sendTransaction(name, data, kind
    , address, value, expiry, {gas: 300000, 
                gasPrice: LocalStore.get('gasPrice'), from:  web3.eth.defaultAccount}, function(err, result){
            if(err) {
                TemplateVar.set(template, 'state', {
                    isError: true, 
                    error: String(err)
                });
                watcher.stopWatching();
            }
        });*/
              
    },
});