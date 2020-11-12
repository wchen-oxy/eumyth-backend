import React from 'react';
import ShortPostViewer from "../../post/viewer/short-post";
import LongPostViewer from "../../post/viewer/long-post";
import AxiosHelper from '../../../Axios/axios';

const MAIN = "MAIN";
const SHORT = "SHORT";


class EventModal extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            window: MAIN,
            largeViewMode: false,
            // loaded: false
        }
    }

    componentDidMount() {
        this._isMounted = true;

    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        if (!this.props.eventData || !this.props.textData) return (<></>);
        if (this.state.window === MAIN) {
            return (this.props.eventData.post_format === SHORT ?
                <ShortPostViewer
                    displayPhoto={this.props.displayPhoto}
                    username={this.props.username}
                    pursuits={this.props.pursuits}
                    preferredPostType={this.props.preferredPostType}
                    textData={this.props.textData}
                    largeViewMode={this.state.largeViewMode}
                    isOwnProfile={this.props.isOwnProfile}
                    eventData={this.props.eventData}
                    onDeletePost={this.props.onDeletePost} />

                :
                <LongPostViewer
                    displayPhoto={this.props.displayPhoto}
                    username={this.props.username}
                    pursuits={this.props.pursuits}
                    preferredPostType={this.props.preferredPostType}
                    textData={this.props.textData}
                    isOwnProfile={this.props.isOwnProfile}
                    eventData={this.props.eventData}
                    onDeletePost={this.props.onDeletePost} />
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