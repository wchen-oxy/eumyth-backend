import React from "react";
import Slider from "react-slick";
import Arrow from "./arrow";
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
    this.loadImage = this.loadImage.bind(this);
    this.transformImageProp = this.transformImageProp.bind(this);
    this.renderImageContainers = this.renderImageContainers.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    if (this._isMounted) {
      this.props.setImageArray(this.props.fileArray);
      this.transformImageProp();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.fileArray !== prevProps.fileArray) {
      this.props.setImageArray(this.props.fileArray);
      this.transformImageProp();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  transformImageProp() {
    let imageArray = this.props.fileArray;
    Promise.all(imageArray.map((file) => this.loadImage(file)))
      .then(result => {
        this.setState({
          imageArray: result,
          displayedItemCount: result.length
        })
      });
  }

  loadImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        resolve(e.target.result);
      };
      reader.onerror = function () {
        reject(reader.error);
      }
      reader.readAsDataURL(file);
    });
  }

  renderImageContainers(isLoaded) {
    let count = 0;
    if (isLoaded) {
      return (this.state.imageArray.map(item =>
        <div className="imageslider-image-container">
          <img alt="" key={count++} src={item} />
        </div>
      ))
    }
    else {
      return (<p>IMAGE IS STILL LOADING</p>);
    }
  }
  render() {

    return (
      <Slider afterChange={index => (this.props.onIndexChange(index))} {...settings}>
        {this.renderImageContainers(!!this.state.imageArray)
        }
      </Slider>
    );
  }
}

export default ImageSlider;