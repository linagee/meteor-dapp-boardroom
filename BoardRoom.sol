// sol BoardRoom
// The core BoardRoom contract.
// Recommended gas: 3000000
// @authors:
//   Nick Dodson <thenickdodson@gmail.com>
contract Membered {
    struct Member{
        uint permission;
        address addr;
        uint joined;
    }
    
    uint public numMembers;
    uint public numMembersActive;
    mapping(uint => Member) public members; //id => Member
    mapping(address => uint) public toMember; //address => id
    
    function addMember(address _addr, uint _permission) internal {
        if(_addr == address(0))
            return;
        
        Member m = members[toMember[_addr]];

		//if(m.addr != address(0))
		//	return;
        
        Member newM = members[numMembers];
        newM.addr = _addr;
        newM.joined = now;
        newM.permission = _permission;
        toMember[_addr] = numMembers;
        numMembers += 1;
        numMembersActive += 1;
    }
    
    function removeMember(uint _mid) internal isMid(_mid) {
        Member m = members[_mid];
        
        //numMembers -= 1; //remove this
        numMembersActive -= 1;
        m.addr = 0;
        toMember[m.addr] = 0;
    }
    
    function changePermission(uint _mid, uint _permission) internal isMid(_mid) {
        Member m = members[_mid];
        m.permission = _permission;
    }
    
    function changeAddress(uint _mid, address _addr) internal isMid(_mid)  {
        Member m = members[_mid];
        
        if(m.addr == msg.sender && _addr != address(0)) {
            m.addr = _addr;
            toMember[_addr] = _mid;
		}
    }
    
    function getMemberAddress(uint _mid) isMid(_mid) returns (address a) {
        Member m = members[_mid];
        
        return m.addr;   
    }
    
    function getMemberUint(uint _mid, bytes32 _param) isMid(_mid) returns (uint u) {
        Member m = members[_mid];
        
        if(_param == "joined")
            return m.joined;
            
        if(_param == "permission")
            return m.permission;
    }
    
    modifier isMid (uint _mid)  {
        Member m = members[_mid];
        if(m.addr != address(0)) _
    }
    
    modifier isMember { 
        Member m = members[toMember[msg.sender]]; 
        if(m.addr == msg.sender) _
    }
}

contract Budgeted {
    uint public balance;
    
    function (){
        if(msg.value > 0)
            balance += msg.value;
    }
    
    function send(address _addr, uint _value) internal {
        if(balance < _value)
            return;
            
        balance -= _value;
        _addr.send(_value);
    }
}

contract Family {
    uint public numChildren;
    uint public numChildrenActive;
    address public parent;
    mapping(uint => address) public children; // sub-board to address;
    
    function addChild(address _addr) internal {
        if(_addr != address(0)) {
            children[numChildren] = _addr;
            numChildren += 1;
            numChildrenActive += 1;
        }
    }
    
    function setParent(address _parent) internal {
        parent = _parent;
    }
    
    function removeChild(uint _cid) internal {
        children[_cid] = address(0);
        numChildrenActive -= 1;
    }
}

contract Configable {
    address public configAddr;
    bool public configOverride;
    
    function setConfig(address _addr) internal {
        configAddr = _addr;
    }
}

contract ProposableConfig { 
    function onExecute(uint _pid) {} 
    function onProposal(uint _pid) {} 
    function onVote(uint _pid) {}
}

