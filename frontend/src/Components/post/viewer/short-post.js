import React from 'react';
import Comments from "./comments";
import PostHeader from './sub-components/post-header';
import ShortHeroText from './sub-components/short-text';
import ShortPostMetaInfo from './sub-components/short-post-meta';
import ShortReEditor from '../editor/short-re-editor';
import ReviewPost from "../draft/review-post";
import AxiosHelper from "../../../Axios/axios";
import CustomImageSlider from '../../image-carousel/custom-image-slider';
import {
    EXPANDED,
    COLLAPSED,
    SHORT,
    INITIAL_STATE,
    EDIT_STATE,
    REVIEW_STATE
} from "../../constants/flags";
import { returnUserImageURL } from "../../constants/urls";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import "../../image-carousel/index.scss";
import "./short-post.scss";

class ShortPostViewer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            annotations: null,
            activeAnnotations: [],
            fullCommentData: [],
            visitorProfilePreviewId: '',
            areAnnotationsHidden: true,
            selectedAnnotationIndex: null,
            imageIndex: 0,
            selectedFiles: [],
            validFiles: [],
            unsupportedFiles: [],
            showPromptOverlay: false,
            textData: this.props.textData,
            date: this.props.eventData.date,
            min: this.props.eventData.min_duration,
            pursuitCategory: this.props.eventData.pursuit_category,
            isPaginated: this.props.eventData.is_paginated,
            isMilestone: this.props.eventData.is_milestone,
            postDisabled: true,
            window: INITIAL_STATE,
        };

        this.heroRef = React.createRef();
        this.toggleAnnotations = this.toggleAnnotations.bind(this);
        this.passAnnotationData = this.passAnnotationData.bind(this);
        this.returnValidAnnotations = this.returnValidAnnotations.bind(this);
        this.renderComments = this.renderComments.bind(this);
        this.renderImageSlider = this.renderImageSlider.bind(this);
        this.handleArrowPress = this.handleArrowPress.bind(this);
        this.handlePromptAnnotation = this.handlePromptAnnotation.bind(this);
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.handleMouseClick = this.handleMouseClick.bind(this);
        this.handleAnnotationSubmit = this.handleAnnotationSubmit.bind(this);
        this.handleWindowChange = this.handleWindowChange.bind(this);
        this.handleIndexChange = this.handleIndexChange.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handlePaginatedChange = this.handlePaginatedChange.bind(this);
        this.handleModalLaunch = this.handleModalLaunch.bind(this);
    }

    componentDidMount() {
        let annotationArray = [];
        for (let i = 0; i < this.props.eventData.image_data.length; i++) {
            annotationArray.push([]);
        }
        this.setState({ annotations: annotationArray });
    }

    toggleAnnotations() {
        if (this.state.areAnnotationsHidden) {
            this.setState(({
                areAnnotationsHidden: false
            }));
        }
        else {
            this.setState(({
                areAnnotationsHidden: true,
                selectedAnnotationIndex: null
            }));
        }
    }

    passAnnotationData(rawComments, visitorProfilePreviewId) {
        let annotations = this.state.annotations;
        if (rawComments) {
            for (const comment of rawComments) {
                if (comment.annotation) {
                    const data = JSON.parse(comment.annotation.data);
                    const geometry = JSON.parse(comment.annotation.geometry);
                    annotations[comment.annotation.image_page_number].push({
                        geometry, data: {
                            ...data,
                            id: comment._id
                        }
                    });
                }
            }
        }
        this.setState({
            fullCommentData: rawComments,
            annotations: annotations,
            visitorProfilePreviewId: visitorProfilePreviewId
        })
    }

    returnValidAnnotations() {
        if (!this.state.annotations) return [];
        else {
            const currentPageAnnotations = this.state.annotations[this.state.imageIndex];
            return (this.state.selectedAnnotationIndex !== null ? (
                [currentPageAnnotations[this.state.selectedAnnotationIndex]]) :
                (currentPageAnnotations));
        }
    }

    renderComments(windowType) {
        if (windowType === EXPANDED) {
            return (
                <Comments
                    postType={SHORT}
                    commentIDArray={this.props.eventData.comments}
                    fullCommentData={this.state.fullCommentData}
                    windowType={windowType}
                    visitorUsername={this.props.visitorUsername}
                    postId={this.props.postId}
                    postIndex={this.props.postIndex}
                    handleCommentInjection={this.props.handleCommentInjection}
                    selectedPostFeedType={this.props.selectedPostFeedType}
                    onPromptAnnotation={this.handlePromptAnnotation}
                    passAnnotationData={this.passAnnotationData}
                    onMouseClick={this.handleMouseClick}
                    onMouseOver={this.handleMouseOver}
                    onMouseOut={this.handleMouseOut}
                />
            );
        }
        else if (windowType === COLLAPSED) {
            return (
                <p>{this.props.eventData.comment_count} Comments</p>
            )
        }
    }

    renderImageSlider(windowType) {
        const validAnnotations = this.returnValidAnnotations();
        const sliderClassName = this.props.largeViewMode ?
            "shortpostviewer-large-hero-image-container" :
            "shortpostviewer-inline-hero-container";

        let imageArray = this.props.eventData.image_data.map((key, i) =>
            returnUserImageURL(key)
        );

        if (!this.state.annotations) {
            return (<></>);
        }

        return (
            <div className={sliderClassName}>
                <CustomImageSlider
                    windowType={windowType}
                    hideAnnotations={this.state.areAnnotationsHidden}
                    imageArray={imageArray}
                    annotations={validAnnotations}
                    activeAnnotations={this.state.activeAnnotations}
                    imageIndex={this.state.imageIndex}
                    showPromptOverlay={this.state.showPromptOverlay}
                    areAnnotationsHidden={this.state.areAnnotationsHidden}
                    onAnnotationSubmit={this.handleAnnotationSubmit}
                    toggleAnnotations={this.toggleAnnotations}
                    handleArrowPress={this.handleArrowPress}
                />
            </div>)
    }

    handleArrowPress(value) {
        const currentIndex = this.state.imageIndex + value;
        if (currentIndex === this.state.annotations.length) {
            return (
                this.setState({
                    imageIndex: 0,
                    selectedAnnotationIndex: null
                }));
        }
        else if (currentIndex === -1) {
            return (
                this.setState({
                    imageIndex: this.state.annotations.length - 1,
                    selectedAnnotationIndex: null
                }));
        }
        else {
            return (
                this.setState(({
                    imageIndex: currentIndex, selectedAnnotationIndex: null
                })));
        }
    }

    handlePromptAnnotation() {
        this.heroRef.current.scrollIntoView({ block: "center" });
        this.setState({ showPromptOverlay: true });
        setTimeout(() => {
            this.setState({ showPromptOverlay: false });
        }, 3000);
    }

    handleMouseOver(id) {
        this.setState({
            activeAnnotations: [
                ...this.state.activeAnnotations,
                id
            ]
        })
    }

    handleMouseOut(id) {
        const index = this.state.activeAnnotations.indexOf(id)
        this.setState({
            activeAnnotations: [
                ...this.state.activeAnnotations.slice(0, index),
                ...this.state.activeAnnotations.slice(index + 1)
            ]
        })
    }

    handleMouseClick(id) {
        let imageIndex = 0;
        for (let array of this.state.annotations) {
            if (array.length > 0) {
                let annotationIndex = 0;
                for (let annotation of array) {
                    if (annotation.data.id === id) {
                        return this.setState({
                            imageIndex: imageIndex,
                            selectedAnnotationIndex: annotationIndex,
                            areAnnotationsHidden: false,
                        },
                            this.heroRef.current.scrollIntoView({
                                block: "center"
                            }))
                    }
                    annotationIndex++;
                }
            }
            imageIndex++;
        }

    }

    handleAnnotationSubmit(annotation) {
        const { geometry, data } = annotation;
        const annotationPayload = {
            postId: this.props.eventData._id,
            visitorProfilePreviewId: this.state.visitorProfilePreviewId,
            imagePageNumber: this.state.imageIndex,
            annotationData: JSON.stringify(data),
            annotationGeometry: JSON.stringify(geometry),
        };

        AxiosHelper
            .postComment(annotationPayload)
            .then((result) => {
                const rootCommentIdArray = result.data.rootCommentIdArray;
                const newRootCommentData = result.data.newRootComment;
                const currentAnnotationArray =
                    this.state
                        .annotations[this.state.imageIndex]
                        .concat({
                            geometry,
                            data: {
                                ...data,
                                id: rootCommentIdArray[0]
                            }
                        });
                let fullAnnotationArray = this.state.annotations;
                let fullCommentData = this.state.fullCommentData;
                fullCommentData.push(newRootCommentData);

                fullAnnotationArray[this.state.imageIndex] =
                    currentAnnotationArray;
                    console.log(newRootCommentData);
                    console.log(fullCommentData);
                return this.setState({
                    annotations: fullAnnotationArray,
                    commentArray: rootCommentIdArray,
                    fullCommentData: fullCommentData
                })
            })
            .catch((err) => {
                console.log(err);
                alert("Sorry, your annotation could not be added.");
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

    handleModalLaunch() {
        if (!this.props.isPostOnlyView) {
            return (this.props.passDataToModal(
                this.props.eventData,
                SHORT,
                this.props.postIndex));
        }
    }

    render() {
        if (this.state.window === INITIAL_STATE) {
            if (!this.props.eventData.image_data.length) {
                if (this.props.largeViewMode) {
                    return (
                        <div className="shortpostviewer-window">
                            <div id="shortpostviewer-large-main-container" >
                                <div className="shortpostviewer-large-hero-text-container">
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
                            {this.renderComments(COLLAPSED)}
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
                                {this.renderImageSlider(EXPANDED)}
                                <div
                                    className="shortpostviewer-large-side-container"
                                    ref={this.heroRef}
                                >
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
                                        textData={this.props.textData}
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
                            <div
                                id="shortpostviewer-inline-main-container"
                                onClick={this.handleModalLaunch}
                            >
                                <PostHeader
                                    isOwnProfile={this.props.isOwnProfile}
                                    username={this.props.username}
                                    displayPhoto={this.props.eventData.display_photo_key}
                                />
                                {this.renderImageSlider(COLLAPSED)}
                                <div className="shortpostviewer-inline-side-container">
                                    <ShortPostMetaInfo
                                        index={this.state.imageIndex}
                                        isPaginated={this.state.isPaginated}
                                        isMilestone={this.state.isMilestone}
                                        date={this.state.date}
                                        pursuit={this.state.pursuitCategory}
                                        min={this.state.min}
                                        textData={this.props.textData}
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
                        <button
                            onClick={() => (this.handleWindowChange(INITIAL_STATE))}>
                            Return
                        </button>
                        <button
                            onClick={() => this.handleWindowChange(REVIEW_STATE)}>
                            Review Post
                        </button>

                    </div>
                    <ShortReEditor
                        imageIndex={this.state.imageIndex}
                        eventData={this.props.eventData}
                        textData={this.props.textData}
                        isPaginated={this.state.isPaginated}
                        onIndexChange={this.handleIndexChange}
                        onTextChange={this.handleTextChange}
                        onPaginatedChange={this.handlePaginatedChange}
                    />
                </div>
            )
        }
        else {
            let formattedDate = null;
            if (this.props.eventData.date) {
                formattedDate =
                    new Date(this.props.eventData.date)
                        .toISOString()
                        .substring(0, 10);
            }
            return (
                <ReviewPost
                    isUpdateToPost
                    previousState={EDIT_STATE}
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
                    textData={this.props.textData}
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