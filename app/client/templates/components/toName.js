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
        var address = String(this),
            account = Names.findOne({address: address}),
            namereg = NameReg.Contract.at(LocalStore.get("nameregAddress")),
            callback = function(err, result){
                if(err)
                    return;

                Names.upsert({address: address}, 
                             {address: address, 
                              name: String(web3.toAscii(result)).trim()});
            };

        if(_.isUndefined(account))
            account = {};

        TemplateVar.set('name', account.name);
        namereg.nameOf.call(address, callback);
    },
});