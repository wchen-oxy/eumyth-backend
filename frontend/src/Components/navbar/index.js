import React from 'react';
import PostDraftController from '../post/draft/index';
import RelationModal from "./sub-components/relation-modal";
import OptionsMenu from "./sub-components/options-menu";
import { AuthUserContext } from '../../Components/session/'
import { withFirebase } from '../../Firebase';
import { Link } from 'react-router-dom';
import { POST, REQUEST_ACTION } from "../constants/flags";
import { returnUserImageURL, TEMP_PROFILE_PHOTO_URL } from "../constants/urls";
import AxiosHelper from '../../Axios/axios';
import './index.scss';

const NavBar = () => (
  <AuthUserContext.Consumer>
    {authUser =>
      authUser &&
        authUser.emailVerified ? <NavigationAuthBase /> : <NavigationNonAuth />
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
      tinyDisplayPhoto: null,
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
    let isUserStillLoading = true;
    this.props.firebase.checkIsExistingUser().then(
      (result) => {
        if (result) {
          isUserStillLoading = false;
        }
        return AxiosHelper.returnTinyDisplayPhoto(this.state.username);
      }
    )
      .then((result) => {
        this.setState({
          existingUserLoading: isUserStillLoading,
          tinyDisplayPhoto: result.data ? returnUserImageURL(result.data) : TEMP_PROFILE_PHOTO_URL
        });
      })
      ;
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
        <>
          <div className="overlay" onClick={(() => this.closeModal())}></div>
          <PostDraftController
            username={this.state.username}
            closeModal={this.closeModal}
          />
        </>
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
            <button onClick={() => this.openModal(POST)}>
              <h4>New Entry</h4>
            </button>
          </div>
          <div id="navbar-right-container">
            {
              this.state.existingUserLoading ?
                (<></>) :
                (
                  <>
                    <div id="navbar-profile-home">
                      <div id="navbar-display-photo-container">
                        <img src={this.state.tinyDisplayPhoto} />
                      </div>
                      <p>{this.state.username}</p>
                    </div>
                    <div id="navbar-main-action-buttons-container">

                      <button onClick={() => this.openModal(REQUEST_ACTION)}>
                        <h4>Friends</h4>
                      </button>
                    </div>
                  </>
                )
            }
            <OptionsMenu />
          </div>
        </nav>
        {this.state.existingUserLoading ? <></> : this.renderModal()}
      </>
    );
  }
}

const NavigationAuthBase = withFirebase(NavigationAuth);

export default NavBar;