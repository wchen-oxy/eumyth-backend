import React from 'react';

export default class UserHomePage extends React.Component {

    constructor(props) {
        super(props)
        this.handleSignOut = this.handleSignOut.bind(this);
    }

    handleSignOut(e) {
        e.preventDefault();
        this.props.firebase.doSignOut();
    }

    render() {
        return (
            <div>
                TEST SUCCESS
                <button onClick={this.handleSignOut}>Sign Out</button>
            </div>

        )
    }
}
