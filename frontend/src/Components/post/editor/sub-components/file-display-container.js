import React from 'react';
import { Droppable, Draggable } from "react-beautiful-dnd";
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

const FileDisplayContainer = (props) =>
// <Droppable droppableId="images">
//     {(provided) => (
//         <div className="images" {...provided.droppableProps} ref={provided.innerRef}>
//             {
//                 props.validFiles.map((data, i) =>
//                     (
//                         <Draggable key={data.name} draggableId={data.name} index={i}>
//                             {(provided) =>
//                                 (
//                                     <div
//                                         key={data.name}
//                                         className="file-status-bar"
//                                         ref={provided.innerRef}
//                                         {...provided.draggableProps}
//                                         {...provided.dragHandleProps}
//                                     >
//                                         <div>
//                                             <div className="file-type-logo"></div>
//                                             <div className="file-type">{props.fileType(data.name)}</div>
//                                             <span className={`file-name ${data.invalid ? 'file-error' : ''}`}>{data.name}</span>
//                                             <span className="file-size">({props.fileSize(data.size)})</span> {data.invalid && <span className='file-error-message'>({props.errorMessage})</span>}
//                                         </div>
//                                         <div className="file-remove" onClick={() => props.removeFile(data.name)}>X</div>
//                                     </div>
//                                 )
//                             }
//                         </Draggable>
//                     )
//                 )
//             }
//             {provided.placeholder}

//         </div>
//     )}
// </Droppable>
{

    const SortableItem = SortableElement(({ data, fileType, fileSize, errorMessage }) =>
        (
            <div className="file-status-bar">
                <div>
                    <div className="file-type-logo"></div>
                    <div className="file-type">{fileType(data.name)}</div>
                    <span className={`file-name ${data.invalid ? 'file-error' : ''}`}>{data.name}</span>
                    <span className="file-size">({fileSize(data.size)})</span> {data.invalid && <span className='file-error-message'>({errorMessage})</span>}
                </div>
                <div className="file-remove" onClick={() => props.removeFile(data.name)}>X</div>
            </div>
        )
    );

    const SortableList = SortableContainer(({ items, onSortEnd, fileType, fileSize, errorMessage }) => {
        return (
            <ul>
                {items.map((value, index) => (
                    <SortableItem
                        key={`item-${index}`}
                        index={index}
                        data={value}
                        onSortEnd={onSortEnd}
                        fileType={fileType}
                        fileSize={fileSize}
                        errorMessage={errorMessage}

                    />
                ))}
            </ul>
        );
    });

    // const container =
    //     <SortableList items={state.items} onSortEnd={onSortEnd} />;
    return (
        <SortableList
            items={props.validFiles}
            onSortEnd={props.onSortEnd}
            fileType={props.fileType}
            fileSize={props.fileSize}
            errorMessage={props.errorMessage} />
    )


};

export default FileDisplayContainer;