import React from 'react';
import { returnUserImageURL } from "../../../constants/urls";


const ProjectEvent = (props) => {
    const post = props.post;
    return (
        <div>
            <div className="event-cover-container">
                {post.cover_photo_key ?
                    <img
                        alt="event cover photo"
                        className="event-cover-photo"
                        src={returnUserImageURL(post.cover_photo_key)}
                    />
                    : <p className="no-select"></p>
                }
            </div>
            <h4 className="event-title-container">
                {post.title ? post.title : post.pursuit_category}
            </h4>
            {post.overview ?
                <h6 className="event-overview-container">{post.overview}</h6>
                : <></>
            }
        </div>
    );
}

export default ProjectEvent;