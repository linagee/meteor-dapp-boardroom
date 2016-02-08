# meteor-dapp-boardroom

Welcome to the alpha version of BoardRoom, a blockchain governance dApp.

# Alpha

http://meteor-dapp-boardroom.meteor.com

# Install

**Please note this dApp is incomplete and is still being developed.

Clone this repo

    $ git clone http://github.com/web3-gov/meteor-dapp-boardroom
    
Create an account with geth (create a passphrase):

    $ geth account new
    
Start a local geth node instance (then hit 'enter' to promt passphrase input):

    $ geth --rpc --rpcaddr="0.0.0.0" --rpccorsdomain="*" --mine --unlock=0 --verbosity=5 --maxpeers=0 --minerthreads="4"
    
Start the app using BoardRoom

    $ cd meteor-dapp-boardroom/app
    $ meteor
