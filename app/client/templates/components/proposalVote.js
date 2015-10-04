var transactionObject;

Template['components_proposalVote'].rendered = function(){
    TemplateVar.set(this, 'state', {});

    Meteor.setInterval(function(){
        var sum = function(a, b) { return a + b };     
        var data = {
                series: [objects.proposal.numFor, objects.proposal.numAgainst, (objects.proposal.numMembers - objects.proposal.numVotes)]
            };
        
        if(objects.proposal.numMembers) {
            if ($("#proposalChart").length > 0){
                new Chartist.Pie('#proposalChart', data, {
                  labelInterpolationFnc: function(value) {
                    return Math.round(value / data.series.reduce(sum) * 100) 
                        + '%';
                  }
                });
            }
        }
    }, 300);
};

Template['components_proposalVote'].events({
    'click .btn-vote-for': function(event, template){
        TemplateVar.set(template, 'state', {isMining: true});
        
        boardroomInstance.vote.sendTransaction(objects.proposal.id, 1,
                                {from: web3.eth.defaultAccount,
                                gasPrice: LocalStore.get('gasPrice'),
                                gas: 3040000}, 
                                function(err, result){
            if(err)
                TemplateVar.set(template, 'state', {isError: true, error: String(err)});
        });
    },
    
    'click .btn-vote-against': function(event, template){
        TemplateVar.set(template, 'state', {isMining: true});
        
        boardroomInstance.vote.sendTransaction(objects.proposal.id, 0,
                                {from: web3.eth.defaultAccount,
                                gasPrice: LocalStore.get('gasPrice'),
                                gas: 3040000}, 
                               function(err, result){
            if(err)
                TemplateVar.set(template, 'state', {isError: true, error: String(err)});
        });
    },
    
    'click .btn-delegate': function(event, template){
        TemplateVar.set(template, 'state', {isMining: true});
        
        boardroomInstance.delegate.sendTransaction(0, objects.proposal.id,
                                    {from: web3.eth.defaultAccount,
                                    gasPrice: LocalStore.get('gasPrice'),
                                    gas: 3040000}, 
                               function(err, result){
            if(err)
                TemplateVar.set(template, 'state', {isError: true, error: String(err)});
        });
    },
    
    'click .btn-execute': function(event, template){
        TemplateVar.set(template, 'state', {isMining: true});
        
        boardroomInstance.execute.sendTransaction(objects.proposal.id,
                                    {from: web3.eth.defaultAccount,
                                    gasPrice: LocalStore.get('gasPrice'),
                                    gas: 3000000}, 
                               function(err, result){
            if(err)
                TemplateVar.set(template, 'state', {isError: true, error: String(err)});
        });
    },
});

Template['components_proposalVote'].helpers({
    'refresh': function(){
        TemplateVar.set('state', {});
        
        Proposals.import(boardroomInstance.address, objects.proposal.id);
        
        boardroomInstance.hasWon.call(objects.proposal.id, function(err, hasWon){
            if(err)
                console.log('err', err);
            
            Proposals.update(Proposals.findOne({
                boardroom: boardroomInstance.address, 
                id: objects.proposal.id
            })._id, {
                $set: {hasWon: hasWon}
            });
        });
    },
    
    'numAbstains': function(){
        return objects.proposal.numMembers - objects.proposal.numVotes;
    },
    
    'isExecutable': function(){
        var proposal = Proposals.findOne({
                boardroom: boardroomInstance.address, 
                id: objects.proposal.id
            });
        
        if(_.has(proposal, 'hasWon')
           && proposal.hasWon
           && !proposal.executed)
            return true;
        else
            return false;
    },
    
    'isVotable': function(){
        var proposal = Proposals.findOne({
                boardroom: boardroomInstance.address, 
                id: objects.proposal.id
            });
        
        if(!proposal.executed
          && (_.has(proposal, 'hasWon') && !proposal.hasWon) 
          && proposal.expiry > moment().unix())
            return true;
        else
            return false;
    },
    
    'update': function(){   
    },
});