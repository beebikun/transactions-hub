const Hub = artifacts.require('Hub');

const utils = require('./utils');

contract('Accountable: Profiles', (accounts) => {

  beforeEach(async () => {
    this.instance = await Hub.deployed();

    // Owner of account on the contract
    this.ACCOUNT_OWNER = accounts[1];
    await this.instance.receiveAmount(this.ACCOUNT_OWNER, {value: 1});
  });


  /**
  - Account owner can add a new profile
  - Account owner can edit profile
  - Anyone can get list of account profiles
  - Account owner can remove profile
  */
  it('Profiles general', async () => {
    const amount = 1000;
    await this.instance.receiveAmount(
      this.ACCOUNT_OWNER,
      {value: amount});

    const { profilesSize: sizeBefore } = await this.instance.account(this.ACCOUNT_OWNER);
    const idx = sizeBefore;
    await this.instance.addProfile(
      this.ACCOUNT_OWNER,
      {from: this.ACCOUNT_OWNER},
    );
    const title1 = '0x42';
    const consensusPercentage1 = 100;
    await this.instance.editProfile(
      this.ACCOUNT_OWNER,
      idx,
      title1,
      consensusPercentage1,
      {from: this.ACCOUNT_OWNER},
    );

    // get profiles
    const { title: profileTitle } = await this.instance.profile(this.ACCOUNT_OWNER, idx);
    assert.equal(profileTitle, title1.padEnd(66, '0'), 'profile title');

    await this.instance.removeProfile(
      this.ACCOUNT_OWNER,
      idx,
      {from: this.ACCOUNT_OWNER},
    );

    const { profilesSize: sizeAfter } = await this.instance.account(this.ACCOUNT_OWNER);
    assert.equal(
      sizeBefore.toNumber(),
      sizeAfter.toNumber(),
      'Return profiles size to the initial state'
    );
  });


  it('editProfile: not exist', async () => {
    const idx = 1000;
    await utils.assertThrow(
      () => this.instance.editProfile(this.ACCOUNT_OWNER, idx, '0x42', 1, {from: this.ACCOUNT_OWNER}),
      'Revert "editProfile" when profile doesn\'t exist',
      'Profile doesn\'t exist'
    );
  });
  it('removeProfile: not exist', async () => {
    const idx = 1000;
    await utils.assertThrow(
      () => this.instance.removeProfile(this.ACCOUNT_OWNER, idx, {from: this.ACCOUNT_OWNER}),
      'Revert "removeProfile" when profile doesn\'t exist',
      'Profile doesn\'t exist'
    );
  });


  it('addProfile: permissions', async () => {
    await utils.assertThrow(
      () => this.instance.addProfile(this.ACCOUNT_OWNER),
      'Only owner can add profile',
      'Permission denied.'
    );
  });
  it('editProfile: permissions', async () => {
    await utils.assertThrow(
      () => this.instance.editProfile(this.ACCOUNT_OWNER, 0, '0x42', 1),
      'Only owner can edit profile',
      'Permission denied.'
    );
  });
  it('removeProfile: permissions', async () => {
    await utils.assertThrow(
      () => this.instance.removeProfile(this.ACCOUNT_OWNER, 0),
      'Only owner can remove profile',
      'Permission denied.'
    );
  });

});