contract Proposable is Configable {
    struct Vote {
        uint weight;
        bool kind;
        uint created;
    }

    struct Proposal {
        bytes32 name;
        bytes32 data;
        address addr;
        uint from;
        uint value;
        uint numVoters;
        uint numVotes;
        uint numFor;
        uint numAgainst;
        bool executed;
        uint kind;
        uint numMembers;
        uint created;
        uint expiry;
        mapping(uint => mapping(bool => uint)) votes;
        // mapping(uint => Vote) votes;
    }
    
    uint public numProposals;
    uint public numExecuted;
    mapping(uint => Proposal) public proposals; //pid => Proposal
    
    event onProposal(uint _kind, uint _from); // remove _pid, change _by to _from
    event onExecute(uint indexed _pid);
    event onVote(uint indexed _pid, uint _from);
    
    function addProposal(bytes32 _name, bytes32 _data, uint _kind
    , address _addr, uint _from, uint _value, uint _numMembers, uint _expiry) internal {
        if(_expiry != 0 && _expiry < now) // invalid expiry
            return;
    
        Proposal p = proposals[numProposals];
        p.name = _name;
        p.data = _data;
        p.kind = _kind;
        p.addr = _addr;
        p.from = _from;
        p.value = _value;
        p.created = now;
        p.numMembers = _numMembers;
        p.expiry = _expiry;
        onProposal(_kind, _from);
        
        if(configAddr != address(0) && !configOverride)
            ProposableConfig(configAddr).onProposal(numProposals);
            
        numProposals += 1;
    }
    
    function addVote(uint _pid, uint _from, bool _type, uint _weight) internal notExecuted(_pid) {
        Proposal p = proposals[_pid];
        
        if(p.votes[_from][true] != 0 || p.votes[_from][false] != 0 || p.executed) // || (p.expiry != 0 && p.expiry > now)
            return;
        
        // TODO
        // Vote v = p.votes[_from];
        // v.weight = _weight;
        // v.created = now;
        // v.kind = _type;
            
        p.numVoters += 1;
        p.numVotes += _weight;
        p.votes[_from][_type] = _weight;
        onVote(_pid, _from);
        
        if(_type)
            p.numFor += _weight;
        else
            p.numAgainst += _weight;
    
        if(configAddr != address(0) && !configOverride)
            ProposableConfig(configAddr).onVote(_pid);
    }
    
    /*
    function getVote(uint _pid, uint _from) returns (uint weight, bool kind, uint created) isPid(_pid) {
        Vote v = proposals[_pid].votes[_from];
        weight = v.weight;
        kind = v.kind;
        created = v.created;
    }
    */
    
    function execute(uint _pid) notExecuted(_pid) {
        onExecute(_pid);
        Proposal p = proposals[_pid];
        p.executed = true;
        numExecuted += 1;
        
        if(configAddr != address(0) && !configOverride)
            ProposableConfig(configAddr).onExecute(_pid);
    }
    
    function isPid(uint _pid) internal returns (bool w) {
        if(_pid >= 0 && _pid <= numProposals)
            return true;
    }
    
    modifier notExecuted(uint _pid) { 
        Proposal p = proposals[_pid];
        if(isPid(_pid) && p.executed == false) _ 
    }
    
    modifier isProposal(uint _pid) {
        Proposal p = proposals[_pid];
        if(isPid(_pid)) _
    }
}

contract Delegatable is Membered, Proposable {
    struct Delegation {
        bool delegated;
        uint numDelegations;
        uint to;
    }
    mapping(uint => mapping(uint => Delegation)) public delegations; // pid => memberID to Delegation

    event onDelegate(uint indexed _pid, uint _from, uint _to);
    
    function delegate(uint _to, uint _pid) isMember isMid(_to) {
        uint memberId = toMember[msg.sender];
        Delegation d = delegations[_pid][memberId];
        
        if(d.delegated == false 
        && proposals[_pid].created > members[_to].joined // Member joined before proposal was created
        && proposals[_pid].created > members[memberId].joined // Member joined before proposal was created
        && _to != memberId
        //&& (proposals[_pid].expiry == 0 || proposals[_pid].expiry < now)
        && isPid(_pid)) { // is member
            d.delegated = true;
            d.to = _to;
            Delegation dTo = delegations[_pid][_to];
            dTo.numDelegations += d.numDelegations + 1;
            onDelegate(_pid, memberId, _to);
        }
    }
    
    function getDelegationType(uint _pid, uint _to) returns (bool b) {
        Delegation d = delegations[_pid][_to];
        
        return d.delegated;
    }
    
    function getDelegationNumDelegations(uint _pid, uint _to) returns (uint u){
        Delegation d = delegations[_pid][_to];
        
        return d.numDelegations;
    }
}

contract Democracy is Membered, Proposable, Delegatable {
    function Democracy(){
        addMember(msg.sender, 0);
    }

    function table(bytes32 _name, bytes32 _data, uint _kind
    , address _addr, uint _value, uint _expiry) isMember {
        uint memberId = toMember[msg.sender];
        addProposal(_name,  _data, _kind, _addr, memberId, _value, numMembers, _expiry);
    }
    
    function vote(uint _pid, bool _type) isMember notExecuted(_pid) {
        uint memberId = toMember[msg.sender];
        Proposal p = proposals[_pid];
        Delegation d = delegations[_pid][memberId];
        
        if(d.delegated == false && p.created > members[memberId].joined) // weight by delegation
            addVote(_pid, memberId, _type, 1 + d.numDelegations);
    }
    
    function execute(uint _pid) isMember notExecuted(_pid){
        Proposable.execute(_pid);
    }
}

contract Chaired is Membered {
    uint public chair;
    
    function changeChair(uint _mid) internal isMid(_mid) {
        chair = _mid;
    }
    
    modifier isChair {
        uint mid = toMember[msg.sender];
        Member m = members[mid]; 
        if(m.addr == msg.sender && mid == chair) _
    }
}

contract Middleware { function execute(uint _pid){}}

