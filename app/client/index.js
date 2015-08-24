
// disconnect any meteor server
if(location.host !== 'localhost:3000' 
   && location.host !== '127.0.0.1:3000'
   && typeof MochaWeb === 'undefined')
    Meteor.disconnect();

// Set the default unit to ether
if(!LocalStore.get('etherUnit'))
    LocalStore.set('etherUnit', 'ether');

// Set the default unit to ether
if(!LocalStore.get('httpProvider'))
    LocalStore.set('httpProvider', "http://localhost:8545");


// Set Session default values for components
if (Meteor.isClient) {
	Session.setDefault('params', {});
}

// Fired when Meteor boots
Meteor.startup(function() {    
    // Set Provider
    // use Meteor.settings.public.httpProvider
    web3.setProvider(new web3.providers.HttpProvider(LocalStore.get('httpProvider')));

    // SET default language
    if(Cookie.get('TAPi18next')) {
        TAPi18n.setLanguage(Cookie.get('TAPi18next'));
    } else {
        var userLang = navigator.language || navigator.userLanguage,
        availLang = TAPi18n.getLanguages();

        // set default language
        if (_.isObject(availLang) && availLang[userLang]) {
            TAPi18n.setLanguage(userLang);
        } else if (_.isObject(availLang) 
                   && availLang[userLang.substr(0,2)]) {
            TAPi18n.setLanguage(userLang.substr(0,2));
        } else {
            TAPi18n.setLanguage('en');
        }
    }

    // Autorun Tracker for i18n support
    Tracker.autorun(function(){
        if(_.isString(TAPi18n.getLanguage())) {
            moment.locale(TAPi18n.getLanguage().substr(0,2));
            numeral.language(TAPi18n.getLanguage().substr(0,2));
        }
    });

	// Set Meta Title
	Meta.setTitle(TAPi18n.__("dapp.app.title"));
    
    // Set BoardRoom proposal kinds from i18n
    BoardRoom.proposalKinds = TAPi18n.__("dapp.proposalKinds",
                                         {returnObjectTrees: true });
    
    // Accounts
    accounts = new Accounts();
    
    // setup one unsecure account if no exist
    if(accounts.length == 0)
        accounts.new();
    
    // Loader
    loader = new Loader({injectElement: ".wrapper"});
    
    // Extend Web3
    accounts.extendWeb3();
    
    // Set default account as the selected account
    web3.eth.defaultAccount = accounts.get('selected').address;
    
    // add accounts to balance tracker
    _.each(accounts.list(), function(account, accountIndex){
        Balances.upsert({address: account.address}, {$set: {address: account.address}});
    });
    
    // Update balances
    Meteor.setInterval(function(){
        _.each(Balances.find({}).fetch(), function(account, accountIndex){
            web3.eth.getBalance(account.address, 
                                function(err, result){
                if(err)
                    return;
                
                if(Balances.find({address: account.address}).fetch().length){
                    Balances.update(Balances.findOne({address: account.address})._id, {$set: {balance: result.toNumber(10)}});
                }else{
                    Balances.upsert({address: account.address}, {$set: {balance: result.toNumber(10)}});
                }
            });
        });
    }, 10000);
});