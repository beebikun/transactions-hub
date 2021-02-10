// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;


import "./AddressStorageLib.sol";
import "./ProfileStorageLib.sol";


/**
 * @title AccountStorage
 * @notice Provides interface for account balance and its profiles.
 */
contract AccountStorage {
    enum Roles {REQUESTER, VOTER}

    struct Profile {
        // Keep title short :)
        bytes32 title;
        address account;

        // VOTER - can vote for transaction request, cannot send
        // REQUESTER - can send request, cannot vote.
        AddressStorageLib.Permissions requsters;
        AddressStorageLib.Permissions voters;
        // 1-100;
        uint8 consensusPercentage;
    }

    struct Account {
        address owner;
        uint balance;
        ProfileStorageLib.Profiles profiles;
    }

    mapping(address => Account) internal accounts;
    mapping(bytes32 => Profile) internal profiles;

    /**
     * @dev Throws if caller doesn't have `requester` permissions for profile
     *      by `profileId` doesn't exists in `accountAddress` address.
     */
    modifier requireProfileRequester(bytes32 profileId) {
        require(
            AddressStorageLib.has(
                profiles[profileId].requsters,
                tx.origin
            ),
            "Permission denied."
        );
        _;
    }

    // *** Getter Methods ***

    /**
     * @notice Get account balance and number of profiles.
     * @dev To get all account profiles, use `for` loop for `profilesSize`
     *      with `profile` method.
     * @param accountAddress Address of account
     * @return balance
     * @return profilesSize
     */
    function account(address accountAddress) external view
        returns (uint balance, uint profilesSize)
    {
        return (
            accounts[accountAddress].balance,
            accounts[accountAddress].profiles.keys.length
        );
    }

    /**
     * @notice Get profile details.
     * @dev Use `profilesSize` from `account` method response to get maximum
     *      profile index.
     *      To get all profile requesters/voters, use `for` loop for
     *      `requstersSize`/`votersSize` with `profileRoleAt`.
     * @param profileId Profile id
     * @return accountAddress
     * @return title
     * @return consensusPercentage
     * @return requstersSize
     * @return votersSize
     */
    function profile(bytes32 profileId) external view
        returns (
            address accountAddress,
            bytes32 title,
            uint8 consensusPercentage,
            uint requstersSize,
            uint votersSize
        )
    {
        return (
            profiles[profileId].account,
            profiles[profileId].title,
            profiles[profileId].consensusPercentage,
            profiles[profileId].requsters.keys.length,
            profiles[profileId].voters.keys.length
        );
    }

    function profileIdAt(address accountAddress, uint profileIdx)
        external view
        returns (bytes32)
    {
        require(
            profileIdx + 1 <= accounts[accountAddress].profiles.keys.length,
            "Profile doesn't exist."
        );
        return accounts[accountAddress].profiles.keys[profileIdx];
    }

    /**
     * @notice Get user address in roles array by index.
     * @dev Use `requstersSize`/`votersSize` from `profile` response to get
     *      max possible index.
     * @param profileId Profile id
     * @return address
     */
    function profileRoleAt(
        bytes32 profileId,
        uint userIdx,
        Roles role
    )
        external view
        returns (address)
    {
        if (role == Roles.VOTER) {
            return AddressStorageLib.at(
                profiles[profileId].voters,
                userIdx
            );
        }
        else {
            return AddressStorageLib.at(
                profiles[profileId].requsters,
                userIdx
            );
        }
    }

    // *** Setter Methods ***

    /**
     * @notice Add a new empty profile to account.
     * @dev Use `editProfile` to set profile details.
     */
    function addProfile() external
    {
        address accountAddress = tx.origin;
        bytes32 profileId = ProfileStorageLib.add(
            accounts[accountAddress].profiles,
            accountAddress
        );
        profiles[profileId].account = accountAddress;
    }

    /**
     * @notice Edit profile details.
     * @dev Throws if:
     *      - Caller isn't account owner;
     *      - Profile at index doesn't exist;
     * @param profileId Profile id
     * @param title Title in bytes32
     * @param consensusPercentage Consensus percentage 1-100
     */
    function editProfile(
        bytes32 profileId,
        bytes32 title,
        uint8 consensusPercentage
    )
        external
    {
        requireProfileOwner(profileId);
        profiles[profileId].title = title;
        profiles[profileId].consensusPercentage = consensusPercentage;
    }

    /**
     * @notice Grant `role` permission for `user` in profile.
     * @dev Throws if:
     *      - Caller isn't account owner;
     *      - Profile at index doesn't exist;
     * @param profileId Profile id
     * @param user User address
     * @param role `Roles` enum
     */
    function addProfileRole(
        bytes32 profileId,
        address user,
        Roles role
    )
        external
    {
        requireProfileOwner(profileId);
        if (role == Roles.VOTER) {
            AddressStorageLib.add(profiles[profileId].voters, user);
        }
        else {
            AddressStorageLib.add(profiles[profileId].requsters, user);
        }
    }

    // *** Delete Methods ***

    /**
     * @notice Removes profiles by index.
     * @dev Throws if:
     *      - Caller isn't account owner;
     *      - Profile at index doesn't exist;
     * @param profileId Profile id
     */
    function removeProfile(bytes32 profileId)
        external
    {
        requireProfileOwner(profileId);
        address accountAddress = profiles[profileId].account;
        AddressStorageLib.clear(profiles[profileId].requsters);
        AddressStorageLib.clear(profiles[profileId].voters);
        profiles[profileId].consensusPercentage = 0;
        profiles[profileId].title = '';
        profiles[profileId].account = address(0);
        ProfileStorageLib.remove(accounts[accountAddress].profiles, profileId);
    }

    /**
     * @notice Revoke `role` permission for `user` in profile.
     * @dev Throws if:
     *      - Caller isn't account owner;
     *      - Profile at index doesn't exist;
     * @param profileId Profile id
     * @param user User address
     * @param role `Roles` enum
     */
    function removeProfileRole(
        bytes32 profileId,
        address user,
        Roles role
    )
        external
    {
        requireProfileOwner(profileId);
        if (role == Roles.VOTER) {
            AddressStorageLib.remove(profiles[profileId].voters, user);
        }
        else {
            AddressStorageLib.remove(profiles[profileId].requsters, user);
        }
    }

    // *** Throw functions ***

    /**
     * @dev Throws if profile by `profileId` doesn't exists in
     *      `accountAddress` address.
     */
    function requireProfileOwner(bytes32 profileId) internal view {
        require(
            tx.origin == profiles[profileId].account,
            "Permission denied."
        );
    }


}
