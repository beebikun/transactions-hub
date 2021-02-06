// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;

/**
 * @title AddressStorageLib
 * @dev Allows to add/access/delete addresses.
 */
library AddressStorageLib {

    struct Permissions {
        address[] keys;
        mapping (address => uint) values;
    }

    /**
     * @notice Get storage element by index.
     * @param self Permissions
     * @param idx Element index
     * @return address
     */
    function at(Permissions storage self, uint idx)
        external view
        returns (address)
    {
        require(
            self.keys.length > 0 &&
            idx <= self.keys.length - 1,
            "User at index doesn't exist"
        );
        return self.keys[idx];
    }

    /**
     * @notice Adds element to storage
     * @param self Permissions
     * @param user Element (=address)
     */
    function add(Permissions storage self, address user) external {
        if (!has(self, user)) {
            self.values[user] = self.keys.length;
            self.keys.push(user);
        }
    }

    /**
     * @notice Removes element from storage
     * @param self Permissions
     * @param user Element (=address)
     */
    function remove(Permissions storage self, address user) external {
        if (!has(self, user)) {
            // Already doesn't have permissions - nothing to do there
            return;
        }
        uint idx = self.values[user];
        uint lastIdx = self.keys.length - 1;
        if (idx != lastIdx) {
            // Move the last element to the place of the removed element
            address userToMove = self.keys[lastIdx];
            self.values[userToMove] = idx;
            self.keys[idx] = userToMove;
        }
        // Now we have the same user at two positions: `idx` and `lastIdx`
        // so delete the last one
        self.keys.pop();
        // Doesn't make much sense to change user.idx because even if we set
        // length * 10 we can reach this number sooner or later and we will
        // have two elements with tha same idx (one the real one and one
        // deleted) anyway
    }

    /**
     * @notice Remove all elements from storage
     * @param self Permissions
     */
    function clear(Permissions storage self) external {
        while (self.keys.length > 0) {
            self.keys.pop();
        }
    }

    /**
     * @notice Checks if element exists in storage
     * @param self Permissions
     * @param user Element (=address)
     * @return bool
     */
    function has(Permissions storage self, address user)
        public view
        returns (bool)
    {
        if (self.keys.length == 0) {
            return false;
        }
        uint idx = self.values[user];
        return idx <= self.keys.length - 1 && self.keys[idx] == user;
    }

}
