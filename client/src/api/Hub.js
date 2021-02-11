import * as ACTIONS from '../actions';


class HubApi {
  init(drizzle) {
    this.SIGNS_MAP = {};

    let activeUserResolve;
    // wait for it for `send` operation as it returns `{ contract, activeUser}`
    this.sendPromise = new Promise((resolve, reject) => {
      activeUserResolve = resolve;
    });
    // wait for it for `call` operations as it returns `contract`;
    let contractPromiseResolve;
    this.getPromise = new Promise((resolve, reject) => {
      contractPromiseResolve = resolve;
    });

    this.fetchActiveUser = async (accountAddress) => {
      this.sendPromise.value = accountAddress;
      const contract = await this.getPromise;
      const hash = contract.methods.account.cacheCall(accountAddress);
      activeUserResolve({ activeUser: accountAddress, contract });
      return hash;
    };

    const unsubscribe = drizzle.store.subscribe(() => {
      const drizzleState = drizzle.store.getState();
      if (drizzleState.contracts?.Hub?.initialized) {
        const contract = drizzle.contracts.Hub;
        // DEBUG
        window.contract = contract;
        contractPromiseResolve(contract);
        this._generateFunctionNames(contract);
        unsubscribe();
      }
    });
  }

  _generateFunctionNames(contract) {
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

  // is called from middleware, so we cannot wait for sendPromise resolve
  // because it may be:
  // 1) user is not loaded yet
  // 2) transaction even came
  // 3) we waited for sendPromise resolve and answer with true
  // 4) transaction from event is fetched
  // 5) transaction is fetched one more time as a part of user transaction loading
  // 6) :(
  isActiveUserInTransactionEvent(event) {
    const activeUser = this.sendPromise.value;
    return event.by === activeUser ||
      event.address === activeUser ||
      event.to === activeUser ||
      event.voters.includes(activeUser);
  }

  async refillAccount({ accountAddress, value }) {
    const { contract, activeUser } = await this.sendPromise;
    contract.methods.receiveAmount(accountAddress).cacheSend({from: activeUser, value });
  }

  async fetchProfileIds({ accountAddress, profilesSize }) {
    const contract = await this.getPromise;
    const result = [];
    for (var idx = 0; idx < profilesSize; idx++) {
      const profileId = await contract.methods.profileIdAt(accountAddress, idx).call();
      result.push(profileId);
    }
    return result;
  }

  async fetchProfile({ profileId }) {
    const contract = await this.getPromise;
    const result = await contract.methods.profile(profileId).call();
    return { ...result, profileId };
  }

  async fetchUserPermission({ profileId, role, idx}) {
    const contract = await this.getPromise;
    const userAddress = await contract.methods.profileRoleAt(profileId, idx, role).call();
    return { address: userAddress, profileId, role, idx };
  }

  async fetchTxIds({ accountAddress, n = 100 }) {
    const contract = await this.getPromise;
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
    const contract = await this.getPromise;
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
    const { contract, activeUser } = await this.sendPromise;
    contract.methods.addProfile().send({from: activeUser});
  }

  async addUserPermission({ profileId, user, role }) {
    const { contract, activeUser } = await this.sendPromise;;
    contract.methods.addProfileRole(profileId, user, role).send({from: activeUser});
  }

  async addRequest({ profileId, amount, to }) {
    const { contract, activeUser } = await this.sendPromise;
    contract.methods.addRequest(profileId, amount, to).send({from: activeUser});
  }

  // EDIT
  async editProfile({ profileId, title, consensusPercentage }) {
    const { contract, activeUser } = await this.sendPromise;
    contract.methods.editProfile(
      profileId,
      contract.web3.utils.toHex(title), consensusPercentage,
    ).send({from: activeUser});
  }

  async sendVote({ txId, status }) {
    const { contract, activeUser } = await this.sendPromise;
    contract.methods.vote(txId, status).send({from: activeUser});
  }

  // DELETE
  async removeProfile({ profileId }) {
    const { contract, activeUser } = await this.sendPromise;
    contract.methods.removeProfile(profileId).send({from: activeUser});
  }

  async removeUserPermission({ profileId, user, role }) {
    const { contract, activeUser } = await this.sendPromise;
    contract.methods.removeProfileRole(
      profileId, user, role,
    ).send({from: activeUser});
  }

}

const HubApiSingleton = new HubApi();

export default HubApiSingleton;
