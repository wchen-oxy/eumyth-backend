import React from 'react';
import { withAuthorization } from '../session';
import InitialCustomizationPage from './sub-components/initial-customization'
import ReturningUserPage from './sub-components/returning-user';
import { withFirebase } from '../../Firebase';

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
        return (this.state.newUser ?
            <InitialCustomizationPage /> : <ReturningUserPage />);
    }
}

const condition = authUser => !!authUser;
export default withAuthorization(condition)(withFirebase(UserHomePage));
