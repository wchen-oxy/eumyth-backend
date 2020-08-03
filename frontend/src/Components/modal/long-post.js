import React, { useState } from 'react';
import LongEditor from "../entry/long-editor";
import './long-post.scss';


const handleDisablePost = (disabled) => (
  this.setState({ postDisabled: disabled })
)

const LongPost = (props) => (
  <div className="long-post-container" id="post-modal">
    <h2>Placeholder for Long</h2>
    <LongEditor
      content={props.content}
      disablePost={props.disablePost}
    />

  </div>
  );

export default LongPost;