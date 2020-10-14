import React from 'react';
import PostController from '../post/index';
import { AuthUserContext } from '../../Components/session/'
import { withFirebase } from '../../Firebase';
import { Link } from 'react-router-dom';
import './index.scss';

const Navigation = () => (

  <AuthUserContext.Consumer>
    {authUser =>
      authUser && authUser.emailVerified ? <NavigationAuthBase /> : <NavigationNonAuth />
    }
  </AuthUserContext.Consumer>

);

const NavigationNonAuth = () => (
  <nav className="welcome-navbar-container">
    <div className="navbar-item-group">
      <Link to={"/"} className="navbar-item">interestHub</Link>
    </div>
  </nav>
);

class NavigationAuth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: this.props.firebase.returnUsername(),
      previousLongDraft: null,
      isInitialUser: true,
      existingUserLoading: true,
    };
    this.modalRef = React.createRef();
    this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);

  }
  componentDidMount() {
    this.props.firebase.checkIsExistingUser().then(
      (result) => {
        if (result) {
          this.setState({ existingUserLoading: false })
        }
      }
    );
  }

  openModal() {
    this.modalRef.current.style.display = "block";
    document.body.style.overflow = "hidden";
  }

  closeModal() {
    this.modalRef.current.style.display = "none";
    document.body.style.overflow = "visible";
  }


  render() {
    return (
      <>
        <nav className="welcome-navbar-container">
          <div className="navbar-item-group">
            <Link to={"/"} id="hero-logo-link" className="navbar-item">interestHub</Link>
            {this.state.existingUserLoading ?
              (<></>) :
              (<button className="navbar-item" onClick={this.openModal}>New Entry</button>)   }
            </div>
       
          <div className="navbar-item-group no-select">
            <Link to={"/account"} className="navbar-item" id="settins-link">Settings</Link>
            <button onClick={this.props.firebase.doSignOut} className="navbar-item">SignOut</button>
          </div>
        </nav>
        {this.state.existingUserLoading ?
          (<></>) :
          (<div className="modal" ref={this.modalRef}>
            <div className="overlay"></div>
           
            <PostController username={this.state.username} closeModal={this.closeModal} />
          </div>)
       }
      </>
    );
  }
}

const NavigationAuthBase = withFirebase(NavigationAuth);

export default Navigation;