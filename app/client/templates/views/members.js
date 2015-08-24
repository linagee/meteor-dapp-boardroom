Template['views_members'].created = function(){
	Meta.setSuffix(TAPi18n.__("dapp.members.title"));
    
    boardroomInstance.numMembersActive(function(err, numMembers){
        if(err)
            return;
        
        numMembers = numMembers.toNumber(10);
        
        for(var mid = 0; mid < numMembers; mid++)
            Members.import(objects.boardroom.address, mid);
        
        Boards.update({address: boardroomInstance.address}, {$set: {numMembers: numMembers}});
    });
};