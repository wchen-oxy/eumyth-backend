import React, { useState } from 'react';
import PostHeader from "./sub-components/post-header";
import Comments from "./comments";

import DanteEditor from 'Dante2';
import { ImageBlockConfig } from 'Dante2/package/es/components/blocks/image.js';
import { PlaceholderBlockConfig } from 'Dante2/package/es/components/blocks/placeholder';
import _ from 'lodash';
import { IMAGE_BASE_URL, returnUserImageURL } from '../../constants/urls';
import { LONG, INITIAL_STATE, EDIT_STATE, REVIEW_STATE, EXPANDED, COLLAPSED } from '../../constants/flags';

import ReviewPost from "../draft/review-post";
import { withFirebase } from "../../../Firebase/index";
import "./long-post.scss";

const SAVE_INTERVAL = 1000;

const temp = { "blocks": [{ "key": "ck5ad", "text": "hit enter", "type": "header-one", "depth": 0, "inlineStyleRanges": [], "entityRanges": [], "data": {} }], "entityMap": {} };


const LongPostViewer = (props) => {
    const [key, setKey] = useState(0);
    const [window, setWindow] = useState(INITIAL_STATE);
    const [localDraft, setLocalDraft] = useState(props.textData);
    const [workingDraft, setWorkingDraft] = useState(props.textData);


    const windowSwitch = (window) => {
        if (window === INITIAL_STATE) {
            setLocalDraft(props.textData);
            setKey(key + 1);
        }
        setWindow(window);
    }

    const handleModalLaunch = () => {
        if (!props.isPostOnlyView) {
            return props.passDataToModal(props.eventData, LONG, props.postIndex)
        }
    }
    const renderComments = (windowType) => {
        if (windowType === EXPANDED) {
            return (
                <Comments
                    postType={LONG}
                    commentIDArray={props.eventData.comments}
                    windowType={windowType}
                    visitorUsername={props.visitorUsername}
                    postId={props.postId}
                    postIndex={props.postIndex}
                    handleCommentInjection={props.handleCommentInjection}
                    selectedPostFeedType={props.selectedPostFeedType}
                />
            );
        }
        else if (windowType === COLLAPSED) {
            return (
                <p>{props.eventData.comment_count} Comments</p>
            )
        }
    }

    if (window === INITIAL_STATE) {

        const monthNames = ["January", "February", "March", "April", "May",
            "June", "July", "August", "September", "October", "November",
            "December"];

        const date = props.eventData.date ? new Date(props.eventData.date) : null;

        const coverPhotoURL = returnUserImageURL(props.eventData.cover_photo_key);
        if (props.largeViewMode) {
            return (
                <div className={props.isPostOnlyView ? "" : "longpostviewer-window"}>
                    <div className="longpostviewer-meta-info-container">
                        <div>
                            {props.eventData.title ?
                                (<div id="longpostviewer-top-title-bar">
                                    <h1 id="longpostviewer-title">
                                        {props.eventData.title}
                                    </h1>
                                    {props.isOwnProfile ? (
                                        <div
                                            className="longpostviewer-button-container">
                                            <button
                                                onClick={() => windowSwitch(EDIT_STATE)}
                                            >
                                                Edit
                                            </button>
                                            <button onClick={props.onDeletePost}>
                                                Remove
                                            </button>
                                        </div>)
                                        :
                                        (<></>)
                                    }
                                </div>
                                )
                                : <></>}
                            {props.eventData.subtitle ? (
                                <h4 id="longpostviewer-subtitle">
                                    {props.eventData.subtitle}
                                </h4>)
                                : (
                                    <></>
                                )}
                            <div className="longpostviewer-author-info-container">
                                <div>
                                    <img className="longpostviewer-display-photo"
                                        src={returnUserImageURL(props.displayPhoto)} />
                                    {props.eventData.date ? (
                                        <p>{monthNames[date.getMonth()]}
                                            {date.getDate() + 1},
                                            {date.getFullYear()}
                                        </p>
                                    ) :
                                        (<></>)
                                    }
                                </div>
                                <div className="longpostviewer-author-info">
                                    <h4>{props.username}</h4>
                                    {props.eventData.pursuit_category ? (
                                        <p>
                                            For {props.eventData.pursuit_category}
                                        </p>)
                                        :
                                        <></>}
                                </div>
                                <div className="longpostviewer-stats-container">
                                    {props.eventData.is_milestone ?
                                        <p>Milestone :)</p> : <></>}
                                    {props.eventData.min_duration ?
                                        <p>
                                            {props.eventData.min_duration} minutes
                                        </p>
                                        :
                                        <></>}
                                </div>
                            </div>
                            <div className="longpostviewer-cover-photo-container">
                                {props.eventData.cover_photo_key ?
                                    <img
                                        alt="cover photo"
                                        className="longpostviewer-cover-photo"
                                        src={coverPhotoURL}
                                    />
                                    :
                                    <></>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="longpostviewer-editor-container">

                        < DanteEditor
                            key={key}
                            content={props.textData}
                            read_only={true}
                        />
                    </div>
                    {renderComments("EXPANDED")}
                </div>
            );
        }
        else {
            return (
                <div onClick={handleModalLaunch}>
                    <PostHeader
                        isOwnProfile={props.isOwnProfile}
                        username={props.username}
                        displayPhoto={props.eventData.display_photo_key}
                    />
                    <div>
                        {props.eventData.title ?
                            <h2>{props.eventData.title}</h2> : <></>}
                        {props.eventData.subtitle ?
                            <h4>{props.eventData.subtitle}</h4> : <></>}
                    </div>
                    <div className="longpostviewer-stats-container">
                        {props.eventData.is_milestone ?
                            <p>Milestone :)</p> : <></>}
                        {props.eventData.date ? (
                            <p>
                                {monthNames[date.getMonth()]}
                                {date.getDate() + 1},
                                {date.getFullYear()}
                            </p>)
                            : <></>}
                        {props.eventData.pursuit_category ?
                            <p>
                                {props.eventData.pursuit_category}
                            </p> : <></>}
                        {props.eventData.min_duration ?
                            <p>
                                {props.eventData.min_duration} minutes
                            </p> : <></>}
                    </div>
                    <div
                        id="longpostviewer-inline-editor-container"
                        className="longpostviewer-editor-container"
                    >
                        {props.eventData.cover_photo_key ?
                            <img
                                alt="cover photo"
                                className="longpostviewer-cover-photo"
                                src={coverPhotoURL}
                            /> : <></>}
                        < DanteEditor
                            key={key}
                            content={props.textData}
                            read_only={true}
                        />
                    </div>
                </div>
            )
        }
    }

    else if (window === EDIT_STATE) {
        console.log("EDIT STATE");
        return (
            <div className="longpostviewer-window">
                <div className="longpostviewer-button-container">
                    {props.isOwnProfile ? <button onClick={() => {
                        setWorkingDraft(props.textData);
                        setLocalDraft(props.textData);
                        windowSwitch(INITIAL_STATE);
                    }}>Cancel Edit</button> : <></>}
                    {props.isOwnProfile ? <button onClick={() => {
                        setWorkingDraft(localDraft);
                        windowSwitch(REVIEW_STATE);
                    }}>Review</button> : <></>}
                </div>
                <div className="longpostviewer-editor-container">
                    < DanteEditor
                        key={key}
                        onChange={
                            (editor) => {
                                setLocalDraft(editor.emitSerializedOutput());
                            }}
                        content={workingDraft}
                        default_wrappers={[
                            { className: 'my-custom-h1', block: 'header-one' },
                            { className: 'my-custom-h2', block: 'header-two' },
                            { className: 'my-custom-h3', block: 'header-three' },
                        ]}
                        widgets={[
                            ImageBlockConfig({
                                options: {
                                    upload_url: IMAGE_BASE_URL,
                                    upload_callback: (ctx, img) => {
                                        console.log(ctx);
                                        console.log(img);
                                        alert('file uploaded: ' +
                                            ctx.data.url);
                                    },
                                    upload_error_callback: (ctx, img) => {
                                        console.log(ctx);
                                        alert("Failed to Upload Image");
                                    },
                                },
                            }),
                            PlaceholderBlockConfig(),
                        ]}
                    />
                </div>
            </div>
        )
    }

    else {
        let formattedDate = null;
        if (props.eventData.date) {
            console.log(props.eventData.date);
            formattedDate = new Date(props.eventData.date).toISOString().substring(0, 10);
        }
        return (
            <ReviewPost
                isUpdateToPost
                previousState={EDIT_STATE}
                displayPhoto={props.displayPhoto}
                isPaginated={false}
                textData={workingDraft}
                closeModal={props.closeModal}
                postType={LONG}
                setPostStage={setWindow}
                username={props.username}
                preferredPostType={props.preferredPostType}
                pursuitNames={props.pursuitNames}
                handlePreferredPostTypeChange={props.handlePreferredPostTypeChange}
                postId={props.eventData._id}
                isMilestone={props.eventData.is_milestone}
                previewTitle={props.eventData.title}
                previewSubtitle={props.eventData.subtitle}
                coverPhoto={props.eventData.cover_photo_url}
                date={formattedDate}
                min={props.eventData.min_duration}
                selectedPursuit={props.eventData.pursuit_category}
                onClick={() => windowSwitch(EDIT_STATE)}

            />
        );
    }

}

export default withFirebase(LongPostViewer);