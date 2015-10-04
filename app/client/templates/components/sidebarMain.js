var interval;

Template['components_sidebarMain'].onRendered(function(){
    console.log('ffsd');
    
    interval = Meteor.setInterval(function(){
        var selected = 'start',
            blocks = String(Router.current().url).split('/');
        
        console.log(blocks);

        if(!_.isArray(blocks))
            return;

        if(blocks.length <= 2)
            selected = String(blocks[1]).toLowerCase();

        if(blocks.length >= 3)
            selected = String(blocks[3]).toLowerCase();

        if(blocks[0] == '' && blocks.length >= 3)
            selected = String(blocks[3]).toLowerCase();

        if(selected == 'undefined')
            selected = 'start';

        $('.list-global-sidebar').children().removeClass('selected');

        if(!$('.list-global-' + selected).hasClass('selected'))
            $('.list-global-' + selected).addClass('selected');
    }, 100);
});

Template['components_sidebarMain'].onDestroyed(function(){
    Meteor.clearInterval(interval);
});