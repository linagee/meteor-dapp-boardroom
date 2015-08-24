Template['views_contract'].created = function(){
	Meta.setSuffix(TAPi18n.__("dapp.contract.title"));
    var template = this;
    TemplateVar.set('solidity', '');
    
    HTTP.get(Meteor.absoluteUrl("contracts/BoardRoom.sol"), 
             function(err, result){
        TemplateVar.set(template, 'solidity', result.content);
    });
};