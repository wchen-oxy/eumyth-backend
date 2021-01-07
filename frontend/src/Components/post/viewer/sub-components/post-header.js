import React from 'react';
import { returnUserImageURL } from "../../../constants/urls";
import "./post-header.scss";


const EDIT = "EDIT";
const PostHeader = (props) => {
    return (
        <div className="postheader-main-container">
            <div className="postheader-author-information">
                <div className="postheader-display-photo-container">
                    <img src={returnUserImageURL(props.displayPhoto)} />
                </div>
                <h4>{props.username}</h4>
            </div>
            {props.isOwnProfile ? <button onClick={props.onDeletePost}>Remove</button> : <></>}
            {props.isOwnProfile ? <button onClick={() => props.onEditClick(EDIT)}>Edit</button> : <></>}
        </div>
    )

}

export default PostHeader;