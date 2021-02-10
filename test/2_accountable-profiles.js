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
    await this.instance.addProfile({from: this.ACCOUNT_OWNER});
    const profileId = await this.instance.profileIdAt(this.ACCOUNT_OWNER, sizeBefore);
    const title1 = '0x42';
    const consensusPercentage1 = 100;
    await this.instance.editProfile(
      profileId,
      title1,
      consensusPercentage1,
      {from: this.ACCOUNT_OWNER},
    );

    // get profiles
    const { title: profileTitle, accountAddress } = await this.instance.profile(profileId);
    assert.equal(profileTitle, title1.padEnd(66, '0'), 'profile title');
    assert.equal(accountAddress, this.ACCOUNT_OWNER, 'profile accountAddress');

    await this.instance.removeProfile(profileId, {from: this.ACCOUNT_OWNER});

    const { profilesSize: sizeAfter } = await this.instance.account(this.ACCOUNT_OWNER);
    assert.equal(
      sizeBefore.toNumber(),
      sizeAfter.toNumber(),
      'Return profiles size to the initial state'
    );

    const removedProfile = await this.instance.profile(profileId);
    assert.equal(removedProfile.title, utils.zeroBytes, 'Clean profile title after removing');
    assert.equal(
      removedProfile.accountAddress,
      '0x0000000000000000000000000000000000000000',
      'Clean profile account after removing'
    );
    assert.equal(removedProfile.consensusPercentage, 0, 'Clean profile consensusPercentage after removing');
  });

  it('remove profile', async () => {
    const instance = await Hub.new();
    await utils.assertThrow(
      () => instance.profileIdAt(this.ACCOUNT_OWNER, 0),
      'Revert "profileIdAt" when account has no profiles',
      'Profile doesn\'t exist.'
    );
    await instance.addProfile({from: this.ACCOUNT_OWNER});
    await instance.addProfile({from: this.ACCOUNT_OWNER});
    await instance.addProfile({from: this.ACCOUNT_OWNER});
    await instance.addProfile({from: this.ACCOUNT_OWNER});
    const profileId1 = await instance.profileIdAt(this.ACCOUNT_OWNER, 1);
    const profileId3 = await instance.profileIdAt(this.ACCOUNT_OWNER, 3);

    // Remove profile from the end of list
    await instance.removeProfile(profileId3, {from: this.ACCOUNT_OWNER});
    await utils.assertThrow(
      () => instance.profileIdAt(this.ACCOUNT_OWNER, 3),
      'Try to get removed profile',
      'Profile doesn\'t exist.'
    );
    // Remove profile from zero position
    const profileId0 = await instance.profileIdAt(this.ACCOUNT_OWNER, 0);
    const profileId2 = await instance.profileIdAt(this.ACCOUNT_OWNER, 2);
    await instance.removeProfile(profileId0, {from: this.ACCOUNT_OWNER});
    const profileAtPosition0 = await instance.profileIdAt(this.ACCOUNT_OWNER, 0);
    assert.equal(profileAtPosition0, profileId2, 'Move last profile to removed place');
    const profileAtPosition1 = await instance.profileIdAt(this.ACCOUNT_OWNER, 1);
    assert.equal(profileAtPosition1, profileId1, 'Do not touch rest of profiles');

    // try to remove the same profiles
    await utils.assertThrow(
      () => instance.removeProfile(profileId3, {from: this.ACCOUNT_OWNER}),
      'Try to removed profileId3 twice',
      'Permission denied.'
    );
    await utils.assertThrow(
      () => instance.removeProfile(profileId0, {from: this.ACCOUNT_OWNER}),
      'Try to removed profileId0 twice',
      'Permission denied.'
    );

    const { profilesSize } = await instance.account(this.ACCOUNT_OWNER);
    assert.equal(profilesSize.toNumber(), 2, '2 profiles left');
    const profileAfterPos0 = await instance.profileIdAt(this.ACCOUNT_OWNER, 0);
    const profileAfterPos1 = await instance.profileIdAt(this.ACCOUNT_OWNER, 1);
    assert.equal(profileAfterPos0, profileId2, 'Finall profile at pos0');
    assert.equal(profileAfterPos1, profileId1, 'Finall profile at pos1');
  });


  it('editProfile: not exist', async () => {
    await utils.assertThrow(
      () => this.instance.editProfile(utils.zeroBytes, '0x42', 1, {from: this.ACCOUNT_OWNER}),
      'Revert "editProfile" when profile doesn\'t exist',
      'Permission denied.'
    );
  });
  it('removeProfile: not exist', async () => {
    const idx = 1000;
    await utils.assertThrow(
      () => this.instance.removeProfile(utils.zeroBytes, {from: this.ACCOUNT_OWNER}),
      'Revert "removeProfile" when profile doesn\'t exist',
      'Permission denied.'
    );
  });


  it('editProfile: permissions', async () => {
    const instance = await Hub.new();
    await this.instance.addProfile({from: this.ACCOUNT_OWNER});
    const profileId = await this.instance.profileIdAt(this.ACCOUNT_OWNER, 0);
    await utils.assertThrow(
      () => this.instance.editProfile(profileId, '0x42', 1),
      'Only owner can edit profile',
      'Permission denied.'
    );
  });
  it('removeProfile: permissions', async () => {
    const instance = await Hub.new();
    await this.instance.addProfile({from: this.ACCOUNT_OWNER});
    const profileId = await this.instance.profileIdAt(this.ACCOUNT_OWNER, 0);
    await utils.assertThrow(
      () => this.instance.removeProfile(profileId),
      'Only owner can remove profile',
      'Permission denied.'
    );
  });

});
