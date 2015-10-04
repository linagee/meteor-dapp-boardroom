var updateSidebar = function(blocks, template){
    var selected = 'start';
    
    if(!_.isArray(blocks))
        return;
    
    if(blocks.length >= 4)
        selected = String(blocks[3]).toLowerCase();
    
    if(blocks[0] == '' && blocks.length >= 3)
        selected = String(blocks[2]).toLowerCase();
    
    if(blocks.length >= 2)
        selected = String(blocks[1]).toLowerCase();
    
    if(selected == 'undefined')
        selected = 'start';
    
    $('.list-main-sidebar').children().removeClass('selected');
    
    if(!$('.list-global-' + selected).hasClass('selected'))
        $('.list-global-' + selected).addClass('selected');
};

Template['components_sidebarMain'].rendered = function(){
    Meteor.setInterval(function(){
        updateSidebar(String(Router.current().url).split('/'), this);
    }, 100);
};