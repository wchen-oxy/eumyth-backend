import React, { useState } from 'react';
import LongEditor from "../entry/long-editor";
import './long-post.scss';


const handleDisablePost = (disabled) => (
  this.setState({ postDisabled: disabled })
)

const LongPost = (props) => 
{
  const [postDisabled, setDisablePost] = useState(true);
return (
  <div className="long-post-container" id="post-modal">
    <div>
      <h2>Long Entry</h2>
      <div id="button-container">
        <span id="toggle-button-span">
          <button id="toggle-button" value="main" onClick={e => props.handleClick(e, e.target.value)}>Return</button>
        </span>
        <span id="post-button-span">
          <button id="post-button" value="review" disabled={props.text}>Review Post</button>
        </span>
      </div>
    </div>

    <LongEditor
      content={props.content}
      disablePost={props.disablePost}
    />

  </div>
);}

export default LongPost;