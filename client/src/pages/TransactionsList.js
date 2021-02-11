import React, { useState, useMemo } from 'react';
import {
  useHistory,
} from "react-router-dom";
import { connect } from "react-redux";
import { TransactionStatuses } from '../constants/enums';
import TxShortInfo from '../components/TxShortInfo';


const mapStateToProps = state => {
  return {
    accountAddress: state.activeUser.address,
    transactionItems: state.txRequests.asArr,
  };
};



function TransactionsList({ accountAddress, transactionItems, fetchData }) {
  const history = useHistory();
  const statusToBg = {
    [TransactionStatuses.PENDING]: '',
    [TransactionStatuses.APPROVED]: 'bg-green-100',
    [TransactionStatuses.REJECTED]: 'bg-red-200',
  };
  const transactions = [];
  for (var i = transactionItems.length - 1; i >= 0; i--) {
    const tx = transactionItems[i];
    transactions.push(<div
      key={tx.txId}
      onClick={() => history.push(`/transactions/${tx.txId}`)}
      className={'cursor-pointer flex hover:bg-gray-100 mb-3 bg-white shadow py-6 px-4 ' + statusToBg[tx.status]}
    >
      <div>
        <TxShortInfo tx={tx} accountAddress={accountAddress} />
        <div className="mt-3">
          I am: {
            tx.voters[accountAddress] ? 'Voter' :
            tx.by === accountAddress ? 'Requester' :
            tx.to === accountAddress ? 'Recipient' :
            tx.accountAddress === accountAddress ? 'Holder' : '¯\_(ツ)_/¯'
          }
        </div>
      </div>
      <div className="text-2xl ml-auto">-></div>
    </div>);
  }

  return (
    <div>
      <h3 className="mb-3 px-1 text-xl text-gray-900">
        Transactions ({transactionItems.length})
      </h3>

      {transactions}
    </div>
  );
}


export default connect(mapStateToProps)(TransactionsList);
