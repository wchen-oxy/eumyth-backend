import React from 'react';
import DanteEditor from 'Dante2';

const LongPostViewer = (props) => {
    return (
        <div className="long-post-window">
            <div className="long-editor-container" id="long-editor-buttons">
                {props.isOwnProfile ? <button>Edit</button> : <></>}
                {props.isOwnProfile ? <button onClick={props.onDeletePost}>Remove</button> : <></>}
            </div>
            <div className="long-editor-container">
                < DanteEditor
                    content={props.textData}
                    read_only={true}
                />
            </div>
        </div>
    );

}

export default LongPostViewer;