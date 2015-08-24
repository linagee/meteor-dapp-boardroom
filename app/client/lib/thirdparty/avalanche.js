var prepCSSNumber = function(number){
    if(_.isString(number))
        number = number.trim().replace(/px/g, '');
    
    if(!_.isString(number) && !_.isNumber(number))
        number = 0;
    
    return parseInt(number);
};

Avalanche = function(options){
    if(_.isUndefined(options))
        options = {};
    
    options = _.extend(this.defaultOptions, options);
    var manual = this.manual = false;
    var open = this.open = true;
    var collapseMax = prepCSSNumber(options.collapseMax);
    var navElement = $(options.navSelector);
    var contentElement = $(options.contentSelector);
    var This = this;

    $(document).ready(function(){   
        $(document).on('click', options.navSelector,
                       function(e){
            manual = true;
            
            if(open){
                options.onHide(navElement, contentElement,
                               options);
                This.onHide(navElement, contentElement,
                               options);
                open = false;

                if(options.useDefaultMethods)
                    contentElement[options.hideMethod]();
            }else{
                options.onShow(navElement, contentElement,
                               options);
                This.onShow(navElement, contentElement,
                               options);
                open = true;

                if(options.useDefaultMethods)
                    contentElement[options.showMethod]();
            }
        });
    });
    
    var interval = this.interval = window.setInterval(function(){
        var screenWidth = $(options.widthSelector).width();
        
        if(screenWidth <= collapseMax && !manual) {
            if(open) {
                options.onHide(navElement, contentElement,
                               options);
                This.onHide(navElement, contentElement,
                               options);
            }
            
            open = false;
            
            if(options.useDefaultMethods) {
                if(!$(options.contentSelector).length)
                    return;
                
                navElement[options.showMethod]();
                contentElement[options.hideMethod]();
            }
        }
        
        if(screenWidth > collapseMax) {
            if(!open) {
                options.onShow(navElement, contentElement,
                               options);
                This.onShow(navElement, contentElement,
                               options);   
            }
            
            open = true;
            manual = false;
            
            if(options.useDefaultMethods) {
                navElement[options.hideMethod]();
                contentElement[options.showMethod]();
            }
        }
        
    }, options.intervalMs);
};

Avalanche.prototype.onShow = function(navElement, contentElement, options){
};

Avalanche.prototype.onHide = function(navElement, contentElement, options){
};

Avalanche.prototype.defaultOptions = {
    collapseMax: '750px',
    intervalMs: 50,
    widthSelector: window,
    navSelector: '.avalanche-nav',
    contentSelector: '.avalanche-content',
    useDefaultMethods: true,
    showMethod: 'show',
    hideMethod: 'hide',
    onShow: function(navElement, contentElement, options){},
    onHide: function(navElement, contentElement, options){},
};

Avalanche.prototype.clear = function(){
    clearInterval(this.interval);
};