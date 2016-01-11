Template['views_equity'].created = function(){
	Meta.setSuffix(TAPi18n.__("dapp.members.title"));
};

var token;

Template['views_equity'].rendered = function(){
	var template = this;
	
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
});