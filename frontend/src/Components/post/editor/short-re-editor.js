import React, { useState } from 'react';
import TextContainer from "./sub-components/text-container";
import Arrow from '../../image-carousel/sub-components/arrow';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./short-re-editor.scss";

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

    const renderTextContainer = () => (
        <TextContainer
            validFilesLength={props.eventData.image_data.length}
            isPaginated={props.isPaginated}
            onPaginatedChange={props.onPaginatedChange}
            onTextChange={props.onTextChange}
            textPageText={props.textData}
            imageIndex={props.imageIndex}
        />
    );

    if (!props.eventData.image_data.length) {
        return (
            renderTextContainer()
        );
    }
    else {
        const images = props
            .eventData
            .image_data
            .map((url, index) => <img alt="Image for Slider" src={url} />);
        return (
            <div id="shortreeditor-main-container">
                <div className="shortreeditor-hero-container">
                    <Slider
                        afterChange={index => (props.onIndexChange(index))}
                        {...settings}
                    >
                        {images}
                    </Slider>
                </div>
                <div className="shortreeditor-side-container">
                    {renderTextContainer()}
                </div>
            </div>

        );
    }
}

export default ShortReEditor;