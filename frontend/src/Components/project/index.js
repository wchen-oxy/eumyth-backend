import React from 'react';
import ProjectText from "./sub-components/project-text";
import Timeline from "../profile/timeline/index";
import Event from "../profile/timeline/sub-components/timeline-event";
import TextareaAutosize from 'react-textarea-autosize';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import "./index.scss";
import AxiosHelper from '../../Axios/axios';
import { POST } from "../constants/flags";

const MAIN = "MAIN";
const EDIT = "EDIT";
const REVIEW = "REVIEW";
const TITLE = "TITLE";
const OVERVIEW = "OVERVIEW";
const PURSUIT = "PURSUIT";
const START_DATE = "START_DATE";
const END_DATE = "END_DATE";
const IS_COMPLETE = "IS_COMPLETE";
const MINUTES = "MINUTES";
const COVER_PHOTO = "COVER_PHOTO";


const SortableItem = SortableElement(({ mediaType, data, indexValue }) => (
    <div className="sortable-project-post">
        <Event
            index={indexValue}
            mediaType={mediaType}
            eventData={data}
            newProjectView={false}
            key={data._id}
            disableModalPreview={true}
        />
    </div>

)

);

const SortableList = SortableContainer(({ mediaType, items, onSortEnd }) => (
    <ul>
        {
            items.map((value, index) => {
                console.log(index);
                return (
                    <SortableItem
                        key={`item-${index}`}
                        indexValue={index}
                        data={value}
                        mediaType={mediaType}
                        onSortEnd={onSortEnd}

                    />
                )
            })
        }
    </ul>
)
);

