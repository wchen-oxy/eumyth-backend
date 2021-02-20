import React from 'react';
import ShortPostViewer from "./short-post";
import LongPostViewer from "./long-post";
import { SHORT, LONG } from "../../constants/flags";
import { withFirebase } from "../../../Firebase/index";

const PostViewerController = (props) => {
    const isOwnProfile = (props.eventData.username === props.firebase.returnUsername());
    switch (props.eventData.post_format) {
        case (SHORT):
            return (
                <ShortPostViewer
                    postId={props.eventData._id}
                    postIndex={props.postIndex}
                    displayPhoto={props.displayPhoto}
                    username={props.username}
                    visitorUsername={props.visitorUsername}
                    pursuitNames={props.pursuitNames}
                    preferredPostType={props.preferredPostType}
                    textData={props.textData}
                    largeViewMode={props.largeViewMode}
                    isOwnProfile={isOwnProfile}
                    isPostOnlyView={props.isPostOnlyView}
                    eventData={props.eventData}
                    onDeletePost={props.onDeletePost}
                    closeModal={props.closeModal}
                    passDataToModal={props.passDataToModal}
                    handleCommentInjection={props.handleCommentInjection}
                    selectedPostFeedType={props.selectedPostFeedType}
                />
            );
        case (LONG):
            return (
                <LongPostViewer
                    postId={props.eventData._id}
                    postIndex={props.postIndex}
                    displayPhoto={props.displayPhoto}
                    username={props.username}
                    visitorUsername={props.visitorUsername}
                    pursuitNames={props.pursuitNames}
                    preferredPostType={props.preferredPostType}
                    largeViewMode={props.largeViewMode}
                    textData={props.textData}
                    isOwnProfile={isOwnProfile}
                    isPostOnlyView={props.isPostOnlyView}
                    eventData={props.eventData}
                    onDeletePost={props.onDeletePost}
                    closeModal={props.closeModal}
                    passDataToModal={props.passDataToModal}
                    handleCommentInjection={props.handleCommentInjection}
                    selectedPostFeedType={props.selectedPostFeedType}
                />
            );
        default:
            throw new Error("No content type matched in event-modal.js");
    }
}

export default withFirebase(PostViewerController);