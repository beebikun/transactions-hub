import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import * as ACTIONS from '../actions';
import UserPermission from './UserPermission';
import Button from './Button';
import Input from './Input';


const UserPermissionListFactory = (accountAddress, profileIdx) => {

  function mapDispatchToProps(dispatch, { role }) {
    return {
      onAddUserPermission: user => dispatch(
        ACTIONS.addUserPermission({ accountAddress, profileIdx, role, user })
      ),
    };
  }

  function UserPermissionList({ className, onAddUserPermission, role, title, size = 0 }) {
    const [userPermissions, setUserPermissions] = useState([]);
    const [newUser, setNewUser] = useState([]);
    useEffect(() => {
      const users = new Array(parseInt(size, 10)).fill()
        .map((_, idx) =>
          <UserPermission
            className={idx ? 'mt-2' : ''}
            key={idx}
            idx={idx}
            accountAddress={accountAddress}
            profileIdx={profileIdx}
            role={role}
          />);
      setUserPermissions(users);
    }, [size, role]);
    const handleAddUserPermission = () => {
      onAddUserPermission(newUser);
      setNewUser('');
    };
    return (
      <div className={className}>
        <h6 className="font-semibold text-sm mb-3">{title.toUpperCase()} ({size})</h6>
        <div className={"flex" + (size ? ' mb-4' : '')}>
          <Input
            value={newUser}
            onChange={setNewUser}
            placeholder="0x0000000000000000000000000000000000000000"
            className="w-44 rounded-r-none"
          />
          <Button
            className="rounded-l-none"
            disabled={!newUser}
            onClick={handleAddUserPermission}
          >
            Grant
          </Button>
        </div>
        {userPermissions}
      </div>
    );
  }

  return connect(null, mapDispatchToProps)(UserPermissionList);
}


export default UserPermissionListFactory;
