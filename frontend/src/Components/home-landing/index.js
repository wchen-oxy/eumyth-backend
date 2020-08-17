import React from 'react';
import { withAuthorization } from '../session';
import InitialCustomizationPage from './sub-components/initial-customization'
import ReturningUserPage from './sub-components/returning-user';
import { withFirebase } from '../../Firebase';

class UserHomePage extends React.Component {
    _isMounted = false;

    constructor(props) {
        super(props)
        this.state = {
            newUser: null
        }
    }
    
    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted) this.props.firebase.checkIsExistingUser().then(
            result => {
                console.log(result);
                result ? this.setState({ newUser: false }) : this.setState({ newUser: true });
            }
        );
    }
    componentWillUnmount(){
        this._isMounted = false;
    }

    render() {
        console.log(this.state.newUser ? "is true" : " is false");
        if (this.state.newUser === null) return( <div>Grabbing User Info</div>);
        return (this.state.newUser ? <InitialCustomizationPage /> : <ReturningUserPage />);
    }
}

const condition = authUser => !!authUser;
export default withAuthorization(condition)(withFirebase(UserHomePage));
