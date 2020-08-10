import React from 'react';
import WelcomePage from '../welcome/index';
import UserHomePage from '../home-landing/index';
import { withRouter } from 'react-router-dom';
import { withFirebase } from '../../Firebase/';
import { AuthUserContext } from '../session';


const HomePage = () => {
    return (
        <div >
            <AuthUserContext.Consumer>
                {
                    authUser =>
                    authUser && authUser.emailVerified ? <LandingBase /> : <WelcomePageBase emailVerifiedStatus={false} />
                }
            </AuthUserContext.Consumer>
        </div>
    )
};

const WelcomePageBase = withRouter(withFirebase(WelcomePage));
const LandingBase = withRouter(withFirebase(UserHomePage));

export default withFirebase(HomePage);