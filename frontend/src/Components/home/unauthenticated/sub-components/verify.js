import React, { useState } from 'react';

const VerifyForm = (props) => {
    const [sentIndicator, setSentIndicator] = useState(<></>);
    return (
        <div className="welcome-hero-side-container">
            <p>If you have verified your email, please refresh the page. </p>
            {sentIndicator}
            <button onClick={(e) => {
                setSentIndicator(<p>Email has been sent! Once you verify your email, try refreshing the page.</p>)
                props.onSendEmailVerification(e);
            }}>Resend Email</button>
            <div>
                <button onClick={props.onLoginRegisterToggle}>Register</button>
                <button onClick={props.onSignOut}>Login as someone else</button>
            </div>
        </div>
    );
}

export default VerifyForm;
