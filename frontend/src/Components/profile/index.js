import React from 'react';
import { withFirebase } from '../../Firebase';
import PursuitHolder from './sub-components/pursuit-holder';
import Timeline from "./timeline";
import './index.scss';
import AxiosHelper from '../../Axios/axios';
import NoMatch from '../no-match';
import EventModal from "./sub-components/event-modal";
import FollowButton from "./sub-components/follow-buttons";
import { NOT_A_FOLLOWER_STATE, FOLLOW_ACTION, FOLLOW_REQUESTED_STATE } from "../constants/flags";

class ProfilePage extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {

            visitorUsername: null,
            targetProfileId: null,
            targetUsername: this.props.match.params.username,
            private: false,
            croppedDisplayPhoto: null,
            tinyCroppedcroppedDisplayPhoto: null,
            coverPhoto: "",
            bio: "",
            pursuits: null,
            recentPosts: null,
            allPosts: null,
            fail: false,
            selectedEvent: null,
            userRelationArrayId: null,
            followerStatus: null
        }
        this.modalRef = React.createRef();
        this.handleEventClick = this.handleEventClick.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.openModal = this.openModal.bind(this);
        this.handleFollowClick = this.handleFollowClick.bind(this);
        this.callUser = this.callUser.bind(this);
        this.callFollowerStatus = this.callFollowerStatus.bind(this);
    }

    callUser(user) {
        return AxiosHelper.returnUser(this.state.targetUsername)
            .then(
                response => {
                    if (!response) this.setState({ fail: true });
                    else {
                        const result = response.data;
                        const userRelationId = result.user_relation_array_id ? result.user_relation_array_id : null;
                        this.setState({
                            visitorUsername: user.displayName,
                            targetProfileId: result._id,
                            coverPhoto: result.cover_photo,
                            croppedDisplayPhoto: result.cropped_display_photo,
                            tinyCroppedDisplayPhoto: result.tiny_cropped_display_photo,
                            bio: result.bio,
                            pinned: result.pinned,
                            pursuits: result.pursuits,
                            allPosts: result.posts,
                            recentPosts: result.recent_posts,
                            userRelationArrayId: userRelationId
                        });

                        return [ user.displayName, userRelationId];
                    }
                }
            )
    }
    callFollowerStatus(userInfo) {
        const visitorUsername = userInfo[0];
        console.log(visitorUsername);

        const userRelationId = userInfo[1];
        if (userRelationId && visitorUsername !== this.state.targetUsername) {
            console.log(visitorUsername);
            AxiosHelper.returnFollowerStatus(visitorUsername, userRelationId)
                .then(
                    (result) => {
                        
                        if (result.status === 200) {
                            console.log(result);
                            if (result.data.success) this.setState({ followerStatus: result.data.success });
                            else if (result.data.error) {
                                this.setState({ followerStatus: NOT_A_FOLLOWER_STATE })
                                console.log(result.data.error);
                            }
                        }
                        console.log("Finished Checking Friend Status");
                    })
                .catch(
                    err => console.log(err)
                );
        }
    }

    //fixme add catch for no found anything
    componentDidMount() {
        this._isMounted = true;
        // AxiosHelper.returnPursuitNames(this.state.targetUsername)
        //     .then(
        //         result => {
        //             console.log(result);
        //             if (!result.data) this.setState({ fail: true });
        //             else if (this._isMounted) {
        //                 this.setState({
        //                     pursuits: result.data
        //                 })
        //             }
        //         }
        //     );
        if (this._isMounted) {
            this.props.firebase.auth.onAuthStateChanged((user) =>
                this.callUser(user)
                    .then(
                        userInfo => {
                            this.callFollowerStatus(userInfo);
                        }
                    )
            );
        }

    }

    componentWillUnmount() {
        this._isMounted = false;
    }


    openModal() {
        this.modalRef.current.style.display = "block";
        document.body.style.overflow = "hidden";
    }

    closeModal() {
        this.modalRef.current.style.display = "none";
        document.body.style.overflow = "visible";
    }

    handleEventClick(index) {
        console.log(index);
        const selectedEvent = index < this.state.recentPosts.length ? this.state.recentPosts[index] : this.state.allPosts[index];
        this.setState({ selectedEvent: selectedEvent }, this.openModal());
    }

    handleFollowClick() {
        AxiosHelper.setFriendStatus(this.state.visitorUsername, this.state.userRelationArrayId, FOLLOW_ACTION).then(
            (result) => {
                console.log(result);
                if (result.status === 200)
                    this.setState({ followerStatus: FOLLOW_REQUESTED_STATE });

            })
            .catch((error) => {
                console.log(error);
                alert("You already requested");
                this.setState({ followerStatus: FOLLOW_REQUESTED_STATE });

            })
    }

    render() {
        console.log(this.state.visitorUsername);
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

                {/* <div className="pursuit-board-container">
                {pursuitHolderArray.map((pursuit) => pursuit)}
            </div> */}
                <div className="modal" ref={this.modalRef}>
                    <div className="overlay"></div>
                    <span className="close" onClick={(() => this.closeModal())}>X</span>
                    <EventModal
                        tinyProfilePhoto={this.state.tinyCroppedDisplayPhoto}
                        username={this.state.targetUsername}
                        eventData={this.state.selectedEvent}
                        closeModal={this.closeModal} />
                </div>
            </div>
        );

    }
}

export default withFirebase(ProfilePage); 