Template['views_middlewareAbout'].created = function(){
    var template = this;
    var url = Helpers.decompressURL(objects.middleware.url);
    TemplateVar.set('data', {});
    
    HTTP.get(url.raw + "README.md", 
             function(err, result){
        var getVar = TemplateVar.get(template, 'data');
        getVar.readme = result.content;
        TemplateVar.set(template, 'data', getVar);
    });
};