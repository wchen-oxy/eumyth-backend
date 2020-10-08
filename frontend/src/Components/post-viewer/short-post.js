import React from 'react';
import ProfileHeader from "./sub-components/post-header";
import ShortHeroText from "./sub-components/short-text";
import ShortPostComments from "./sub-components/short-post-comments";
import Slider from "react-slick";

import ShortEditor from "../editors/short-editor";
import "./short-post.scss";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

class ShortPostViewer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedFiles: [],
            validFiles: [],
            unsupportedFiles: [],

            imageIndex: 0,
            postText: '',
            isPaginated: false,
            postDisabled: true,
            window: 'INITIAL',
        };
        this.handleWindowChange = this.handleWindowChange.bind(this);
        this.handleIndexChange = this.handleIndexChange.bind(this);
    }

    handleWindowChange(newWindow) {
        this.setState({ window: newWindow });
        console.log(newWindow);
    }

    handleIndexChange(value) {
        this.setState({ imageIndex: value });
    }


    render() {
        const settings = {
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            centerPadding: 0,
            className: 'photo-container',

        };
        console.log(this.props.eventData.text_data);
        if (this.state.window === "INITIAL") {
            if (!this.props.eventData.image_data.length) {
                return (
                    <div id="short-post-viewer-container" className="small-post-window">
                        <div className="short-viewer-hero-container">
                            <ShortHeroText text={this.props.eventData.text_data} />
                        </div>
                        <div className="short-viewer-side-container">
                            <ProfileHeader username={this.props.username} profilePhoto={this.props.profilePhoto} onEditClick={this.handleWindowChange} />
                            <ShortPostComments
                                index={this.state.imageIndex}
                                isPaginated={this.props.eventData.isPaginated}
                                isMilestone={this.props.eventData.is_milestone}
                                date={this.props.eventData.date}
                                pursuit={this.props.eventData.pursuit_category}
                                min={this.props.eventData.min_duration}
                                textData={this.props.eventData.text_data}
                            />
                        </div>

                    </div>
                );
            }
            //with images
            else {
                const container = this.props.eventData.image_data.map((url, i) => <img key={i} src={url} />)
                return (
                    <div id="short-post-viewer-container" className="small-post-window">
                        <div className="short-viewer-hero-container">
                            <Slider afterChange={index => (this.handleIndexChange(index))} {...settings}>
                                {container}
                            </Slider>
                        </div>
                        <div className="short-viewer-side-container">
                            <ProfileHeader
                                username={this.props.username}
                                profilePhoto={this.props.profilePhoto}
                                onEditClick={this.handleWindowChange}
                            />
                             <ShortPostComments
                                index={this.state.imageIndex}
                                isPaginated={this.props.eventData.is_paginated}
                                isMilestone={this.props.eventData.is_milestone}
                                date={this.props.eventData.date}
                                pursuit={this.props.eventData.pursuit_category}
                                min={this.props.eventData.min_duration}
                                textData={this.props.eventData.is_paginated ? JSON.parse(this.props.eventData.text_data) : this.props.eventData.text_data}
                            />
                        </div>
                    </div>
                );
            }
        }
        else if (this.state.window === "EDIT") {
            return (
                <p>Hello</p>
                // <ShortEditor
                //     username={this.props.username}
                //     selectedFiles={this.props.eventData.}
                //     validFiles={this.state.validFiles}
                //     unsupportedFiles={this.state.unsupportedFiles}
                //     isPaginated={this.state.isPaginated}
                //     textPageText={this.state.postText}
                //     textPageIndex={this.state.imageIndex}
                //     setImageArray={this.setImageArray}
                //     onCaptionStyleChange={this.handleCaptionStyleChange}
                //     onArrowClick={this.handleArrowClick}
                //     onTextChange={this.handleTextChange}
                //     onSelectedFileChange={this.handleSelectedFileChange}
                //     onUnsupportedFileChange={this.handleUnsupportedFileChange}
                //     onDisablePost={this.handleDisablePost}
                //     setValidFiles={this.setValidFiles}
                //     setSelectedFiles={this.setSelectedFiles}
                //     setUnsupportedFiles={this.setUnsupportedFiles}
                // />
            )
        }
    }

}

export default ShortPostViewer;