import React, { useState, useMemo, useEffect } from 'react';
import { TransactionStatuses, VoteStatuses } from '../constants/enums';


function FilterSelect({ value, options, onChange }) {
  return (
    <select
      value={value}
      onChange={ev => onChange(ev.target.value)}
      className="px-1 py-2 max-w-full truncate
                 block mb-4 w-full
                 md:inline-block md:w-44 md:mr-1"
    >
      {options}
    </select>
  );
}


function TransactionsFilters({ accountAddress, transactionItems, onChange }) {
  const statusOptions = [
    { label: 'Any tx status' },
    { label: 'Pending', value: TransactionStatuses.PENDING },
    { label: 'Approved', value: TransactionStatuses.APPROVED },
    { label: 'Rejected', value: TransactionStatuses.REJECTED },
  ].map(({ label, value }) =>
    <option
      key={'txstatus' + (value || label)}
      value={value || label}
    >{label || value}</option>)
  statusOptions.noValue = 'Any tx status';
  const myVoteStatusOptions = [
    { label: 'Any vote status' },
    { label: 'Pending', value: VoteStatuses.PENDING },
    { label: 'Approved', value: VoteStatuses.APPROVE },
    { label: 'Rejected', value: VoteStatuses.REJECTE },
  ].map(({ label, value }) =>
    <option
      key={'txstatus' + (value || label)}
      value={value || label}
    >{label || value}</option>)
  myVoteStatusOptions.noValue = 'Any vote status';

  const {
    profileIdOptions,
    votersOptions,
    toOptions,
    accountOptions,
    byOptions,
  } = useMemo(
    () => {
      const uniqueProfileIds = new Set();
      const uniqueTos = new Set();
      const uniqueAccounts = new Set();
      const uniqueBys = new Set();
      const uniqueVoters = new Set();
      for (var i = transactionItems.length - 1; i >= 0; i--) {
        const tx = transactionItems[i];
        uniqueProfileIds.add(tx.profileId);
        uniqueTos.add(tx.to);
        uniqueAccounts.add(tx.account);
        uniqueBys.add(tx.by);
        Object.keys(tx.voters).forEach(voter => {
          uniqueVoters.add(voter);
        });
      }

      const optionsFromArray = (set, prefix, noValue) => {
        const addrs = Array.from(set).map(value => ({ value }));
        addrs.unshift({ value: null, label: noValue });
        const options = addrs.map(({ value, label }) =>
          <option key={prefix + (label || value)} value={value}>
            {value === accountAddress ? '[ME]' : ''}
            {label || value}
          </option>
        );
        options.noValue = noValue;
        return options;
      };

      const profileIds = Array.from(uniqueProfileIds).map(value => ({ value }));
      const profileNoValue = 'Any Profile';
      profileIds.unshift({ value: null, label: profileNoValue });
      const profileOptions = profileIds.map(({ value, label }) =>
        <option key={label || value} value={value}>{label || value}</option>
      );
      profileOptions.noValue = profileNoValue;
      return {
        profileIdOptions: profileOptions,
        votersOptions: optionsFromArray(uniqueVoters, 'voters', 'Any voter'),
        toOptions: optionsFromArray(uniqueTos, 'to', 'Any recipient'),
        accountOptions: optionsFromArray(uniqueAccounts, 'account', 'Any account'),
        byOptions: optionsFromArray(uniqueBys, 'by', 'Any requester'),
      };
    },
    [transactionItems.length, accountAddress],
  );

  const [selectedProfileId, setSelectedProfileId] = useState(profileIdOptions.noValue);
  const [selectedVoter, setSelectedVoter] = useState(votersOptions.noValue);
  const [selectedTo, setSelectedTo] = useState(toOptions.noValue);
  const [selectedAccount, setSelectedAccount] = useState(accountOptions.noValue);
  const [selectedBy, setSelectedBy] = useState(byOptions.noValue);
  const [selectedTxStatus, setSelectedTxStatus] = useState(statusOptions.noValue);
  const [selectedVoteStatus, setSelectedVoteStatus] = useState(myVoteStatusOptions.noValue);

  useEffect(() => onChange({
    profileId: selectedProfileId === profileIdOptions.noValue ? null : selectedProfileId,
    voter: selectedVoter === votersOptions.noValue ? null : selectedVoter,
    to: selectedTo === toOptions.noValue ? null : selectedTo,
    account: selectedAccount === accountOptions.noValue ? null : selectedAccount,
    by: selectedBy === byOptions.noValue ? null : selectedBy,
    txStatus: selectedTxStatus === statusOptions.noValue ? null : selectedTxStatus,
    myVoteStatus: selectedVoteStatus === myVoteStatusOptions.noValue ? null : selectedVoteStatus,
  }), [
    onChange,
    selectedProfileId,
    selectedVoter, selectedTo, selectedAccount, selectedBy,
    selectedTxStatus, selectedVoteStatus,
  ]);

  return (
    <div className="mb-3 px-1 md:px-0">
      <FilterSelect
        value={selectedProfileId}
        onChange={setSelectedProfileId}
        options={profileIdOptions}
      />

      <FilterSelect
        value={selectedVoter}
        onChange={setSelectedVoter}
        options={votersOptions}
      />

      <FilterSelect
        value={selectedTo}
        onChange={setSelectedTo}
        options={toOptions}
      />

      <FilterSelect
        value={selectedAccount}
        onChange={setSelectedAccount}
        options={accountOptions}
      />

      <FilterSelect
        value={selectedBy}
        onChange={setSelectedBy}
        options={byOptions}
      />

      <FilterSelect
        value={selectedTxStatus}
        onChange={setSelectedTxStatus}
        options={statusOptions}
      />

      <FilterSelect
        value={selectedVoteStatus}
        onChange={setSelectedVoteStatus}
        options={myVoteStatusOptions}
      />
    </div>
  );
}


export default TransactionsFilters;
