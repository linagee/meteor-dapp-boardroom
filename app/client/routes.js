/**
Template Controllers

@module Routes
*/

/**
The app routes

@class App routes
@constructor
*/

function handleData(){
    var paramsObject = {
        _boardroom: this.params._boardroom,
        _proposal: parseInt(this.params._proposal),
        _middleware: this.params._middleware,
        _kind: this.params._kind,
    },
        urlBlocks = String(Router.current().url).split('/');
    
    objects = {
        boardroom: {},
        proposal: {},
        middleware: {},
        kind: {},
        params: paramsObject,
        url: {
            blocks: urlBlocks,
            blockLast: urlBlocks[urlBlocks.length - 1],
            blockFirst: urlBlocks[0],
            raw: Router.current().path,
        }
    };
    
    boardroomInstance = {};
    onProposal = null;
    onVote = null;
    onDelegation = null;
    onExecuted = null;
    
    _.each(TAPi18n.__("dapp.proposalKinds", {returnObjectTrees: true }),
           function(kind, kindIndex){
        if(kind.name == paramsObject._kind)
            objects.kind = kind;
    });
    
    if(!_.isUndefined(paramsObject._boardroom)) {
        objects.boardroom = Boards.findOne({address: paramsObject._boardroom});
        
        if(_.isUndefined(objects.boardroom)) {
            objects.boardroom = {address: this.params._boardroom};
            Boards.upsert(objects.boardroom, objects.boardroom);
        }
        
        Boards.import(this.params._boardroom);
        boardroomInstance = BoardRoom.Contract.at(paramsObject._boardroom);
        Balances.upsert({address: this.params._boardroom}, {$set: {address: this.params._boardroom}});
        
        BoardRoom.info(boardroomInstance, function(err, result){
            //console.log(result); 
        });
        
        // Load all members
        boardroomInstance.numMembersActive(function(err, numMembers){
            if(err)
                return;
            
            Members.import(paramsObject._boardroom, 0, numMembers.toNumber(10) - 1);
        });
        
        // Meta Title
        nameregInstance = NameReg.Contract.at(LocalStore.get("nameregAddress"));
        nameregInstance.nameOf.call(boardroomInstance.address, function(err, result){
            if(err) {
                Meta.setTitle(TAPi18n.__(boardroomInstance.address.substr(0, 5) + '..' + ' ' + 'BoardRoom'));
                return
            }
            
            result = web3.clean(web3.toAscii(result));

            Meta.setTitle(TAPi18n.__(result + ' ' + 'BoardRoom'));

            if(!result)
                Meta.setTitle(TAPi18n.__('Unknown' + ' ' + 'BoardRoom'));
        });
    
        // Watch for new proposals
        onProposal = boardroomInstance.onProposal(function(err, result){
             boardroomInstance.numProposals(function(err, numProposals){
                var pid = numProposals.toNumber(10) - 1;
                Proposals.import(boardroomInstance.address, pid);
                Boards.update({address: boardroomInstance.address}, {$set: {numProposals: pid + 1}});
                 
                var proposal = Proposals.findOne({id: pid});
                 
                if(!_.isUndefined(proposal))
                    Balances.upsert({address: proposal.addr}, {$set: {address: proposal.addr}});
             });
        });
    
        // Watch for new delegations
        onVote = boardroomInstance.onDelegate(function(err, result){
            console.log('Delegate', err, result);
            
            if(err)
                return console.log('Error receiving vote event', err);
            
            var args = result.args,
                pid = args._pid.toNumber(10),
                to = args._to.toNumber(10),
                from = args._from.toNumber(10);
            
            Proposals.import(boardroomInstance.address, pid);
        });
    
        // Watch for new votes
        onVote = boardroomInstance.onVote(function(err, result){
            console.log('Voted!');
            
            if(err)
                return console.log('Error receiving vote event', err);
            
            var args = result.args,
                pid = args._pid.toNumber(10),
                from = args._from.toNumber(10);
            
            Proposals.import(boardroomInstance.address, pid);
        });
    
        // Watch for new proposals
        onExecuted = boardroomInstance.onExecute(function(err, result){           
            if(err)
                return console.log('Error receiving vote event', err);
            
            var args = result.args,
                pid = args._pid.toNumber(10),
                proposal = Proposals.findOne({id: pid, boardroom: boardroomInstance.address});
            
            if(_.isUndefined(proposal))
                return;
            
            // add member
            //if(proposal.kind == 1)
            // budget removal
            
            // add member
            if(proposal.kind == 2)
                boardroomInstance.numMembers(function(err, result){
                    if(err)
                        return;
                    
                    Members.import(boardroomInstance.address,
                                   result.toNumber(10));
                });
            
            // remove member
            if(proposal.kind == 3)
                Members.remove({boardroom: boardroomInstance.address, id: proposal.value});
            
            // change chair
            if(proposal.kind == 4) 
                Members.import(boardroomInstance.address, proposal.value);
            
            // add child subcommittee
            if(proposal.kind == 5) 
                boardroomInstance.numChildren(function(err, result){
                    if(!err)
                        Children.import(boardroomInstance.address, result.toNumber(10));
                });
            
            // remove child subcommittee
            if(proposal.kind == 6)
                Children.remove({boardroom: boardroomInstance.address, id: proposal.value});
                  
            // change parent
            //if(proposal.kind == 7)
    
            if(proposal.kind == 12)
                Members.upsert({boardroom: boardroomInstance.address, id: proposal.value}, {$set: {addr: proposal.addr}});
                                 
            Proposals.import(boardroomInstance.address, pid);
            Boards.import(boardroomInstance.address);
        });
    }
    
    if(_.has(objects.boardroom, 'address')) {
        objects.boardroom.boardroomFilter = {
            boardroom: objects.boardroom.address
        };
    }
    
    if(!_.isUndefined(paramsObject._proposal) && !_.isNaN(paramsObject._proposal)) {
        objects.proposal = Proposals.findOne({boardroom: paramsObject._boardroom, id: paramsObject._proposal});
        Balances.upsert({address: objects.proposal.addr}, {$set: {address: objects.proposal.addr}});
    } else {
        objects.proposal = Proposals.findOne({boardroom: paramsObject._boardroom}, {$orderby : {$natural : -1}});
    }
        
    if(!_.isUndefined(paramsObject._middleware))
        objects.middleware = Middleware.findOne({address: paramsObject._middleware});
    
    return objects;
};

