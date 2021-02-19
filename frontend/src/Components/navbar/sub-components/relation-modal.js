import React from 'react';
import AxiosHelper from '../../../Axios/axios';
import { returnUserImageURL } from "../../constants/urls";
import {
    UNFOLLOW_ACTION,
    REQUEST_ACTION,
    ACCEPT_ACTION,
    DECLINE_ACTION
} from "../../constants/flags";
import "./relation-modal.scss";

class RelationModal extends React.Component {
    _isMounted = false;
    constructor() {
        super();
        this.state = {
            userRelationId: null,
            following: [],
            followers: [],
            requested: []
        }
        this.handleStatusChange = this.handleStatusChange.bind(this);
        this.handleRenderRelation = this.handleRenderRelation.bind(this);
        this.renderFollower = this.renderFollower.bind(this);
        this.renderFollow = this.renderFollow.bind(this);
        this.renderRequester = this.renderRequester.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        AxiosHelper.returnUserRelationInfo(this.props.username)
            .then((result) => {
                if (this._isMounted) {
                    const following = this.handleRenderRelation(
                        this.renderFollow,
                        result.data.following);
                    const followers = this.handleRenderRelation(
                        this.renderFollower,
                        result.data.followers);
                    const requested = this.handleRenderRelation(
                        this.renderRequester,
                        result.data.requested);
                    this.setState({
                        userRelationId: result.data._id,
                        following: following,
                        followers: followers,
                        requested: requested
                    });
                }
            })
    }

    handleStatusChange(action, username) {
        return (
            AxiosHelper.changeRelationStatus(
                action,
                username,
                this.props.username,
                this.state.userRelation._id)
                .then(
                    () =>
                        AxiosHelper.returnUserRelationInfo(this.props.username)
                )
                .then((result) => {
                    if (this._isMounted) {
                        this.setState({ userRelation: result.data });
                    }
                })
                .catch((err) => window.alert("Something went wrong :(")))
            ;
    }

    renderFollower(data) {
        let followers = [];
        for (const user of data) {
            followers.push(
                <div className="relationmodal-profile-row">
                    <div
                        className="relationmodal-profile-info-container"
                        onClick={() => console.log("THING")}
                    >
                        <img src={returnUserImageURL(user.display_photo)} />
                        <p>{user.username}</p>
                    </div>
                    <button
                        onClick={() => (
                            this.handleStatusChange(
                                UNFOLLOW_ACTION,
                                user.username)
                        )}
                    >
                        Following
                    </button>
                </div>
            )
        }
        return followers;
    }

    renderFollow(data) {
        let following = [];
        for (const user of data) {
            following.push(
                <div className="relationmodal-profile-row">
                    <div className="relationmodal-profile-info-container">
                        <img src={returnUserImageURL(user.display_photo)} />
                        <p>{user.username}</p>
                        <button
                            onClick={() => (
                                this.handleStatusChange(
                                    UNFOLLOW_ACTION,
                                    user.username)
                            )}
                        >
                            Following
                        </button>
                    </div>
                </div>
            )
        }
        return following;
    }

    renderRequester(data) {
        let requests = [];
        for (const user of data) {
            requests.push(
                <div className="relationmodal-profile-row">
                    <div className="relationmodal-profile-info-container">
                        <img src={returnUserImageURL(user.display_photo)} />
                        <p>{user.username}</p>
                    </div>
                    <button
                        onClick={() => (
                            this.handleStatusChange(
                                ACCEPT_ACTION,
                                user.username))}
                    >
                        Accept Request
                    </button>
                    <button
                        onClick={() => (
                            this.handleStatusChange(
                                DECLINE_ACTION,
                                user.username))}
                    >
                        Decline Request
                    </button>
                </div >
            )
        }
        return requests;
    }

    handleRenderRelation(renderFunction, data) {
        if (data) {
            return renderFunction(data);
        }
        else {
            return null;
        }
    }

    render() {
        return (
            <div id="relationmodal-window">
                <span
                    className="close"
                    onClick={(() => this.props.closeModal(REQUEST_ACTION))}
                >
                    X
                </span>
                <div id="relationmodal-hero-container">
                    <div className="relationmodal-column">
                        <h2>Requests</h2>
                        {this.state.requested}
                    </div>
                    <div className="relationmodal-column">
                        <h2>Followers</h2>
                        {this.state.followers}
                    </div>
                    <div className="relationmodal-column">
                        <h2>Following</h2>
                        {this.state.following}
                    </div>
                </div>
            </div>
        );
    }
}

export default RelationModal;