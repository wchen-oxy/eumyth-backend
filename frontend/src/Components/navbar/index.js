import React from "react";
import "./index.scss";
import { AuthUserContext } from "../../Components/session/"
import { withFirebase } from "../../Firebase";
import { Link } from "react-router-dom";
import NewPost from "../modal/new-post";
import ShortPost from "../modal/short-post";
import LongPost from "../modal/long-post";
import ReviewPost from "../modal/review-post";
import Axios from "../../Axios/axios";

// import NewPost from "../modal/new-post";

const Navigation = () => (

  <AuthUserContext.Consumer>
    {authUser =>
      authUser && authUser.emailVerified ? <NavigationAuthBase /> : <NavigationNonAuth />
    }
  </AuthUserContext.Consumer>

);

const NavigationNonAuth = () => (
  <div className="welcome-navbar-container">
    <div className="navbar-item-group">
      <Link to={"/"} className="navbar-item">interestHub</Link>
    </div>
  </div>
);

class NavigationAuth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
     
      username: this.props.firebase.returnUsername(),
      previousLongDraft: null,
      window: "main",
      currentPostType: 'main'
    };

    this.modalRef = React.createRef();
    this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);
    // this.handleDisablePost = this.handleDisablePost.bind(this);
    // this.handleChange = this.handleChange.bind(this);
    // this.handleSubmitPost = this.handleSubmitPost.bind(this);
    // this.handleClick = this.handleClick.bind(this);


  }
  // componentDidMount() {
  //   this._isMounted = true;
  //   if (this._isMounted && this.state.username) {
  //     Axios.retrieveDraft(this.state.username).then((previousDraft) => {
  //       this.setState({ previousLongDraft: previousDraft.data });
  //     })
  //       .catch(error => {
  //         console.log(
  //           "Error: " + error
  //         );

  //       })
  //   };
  // }
  // componentWillUnmount() {
  //   this._isMounted = false;
  // }

  openModal() {
    this.modalRef.current.style.display = "block";
  }

  closeModal() {
    this.modalRef.current.style.display = "none";
    this.setState({ window: 'main' });
  }



  // handleClick(e, value, disableBoolean) {
  //   e.preventDefault();
  //   if (value === 'short' || value === 'long') this.setState({currentPostType : value});
  //   this.setState({ window: value, postDisabled: disableBoolean });
  // }

 
  // handleSubmitPost(e) {
  //   alert("PRESSED SUBMIT");
  // }
  // handleDisablePost(disabled) {
  //   this.setState({ postDisabled: disabled });
  // }
  render() {
    // let window = '';
    // switch (this.state.window) {
    //   case ("main"):
    //     window = (<NewPost setWindow={this.handleClick} />);
    //     break;
    //   case ("short"):
    //     window = (<ShortPost
    //       username={this.state.username}
    //       disablePost={this.handleDisablePost}
    //       setImageArray={this.setImageArray}
    //       // handleChange={this.handleChange}
    //       handleClick={this.handleClick}
    //     />);
    //     break;
    //   case ("long"):
    //     window = <LongPost
    //       content={this.state.previousLongDraft}
    //       disablePost={this.handleDisablePost}
    //     />;
    //     break;
      // case ("review"):
      //   window = <ReviewPost
      //     content={this.state.previousLongDraft}
      //     disablePost={this.handleDisablePost}
      //     handleClick={this.handleClick}
      //     currentPostType={this.state.currentPostType}
      //   />
        // break;
      // default:
      //   throw Error("No window options matched :(");
    // }
    return (
      <>
        <nav className="welcome-navbar-container">
          <div className="navbar-item-group">
            <Link to={"/"} className="navbar-item">interestHub</Link>
            <Link to={"/new"} className="navbar-item">New Entry</Link>
            <button onClick={this.openModal}>New Entry</button>
          </div>
          <div className="navbar-item-group no-select">
            <Link to={"/account"} className="navbar-item" id="settins-link">Settings</Link>
            <button onClick={this.props.firebase.doSignOut} className="navbar-item">SignOut</button>
          </div>
        </nav>
        <div className="modal" ref={this.modalRef}>
          <div className="overlay"></div>
          <span className="close" onClick={(() => this.closeModal())}>X</span>
          <NewPost />
        </div>
      </>
    );
  }
}

const NavigationAuthBase = withFirebase(NavigationAuth);

export default Navigation;