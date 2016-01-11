Template['components_sidebarProposals'].helpers({
    'board': function(){
		var board = Boards.findOne({address: boardroomInstance.address});
		
		board.numOpen = board.numProposals - board.numExecuted;
		
		return board;
	},
	'proposals': function(){
		return Proposals.find({boardroom: boardroomInstance.address}, {"sort" : [['created', 'desc']]});	
	},
});

var prevSelected = -1;
var updateSidebar = function(blocks, template){
    /*var selected = 'home';
    
    if(!_.isArray(blocks))
        return;
    
    if(blocks.length >= 5)
        selected = String(blocks[5]).toLowerCase();
    
    if(blocks[0] == '' && blocks.length >= 4)
        selected = String(blocks[3]).toLowerCase();
    
    if(selected == 'undefined')
        selected = 'home';
    
    $('.list-proposals').children().removeClass('selected');
    $('.list-boardroom-global').children().removeClass('selected');
    
    if(!$('.list-boardroom-' + selected).hasClass('selected'))
        $('.list-boardroom-' + selected).addClass('selected');*/
	
	if(objects.params._proposal != prevSelected) {
		$('.list-proposals').children().removeClass('selected');

		if(!$('.list-proposals-' + objects.params._proposal).hasClass('selected'))
			$('.list-proposals-' + objects.params._proposal).addClass('selected');
		
		prevSelected = objects.params._proposal;
	}
};

Template['components_sidebarProposals'].rendered = function(){
    Meteor.setInterval(function(){
        updateSidebar();
    }, 100);
};