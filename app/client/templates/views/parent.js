Template['views_parent'].rendered = function(){
    var template = this;
	Meta.setSuffix(TAPi18n.__("dapp.parent.title"));
	
	boardroomInstance.addressOfArticle(objects.defaultArticles.Executive, function(err, result){
		if(err || result.address == web3.address(0))
            return;
		
		Boards.update({address: boardroomInstance.address}, {$set: {executive: result}});
	});
    
    /*boardroomInstance.parent.call(function(err, result){
        result = BoardRoom.Contract.at(result);
        
        if(err || result.address == web3.address(0))
            return;
        
        TemplateVar.set(template, 'parent', {address: result.address});
        Boards.update({address: boardroomInstance.address}, {$set: {parent: result.address}});
    });*/
};

Template['views_parent'].helpers({
	'board': function(){
		return Boards.findOne({address: boardroomInstance.address});
	},
});