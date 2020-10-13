import React from 'react';
import DanteEditor from 'Dante2';
import "./long-post.scss";


const LongPostViewer = (props) => {

    console.log(JSON.parse(props.eventData.text_data));
    return (
        <div className="long-post-window">
            <div className="long-editor-container" id="long-editor-buttons">
                {props.isOwnProfile ? <button>Edit</button> : <></>}
                {props.isOwnProfile ? <button onClick={props.onDeletePost}>Remove</button> : <></>}
            </div>
            <div className="long-editor-container">
                < DanteEditor
                    content={JSON.parse(props.eventData.text_data)}
                    read_only={true}
                />
            </div>

        </div>
    );

}

export default LongPostViewer;