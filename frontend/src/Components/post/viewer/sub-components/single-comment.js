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


    return (
        <div className="singlecomment-main-contaner">
            <div className="singlecomment-header-container">
                <div className="singlecomment-display-photo-container">
                    <img src={returnUserImageURL(props.displayPhoto)} />
                </div>
                <div className="singlecomment-username-container">
                    <p>{props.username}</p>
                </div>
            </div>
            <div className="singlecomment-content-container">
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
    );
}

export default SingleComment;