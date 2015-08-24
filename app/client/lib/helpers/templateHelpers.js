/**
Helper functions

@module Helpers
**/

/**
Global template helpers

@class TemplateHelpers
@constructor
**/

/**
A simple template helper to log objects in the console.

@method (debug)
**/

Template.registerHelper('debug', function(object){
    console.log(object);
});


/**
Formats a timestamp to any format given.

    {{formatTime myTime "YYYY-MM-DD"}}

@method (formatTime)
@param {String} time         The timstamp, can be string or unix format
@param {String} format       the format string, can also be "iso", to format to ISO string, or "fromnow"
//@param {Boolean} realTime    Whether or not this helper should re-run every 10s
@return {String} The formated time
**/

Template.registerHelper('formatTime', Helpers.formatTime);


/**
Formats a number.

    {{formatNumber myNumber "0,0.0[0000]"}}

@method (formatNumber)
@param {String} number
@param {String} format       the format string
@return {String} The formatted number
**/

Template.registerHelper('formatNumber', function(number, format){
    if(format instanceof Spacebars.kw)
        format = null;

    if(number instanceof BigNumber)
        number = number.toNumber();

    format = format || '0,0.0[0000]';


    if(!_.isFinite(number))
        number = numeral().unformat(number);

    if(_.isFinite(number))
        return numeral(number).format(format);
});


/**
Formats a number (the Ether amount in Wei) to a formatted number.

    {{fromWei 1900000000000000000 "ether"}} // formats wei to ether

@method (fromWei)
@param {String|Number} weiAmount           The amount in wei
@param {String} format                     The wei format
@return {String} The formatted wei value in format type (e.g. 'ether')
**/

Template.registerHelper('fromWei', function(weiAmount, format){
    if(_.isUndefined(format))
        format = 'ether';
    
    if(_.isUndefined(weiAmount))
        weiAmount = 0;
    
    return web3.fromWei(weiAmount, format);
});


/**
Capitolize all words in string.

    {{capitolizeAll 'a new set'}} // returns 'A New Set'

@method (capitolizeAll)
@param {String} string     The string to format
@return {String} The formatted string
**/

Template.registerHelper('capitolizeAll', function(string){
    return String(string).ucFirstAllWords();
});


/**
A member function. Get member data.

    {{#with toMember 3}} 
        {{address}} 
    {{/with}}

@method (toMember)
@param {Number} id     The ID of the BoardRoom
@param {Object} boardroom     The BoardRoom object
@return {Object} The member mongo collection entry.
**/

Template.registerHelper('toMember', function(id, boardroom){
    return Members.findOne({id: id, 
                            boardroom: boardroom.address});
});


/**
Capitolize first word in string.

    {{capitolize 'a new set'}} // returns 'A new set'

@method (capitolize)
@param {String} string     The string to format
@return {String} The formatted string
**/

Template.registerHelper('capitolize', function(string){
    return String(string).capitalizeFirstLetter();
});


/**
Provide template access to the JSON object.

    {{JSON.stringify {...}}} // returns 

@method (JSON)
**/

Template.registerHelper('stringify', function(value, options){
    return JSON.stringify(value, null, 2);
});


/**
Capitolize first word in string.

    {{capitolize 'a new set'}} // returns 'A new set'

@method (capitolize)
@param {String} string     The string to format
@return {String} The formatted string
**/

Template.registerHelper('format', function(){
    var args = Array.prototype.slice.call(arguments);
    
    if(args.length == 0)
        return '';
    
    if(args.length == 1)
        return args[0];
    
    var applyArgs = args.splice(1);
    applyArgs.pop();
    
    if(applyArgs.length >= 1)
        return args[0].format.apply(args[0], applyArgs);
    
    return '';
});


/**
Add HTTP prefix to a url, if it does not exist already.

    {{addhttp "youtube.com"}} // returns "http://youtube.com"

@method (addhttp)
@param {String} url         The raw URL.
@return {String} The formatted url, prefixed with http
**/

Template.registerHelper('addhttp', Helpers.addhttp);


/**
Clean prefix to a url, if it does not exist already.

    {{cleanURL "http://youtube.com"}} //returns "youtube.com"

@method (cleanURL)
@param {String} url         The raw URL.
@return {String} The formatted url, with the prefixed http(s) removed
**/

