Template['views_calendar'].rendered = function(){
};

Template['views_calendar'].helpers({
    'proposals': function(){
        // Gather unexpired and event proposals, doubles are fine
        var proposals_by_expiry = Proposals.find({boardroom: boardroomInstance.address, expiry: {$gt: moment().unix()}}, {$sort: {expiry : -1}}).fetch(),
            proposals_by_event = Proposals.find({boardroom: boardroomInstance.address, kind: 18, expiry: {$gt: moment().unix()}}, {$sort: {value : 1}}).fetch();
        
        // process all unexpired proposals, add datetime
        _.each(proposals_by_expiry, function(proposal, proposalIndex){
            proposals_by_expiry[proposalIndex].datetime = proposals_by_expiry[proposalIndex].expiry;
            proposals_by_expiry[proposalIndex].isExpiring = true;
        });
        
        // process all event proposals, add datetime
        _.each(proposals_by_event, function(proposal, proposalIndex){
            proposals_by_event[proposalIndex].datetime = proposals_by_event[proposalIndex].value;
            proposals_by_expiry[proposalIndex].isEvent = true;
        });
        
        var proposals_array = proposals_by_expiry.concat(proposals_by_event);
        
        proposals_array.sort(function(a, b) {
            return a.datetime - b.datetime;
        });
        
        return proposals_array;
    }, 
});