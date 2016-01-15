Template['layout_proposals'].rendered = function(){
    $('.scrollbar-macosx').scrollbar();
    
    // Avalanche proposal nav collapse
    avalanche = new Avalanche({
        onShow: function(){
            $('.avalache-nav').removeClass('hidden');
            $('.container-proposals')
                .removeClass('container-proposals-min')
                .addClass('container-proposals-max');
            $('.navbar-global')
                .removeClass('navbar-proposals-max')
                .addClass('navbar-proposals');
        },
        onHide: function(){
            $('.avalache-nav').addClass('hidden');
            $('.container-proposals')
                .removeClass('container-proposals-max')
                .addClass('container-proposals-min');
            $('.navbar-global')
                .removeClass('navbar-proposals')
                .addClass('navbar-proposals-max');
        }
    });
};

Template['layout_proposals'].helpers({
    'update': function(){
		var board = Boards.findOne({address: boardroomInstance.address});
		
		if(!_.isUndefined(board)) {
			for(var proposalID = 0; proposalID < board.numProposals; proposalID++){
				BoardRoom.importProposal(boardroomInstance.address, proposalID);
			}
		}
    },
});