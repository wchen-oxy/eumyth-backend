import React from 'react';
import ShortPostViewer from "./short-post";
import LongPostViewer from "./long-post";

class PostWindowController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            window: 'main'
        }
        this.handleWindowChange = this.handleWindowChange.bind(this);

    }


    render() {
        if (this.state.window === "main") {
            if (this.props.postType === "short")
            return ( <ShortPostViewer text={this.props.post.text_data} />);
            else{
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