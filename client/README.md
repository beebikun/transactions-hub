# Setting up dev network

1. Install Ganache;
2. Deploy contract with `npm run migrate` in `../contracts`;
3. Install metamask on your browser;
4. Add [Ganache network to metamask](https://www.trufflesuite.com/docs/truffle/getting-started/truffle-with-metamask) `Networks > Custom RPC`:
```
Network name: any;
New RPC URL: http://127.0.0.1:7545
Chain ID: 1337
```
5. Choose new network in metamask;
6. Export account from Ganache network:
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


TODO:
- Add installing of client packages to the main package.json postinstall
- Add client start to the main package.json
