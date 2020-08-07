import React, { useState } from 'react';
import LongEditor from "../entry/long-editor";
import './long-post.scss';
import ReviewPost from "./review-post";



const handleDisablePost = (disabled) => (
  this.setState({ postDisabled: disabled })
)

const LongPost = (props) => 
{
  const [window, setWindow] = useState("initial");
  const [hasContent, setHasContent] = useState(props.content !== null);
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
            content={props.content}
            // disablePost={props.disablePost}
            hasContent = {hasContent}
            setHasContent = {setHasContent}
          />

        </div>
      );
      else{
        return (
          <ReviewPost  postType="long" setWindow={setWindow}/>
        )
      }
  
    
    
    }
   
export default LongPost;