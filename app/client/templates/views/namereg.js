/**
Template Controllers

@module Templates
*/

/**
The namereg module is for global name registration and management of Ethereum addresses.

@class [template] views_namereg
@constructor
*/

var namereg;

Template['views_namereg'].created = function(){
	Meta.setSuffix(TAPi18n.__("dapp.namereg.title"));
    
    namereg = new NameReg.at(LocalStore.get('nameregAddress'));
    
    var someContract = web3.eth.contract(NameReg.abi);
    var someInstance = someContract.at(LocalStore.get('nameregAddress'));
};

Template['views_namereg'].helpers({
    'nameregAddress': function(){
        return LocalStore.get('nameregAddress');
    },
});

Template['views_namereg'].events({
    /**
    Register your name.

    @event (click .btn-register)
    */

    'click .btn-register': function(event, template){
        var value = web3.clean($('#nameregValue').val()),
            account = accounts.get('selected').address;
        TemplateVar.set(template, 'state', {isMining: true, isRegistering: true});
        
        namereg.register(web3.fromAscii(value, 32), {from: account, gas: 506600}, function(err, result, mined){
            if(err)
                return TemplateVar.set(template, 'state', {isError: true, isRegistering: true, error: err});
            
            if(!mined)
                return;
            
            Names.upsert({address: account}, 
                         {address: account, name: value});
            TemplateVar.set(template, 'state', {isRegistering: true, isSuccess: true});
        });
    },
    
    
    /**
    Unregister your name.

    @event (click .btn-register)
    */

    'click .btn-unregister': function(event, template){
        var account = accounts.get('selected').address;
        TemplateVar.set(template, 'state', {isMining: true, isUnregistering: true});
        
        namereg.unregister({from: accounts.get('selected').address, gas: 606600}, function(err, result, mined){
            if(err) 
                return TemplateVar.set(template, 'state', {isError: true, isUnregistering: true, error: err});
            
            if(!mined)
                return;
            
            Names.upsert({address: account}, 
                         {address: account, name: ''});
            TemplateVar.set(template, 'state', {isUnregistering: true, isSuccess: true});
        });
    },
    
    
    /**
    Lookup a name.

    @event (click .btn-name-lookup)
    */

    'click .btn-lookup': function(event, template){
        var value = web3.clean($('#nameregValue').val()),
            account = accounts.get('selected').address;
        
        if(web3.isAddress(value)) {
            namereg.nameOf(value, function(err, result){
                if(err)
                    return;
                
                result = web3.clean(web3.toAscii(result));
                
                Names.upsert({address: value}, 
                             {address: account, name: result});
                TemplateVar.set(template, 'value', result);
            });
        }else{
            namereg.addressOf(web3.fromAscii(value, 32), function(err, result){
                if(err)
                    return;
                
                Names.upsert({name: value},
                             {address: result, name: value});
                TemplateVar.set(template, 'value', String(result));
            });
        }   
    },
    
    
    /**
    Deploy a NameReg contract.

    @event (click .btn-deploy)
    */

    'click .btn-deploy': function(event, template){
        TemplateVar.set(template, 'state', {isMining: true, isDeploying: true});
        
        NameReg.new({from: accounts.get('selected').address},
                    function(err, result){
            
            if(err)
                return TemplateVar.set(template, 'state', {isDeploying: true, isError: true, error: err});
            
            if(!result.address)
                return;
            
            namereg = result;
            LocalStore.set('nameregAddress', result.address);
            TemplateVar.set(template, 'state', {isSuccess: true, isDeploying: true, address: result.address});
            TemplateVar.set(template, 'value', result.address);
        });
    },
});