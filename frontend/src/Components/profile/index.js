import React from 'react';
import { withFirebase } from '../../Firebase';
import PursuitHolder from './sub-components/pursuit-holder';
import Timeline from "./timeline/index";
import AxiosHelper from '../../Axios/axios';
import NoMatch from '../no-match';
import EventModal from "./sub-components/event-modal";
import FollowButton from "./sub-components/follow-buttons";
import UserOptions from "./sub-components/user-options";
import {
    NOT_A_FOLLOWER_STATE,
    FOLLOW_ACTION,
    UNFOLLOWED_STATE,
    FOLLOW_REQUESTED_STATE,
    FOLLOWED_STATE
} from "../constants/flags";
import './index.scss';

const ALL = "ALL";
const POSTS = "POSTS";
const PROJECT = "PROJECT";
const PROJECTS = "PROJECTS";

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
            selectedPursuitIndex: -1,
            recentPosts: null,
            allPosts: null,
            allProjects: null,
            fail: false,
            selectedEvent: null,
            mediaType: null,
            textData: null,
            userRelationId: null,
            followerStatus: null,
            feedId: null,
            feedDataType: null,
            feedData: null,
            lastRetrievedPostIndex: 0,
            preferredPostType: null,
            isModalShowing: false,


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
        this.handleFeedDataTypeSwitch = this.handleFeedDataTypeSwitch.bind(this);
        this.handleNewProjectClick = this.handleNewProjectClick.bind(this);
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

    handleFeedDataTypeSwitch(type) {
        console.log(this.state.feedId);
        // console.log(ALL + POSTS);
        // console.log(this.state.pursuits[this.state.selectedPursuitIndex]);

        // console.log(this.state.selectedPursuitIndex);
        if (this.state.feedId !== ALL + POSTS && this.state.feedId !== ALL + PROJECTS) {
            if (type === POSTS) {
                this.setState((state) => ({ feedId: state.pursuits[state.selectedPursuitIndex].name + POSTS, feedDataType: POSTS, feedData: state.pursuits[state.selectedPursuitIndex].all_posts }))
            }
            else {
                this.setState((state) => ({ feedId: state.pursuits[state.selectedPursuitIndex].name + PROJECTS, feedDataType: PROJECTS, feedData: state.pursuits[state.selectedPursuitIndex].all_projects }));

            }
        }
        else {
            console.log(this.state.feedData);
            if (type === POSTS) {
                this.setState((state) => ({ feedId: ALL + POSTS, feedDataType: POSTS, feedData: state.allPosts }))
            }
            else {
                this.setState((state) => ({ feedId: ALL + PROJECTS, feedDataType: PROJECTS, feedData: state.allProjects }));

            }
        }
    }


    handleFeedSwitch(index) {
        if (index === -1) {
            this.setState((state) => ({
                selectedPursuitIndex: -1,
                feedId: ALL + state.feedDataType,
                feedData: state.allPosts,
            }));
        }
        else {
            this.setState((state) => ({
                selectedPursuitIndex: index,
                feedId: state.pursuits[index].name + state.feedDataType,
                feedData: state.pursuits[index].all_posts,
            }))
        }
    }

    handleDeletePost() {
        console.log("Deleting");
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
                console.log(followerStatusResponse.data.error);
                return followerStatusResponse.data.error === NOT_A_FOLLOWER_STATE || followerStatusResponse.data.error === UNFOLLOWED_STATE ?
                    NOT_A_FOLLOWER_STATE :
                    FOLLOW_REQUESTED_STATE;
            }
        }
    }

    handleResponseData(user, targetUserInfo, followerStatusResponse) {
        let pursuitNameArray = [];
        let projectArray = [];
        const followerStatus = followerStatusResponse ? this.handleFollowerStatusResponse(followerStatusResponse) : null;
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
            isPrivate: targetUserInfo.private,
            coverPhoto: targetUserInfo.cover_photo,
            croppedDisplayPhoto: targetUserInfo.cropped_display_photo,
            smallCroppedDisplayPhoto: targetUserInfo.small_cropped_display_photo,
            bio: targetUserInfo.bio,
            pinned: targetUserInfo.pinned,
            pursuits: targetUserInfo.pursuits,
            pursuitsNames: pursuitNameArray,
            allPosts: targetUserInfo.all_posts,
            allProjects: projectArray,
            feedData: targetUserInfo.all_posts,
            feedDataType: POSTS,
            feedId: ALL + POSTS,
            // recentPosts: targetUserInfo.recent_posts,
            userRelationId: targetUserInfo.user_relation_id,
            followerStatus: followerStatus
        });

        //follower Status Reponse
        console.log("Finished Checking Friend Status");
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
        // console.log(index);
        // const selectedEvent = index < this.state.recentPosts.length ? this.state.recentPosts[index] : this.state.allPosts[index];
        console.log(selectedEvent);
        return AxiosHelper.retrieveTextData(selectedEvent._id)
            .then(
                (result) => {
                    console.log(result.data);
                    if (this._isMounted) {
                        this.setState({ selectedEvent: selectedEvent, textData: result.data, mediaType: selectedEvent.post_format }, this.openModal());
                    }
                }
            )
            .catch(error => console.log(error));
        // .then(() => this.setState({ selectedEvent: selectedEvent }));
    }

    handleNewProjectClick(){
        this.setState({selectedEvent: PROJECT, mediaType: PROJECT}, this.openModal());
    }
    handleFollowerStatusChange(action) {
        AxiosHelper.setFollowerStatus(this.state.visitorUsername, this.state.targetUsername, this.state.userRelationId, this.state.isPrivate, action).then(
            (result) => {
                console.log(result);
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
        console.log(action);
        if (action === FOLLOW_ACTION) this.handleFollowerStatusChange(action);
        else {
            window.confirm("Are you sure you want to unfollow?") && this.handleFollowerStatusChange(action);
        }
    }

    handleOptionsClick() {
        this.openModal(this.miniModalRef);
    }


    render() {
        const newOrBackButton = (this.state.viewingProject ?  <button onClick={() => console.log()}>Back</button> : <button onClick={this.handleNewProjectClick}>New</button>);
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
                        {this.state.coverPhoto ? (<img src={this.state.coverPhoto}></img>) : (<div id="temp-cover"></div>)}
                    </div>
                    <div id="personal-profile-intro-container">
                        <div id="personal-profile-photo-container">
                            {this.state.croppedDisplayPhoto ? <img src={this.state.croppedDisplayPhoto}></img> : <></>}
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
                        <button onClick={() => this.handleFeedDataTypeSwitch(POSTS)}>Posts</button>
                        <button onClick={() => this.handleFeedDataTypeSwitch(PROJECT)}>Projects</button>
                    </div>
                </div>
                <div className="personal-profile-content-switch-container">
                    {this.state.feedDataType === PROJECTS ? newOrBackButton : <></>}
                    <button id="sort-by-date-button">Sort By Date</button>
                </div>
                <div id="personal-profile-timeline-container">

                    <Timeline
                        // recentPosts={this.state.recentPosts}
                        key={this.state.feedId}
                        allPosts={this.state.feedData}
                        onEventClick={this.handleEventClick}
                        targetProfileId={this.state.targetProfileId} />


                </div>
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
                                mediaType={this.state.mediaType}
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