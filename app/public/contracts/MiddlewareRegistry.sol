contract MiddlewareRegistry {
  	event Registered(bytes32 indexed name, address owner);
  	event Renew(uint indexed did, address indexed addr, uint expiry);
  	event Transfer(uint indexed did, address from, address to);
  	event Deregistered(uint did, address owner);
  	
  	struct Repo {
  	    bytes32 name;
  	    address owner;
  	    mapping(uint => bytes32) data; // ver. => data
  	    uint latest;
  	    uint expiry;
  	}
  	
  	uint public numRepos;
  	mapping(uint => Repo) public repos;
  	mapping(bytes32 => uint) public fromName;
  	
  	function getVersion(uint _did, uint _version) returns (bytes32 d) {
  	    return repos[_did].data[_version];
  	}

	function register(bytes32 _name, uint _version, bytes32 _data) external {
	    Repo getRepo = repos[fromName[_name]];
	    uint did;
	    
	    if(getRepo.expiry > now
	    || getRepo.data[_version] != ""
	    || _version <= getRepo.latest)
	        return;
	        
	    if(fromName[_name] != 0 
	    && (getRepo.owner == msg.sender || getRepo.expiry < now))
	        did = fromName[_name];
	    else
	        did = numRepos++;
	        
	    Repo b = repos[did];
	    b.name = _name;
	    b.owner = msg.sender;
	    b.data[_version] = _data;
	    b.latest = _version;
	    b.expiry = now + (1 years);
	    fromName[b.name] = did;
		Registered(_name, msg.sender);
	}
	
	function renew(uint _did) {
	    if((repos[_did].expiry - (120 days)) > now)
	        repos[_did].expiry = now + (1 years);
	        
	    Renew(_did, msg.sender, repos[_did].expiry);
	}
	
	function transfer(uint _did, address _toAddr) {
	    if(repos[_did].owner != msg.sender)
	        return;
	        
	    repos[_did].owner = _toAddr;
	    Transfer(_did,  msg.sender, _toAddr);
	}
}                                  