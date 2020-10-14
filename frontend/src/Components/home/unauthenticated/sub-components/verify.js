import React, {useState} from 'react';
import './verify.scss';

const VerifyPage = (props) => {
    const [sentIndicator, setSentIndicator] = useState(<></>);
        return (
            <div className="login-signup-container">
                <section>
                    <div className="login-register-container">
                        <p>If you have verified your email, please refresh the page. </p>
                        {sentIndicator}
                        <button onClick={(e) => {
                            setSentIndicator(<p>Email has been sent! Once you verify your email, try refreshing the page.</p>)
                            props.onSendEmailVerification(e);
                            }}>Resend Email</button>
                        <div className="login-register-button-containers">
                            <button onClick={props.onLoginRegisterToggle}>Register</button>
                            <button onClick={props.onSignOut}>Login as someone else</button>
                        </div>
                    </div>
                </section>
            </div>
        );
}

export default VerifyPage;
