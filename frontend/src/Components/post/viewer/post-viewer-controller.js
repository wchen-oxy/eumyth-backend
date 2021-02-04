import React from 'react';
import ShortPostViewer from "./short-post";
import LongPostViewer from "./long-post";
import { SHORT, LONG } from "../../constants/flags";
import { withFirebase } from "../../../Firebase/index";

class PostViewerController extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        const isOwnProfile = this.props.eventData.username === this.props.firebase.returnUsername();
        console.log(this.props.visitorUsername);

        switch (this.props.eventData.post_format) {
            case (SHORT):
                return (
                    <ShortPostViewer
                        postId={this.props.eventData._id}
                        displayPhoto={this.props.displayPhoto}
                        username={this.props.username}
                        visitorUsername={this.props.visitorUsername}
                        pursuitNames={this.props.pursuitNames}
                        preferredPostType={this.props.preferredPostType}
                        textData={this.props.textData}
                        largeViewMode={this.props.largeViewMode}
                        isOwnProfile={isOwnProfile}
                        isPostOnlyView={this.props.isPostOnlyView}
                        eventData={this.props.eventData}
                        onDeletePost={this.props.onDeletePost}
                        closeModal={this.props.closeModal}

                    />);

            case (LONG):
                return (
                    <LongPostViewer
                        postId={this.props.eventData._id}
                        displayPhoto={this.props.displayPhoto}
                        username={this.props.username}
                        visitorUsername={this.props.visitorUsername}
                        pursuitNames={this.props.pursuitNames}
                        preferredPostType={this.props.preferredPostType}
                        largeViewMode={this.props.largeViewMode}
                        textData={this.props.textData}
                        isOwnProfile={isOwnProfile}
                        isPostOnlyView={this.props.isPostOnlyView}
                        eventData={this.props.eventData}
                        onDeletePost={this.props.onDeletePost}
                        closeModal={this.props.closeModal}
                        openLongPostModal={this.props.openLongPostModal}
                    />
                );

            default:
                throw new Error("No content type matched in event-modal.js");
        }

    }
}

export default withFirebase(PostViewerController);