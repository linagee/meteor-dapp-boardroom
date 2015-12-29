contract ProposableConfig { 
    function onExecute(uint _pid) {} 
    function onProposal(uint _pid) {} 
    function onVote(uint _pid) {}
}

contract BoardRoom {
	function execute(uint _pid) {}
	function chair() returns (address) {}
	function addressOfArticle(uint _article) returns (address) {}
	function membershipSystem() returns (address) {}
	function familySystem() returns (address) {}
	function proposalSystem() returns (address) {}
	function delegationSystem() returns (address) {}
	function votingSystem() returns (address) {}
	function tokenSystem() returns (address){}
	function controller() returns (address){}
}

contract NameReg {
	function register(bytes32 name) {}
	function unregister() {}
}

contract Middleware { function execute(uint _pid){}}

contract VotingSystem {
    address public votingSystem;
    
    function init(){}
    function hasWon(address _board, uint _pid) returns (bool) {}
	function canTable(address _board, address _member) returns (bool) {}
	function canVote(address _board, uint _pid, address _member) returns (bool) {}
	function canExecute(address _board, uint _pid) returns (bool) {}
}

contract BoardRoomController {
	function board() returns (address){}
	function execute(uint _pid, bytes _transactionData) {}
}

contract ProposalSystem is VotingSystem, ProposableConfig {
    struct Proposal {
	string name;
	address from;
	uint kind;
	bytes32 hash;
	
	bytes32[] data;
	address[] addr;
	uint[] value;
	
	Vote[] votes;
	uint totalVotes;
	mapping(address => bool) voted;
	mapping(address => uint) toID;
	
	bool executed;
	uint created;
    }
	
	struct Vote {
		uint position;
		address member;
	}
    
    event Tabled(uint _kind, address _member, uint indexed _pid);
    event Executed(uint indexed _pid);
    event Voted(uint indexed _pid, address _member, uint _position);
    
    mapping(address => uint) public numExecuted;
    mapping(address => uint) public numProposals;
    mapping(address => mapping(uint => Proposal)) public proposals;
	
	function vote(address _board, uint _pid, uint _position) public returns (uint voteID) {
		if(!VotingSystem(BoardRoom(_board).votingSystem()).canVote(_board, _pid, msg.sender))
			throw;
			
        Proposal p = proposals[_board][_pid];
			
		p.totalVotes++;
		voteID = p.votes.length++;
		p.votes[voteID] = Vote({position: _position, member: msg.sender});
		p.voted[msg.sender] = true;
		p.toID[msg.sender] = voteID;
		
		Voted(_pid, msg.sender, _position);
	}
	
	function table(address _board, string _name, uint _kind,
				bytes32[] _data, uint[] _value, address[] _addr, 
				bytes _transactionData) public {			
		if(!VotingSystem(BoardRoom(_board).votingSystem()).canTable(_board, msg.sender))
			throw;
			
		uint pid = numProposals[_board]++;
        Proposal p = proposals[_board][pid];
        p.name = _name;
        p.data = _data;
        p.kind = _kind;
        p.addr = _addr;
        p.from = msg.sender;
        p.value = _value;
        p.created = now;
		p.hash = sha3(_board, pid, _transactionData);
		
        Tabled(_kind, msg.sender, pid);
    }
	
	function execute(address _board, uint _pid, bytes _transactionData) public {
        Proposal p = proposals[_board][_pid];
		    
        if(!VotingSystem(BoardRoom(_board).votingSystem()).canExecute(_board, _pid))
            throw;
			
		if(p.hash != sha3(_board, _pid, _transactionData))
			throw;
        
		p.executed = true;
        numExecuted[_board] += 1;
		
		if(p.kind == 0)
			throw;
			
		if(p.kind >= 1)
			BoardRoomController(BoardRoom(_board).controller()).execute(_pid, _transactionData);	

        Executed(_pid);
	}
	
    
    function isProposal(address _board, uint _pid) public constant returns (bool) {
        Proposal p = proposals[_board][_pid];
        
        if(p.created != 0)
            return true;
    }
    
    function proposalKind(address _board, uint _pid) public returns (uint) {
        Proposal p = proposals[_board][_pid];
        
        return p.kind;
    }
    
    function proposalData(address _board, uint _pid, uint _index) public returns (bytes32) {
        Proposal p = proposals[_board][_pid];
        
        return p.data[_index];
    }
    
    function proposalAddr(address _board, uint _pid, uint _index) public returns (address) {
        Proposal p = proposals[_board][_pid];
        
        return p.addr[_index];
    }
    
    function proposalValue(address _board, uint _pid, uint _index) public returns (uint) {
        Proposal p = proposals[_board][_pid];
        
        return p.value[_index];
    }
	
	function proposalCreated(address _board, uint _pid) public returns (uint) {
		Proposal p = proposals[_board][_pid];
        
        return p.created;
	}
	
	function proposalExecuted(address _board, uint _pid) public returns(bool) {
        Proposal p = proposals[_board][_pid];
        
        return p.executed;
	}
    
	function proposalTotalVotes(address _board, uint _pid) public returns (uint){
		Proposal p = proposals[_board][_pid];
		
		return p.totalVotes;
	}
	
    function proposalVotePosition(address _board, uint _pid, uint _voteID) public returns (uint) {
        Proposal p = proposals[_board][_pid];
        
        return p.votes[_voteID].position;
    }
    
    function proposalVoteMember(address _board, uint _pid, uint _voteID) public returns (address) {
        Proposal p = proposals[_board][_pid];
        
        return p.votes[_voteID].member;
    }
    
    function proposalVoteID(address _board, uint _pid, address _member) public returns (uint) {
        Proposal p = proposals[_board][_pid];
        
        return p.toID[_member];
    }
    
    function proposalVoted(address _board, uint _pid, address _member) public returns (bool) {
        Proposal p = proposals[_board][_pid];
        
        return p.voted[_member];
    }
	
	function proposalNumValues(address _board, uint _pid) constant returns (uint) {
        Proposal p = proposals[_board][_pid];
		
		return p.value.length;	
	}
	
	function proposalNumData(address _board, uint _pid) constant returns (uint) {
        Proposal p = proposals[_board][_pid];
		
		return p.data.length;
	}
	
	function proposalNumAddress(address _board, uint _pid) constant returns (uint) {
        Proposal p = proposals[_board][_pid];
		
		return p.addr.length;
	}
	
	function proposalHash(address _board, uint _pid) constant returns (bytes32) {
        Proposal p = proposals[_board][_pid];
		
		return p.hash;
	}
}
