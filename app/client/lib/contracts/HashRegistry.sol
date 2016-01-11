contract BoardRoom {
	function amendConstitution(uint _article, address _addr){}
	function transfer_ownership(address _addr) {}
	function disolve(address _addr) {}
	function forward(address _destination, uint _value, bytes _transactionBytecode) {}
	function forward_method(address _destination, uint _value, bytes4 _methodName, bytes32[] _transactionData) {}
	
	function addressOfArticle(uint _article) constant returns (address) {}
	function implementer() constant returns (address) {}
}

contract ProposalSystem {
	function tabledBy(address _board, uint _proposalID) public constant returns(address) {}
}

contract HashRegistry {
	enum DefaultArticles {Proposals, Processor, Voting, Membership, Delegation, Token, Family, Chair, Executive}
	
	mapping(address => mapping(uint => bytes)) hashStorage;
	
	function register(address _board, uint _proposalID, bytes _hash){
		if(ProposalSystem(BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Proposals))).tabledBy(_board, _proposalID) == msg.sender)
			hashStorage[_board][_proposalID] = _hash;
	}
}