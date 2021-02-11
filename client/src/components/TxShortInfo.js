import React from 'react';
import CircleStatus from '../components/CircleStatus';
import { TransactionStatuses, VoteStatuses } from '../constants/enums';


function TxShortInfo({ tx, accountAddress, className }) {
  const txStatus = parseInt(tx.status, 10);
  return (
    <div className={className}>
      <h3 className="text-sm mb-2 flex items-center">
        <CircleStatus txStatus={txStatus}/>
        <div className="mr-1">
          [{
            txStatus === TransactionStatuses.PENDING ? 'PENDING' :
            txStatus === TransactionStatuses.APPROVED ? 'APPROVED' :
            txStatus === TransactionStatuses.REJECTED ? 'REJECTED' : '¯\_(ツ)_/¯'
          }]
        </div>
        Transaction {tx.txId}
      </h3>
      {/* <small className="text-xs mb-3">Profile {tx.profileId}</small> */}
      <div className="flex">
        <div className="flex items-center mr-2">
          <CircleStatus status={VoteStatuses.APPROVE}/>
          {tx.approvalCount}
        </div>
        <div className="flex items-center mr-2">
          <CircleStatus status={VoteStatuses.REJECT}/>
          {tx.rejectCount}
        </div>
        <div className="flex items-center">
          <CircleStatus />
          {tx.consensus - tx.rejectCount - tx.approvalCount}
        </div>
      </div>
    </div>
  );
}


export default TxShortInfo;
