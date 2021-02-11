import React, { useEffect, useState, useMemo } from 'react';
import { TransactionStatuses, VoteStatuses } from '../constants/enums';


function CircleStatus({ status, txStatus }) {
  const status2bg = {
    [VoteStatuses.REJECT]: 'bg-red-500',
    [VoteStatuses.APPROVE]: 'bg-green-500',
  };
  const txStatus2bg = {
    [VoteStatuses.REJECTED]: 'bg-red-500',
    [VoteStatuses.APPROVED]: 'bg-green-500',
  };
  const bg = status ? status2bg[status] : txStatus2bg[txStatus];
  return <span className={'inline-block w-2 h-2 mr-1 rounded ' + (bg || 'bg-gray-500')}></span>
}


export default CircleStatus;
