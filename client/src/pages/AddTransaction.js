import React, { useState } from 'react';
import { connect } from "react-redux";
import {
  useHistory,
  useLocation
} from "react-router-dom";
import * as ACTIONS from '../actions';
import Input from '../components/Input';
import Button from '../components/Button';

const mapStateToProps = (state) => {
  const address = state.activeUser.address;
  return {
    activeUser: address,
  };
};

function mapDispatchToProps(dispatch, state) {
  return {
    onSend: (by, data) => dispatch(ACTIONS.addRequest({ by, ...data }))
  };
};


function AddTransaction({ activeUser, onSend }) {
  const history = useHistory();
  const [accountAddress, setAccountAddress] = useState('');
  const [profileIdx, setProfileIdx] = useState();
  const [amount, setAmount] = useState(0);

  const handleSubmit = () => {
    onSend(activeUser, { amount, accountAddress, profileIdx });
    history.push('/');
  };

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
            htmlFor="requestAccount">
            ACCOUNT</label>
          <Input
            value={accountAddress}
            onChange={setAccountAddress}
            name="requestAccount"
            placeholder="0x0000000000000000000000000000000000000000"
          />
        </div>

        <div className="mr-5 mb-5">
          <label
            className="block mb-2 font-semibold text-sm"
            htmlFor="requestProfile">
            PROFILE INDEX</label>
          <Input
            value={profileIdx}
            onChange={setProfileIdx}
            type="number"
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

        <Button
          disabled={!amount || !accountAddress || isNaN(parseInt(profileIdx, 10))}
          onClick={handleSubmit}
        >
          SEND
        </Button>

      </div>
    </div>
  );
}


export default connect(mapStateToProps, mapDispatchToProps)(AddTransaction);
