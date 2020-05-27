import React from 'react';
import WelcomePage from '../welcome/index';
import UserHomePage from '../landing/index';
import {withRouter} from 'react-router-dom';
import {withFirebase} from '../../Firebase/';
import {AuthUserContext} from '../session';

const HomePage = () => (
    <div>
        <AuthUserContext.Consumer>
            {
            authUser => 
            authUser ? <LandingBase/> : <WelcomePageBase/>
            }
        </AuthUserContext.Consumer>
    </div>
)

const WelcomePageBase = withRouter(withFirebase(WelcomePage));
const LandingBase =  withRouter(withFirebase(UserHomePage));

export default HomePage;
