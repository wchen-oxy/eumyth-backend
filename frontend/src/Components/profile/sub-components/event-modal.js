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

    }
    render() {
        if (!this.props.eventData) return (<></>);
        if (this.state.window === "main") {
            if (this.props.eventData.post_format === "short") {
                console.log(this.props.eventData.image_data.length);

                return (
                    <ShortPostViewer
                        profilePhoto={this.props.smallProfilePhoto}
                        username={this.props.username}
                        images={this.props.eventData.image_data}
                        text={this.props.eventData.text_data}
                    />);
            }
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