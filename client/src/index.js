import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from "react-redux";
import { Drizzle, generateStore, EventActions } from "@drizzle/store";
import { transactionEventsMiddleWare } from './middleware';
import { userReducer, profilesReducer, userPermissionsReducer, transactionsReducer } from './reducers';
import sagas from './sagas';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import HubApi from './api/Hub';

import drizzleOptions from './drizzleOptions';

const drizzleStore = generateStore({
  drizzleOptions,
  appReducers: {
    activeUser: userReducer,
    profiles: profilesReducer,
    userPermissions: userPermissionsReducer,
    txRequests: transactionsReducer,
  },
  disableReduxDevTools: false,
  appSagas: sagas,
  appMiddlewares: [
    transactionEventsMiddleWare,
  ],
});
const drizzle = new Drizzle(drizzleOptions, drizzleStore);
HubApi.init(drizzle);


ReactDOM.render(
  <Provider store={drizzle.store}>
    <App/>
  </Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
