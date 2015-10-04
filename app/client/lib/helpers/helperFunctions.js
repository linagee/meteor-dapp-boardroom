/**
Helper functions

@module Helpers
**/

/**
The Helpers class containing helper functions

@class Helpers
@constructor
**/

Helpers = {};


/**
Reruns functions reactively, based on an interval. Use it like so:

    Helpers.rerun['10s'].tick();

@method (rerun)
**/

Helpers.rerun = {
    '10s': new ReactiveTimer(10)
};


/**
Clear localStorage

@method (getLocalStorageSize)
**/

Helpers.getLocalStorageSize = function(){

    var size = 0;
    if(localStorage) {
        _.each(Object.keys(localStorage), function(key){
            size += localStorage[key].length * 2 / 1024 / 1024;
        });
    }

    return size;
};


Helpers.post = function(path, params, method) {
    method = method || "post"; // Set method to post by default if not specified.

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("target", '_blank');
    form.setAttribute("action", path);

    for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
         }
    }

    document.body.appendChild(form);
    form.submit();
}



/**
Reactive wrapper for the moment package.

@method (moment)
@param {String} time    a date object passed to moment function.
@return {Object} the moment js package
**/

Helpers.moment = function(time){

    // react to language changes as well
    TAPi18n.getLanguage();

    if(_.isFinite(time) && moment.unix(time).isValid())
        return moment.unix(time);
    else
        return moment(time);

};

Helpers.boardroomStats = function(){
    var returnObj = {numProposals: 0, numExecuted: 0, numUnexectued: 0},
        proposals = Proposals.find({boardroom: boardroomInstance.address}).fetch();

    _.each(proposals, function(proposal, proposalIndex){
        returnObj.numProposals += 1;

        if(proposal.executed)
            returnObj.numExecuted += 1;
    });

    returnObj.numUnexecuted = returnObj.numProposals - returnObj.numExecuted;

    return returnObj;
};


/**
Formats a timestamp to any format given.

    Helpers.formatTime(myTime, "YYYY-MM-DD")

@method (formatTime)
@param {String} time         The timstamp, can be string or unix format
@param {String} format       the format string, can also be "iso", to format to ISO string, or "fromnow"
@return {String} The formated time
**/

Helpers.formatTime = function(time, format) { //parameters
    
    // make sure not existing values are not Spacebars.kw
    if(format instanceof Spacebars.kw)
        format = null;

    if(time) {

        if(_.isString(format) && !_.isEmpty(format)) {

            if(format.toLowerCase() === 'iso')
                time = Helpers.moment(time).toISOString();
            else if(format.toLowerCase() === 'fromnow') {
                // make reactive updating
                Helpers.rerun['10s'].tick();
                time = Helpers.moment(time).fromNow();
            } else
                time = Helpers.moment(time).format(format);
        }

        return time;

    } else
        return '';
};


/**
Add an http prefix to a url string.

    Helpers.addhttp('youtube.com'); // returns 'http://youtube.com'

@method (addhttp)
@param {String} url         Prefix with http if not already
@return {String} The formatted URL
**/

