import React from 'react';
import Annotation from 'react-image-annotation';
import TextareaAutosize from "react-textarea-autosize";

class CustomImageSlider extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            imageIndex: 0,
            // annotations: [], //finished annotation
            annotation: {}, //current annotation
            // activeAnnotations: []

        }

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.renderEditor = this.renderEditor.bind(this);
        this.activeAnnotationComparator = this.activeAnnotationComparator.bind(this);
        this.handleArrowPress = this.handleArrowPress.bind(this);
    }

    handleArrowPress(value) {
        if (this.state.imageIndex + value === this.props.imageArray.length) return this.setState({ imageIndex: 0 });
        else if (this.state.imageIndex + value === -1) return this.setState({ imageIndex: this.props.imageArray.length - 1 });
        else {
            return this.setState((state) => ({ imageIndex: state.imageIndex + value }));
        }
    }

    onChange(annotation) {
        // console.log(annotation);
        this.setState({ annotation })
    }

    onSubmit(annotation) {
        this.setState({ annotation: {} },
            this.props.onAnnotationSubmit(annotation, this.state.imageIndex));
        // const { geometry, data } = annotation
        //  this.setState({
        //   annotation: {},
        //   annotations: this.state.annotations.concat({
        //     geometry,
        //     data: {
        //       ...data,
        //       id: Math.random()
        //     }
        //   })
        // })
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



    activeAnnotationComparator(a, b) {
        return a.data.id === b
    }

    render() {
        return (
            <>
                <div style={{ display: 'flex' }}  >
                    <Annotation
                        src={
                            // "https://pics.dmm.co.jp/mono/movie/adult/venx004/venx004pl.jpg"
                            this.props.imageArray[this.state.imageIndex]
                        }
                        // alt='Two pebbles anthropomorphized holding hands'
                        disableOverlay={this.props.hideAnnotations}
                        annotations={!this.props.hideAnnotations ? this.props.annotations[this.state.imageIndex] : []}
                        activeAnnotationComparator={this.activeAnnotationComparator}
                        activeAnnotations={this.props.activeAnnotations}
                        type={this.state.type}
                        value={this.state.annotation}
                        onChange={this.onChange}
                        onSubmit={this.onSubmit}
                        renderEditor={this.renderEditor}
                    />
                </div>
                <button onClick={() => this.handleArrowPress(-1)}>Previous</button>
                <button onClick={() => this.handleArrowPress(1)}>Next</button>
                <button onClick={this.props.toggleAnnotations}>Show/Hide All Annotations</button>
            </>
        )
    }


}

export default CustomImageSlider;