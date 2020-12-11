import React from 'react';
import ShortPostViewer from "../../post/viewer/short-post";
import LongPostViewer from "../../post/viewer/long-post";

const MAIN = "MAIN";
const SHORT = "SHORT";
const LONG = "LONG";
const LARGE_VIEW_MODE = true;

class EventModal extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            window: MAIN,
        }
    }

    componentDidMount() {
        this._isMounted = true;

    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        // if (!this.props.eventData || !this.props.textData) return (<></>);
        if (this.state.window === MAIN) {
            switch (this.props.postType) {
                case (SHORT):
                    return (
                        <ShortPostViewer
                            displayPhoto={this.props.displayPhoto}
                            username={this.props.username}
                            pursuits={this.props.pursuits}
                            preferredPostType={this.props.preferredPostType}
                            textData={this.props.textData}
                            largeViewMode={LARGE_VIEW_MODE}
                            isOwnProfile={this.props.isOwnProfile}
                            eventData={this.props.eventData}
                            onDeletePost={this.props.onDeletePost}
                            closeModal={this.props.closeModal}

                        />);

                case (LONG):
                    return (<LongPostViewer
                        displayPhoto={this.props.displayPhoto}
                        username={this.props.username}
                        pursuits={this.props.pursuits}
                        preferredPostType={this.props.preferredPostType}
                        textData={this.props.textData}
                        isOwnProfile={this.props.isOwnProfile}
                        eventData={this.props.eventData}
                        onDeletePost={this.props.onDeletePost}
                        closeModal={this.props.closeModal}
                    />);

                default:
                    throw new Error("No content type matched in event-modal.js");
            }

        }
        else {
            throw new Error("Nothing matched for post viewer type");
        }
    }
}

export default EventModal;