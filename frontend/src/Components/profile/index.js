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

            visitorUsername: this.props.firebase.returnUsername(),
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
        AxiosHelper.returnUser(this.state.targetUsername)
            .then(
                response => {
                    if (!response) this.setState({ fail: true });
                    else {
                        const result = response.data;
                        const userRelationId = result.user_relation_array_id ? result.user_relation_array_id : null;
                        console.log(result.cropped_display_photo);
                        if (this._isMounted) {
                            this.setState({
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
                        }
                        return [result._id, userRelationId];
                    }
                }
            )
            .then(
                userInfo => {
                    console.log(userInfo[1])
                    if (userInfo[1]) AxiosHelper.returnFollowerStatus(userInfo[0], userInfo[1])
                        .then(
                            (result) => {
                                console.log(result);
                                if (result.status === 200) {
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
            )
            ;
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
        let form = new FormData();
        form.append("visitorUsername", this.state.visitorUsername);
        form.append("targetUserRelationId", this.state.userRelationArrayId);
        form.append("action", FOLLOW_ACTION);
        // for (var key of form.entries()) {
        //     console.log(key[0] + ', ' + key[1]);
        // }

        AxiosHelper.setFriendStatus(this.state.visitorUsername, this.state.userRelationArrayId, FOLLOW_ACTION).then(
            (result) => {
                console.log(result);
                result.status === 200 ?
                this.setState({ followerStatus: FOLLOW_REQUESTED_STATE }) :
                alert("Error occured during follow. Try Again Later.")
            })
    }

    render() {
        var pursuitHolderArray = [];
        if (this.state.fail) return NoMatch;
        if (this.state.pursuits) {
            for (const pursuit of this.state.pursuits) {
                pursuitHolderArray.push(
                    <PursuitHolder pursuitData={pursuit} key={pursuit.name} value={pursuit.name} />
                );
            }
        }
        console.log(this.state.visitorUsername);
        console.log(this.state.croppedDisplayPhoto);
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