import React from "react";
import { returnFormattedDate } from "../../../constants/ui-text";

const ShortPostMetaInfo = (props) => {
    const date = props.date ? returnFormattedDate(props.date) : null;
    return (
        <div>
            <div>
                {props.isMilestone ? <p>Milestone :)</p> : <></>}
                {date ? <p>{date.month}, {date.day}, {date.year} </p> : <></>}
                {props.pursuit ? <p>{props.pursuit}</p> : <></>}
                {props.min ? <p>{props.min} minutes</p> : <></>}
            </div>
            <p>{props.isPaginated && props.textData ?
                props.textData[props.index] : props.textData}</p>
        </div>
    )
}

export default ShortPostMetaInfo;