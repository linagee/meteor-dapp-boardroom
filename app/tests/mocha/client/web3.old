var timeout = 30000;

MochaWeb.testOnly(function(){ 
    describe("web3 connectivity", function(){
        it("should connect to web3", function(done){
            this.timeout(timeout);
            
            web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
            done();
        });

        it("should provide valid gas price", function(done){
            this.timeout(timeout);
            
            web3.eth.getGasPrice(function(err, result){
                chai.assert.isNull(err, null);
                chai.assert.property(result, 'toNumber');
                chai.assert.isNumber(result.toNumber(10));
                done();
            });
        });

        it("should provide valid gas price", function(done){
            this.timeout(timeout);

            web3.eth.getAccounts(function(err, accounts){
                chai.assert.isNull(err);
                chai.assert.isArray(accounts);

                console.log(accounts);

                web3.eth.defaultAccount = accounts[0];
                done();
            });
        });
    });    
});