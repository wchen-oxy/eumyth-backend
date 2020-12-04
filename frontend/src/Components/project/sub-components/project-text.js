import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import "./project-text.scss";


const ProjectText = (props) => {
    return (
        <div id="project-hero-title-overview-container">
            <TextareaAutosize id="project-title" placeholder='Write a Title for your Post!' maxLength={140} />
            <TextareaAutosize id="project-overview" placeholder="Write an Overview for your Project!" maxLength={140} />
        </div>
    );

}

export default ProjectText;
