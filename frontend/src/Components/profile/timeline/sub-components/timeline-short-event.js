import React from 'react';

const ShortEvent = (props) => {
    const post = props.post;
    if (!post.cover_photo_url) {
        const intitialText = post.text_snippet;
        const activityType = post.is_milestone ? "MileStone" : "Progress";
            return (
                <div>
                    <div className="event-cover-container no-cover-photo">
                        <p className="no-select">
                            {intitialText}
                        </p>
                    </div>
                    {post.title? <h4>{post.title}</h4> : <></>}
                    {post.pursuit_category ? <h4>{post.pursuit_category} {activityType} </h4> : <></>}
                </div>
            );
        
    }
    else {
        if (!post.title) {
            const activityType = post.is_milestone ? "MileStone" : "Progress";
            return (
                <div>
                    <div className="event-cover-container">
                        <img className="event-cover-photo" src={post.cover_photo_url ? post.cover_photo_url : post.image_data[0]} />
                    </div>
                    {post.pursuit_category ? <h4>{post.pursuit_category} {activityType} </h4> : <></>}
                </div>
            );
        }
        else {
            return (
                <div>
                    <div className="event-cover-container">
                        <img className="event-cover-photo" src={post.cover_photo_url ? post.cover_photo_url : post.image_data[0]} />
                    </div>
                    {post.title ? <h4>{post.title}</h4> : <></>}
                </div>
            );
        }
    }
}

export default ShortEvent;