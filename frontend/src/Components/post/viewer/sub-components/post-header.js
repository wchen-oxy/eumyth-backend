import React from 'react';
import "./post-header.scss";
import { returnUserImageURL } from "../../../constants/urls";


const EDIT = "EDIT";
const PostHeader = (props) => {
    return (
        <div className="post-header-container">
            <div className="loading-display-photo">
                <img src={returnUserImageURL(props.displayPhoto)} />
            </div>
            <h4>{props.username}</h4>
            {props.isOwnProfile ? <button onClick={props.onDeletePost}>Remove</button> : <></>}
            {props.isOwnProfile ? <button onClick={() => props.onEditClick(EDIT)}>Edit</button> : <></>}
        </div>
    )

}

export default PostHeader;