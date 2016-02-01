Template['views_equity'].created = function(){
	Meta.setSuffix(TAPi18n.__("dapp.members.title"));
};

var token;

Template['views_equity'].rendered = function(){
	var template = this;
	TemplateVar.set(template, 'token-state', {});
	
	boardroomInstance.addressOfArticle(objects.defaultArticles.Token, function(err, tokenAddress){
		token = Standard_Token.at(tokenAddress);
		TemplateVar.set(template, 'tokenAddress', tokenAddress);
		var registeredMembers = Members.find({boardroom: boardroomInstance.address}).fetch();

		token.totalSupply(function(err, result){
			TemplateVar.set(template, 'totalSupply', result.toNumber(10));
		});
		
		_.each(registeredMembers, function(item, index){
			token.balanceOf(item.address, function(err, result){
				if(!err)
					Members.update({boardroom: boardroomInstance.address, address: item.address}, {$set: {'tokenBalance': result.toNumber(10)}});
			});	
		});
	});
};

Template['views_equity'].helpers({
	'members': function(){
		return Members.find({boardroom: boardroomInstance.address});
	},
});

Template['views_equity'].events({
	'click #check-holdings': function(event, template){
		var account = $('#member-address').val();
		
		token.balanceOf(account, function(err, result){
			TemplateVar.set(template, 'balanceCheck', {balance: result.toNumber(10)});
		});
	},
	
	//token-address token-amount transfer-tokens 
	
	'click #transfer-tokens': function(event, template){
		var addr = $('#token-address').val(),
			amount = parseInt($('#token-amount').val());
		
		TemplateVar.set(template, 'token-state', {isMining: true});
		
		boardroomInstance.addressOfArticle(objects.defaultArticles.Token, function(err, tokenAddr){
			if(err)
				return TemplateVar.set(template, 'token-state', {isError: true, error: err});
			
			if(tokenAddr == '0x' || tokenAddr == '' || tokenAddr == web3.address(0))
				return TemplateVar.set(template, 'token-state', {isError: true, error: 'No token system address'});
			
			var token = Standard_Token.at(tokenAddr);
			
			console.log('TOken addr', tokenAddr, addr, amount);
			
			token.transfer(addr, amount, {from: web3.eth.defaultAccount, gas: 3000000}, function(err, _transactionHash){
				if(err)
					return TemplateVar.set(template, 'token-state', {isError: true, error: err});
				
				TemplateVar.set(template, 'token-state', {isMining: true, transactionHash: _transactionHash});
			});
			
			token.Transfer({_from: web3.eth.defaultAccount}, function(err, result){
				if(err)
					return TemplateVar.set(template, 'token-state', {isError: true, error: err});
				
				TemplateVar.set(template, 'token-state', {isMined: true, transactionHash: result.transactionHash});
			});
		});
	},
});