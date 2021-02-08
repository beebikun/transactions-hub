import React, { useState, useEffect, useMemo } from 'react';
import { connect } from "react-redux";
import * as ACTIONS from '../actions';
import { hex2ascii } from '../utils';
import { ROLES } from '../constants/enums';
import UserPermissionListFactory from './UserPermissionList';
import Input from './Input';
import Button from './Button';


const ProfileFactory = accountAddress => {
  const mapStateToProps = (state, { idx }) => {
    const profile = state.activeUser.profiles[idx] || {};
    return profile;
  };

  function mapDispatchToProps(dispatch) {
    return {
      fetchData: profileIdx => dispatch(ACTIONS.requestProfile({ accountAddress, profileIdx })),
      onProfileEdit: (profileIdx, data) => dispatch(
        ACTIONS.editProfile({ accountAddress, profileIdx, ...data })
      ),
      // POST-MVP
      // onProfileRemove: (profileIdx) => dispatch(
      //   ACTIONS.removeProfile({ accountAddress, profileIdx })
      // ),
    };
  }

  function Profile({
    className,
    idx,
    fetchData, onProfileEdit, onProfileRemove,
    requstersSize = 0, votersSize = 0, ...profile
  }) {
    // Fetch profile data
    useEffect(() => {
      fetchData(idx);
    }, []);
    const UserPermissionList = useMemo(
      () => UserPermissionListFactory(accountAddress, idx),
      [idx]
    );
    const [title, setTitle] = useState('');
    useEffect(() => {
      setTitle(hex2ascii(profile.title));
    }, [profile.title]);
    const [percentage, setPercentage] = useState(0);
    useEffect(() => {
      setPercentage(profile.consensusPercentage || 0);
    }, [profile.consensusPercentage]);

    return (
      <div className={className + ' py-6 px-4 bg-white shadow lg:flex'}>
        <div className="flex flex-wrap lg:block">
          <div className="mr-5 mb-5">
            <label
              className="block mb-2 font-semibold text-sm"
              htmlFor={'profileTitle' + idx}>
              PROFILE TITLE</label>
            <Input
              value={title}
              onChange={setTitle}
              name={'profileTitle' + idx}
            />
          </div>
          <div className="mr-5 mb-5">
            <label
              className="block mb-2 font-semibold text-sm"
              htmlFor={'profilePercentage' + idx}>
              CONSENSUS PERCENTAGE</label>
            <Input
              value={percentage}
              onChange={setPercentage}
              placeholder="0 - 100%"
              name={'profilePercentage' + idx}
              type="number"
            />
          </div>
          <Button
            className="self-center mt-2 lg:mt-0"
            onClick={() => onProfileEdit(idx, { title, consensusPercentage: percentage })}
            >Save</Button>
        </div>
        <div className="md:flex">
          <UserPermissionList
            size={requstersSize} title="Requesters" role={ROLES.REQUESTER}
            className="md:mr-5 mt-3  lg:mt-0"
          />
          <UserPermissionList
            className="mt-3 lg:mt-0"
            size={votersSize}
            title="Voters"
            role={ROLES.VOTER}/>
        </div>

        {/* POST MVP */}
        {/* <Button */}
        {/*   className="self-center mt-5 lg:ml-auto lg:self-end" */}
        {/*   onClick={() => onProfileRemove(idx)} */}
        {/*   >Remove Profile</Button> */}
      </div>
    );
  }

  return connect(mapStateToProps, mapDispatchToProps)(Profile);
}

export default ProfileFactory;
