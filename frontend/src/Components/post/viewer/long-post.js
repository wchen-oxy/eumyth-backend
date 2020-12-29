import React, { useState } from 'react';
import DanteEditor from 'Dante2';
import { ImageBlockConfig } from 'Dante2/package/es/components/blocks/image.js';
import { PlaceholderBlockConfig } from 'Dante2/package/es/components/blocks/placeholder';
import _ from 'lodash';
import { IMAGE_BASE_URL, returnUserImageURL } from '../../constants/urls';
import ReviewPost from "../draft/review-post";
 
const SAVE_INTERVAL = 1000;
const INITIAL = "INITIAL";
const EDIT = "EDIT";
const REVIEW = "REVIEW";
const LONG = "LONG";
const temp = { "blocks": [{ "key": "ck5ad", "text": "hit enter", "type": "header-one", "depth": 0, "inlineStyleRanges": [], "entityRanges": [], "data": {} }], "entityMap": {} };


const LongPostViewer = (props) => {
    const [key, setKey] = useState(0);
    const [window, setWindow] = useState(INITIAL);
    const [localDraft, setLocalDraft] = useState(props.textData);
    const original = props.textData;

    const windowSwitch = (window) => {
        if (window === INITIAL) {
            setLocalDraft(props.textData);
            setKey(key + 1);
        }
        setWindow(window);
    }
    const handleSave = (editorContext, content) => {

    }
    console.log(window);
    console.log(localDraft);
    console.log(typeof (props.textData));


    if (window === INITIAL) {

        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const date = props.eventData.date ? new Date(props.eventData.date) : null;
        console.log(props.eventData);
        // console.log(date.getMonth());
        if (props.largeViewMode) {
            return (
                <div className="long-post-window">
                    <div className="long-editor-container" id="long-editor-buttons">
                        {props.isOwnProfile ? <button onClick={() => windowSwitch(EDIT)}>Edit</button> : <></>}
                        {props.isOwnProfile ? <button onClick={props.onDeletePost}>Remove</button> : <></>}
                    </div>
                    <div id="long-post-stats-container">

                        {props.eventData.is_milestone ? <p>Milestone :)</p> : <></>}
                        {props.eventData.date ? <p>{monthNames[date.getMonth()]} {date.getDate()}, {date.getFullYear()} </p> : <></>}
                        {props.eventData.pursuit_category ? <p>{props.pursuit_category}</p> : <></>}
                        {props.eventData.min_duration ? <p>{props.eventData.min_duration} minutes</p> : <></>}
                    </div>
                    <div className="long-editor-container">
                        < DanteEditor
                            key={key}
                            content={props.textData}
                            read_only={true}
                        />
                    </div>
                </div>
            );
        }
        else {
            return (
                <div className="long-post-feed-object-container" onClick={() => props.openFullModal(props.eventData)}>
                    <div id="long-post-intro-container">
                        {props.eventData.title ? <h2>{props.eventData.title}</h2> : <></>}
                        {props.eventData.subtitle ? <h4>{props.eventData.subtitle}</h4> : <></>}
                        <div className="loading-display-photo">
                            <img src={returnUserImageURL(props.displayPhoto)} />
                        </div>
                        <h4>{props.username}</h4>
                        {props.eventData.cover_photo_key ? <img src={returnUserImageURL(props.eventData.cover_photo_key)} /> : <></>}
                    </div>
                    <div id="long-post-stats-container">
                        {props.eventData.is_milestone ? <p>Milestone :)</p> : <></>}
                        {props.eventData.date ? <p>{monthNames[date.getMonth()]} {date.getDate()}, {date.getFullYear()} </p> : <></>}
                        {props.eventData.pursuit_category ? <p>{props.eventData.pursuit_category}</p> : <></>}
                        {props.eventData.min_duration ? <p>{props.eventData.min_duration} minutes</p> : <></>}
                    </div>
                    <div className="long-editor-container">
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

    else if (window === EDIT) {

        return (
            <div className="long-post-window">
                <div className="long-editor-container" id="long-editor-buttons">
                    {props.isOwnProfile ? <button onClick={() => windowSwitch(INITIAL)}>Cancel Edit</button> : <></>}
                    {props.isOwnProfile ? <button onClick={() => windowSwitch(REVIEW)}>Review</button> : <></>}
                </div>
                <div className="long-editor-container">
                    < DanteEditor
                        key={key}
                        onChange={
                            (editor) => {
                                // const editorState = editor.emitSerializedOutput();
                                setLocalDraft(editor.emitSerializedOutput());
                                // const draftsIdentical = _.isEqual(editorState, this.props.localDraft);
                                // if (!draftsIdentical) {
                                //     console.log(editorState);
                                //     this.props.setLocalDraft(editorState);
                                // }
                            }}
                        content={props.textData}
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
                    // data_storage={
                    //     {
                    //         save_handler: handleSave,
                    //         interval: SAVE_INTERVAL,
                    //         success_handler: this.handleSaveSuccess,
                    //         failure_handler: this.handleSaveError
                    //     }
                    // }
                    />
                </div>
            </div>
        )
    }

    else {
        let rawDate = null;
        let formattedDate = null;
        if (props.eventData.date) {
            rawDate = new Date(props.eventData.date);
            formattedDate = rawDate.getFullYear().toString() + "-" + rawDate.getMonth().toString() + "-" + rawDate.getDate().toString();
        }
        return (
            <ReviewPost

                displayPhoto={props.displayPhoto}
                isPaginated={false}
                textData={localDraft}
                closeModal={props.closeModal}
                postType={LONG}
                setPostStage={setWindow}
                username={props.username}
                preferredPostType={props.preferredPostType}
                pursuits={props.pursuits}
                handlePreferredPostTypeChange={props.handlePreferredPostTypeChange}

                isUpdateToPost={true}
                postId={props.eventData._id}
                isMilestone={props.eventData.is_milestone}
                previewTitle={props.eventData.title}
                previewSubtitle={props.eventData.subtitle}
                coverPhoto={props.eventData.cover_photo_url}
                date={formattedDate}
                min={props.eventData.min_duration}
                selectedPursuit={props.eventData.pursuit_category}

            />
        );
    }

}

export default LongPostViewer;