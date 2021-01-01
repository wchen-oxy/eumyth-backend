import React from 'react';

const WelcomeRegisterForm = (props) => (
  <div className="welcome-hero-side-container">
    <h4>Sign Up</h4>
    <button onClick={props.onToggleLoginRegisterWindow}>Sign In</button>
    <form onSubmit={props.onRegisterSubmit}>
      <div>
        <input type="text" placeholder="Email" name="email" autoComplete="off" onChange={props.onRegisterEmailChange} />
      </div>
      <div>
        <input type="password" placeholder="Password" name="password" autoComplete="off" onChange={props.onRegisterPasswordChange} />
      </div>
      <input type="submit" value="Submit" />
    </form>
  </div>
)


export default WelcomeRegisterForm;