Helpers.addhttp = function(url){
   if (!/^(f|ht)tps?:\/\//i.test(String(url)))
      url = "http://" + String(url);
   
   return url;
};


/**
Clean up a url for display.

    Helpers.cleanURL('http://youtube.com'); returns 'youtube.com'

@method (cleanURL)
@param {String} url         The raw URL to be parsed
@return {String} The parsed URL
**/

Helpers.cleanURL = function(url){
    return String(url).replace("http://", "").replace("https://", "").replace("www.", "");
};


/**
Parse incoming data URL for PDF, WEB, Youtube or Vimeo are supported url types;

@method (compressURL)
@param {String} url          
@return {String} The compressed URL
**/

Helpers.compressURL = function(url) {
    var return_data = '';
    
    url = String(url).trim();
    
    if(url.indexOf('youtu') !== -1 || url.indexOf('vimeo') !== -1){
        url.match(/(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/);

        if (RegExp.$3.indexOf('youtu') > -1) {
            var type = 'yt';
        } else if (RegExp.$3.indexOf('vimeo') > -1) {
            var type = 'vm';
        }
        
        return_data = type + ' ' + RegExp.$6;
    }else if(url.indexOf('pdf') !== -1){
        return_data = 'pd ' + url.replace(".pdf", "").replace("http://", "");
        
        if(url.indexOf('https') !== -1)
            return_data = 'pds ' + url.replace("https://", "");
    }else{
        return_data = 'ur ' + url.replace("http://", "");
            
        if(url.indexOf('https') !== -1)
            return_data = 'urs ' + url.replace("https://", "");
    }
    
    return return_data;
};

    
/**
Parse pre-parsed URL data.

@method (decompressURL)
**/
    
Helpers.decompressURL = function(data) {
    var return_data = {raw: data, valid: false, type: "", url: "", src: ""};
    
    if(_.isUndefined(data) || !_.isString(data))
        return return_data;
    
    data = String(data).trim();
    var raw = data.split(" ");
    
    var rawType = false;
    var rawId = false;
    
    rawType = raw[0];
    rawId = raw[1];
    
    if(!_.isString(rawType) || !_.isString(rawId))
        return return_data;
    
    switch(rawType){
        case "yt":
            return_data.type = "youtube";
            return_data.https = true;
            return_data.isYoutube = true;
            return_data.url = "https://www.youtube.com/watch?v=" + rawId;
            return_data.src = "https://www.youtube.com/embed/" + rawId 
                + "?modestbranding=1&autohide=1&showinfo=0&controls=0";
        break;
    
        case "ipfs": 
            return_data.type = "ipfs";
            return_data.http = false;
            return_data.isGithub = true;
            return_data.url = "http://localhost:8000/" + rawId;
            return_data.src = "http://localhost:8000/" + rawId;
        break;
    
        case "gthb": 
            return_data.type = "gthb";
            return_data.http = false;
            return_data.isGithub = true;
            return_data.url = "http://github.com/" + rawId;
            return_data.src = "http://github.com/" + rawId;
            return_data.raw = "https://cdn.rawgit.com/" + rawId 
                + '/master/';
        break;
    
        case "vm": 
            return_data.type = "vimeo";
            return_data.https = true;
            return_data.isVimeo = true;
            return_data.url = "https://vimeo.com/" + rawId;
            return_data.src = "https://player.vimeo.com/video/" + rawId;
        break;
    
        case "pd": 
            return_data.type = "pdf";
            return_data.isPDF = true;
            return_data.https = false;
            return_data.url = "http://" + rawId + '.pdf';
            return_data.src = "http://crossorigin.me/http://" + rawId + '.pdf';
        break;
    
        case "pds": 
            return_data.type = "pdf";
            return_data.https = true;
            return_data.isPDF = true;
            return_data.url = "https://" + rawId + '.pdf';
            return_data.src = "http://crossorigin.me/https://" + rawId + '.pdf';
        break;
    
        case "ur": 
            return_data.type = "url";
            return_data.https = false;
            return_data.isURL = true;
            return_data.url = "http://" + rawId;
            return_data.src = "http://" + rawId;
        break;
    
        case "urs": 
            return_data.type = "url";
            return_data.https = true;
            return_data.isURL = true;
            return_data.url = "https://" + rawId;
            return_data.src = "https://" + rawId;
        break;
            
        default:
            return return_data;
    }
    
    return_data.valid = true;
    return return_data;
};


/**
Build a Chart.js chart with a specific dataset.

    Helpers.refreshPieChart("#chartEl", {...});

@method (refreshPieChart)
@param {Object} chartElement     The chart canvas element.
@param {Object} data       The chart data
**/

Helpers.refreshPieChart = function(chartElement, data){    
    var chartInterval = window.setInterval(function(){
        if(_.isString(chartElement))
            chartElement = $(chartElement);
        
        if(!chartElement.is('canvas'))
            return;

        chartElement.after('<canvas class="' 
                           + chartElement.prop('class') 
                           + '" id="' + chartElement.prop('id') 
                           + 1 + '" width="' 
                           + chartElement.prop('width') + '" height="' 
                           + chartElement.prop('height') + '"></canvas>');

        var old = chartElement;
        chartElement = $('#' + old.prop('id') + 1);
        old.remove();

        try {
            // Get the context of the canvas element we want to select
            var ctx = chartElement[0].getContext("2d"); //document.getElementById("mychart").getContext("2d");
            new Chart(ctx).Pie(data, {
                segmentShowStroke: false, 
                animateRotate: false
            });
        }catch(e){
            console.log(e);
        }
        
        if(chartElement.length > 0 || chartElement.is('canvas'))
            window.clearInterval(chartInterval);   
    }, 1000);
};


/**
A vote chart for a proposal. This method uses an interval to poll when the chart element is ready. It's a hack, but it works.

    Helpers.refreshVoteChart($("#chartEl"), {...});

@method (refreshVoteChart)
@param {Object} chartElement     The chart canvas element.
@param {Object} proposal       The proposal object from the MongoDB.
**/

Helpers.refreshVoteChart = function(chartElement, proposal){
    var data = [
        {
            value: proposal.numAgainst,
            color:"#d95e59",
            highlight: "#FF5A5E",
            label: "Votes Against"
        },
        {
            value: proposal.numFor,
            color: "#46BFBD",
            highlight: "#a4cb53",
            label: "Votes For"
        },
        {
            value: (proposal.numMembers - proposal.numVotes),
            color: "#FDB45C",
            highlight: "#FFC870",
            label: "Abstains"
        }
    ];
    
    this.refreshPieChart(chartElement, data);
};



/**
Clean up a variable, method or event name for using in handlebars.

    Helpers.formatName('_someName'); // should return "Some Name"

@method (formatName)
@param {String} cleanName     The clean version of a name.
@return {String} name   The clean version of the name.
**/

Helpers.formatName = function(rawName){
    return rawName.replaceAll('_', ' ').spaceBeforeCapitols().ucFirstAllWords().replaceAll('New ', 'Start a New ').replaceAll('Num ', 'Number of ');
};


Helpers.timeoutLoop = function(fn, reps, delay) {
  if (reps > 0)
    setTimeout(function() {
                 fn();
                 timeoutLoop(fn, reps-1, delay);
               }, delay);
}


/**
Get the content between the two brackets.

    Helpers.betweenBrackets(2, "function(sds){ cool{ fsds{} }; }");

@method (betweenBrackets)
@param {NumberOrString} start     Either the start position index or the start substr in the raw string
@param {String} raw     The raw string
@return {String} substr   The substring between the brackes
**/

Helpers.betweenBrackets = function(start, raw, type){
    if(_.isUndefined(raw))
        return;
    
    if(_.isString(start))
        start = raw.indexOf(start);
    
    if(_.isUndefined(start) || parseInt(start) < 0 || start >= raw.length)
        start = 0;
    
    if(_.isUndefined(type))
        type = 'curly';
    
    var brackets = '{}';
    
    if(type == 'square')
        brackets = '[]';
    
    if(type == 'round')
        brackets = '()';
    
    raw = raw.slice(start);
    raw.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm, '$1');
    
    var start = 0;
    var depth = 0;
    var end = 0;
    
    
    for(var i in raw){   
        if(raw[i] == brackets[0]){
            depth ++;
            if(!start)
                start = i;
        } else if(raw[i] == brackets[1]) {
            end = i;
            depth --;
        }  
        
        if(start > 0 && depth == 0)
            return raw.substring(start - 1, end);
        
        if (depth < 0) 
            return false;
    }
    
    if(depth > 0) 
        return false;
};


/**
Return a web3 solidity type as a nice type, like Number of String

    Helpers.formatSolType('uint256'); // should return "Number"

@method (formatSolType)
@param {String} raw     The raw strinng
@return {String} formatted   The formatted string
**/

Helpers.formatSolType = function(raw){
    return (raw.indexOf('int') !== -1) ? 'Number' : (raw.indexOf('bool') !== -1 ? 'Boolean' : 'String');
};


/**
A load PDF function for loading PDF's.

@method (loadPDF)
@param {Number} The page number of the pdf to load.
@param {String} The path to the PDF.
**/

Helpers.loadPDF = function(element, PAGE_NUMBER, PDF_PATH) {
    PDFJS.workerSrc = '/packages/pascoual_pdfjs/build/pdf.worker.js';

    //var PDF_PATH = 'http://crossorigin.me/http://boardroom.to/BoardRoom_WhitePaper.pdf';
    //var PAGE_NUMBER = 1;
    var PAGE_SCALE = 1;
    var SVG_NS = 'http://www.w3.org/2000/svg';

    function buildSVG(viewport, textContent) {
      // Building SVG with size of the viewport (for simplicity)
      var svg = document.createElementNS(SVG_NS, 'svg:svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', viewport.height + 'px');

      //$('#pdfContent').width(viewport.width + 'px');
      //$('#pdfContent').height(viewport.height + 'px');

      // items are transformed to have 1px font size
      svg.setAttribute('font-size', 1);

      // processing all items
      textContent.items.forEach(function (textItem) {
        // we have to take in account viewport transform, which incudes scale,
        // rotation and Y-axis flip, and not forgetting to flip text.
        var tx = PDFJS.Util.transform(
          PDFJS.Util.transform(viewport.transform, textItem.transform),
          [1, 0, 0, -1, 0, 0]);
        var style = textContent.styles[textItem.fontName];
        // adding text element
        var text = document.createElementNS(SVG_NS, 'svg:text');
        text.setAttribute('transform', 'matrix(' + tx.join(' ') + ')');
        text.setAttribute('font-family', style.fontFamily);
        text.textContent = textItem.str;
        svg.appendChild(text);
      });
      return svg;
    }

    function pageLoaded() {
      $('#pdfContent').append("<div class='pdf-loading'><div class='spinner sk-spinner sk-spinner-rotating-plane bg-danger'></div></div>");

        try{
            // Loading document and page text content
            PDFJS.getDocument({url: PDF_PATH}).then(function (pdfDocument) {
                pdfDocument.getPage(PAGE_NUMBER).then(function (page) {
                    var viewport = page.getViewport(PAGE_SCALE);
                    page.getTextContent().then(function (textContent) {
                    // building SVG and adding that to the DOM
                    var svg = buildSVG(viewport, textContent);
                        
                    if(document.getElementById('pdfContent') != null &&
                      !_.isUndefined(document.getElementById('pdfContent')))
                        document.getElementById('pdfContent').appendChild(svg);
                            $('.pdf-loading').remove();
                        });
                });
            });
        }catch(e){}
    }

    pageLoaded();
};