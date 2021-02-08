import React from 'react';
import { connect } from "react-redux";
import Header from "./components/Header";
import ManageAccount from "./pages/ManageAccount";
import AddTransaction from "./pages/AddTransaction";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";


const mapStateToProps = state => {
  return {
    isLoaded: state.drizzleStatus.initialized,
    isTestNetwork: state.web3.networkId === 5777,
  };
};


const App = ({ isLoaded, isTestNetwork }) => {
  if (!isLoaded) return (
    <div className="bg-gray-100 h-screen flex justify-center items-center">

      <span className="flex w-60 h-60 relative">
        <span className="
          animate-ping absolute inline-flex h-full w-full
          rounded-full bg-red-400 opacity-75
        "></span>
        <span className="
          relative inline-flex h-full w-full
          justify-center items-center text-center
          rounded-full
          border-red-300 border-20
          bg-red-400
          text-yellow-50
        ">
          <div>
            <div className="text-5xl">ʕಠᴥಠʔ</div>
            <div className="
              mt-2 tracking-widest text-2xl
            ">Loading</div>
          </div>
        </span>
      </span>

    </div>
  );

  if (!isTestNetwork) return (
    <span>Change network!</span>
  );

  return (
    <Router>
      <div className="bg-gray-100 font-mono min-h-screen">
        {/* <Header/> */}
        <div className="container mx-auto">
          <Switch>
            <Route path="/account">
              <ManageAccount />
            </Route>
            <Route path="/add">
              <AddTransaction />
            </Route>
            <Route path="/">
              <div className="container mx-auto bg-white">
                Content
              </div>
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
};




export default connect(mapStateToProps)(App);
