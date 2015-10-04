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
        
        console.log(web3.eth.defaultAccount);
        
        try {
            BoardRoom.Contract.new({
                from: web3.eth.defaultAccount, 
                data: BoardRoom.code, 
                gasPrice: LocalStore.get('gasPrice'),
                gas: 3000000
            }, function(err, result){
                if(err)
                    return TemplateVar.set(template, 'state', {isError: true, error: String(err)});

                if(result.address) {
                    TemplateVar.set(template, 'state', {isMined: true, address: result.address});
                    Boards.import(result.address);
                }
            });
        }catch(err){
            TemplateVar.set(template, 'state', {isError: true, error: String(err)});
        }
    },
});

Template['components_deploy'].rendered = function(){
    TemplateVar.set('state', {isUndeployed: true});
};
