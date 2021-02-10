import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import * as ACTIONS from '../actions';
import Button from '../components/Button';


const mapStateToProps = (state, { txId }) => {
  return {
    tx: state.txRequests[txId] || {},
  };
};

function mapDispatchToProps(dispatch, { txId }) {
  return {
    fetchData: () => dispatch(ACTIONS.fetchTransaction({ txId })),
  };
};


function RecentTransaction({ className, fetchData, tx, onClick }) {
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className={className + ' flex bg-white shadow py-6 px-4 items-center'}>
      {tx.profileId}
      <Button className="ml-5" onClick={() => onClick(tx)}>Use</Button>
    </div>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(RecentTransaction);
