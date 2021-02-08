import * as TYPES from "../constants/actionTypes";


export function accountHashReceived(payload) {
  return { type: TYPES.ACCOUNT_HASH_RECEIVED, payload };
}
export function requestProfile(payload) {
  return { type: TYPES.REQUEST_PROFILE, payload };
}
export function profileReceived(payload) {
  return { type: TYPES.PROFILE_RECEIVED, payload };
}
export function profileRemoved(payload) {
  return { type: TYPES.PROFILE_REMOVED, payload };
}

export function requestUserPermission(payload) {
  return { type: TYPES.REQUEST_USER_PERMISSION, payload };
}
export function userPermissionReceived(payload) {
  return { type: TYPES.USER_PERMISSION_RECEIVED, payload };
}

export function requestRefill(payload) {
  return { type: TYPES.REQUEST_REFILL, payload };
}
export function addProfile(payload) {
  return { type: TYPES.ADD_PROFILE, payload };
}
export function editProfile(payload) {
  return { type: TYPES.EDIT_PROFILE, payload };
}
export function removeProfile(payload) {
  return { type: TYPES.REMOVE_PROFILE, payload };
}
export function addUserPermission(payload) {
  return { type: TYPES.ADD_USER_PERMISSION, payload };
}
export function removeUserPermission(payload) {
  return { type: TYPES.REMOVE_USER_PERMISSION, payload };
}
export function addRequest(payload) {
  return { type: TYPES.ADD_REQUEST, payload };
}
