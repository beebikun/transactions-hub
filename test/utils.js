const Hub = artifacts.require('Hub');
const ROLES = {
  REQUESTER: 0,
  VOTER: 1,
};


const getGasCost = async result => {
  const gasUsed = result.receipt.gasUsed;
  // Obtain gasPrice from the transaction
  const tx = await web3.eth.getTransaction(result.tx);
  return tx.gasPrice * gasUsed;
};


const assertThrow = async (cb, msg, expectedError = '') => cb().then(() => {
    throw new Error(`${msg}: promise wasn't rejected`);
  }).catch(err => {
    assert.include(err.message, expectedError, `${msg}: error message`);
  });


const prepareProfile = async ({
  instance,
  account,
  voters, requester,
  amount = 1,
  consensusPercentage = 100,
}) => {
  if (!instance) {
    instance = await Hub.deployed();
  }
  if (!requester) {
    requester = account;
  }
  if (!voters) {
    voters = [account];
  }
  await instance.receiveAmount(account, {value: amount});
  const {
    profilesSize: profileIdx,
    balance: balanceBefore,
  } = await instance.account(account);
  const transactionsSizeBefore = await instance.txSize(account);
  await instance.addProfile({from: account});
  const profileId = await instance.profileIdAt(account, profileIdx);
  await instance.editProfile(profileId, '0x00', consensusPercentage, {from: account});
  await instance.addProfileRole(profileId, requester, ROLES.REQUESTER, {from: account});
  for (let i = voters.length - 1; i >= 0; i--) {
    await instance.addProfileRole(profileId, voters[i], ROLES.VOTER, {from: account});
  }

  return {
    profileIdx,
    profileId,
    balanceBefore,
    transactionsSizeBefore,
  };
};

module.exports = {
  getGasCost,
  assertThrow,
  prepareProfile,
  zeroBytes: '0x0000000000000000000000000000000000000000000000000000000000000000',
};
