contract ProcessingSystem {
	function methodName(uint _kind) public constant returns (bytes4) {
		string memory name;
			
		// BOARDROOM & EXECUTION
		if(_kind == 1)
			name = "amendConstitution(uint256,address)";
			
		if(_kind == 2)
			name = "transfer_ownership(address)";

		if(_kind == 3)
			name = "disolve(address)";

		if(_kind == 4)
			name = "execute(uint256)";
			

		// VOTING & DELEGATION
		if(_kind == 5)
			name = "vote(address,uint256,uint256)";

		if(_kind == 6)
			name = "delegate(address,uint256,address)";
			

		// TOKENS
		if(_kind == 7)
			name = "approve(address)";

		if(_kind == 8)
			name = "transferFrom(address,uint256,address)";

		if(_kind == 9)
			name = "transfer(uint256,address)";

		if(_kind == 10)
			name = "approveOnce(address,uint256)";
			

		// FAMILY
		if(_kind == 11)
			name = "addMember(address,uint256)";

		if(_kind == 12)
			name = "removeMember(address)";
		
		return bytes4(sha3(name));
	}
	
	function expectedDataLength(uint _kind) public constant returns (uint) {
		// BOARDROOM & EXECUTION
		if(_kind == 1)
			return 2; //name = "amendConstitution(uint256,address)";
			
		if(_kind == 2)
			return 1; //name = "transfer_ownership(address)";

		if(_kind == 3)
			return 1; //name = "disolve(address)";

		if(_kind == 4)
			return 1; //name = "execute(uint256)";
			

		// VOTING & DELEGATION
		if(_kind == 5)
			return 3; //name = "vote(address,uint256,uint256)";

		if(_kind == 6)
			return 3; //name = "delegate(address,uint256,address)";
			

		// TOKENS
		if(_kind == 7)
			return 1; //name = "approve(address)";

		if(_kind == 8)
			return 3; //name = "transferFrom(address,uint256,address)";

		if(_kind == 9)
			return 2; //name = "transfer(uint256,address)";

		if(_kind == 10)
			return 2; //name = "approveOnce(address,uint256)";
			

		// FAMILY
		if(_kind == 11)
			return 2; //name = "addMember(address,uint256)";

		if(_kind == 12)
			return 1; //name = "removeMember(address)";
			
		return 0;
	}
}