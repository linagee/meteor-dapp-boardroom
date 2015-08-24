//sol NameReg
// Simple global name registrar.
// @authors:
//   Gav Wood <g@ethdev.com>

contract NameRegister {
	function getAddress(bytes32 _name) constant returns (address o_owner) {}
	function getName(address _owner) constant returns (bytes32 o_name) {}
}

import "service";
import "owned";

contract NameReg is service(1), owned, NameRegister {
  	event AddressRegistered(address indexed account);
  	event AddressDeregistered(address indexed account);

	function register(bytes32 name) {
		// Don't allow the same name to be overwritten.
		if (toAddress[name] != address(0))
			return;
		// Unregister previous name if there was one.
		if (toName[msg.sender] != "")
			toAddress[toName[msg.sender]] = 0;
			
		toName[msg.sender] = name;
		toAddress[name] = msg.sender;
		AddressRegistered(msg.sender);
	}

	function unregister() {
		bytes32 n = toName[msg.sender];
		
		if (n == "")
			return;
			
		toName[msg.sender] = "";
		toAddress[n] = address(0);
		AddressDeregistered(msg.sender);
	}

	function addressOf(bytes32 name) constant returns (address addr) {
		return toAddress[name];
	}

	function nameOf(address addr) constant returns (bytes32 name) {
		return toName[addr];
	}
	
	mapping (address => bytes32) toName;
	mapping (bytes32 => address) toAddress;
}
    