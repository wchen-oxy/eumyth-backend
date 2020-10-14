import React from 'react';

const NewPost = (props) => {
    
    const handleClick = (e) => {
        !!props.onlineDraft ?
        window.confirm("Starting a new Long Post will erase your saved draft. Continue anyway?") &&
        props.onPostTypeSet(e.target.value, null) : props.onPostTypeSet(e.target.value, null);
    }
    return(
    <div className="small-post-window">
        <div className="inner-small-post-container post-button-container">
            <h3>Document Your Progress</h3>
            <h4>Begin a New Check-In!</h4>
            <button value="short" onClick={(e) => props.onPostTypeSet(e.target.value, null)}> New Short</button>
            <h4> Begin a New Post! (Will Delete Saved data)</h4>
            <button value="new-long" onClick={(e) => handleClick(e)}>New Entry </button>
            <button value="old-long" onClick={(e)=> props.onPostTypeSet(e.target.value, null)}>Continue Previous Draft?</button>
        </div>
    </div>
)}

export default NewPost;