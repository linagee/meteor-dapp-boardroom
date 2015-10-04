/**
Template Controllers

@module Templates
*/

/**
The accounts template is an interface for managing Ethereum accounts in browser. This means the creation, removal, encryption, decryption and use of client-side accounts stored in the browsers localStore.

@class [template] views_accounts
@constructor
*/

Template['views_accounts'].helpers({
    /**
    Get the name

    @event (click #accounts-new)
    */

    'ethAccounts': function(){
        return EthAccounts.find({});
    },
});

Template['views_accounts'].events({
    /**
    Get the name

    @event (click #accounts-new)
    */

    'click #accounts-new': function(event, template){
        Dialog.promt('Please encrypt your account with a minimum 6 character password:', {title: 'Encrypt Account', inputs: ['Passphrase']}, function(result, values){
            accounts.new(values[0]);
        });
    },
    
    /**
    Get the name

    @event (click #accounts-backup)
    */

    'click #accounts-backup': function(event, template){        
        accounts.backup();
    },
    
    /**
    Get the name

    @event (click .list-account-item)
    */

    'click .list-account-item': function(event, template){
        if($(event.target).is('button'))
            return;
        
        var element = $(event.target).closest('.list-account-item');
        var data = element[0].dataset;
        
        web3.eth.defaultAccount = data.address;
        accounts.select(data.address);
        Balances.upsert({address: data.address}, {$set: {address: data.address}});  
    },
    
    /**
    Get the name

    @event (click .accounts-remove)
    */

    'click .accounts-remove': function(event, template){
        var element = $(event.target).closest('.list-account-item');
        var data = element[0].dataset;
        
        Dialog.confirm('Are you sure you want to remove this account?', {title: 'Account Removal'}, function(result, values){
            if(result) {
                accounts.remove(data.address);
                Balances.remove({address: data.address});   
            }
        });
    },
    
    /**
    Get the name

    @event (click .accounts-faucet)
    */

    'click .accounts-faucet': function(event, template){
        var element = $(event.target).closest('.list-account-item');
        var data = element[0].dataset,
            etherValue = 3;
        
        Helpers.post('http://testnet.consensys.net/faucet', {
            address: String(data.address)
        });
        
        Dialog.alert('You have fauceted a 1000 ether to account' + String(data.address) + '. This may take a few minutes to process.');
        
        /*web3.eth.sendTransaction({from: web3.eth.accounts[0], to: data.address, value: web3.toWei(etherValue, 'ether'), gasPrice: 100000000000000}, function(err, result){
            if(err)
                Dialog.alert('There was an error getting ether, the error was: ' + String(err));
            
            if(!err)
                Dialog.alert('Transaction successfull, ' + String(etherValue) + ' ether has been sent to address: ' + data.address);
        });*/
    }
});

Template['views_accounts'].created = function(){
	Meta.setSuffix(TAPi18n.__("dapp.accounts.title"));
    //loader.wait();
};

    
Template['views_accounts'].rendered = function(){
    // Load
    //loader.finish();
    
    web3.eth.defaultAccount = accounts.get('selected').address;
};