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
	function canTable(address _board, uint _kind, address _member) constant returns (bool) {}
	function canVote(address _board, uint _proposalID, address _member) constant returns (bool) {}
	function canExecute(address _board, uint _proposalID, address _member) constant returns (bool) {}
}

contract ProcessingSystem {
	function methodName(uint _kind) public constant returns (bytes4) {}
	function expectedDataLength(uint _kind) public constant returns (uint) {}
}

contract ProposalSystem {
	enum DefaultArticles {Proposals, Processor, Voting, Membership, Delegation, Token, Family, Chair, Executive}
	
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
	
	event Tabled(uint _kind, address _member, uint indexed _proposalID);
	event Executed(uint indexed _proposalID);
	event Voted(uint indexed _proposalID, address _member, uint _position);
	
	mapping(address => uint) public numExecuted;
	mapping(address => uint) public numProposals;
	mapping(address => mapping(uint => Proposal)) public proposals;
	
	function vote(address _board, uint _proposalID, uint _position) public returns (uint voteID) {
		if(!VotingSystem(BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Voting))).canVote(_board, _proposalID, msg.sender))
			throw;
			
      	Proposal p = proposals[_board][_proposalID];
			
		p.totalVotes++;
		voteID = p.votes.length++;
		p.votes[voteID] = Vote({position: _position, member: msg.sender});
		p.voted[msg.sender] = true;
		p.toID[msg.sender] = voteID;
		
		Voted(_proposalID, msg.sender, _position);
	}
	
	function table(address _board, string _name, uint _kind,
				bytes32[] _data, uint[] _value, address[] _addr, 
				bytes _transactionBytecode) public {			
		if(!VotingSystem(BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Voting))).canTable(_board, _kind, msg.sender)
			|| _addr.length != _value.length)
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
		p.hash = sha3(_board, pid, _transactionBytecode);
		
        Tabled(_kind, msg.sender, pid);
    }
	
	function execute(address _board, uint _proposalID, bytes _transactionBytecode) public {
        Proposal p = proposals[_board][_proposalID];
		    
        if(!VotingSystem(BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Voting))).canExecute(_board, _proposalID, msg.sender)
			|| p.hash != sha3(_board, _proposalID, _transactionBytecode)
			|| p.kind == 0)
			throw;
        
		p.executed = true;
        numExecuted[_board] += 1;
		
		uint d = 0;
		uint length;
		bytes4 name;
		
		if(p.kind >= 1) {
			length = ProcessingSystem(BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Processor))).expectedDataLength(p.kind);
			name = ProcessingSystem(BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Processor))).methodName(p.kind);
		}
		
		for(uint a = 0; a < p.addr.length; a ++) {
			if(p.kind == 0)
				BoardRoom(_board).forward(p.addr[a], p.value[a], _transactionBytecode);
			
			if(p.kind >= 1) {
				bytes32[] memory assembly;
				
				for(uint i = d; i < (a + 1) * length; i++) {
					assembly[d] = p.data[d];
					d += i;
				}
			
				BoardRoom(_board).forward_method(p.addr[a], p.value[a], name, assembly);
			}
		}
			
        Executed(_proposalID);
	}
	
    
    function checkProposalCode(address _board, uint _proposalID, bytes _transactionBytecode) public constant returns (bool) {
        Proposal p = proposals[_board][_proposalID];
        
        if(p.hash == sha3(_board, _proposalID, _transactionBytecode))
            return true;
    }
	
	function tabledBy(address _board, uint _proposalID) public constant returns (address) {
        Proposal p = proposals[_board][_proposalID];
        
        return p.from;
	}
    
    function kindOf(address _board, uint _proposalID) public constant returns (uint) {
        Proposal p = proposals[_board][_proposalID];
        
        return p.kind;
    }
	
    
    function dataAt(address _board, uint _proposalID, uint _index) public constant returns (bytes32) {
        Proposal p = proposals[_board][_proposalID];
        
        return p.data[_index];
    }
    
    function addressAt(address _board, uint _proposalID, uint _index) public constant returns (address) {
        Proposal p = proposals[_board][_proposalID];
        
        return p.addr[_index];
    }
    
    function valueAt(address _board, uint _proposalID, uint _index) public constant returns (uint) {
        Proposal p = proposals[_board][_proposalID];
        
        return p.value[_index];
    }
	
	
	function hashOf(address _board, uint _proposalID) public constant returns (bytes32) {
        Proposal p = proposals[_board][_proposalID];
		
		return p.hash;
	}
	
	function createdAt(address _board, uint _proposalID) public constant returns (uint) {
		Proposal p = proposals[_board][_proposalID];
        
        return p.created;
	}
	
	function isExecuted(address _board, uint _proposalID) public constant returns(bool) {
        Proposal p = proposals[_board][_proposalID];
        
        return p.executed;
	}
    
	function voteCountOf(address _board, uint _proposalID) public constant returns (uint){
		Proposal p = proposals[_board][_proposalID];
		
		return p.totalVotes;
	}
	
    function positionOf(address _board, uint _proposalID, uint _voteID) public constant returns (uint) {
        Proposal p = proposals[_board][_proposalID];
        
        return p.votes[_voteID].position;
    }
    
    function memberOf(address _board, uint _proposalID, uint _voteID) public constant returns (address) {
        Proposal p = proposals[_board][_proposalID];
        
        return p.votes[_voteID].member;
    }
    
    function idOf(address _board, uint _proposalID, address _member) public constant returns (uint) {
        Proposal p = proposals[_board][_proposalID];
        
        return p.toID[_member];
    }
    
    function hasVoted(address _board, uint _proposalID, address _member) public constant returns (bool) {
        Proposal p = proposals[_board][_proposalID];
        
        return p.voted[_member];
    }
	
	
	function numValuesIn(address _board, uint _proposalID) public constant returns (uint) {
        Proposal p = proposals[_board][_proposalID];
		
		return p.value.length;	
	}
	
	function numDataIn(address _board, uint _proposalID) public constant returns (uint) {
        Proposal p = proposals[_board][_proposalID];
		
		return p.data.length;
	}
	
	function numAddressesIn(address _board, uint _proposalID) public constant returns (uint) {
        Proposal p = proposals[_board][_proposalID];
		
		return p.addr.length;
	}
}
