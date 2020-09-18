import React, { useEffect } from 'react';
import "./event-modal.scss";

const EventModal = (props) => {
    useEffect(() => {
        console.log("Is Mounted")
    },
        []);
    const post = props.eventData;
    if (!post) return (
        <div id="event-modal">
        </div>
    );
    return (
        <div className="small-post-window">
            {post.post_format ?
                (
                    <div className="inner-small-post-container">
                        {post.image_data ?
                            (<div id="event-inner-window-image">
                                <div>
                                    
                                </div>
                            </div>)
                            :
                            (<div id="event-inner-window-no-image">
                            </div>)
                        }
                    </div>
                )
                : (
                    <div className="inner-small-post-container">

                    </div>
                )}
        </div>
    )
}

export default EventModal;