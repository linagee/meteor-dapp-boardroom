//sol NameReg
// Simple global name registrar.
// @authors:
//   Gav Wood <g@ethdev.com>
import "service";
import "owned";

contract NameReg is service(1), owned {
  	event AddressRegistered(address indexed account);
  	event AddressDeregistered(address indexed account);
  	
	function register(bytes32 name) public {
		// Don't allow the same name to be overwritten.
		if (toAddress[name] != address(0))
			return;
		// Unregister previous name if there was one.
		if (toName[msg.sender] != "")
			toAddress[toName[msg.sender]] = 0;
			
		AddressRegistered(msg.sender);
		toName[msg.sender] = name;
		toAddress[name] = msg.sender;
	}

	function unregister() public {
		bytes32 n = toName[msg.sender];
		if (n == "")
			return;
			
		AddressDeregistered(toAddress[n]);
		toName[msg.sender] = "";
		toAddress[n] = address(0);
	}
	
	mapping (address => bytes32) public toName;
	mapping (bytes32 => address) public toAddress;
	
	function addressOf(bytes32 _name) public constant returns (address){
		return toAddress[_name];
	}
	
	function nameOf(address _addr) public constant returns (bytes32){
		return toName[_addr];
	}
}