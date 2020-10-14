import React from 'react';
import WelcomePage from './unauthenticated/index';
import UserHomePage from './authenticated/index';
import { withRouter } from 'react-router-dom';
import { withFirebase } from '../../Firebase/';
import { AuthUserContext } from '../session';
import { compose } from "recompose";


const HomePage = () => {
    return (
        <>
            <AuthUserContext.Consumer>
                {
                    authUser =>
                    authUser && authUser.emailVerified ? <LandingBase /> : <WelcomePageBase emailVerifiedStatus={false} />
                }
            </AuthUserContext.Consumer>
        </>
    )
};

const WelcomePageBase = compose(withRouter, withFirebase)(WelcomePage);
const LandingBase = compose(withRouter, withFirebase)(UserHomePage);

export default withFirebase(HomePage);
