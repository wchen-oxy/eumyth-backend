import React from "react";

const ShortPostComments = (props) => {

    return (
        <div>
            <div>
                {props.isMilestone ? <p>{props.isMilestone}</p> : <></>}
                {props.date ? <p>{props.date}</p> : <></>}
                {props.pursuit ? <p>{props.pursuit}</p> : <></>}
                {props.min ? <p>{props.min}</p> : <></>}
            </div>
            <p>Text Area</p>
        </div>
    )
}

export default ShortPostComments;