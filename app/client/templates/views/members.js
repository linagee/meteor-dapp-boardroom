Template['views_members'].created = function(){
	Meta.setSuffix(TAPi18n.__("dapp.members.title"));
    
    /*boardroomInstance.numMembersActive(function(err, numMembers){
        if(err)
            return;
        
        numMembers = numMembers.toNumber(10);
        
        for(var mid = 0; mid < numMembers; mid++)
            Members.import(objects.boardroom.address, mid);
        
        Boards.update({address: boardroomInstance.address}, {$set: {numMembers: numMembers}});
    });*/
	
	
	objects.defaultComponents.MembershipRegistry.totalMembers(boardroomInstance.address, function(err, totalMembers){
		for(var memberID = 0; memberID < totalMembers.toNumber(10); memberID++){
			objects.defaultComponents.MembershipRegistry.addressOf(boardroomInstance.address, memberID, function(err, memberAddress){
				if(memberAddress != web3.address(0))
					Members.upsert({boardroom: boardroomInstance.address, address: memberAddress}, {id: memberID, boardroom: boardroomInstance.address, address: memberAddress});
			});
		}
	});
};

Template['views_members'].helpers({
	'selectedAccount': function(){
		return web3.eth.defaultAccount;
	},
	'members': function(){
		return Members.find({boardroom: boardroomInstance.address});
	},
});

Template['views_members'].events({
    'click #register-member': function(event, template){
		objects.defaultComponents.MembershipRegistry.register(boardroomInstance.address, {gas: 3000000, from:  web3.eth.defaultAccount}, function(err, result){
			if(err)
				return TemplateVar.set(template, 'state', {isError: true, error: err});
		
			TemplateVar.set(template, 'state', {isMining: true, transactionHash: result});
		});
		
		objects.defaultComponents.MembershipRegistry.Registered({_board: boardroomInstance.address}, function(err, result){
			if(err)
				return TemplateVar.set(template, 'state', {isError: true, error: err});
		
			TemplateVar.set(template, 'state', {isMined: true, message: "Your account has been registered with this Board."});	
		});
	},
    'click #unregister-member': function(event, template){
		var account = $('#member-address').val();
		
		objects.defaultComponents.MembershipRegistry.deregister(boardroomInstance.address, account, {gas: 3000000, from:  web3.eth.defaultAccount}, function(err, result){
			if(err)
				return TemplateVar.set(template, 'state', {isError: true, error: err});

			TemplateVar.set(template, 'state', {isMining: true, transactionHash: result});	
		});
			objects.defaultComponents.MembershipRegistry.Unregistered({_board: boardroomInstance.address}, function(err, result){
			if(err)
				return TemplateVar.set(template, 'state', {isError: true, error: err});
		
			TemplateVar.set(template, 'state', {isMined: true, message: "The account specified has been unregistered as the account specified is no longer a member of the board."});	
		});
	},
	
    'click #check-member': function(event, template){
		var account = $('#member-address').val();
		
		objects.defaultComponents.Membership.isMember(boardroomInstance.address, account, function(err, result){
			if(err)
				return TemplateVar.set(template, 'state', {isError: true, error: err});
			
			if(result)
				TemplateVar.set(template, 'state', {isMember: true});	
			else
				TemplateVar.set(template, 'state', {isNotMember: true});	
				
		});
	},
});