import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link } from "react-router-dom";
import { withAuthorization } from '../../session';
import { withFirebase } from '../../../Firebase';
import AxiosHelper from '../../../Axios/axios';
import PostViewerController from "../../post/viewer/post-viewer-controller";
import Event from "../../profile/timeline/sub-components/timeline-event";
import { returnUserImageURL, TEMP_PROFILE_PHOTO_URL } from "../../constants/urls";
import { POST, SHORT, RECENT_POSTS, FRIEND_POSTS } from "../../constants/flags";
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
            pursuitNames: null,
            croppedDisplayPhoto: null,
            smallCroppedDisplayPhoto: null,
            indexUserDataId: null,
            fullUserDataId: null,
            preferredPostType: null,

            allPostsIdArray: [],
            hasMore: true,
            fixedDataLoadLength: 4,
            nextOpenPostIndex: 0,
            feedData: [],

            isModalShowing: false,
            selectedEvent: null,
            textData: '',
            recentPosts: null
        }

        this.modalRef = React.createRef();
        this.handlePursuitClick = this.handlePursuitClick.bind(this);
        this.handleRecentWorkClick = this.handleRecentWorkClick.bind(this);
        this.handleEventClick = this.handleEventClick.bind(this);
        this.openModal = this.openModal.bind(this);
        this.createPursuits = this.createPursuits.bind(this);
        this.passDataToModal = this.passDataToModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.handleDeletePost = this.handleDeletePost.bind(this);
        this.fetchNextPosts = this.fetchNextPosts.bind(this);
        this.createFeed = this.createFeed.bind(this);
        this.renderModal = this.renderModal.bind(this);
        this.renderRecentPosts = this.renderRecentPosts.bind(this);
        this.injectComment = this.injectComment.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted && this.state.username) {
            const firebaseName = this.props.firebase.returnName();
            let firstName = firebaseName ? firebaseName.firstName : null;
            let lastName = firebaseName.lastName ? firebaseName.lastName : null;
            let allPostsIdArray = null;
            let preferredPostType = null;
            let croppedDisplayPhoto = "";
            let smallCroppedDisplayPhoto = "";
            let indexUserDataId = null;
            let fullUserDataId = null;
            let pursuits = null;
            let pursuitNames = [];
            let hasMore = null;
            let totalMin = 0;
            let pursuitInfoArray = [];
            return (AxiosHelper
                .returnIndexUser(this.state.username)
                .then(
                    (result) => {
                        const indexUser = result.data;
                        const slicedFeed =
                            result.data.following_feed.slice(
                                this.state.nextOpenPostIndex,
                                this.state.nextOpenPostIndex +
                                this.state.fixedDataLoadLength
                            );
                        allPostsIdArray =
                            indexUser.following_feed;
                        preferredPostType =
                            indexUser.preferred_post_type
                        croppedDisplayPhoto =
                            indexUser.cropped_display_photo_key;
                        smallCroppedDisplayPhoto =
                            indexUser.small_cropped_display_photo_key;
                        indexUserDataId =
                            indexUser._id;
                        fullUserDataId =
                            indexUser.user_profile_id;
                        pursuits =
                            result.data.pursuits;
                        hasMore = (
                            !allPostsIdArray ||
                            allPostsIdArray.length === 0)
                            ? false : true;
                        if (result.data.pursuits) {
                            const pursuitObjects =
                                this.createPursuits(result.data.pursuits);
                            pursuitNames =
                                pursuitObjects.pursuitNames;
                            pursuitInfoArray =
                                pursuitObjects.pursuitInfoArray;
                            totalMin =
                                pursuitObjects.totalMin;
                        }
                        if (hasMore === false) {
                            return AxiosHelper
                                .returnMultiplePosts(
                                    result.data.recent_posts,
                                    false)
                                .then((result) => {
                                    return {
                                        isRecentPostsOnly: true,
                                        recentPosts: result.data.posts
                                    }
                                });
                        }
                        else {
                            return Promise.all([
                                AxiosHelper
                                    .returnMultiplePosts(
                                        result.data.recent_posts,
                                        false),
                                AxiosHelper
                                    .returnMultiplePosts(
                                        slicedFeed,
                                        true)
                            ])
                                .then((results) => {
                                    return {
                                        isRecentPostsOnly: false,
                                        recentPosts: results[0].data.posts,
                                        feedData: results[1].data.posts
                                    }
                                });
                        }

                    })
                .then((result) => {
                    const recentPosts = result.recentPosts.length > 0 ?
                        result.recentPosts : [];
                    const feedData = !result.isRecentPostsOnly ?
                        result.feedData : [];
                    const nextOpenPostIndex =
                        this.state.nextOpenPostIndex +
                        this.state.fixedDataLoadLength;

                    this.setState(
                        ({
                            firstName: firstName,
                            lastName: lastName,
                            allPostsIdArray: allPostsIdArray,
                            preferredPostType: preferredPostType,
                            indexUserDataId: indexUserDataId,
                            fullUserDataId: fullUserDataId,
                            croppedDisplayPhoto: croppedDisplayPhoto,
                            smallCroppedDisplayPhoto: smallCroppedDisplayPhoto,
                            pursuits: pursuits,
                            pursuitNames: pursuitNames,
                            pursuitInfoArray: pursuitInfoArray,
                            totalMin: totalMin,
                            recentPosts: recentPosts,
                            feedData: feedData,
                            nextOpenPostIndex: nextOpenPostIndex,
                            hasMore: hasMore
                        }));
                })
                .catch((err) => {
                    console.log(err);
                    alert("Could Not Load Feed." + err);
                }));
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    renderRecentPosts(data) {
        let postIndex = 0;
        let array = []
        for (const value of data) {
            array.push(
                <Event
                    isRecentEvents={true}
                    index={postIndex}
                    mediaType={POST}
                    key={postIndex}
                    eventData={value}
                    onEventClick={this.handleEventClick}
                />);
            postIndex++;
        }
        return array;
    }

    injectComment(postIndex, rootCommentsArray, feedType) {
        // console.log(postIndex);
        if (feedType === RECENT_POSTS) {
            let recentPosts = this.state.recentPosts;
            recentPosts[postIndex].comments = rootCommentsArray;
            this.setState({ recentPosts: recentPosts });
        }
        else if (feedType === FRIEND_POSTS) {
            let friendPosts = this.state.feedData;
            friendPosts[postIndex].comments = rootCommentsArray;
            this.setState({ feedData: friendPosts })
        }
    }

    createFeed(inputArray) {
        if (!inputArray || inputArray.length === 0) return;
        let masterArray = [];
        let nextOpenPostIndex = this.state.nextOpenPostIndex;
        let index = 0;
        for (const feedItem of inputArray) {

            const preferredPostType = feedItem.username === this.state.username ? (
                this.state.preferredPostType) : (null);
            const textData = feedItem.post_format === SHORT ?
                feedItem.text_data : JSON.parse(feedItem.text_data);
            const onDeletePost = feedItem.username === this.state.username ?
                this.handleDeletePost : null;
            masterArray.push(
                <PostViewerController
                    key={nextOpenPostIndex++}
                    postIndex={index++}
                    postId={feedItem._id}
                    visitorUsername={this.state.username}
                    isOwnProfile={feedItem.username === this.state.username}
                    displayPhoto={feedItem.display_photo_key}
                    preferredPostType={preferredPostType}
                    closeModal={null}
                    pursuitNames={this.state.pursuitNames}
                    username={feedItem.username}
                    eventData={feedItem}
                    textData={textData}
                    onDeletePost={onDeletePost}
                    passDataToModal={this.passDataToModal}
                    largeViewMode={false}
                />);
        }
        return masterArray;

    }

    fetchNextPosts() {
        const newEndIndex = this.state.nextOpenPostIndex +
            this.state.fixedDataLoadLength;
        const slicedPostsArray = this.state.allPostsIdArray.slice(
            this.state.nextOpenPostIndex,
            newEndIndex)
        let hasMore = true;
        if (newEndIndex >= this.state.allPostsIdArray.length) {
            hasMore = false;
        }
        return (AxiosHelper
            .returnMultiplePosts(
                slicedPostsArray,
                false)
            .then((result) => {
                if (result.data) {
                    this.setState((state) => ({
                        feedData: state.feedData.concat(result.data.posts),
                        nextOpenPostIndex: newEndIndex,
                        hasMore: hasMore
                    }))
                }
                else {
                    this.setState({ hasMore: false })
                }
            })
            .catch((error) => {
                console.log(error);
                alert(error);
            }));
    }

    handleDeletePost() {
        return AxiosHelper.deletePost(
            this.state.fullUserDataId,
            this.state.indexUserDataId,
            this.state.selectedEvent._id
        ).then(
            (result) => {
                console.log(result);
                alert(result);
            }
        );
    }

    passDataToModal(data, type, postIndex) {
        const textData = type === SHORT ? data.text_data : JSON.parse(data.text_data)
        this.setState({
            selectedEvent: data,
            textData: textData,
            selectedPostFeedType: FRIEND_POSTS,
            selectedPostIndex: postIndex,
        }, this.openModal())
    }

    openModal() {
        this.modalRef.current.style.display = "block";
        document.body.style.overflow = "hidden";
        this.setState({ isModalShowing: true });

    }

    closeModal() {
        this.modalRef.current.style.display = "none";
        document.body.style.overflow = "visible";
        this.setState({ isModalShowing: false, selectedEvent: null });
    }

    handlePursuitClick(e) {
        e.preventDefault();
        this.props.history.push(this.state.username);
    }

    handleRecentWorkClick(e, value) {
        e.preventDefault();
        alert(value);
    }

    handleEventClick(selectedEvent, postIndex) {
        return (AxiosHelper
            .retrievePost(selectedEvent._id, true)
            .then(
                (result) => {
                    if (this._isMounted) {
                        this.setState({
                            selectedEvent: selectedEvent,
                            selectedPostIndex: postIndex,
                            selectedPostFeedType: RECENT_POSTS,
                            textData: result.data,
                        }, this.openModal());
                    }
                }
            )
            .catch(error => console.log(error)));
    }

    createPursuits(pursuitArray) {
        let pursuitInfoArray = [];
        let pursuitNames = [];
        let totalMin = 0;
        for (const pursuit of pursuitArray) {
            pursuitNames.push(pursuit.name);
            totalMin += pursuit.total_min;
            pursuitInfoArray.push(
                <tr key={pursuit.name}>
                    <th key={pursuit.name + " name"}>
                        {pursuit.name}
                    </th>
                    <td key={pursuit.name + " experience"}>
                        {pursuit.experience_level}
                    </td>
                    <td key={pursuit.total_min + "minutes"}>
                        {pursuit.total_min}
                    </td>
                    <td key={pursuit.num_posts + "posts"}>
                        {pursuit.num_posts}
                    </td>
                    <td key={pursuit.num_milestones + " milestones"}>
                        {pursuit.num_milestones}
                    </td>
                </tr>
            );
        }
        return {
            pursuitNames: pursuitNames,
            pursuitInfoArray: pursuitInfoArray,
            totalMin: totalMin
        }
    }

    renderModal() {
        return (
            <PostViewerController
                largeViewMode={true}
                visitorUsername={this.state.username}
                key={this.state.selectedEvent._id}
                postIndex={this.state.selectedPostIndex}
                isOwnProfile={true}
                isPostOnlyView={false}
                displayPhoto={this.state.smallCroppedDisplayPhoto}
                preferredPostType={this.state.preferredPostType}
                closeModal={this.closeModal}
                pursuitNames={this.state.pursuitNames}
                username={this.state.selectedEvent.username}
                eventData={this.state.selectedEvent}
                selectedPostFeedType={this.state.selectedPostFeedType}
                textData={this.state.textData}
                onDeletePost={this.handleDeletePost}
                handleCommentInjection={this.injectComment}
            />
        );
    }

    render() {
        const renderedFeed = this.state.feedData.length > 0 ?
            this.createFeed(this.state.feedData) : null;
        const imageURL = this.state.croppedDisplayPhoto ? (
            returnUserImageURL(this.state.croppedDisplayPhoto))
            : (
                TEMP_PROFILE_PHOTO_URL);
        const renderedRecentPosts = this.state.recentPosts ?
            this.renderRecentPosts(this.state.recentPosts) : null;
        const renderedModal = this.state.isModalShowing &&
            this.state.selectedEvent ? this.renderModal() : null;
        return (
            <div>
                <div
                    id="returninguser-profile-container"
                    className="returninguser-main-row"
                >
                    <div className="returninguser-profile-column">
                        <img
                            alt=""
                            id="returninguser-profile-photo"
                            src={imageURL}>
                        </img>
                        <div className="returninguser-profile-text-container">
                            <p>{this.state.username}</p>
                            <p>{this.state.firstName}</p>
                        </div>
                    </div>
                    <div className="returninguser-profile-column">
                        <div className="returninguser-profile-text-container">
                            Total Hours Spent: {Math.floor(this.state.totalMin / 60)}
                        </div>
                        <div className="returninguser-profile-text-container">
                            { }
                        </div>
                    </div>
                    <div className="returninguser-profile-column">
                        <table id="returninguser-pursuit-info-table">
                            <tbody>
                                <tr>
                                    <th></th>
                                    <th>Level</th>
                                    <th>Minutes Spent</th>
                                    <th>Posts</th>
                                    <th>Milestones</th>
                                </tr>
                                {this.state.pursuitInfoArray}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div
                    id="returninguser-recent-work-container"
                    className="returninguser-main-row"
                >
                    <div className="returninguser-row">
                        <Link
                            id="returninguser-recent-work-title"
                            className="returninguser-title"
                            to={"/" + this.state.username}
                        >
                            Your Recent Work
                        </Link>
                    </div>
                    <div
                        id="returninguser-recent-posts-container"
                        className="returninguser-row">
                        {renderedRecentPosts}
                    </div>
                </div>
                <div
                    id="returninguser-feed-container"
                    className="returninguser-main-row"
                >
                    <h4 className="returninguser-title">Your Feed</h4>
                    <div id="returninguser-infinite-scroll-container" >
                        <InfiniteScroll
                            dataLength={this.state.nextOpenPostIndex}
                            next={this.fetchNextPosts}
                            hasMore={this.state.hasMore}
                            loader={<h4>Loading...</h4>}
                            endMessage={
                                <p style={{ textAlign: 'center' }}>
                                    <b>Yay! You have seen it all</b>
                                </p>}>
                            {renderedFeed ? (
                                renderedFeed.map((feedItem) =>
                                    <div className="returninguser-feed-object-container">
                                        {feedItem}
                                    </div>
                                )) :
                                null}
                        </InfiniteScroll>
                    </div>
                </div>
                <div className="modal" ref={this.modalRef}>
                    <div
                        className="overlay"
                        onClick={(() => this.closeModal())}
                    >
                    </div>
                    <span className="close" onClick={(() => this.closeModal())}>X</span>
                    {renderedModal}
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
