import React from 'react';
import {withAuthorization} from '../session';

class UserHomePage extends React.Component {

    constructor(props) {
        super(props)
        this.handleSignOut = this.handleSignOut.bind(this);
    }

    handleSignOut(e) {
        e.preventDefault();
        this.props.firebase.doSignOut();
    }

    render() {
        console.log("Test");
        console.log(this.props.firebase.auth.currentUser);
        return (
            <div>
                TEST SUCCESS
                <button onClick={this.handleSignOut}>Sign Out</button>
            </div>

        )
    }
}

// long vesion is 
// const condition = authUser => authUser != null;
const condition = authUser => !!authUser;
export default withAuthorization(condition)(UserHomePage);
