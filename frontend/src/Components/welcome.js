import React from 'react';
import axios from 'axios';
import Navbar from './SubComponents/welcome.navbar';
import './welcome.scss';

// 
export default class WelcomePage extends React.Component {

  //setup the MongoDB user 
  constructor(props){
    super(props);

    this.state = {
      isLogin : true,
      loginEmail: '',
      loginPassword: '',
      registerEmail: '',
      registerPassword: '',
      registerConfirmPassword: '',
      registerFirstName: '',
      registerLastName: ''

    }
    
    this.handleLoginRegisterToggle = this.handleLoginRegisterToggle.bind(this);
    this.onChangeLoginEmail = this.onChangeLoginEmail.bind(this);
    this.onChangeLoginPassword = this.onChangeLoginPassword.bind(this);
    this.onChangeRegisterEmail = this.onChangeRegisterEmail.bind(this);
    this.onChangeRegisterPassword = this.onChangeRegisterPassword.bind(this);
    this.onChangeRegisterConfirmPassword = this.onChangeRegisterConfirmPassword.bind(this);
    this.onChangeRegisterFirstName = this.onChangeRegisterFirstName.bind(this);
    this.onChangeRegisterLastName = this.onChangeRegisterLastName.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onRegister = this.onRegister.bind(this);


  }
  
  handleLoginRegisterToggle() {
    this.setState(state => ({
      isLogin: !state.isLogin
    }));
  }

  onChangeLoginEmail(e){
    this.setState({
      loginEmail: e.target.value
    });
  }

  onChangeLoginPassword(e){
    this.setState({
      loginPassword: e.target.value
    });
  }

  onChangeRegisterEmail(e){
    this.setState({
      registerEmail: e.target.value
    });
  }

  onChangeRegisterPassword(e){
    this.setState({
      registerPassword: e.target.value
    });
  }

  onChangeRegisterConfirmPassword(e){
    this.setState({
      registerConfirmPassword: e.target.value
    });
  }

  onChangeRegisterFirstName(e){
    this.setState({
      registerFirstName: e.target.value
    });
  }

  onChangeRegisterLastName(e){
    this.setState({
      registerLastName: e.target.value
    });
  }

  onLogin(e){
    // e.preventDefault();
    
    console.log("Submitted");
    const user = {
      email : this.state.loginEmail,
      password : this.state.loginPassword
    }
    
  
  }

  onRegister(e){
    if (this.state.registerPassword !== this.state.registerConfirmPassword) {
      alert("Passwords don't match");
    }
    else if (this.state.registerConfirmPassword.length < 6){
      alert("Password is too short!");
    }
    else {
      console.log("Submitted");
      const newUser = {
        email : this.state.registerEmail,
        password : this.state.registerConfirmPassword,
        firstName : this.state.registerFirstName,
        lastName : this.state.registerLastName

      }
      axios.post('http://localhost:3000/add', newUser)
      .then(res => console.log(res.data));
    }
  }


    render() {
      let LoginRegister;
      if (this.state.isLogin) {
        LoginRegister = (
          <div className="login-signup-container">
            <section >
          <div className="signin-title">Sign In</div>
          <div className="login-register-container">
          <button onClick={this.handleLoginRegisterToggle}>Create Account</button>
          </div>
          <form onSubmit={this.onLogin}>
            <div className="text-input-wrapper"> 
            <label>Email
              <input type="text" className="text-input-input" placeholder="Email" name="login_email" autoComplete="off" onChange={this.onChangeLoginEmail}/>
              </label>
            </div>
            <div className="text-input-wrapper"> 
            <label>Password
              <input type="password" className="text-input-input" placeholder="Password" name="login_password" autoComplete="off" onChange={this.onChangeLoginPassword}/>
              </label>
            </div>

            <input type="submit" value="Submit" />
          </form>
          </section>
          </div>
        )
      }
      else{
        LoginRegister = (
          <div className="login-signup-container">
            <section >
          <div className="signin-title">Sign Up</div>
          <div className="login-register-container">
          <button onClick={this.handleLoginRegisterToggle}>Sign In</button>
          </div>
          <form onSubmit={this.onSubmit}>
            <div className="text-input-wrapper"> 
            <label>Email
              <input type="text" className="text-input-input" placeholder="Email" name="register_email" autoComplete="off" onChange={this.onChangeRegisterEmail}/>
              </label>
            </div>
     
            <div className="text-input-wrapper"> 
            <label>First Name
              <input type="password" className="text-input-input" placeholder="First Name" name="register_first_name" autoComplete="off" onChange={this.onChangeRegisterPassword}/>
              </label>
            </div>
                 
            <div className="text-input-wrapper"> 
            <label>Last Name
              <input type="password" className="text-input-input" placeholder="Last Name" name="register_last_name" autoComplete="off" onChange={this.onChangeRegisterPassword}/>
              </label>
            </div>

            <div className="text-input-wrapper"> 
            <label>Password
              <input type="password" className="text-input-input" placeholder="Password" name="register_password" autoComplete="off" onChange={this.onChangeRegisterPassword}/>
              </label>
            </div>
            <div className="text-input-wrapper"> 
            <label>Confirm Password
              <input type="password" className="text-input-input" placeholder="Password" name="register_confirm_password" autoComplete="off" onChange={this.onChangeRegisterConfirmPassword}/>
              </label>
            </div>

            <input type="submit" value="Submit" />
          </form>
          </section>
          </div>
        )
      }
      
      // let LoginRegister = (
      //       <div className="login-signup-container">
      //         <section >
      //       <div className="signin-title">Sign In</div>
      //       <div className="login-register-container">
      //       <button onClick={this.handleLoginRegisterToggle}>Create Account</button>
      //       </div>
      //       <form onSubmit={this.onLogin}>
      //         <div className="text-input-wrapper"> 
      //         <label>Email
      //           <input type="text" className="text-input-input" placeholder="Email" name="login_email" autoComplete="off" onChange={this.onChangeLoginEmail}/>
      //           </label>
      //         </div>
      //         <div className="text-input-wrapper"> 
      //         <label>Password
      //           <input type="password" className="text-input-input" placeholder="Password" name="login_password" autoComplete="off" onChange={this.onChangeLoginPassword}/>
      //           </label>
      //         </div>
  
      //         {/* <input type="submit" value="Submit" /> */}
      //       </form>
      //       </section>
      //       </div>
      //     )


      return (
        <div className="master-container">
          <Navbar />
          <main >
          <section className="overview-login-register-container">
            <div className="overview-description-container">
            
            <p>You are on the Create User component!</p>
            </div>
            {LoginRegister}
            </section>
        
          

          </main>
          
          
        </div>
      )
    }
  }

