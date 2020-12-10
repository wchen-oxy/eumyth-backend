import React from 'react';

const ProjectEvent = (props) => {
    const post = props.post;


    return (
        <div>
            <div className="event-cover-container">
                {post.cover_photo_url ? <img className="event-cover-photo" src={post.cover_photo_url} /> : <p className="no-select"></p>}
            </div>
            <h4 className="event-title-container">{post.title ? post.title : post.pursuit_category}</h4>
            {post.subtitle ? <h6 className="event-subtitle-container">{post.subtitle}</h6> : <></>}
        </div>
    );
}

export default ProjectEvent;