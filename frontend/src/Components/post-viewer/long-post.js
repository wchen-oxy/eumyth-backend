import React from 'react';
import DanteEditor from 'Dante2';


const LongPostViewer = (props) => {

    console.log(JSON.parse(props.eventData.text_data));
    return (
        <div className="long-post-window">
            < DanteEditor
            content={JSON.parse(props.eventData.text_data)}
            read_only={true}
            />

        </div>
    );

}

export default LongPostViewer;