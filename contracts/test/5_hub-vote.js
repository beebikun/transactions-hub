const Hub = artifacts.require('Hub');

const utils = require('./utils');

const VOTE_STATUSES = {
  UNSET: 0,
  PENDING: 1,
  APPROVE: 2,
  REJECT: 3,
};


const TRANSACTION_STATUSES = {
  UNSET: 0,
  PENDING: 1,
  APPROVED: 2,
  REJECTED: 3,
};


contract('Hub: vote', (accounts) => {

  beforeEach(async () => {
    this.instance = await Hub.deployed();

    // Owner of account on the contract
    this.ACCOUNT_OWNER = accounts[1];
    this.TO = accounts[2];
    this.REQESTER = accounts[4];
    this.AMOUNT = 1000;

    this.prepareTx = async ({ account, voters, to, amount, consensusPercentage = 100 }) => {
      if (!account) {
        account = this.ACCOUNT_OWNER;
      }
      if (!to) {
        to = this.TO;
      }
      if (!amount) {
        amount = this.AMOUNT;
      }
      const requester = this.REQESTER;
      const { profileIdx } = await utils.prepareProfile({
        account, voters, requester, amount, consensusPercentage,
      });
      await this.instance.addRequest(account, profileIdx, amount, to, {from: requester});
      const txSizeAfter = await this.instance.txSize(this.ACCOUNT_OWNER);
      const txId = await this.instance.txAt(this.ACCOUNT_OWNER, txSizeAfter - 1);
      return txId;
    };
  });


  it('vote: unknown status', async () => {
    const voter = accounts[3];
    const txId = await this.prepareTx({ voters: [voter] });
    await utils.assertThrow(
      () => this.instance.vote(txId, VOTE_STATUSES.UNSET, { from: voter }),
      'Revert with unknown vote status',
      'Unknown vote status'
    );
  });


  it('vote: consensus positive', async () => {
    const voter1 = accounts[3];
    const voter2 = accounts[4];
    const voter3 = accounts[5];
    const voter4 = accounts[4];
    const toBalanceBefore = await web3.eth.getBalance(this.TO);
    const txId = await this.prepareTx({
      voters: [voter1, voter2, voter3, voter4],
      consensusPercentage: 66,
    });
    const tx = await this.instance.transactions(txId);
    assert.equal(tx.consensus.toNumber(), 2, '2 votes are enough for consensus');

    const result1 = await this.instance.vote(txId, VOTE_STATUSES.APPROVE, { from: voter1 });
    assert.equal(result1.logs.length, 1, '1/4 votes: emit vote event');
    const log1 = result1.logs[0];
    assert.equal(log1.event, 'TransactionVote', '1/4 votes: event name');
    assert.include(
      log1.args,
      {
        __length__: 4,
        voter: voter1,
        account: this.ACCOUNT_OWNER,
      },
      '1/4 votes: event args',
    );
    assert.equal(log1.args.uid.toNumber(), txId, '1/4 votes: event txId');
    assert.equal(log1.args.status.toNumber(), VOTE_STATUSES.APPROVE, '1/4 votes: event status');
    const tx1 = await this.instance.transactions(txId);
    assert.equal(tx1.status, TRANSACTION_STATUSES.PENDING, '1/4 votes: Tx is still pending');
    assert.equal(tx1.approvalCount, 1, '1/4 votes: approvalCount');
    assert.equal(tx1.rejectCount, 0, '1/4 votes: rejectCount');

    const result2 = await this.instance.vote(txId, VOTE_STATUSES.REJECT, { from: voter2 });
    assert.equal(result2.logs.length, 1, '2/4 votes: emit vote event');
    const log2 = result2.logs[0];
    assert.equal(log2.event, 'TransactionVote', '2/4 votes: event name');
    assert.include(
      log2.args,
      {
        __length__: 4,
        voter: voter2,
        account: this.ACCOUNT_OWNER,
      },
      '2/4 votes: event args',
    );
    assert.equal(log2.args.uid.toNumber(), txId, '2/4 votes: event txId');
    assert.equal(log2.args.status.toNumber(), VOTE_STATUSES.REJECT, '2/4 votes: event status');
    const tx2 = await this.instance.transactions(txId);
    assert.equal(tx2.status, TRANSACTION_STATUSES.PENDING, '2/4 votes: Tx is still pending');
    assert.equal(tx2.approvalCount, 1, '2/4 votes: approvalCount');
    assert.equal(tx2.rejectCount, 1, '2/4 votes: rejectCount');

    const result3 = await this.instance.vote(txId, VOTE_STATUSES.APPROVE, { from: voter3 });
    assert.equal(result3.logs.length, 2, '3/4 votes: emit vote and response events');
    const log3 = result3.logs[0];
    assert.equal(log3.event, 'TransactionVote', '3/4 votes: vote event name');
    assert.include(
      log3.args,
      {
        __length__: 4,
        voter: voter3,
        account: this.ACCOUNT_OWNER,
      },
      '3/4 votes: vote event args',
    );
    assert.equal(log3.args.uid.toNumber(), txId, '3/4 votes: vote event txId');
    assert.equal(log3.args.status.toNumber(), VOTE_STATUSES.APPROVE, '3/4 votes: vote event status');
    const log4 = result3.logs[1];
    assert.equal(log4.event, 'TransactionResponse', '3/4 votes: response event name');
    assert.include(
      log4.args,
      {
        __length__: 5,
        to: this.TO,
        account: this.ACCOUNT_OWNER,
        by: this.REQESTER
      },
      '3/4 votes: response event args',
    );
    assert.equal(
      log4.args.uid.toNumber(), txId, '3/4 votes: response event txId');
    assert.equal(
      log4.args.status.toNumber(),
      TRANSACTION_STATUSES.APPROVED,
      '3/4 votes: response event status'
    );
    const tx3 = await this.instance.transactions(txId);
    assert.equal(tx3.approvalCount, 2, '3/4 votes: approvalCount');
    assert.equal(tx3.rejectCount, 1, '3/4 votes: rejectCount');
    assert.equal(
      tx3.status,
      TRANSACTION_STATUSES.APPROVED,
      '3/4 votes: Change tx status w/o waiting for 4 vote'
    );

    const toBalanceAfter = await web3.eth.getBalance(this.TO);
    assert.equal(
      toBalanceBefore,
      toBalanceAfter - this.AMOUNT,
      'Move amount to "to" account'
    );
  });


  it('vote: consensus negative', async () => {
    const voter1 = accounts[3];
    const voter2 = accounts[4];
    const voter3 = accounts[5];
    const voter4 = accounts[6];
    const toBalanceBefore = await web3.eth.getBalance(this.TO);
    const txId = await this.prepareTx({
      voters: [voter1, voter2, voter3, voter4],
      consensusPercentage: 45,
    });
    const {
      balance: accountBalanceBefore
    } = await this.instance.account(this.ACCOUNT_OWNER);
    const tx = await this.instance.transactions(txId);
    assert.equal(tx.consensus.toNumber(), 2, '2 votes are enough for consensus');

    await this.instance.vote(txId, VOTE_STATUSES.APPROVE, { from: voter1 });
    await this.instance.vote(txId, VOTE_STATUSES.REJECT, { from: voter2 });

    const result3 = await this.instance.vote(txId, VOTE_STATUSES.REJECT, { from: voter3 });
    assert.equal(result3.logs.length, 2, '3/4 votes: emit vote and response events');
    const log3 = result3.logs[0];
    assert.equal(log3.event, 'TransactionVote', '3/4 votes: vote event name');
    assert.include(
      log3.args,
      {
        __length__: 4,
        voter: voter3,
        account: this.ACCOUNT_OWNER,
      },
      '3/4 votes: vote event args',
    );
    assert.equal(log3.args.uid.toNumber(), txId, '3/4 votes: vote event txId');
    assert.equal(log3.args.status.toNumber(), VOTE_STATUSES.REJECT, '3/4 votes: vote event status');
    const log4 = result3.logs[1];
    assert.equal(log4.event, 'TransactionResponse', '3/4 votes: response event name');
    assert.include(
      log4.args,
      {
        __length__: 5,
        to: this.TO,
        account: this.ACCOUNT_OWNER,
        by: this.REQESTER
      },
      '3/4 votes: response event args',
    );
    assert.equal(
      log4.args.uid.toNumber(), txId, '3/4 votes: response event txId');
    assert.equal(
      log4.args.status.toNumber(),
      TRANSACTION_STATUSES.REJECTED,
      '3/4 votes: response event status'
    );
    const tx3 = await this.instance.transactions(txId);
    assert.equal(tx3.approvalCount, 1, '3/4 votes: approvalCount');
    assert.equal(tx3.rejectCount, 2, '3/4 votes: rejectCount');
    assert.equal(
      tx3.status,
      TRANSACTION_STATUSES.REJECTED,
      '3/4 votes: Change tx status w/o waiting for 4 vote'
    );

    const toBalanceAfter = await web3.eth.getBalance(this.TO);
    assert.equal(
      toBalanceBefore,
      toBalanceAfter,
      'Do not move money to "to"'
    );
    const {
      balance: accountBalanceAfter
    } = await this.instance.account(this.ACCOUNT_OWNER);
    assert.equal(
      accountBalanceAfter,
      accountBalanceBefore.toNumber() + this.AMOUNT,
      'Return money to account'
    );

    await utils.assertThrow(
      () => this.instance.vote(txId, VOTE_STATUSES.REJECT, { from: voter4 }),
      'Don\'t allow votes after consensus was reached',
      'Transaction voting is closed.'
    );
  });


  it('vote: no consensus', async () => {
    const voter1 = accounts[3];
    const voter2 = accounts[4];
    const toBalanceBefore = await web3.eth.getBalance(this.TO);
    const txId = await this.prepareTx({
      voters: [voter1, voter2],
      consensusPercentage: 100,
    });
    const {
      balance: accountBalanceBefore
    } = await this.instance.account(this.ACCOUNT_OWNER);
    const tx = await this.instance.transactions(txId);
    assert.equal(tx.consensus.toNumber(), 2, '2 votes are required for consensus');

    await this.instance.vote(txId, VOTE_STATUSES.APPROVE, { from: voter1 });
    const result3 = await this.instance.vote(txId, VOTE_STATUSES.REJECT, { from: voter2 });
    assert.equal(result3.logs.length, 2, 'Emit vote and response events');
    const log4 = result3.logs[1];
    assert.equal(log4.event, 'TransactionResponse', 'Response event name');
    assert.include(
      log4.args,
      {
        __length__: 5,
        to: this.TO,
        account: this.ACCOUNT_OWNER,
        by: this.REQESTER
      },
      'Response event args',
    );
    assert.equal(
      log4.args.uid.toNumber(), txId, 'Response event txId');
    assert.equal(
      log4.args.status.toNumber(),
      TRANSACTION_STATUSES.REJECTED,
      'Response event status'
    );
    const tx3 = await this.instance.transactions(txId);
    assert.equal(tx3.approvalCount, 1, 'approvalCount');
    assert.equal(tx3.rejectCount, 1, 'rejectCount');

    const toBalanceAfter = await web3.eth.getBalance(this.TO);
    assert.equal(
      toBalanceBefore,
      toBalanceAfter,
      'Do not move money to "to"'
    );
    const {
      balance: accountBalanceAfter
    } = await this.instance.account(this.ACCOUNT_OWNER);
    assert.equal(
      accountBalanceAfter,
      accountBalanceBefore.toNumber() + this.AMOUNT,
      'Return money to account'
    );
  });

  it('vote: Permission denied', async () => {
    const voter = accounts[3];
    const txId = await this.prepareTx({ voters: [voter] });
    await utils.assertThrow(
      () => this.instance.vote(txId, VOTE_STATUSES.UNSET, { from: this.ACCOUNT_OWNER }),
      'Only voters can vote',
      'Permission denied.'
    );
  });

  it('vote: double voting protection', async () => {
    const voter1 = accounts[3];
    const voter2 = accounts[4];
    const txId = await this.prepareTx({
      voters: [voter1, voter2],
      consensusPercentage: 100,
    });
    const tx = await this.instance.transactions(txId);
    assert.equal(tx.consensus.toNumber(), 2, '2 votes are required for consensus');

    await this.instance.vote(txId, VOTE_STATUSES.APPROVE, { from: voter1 });
    await utils.assertThrow(
      () => this.instance.vote(txId, VOTE_STATUSES.REJECT, { from: voter1 }),
      'Only voters can vote',
      'Permission denied.'
    );
  });


});