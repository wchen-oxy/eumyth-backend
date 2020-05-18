import React from 'react';


export default class WelcomeRegisterComponent extends React.Component {

    render(){
        return(
            <div className="login-signup-container">
            <section >
          <div className="signin-signup-title">Sign Up</div>
          <div className="login-register-container">
          <button onClick={this.props.onLoginRegisterToggle}>Sign In</button>
          </div>
          <form onSubmit={this.props.onRegisterSubmit}>
            <div className="text-input-wrapper"> 
              <input type="text" className="text-input-input" placeholder="Email" name="register_email" autoComplete="off" onChange={this.props.onRegisterEmailChange}/>
            </div>

            <div className="text-input-wrapper"> 
          
              <input type="password" className="text-input-input" placeholder="Password" name="register_password" autoComplete="off" onChange={this.props.onRegisterPasswordChange}/>
            </div>
            {/* <div className="text-input-wrapper"> 
            <label>Confirm Password
              <input type="password" className="text-input-input" placeholder="Password" name="register_confirm_password" autoComplete="off" onChange={this.props.onRegisterConfirmPasswordChange}/>
              </label>
            </div> */}

            <input type="submit" value="Submit" />
          </form>
          </section>
          </div>
        )
    }

}
