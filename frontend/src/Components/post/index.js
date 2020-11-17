import React from 'react';
import NewPost from './draft/new-post';
import ShortPost from './draft/short-post';
import LongPost from './draft/long-post';
import AxiosHelper from '../../Axios/axios';
import { withFirebase } from '../../Firebase';


const NONE = "NONE";
const SHORT = "SHORT";
const LONG = "LONG";
const NEW_LONG = "NEW_LONG";
const OLD_LONG = "OLD_LONG";

class PostController extends React.Component {
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
    this.retrieveDraft = this.retrieveDraft.bind(this);
    this.setIndexUserData = this.setIndexUserData.bind(this);
    this.onPreferredPostTypeChange = this.onPreferredPostTypeChange.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    if (this._isMounted && this.props.username) {
      this.setIndexUserData();
      this.retrieveDraft(true);
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

  setIndexUserData() {
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

  retrieveDraft(isInitial) {
    this.setState({ updatingOnlineDraft: true });
    AxiosHelper.retrieveDraft(this.props.username).then(
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
          this.setState({ onlineDraftRetrieved: true, updatingOnlineDraft: false, errorRetrievingDraft: true });
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
          console.log(localDraft);
          this.setState({ postType: postType, onlineDraft: localDraft });
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

  render() {
    let postType = '';
    if (!this.state.indexUserData) return (<>updatingOnlineDraft...</>)
    switch (this.state.postType) {
      case (NONE):
        postType = (
          <NewPost 
          onlineDraft={this.state.onlineDraft} 
          onPostTypeSet={this.handlePostTypeSet} />
        );
        break;
      case (SHORT):
        postType = (
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
        break;
      case (LONG):
        // const previewTitle = this.state.indexUserData ? this.state.indexUserData.draft.previewTitle : "";
        postType = (
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
          />);
        break;
      default:
        throw Error("No postType options matched :(");
    }
    return (
      <>
        <span className="close" onClick={(() => this.props.closeModal())}>X</span>
        {postType}
      </>
    );
  }
}

export default withFirebase(PostController);