import React from 'react';
import './index.scss';
import {AuthUserContext} from '../../Components/session/'
import { withFirebase } from '../../Firebase';
import {Link} from 'react-router-dom';

const Navigation = () => (
    <div>
      <AuthUserContext.Consumer>
        {authUser =>
          authUser && authUser.emailVerified ? <NavigationAuthBase /> : <NavigationNonAuth />
        }
      </AuthUserContext.Consumer>
    </div>
  );
  
  const NavigationAuth = (props) => (
    <div className="welcome-navbar-container">
        <div className="navbar-item">
          <Link to={'/'} id="new-entry">interestHub</Link>
          <Link to={'/new'} id="new-entry">New Entry</Link>
        </div>
        <div className="navbar-item no-select">
          <Link to={'/account'} id="setting" >Settings</Link>
          <button onClick={props.firebase.doSignOut}>SignOut</button>
        </div>
       
    </div>
  );
  
  const NavigationNonAuth = () => (
    <div className="welcome-navbar-container">
   
        <div className="navbar-item no-select">
            <a>intersestHub</a>
        </div>

   
</div>
  );

  const NavigationAuthBase = withFirebase(NavigationAuth)

  
  export default Navigation;