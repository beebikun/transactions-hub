import * as TYPES from "../constants/actionTypes";
import { ROLES } from '../constants/enums';

// Object of form: {0: {[profileId]: {idx: addr, }, ...}, 1: {...}}
const initialState = Object.values(ROLES)
  .reduce((bucket, role) => ({ ...bucket, [role]: {}}), {});


function userPermissionReducer(state = initialState, action) {
  if (action.type === TYPES.USER_PERMISSION_RECEIVED) {
    const newState = JSON.parse(JSON.stringify(state));
    const { profileId, role, idx } = action.payload.result;
    if (!newState[profileId]) {
      newState[profileId] = {};
    }
    if (!newState[profileId][role]) {
      newState[profileId][role] = {};
    }
    newState[profileId][role][idx] = action.payload.result.address;
    return newState;
  }

  // TODO: delete from storage on delete and on profile delete

  return state;
}

export default userPermissionReducer;
