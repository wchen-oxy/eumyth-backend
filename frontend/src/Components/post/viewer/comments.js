import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import AxiosHelper from '../../../Axios/axios';
import { EXPANDED, COLLAPSED } from "../../constants/flags";
import "./comments.scss";

class Comments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            windowType: this.props.windowType,
            previousComments: null,
            commentText: "",

        }
        this.renderCommentSectionType = this.renderCommentSectionType.bind(this);
        this.renderCommentInput = this.renderCommentInput.bind(this);
        this.renderCommentThreads = this.renderCommentThreads.bind(this);
        this.renderSingleComment = this.renderSingleComment.bind(this);
        this.handleCommentTextChange = this.handleCommentTextChange.bind(this);
        this.handleCommentPost = this.handleCommentPost.bind(this);
    }

    componentDidMount() {
        console.log(this.props.comments.length);
        if (this.props.comments.length > 0) {
            AxiosHelper.getComments({
                params: {
                    rootCommentIdArray: JSON.stringify(this.props.comments),
                    viewingMode: this.state.windowType
                }
            })
                .then(
                    (result) => {
                        console.log(result);
                        if (result.data) {
                            this.setState({ previousComments: this.renderCommentThreads(result.data) });
                        }
                        else {
                            this.setState({ previousComments: [] });
                        }
                    }
                )
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
            imagePageNumber: 0
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
                    console.log(result);
                })

    }

    //top comment
    //most recent 3
    //see more
    renderCommentSectionType(viewingMode) {
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

    renderSingleComment(comment) {
        let renderedComment = (
            <div className="comments-single-contaner">
                <div className="comments-single-header-container">
                    <div className="comments-display-photo-container">
                        {/* <img src={comment.}/> */}
                    </div>
                    <div className="comments-username">

                    </div>
                </div>

            </div>
        )
    }

    renderCommentThreads(rawComments) {
        //take 
        let commentArray = [];
        for (const rootComment of commentArray) {
            commentArray.push(this.renderSingleComment(rootComment));
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
                    {this.renderCommentSectionType(COLLAPSED)}
                    {this.renderCommentInput(COLLAPSED)}
                </div>
            );
        }
        else if (this.state.windowType === EXPANDED) {
            return (
                <div className="comments-main-container">
                    {this.renderCommentInput(EXPANDED)}
                    {this.renderCommentSectionType(EXPANDED)}
                </div>
            )
        }

    }
}
export default Comments;