class ProjectController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            window: MAIN,
            selectedPosts: [],
            title: "",
            overview: "",
            pursuitCategory: this.props.pursuitsNames ? this.props.pursuitsNames[0] : null,
            startDate: "",
            endDate: "",
            isComplete: false,
            minDuration: null,
            coverPhoto: null,
            newProject: false,
            projectSelected: null,
        }

        this.handleBackClick = this.handleBackClick.bind(this);
        this.handleProjectClick = this.handleProjectClick.bind(this);
        this.handleProjectEventSelect = this.handleProjectEventSelect.bind(this);
        this.handleWindowSwitch = this.handleWindowSwitch.bind(this);
        this.handleSortEnd = this.handleSortEnd.bind(this);
        this.handlePost = this.handlePost.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);

    }

    handleBackClick() {
        if (this.state.projectSelected) {
            this.setState({ projectSelected: null });
        }
        else {
            this.props.onNewBackProjectClick();
        }

    }

    handleInputChange(id, value) {
        switch (id) {
            case (TITLE):
                this.setState({ title: value })
                break;
            case (OVERVIEW):
                this.setState({ overview: value })
                break;
            case (PURSUIT):
                this.setState({ pursuitCategory: value });
                break;
            case (START_DATE):
                this.setState({ startDate: value });
                break;
            case (END_DATE):
                this.setState({ endDate: value });
                break;
            case (IS_COMPLETE):
                this.setState({ isComplete: value });
                break;
            case (MINUTES):
                this.setState({ minDuration: value });
                break;
            case (COVER_PHOTO):
                this.setState({ coverPhoto: value });
                break;
            default:
                throw new Error("NO TEXT ID'S Matched in POST")
        }
    }

    handleWindowSwitch(window) {
        let min = 0
        if (window === REVIEW) {
            for (const selectedPost of this.state.selectedPosts) {
                if (selectedPost.min_duration) {
                    min += selectedPost.min_duration;
                }
            }
        }
        this.setState({ window: window, min: min !== 0 ? min : null });

    }


    handleProjectEventSelect(eventData, isSelected) {
        let updatedProjectData = [];
        let existsAlready = false;
        for (const postData of this.state.selectedPosts) {
            if (postData._id !== eventData._id) updatedProjectData.push(postData);
            else {
                existsAlready = true;
            }
        }
        if (!existsAlready) updatedProjectData.push(eventData);
        this.setState({ selectedPosts: updatedProjectData });

    }


    handleSortEnd({ oldIndex, newIndex }) {
        const items = Array.from(this.state.selectedPosts);
        const [reorderedItem] = items.splice(oldIndex, 1);
        items.splice(newIndex, 0, reorderedItem);
        console.log(items);
        this.setState({ selectedPosts: items });
    }

    handlePost() {
        let formData = new FormData();
        formData.append("username", this.props.username);
        formData.append("displayPhoto", this.props.displayPhoto)
        formData.append("userId", this.props.targetProfileId);
        formData.append("indexUserId", this.props.targetIndexUserId);
        formData.append("title", this.state.title);
        if (this.state.overview) formData.append("overview", this.state.overview);
        if (this.state.pursuitCategory) formData.append("pursuitCategory", this.state.pursuitCategory);
        if (this.state.startDate) formData.append("startDate", this.state.startDate);
        if (this.state.endDate) formData.append("endDate", this.state.endDate);
        if (this.state.isComplete) formData.append("isComplete", this.state.isComplete);
        if (this.state.minDuration) formData.append("minDuration", this.state.minDuration);
        if (this.state.coverPhoto) formData.append("coverPhoto", this.state.coverPhoto);
        for (const post of this.state.selectedPosts) {
            formData.append("selectedPosts", JSON.stringify(post));
        }
        AxiosHelper.createProject(formData)
            .then((result) => {
                console.log(result);
                alert(result);
            })
            .catch(err => console.log(err));
    }

    handleProjectClick(projectData) {
        this.setState({ projectSelected: projectData });
    }

    render() {
        switch (this.state.window) {
            case (MAIN):
                return (
                    <>
                        <div className="personal-profile-content-switch-container">
                            {
                                this.props.newProject || this.state.projectSelected ?
                                    <button onClick={this.handleBackClick}>Back</button>
                                    :
                                    <button onClick={this.props.onNewBackProjectClick}>New</button>
                            }
                            {
                                this.props.newProject ?
                                    <button id="project-info-button" onClick={() => this.handleWindowSwitch(EDIT)}>Next Step</button>
                                    :
                                    <></>
                            }
                        </div>
                        <div className="personal-profile-timeline-container">
                            {this.props.newProject ? <ProjectText titleValue={this.state.title} descriptionValue={this.state.overview} onTextChange={this.handleInputChange} /> : <></>}
                            {this.props.newProject ? <p>Select the posts you want to include in this project!</p> : <></>}
                            {/* <div id="project-edit-button-container">
                                <button id="sort-by-date-button">Sort By Date</button>
                            </div> */}
                            <Timeline
                                mediaType={this.state.projectSelected || this.props.newProject ? POST : this.props.mediaType}
                                selectedPosts={this.state.selectedPosts}
                                newProjectView={this.props.newProject}
                                onProjectEventSelect={this.handleProjectEventSelect}
                                onProjectClick={this.handleProjectClick}
                                key={this.state.projectSelected ? this.state.projectSelected._id : this.props.feedId}
                                allPosts={this.state.projectSelected ? this.state.projectSelected.post_ids : this.props.allPosts}
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
                                mediaType={POST}
                                items={this.state.selectedPosts}
                                onSortEnd={this.handleSortEnd}
                                axis="xy"
                            />
                        </div>
                    </div>
                );

            case (REVIEW):
                let pursuitSelects = [];
                for (const pursuit of this.props.pursuitsNames) {
                    pursuitSelects.push(
                        <option key={pursuit} value={pursuit}>{pursuit}</option>
                    );
                }

                return (
                    <div >
                        <div className="personal-profile-content-switch-container">
                            <button onClick={() => this.handleWindowSwitch(MAIN)}>Return</button>
                            <button onClick={() => this.handlePost()}>Post!</button>
                        </div>
                        <div className="personal-profile-timeline-container">
                            <div id="personal-profile-project-submit-container">
                                <TextareaAutosize value={this.state.title} onChange={(e) => this.handleInputChange(TITLE, e.target.value)} />
                                <TextareaAutosize value={this.state.overview} onChange={(e) => this.handleInputChange(OVERVIEW, e.target.value)} />
                                <label>Pursuit</label>
                                <select name="pursuit-category" value={this.state.pursuitCategory} onChange={(e) => this.handleInputChange(PURSUIT, e.target.value)}>
                                    {pursuitSelects}
                                </select>
                                <label>Start Date</label>
                                <input type="date" value={this.state.startDate} onChange={(e) => this.handleInputChange(START_DATE, e.target.value)}></input>
                                <label>End Date</label>
                                <input type="date" value={this.state.endDate} onChange={(e) => this.handleInputChange(END_DATE, e.target.value)}></input>
                                <label>Total Minutes</label>
                                <input type="number" value={this.state.minDuration} onChange={(e) => this.handleInputChange(MINUTES, e.target.value)}></input>
                                <label>Is Complete</label>
                                <input type="checkbox" onClick={() => this.handleInputChange(IS_COMPLETE, !this.state.isComplete)}></input>
                                <label>Cover Photo</label>
                                <input type="file" onChange={(e) => this.handleInputChange(COVER_PHOTO, e.target.files[0])} />
                                <button onClick={this.handlePost}>Submit</button>
                            </div>

                        </div>
                    </div>
                )
            default:
                throw new Error("No Window Options Matched in post-project-controller");
        }

    }
}

export default ProjectController;