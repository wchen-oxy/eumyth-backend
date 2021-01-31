import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import AxiosHelper from '../../../Axios/axios';
import SingleComment from "./sub-components/single-comment";
import CommentInput from "./sub-components/comment-input";
import { EXPANDED, COLLAPSED } from "../../constants/flags";

import "./comments.scss";

class Comments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            windowType: this.props.windowType,
            currentComments: null,
            commentText: "",


        }
        this.renderCommentSectionType = this.renderCommentSectionType.bind(this);
        this.renderCommentInput = this.renderCommentInput.bind(this);
        this.renderCommentThreads = this.renderCommentThreads.bind(this);

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
                            this.setState({ currentComments: this.renderCommentThreads(result.data) });
                        }
                        else {
                            this.setState({ currentComments: [] });
                        }
                    }
                )
        }
    }

    handleCommentTextChange(text) {
        this.setState({ commentText: text })
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



    renderCommentThreads(rawComments) {
        let renderedCommentArray = [];
        for (const rootComment of rawComments) {
            console.log(rootComment);
            renderedCommentArray.push(
                <SingleComment
                    postId={this.props.postId}
                    visitorUsername={this.props.visitorUsername}
                    commentId = {rootComment._id}
                    ancestors={rootComment.ancestor_post_ids}
                    username={rootComment.username}
                    commentText={rootComment.comment}
                    displayPhoto={rootComment.display_photo_key} />);
        }
        return renderedCommentArray;
    }

    renderCommentInput(viewingMode) {
        if (this.props.visitorUsername) {
            return (
                <div className={viewingMode === COLLAPSED ?
                    "comments-collapsed-input-container" : "comments-expanded-input-container"}>
                    <CommentInput
                        classStyle={viewingMode === COLLAPSED ?
                            "comments-collapsed-input" : "comments-expanded-input"}
                        minRows={4}
                        handleTextChange={this.handleCommentTextChange}
                        commentText={this.state.commentText}
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
                    {this.state.currentComments}
                </div>
            );
        }
        else if (this.state.windowType === EXPANDED) {
            return (
                <div className="comments-main-container">
                    {this.renderCommentInput(EXPANDED)}
                    {this.renderCommentSectionType(EXPANDED)}
                    {this.state.currentComments}

                </div>
            )
        }

    }
}
export default Comments;