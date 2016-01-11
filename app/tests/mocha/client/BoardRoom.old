var timeout = 30000;

MochaWeb.testOnly(function(){ 
    
    var boardroomInstance;
    
    describe("BoardRoom contract tests", function(){
        before(function(done) {
            this.timeout(timeout * 2);
            
            BoardRoom.new({from: web3.eth.defaultAccount}, 
                          function(err, contract){
                chai.assert.isNull(err);

                if(!contract.address)
                    return;

                boardroomInstance = contract;
                done();
            });
        });
            
        it("should be one board member to start", function(done){
            this.timeout(timeout);
            
            boardroomInstance.numMembers.call(function(err, numMembers){
                chai.assert.isNull(err);
                chai.assert.equal(numMembers.toNumber(10), 1);
                done();
            });
        });

        it("send funds to the board", function(done){
            this.timeout(timeout);

            web3.eth.sendTransaction({value: 4500000}, function(err, result){
                chai.assert.isNull(err);
            
                web3.eth.getTransaction(result, function(err, result){
                    console.log(err, result); 
                });
                
                done();
            });
        });

        it("should table proposal, watch for the proposal, then check proposal count", function(done){
            this.timeout(timeout * 2);

            boardroomInstance.table("my test proposal", "some data", 2, web3.eth.accounts[0], 4500, moment().unix() + 20000, {gas: 300000}, function(err, result){
                chai.assert.isNull(err);
            });
            
            var watcher;
            watcher = boardroomInstance.onProposal({_from: 0, _kind: 2}, function(err, result){
                chai.assert.isNull(err);
                boardroomInstance.numProposals(function(err, numProposals){
                    chai.assert.isNull(err);
                    chai.assert.equal(numProposals.toNumber(10), 1); 
                    watcher.stopWatching();
                    done();
                });
            });
        });

        it("should table proposal, vote on proposal, execute proposal, check result", function(done){
            this.timeout(timeout * 5);

            boardroomInstance.table("Add proposal member", "", 2, "0xb07e65d2cad3964be868c0df342cb096dc722235", 0, moment().unix() + 20000, {gas: 300000}, function(err, result){
                chai.assert.isNull(err);
            });
            
            var onProposalWatcher;
            onProposalWatcher = boardroomInstance.onProposal({_from: 0, _kind: 2}, function(err, result){
                chai.assert.isNull(err);
                
                boardroomInstance.numProposals(function(err, numProposals){
                    chai.assert.isNull(err);
                    
                    var pid = numProposals.toNumber(10) - 1;
                        
                    boardroomInstance.vote(pid, 1, {gas: 300000}, function(err, result){
                        chai.assert.isNull(err);
                    });
                        
                    var onVoteWatcher = boardroomInstance.onVote({_pid: pid, _from: 0}, function(err, result){
                        chai.assert.isNull(err);
                        
                        boardroomInstance.execute(pid, {gas: 300000}, function(err, result){
                            chai.assert.isNull(err);
                        });
                        
                        var onExecuteWatcher;
                        onExecuteWatcher = boardroomInstance.onExecute({_pid: pid}, function(err, result){
                            chai.assert.isNull(err);

                            boardroomInstance.numMembers(function(err, numMembers){
                                chai.assert.isNull(err);
                                chai.assert.equal(numMembers.toNumber(10), 2); 
                                onExecuteWatcher.stopWatching();
                                onVoteWatcher.stopWatching();
                                onProposalWatcher.stopWatching();
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});