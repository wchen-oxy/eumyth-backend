import React, { useState } from 'react';
import AxiosHelper from '../../Axios/axios';
import './short-post.scss';

const ReviewPost = (props) => {
    const [date, setDate] = useState();
    const [min, setMin] = useState();
    const [milestone, setMilestone] = useState(false);
    const [previewTitle, setPreviewTitle] = useState(props.previewTitle);
    const [postPrivacyType, setPostPrivacyType] = useState("public-feed")
    const [coverPhoto, setCover] = useState();

    const handlePostSubmit = (e, postType) => {
        e.preventDefault();
        console.log(props.imageArray);
        AxiosHelper.createPost(
            props.username,
            postType === "short" ? "short" : "long",
            props.postText,
            props.imageArray,
            coverPhoto,
            date,
            min,
            milestone,
            previewTitle,
            postPrivacyType
        );

    }

    const setPostPrivacyTypes = (type) => {
        setPostPrivacyType(type);
        props.handlePreferredPostTypeChange(type);
    }

    const metaData = (
        <div className="vertical-grouping">
            <label>Preview Title</label>
            <input type="text" onChange={(e) => setPreviewTitle(e.target.value)}></input>
            <label>Cover</label>
            <input type="file" onChange={(e) => setCover(e.target.value)}></input>
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
            <select name="cars" id="cars" value={props.preferredPostType ? props.preferredPostType : "public-feed"} onChange={(e) => setPostPrivacyTypes(e.target.value)}>
                <option value="private">make post private on your page</option>
                <option value="personal-page" selected>make post public on your page:</option>
                <option value="public-feed">Post to your feed and page</option>
            </select>
        </div>);
   
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
                <button onClick={(e) => handlePostSubmit(e, props.postType)}>Post!</button>
            </div>
        </div>
    );
}

export default ReviewPost;