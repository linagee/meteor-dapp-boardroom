/**
Template Controllers

@module Templates
*/

/**
The deploy component template. This will allow the user to deploy a boardroom.

@class [template] components_deploy
@constructor
*/

Template['components_deploy'].events({
    /**
    When 'Deploy BoardRoom' is clicked.

    @method (click .btn-deploy)
    */

    'click .btn-deploy': function(event, template){
        TemplateVar.set(template, 'state', {isMining: true});
		
		/*enum DefaultArticles {
				Proposals, 
				Processor, 
				Voting, 
				Membership, 
				Delegation, 
				Token, 
				Family, 
				Chair, 
				Executive}}*/
		
		console.log(objects);
		
		BoardRoom.new([objects.defaultComponents.Proposals.address, //'0x4e873bbb986f373a93c1ddc67d4378adbabad39b',
					  objects.defaultComponents.Processor.address, //'0xfbb865ecbfc55fd7947fa1465b97949a04de3bca',
					  objects.defaultComponents.Voting.address, //'0x2a983fbd9a303df72bf18931b3cd35a79e332e37',
					  objects.defaultComponents.Membership.address, //'0xf68eec949890f5b3bdd29de0a368adcf551afb21',
					  objects.defaultComponents.Delegation.address, //'0xb71676e3624d318000ad9e9cb0f49879db7404ca',
					  $('#token-address').val(),
					  objects.defaultComponents.Family.address, //'0x82eb7387d31a7e9e348c7d1f04651fef004e6f01',
					  $('#chair-address').val(),
					  $('#executive-address').val()],
					  _.extend({gas: 3000000, from:  web3.eth.defaultAccount}, {data: BoardRoom.bytecode}),
					  function(err, result){
			if(err)
				TemplateVar.set(template, 'state', {isError: true, error: err});
			
			if(result.address) {
				web3.eth.getTransactionReceipt(result.transactionHash, function(err, txResult){
					console.log('BoardRoom Instance', err, result.address);
					console.log(txResult.cumulativeGasUsed, txResult.gasUsed);
					
					TemplateVar.set(template, 'state', {isMined: true, address: result.address});
				});
			}
		});
    },
});

Template['components_deploy'].helpers({
	'defaultAccount': function(){
		return web3.eth.defaultAccount;
	},
});


Template['components_deploy'].rendered = function(){
    TemplateVar.set('state', {isUndeployed: true});
};
