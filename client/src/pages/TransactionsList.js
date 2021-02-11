import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import TransactionsFilters from '../components/TransactionsFilters';
import TransactionItem from '../components/TransactionItem';


const mapStateToProps = state => {
  return {
    accountAddress: state.activeUser.address,
    transactionItems: state.txRequests.asArr,
  };
};



function TransactionsList({ accountAddress, transactionItems }) {
  const [filters, setFilters] = useState({});
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const txs = [];
    console.log(filters)
    for (var i = transactionItems.length - 1; i >= 0; i--) {
      const tx = transactionItems[i];
      if (filters.profileId && tx.profileId !== filters.profileId) {
        continue
      }
      if (filters.voter && !tx.voters[filters.voter]) {
        continue
      }
      if (filters.to && tx.to !== filters.to) {
        continue
      }
      if (filters.account && tx.account !== filters.account) {
        continue
      }
      if (filters.by && tx.by !== filters.by) {
        continue
      }
      if (filters.txStatus !== null && tx.status !== filters.txStatus) {
        continue
      }
      if (filters.myVoteStatus !== null &&
          (!tx.voters[accountAddress] || tx.voters[accountAddress].status !== filters.myVoteStatus)) {
        continue
      }
      txs.push(<TransactionItem key={tx.txId} txId={tx.txId} accountAddress={accountAddress}/>);
    }
    setTransactions(txs);
  }, [transactionItems.length, filters, accountAddress]);


  return (
    <div>
      <h3 className="mb-3 px-1 text-xl text-gray-900">
        Transactions ({transactionItems.length}/{transactions.length})
      </h3>

      <TransactionsFilters
        transactionItems={transactionItems}
        accountAddress={accountAddress}
        onChange={setFilters}
      />

      {transactions}
    </div>
  );
}


export default connect(mapStateToProps)(TransactionsList);
