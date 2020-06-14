import React from 'react';
import './index.scss';
import {AuthUserContext} from '../../Components/session/'
import { withFirebase } from '../../Firebase';

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
            <a>interestHub</a>
        </div>
        <div className="navbar-item no-select">
            <button onClick={props.firebase.doSignOut}>SignOut</button>
        </div>
    </div>
    // <ul>
    //   <li>
    //     <Link to={ROUTES.LANDING}>Landing</Link>
    //   </li>
    //   <li>
    //     <Link to={ROUTES.HOME}>Home</Link>
    //   </li>
    //   <li>
    //     <Link to={ROUTES.ACCOUNT}>Account</Link>
    //   </li>
    //   <li>
    //     <SignOutButton />
    //   </li>
    // </ul>
  );
  
  const NavigationNonAuth = () => (
    <div className="welcome-navbar-container">
   
        <div className="navbar-item no-select">
            <a>intersestHub</a>
        </div>

   
</div>

    // <ul>
    //   <li>
    //     <Link to={ROUTES.LANDING}>Landing</Link>
    //   </li>
    //   <li>
    //     <Link to={ROUTES.SIGN_IN}>Sign In</Link>
    //   </li>
    // </ul>
  );

  const NavigationAuthBase = withFirebase(NavigationAuth)

  
  export default Navigation;