import React from 'react';
import ShortPostViewer from "./short-post";
import LongPostViewer from "./long-post";

const MAIN = "MAIN";
const SHORT = "SHORT";
const LONG = "LONG";
const LARGE_VIEW_MODE = true;

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

        switch (this.props.postType) {
            case (SHORT):
                return (
                    <ShortPostViewer
                        displayPhoto={this.props.displayPhoto}
                        username={this.props.username}
                        pursuits={this.props.pursuits}
                        preferredPostType={this.props.preferredPostType}
                        textData={this.props.textData}
                        largeViewMode={this.props.largeViewMode}
                        isOwnProfile={this.props.isOwnProfile}
                        eventData={this.props.eventData}
                        onDeletePost={this.props.onDeletePost}
                        closeModal={this.props.closeModal}

                    />);

            case (LONG):
                return (
                    <LongPostViewer
                        displayPhoto={this.props.displayPhoto}
                        username={this.props.username}
                        pursuits={this.props.pursuits}
                        preferredPostType={this.props.preferredPostType}
                        largeViewMode={this.props.largeViewMode}

                        textData={this.props.textData}
                        isOwnProfile={this.props.isOwnProfile}
                        eventData={this.props.eventData}
                        onDeletePost={this.props.onDeletePost}
                        closeModal={this.props.closeModal}
                    />
                );

            default:
                throw new Error("No content type matched in event-modal.js");
        }

    }
}

export default PostViewerController;