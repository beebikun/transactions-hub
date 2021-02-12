// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;

/**
 * @title ProfileStorageLib
 * @dev Allows to add/remove profile ids.
 */
library ProfileStorageLib {

    struct Profiles {
        bytes32[] keys;
        // profileId => index of profileId in `keys`
        mapping(bytes32 => uint) values;
        // to always keep profile id unique
        uint lastUid;
    }

    /**
     * @notice Generates unique profile id and its to storage.
     * @param self Profiles
     * @param accountAddress account address to which profile must be added
     * @return profileId
     */
    function add(Profiles storage self, address accountAddress)
        external
        returns (bytes32)
    {
        self.lastUid += 1;
        bytes32 profileId = keccak256(
            abi.encodePacked(accountAddress, self.lastUid));
        self.values[profileId] = self.keys.length;
        self.keys.push(profileId);
        return profileId;
    }

    /**
     * @notice Removes profile id from storage.
     * @param self Profiles
     * @param profileId Profile id to remove
     */
    function remove(Profiles storage self, bytes32 profileId)
        external
    {
        // No need to verify
        // `idx >= self.keys.length && self.keys[idx] != profileId`
        // because such case is impossible - user will have "Permission denied"
        // before this method is called.
        uint idx = self.values[profileId];
        uint lastIdx = self.keys.length - 1;
        if (idx != lastIdx) {
            // Move the last element to the place of the removed element
            bytes32 idToMove = self.keys[lastIdx];
            self.values[idToMove] = idx;
            self.keys[idx] = idToMove;
        }
        // Now we have the same user at two positions: `idx` and `lastIdx`
        // so delete the last one
        self.keys.pop();
    }

}
