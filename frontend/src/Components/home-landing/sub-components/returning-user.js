import React from 'react';
import { withAuthorization } from '../../session';
import { withFirebase } from '../../../Firebase';
import AxiosHelper from '../../../Axios/axios';
import RecentWorkObject from "./recent-work-object";
import FeedObject from "./feed-object";
import './returning-user.scss';
import LongPostViewer from '../../post-viewer/long-post';
import ShortPostViewer from '../../post-viewer/short-post';

const SHORT = "SHORT";

class ReturningUserPage extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            username: this.props.firebase.returnUsername(),
            firstName: null,
            lastName: null,
            feedData: null,
            pursuits: null,
            displayPhoto: "https://i.redd.it/73j1cgr028u21.jpg",
            indexUserData: null
        }
        this.handlePursuitClick = this.handlePursuitClick.bind(this);
        this.handleRecentWorkClick = this.handleRecentWorkClick.bind(this);

    }

    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted) this.props.firebase.returnName().then((result) => {
            if (result) this.setState({ firstName: result.firstName, lastName: result.lastName });
        });
        if (this._isMounted && this.state.username) {
            let indexUserData = null;
            let displayPhoto = "";
            let pursuits = null;
            AxiosHelper.returnIndexUser(this.state.username)
                .then(
                    (result) => {
                        indexUserData = result.data;
                        displayPhoto = result.data.small_cropped_display_photo;
                        pursuits = result.data.pursuits;
                        return result.data.following_feed;
                    }
                )
                .then(
                    (feed) => {
                        if (!feed || feed.length === 0) return;
                        else if (feed.length < 20) {
                            return AxiosHelper.returnSocialFeedPosts(indexUserData._id, feed.slice(0, feed.length));
                        }
                        else {
                            return AxiosHelper.returnSocialFeedPosts(indexUserData._id, feed.slice(0, 20));
                        }
                    }
                )
                .then(
                    (results) => {
                        this.setState({
                            feedData: results ? results : null,
                            indexUserData: indexUserData,
                            displayPhoto: displayPhoto,
                            pursuits: pursuits,
                        });
                    }
                );
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handlePursuitClick(e) {
        e.preventDefault();
        this.props.history.push(this.state.username);

    }

    handleRecentWorkClick(e, value) {
        e.preventDefault();
        alert(value);
    }

    render() {
        let pursuitInfoArray = [];
        let feed = [];
        let totalMin = 0;
        if (this.state.pursuits) {
            for (const pursuit of this.state.pursuits) {
                totalMin += pursuit.total_min;
                const hobbyTableData = (
                    <tr key={pursuit.name}>
                        <th key={pursuit.name + " name"}>{pursuit.name}</th>
                        <td key={pursuit.name + " experience"}>{pursuit.experience_level}</td>
                        <td key={pursuit.total_min + "minutes"}>{pursuit.total_min}</td>
                        <td key={pursuit.num_posts + "posts"}>{pursuit.num_posts}</td>
                        <td key={pursuit.num_milestones + " milestones"}>{pursuit.num_milestones}</td>
                    </tr>);
                pursuitInfoArray.push(hobbyTableData);
            }
        }

        if (this.state.feed) {
            for (const feedItem of this.state.feed) {
                feed.push(
                    feedItem.post_format === SHORT ?
                        <ShortPostViewer
                            isOwnProfile={false}
                            profilePhoto={this.props.smallProfilePhoto}
                            username={this.props.username}
                            eventData={this.props.eventData}
                            onDeletePost={this.props.onDeletePost}
                        />
                        :
                        <LongPostViewer
                            username={this.props.username}
                            isOwnProfile={false}
                            eventData={this.props.eventData}
                            onDeletePost={this.props.onDeletePost}
                        />
                )
            }

        }

        //TEST 
        const recentWork = (<RecentWorkObject value="test" onRecentWorkClick={this.handleRecentWorkClick} />);
        return (
            <div id="home-page-container">
                <div className="home-row-container" id="home-profile-row">
                    <div className="home-profile-column-container">

                        <img alt="" className="home-profile-photo" src={this.state.displayPhoto}></img>

                        <div className="home-profile-text">
                            <p>{this.state.username}</p>
                            <p>{this.state.firstName}</p>
                        </div>

                    </div>

                    <div className="home-profile-column-container">
                        <div className="home-profile-text">
                            Total Hours Spent: {Math.floor(totalMin / 60)}
                        </div>
                        <div className="home-profile-text">
                            {}
                        </div>
                    </div>
                    <div className="home-profile-column-container">
                        <table id="profile-info-table">
                            <tbody>
                                <tr>
                                    <th></th>
                                    <th>Level</th>
                                    <th>Minutes Spent</th>
                                    <th>Posts</th>
                                    <th>Milestones</th>
                                </tr>
                                {pursuitInfoArray}
                            </tbody>
                        </table>
                    </div>

                </div>
                <div className="home-works-column-container">
                    <div className="home-works-column-container">
                        <div className="home-works-row-container">
                            <h4>Recent Work</h4>
                            <button onClick={this.handlePursuitClick}>Pursuits</button>
                        </div>
                    </div>
                    <div className="home-works-column-container">
                        <div className="home-works-row-container">
                            {recentWork}
                            {recentWork}
                        </div>
                    </div>

                </div>
                <div className="home-row-container home-works-column-container">
                    <div className="home-works-column-container">
                        <div className="home-works-row-container">
                            <h4>Your Feed</h4>
                        </div>
                    </div>
                    <div className="home-works-column-container">
                        <div id="placeholder-feed">
                            <FeedObject />
                        </div>
                    </div>

                </div>
            </div>
        )
    }
}

const handleCheckUser = () => {
    this.props.firebase.checkIsExistingUser()
}

const condition = authUser => !!authUser && withFirebase(handleCheckUser);
export default withAuthorization(condition)(withFirebase(ReturningUserPage));
