import React from 'react';
import "./recent-work-object.scss";

const RecentWorkObject = (props) => (
    <div className="home-works-column-container" value="placeholder url" onClick={(e) => props.onRecentWorkClick(e, props.value)}>
    <div className="home-thumbnail-container">
        <img alt="" className="home-thumbnail" src="https://9tailedkitsune.com/wp-content/uploads/2020/01/Souryo-to-Majiwaru-Shikiyoku-no-Yoru-ni...-800x445.jpg"></img>
    </div>
    <div className="home-profile-text">
       <h6>My Recent work at home!</h6>
    </div>
    </div>
)

export default RecentWorkObject;