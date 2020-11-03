import React from 'react';
import "./post-header.scss";

const ShortPostHeader = (props) => {
    return (
        <div id="post-header-container">
            <div id="loading-display-photo">
                <img src={props.displayPhoto} />
            </div>
            <h4>{props.username}</h4>
            {props.isOwnProfile ? <button onClick={props.onDeletePost}>Remove</button> : <></>}
            {props.isOwnProfile ? <button onClick={() => props.onEditClick("EDIT")}>Edit</button> : <></>}
        </div>
    )

}

export default ShortPostHeader;