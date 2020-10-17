import React from 'react';
import ShortPostViewer from "../../post/viewer/short-post";
import LongPostViewer from "../../post/viewer/long-post";
import AxiosHelper from '../../../Axios/axios';

class EventModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            window: 'MAIN',
            largeViewMode: false,
        }
    }

    render() {
        if (!this.props.eventData) return (<></>);
        if (this.state.window === "MAIN") {
            return (this.props.eventData.post_format === "SHORT" ?
                <div className="small-post-window">
                    <ShortPostViewer
                        largeViewMode={this.state.largeViewMode}
                        isOwnProfile={this.props.isOwnProfile}
                        eventData={this.props.eventData}
                        onDeletePost={this.props.onDeletePost} />
                </div> :
                <div className="long-post-window">
                    <LongPostViewer
                        // username={this.props.username}
                        isOwnProfile={this.props.isOwnProfile}
                        eventData={this.props.eventData}
                        onDeletePost={this.props.onDeletePost} />
                </div>
            );

        }
        else {
            return (
                <div>

                </div>
            )
        }
    }
}

export default EventModal;