import React from 'react';
import "./timeline-long-event.scss";
import { returnUserImageURL } from "../../../constants/urls";

const LongEvent = (props) => {

    if (props.post.text_data === undefined) return (<></>);
    const post = props.post;
    const coverImage = <img className="event-cover-photo" src={ returnUserImageURL(post.cover_photo_key)} />;
    const previewText = post.text_snippet;

    return (
        <div>
            <div className="event-cover-container">
                {post.cover_photo_key ? coverImage : <p className="no-select">{previewText}</p>}
            </div>
            <h4 className="event-title-container">{post.title ? post.title : post.pursuit_category}</h4>
            {post.subtitle ? <h6 className="event-subtitle-container">{post.subtitle}</h6> : <></>}
        </div>
    );
}

export default LongEvent;