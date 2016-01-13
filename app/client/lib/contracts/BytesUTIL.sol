contract BytesUTIL {
	function numToBytes(uint a) constant returns (bytes32) {
		return bytes32(a);
	}
	
	function addressToBytes(address a) constant returns (bytes32) {
		return bytes32(a);
	}
	
	function bytes32ToBytes4(bytes32 a) constant returns (bytes4) {
		return bytes4(a);
	}
}