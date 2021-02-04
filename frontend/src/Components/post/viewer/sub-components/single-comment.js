import React, { useState } from "react";
import { returnUserImageURL } from "../../../constants/urls";
import CommentInput from "./comment-input";
import AxiosHelper from "../../../../Axios/axios";
import "./single-comment.scss";

const SingleComment = (props) => {
    const [isReplyBoxToggled, toggleReplyBox] = useState(false);
    const [replyText, setReplyText] = useState("");

    const isReplyTextInvalid = () =>
        replyText.replaceAll("\\s+", "").length === 0 || replyText.length === 0;

    const postReply = () => {
        if (isReplyTextInvalid()) {
            alert("You need to write something");
        }
        else {

            let ancestorArray = props.ancestors;
            ancestorArray.push(props.commentId);
            return AxiosHelper.postReply(
                {
                    postId: props.postId,
                    commenterUsername: props.visitorUsername,
                    ancestors: JSON.stringify(ancestorArray),
                    comment: replyText

                }
            )
                .then((result) => {
                    console.log(result);
                    alert(result);
                    toggleReplyBox(false);
                })
        }
    }

    const cancelTextInput = () => {
        if (isReplyTextInvalid()) {
            setReplyText("");
            return toggleReplyBox(false);
        }
        if (window.confirm("Are you sure you want discard your comment?")) {
            toggleReplyBox(false);
        }
    }

    const renderThreadIndicators = (levels) => {
        let threadIndicatorArray = [];
        for (let i = 0; i < levels; i++)
            threadIndicatorArray.push(
                <div className="singlecomment-thread-indicator"></div>
            )
        return threadIndicatorArray;
    }


    return (
        <div className={props.level > 1 ? "singlecomment-multiple-thread-style" : ""}>
            {props.level > 1 ? (
                <div className="singlecomment-thread-indicator-container">
                    {renderThreadIndicators(props.level - 1)}
                </div>
            ) : null}
            <div className="singlecomment-main-container">
                <div className="singlecomment-header-container">
                    <div className="singlecomment-display-photo-container">
                        <img src={returnUserImageURL(props.displayPhoto)} />
                    </div>
                    <div className="singlecomment-username-container">
                        <p>{props.username}</p>
                    </div>
                </div>
                <div className="singlecomment-body-container">
                    <div className="singlecomment-thread-indicator-container">
                        {renderThreadIndicators(1)}
                    </div>
                    <div className={"singlecomment-main-content-container"}>
                        <div className="singlecomment-comment-container">
                            <p>{props.commentText}</p>
                        </div>
                        <div className="singlecomment-management-container">
                            <button>Upvote</button>
                            <button>Downvote</button>
                            <button onClick={() => toggleReplyBox(!isReplyBoxToggled)}>Reply</button>
                        </div>
                        <div>
                            {isReplyBoxToggled ?
                                <>
                                    <CommentInput
                                        classStyle={""}
                                        minRows={4}
                                        handleTextChange={setReplyText}
                                        commentText={replyText}
                                    />
                                    <button onClick={cancelTextInput}>Cancel</button>
                                    <button onClick={postReply}>Reply</button>
                                </>
                                :
                                <></>
                            }
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default SingleComment;