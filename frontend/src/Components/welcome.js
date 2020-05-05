import React from 'react';
import axios from 'axios';
import Navbar from './SubComponents/welcome.navbar';
import './welcome.scss';

// 
export default class LoginOrRegisterPage extends React.Component {

  //setup the MongoDB user 
  constructor(props){
    super(props);

    this.state = {
      username: '',
      password: ''
    }
  }


    render() {
      return (
        <div className="master-container">
          <Navbar />
          <main >
          <section classname="overview-login-register-container">
            <div className="overview-description-container">
            
            <p>You are on the Create User component!</p>
           

            </div>

            <div className="login-signup-container">
              <section >
              <div className="signin-title"></div>
              <form method="POST">
                <div className="text-input-wrapper"> 
                <label>Email</label>
                  <input type="text" className="text-input-input" name="login_email" autoComplete="off" />
                </div>
                <div className="text-input-wrapper"> 
                <label>Password</label>
                  <input type="password" className="text-input-input" name="login_password" autoComplete="off" />
                </div>

                <button type="submit">Submit</button>
              </form>
              

              </section>
            
            </div>
            </section>
        
          

          </main>
          
          
        </div>
      )
    }
  }