contract BoardRoom is Chaired, Budgeted, Family, Democracy {
    function hasWon(uint _pid) isMember isProposal(_pid) returns (bool) {
        Proposal p = proposals[_pid];
        Member m = members[p.from];
        
        if((p.votes[toMember[parent]][false] == 0) && // parent didn't vote against
        ((p.numMembers % 2 == 1 && p.numFor > p.numMembers/2) // uneven majority
            || (p.votes[toMember[parent]][true] >= 1) // tabler is parent that voted for
            || (m.permission == p.kind && p.kind != 0) // tabler has permission
            || (m.addr == parent) // tabler is parent
            || (p.kind == 3 && p.value == p.from) // member resigning
            || (p.kind == 12 && p.from == p.value) // change your own address
            || (p.numMembers % 2 == 0 && (p.numFor > p.numMembers/2 // even split
                || (p.numFor == p.numMembers/2 && p.votes[chair][true] >= 1))))) //so chair splits
            return true;
            
            //TODO, update with new vote struct object.
    }
    
    function setConfigOverride(bool _b) isChair {
        configOverride = _b;
    }
    
    function setParent(address _addr) internal {
        Family.setParent(_addr);
        addMember(_addr, 0);
    }
    
    function execute(uint _pid) isMember notExecuted(_pid){
        Proposal p = proposals[_pid];
        
        if(!hasWon(_pid))
            return;
        
        if(p.kind == 1) // send funds
            send(p.addr, p.value);
    
        if(p.kind == 2) // add board member
            addMember(p.addr, p.value);
            
        if(p.kind == 3) // remove board member
            removeMember(p.value);
            
        if(p.kind == 4)  // elect new chair
            changeChair(p.value);
            
        if(p.kind == 5) // add sub-commitee
            addChild(p.addr);
            
        if(p.kind == 6) // remove sub-commitee
            removeChild(p.value);
            
        if(p.kind == 7) // set new parent board
            setParent(p.addr);
            
        if(p.kind == 8)  // make bytes32 call (used for namereg)
            p.addr.call(bytes4(p.name), p.data);
            
        if(p.kind == 9)  // make uint call (used for value calls)
            p.addr.call(bytes4(p.name), p.value);
            
        if(p.kind == 10) // suicide board and send funds
            suicide(this);
        
        if(p.kind == 11) // change a members permissions
            changePermission(toMember[p.addr], p.value);
        
        if(p.kind == 12) // change a members address
            changeAddress(p.value, p.addr);
        
        if(p.kind == 13) // set configuration address
            setConfig(p.addr);
            
        if(p.kind == 14) // Transact with proposal specific middleware
            Middleware(p.addr).execute.value(p.value)(_pid);
        
        Democracy.execute(_pid);
    }
    
    function getProposalBytes(uint _pid, bytes32 _param) returns (bytes32 b){ 
        Proposal p = proposals[_pid];

        if(_param == "name")
            return p.name;

        if(_param == "data")
            return p.data;

        if(_param == "addr")
            return bytes32(p.addr);
    }
    
    function getProposalAddress(uint _pid) returns (address a) {
        Proposal p = proposals[_pid];

        return p.addr;
    }
            
    function getProposalUint(uint _pid, bytes32 _param)  returns (uint u){ 
        Proposal p = proposals[_pid];      

        if(_param == "from")
            return p.from;

        if(_param == "value")
            return p.value;

        if(_param == "numVoters")
            return p.numVoters;

        if(_param == "numVotes")
            return p.numVotes;

        if(_param == "numFor")
            return p.numFor;

        if(_param == "numAgainst")
            return p.numAgainst;

        if(_param == "kind")
            return p.kind;

        if(_param == "numMembers")
            return p.numMembers;

        if(_param == "created")
            return p.created;

        if(_param == "expiry")
            return p.expiry;
    }
            
    function getProposalExecuted(uint _pid)  returns (bool b){ 
        Proposal p = proposals[_pid];      

        return p.executed;
    }
}          


