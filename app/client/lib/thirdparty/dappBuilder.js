window.dappBuilder = dappBuilder = function(options){  
};

var formatParams = function(params){
    _.each(params, function(param, paramIndex){
        param.index = paramIndex;
        param.isText = false;
        param.isNumber = false;
        
        param.isUint = false;
        param.isString = false;
        param.isAddress = false;
        param.isHash = false;
        param.isBytes = false;
        
        if(_.contains(["bytes", "string", "address", "hash", "bytes32"], param.type))
            param.isText = true;
        
        if(_.contains(["uint", "uint256", "real", "float"], param.type))
            param.isNumber = true;
        
        if(param.type == "string")
            param.isString = true;
        
        if(param.type == "address")
            param.isAddress = "address";
        
        if(param.type == "uint")
            param.isUint = true;
    
        if(param.type == "hash")
            param.isHash = true;
        
        if(param.type == "bytes"
           || param.type == "bytes32")
            param.isBytes = true;
    });
};

var prepABI = function(abi){
    _.each(abi, function(obj, objIndex){
        obj.nameClean = '';
        obj.nameFormatted = '';
        obj.isCallable = false;
        obj.isTransactable = false;
        obj.hasEvents = false;
        obj.isMethod = false;
        obj.kind = '';
        obj.raw = '';
        obj.isVerified = false;
        obj.hasValue = false;
        obj.startPos = -1;
        obj.endPos = -1;
        obj.events = [];
        obj.notice = "";
        obj.dev = "";
        obj.inputs = formatParams(obj.inputs);
        obj.outputs = formatParams(obj.outputs);
        
        
    });
};