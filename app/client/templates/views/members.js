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
	
	/*boardroomInstance.addressOfArticle(objects.defaultArticles.Membership, function(err, result){
		console.log('memberhsip', err, result);
	});
	
	VotingSystem.new({data: VotingSystem.bytecode, gas: 3000000, from:  web3.eth.defaultAccount}, function(err, result){
		console.log('voting', err, result);
	});*/
	
	/*var voting = VotingSystem.at('0xe188d75cbcc0f73ede25b726526485bbd3cb28c8').canTable(boardroomInstance.address, 0, web3.eth.defaultAccount, function(err, result){
		console.log('can table', err, result);	
	});
	
	DelegationSystem.new({data: DelegationSystem.bytecode, gas: 3000000, from:  web3.eth.defaultAccount}, function(err, result){
		console.log('delegation', err, result);
	});*/
	
	/*MembershipRegistry.new({data: MembershipRegistry.bytecode, gas: 3000000, from:  web3.eth.defaultAccount}, function(err, result){
		console.log('mem reg', err, result);
	});*/
	
	/*ProposalSystem.new({data: ProposalSystem.bytecode, gas: 3000000, from:  web3.eth.defaultAccount}, function(err, result){
		console.log('proposals', err, result);
	});*/
	
	/*HashRegistry.new({data: HashRegistry.bytecode, gas: 3000000, from:  web3.eth.defaultAccount}, function(err, result){
		console.log('hash', err, result);
	});
	
	objects.defaultComponents.Proposals.tabledBy(boardroomInstance.address, 2, function(err, result){
		console.log('tabled by', err, result);
	});*/
	
	/*ProposalSystem.new({data: ProposalSystem.bytecode, gas: 3000000, from:  web3.eth.defaultAccount}, function(err, result){
		console.log('proposals', err, result);
	});
	
	VotingSystem.new({data: VotingSystem.bytecode, gas: 3000000, from:  web3.eth.defaultAccount}, function(err, result){
		console.log('voting', err, result);
		
		if(!result.address) {
			web3.eth.getTransactionReceipt(result.transactionHash, function(err, txResult){
				console.log(err, {name: 'membership', contract: result, receipt: txResult});
			});
		}
		
		if(result.address){
			VotingSystem.at(result.address).hasWon(boardroomInstance.address, 0, function(err, hasWon){ //'0x9a8bcfee7681f7328d3d39da8d41fe541ec595d0'
				console.log(err, hasWon);
			});
		}
	});
	
	VotingSystem.at('0x9a8bcfee7681f7328d3d39da8d41fe541ec595d0').hasWon(boardroomInstance.address, 0, function(err, hasWon){ //'0x9a8bcfee7681f7328d3d39da8d41fe541ec595d0'
		console.log(err, hasWon);
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