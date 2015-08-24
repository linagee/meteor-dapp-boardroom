Template['components_proposalData'].helpers({
    'isValidAddress': function(address){
        if(!_.isUndefined(address)
           && address != web3.address(0)
           && address != "")
            return true;
        
        return false;        
    },
});