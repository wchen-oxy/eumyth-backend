import React from 'react';
import Annotation from 'react-image-annotation';
import TextareaAutosize from "react-textarea-autosize";

class Annotator extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      // annotations: [], //finished annotation
      annotation: {}, //current annotation
      // activeAnnotations: []

    }

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.renderEditor = this.renderEditor.bind(this);
    this.activeAnnotationComparator = this.activeAnnotationComparator.bind(this);
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

  activeAnnotationComparator(a, b) {
    return a.data.id === b
  }

  render() {
    return (
      <div style={{ display: 'flex' }}>
        <Annotation
          src={this.props.imageSource}
          alt='Two pebbles anthropomorphized holding hands'
          annotations={this.props.annotations}
          activeAnnotationComparator={this.activeAnnotationComparator}
          activeAnnotations={this.props.activeAnnotations}
          type={this.state.type}
          value={this.state.annotation}
          onChange={this.onChange}
          onSubmit={this.onSubmit}
          renderEditor={this.renderEditor}
        />
      </div>


    )
  }


}

export default Annotator;