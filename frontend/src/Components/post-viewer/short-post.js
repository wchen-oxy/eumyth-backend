import React from 'react';
import ProfileHeader from "./sub-components/post-header";
import ShortHeroText from "./sub-components/short-text";
import ShortPostComments from "./sub-components/short-post-comments";
import "./short-post.scss";

const ShortPostViewer = (props) => {
    if (!props.eventData.image_data.length) {
        console.log("wer");
        return (
            <div id="short-post-viewer-container" className="small-post-window">
                <div className="short-viewer-hero-container">
                    <ShortHeroText text={props.eventData.text_data} />
                </div>
                <div className="short-viewer-side-container">
                    <ProfileHeader username={props.username} profilePhoto={props.profilePhoto} />
                    <ShortPostComments
                        isMilestone={props.eventData.is_milestone}
                        date={props.eventData.date}
                        pursuit={props.eventData.pursuit_category}
                        min={props.eventData.min_duration}
                        
                    />
                </div>

            </div>
        );
    }
    //with images
    else {
        return (
            <div id="short-post-viewer-container" className="small-post-window">
                <div className="short-viewer-hero-container">

                </div>
                <div className="short-viewer-side-container">
                    <ProfileHeader username={props.username} profilePhoto={props.profilePhoto} />
                </div>
            </div>
        );
    }
}

export default ShortPostViewer;