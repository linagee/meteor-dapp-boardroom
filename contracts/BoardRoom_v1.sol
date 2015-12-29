import "owned";

contract VotingSystem {
    function init(){}
    function hasWon(address _board, uint _pid) returns (bool) {}
}

contract ProposalSystem {
	event Tabled(uint _kind, address _member, uint indexed _pid);
    event Executed(uint indexed _pid);
    event Voted(uint indexed _pid, address _member, uint _position);

    function init(){}
    function vote(address _board, uint _pid, uint _type) {}
    function table(address _board, string _name, uint _kind, bytes32[] _data, uint[] _value, address[] _addr, bytes _transactionData, uint _expiry) {}
    function execute(address _board, uint _pid, bytes _transactionData){}
	
	function numProposals(address _board) constant returns (uint) {}
    function numExecuted(address _board) constant returns (uint) {}
    function isProposal(address _board, uint _pid) constant returns (bool) {}
    function proposalKind(address _board, uint _pid) constant returns (uint kind) {}
    function proposalData(address _board, uint _pid, uint _index) constant returns (bytes32 data) {}
    function proposalAddr(address _board, uint _pid, uint _index) constant returns (address addr) {}
    function proposalValue(address _board, uint _pid, uint _index) constant returns (uint value) {}
    function proposalExpiry(address _board, uint _pid) constant returns (uint expiry) {}
	function proposalNumValues(address _board, uint _pid) constant returns (uint) {}
	function proposalNumData(address _board, uint _pid) constant returns (uint) {}
	function proposalNumAddress(address _board, uint _pid) constant returns (uint) {}
}

contract DelegationSystem {
	event Delegated(address _board, uint _pid, address _from);

    function init(){}
    function delegate(address _board, uint _pid, address _to) public {}
	function delegatedTo(address _board, uint _pid, address _delegator) constant returns (address) {}
	function hasDelegated(address _board, uint _pid, address _delegator) constant returns (bool) {}	
}

contract FamilySystem {
	function init(){}
	function addMember(address _board, address _member, uint _position) {}
	function removeMember(address _board, address _member) {}
	function memberPosition(address _board, uint _memberID) constant returns (uint) {}
	function memberAddress(address _board, uint _memberID) constant returns (address) {}
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
	function chair() constant returns (address) {}
	function addressOfArticle(uint _article) constant returns (address) {}
    function membershipSystem() constant returns (address) {}
    function familySystem() constant returns (address) {}
    function proposalSystem() constant returns (address) {}
    function budgetSystem() constant returns (address) {}
    function delegationSystem() constant returns (address) {}
    function votingSystem() constant returns (address) {}
    function configSystem() constant returns (address) {}
	function controller() constant returns (address) {}
	function ammendConstitution(uint _article, address _addr){}
	function disolve();
}

contract Wallet {
	function kill(address _to) {}
	function execute(address _to, uint _value, bytes _data) returns (bytes32 _r) {}
	function confirm(bytes32 _h) returns (bool) {}
}

contract MembershipSystem {
    function init(){}
    function isMember(address _board, address _addr) constant returns (bool) {}
}

contract Middleware { function execute(uint _pid){}}

contract NameReg {
	function register(bytes32 name) {}
	function unregister() {}
}

contract Constituted {
    mapping(uint => address) public constitution;
    
    function addressOfArticle(uint _article) public constant returns (address) {
        return constitution[_article];
    }
}

