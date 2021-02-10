import React from 'react';

const Arrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <div
            className={className}
            style=
            {
                props.direction === 'left' ?
                    { ...style, display: "block", background: "red", left: '5%', zIndex: '1' } :
                    { ...style, display: "block", background: "red", right: '5%', zIndex: '1' }
            }
            onClick={onClick}
        />
    );
}

export default Arrow;