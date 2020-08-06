import React, { useState } from 'react';
import './short-post.scss';

const ReviewPost = (props) => {
    const [date, setDate] = useState();
    const [min, setMin] = useState();
    const [milestone, setMilestone] = useState(false);
    const [postToPrivate, setToPrivatePost] = useState(false);
    const [postToPublic, setToPublicPost] = useState(false);
    console.log(props.postText);
    if (props.postType === "short")
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
                    <label>Date</label>
                    <input type="date" onChange={(e) => setDate(e.target.value)}></input>
                    <label>Total Minutes</label>
                    <input type="number" onChange={(e) => setMin(e.target.value)}></input>
                    <label>Is Milestone</label>
                    <input type="checkbox" onClick={() => setMilestone(!milestone)}></input>
                </div>

                <div className="vertical-grouping">
                    <label>Post to:</label>
                    <span>
                        Profile:<input type="checkbox" onClick={() => setToPrivatePost(!postToPrivate)}></input>
                    </span>
                    <span>
                        Public Feed:<input type="checkbox" onClick={() => setToPublicPost(!postToPublic)}></input>
                    </span>
                    <button onClick={() => console.log(props.imageArray)}>Post!</button>
                </div>
            </div>
        );
    else{
        return (
            <div className="short-post-container" id="short-post-container">
            <div>
                <h2>Placeholder for Long</h2>
                <div id="button-container">
                    <span id="toggle-button-span">
                        <button id="toggle-button" value="initial" onClick={e => props.setWindow(e.target.value)}>Return</button>
                    </span>
                </div>
            </div>
            <div className="vertical-grouping">
                <label>Date</label>
                <input type="date" onChange={(e) => setDate(e.target.value)}></input>
                <label>Total Minutes</label>
                <input type="number" onChange={(e) => setMin(e.target.value)}></input>
                <label>Is Milestone</label>
                <input type="checkbox" onClick={() => setMilestone(!milestone)}></input>
            </div>

            <div className="vertical-grouping">
                <label>Post to:</label>
                <span>
                    Profile:<input type="checkbox" onClick={() => setToPrivatePost(!postToPrivate)}></input>
                </span>
                <span>
                    Public Feed:<input type="checkbox" onClick={() => setToPublicPost(!postToPublic)}></input>
                </span>
                <button onClick={() => console.log("POST")}>Post!</button>

            </div>
        </div>
        )
    }
}

export default ReviewPost;