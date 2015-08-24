/**
Template Controllers

@module Templates
*/

/**
The settings template for managing node information, rpc provider and content seeding.

@class [template] views_settings
@constructor
*/

Template['views_settings'].rendered = function(){
    var template = this;
	Meta.setSuffix(TAPi18n.__("dapp.settings.title"));
    TemplateVar.set('httpProvider',
                    LocalStore.get('httpProvider'));
    TemplateVar.set('nodeInfo', {api: web3.version.api});
    
    web3.version.getClient(function(err, result){
        var info = TemplateVar.get(template, 'nodeInfo');
        info.client = JSON.stringify(result);
        TemplateVar.set(template, 'nodeInfo', info);
    });
    
    web3.version.getEthereum(function(err, result){
        var info = TemplateVar.get(template, 'nodeInfo');
        info.ethereum = JSON.stringify(result);
        TemplateVar.set(template, 'nodeInfo', info);
    });
    
    web3.version.getNetwork(function(err, result){
        var info = TemplateVar.get(template, 'nodeInfo');
        info.network = JSON.stringify(result);
        TemplateVar.set(template, 'nodeInfo', info);
    });
    
    web3.version.getWhisper(function(err, result){
        var info = TemplateVar.get(template, 'nodeInfo');
        info.whisper = JSON.stringify(result);
        TemplateVar.set(template, 'nodeInfo', info);
    });
};

Template['views_settings'].events({
    /**
    When clicked, update RPC provider.

    @event (click .btn-rpc-provider)
    */

    'click .btn-rpc-provider': function(event, template){
        var rpcProvider = $('.input-rpc-provider').val();
        LocalStore.set('httpProvider', rpcProvider);
        TemplateVar.set(template, 'httpProvider', rpcProvider);
        web3.setProvider(new web3.providers.HttpProvider(rpcProvider));
    },
    
    
    /**
    When clicked, this will upsert seed content.

    @event (click .btn-remove)
    */

    'click .btn-remove': function(event, template){
        Boards.remove({address: boardroomInstance.address});
    },
    
    
    /**
    When clicked, this will upsert seed content.

    @event (click .btn-seed-content)
    */

    'click .btn-seed-content': function(event, template){
        alert('Yes');
    },
    
    
    /**
    When clicked, clear all persistent data.

    @event (click .btn-clear)
    */

    'click .btn-clear': function(event, template){
        Children.remove({});
        Members.remove({});
        Boards.remove({});
        Proposals.remove({});
        Delegations.remove({});
        Middleware.remove({});
        Names.remove({});
        Messages.remove({});
    },
});