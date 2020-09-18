import React from 'react';

const ProfileHeader = (props) => {

    return(
        <div id="header-container">
            <img src={props.profilePhoto} /> 
            <h4>{props.username}</h4>
        </div>
    )

}

export default ProfileHeader;