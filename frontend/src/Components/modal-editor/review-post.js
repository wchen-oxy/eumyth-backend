import React, { useState } from 'react';
import AxiosHelper from '../../Axios/axios';
import _ from 'lodash';
import TextareaAutosize from 'react-textarea-autosize';

const ReviewPost = (props) => {
    const [date, setDate] = useState(null);
    const [minDuration, setMinDuration] = useState(null);
    const [milestone, setMilestone] = useState(false);
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [postPrivacyType, setPostPrivacyType] = useState("public-feed");
    const [pursuitCategory, setPursuitCategory] = useState(null)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [coverPhoto, setCover] = useState(null);

    const handlePostSubmit = () => {
        setLoading(true);
        console.log(props.imageArray);
        let formData = new FormData();
        formData.append("postType", props.postType);
        formData.append("username", props.username);
        formData.append("isPaginated", props.isPaginated);
        console.log(props.postText);
        console.log(minDuration);
        if (title) formData.append("title", _.trim(title));
        if (subtitle) formData.append("subtitle", _.trim(subtitle));
        if (postPrivacyType) formData.append("postPrivacyType", postPrivacyType);
        if (pursuitCategory) formData.append("pursuitCategory", pursuitCategory)
        if (date) formData.append("date", date);
        if (minDuration) formData.append("minDuration", minDuration);
        if (milestone) formData.append("isMilestone", milestone);
        if (props.postText) formData.append("textData", JSON.stringify(props.postText));
        if (coverPhoto) formData.append("coverPhoto", coverPhoto);
        if (props.imageArray && props.imageArray.length > 0) {
            console.log(props.imageArray);
            for (const image of props.imageArray) {
                formData.append("images", image);
            }
        }

        AxiosHelper.createPost(formData)
            .then(
                (result) => {
                    result.status === 201 ? handleSuccess() : handleError();
                }
            );
    }

    const handleSuccess = () => {
        alert("Post Successful! You will see your post soon.");
        props.closeModal();
    }

    const handleError = () => {
        setLoading(false);
        setError(true);
    }

    let pursuitSelects = [];
    pursuitSelects.push(
        <option value={null}></option>
    )
    for (const pursuit of props.pursuits) {
        pursuitSelects.push(
            <option key={pursuit} value={pursuit}>{pursuit}</option>
        );
    }

    const returnToShortButton = (<button id="toggle-button" value="initial" onClick={e => props.onClick(e.target.value)}>Return</button>);
    const returnToLongButton = (<button id="toggle-button" value="initial" onClick={e => props.setPostStage(e.target.value, false)}>Return</button>);

    return (
        <div className="small-post-window">
            <div className="inner-small-post-container post-button-container">
                <div>
                    {props.postType === "short" ? <h2>Placeholder for short</h2> : <h2>Placeholder for Long</h2>}
                    <div id="button-container">
                        <span id="toggle-button-span">
                            {props.postType === "short" ? returnToShortButton : returnToLongButton}
                        </span>
                    </div>
                </div>
                <div className="post-button-container">
                    <label>Preview Title</label>
                    <TextareaAutosize name="title" id='review-post-text' placeholder='Create an Optional Preview Title Text' onChange={(e) => setTitle(e.target.value)} maxLength={100} />
                    <TextareaAutosize name="subtitle" id='review-post-text' placeholder='Create an Optional Description' onChange={(e) => setSubtitle(e.target.value)} maxLength={140} />
                    <label>Cover</label>
                    <input type="file" onChange={(e) => {
                        setCover(e.target.files[0]);
                    }}></input>
                    <label>Date</label>
                    <input type="date" onChange={(e) => setDate(e.target.value)}></input>
                    <label>Pursuit</label>
                    <select name="pursuit-category" onChange={(e) => setPursuitCategory(e.target.value)}>
                        {pursuitSelects}
                    </select>
                    <label>Total Minutes</label>
                    <input type="number" onChange={(e) => setMinDuration(e.target.value)}></input>
                    <label>Is Milestone</label>
                    <input type="checkbox" onClick={() => setMilestone(!milestone)}></input>
                </div>
                <div className="post-button-container">
                    <p>Post to:</p>
                    <div className="post-button-container">
                        <select name="cars" id="cars" value={props.preferredPostType ? props.preferredPostType : "public-feed"} onChange={(e) => setPostPrivacyType(e.target.value)}>
                            <option value="private">make post private on your page</option>
                            <option value="personal-page" >make post public on your page:</option>
                            <option value="public-feed" >Post to your feed and page</option>
                        </select>
                    </div>
                    <button onClick={(e) => handlePostSubmit()}>Post!</button>
                </div>
                {error ? <p>An Error Occured. Please try again. </p> : <></>}
                {loading ?
                    <div className="short-post-container" id="modal-overlay">
                        <p> Loading...</p>
                    </div> :
                    <></>}
            </div>
        </div>
    );
}

export default ReviewPost;