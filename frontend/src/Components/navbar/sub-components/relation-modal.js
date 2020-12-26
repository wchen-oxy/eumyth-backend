import React from 'react';
import AxiosHelper from '../../../Axios/axios';
import { returnUserImageURL } from "../../constants/urls";
import "./relation-model.scss";

const UNFOLLOW = "UNFOLLOW";
const REQUEST = "REQUEST";
const FOLLOWING = "FOLLOWING";
const FOLLOW_REQUESTED = "FOLLOW_REQUESTED";

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
                    console.log(result.data);
                    this.setState({ userRelation: result.data });
                }
            })
    }

    handleStatusChange(action, username) {
        console.log(this.props.username);
        return AxiosHelper.changeRelationStatus(action, username, this.props.username, this.state.userRelation._id)
        .then((result) => AxiosHelper.returnUserRelationInfo(this.props.username)
        .then((result) => {
            if (this._isMounted) {
                console.log(result.data);
                this.setState({ userRelation: result.data });
            }
        }))
        .catch((err) => window.alert("Something went wrong :("));
    }

    render() {

        let requests = [];
        let followers = [];
        let following = [];
        if (this.state.userRelation) {


            for (const user of this.state.userRelation.followers) {
                followers.push(
                    <div className="relation-profile-row">
                        <img src={returnUserImageURL(user.display_photo)} />
                        <p>{user.username}</p>
                        <button onClick={() => this.handleStatusChange(UNFOLLOW, user.username)}>Following</button>
                    </div>
                )
                console.log(user);

            }
            for (const user of this.state.userRelation.following) {

                following.push(
                    <div className="relation-profile-row">
                        <img src={returnUserImageURL(user.display_photo)} />
                        <p>{user.username}</p>
                        <button onClick={() => this.handleStatusChange(UNFOLLOW, user.username)}>Following</button>
                    </div>
                )

            }
            for (const user of this.state.userRelation.requested) {
                requests.push(
                    <div className="relation-profile-row">
                        <img src={returnUserImageURL(user.display_photo)} />
                        <p>{user.username}</p>
                        <button onClick={() => this.handleStatusChange("ACCEPT", user.username)}>Accept Request</button>
                        <button onClick={() => this.handleStatusChange("DECLINE", user.username)}>Decline Request</button>
                    </div >
                )
            }
        }
        return (
            <div id="relation-window">
                <span className="close" onClick={(() => this.props.closeModal(REQUEST))}>X</span>
                <div id="relation-info">
                    <div className="relation-column">
                        <h2>Requests</h2>
                        {requests}
                    </div>
                    <div className="relation-column">
                        <h2>Followers</h2>
                        {followers}
                    </div>
                    <div className="relation-column">
                        <h2>Following</h2>
                        {following}
                    </div>
                </div>
            </div>


        );
    }
}

export default RelationModal;