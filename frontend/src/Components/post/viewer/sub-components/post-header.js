import React from 'react';
import "./post-header.scss";

const ShortPostHeader = (props) => {
    console.log(props.isTimeline);
    return (
        <div id="post-header-container">
            <img src={props.displayPhoto} />
            <h4>{props.username}</h4>
            {props.isOwnProfile ? <button onClick={props.onDeletePost}>Remove</button> : <></>}
            {props.isOwnProfile ? <button onClick={() => props.onEditClick("EDIT")}>Edit</button> : <></>}
        </div>
    )

}

export default ShortPostHeader;