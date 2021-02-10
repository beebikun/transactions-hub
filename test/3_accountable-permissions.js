const Hub = artifacts.require('Hub');

const utils = require('./utils');
const ROLES = {
  REQUESTER: 0,
  VOTER: 1,
};


contract('Accountable: Permissions', (accounts) => {

  beforeEach(async () => {
    this.instance = await Hub.deployed();

    // Owner of account on the contract
    this.ACCOUNT_OWNER = accounts[1];

    await this.instance.receiveAmount(this.ACCOUNT_OWNER, {value: 1});
  });

  /**
  - Account owner can add voter/requester to profile
  - Anyone can see list of voters/requesters
  - Account owner can remove voter/requester from profile
  */
  it('Permissions: general', async () => {
    const {
      profilesSize: profileIdx,
    } = await this.instance.account(this.ACCOUNT_OWNER);
    await this.instance.addProfile({from: this.ACCOUNT_OWNER});
    const profileId = await this.instance.profileIdAt(this.ACCOUNT_OWNER, profileIdx);

    const voter = accounts[9];
    const requester1 = accounts[8];
    const requester2 = accounts[7];

    await this.instance.addProfileRole(
      profileId,
      voter,
      ROLES.VOTER,
      {from: this.ACCOUNT_OWNER}
    );
    await this.instance.addProfileRole(
      profileId,
      requester1,
      ROLES.REQUESTER,
      {from: this.ACCOUNT_OWNER}
    );
    await this.instance.addProfileRole(
      profileId,
      requester2,
      ROLES.REQUESTER,
      {from: this.ACCOUNT_OWNER}
    );

    const profile = await this.instance.profile(profileId);
    assert.equal(profile.requstersSize, 2, 'Profile requstersSize');
    assert.equal(profile.votersSize, 1, 'Profile votersSize');

    const voterResponse = await this.instance.profileRoleAt(
      profileId,
      0,
      ROLES.VOTER,
    );
    assert.equal(voterResponse, voter, 'Anyone can get receiver user at idx');
    const requesterResponseAfterSecond1 = await this.instance.profileRoleAt(
      profileId,
      0,
      ROLES.REQUESTER,
    );
    const requesterResponseAfterSecond2 = await this.instance.profileRoleAt(
      profileId,
      1,
      ROLES.REQUESTER,
    );
    assert.equal(requesterResponseAfterSecond1, requester1, 'Set first user as requester #1');
    assert.equal(requesterResponseAfterSecond2, requester2, 'Set second user as requester #2');

    await this.instance.removeProfileRole(
      profileId,
      voter,
      ROLES.VOTER,
      {from: this.ACCOUNT_OWNER}
    );
    const {
      votersSize: votersSizeAfter,
    } = await this.instance.profile(profileId);
    assert.equal(votersSizeAfter.toNumber(), 0, 'Return size of voters to the initial state');
    await this.instance.removeProfileRole(
      profileId,
      requester1,
      ROLES.REQUESTER,
      {from: this.ACCOUNT_OWNER}
    );
    const {
      requstersSize: requstersSizeAfter,
    } = await this.instance.profile(profileId);
    assert.equal(requstersSizeAfter.toNumber(), 1, 'Return size of requesters to the initial state');

    // not requester at idx 0 must be requester2
    const requesterResponse2 = await this.instance.profileRoleAt(
      profileId,
      0,
      ROLES.REQUESTER,
     );
    assert.equal(requesterResponse2, requester2, 'Move users in array during delete');
    await utils.assertThrow(
      () => this.instance.profileRoleAt(
        profileId,
        1,
        ROLES.REQUESTER,
       ),
      'Attept to "profileRoleAt" old requester user raises error',
      'User at index doesn\'t exist'
    );
    await utils.assertThrow(
      () => this.instance.profileRoleAt(
        profileId,
        0,
        ROLES.VOTER,
       ),
      'Attept to "profileRoleAt" old voter user raises error',
      'User at index doesn\'t exist'
    );

  });

  it('Remove profile: clean permissions', async () => {
    const instance = await Hub.new();
    await instance.addProfile({from: this.ACCOUNT_OWNER});
    const profileId = await instance.profileIdAt(this.ACCOUNT_OWNER, 0);
    const profile = await instance.profile(profileId);
    assert.equal(profile.accountAddress, this.ACCOUNT_OWNER);
    await instance.addProfileRole(
      profileId,
      accounts[2],
      ROLES.REQUESTER,
      {from: this.ACCOUNT_OWNER}
    );
    await instance.addProfileRole(
      profileId,
      accounts[3],
      ROLES.REQUESTER,
      {from: this.ACCOUNT_OWNER}
    );

    await instance.removeProfile(
      profileId,
      {from: this.ACCOUNT_OWNER},
    );
    const removedProfile = await instance.profile(profileId);
    assert.equal(removedProfile.requstersSize, 0, 'Clean profile requstersSize after removing');
    assert.equal(removedProfile.votersSize, 0, 'Clean profile votersSize after removing');
  });

  [
    ['VOTER', 'requstersSize'],
    ['REQUESTER', 'votersSize'],
   ].forEach(([roleName, roleProperty]) => {
    const role = ROLES[roleName];

    it(`addProfileRole ${roleName}: profiles doesn't not exist`, async () => {
      const idx = 1000;
      await utils.assertThrow(
        () => this.instance.addProfileRole(
          utils.zeroBytes,
          accounts[9],
          role,
          {from: this.ACCOUNT_OWNER}
         ),
        'Revert "addProfileRole" when profile doesn\'t exist',
        'Permission denied.'
      );
    });

    it(`addProfileRole ${roleName}: permissions`, async () => {
      const {
        profilesSize: profileIdx,
      } = await this.instance.account(this.ACCOUNT_OWNER);
      await this.instance.addProfile({from: this.ACCOUNT_OWNER});
      const profileId = await this.instance.profileIdAt(this.ACCOUNT_OWNER, profileIdx);
      await utils.assertThrow(
        () => this.instance.addProfileRole(
          profileId,
          accounts[9],
          role
         ),
        'Only owner can "addProfileRole"',
        'Permission denied.'
      );
    });

    it(`removeProfileRole ${roleName}: profile doesn't not exist`, async () => {
      const {
        profilesSize: profileIdx,
      } = await this.instance.account(this.ACCOUNT_OWNER);
      await this.instance.addProfile({from: this.ACCOUNT_OWNER});
      const profileId = await this.instance.profileIdAt(this.ACCOUNT_OWNER, profileIdx);
      const profileBefore = await this.instance.profile(profileId);
      assert.equal(profileBefore[roleProperty].toNumber(), 0, '0 users before');
      // do not throw - basically, do nothing
      await this.instance.removeProfileRole(
        profileId,
        accounts[9],
        role,
        {from: this.ACCOUNT_OWNER}
      );
      const profileAfter = await this.instance.profile(profileId);
      assert.equal(profileAfter[roleProperty].toNumber(), 0, '0 users after');
    });

    it(`removeProfileRole ${roleName}: permissions`, async () => {
      const {
        profilesSize: profileIdx,
      } = await this.instance.account(this.ACCOUNT_OWNER);
      await this.instance.addProfile({from: this.ACCOUNT_OWNER});
      const profileId = await this.instance.profileIdAt(this.ACCOUNT_OWNER, profileIdx);
      await utils.assertThrow(
        () => this.instance.addProfileRole(
          profileId,
          accounts[9],
          role
         ),
        'Only owner can "removeProfileRole"',
        'Permission denied.'
      );
    });

  });

});
