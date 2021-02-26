import React from 'react';
import ShortEvent from "./timeline-short-event";
import LongEvent from "./timeline-long-event";
import ProjectEvent from "./timeline-project-event";
import { POST, PROJECT, LONG, SHORT } from "../../../constants/flags";
import './timeline-event.scss';

const selectClassStyle = (num) => {
     switch (num) {
        case (0):
            return "event-first-container";
        case (1):
            return "event-middle-container";
        case (2):
            return "event-middle-container";
        case (3):
            return "event-last-container";
        default:
            throw new Error("Element Index in Timeline Event is incorrect: ", num);
    }
}

const Event = (props) => {
    const post = props.eventData;
    let content = null;

    const handleRecentEventClick = () => {
        if (!props.disableModalPreview) {
            props.onEventClick(post, props.index)
        }
        else {
            console.log("Selected, but disabled")
        }
    };

    const renderCheckbox = (e) => (
        props.newProjectView ? (
            <input
                type="checkbox"
                defaultChecked={props.isSelected}
                onClick={(e) => props.onProjectEventSelect(post, e.target.value)} />
        ) : (<></>)
    );

    if (props.mediaType === POST) {
        switch (post.post_format) {
            case (SHORT):
                content = (
                    <ShortEvent
                        post={post}
                        commentCount={post.comment_count}
                    />
                );
                break;
            case (LONG):
                content = (
                    <LongEvent
                        post={post}
                        commentCount={post.comment_count}
                    />
                );
                break;
            default:
                throw Error("No matching post type: " + post.post_format);
        }
        if (props.isRecentEvents) {
            return (
                <div className={"event-middle-container"}>
                    <div
                        onClick={handleRecentEventClick}>
                        {content}
                    </div>
                    {renderCheckbox()}
                </div>
            );
        }
        else {
            return (
                <div className={props.index !== null ?
                    selectClassStyle(props.index) : "event-middle-container"}>
                    <div onClick={props.disableModalPreview ?
                        () => console.log("Selected")
                        :
                        () => props.onEventClick(post, props.index)}
                    >
                        {content}
                    </div>
                    {renderCheckbox()}
                </div>
            );
        }
    }
    else if (props.mediaType === PROJECT) {
        content = <ProjectEvent post={post} />;
        return (
            <div className={props.index !== null ?
                selectClassStyle(props.index) : "event-middle-container"}>
                <div onClick={props.disableModalPreview ?
                    () => console.log("Selected")
                    :
                    () => props.onProjectClick(post)}
                >
                    {content}
                </div>
                {renderCheckbox()}
            </div>
        );
    }
    else {
        throw new Error("No props.mediaType matched");
    }

}

export default Event;