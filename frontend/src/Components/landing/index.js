import React from 'react';
import { withAuthorization } from '../session';
import InitialCustomizationPage from './sub-components/initial-customization'
import ReturningUserPage from './sub-components/returning-user';
import { withFirebase } from '../../Firebase';
import './index.scss';
class UserHomePage extends React.Component {

    constructor(props) {
        super(props)
        // this.handleSignOut = this.handleSignOut.bind(this);
        this.handleBasicInfoChange = this.handleBasicInfoChange.bind(this);
        this.handleCheckIfReturning = this.handleCheckIfReturning.bind(this);
        this.state = {
            newUser: null
        }
    }
    componentDidMount() {
        // this.props.firebase
        //go get the uid and check if existing user
        this.props.firebase.checkExistingUser(this.props.firebase.auth.currentUser.uid) ? this.setState({ newUser: true }) : this.setState({ newUser: false });
        // this.props.firebase.auth.currentUser;
    }
    handleBasicInfoChange(e) {

    }
    handleCheckIfReturning(e) {

    }

   

    render() {
        if (!this.state.newUser) return (<div></div>);
        console.log("Test");
        console.log(this.props.firebase.auth.currentUser);
        return this.state.newUser ?
            <InitialCustomizationPage />
            :
            <ReturningUserPage />;

    }
}

// long vesion is 
// const condition = authUser => authUser != null;
const condition = authUser => !!authUser;
export default withAuthorization(condition)(withFirebase(UserHomePage));
