import React from 'react';
import { connect } from "react-redux";
import {
  useParams
} from "react-router-dom";
import { VoteStatuses } from '../constants/enums';
import * as ACTIONS from '../actions';
import Button from '../components/Button';
import TxShortInfo from '../components/TxShortInfo';
import Address from '../components/Address';
import AddressAvatar from '../components/AddressAvatar';
import CircleStatus from '../components/CircleStatus';


const mapStateToProps = (state) => {
  return {
    activeUserAddress: state.activeUser.address,
    transactions: state.txRequests.asObj,
  };
};


function mapDispatchToProps(dispatch, state) {
  return {
    onVote: (txId, status) => dispatch(ACTIONS.sendVote({ txId, status })),
  };
};


function AddressDetail({ className, addr, activeUserAddress, title }) {
  return (
    <div className={className + " flex items-center"}>
      {
        title && <div className="mr-2 w-24 font-bold">{title}:</div>
      }
      <AddressAvatar addr={addr} className="mr-2"/>
      <Address addr={addr}/>
      {
        addr === activeUserAddress && (<div className="ml-2">[ME]</div>)
      }
    </div>
  );
}


function TransactionDetail({ transactions, activeUserAddress, onVote }) {
  const { txId } = useParams();
  const tx = transactions[txId] || {};
  return (
    <div>
      <div className="bg-white shadow py-6 px-4">

        <TxShortInfo tx={tx} accountAddress={activeUserAddress} className="mt-5"/>

        <AddressDetail
          className="mt-2"
          activeUserAddress={activeUserAddress}
          addr={tx.account}
          title="Account"
        />

        <AddressDetail
          className="mt-2"
          activeUserAddress={activeUserAddress}
          addr={tx.by}
          title="By"
        />

        <AddressDetail
          className="mt-2"
          activeUserAddress={activeUserAddress}
          addr={tx.to}
          title="To"
        />

        {
          (tx.voters || {})[activeUserAddress] && (
            <div className="mt-5">
              <Button
                className="mr-5"
                type="green"
                onClick={() => onVote(txId, VoteStatuses.APPROVE)}
              >Approve</Button>
              <Button
                type="red"
                onClick={() => onVote(txId, VoteStatuses.REJECT)}
              >Reject</Button>
            </div>
          )
        }
      </div>

      <h3 className="text-xl px-1 my-5 text-gray-900">
        Voters ({tx.votersSize})
      </h3>
      <div className="bg-white shadow py-6 px-4">
        {Object.entries(tx.voters || {}).map(([addr, { status }]) =>
          <div key={addr} className="flex items-center">
            <CircleStatus status={status}/>
            <AddressDetail
              activeUserAddress={activeUserAddress}
              addr={addr}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(TransactionDetail);
