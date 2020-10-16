import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';

const TextContainer = (props) => (
    <div className=" description-container flex-display flex-direction-column">
        <h4>{props.username}</h4>
        {props.validFilesLength > 0 && !props.isPaginated ? <button onClick={props.onCaptionStyleChange}>Caption Photos Individually</button> : <></>}
        {props.validFilesLength > 0 && props.isPaginated ? <button onClick={props.onCaptionStyleChange}>Return to Single Caption</button> : <></>}

        {/* <input name="title" type="text" maxlength="140" placeholder="Optional Title" onChange={(e) => props.onTextChange(e)}></input> */}
        {/* <TextareaAutosize name="title" id='short-post-text' placeholder='Write something here.' maxRows={2} onChange={props.onTextChange}  value={props.title} maxLength={140}/> */}
        {/* <div id="description-input-container" > */}
            <TextareaAutosize
                id='short-post-text'
                placeholder='Write something here.'
                onChange={props.onTextChange}
                minRows={5}
                value={
                    props.isPaginated ?
                        props.textPageText[props.textPageIndex] :
                        props.textPageText
                }
            />
        {/* </div> */}
    </div>
);

export default TextContainer;