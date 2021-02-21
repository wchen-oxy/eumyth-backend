import React from 'react';
import { returnUserImageURL } from "../../../constants/urls";
import { returnFormattedDate } from "../../../constants/ui-text";
import "./timeline-short-event.scss";

const ShortEvent = (props) => {
    const post = props.post;
    const date = post.date ? returnFormattedDate(post.date) : null;
    if (!post.cover_photo_key) {
        const intitialText = post.text_snippet;
        const activityType = post.is_milestone ? "MileStone" : "Progress";
        return (
            <div>
                <div className="shortevent-no-cover-photo-container">
                    <p className="shortevent-cover">{intitialText}</p>
                </div>
                <div className="shortevent-text-container">
                    {post.title ? <h4>{post.title}</h4> : <></>}
                    {post.pursuit_category ?
                        <p>{post.pursuit_category} {activityType}</p>
                        : <></>
                    }
                    {date ? <p>{date.month}, {date.day}, {date.year} </p>
                        : <></>
                    }
                    <p>{props.commentCount} Comments</p>
                </div>


            </div>
        );

    }
    else {
        const activityType = post.is_milestone ? "MileStone" : "Progress";
        return (
            <div>
                <div className="shortevent-with-cover-photo-container">
                    <img
                        alt="short event cover photo"
                        className="shortevent-cover-photo"
                        src={
                            post.cover_photo_key ?
                                returnUserImageURL(post.cover_photo_key) :
                                returnUserImageURL(post.image_data[0])
                        } />
                </div>
                <div className="shortevent-text-container">
                    {post.title ? <h4>{post.title}</h4> : <></>}
                    {post.pursuit_category ?
                        <h4>{post.pursuit_category} {activityType} </h4>
                        : <></>
                    }
                    <p>{props.commentCount} Comments</p>
                </div>


            </div>
        );
    }
}

export default ShortEvent;