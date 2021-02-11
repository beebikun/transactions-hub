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
  asObj: {},
  asArr: [],
};


function transactionsReducer(state = initialState, action) {
  if (action.type === TYPES.TRANSACTION_RECEIVED) {
    const txId = action.payload.result.txId;
    const newState = JSON.parse(JSON.stringify(state));
    newState.asObj[txId] = action.payload.result;
    newState.asArr = Object.values(newState.asObj);
    return newState;
  }

  return state;
}

export default transactionsReducer;
