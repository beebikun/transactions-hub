import * as TYPES from "../constants/actionTypes";


export function activeUserAccountHashReceived(payload) {
  return { type: TYPES.ACTIVE_USER_ACCOUNT_HASH_RECEIVED, payload };
}
export function fetchProfileIds(payload) {
  return { type: TYPES.FETCH_PROFILE_IDS, payload };
}
export function profileIdsReceived(payload) {
  return { type: TYPES.PROFILE_IDS_RECEIVED, payload };
}
export function fetchProfile(payload) {
  return { type: TYPES.FETCH_PROFILE, payload };
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

export function refillAccount(payload) {
  return { type: TYPES.REFILL_ACCOUNT, payload };
}
export function addTransactionRequest(payload) {
  return { type: TYPES.ADD_TRANSACTION_REQUEST, payload };
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
export function sendVote(payload) {
  return { type: TYPES.SEND_VOTE, payload };
}
export function fetchTransactions(payload) {
  return { type: TYPES.FETCH_TRANSACTIONS, payload };
}
export function fetchTransaction(payload) {
  return { type: TYPES.FETCH_TRANSACTION, payload };
}
export function transactionReceived(payload) {
  return { type: TYPES.TRANSACTION_RECEIVED, payload };
}
