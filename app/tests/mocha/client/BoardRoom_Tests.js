var timeout = 30000;

MochaWeb.testOnly(function(){ 
    var boardroomInstance,
		defaultTx = {
			from: web3.eth.defaultAccount,
			gas: 3000000
		};
    
    describe("BoardRoom contract tests", function(){
        before(function(done) {
            this.timeout(timeout * 2);
			
			MembershipSystem.new(_.extend(defaultTx, {data: MembershipSystem.bytecode}), function(err, result){
				console.log('Membership deploy: ', err, result);
			});
            
            /*BoardRoom.new({from: web3.eth.defaultAccount}, 
                          function(err, contract){
                chai.assert.isNull(err);

                if(!contract.address)
                    return;

                boardroomInstance = contract;
                done();
            });*/
        });
            
        it("should be one board member to start", function(done){
            this.timeout(timeout);
            
            /*boardroomInstance.numMembers.call(function(err, numMembers){
                chai.assert.isNull(err);
                chai.assert.equal(numMembers.toNumber(10), 1);
                done();
            });*/
        });
	});
});