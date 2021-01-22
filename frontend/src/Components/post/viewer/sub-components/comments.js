import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { EXPANDED, COLLAPSED } from "../../../constants/flags";

class Comments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            windowType: this.props.windowType,
        }

        this.renderCommentInput = this.renderCommentInput.bind(this);
    }

    componentDidMount() {

    }

    renderCommentInput(viewingMode) {
        if (this.props.visitorUsername) {
            return (
                <div className="comments-input-container">
                    <TextareaAutosize
                        className={viewingMode === COLLAPSED ?
                            "comments-collapsed-input" : "comments-expanded-input"}
                    />
                    <button onClick>Add Comment</button>
                </div>
            );
        }
        else {
            return (
                <div>
                    <p>You must sign in before you can leave a comment.</p>
                </div>
            )
        }
    }

    render() {
        if (this.state.windowType === COLLAPSED) {
            return (
                <div className="comments-main-container">
                    {this.renderCommentInput(COLLAPSED)}
                </div>
            );
        }
        else if (this.state.windowType === EXPANDED) {
            return (
                <div className="comments-main-container">
                    {this.renderCommentInput(EXPANDED)}
                </div>
            )
        }

    }
}
export default Comments;