import React from 'react';
import ProfileHeader from "./sub-components/post-header";
import ShortHeroText from "./sub-components/short-text";
import ShortPostComments from "./sub-components/short-post-comments";
import ShortEditor from "../editors/short-editor";
import "./short-post.scss";

class ShortPostViewer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedFiles: [],
            validFiles: [],
            unsupportedFiles: [],
            imageArray: [],
            imageIndex: 0,
            postText: '',
            isPaginated: false,
            postDisabled: true,
            window: 'INITIAL',
        };
        this.handleWindowChange = this.handleWindowChange.bind(this);
    }

    handleWindowChange(newWindow) {
        this.setState({ window: newWindow });
        console.log(newWindow);
    }



    render() {

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
                                isMilestone={this.props.eventData.is_milestone}
                                date={this.props.eventData.date}
                                pursuit={this.props.eventData.pursuit_category}
                                min={this.props.eventData.min_duration}

                            />
                        </div>

                    </div>
                );
            }
            //with images
            else {
                return (
                    <div id="short-post-viewer-container" className="small-post-window">
                        <div className="short-viewer-hero-container">
                            HELLO

                        </div>
                        <div className="short-viewer-side-container">
                            <ProfileHeader
                                username={this.props.username}
                                profilePhoto={this.props.profilePhoto}
                                onEditClick={this.handleWindowChange}
                            />
                        </div>
                    </div>
                );
            }
        }
        else if (this.state.window === "EDIT") {
            console.log(this.props.eventData);
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