The main contract is [Hub](./contracts/Hub.sol), inherited from
[AccountStorage](./contracts/AccountStorage.sol) and
[TransactionStorage](./contracts/AccountStorage.sol).

Please read doclines to [Hub](./contracts/Hub.sol) for understanding the
contract concept.

Uses libs:
- [AddressStorageLib](./contracts/AddressStorageLib.sol);
- [ProfileStorageLib](./contracts/ProfileStorageLib.sol);
- [TransactionLib](./contracts/TransactionLib.sol);

# Setup

## Dependencies and contract migration
```
npm install
npm run migrate
```

## Setting up dev network

1. Install Ganache;
2. Install metamask on your browser;
3. Add [Ganache network to metamask](https://www.trufflesuite.com/docs/truffle/getting-started/truffle-with-metamask) `Networks > Custom RPC`:
```
Network name: any;
New RPC URL: http://127.0.0.1:7545
Chain ID: 1337
```
4. Choose new network in metamask;
5. Export account from Ganache network:
    - Open Ganache;
    - Click "Show Keys" in Accounts page;
    - Copy "Private key";
    - Open metamask;
    - Choose "Import Account";
    - Insert key and click "Import";

# Run app
- Make sure you are connected to Ganache network in metamask;
- Run `npm start`;
- Connect metamask to app;

# Initial data preparing
To make playing with test network more fun you may want to prepare some data.

Considering you have imported the first account from Ganache to MetaMask, run
`npm run console` and execute script.

Tips:
```
// Roles: 0 - can send request; 1 - can vote;
// Votes: 2 - approve; 3 - reject;
```

## Profile with requester role
```
instance = await Hub.deployed();
activeUser = accounts[0];
await instance.receiveAmount(address, {value: 100});

account = await instance.account(activeUser);
p1Index = account.profilesSize;
await instance.addProfile({from: activeUser});
p1 = await instance.profileIdAt(activeUser, p1Index);

// p1 has 25% percent of consensus percentage - 1 vote of 4 is enough to consensus
await instance.editProfile(p1, '0x41', 25, {from: activeUser});

await instance.addProfileRole(p1, activeUser, 0, {from: activeUser});
await instance.addProfileRole(p1, accounts[2], 1, {from: activeUser});
await instance.addProfileRole(p1, accounts[3], 1, {from: activeUser});
await instance.addProfileRole(p1, accounts[4], 1, {from: activeUser});
await instance.addProfileRole(p1, accounts[5], 1, {from: activeUser});

// Now you can add transaction request from app to p1
// Or with console: create a request to accounts[5] with amount 1
txId1 = await instance.lastUid();
instance.addRequest(p1, 1, accounts[5], {from: activeUser});

// Now you can vote from accounts: accounts[2], accounts[3], accounts[4], accounts[5]
instance.vote(txId1, 2, {from: accounts[2]});
```

## Profile with voter role
```
instance = await Hub.deployed();
activeUser = accounts[0];
await instance.receiveAmount(address, {value: 100});

account = await instance.account(activeUser);
p2Index = account.profilesSize;
await instance.addProfile({from: activeUser});
p2 = await instance.profileIdAt(activeUser, p2Index);

await instance.editProfile(p2, '0x42', 50, {from: activeUser});

await instance.addProfileRole(p2, accounts[2], 0, {from: activeUser});
await instance.addProfileRole(p2, activeUser, 1, {from: activeUser});
await instance.addProfileRole(p1, accounts[3], 1, {from: activeUser});

// You can create a request for p2 with console
txId2 = await instance.lastUid();
instance.addRequest(p2, 4, accounts[5], {from: accounts[2]});

// You can vote with app or with console
instance.vote(txId2, 3, {from: activeUser});
```

## Profile with both - voter and requester roles
```
instance = await Hub.deployed();
activeUser = accounts[0];
await instance.receiveAmount(address, {value: 100});

account = await instance.account(activeUser);
p3Index = account.profilesSize;
await instance.addProfile({from: activeUser});
p3 = await instance.profileIdAt(activeUser, p3Index);

await instance.editProfile(p3, '0x43', 100, {from: activeUser});

await instance.addProfileRole(p3, activeUser, 0, {from: activeUser});
await instance.addProfileRole(p3, activeUser, 1, {from: activeUser});

// You can both - create request and vote - with app or with console
txId3 = await instance.lastUid();
instance.addRequest(p2, 5, activeUser, {from: activeUser});

// txId3 is made with `activeUser` as to, so after transaction approval
// balance of `activeUser` is increased.
instance.vote(txId2, 2, {from: activeUser});
```

# Testing

## Contrats testing:
    ```
    npm run test
    ```

    or

    ```
    npm run coverage
    ```
## App testing

As MVP project, front has no tests :(

# Rebuild and see build size:
```
npm run compile
```
