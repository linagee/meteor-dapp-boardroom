contract MembershipSystem {
    function init(){}
    function isMember(address _board, address _addr) returns (bool) {}
}

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
    function budgetSystem() returns (address) {}
    function delegationSystem() returns (address) {}
    function votingSystem() returns (address) {}
	function tokenSystem() returns (address){}
	function controller() returns (address){}
}

contract StandardToken {
    function isApprovedOnceFor(address _target, address _proxy) constant returns (uint _maxValue) {}
    function isApprovedFor(address _target, address _proxy) constant returns (bool _r) {}
    function balanceOf(address _addr) constant returns (uint _r) {}
    function transfer(uint _value, address _to) returns (bool _success) {}
    function transferFrom(address _from, uint _value, address _to) returns (bool _success) {}
    function approve(address _addr) returns (bool _success) {}
    function unapprove(address _addr) returns (bool _success) {}
    function approveOnce(address _addr, uint256 _maxValue) returns (bool _success) {}
}

contract FamilySystem {
	event MemberAdded(address _board, address _member, uint _memberID);
	event MemberRemoved(address _board, address _member, uint _memberID);
	
	function addMember(address _board, address _member, uint _type) returns (uint memberID) {}
	function removeMember(address _board, address _member) {}
	function memberPosition(address _board, uint _memberID) returns (uint) {}
	function memberAddress(address _board, uint _memberID) returns (address) {}
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
	function canVote(address _board, uint _pid, address _member) returns (bool) {}
}

contract BoardRoomController {
	function board() returns (address){}
	function execute(uint _pid) {}
}

contract ProposalSystem is VotingSystem, ProposableConfig {
	struct Proposal {
        bytes32 name;
        bytes32[] data;
        address[] addr;
        uint[] value;
        address from;
        uint kind;	
        uint expiry;
        bool executed;
        uint created;
		
        Vote[] votes;
        uint numVoters;
        mapping(uint => uint) voteTotal;
        mapping(address => bool) voted;
		mapping(address => uint) toID;
		
        uint numFor;
        uint numAgainst;
        uint totalVotes;
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
			return;
			
        Proposal p = proposals[_board][_pid];
			
		p.totalVotes++;
		voteID = p.votes.length++;
		p.votes[voteID] = Vote({position: _position, member: msg.sender});
		p.voted[msg.sender] = true;
		p.numVoters += 1;
		Voted(_pid, msg.sender, _position);
	}
	
	function table(address _board, bytes32 _name, bytes32[] _data, 
					uint _kind, uint[] _value, address[] _addr, uint _expiry) public {		
		if(!MembershipSystem(BoardRoom(_board).membershipSystem()).isMember(_board, msg.sender))
			return;
    
		if(_expiry != 0 && _expiry < now) // invalid expiry
            return;
			
		uint pid = numProposals[_board]++;
        Proposal p = proposals[_board][pid];
        p.name = _name;
        p.data = _data;
        p.kind = _kind;
        p.addr = _addr;
        p.from = msg.sender;
        p.value = _value;
        p.created = now;
        p.expiry = _expiry;
        Tabled(_kind, msg.sender, pid);
    }
	
	function execute(address _board, uint _pid) public {
        Proposal p = proposals[_board][_pid];
            
        if(!VotingSystem(BoardRoom(_board).votingSystem()).hasWon(_board, _pid))
            return;
		
		if(p.executed || p.expiry < now)
			return;
			
		/*for(uint i = 0; i < p.votes.length; i++) {
			if(p.votes[i].position == 0)
				p.voteTotal[0] += StandardToken(BoardRoom(_board).tokenSystem()).balanceOf(p.votes[i].member);
			else
				p.voteTotal[1] += StandardToken(BoardRoom(_board).tokenSystem()).balanceOf(p.votes[i].member);
		}*/
        
        Executed(_pid);
		p.executed = true;
        numExecuted[_board] += 1;
		
		if(p.kind == 0)
			return;
			
		if(p.kind >= 1)
			BoardRoomController(BoardRoom(_board).controller()).execute(_pid);		
	}
    
    function isProposal(address _board, uint _pid) public returns (bool) {
        Proposal p = proposals[_board][_pid];
        
        if(p.created != 0)
            return true;
    }
    
    function proposalName(address _board, uint _pid) public returns (bytes32) {
        Proposal p = proposals[_board][_pid];
        
        return p.name;
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
    
    function proposalExpiry(address _board, uint _pid) public returns(uint) {
        Proposal p = proposals[_board][_pid];
        
        return p.expiry;
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
    
    function proposalVoteTotal(address _board, uint _pid, uint _position) public returns (uint voteTotal) {
        Proposal p = proposals[_board][_pid];
		
		for(uint i = 0; i < p.votes.length; i++) {
			if(p.votes[i].position == _position)
				voteTotal += StandardToken(BoardRoom(_board).tokenSystem()).balanceOf(p.votes[i].member);
		}
        
        return voteTotal;
    }
}
