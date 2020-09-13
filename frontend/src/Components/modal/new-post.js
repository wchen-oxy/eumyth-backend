import React from 'react';

const NewPost = (props) => {
    const handleClick = (e) => {
        !!props.longDraft ?
        window.confirm("Starting a new Long Post will erase your saved draft. Continue anyway?") &&
        props.onClick(e, e.target.value) : props.onClick(e, e.target.value);
    }
    return(
    <div className="small-post-window">
        <div className="inner-small-post-container post-button-container">
            <h3>Document Your Progress</h3>
            <h4>Begin a New Check-In!</h4>
            <button value="short" onClick={(e) => props.onClick(e, e.target.value)}> New Short</button>
            <h4> Begin a New Post! (Will Delete Saved data)</h4>
            <button value="newLong" onClick={(e) => handleClick(e)}>New Entry </button>
            <button value="oldLong" onClick={e => props.onClick(e, e.target.value)}>Continue Previous Draft?</button>
        </div>
    </div>
)}

export default NewPost;