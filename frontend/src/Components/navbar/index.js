import React from 'react';
import PostDraftController from '../post/draft/index';
import RelationModal from "./sub-components/relation-modal";
import { AuthUserContext } from '../../Components/session/'
import { withFirebase } from '../../Firebase';
import { Link } from 'react-router-dom';
import { POST, REQUEST_ACTION } from "../constants/flags"
import './index.scss';

const NavBar = () => (
  <AuthUserContext.Consumer>
    {authUser =>
      authUser && authUser.emailVerified ? <NavigationAuthBase /> : <NavigationNonAuth />
    }
  </AuthUserContext.Consumer>
);

const NavigationNonAuth = () => (
  <nav>
    <div>
      <Link to={"/"} className="navbar-navigation-link">interestHub</Link>
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
    this.renderModal = this.renderModal.bind(this);
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
    else if (postType === REQUEST_ACTION) {
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

  renderModal() {
    let modal = null;
    if (this.state.isPostModalShowing) {
      modal = (
        <PostDraftController
          username={this.state.username}
          closeModal={this.closeModal}
        />
      );
    }
    else if (this.state.isRequestModalShowing) {
      modal = (
        <RelationModal
          username={this.state.username}
          closeModal={this.closeModal} />
      )
    }
    return (
      <div className="modal" ref={this.modalRef}>
        <div className="overlay"></div>
        {modal}
      </div>
    );
  }

  render() {
    return (
      <>
        <nav>
          <div id="navbar-left-container">
            <Link
              to={"/"}
              className="navbar-navigation-link">
              <div id="navbar-logo-container">
                <h3>Everfire</h3>
              </div>
            </Link>
            {
              this.state.existingUserLoading ?
                (<></>) :
                (
                  <div>
                    <button onClick={() => this.openModal(POST)}><h4>New Entry</h4></button>
                    <button onClick={() => this.openModal(REQUEST_ACTION)}><h4>Friends</h4></button>
                  </div>
                )
            }
          </div>
          <div id="navbar-right-container">
            <Link to={"/account"}><h4>Settings</h4></Link>
            <button onClick={this.props.firebase.doSignOut} ><h4>Sign Out</h4></button>
          </div>
        </nav>
        {this.state.existingUserLoading ? <></> : this.renderModal()}
      </>
    );
  }
}

const NavigationAuthBase = withFirebase(NavigationAuth);

export default NavBar;