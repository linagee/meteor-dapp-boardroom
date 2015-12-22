contract VotingSystem {
    function init(){}
    function hasWon(address _board, uint _pid) returns (bool) {}
}

contract ProposalSystem {
	event Tabled(uint _kind, address _member, uint indexed _pid);
    event Executed(uint indexed _pid);
    event Voted(uint indexed _pid, address _member, uint _position);

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
    function proposalExpiry(address _board, uint _pid) returns (uint expiry) {}
	function proposalVoted(address _board, uint _pid, address _member) public returns (bool voted) {}
	function proposalVoteMember(address _board, uint _pid, uint _voteID) public returns (address) {}
	function proposalVoteTotal(address _board, uint _pid, uint _position) public returns (uint voteTotal) {}
	function proposalVotePosition(address _board, uint _pid, uint _voteID) public returns (uint votePosition) {}
	function proposalVoteID(address _board, uint _pid, address _member) public returns (uint voteID) {}
	function proposalTotalVotes(address _board, uint _pid) public returns (uint) {}
}

contract DelegationSystem {
	event Delegated(address _board, uint _pid, address _from);

    function init(){}
    function delegate(address _board, address _from, address _to, uint _pit) public {}
	function delegatedTo(address _board, uint _pid, address _delegator) returns (address) {}
	function hasDelegated(address _board, uint _pid, address _delegator) returns (bool) {}	
}

