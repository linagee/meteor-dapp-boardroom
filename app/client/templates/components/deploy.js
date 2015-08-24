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
        
        try {
            console.log(web3.eth.defaultAccount);
            BoardRoom.new({from: web3.eth.defaultAccount}, function(err, result, mined){
                if(err) {
                    TemplateVar.set(template, 'state', {isError: true, error: String(err)});
                    return;
                }

                if(mined) {
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
