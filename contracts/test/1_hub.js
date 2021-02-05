const Hub = artifacts.require('Hub');


contract('Hub', (accounts) => {

  beforeEach(async () => {
    this.instance = await Hub.deployed();

    // Owner of account on the contract
    this.ACCOUNT_OWNER = accounts[1];
    // User who fill up the balance
    this.ACCOUNT_SENDER = accounts[2];
  });


  it('It works', async () => {
    assert.isOk(this.instance, 'Instance is truthy');
  });


  /**
  - Account is not accessable initially;
  - Account can be toped up;
  - Account is accessable after;
  */
  it('receiveAmount', async () => {
    const amount = 1000;
    const balanceBefore = await web3.eth.getBalance(this.instance.address);
    const initialAccount = await this.instance.account(this.ACCOUNT_OWNER);
    assert.equal(initialAccount.balance, 0, 'Initial balance');
    assert.equal(initialAccount.profilesSize, 0, 'Initial profilesSize');
    await this.instance.receiveAmount(
      this.ACCOUNT_OWNER,
      {value: amount, from: this.ACCOUNT_SENDER}
    );
    const { balance } = await this.instance.account(this.ACCOUNT_OWNER);
    assert.equal(balance, amount, 'Balance after receiveAmount');

    const balanceAfter = await web3.eth.getBalance(this.instance.address);
    assert.equal(
      balanceAfter - amount,
      balanceBefore,
      'Move amount to contract account',
    );
  });


  it('receive', async () => {
    const amount = 1000;
    await this.instance.send(amount, {value: amount, from: this.ACCOUNT_SENDER});
    const { balance } = await this.instance.account(this.ACCOUNT_SENDER);
    assert.equal(balance, amount, 'Balance after receive');
  });


});