/**
Helper functions for the web3 module

@module web3
**/

/**
Is the object provided a Bignumber object.

@method (isBigNumber)
**/

web3.isBigNumber = function(value){
    if(_.isUndefined(value) || !_.isObject(value))
        return false;
    
    return (value instanceof BigNumber) ? true : false;
};


/**
Return a valid web3 address. If input param 'value' is zero, it will generate address '0x0000'.

@method (address)
@param {String|Number} value     The valud to transform into an address.
**/

web3.address = function(value){
    var nullAddress = '0x0000000000000000000000000000000000000000';
    
    if(value == 0 
       || parseInt(value) == 0)
        return nullAddress;
    
    if(value.substr(0, 2) == '0x')
        value = '0x' + value;
    
    if(value.length > 42 
       || value.length < 42)
        value = nullAddress;
    
    return value;
};

web3.clean = function(val){
    return val.replace(/\0/g, '');
};

var toAsciiMethod = web3.toAscii;

web3.toAscii = function(value){
    return web3.clean(toAsciiMethod(value));
};


/**
Build return object from array and ABI.

@method (returnObject)
@param {String} method     The name of the method in question
@param {Array} resultArray The result array values from the call
@param {Object} abi        The abi data
**/

web3.returnObject = function(method, resultArray, abi){
    var return_object = {},
        methodIndex = null;
    
    if(_.isUndefined(method)
       || _.isUndefined(resultArray)
       || _.isUndefined(abi))
        return return_object;
    
    _.each(abi, function(property, propertyIndex){
        if(property.name == method)
            methodIndex = propertyIndex;
    });
    
    if(methodIndex == null)
        return return_object;
    
    if(!_.isArray(resultArray))
        resultArray = [resultArray];
    
    _.each(abi[methodIndex].outputs, function(item, itemIndex){
        return_object[item.name] = resultArray[itemIndex];
        
        if(item.type == 'bytes32') {
            return_object[item.name + 'Bytes'] = return_object[item.name];
            return_object[item.name] = web3.toAscii(return_object[item.name]);
        }
        
        if(resultArray[itemIndex] instanceof BigNumber) {
            //return_object[item.name + 'BN'] = return_object[item.name];
            
            return_object[item.name] = return_object[item.name]
                .toNumber(10);
        }
    });
    
    return return_object;
}; 


/**
Get a methods options (i.e. transactionObject/callObject and callback).

@method (getMethodDetails)
@param {Array} args     The methods args.
@return {Object} An object that contains the transactionObject and callback.
**/

web3.getMethodDetails = function(args){
    var options = {
            transactionObject: {},
            transactionObjectIndex: -1,
            callback: function(err, result){},
            callbackIndex: -1,
        },
        length = args.length;
    
    _.each(args, function(arg, argIndex){
         if(_.isObject(arg)
            && !_.isArray(arg)
            && !(arg instanceof BigNumber)
            && !_.isString(arg)
            && !_.isNumber(arg)
            && !_.isFunction(arg)
            && argIndex > length - 3) { // last two args
            options.transactionObject = arg;
            options.transactionObjectIndex = argIndex;
         }
        
        if(_.isFunction(arg)
            && !(arg instanceof BigNumber)
            && !_.isString(arg)
            && !_.isNumber(arg)
            && argIndex > length - 3) {
            options.callback = arg;
            options.callbackIndex = argIndex;
        }
    });
    
    return options;
};


/**
Buidl a web3 contract method array, with a new transaction/call object and callback;

@method (buildMethodArray)
@param {Array} args     The methods args.
@return {Object} An object that contains the transactionObject and callback.
**/

web3.buildMethodArray = function(args, obj, callback){
    if(_.isUndefined(callback))
        callback = function(err, result){};
    
    if(_.isUndefined(obj))
        obj = {};
    
    var options = web3.getMethodDetails(args),
        length = args.length;
    
    if(length == 0)
        length = 2;
    
    if(options.transactionObjectIndex == -1)
        args[length - 2] = obj;
    
    if(options.transactionObjectIndex > -1)
        args[options.transactionObjectIndex] = _.extend(options.transactionObject, obj);
    
    if(options.callbackIndex == -1)
        args[length - 1] = callback;
    
    if(options.callbackIndex > -1)
        args[options.callbackIndex] = callback;
    
    return args;
};


/**
Build a web3 contract instance with some new custom methods. This will override the previous method, if any, and add the method properties from the contract instance, if any.

@method (buildInstance)
@param {Array} args     The methods args.
@return {Object} An object that contains the transactionObject and callback.
**/

web3.buildInstance = function(Instance, methods){
    _.each(_.keys(methods), function(key){
        var instanceMethod = Instance[key],
            newMethod = methods[key];
        
        if(_.isObject(Instance[key])) {
            _.each(_.keys(Instance[key]), function(mKey){
                newMethod[mKey] = Instance[key][mKey];
            });
        }
        
        Instance[key] = newMethod;
    });
    
    return Instance;
};

web3.eth.contractus = function(abi, code, options, methods){
    if(_.isUndefined(options))
        options = {transactionObject: {gas: 3000000}, callObject: {}};
    
    if(_.isUndefined(methods))
        methods = {};
    
    var return_object = {abi: abi, 
                         code: code, 
                         methods: methods, 
                         options: options};
    
    return_object.at = function(address){
        var Contract = web3.eth.contract(return_object.abi);    
        var Instance = web3.buildInstance(Contract.at(address), return_object.methods);
        Instance.Instance = Contract.at(address);

        return Instance;
    };

    return_object.new = function(){
        var args = Array.prototype.slice.call(arguments);
        var Contract = web3.eth.contract(return_object.abi);
        var options = web3.getMethodDetails(args);
        var transactionObject = _.extend(_.extend(return_object.options.transactionObject, options.transactionObject), {data: return_object.code});

        var callback = function(err, result){       
            options.callback(err, result, false);

            if(result.address)
                options.callback(err, return_object.at(result.address), true);
        },
            buildArgs = web3.buildMethodArray(args, transactionObject, callback);
        Contract.new.apply(Contract, buildArgs);
    };
    
    return return_object;
};