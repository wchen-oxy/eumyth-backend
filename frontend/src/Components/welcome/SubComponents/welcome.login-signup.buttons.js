import React from 'react';
import './welcome.verify.scss';

function button(props) {
return (

    <div className="login-register-button-containers">
    <button onClick={props.onLoginRegisterToggle}>Register</button>
    <button onClick={props.onVerifiedEmailStatusChange}>Login</button>
    </div>
 
    )
}