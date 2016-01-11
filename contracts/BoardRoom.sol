contract Constituted {
	event Amended(uint indexed _article, address indexed _addr); 
    mapping(uint => address) public constitution;
	
	function amendConstitution(uint _article, address _addr){ 
		constitution[_article] = _addr;
		Amended(_article, _addr);
	}
    
    function addressOfArticle(uint _article) public constant returns (address) {
        return constitution[_article];
    }
}

contract Proxy {
	event Forwarded(address _destination, uint _value);
	event TransferOwnership(address _new_implementer);
	
	address public implementer;
	
	function transfer_ownership(address _new_implementer) public {
		if (msg.sender == address(this) || msg.sender == implementer) {
			implementer = _new_implementer;
			TransferOwnership(_new_implementer);
		}
	}
	
	function forward(address _destination, uint _value, bytes _transactionBytecode) public {
		if (msg.sender == implementer) {
			_destination.call.value(_value)(_transactionBytecode);
			Forwarded(_destination, _value);
		}
	}
	
	function forward_method(address _destination, uint _value, bytes4 _methodName, bytes32[] _transactionData) public {
		if (msg.sender == implementer) {
			_destination.call.value(_value)(_methodName, _transactionData);
			Forwarded(_destination, _value);
		}
	}
}


contract BoardRoom is Proxy, Constituted {
	function BoardRoom(address[] _constitution) {
		implementer = _constitution[0];
		
		for(uint article; article < _constitution.length; article++)
			constitution[article] = _constitution[article];
	}
	
	function amendConstitution(uint _article, address _addr){
		if(msg.sender == address(this) || msg.sender == implementer) {
			if(_article == 0)
				transfer_ownership(_addr);
				
			Constituted.amendConstitution(_article, _addr);
		}
	}
	
	function disolve(address _addr){
		if (msg.sender == address(this) || msg.sender == implementer)
			suicide(_addr);
	}
}