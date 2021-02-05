const Hub = artifacts.require('Hub');

const utils = require('./utils');

contract('Hub: addRequest', (accounts) => {

  beforeEach(async () => {
    this.instance = await Hub.deployed();

    // Owner of account on the contract
    this.ACCOUNT_OWNER = accounts[1];
    await this.instance.receiveAmount(this.ACCOUNT_OWNER, {value: 1});
  });


  it('addRequest', async () => {
    const account = this.ACCOUNT_OWNER;
    const requester = accounts[8];
    const voter1 = accounts[7];
    const voter2 = accounts[6];
    const voter3 = accounts[5];
    const to = accounts[4];
    const amount = 200;

    const users = [
      { addr: this.ACCOUNT_OWNER, name: 'account' },
      { addr: requester, name: 'requester' },
      { addr: voter1, name: 'voter1' },
      { addr: voter2, name: 'voter2' },
      { addr: voter3, name: 'voter3' },
      { addr: to, name: 'to' },
    ];
    for (let i = users.length - 1; i >= 0; i--) {
      const user = users[i];
      user.txSizeBefore = await this.instance.txSize(user.addr);
    }

    const lastUidBefore = await this.instance.lastUid();
    const txId = lastUidBefore.toNumber();
    const consensusPercentage = 30;
    const {
      profileIdx,
      balanceBefore
    } = await utils.prepareProfile({
      account,
      requester,
      voters: [voter1, voter2, voter3],
      amount: amount + 1,
      consensusPercentage,
    });

    const result = await this.instance.addRequest(
      account, profileIdx, amount, to,
      {from: requester}
    );

    assert.isOk(result.logs, 'Result has logs');
    assert.equal(result.logs.length, 1, 'Only one entry in the log');
    const log = result.logs[0];
    assert.equal(log.event, 'TransactionRequest', 'Event in the log');
    assert.include(
      log.args,
      {
        __length__: 6,
        by: requester,
        account: account,
        to: to,
      },
      'Event args',
    );
    assert.equal(log.args.uid.toNumber(), txId);
    assert.equal(log.args.amount, amount);
    assert.deepEqual(Array.from(result.logs[0].args.voters), [voter3, voter2, voter1]);

    const {
      balance: balanceAfter,
    } = await this.instance.account(account);
    assert.equal(balanceAfter.toNumber(), balanceBefore - amount, 'Take money from balance immediately');

    const lastUidAfter = await this.instance.lastUid();
    assert.equal(lastUidAfter.toNumber(), lastUidBefore.toNumber() + 1, 'Increase lastUid');

    const tx = await this.instance.transactions(txId);
    const assertTx = (tx_, msg) => {
      assert.equal(tx_.account, account, `${msg}: Tx account`);
      assert.equal(tx_.amount, amount, `${msg}: Tx amount`);
      assert.equal(tx_.to, to, `${msg}: Tx to`);
      assert.equal(tx_.by, requester, `${msg}: Tx to`);
      assert.equal(tx_.consensus.toNumber(), 1, `${msg}: Tx consensus`);
    };
    assertTx(tx, 'Tx from "transactions"');

    // Each of participants should have transaction to be added to the transactions list
    for (let i = users.length - 1; i >= 0; i--) {
      const user = users[i];
      user.txSizeAfter = await this.instance.txSize(user.addr);
      assert.isAbove(
        user.txSizeAfter.toNumber(),
        user.txSizeBefore.toNumber(),
        `"${user.name}" transactions were increased`
      );
      const idx = user.txSizeAfter - 1;
      const id = await this.instance.txAt(user.addr, idx);
      const userTx = await this.instance.transactions(id);
      assertTx(userTx, user.name);
    }

    const txVotersSize = await this.instance.txVotersSize(txId);
    assert.equal(txVotersSize.toNumber(), 3, 'Tx has 3 voters');
    const txVoter = await this.instance.txVoterAt(txId, 0);
    assert.equal(txVoter.addr, voter3, 'Voter account matches');
    assert.equal(txVoter.status, 1, 'Voter status matches');
  });

  it('no voters in profile: revert', async () => {
    const account = this.ACCOUNT_OWNER;
    const requester = accounts[8];
    const to = accounts[4];
    const amount = 200;

    const {
      profileIdx,
    } = await utils.prepareProfile({
      account,
      requester,
      voters: [],
      amount,
    });

    await utils.assertThrow(
      () => this.instance.addRequest(account, profileIdx, amount, to, { from: requester }),
      'Don\'t allow transactions w/o voters',
      'Transaction request without voters is impossible'
    );
  });

  it('Don\'t allow transaction request for profile with zero consensusPercentage', async () => {
      const {
        profileIdx,
      } = await utils.prepareProfile({
        account: this.ACCOUNT_OWNER,
        requester: this.ACCOUNT_OWNER,
        consensusPercentage: 0,
        amount: 1,
        voters: [accounts[1]],
      });
      await utils.assertThrow(
        () => this.instance.addRequest(
          this.ACCOUNT_OWNER, profileIdx, 1, this.ACCOUNT_OWNER,
          {from: this.ACCOUNT_OWNER}
         ),
        'Tx request for profile with zero consensusPercentage',
        'Transaction request with zero consensusPercentage is impossible.'
      );
    });

  [
    { percentage: 100, expected: 2, voters: [accounts[1], accounts[2]] },
    { percentage: 30, expected: 1, voters: [accounts[1], accounts[2], accounts[3]] },
    { percentage: 34, expected: 2, voters: [accounts[1], accounts[2], accounts[3]] },
    { percentage: 67, expected: 3, voters: [accounts[1], accounts[2], accounts[3]] },
    { percentage: 99, expected: 3, voters: [accounts[1], accounts[2], accounts[3]] },
    { percentage: 101, expected: 3, voters: [accounts[1], accounts[2], accounts[3]] },
  ].forEach(({ percentage, expected, voters }) => {
    it(`Check tx.consensus with percentage "${percentage}" and voters "${voters.length}"`, async () => {
      const lastUidBefore = await this.instance.lastUid();
      const txId = lastUidBefore.toNumber();
      const {
        profileIdx,
      } = await utils.prepareProfile({
        account: this.ACCOUNT_OWNER,
        requester: this.ACCOUNT_OWNER,
        consensusPercentage: percentage,
        amount: 1,
        voters,
      });

      await this.instance.addRequest(
        this.ACCOUNT_OWNER, profileIdx, 1, this.ACCOUNT_OWNER,
        {from: this.ACCOUNT_OWNER}
      );

      const tx = await this.instance.transactions(txId);
      assert.equal(tx.consensus.toNumber(), expected);
    });
  });

  it('Insufficient balance', async () => {
    const account = accounts[2];
    await this.instance.receiveAmount(account, {value: 1});
    const { balance } = await this.instance.account(account);
    const { profileIdx } = await utils.prepareProfile({ account });
    await utils.assertThrow(
      () => this.instance.addRequest(account, profileIdx, balance * 10, account, {from: account}),
      'Revert "addRequest" when user doesn\'t have enough money',
      'Insufficient balance'
    );
  });


  it('No voters', async () => {
    const {
        profileIdx,
    } = await utils.prepareProfile({
      account: this.ACCOUNT_OWNER,
      requester: this.ACCOUNT_OWNER,
      amount: 1,
      voters: [],
    });

    await utils.assertThrow(
      () => this.instance.addRequest(
        this.ACCOUNT_OWNER, profileIdx, 1, this.ACCOUNT_OWNER,
        {from: this.ACCOUNT_OWNER}
      ),
      'Revert when profile has no voters',
    );
  });


  it('Permission denied if account doesn\'t exist', async () => {
    const account = accounts[9];
    await utils.assertThrow(
      () => this.instance.addRequest(account, 0, 1, account, {from: account}),
      'Revert "removeProfileVoter" when profile doesn\'t exist',
      'Permission denied.'
    );
  });
  it('Permission denied if profile doesn\'t exist', async () => {
    const account = accounts[9];
    await this.instance.receiveAmount(account, {value: 1});
    await utils.assertThrow(
      () => this.instance.addRequest(account, 0, 1, account, {from: account}),
      'Revert "removeProfileVoter" when profile doesn\'t exist',
      'Permission denied.'
    );
  });
  it('Permission denied if user doesn\'t have permissions', async () => {
    const account = accounts[8];
    await this.instance.receiveAmount(account, {value: 1});
    const {
      profilesSize: profileIdx,
    } = await this.instance.account(account);
    await this.instance.addProfile(account, {from: account});

    await utils.assertThrow(
      () => this.instance.addRequest(account, profileIdx, 1, account, {from: account}),
      'Revert "removeProfileVoter" when profile doesn\'t exist',
      'Permission denied.'
    );
  });

  it('txAt doesn\'t exist', async () => {
    const instance = await Hub.new();
    const account = accounts[9];
    await utils.assertThrow(
      () => instance.txAt(account, 0),
      'Revert "txAt" when no transactions',
      'Transaction at index doesn\'t exist'
    );
    const {
      profileIdx,
      transactionsSizeBefore
    } = await utils.prepareProfile({ account, instance });
    await instance.addRequest(
      account, profileIdx, 1, account,
      {from: account}
    );
    await utils.assertThrow(
      () => instance.txAt(account, transactionsSizeBefore + 10),
      'Revert "txAt" when no such transaction at idx',
      'Transaction at index doesn\'t exist'
    );
  });

  it('txVoterAt doesn\'t exist', async () => {
    const instance = await Hub.new();
    const account = accounts[9];
    await utils.assertThrow(
      () => instance.txVoterAt(account, 0),
      'Revert "txVoterAt" when no transactions',
      'Voter at index doesn\'t exist'
    );
    const {
      profileIdx,
      transactionsSizeBefore: txId
    } = await utils.prepareProfile({ account, instance, voters: [account] });
    await instance.addRequest(
      account, profileIdx, 1, account,
      {from: account}
    );
    await utils.assertThrow(
      () => instance.txVoterAt(txId, 2),
      'Revert "txAt" when no such transaction at idx',
      'Voter at index doesn\'t exist'
    );
  });


});