// Change the URLS to use #! instead of real paths
// Iron.Location.configure({useHashPaths: true});

// Router defaults
Router.configure({
    layoutTemplate: 'layout_main',
    notFoundTemplate: 'layout_notFound',
    loadingTemplate: 'loading',
    yieldRegions: {
        'layout_header': {to: 'header'},
        'layout_footer': {to: 'footer'}
    }
});


// Default Route
Router.route('/', {
    template: 'views_boards',
    name: 'home'
});

// Route to start (a boardroom)
Router.route('/start', {
    template: 'views_boards',
    name: 'start'
});

// Route to start (a boardroom)
Router.route('/deploy', {
    template: 'views_start',
});

// Route to start (a boardroom)
Router.route('/contract', {
    template: 'views_contract',
    name: 'contract'
});

// Route to an Ethereum accounts manager
Router.route('/accounts', {
    template: 'views_accounts',
    name: 'accounts'
});

// Route to a help page for BoardRoom
Router.route('/help', {
    template: 'views_help',
    name: 'help'
});

// Route to a support page
Router.route('/support', {
    template: 'views_support',
    name: 'support'
});


// Route to the boards
Router.route('/boards', {
    template: 'views_boards',
    layoutTemplate: 'layout_main',
    name: 'boards',
});

// Route to namereg manager
Router.route('/license', {
    template: 'views_license',
    layoutTemplate: 'layout_main',
    name: 'license',
});

// Route to settings manager
Router.route('/settings', {
    template: 'views_settings',
    layoutTemplate: 'layout_main',
    name: 'settings',
});

// Route to namereg manager
Router.route('/namereg', {
    template: 'views_namereg',
    layoutTemplate: 'layout_main',
    name: 'namereg',
});

// Route to about manager
Router.route('/about', {
    template: 'views_about',
    layoutTemplate: 'layout_main',
    name: 'about',
});


// Route to boardroom landing page
Router.route('/boardroom', {
    template: 'views_boardroom',
    layoutTemplate: 'layout_boardroom',
    data: handleData,
    name: 'boardroom',
});

// Route to a BoardRoom board
Router.route('/boardroom/:_boardroom', {
    template: 'views_boardroom',
    layoutTemplate: 'layout_boardroom',
    data: handleData,
});

// Route to the Board's calendar
Router.route('/boardroom/:_boardroom/calendar', {
    template: 'views_calendar',
    layoutTemplate: 'layout_boardroom',
    data: handleData,
});

// Route to a all related boardrooms (Parent/Children)
Router.route('/boardroom/:_boardroom/children', {
    template: 'views_children',
    layoutTemplate: 'layout_boardroom',
    data: handleData,
});

// Route to a all related boardrooms (Parent/Children)
Router.route('/boardroom/:_boardroom/parent', {
    template: 'views_parent',
    layoutTemplate: 'layout_boardroom',
    data: handleData,
});

// Route to middleware ecosystem
Router.route('/boardroom/:_boardroom/middleware', {
    template: 'views_middlewares',
    layoutTemplate: 'layout_boardroom',
    data: handleData,
});

