import React from 'react';


export default class WelcomeLoginComponent extends React.Component {

  render() {
    return (
      <div className="login-signup-container">
        <section >
          <div className="signin-signup-title">Sign In</div>
          <div className="login-register-container">
            <button onClick={this.props.onLoginRegisterToggle}>Create Account</button>
          </div>
          <form onSubmit={this.props.onLoginSubmit}>
            <div className="text-input-wrapper">
              <input type="text" className="text-input-input" placeholder="Email" name="email" autoComplete="off" onChange={this.props.onLoginEmailChange} />
            </div>
            <div className="text-input-wrapper">
              <input type="password" className="text-input-input" placeholder="Password" name="password" autoComplete="off" onChange={this.props.onLoginPasswordChange} />
            </div>

            <input type="submit" value="Log in" />
          </form>
        </section>
      </div>
    )
  }

}
