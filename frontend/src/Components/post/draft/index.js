import React from 'react';
import NewPost from './new-post';
import ShortPost from './short-post';
import LongPost from './long-post';
import AxiosHelper from '../../../Axios/axios';
import { withFirebase } from '../../../Firebase';
import { NONE, SHORT, LONG, NEW_LONG, OLD_LONG } from "../../constants/flags";
import "./index.scss";

class PostDraftController extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      onlineDraftRetrieved: false,
      onlineDraft: null,
      displayPhoto: null,
      updatingOnlineDraft: false,
      postType: NONE,
      pursuits: null,
      indexUserData: null,
      errorRetrievingDraft: false,
      errorSaving: false,
    };

    this.handleDisablePost = this.handleDisablePost.bind(this);
    this.handleSubmitPost = this.handleSubmitPost.bind(this);
    this.handleLocalSync = this.handleLocalSync.bind(this);
    this.handleLocalOnlineSync = this.handleLocalOnlineSync.bind(this);
    this.handlePostTypeSet = this.handlePostTypeSet.bind(this);
    this.handleDraftRetrieval = this.handleDraftRetrieval.bind(this);
    this.handleIndexUserDataSet = this.handleIndexUserDataSet.bind(this);
    this.onPreferredPostTypeChange = this.onPreferredPostTypeChange.bind(this);
    this.renderWindow = this.renderWindow.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    if (this._isMounted && this.props.username) {
      this.handleIndexUserDataSet();
      this.handleDraftRetrieval(true);
    }
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  onPreferredPostTypeChange(type) {
    this.setState({ preferredPostType: type });
  }

  handleInitialPageLaunch(e, postType, clearLongDraft) {
    e.preventDefault();
    if (clearLongDraft) {
      this.setState({ onlineDraft: null });
    }
    this.setState({ postType: postType })
  }

  handleLocalSync(draft) {
    this.setState({ onlineDraft: draft });
  }

  handleLocalOnlineSync(localDraft) {
    if (localDraft !== this.state.onlineDraft) {
      this.setState({ updatingOnlineDraft: true });
      return AxiosHelper.saveDraft(this.props.username, localDraft).then(
        (result) => {
          if (result.status !== 200) {
            console.log("Error");
            this.setState({ errorSaving: true });
          }
          this.setState({ onlineDraft: localDraft, updatingOnlineDraft: false });
          return true;
        }
      )
        .catch(
          (err) => {
            console.log(err);
            this.setState({ updatingOnlineDraft: false });
          }
        );
    }
  }

  handleIndexUserDataSet() {
    AxiosHelper.returnIndexUser(this.props.username)
      .then(
        (result) => {
          if (result.status === 200) {
            let pursuitArray = [];
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

  handleDraftRetrieval(isInitial) {
    this.setState({ updatingOnlineDraft: true });
    AxiosHelper.retrieveNewPostInfo(this.props.username).then(
      (response) => {
        if (response.status === 200) {
          if (isInitial) this.setState({ onlineDraftRetrieved: true });
          this.setState({
            displayPhoto: response.data.smallDisplayPhoto,
            onlineDraft: JSON.parse(response.data.draft),
            updatingOnlineDraft: false
          });
        }
        else {
          this.setState({
            onlineDraftRetrieved: true,
            updatingOnlineDraft: false,
            errorRetrievingDraft: true
          });
          alert(
            `Something went wrong retrieving your long post draft. 
            Please do not edit your old draft or you will your saved data. 
            Refresh your page or contact support for more help.`
          )
        }
      })
      .catch(error => {
        console.log(error);
      })
  }

  handleSubmitPost(e) {
    alert("PRESSED SUBMIT");
  }
  handleDisablePost(disabled) {
    this.setState({ postDisabled: disabled });
  }

  handlePostTypeSet(postType, localDraft) {
    switch (postType) {
      case (NONE):
        if (localDraft) {
          this.setState({
            postType: postType,
            onlineDraft: localDraft
          });
        }
        else {
          this.setState({ postType: postType })
        }
        break;
      case (SHORT):
        this.setState({ postType: postType });
        break;
      case (NEW_LONG):
        this.setState({ postType: LONG, onlineDraft: null });
        break;
      case (OLD_LONG):
        this.setState({ postType: LONG });
        break;
      default:
        throw Error("No postType options matched :(");
    }
  }

  renderWindow(postType) {
    switch (postType) {
      case (NONE):
        return (
          <NewPost
            onlineDraft={this.state.onlineDraft}
            onPostTypeSet={this.handlePostTypeSet} />
        );
      case (SHORT):
        return (
          <ShortPost
            displayPhoto={this.state.displayPhoto}
            username={this.props.username}
            closeModal={this.props.closeModal}
            pursuits={this.state.pursuits}
            disablePost={this.handleDisablePost}
            setImageArray={this.setImageArray}
            onPostTypeSet={this.handlePostTypeSet}
            preferredPostType={this.state.indexUserData.preferredPostType}
            handlePreferredPostTypeChange={this.onPreferredPostTypeChange}
          />
        );
      case (LONG):
        return (
          <LongPost
            displayPhoto={this.state.displayPhoto}
            username={this.props.username}
            onlineDraft={this.state.onlineDraft}
            pursuits={this.state.pursuits}
            onlineDraftRetrieved={this.state.onlineDraftRetrieved}
            preferredPostType={this.state.indexUserData.preferredPostType}
            updatingOnlineDraft={this.state.updatingOnlineDraft}
            onLocalDraftChange={this.handleLocalDraftChange}
            onLocalOnlineSync={this.handleLocalOnlineSync}
            onLocalSync={this.handleLocalSync}
            onPostTypeSet={this.handlePostTypeSet}
            disablePost={this.handleDisablePost}
            handlePreferredPostTypeChange={this.onPreferredPostTypeChange}
            closeModal={this.props.closeModal}
          />
        );
      default:
        throw Error("No postType options matched :(");
    }
  }
  render() {
    if (!this.state.indexUserData) return (<>updatingOnlineDraft...</>)
    return (
      <>
        <span className="close" onClick={(() => this.props.closeModal())}>X</span>
        {this.renderWindow(this.state.postType)}
      </>
    );
  }
}

export default withFirebase(PostDraftController);