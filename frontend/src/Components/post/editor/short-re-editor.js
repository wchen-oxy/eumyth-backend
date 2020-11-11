import React, { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import Arrow from '../../image-carousel/arrow';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ShortReEditor = (props) => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        nextArrow: <Arrow direction="right" />,
        prevArrow: <Arrow direction="left" />

    };

    // const [setPostText, postText] = useState(props.textData);
    // const [setPaginated, isPaginated] = useState(props.eventData.is_paginated);

    // const onPaginatedChange = () => (setPaginated(!isPaginated));
    // const onTextChange = (text) => {
    //     let newText = postText;
    //     if (isPaginated) {
    //         newText[props.imageIndex] = text;
    //     }
    //     else {
    //         newText = text;
    //     }
    //     setPostText(newText);
    // }

    console.log(props.textData);
    if (!props.eventData.image_data.length) {
        return (
            <div className="flex-display" >
                <div id="text-container flex-display">
                    <div className=" description-container flex-display flex-direction-column">
                        <h4>{props.eventData.username}</h4>
                        <div id="description-input-container">
                            <TextareaAutosize
                                id='short-post-text'
                                placeholder='Write something here.'
                                onChange={props.onTextChange}
                                minRows={5}
                                value={props.textData}
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

            <div className="flex-display">
                <div className="short-viewer-hero-container flex-display flex-direction-column black-background">
                    <Slider afterChange={index => (props.onIndexChange(index))} {...settings}>
                        {images}
                    </Slider>

                </div>
                <div className="short-viewer-side-container">
                    <h4>{props.eventData.username}</h4>
                    {props.eventData.image_data.length > 1 && !props.eventData.is_paginated ? <button onClick={props.onPaginatedChange}>Caption Photos Individually</button> : <></>}
                    {props.eventData.image_data.length > 1 && props.eventData.is_paginated ? <button onClick={props.onPaginatedChange}>Return to Single Caption</button> : <></>}

                    <TextareaAutosize
                        id='short-post-text'
                        placeholder='Write something here.'
                        onChange={props.onTextChange}
                        minRows={5}
                        value={
                            props.isPaginated ?
                                props.textData[props.imageIndex] :
                                props.textData
                        }
                    />
                </div>
            </div>

        );
    }
}

export default ShortReEditor;