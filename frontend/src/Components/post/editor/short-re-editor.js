import React, { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import TextContainer from "./sub-components/text-container";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ShortReEditor = (props) => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1
    };

    const [setPostText, postText] = useState(props.textData);
    const [setPaginated, isPaginated] = useState(props.eventData.is_paginated);
    const onPaginatedChange = () => (setPaginated(!isPaginated));
    const onTextChange = (text) => {
        let newText = postText;
        if (isPaginated) {
            newText[props.imageIndex] = text;
        }
        else {
            newText = text;
        }
        setPostText(newText);
    }

   
    if (!props.eventData.image_data.length) {
        return (

            <div className="post-preview-container flex-display flex-direction-column"  >
                <div id="text-container flex-display">
                    <div className=" description-container flex-display flex-direction-column">
                        <h4>{props.eventData.username}</h4>
                        <div id="description-input-container">
                            <TextareaAutosize
                                id='short-post-text'
                                placeholder='Write something here.'
                                onChange={onTextChange}
                                minRows={5}
                                value={postText}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    else {

        const images = props.eventData.image_data.map((url, index) => <img src={url} />);
        return (

            <div className="post-preview-container flex-display">
                <div className="photo-upload-container">
                    <Slider afterChange={index => (props.onIndexChange(index))} {...settings}>
                        {images}
                    </Slider>

                </div>
                <div className=" description-container flex-display flex-direction-column">
                    <h4>{props.username}</h4>
                    {props.eventData.image_data.length > 0 && !props.eventData.is_paginated ? <button onClick={onPaginatedChange}>Caption Photos Individually</button> : <></>}
                    {props.eventData.image_data.length > 0 && props.eventData.is_paginated ? <button onClick={onPaginatedChange}>Return to Single Caption</button> : <></>}

                    <TextareaAutosize
                        id='short-post-text'
                        placeholder='Write something here.'
                        onChange={onTextChange}
                        minRows={5}
                        value={
                            props.eventData.is_paginated ?
                                postText[props.imageIndex] :
                                postText
                        }
                    />
                </div>
            </div>

        );
    }
}

export default ShortReEditor;