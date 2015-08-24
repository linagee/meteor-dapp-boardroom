Template['layout_boardroom'].rendered = function(){
    $('.scrollbar-macosx').scrollbar();
    
    // Avalanche proposal nav collapse
    avalanche = new Avalanche({
        onShow: function(){
            $('.container-boardroom')
                .removeClass('container-boardroom-min')
                .addClass('container-boardroom-max');
            $('.navbar-global')
                .removeClass('navbar-boardroom-max')
                .addClass('navbar-boardroom');
        },
        onHide: function(){
            $('.container-boardroom')
                .removeClass('container-boardroom-max')
                .addClass('container-boardroom-min');
            $('.navbar-global')
                .removeClass('navbar-boardroom')
                .addClass('navbar-boardroom-max');
        }
    });
};