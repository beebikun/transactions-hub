import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import {
  useHistory,
} from "react-router-dom";
import * as ACTIONS from '../actions';
import Input from '../components/Input';
import Button from '../components/Button';
import RecentTransaction from '../components/RecentTransaction';


const mapStateToProps = (state) => {
  return {
    activeUserAddress: state.activeUser.address,
    transactionIds: state.activeUser.transactionIds,
  };
};

function mapDispatchToProps(dispatch, state) {
  return {
    fetchLastTransactions: (accountAddress) => dispatch(ACTIONS.fetchLastTxIds({ accountAddress, n: 10 })),
    onSend: data => dispatch(ACTIONS.addTransactionRequest(data)),
  };
};


function AddTransaction({ activeUserAddress, transactionIds, fetchLastTransactions, onSend }) {
  useEffect(() => {
    if (activeUserAddress) {
      fetchLastTransactions(activeUserAddress);
    }
  }, [activeUserAddress, fetchLastTransactions]);
  const history = useHistory();
  const [profileId, setProfileId] = useState();
  const [amount, setAmount] = useState(0);
  const [to, setTo] = useState();

  const handleSubmit = () => {
    onSend({ amount, profileId, to });
    history.push('/');
  };
  const useTx = ({ profileId, to }) => {
    setProfileId(profileId);
    setTo(to);
  };

  const recentTxTitle = transactionIds.length ? 'Recent Related Transactions' : 'No Recent Transactions';
  const recentTxs = transactionIds.map(txId =>
    <RecentTransaction key={txId} txId={txId} onClick={useTx} />
  )

  return (
    <div className="pt-3">
      <h3 className="text-xl mb-5 px-1 text-gray-900">
        Add Transaction Request
      </h3>

      <div className="
         py-6 px-4
         bg-white shadow
        ">

        <div className="mr-5 mb-5">
          <label
            className="block mb-2 font-semibold text-sm"
            htmlFor="requestProfile">
            PROFILE ID</label>
          <Input
            value={profileId}
            onChange={setProfileId}
            name="requestProfile"
          />
        </div>

        <div className="mr-5 mb-5">
          <label
            className="block mb-2 font-semibold text-sm"
            htmlFor="requestAmount">
            AMOUNT</label>
          <Input
            value={amount}
            onChange={setAmount}
            type="number"
            name="requestAmount"
          />
        </div>

        <div className="mr-5 mb-5">
          <label
            className="block mb-2 font-semibold text-sm"
            htmlFor="requestTo">
            TO</label>
          <Input
            value={to}
            onChange={setTo}
            name="requestTo"
          />
        </div>

        <Button
          disabled={!amount || !profileId || !to}
          onClick={handleSubmit}
        >
          SEND
        </Button>

      </div>

      <h3 className="text-lg mb-5 mt-5 px-1 text-gray-900">{recentTxTitle}</h3>
      {recentTxs}
    </div>
  );
}


export default connect(mapStateToProps, mapDispatchToProps)(AddTransaction);
