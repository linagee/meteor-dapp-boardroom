contract FamilySystem {
	struct FamilyMember {
		uint position;
		address member;
	}
	
	mapping(address => FamilyMember[]) public members;
	mapping(address => mapping(address => uint)) public toID;
	mapping(address => mapping(uint => address)) public toMember;
	mapping(address => mapping(address => bool)) public isMember;
	mapping(address => uint) public numMembers;
	
	event MemberAdded(address _board, address _member, uint _memberID);
	event MemberRemoved(address _board, address _member, uint _memberID);

	function addMember(address _member, uint _type) public returns (uint memberID) {
		memberID = members[msg.sender].length;
		numMembers[msg.sender] += 1;
		toID[msg.sender][_member] = memberID;
		toMember[msg.sender][memberID] = _member;
		isMember[msg.sender][_member] = true;
		members[msg.sender][memberID] = FamilyMember({position: _type, member: _member});
		MemberAdded(msg.sender, _member, memberID);
	}
	
	function removeMember(address _member) public {
		var memberID = toID[msg.sender][_member];
		FamilyMember m = members[msg.sender][memberID];
		m.position = 0;
		m.member = address(0);
		numMembers[msg.sender] -= 1;
		delete toID[msg.sender][_member];
		delete toMember[msg.sender][memberID];
		isMember[msg.sender][_member] = false;
		MemberRemoved(msg.sender, _member, memberID);
	}
	
	function totalMembers(address _board) public constant returns (uint) {		
		return members[_board].length;
	}
	
	function memberPosition(address _board, uint _memberID) public constant returns (uint) {
		FamilyMember m = members[_board][_memberID];
		
		return m.position;
	}
	
	function memberAddress(address _board, uint _memberID) public constant returns (address) {
		FamilyMember m = members[_board][_memberID];
		
		return m.member;
	}
}