import React from 'react';
import Annotation from 'react-image-annotation';

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
    // console.log(annotation);
    this.setState({ annotation })
  }

  onSubmit(annotation) {
    this.setState({ annotation: {} },
      this.props.onAnnotationSubmit(annotation));
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
        <input
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
    console.log(this.state.annotation);
    console.log(this.state.annotations);
    return (
      <div style={{ zIndex: 999 }}>
        <Annotation
          src={
            // "https://pics.dmm.co.jp/mono/movie/adult/venx004/venx004pl.jpg"
            this.props.imageSource
          }
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
      //   <Comments>
      //   {this.state.annotations.map(annotation => (
      //     <Comment
      //       onMouseOver={this.onMouseOver(annotation.data.id)}
      //       onMouseOut={this.onMouseOut(annotation.data.id)}
      //       key={annotation.data.id}
      //     >
      //       {annotation.data.text}
      //     </Comment>
      //   ))}
      // </Comments>

    )
  }


}

export default Annotator;