/**
Template Controllers

@module Templates
*/

/**
A NameReg toName async template for loading names from NameReg on the fly.

@class [template] components_deploy
@constructor
*/

Template['components_toName'].helpers({
    'load': function(){
		try {	
			var address = String(this),
				persona = Personas.findOne({address: address}),
				callback = function(err, IPFS_hash_bytecode){
					if(err)
						return;
					
					try {
						var ipfs_hash = ipfs.utils.hexToBase58(ethUTIL.stripHexPrefix(IPFS_hash_bytecode));
						
						ipfs.catJson(ipfs_hash, function(err, IPFS_object){
							if(err)
								return;

							var persona_object = _.extend({address: address}, IPFS_object);

							Personas.upsert({address: address}, persona_object);
						});
					}catch(e){}
				};
			

			if(_.isUndefined(persona))
				persona = {personSchema: {}};
			
			TemplateVar.set('name', persona.personSchema.name);
			objects.defaultComponents.PersonaRegistry.getPersonaAttributes.call(address, callback);
		}catch(e){}
    },
});