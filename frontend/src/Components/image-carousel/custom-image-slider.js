import React from 'react';
import Annotation from 'react-image-annotation';
import TextareaAutosize from "react-textarea-autosize";
import "./custom-image-slider.scss";
import { EXPANDED, COLLAPSED } from "../constants/flags";

class CustomImageSlider extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            annotation: {}, //current annotation
        }

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.renderEditor = this.renderEditor.bind(this);
        this.renderPromptOverlay = this.renderPromptOverlay.bind(this);
        this.activeAnnotationComparator = this.activeAnnotationComparator.bind(this);
        this.renderImageControls = this.renderImageControls.bind(this);
    }

    onChange(annotation) {
        this.setState({ annotation })
    }

    onSubmit(annotation) {
        this.setState({ annotation: {} },
            this.props.onAnnotationSubmit(annotation));

    }

    renderEditor(props) {
        const { geometry } = props.annotation
        if (!geometry) return null
        console.log(geometry);
        return (
            <div
                style={{
                    background: 'white',
                    borderRadius: 3,
                    position: 'absolute',
                    zIndex: 9999,
                    left: `${geometry.x}%`,
                    top: `${geometry.y + geometry.height}%`,
                }}
            >
                <div>Custom Editor</div>
                <TextareaAutosize
                    onChange={e => props.onChange({
                        ...props.annotation,
                        data: {
                            ...props.annotation.data,
                            text: e.target.value
                        }
                    })}
                />
                <button onClick={props.onSubmit}>Comment</button>
            </div>
        )
    }

    renderPromptOverlay() {
        return (
            <div
                style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: 'white',
                    padding: 5,
                    pointerEvents: 'none',
                    position: 'absolute',
                    top: 5,
                    left: 5
                }}
            >
                Click and Drag to create an annotation!
            </div>
        )
    }

    activeAnnotationComparator(a, b) {
        return a.data.id === b
    }

    renderImageControls(windowType) {
        console.log(windowType);
        return (
            <div>

                {
                    this.props.imageArray.length > 1 ?
                        (<>
                            <button onClick={() => this.props.handleArrowPress(-1)}>Previous</button>
                            <button onClick={() => this.props.handleArrowPress(1)}>Next</button>
                        </>
                        )
                        : null
                }
                {    (windowType === EXPANDED) ?
                    <button onClick={this.props.toggleAnnotations}>{this.props.areAnnotationsHidden ? "Show Annotations" : "Hide Annotations"}</button>
                    : <></>
                }   </div>
        )
    }

    render() {
        // console.log(this.props.imageArray[this.props.imageIndex]);
        // console.log(this.props.annotations);
        return (
            <>
                <div className="customimageslider-hero-container"  >
                    <Annotation
                        src={this.props.imageArray[this.props.imageIndex]}
                        alt='Image Display Goes Here'
                        disableOverlay={this.props.hideAnnotations}
                        disableAnnotation={this.props.windowType === COLLAPSED}
                        annotations={!this.props.hideAnnotations ? this.props.annotations : []}
                        activeAnnotationComparator={this.activeAnnotationComparator}
                        activeAnnotations={this.props.activeAnnotations}
                        type={this.state.type}
                        value={this.state.annotation}
                        onChange={this.onChange}
                        onSubmit={this.onSubmit}
                        renderEditor={this.renderEditor}
                    // renderOverlay={  this.renderPromptOverlay   }
                    />
                </div>
                {this.props.showPromptOverlay ? <p>Click on a point in the image and drag!</p> : null}

                {  this.renderImageControls(this.props.windowType)}


            </>
        )
    }


}

export default CustomImageSlider;