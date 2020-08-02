import React from 'react';
import PasswordForgetPage from '../../password-forget/index'

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
            <div>
              <input type="text" placeholder="Email" name="email" autoComplete="off" onChange={this.props.onLoginEmailChange} />
            </div>
            <div>
              <input type="password" placeholder="Password" name="password" autoComplete="off" onChange={this.props.onLoginPasswordChange} />
            </div>

            <input type="submit" value="Log in" />
          </form>
          <PasswordForgetPage />
        </section>
      </div>
    )
  }

}
