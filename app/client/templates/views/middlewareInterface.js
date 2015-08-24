Template['views_middlewareInterface'].created = function(){
    var template = this;
    var url = Helpers.decompressURL(objects.middleware.url);
    TemplateVar.set('data', {});
    
    $.when(
        $.getScript("https://chriseth.github.io/browser-solidity/soljson.js"),
        $.Deferred(function( deferred ){
            $(deferred.resolve);
        })
    ).done(function(){
        HTTP.get(url.raw + "contract.sol", 
                 function(err, result){
            var getVar = TemplateVar.get(template, 'data');
        
            Module['onRuntimeInitialized'] = function() {
            };

            var contractName = 'Amendments';
            var compiler = Module.cwrap("compileJSON", "string", ["string", "number"]);
            
            getVar.compiled = JSON.parse(compiler(result.content, 1));
            
            console.log(getVar.compiled);
            
            getVar.abi = JSON.parse(getVar.compiled.contracts[contractName].interface);
            
            console.log(getVar.abi);
            
            TemplateVar.set(template, 'data', getVar);
        });
    });  
};