import React from 'react';
import ShortEvent from "./timeline-short-event";
import LongEvent from "./timeline-long-event";
import './timeline-event.scss';

const Event = (props) => {
    const post = props.eventData;
    let content = null;
    switch (post.post_format) {
        case ("SHORT"):
            content = <ShortEvent post={props.eventData} />
            break;
        case ("LONG"):
            content = <LongEvent post={props.eventData} />
            break;
        default:

            throw Error("No matching post type: " + post.post_format);

    }

    return (
        <div className="event-container" >
            <div onClick={props.disableModalPreview ? () => console.log("Selected") : () => props.onEventClick(props.eventData)}>
                {content}
            </div>
            {props.newProjectView ? <input type="checkbox" onClick={(e) => props.onProjectEventSelect(props.eventData, e.target.value)}/> : <></>}
        </div>
    );
}

export default Event;