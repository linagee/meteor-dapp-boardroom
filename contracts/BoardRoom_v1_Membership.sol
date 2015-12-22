contract Standard_Token {
    function balanceOf(address _address) constant returns (uint256 balance) { }
}

contract BoardRoom {
  function chair() returns (address) {}
  function addressOfArticle(uint _article) returns (address) {}
  function membershipSystem() returns (address) {}
  function familySystem() returns (address) {}
  function proposalSystem() returns (address) {}
  function budgetSystem() returns (address) {}
  function delegationSystem() returns (address) {}
  function votingSystem() returns (address) {}
  function tokenSystem() returns (address) {}
  function executive() returns (address) {}
}

contract MembershipSystem {
  function isMember(address _board, address _addr) public returns (bool){
      if((Standard_Token(BoardRoom(_board).tokenSystem()).balanceOf(_addr) > 0
		|| _addr == BoardRoom(_board).executive())
		&& _addr != address(0))
          return true;
  }
	
	
	struct Member {
		address addr;
		uint joined;
	}
	
	event CheckedIn(address _board, address _member, uint _memberID);
	event CheckedOut(address _board, address _member, uint _memberID);

	mapping(address => Member[]) public members;
	mapping(address => mapping(address => uint)) public toID;
	
	function checkin(address _board) public returns (uint memberID){
		if(!isMember(_board, msg.sender))
			return;
			
		memberID = members[_board].length;
		toID[_board][msg.sender] = memberID;
		CheckedIn(_board, msg.sender, memberID);
	}
	
	function checkout(address _board, address _member) public {
		if(isMember(_board, _member))
			return;
			
		var mid = toID[_board][_member];
		Member m = members[_board][mid];
		m.joined = 0;
		m.addr = address(0);
		delete toID[_board][_member];
		CheckedOut(_board, _member, mid);
	}
}
