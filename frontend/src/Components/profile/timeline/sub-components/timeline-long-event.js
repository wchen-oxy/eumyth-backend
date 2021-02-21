import React from 'react';
import "./timeline-long-event.scss";
import { returnUserImageURL } from "../../../constants/urls";
import { returnFormattedDate } from "../../../constants/ui-text";

const LongEvent = (props) => {
    if (props.post.text_data === undefined) return (<></>);
    const post = props.post;
    const date = post.date ? returnFormattedDate(post.date) : null;
    const previewText = post.text_snippet;
    const coverImage = (
        <img
            alt="Cover Photo"
            className="longevent-cover-photo"
            src={returnUserImageURL(post.cover_photo_key)}
        />);

    return (
        <div>
            <div className={post.cover_photo_key ?
                "longevent-with-cover-photo-container"
                :
                "longevent-no-cover-photo-container"}>
                {post.cover_photo_key ?
                    coverImage : <p>{previewText}</p>
                }
            </div>
            <div className="longevent-text-container">
                <h4 className="longevent-title-container">
                    {post.title ? post.title : post.pursuit_category}
                </h4>
                {post.subtitle ? (
                    <p className="longevent-subtitle-container">
                        {post.subtitle}
                    </p>)
                    : <></>
                }
                {date ? <p>{date.month}, {date.day}, {date.year} </p> : <></>}
                <p>{props.commentCount} Comments</p>
            </div>
        </div>
    );
}

export default LongEvent;