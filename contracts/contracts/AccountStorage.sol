// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;


import "./AddressStorageLib.sol";
import "./StorageLib.sol";

/**
 * @title AccountStorage
 * @notice Provides interface for account balance and its profiles.
 */
contract AccountStorage {
    enum Roles {REQUESTER, VOTER}

    struct Profile {
        // Keep title short :)
        bytes32 title;

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
        uint profilesSize;
        mapping (uint => Profile) profiles;
    }

    mapping(address => Account) internal accounts;

    /**
     * @dev Throws if caller doesn't have `requester` permissions for profile
     *      by `profileIdx` doesn't exists in `accountAddress` address.
     */
    modifier requireProfileRequester(address accountAddress, uint profileIdx) {
        require(
            AddressStorageLib.has(
                accounts[accountAddress].profiles[profileIdx].requsters,
                msg.sender
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
    function account (address accountAddress) external view
        returns (uint balance, uint profilesSize)
    {
        return (
            accounts[accountAddress].balance,
            accounts[accountAddress].profilesSize
        );
    }

    /**
     * @notice Get profile details.
     * @dev Use `profilesSize` from `account` method response to get maximum
     *      profile index.
     *      To get all profile requesters/voters, use `for` loop for
     *      `requstersSize`/`votersSize` with `profileRoleAt`.
     * @param accountAddress Address of account
     * @param profileIdx Profile index
     * @return title
     * @return consensusPercentage
     * @return requstersSize
     * @return votersSize
     */
    function profile(address accountAddress, uint profileIdx) external view
        returns (
            bytes32 title,
            uint8 consensusPercentage,
            uint requstersSize,
            uint votersSize
        )
    {
        return (
            accounts[accountAddress].profiles[profileIdx].title,
            accounts[accountAddress].profiles[profileIdx].consensusPercentage,
            accounts[accountAddress].profiles[profileIdx].requsters.keys.length,
            accounts[accountAddress].profiles[profileIdx].voters.keys.length
        );
    }

    /**
     * @notice Get user address in roles array by index.
     * @dev Use `requstersSize`/`votersSize` from `profile` response to get
     *      max possible index.
     * @param accountAddress Address of account
     * @param profileIdx Profile index
     * @return address
     */
    function profileRoleAt(
        address accountAddress,
        uint profileIdx,
        uint userIdx,
        Roles role
    )
        external view
        returns (address)
    {
        if (role == Roles.VOTER) {
            return AddressStorageLib.at(
                accounts[accountAddress].profiles[profileIdx].voters,
                userIdx
            );
        }
        else {
            return AddressStorageLib.at(
                accounts[accountAddress].profiles[profileIdx].requsters,
                userIdx
            );
        }
    }

    // *** Setter Methods ***

    /**
     * @notice Add a new empty profile to account.
     * @dev Use `editProfile` to set profile details.
     *       Throws if:
     *       - Caller isn't account owner;
     * @param accountAddress Address of account
     */
    function addProfile(address accountAddress)
        external
    {
        requireAccountOwner(accountAddress);
        accounts[accountAddress].profilesSize += 1;
    }

    /**
     * @notice Edit profile details.
     * @dev Throws if:
     *      - Caller isn't account owner;
     *      - Profile at index doesn't exist;
     * @param accountAddress Address of account
     * @param profileIdx Profile index
     * @param title Title in bytes32
     * @param consensusPercentage Consensus percentage 1-100
     */
    function editProfile(
        address accountAddress,
        uint profileIdx,
        bytes32 title,
        uint8 consensusPercentage
    )
        external
    {
        requireProfileOwner(accountAddress, profileIdx);
        accounts[accountAddress].profiles[profileIdx].title = title;
        accounts[accountAddress].profiles[profileIdx].consensusPercentage =
            consensusPercentage;
    }

    /**
     * @notice Grant `role` permission for `user` in profile.
     * @dev Throws if:
     *      - Caller isn't account owner;
     *      - Profile at index doesn't exist;
     * @param accountAddress Address of account
     * @param profileIdx Profile index
     * @param user User address
     * @param role `Roles` enum
     */
    function addProfileRole(
        address accountAddress,
        uint profileIdx,
        address user,
        Roles role
    )
        external
    {
        requireProfileOwner(accountAddress, profileIdx);
        if (role == Roles.VOTER) {
            AddressStorageLib.add(
                accounts[accountAddress].profiles[profileIdx].voters,
                user
            );
        }
        else {
            AddressStorageLib.add(
                accounts[accountAddress].profiles[profileIdx].requsters,
                user
            );
        }
    }

    // *** Delete Methods ***

    /**
     * @notice Removes profiles by index.
     * @dev Throws if:
     *      - Caller isn't account owner;
     *      - Profile at index doesn't exist;
     * @param accountAddress Address of account
     * @param profileIdx Profile index
     */
    function removeProfile(address accountAddress, uint profileIdx)
        external
    {
        requireProfileOwner(accountAddress, profileIdx);
        AddressStorageLib.clear(
            accounts[accountAddress].profiles[profileIdx].requsters
        );
        AddressStorageLib.clear(
            accounts[accountAddress].profiles[profileIdx].voters
        );
        accounts[accountAddress].profiles[profileIdx].consensusPercentage = 0;
        accounts[accountAddress].profiles[profileIdx].title = '0x00';
        accounts[accountAddress].profilesSize -= 1;
    }

    /**
     * @notice Revoke `role` permission for `user` in profile.
     * @dev Throws if:
     *      - Caller isn't account owner;
     *      - Profile at index doesn't exist;
     * @param accountAddress Address of account
     * @param profileIdx Profile index
     * @param user User address
     * @param role `Roles` enum
     */
    function removeProfileRole(
        address accountAddress,
        uint profileIdx,
        address user,
        Roles role
    )
        external
    {
        requireProfileOwner(accountAddress, profileIdx);
        if (role == Roles.VOTER) {
            AddressStorageLib.remove(
                accounts[accountAddress].profiles[profileIdx].voters,
                user
            );
        }
        else {
            AddressStorageLib.remove(
                accounts[accountAddress].profiles[profileIdx].requsters,
                user
            );
        }
    }

    // *** Throw functions ***

    /**
     * @dev Throws if caller is not account owner.
     */
    function requireAccountOwner(address accountAddress) internal view {
        require(
            msg.sender == accounts[accountAddress].owner,
            "Permission denied."
        );
    }


    /**
     * @dev Throws if profile by `profileIdx` doesn't exists in
     *      `accountAddress` address.
     */
    function requireProfileOwner(address accountAddress, uint profileIdx) internal view {
        requireAccountOwner(accountAddress);
        require(
            profileIdx <= accounts[accountAddress].profilesSize,
            "Profile doesn't exist"
        );
    }


}
