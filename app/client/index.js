
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
    LocalStore.set('httpProvider', "http://104.236.65.136:8545/"); //"http://localhost:8545");

// Set the Default NameReg Contract
if(!LocalStore.get('nameregAddress'))
    LocalStore.set('nameregAddress', '0xec5eabdc7d40f412726d937784e486ab3a4b037e');


// Set Session default values for components
if (Meteor.isClient) {
	Session.setDefault('params', {});
}

// Fired when Meteor boots
Meteor.startup(function() {    
    // Accounts
    accounts = new Accounts();
    
    // Set Provider
    // use Meteor.settings.public.httpProvider
    var provider = new HookedWeb3Provider({
      host: LocalStore.get('httpProvider'),
      transaction_signer: accounts
    });
    web3.setProvider(provider);

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
    
    // setup one unsecure account if no exist
    if(accounts.length == 0)
        accounts.new();
    
    // Loader
    loader = new Loader({injectElement: ".wrapper"});
    
    web3.eth.getGasPrice(function(err, result){
        LocalStore.set('gasPrice', result.toNumber(10)); 
    });
    
    // EthAccounts
    EthAccounts.init();
    
    // Set default account as the selected account
    web3.eth.defaultAccount = LocalStore.get('selectedAddress');
    // default to ethereum-accounts' selected account
    if (!web3.eth.defaultAccount) {
        web3.eth.defaultAccount = accounts.get('selected').address;
        LocalStore.set('selectedAddress', web3.eth.defaultAccount);
    }
    
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