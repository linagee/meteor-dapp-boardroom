var ipfs_hash = '';

Template['views_persona'].created = function(){
	Meta.setSuffix(TAPi18n.__("dapp.persoa.title"));
};

Template['views_persona'].rendered = function(){
	TemplateVar.set('state', {isUndeployed: true});
	TemplateVar.set('personaRegistryState', {isUndeployed: true});
	TemplateVar.set('personaLookup', {});
};

Template['views_persona'].helpers({
	personaAddress: function(){
		return LocalStore.get('personaAddress');	
	},
	selectedAddress: function(){
		return web3.eth.defaultAccount;	
	},
});

Template['views_persona'].events({
	'click .btn-deploy': function(event, template){
		TemplateVar.set(template, 'state', {isDeploying: true});
		
		var name = $('#persona-name').val(),
			imageContentURL = $('#persona-image-content-url').val();
		
		var personaInfo = 
			{
			'personSchema' :
				{
				'name': name,
				'image': {'@type': 'ImageObject',
						 'name': 'avatar',
						 'contentUrl' : imageContentURL}
				}
			};
		
		ipfs.addJson(personaInfo, function(err, result){
			if(err)
				return TemplateVar.set(template, 'state', {isError: true, error: String(err)});
			
			if(result)
				TemplateVar.set(template, 'state', {isSuccess: true, ipfsHash: result});
			
			ipfs_hash = result;
		});
	},
	'click .btn-lookup-persona': function(event, template){
		var address = $('#persona-address').val();
			
		objects.defaultComponents.PersonaRegistry.getPersonaAttributes(address, function(err, result){
			if(err)
				return TemplateVar.set(template, 'personaLookup', {isError: true, error: String(err)});
			
			console.log(result);
		});
	},
	'click .btn-register-persona': function(event, template){
		TemplateVar.set(template, 'personaRegistryState', {isDeploying: true});
		
		var ipfs_hash_base58 = '0x' + ipfs.utils.base58ToHex(ipfs_hash);
		
		objects.defaultComponents.PersonaRegistry.setPersonaAttributes(ipfs_hash_base58, {gas: 3000000, from: web3.eth.defaultAccount}, function(err, result){
			if(err)
				return TemplateVar.set(template, 'personaRegistryState', {isError: true, error: String(err)});
			
			if(result)
				TemplateVar.set(template, 'personaRegistryState', {isSuccess: true, transactionHash: result});
		});
	},
});