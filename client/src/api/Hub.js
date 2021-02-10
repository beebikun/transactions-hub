import * as ACTIONS from '../actions';


class HubApi {
  constructor(drizzle) {
    this.SIGNS_MAP = {};
    this._activeUser = null;
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
          if (['addProfileRole', 'removeProfileRole'].includes(name)) {
            return ACTIONS.fetchProfile({
              profileId: result.profileId,
            });
          }
          return ACTIONS.profileReceived({ result });
        };
      }
    });
  }


  // Atm we do not need to fetch any user except of active one. But if we will - do not use `cacheCall`
  // for the rest of users.
  async fetchActiveUser(accountAddress) {
    this._activeUser = accountAddress;
    // DEBUG
    window.address = accountAddress;
    const contract = await this._contractPromise;
    const hash = contract.methods.account.cacheCall(accountAddress);
    return hash;
  }

  async refillAccount({ accountAddress, value }) {
    const contract = await this._contractPromise;
    contract.methods.receiveAmount.cacheSend(accountAddress, {from: this._activeUser, value });
  }

  // GET
  async fetchProfileIds({ accountAddress, profilesSize }) {
    const contract = await this._contractPromise;
    const result = [];
    for (var idx = 0; idx < profilesSize; idx++) {
      const profileId = await contract.methods.profileIdAt(accountAddress, idx).call();
      result.push(profileId);
    }
    return result;
  }

  async fetchProfile({ profileId }) {
    const contract = await this._contractPromise;
    const result = await contract.methods.profile(profileId).call();
    return { ...result, profileId };
  }

  async fetchUserPermission({ profileId, role, idx}) {
    const contract = await this._contractPromise;
    const userAddress = await contract.methods.profileRoleAt(profileId, idx, role).call();
    return { address: userAddress, profileId, role, idx };
  }

  async fetchTxIds({ accountAddress, n = 100 }) {
    const contract = await this._contractPromise;
    let size = await contract.methods.txSize(accountAddress).call();
    size = parseInt(size || 0, 10);
    n = Math.min(size, n);
    const result = new Set();
    for (var idx = size - n; idx < size; idx++) {
      const txId = await contract.methods.txAt(accountAddress, idx).call();
      result.add(txId);
    }
    return Array.from(result);
  }

  async fetchTransaction({ txId }) {
    const contract = await this._contractPromise;
    const result = await contract.methods.transactions(txId).call();
    result.voters = {};
    result.txId = txId;
    for (var idx = 0; idx < result.votersSize; idx++) {
      const voter = await contract.methods.txVoterAt(txId, idx).call();
      result.voters[voter.addr] = voter;
    }
    return result;
  }

  // ADD
  async addProfile() {
    const contract = await this._contractPromise;
    contract.methods.addProfile().send({from: this._activeUser});
  }

  async addUserPermission({ profileId, user, role }) {
    const contract = await this._contractPromise;
    contract.methods.addProfileRole(profileId, user, role).send({from: this._activeUser});
  }

  async addRequest({ profileId, amount, to }) {
    const contract = await this._contractPromise;
    contract.methods.addRequest(profileId, amount, to).send({from: this._activeUser});
  }

  // EDIT
  async editProfile({ profileId, title, consensusPercentage }) {
    const contract = await this._contractPromise;
    contract.methods.editProfile(
      profileId,
      contract.web3.utils.toHex(title), consensusPercentage,
    ).send({from: this._activeUser});
  }

  // DELETE
  async removeProfile({ profileId }) {
    const contract = await this._contractPromise;
    contract.methods.removeProfile(profileId).send({from: this._activeUser});
  }

  async removeUserPermission({ profileId, user, role }) {
    const contract = await this._contractPromise;
    contract.methods.removeProfileRole(
      profileId, user, role,
    ).send({from: this._activeUser});
  }

}

let HubApiPrivate = null;
const exposedMethods = [
  'fetchActiveUser',
  'fetchProfileIds', 'fetchProfile',
  'fetchUserPermission',
  'refillAccount',
  'addRequest',
  'addProfile', 'editProfile', 'removeProfile',
  'addUserPermission', 'removeUserPermission',
  'fetchTxIds', 'fetchTransaction',
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
