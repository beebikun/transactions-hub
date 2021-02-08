import React, { useState } from 'react';
import { connect } from "react-redux";
import * as ACTIONS from '../actions';
import Address from '../components/Address';
import EthBalance from '../components/EthBalance';
import Button from '../components/Button';
import Input from '../components/Input';
import AddressAvatar from '../components/AddressAvatar';


const mapStateToProps = state => {
  const address = state.activeUser.address;
  // const hash = state.activeUser.hash;
  // const account = state.contracts.Hub.account?.[hash]?.value;
  return {
    address,
    ethBalance: state.accountBalances[address],
    ...state.activeUser
  };
};

function mapDispatchToProps(dispatch) {
  return {
    onRefill: (address, value) => dispatch(ACTIONS.requestRefill({ address, value }))
  };
};


function BalanceInfo({ address, balance, ethBalance, onRefill }) {
  const [refillValue, setRefillValue] = useState();
  const handleRefill = () => {
    onRefill(address, refillValue);
    setRefillValue();
  };

  return (
    <div className="
     py-6 px-4
     bg-white shadow
     md:flex
    ">
      <div className="font-boldflex flex mb-3 md:mb-0">
        <AddressAvatar addr={address} className="mr-2"/>
        <h1 className="text-2xl"><Address addr={address}/></h1>
        <div className="text-xs md:text-sm ml-auto md:ml-3"><EthBalance n={ethBalance}/></div>
      </div>

      <div className="md:ml-auto flex items-start">
        <div className="self-center flex">
          <Input
            value={refillValue}
            onChange={setRefillValue}
            placeholder="0 WEI"
            type="number"
            name="refillValue"
            className="w-28 md:w-36 lg:w-auto rounded-r-none"
          />
          <Button
            className="whitespace-nowrap rounded-l-none"
            type="primary"
            disabled={!refillValue}
            onClick={handleRefill}
          >
            (>°◡°)>
          </Button>
        </div>

        <div className="ml-3 flex ml-auto md:ml-3">
          <span className="mr-1 md:text-sm text-xs">Hub:</span>
          <h3 className="text-lg md:text-2xl"><EthBalance n={balance}/></h3>
         </div>
      </div>

    </div>
  );
}


export default connect(mapStateToProps, mapDispatchToProps)(BalanceInfo);
