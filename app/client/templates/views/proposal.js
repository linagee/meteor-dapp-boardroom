Template['views_proposal'].rendered = function(){
	Meta.setSuffix(TAPi18n.__("dapp.proposal.title"));
    TemplateVar.set('state', {isVotable: true});
    
    Meteor.setTimeout(function(){
        $('#pdfContent').empty();
        Helpers.loadPDF('#pdfContent', 1, 'http://crossorigin.me/http://boardroom.to/BoardRoom_WhitePaper.pdf');
    }, 1000);
};