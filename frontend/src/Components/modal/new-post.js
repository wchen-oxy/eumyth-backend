import React, { useState } from 'react';
import './new-post.scss';
import Axios from "../../Axios/axios";
import ShortPost from "../modal/short-post";
import LongPost from "../modal/long-post";
import ReviewPost from "../modal/review-post";
import { withFirebase } from "../../Firebase";



class NewPost extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
     
      username: this.props.firebase.returnUsername(),
      previousLongDraft: null,
      window: "main",
      currentPostType: 'main',
      imageArray: [],
    };

    this.handleDisablePost = this.handleDisablePost.bind(this);
    // this.handleChange = this.handleChange.bind(this);
    this.handleSubmitPost = this.handleSubmitPost.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.setImageArray = this.setImageArray.bind(this);

  }
  componentDidMount() {
    this._isMounted = true;
    if (this._isMounted && this.state.username) {
      Axios.retrieveDraft(this.state.username).then((previousDraft) => {
        this.setState({ previousLongDraft: previousDraft.data });
      })
        .catch(error => {
          console.log(
            "Error: " + error
          );

        })
    };
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  handleClick(e, value, disableBoolean) {
    e.preventDefault();
    if (value === 'short' || value === 'long') this.setState({currentPostType : value});
    this.setState({ window: value, postDisabled: disableBoolean });
  }

 
  handleSubmitPost(e) {
    alert("PRESSED SUBMIT");
  }
  handleDisablePost(disabled) {
    this.setState({ postDisabled: disabled });
  }

  setImageArray(imageArray){
    this.setState({ imageArray: imageArray });
    }

  render() {
    let window = '';
    switch (this.state.window) {
      case ("main"):
        window = (
          <div className="new-post-container" id="new-post-container">
        <h3>Document Your Progress</h3>
        <div className="vertical-grouping">
          <h4>
            Begin a New Check-In!
          </h4>
          <div className="single-button-container">
            <button value="short" onClick={(e) => this.handleClick(e, e.target.value, true)}>
              New Short
            </button>
          </div>
        </div>

        <div className="vertical-grouping">
          <h4>
            Begin a New Post! (Will Delete Saved data)
          </h4>
          <div className="single-button-container">
            <button value="long" onClick={e => this.handleClick(e, e.target.value, true)}>
              New Entry
            </button>
          </div>
          <div className="single-button-container">
            <button value="long" onClick={e => this.handleClick(e, e.target.value, false)}>
              Continue Previous Draft?
            </button>
          </div>
        </div>
      </div>
        );
        break;
      case ("short"):
        window = (
          <>
        <ShortPost
          username={this.state.username}
          disablePost={this.handleDisablePost}
          setImageArray={this.setImageArray}
          // handleChange={this.handleChange}
          handleClick={this.handleClick}
        />
        </>
        );
        break;
      case ("long"):
        window = <LongPost
          content={this.state.previousLongDraft}
          handleClick={this.handleClick}
          disablePost={this.handleDisablePost}
        />;
        break;
      case ("review"):
        window = <ReviewPost
          content={this.state.previousLongDraft}
          disablePost={this.handleDisablePost}
          handleClick={this.handleClick}
          currentPostType={this.state.currentPostType}
        />
        break;
      default:
        throw Error("No window options matched :(");
    }

    // console.log(window)
    return (
      <>
      {window}
      </>
    );
  }
}

export default withFirebase(NewPost);