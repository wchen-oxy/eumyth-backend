import React from "react";
import TextareaAutosize from 'react-textarea-autosize';
import InfiniteScroll from 'react-infinite-scroll-component';
import "./index.scss";
import Timeline from "../profile/timeline";

const INITIAL = "INITIAL";
class ProjectController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            window: INITIAL
        }
    }

    render() {
        return (
            <div className="long-post-window">
                <div id="project-hero-container">
                    <div id="project-hero-title-overview-container">
                        <TextareaAutosize id="project-title" placeholder='Write a Title for your Post!' maxLength={140} />
                        <TextareaAutosize id="project-overview" placeholder="Write an Overview for your Project!" maxLength={140} />
                    </div>
                    <div>
                        <Timeline
                         
                            allPosts={this.props.eventData}
                            onEventClick={this.handleEventClick}
                            targetProfileId={this.state.targetProfileId}
                        />
                    </div>

                </div>
            </div>
        )
    }
}

export default ProjectController;