Template.registerHelper('cleanURL', Helpers.cleanURL);


/**
This will decompress a URL into it's original form

    {{decompressURL "yt jfiusj"}} //returns "http://youtube.com/v/jfiusj"

@method (decompressURL)
@param {String} url         The raw URL.
@return {String} The decompressed url
**/

Template.registerHelper('decompressURL', Helpers.decompressURL);


/**
Use Mongo.find to get Mongo DB data entries.

    {{Mongo.find 'Campaigns' '{}'}} // returns all campaigns.

@method (find)
@param {String} name         The collection object name
@param {String} queryOptions  The collection find options (a JSON ready string)
@param {String} projectionOptions  The collection projection options (a JSON ready string)
@return {Array} An array of collection data
**/

Template.registerHelper('toMember', function(memberId, boardroomAddress){
    return Members.findOne({id: memberId, boardroom: boardroomAddress});
});

/**
Get a boardroom proposal kind.

    {{toKind 3}} // returns {...}

@method (toKind)
@param {Number} kindId         Kind id.
@return {Object} The kind objec 
**/

Template.registerHelper('toKind', function(kindId){    
    return BoardRoom.proposalKinds[kindId];
});

/**
Use Mongo.find to get Mongo DB data entries.

    {{Mongo.find 'Campaigns' '{}'}} // returns all campaigns.

@method (find)
@param {String} name         The collection object name
@param {String} queryOptions  The collection find options (a JSON ready string)
@param {String} projectionOptions  The collection projection options (a JSON ready string)
@return {Array} An array of collection data
**/

Template.registerHelper('find', function(name, queryOptions, projectionOptions){
    if(_.isUndefined(name))
        return [];
    
    if(_.isUndefined(queryOptions) 
       || queryOptions instanceof Spacebars.kw)
        queryOptions = {};
    
    if(_.isObject(queryOptions))
        queryOptions = JSON.stringify(queryOptions);
    
    if(_.isString(queryOptions) && queryOptions != '')
        queryOptions = JSON.parse(queryOptions);
    
    if(_.isUndefined(projectionOptions) 
      || projectionOptions instanceof Spacebars.kw)
        projectionOptions = false;
    
    if(_.isObject(projectionOptions))
        queryOptions = JSON.stringify(projectionOptions);
    
    if(_.isString(projectionOptions) && projectionOptions != '')
        projectionOptions = JSON.parse(projectionOptions);
    
    if(queryOptions == false || queryOptions == '')
        queryOptions = {};
    
    if(!_.has(window, name))
        return [];
    
    if(_.isObject(projectionOptions))
        return window[name].find(queryOptions, projectionOptions);
    else
        return window[name].find(queryOptions);   
});


/**
Get any method or property from the BoardRoom object.

    {{BoardRoom.abi}}

@method (BoardRoom)
@return {Object} The BoardRoom object.
**/

Template.registerHelper('BoardRoom', function(){ return BoardRoom; });


/**
Get any method or property from the BoardRoom object.

    {{#with br 'proposalKinds'}} {{address}} {{name}} {{/with}}

@method (boardroom)
@return {Object} The boardroom object.
**/

Template.registerHelper('br', function(){
    var args = Array.prototype.slice.call(arguments);
    var tempStore = BoardRoom;
    
    _.each(args, function(item, itemIndex){
        if(_.isString(item))
            tempStore = tempStore[item];
    });
    
    return tempStore;
});


/**
Get the balance of a specific address. It uses the Session and variable 'balances'.

    {{getBalance '0x0'}} // returns 000000000393000000

@method (getBalance)
@param {String} address    The address to get the balance of
@return {Number} the balance
**/

Template.registerHelper('getBalance', function(address){
    var balance = Balances.findOne({address: address});
    
    if(_.isUndefined(balance)
       || !_.isObject(balance))
        balance = {address: address, balance: 0};
    
    return balance;
});


/**
The accounts get function.

    {{#with accounts '0x0'}} {{address}} {{name}} {{/with}}

@method (accounts)
@param {String} address
@param {String} password
@return {Object} Return either an array or account object.
**/

Template.registerHelper('accounts', function(address, password){
    if(address == 'selected')
        return accounts.get(address, password);
    
    var listAccounts = accounts.get(address, password);
    delete listAccounts['selected'];
    return _.values(listAccounts);
});