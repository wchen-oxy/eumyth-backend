import React, { useState } from 'react';
import AxiosHelper from '../../../Axios/axios';
import _ from 'lodash';
import TextareaAutosize from 'react-textarea-autosize';
import { PUBLIC_FEED, PERSONAL_PAGE, PRIVATE } from "../../constants/flags";

const INITIAL = "INITIAL";
const LONG = "LONG";
const SHORT = "SHORT";

const ReviewPost = (props) => {
    const [date, setDate] = useState(props.date);
    const [minDuration, setMinDuration] = useState(null);
    const [milestone, setMilestone] = useState(props.isMilestone);
    const [title, setTitle] = useState(props.previewTitle);
    const [subtitle, setSubtitle] = useState('');
    const [postPrivacyType, setPostPrivacyType] = useState(props.preferredPostType);
    const [pursuitCategory, setPursuitCategory] = useState(props.selectedPursuit ? props.selectedPursuit : null)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [coverPhoto, setCover] = useState(null);

    const handlePostSubmit = () => {
        setLoading(true);
        let formData = new FormData();
        formData.append("displayPhoto", props.displayPhoto);
        formData.append("postType", props.postType);
        formData.append("username", props.username);
        formData.append("isPaginated", props.isPaginated);
        formData.append("isMilestone", milestone ? milestone : false)
        if (title) formData.append("title", _.trim(title));
        if (subtitle) {
            console.log("VALID");
            formData.append("subtitle", _.trim(subtitle));
        }
        if (postPrivacyType) formData.append("postPrivacyType", postPrivacyType);
        if (pursuitCategory) formData.append("pursuitCategory", pursuitCategory)
        if (date) formData.append("date", date);
        if (minDuration) formData.append("minDuration", minDuration);
        if (props.textData) formData.append("textData", props.postType === SHORT ? props.textData : JSON.stringify(props.textData));
        if (coverPhoto) formData.append("coverPhoto", coverPhoto);
        if (props.imageArray && props.imageArray.length > 0) {
            for (const image of props.imageArray) {
                formData.append("images", image);
            }
        }

        if (props.isUpdateToPost) {
            console.log(JSON.stringify(props.textData));
            if (props.postId) formData.append("postId", props.postId);
            return AxiosHelper.updatePost(formData)
                .then(
                    (result) => {
                        result.status === 200 ? handleSuccess() : handleError();
                    }
                );
        }
        else {
            return AxiosHelper.createPost(formData)
                .then(
                    (result) => {
                        result.status === 201 ? handleSuccess() : handleError();
                    }
                );
        }
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
    for (const pursuit of props.pursuitNames) {
        pursuitSelects.push(
            <option key={pursuit} value={pursuit}>{pursuit}</option>
        );
    }

    const returnToShortButton = (<button id="toggle-button" value={INITIAL} onClick={e => props.onClick(e.target.value)}>Return</button>);
    const returnToLongButton = (<button id="toggle-button" value={INITIAL} onClick={e => props.setPostStage(e.target.value, false)}>Return</button>);

    return (
        <div className="small-post-window">
            <div className="inner-small-post-container post-button-container">
                <div>
                    {props.postType === SHORT ? <h2>Placeholder for short</h2> : <h2>Placeholder for Long</h2>}
                    <div id="button-container">
                        <span id="toggle-button-span">
                            {props.postType === SHORT ? returnToShortButton : returnToLongButton}
                        </span>
                    </div>
                </div>
                <div className="post-button-container">
                    <label>Preview Title</label>
                    <TextareaAutosize name="title" id='review-post-text' placeholder='Create an Optional Preview Title Text' value={title ? title : null} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
                    {props.postType === LONG ? <TextareaAutosize name="subtitle" id='review-post-text' placeholder='Create an Optional Description' onChange={(e) => setSubtitle(e.target.value)} maxLength={140} /> : <></>}
                    {props.coverPhoto ? <label>Upload New Cover Photo?</label> : <label>Upload a Cover Photo</label>}
                    <input type="file" onChange={(e) => {
                        setCover(e.target.files[0]);
                    }}></input>
                    <label>Date</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)}></input>
                    <label>Pursuit</label>
                    <select name="pursuit-category" value={pursuitCategory} onChange={(e) => setPursuitCategory(e.target.value)}>
                        {pursuitSelects}
                    </select>
                    <label>Total Minutes</label>
                    <input type="number" value={props.min} onChange={(e) => setMinDuration(e.target.value)}></input>
                    <label>Is Milestone</label>
                    <input type="checkbox" value={milestone} onClick={() => setMilestone(!milestone)}></input>
                </div>
                <div className="post-button-container">
                    <p>Post to:</p>
                    <div className="post-button-container">
                        <select name="posts" id="cars" value={props.preferredPostType ? props.preferredPostType : PUBLIC_FEED} onChange={(e) => setPostPrivacyType(e.target.value)}>
                            <option value={PRIVATE}>Make post private on your page</option>
                            <option value={PERSONAL_PAGE}>Make post public on your page:</option>
                            <option value={PUBLIC_FEED}>Post to your feed and page</option>
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