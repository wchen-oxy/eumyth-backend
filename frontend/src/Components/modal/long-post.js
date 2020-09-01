import React, { useState } from 'react';
import LongEditor from "../post/long-editor";
import './long-post.scss';
import ReviewPost from "./review-post";




const LongPost = (props) => {
  const [window, setWindow] = useState("initial");
  const [hasContent, setHasContent] = useState(props.content !== null);
  const [previewTitle, setPreviewTitle] = useState(props.previewTitle);
  if (window === "initial")
    return (
      <div className="long-post-container" id="post-modal">
        <div>
          <h2>Long Entry</h2>
          <div id="button-container">
            <span id="toggle-button-span">
              <button id="toggle-button" value="main" onClick={e => props.handleClick(e, e.target.value, true)}>Return</button>
            </span>
            <span id="post-button-span">
              <button id="post-button" value="review" disabled={!hasContent} onClick={() => setWindow("review")}>Review Post</button>
            </span>
          </div>
        </div>

        <LongEditor
          username={props.username}
          content={props.content}
          hasContent={hasContent}
          setHasContent={setHasContent}
          handlePreviewTitleChange={setPreviewTitle}
        />

      </div>
    );
  else {
    return (
      <ReviewPost 
        previewTitle={previewTitle}
        postType="long" 
        setWindow={setWindow} 
        username={props.username}
        preferredPostType= {props.preferredPostType}
        pursuits = {props.pursuits}
        handlePreferredPostTypeChange = {props.handlePreferredPostTypeChange}

      />
    )
  }
}

export default LongPost;