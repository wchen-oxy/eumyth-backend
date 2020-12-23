import React from 'react';
import PostController from '../post/index';
import RelationModal from "./sub-components/relation-modal";
import { AuthUserContext } from '../../Components/session/'
import { withFirebase } from '../../Firebase';
import { Link } from 'react-router-dom';
import './index.scss';

const POST = "POST";
const REQUEST = "REQUEST";

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
      isPostModalShowing: false,
      isRequestModalShowing: false,
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

  openModal(postType) {
    this.modalRef.current.style.display = "block";
    document.body.style.overflow = "hidden";
    if (postType === POST) {
      this.setState({ isPostModalShowing: true });

    }
    else if (postType === REQUEST) {
      this.setState({ isRequestModalShowing: true });
    }
  }

  closeModal(postType) {
    this.modalRef.current.style.display = "none";
    document.body.style.overflow = "visible";
    if (postType) this.setState({ isRequestModalShowing: false });
    else {
      this.setState({ isPostModalShowing: false });
    }
  }

  render() {
    return (
      <>
        <nav>
          <div>
            <Link to={"/"} id="hero-logo-link">interestHub</Link>
            {this.state.existingUserLoading ?
              (<></>) :
              (<button onClick={() => this.openModal(POST)}>New Entry</button>)}
          </div>
          <div className="no-select">
            <button onClick={() => this.openModal(REQUEST)}>Requests</button>
          </div>
          <div className="no-select">
            <Link to={"/account"} >Settings</Link>
            <button onClick={this.props.firebase.doSignOut} >SignOut</button>
          </div>
        </nav>
        {this.state.existingUserLoading ?
          (<></>) :
          (
            <div className="modal" ref={this.modalRef}>
              <div className="overlay"></div>
              {
                this.state.isPostModalShowing ?
                  <PostController
                    username={this.state.username}
                    closeModal={this.closeModal}
                  />
                  :
                  <></>
              }
              {
                this.state.isRequestModalShowing ?
                  <>
                    <RelationModal username={this.state.username} closeModal={this.closeModal} />
                  </> : <></>
              }
            </div>
          )
        }
      </>
    );
  }
}

const NavigationAuthBase = withFirebase(NavigationAuth);

export default Navigation;