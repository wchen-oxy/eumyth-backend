import React from 'react';
import "./image-drop.scss";

const ImageDrop = (props) => (
    <div className="imagedrop-container"
                onDragOver={props.dragOver}
                onDragEnter={props.dragEnter}
                onDragLeave={props.dragLeave}
                onDrop={props.fileDrop}
                onClick={props.fileInputClicked}
            >
                <div id="imagedrop-message">
                    <div id="imagedrop-upload-icon"></div>
                Drag and Drop files here or click to select file(s)
            </div>
                <input
                    ref={props.reference}
                    type="file"
                    multiple
                    onChange={props.filesSelected}
                />
            </div>
)

export default ImageDrop;