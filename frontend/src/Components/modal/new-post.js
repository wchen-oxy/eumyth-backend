import React, { useState } from 'react';
import './new-post.scss';

const NewPost = (props) => (
  <div className="new-post-container" id="new-post-container">
    <h3>Document Your Progress</h3>
    <div className="vertical-grouping">
      <h4>
        Begin a New Check-In!
  </h4>
      <div className="single-button-container">
        <button value="short" onClick={(e) => props.setWindow(e, e.target.value, true)}>
          New Short
    </button>
      </div>
    </div>

    <div className="vertical-grouping">
      <h4>
        Begin a New Post! (Will Delete Saved data)
  </h4>
      <div className="single-button-container">
        <button value="long" onClick={e => props.setWindow(e, e.target.value, true)}>
          New Entry
    </button>
      </div>
      <div className="single-button-container">
        <button value="long" onClick={e => props.setWindow(e, e.target.value, false)}>
          Continue Previous Draft?
    </button>
      </div>
    </div>

  </div>
  );

export default NewPost;