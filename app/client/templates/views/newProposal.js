Template['views_newProposal'].created = function(){
	Meta.setSuffix(TAPi18n.__("dapp.newProposal.title"));
    TemplateVar.set('state', {});
};

Template['views_newProposal'].rendered = function(){
    var _kind = objects.params._kind,
        template = this;
    TemplateVar.set(this, 'kind', 0);
    
    _.each(BoardRoom.proposalKinds, function(kind, kindIndex){
        if(kind.name == _kind)
            TemplateVar.set(template, 'kind', kind.id);
    });
};

Template['views_newProposal'].helpers({
    'update': function(){
        Meteor.setTimeout(function(){ //timeout hack.
            $('.datetimepicker').datetimepicker();
        }, 300);
    },
});

Template['views_newProposal'].events({
    'click .btn-data-compress': function(event, template){
        var data = $('#proposalData').val();
        data = Helpers.compressURL(data);
        $('#proposalData').val(data);
    },
    
    'click .btn-reset': function(event, template){
    },
    
    'change #proposalKind': function(event, template){
        var val = parseInt($('#proposalKind').val());
        $('.datetimepicker').datetimepicker();
        
        TemplateVar.set(template, 'kind', val);
    },
    
    'click .btn-table': function(event, template){
        var kind = parseInt($('#proposalKind').val()),
            name = String($('#proposalName').val()),
            address = $('#proposalAddress').val(),
            data = $('#proposalData').val(),
            value = parseInt($('#proposalValue').val()),
            expiry = new Date($('#proposalExpiry').val())
                    .getTime() / 1000;
        
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
            });
        
        var member = Members.findOne({
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
        
        boardroomInstance.table(name, data, kind
    , address, value, expiry, {gas: 300000, from:  web3.eth.defaultAccount}, function(err, result){
            if(err) {
                TemplateVar.set(template, 'state', {
                    isError: true, 
                    error: String(err)
                });
                watcher.stopWatching();
            }
        
            console.log('dsfsdf');
        });
              
    },
});