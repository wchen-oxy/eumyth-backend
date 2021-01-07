import React from 'react';
import {
    NOT_A_FOLLOWER_STATE,
    FOLLOWED_STATE,
    FOLLOW_REQUESTED_STATE,
    FOLLOW_ACTION,
    UNFOLLOW_ACTION
} from "../../constants/flags";
import {
    FOLLOW_BUTTON_TEXT,
    FOLLOWED_BUTTON_TEXT,
    REQUESTED_BUTTON_TEXT
} from "../../constants/ui-text";

const FollowButtons = (props) => {

    if (!props.followerStatus || props.isOwner) return (<></>);
    else {
        let text = "";
        let isFollowing = true;

        switch (props.followerStatus) {
            case (NOT_A_FOLLOWER_STATE):
                text = FOLLOW_BUTTON_TEXT;
                isFollowing = false;
                break;
            case (FOLLOW_REQUESTED_STATE):
                text = REQUESTED_BUTTON_TEXT;
                break;
            case (FOLLOWED_STATE):
                text = FOLLOWED_BUTTON_TEXT;
                break;
            default:
                break;

        }
        if (isFollowing) return (
            <div>
                <button onClick={() => props.onFollowClick(UNFOLLOW_ACTION)}>{text}</button>
                {/* <button onClick={props.onOptionsClick}>...</button> */}
            </div>
        )
        return (
            <div>
                <button onClick={() => props.onFollowClick(FOLLOW_ACTION)}>{text}</button>
                {/* <button onClick={props.onOptionsClick}>...</button> */}
            </div>
        )
    }
}

export default FollowButtons;