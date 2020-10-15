import React from 'react';

const WelcomeRegisterComponent = (props) => (
  <div className="login-signup-container flex-display">
    <section >
      <h4>Sign Up</h4>
        <button onClick={props.onToggleLoginRegisterWindow}>Sign In</button>
      <form onSubmit={props.onRegisterSubmit}>
        <div className="text-input-wrapper">
          <input type="text" placeholder="Email" name="email" autoComplete="off" onChange={props.onRegisterEmailChange} />
        </div>
        <div className="text-input-wrapper">
          <input type="password" placeholder="Password" name="password" autoComplete="off" onChange={props.onRegisterPasswordChange} />
        </div>
        <input type="submit" value="Submit" />
      </form>
    </section>
  </div>
)


export default WelcomeRegisterComponent;