contract FamilySystem {
	event MemberAdded(address _board, address _member, uint _memberID);
	event MemberRemoved(address _board, address _member, uint _memberID);

    function init(){}
	function addMember(address _board, address _member, uint _position) {}
	function removeMember(address _board, address _member) {}
	function memberPosition(address _board, uint _memberID) returns (uint) {}
	function memberAddress(address _board, uint _memberID) returns (address) {}
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

contract Board {
	function chair() returns (address) {}
	function addressOfArticle(uint _article) returns (address) {}
    function membershipSystem() returns (address) {}
    function familySystem() returns (address) {}
    function proposalSystem() returns (address) {}
    function budgetSystem() returns (address) {}
    function delegationSystem() returns (address) {}
    function votingSystem() returns (address) {}
    function configSystem() returns (address) {}
	function controller() returns (address) {}
	function ammendConstitution(uint _article, address _addr){}
	function disolve();
}

contract MembershipSystem {
    function init(){}
    function isMember(address _board, address _addr) returns (bool) {}
}

contract Middleware { function execute(uint _pid){}}

contract Budgeted {
    uint public balance;
    
    function (){
        if(msg.value > 0)
            balance += msg.value;
    }
    
    function send(address _addr, uint _value) internal {
        if(balance < _value)
            return;
            
        balance -= _value;
        _addr.send(_value);
    }
}

contract NameReg {
	function register(bytes32 name) {}
	function unregister() {}
}

contract Constituted {
    mapping(uint => address) public constitution;
    
    function addressOfArticle(uint _article) returns (address) {
        return constitution[_article];
    }
}

contract BoardRoomController is Budgeted {
	address public board;

	function BoardRoomController(address _board) {
		board = _board;
	}

	function execute(uint _pid) {
		if(msg.sender != BoardRoom(board).proposalSystem())
            return;
            
        bytes32 name = ProposalSystem(BoardRoom(board).proposalSystem()).proposalName(this, _pid);
        uint kind = ProposalSystem(BoardRoom(board).proposalSystem()).proposalKind(this, _pid);
        bytes32 data = ProposalSystem(BoardRoom(board).proposalSystem()).proposalData(this, _pid, 0);
        bytes32 data1 = ProposalSystem(BoardRoom(board).proposalSystem()).proposalData(this, _pid, 1);
        uint value = ProposalSystem(BoardRoom(board).proposalSystem()).proposalValue(this, _pid, 0);
        address addr = ProposalSystem(BoardRoom(board).proposalSystem()).proposalAddr(this, _pid, 0);
        address addr1 = ProposalSystem(BoardRoom(board).proposalSystem()).proposalAddr(this, _pid, 1);
        //uint expiry = ProposalSystem(BoardRoom(board).proposalSystem()).proposalExpiry(this, _pid);
        
        if(kind == 0)
            return;
        
        if(kind == 1)
          	BoardRoom(board).ammendConstitution(value, addr);
            
        if(kind == 2)
            send(addr, value);
			
		if(kind == 3)
			BoardRoom(board).disolve();
			
		if(kind == 4)
            suicide(this);
			
		if(kind == 5)
            NameReg(addr).register(data);
            
        if(kind == 6)
            NameReg(addr).unregister();
			
		if(kind == 7)
            StandardToken(addr).transfer(value, addr1);
            
        if(kind == 8)
            StandardToken(addr).transferFrom(addr, value, addr1);
            
        if(kind == 9)
            StandardToken(addr).approve(addr1);
            
        if(kind == 10)
            StandardToken(addr).approveOnce(addr1, value);
			
		if(kind == 11)
			FamilySystem(BoardRoom(board).familySystem()).addMember(board, addr, value);
			
		if(kind == 12)
			FamilySystem(BoardRoom(board).familySystem()).removeMember(board, addr);
			
		if(kind == 13)  // make bytes32 call (used for namereg)
            addr.call(bytes4(data), data1);
            
        if(kind == 14)  // make uint call (used for value calls)
            addr.call(bytes4(data), value);
			
		if(kind == 15)
            Middleware(addr).execute.value(value)(_pid);
	}
}

contract BoardRoom is Board, Constituted {
    enum DefaultArticles {Chair, Membership, Proposals, Voting, Delegation, Token, Family, Executive, Controller}
    
    function BoardRoom (address _chair
					, address _votingSystem
                    , address _membershipSystem
                    , address _proposalSystem
                    , address _delegationSystem
                    , address _tokenSystem
                    , address _familySystem
					, address _executive) {
		if(_chair == address(0))
        	constitution[0] = msg.sender;
		else
        	constitution[0] = _chair;
		
        constitution[1] = _membershipSystem;
        constitution[2] = _proposalSystem;
        constitution[3] = _votingSystem;
        constitution[4] = _delegationSystem;
        constitution[5] = _tokenSystem;
        constitution[6] = _familySystem;
		constitution[7] = _executive;
		constitution[8] = address(new BoardRoomController(this));
        
        VotingSystem(_votingSystem).init();
        MembershipSystem(_membershipSystem).init();
        ProposalSystem(_proposalSystem).init();
        DelegationSystem(_delegationSystem).init();
        FamilySystem(_familySystem).init();
    }
	
	function ammendConstitution(uint _article, address _addr){
		if(msg.sender != controller())
			return;
			
		constitution[_article] = _addr;
	}
	
	function disolve(){
		if(msg.sender != controller())
			return;
			
		suicide(this);
	}
    
    function chair() public returns (address) {
        return constitution[uint(DefaultArticles.Chair)];
    }
    
    function membershipSystem() public returns (address) {
        return constitution[uint(DefaultArticles.Membership)];
    }
    
    function familySystem() public returns (address) {
        return constitution[uint(DefaultArticles.Family)];
    }
    
    function proposalSystem() public returns (address) {
        return constitution[uint(DefaultArticles.Proposals)];
    }
    
    function delegationSystem() public returns (address) {
        return constitution[uint(DefaultArticles.Delegation)];
    }
    
    function votingSystem() public returns (address) {
        return constitution[uint(DefaultArticles.Voting)];
    }
    
    function tokenSystem() public returns (address) {
        return constitution[uint(DefaultArticles.Token)];
    }
    
    function controller() public returns (address) {
        return constitution[uint(DefaultArticles.Controller)];
    }
    
    function executive() public returns (address) {
        return constitution[uint(DefaultArticles.Executive)];
    }
}
