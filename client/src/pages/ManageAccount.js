import React, { useEffect } from 'react';
import { connect } from "react-redux";
import * as ACTIONS from '../actions';
import Profile from '../components/Profile';
import BalanceInfo from '../components/BalanceInfo';
import Button from '../components/Button';


const mapStateToProps = state => {
  return state.activeUser;
};

function mapDispatchToProps(dispatch) {
  return {
    fetchData: (accountAddress, profilesSize) => dispatch(
      ACTIONS.fetchProfileIds({ accountAddress, profilesSize })
    ),
    addProfile: () => dispatch(ACTIONS.addProfile()),
  };
}


function ManageAccount({ address, addProfile, fetchData, profilesSize = 0, profileIds }) {
  useEffect(() => {
    fetchData(address, profilesSize);
  }, [address, profilesSize, fetchData]);

  const profiles = (profileIds || [])
      .map(profileId =>
          <Profile className="mb-5" key={profileId} id={profileId} />)
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
          onClick={addProfile}
        >+</Button>
      </div>
      {profiles}
    </div>
  );
}


export default connect(mapStateToProps, mapDispatchToProps)(ManageAccount);
