import React from 'react';
import LongPostViewer from '../../../post/viewer/long-post';
import ShortPostViewer from '../../../post/viewer/short-post';

const LARGE_VIEW_MODE = false;
const IS_OWN_PROFILE = false;
const SHORT = "SHORT";
const LONG = "LONG";

const FeedObject = (props) => {
    const feedItem = props.feedItem;
    if (feedItem.post_format === SHORT) {
        return (
            <ShortPostViewer
                displayPhoto={feedItem.display_photo_key}
                username={feedItem.username}
                pursuits={null}
                preferredPostType={null}
                textData={feedItem.is_paginated ?
                    JSON.parse(feedItem.text_data) : feedItem.text_data}
                largeViewMode={LARGE_VIEW_MODE}
                isOwnProfile={IS_OWN_PROFILE}
                eventData={feedItem}
                onDeletePost={null}
            />)
    }
    else if (feedItem.post_format === LONG) return (

        <LongPostViewer
            displayPhoto={feedItem.displayPhoto}
            username={feedItem.username}
            pursuits={feedItem.pursuits}
            preferredPostType={feedItem.preferredPostType}
            textData={feedItem.textData}
            isOwnProfile={IS_OWN_PROFILE}
            eventData={feedItem}
            onDeletePost={null}
        />
    );
};

export default FeedObject;