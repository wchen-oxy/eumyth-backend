import React, { useState } from 'react';
import './short-post.scss';

const ReviewPost = (props) => {
return (
    <div className="short-post-container" id="short-post-container">
        <div>
            <h2>Placeholder for short</h2>
            <div id="button-container">
                <span id="toggle-button-span">
                    <button id="toggle-button" value="initial" onClick={e => props.onClick(e, e.target.value)}>Return</button>
                </span>
            </div>
        </div>
        <div className="vertical-grouping">
            <label>Date Completed</label>
            <input type="date"></input>
            <label>Total Minutes</label>
            <input type="number"></input>
            <label>Is Milestone</label>
            <input type="checkbox"></input>
        </div>


    </div>
);
}

export default ReviewPost;