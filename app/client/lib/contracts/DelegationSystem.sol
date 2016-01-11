contract BoardRoom {
	function amendConstitution(uint _article, address _addr){}
	function transfer_ownership(address _addr) {}
	function disolve(address _addr) {}
	function forward(address _destination, uint _value, bytes _transactionBytecode) {}
	function forward_method(address _destination, uint _value, bytes4 _methodName, bytes32[] _transactionData) {}
	
	function addressOfArticle(uint _article) constant returns (address) {}
	function implementer() constant returns (address) {}
}

contract VotingSystem {
	function canDelegate(address _board, uint _proposalID, address _member) constant returns (bool) {}
}

contract MembershipSystem {
    function isMember(address _board, address _addr) returns (bool) {}
}

contract DelegationSystem {
	enum DefaultArticles {Proposals, Processor, Voting, Membership, Delegation, Token, Family, Chair, Executive}
	
	event Delegated(address _board, uint _proposalID, address _from);
	
	mapping(address => mapping(uint => uint)) public delegationCount;
	mapping(address => mapping(uint => mapping(address => address[]))) public delegators; // delegated -> delegators
	mapping(address => mapping(uint => mapping(address => address))) public delegations; // delegator -> delegated
	
	function delegate(address _board, uint _proposalID, address _to) public {
		if(VotingSystem(BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Voting))).canDelegate(_board, _proposalID, msg.sender))
			throw;
		
		if(_to == address(0))
			throw;
			
		if(delegations[_board][_proposalID][msg.sender] != address(0))
			throw;
			
		delegations[_board][_proposalID][msg.sender] = _to;		
		var delegatorID = delegators[_board][_proposalID][_to].length++;
		delegators[_board][_proposalID][_to][delegatorID] = msg.sender;
		
		// delegate delegated votes from the sender to the new delegation address
		if(delegators[_board][_proposalID][msg.sender].length > 0) {
			for(uint d = 0; d < delegators[_board][_proposalID][msg.sender].length; d++) {
				var did = delegators[_board][_proposalID][_to].length++;

				delegators[_board][_proposalID][_to][did] = delegators[_board][_proposalID][msg.sender][d];
			}

			delete delegators[_board][_proposalID][msg.sender];	
		}
		
		Delegated(_board, _proposalID, msg.sender);
	}
	
	function delegatedTo(address _board, uint _proposalID, address _delegator) public constant returns (address) {
		return delegations[_board][_proposalID][_delegator];
	}
	
	function delegatedFrom(address _board, uint _proposalID, address _delegated, uint _index) public constant returns (address) {
		return delegators[_board][_proposalID][_delegated][_index];
	}
	
	function totalDelegationsTo(address _board, uint _proposalID, address _delegated) public constant returns (uint) {
		return delegators[_board][_proposalID][_delegated].length;
	}
	
	function totalDelegations(address _board, uint _proposalID) public constant returns (uint) {
		return delegationCount[_board][_proposalID];
	}
	
	function hasDelegated(address _board, uint _proposalID, address _delegator) public constant returns (bool) {
		if(delegations[_board][_proposalID][_delegator] != address(0))
			return true;
	}
}