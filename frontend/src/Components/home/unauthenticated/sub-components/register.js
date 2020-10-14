import React from 'react';

export default class WelcomeRegisterComponent extends React.Component {
  render() {
    return (
      <div className="login-signup-container">
        <section >
          <div className="signin-signup-title">Sign Up</div>
          <div className="login-register-container">
            <button onClick={this.props.onToggleLoginRegisterWindow}>Sign In</button>
          </div>
          <form onSubmit={this.props.onRegisterSubmit}>
            <div className="text-input-wrapper">
              <input type="text" className="text-input-input" placeholder="Email" name="email" autoComplete="off" onChange={this.props.onRegisterEmailChange} />
            </div>
            <div className="text-input-wrapper">
              <input type="password" className="text-input-input" placeholder="Password" name="password" autoComplete="off" onChange={this.props.onRegisterPasswordChange} />
            </div>
            <input type="submit" value="Submit" />
          </form>
        </section>
      </div>
    )
  }

}
