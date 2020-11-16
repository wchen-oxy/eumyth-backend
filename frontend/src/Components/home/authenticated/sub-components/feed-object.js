import React from 'react';
import LongPostViewer from '../../../post/viewer/long-post';
import ShortPostViewer from '../../../post/viewer/short-post';
import './feed-object.scss';

const LARGE_VIEW_MODE = false;
const IS_OWN_PROFILE = false;
const SHORT = "SHORT";
const FeedObject = (props) => {
    const feedItem = props.feedItem;
    return (
        feedItem.post_format === SHORT ?
        
            <ShortPostViewer
                displayPhoto={feedItem.display_photo_url}
                username={feedItem.username}
                pursuits={null}
                preferredPostType={null}
                textData={feedItem.text_data}
                largeViewMode={LARGE_VIEW_MODE}
                isOwnProfile={IS_OWN_PROFILE}
                eventData={feedItem}
                onDeletePost={null}
            />
            :
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
}

export default FeedObject;