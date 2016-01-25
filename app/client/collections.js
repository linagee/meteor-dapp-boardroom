
// Basic (local) collections
// we use {connection: null} to prevent them from syncing with our not existing Meteor server

// A collection for board room proposals
Proposals = new Mongo.Collection('proposals', {connection: null});
new PersistentMinimongo(Proposals);

// A collection for BoardRoom boards to be stored
Boards = new Mongo.Collection('boards', {connection: null});
new PersistentMinimongo(Boards);

// A collection for board members
Members = new Mongo.Collection('members', {connection: null});
new PersistentMinimongo(Members);

// A collection for board subcommittees (or children)
Children = new Mongo.Collection('children', {connection: null});
new PersistentMinimongo(Children);

// A collection for board delegations
Delegations = new Mongo.Collection('delegations', {connection: null});
new PersistentMinimongo(Delegations);

// A collection for BoardRoom middleware
Middleware = new Mongo.Collection('middlware', {connection: null});
new PersistentMinimongo(Middleware);

// A collection for names
Names = new Mongo.Collection('names', {connection: null});
new PersistentMinimongo(Names);

// A collection for BoardRoom middleware
Messages = new Mongo.Collection('messages', {connection: null});
new PersistentMinimongo(Messages);

// A collection for BoardRoom middleware
Balances = new Mongo.Collection('balances', {connection: null});
new PersistentMinimongo(Balances);

// A collection for BoardRoom middleware
IPFS_Backup = new Mongo.Collection('IPFS_Data_Backup', {connection: null});
new PersistentMinimongo(IPFS_Backup);

// A collection for BoardRoom middleware
Personas = new Mongo.Collection('Personas', {connection: null});
new PersistentMinimongo(Personas);