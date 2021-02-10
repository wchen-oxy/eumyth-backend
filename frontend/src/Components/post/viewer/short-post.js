import React from 'react';
import PostHeader from './sub-components/post-header';
import ShortHeroText from './sub-components/short-text';
import Comments from "./comments";
import ShortPostMetaInfo from './sub-components/short-post-meta';
import ShortReEditor from '../editor/short-re-editor';
import ReviewPost from "../draft/review-post";
import AxiosHelper from "../../../Axios/axios";
import { returnUserImageURL } from "../../constants/urls";
// import Annotator from "../../image-carousel";
import { EXPANDED, COLLAPSED, SHORT, INITIAL_STATE, EDIT_STATE, REVIEW_STATE } from "../../constants/flags";

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import "../../image-carousel/index.scss";
import "./short-post.scss";
import ImageSlider from '../../image-carousel/index';
import Annotator from "../../image-carousel/annotator";
import CustomImageSlider from '../../image-carousel/custom-image-slider';

class ShortPostViewer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            annotations: [], //finished annotation
            // annotation: {}, //current annotation
            activeAnnotations: [],

            selectedFiles: [],
            validFiles: [],
            unsupportedFiles: [],
            imageIndex: 0,
            textData: this.props.textData,
            date: this.props.eventData.date,
            min: this.props.eventData.min_duration,
            pursuitCategory: this.props.eventData.pursuit_category,
            isPaginated: this.props.eventData.is_paginated,
            isMilestone: this.props.eventData.is_milestone,
            postDisabled: true,
            window: INITIAL_STATE,
        };

        this.onMouseOver = this.onMouseOver.bind(this);
        this.onMouseOut = this.onMouseOut.bind(this);
        this.handleGeneratedAnnotations = this.handleGeneratedAnnotations.bind(this);
        this.handleAnnotationSubmit = this.handleAnnotationSubmit.bind(this);
        this.handleWindowChange = this.handleWindowChange.bind(this);
        this.handleIndexChange = this.handleIndexChange.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handlePaginatedChange = this.handlePaginatedChange.bind(this);
        this.handleModalLaunch = this.handleModalLaunch.bind(this);
        this.renderImageSlider = this.renderImageSlider.bind(this);
        this.renderComments = this.renderComments.bind(this);
    }

    handleGeneratedAnnotations(rawComments) {
        let annotations = [];
        for (const comment of rawComments) {
            if (comment.annotation) annotations.push(JSON.parse(comment.annotation));
        }
        this.setState({ annotations: annotations })
    }

    handleAnnotationSubmit(annotation, imageIndex) {
        const { geometry, data } = annotation;
        // console.log(annotation);
        const id = Math.random();
        this.setState({
            annotations: this.state.annotations.concat({
                geometry,
                data: {
                    ...data,
                    id: id
                }
            })
        })

        const annotationPayload = {
            imagePageNumber: imageIndex,
            annotationData: JSON.stringify(data),
            annotationGeometry: JSON.stringify(geometry),
        };

        AxiosHelper
            .postComment(annotationPayload)
            .then((result) => {

            })

    }

    onMouseOver(id) {
        this.setState({
            activeAnnotations: [
                ...this.state.activeAnnotations,
                id
            ]
        })
    }

    onMouseOut(id) {
        const index = this.state.activeAnnotations.indexOf(id)
        this.setState({
            activeAnnotations: [
                ...this.state.activeAnnotations.slice(0, index),
                ...this.state.activeAnnotations.slice(index + 1)
            ]
        })
    }

    handleWindowChange(newWindow) {
        this.setState({ window: newWindow });
    }

    handleIndexChange(value) {
        this.setState({ imageIndex: value });
    }

    handleTextChange(text) {
        let newText = "";
        if (this.state.isPaginated) {
            newText[this.state.imageIndex] = text;
        }
        else {
            newText = text;
        }
        this.setState({ textData: newText });
    }

    handlePaginatedChange() {
        this.setState((state) => ({ isPaginated: !state.isPaginated }));
    }

    componentWillUnmount() {
        console.log("unmount");
    }

    renderImageSlider() {
        let imageArray = this.props.eventData.image_data.map((key, i) =>
            returnUserImageURL(key)
        );
        // if (imageArray.length === 1) {
        console.log(imageArray[0]);
        return (
            <div className={
                this.props.largeViewMode ?
                    "shortpostviewer-large-hero-container"
                    :
                    "shortpostviewer-inline-hero-container"
            }>
                <CustomImageSlider
                    imageArray={imageArray}
                    annotations={this.state.annotations}
                    activeAnnotations={this.state.activeAnnotations}
                    onAnnotationSubmit={this.handleAnnotationSubmit} />
            </div>)
        // }
        // else {
        //     return (
        //         <div className={
        //             this.props.largeViewMode ?
        //                 "shortpostviewer-large-hero-container"
        //                 :
        //                 "shortpostviewer-inline-hero-container"
        //         }>

        //             <ImageSlider
        //                 annotations={this.state.annotations}
        //                 activeAnnotations={this.state.activeAnnotations}
        //                 onAnnotationSubmit={this.handleAnnotationSubmit}

        //                 onIndexChange={this.handleIndexChange}
        //                 imageArray={imageArray}
        //             />
        //         </div>
        //     );
        // }
    }

    handleModalLaunch() {
        if (!this.props.isPostOnlyView) {
            return this.props.passDataToModal(this.props.eventData, SHORT, this.props.postIndex)
        }
    }

    renderComments(windowType) {
        return (
            <Comments
                postType={SHORT}
                comments={this.props.eventData.comments}
                windowType={windowType}
                visitorUsername={this.props.visitorUsername}
                postId={this.props.postId}
                postIndex={this.props.postIndex}
                handleCommentInjection={this.props.handleCommentInjection}
                selectedPostFeedType={this.props.selectedPostFeedType}

                onGeneratedAnnotations={this.handleGeneratedAnnotations}
                onMouseOver={this.onMouseOver}
                onMouseOut={this.onMouseOut}
            />
        )
    }
    render() {
        if (this.state.window === INITIAL_STATE) {
            if (!this.props.eventData.image_data.length) {
                if (this.props.largeViewMode) {
                    return (
                        <div className="shortpostviewer-window">
                            <div id="shortpostviewer-large-main-container" >
                                <div className="shortpostviewer-large-hero-container">
                                    <ShortHeroText
                                        text={this.props.textData} />
                                </div>
                                <div className="shortpostviewer-large-side-container">
                                    <PostHeader
                                        isOwnProfile={this.props.isOwnProfile}
                                        username={this.props.username}
                                        displayPhoto={this.props.eventData.display_photo_key}
                                        onEditClick={this.handleWindowChange}
                                        onDeletePost={this.props.onDeletePost}
                                    />
                                    <ShortPostMetaInfo
                                        index={this.state.imageIndex}
                                        isPaginated={this.state.isPaginated}
                                        isMilestone={this.state.isMilestone}
                                        date={this.state.date}
                                        pursuit={this.state.pursuitCategory}
                                        min={this.state.min}
                                        textData={null}
                                    />
                                </div>
                            </div>
                            {this.renderComments(EXPANDED)}
                        </div>


                    )
                }
                else {
                    return (
                        <div onClick={this.handleModalLaunch}>

                            <div className="shortpostviewer-inline-main-container" >
                                <div className="shortpostviewer-inline-hero-container">
                                    <PostHeader
                                        isOwnProfile={this.props.isOwnProfile}
                                        username={this.props.username}
                                        displayPhoto={this.props.eventData.display_photo_key}
                                    />
                                    <ShortHeroText
                                        text={this.props.textData} />
                                </div>
                                <div className="shortpostviewer-inline-side-container">
                                    <ShortPostMetaInfo
                                        index={this.state.imageIndex}
                                        isPaginated={this.state.isPaginated}
                                        isMilestone={this.state.isMilestone}
                                        date={this.state.date}
                                        pursuit={this.state.pursuitCategory}
                                        min={this.state.min}
                                        textData={null}
                                    />
                                </div>
                            </div>
                            {/* { this.renderComments(COLLAPSED)} */}
                        </div>
                    )
                }
            }
            //with images
            else {
                if (this.props.largeViewMode) {
                    return (
                        <div className="shortpostviewer-window">

                            <div id="shortpostviewer-large-main-container">
                                {this.renderImageSlider()}
                                <div  >
                                    <PostHeader
                                        isOwnProfile={this.props.isOwnProfile}
                                        username={this.props.username}
                                        displayPhoto={this.props.eventData.display_photo_key}
                                        onEditClick={this.handleWindowChange}
                                        onDeletePost={this.props.onDeletePost}
                                    />
                                    <ShortPostMetaInfo
                                        index={this.state.imageIndex}
                                        isPaginated={this.state.isPaginated}
                                        isMilestone={this.state.isMilestone}
                                        date={this.state.date}
                                        pursuit={this.state.pursuitCategory}
                                        min={this.state.min}
                                        textData={this.state.textData}
                                    />
                                </div>
                            </div>
                            {this.renderComments(EXPANDED)}
                        </div>
                    )
                }
                else {
                    return (
                        <>
                            <div id="shortpostviewer-inline-main-container" >
                                <PostHeader
                                    isOwnProfile={this.props.isOwnProfile}
                                    username={this.props.username}
                                    displayPhoto={this.props.eventData.display_photo_key}
                                />
                                {this.renderImageSlider()}
                                <div className="shortpostviewer-inline-side-container">
                                    <ShortPostMetaInfo
                                        index={this.state.imageIndex}
                                        isPaginated={this.state.isPaginated}
                                        isMilestone={this.state.isMilestone}
                                        date={this.state.date}
                                        pursuit={this.state.pursuitCategory}
                                        min={this.state.min}
                                        textData={this.state.textData}
                                    />
                                </div>
                            </div>
                            {this.renderComments(COLLAPSED)}
                        </>

                    );
                }
            }
        }
        else if (this.state.window === EDIT_STATE) {
            return (
                <div className="shortpostviewer-window" >
                    <div className="shortpostviewer-button-container">
                        <button onClick={() => this.handleWindowChange(INITIAL_STATE)}>Return</button>
                        <button onClick={() => this.handleWindowChange(REVIEW_STATE)}>Review Post</button>

                    </div>
                    <ShortReEditor
                        imageIndex={this.state.imageIndex}
                        eventData={this.props.eventData}
                        textData={this.state.textData}
                        isPaginated={this.state.isPaginated}
                        onIndexChange={this.handleIndexChange}
                        onTextChange={this.handleTextChange}
                        onPaginatedChange={this.handlePaginatedChange}
                    />
                </div>
            )
        }
        else {

            let rawDate = null;
            let formattedDate = null;
            if (this.props.eventData.date) {
                rawDate = new Date(this.props.eventData.date);
                formattedDate =
                    rawDate.getFullYear().toString() +
                    "-" + rawDate.getMonth().toString() +
                    "-" + rawDate.getDate().toString();
            }
            return (
                <ReviewPost
                    isUpdateToPost={true}
                    postId={this.props.eventData._id}
                    displayPhoto={this.props.displayPhoto}
                    isPaginated={this.state.isPaginated}
                    isMilestone={this.props.eventData.is_milestone}
                    previewTitle={this.props.eventData.title}
                    previewSubtitle={this.props.eventData.subtitle}
                    coverPhoto={this.props.eventData.cover_photo_key}
                    date={formattedDate}
                    min={this.props.eventData.min_duration}
                    selectedPursuit={this.props.eventData.pursuit_category}
                    pursuitNames={this.props.pursuitNames}
                    closeModal={this.props.closeModal}
                    postType={SHORT}
                    textData={this.state.textData}
                    username={this.props.username}
                    preferredPostType={this.props.preferredPostType}
                    handlePreferredPostTypeChange={this.handlePreferredPostTypeChange}
                    onClick={this.handleWindowChange}
                />
            );

        }
    }

}

export default ShortPostViewer;