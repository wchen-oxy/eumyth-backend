import React from 'react';
import Isemail from 'isemail';
import WelcomeLoginComponent from './sub-components/login';
import WelcomeRegisterComponent from './sub-components/register';
import VerifyPage from './sub-components/verify';
import './index.scss';



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
      verified: null,
      isLoginMode: true,
      showRegisterSuccess: false,
      ...INITIAL_STATE
    }

    this.toggleLoginRegisterWindow = this.toggleLoginRegisterWindow.bind(this);
    this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
    this.handleRegisterSubmit = this.handleRegisterSubmit.bind(this);
    this.handleSendEmailVerication = this.handleSendEmailVerication.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
    this.handleRegisterSuccess = this.handleRegisterSuccess.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleVerifiedState = this.handleVerifiedState.bind(this);
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

  handleVerifiedState(isVerified){
    this.setState({
      verified : isVerified
    })
  }


  toggleLoginRegisterWindow(e) {
    e.preventDefault();
    this.setState(state => ({
      isLoginMode: !state.isLoginMode
    })
    );
  }

  handleLoginSubmit(e) {
    e.preventDefault();
    if (!Isemail.validate(this.state.email)) return alert("This is not a valid email!");
    this.props.firebase.doSignIn(this.state.email, this.state.password).then(
      (result) => {
        if (result) {
          console.log(result.user.emailVerified);
          if (result.user.emailVerified) this.props.history.push("/");
          else{
            this.handleVerifiedState(result.user.emailVerified);
          }
          
        }
      });
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
      return (
        <main>
          <section className="overview-login-register-container">
            <div className="overview-description-container">
              <p>Welcome to interestHub! Login or sign up to get started!</p>
            </div>
            <div>
              Please check your email for a verification link.
              <span>Didn't see the link?  <button onClick={this.props.firebase.doSendEmailVerification}>Resend!</button></span>
              <button onClick={this.handleRegisterSuccess}>Return</button>
            </div>
          </section>
        </main>
      );
    }
    if (this.state.isLoginMode) {
      LoginRegisterHome = (this.props.firebase.auth.currentUser && !this.state.verified) ?
        <VerifyPage
          current_user={this.state.currentUser}
          onToggleLoginRegisterWindow={this.toggleLoginRegisterWindow}
          onSendEmailVerification={this.handleSendEmailVerication}
          onSignOut={this.handleSignOut}
        />
        :
        <WelcomeLoginComponent
          onToggleLoginRegisterWindow={this.toggleLoginRegisterWindow}
          onLoginEmailChange={this.handleChange}
          onLoginPasswordChange={this.handleChange}
          onLoginSubmit={this.handleLoginSubmit}
        />;
    }
    else {
      LoginRegisterHome = (
        <WelcomeRegisterComponent
          onToggleLoginRegisterWindow={this.toggleLoginRegisterWindow}
          onRegisterEmailChange={this.handleChange}
          onRegisterPasswordChange={this.handleChange}
          onRegisterSubmit={this.handleRegisterSubmit}
        />
      )
    }

    return (
      <main>
        <section className="overview-login-register-container">
          <div className="overview-description-container">
            <p>Welcome to interestHub! Login or sign up to get started!</p>
          </div>
          {LoginRegisterHome}
        </section>
      </main>
    )
  }
}

