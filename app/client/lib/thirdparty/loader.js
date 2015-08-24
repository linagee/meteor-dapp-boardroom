/**
The Loader object.
**/

/**
This object is largley a global container to manage the please wait loader.

@class [Object] Loader
@constructor
**/

Loader = function(options){
    if(_.isUndefined(options))
        options = {};
    
    this.defaultOptions = _.extend(this.defaultOptions, options);
};

Loader.prototype.defaultOptions = {
    injectElement: document.body,
};

Loader.prototype.wait = function(injectElement){   
    if(_.isUndefined(injectElement))
        injectElement = this.defaultOptions.injectElement;
    
    $(document.body).append("<div class='loader'><div class='spinner sk-spinner sk-spinner-rotating-plane'></div></div>");
};

Loader.prototype.finish = function(){
    window.setInterval(function(){
        $(".loader").fadeOut(400, function(){ 
           $(".loader").remove(); 
        });
    }, 1000);
};