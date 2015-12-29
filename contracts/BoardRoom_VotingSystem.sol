contract BoardRoom {
	function chair() returns (address) {}
	function addressOfArticle(uint _article) returns (address) {}
    function membershipSystem() returns (address) {}
    function familySystem() returns (address) {}
    function proposalSystem() returns (address) {}
    function budgetSystem() returns (address) {}
    function delegationSystem() returns (address) {}
    function votingSystem() returns (address) {}
	function tokenSystem() returns (address){}
	function executive() returns (address) {}
}

contract StandardToken {
    function balanceOf(address _addr) constant returns (uint _r) {}
	function totalSupply() constant returns (uint256 _total) {}
}

contract DelegationSystem {
	event Delegated(address _board, uint _pid, address _from);
	
	function init(){}
	function delegate(address _board, uint _pid, address _to) { }
	function delegatedTo(address _board, uint _pid, address _delegator) public returns (address) {}
	function delegatedFrom(address _board, uint _pid, address _delegated, uint _index) public returns (address) {}
	function totalDelegationsTo(address _board, uint _pid, address _delegated) public returns (uint) {}
	function hasDelegated(address _board, uint _pid, address _delegator) public returns (bool) {}
}

contract ProposalSystem {
    function init(){}
    function numProposals(address _board) returns (uint) {}
    function numExecuted(address _board) returns (uint) {}
    function vote(address _board, address _member, uint _pid, uint _type) {}
    function table(address _board, address _member, bytes32 _name, bytes32 _data, uint _kind, uint _value, address _addr) {}
    function execute(address _board, address _member, uint _pid){}
    function isProposal(address _board, uint _pid) returns (bool) {}
    function proposalName(address _board, uint _pid) returns (bytes32 name) {}
    function proposalKind(address _board, uint _pid) returns (uint kind) {}
    function proposalData(address _board, uint _pid, uint _index) returns (bytes32 data) {}
    function proposalAddr(address _board, uint _pid, uint _index) returns (address addr) {}
    function proposalValue(address _board, uint _pid, uint _index) returns (uint value) {}
    function proposalCreated(address _board, uint _pid) returns (uint created) {}
	function proposalVoted(address _board, uint _pid, address _member) public returns (bool voted) {}
	function proposalVoteMember(address _board, uint _pid, uint _voteID) public returns (address) {}
	function proposalVoteTotal(address _board, uint _pid, uint _position) public returns (uint voteTotal) {}
	function proposalVotePosition(address _board, uint _pid, uint _voteID) public returns (uint votePosition) {}
	function proposalVoteID(address _board, uint _pid, address _member) public returns (uint voteID) {}
	function proposalTotalVotes(address _board, uint _pid) public returns (uint) {}
	function proposalExecuted(address _board, uint _pid) public returns(bool) {}
}

contract MembershipSystem {
    function init(){}
    function isMember(address _board, address _addr) constant returns (bool) {}
}

contract VotingSystem {
    function init(){}
	
	function canDelegate(address _board, uint _pid, address _member) constant returns (bool) {
		if(!MembershipSystem(BoardRoom(_board).membershipSystem()).isMember(_board, _member))
            return false;
			
		if(ProposalSystem(BoardRoom(_board).proposalSystem()).proposalVoted(_board, _pid, _member))
			return false;
			
		if(ProposalSystem(BoardRoom(_board).proposalSystem()).proposalExecuted(_board, _pid)
			|| ProposalSystem(BoardRoom(_board).proposalSystem()).proposalCreated(_board, _pid) + (30 days) < now)
			return false;
			
		return true;
	}
	
	function canVote(address _board, uint _pid, address _member) constant returns (bool) {
		if(!MembershipSystem(BoardRoom(_board).membershipSystem()).isMember(_board, _member))
            return false;
			
		if(ProposalSystem(BoardRoom(_board).proposalSystem()).proposalVoted(_board, _pid, _member))
			return false;
			
		if(ProposalSystem(BoardRoom(_board).proposalSystem()).proposalExecuted(_board, _pid)
			|| ProposalSystem(BoardRoom(_board).proposalSystem()).proposalCreated(_board, _pid) + (30 days) < now)
			return false;
			
		return true;
	}
	
	function canTable(address _board, address _member) constant returns (bool) {
		if(!MembershipSystem(BoardRoom(_board).membershipSystem()).isMember(_board, _member))
			return;
			
		return true;
	}
	
	function canExecute(address _board, uint _pid) constant returns (bool) {
		if(!hasWon(_board, _pid))
			return false;
			
		if(ProposalSystem(BoardRoom(_board).proposalSystem()).proposalExecuted(_board, _pid) 
			|| ProposalSystem(BoardRoom(_board).proposalSystem()).proposalCreated(_board, _pid) + (30 days) < now)
			return false;
			
		return true;
	}
	
    function hasWon(address _board, uint _pid) constant returns (bool) {
        uint kind = ProposalSystem(BoardRoom(_board).proposalSystem()).proposalKind(_board, _pid);
		uint voteFor = 0;
		uint voteAgainst = 0;
		bool chairFor = false;
		bool executiveFor = false;
		
		// tally votes
		for(uint i = 0; i < ProposalSystem(BoardRoom(_board).proposalSystem()).proposalTotalVotes(_board, _pid); i++) {
			address memberAddress = ProposalSystem(BoardRoom(_board).proposalSystem()).proposalVoteMember(_board, _pid, i);
			uint delegatedAmount = 0;
			
			// retrieve delegations
			if(BoardRoom(_board).delegationSystem() != address(0)) {
				for (uint d = 0; d < DelegationSystem(BoardRoom(_board).delegationSystem()).totalDelegationsTo(_board, _pid, memberAddress); d++) {
					address del = DelegationSystem(BoardRoom(_board).delegationSystem()).delegatedFrom(_board, _pid, memberAddress, d);

					delegatedAmount += StandardToken(BoardRoom(_board).tokenSystem()).balanceOf(del);
				}
			}
			
			if(ProposalSystem(BoardRoom(_board).proposalSystem()).proposalVotePosition(_board, _pid, i) == 1) {
				if(memberAddress == BoardRoom(_board).chair())
					chairFor = true;
					
				if(memberAddress == BoardRoom(_board).executive()
					&& BoardRoom(_board).executive() != address(0))
					executiveFor = true;
				
				voteFor += StandardToken(BoardRoom(_board).tokenSystem()).balanceOf(memberAddress) + delegatedAmount;
			}
				
			if(ProposalSystem(BoardRoom(_board).proposalSystem()).proposalVotePosition(_board, _pid, i) == 0)
				voteAgainst += StandardToken(BoardRoom(_board).tokenSystem()).balanceOf(memberAddress) + delegatedAmount;
		}
		
		// executive voted against constitutional or budgetary changes
		if(kind >= 1 && kind <= 3
			&& BoardRoom(_board).executive() != address(0)
			&& !executiveFor)
			return false;
			
		// executive voted for
		//if(executiveFor)
		//	return true;
			
		// minimum qouarum not reached
		if(voteFor + voteAgainst < StandardToken(BoardRoom(_board).tokenSystem()).totalSupply() / 2)
			return false;
		
		// uneven majority, or even weight with chair split
		if(((voteFor + voteAgainst) % 2 == 1 && voteFor > voteAgainst) // uneven split
          	|| (voteFor == voteAgainst && chairFor)) // votes are even but the chair is for
			return true;
    }
}
