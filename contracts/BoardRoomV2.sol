//sol BoardRoom
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
    
    function isMember(address _addr) public returns (bool) {
        Member m = members[toMember[msg.sender]]; 
        if(m.joined != 0) return true;        
    }
    
    modifier isMid (uint _mid)  {
        Member m = members[_mid];
        if(m.addr != address(0)) _
    }
    
    modifier isMembership { 
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
    }*/
    
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
    
    function delegate(uint _to, uint _pid) isMembership isMid(_to) {
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
    , address _addr, uint _value, uint _expiry) isMembership {
        uint memberId = toMember[msg.sender];
        addProposal(_name,  _data, _kind, _addr, memberId, _value, numMembersActive, _expiry);
    }
    
    function vote(uint _pid, bool _type) isMembership notExecuted(_pid) {
        uint memberId = toMember[msg.sender];
        Proposal p = proposals[_pid];
        Delegation d = delegations[_pid][memberId];
        
        if(d.delegated == false && p.created > members[memberId].joined) // weight by delegation
            addVote(_pid, memberId, _type, 1 + d.numDelegations);
    }
    
    function execute(uint _pid) isMembership notExecuted(_pid){
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

contract StandardToken {
    function isApprovedOnceFor(address _target, address _proxy) constant returns (uint _maxValue) {}
    function isApprovedFor(address _target, address _proxy) constant returns (bool _r) {}
    function balanceOf(address _addr) constant returns (uint _r) {}
    
    function transfer(uint _value, address _to) returns (bool _success) {}
    function transferFrom(address _from, uint _value, address _to) returns (bool _success) {}
    function approve(address _addr) returns (bool _success) {}
    function unapprove(address _addr) returns (bool _success) {}
    function approveOnce(address _addr, uint256 _maxValue) returns (bool _success) {}
}

contract DecisionMaker {
    function hasWon(uint _pid) returns (bool) {}
}

contract ContractualVoting {
    address public decisionMakerAddress;
    
    function isDecisionMaker() returns (bool){
        if(decisionMakerAddress != address(0))
            return true;
    }
}

contract NameReg {
	function register(bytes32 name) {}
	function unregister() {}
}

contract Middleware { function execute(uint _pid){}}

contract BoardRoom is Chaired, Budgeted, Family, Democracy, ContractualVoting {
    //function BoardRoom(address nameregAddr, bytes32 name) {
    //    NameReg(nameregAddr).register(name);
    //}

    function hasWon(uint _pid) isMembership isProposal(_pid) returns (bool) {
        Proposal p = proposals[_pid];
        Member m = members[p.from];
        
        if((isDecisionMaker() && DecisionMaker(decisionMakerAddress).hasWon(_pid)) || 
        ((p.votes[toMember[parent]][false] == 0) && // parent didn't vote against
        ((p.numMembers % 2 == 1 && p.numFor > p.numMembers/2) // uneven majority
            || (p.votes[toMember[parent]][true] >= 1) // tabler is parent that voted for
            || (m.permission == p.kind && p.kind != 0) // tabler has permission
            || (m.addr == parent) // tabler is parent
            || (p.kind == 3 && p.value == p.from) // member resigning
            || (p.kind == 12 && p.from == p.value) // change your own address
            || (p.numMembers % 2 == 0 && (p.numFor > p.numMembers/2 // even split
                || (p.numFor == p.numMembers/2 && p.votes[chair][true] >= 1)))))) //so chair splits
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
    
    function execute(uint _pid) isMembership notExecuted(_pid){
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
            
        if(p.kind == 15)
            NameReg(p.addr).register(p.data);
            
        if(p.kind == 16)
            NameReg(p.addr).unregister();
            
        if(p.kind == 18)
            decisionMakerAddress = p.addr;
            
        if(p.kind == 19)
            StandardToken(p.addr).transfer(p.value, address(p.data));
            
        if(p.kind == 20)
            StandardToken(p.addr).transferFrom(this, p.value, address(p.data));
            
        if(p.kind == 21)
            StandardToken(p.addr).approve(address(p.data));
            
        if(p.kind == 22)
            StandardToken(p.addr).approveOnce(address(p.data), p.value);
        
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
            
    function getProposalExecuted(uint _pid)  returns (bool b) { 
        Proposal p = proposals[_pid];      

        return p.executed;
    }
}                
