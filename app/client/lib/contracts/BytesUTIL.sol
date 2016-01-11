contract BytesUTIL {
	function numToBytes(uint a) constant returns (bytes32) {
		return bytes32(a);
	}
	
	function addressToBytes(address a) constant returns (bytes32) {
		return bytes32(a);
	}
}