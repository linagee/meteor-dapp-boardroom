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
	TemplateVar.set('systemsDeployment', []);
    
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

function deploySystems(callback) {
	var txObject = {
		from: web3.eth.defaultAccount,
		gas: 3000000,
	};

	ProcessingSystem.new(_.extend(txObject, {data: ProcessingSystem.bytecode}), function(err, result){
		if(result.address) {
			web3.eth.getTransactionReceipt(result.transactionHash, function(err, txResult){
				callback(err, {name: 'processing', contract: result, receipt: txResult});
			});
		}					
	});

	NameReg.new(_.extend(txObject, {data: NameReg.bytecode}), function(err, result){
		if(result.address) {
			web3.eth.getTransactionReceipt(result.transactionHash, function(err, txResult){
				callback(err, {name: 'name registry', contract: result, receipt: txResult});
			});
		}
	});

	MembershipRegistry.new(_.extend(txObject, {data: MembershipRegistry.bytecode}), function(err, result){
		if(result.address) {
			web3.eth.getTransactionReceipt(result.transactionHash, function(err, txResult){
				callback(err, {name: 'membership registry', contract: result, receipt: txResult});
			});
		}
	});

	MembershipSystem.new(_.extend(txObject, {data: MembershipSystem.bytecode}), function(err, result){
		if(result.address) {
			web3.eth.getTransactionReceipt(result.transactionHash, function(err, txResult){
				callback(err, {name: 'membership', contract: result, receipt: txResult});
			});
		}
	});

	ProposalSystem.new(_.extend(txObject, {data: ProposalSystem.bytecode}), function(err, result){
		if(result.address) {
			web3.eth.getTransactionReceipt(result.transactionHash, function(err, txResult){
				callback(err, {name: 'proposals', contract: result, receipt: txResult});
			});
		}
	});

	DelegationSystem.new(_.extend(txObject, {data: DelegationSystem.bytecode}), function(err, result){
		if(result.address) {
			web3.eth.getTransactionReceipt(result.transactionHash, function(err, txResult){
				callback(err, {name: 'delegation', contract: result, receipt: txResult});
			});
		}
	});

	VotingSystem.new(_.extend(txObject, {data: VotingSystem.bytecode}), function(err, result){
		if(result.address) {
			web3.eth.getTransactionReceipt(result.transactionHash, function(err, txResult){
				callback(err, {name: 'voting', contract: result, receipt: txResult});
			});
		}
	});

	FamilySystem.new(_.extend(txObject, {data: FamilySystem.bytecode}), function(err, result){
		if(result.address) {
			web3.eth.getTransactionReceipt(result.transactionHash, function(err, txResult){
				callback(err, {name: 'family', contract: result, receipt: txResult});
			});
		}
	});

	BytesUTIL.new(_.extend(txObject, {data: BytesUTIL.bytecode}), function(err, result){
		if(result.address) {
			web3.eth.getTransactionReceipt(result.transactionHash, function(err, txResult){
				callback(err, {name: 'bytesutil', contract: result, receipt: txResult});
			});
		}
	});
}

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

    'click .btn-deploy-systems': function(event, template){		
		TemplateVar.set(template, 'systemsDeploymentMessage', 'Deploying your BoardRoom default constitutional components. This may take a minute or two...');
		
		deploySystems(function(err, result){
			var getVar = TemplateVar.get(template, 'systemsDeployment');
			
			getVar.push(result);
			
			TemplateVar.set(template, 'systemsDeployment', getVar);
		});
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