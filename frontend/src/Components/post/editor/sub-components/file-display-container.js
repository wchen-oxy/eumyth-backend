import React from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import "./file-display-container.scss";

const FileDisplayContainer = (props) => {
    const SortableItem =
        SortableElement(({ data, fileType, fileSize, errorMessage, removeFile }) => {
            const isDataInvalidError = data.invalid ? ('sortableitem-error') : ('');
            return (
                <div className="sortableitem-status-bar">
                    <div>
                        <div className="sortableitem-type-logo">
                        </div>
                        <div className="sortableitem-type">
                            {fileType(data.name)}
                        </div>
                        <span
                            className={`sortableitem-name ${isDataInvalidError}`}
                        >
                            {data.name}
                        </span>
                        <span className="sortableitem-size">
                            ({fileSize(data.size)})
                        </span>
                        {data.invalid &&
                            <span className='sortableitem-error-message'>
                                ({errorMessage})
                            </span>}
                    </div>
                    <button onClick={() => removeFile(data.name)}>X</button>
                </div >
            )
        });

    const SortableList =
        SortableContainer(({
            items,
            onSortEnd,
            fileType,
            fileSize,
            errorMessage,
            removeFile }) => {
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
                            removeFile={removeFile}

                        />
                    ))}
                </ul>
            );
        });

    return (
        <SortableList
            items={props.validFiles}
            onSortEnd={props.onSortEnd}
            fileType={props.fileType}
            fileSize={props.fileSize}
            errorMessage={props.errorMessage}
            removeFile={props.removeFile}
        />
    )
};

export default React.memo(FileDisplayContainer);