// Route to an overview of the boardroom's members
Router.route('/boardroom/:_boardroom/settings', {
    template: 'views_settings',
    layoutTemplate: 'layout_boardroom',
    data: handleData,
});

// Route to an overview of the boardroom's members
Router.route('/boardroom/:_boardroom/members', {
    template: 'views_members',
    layoutTemplate: 'layout_boardroom',
    data: handleData,
});

// Route to a boardrooms stats
Router.route('/boardroom/:_boardroom/stats', {
    template: 'views_stats',
    layoutTemplate: 'layout_boardroom',
    data: handleData,
});

// Route to a boardrooms namereg
Router.route('/boardroom/:_boardroom/namereg', {
    template: 'views_namereg',
    layoutTemplate: 'layout_boardroom',
    data: handleData,
});

// Route to a boardrooms contract
Router.route('/boardroom/:_boardroom/contract', {
    template: 'views_contract',
    layoutTemplate: 'layout_boardroom',
    data: handleData,
});

// Route to a boardrooms about
Router.route('/boardroom/:_boardroom/about', {
    template: 'views_about',
    layoutTemplate: 'layout_boardroom',
    data: handleData,
});

// Route to a boardrooms about
Router.route('/boardroom/:_boardroom/license', {
    template: 'views_license',
    layoutTemplate: 'layout_boardroom',
    data: handleData,
});

// Route to a boardroom support
Router.route('/boardroom/:_boardroom/support', {
    template: 'views_support',
    layoutTemplate: 'layout_boardroom',
    data: handleData,
});

// Route to a middleware app about page
Router.route('/boardroom/:_boardroom/middleware/registry', {
    template: 'views_middlewareRegistry',
    layoutTemplate: 'layout_boardroom',
    yieldRegions: {
        'layout_header': {to: 'header'},
        'layout_middlewareRegistry': {to: 'subheader'},
    },
    data: handleData,
});

// Route to a middleware app about page
Router.route('/boardroom/:_boardroom/middleware/:_middleware', {
    template: 'views_middlewareAbout',
    layoutTemplate: 'layout_boardroom',
    yieldRegions: {
        'layout_header': {to: 'header'},
        'layout_middlewareHeader': {to: 'subheader'},
    },
    data: handleData,
});

// Route to a middleware app about page
Router.route('/boardroom/:_boardroom/middleware/:_middleware/about', {
    template: 'views_middlewareAbout',
    layoutTemplate: 'layout_boardroom',
    yieldRegions: {
        'layout_header': {to: 'header'},
        'layout_middlewareHeader': {to: 'subheader'},
    },
    data: handleData,
});

// Route to a middleware app contract page
Router.route('/boardroom/:_boardroom/middleware/:_middleware/contract', {
    template: 'views_middlewareContract',
    layoutTemplate: 'layout_boardroom',
    yieldRegions: {
        'layout_header': {to: 'header'},
        'layout_middlewareHeader': {to: 'subheader'},
    },
    data: handleData,
});

// Route to a middleware app interface page
Router.route('/boardroom/:_boardroom/middleware/:_middleware/interface', {
    template: 'views_middlewareInterface',
    layoutTemplate: 'layout_boardroom',
    yieldRegions: {
        'layout_header': {to: 'header'},
        'layout_middlewareHeader': {to: 'subheader'},
    },
    data: handleData,
});

// Route to a most recent board proposal
Router.route('/boardroom/:_boardroom/home', {
    template: 'views_boardroom',
    layoutTemplate: 'layout_boardroom',
    data: handleData,
});

// Route to a most recent board proposal
Router.route('/boardroom/:_boardroom/proposal', {
    template: 'views_proposal',
    layoutTemplate: 'layout_proposals',
    data: handleData,
});

// Route to a most recent board proposals
Router.route('/boardroom/:_boardroom/proposals', {
    template: 'views_proposal',
    layoutTemplate: 'layout_proposals',
    data: handleData,
});

// Route to a most recent board proposals
Router.route('/boardroom/:_boardroom/proposal/recent', {
    template: 'views_proposal',
    layoutTemplate: 'layout_proposals',
    data: handleData,
});

// Route to a most recent board proposal
Router.route('/boardroom/:_boardroom/proposal/new', {
    template: 'views_newProposal',
    layoutTemplate: 'layout_proposals',
    data: handleData,
});

// Route to a most recent board proposal
Router.route('/boardroom/:_boardroom/proposal/new/:_kind', {
    template: 'views_newProposal',
    layoutTemplate: 'layout_proposals',
    data: handleData,
});

// Route to a single/specific board proposal
Router.route('/boardroom/:_boardroom/proposal/:_proposal', {
    template: 'views_proposal',
    layoutTemplate: 'layout_proposals',
    data: handleData,
});