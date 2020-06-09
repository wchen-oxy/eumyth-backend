import React from 'react';
import { withAuthorization } from '../session';
import InitialCustomizationPage from './sub-components/initial-customization'
import ReturningUserPage from './sub-components/returning-user';
import { withFirebase } from '../../Firebase';
import './index.scss';
class UserHomePage extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            newUser: null
        }
    }
    componentDidMount() {
        this.props.firebase.checkExistingUser().then(
            result => {
                result ? this.setState({ newUser: false }) : this.setState({ newUser: true });
            }
        ) 
    }
   
    render() {
        console.log(this.state.newUser);
        // return this.state.newUser ?
        //     <InitialCustomizationPage /> : <ReturningUserPage />;
        return this.state.newUser ?
           <ReturningUserPage /> :  <InitialCustomizationPage /> ;
    }
}

const condition = authUser => !!authUser;
export default withAuthorization(condition)(withFirebase(UserHomePage));
