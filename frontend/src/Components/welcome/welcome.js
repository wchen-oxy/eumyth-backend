import React from 'react';
import axios from 'axios';
import Navbar from './SubComponents/welcome.navbar';
import WelcomeLoginComponent from './SubComponents/welcome.login';
import WelcomeRegisterComponent from './SubComponents/welcome.register';
import VerifyPage from './welcome.verify';
import './welcome.scss';
import Firebase from '../../../../firebase/firebase';
import firebase from 'firebase';
import { Route, Redirect } from 'react-router-dom';

//email validation
var Isemail = require('isemail');

// firebase
const firebaseConfig = {
  apiKey: "AIzaSyC9sBHK-evjecmuWQsQHoE-iSJmHUcIBcE",
    authDomain: "eumyth-65330.firebaseapp.com",
    databaseURL: "https://eumyth-65330.firebaseio.com",
    projectId: "eumyth-65330",
    storageBucket: "eumyth-65330.appspot.com",
    messagingSenderId: "677080457179",
    appId: "1:677080457179:web:5e1e38f3f082f93427d1fe",
    measurementId: "G-GP77M3QKXG"
};

firebase.initializeApp(firebaseConfig);

export default class WelcomePage extends React.Component {

  //setup the MongoDB user 
  constructor(props){
    super(props);

    this.state = {
      isLoginMode : true,
      needEmailVerification: false, 
      currentUser: '',
      loginEmail: '',
      loginPassword: '',
      registerEmail: '',
      registerPassword: '',
      test: '',
   

    }

    this.handleLoginRegisterToggle = this.handleLoginRegisterToggle.bind(this);
    this.handleLoginEmail = this.handleLoginEmail.bind(this);
    this.handleLoginPassword = this.handleLoginPassword.bind(this);
    this.handleRegisterEmail = this.handleRegisterEmail.bind(this);
    this.handleRegisterPassword = this.handleRegisterPassword.bind(this);
    this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
    this.handleRegisterSubmit = this.handleRegisterSubmit.bind(this);


  }

  componentDidMount(){

    this.handleCurrentUser = this.handleCurrentUser(this);
    this.handleEmailVerifiedStatus = this.handleEmailVerifiedStatus(this);
    // let context = this;
    firebase.auth().onAuthStateChanged( (user) => {
   
      if (user) {      
        if (!user.emailVerified) {
          //set the need email verified status to true
          // alert(this.state.needEmailVerification);
          this.setState({
            needEmailVerification: true,
          })
          
        }
        
        // //Log in Now
        else{
          alert("Logged In");
          this.setState({
            needEmailVerification: false
          })

        }

      }
    });

  }

  handleEmailVerifiedStatus(){
    this.setState(state => ( {
      needEmailVerification : !state.needEmailVerification
    }));
  }

  handleSendEmailVerication(){
    alert("TEMP EMAIL VERIFICATION");
    // firebase.auth().currentUser.sendEmailVerification();
  }

  handleCurrentUser(user){
    this.setState({
      currentUser: user
    });
  }

  
  handleLoginRegisterToggle() {
    this.setState(state => ({
      isLoginMode: !state.isLoginMode
    }));
  }

  handleLoginEmail(e){
    this.setState({
      loginEmail: e.target.value
    });
  }

  handleLoginPassword(e){
    this.setState({
      loginPassword: e.target.value
    });
  }

  handleRegisterEmail(e){
    this.setState({
      registerEmail: e.target.value
    });
  }

  handleRegisterPassword(e){
    this.setState({
      registerPassword: e.target.value
    });
  }


  handleLoginSubmit(e){
    e.preventDefault();
    // console.log(this.state.loginEmail);
    if (!Isemail.validate(this.state.loginEmail)) return alert("This is not a valid email!");
    

    console.log("Submitted");
    // const user = {
    //   email : this.state.loginEmail,
    //   password : this.state.loginPassword
    // }
  }

  handleRegisterSubmit(e){
    console.log("Register");
    e.preventDefault();

    if (!Isemail.validate(this.state.registerEmail)) {
      alert("This is not a valid email!")
  }
   
    else if (this.state.registerPassword.length < 6){
      alert("Password is too short!");
    }
    else {
      console.log("Submitted");
      alert("Please go to your email and verify your account");

      firebase.auth().createUserWithEmailAndPassword(this.state.registerEmail, this.state.registerPassword)
    
      .then(
        (userData)=> {
          //FIXME WHY DOESN'T (user) => {} work anymore?
          // userData.user.sendEmailVerification();
          firebase.auth().currentUser.sendEmailVerification();
          
        }
        )
          .then(window.location.replace('/'))
      .catch( (error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode === 'auth/weak-password') {
          alert('The password is too weak.');
        } else {
          alert(errorMessage);
        }
        console.log(error);
        // [END_EXCLUDE]
      });
      // axios.post('http://localhost:3000/add', newUser)
      // .then(res => console.log(res.data));
    }
  }


    render() {
      // alert(this.state.needEmailVerification);

      let LoginRegister;
      if (this.state.isLoginMode){
        
        if (this.state.needEmailVerification) {
          // LoginRegister = <div>TEST </div>
          LoginRegister = <VerifyPage current_user={this.state.currentUser} onLoginRegisterToggle={this.handleLoginRegisterToggle} onSendEmailVerification={this.handleSendEmailVerication}/>
        }
        else if (!this.state.needEmailVerification) {
          LoginRegister = 
        <WelcomeLoginComponent onLoginRegisterToggle={this.handleLoginRegisterToggle} onLoginEmailChange={this.handleLoginEmail} onLoginPasswordChange={this.handleLoginPassword} onLoginSubmit={this.handleLoginSubmit}/>
          
        }
        //forgot password screen
        else{
          LoginRegister = (
            <div>
              FORGOT PASSWORD SCREEN
              </div>
          )

        }
    }
      else{
        LoginRegister = (
        <WelcomeRegisterComponent onLoginRegisterToggle={this.handleLoginRegisterToggle} onRegisterEmailChange={this.handleRegisterEmail} onRegisterPasswordChange={this.handleRegisterPassword} onRegisterSubmit={this.handleRegisterSubmit}/>
        )
      }
      
  


      return (
        
        <div className="master-container">
         
          <main>
              <Navbar />
        
          <section className="overview-login-register-container">
            
            <div className="overview-description-container">
            
            <p>Welcome to interestHub! Login or sign up to get started!</p>
            </div>
            {LoginRegister}
            {/* <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/> */}


            </section>
        
          

          </main>
          
          
        </div>

        
      )
    }
  }

