import { EventActions } from "@drizzle/store";
import * as ACTIONS from '../actions';
import HubApi from '../api/Hub';


export const loggerMiddleware = store => next => action => {
  console.log('dispatching', action)
  const result = next(action)
  // console.log('next state', store.getState())
  return result
}

export const transactionEventsMiddleWare = store => next => action => {
  if (
    action.type === EventActions.EVENT_FIRED &&
    action.name === 'Hub' &&
    ['TransactionRequest', 'TransactionResponse', 'TransactionVote'].includes(action.event.event)
  ) {
    const event = action.event.returnValues;
    // Not in store yet but belongs to user - need to fetch.
    if (action.event.event === 'TransactionRequest' && HubApi.isActiveUserInTransactionEvent(event)) {
      store.dispatch(ACTIONS.fetchTransaction({ txId: event.uid }));
    }
    else {
      const { txRequests } = store.getState();
      // In store == belongs to user, need to fetch.
      if (txRequests.asObj[event.uid]) {
        store.dispatch(ACTIONS.fetchTransaction({ txId: event.uid }));
      }
    }
  }
  return next(action);
};

// export { default as userMiddleware } from './userMiddleware';
