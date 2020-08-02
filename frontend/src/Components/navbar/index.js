import React from "react";
import "./index.scss";
import { AuthUserContext } from "../../Components/session/"
import { withFirebase } from "../../Firebase";
import { Link } from "react-router-dom";

const Navigation = () => (

  <AuthUserContext.Consumer>
    {authUser =>
      authUser && authUser.emailVerified ? <NavigationAuthBase /> : <NavigationNonAuth />
    }
  </AuthUserContext.Consumer>

);

const NavigationAuth = (props) => (
  <nav className="welcome-navbar-container">
    <div className="navbar-item-group">
      <Link to={"/"} className="navbar-item">interestHub</Link>
      <Link to={"/new"} className="navbar-item">New Entry</Link>
    </div>
    <div className="navbar-item-group no-select">
      <Link to={"/account"} className="navbar-item" id="settins-link">Settings</Link>
      <button onClick={props.firebase.doSignOut} className="navbar-item">SignOut</button>
    </div>

  </nav>
);

const NavigationNonAuth = () => (
  <div className="welcome-navbar-container">
    <div className="navbar-item-group">
      <Link to={"/"} className="navbar-item">interestHub</Link>
    </div>
  </div>
);

const NavigationAuthBase = withFirebase(NavigationAuth)


export default Navigation;