contract BoardRoom {
	function addressOfArticle(uint _article) constant returns (address) {}
}

contract StandardToken {
    function balanceOf(address _addr) constant returns (uint _r) {}
	function totalSupply() constant returns (uint256 _total) {}
}

contract DelegationSystem {
	function delegatedFrom(address _board, uint _proposalID, address _delegated, uint _index) public returns (address) {}
	function totalDelegationsTo(address _board, uint _proposalID, address _delegated) public returns (uint) {}
	function hasDelegated(address _board, uint _proposalID, address _delegator) public returns (bool) {}
}

contract ProposalSystem {
    function kindOf(address _board, uint _proposalID) public constant returns (uint) {}
	function createdAt(address _board, uint _proposalID) public constant returns (uint) {}
	function tabledBy(address _board, uint _proposalID) public constant returns (address) {}
	function isExecuted(address _board, uint _proposalID) public constant returns(bool) {}
	
	function voteCountOf(address _board, uint _proposalID) public constant returns (uint) {}
    function hasVoted(address _board, uint _proposalID, address _member) public constant returns (bool) {}
	
	function addressIn(address _board, uint _proposalID, address _addr) public constant returns (bool) {}
	function totalValue(address _board, uint _proposalID) public constant returns (uint) {}
    function positionOf(address _board, uint _proposalID, uint _voteID) public constant returns (uint) {}
    function memberOf(address _board, uint _proposalID, uint _voteID) public constant returns (address) {}
    function idOf(address _board, uint _proposalID, address _member) public constant returns (uint) {}
}

contract MembershipSystem {
    function isMember(address _board, address _addr) constant returns (bool) {}
}

contract VotingSystem {
	enum DefaultArticles {Proposals, Voting, Membership, Delegation, Token, Family, Chair, Executive}
	
	function canVote(address _board, uint _proposalID, address _member) public constant returns (bool) {
		address proposalSystem = BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Proposals));
		
		if(!MembershipSystem(proposalSystem).isMember(_board, _member)
			|| ProposalSystem(proposalSystem).hasVoted(_board, _proposalID, _member)
			|| ProposalSystem(proposalSystem).isExecuted(_board, _proposalID)
			|| ProposalSystem(proposalSystem).createdAt(_board, _proposalID) + (30 days) < now)
			return false;
			
		return true;
	}
	
	function canDelegate(address _board, uint _proposalID, address _member) public constant returns (bool) {
		address proposalSystem = BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Proposals));
	
		if(!canVote(_board, _proposalID, _member))
			return false;
			
		return true;
	}
	
	function canTable(address _board, uint _kind, address _member) public constant returns (bool) {
		if(!MembershipSystem(BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Membership))).isMember(_board, _member))
			return;
			
		return true;
	}
	
	function canExecute(address _board, uint _proposalID, address _member) public constant returns (bool) {
		address proposalSystem = BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Proposals));
		
		if(!hasWon(_board, _proposalID)
			|| ProposalSystem(proposalSystem).isExecuted(_board, _proposalID) 
			|| ProposalSystem(proposalSystem).createdAt(_board, _proposalID) + (30 days) < now)
			return false;
			
		return true;
	}
	
    function hasWon(address _board, uint _proposalID) public constant returns (bool) {
		address proposalSystem = BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Proposals));
		uint voteFor = 0;
		uint voteAgainst = 0;
		bool chairFor = false;
		bool executiveFor = false;
		
		// tally votes
		for(uint voteID = 0; voteID < ProposalSystem(proposalSystem).voteCountOf(_board, _proposalID); voteID++) {
			address memberAddress = ProposalSystem(proposalSystem).memberOf(_board, _proposalID, voteID);
			uint delegatedAmount = 0;
			
			// retrieve delegations
			if(BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Delegation)) != address(0)) {
				for (uint delegationID = 0; 
				    delegationID < DelegationSystem(BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Delegation)))
				                                                .totalDelegationsTo(_board, _proposalID, memberAddress); 
				    delegationID++) {
					delegatedAmount += StandardToken(BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Token)))
					                    .balanceOf(DelegationSystem(BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Delegation)))
					                    .delegatedFrom(_board, _proposalID, memberAddress, delegationID));
				}
			}
			
			if(ProposalSystem(proposalSystem).positionOf(_board, _proposalID, voteID) == 1) {
				if(memberAddress == BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Chair)))
					chairFor = true;
					
				if(memberAddress == BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Executive))
					&& BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Executive)) != address(0))
					executiveFor = true;
				
				voteFor += StandardToken(BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Token))).balanceOf(memberAddress) + delegatedAmount;
			}
				
			if(ProposalSystem(proposalSystem).positionOf(_board, _proposalID, voteID) == 0)
				voteAgainst += StandardToken(BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Token))).balanceOf(memberAddress) + delegatedAmount;
		}
		
		if((ProposalSystem(proposalSystem).addressIn(_board, _proposalID, _board) // affects the board
			|| ProposalSystem(proposalSystem).totalValue(_board, _proposalID) > 0) // fund release: ether widthrawl
			&& !executiveFor)
			return false;
		
		// executive voted for
		//if(executiveFor)
		//	return true;
		
		if((voteFor + voteAgainst) > (StandardToken(BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Token))).totalSupply() / 2)
			&& (voteFor > voteAgainst || (voteFor == voteAgainst && chairFor)))
			return true;
    }
}