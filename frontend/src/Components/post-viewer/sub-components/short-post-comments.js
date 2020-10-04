import React from "react";

const ShortPostComments = (props) => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const date = new Date(props.date);
    return (
        <div>
            <div>
                {props.isMilestone ? <p>Milestone :)</p> : <></>}
                {props.date ? <p>{monthNames[date.getMonth()]} {date.getDate()}, {date.getFullYear()} </p> : <></>}
                {props.pursuit ? <p>{props.pursuit}</p> : <></>}
                {props.min ? <p>{props.min}</p> : <></>}
            </div>
            <p>Text Area</p>
        </div>
    )
}

export default ShortPostComments;