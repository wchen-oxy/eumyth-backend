import React from 'react';
import AxiosHelper from '../../../Axios/axios';
import { returnUserImageURL } from "../../constants/urls";
import { UNFOLLOW_ACTION, REQUEST_ACTION } from "../../constants/flags";
import "./relation-modal.scss";


class RelationModal extends React.Component {
    _isMounted = false;
    constructor() {
        super();
        this.state = {
            userRelation: null
        }
        this.handleStatusChange = this.handleStatusChange.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        AxiosHelper.returnUserRelationInfo(this.props.username)
            .then((result) => {
                if (this._isMounted) {
                    this.setState({ userRelation: result.data });
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

    render() {
        let requests = [];
        let followers = [];
        let following = [];
        if (this.state.userRelation) {
            for (const user of this.state.userRelation.followers) {
                followers.push(
                    <div className="relationmodal-profile-row">
                        <img src={returnUserImageURL(user.display_photo)} />
                        <p>{user.username}</p>
                        <button onClick={() => this.handleStatusChange(UNFOLLOW_ACTION, user.username)}>Following</button>
                    </div>
                )
            }
            for (const user of this.state.userRelation.following) {
                following.push(
                    <div className="relationmodal-profile-row">
                        <img src={returnUserImageURL(user.display_photo)} />
                        <p>{user.username}</p>
                        <button onClick={() => this.handleStatusChange(UNFOLLOW_ACTION, user.username)}>Following</button>
                    </div>
                )

            }
            for (const user of this.state.userRelation.requested) {
                requests.push(
                    <div className="relationmodal-profile-row">
                        <img src={returnUserImageURL(user.display_photo)} />
                        <p>{user.username}</p>
                        <button onClick={() => this.handleStatusChange("ACCEPT", user.username)}>Accept Request</button>
                        <button onClick={() => this.handleStatusChange("DECLINE", user.username)}>Decline Request</button>
                    </div >
                )
            }
        }
        return (
            <div id="relationmodal-window">
                <span className="close" onClick={(() => this.props.closeModal(REQUEST_ACTION))}>X</span>
                <div id="relationmodal-info">
                    <div className="relationmodal-column">
                        <h2>Requests</h2>
                        {requests}
                    </div>
                    <div className="relationmodal-column">
                        <h2>Followers</h2>
                        {followers}
                    </div>
                    <div className="relationmodal-column">
                        <h2>Following</h2>
                        {following}
                    </div>
                </div>
            </div>
        );
    }
}

export default RelationModal;