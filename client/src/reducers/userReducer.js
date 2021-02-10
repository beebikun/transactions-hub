import * as TYPES from '../constants/actionTypes';
import { GOT_CONTRACT_VAR } from '../constants/drizzleActionTypes';


const initialState = {
  address: null,
  hash: null,

  balance: 0,
  profilesSize: 0,

  profileIds: [],
  transactionIds: [],
};


function userReducer(state = initialState, action) {
  if (action.accountAddress && action.accountAddress !== state.address) {
    return state;
  }
  if (action.type === TYPES.ACTIVE_USER_ACCOUNT_HASH_RECEIVED) {
    return {
      ...state,
      hash: action.payload.hash,
      address: action.payload.accountAddress,
    };
  }

  if (action.type === GOT_CONTRACT_VAR &&
      action.name === 'Hub' &&
      action.variable === 'account' &&
      action.argsHash === state.hash) {
    return {
      ...state,
      balance: parseInt(action.value.balance || 0, 10),
      profilesSize: parseInt(action.value.profilesSize || 0, 10),
    };
  }

  if (action.type === TYPES.PROFILE_IDS_RECEIVED) {
    return {
      ...state,
      profileIds: action.payload.result,
    };
  }

  if (action.type === TYPES.TRANSACTION_IDS_RECEIVED) {
    return {
      ...state,
      transactionIds: action.payload.result,
    };
  }

  return state;
}

export default userReducer;
