Template['views_middlewareContract'].created = function(){
    var template = this;
    var url = Helpers.decompressURL(objects.middleware.url);
    TemplateVar.set('data', {});
    
    HTTP.get(url.raw + "contract.sol", 
             function(err, result){
        var getVar = TemplateVar.get(template, 'data');
        getVar.contract = result.content;
        TemplateVar.set(template, 'data', getVar);
    });
};