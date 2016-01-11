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
	enum DefaultArticles {Proposals, Processor, Voting, Membership, Delegation, Token, Family, Chair, Executive}
	
    function isMember(address _board, address _addr) public constant returns (bool){
        if((Standard_Token(BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Token))).balanceOf(_addr) > 0
			|| _addr == BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Executive)))
			&& _addr != address(0))
            return true;
    }
}