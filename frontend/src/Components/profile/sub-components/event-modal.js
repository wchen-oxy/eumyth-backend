import React from 'react';
import ShortPostViewer from "../../post-viewer/short-post";
import LongPostViewer from "../../post-viewer/long-post";
import "./event-modal.scss";

class EventModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            window: 'main'
        }
        this.handleWindowChange = this.handleWindowChange.bind(this);

    }
    render() {
        if (this.state.window === "main") {
            if (this.props.eventData.postType === "short")
                return (
                    <ShortPostViewer
                        profilePhoto={this.props.profilePhoto}
                        username={this.props.username}
                        images={this.props.eventData.image_data}
                        text={this.props.eventData.text_data}
                    />);
            else {
                return (<LongPostViewer />)
            }
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