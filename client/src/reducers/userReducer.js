import * as TYPES from "../constants/actionTypes";
import { ROLES } from '../constants/enums';

const ROLES_INITIAL_STATE = Object.values(ROLES)
  .reduce((bucket, role) => ({ ...bucket, [role]: {}}), {});
const ROLES_TO_PROPERTY = {
  [ROLES.VOTERS]: 'votersSize',
  [ROLES.REQUESTER]: 'requstersSize',
}

const initialState = {
  address: null,
  hash: null,

  balance: 0,
  profilesSize: 0,

  // Object of form:
  // {
  //   idx: {
  //      requstersSize: num,
  //      votersSize: num,
  //      title: str,
  //      consensusPercentage: num,
  //      profileIdx: num
  //      accountAddress: str
  //    }, ...
  // }
  profiles: {},
  // Object of form: {0: {[profile.idx]: {idx: addr, }, ...}, 1: {...}}
  userPermissions: { ...ROLES_INITIAL_STATE },
};


function userReducer(state = initialState, action) {
  if (action.accountAddress && action.accountAddress !== state.address) {
    return state;
  }
  if (action.type === TYPES.ACCOUNT_HASH_RECEIVED) {
    return {
      ...state,
      hash: action.payload.hash,
      address: action.payload.accountAddress,
    };
  }

  if (action.type === 'GOT_CONTRACT_VAR' &&
      action.name === 'Hub' &&
      action.variable === 'account' &&
      action.argsHash === state.hash) {
    return {
      ...state,
      balance: parseInt(action.value.balance || 0, 10),
      profilesSize: parseInt(action.value.profilesSize || 0, 10),
    };
  }

  if (action.type === TYPES.PROFILE_RECEIVED) {
    const profileIdx = action.payload.result.profileIdx;
    return {
      ...state,
      profiles: {
        ...state.profiles,
        [profileIdx]: {
          ...state.profiles[profileIdx],
          ...action.payload.result
        },
      },
    };
  }
  if (action.type === TYPES.USER_PERMISSION_RECEIVED) {
    const newState = JSON.parse(JSON.stringify(state));
    const profileIdx = action.payload.result.profileIdx;
    const role = action.payload.result.role;
    const idx = action.payload.result.idx;
    if (!newState.userPermissions[profileIdx]) {
      newState.userPermissions[profileIdx] = {};
    }
    if (!newState.userPermissions[profileIdx][role]) {
      newState.userPermissions[profileIdx][role] = {};
    }
    newState.userPermissions[profileIdx][role][idx] = action.payload.result.address;
    return newState;
  }

  return state;
}

export default userReducer;
