import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import * as ACTIONS from '../actions';
import ProfileFactory from '../components/Profile';
import BalanceInfo from '../components/BalanceInfo';
import Button from '../components/Button';


const mapStateToProps = state => {
  const address = state.activeUser.address;
  const hash = state.activeUser.hash;
  const account = state.contracts.Hub.account?.[hash]?.value || {};
  return {
    address,
    ...account
  };
};

function mapDispatchToProps(dispatch) {
  return {
    addProfile: address => dispatch(ACTIONS.addProfile({ accountAddress: address })),
  };
}


function ManageAccount({ address, addProfile, profilesSize = 0 }) {
  const [Profile, setProfile] = useState(null);
  useEffect(() => {
    setProfile(ProfileFactory(address));
  }, [address]);
  const profiles = new Array(parseInt(profilesSize, 10)).fill()
      .map((_, profileIdx) =>
          <Profile className="mb-5" key={profileIdx} idx={profileIdx} />)
       .reverse();

  return (
    <div className="pt-3">
      <BalanceInfo/>
      <div className="mb-3 mt-5 px-1 flex items-center">
        <h3 className="text-xl text-gray-900">
          Profiles ({profilesSize})
        </h3>
        <Button
          className="ml-auto md:ml-5"
          onClick={() => addProfile(address)}
        >+</Button>
      </div>
      {profiles}
    </div>
  );
}


export default connect(mapStateToProps, mapDispatchToProps)(ManageAccount);
