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
    
	
	/*enum DefaultArticles {
				Proposals, 
				Processor, 
				Voting, 
				Membership, 
				Delegation, 
				Token, 
				Family, 
				Chair, 
				Executive}}*/
	
    objects = {
        boardroom: {},
        proposal: {},
        middleware: {},
        kind: {},
		defaultComponents: {
			Proposals: ProposalSystem.at('0x9ce62bab6e9040dc9aa9f63ab1ae79e1db31fa6c'),
			Processor: ProcessingSystem.at('0xfbb865ecbfc55fd7947fa1465b97949a04de3bca'),
			Voting: VotingSystem.at('0x2a983fbd9a303df72bf18931b3cd35a79e332e37'),
			Membership: MembershipSystem.at('0xf68eec949890f5b3bdd29de0a368adcf551afb21'),
			Delegation: DelegationSystem.at('0xb71676e3624d318000ad9e9cb0f49879db7404ca'),
			Family: FamilySystem.at('0x24675b3c9a2f4b55e10941d98356d5fcfd096205'),
			MembershipRegistry: MembershipRegistry.at('0x3691324d56c89814f90c486a0b8e27cf2e81de3b'),
			NameReg: NameReg.at('0xd7c6faea52c46116ea726a55f3e9179b6ad9f8e2'),
		},
		defaultArticles: {
			Proposals: 0,
			Processor: 1, 
			Voting: 2, 
			Membership: 3, 
			Delegation: 4, 
			Token: 5, 
			Family: 6, 
			Chair: 7, 
			Executive: 8 	
		},
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
		
		if(!_.isUndefined(paramsObject._boardroom)){
        	//Boards.import(this.params._boardroom);
        	boardroomInstance = BoardRoom.at(paramsObject._boardroom);
        	Balances.upsert({address: this.params._boardroom}, {$set: {address: this.params._boardroom}});
			
			/*if(_.isUndefined(objects.params._proposal)
			   || isNaN(objects.params._proposal))
				objects.params._proposal = 0;*/
			
			var proposals = objects.defaultComponents.Proposals;
	
			proposals.numProposals.call(boardroomInstance.address, function (err, result){				
				Boards.update({address: boardroomInstance.address}, {$set: {numProposals: result.toNumber(10)}});
			});

			proposals.numExecuted.call(boardroomInstance.address, function (err, result){
				Boards.update({address: boardroomInstance.address}, {$set: {numExecuted: result.toNumber(10)}});
			});

			boardroomInstance.addressOfArticle.call(objects.defaultArticles.Chair, function (err, result){		
				Boards.update({address: boardroomInstance.address}, {$set: {chair: result}});
			});

			boardroomInstance.addressOfArticle.call(objects.defaultArticles.Executive, function (err, result){		
				Boards.update({address: boardroomInstance.address}, {$set: {executive: result}});
			});

			objects.defaultComponents.Family.numMembers(boardroomInstance.address, function (err, result){	
				Boards.update({address: boardroomInstance.address}, {$set: {numSubcommittees: result.toNumber(10)}});
			});

			objects.defaultComponents.MembershipRegistry.totalMembers(boardroomInstance.address, function (err, result){	
				Boards.update({address: boardroomInstance.address}, {$set: {numMembersRegistered: result.toNumber(10)}});
			});

			boardroomInstance.addressOfArticle(objects.defaultArticles.Token, function(err, tokenAddress){
				Boards.update({address: boardroomInstance.address}, {$set: {tokenAddress: tokenAddress}});

				var token = Standard_Token.at(tokenAddress);

				token.totalSupply(function(err, result){
					Boards.update({address: boardroomInstance.address}, {$set: {tokenSupply: result.toNumber(10)}});
				});
			});
		
			objects.defaultComponents.Proposals.Tabled({_board: boardroomInstance.address}, function(err, result){
				console.log(result);

				BoardRoom.importProposal(boardroomInstance.address, result.args._proposalID.toNumber(10));
			});

			objects.defaultComponents.Proposals.Voted({_board: boardroomInstance.address}, function(err, result){
				console.log(result);

				BoardRoom.importProposal(boardroomInstance.address, result.args._proposalID.toNumber(10));
			});

			objects.defaultComponents.Proposals.Executed({_board: boardroomInstance.address}, function(err, result){
				console.log(result);

				BoardRoom.importProposal(boardroomInstance.address, result.args._proposalID.toNumber(10));
			});
			
			objects.defaultComponents.MembershipRegistry.Registered({_board: boardroomInstance.address}, function(err, result){
				Members.upsert({boardroom: boardroomInstance.address, address: result.args._member}, {id: result.args._memberID.toNumber(10), boardroom: boardroomInstance.address, address: result.args._member});
			});
		}
    }
    
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
    data: handleData,
    name: 'home'
});

// Route to start (a boardroom)
Router.route('/start', {
    template: 'views_boards',
    name: 'start',
    data: handleData,
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
    data: handleData,
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
    data: handleData,
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

// Route to a BoardRoom board
Router.route('/boardroom/:_boardroom/equity', {
    template: 'views_equity',
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