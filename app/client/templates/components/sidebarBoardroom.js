var updateSidebar = function(blocks, template){
    var selected = 'home';
    
    if(!_.isArray(blocks))
        return;
    
    if(blocks.length >= 5)
        selected = String(blocks[5]).toLowerCase();
    
    if(blocks[0] == '' && blocks.length >= 4)
        selected = String(blocks[3]).toLowerCase();
    
    if(selected == 'undefined')
        selected = 'home';
    
    $('.list-boardroom-sidebar').children().removeClass('selected');
    $('.list-boardroom-global').children().removeClass('selected');
    
    if(!$('.list-boardroom-' + selected).hasClass('selected'))
        $('.list-boardroom-' + selected).addClass('selected');
};

Template['components_sidebarBoardroom'].rendered = function(){
    Meteor.setInterval(function(){
        updateSidebar(objects.url.blocks, this);
    }, 100);
};