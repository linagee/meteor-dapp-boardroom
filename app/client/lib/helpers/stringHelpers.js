/**
Capitolize the first letter of a string.

    'some'.capitalizeFirstLetter() // should return "Some"

@method (capitalizeFirstLetter)
@param {String} string         The raw string to be capatilized.
@return {String} capitolized   The capitolized string.
**/

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};


/**
Capitolize the first letter of each word in a string.

    'some new words'.ucFirstAllWords() // should return "Some New Words"

@method (ucFirstAllWords)
@param {String} raw     The raw string unformatted
@return {String} ret    The formatted returned string
**/

String.prototype.ucFirstAllWords = function() {
    var pieces = this.split(" ");
    for ( var i = 0; i < pieces.length; i++ )
    {
        var j = pieces[i].charAt(0).toUpperCase();
        pieces[i] = j + pieces[i].substr(1);
    }
    return pieces.join(" ");
};


/**
Insert a space before capitol letters.

    'someNameCool'.spaceBeforeCapitols() // should return "some Name Cool"

@method (spaceBeforeCapitols)
@param {String} string       The raw string to be spaced out.
@return {String} formatted   The parsed string
**/

String.prototype.spaceBeforeCapitols = function() {
    return new this.constructor(this
    // insert a space before all caps
    .replace(/([A-Z])/g, ' $1')
    // uppercase the first character
    .replace(/^./, function(str){ return str.toUpperCase(); }));
};


/**
Format string, used for replacing '$1' with a value in a string.

    'something $1 something else $2'.format('is good', 'is not') // returns "something is good something else is not"

@method (format)
@return {String} The formatted string
**/

String.prototype.format = function (){
    var args = Array.prototype.slice.call(arguments), str = this;
    function replacer(a){
        var aa = parseInt(a.substr(1),10)-1;
        return args[aa];
    }
    return str.replace(/(\$\d+)/gm, replacer);
};