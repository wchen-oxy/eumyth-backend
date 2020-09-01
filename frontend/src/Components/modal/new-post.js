import React from 'react';
import './new-post.scss';
import AxiosHelper from "../../Axios/axios";
import ShortPost from "../modal/short-post";
import LongPost from "../modal/long-post";
import { withFirebase } from "../../Firebase";



class NewPost extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      username: this.props.username,
      previousLongDraft: null,
      windowType: "main",
      currentPostType: 'main',
      pursuits: null,
      indexUserData: null,
    };

    this.handleDisablePost = this.handleDisablePost.bind(this);
    this.handleSubmitPost = this.handleSubmitPost.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.saveDraft = this.saveDraft.bind(this);
    this.retrieveDraft = this.retrieveDraft.bind(this);
    this.setIndexUserData = this.setIndexUserData.bind(this);
    this.onPreferredPostTypeChange = this.onPreferredPostTypeChange.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    if (this._isMounted && this.state.username) {
      this.retrieveDraft();
      this.setIndexUserData();
    };
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  onPreferredPostTypeChange(type) {
    this.setState({ preferredPostType: type });
  }

  setIndexUserData() {
    AxiosHelper.returnIndexUser(this.state.username)
      .then(
        (result) => {
          let pursuitArray = [];
          for (const pursuit of result.data.pursuits) {
            pursuitArray.push(pursuit.name);
          }
        
          this.setState({
            pursuitArray: pursuitArray,
            indexUserData: result.data
          });
        });
  }

  retrieveDraft() {
    AxiosHelper.retrieveDraft(this.state.username).then(
      (previousDraft) => {
        console.log(previousDraft.data);
        this.saveDraft(previousDraft.data);
      })
      .catch(error => {
        console.log(
           error
        );

      })
  }

  saveDraft(draft) {
    this.setState({ previousLongDraft: draft });
  }

  handleClick(e, value, updateLocalLongPost) {
    e.preventDefault();
    if (updateLocalLongPost) this.retrieveDraft();
    this.setState({ windowType: value });
  }

  handleSubmitPost(e) {
    alert("PRESSED SUBMIT");
  }
  handleDisablePost(disabled) {
    this.setState({ postDisabled: disabled });
  }

  render() {
    let windowType = '';
    switch (this.state.windowType) {
      case ("main"):
        windowType = (
          <div className="new-post-container" id="new-post-container">
            <h3>Document Your Progress</h3>
            <div className="vertical-grouping">
              <h4>
                Begin a New Check-In!
          </h4>
              <div className="single-button-container">
                <button value="short" onClick={(e) => this.handleClick(e, e.target.value)}>
                  New Short
            </button>
              </div>
            </div>

            <div className="vertical-grouping">
              <h4>
                Begin a New Post! (Will Delete Saved data)
          </h4>
              <div className="single-button-container">
                <button value="newLong" onClick={e => {
                  !!this.state.previousLongDraft ?
                    window.confirm("Starting a new Long Post will erase your saved draft. Continue anyway?") &&
                    this.handleClick(e, e.target.value) : this.handleClick(e, e.target.value);
                }}>
                  New Entry
            </button>
              </div>
              <div className="single-button-container">
                <button value="oldLong" onClick={e => this.handleClick(e, e.target.value)}>
                  Continue Previous Draft?
            </button>
              </div>
            </div>
          </div>
        );
        break;
      case ("short"):
        windowType = (
          <>
            <ShortPost
              username={this.state.indexUserData.username}
              disablePost={this.handleDisablePost}
              setImageArray={this.setImageArray}
              handleClick={this.handleClick}
              preferredPostType={this.state.indexUserData.preferredPostType}
              handlePreferredPostTypeChange={this.onPreferredPostTypeChange}

            />
          </>
        );
        break;
      case ("newLong"):
        windowType =
          (<LongPost
            handleClick={this.handleClick}
            disablePost={this.handleDisablePost}
            username={this.state.indexUserData.username}
            pursuits={this.state.pursuits}
            preferredPostType={this.state.indexUserData.preferredPostType}
            handlePreferredPostTypeChange={this.onPreferredPostTypeChange}
            previewTitle=""

          />);
        break;
      case ("oldLong"):
        const previewTitle = this.state.indexUserData.draft ? this.state.indexUserData.draft.previewTitle : "";
        windowType = (<LongPost
          content={this.state.previousLongDraft}
          handleClick={this.handleClick}
          disablePost={this.handleDisablePost}
          username={this.state.indexUserData.username}
          preferredPostType={this.state.indexUserData.preferredPostType}
          handlePreferredPostTypeChange={this.onPreferredPostTypeChange}
          previewTitle={previewTitle}
        />);
        break;
      // case ("review"):
      //   windowType = <ReviewPost
      //     content={this.state.previousLongDraft}
      //     disablePost={this.handleDisablePost}
      //     handleClick={this.handleClick}
      //     currentPostType={this.state.currentPostType}
      //   />
      //   break;
      default:
        throw Error("No windowType options matched :(");
    }

    return (
      <>
        {windowType}
      </>
    );
  }
}

export default withFirebase(NewPost);