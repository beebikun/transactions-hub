import React, { useState, useEffect, useMemo } from 'react';
import { connect } from "react-redux";
import * as ACTIONS from '../actions';
import { hex2ascii } from '../utils';
import { ROLES } from '../constants/enums';
import UserPermissionListFactory from './UserPermissionList';
import Input from './Input';
import Button from './Button';

const mapStateToProps = (state, { id }) => {
  const profile = state.profiles[id] || {};
  return profile;
};

function mapDispatchToProps(dispatch) {
  return {
    fetchData: profileId => dispatch(ACTIONS.fetchProfile({ profileId })),
    onProfileEdit: (profileId, data) => dispatch(
      ACTIONS.editProfile({ profileId, ...data })
    ),
    // POST-MVP
    onProfileRemove: (profileId) => dispatch(
      ACTIONS.removeProfile({ profileId })
    ),
  };
}

function Profile({
  className,
  id,
  fetchData, onProfileEdit, onProfileRemove,
  requstersSize = 0, votersSize = 0, ...profile
}) {
  // Fetch profile data
  useEffect(() => {
    fetchData(id);
  }, []);
  const UserPermissionList = useMemo(
    () => UserPermissionListFactory(id),
    [id]
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
    <div className={className + ' py-6 px-4 bg-white shadow overflow-auto'}>
      <h3 className="mb-6 text-sm md:text-lg">{id}</h3>
      <div className="lg:flex ">
        <div className="flex flex-wrap lg:block">
          <div className="mr-5 mb-5">
            <label
              className="block mb-2 font-semibold text-sm"
              htmlFor={'profileTitle' + id}>
              PROFILE TITLE</label>
            <Input
              value={title}
              onChange={setTitle}
              name={'profileTitle' + id}
            />
          </div>
          <div className="mr-5 mb-5">
            <label
              className="block mb-2 font-semibold text-sm"
              htmlFor={'profilePercentage' + id}>
              CONSENSUS PERCENTAGE</label>
            <Input
              value={percentage}
              onChange={setPercentage}
              placeholder="0 - 100%"
              name={'profilePercentage' + id}
              type="number"
            />
          </div>
          <Button
            className="self-center mt-2 lg:mt-0"
            onClick={() => onProfileEdit(id, { title, consensusPercentage: percentage })}
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
      </div>

      <Button
        className="mt-5 lg:ml-auto lg:block"
        onClick={() => onProfileRemove(id)}
        >Remove Profile</Button>
    </div>
  );
}


export default connect(mapStateToProps, mapDispatchToProps)(Profile);
