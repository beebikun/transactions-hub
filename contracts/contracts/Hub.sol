// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;

import "./AccountStorage.sol";
import "./TransactionStorage.sol";
import "./TransactionLib.sol";

/**
 * @title Hub
 * @notice Hub that keeps account money. User can create a request to perform
 *     a transaction from account, but transaction will be performed only
 *     when voters approve it.
 *     Hub, for example, may be used for:
 *     - Simple consolidated account;
 *     - Processing request by oracles, eg:
 *         - Delay transaction: transaction is approved by oracle when gas
 *             price decreases to the desirable.
 *         - Safety processor: transaction is approved by oracle after it
 *             validates request destination safety (eg no suspicios activity
 *             recently, address is not envolved in any hack operations, etc)
 *     Transaction requests are created according to profiles in accont,
 *     describing who can send request, who should vote and percentage of
 *     approvale required to transaction approval.
 * @dev Logic of transaction request:
 *      - Transaction is made accoding to profile with `addRequest` method;
 *      - Only user with `requester` role in profile;
 *      - When transaction request is created:
 *          - account balance is reduced by `amount`;
 *          - voters are copied from profile to transaction;
 *          - voters consensus number is calculated acording to profile
 *            `consensusPercentage` and voters size.
 *            Number is rounded up: `26%` of `4` gives `2`;
 *          - transaction id is added to `transactionsByAddress` for `account`,
 *              `requester`, `to` and all voters, so any participant can get
 *              list of related transactions by `txSize`/`txAt` methods.
 *      - Each voter can vote only once with `vote` method. Voter - address that
 *        is saved in transaction voters list, doesn't matter if it was removed
 *        from profile or added after transaction;
 *      - Voting is possible only while transaction is in
 *        `TransactionLib.TransactionStatuses.PENDING` status.
 *      - As soon as `consensus` number of voters have made their vote,
 *        transaction status is changed to
 *        `TransactionLib.TransactionStatuses.APPROVED` or
 *        `TransactionLib.TransactionStatuses.REJECTED`.
 *      - If all voters made their voting without consensus, transaction status
 *        is changed to `REJECTED`;
 *      - As soon as transaction status has been changed to `APPROVED`,
 *        requested amount is transfered to requested distination address.
 *      - As soon as transaction status has been changed to `REJECTED`,
 *        blocked amount is returned to account balance.
 *
 *  TBD: withdraw money blocked by transaction request back to account balance
 *      when consensus wasn't reached during some timeout time
 *  TBD: Calculate `consensus is impossible` situation as soon as it become
 *      clear (eg consensus requires 3/5 approve and 3 voters already rejected
 *      it), not when all votes have been made.
 */
contract Hub is AccountStorage, TransactionStorage {

    /// @notice Refill account. Account address in hub matches user address.
    receive() external payable {
        receiveAmount(msg.sender);
    }

    /**
     * @notice Send transaction request from `accountAddress` to `to`
     *      according to `profileIdx` profile
     * @dev Throws if:
     *      - User doesn't have `requester` permissions for profile;
     *      - Account doesn't have sufficient balance;
     *      - Profile `voters` is empty array;
     *      - Profile `consensusPersentage` is 0;
     *      Events:
     *      - TransactionRequest (from TransactionLib);
     * @param accountAddress Account address in Hub
     * @param profileIdx Profile idx according to which transaction request is
     *        made - who are voters of this transaction and what is consensus %
     * @param amount Amount to send
     * @param to Payable address of money reciever
     */
    function addRequest(
        address accountAddress,
        uint profileIdx,
        uint amount,
        address payable to
    )
        external
        requireProfileRequester(accountAddress, profileIdx)
    {
        require(
            accounts[accountAddress].balance >= amount,
            "Insufficient balance."
        );
        accounts[accountAddress].balance -= amount;

        address[] storage voters =
            accounts[accountAddress].profiles[profileIdx].voters.keys;
        transactions[lastUid].account = accountAddress;
        transactions[lastUid].amount = amount;
        transactions[lastUid].to = to;
        transactions[lastUid].by = msg.sender;
        transactions[lastUid].voters = voters;

        TransactionLib.add(
            transactions[lastUid],
            lastUid,
            accounts[accountAddress].profiles[profileIdx].consensusPercentage
        );

        for (uint i = 0; i < voters.length; i++) {
            transactions[lastUid].voterStatuses[voters[i]] = TransactionLib.VoteStatuses.PENDING;
            transactionsByAddress[voters[i]].push(lastUid);
        }

        transactionsByAddress[msg.sender].push(lastUid);
        transactionsByAddress[to].push(lastUid);
        transactionsByAddress[accountAddress].push(lastUid);
        lastUid += 1;
    }

    /**
     * @notice Vote for transaction with status.
     * @dev Throws if:
     *      - User doesn't have `voter` permissions for transaction;
     *      - User has already made a vote for transaction;
     *      - User tryies to vote with `UNSET` value.
     *      - Voting for transaction is closed (transaction status is
     *        APPROVED/REJECTED).
     *      Events:
     *      - TransactionVote (from TransactionLib);
     *      - TransactionResponse (from TransactionLib);
     * @param txId Transacyion id
     * @param status `TransactionLib.VoteStatuses` enum
     */
    function vote(uint txId, TransactionLib.VoteStatuses status) external {
        TransactionLib.vote(transactions[txId], txId, status);
        uint amount = transactions[txId].amount;
        if (transactions[txId].status == TransactionLib.TransactionStatuses.APPROVED) {
            transactions[txId].to.transfer(amount);
        }
        else if (transactions[txId].status == TransactionLib.TransactionStatuses.REJECTED) {
            // In case of rejection - return money back to account
            accounts[transactions[txId].account].balance += amount;
        }
    }

    /**
     * @notice Add money to `accountAddress` account.
     * @param accountAddress Address of account in Hub
     */
    function receiveAmount (address accountAddress) public payable {
        accounts[accountAddress].owner = accountAddress;
        accounts[accountAddress].balance += msg.value;
    }

}