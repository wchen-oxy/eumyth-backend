import React from 'react';
import WelcomeLoginComponent from './sub-components/login';
import WelcomeRegisterComponent from './sub-components/register';
import VerifyPage from './sub-components/verify';
import './index.scss';
import Isemail from 'isemail';


const INITIAL_STATE = {
  currentUser: '',
  email: '',
  password: '',
  test: '',
  error: null,
}

export default class WelcomePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loggedIn: false,
      verified: false,
      isLoginMode: true,
      showRegisterSuccess: false,
      ...INITIAL_STATE
    }

    this.handleLoginRegisterToggle = this.handleLoginRegisterToggle.bind(this);
    this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
    this.handleRegisterSubmit = this.handleRegisterSubmit.bind(this);
    this.handleSendEmailVerication = this.handleSendEmailVerication.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
    this.handleRegisterSuccess = this.handleRegisterSuccess.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  }
  handleRegisterSuccess(e) {
    e.preventDefault();
    this.setState(state => ({
      showRegisterSuccess: !state.showRegisterSuccess
    }));
  }

  handleSignOut(e) {
    e.preventDefault();
    console.log("signout");
    this.props.firebase.doSignOut().then(this.setState({
      ...INITIAL_STATE
    }));
  }


  handleSendEmailVerication(e) {
    e.preventDefault();
    this.props.firebase.doSendEmailVerification();
  }

  handleCurrentUser(user, e) {
    e.preventDefault();
    this.setState({
      currentUser: user
    });
  }


  handleLoginRegisterToggle(e) {
    e.preventDefault();
    console.log(this.state.email);
    this.setState(state => ({
      isLoginMode: !state.isLoginMode
    })
    );
  }

  handleLoginSubmit(e) {
    e.preventDefault();
    console.log("Submitted");
    if (!Isemail.validate(this.state.email)) return alert("This is not a valid email!");
    this.props.firebase.doSignIn(this.state.email, this.state.password).then(
      this.props.history.push("/"));

  }

  handleRegisterSubmit(e) {
    e.preventDefault();
    if (!Isemail.validate(this.state.email)) {
      alert("This is not a valid email!")
    }
    else if (this.state.password.length < 6) {
      alert("Password is too short!");
    }
    else {
      console.log("Submitted");
      this.props.firebase.doCreateUser(this.state.email, this.state.password)
        .then(
          this.setState({ showRegisterSuccess: true })
        );
    }
  }


  render() {
    let LoginRegisterHome;
    if (this.state.showRegisterSuccess) {
      LoginRegisterHome = (
        <div>
          Successfully Registered new account! Please check your email for a verification link.
          <button onClick={this.handleRegisterSuccess}>Return</button>
        </div>
      )
    }
    else if (this.state.isLoginMode) {
      if (this.props.firebase.auth.currentUser && !this.state.verified) {
        LoginRegisterHome = (
          <VerifyPage
            current_user={this.state.currentUser}
            onLoginRegisterToggle={this.handleLoginRegisterToggle}
            onSendEmailVerification={this.handleSendEmailVerication}
            onSignOut={this.handleSignOut}
          />
        )
      }
      else {
        LoginRegisterHome =
          <WelcomeLoginComponent
            onLoginRegisterToggle={this.handleLoginRegisterToggle}
            onLoginEmailChange={this.handleChange}
            onLoginPasswordChange={this.handleChange}
            onLoginSubmit={this.handleLoginSubmit}
          />

      }
    }
    else {
      LoginRegisterHome = (
        <WelcomeRegisterComponent
          onLoginRegisterToggle={this.handleLoginRegisterToggle}
          onRegisterEmailChange={this.handleChange}
          onRegisterPasswordChange={this.handleChange}
          onRegisterSubmit={this.handleRegisterSubmit}
        />
      )
    }

    return (
      <div className="master-container">
        <main>

          <section className="overview-login-register-container">
            <div className="overview-description-container">
              <p>Welcome to interestHub! Login or sign up to get started!</p>
            </div>

            {LoginRegisterHome}

          </section>
        </main>
      </div>


    )
  }
}

