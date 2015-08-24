Template['views_parent'].rendered = function(){
    var template = this;
	Meta.setSuffix(TAPi18n.__("dapp.parent.title"));
    TemplateVar.set(template, 'parent', {address: ''});
    
    boardroomInstance.parent(function(err, result){
        if(err || result.address == web3.address(0))
            return;
        
        TemplateVar.set(template, 'parent', {address: result.address});
        Boards.update({address: boardroomInstance.address}, {$set: {parent: result.address}});
    });
};