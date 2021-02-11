import React from 'react';
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { TransactionStatuses } from '../constants/enums';
import TxShortInfo from '../components/TxShortInfo';


const mapStateToProps = (state, { txId }) => {
  return {
    tx: state.txRequests.asObj[txId] || {},
  };
};

const UNKNOWN_STATUS = '¯\\_(ツ)_/¯';


function TransactionItem({ tx, accountAddress }) {
  const history = useHistory();
  const statusToBg = {
    [TransactionStatuses.PENDING]: '',
    [TransactionStatuses.APPROVED]: 'bg-green-100',
    [TransactionStatuses.REJECTED]: 'bg-red-200',
  };

  return (
    <div
      key={tx.txId}
      onClick={() => history.push(`/transactions/${tx.txId}`)}
      className={'cursor-pointer flex hover:bg-gray-100 mb-3 bg-white shadow py-6 px-4 ' + statusToBg[tx.status]}
    >
      <div>
        <TxShortInfo tx={tx} accountAddress={accountAddress} />
        <div className="mt-3">
          I am: {
            (tx.voters || {})[accountAddress] ? 'Voter' :
            tx.by === accountAddress ? 'Requester' :
            tx.to === accountAddress ? 'Recipient' :
            tx.accountAddress === accountAddress ? 'Holder' : UNKNOWN_STATUS
          }
        </div>
      </div>
      <div className="text-2xl ml-auto">-></div>
    </div>
  );
}


export default connect(mapStateToProps)(TransactionItem);
