import React, { useState } from 'react';
import AxiosHelper from '../../Axios/axios';
import TextareaAutosize from 'react-textarea-autosize';

const ReviewPost = (props) => {
    const [date, setDate] = useState();
    const [minDuration, setMinDuration] = useState();
    const [milestone, setMilestone] = useState(false);
    const [previewTitle, setPreviewTitle] = useState(props.previewTitle);
    const [postPrivacyType, setPostPrivacyType] = useState("public-feed")
    const [postPursuitType, setPursuitType] = useState(null)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [coverPhoto, setCover] = useState(null);

    const handlePostSubmit = (e, postType) => {
        e.preventDefault();
        setLoading(true);
        console.log(props.imageArray);
        AxiosHelper.createPost(
            props.username,
            postType === "short" ? "short" : "long",
            props.postText,
            props.imageArray,
            coverPhoto,
            date,
            minDuration,
            milestone,
            previewTitle,
            postPrivacyType,
            postPursuitType
        ).then(
            (result) => {
                //FIXME add in the listener and response for the new post
                result.status === 201 ? handleSuccess() : handleError();
            }
        );
    }

    const handleSuccess = () => {
        props.closeModal();
    }

    const handleError = () => {
        setLoading(false);
        setError(true);

    }

    const setPursuitTypes = (type) => {
        setPursuitType(type);
    }

    const setPostPrivacyTypes = (type) => {
        setPostPrivacyType(type);
        props.handlePreferredPostTypeChange(type);
    }

    const handlePreviewTitleChange = (previewTitle) => {
        setPreviewTitle(previewTitle);
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

    const returnToShortButton = (<button id="toggle-button" value="initial" onClick={e => props.onClick(e, e.target.value)}>Return</button>);
    const returnToLongButton = (<button id="toggle-button" value="initial" onClick={e => props.setWindow(e.target.value)}>Return</button>);


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
                    <TextareaAutosize name="title" id='review-post-text' placeholder='Create an Optional Preview Title Text' maxRows={2} onChange={(e) => handlePreviewTitleChange(e.target.value)} maxLength={140} />
                    {/* <input type="text" value={props.previewTitle} onChange={(e) => handlePreviewTitleChange(e.target.value)}></input> */}
                    <label>Cover</label>
                    <input type="file" onChange={(e) => {
                        setCover(e.target.files[0]);
                    }}></input>
                    <label>Date</label>
                    <input type="date" onChange={(e) => setDate(e.target.value)}></input>
                    <label>Pursuit</label>
                    <select name="cars" id="cars" onChange={(e) => setPursuitTypes(e.target.value)}>
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
                        <select name="cars" id="cars" value={props.preferredPostType ? props.preferredPostType : "public-feed"} onChange={(e) => setPostPrivacyTypes(e.target.value)}>
                            <option value="private">make post private on your page</option>
                            <option value="personal-page" >make post public on your page:</option>
                            <option value="public-feed" >Post to your feed and page</option>
                        </select>
                    </div>
                    <button onClick={(e) => handlePostSubmit(e, props.postType)}>Post!</button>
                </div>

                {
                    error ?
                        <p>An Error Occured. Please try again. </p> : <></>
                }

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