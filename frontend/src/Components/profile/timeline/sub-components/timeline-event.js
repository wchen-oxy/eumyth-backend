import React from 'react';
import ShortEvent from "./timeline-short-event";
import LongEvent from "./timeline-long-event";
import ProjectEvent from "./timeline-project-event";
import './timeline-event.scss';

const POST = "POST";

const Event = (props) => {
    const post = props.eventData;
    let content = null;
    if (props.mediaType === POST) {
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
    }
    else{
        content = <ProjectEvent post={props.eventData}/>
    }

    return (
        <div className="event-container" unselectable="on"
        >
            <div onClick={props.disableModalPreview ? () => console.log("Selected") : () => props.onEventClick(props.eventData)}>
                {content}
            </div>
            {props.newProjectView ? <input type="checkbox" defaultChecked={props.isSelected} onClick={(e) => props.onProjectEventSelect(props.eventData, e.target.value)} /> : <></>}
        </div>
    );
}

export default Event;