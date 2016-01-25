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
	function createdAt(address _board, uint _proposalID) public constant returns(uint) {}
	function isExecuted(address _board, uint _proposalID) public constant returns(uint) {}
}

contract AmendmentSystem {
	enum DefaultArticles {Proposals, Voting, Membership, Delegation, Token, Family, Chair, Executive}
	
    mapping(address => mapping(uint => uint)) amendments;
    mapping(address => uint) minutesToAmend;
    
    function amendProposal(address _board, uint _proposalID, uint _toProposalID) {
        if(ProposalSystem(BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Proposals))).tabledBy(_board, _proposalID) != msg.sender)
            throw;
            
        if(minutesToAmend[_board] == 0)
            minutesToAmend[_board] = 30;
            
        if(now - ProposalSystem(BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Proposals))).createdAt(_board, _proposalID) > (minutesToAmend[_board] * (1 minutes))
            || ProposalSystem(BoardRoom(_board).addressOfArticle(uint(DefaultArticles.Proposals))).isExecuted(_board, _proposalID) > 0)
            throw;
            
        amendments[_board][_proposalID] = _toProposalID;
    }
}