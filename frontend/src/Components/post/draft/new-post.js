import React from 'react';
import { SHORT, NEW_LONG, OLD_LONG } from "../../constants/flags";
import "./new-post.scss";

const NewPost = (props) => {
    const handleClick = (e) => {
        !!props.onlineDraft ? (
            window.confirm(`Starting a new Long Post will
                            erase your saved draft. Continue anyway?`)
            && props.onPostTypeSet(e.target.value, null)
        ) : (
                props.onPostTypeSet(e.target.value, null));
    }
    return (
        <div id="newpost-window">
            <div className="newpost-button-container">
                <h3>Document Your Progress</h3>
                <h4>Begin a New Check-In!</h4>
                <button
                    value={SHORT}
                    onClick={(e) => props.onPostTypeSet(e.target.value, null)}
                >
                    New Short
                </button>
                <h4> Begin a New Post! (Will Delete Saved data)</h4>
                <button
                    value={NEW_LONG}
                    onClick={(e) => handleClick(e)}
                >
                    New Entry
                </button>
                <button
                    value={OLD_LONG}
                    onClick={(e) => props.onPostTypeSet(e.target.value, null)}
                >
                    Continue Previous Draft?
                     </button>
            </div>
        </div>
    )
}

export default NewPost;