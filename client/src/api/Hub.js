import * as ACTIONS from '../actions';


class HubApi {
  constructor(drizzle) {
    this.SIGNS_MAP = {};
    this._contractPromise = new Promise((resolve, reject) => {
      this._contractPromiseResolve = resolve;
      this._contractPromiseReject = reject;
    });
    this.store = drizzle.store;
    const unsubscribe = drizzle.store.subscribe(() => {
      const drizzleState = drizzle.store.getState();
      if (drizzleState.contracts?.Hub?.initialized) {
        const contract = drizzle.contracts.Hub;
        // DEBUG
        window.contract = contract;
        this._contractPromiseResolve(contract);
        this.generateFunctionNames(contract);
        unsubscribe();
      }
    });
  }

  generateFunctionNames(contract) {
    const methods = [
      'addProfile',
      'editProfile',
      // 'removeProfile',
      'addProfileRole',
      'removeProfileRole',
    ];
    contract.abi.forEach(({ name, signature, inputs }) => {
      if (methods.includes(name)) {
        const types = inputs.map(({ type }) => type);
        const names = inputs.map(({ name }) => name);
        this.SIGNS_MAP[signature] = (rawArgs) => {
          const args = contract.web3.eth.abi.decodeParameters(types, rawArgs);
          const result = Object.entries(args)
            .reduce((bucket, [idx, value]) => {
              if (idx === '__length__') {
                return bucket;
              }
              return { ...bucket, [names[idx]]: value };
            }, {});
          // POST-MVP
          // if (name === 'removeProfile') {
          //   return ACTIONS.profileRemoved({
          //     accountAddress: result.accountAddress,
          //     profileIdx: result.profileIdx,
          //   });
          // }
          if (['addProfileRole', 'removeProfileRole'].includes(name)) {
            return ACTIONS.requestProfile({
              accountAddress: result.accountAddress,
              profileIdx: result.profileIdx,
            });
          }
          return ACTIONS.profileReceived({ result });
        };
      }
    });
  }

  async fetchAccount(accountAddress) {
    // DEBUG
    window.address = accountAddress;
    const contract = await this._contractPromise;
    const hash = contract.methods.account.cacheCall(accountAddress);
    return hash;
  }

  // GET
  async fetchProfile({ accountAddress, profileIdx }) {
    const contract = await this._contractPromise;
    const result = await contract.methods.profile(accountAddress, profileIdx).call();
    return { ...result, accountAddress, profileIdx };
  }

  async fetchUserPermission({ accountAddress, profileIdx, role, idx}) {
    const contract = await this._contractPromise;
    const userAddress = await contract.methods.profileRoleAt(accountAddress, profileIdx, idx, role).call();
    return { address: userAddress, accountAddress, profileIdx, role, idx };
  }

  async refillAccount({ accountAddress, value }) {
    const contract = await this._contractPromise;
    contract.methods.receiveAmount.cacheSend(accountAddress, {from: accountAddress, value });
  }

  // ADD
  async addProfile({ accountAddress }) {
    const contract = await this._contractPromise;
    contract.methods.addProfile(accountAddress).send({from: accountAddress});
  }

  async addUserPermission({ accountAddress, profileIdx, user, role }) {
    const contract = await this._contractPromise;
    contract.methods.addProfileRole(
      accountAddress, profileIdx, user, role,
    ).send({from: accountAddress});
  }

  async addRequest({ accountAddress, profileIdx, amount, by }) {
    const contract = await this._contractPromise;
    contract.methods.addRequest(accountAddress, profileIdx, amount).send({from: by});
  }

  // EDIT
  async editProfile({ accountAddress, profileIdx, title, consensusPercentage }) {
    const contract = await this._contractPromise;
    contract.methods.editProfile(
      accountAddress, profileIdx,
      contract.web3.utils.toHex(title), consensusPercentage,
    ).send({from: accountAddress});
  }

  // DELETE
  async removeProfile({ accountAddress, profileIdx }) {
    const contract = await this._contractPromise;
    contract.methods.removeProfile(accountAddress, profileIdx).send({from: accountAddress});
  }

  async removeUserPermission({ accountAddress, profileIdx, user, role }) {
    const contract = await this._contractPromise;
    contract.methods.removeProfileRole(
      accountAddress, profileIdx, user, role,
    ).send({from: accountAddress});
  }

}

let HubApiPrivate = null;
const exposedMethods = [
  'fetchAccount', 'fetchProfile', 'fetchUserPermission',
  'refillAccount',
  'addRequest',
  'addProfile', 'editProfile', 'removeProfile',
  'addUserPermission', 'removeUserPermission',
];

const HubApiSingleton = {

  init(drizzle) {
    if (HubApiPrivate) {
      return;
    }
    HubApiPrivate = new HubApi(drizzle);
    exposedMethods.forEach(method => {
      HubApiSingleton[method] = (...args) => HubApiPrivate[method](...args);
    });
    this.SIGNS_MAP = HubApiPrivate.SIGNS_MAP;
  },

};


export default HubApiSingleton;
