/**
Template Controllers

@module Templates
*/

/**
The deploy component template. This will allow the user to deploy a boardroom.

@class [template] components_deploy
@constructor
*/

Template['components_dialog'].events({
    /**
    When the dialog positive button is pressed. Generally ('Ok' or 'Confirm').

    @method (click .dialog-button-positive)
    */

    'click .dialog-button-positive': function(event, template){
        var values = [];
        var inputs = $('.dialog-inputs').children();
        
        _.each(inputs, function(item, itemIndex){
            values.push(item.value);
        });
        
        // fire the callback method with a true value and the input values
        this.callback(true, values);
        
        // Remove the template (when <button> fired with Blaze remove, fires eror. This is a hack around that)
        Meteor.defer(function(){Blaze.remove(template.view);});
    },
    
    
    /**
    When the dialog negative button is pressed. Generally ('Cancel' or 'Deny').

    @method (click .dialog-button-negative)
    */

    'click .dialog-wrapper': function(event, template){
        // Remove the template
        if($(event.target).is('.dialog-wrapper'))
            Blaze.remove(template.view);
    },
    
    
    /**
    When the dialog negative button is pressed. Generally ('Cancel' or 'Deny').

    @method (click .dialog-button-negative)
    */

    'click .dialog-button-negative': function(event, template){
        this.callback(false, []);
        
        // Remove the template
        Meteor.defer(function(){Blaze.remove(template.view);});
    },
});
