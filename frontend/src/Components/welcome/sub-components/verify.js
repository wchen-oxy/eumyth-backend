import React from 'react';
import './verify.scss';

export default class VerifyPage extends React.Component {

    render() {
        return (
            <div className="login-signup-container">
                <section>
                    <div className="login-register-container">
                        <p>Verify Button</p>
                        <p>If you have verified your email, please refresh the page. </p>
                        <button onClick={this.props.onSendEmailVerification}>Resend Email</button>
                        <div className="login-register-button-containers">
                            <button onClick={this.props.onLoginRegisterToggle}>Register</button>
                            <button onClick={this.props.onSignOut}>Login as someone else</button>
                        </div>
                    </div>
                </section>
            </div>
        )
    }


}