contract BoardRoomController is owned {
	function BoardRoomController(address _board) {
		owner = _board;
	}

	function execute(uint _pid, bytes _transactionBytecode) {
		if(msg.sender != Board(owner).proposalSystem())
            throw;
            
        uint kind = ProposalSystem(Board(owner).proposalSystem()).proposalKind(this, _pid);
        
        if(kind == 0)
            return;
			
		if(kind == 18) {
			Board(owner).disolve();
			return;
		}
			
		if(kind == 19) {
            suicide(this);
			return;
		}
		
		uint v = 0;
		for(uint a = 0; a < ProposalSystem(Board(owner).proposalSystem()).proposalNumAddress(owner, _pid); a++){
			address addr = ProposalSystem(Board(owner).proposalSystem()).proposalAddr(this, _pid, a);
			address addr1 = ProposalSystem(Board(owner).proposalSystem()).proposalAddr(this, _pid, a + 1);
			
			uint value = ProposalSystem(Board(owner).proposalSystem()).proposalValue(this, _pid, v);
			uint value1 = ProposalSystem(Board(owner).proposalSystem()).proposalValue(this, _pid, v + 1);
        	bytes32 data = ProposalSystem(Board(owner).proposalSystem()).proposalData(this, _pid, a);
		
			if(kind == 1)
				Board(owner).ammendConstitution(value, addr);
				
			if(kind == 2) 
				addr.call.value(value)(_transactionBytecode);
			
			if(kind == 3) {
				owner = addr;
				return;
			}


			if(kind == 4) {
				ProposalSystem(BoardRoom(addr).proposalSystem()).vote(addr, value, value1);
				v++;
			}

			if(kind == 5) {
				DelegationSystem(BoardRoom(addr).delegationSystem()).delegate(addr, value, addr1);
				a++;
				v++;	
			}


			if(kind == 6) {
				StandardToken(addr).transfer(value, addr1);
				a++;
			}

			if(kind == 7) {
				StandardToken(addr).transferFrom(addr, value, addr1);
				a++;	
			}

			if(kind == 8) {
				StandardToken(addr).approve(addr1);
				a++;	
			}

			if(kind == 9) {
				StandardToken(addr).approveOnce(addr1, value);
				a++;
			}


			if(kind == 10)
				FamilySystem(Board(owner).familySystem()).addMember(owner, addr, value);

			if(kind == 11)
				FamilySystem(Board(owner).familySystem()).removeMember(owner, addr);
			
			
			if(kind == 12)
				NameReg(addr).register(data);

			if(kind == 13)
				NameReg(addr).unregister();


			if(kind == 14)
				Middleware(addr).execute.value(value)(_pid);
				
			
			if(kind == 15) {
				Wallet(addr).kill(addr1);
				a++;
			}
			
			if(kind == 16) {
				Wallet(addr).execute(addr1, value, _transactionBytecode);
				a++;
			}
			
			if(kind == 17)
				Wallet(addr).confirm(data);
			
			v++;
		}
	}
}

contract BoardRoom is Board, Constituted {
    enum DefaultArticles {Membership, Proposals, Voting, Delegation, Token, Controller, Family, Chair, Executive}
    
    function BoardRoom (address[] addr) {
		for(uint i = 0; i < addr.length; i ++){
			ammendConstitution(i, addr[i]);
		}
    }
	
	function ammendConstitution(uint _article, address _addr){
		if(msg.sender != controller())
			return;
			
		constitution[_article] = _addr;
		
		if(_article == uint(DefaultArticles.Chair)){
			if(_addr == address(0))
				constitution[_article] = msg.sender;
			else
				constitution[_article] = _addr;
		}
		
		if(_article == uint(DefaultArticles.Controller)){
			if(_addr == address(0))
				constitution[_article] = address(new BoardRoomController(this));
			else
				constitution[_article] = _addr;
		}

		if(_article == uint(DefaultArticles.Voting))
			VotingSystem(_addr).init();

		if(_article == uint(DefaultArticles.Membership))
			VotingSystem(_addr).init();

		if(_article == uint(DefaultArticles.Proposals))
			VotingSystem(_addr).init();

		if(_article == uint(DefaultArticles.Delegation))
			VotingSystem(_addr).init();		

		if(_article == uint(DefaultArticles.Family))
			FamilySystem(_addr).init();
	}
	
	function disolve(){
		if(msg.sender != controller())
			return;
			
		suicide(this);
	}
    
    function chair() public constant returns (address) {
        return constitution[uint(DefaultArticles.Chair)];
    }
    
    function membershipSystem() public constant returns (address) {
        return constitution[uint(DefaultArticles.Membership)];
    }
    
    function familySystem() public constant returns (address) {
        return constitution[uint(DefaultArticles.Family)];
    }
    
    function proposalSystem() public constant returns (address) {
        return constitution[uint(DefaultArticles.Proposals)];
    }
    
    function delegationSystem() public constant returns (address) {
        return constitution[uint(DefaultArticles.Delegation)];
    }
    
    function votingSystem() public constant returns (address) {
        return constitution[uint(DefaultArticles.Voting)];
    }
    
    function tokenSystem() public constant returns (address) {
        return constitution[uint(DefaultArticles.Token)];
    }
    
    function controller() public constant returns (address) {
        return constitution[uint(DefaultArticles.Controller)];
    }
    
    function executive() public constant returns (address) {
        return constitution[uint(DefaultArticles.Executive)];
    }
}