/*

60bd3360008081828373ffffffffffffffffffffffffffffffffffffffff8616851460cb575b5050505073ffffffffffffffffffffffffffffffffffffffff8216600081815260036020818152604080842080548552600280845282862086548752928620600180820180547fffffffffffffffffffffffff0000000000000000000000000000000000000000168c17905542928201929092558881558654978752949093528590559381018355805481019055815b505050505050565b611f84806100d06000396000f35b60b556007c01000000000000000000000000000000000000000000000000000000006000350463013cf08b811461017b5780630c4f2842146102085780631128bbfd146102a4578063117fc2ae146102d75780631ae99af0146102fe5780631bd85e301461034a5780632448ec051461036c5780632ed5e072146103ca578063400e3949146103d45780634698d110146103de5780635c820c96146103e85780635ca9a4d5146104085780635daf08ca146105bc57806360f96a8f146105fa5780636772b2f31461061a5780637002ce421461063357806375eeadc314610662578063777b17c0146106bc5780639029444a146106c65780639501ed3014610713578063ac6113451461074b578063b69ef8a814610772578063c9d27afe1461077c578063d6f6ecb6146107d7578063d9a34952146107fc578063da28850414610857578063de42b26014610861578063e19077fb1461086b578063fdf893f5146108ce578063fe0d94c1146108d8576109286000341161092e57610937565b600d60208190526004803560009081526040902080546001820154600283015460038401549484015460058501546006860154600787015460088801546009890154600a8a0154600b8b0154600c8c01549b909d01546109399d9a9c999b73ffffffffffffffffffffffffffffffffffffffff9099169a9798969795969495939460ff909316939192908e565b6004356000818152600d60205260408120610994929160243591817f6e616d650000000000000000000000000000000000000000000000000000000084146118f8575b837f646174610000000000000000000000000000000000000000000000000000000014611901575b837f61646472000000000000000000000000000000000000000000000000000000001461190d575b5b505092915050565b6004356000908152600d6020908152604082206002015473ffffffffffffffffffffffffffffffffffffffff1680835291f35b6004356000908152600e602090815260408083206024358452825282205460ff1680835291f35b6004356000818152600260205260408120600181015461099e939260243592909182918391869190859073ffffffffffffffffffffffffffffffffffffffff16861415610b2f57610b92565b6004356000908152600d602052604090206009015460ff168060005260206000f35b73ffffffffffffffffffffffffffffffffffffffff3381166000818152600360209081526040808320548084526002909252822060018101546109a895600435959394929391161480156103c1575060045483145b61120b5761124d565b600c546109ae9081565b600b546109b89081565b6000546109c29081565b600a546109cc9073ffffffffffffffffffffffffffffffffffffffff1681565b6004356000818152600d602052604081206109ec929160243591817f66726f6d00000000000000000000000000000000000000000000000000000000841461192f575b837f76616c75650000000000000000000000000000000000000000000000000000001461193b575b837f6e756d566f74657273000000000000000000000000000000000000000000000014611947575b837f6e756d566f74657300000000000000000000000000000000000000000000000014611953575b837f6e756d466f7200000000000000000000000000000000000000000000000000001461195f575b837f6e756d416761696e7374000000000000000000000000000000000000000000001461196b575b837f6b696e640000000000000000000000000000000000000000000000000000000014611977575b837f6e756d4d656d626572730000000000000000000000000000000000000000000014611983575b837f63726561746564000000000000000000000000000000000000000000000000001461198f575b837f65787069727900000000000000000000000000000000000000000000000000001461199b575b5b505092915050565b600260208190526004356000908152604090208054600182015491909201546109f6929173ffffffffffffffffffffffffffffffffffffffff169083565b600854610a1e9073ffffffffffffffffffffffffffffffffffffffff1681565b600360205260043560009081526040902054610a3e9081565b600960205260043560009081526040902054610a489073ffffffffffffffffffffffffffffffffffffffff1681565b610a686004355b73ffffffffffffffffffffffffffffffffffffffff33811660008181526003602090815260408083205483526002909152812060018101549193849385938693879390928892909116146111db576111cf565b600154610a729081565b60043560008181526002602052604081206001810154610a7c939291829183918591859073ffffffffffffffffffffffffffffffffffffffff16861415610af8575b5050505b5050919050565b600e60209081526004356000908152604080822090925260243581522080546001820154600290920154610a9c9260ff909216919083565b6004356000908152600e602090815260408083206024358452825282206001015480835291f35b600554610aae9081565b73ffffffffffffffffffffffffffffffffffffffff3381166000818152600360209081526040808320548352600290915281206001810154610ab89460043594602435949384938593869387939288921614610d7e57610f04565b600a54610abe9074010000000000000000000000000000000000000000900460ff1681565b73ffffffffffffffffffffffffffffffffffffffff3381166000818152600360209081526040808320548352600290915281206001810154610ac89460043594602435949384938593869387939288921614610bb957610cab565b600754610ace9081565b600654610ad89081565b73ffffffffffffffffffffffffffffffffffffffff3381166000818152600360209081526040808320548352600290915281206001810154610ae294600435946024359460443594606435946084359460a43594849290911614610db357610ef3565b600454610ae89081565b73ffffffffffffffffffffffffffffffffffffffff3381166000818152600360209081526040808320548352600290915281206001810154610af294600435948493928592161461126057611258565b60006000f35b60058054340190555b565b8d6000528c6020528b73ffffffffffffffffffffffffffffffffffffffff166040528a606052896080528860a0528760c0528660e05285610100528461012052836101405282610160528161018052806101a0526101c06000f35b8060005260206000f35b8060005260206000f35b60006000f35b8060005260206000f35b8060005260206000f35b8060005260206000f35b8073ffffffffffffffffffffffffffffffffffffffff1660005260206000f35b8060005260206000f35b826000528173ffffffffffffffffffffffffffffffffffffffff166020528060405260606000f35b8073ffffffffffffffffffffffffffffffffffffffff1660005260206000f35b8060005260206000f35b8073ffffffffffffffffffffffffffffffffffffffff1660005260206000f35b8060005260206000f35b8060005260206000f35b8073ffffffffffffffffffffffffffffffffffffffff1660005260206000f35b82600052816020528060405260606000f35b8060005260206000f35b60006000f35b8060005260206000f35b60006000f35b8060005260206000f35b8060005260206000f35b60006000f35b8060005260206000f35b60006000f35b5050506000848152600260205260408120600181015473ffffffffffffffffffffffffffffffffffffffff1694509250905061070c565b6000888152600260205260408120955093507f6a6f696e656400000000000000000000000000000000000000000000000000008714610b9e575b867f7065726d697373696f6e0000000000000000000000000000000000000000000014610bad575b5b5050505b505092915050565b50505060028201549250610b96565b50508254935050610b96565b600089815260026020526040812060018101548b929073ffffffffffffffffffffffffffffffffffffffff16811415610cb657610ca7565b600189895060000160006101000a81548160ff021916908302179055508b89895060020160005081905550600e60005060008c815260200190815260200160002060005060008d8152602001908152602001600020600096509650888850600101600050546001018787506001016000828282505401925050819055508a7f2dfceefb6d217bc7a26eb48019d8a48251e18f4699c014fc195904c4a4e6d87760408c81526020018e8152602001604090036040a25b5b5050505b505050505050505050565b73ffffffffffffffffffffffffffffffffffffffff33166000908152600360209081526040808320548e8452600e835281842081855290925282208054919c509a5090985060ff1688148015610d2c575060008c8152600260208181526040808420909201548e8452600d9091529120600c0154115b8015610d58575060008a8152600260208181526040808420909201548e8452600d9091529120600c0154115b8015610d645750898c14155b8015610d755750610d748b610d93565b5b610bf157610ca6565b6000898152600d602052604081208a91610f0f8c5b600060008210158015610da85750600b548211155b611dc5575b5b919050565b73ffffffffffffffffffffffffffffffffffffffff33166000908152600360205260408120548154909450610ef2918b918b918b918b9189918c918c90808e8214158015610e0057504283105b611b9b575b5050600b80546000908152600d602081905260408083208c8155600181018c9055600a81018b90556002810180547fffffffffffffffffffffffff0000000000000000000000000000000000000000168b179055600381018990556004810188905542600c82015593840186905590830184905588815260608790527f229d22335ad9cb689a138432ed928fc299b1defde311e84cf8dcf6f9128a7d4d9080a1600a5473ffffffffffffffffffffffffffffffffffffffff16600014158015610ee95750600a5474010000000000000000000000000000000000000000900460ff16155b611ba057611b85565b5b505050505050505050565b5b5b5050505b505050505050505050565b8015610f225750600982015460ff166000145b610f2b57610f00565b73ffffffffffffffffffffffffffffffffffffffff33166000908152600360209081526040808320548f8452600d8352818420600e84528285208286529093529083208054919d50919b50919950975088965060ff1688148015610fa4575060008a81526002602081905260409091200154600c8a0154115b610fad57610eff565b610efe8c8b8d8a8a5060010160005054600101600060008560006000600d6000506000848152602001908152602001600020600091509150611c1083610d93565b60008b8152600d6020908152604080832060038082015485526002845282852060085473ffffffffffffffffffffffffffffffffffffffff168652908452828520548552600e8201845282852085805290935290832054909b509199509750889650881480156111c55750600b89015460029006600114801561107e5750600b89015460078a0154600290910490115b806110c8575060085473ffffffffffffffffffffffffffffffffffffffff166000908152600360209081526040808320548352600e8c018252808320600180855292529091205410155b806110e85750600a89015487541480156110e75750600a890154600014155b5b806111125750600854600188015473ffffffffffffffffffffffffffffffffffffffff9081169116145b806111345750600a89015460031480156111335750600389015460048a0154145b5b806111565750600a890154600c1480156111555750600489015460038a0154145b5b806111c45750600b8901546002900660001480156111c35750600b89015460078a015460029091049011806111c25750600b89015460078a015460029091041480156111c157506004546000908152600e8a0160209081526040808320600180855292529091205410155b5b5b5b5b6111fd575b5b5050505b50505b50505050919050565b6000888152600d6020526040812089916111f48b610d93565b610fee576111cb565b6001995050505050506111d2565b600a80547fffffffffffffffffffffff00ffffffffffffffffffffffffffffffffffffffff167401000000000000000000000000000000000000000086021790555b50505050565b5b5050505b50505b505050565b6000858152600d60205260408120869161127988610d93565b801561128c5750600982015460ff166000145b61129557611254565b6000888152600d60205260408120975095506112b088610669565b156112c7575b600a8701546001146112d157611334565b505050505061125b565b600287015460048801546005546113339273ffffffffffffffffffffffffffffffffffffffff169190819010611b2c575b60058054829003905573ffffffffffffffffffffffffffffffffffffffff821660008281828384878787f1611b2457005b5b600a87015460021461134557611427565b600287015460048801546114269173ffffffffffffffffffffffffffffffffffffffff16905b600080818273ffffffffffffffffffffffffffffffffffffffff861684146119a7575b5050505073ffffffffffffffffffffffffffffffffffffffff8216600081815260036020818152604080842080548552600280845282862086548752928620600180820180547fffffffffffffffffffffffff0000000000000000000000000000000000000000168c17905542928201929092558881558654978752949093528590559381018355805481019055815b505050505050565b5b600a87015460031461143857611480565b60048701546000818152600260205260408120600181015461147f9392918291849190849073ffffffffffffffffffffffffffffffffffffffff168514156119ac57611a3d565b5b600a870154600414611491576114d4565b6004870154600081815260026020526040812060018101546114d3939283929173ffffffffffffffffffffffffffffffffffffffff16811415611e2e57611e34565b5b600a8701546005146114e557611513565b60028701546115129073ffffffffffffffffffffffffffffffffffffffff166000811415611b3157611b7f565b5b600a87015460061461152457611586565b6004870154600090815260096020526040902080547fffffffffffffffffffffffff0000000000000000000000000000000000000000169055600780547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0190555b600a870154600714611597576115ef565b6002870154600880547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff90921691821790556115ee90611e3a81600061136b565b5b600a87015460081461160057611664565b600287015487547c010000000000000000000000000000000000000000000000000000000090819004026000908152600189015460045273ffffffffffffffffffffffffffffffffffffffff909116908060248283856161da5a03f161166257005b505b600a870154600914611675576116d9565b600287015487547c0100000000000000000000000000000000000000000000000000000000908190040260009081526004808a0154905273ffffffffffffffffffffffffffffffffffffffff909116908060248283856161da5a03f16116d757005b505b600a80880154146116f6575b600a870154600b1461170f57611771565b3073ffffffffffffffffffffffffffffffffffffffff16ff5b60028088015473ffffffffffffffffffffffffffffffffffffffff90811660009081526003602090815260408083205460048d01548185529590925282206001810154611770959294929392839286929091859116851415611a4557611a5b565b5b600a870154600c14611782576117d5565b600487015460028089015460008381526020929092526040822060018101546117d4949373ffffffffffffffffffffffffffffffffffffffff93841693909283928692859116851415611a6457611b1b565b5b600a870154600d146117e657611830565b6002870154600a80547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff9092169190911790555b600a870154600e14611841576118ab565b60028701546004808901547ffe0d94c1000000000000000000000000000000000000000000000000000000006000908152918b905273ffffffffffffffffffffffffffffffffffffffff9092169163fe0d94c1918060248284876185025a03f16118a757005b5050505b73ffffffffffffffffffffffffffffffffffffffff3381166000818152600360209081526040808320548352600290915281206001810154611253948d94929392911614611dcd57611deb565b8154925061029c565b6001820154925061029c565b600282015473ffffffffffffffffffffffffffffffffffffffff16925061029c565b600382015492506105b4565b600482015492506105b4565b600582015492506105b4565b600682015492506105b4565b600782015492506105b4565b600882015492506105b4565b600a82015492506105b4565b600b82015492506105b4565b600c82015492506105b4565b600d82015492506105b4565b61141e565b60008681526002602090815260408220600180547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff018155810180547fffffffffffffffffffffffff000000000000000000000000000000000000000016905582805260039091527f3617319a054d772f909f7c479a2cebe5066e836a939412e32403c99029b92eff829055955093505b505050505050565b6000878152600260205260408120878155955093505b50505050505050565b600087815260026020526040812060018101549096509094503373ffffffffffffffffffffffffffffffffffffffff9081169116148015611abc575073ffffffffffffffffffffffffffffffffffffffff8616600014155b611ac557611b1a565b6001850180547fffffffffffffffffffffffff0000000000000000000000000000000000000000168717905573ffffffffffffffffffffffffffffffffffffffff861660009081526003602052604090208790555b5b50505050505050565b5050505b5050565b611b28565b60068054600090815260096020526040902080547fffffffffffffffffffffffff00000000000000000000000000000000000000001683179055805460019081019091556007805490910190555b50565b50505b600b805460010190555b50505050505050505050565b611b8f565b600a547ff1d5da6c000000000000000000000000000000000000000000000000000000006000908152600b5460045273ffffffffffffffffffffffffffffffffffffffff9091169063f1d5da6c908060248283866161da5a03f1611b8257005b50505b5b5050505b505050505050565b8015611c235750600982015460ff166000145b611c2c57611c04565b6000898152600d602090815260408083208b8452600e810183528184206001855290925282205490965090945084141580611c8157506000888152600e86016020908152604080832083805290915281205414155b80611c905750600985015460ff165b611d06575b6005850180546001019055600685018054870190556000888152600e8601602090815260408083208a84528252918290208890558982528a917f70df472d8ab8488dc291e66aa1d664a32341a67a0c63ce5676157aab894e1ed39190a286611d0e5760088501805487019055611d19565b505050611c08565b600785018054870190555b600a5473ffffffffffffffffffffffffffffffffffffffff16600014158015611d5d5750600a5474010000000000000000000000000000000000000000900460ff16155b611d6657611c03565b600a547f441a8b9d00000000000000000000000000000000000000000000000000000000600090815260048b905273ffffffffffffffffffffffffffffffffffffffff9091169063441a8b9d908060248283866161da5a03f1611c0057005b506001610dae565b6000838152600d602052604081208491611df086610d93565b5b5050505b505050565b8015611e035750600982015460ff166000145b611e0c57611de7565b6000868152600d60205260408120611de691889181908a9083611e3d8d610d93565b60048490555b50505050565b50565b8015611e505750600982015460ff166000145b611e5957611f1d565b857f35ba8426ecea7dcc3faef9e50aa1e0ef92057b147afff0843d06d863e24c0fad60006040a26000868152600d602052604081206009810180547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00166001908117909155600c80549091019055600a5490965090945073ffffffffffffffffffffffffffffffffffffffff168414158015611f105750600a5474010000000000000000000000000000000000000000900460ff16155b611f2557611f1c565b50505b5b505050505050565b600a547f35ba8426000000000000000000000000000000000000000000000000000000006000908152600488905273ffffffffffffffffffffffffffffffffffffffff909116906335ba8426908060248283866161da5a03f1611f195700



ABI ::


clean[
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "proposals",
    "outputs": [
      {
        "name": "name",
        "type": "bytes32"
      },
      {
        "name": "data",
        "type": "bytes32"
      },
      {
        "name": "addr",
        "type": "address"
      },
      {
        "name": "from",
        "type": "uint256"
      },
      {
        "name": "value",
        "type": "uint256"
      },
      {
        "name": "numVoters",
        "type": "uint256"
      },
      {
        "name": "numVotes",
        "type": "uint256"
      },
      {
        "name": "numFor",
        "type": "uint256"
      },
      {
        "name": "numAgainst",
        "type": "uint256"
      },
      {
        "name": "executed",
        "type": "bool"
      },
      {
        "name": "kind",
        "type": "uint256"
      },
      {
        "name": "numMembers",
        "type": "uint256"
      },
      {
        "name": "created",
        "type": "uint256"
      },
      {
        "name": "expiry",
        "type": "uint256"
      }
    ],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_pid",
        "type": "uint256"
      },
      {
        "name": "_param",
        "type": "bytes32"
      }
    ],
    "name": "getProposalBytes",
    "outputs": [
      {
        "name": "b",
        "type": "bytes32"
      }
    ],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_pid",
        "type": "uint256"
      }
    ],
    "name": "getProposalAddress",
    "outputs": [
      {
        "name": "a",
        "type": "address"
      }
    ],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_pid",
        "type": "uint256"
      },
      {
        "name": "_to",
        "type": "uint256"
      }
    ],
    "name": "getDelegationType",
    "outputs": [
      {
        "name": "b",
        "type": "bool"
      }
    ],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_mid",
        "type": "uint256"
      },
      {
        "name": "_param",
        "type": "bytes32"
      }
    ],
    "name": "getMemberUint",
    "outputs": [
      {
        "name": "u",
        "type": "uint256"
      }
    ],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_pid",
        "type": "uint256"
      }
    ],
    "name": "getProposalExecuted",
    "outputs": [
      {
        "name": "b",
        "type": "bool"
      }
    ],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_b",
        "type": "bool"
      }
    ],
    "name": "setConfigOverride",
    "outputs": [],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "numExecuted",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "numProposals",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "numMembers",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "configAddr",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_pid",
        "type": "uint256"
      },
      {
        "name": "_param",
        "type": "bytes32"
      }
    ],
    "name": "getProposalUint",
    "outputs": [
      {
        "name": "u",
        "type": "uint256"
      }
    ],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "members",
    "outputs": [
      {
        "name": "permission",
        "type": "uint256"
      },
      {
        "name": "addr",
        "type": "address"
      },
      {
        "name": "joined",
        "type": "uint256"
      }
    ],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "parent",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "name": "toMember",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "children",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_pid",
        "type": "uint256"
      }
    ],
    "name": "hasWon",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "numMembersActive",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_mid",
        "type": "uint256"
      }
    ],
    "name": "getMemberAddress",
    "outputs": [
      {
        "name": "a",
        "type": "address"
      }
    ],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "delegations",
    "outputs": [
      {
        "name": "delegated",
        "type": "bool"
      },
      {
        "name": "numDelegations",
        "type": "uint256"
      },
      {
        "name": "to",
        "type": "uint256"
      }
    ],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_pid",
        "type": "uint256"
      },
      {
        "name": "_to",
        "type": "uint256"
      }
    ],
    "name": "getDelegationNumDelegations",
    "outputs": [
      {
        "name": "u",
        "type": "uint256"
      }
    ],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "balance",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_pid",
        "type": "uint256"
      },
      {
        "name": "_type",
        "type": "bool"
      }
    ],
    "name": "vote",
    "outputs": [],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "configOverride",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_to",
        "type": "uint256"
      },
      {
        "name": "_pid",
        "type": "uint256"
      }
    ],
    "name": "delegate",
    "outputs": [],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "numChildrenActive",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "numChildren",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_name",
        "type": "bytes32"
      },
      {
        "name": "_data",
        "type": "bytes32"
      },
      {
        "name": "_kind",
        "type": "uint256"
      },
      {
        "name": "_addr",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      },
      {
        "name": "_expiry",
        "type": "uint256"
      }
    ],
    "name": "table",
    "outputs": [],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "chair",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_pid",
        "type": "uint256"
      }
    ],
    "name": "execute",
    "outputs": [],
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "_pid",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "_from",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "_to",
        "type": "uint256"
      }
    ],
    "name": "onDelegate",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "_kind",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "_from",
        "type": "uint256"
      }
    ],
    "name": "onProposal",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "_pid",
        "type": "uint256"
      }
    ],
    "name": "onExecute",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "_pid",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "_from",
        "type": "uint256"
      }
    ],
    "name": "onVote",
    "type": "event"
  }
]



Solidity Interface ::


contract BoardRoom{function proposals(uint256 )constant returns(bytes32 name,bytes32 data,address addr,uint256 from,uint256 value,uint256 numVoters,uint256 numVotes,uint256 numFor,uint256 numAgainst,bool executed,uint256 kind,uint256 numMembers,uint256 created,uint256 expiry){}function getProposalBytes(uint256 _pid,bytes32 _param)returns(bytes32 b){}function getProposalAddress(uint256 _pid)returns(address a){}function getDelegationType(uint256 _pid,uint256 _to)returns(bool b){}function getMemberUint(uint256 _mid,bytes32 _param)returns(uint256 u){}function getProposalExecuted(uint256 _pid)returns(bool b){}function setConfigOverride(bool _b){}function numExecuted()constant returns(uint256 ){}function numProposals()constant returns(uint256 ){}function numMembers()constant returns(uint256 ){}function configAddr()constant returns(address ){}function getProposalUint(uint256 _pid,bytes32 _param)returns(uint256 u){}function members(uint256 )constant returns(uint256 permission,address addr,uint256 joined){}function parent()constant returns(address ){}function toMember(address )constant returns(uint256 ){}function children(uint256 )constant returns(address ){}function hasWon(uint256 _pid)returns(bool ){}function numMembersActive()constant returns(uint256 ){}function getMemberAddress(uint256 _mid)returns(address a){}function delegations(uint256 ,uint256 )constant returns(bool delegated,uint256 numDelegations,uint256 to){}function getDelegationNumDelegations(uint256 _pid,uint256 _to)returns(uint256 u){}function balance()constant returns(uint256 ){}function vote(uint256 _pid,bool _type){}function configOverride()constant returns(bool ){}function delegate(uint256 _to,uint256 _pid){}function numChildrenActive()constant returns(uint256 ){}function numChildren()constant returns(uint256 ){}function table(bytes32 _name,bytes32 _data,uint256 _kind,address _addr,uint256 _value,uint256 _expiry){}function chair()constant returns(uint256 ){}function execute(uint256 _pid){}}

*/
