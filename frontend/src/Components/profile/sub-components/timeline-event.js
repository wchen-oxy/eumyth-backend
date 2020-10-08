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
                // post.cover_photo_url ?
                //     <img src={post.cover_photo_url} /> :
                //     (<div>
                //         <img src={post.cover_photo_url}/>
                //         <p className="no-select">{post.text_data.length > 140 ? post.text_data.substring(0, 140) + "..." : post.text_data}</p>
                //     </div>);
            break;
        default:
            
            throw Error("No matching post type: " + post.post_format );
            
    }

    return (
        <div className="event-container" onClick={() => props.onEventClick(props.eventIndex)}>
            {content}
            {/* <h4>{post.preview_title}</h4> */}
        </div>
    );
}

export default Event;