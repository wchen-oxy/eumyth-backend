import React from 'react';
import Slider from 'react-slick';
import PostHeader from './sub-components/post-header';
import ShortHeroText from './sub-components/short-text';
import ShortPostMetaInfo from './sub-components/short-post-meta';
import ShortReEditor from '../editor/short-re-editor';
import Arrow from "../../image-carousel/arrow";
import ReviewPost from "../draft/review-post";
import { returnUserImageURL } from "../../constants/urls";

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const INITIAL = "INITIAL";
const EDIT = "EDIT";
const REVIEW = "REVIEW";
const SHORT = "SHORT";

class ShortPostViewer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedFiles: [],
            validFiles: [],
            unsupportedFiles: [],
            imageIndex: 0,
            // postText: '',
            textData: this.props.textData,
            date: this.props.eventData.date,
            min: this.props.eventData.min_duration,
            pursuitCategory: this.props.eventData.pursuit_category,
            isPaginated: this.props.eventData.is_paginated,
            isMilestone: this.props.eventData.is_milestone,
            postDisabled: true,
            window: INITIAL,
        };
        this.handleWindowChange = this.handleWindowChange.bind(this);
        this.handleIndexChange = this.handleIndexChange.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handlePaginatedChange = this.handlePaginatedChange.bind(this);
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

    render() {
        const settings = {
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            centerPadding: 0,
            className: 'abcdef',
            nextArrow: <Arrow direction="right" />,
            prevArrow: <Arrow direction="left" />
        };

         if (this.state.window === INITIAL) {
            if (!this.props.eventData.image_data.length) {
                if (this.props.largeViewMode) {
                    return (
                        <div className={this.props.largeViewMode ? "flex-display small-post-window" : "flex-display"}>
                            <div className="short-viewer-hero-container">
                                <ShortHeroText
                                    text={this.props.textData} />
                            </div>
                            <div className="short-viewer-side-container">
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

                    )
                }
                else {
                    return (
                        <div className="flex-display flex-direction-column" >
                            <div className="mini-short-viewer-hero-container">
                                <PostHeader
                                    isOwnProfile={this.props.isOwnProfile}
                                    username={this.props.username}
                                    displayPhoto={this.props.eventData.display_photo_key}
                                />
                                <ShortHeroText
                                    text={this.props.textData} />
                            </div>
                            <div className="mini-short-viewer-side-container">
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
                    )
                }
            }
            //with images
            else {
                const transformedTextArray = this.state.textData;
                const container = this.props.eventData.image_data.map((key, i) =>
                    <div className="image-container">
                        <img className="preview-image" key={i} src={returnUserImageURL(key)} />
                    </div>
                );
                const imageDisplay =
                    (
                        <div className={
                            this.props.largeViewMode ?
                                "short-viewer-hero-container flex-display flex-direction-column black-background" :
                                "mini-short-viewer-hero-container flex-display flex-direction-column black-background"}>
                            <Slider afterChange={index => (this.handleIndexChange(index))} {...settings}>
                                {container}
                            </Slider>
                        </div>
                    );

                if (this.props.largeViewMode) {
                    return (
                        <div className="flex-display small-post-window">
                            {imageDisplay}
                            <div className="short-viewer-side-container">
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
                    )
                }
                else {
                    return (
                        <div className="flex-display flex-direction-column" >
                            <PostHeader
                                isOwnProfile={this.props.isOwnProfile}
                                username={this.props.username}
                                displayPhoto={this.props.eventData.display_photo_key}
                            />
                            {imageDisplay}
                            <div className="mini-short-viewer-side-container">

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
                    );
                }
            }
        }
        else if (this.state.window === EDIT) {
            return (
                <div className="flex-display flex-direction-column small-post-window" >
                    <div className="post-button-container">
                        <button onClick={() => this.handleWindowChange(INITIAL)}>Return</button>
                        <button onClick={() => this.handleWindowChange(REVIEW)}>Review Post</button>

                    </div>
                    <ShortReEditor
                        onIndexChange={this.handleIndexChange}
                        imageIndex={this.state.imageIndex}
                        eventData={this.props.eventData}
                        textData={this.state.textData}
                        isPaginated={this.state.isPaginated}
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
                    onClick={this.handleWindowChange}
                    // existingImageArray={this.state.eventData.image_data}
                    textData={this.state.textData}
                    username={this.props.username}
                    preferredPostType={this.props.preferredPostType}
                    handlePreferredPostTypeChange={this.handlePreferredPostTypeChange}
                />
            );

        }
    }

}

export default ShortPostViewer;