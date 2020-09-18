import React from 'react';
import ProfileHeader from "./sub-components/post-header"
import ShortHeroText from "./sub-components/short-text";

const ShortPostViewer = (props) => {

    //text only
    if (props.images.length === 0) return (
        <div>
            <div className="short-viewer-hero-container">
                <ShortHeroText text={props.text}/>
            </div>
            <div className="short-viewer-side-container">
                <ProfileHeader username={props.username} profilePhoto={props.profilePhoto} />

            </div>

        </div>
    );

    //with images
    else {
        return (
            <div>
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