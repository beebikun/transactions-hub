import React from 'react';
import {
  NavLink
} from "react-router-dom";


function HeaderLink({ className, to, children }) {
  return <NavLink
      to={to}
      exact
      className={(className || '') + " py-3 px-3 bg-gray-500 block pointer hover:bg-red-400 text-red-50"}
      activeClassName="bg-red-500 opacity-100 text-red-50"
    >{children}</NavLink>
}


function Header() {
  return (
    <div className="px-3 bg-gray-400 mb-6 flex">
      <HeaderLink to="/">Transactions</HeaderLink>
      <HeaderLink className="mx-2" to="/add">Add</HeaderLink>
      <HeaderLink to="/account">Account</HeaderLink>
    </div>
  );
}


export default Header;
