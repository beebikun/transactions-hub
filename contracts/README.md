The main contract is [Hub](./contracts/Hub.sol), inherited from
[AccountStorage](./contracts/AccountStorage.sol) and
[TransactionStorage](./contracts/AccountStorage.sol).

Please read doclines to [Hub](./contracts/Hub.sol) for understanding the
contract concept.

Uses libs:
- [AddressStorageLib](./contracts/AddressStorageLib.sol);
- [TransactionLib](./contracts/TransactionLib.sol);

# Setup
```
npm install
npm run migrate
```

# Testing
```
npm run test
```

or

```
npm run coverage
```

# Rebuild and see build size:
```
npm run build
```
