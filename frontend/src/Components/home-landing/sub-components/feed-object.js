import React from "react";
import "./feed-object.scss";

const FeedObject = (props) => {

    return (
        <div className="feed-object-container">
            <div className="feed-object-row">
                <div id="home-feed-profile-column-container" className="home-feed-profile-column-container">
                    <img className="home-feed-photo" src="https://i.redd.it/73j1cgr028u21.jpg"></img>
                </div>
                <div id="home-feed-profile-column-container" className="home-feed-profile-column-container">
                        <p className="home-feed-no-margin-text">Username</p>
                        <h6 className="home-feed-no-margin-text">William Chen</h6>
                </div>
            </div>
            <div className="feed-object-row">
                
            </div>
        </div>
    )
}

export default FeedObject;