// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;

import "./TransactionLib.sol";

/**
 * @title TransactionLib
 * @dev Keeps methods to access to stored transactions.
 */
contract TransactionStorage {
    /// @dev it is not unique list, for example, if profile user sends request
    ///  with themselves as `to`, the same address will have txId twice.
    mapping(address => uint[]) internal transactionsByAddress;
    mapping(uint => TransactionLib.Transaction) public transactions;
    /// @dev To get all transactions, use `for` loop and `transaction` method
    ///         with `lastUid - 1` as the last index.
    uint public lastUid;

    /**
     * @notice Get size of user related transactions.
     * @dev Use `for` loop and `txAt` method to get all user related
     *      transaction ids.
     * @param addr User address
     * @return uint
     */
    function txSize(address addr)
        external view
        returns (uint)
    {
        return transactionsByAddress[addr].length;
    }

    /**
     * @notice Get user transaction at index
     * @dev Use `transactions` method to get transaction details.
     * @param addr User address
     * @param idx Transaction index in user transactions array
     * @return uint Transaction id.
     */
    function txAt(address addr, uint idx)
        external view
        returns (uint)
    {
        require(
            idx + 1 <= transactionsByAddress[addr].length,
            "Transaction at index doesn't exist"
        );
        return transactionsByAddress[addr][idx];
    }


    /**
     * @notice Get transaction voter info by voter index.
     * @param txId Transaction id
     * @param idx Voter index in transaction voters array.
     * @return addr Voter address
     * @return status `TransactionLib.VoteStatuses` enum
     */
    function txVoterAt(uint txId, uint idx)
        external view
        returns (address addr, TransactionLib.VoteStatuses status)
    {
        require(
            idx + 1 <= transactions[txId].voters.length,
            "Voter at index doesn't exist"
        );
        address voter = transactions[txId].voters[idx];
        return (
            voter,
            transactions[txId].voterStatuses[voter]
        );
    }

}
