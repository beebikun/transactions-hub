import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import {
  useHistory,
} from "react-router-dom";
import * as ACTIONS from '../actions';
import Input from '../components/Input';
import Button from '../components/Button';


const mapStateToProps = (state) => {
  return {
    activeUserAddress: state.activeUser.address,
    transactionItems: state.txRequests.asArr,
  };
};


function mapDispatchToProps(dispatch, state) {
  return {
    onSend: data => dispatch(ACTIONS.addTransactionRequest(data)),
  };
};


function AddTransaction({ activeUserAddress, transactionItems, onSend }) {
  const history = useHistory();
  const [profileId, setProfileId] = useState();
  const [amount, setAmount] = useState(0);
  const [to, setTo] = useState();
  const [uniqueTxs, setUniqueTxs] = useState([]);

  useEffect(() => {
    // profileId > set
    const profilesAndTos = transactionItems.reduce((bucket, tx) => {
      if (!bucket[tx.profileId]) {
        bucket[tx.profileId] = new Set();
      }
      bucket[tx.profileId].add(tx.to);
      return bucket;
    }, {});
    const arr = Object.entries(profilesAndTos).reduce((bucket, [profileId, set]) => {
      Array.from(set).forEach(to => {
        bucket.push({ to, profileId });
      });
      return bucket;
    }, []);
    setUniqueTxs(arr);
  }, [transactionItems.length]);

  const handleSubmit = () => {
    onSend({ amount, profileId, to });
    history.push('/');
  };

  const recentTxTitle = uniqueTxs.length ? 'Recent Related Transactions' : 'No Recent Transactions';
  const recentTxs = uniqueTxs.map((tx, i) =>
    <div key={i} className='md:inline-flex bg-white shadow py-6 px-4 items-center overflow-auto'>
      <div>
        <div>Profile Id: {tx.profileId}</div>
        <div>To: {tx.to}</div>
      </div>
      <Button
        className="md:ml-5 mt-5 md:mt-0"
        onClick={() => {setProfileId(tx.profileId); setTo(tx.to)}}
       >Use</Button>
    </div>
  )

  return (
    <div>
      <h3 className="text-xl mb-5 px-1 text-gray-900">
        Add Transaction Request
      </h3>

      <div>
        <div className="
           py-6 px-4
           bg-white shadow
           md:inline-block
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
      </div>

      <h3 className="text-lg mb-5 mt-5 px-1 text-gray-900">{recentTxTitle}</h3>
      {recentTxs}
    </div>
  );
}


export default connect(mapStateToProps, mapDispatchToProps)(AddTransaction);
