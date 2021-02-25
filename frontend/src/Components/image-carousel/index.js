import React from "react";
import Slider from "react-slick";
import Arrow from "./sub-components/arrow";
import Annotator from "./annotator";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./index.scss";

// https://css-tricks.com/centering-css-complete-guide/#center-vertically
//Explains the weird -50% and top 50% thing
const settings = {
  className: "slider-settings",
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  centerPadding: 0,
  nextArrow: <Arrow direction="right" />,
  prevArrow: <Arrow direction="left" />

};

class ImageSlider extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      imageArray: null,
      displayedItemCount: 0
    }

    this.renderImageContainers = this.renderImageContainers.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    if (this._isMounted) {
      this.setState({ imageArray: this.props.imageArray })
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.imageArray !== prevProps.imageArray) {
      this.setState({ imageArray: this.props.imageArray })
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  renderImageContainers(isLoaded) {
    let count = 0;
    if (isLoaded) {
      console.log(this.state.imageArray);
      return (
        this.state.imageArray.map(
          item => (
            <div
              className="imageslider-image-container"
              key={count++}
            >
              {this.props.disableAnnotations ? (
                <img
                  alt=""
                  key={count++}
                  src={item} />
              ) : (
                  <Annotator
                    imageSource={item}
                    annotations={this.props.annotations}
                    activeAnnotations={this.props.activeAnnotations}
                    onAnnotationSubmit={this.props.onAnnotationSubmit}
                  />
                )
              }
            </div>)
        ))
    }
    else {
      return <p>IMAGE IS STILL LOADING</p>;
    }
  }

  render() {

    return (
      <Slider afterChange={index => (this.props.onIndexChange(index))} {...settings}>
        {this.renderImageContainers(!!this.state.imageArray)}
      </Slider>
    );
  }
}

export default React.memo(ImageSlider);