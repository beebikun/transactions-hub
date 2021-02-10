import { call, put, takeEvery } from 'redux-saga/effects'
import { ACCOUNTS_FETCHED, BLOCK_PROCESSING } from "../constants/drizzleActionTypes";
import * as TYPES from "../constants/actionTypes";
import HubApi from '../api/Hub';
import * as ACTIONS from '../actions';

const sagas = [];


sagas.push(function* fetchAccountSaga() {
  yield takeEvery(ACCOUNTS_FETCHED, function* fetchAccount(action) {
    const accountAddress = action?.accounts?.[0];
    const hash = yield call(HubApi.fetchActiveUser, accountAddress);
    yield put(ACTIONS.activeUserAccountHashReceived({ hash, accountAddress }));
  });
});

sagas.push(function* fetchProfileIdsSaga() {
  yield takeEvery(TYPES.FETCH_PROFILE_IDS, function* fetchProfileIds(action) {
    const result = yield call(HubApi.fetchProfileIds, action.payload);
    yield put(ACTIONS.profileIdsReceived({ result }));
  });
});

sagas.push(function* fetchProfileSaga() {
  yield takeEvery(TYPES.FETCH_PROFILE, function* fetchProfile(action) {
    const result = yield call(HubApi.fetchProfile, action.payload);
    yield put(ACTIONS.profileReceived({ result }));
  });
});


sagas.push(function* fetchUserPermissionSaga() {
  yield takeEvery(TYPES.REQUEST_USER_PERMISSION, function* fetchUserPermission(action) {
    const result = yield call(HubApi.fetchUserPermission, action.payload);
    yield put(ACTIONS.userPermissionReceived({ result }));
  });
});


sagas.push(function* refillAccountSaga() {
  yield takeEvery(TYPES.REFILL_ACCOUNT, function* refillAccount(action) {
    yield call(HubApi.refillAccount, action.payload);
    // No follow up dispatch is required.
  });
});
sagas.push(function* editProfileSaga() {
  yield takeEvery(TYPES.EDIT_PROFILE, function* editProfile(action) {
    yield call(HubApi.editProfile, action.payload);
    // No follow up dispatch is required.
  });
});
sagas.push(function* removeProfileSaga() {
  yield takeEvery(TYPES.REMOVE_PROFILE, function* removeProfile(action) {
    yield call(HubApi.removeProfile, action.payload);
    // yield put(ACTIONS.profileRemoved(action.payload));
  });
});
sagas.push(function* addProfileSaga() {
  yield takeEvery(TYPES.ADD_PROFILE, function* addProfile(action) {
    yield call(HubApi.addProfile, action.payload);
    // No follow up dispatch is required.
  });
});
sagas.push(function* addUserPermissionSaga() {
  yield takeEvery(TYPES.ADD_USER_PERMISSION, function* addUserPermission(action) {
    yield call(HubApi.addUserPermission, action.payload);
    // No follow up dispatch is required.
  });
});
sagas.push(function* removeUserPermissionSaga() {
  yield takeEvery(TYPES.REMOVE_USER_PERMISSION, function* removeUserPermission(action) {
    yield call(HubApi.removeUserPermission, action.payload);
    // No follow up dispatch is required.
  });
});
sagas.push(function* addRequestSaga() {
  yield takeEvery(TYPES.ADD_TRANSACTION_REQUEST, function* addRequest(action) {
    yield call(HubApi.addRequest, action.payload);
    // No follow up dispatch is required.
  });
});
sagas.push(function* fetchTxsIdsSaga() {
  yield takeEvery(TYPES.FETCH_LAST_TRANSACTION_IDS, function* fetchTxsIds(action) {
    const result = yield call(HubApi.fetchTxIds, action.payload);
    yield put(ACTIONS.transactionIdsReceived({ result }));
  });
});
sagas.push(function* fetchTransactionSaga() {
  yield takeEvery(TYPES.FETCH_TRANSACTION, function* fetchTransaction(action) {
    const result = yield call(HubApi.fetchTransaction, action.payload);
    yield put(ACTIONS.transactionReceived({ result }));
  });
});



sagas.push(function* blockReceivedRouterSaga() {
  yield takeEvery(BLOCK_PROCESSING, function* blockReceivedRouter(action) {
    const l = action.block.transactions.length;
    for (let i = 0; i < l; i++) {
      const tx = action.block.transactions[i];
      const sign = tx.input && tx.input.slice(0, 10);
      const actionToSend = HubApi.SIGNS_MAP[sign];
      if (actionToSend) {
        yield put(actionToSend(tx.input.slice(10)));
      }
    }
  });
});

export default sagas;
