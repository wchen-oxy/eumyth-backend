import React from 'react';
import { withFirebase } from '../../Firebase';
import PursuitHolder from './sub-components/pursuit-holder';
import Timeline from "./timeline/index";
import AxiosHelper from '../../Axios/axios';
import NoMatch from '../no-match';
import EventModal from "./sub-components/event-modal";
import FollowButton from "./sub-components/follow-buttons";
import UserOptions from "./sub-components/user-options";
import ProjectController from "../project/index";
import { returnUserImageURL } from "../constants/urls";

import {
    NOT_A_FOLLOWER_STATE,
    FOLLOW_ACTION,
    UNFOLLOWED_STATE,
    FOLLOW_REQUESTED_STATE,
    FOLLOWED_STATE
} from "../constants/flags";
import { POST, PROJECT, PRIVATE } from "../constants/flags";
import './index.scss';

const ALL = "ALL";
const NEW_PROJECT = "NEW PROJECT";

class ProfilePage extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            visitorUsername: null,
            targetProfileId: null,
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
            selectedPursuitIndex: -1, //for pursuit name


            lastRetrievedPostIndex: 0,
            preferredPostType: null,
            isModalShowing: false,
            newProject: false,


        }
        this.modalRef = React.createRef();
        this.miniModalRef = React.createRef();
        this.handleEventClick = this.handleEventClick.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
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
        if (this._isMounted) {
            this.props.firebase.auth.onAuthStateChanged(
                (user) => {
                    if (user) {
                        let targetUserInfo = null;
                        AxiosHelper.returnUser(this.state.targetUsername).then(
                            response => {
                                targetUserInfo = response.data;
                                if (user.displayName !== this.state.targetUsername) {
                                    return AxiosHelper.returnFollowerStatus(user.displayName, targetUserInfo.user_relation_id)
                                }
                                else return null; //if user owns current profile
                            }
                        )
                            .then((response) => {
                                if (response) { this.handleResponseData(user, targetUserInfo, response); }
                                else {
                                    this.handleResponseData(user, targetUserInfo, null);
                                }
                            }).catch(
                                err => console.log(err)
                            );
                    }
                    else {
                        AxiosHelper.returnUser(this.state.targetUsername).then(
                            response =>
                                (this.handleResponseData(user, response.data, null))

                        ).catch(
                            err => console.log(err)
                        );

                    }
                }
            )
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
                    (state.pursuits[state.selectedPursuitIndex].all_posts ? state.pursuits[state.selectedPursuitIndex].all_posts : [])
                    :
                    (state.pursuits[state.selectedPursuitIndex].all_projects ? state.pursuits[state.selectedPursuitIndex].all_projects : [])
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
        return AxiosHelper.deletePost(this.state.targetProfileId, this.state.targetIndexUserId, this.state.selectedEvent._id).then((result) => console.log(result));
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
                return followerStatusResponse.data.error === NOT_A_FOLLOWER_STATE || followerStatusResponse.data.error === UNFOLLOWED_STATE ?
                    NOT_A_FOLLOWER_STATE :
                    FOLLOW_REQUESTED_STATE;
            }
        }
    }

    handleResponseData(user, targetUserInfo, followerStatusResponse) {
        let pursuitNameArray = [];
        let projectArray = [];
        let postsArray = user.displayName === targetUserInfo.username ? targetUserInfo.all_posts : targetUserInfo.all_posts.reduce((result, value) => {
            console.log(value.post_privacy_type);
            if (value.post_privacy_type !== PRIVATE) { result.push(value); }
            return result;
        }, []);
        const followerStatus = followerStatusResponse ? this.handleFollowerStatusResponse(followerStatusResponse) : null;
        for (const pursuit of targetUserInfo.pursuits) {
            pursuitNameArray.push(pursuit.name);
            if (pursuit.projects) {
                for (const project of pursuit.projects) {
                    projectArray.push(project);
                }
            }
        }
        console.log(targetUserInfo);

        //set visitor user info and targetUserinfo
        if (this._isMounted) this.setState({
            visitorUsername: user ? user.displayName : null,
            targetUsername: targetUserInfo.username,
            targetProfileId: targetUserInfo._id,
            targetIndexUserId: targetUserInfo.index_user_id,
            isPrivate: targetUserInfo.private,
            coverPhoto: targetUserInfo.cover_photo_key,
            croppedDisplayPhoto: targetUserInfo.cropped_display_photo_key,
            smallCroppedDisplayPhoto: targetUserInfo.small_cropped_display_photo_key,
            bio: targetUserInfo.bio,
            pinned: targetUserInfo.pinned,
            pursuits: targetUserInfo.pursuits,
            pursuitsNames: pursuitNameArray,
            allPosts: postsArray,
            allProjects: projectArray,
            feedData: postsArray,
            mediaType: POST,
            feedId: ALL + POST,
            userRelationId: targetUserInfo.user_relation_id,
            followerStatus: followerStatus
        });
    }

    openModal() {
        this.modalRef.current.style.display = "block";
        document.body.style.overflow = "hidden";
        this.setState({ isModalShowing: true });

    }

    closeModal() {
        this.modalRef.current.style.display = "none";
        document.body.style.overflow = "visible";
        this.setState({ isModalShowing: false });
    }

    handleEventClick(selectedEvent) {
        return AxiosHelper.retrieveTextData(selectedEvent._id)
            .then(
                (result) => {
                    if (this._isMounted) {
                        this.setState({
                            selectedEvent: selectedEvent,
                            textData: result.data,
                            postType: selectedEvent.post_format
                        }, this.openModal());
                    }
                }
            )
            .catch(error => console.log(error));
        // .then(() => this.setState({ selectedEvent: selectedEvent }));
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
        AxiosHelper.setFollowerStatus(this.state.visitorUsername, this.state.targetUsername, this.state.userRelationId, this.state.isPrivate, action).then(
            (result) => {
                if (result.status === 200) {
                    if (result.data.success) this.setState({ followerStatus: result.data.success });
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
            window.confirm("Are you sure you want to unfollow?") && this.handleFollowerStatusChange(action);
        }
    }

    handleOptionsClick() {
        this.openModal(this.miniModalRef);
    }

    render() {
        var pursuitHolderArray = [<PursuitHolder key={ALL} name={ALL} value={-1} onFeedSwitch={this.handleFeedSwitch} />];
        if (this.state.fail) return NoMatch;
        if (this.state.pursuits) {
            let index = 0;
            for (const pursuit of this.state.pursuits) {
                pursuitHolderArray.push(
                    <PursuitHolder name={pursuit.name} numEvents={pursuit.num_posts} key={pursuit.name} value={index++} onFeedSwitch={this.handleFeedSwitch} />
                );
            }
        }
        return (
            <div>
                <div id="personal-profile-container" className="flex-display flex-direction-column">
                    <div id="personal-profile-header">
                        {this.state.coverPhoto ? (<img id="profile-cover-photo" src={returnUserImageURL(this.state.coverPhoto)}></img>) : (<div id="temp-cover"></div>)}
                    </div>
                    <div id="personal-profile-intro-container">
                        <div id="personal-profile-photo-container">
                            {this.state.croppedDisplayPhoto ? <img src={returnUserImageURL(this.state.croppedDisplayPhoto)}></img> : <></>}
                            <div id="personal-profile-name-container">
                                <h4 id="personal-profile-name">{this.state.targetUsername}</h4>
                            </div>
                            <div id="personal-profile-actions-container">
                                <FollowButton
                                    isOwner={this.state.targetUsername === this.state.visitorUsername}
                                    followerStatus={this.state.followerStatus}
                                    onFollowClick={this.handleFollowClick}
                                    onOptionsClick={this.handleOptionsClick}
                                />
                            </div>
                        </div>
                        <div id="personal-profile-description">
                            {this.state.bio ? <p>{this.state.bio}</p> : <p></p>}
                        </div>
                        <div id="pursuit-selection-container">
                            {pursuitHolderArray}
                        </div>
                    </div>
                </div>
                <div className="personal-profile-content-switch-container">
                    <div id="personal-profile-buttons-container">
                        <button disabled={this.state.mediaType === POST ? true : false} onClick={() => this.handleMediaTypeSwitch(POST)}>Posts</button>
                        <button disabled={this.state.mediaType === PROJECT ? true : false} onClick={() => this.handleMediaTypeSwitch(PROJECT)}>Projects</button>
                    </div>
                </div>

                {console.log(
                    (this.state.visitorUsername === null && this.state.isPrivate)
                    ,
                    this.state.visitorUsername !== this.state.targetUsername && this.state.isPrivate && (this.state.followerStatus !== "FOLLOWING" || this.state.followerStatus !==
                        "REQUEST_ACCEPTED"
                    )
                )
                }

                {

                    this.state.visitorUsername === null && this.state.isPrivate ||
                    (this.state.visitorUsername !== this.state.targetUsername && this.state.isPrivate) && (this.state.followerStatus !== "FOLLOWING" && this.state.followerStatus !== "REQUEST_ACCEPTED")

                        ?

                        <p>This profile is private. To see these posts, please request access. </p> :
                        this.state.mediaType === POST ?
                            < Timeline
                                mediaType={this.state.mediaType}
                                key={this.state.feedId}
                                allPosts={this.state.feedData}
                                onEventClick={this.handleEventClick}
                                targetProfileId={this.state.targetProfileId} />
                            :

                            <ProjectController
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
                                pursuitsNames={this.state.pursuitsNames}
                            />

                }
                <div className="modal" ref={this.modalRef}>
                    <div className="overlay" onClick={(() => this.closeModal())}></div>
                    <span className="close" onClick={(() => this.closeModal())}>X</span>
                    {
                        this.state.isModalShowing && this.state.selectedEvent ?

                            <EventModal
                                key={this.state.selectedEvent._id}
                                isOwnProfile={this.visitorUsername === this.targetUsername}
                                displayPhoto={this.state.smallCroppedDisplayPhoto}
                                preferredPostType={this.state.preferredPostType}
                                closeModal={this.closeModal}
                                postType={this.state.postType}
                                // smallProfilePhoto={this.state.smallCroppedDisplayPhoto}
                                pursuits={this.state.pursuitsNames}
                                username={this.state.targetUsername}
                                eventData={this.state.selectedEvent}
                                textData={this.state.textData}
                                onDeletePost={this.handleDeletePost}
                            />
                            :
                            <>                            {console.log("Disappear")}
                            </>
                    }
                </div>
                <div className="modal" ref={this.miniModalRef}>
                    <div className="overlay" onClick={(() => this.closeModal())}></div>
                    <UserOptions />
                </div>
            </div>
        );

    }
}

export default withFirebase(ProfilePage); 