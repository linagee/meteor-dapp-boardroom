contract Standard_Token {
    function balanceOf(address _address) constant returns (uint256 balance) { }
}

contract BoardRoom {
	function amendConstitution(uint _article, address _addr){}
	function transfer_ownership(address _addr) {}
	function disolve(address _addr) {}
	function forward(address _destination, uint _value, bytes _transactionBytecode) {}
	function forward_method(address _destination, uint _value, bytes4 _methodName, bytes32[] _transactionData) {}
	
	function addressOfArticle(uint _article) constant returns (address) {}
	function implementer() constant returns (address) {}
}

contract MembershipSystem {
    function init(){}
    function isMember(address _board, address _addr) returns (bool) {}
}

contract MembershipRegistry {
	enum DefaultArticles {Proposals, Processor, Voting, Membership, Delegation, Token, Family, Chair, Executive}
	
	struct Member {
		address addr;
		uint joined;
	}
	
	event Registered(address _board, address _member, uint _memberID);
	event Unregistered(address _board, address _member, uint _memberID);

	mapping(address => Member[]) public members;
	mapping(address => uint) public numMembers;
	mapping(address => mapping(address => uint)) public toID;
	
	function register(address _board) public returns (uint memberID){
		if(!MembershipSystem(BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Membership))).isMember(_board, msg.sender))
			return;
			
		memberID = members[_board].length++;
		numMembers[_board] += 1;
		members[_board][memberID] = Member({addr: msg.sender, joined: now});
		toID[_board][msg.sender] = memberID;
		Registered(_board, msg.sender, memberID);
	}
	
	function deregister(address _board, address _member) public {
		if(MembershipSystem(BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Membership))).isMember(_board, _member))
			return;
			
		var memberID = toID[_board][_member];
		Member m = members[_board][memberID];
		
		if(m.joined == 0)
			return;
		
		m.joined = 0;
		m.addr = address(0);
		numMembers[_board] -= 1;
		delete toID[_board][_member];
		Unregistered(_board, _member, memberID);
	}
	
	function addressOf(address _board, uint _memberID) public constant returns (address) {
		return members[_board][_memberID].addr;
	}
	
	function idOf(address _board, address _member) public constant returns (uint) {
		return toID[_board][_member];
	}
	
	function totalMembers(address _board) public constant returns (uint){
		return members[_board].length;
	}
}