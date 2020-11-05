import React from 'react';
import "./short-text.scss";

const ShortHeroText = (props) => {
    if (props.length < 1000) {
        return (
            <div id="tiny-amount-text-container">
                <p>{props.text}</p>
            </div>
        )
    }
    else{
        return(
            <div id="medium-amount-text-container">
                    <p>{props.text}</p>
            </div>
        )
    }
}

export default ShortHeroText;