import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { withAuthorization } from '../../session';
import { withFirebase } from '../../../Firebase';
import AxiosHelper from '../../../Axios/axios';
import RecentWorkObject from "./sub-components/recent-work-object";
import FeedObject from "./sub-components/feed-object"
import LongPostViewer from '../../post/viewer/long-post';
import ShortPostViewer from '../../post/viewer/short-post';
// import FeedObject from "./feed-object";
import './returning-user.scss';


class ReturningUserPage extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            username: this.props.firebase.returnUsername(),
            firstName: null,
            lastName: null,
            pursuits: null,
            displayPhoto: "https://i.redd.it/73j1cgr028u21.jpg",
            indexUserData: null,

            allPosts: null,
            hasMore: true,
            fixedDataLoadLength: 4,
            nextOpenPostIndex: 0
        }
        this.handlePursuitClick = this.handlePursuitClick.bind(this);
        this.handleRecentWorkClick = this.handleRecentWorkClick.bind(this);
        this.fetchNextPosts = this.fetchNextPosts.bind(this);

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
                        displayPhoto = result.data.cropped_display_photo;
                        pursuits = result.data.pursuits;
                        return result.data.following_feed;
                    }
                )
                .then(
                    (feed) => {
                        if (!feed || feed.length === 0) return;
                        else if (feed.length < this.state.dataLength) {
                            return AxiosHelper.returnSocialFeedPosts(indexUserData._id, feed.slice(0, feed.length));
                        }
                        else {
                            return AxiosHelper.returnSocialFeedPosts(indexUserData._id, feed.slice(0, this.state.dataLength));
                        }
                    }
                )
                .then(
                    (results) => {
                        this.setState(
                            {
                                allPosts: results ? results.data.feed : null,
                                indexUserData: indexUserData,
                                displayPhoto: displayPhoto,
                                pursuits: pursuits,
                            });
                    }
                )
                .catch((err) => {
                    console.log(err);
                    alert("Could Not Load Feed. Error: " + err);
                })
                ;
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

    fetchNextPosts() {
        console.log("fetch");
        if (this.state.nextOpenPostIndex + this.state.fixedDataLoadLength >= this.state.allPosts.length) {
            console.log("Length of All Posts Exceeded");
            this.setState({ hasMore: false });
        }
        console.log(this.state.allPosts.slice(this.state.nextOpenPostIndex, this.state.nextOpenPostIndex + this.state.fixedDataLoadLength));
        return AxiosHelper.returnMultiplePosts(
            this.props.targetProfileId,
            this.state.allPosts.slice(this.state.nextOpenPostIndex, this.state.nextOpenPostIndex + this.state.fixedDataLoadLength))
            .then(
                (result) => {
                    console.log(result.data);
                    if (this._isMounted) this.createTimelineRow(result.data);
                }
            )
            .catch((error) => console.log(error));

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

        //TEST 
        const recentWork = (<RecentWorkObject value="test" onRecentWorkClick={this.handleRecentWorkClick} />);
        return (
            <div >
                <div className="home-row-container flex-display">
                    <div className="home-profile-column-container">
                        <img alt="" id="home-profile-photo" src={this.state.displayPhoto}></img>
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
                            { }
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
                <div className="flex-display flex-direction-column">
                    <div className="flex-display">
                        <div className="flex-display">
                            <h4>Recent Work</h4>
                            <button onClick={this.handlePursuitClick}>Pursuits</button>
                        </div>
                    </div>
                    <div className="flex-display flex-direction-column">
                        <div className="flex-display">
                            {recentWork}
                            {recentWork}
                        </div>
                    </div>
                </div>
                <div className="home-row-container flex-display flex-direction-column">

                    <h4>Your Feed</h4>
                    <div id="feed-container" className="flex-display flex-direction-column">

                        {/* {feed} */}

                        {this.state.allPosts ?
                            <InfiniteScroll
                                dataLength={this.state.nextOpenPostIndex}
                                next={this.fetchNextPosts}
                                hasMore={this.state.hasMore}
                                loader={<h4>Loading...</h4>}
                                endMessage={
                                    <p style={{ textAlign: 'center' }}>
                                        <b>Yay! You have seen it all</b>
                                    </p>
                                }>
                                {
                                    this.state.allPosts.map((feedItem, index) =>
                                        <div className="feed-object-container">
                                            <FeedObject feedItem={feedItem} key={index} />
                                        </div>

                                    )
                                }

                            </InfiniteScroll>
                            : <></>}
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
