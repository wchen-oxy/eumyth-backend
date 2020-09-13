import React from 'react';
import NewPost from "./new-post";
import ShortPost from "./short-post";
import LongPost from "./long-post";
import AxiosHelper from "../../Axios/axios";
import { withFirebase } from "../../Firebase";
import "./index.scss";



class PostController extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      username: this.props.username,
      previousLongDraft: null,
      saveInProgress: false,
      windowType: "main",
      currentPostType: 'main',
      pursuits: null,
      indexUserData: null,
      errorSaving : false
    };

    this.handleDisablePost = this.handleDisablePost.bind(this);
    this.handleSubmitPost = this.handleSubmitPost.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleSaveDraft = this.handleSaveDraft.bind(this);
    this.retrieveDraft = this.retrieveDraft.bind(this);
    this.setIndexUserData = this.setIndexUserData.bind(this);
    this.onPreferredPostTypeChange = this.onPreferredPostTypeChange.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    if (this._isMounted && this.state.username) {
      this.setIndexUserData();
      this.setState({ saveInProgress: true },
        this.retrieveDraft());

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
          console.log("ANY FUCKING RESPONSE?");
          if (result.status === 200) {
            let pursuitArray = [];
            console.log(this.state.indexUserData);
            for (const pursuit of result.data.pursuits) {
              pursuitArray.push(pursuit.name);
            }
            this.setState({
              pursuits: pursuitArray,
              indexUserData: result.data
            });
          }
          else {
            throw Error("didnt make it");
          }
        }).catch(
          (result) => { console.log(result) }
        );
  }

  retrieveDraft() {
    AxiosHelper.retrieveDraft(this.state.username).then(
      (previousDraft) => {
        if (previousDraft) {
          this.setState({ longDraft: previousDraft.draft, saveInProgress: false });
        }
      })
      .catch(error => {
        console.log(
          error
        );

      })
  }

  handleSaveDraft(draft) {
    console.log("SAVING");
    this.setState({ longDraft: draft, saveInProgress: true },
      AxiosHelper.saveDraft(this.state.username, draft)      
    ).then((result) => {
      if (result.status !== 200){
        console.log("Error");
        this.setState({errorSaving : true});}
      this.setState({saveInProgress : false})
    }
    ).catch(
      (err) => console.log(err)
    )
  }

  handleClick(e, value) {
    e.preventDefault();
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
          <NewPost longDraft={this.state.longDraft} onClick={this.handleClick} />
        );
        break;
      case ("short"):
        windowType = (
          <ShortPost
            username={this.state.username}
            closeModal={this.props.closeModal}
            pursuits={this.state.pursuits}
            disablePost={this.handleDisablePost}
            setImageArray={this.setImageArray}
            handleClick={this.handleClick}
            preferredPostType={this.state.indexUserData.preferredPostType}
            handlePreferredPostTypeChange={this.onPreferredPostTypeChange}
          />
        );
        break;
      case ("newLong"):
        windowType =
          (<LongPost
            handleClick={this.handleClick}
            closeModal={this.props.closeModal}
            disablePost={this.handleDisablePost}
            username={this.state.username}
            pursuits={this.state.pursuits}
            preferredPostType={this.state.indexUserData.preferredPostType}
            handlePreferredPostTypeChange={this.onPreferredPostTypeChange}
            onSaveDraft={this.handleSaveDraft}
            previewTitle=""

          />);
        break;
      case ("oldLong"):
        const previewTitle = this.state.indexUserData.draft ? this.state.indexUserData.draft.previewTitle : "";
        windowType = (
          <LongPost
            longDraft={this.state.longDraft}
            closeModal={this.props.closeModal}
            pursuits={this.state.pursuits}
            handleClick={this.handleClick}
            disablePost={this.handleDisablePost}
            username={this.state.username}
            preferredPostType={this.state.indexUserData.preferredPostType}
            handlePreferredPostTypeChange={this.onPreferredPostTypeChange}
            onSaveDraft={this.handleSaveDraft}
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

export default withFirebase(PostController);