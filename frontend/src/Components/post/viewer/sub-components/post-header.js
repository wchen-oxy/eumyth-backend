import React, { useState } from 'react';
import { returnUserImageURL } from "../../../constants/urls";
import "./post-header.scss";


const EDIT = "EDIT";
const PostHeader = (props) => {
    const [isButtonShowing, setButtonShow] = useState(false);
    const renderButtons = () => {
        const buttonPopUp = isButtonShowing ? (
            <div id="postheader-button-pop-up">
                <button onClick={props.onDeletePost}>Remove</button>
                <button onClick={() => props.onEditClick(EDIT)}>Edit</button>
            </div>
        ) : <></>;

        return (
            <div id="postheader-main-button-container">
                <button onClick={() => setButtonShow(!isButtonShowing)}>...</button>
                {buttonPopUp}
            </div>
        );
    }
    return (
        <div className="postheader-main-container">
            <div className="postheader-author-information">
                <div className="postheader-display-photo-container">
                    <img src={returnUserImageURL(props.displayPhoto)} />
                </div>
                <h4>{props.username}</h4>
            </div>
            {props.isOwnProfile ? renderButtons() : null}
        </div>
    )

}

export default PostHeader;