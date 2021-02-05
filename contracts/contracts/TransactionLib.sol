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
        address account;
        address payable to;
        uint amount;
        address by;
        // bytes data;  // TODO
        TransactionStatuses status;
        // to keep voting status
        mapping(address => VoteStatuses) voterStatuses;
        // to be able to list transaction voters
        address[] voters;
        // number of voters required for consensus
        uint consensus;
        uint approvalCount;
        uint rejectCount;
    }

    event TransactionRequest(
        uint uid,
        address account,
        address to,
        address by,
        uint amount,
        address[] voters
    );
    event TransactionResponse(
        uint uid,
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

        emit TransactionRequest(
            txId,
            transaction.account,
            transaction.to,
            transaction.by,
            transaction.amount,
            transaction.voters
        );
    }


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