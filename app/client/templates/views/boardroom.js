Template['views_boardroom'].rendered = function(){
	Meta.setSuffix(TAPi18n.__("dapp.boardroom.title"));
	
    Meteor.setInterval(function(){
        var sum = function(a, b) { return a + b };     
		var board = Boards.findOne({address: boardroomInstance.address});
		
		if(_.isUndefined(board)
		  || !_.has(board, "numProposals")
		  || !_.has(board, "numExecuted"))
			return;
		
        var data = {
            series: [board.numExecuted, (board.numProposals - board.numExecuted)]
        };
        
        if(board.numProposals == 0)
            data = {
                series: [board.numProposals]
            };

        if(board.numProposals) {
            if($('#proposalsChart').length > 0) {
                new Chartist.Pie('#proposalsChart', data, {
                  donut: true,
                  showLabel: true,
                  labelInterpolationFnc: function(value) {
                    return Math.round(value / data.series.reduce(sum) * 100) + '%';
                  }
                });
            }
        }
    }, 300);
};

Template['views_boardroom'].events({
    'click .btn-faucet': function(event, template){
        /*Helpers.post('http://testnet.consensys.net/faucet', {
            address: String(boardroomInstance.address)
        });
        
        Dialog.alert('You have fauceted a 1000 ether to account' + boardroomInstance.address + '. This may take a few minutes to process.');
        
        web3.eth.getAccounts(function(err, result){
            if(err)
                Dialog.alert('There was an error getting ether, the error was: ' + String(err));
            
            web3.eth.sendTransaction({from: result[0], to: boardroomInstance.address, value: etherValue}, 
                                     function(err, result){
                if(err)
                    Dialog.alert('There was an error getting ether, the error was: ' + String(err));

                if(!err)
                    Dialog.alert('Transaction successfull, ' +
                                 String(etherValue) + 
                                 ' ether has been sent to address: ' +
                                 boardroomInstance.address);
            });
        });*/
    },
});

Template['views_boardroom'].helpers({
	'board': function(){		
		return Boards.findOne({address: boardroomInstance.address});	
	},
    'stats': {}, //Helpers.boardroomStats,
    'chairMember': function(){
        //console.log( Members.findOne({id: objects.boardroom.chair, boardroom: objects.boardroom.address}));
        
        //return Members.findOne({id: objects.boardroom.chair, boardroom: objects.boardroom.address});  
    },
});