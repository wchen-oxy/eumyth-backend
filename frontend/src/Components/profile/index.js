import React from 'react';
import { withFirebase } from '../../Firebase';
import PursuitHolder from './sub-components/pursuit-holder';
import Timeline from "./timeline";
import './index.scss';
import AxiosHelper from '../../Axios/axios';
import NoMatch from '../no-match';
import EventModal from "./sub-components/event-modal";
import FollowButton from "./sub-components/follow-buttons";
import UserOptions from "./sub-components/user-options";
import { NOT_A_FOLLOWER_STATE, FOLLOW_ACTION, UNFOLLOWED_STATE, FOLLOW_REQUESTED_STATE, FOLLOWED_STATE } from "../constants/flags";

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
            fail: false,
            selectedEvent: null,
            userRelationId: null,
            followerStatus: null
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

        // this.retrieveTargetUserInfo = this.retrieveTargetUserInfo.bind(this);
        // this.retrieveFollowerStatus = this.retrieveFollowerStatus.bind(this);
    }


    handleDeletePost(){
        AxiosHelper.deletePost(this.state.targetProfileId, this.state.selectedEvent._id).then((result) => console.log(result));
    }


    // retrieveTargetUserInfo(user) {
    //     return AxiosHelper.returnUser(this.state.targetUsername)
    //         .then(
    //             response => {
    //                 if (!response) this.setState({ fail: true });
    //                 else {
    //                     const result = response.data;
    //                     console.log(result.user_relation_id);

    //                     const userRelationId = result.user_relation_id ? result.user_relation_id : null;
    //                     this.setState({
    //                         visitorUsername: user.displayName,
    //                         targetProfileId: result._id,
    //                         coverPhoto: result.cover_photo,
    //                         croppedDisplayPhoto: result.cropped_display_photo,
    //                         smallCroppedDisplayPhoto : result.small_cropped_display_photo,
    //                         tinyCroppedDisplayPhoto: result.tiny_cropped_display_photo,
    //                         bio: result.bio,
    //                         pinned: result.pinned,
    //                         pursuits: result.pursuits,
    //                         allPosts: result.posts,
    //                         recentPosts: result.recent_posts,
    //                         userRelationId: userRelationId
    //                     });

    //                     return [user.displayName, userRelationId];
    //                 }
    //             }
    //         )
    // }

    handleFollowerStatusResponse(followerStatusResponse) {
        console.log(followerStatusResponse);
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
        const followerStatus = followerStatusResponse ? this.handleFollowerStatusResponse(followerStatusResponse) : null;
        //set visitor user info and targetUserinfo
        this.setState({
            visitorUsername: user ? user.displayName : null,
            targetUsername:  targetUserInfo.username,
            isPrivate : targetUserInfo.private,
            targetProfileId: targetUserInfo._id,
            coverPhoto: targetUserInfo.cover_photo,
            croppedDisplayPhoto: targetUserInfo.cropped_display_photo,
            smallCroppedDisplayPhoto: targetUserInfo.small_cropped_display_photo,
            bio: targetUserInfo.bio,
            pinned: targetUserInfo.pinned,
            pursuits: targetUserInfo.pursuits,
            allPosts: targetUserInfo.posts,
            recentPosts: targetUserInfo.recent_posts,
            userRelationId: targetUserInfo.user_relation_id,
            followerStatus: followerStatus
        });

        //follower Status Reponse
        console.log("Finished Checking Friend Status");
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
            // AxiosHelper.returnUser(this.state.targetUsername)
        }
        // if (this._isMounted) {
        //     this.retrieveTargetUserInfo(this.props.firebase.auth.currentUser)
        //         .then(
        //             userInfo => {
        //                 this.retrieveFollowerStatus(userInfo);
        //             }
        //         );
        // }

    }

    componentWillUnmount() {
        this._isMounted = false;
    }


    openModal(modal) {
        modal.current.style.display = "block";
        document.body.style.overflow = "hidden";

    }

    closeModal(modal) {
        modal.current.style.display = "none";
        document.body.style.overflow = "visible";
    }

    handleEventClick(index) {
        console.log(index);
        const selectedEvent = index < this.state.recentPosts.length ? this.state.recentPosts[index] : this.state.allPosts[index];
        console.log(selectedEvent);
        this.setState({ selectedEvent: selectedEvent }, this.openModal(this.modalRef));
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
        console.log(this.visitorUsername === this.targetUsername);
        console.log(this.state.selectedEvent);
        var pursuitHolderArray = [];
        if (this.state.fail) return NoMatch;
        if (this.state.pursuits) {
            for (const pursuit of this.state.pursuits) {
                pursuitHolderArray.push(
                    <PursuitHolder pursuitData={pursuit} key={pursuit.name} value={pursuit.name} />
                );
            }
        }
        return (
            <div>
                <div id="personal-profile-container">
                    <div id="personal-profile-header">
                        {
                            this.state.coverPhoto ?
                                (<img src={this.state.coverPhoto}></img>) : (<div id="temp-cover"></div>)
                        }
                    </div>
                    <div id="personal-profile-intro-container">
                        <div id="personal-profile-photo">
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
                <div id="personal-profile-timeline-container">
                    <Timeline recentPosts={this.state.recentPosts} onEventClick={this.handleEventClick} />
                </div>
                <div className="modal" ref={this.modalRef}>
                    <div className="overlay"  onClick={(() => this.closeModal(this.modalRef))}></div>
                    <span className="close" onClick={(() => this.closeModal(this.modalRef))}>X</span>
                    <EventModal
                        isOwnProfile={this.visitorUsername === this.targetUsername}
                        smallProfilePhoto={this.state.smallCroppedDisplayPhoto}
                        username={this.state.targetUsername}
                        eventData={this.state.selectedEvent} 
                        onDeletePost={this.handleDeletePost}
                        />
                </div>
                <div className="modal" ref={this.miniModalRef}>
                <div className="overlay" onClick={(() => this.closeModal(this.miniModalRef))}></div>
                <UserOptions />
                </div>
            </div>
        );

    }
}

export default withFirebase(ProfilePage); 