Template['components_itemSelectedAccount'].helpers({
    'selectedAccount': function(){
        var selected = LocalStore.get('selectedAddress');
        return { address: selected };
    },
});