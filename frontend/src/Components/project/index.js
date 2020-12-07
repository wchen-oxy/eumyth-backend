import React from 'react';
import ProjectText from "./sub-components/project-text";
import Timeline from "../profile/timeline/index";
import Event from "../profile/timeline/sub-components/timeline-event";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import "./index.scss";

const PROJECT = "PROJECT";
const MAIN = "MAIN";
const EDIT = "EDIT";
const REVIEW = "REVIEW";

class PostProjectController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            window: MAIN,
            selectedPosts: []
        }
        this.handleProjectEventSelect = this.handleProjectEventSelect.bind(this);
        this.handleWindowSwitch = this.handleWindowSwitch.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
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

    handleDragEnd(result) {
        console.log(result);
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
                        <div id="personal-profile-timeline-container">
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
                // let finalArray = [[]];
                // let finalArrayIndex = 0;
                // let transformedPostsArray = [];
                let transformedPostsArray = this.state.selectedPosts.map((data, index) =>
                    
                        <Event
                            eventData={data}
                            newProjectView={false}
                            key={data._id}
                            disableModalPreview={true}
                        />
                    
                );
                // for (const rawPost of this.state.selectedPosts) {
                //     transformedPostsArray.push(
                //         <Event
                //             eventData={rawPost}
                //             newProjectView={false}
                //             key={rawPost._id}
                //             disableModalPreview={true}
                //         />
                //     )
                //     if (transformedPostsArray.length === 4){
                //         finalArray.push(
                //             <Droppable droppableId="droppable" direction="horizontal">
                //             {(provided) => (
                //                 <div
                //                     ref={provided.innerRef}
                //                     className="images"
                //                     {...provided.droppableProps}
                //                 >
                //                     {
                //                     transformedPostsArray.map(
                //                         (data, index) =>
                //                             <Draggable key={index.toString()} draggableId={index.toString()} index={index}>
                //                                 {(provided) =>
                //                                     (
                //                                         <div
                //                                             key={index}
                //                                             // className="flex-display"
                //                                             ref={provided.innerRef}
                //                                             {...provided.draggableProps}
                //                                             {...provided.dragHandleProps}
                //                                         >
                //                                             {data}
                //                                         </div>
                //                                     )
                //                                 }
                //                             </Draggable>
                //                     )
                //                     }

                //                 </div>
                //             )}
                //         </Droppable>
                //         );
                //         transformedPostsArray = [];
                //     }
                  
                // }

                //check if last trans is empty
                return (
                    <div >
                        <div className="personal-profile-content-switch-container">
                            <button onClick={() => this.handleWindowSwitch(MAIN)}>Return</button>
                            <button onClick={() => this.handleWindowSwitch(REVIEW)}>Finalize</button>


                        </div>
                        <div id="personal-profile-timeline-container">
                            <DragDropContext onDragEnd={this.handleDragEnd}>
                                <Droppable droppableId="droppable" direction="horizontal">
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            className="flex-display"
                                            {...provided.droppableProps}
                                        >
                                            {transformedPostsArray.map(
                                                (data, index) =>
                                                    <Draggable key={index.toString()} draggableId={index.toString()} index={index}>
                                                        {(provided) =>
                                                            (
                                                                <div
                                                                    key={index}
                                                                    // className="flex-display"
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                >
                                                                    {data}
                                                                </div>
                                                            )
                                                        }
                                                    </Draggable>
                                            )
                                            }

                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>

                        </div>
                    </div>
                )
            default:
                throw new Error("No Window Options Matched in post-project-controller");
        }

    }
}

export default PostProjectController;