import React from 'react';
import { withFirebase } from '../../Firebase';
import PursuitHolder from './sub-components/pursuit-holder';
import Timeline from "./timeline/index";
import AxiosHelper from '../../Axios/axios';
import NoMatch from '../no-match';
import PostViewerController from "../post/viewer/post-viewer-controller";
import FollowButton from "./sub-components/follow-buttons";
import ProjectController from "../project/index";
import { returnUserImageURL } from "../constants/urls";
import {
    ALL,
    POST,
    LONG,
    PROJECT,
    NEW_PROJECT,
    PRIVATE,
    NOT_A_FOLLOWER_STATE,
    FOLLOW_ACTION,
    UNFOLLOWED_STATE,
    FOLLOW_REQUESTED_STATE,
    FOLLOWED_STATE
} from "../constants/flags";
import './index.scss';

class ProfilePage extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            visitorUsername: null,
            targetProfileId: null,
            targetProfilePreviewId: null,
            targetUsername: this.props.match.params.username,
            isPrivate: true,
            croppedDisplayPhoto: null,
            tinyCroppedcroppedDisplayPhoto: null,
            coverPhoto: "",
            bio: "",
            pursuits: null,
            recentPosts: null,
            allPosts: null,
            allProjects: null,
            fail: false,
            selectedEvent: null,
            textData: null,
            userRelationId: null,
            followerStatus: null,

            feedId: null,
            feedData: null,
            mediaType: POST,
            selectedPursuitIndex: -1,


            lastRetrievedPostIndex: 0,
            preferredPostType: null,
            isModalShowing: false,
            newProject: false,

            postOnlyView: null,
        }
        this.modalRef = React.createRef();
        this.miniModalRef = React.createRef();
        this.handleEventClick = this.handleEventClick.bind(this);
        this.renderHeroContent = this.renderHeroContent.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
        this.returnPublicPosts = this.returnPublicPosts.bind(this);
        this.handleFollowClick = this.handleFollowClick.bind(this);
        this.handleFollowerStatusChange = this.handleFollowerStatusChange.bind(this);
        this.handleOptionsClick = this.handleOptionsClick.bind(this);
        this.handleDeletePost = this.handleDeletePost.bind(this);
        this.handleFeedSwitch = this.handleFeedSwitch.bind(this);
        this.handleMediaTypeSwitch = this.handleMediaTypeSwitch.bind(this);
        this.handleNewBackProjectClick = this.handleNewBackProjectClick.bind(this);
    }
    //fixme add catch for no found anything
    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted && this.state.targetUsername) {
            this.props.firebase.auth.onAuthStateChanged(
                (user) => {
                    if (user) {
                        let targetUserInfo = null;
                        AxiosHelper
                            .returnUser(this.state.targetUsername)
                            .then(response => {
                                targetUserInfo = response.data;
                                return user.displayName !== this.state.targetUsername ?
                                    AxiosHelper
                                        .returnFollowerStatus(
                                            user.displayName,
                                            targetUserInfo.user_relation_id
                                        ) : null;
                            })
                            .then((response) => {
                                this.handleResponseData(
                                    user,
                                    targetUserInfo,
                                    response ? response : null
                                );
                            })
                            .catch(err => console.log(err));
                    }
                    else {
                        AxiosHelper
                            .returnUser(this.state.targetUsername)
                            .then(response => this.handleResponseData(user, response.data, null))
                            .catch(err => console.log(err));

                    }
                }
            )
        }
        else if (this._isMounted && this.props.match.params.postId) {
            this.props.firebase.auth.onAuthStateChanged(
                (user) =>
                    Promise.all([
                        AxiosHelper
                            .retrievePost(this.props.match.params.postId, false),
                        AxiosHelper
                            .returnUser(user.displayName)
                    ])
                        .then(
                            (result => {
                                let pursuitNameArray = [];
                                for (const pursuit of result[1].data.pursuits) {
                                    pursuitNameArray.push(pursuit.name);

                                }
                                if (this._isMounted) this.setState({
                                    selectedEvent: result[0].data,
                                    postOnlyView: true,
                                    postType: result[0].data.post_format,
                                    visitorUsername: user ? user.displayName : null,
                                    targetUsername: result[0].data.username,
                                    pursuitNames: pursuitNameArray,
                                })
                            })
                        )
            )
        }
        else {
            throw new Error("No profile or post matched");
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleMediaTypeSwitch(mediaType) {
        if (this.state.newProject) {
            if (!window.confirm("Do you want to discard your new project?")) return;
            this.setState({ newProject: false });
        }

        if (this.state.selectedPursuitIndex === -1) {
            this.setState((state) => ({
                feedId: ALL + mediaType,
                mediaType: mediaType,
                feedData: mediaType === POST ? state.allPosts : state.allProjects
            }));
        }
        else {
            this.setState((state) => ({
                feedId: state.pursuits[state.selectedPursuitIndex].name + mediaType,
                mediaType: mediaType,
                feedData: mediaType === POST ?
                    (state.pursuits[state.selectedPursuitIndex].all_posts ?
                        state.pursuits[state.selectedPursuitIndex].all_posts : [])
                    :
                    (state.pursuits[state.selectedPursuitIndex].all_projects ?
                        state.pursuits[state.selectedPursuitIndex].all_projects : [])
            }));
        }
    }

    handleFeedSwitch(index) {
        if (this.state.newProject) {
            if (!window.confirm("Do you want to discard your new project?")) return;
            this.setState({ newProject: false });
        }
        if (index === -1) {
            this.setState((state) => ({
                selectedPursuitIndex: -1,
                feedId: ALL + state.mediaType,
                feedData: state.mediaType === POST ? state.allPosts : state.allProjects,
            }));
        }
        else {
            this.setState((state) => ({
                selectedPursuitIndex: index,
                feedId: state.pursuits[index].name + state.mediaType,
                feedData: state.mediaType === POST ?
                    state.pursuits[index].all_posts ? state.pursuits[index].all_posts : []
                    :
                    state.pursuits[index].all_projects ? state.pursuits[index].all_projects : [],
            }))
        }
    }

    handleDeletePost() {
        return AxiosHelper
            .deletePost(
                this.state.targetProfileId,
                this.state.targetIndexUserId,
                this.state.selectedEvent._id)
            .then((result) => console.log(result));
    }

    handleFollowerStatusResponse(followerStatusResponse) {
        if (followerStatusResponse.status === 200) {
            if (followerStatusResponse.data.success) {
                if (followerStatusResponse.data.success === FOLLOWED_STATE) {
                    return FOLLOWED_STATE;
                }

                else if (followerStatusResponse.data.success === FOLLOW_REQUESTED_STATE) {
                    return FOLLOW_REQUESTED_STATE;
                }

                else {
                    throw Error;
                }
            }
            else if (followerStatusResponse.data.error) {
                return (followerStatusResponse.data.error === NOT_A_FOLLOWER_STATE
                    || followerStatusResponse.data.error === UNFOLLOWED_STATE ?
                    NOT_A_FOLLOWER_STATE
                    :
                    FOLLOW_REQUESTED_STATE);
            }
        }
    }

    returnPublicPosts(allPosts) {
        return allPosts.reduce((result, value) => {
            if (value.post_privacy_type !== PRIVATE) { result.push(value); }
            return result;
        }, [])
    }

    handleResponseData(user, targetUserInfo, followerStatusResponse) {
        let pursuitNameArray = [];
        let projectArray = [];
        const postsArray = user.displayName === targetUserInfo.username ?
            targetUserInfo.all_posts : this.returnPublicPosts(targetUserInfo.all_posts);
        const followerStatus = followerStatusResponse ?
            this.handleFollowerStatusResponse(followerStatusResponse) : null;
        for (const pursuit of targetUserInfo.pursuits) {
            pursuitNameArray.push(pursuit.name);
            if (pursuit.projects) {
                for (const project of pursuit.projects) {
                    projectArray.push(project);
                }
            }
        }

        //set visitor user info and targetUserinfo
        if (this._isMounted) this.setState({
            visitorUsername: user ? user.displayName : null,
            targetUsername: targetUserInfo.username,
            targetProfileId: targetUserInfo._id,
            targetIndexUserId: targetUserInfo.index_user_id,
            targetProfilePreviewId: targetUserInfo.user_preview_id,
            isPrivate: targetUserInfo.private,
            coverPhoto: targetUserInfo.cover_photo_key,
            croppedDisplayPhoto: targetUserInfo.cropped_display_photo_key,
            smallCroppedDisplayPhoto: targetUserInfo.small_cropped_display_photo_key,
            bio: targetUserInfo.bio,
            pinned: targetUserInfo.pinned,
            pursuits: targetUserInfo.pursuits,
            pursuitNames: pursuitNameArray,
            allPosts: postsArray,
            allProjects: projectArray,
            feedData: postsArray,
            mediaType: POST,
            feedId: ALL + POST,
            userRelationId: targetUserInfo.user_relation_id,
            followerStatus: followerStatus,
            postOnlyView: false,
        });
    }

    openModal(postId) {

        this.modalRef.current.style.display = "block";
        document.body.style.overflow = "hidden";
        this.setState({ isModalShowing: true }, this.props.history.replace("/p/" + postId));

    }

    closeModal() {
        this.modalRef.current.style.display = "none";
        document.body.style.overflow = "visible";
        this.setState(
            {
                isModalShowing: false
            }, this.props.history.replace("/" + this.state.targetUsername)
        );
    }

    handleEventClick(selectedEvent) {
        return AxiosHelper
            .retrievePost(selectedEvent._id, true)
            .then(
                (result) => {
                    if (this._isMounted) {
                        this.setState({
                            selectedEvent: selectedEvent,
                            textData: result.data,
                            postType: selectedEvent.post_format
                        }, this.openModal(selectedEvent._id));
                    }
                }
            )
            .catch(error => console.log(error));
    }

    renderHeroContent() {
        return this.state.mediaType === POST ? (
            < Timeline
                mediaType={this.state.mediaType}
                key={this.state.feedId}
                allPosts={this.state.feedData}
                onEventClick={this.handleEventClick}
                targetProfileId={this.state.targetProfileId} />)
            :
            (<ProjectController
                username={this.state.targetUsername}
                displayPhoto={this.state.smallCroppedDisplayPhoto}
                targetProfileId={this.state.targetProfileId}
                targetIndexUserId={this.state.targetIndexUserId}
                mediaType={this.state.mediaType}
                newProject={this.state.newProject}
                key={this.state.feedId}
                allPosts={this.state.feedData}
                onEventClick={this.handleEventClick}
                onNewBackProjectClick={this.handleNewBackProjectClick}
                pursuitNames={this.state.pursuitNames}
            />)
    }

    handleNewBackProjectClick() {
        if (!this.state.newProject) {
            this.setState((state) => ({
                newProject: !state.newProject,
                feedId: NEW_PROJECT,
                feedData: state.allPosts
            }));
        }
        else {
            this.setState({ newProject: false }, this.handleMediaTypeSwitch(this.state.mediaType))
        }
    }
    handleFollowerStatusChange(action) {
        AxiosHelper.setFollowerStatus(
            {
                visitorUsername: this.state.visitorUsername,
                targetUserRelationId: this.state.userRelationId,
                targetProfilePreviewId: this.state.targetProfilePreviewId,
                isPrivate: this.state.isPrivate,
                action: action
            }
        ).then(
            (result) => {
                if (result.status === 200) {
                    if (result.data.success) {
                        this.setState({ followerStatus: result.data.success });
                    }
                    else {
                        this.setState({ followerStatus: result.data.error });
                    }
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    handleFollowClick(action) {
        if (action === FOLLOW_ACTION) this.handleFollowerStatusChange(action);
        else {
            window.confirm("Are you sure you want to unfollow?") &&
                this.handleFollowerStatusChange(action);
        }
    }

    handleOptionsClick() {
        // this.openModal(this.miniModalRef);
    }

    render() {
        const shouldHideProfile = (
            this.state.visitorUsername === null && this.state.isPrivate)
            || (this.state.visitorUsername !== this.state.targetUsername
                && this.state.isPrivate
            )
            && (this.state.followerStatus !== "FOLLOWING" &&
                this.state.followerStatus !== "REQUEST_ACCEPTED");
        let pursuitHolderArray = [
            <PursuitHolder
                key={ALL}
                name={ALL}
                value={-1}
                onFeedSwitch={this.handleFeedSwitch}
            />
        ];
        if (this.state.fail) return NoMatch;
        if (this.state.pursuits) {
            let index = 0;
            for (const pursuit of this.state.pursuits) {
                pursuitHolderArray.push(
                    <PursuitHolder
                        name={pursuit.name}
                        numEvents={pursuit.num_posts}
                        key={pursuit.name} value={index++}
                        onFeedSwitch={this.handleFeedSwitch} />
                );
            }
        }
        if (this.state.postOnlyView) {
            return (
                <PostViewerController
                    key={this.state.selectedEvent._id}
                    isOwnProfile={this.state.visitorUsername === this.state.selectedEvent.username}
                    visitorUsername={this.state.visitorUsername}
                    largeViewMode={true}
                    isPostOnlyView={true}
                    displayPhoto={this.state.selectedEvent.display_photo_key}
                    preferredPostType={this.state.preferredPostType}
                    postType={this.state.postType}
                    pursuitNames={this.state.pursuitNames}
                    username={this.state.selectedEvent.username}
                    eventData={this.state.selectedEvent}
                    textData={
                        this.state.selectedEvent.post_format === LONG ?
                            JSON.parse(this.state.selectedEvent.text_data) :
                            this.state.selectedEvent.text_data
                    }
                    closeModal={this.closeModal}
                    onDeletePost={this.handleDeletePost}
                />
            )
        }
        else if (!this.state.postOnlyView) {
            return (
                <div>
                    <div id="profile-main-container">
                        <div id="profile-cover-photo-container">
                            {
                                this.state.coverPhoto ?
                                    (<img
                                        alt="cover photo"
                                        src={returnUserImageURL(
                                            this.state.coverPhoto)}
                                    ></img>
                                    ) : (
                                        <div id="profile-temp-cover"></div>
                                    )
                            }
                        </div>
                        <div id="profile-intro-container">
                            <div id="profile-display-photo-container">
                                {this.state.croppedDisplayPhoto ? (
                                    <img
                                        alt="user profile photo"
                                        src={returnUserImageURL(
                                            this.state.croppedDisplayPhoto)}
                                    ></img>
                                ) : (
                                        <></>
                                    )
                                }
                                <div id="profile-name-container">
                                    <h4>{this.state.targetUsername}</h4>
                                </div>
                                <div id="profile-follow-actions-container">
                                    <FollowButton
                                        isOwner={this.state.targetUsername === this.state.visitorUsername}
                                        followerStatus={this.state.followerStatus}
                                        onFollowClick={this.handleFollowClick}
                                        onOptionsClick={this.handleOptionsClick}
                                    />
                                </div>
                            </div>
                            <div id="profile-biography">
                                {this.state.bio ? <p>{this.state.bio}</p> : <p></p>}
                            </div>
                            <div id="profile-pursuits-container">
                                {pursuitHolderArray}
                            </div>
                        </div>

                        <div id="profile-content-switch-container">
                            <button
                                disabled={this.state.mediaType === POST ?
                                    true : false}
                                onClick={() => this.handleMediaTypeSwitch(POST)}>
                                Posts
                        </button>
                            <button
                                disabled={this.state.mediaType === PROJECT ?
                                    true : false}
                                onClick={() => this.handleMediaTypeSwitch(PROJECT)}>
                                Projects
                        </button>
                        </div>
                        {
                            shouldHideProfile
                                ?
                                <p>This profile is private. To see
                                    these posts, please request access. </p>
                                :
                                this.renderHeroContent()

                        }
                    </div>
                    <div className="modal" ref={this.modalRef}>
                        <div className="overlay" onClick={(() => this.closeModal())}></div>
                        <span className="close" onClick={(() => this.closeModal())}>X</span>
                        {
                            this.state.isModalShowing && this.state.selectedEvent ?
                                <PostViewerController
                                    key={this.state.selectedEvent._id}
                                    isOwnProfile={this.state.visitorUsername === this.state.targetUsername}
                                    visitorUsername={this.state.visitorUsername}
                                    isPostOnlyView={false}
                                    displayPhoto={this.state.smallCroppedDisplayPhoto}
                                    preferredPostType={this.state.preferredPostType}
                                    postType={this.state.postType}
                                    largeViewMode={true}
                                    pursuitNames={this.state.pursuitNames}
                                    username={this.state.targetUsername}
                                    eventData={this.state.selectedEvent}
                                    textData={this.state.textData}
                                    onDeletePost={this.handleDeletePost}
                                    closeModal={this.closeModal}
                                />
                                :
                                <></>
                        }
                    </div>
                </div>
            );
        }
        else {
            return new Error("State condition for postOnlyView was null");
        }

    }
}

export default withFirebase(ProfilePage); 