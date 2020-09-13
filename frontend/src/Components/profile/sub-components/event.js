import React from 'react';
import './event.scss';

const Event = (props) => {
    const post = props.eventData;
    const content =
        (post.post_format === "short") ?
            (
                post.cover_photo_url ?
                    <img src={post.cover_photo_url} /> :
                    <p className="no-select">{post.text_data.length > 140 ? post.text_data.substring(0, 140) + "..." : post.text_data}</p>
            ) : (
                post.cover_photo_url ?
                    <img src={post.cover_photo_url} /> :
                    <img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"/>
                    // <p className="no-select">{post.text_data.length > 140 ? post.text_data.substring(0, 140) + "..." : post.text_data}</p>
            );


    return (
        <div className="event-container" onClick={() => props.onEventClick(props.eventIndex)}>
            {content}
            <h4>{post.preview_title}</h4>
        </div>
    );
}

export default Event;