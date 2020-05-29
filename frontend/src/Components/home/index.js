import React from 'react';
import WelcomePage from '../welcome/index';
import UserHomePage from '../landing/index';
import {withRouter} from 'react-router-dom';
import {withFirebase} from '../../Firebase/';
import {AuthUserContext} from '../session';


const HomePage = (props) => {
    console.log("home");
    console.log(props.firebase.auth.currentUser);
    return(
    <div>
        <AuthUserContext.Consumer>
            {
            authUser => 
            authUser ? <LandingBase/> : <WelcomePageBase/>
            }
        </AuthUserContext.Consumer>
    </div>
)};

const condition = authUser => !!authUser;
const WelcomePageBase = withRouter(withFirebase(WelcomePage));
const LandingBase =  withRouter(withFirebase(UserHomePage));

export default withFirebase(HomePage);
