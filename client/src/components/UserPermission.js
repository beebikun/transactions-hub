import React, { useEffect } from 'react';
import { connect } from "react-redux";
import * as ACTIONS from '../actions';
import Address from './Address';
import Button from './Button';
import AddressAvatar from './AddressAvatar';


const mapStateToProps = (state, { idx, profileIdx, role }) => {
  const address = state.activeUser.userPermissions[profileIdx]?.[role]?.[idx];
  return {
    address,
  };
};

function mapDispatchToProps(dispatch, { accountAddress,  profileIdx, role }) {
  return {
    fetchData: idx => dispatch(
      ACTIONS.requestUserPermission({ accountAddress, profileIdx, role, idx })
    ),
    onRemoveUserPermission: user => dispatch(
      ACTIONS.removeUserPermission({ accountAddress, profileIdx, role, user })
    ),
  };
}

function UserPermission({
  className, idx,
  fetchData, onRemoveUserPermission,
  address
}) {
  useEffect(() => {
    fetchData(idx);
  }, []);
  return (
    <div className={className + " flex items-center"}>
      <AddressAvatar addr={address} className="mr-2"/>
      <Address addr={address}/>
      <Button className="ml-5" onClick={() => onRemoveUserPermission(address)}>X</Button>
    </div>
  );
}


export default connect(mapStateToProps, mapDispatchToProps)(UserPermission);
