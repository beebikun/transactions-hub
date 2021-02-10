// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;


library ProfileStorageLib {

    struct Profiles {
        mapping(bytes32 => uint) values;
        // [id, id, ...]
        bytes32[] keys;
        uint lastUid;
    }


    function add(Profiles storage self, address accountAddress)
        external
        returns (bytes32)
    {
        self.lastUid += 1;
        bytes32 profileId = keccak256(abi.encodePacked(accountAddress, self.lastUid));
        self.values[profileId] = self.keys.length;
        self.keys.push(profileId);
        return profileId;
    }

    function remove(Profiles storage self, bytes32 profileId)
        external
    {
        // No need to verify `idx >= self.keys.length && self.keys[idx] != profileId`
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
