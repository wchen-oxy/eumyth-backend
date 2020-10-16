import React from 'react';

const FileDisplayContainer = (props) => (
    <div className="file-display-container">
        {
            props.validFiles.map((data, i) =>
                <div className="file-status-bar" key={i}>
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
    </div>
);

export default FileDisplayContainer;