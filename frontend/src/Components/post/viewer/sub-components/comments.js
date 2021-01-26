import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import AxiosHelper from '../../../../Axios/axios';
import { EXPANDED, COLLAPSED } from "../../../constants/flags";
import "./comments.scss";

class Comments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            windowType: this.props.windowType,
            previousComments: null,
            commentText: "",

        }
        this.renderComments = this.renderComments.bind(this);
        this.renderCommentInput = this.renderCommentInput.bind(this);
        this.handleCommentTextChange = this.handleCommentTextChange.bind(this);
        this.handleCommentPost = this.handleCommentPost.bind(this);
    }

    componentDidMount() {
        if (this.props.comments.length > 0) {
            AxiosHelper.getComments({
                params: {
                    commentIdArray: JSON.stringify(this.props.comments),
                    viewingMode: this.state.windowType
                }
            })
        }
    }

    handleCommentTextChange(e) {
        this.setState({ commentText: e.target.value })
    }

    handleCommentPost() {
        let payload = {
            commenterUsername: this.props.visitorUsername,
            comment: this.state.commentText,
            postId: this.props.postId,

        };

        const annotationPayload = {
            dataAnnotationId: this.state.data_annotation_id,
            dataAnnotationText: this.state.data_annotation_text,
            geometryAnnotationType: this.state.geometry_annotation_type,
            geometryXCoordinate: this.state.geometry_x_coordinate,
            geometryYCoordinate: this.state.geometry_y_coordinate,
            geometryWidth: this.state.geometry_width,
            geometryHeight: this.state.geometry_height
        };

        if (this.state.data_annotation_id) Object.assign(payload, ...annotationPayload);

        AxiosHelper
            .postComment(payload)
            .then(
                (result) => {

                })

    }

    //top comment
    //most recent 3
    //see more


    renderComments(viewingMode) {
        if (viewingMode === COLLAPSED) {
            return (
                <div>

                </div>
            )
        }
        else if (viewingMode === EXPANDED) {
            return (
                <div>

                </div>
            )
        }
        else {
            throw new Error("No viewing modes matched");
        }
    }

    renderCommentInput(viewingMode) {
        if (this.props.visitorUsername) {
            return (
                <div className={viewingMode === COLLAPSED ?
                    "comments-collapsed-input-container" : "comments-expanded-input-container"}>
                    <TextareaAutosize
                        className={viewingMode === COLLAPSED ?
                            "comments-collapsed-input" : "comments-expanded-input"}
                        minRows={2}
                        onChange={(e) => this.handleCommentTextChange(e)}
                        value={this.state.commentText}
                    />
                    <button onClick={this.handleCommentPost}>Add Comment</button>
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
                    {this.renderComments(COLLAPSED)}
                    {this.renderCommentInput(COLLAPSED)}
                </div>
            );
        }
        else if (this.state.windowType === EXPANDED) {
            return (
                <div className="comments-main-container">
                    {this.renderCommentInput(EXPANDED)}
                    {this.renderComments(EXPANDED)}
                </div>
            )
        }

    }
}
export default Comments;