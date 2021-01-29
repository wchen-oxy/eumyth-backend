import React from 'react';
import TextareaAutosize from "react-textarea-autosize";

const CommentInput = (props) => (
    <TextareaAutosize
        className={props.classStyle}
        minRows={props.minRows}
        onChange={(e) => props.handleTextChange(e.target.value)}
        value={props.commentText}
    />
)
export default CommentInput;