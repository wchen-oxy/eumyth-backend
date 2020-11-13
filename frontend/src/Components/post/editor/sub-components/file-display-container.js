import React from 'react';
import { Droppable, Draggable } from "react-beautiful-dnd";

const FileDisplayContainer = (props) => (
    <Droppable droppableId="images">
        {(provided) => (
            <div className="images" {...provided.droppableProps} ref={provided.innerRef}>
                {
                    props.validFiles.map((data, i) =>
                        (
                            <Draggable key={data.name} draggableId={data.name} index={i}>
                                {(provided) =>
                                    (
                                        <div
                                            key={data.name}
                                            className="file-status-bar"
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        >
                                            <div>
                                                <div className="file-type-logo"></div>
                                                <div className="file-type">{props.fileType(data.name)}</div>
                                                <span className={`file-name ${data.invalid ? 'file-error' : ''}`}>{data.name}</span>
                                                <span className="file-size">({props.fileSize(data.size)})</span> {data.invalid && <span className='file-error-message'>({props.errorMessage})</span>}
                                            </div>
                                            <div className="file-remove" onClick={() => props.removeFile(data.name)}>X</div>
                                        </div>
                                    )
                                }
                            </Draggable>
                        )
                    )
                }
                {provided.placeholder}

            </div>
        )}
    </Droppable>
);

export default FileDisplayContainer;