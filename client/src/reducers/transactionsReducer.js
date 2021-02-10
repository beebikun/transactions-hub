import * as TYPES from "../constants/actionTypes";


// Object of form:
// {
//   id: {
//      profileId: str,
//      account: str,
//      to: str,
//      by: str,
//      amount: num,
//      status: TransactionStatuses,
//      consensus: num,
//      votersSize: num,
//      approvalCount: num,
//      rejectCount: num,
//      voters: {str: {status: VoteStatuses}, ...},
//    }, ...
// }
const initialState = {
};


function transactionsReducer(state = initialState, action) {
  if (action.type === TYPES.TRANSACTION_RECEIVED) {
    const txId = action.payload.result.txId;
    return {
      ...state,
      [txId]: {
        ...state[txId],
        ...action.payload.result
      },
    };
  }

  return state;
}

export default transactionsReducer;
