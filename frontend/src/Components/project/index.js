import React from 'react';
import ProjectText from "./sub-components/project-text";
import Timeline from "../profile/timeline/index";
import Event from "../profile/timeline/sub-components/timeline-event";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

import "./index.scss";

const PROJECT = "PROJECT";
const MAIN = "MAIN";
const EDIT = "EDIT";
const REVIEW = "REVIEW";


const SortableItem = SortableElement(({ data }) =>
    (

        <div className="sortable-project-post">


            <Event
                eventData={data}
                newProjectView={false}
                key={data._id}
                disableModalPreview={true}
            />
        </div>

    )
);

const SortableList = SortableContainer(({ items, onSortEnd }) => {
    return (
        <ul>
            {
                items.map((value, index) => (
                    <SortableItem
                        key={`item-${index}`}
                        index={index}
                        data={value}
                        onSortEnd={onSortEnd}

                    />
                ))
            }
        </ul>
    );
});

class PostProjectController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            window: MAIN,
            selectedPosts: []
        }
        this.handleProjectEventSelect = this.handleProjectEventSelect.bind(this);
        this.handleWindowSwitch = this.handleWindowSwitch.bind(this);
        this.handleSortEnd = this.handleSortEnd.bind(this);
    }

    handleWindowSwitch(window) {
        this.setState({ window: window });
    }


    handleProjectEventSelect(eventData, isSelected) {
        if (isSelected) {
            let updatedProjectData = this.state.selectedPosts;
            updatedProjectData.push(eventData);
            this.setState({ selectedPosts: updatedProjectData });
        }
        else {
            let updatedProjectData = [];
            for (const postData of this.state.selectedPosts) {
                if (postData._id !== eventData._id) updatedProjectData.push(postData);
            }
            this.setState({ selectedPosts: updatedProjectData });
        }
    }


    handleSortEnd({ oldIndex, newIndex }) {
        const items = Array.from(this.state.validFiles);
        const [reorderedItem] = items.splice(oldIndex, 1);
        items.splice(newIndex, 0, reorderedItem);
        this.setState({ validFiles: items });
    }

    render() {
        const newOrBackButton = (this.props.newProject ? <button onClick={this.props.onNewBackProjectClick}>Back</button> : <button onClick={this.props.onNewBackProjectClick}>New</button>);

        switch (this.state.window) {
            case (MAIN):
                return (
                    <>
                        <div className="personal-profile-content-switch-container">
                            {this.props.mediaType === PROJECT ? newOrBackButton : <></>}
                            {this.props.newProject ? <button id="project-info-button" onClick={() => this.handleWindowSwitch(EDIT)}>Next Step</button> : <></>}
                        </div>
                        <div className="personal-profile-timeline-container">
                            {this.props.newProject ? <ProjectText /> : <></>}
                            {this.props.newProject ? <p>Select the posts you want to include in this project!</p> : <></>}
                            <div id="project-edit-button-container">
                                <button id="sort-by-date-button">Sort By Date</button>
                            </div>
                            <Timeline
                                // recentPosts={this.props.recentPosts}
                                newProjectView={this.props.newProject}
                                onProjectEventSelect={this.handleProjectEventSelect}
                                key={this.props.feedId}
                                allPosts={this.props.allPosts}
                                onEventClick={this.props.onEventClick}
                                targetProfileId={this.props.targetProfileId} />
                        </div>
                    </>
                );
            case (EDIT):


                return (
                    <div >
                        <div className="personal-profile-content-switch-container">
                            <button onClick={() => this.handleWindowSwitch(MAIN)}>Return</button>
                            <button onClick={() => this.handleWindowSwitch(REVIEW)}>Finalize</button>


                        </div>
                        <div className="personal-profile-timeline-container">
                            <SortableList
                                items={this.state.selectedPosts}
                                onSortEnd={this.props.onSortEnd}
                                axis="xy"
                            />

                        </div>
                    </div>
                )
            default:
                throw new Error("No Window Options Matched in post-project-controller");
        }

    }
}

export default PostProjectController;