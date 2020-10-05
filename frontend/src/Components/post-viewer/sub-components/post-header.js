import React from 'react';
import "./post-header.scss";

const ProfileHeader = (props) => {

    return(
        <div id="post-header-container">
            <img src={props.profilePhoto} /> 
            <h4>{props.username}</h4>
            <button onClick={() => props.onEditClick("EDIT")}>Edit</button>
        </div>
    )

}

export default ProfileHeader;