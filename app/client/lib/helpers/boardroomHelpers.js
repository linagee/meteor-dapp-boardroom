BoardRoom = {};

BoardRoom.info = function(boardroomInstance, callObject, callback){
    if(_.isFunction(callObject))
        callback = callObject;
    
    if(_.isUndefined(callback))
        callback = function(err, result){};
    
    if(_.isUndefined(callObject))
        callObject = {};
    
    var properties = ['numExecuted', 'numProposals', 'numMembers', 'parent', 'configAddr', 'numMembersActive', 'chair', 'numChildren', 'numChildrenActive', 'balance'],
        batch = web3.createBatch(),
        return_object = {address: boardroomInstance.address};
    
    _.each(properties, function(property, propertyIndex){
        batch.add(boardroomInstance[property](function(err, result){ //callObject
            if(web3.isBigNumber(result))
                result = result.toNumber(10);
                
            return_object[property] = result;
            
            if(propertyIndex == properties.length - 1)
                callback(err, return_object);
        }));
    });
    
    try {
        batch.execute();
    }catch(e){ 
        //console.log(e);   
    }
};

var BoardroomMinimongoImport = function(methodName, filter, args, mongodb){
    var boardroomAddress = args[0],
        indexFrom = args[1],
        indexTo = indexFrom + 1,
        callObject = {},
        callback = function(e, r){};

    _.each(args, function(arg, argIndex){
        if(argIndex > 1 && _.isNumber(arg))
            indexTo = arg;

        if(_.isFunction(arg))
            callback = arg;

        if(_.isObject(arg) 
           && !_.isFunction(arg) 
           && !_.isNumber(arg))
            callObject = arg;
    });
    
    if(indexTo < 0)
        indexTo = 0;
    
    if(_.isUndefined(filter))
        filter = function(id, result){ return true; };
    
    var batch = web3.createBatch(),
        abi = BoardRoom.abi,
        boardroomInstance = BoardRoom.Contract.at(boardroomAddress);
    
    var addToBatch = function(batchInstance, id){
        batchInstance.add(boardroomInstance[methodName](id, function(err, result){ 
            if(err)
                return;

            result = web3.returnObject(methodName, result, abi);
            var idObject = {id: id, boardroom: boardroomAddress};
            
            if(!filter(id, result))
                return;
            
            if(mongodb.find(idObject).fetch().length) {
                mongodb.update(mongodb.findOne(idObject)._id, {$set: _.extend(idObject, result), $setOnInsert: _.extend(idObject, result)}, {upsert: true});
            } else {
                mongodb.upsert(idObject, {$set: _.extend(idObject, result)});
            }
        }));
    };
    
    try{
        // add fromIndex item
        addToBatch(batch, indexFrom);

        // add other items to fromTo index
        for(var id = indexFrom; id < indexTo; id++) {
            addToBatch(batch, id);
        }
        
        batch.execute();
    }catch(e){
        //console.log(e);
    }
};

BoardRoom.ProposalsMinimongo = function(mongodb){
    mongodb.import = function(){
        var args = Array.prototype.slice.call(arguments),
            filter = function(id, proposal){
            if(proposal.kind == 0)
                return false;
            
            return true;
        };
        
        BoardroomMinimongoImport('proposals', filter, 
                                 args, mongodb);
    };
};

BoardRoom.ChildrenMinimongo = function(mongodb){
    mongodb.import = function(){
        var args = Array.prototype.slice.call(arguments),
            filter = function(id, child){
                
            console.log(id, child);
                
            if(child.addr == web3.address(0))
                return false;
            
            return true;
        };
        BoardroomMinimongoImport('children', filter, 
                                 args, mongodb);
    };
};

BoardRoom.MembersMinimongo = function(mongodb){
    mongodb.import = function(){
        var args = Array.prototype.slice.call(arguments);
        var filter = function(id, member){
            if(member.addr == web3.address(0))
                return false;
            
            return true;
        };
        BoardroomMinimongoImport('members', filter, 
                                 args, mongodb);
    };
};

BoardRoom.DelegationsMinimongo = function(mongodb){
    mongodb.import = function(){
        var args = Array.prototype.slice.call(arguments);
        BoardroomMinimongoImport('delegations', args, function(id, child){return true;}, mongodb);
    };
};

BoardRoom.BoardsMinimongo = function(mongodb){
    mongodb.import = function(){
        var args = Array.prototype.slice.call(arguments),
            address = args[0],
            callObject = {},
            callback = function(err, result){};
        
        BoardRoom.info(BoardRoom.Contract.at(address), callObject, function(err, result){
            if(err)
                return;
            
            if(result.numMembers == 0)
                return;            
            
            if(mongodb.find({address: result.address}).fetch().length) {
                mongodb.update(mongodb.findOne({address: result.address})._id, {$set: _.extend({address: result.address}, result)});
            } else {
                mongodb.upsert({address: result.address}, {$set: _.extend({address: result.address}, result)});
            }
                           
        });
    };
};