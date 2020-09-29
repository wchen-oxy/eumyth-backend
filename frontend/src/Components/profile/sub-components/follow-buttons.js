import React from 'react';
import { NOT_A_FOLLOWER_STATE, FOLLOWED_STATE, FOLLOW_REQUESTED_STATE } from "../../constants/flags";
import { FOLLOW_BUTTON_TEXT, REQUESTED_BUTTON_TEXT } from "../../constants/ui-text";

const FollowButtons = (props) => {

    if (!props.followerStatus || props.isOwner) return (<></>);
    else {
        let text = "";
        let isDisabled = true;

        // const followState = 
        switch (props.followerStatus) {
            case (NOT_A_FOLLOWER_STATE):
                text = FOLLOW_BUTTON_TEXT;
                isDisabled = false;
                break;
            case (FOLLOW_REQUESTED_STATE):
                text = REQUESTED_BUTTON_TEXT;
                break;
            case (FOLLOWED_STATE):
                text = FOLLOWED_STATE;
                break;
            default:
                break;

        }
        console.log(props.followerStatus);

        // props.followerStatus === NOT_A_FOLLOWER ? FOLLOW_BUTTON_TEXT : REQUESTED_BUTTON_TEXT
        return (
            <div>
                <button onClick={props.onFollowClick} disabled={isDisabled}>{text}</button>
            </div>
        )
    }
}

export default FollowButtons;