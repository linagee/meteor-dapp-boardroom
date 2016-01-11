/*
var proposalObject = Proposals.findOne({boardroom: board, id: proposalID});
		
for(var d = 0; d < proposalObject.numData; d++) {
	var dataRaw = proposalObject.data[d],
		dataObject = {};

	dataObject.raw = dataRaw;
	dataObject.ascii = web3.toAscii(dataRaw, 32);
	dataObject.kind = BoardRoom.kinds[proposalObject.kind].data[d];
	proposalObject.data[d] = dataObject;
}

for(var a = 0; a < proposalObject.numAddresses; a++) {
	var dataRaw = proposalObject.addr[a],
		dataObject = {};

	dataObject.raw = dataRaw;
	dataObject.kind = BoardRoom.kinds[proposalObject.kind].address;
	proposalObject.addr[a] = dataObject;
}

for(var v = 0; v < proposalObject.numValues; v++) {
	var dataRaw = proposalObject.value[v],
		dataObject = {};

	dataObject.raw = dataRaw;
	dataObject.kind = BoardRoom.kinds[proposalObject.kind].value;
	proposalObject.value[v] = dataObject;
}

proposalObject.numFor = 0;
proposalObject.numAgainst = 0;
proposalObject.numAbstain = 0;

for(var v = 0; v < proposalObject.numVotes; v++) {
	if(proposalObject.votes[v].position == 0)
		proposalObject.numAgainst ++;

	if(proposalObject.votes[v].position == 1)
		proposalObject.numFor ++;
}

proposalObject.expiry = proposalObject.created + (30*24*3600);
proposalObject.numAbstain = proposalObject.numFor - proposalObject.numAgainst;
proposalObject.isExecutable = false;
proposalObject.isVotable = false;

if(proposalObject.expiry < moment().unix()
   || proposalObject.executed == true) {
	proposalObject.isExecutable = false;
	proposalObject.isVotable = false;
} else {
	proposalObject.isVotable = true;
}

Proposals.upsert({boardroom: board, id: proposalID}, proposalObject);

console.log(proposalObject);

return proposalObject;
*/


Template['views_proposal'].rendered = function(){
	Meta.setSuffix(TAPi18n.__("dapp.proposal.title"));
    TemplateVar.set('state', {isVotable: true});
	
	var proposals = objects.defaultComponents.Proposals;
	
	proposals.numProposals.call(boardroomInstance.address, function (err, result){	

		if(isNaN(objects.params._proposal) && result.toNumber(10) > 0)
			 Router.go('/boardroom/' + boardroomInstance.address + '/proposal/' + (result.toNumber(10) - 1));

		Boards.update({address: boardroomInstance.address}, {$set: {numProposals: result.toNumber(10)}});
	});
	
	BoardRoom.importProposal(boardroomInstance.address, objects.params._proposal);
	
	//if(_.isUndefined(proposal))
	//	Proposals.upsert({boardroom: boardroomInstance.address, id: proposalID}, {boardroom: boardroomInstance.address, id: proposalID});
		
    
    /*Meteor.setTimeout(function(){
        $('#pdfContent').empty();
        Helpers.loadPDF('#pdfContent', 1, 'http://crossorigin.me/http://boardroom.to/BoardRoom_WhitePaper.pdf');
    }, 1000);*/
};

Template['views_proposal'].helpers({
	'methodHash': function(value){
		return '0x' + String(web3.sha3(value)).slice(0, 8);
	},
	'methodProcessorHash': function(kind){
		return objects.defaultComponents.Processor.methodName(kind);
	},
	'methodHashesMatch': function(value, kind){
		return (String('0x' + String(web3.sha3(value)).slice(0, 8)) == String(objects.defaultComponents.Processor.methodName(kind)));
	},
	'proposal': function(){
		var proposal = Proposals.findOne({boardroom: boardroomInstance.address, id: objects.params._proposal});
		
		if(_.isUndefined(proposal))
			return;
		
		var dataLength = BoardRoom.kinds[proposal.kind].data.length;
		proposal.chunks = [];
		
		for(var d = 0; d < proposal.numData; d++) {
			var kind_index = d;
			
			if(kind_index >= BoardRoom.kinds[proposal.kind].data.length)
				kind_index = kind_index - BoardRoom.kinds[proposal.kind].data.length;
			
			var dataObject = {};
			dataObject.raw = proposal.data[d];
			dataObject.kind = BoardRoom.kinds[proposal.kind].data[kind_index];
			
			if(dataObject.kind.isUint)
				dataObject.ascii = parseInt(proposal.data[d], 16);
			
			try {
			
			if(dataObject.kind.isAddress)
				dataObject.ascii = '0x' + ethUtil.unpad(proposal.data[d]);
			
			}catch(e){}
				
			proposal.data[d] = dataObject;
		}
		
		var chunksIndex = 0;
		for(var a = 0; a < proposal.numAddresses; a++){
			var chunkDataIndex = 0;
			var chunkObject = {id: a, data: [], address: {}, value: {}, dataAscii: []};
			
			for(var d = chunksIndex; d < (chunksIndex + dataLength); d++) {
				chunkObject.data[chunkDataIndex] = proposal.data[d];
				chunkObject.dataAscii[chunkDataIndex] = proposal.data[d].ascii;
				chunkDataIndex++;
			}
			
			var proposalKind = BoardRoom.kinds[proposal.kind];
			chunkObject.bytecode = ethABI.rawEncode(proposalKind.methodShort, proposalKind.abi, chunkObject.dataAscii);	
			chunkObject.bytecodeHex = '0x' +  chunkObject.bytecode.toString('hex');
			
			chunksIndex += dataLength;
			
			chunkObject.address.raw = proposal.addr[a];
			chunkObject.address.kind = BoardRoom.kinds[proposal.kind].address;
			chunkObject.value.raw = proposal.value[a];
			chunkObject.value.ether = web3.fromWei(proposal.value[a], 'ether');
			chunkObject.value.kind = BoardRoom.kinds[proposal.kind].value;
			
			proposal.chunks.push(chunkObject);
		}
		
		console.log(proposal);
		
		return proposal;
	},
});