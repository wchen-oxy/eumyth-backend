import React from 'react';
import "./timeline-long-event.scss";

const LongEvent = (props) => {

    if (props.post.text_data === undefined) return( <></>);
    // console.log(props.post);
    const post = props.post;

    const initialText = JSON.parse(post.text_data).blocks[0].text;
    console.log(initialText);

    const coverImage = <img className="event-cover-photo" src={post.cover_photo_url} />;
    const previewText = initialText.length > 140 ? initialText.substring(0, 140).trim() + "..." : initialText;
    // console.log(initialText);
    // console.log(previewText);
    return (
        <div>
            <div className="event-cover-container">
                {post.cover_photo_url ? coverImage : <p className="no-select">{previewText}</p>}
            </div>
            <h4 className="event-title-container">{post.title ? post.title : post.pursuit_category}</h4>
            {post.subtitle ? <h6 className="event-subtitle-container">{post.subtitle}</h6> : <></> }
        </div>
    );
    // }
}

export default LongEvent;