MongoExtended = function(mongodb){
    /*var upsertMethod = mongodb.update;
    
    mongodb.upsert = function(){
        var args = Array.prototype.slice.call(arguments),
            findObject = args[0],
            foundInstance;
        
        if(args.length >= 1 && _.isObject(findObject))
            foundInstance = mongodb.findOne(findObject);
        
        if(!_.isUndefined(foundInstance)
          && _.has(foundInstance, "_id"))
            findObject = {_id: foundInstance._id};
        
        args[0] = findObject;
        
        return upsertMethod.apply(this, args);
    };*/
    
    /*var upsertMethod = mongodb.upsert;
    var updateMethod = mongodb.update;
    var findMethod = mongodb.find;
    var findOneMethod = mongodb.findOne;
    
    console.log('collection', mongodb);
    
    mongodb.upsert = function(){
        var args = Array.prototype.slice.call(arguments),
            findObject = args[0],
            foundInstance = null;
        
        if(args.length >= 1) {
            if(this.find(findObject).fetch().length){
                this.update(this.findOne(findObject)._id,
                              args[1]);
            }else{
                this.insert(args[1]);
            }
        }   
    };*/
};