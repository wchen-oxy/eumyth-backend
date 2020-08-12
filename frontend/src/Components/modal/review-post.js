import React, { useState } from 'react';
import AxiosHelper from '../../Axios/axios';
import './short-post.scss';

const ReviewPost = (props) => {
    const [date, setDate] = useState();
    const [min, setMin] = useState();
    const [milestone, setMilestone] = useState(false);
    const [postToPrivate, setToPrivatePost] = useState(false);
    const [postToPublic, setToPublicPost] = useState(false);

    const handlePostSubmit = (e, postType) => {
        e.preventDefault();
        console.log(props.imageArray);
        if (postType === "short") AxiosHelper.createPost("short", props.postText, props.imageArray, date, min, milestone);
        else{
            AxiosHelper.createPost("long", props.postText, props.imageArray, date, min, milestone);
        }
    }

    const metaData = (
        <div className="vertical-grouping">
            <label>Date</label>
            <input type="date" onChange={(e) => setDate(e.target.value)}></input>
            <label>Total Minutes</label>
            <input type="number" onChange={(e) => setMin(e.target.value)}></input>
            <label>Is Milestone</label>
            <input type="checkbox" onClick={() => setMilestone(!milestone)}></input>
        </div>
    );
    const postData = (
        <div className="vertical-grouping">
            <span>
                Profile:<input type="checkbox" onClick={() => setToPrivatePost(!postToPrivate)}></input>
            </span>
            <span>
                Public Feed:<input type="checkbox" onClick={() => setToPublicPost(!postToPublic)}></input>
            </span>
        </div>);
    const invalidPostOption = !postToPublic && !postToPrivate;
    const returnToShortButton = (<button id="toggle-button" value="initial" onClick={e => props.onClick(e, e.target.value)}>Return</button>);
    const returnToLongButton = (<button id="toggle-button" value="initial" onClick={e => props.setWindow(e.target.value)}>Return</button>);
    return (
        <div className="short-post-container" id="short-post-container">
            <div>
                {props.postType === "short" ? <h2>Placeholder for short</h2> : <h2>Placeholder for Long</h2>}
                <div id="button-container">
                    <span id="toggle-button-span">
                        {props.postType === "short" ? returnToShortButton : returnToLongButton}
                    </span>
                </div>
            </div>
            {metaData}
            <div className="vertical-grouping">
                <p>Post to:</p>
                {postData}
                <button disabled={invalidPostOption} onClick={(e) => handlePostSubmit(e, props.postType)}>Post!</button>
            </div>
        </div>
    );
}

export default ReviewPost;