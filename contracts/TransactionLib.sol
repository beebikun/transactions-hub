// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;

/**
 * @title TransactionLib
 * @dev Keeps transactions request related structs and methods
 */
library TransactionLib {
    enum VoteStatuses { UNSET, PENDING, APPROVE, REJECT }
    enum TransactionStatuses { UNSET, PENDING, APPROVED, REJECTED }

    struct Transaction {
        bytes32 profileId;
        address account;
        address payable to;
        uint amount;
        address by;
        TransactionStatuses status;
        // to keep voting status
        mapping(address => VoteStatuses) voterStatuses;
        // to be able to list transaction voters
        address[] voters;
        uint votersSize;
        // number of voters required for consensus
        uint consensus;
        uint approvalCount;
        uint rejectCount;
    }

    event TransactionRequest(
        uint uid,
        bytes32 profileId,
        address account,
        address to,
        address by,
        uint amount,
        address[] voters
    );
    event TransactionResponse(
        uint uid,
        bytes32 profileId,
        address account,
        address to,
        address by,
        TransactionStatuses status
    );
    event TransactionVote(
        uint uid,
        address account,
        address voter,
        VoteStatuses status
    );

    /**
     * @notice Adds `consensus` to transaction and emits `TransactionRequest`.
     * @dev Throws if:
     *      - `transaction.voters` is empty array;
     *      - `consensusPersentage` is 0;
     *      Events:
     *      - TransactionRequest;
     * @param transaction Transaction
     * @param txId transaction id
     * @param consensusPercentage Consensus percentage from profile
     */
    function add(
        Transaction storage transaction,
        uint txId,
        uint8 consensusPercentage
    ) external {
        require(
            transaction.voters.length > 0,
            'Transaction request without voters is impossible'
        );
        require(
            consensusPercentage > 0,
            'Transaction request with zero consensusPercentage is impossible'
        );
        // Alwais ceil, 1.001 > 2
        transaction.consensus = 1 + transaction.voters.length * consensusPercentage / 100;
        if (transaction.consensus > transaction.voters.length) {
            transaction.consensus = transaction.voters.length;
        }
        transaction.status = TransactionStatuses.PENDING;
        transaction.votersSize = transaction.voters.length;

        emit TransactionRequest(
            txId,
            transaction.profileId,
            transaction.account,
            transaction.to,
            transaction.by,
            transaction.amount,
            transaction.voters
        );
    }

    /**
     * @notice Performs voting from `voter`
     * @dev Throws if:
     *      - User doesn't have `voter` permissions for transaction;
     *      - User has already made a vote for transaction;
     *      - User tries to vote with `UNSET` value.
     *      - Voting for transaction is closed (transaction status is
     *        APPROVED/REJECTED) or it is not existing transaction (status is
     *        UNSET).
     *      Events:
     *      - TransactionVote;
     *      - TransactionResponse if consesus was reached;
     * @param transaction Transaction
     * @param txId transaction id
     * @param status `VoteStatuses` enum
     */
    function vote(Transaction storage transaction, uint txId, VoteStatuses status) external {
        require(
            transaction.voterStatuses[msg.sender] == VoteStatuses.PENDING,
            "Permission denied."
        );
        require(
            transaction.status == TransactionStatuses.PENDING,
            "Transaction voting is closed."
        );
        transaction.voterStatuses[msg.sender] = status;
        if (status == VoteStatuses.APPROVE) {
            transaction.approvalCount += 1;
            if (transaction.approvalCount == transaction.consensus) {
                transaction.status = TransactionStatuses.APPROVED;
            }
        }
        else if (status == VoteStatuses.REJECT) {
            transaction.rejectCount += 1;
            if (transaction.rejectCount == transaction.consensus) {
                transaction.status = TransactionStatuses.REJECTED;
            }
        }
        else {
            revert("Unknown vote status");
        }
        emit TransactionVote(
            txId,
            transaction.account,
            msg.sender,
            status
        );

        if (
            transaction.status == TransactionStatuses.PENDING &&
            transaction.approvalCount + transaction.rejectCount ==
                transaction.voters.length
        ) {
            // No consensus after all votes were maid - reject transaction
            transaction.status = TransactionStatuses.REJECTED;
        }

        if (transaction.status != TransactionStatuses.PENDING) {
            emit TransactionResponse(
                txId,
                transaction.profileId,
                transaction.account,
                transaction.to,
                transaction.by,
                transaction.status
            );
            if (transaction.status == TransactionStatuses.APPROVED) {
                transaction.to.transfer(transaction.amount);
            }
        }
    }
}
