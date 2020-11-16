import React from "react";

const ShortPostMetaInfo = (props) => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const date = new Date(props.date);
    console.log(typeof(props.textData));
    return (
        <div>
            <div>
                {props.isMilestone ? <p>Milestone :)</p> : <></>}
                {props.date ? <p>{monthNames[date.getMonth()]} {date.getDate()}, {date.getFullYear()} </p> : <></>}
                {props.pursuit ? <p>{props.pursuit}</p> : <></>}
                {props.min ? <p>{props.min} minutes</p> : <></>}
            </div>
            <p>{props.isPaginated && props.textData ? props.textData[props.index] : props.textData}</p>
        </div>
    )
}

export default ShortPostMetaInfo;