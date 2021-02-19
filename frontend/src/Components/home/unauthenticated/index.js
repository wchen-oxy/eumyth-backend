import React from 'react';
import Isemail from 'isemail';
import WelcomeLoginForm from './sub-components/login';
import WelcomeRegisterForm from './sub-components/register';
import VerifyForm from './sub-components/verify';
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

    this.handleLongRegisterToggle = this.handleLongRegisterToggle.bind(this);
    this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
    this.handleRegisterSubmit = this.handleRegisterSubmit.bind(this);
    this.handleSendEmailVerication = this.handleSendEmailVerication.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
    this.handleRegisterSuccess = this.handleRegisterSuccess.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleVerifiedState = this.handleVerifiedState.bind(this);
    this.renderLoginRegister = this.renderLoginRegister.bind(this);
  }

  handleTextChange(e) {
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

  handleVerifiedState(isVerified) {
    this.setState({
      verified: isVerified
    })
  }

  handleLongRegisterToggle(e) {
    e.preventDefault();
    this.setState(state => ({
      isLoginMode: !state.isLoginMode
    })
    );
  }

  handleLoginSubmit(e) {
    e.preventDefault();
    if (!Isemail.validate(this.state.email)) {
      return alert("This is not a valid email!");
    }
    this.props.firebase.doSignIn(this.state.email, this.state.password).then(
      (result) => {
        if (result) {
          console.log(result.user.emailVerified);
          if (result.user.emailVerified) this.props.history.push("/");
          else {
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
      this.props.firebase.doCreateUser(this.state.email, this.state.password)
        .then(
          this.setState({ showRegisterSuccess: true })
        );
    }
  }

  renderLoginRegister(isLogin) {
    if (isLogin) {
      return (this.props.firebase.auth.currentUser && !this.state.verified ?
        <VerifyForm
          current_user={this.state.currentUser}
          onToggleLoginRegisterWindow={this.handleLongRegisterToggle}
          onSendEmailVerification={this.handleSendEmailVerication}
          onSignOut={this.handleSignOut}
        />
        :
        <WelcomeLoginForm
          onToggleLoginRegisterWindow={this.handleLongRegisterToggle}
          onLoginEmailChange={this.handleTextChange}
          onLoginPasswordChange={this.handleTextChange}
          onLoginSubmit={this.handleLoginSubmit}
        />);
    }
    else
      return (
        <WelcomeRegisterForm
          onToggleLoginRegisterWindow={this.handleLongRegisterToggle}
          onRegisterEmailChange={this.handleTextChange}
          onRegisterPasswordChange={this.handleTextChange}
          onRegisterSubmit={this.handleRegisterSubmit}
        />
      )
  }

  render() {
    if (this.state.showRegisterSuccess) {
      return (
        <section className="welcome-login-register-section">
          <div className="welcome-hero-hero-container">
            <p>Welcome to interestHub! Login or sign up to get started!</p>
          </div>
          <div>
            Please check your email for a verification link.
              <span>Didn't see the link?
                <button onClick={this.props.firebase.doSendEmailVerification}>
                Resend!
                </button>
            </span>
            <button onClick={this.handleRegisterSuccess}>Return</button>
          </div>
        </section>
      );
    }
    return (

      <section className="welcome-login-register-section">
        <div className="welcome-hero-hero-container">
          <p>Welcome to interestHub! Login or sign up to get started!</p>
        </div>
        {this.renderLoginRegister(this.state.isLoginMode)}
      </section>

    )
  }
}

