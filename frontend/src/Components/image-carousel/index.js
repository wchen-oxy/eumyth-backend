import React, { useRef } from "react";
import Slider from "react-slick";

// https://css-tricks.com/centering-css-complete-guide/#center-vertically
//Explains the weird -50% and top 50% thing
function PrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block", background: "red", transform: `translate(${100}px, ${-50}%)`, zIndex: 2, top: "50%" }}
      onClick={onClick}
    />
  );
}

function NextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block", background: "red", transform: `translate(${-100}px, ${-50}%)`, zIndex: 2, top: "50%" }}
      onClick={onClick}
    />
  );
}
const settings = {
  nextArrow: <NextArrow />,
  prevArrow: <PrevArrow />,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1
};
class ImageSlider extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      transformedImageArray: null
    }
    this.loadImage = this.loadImage.bind(this);
    this.transformImageProp = this.transformImageProp.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    console.log(this.props.fileArray);
    if (this._isMounted && this.props.fileArray.length !== 0) {
      this.props.setImageArray(this.props.fileArray);
      this.transformImageProp();
    } 
  }

  componentWillUnmount() {
    this._isMounted = false;
  }


  transformImageProp(){
    let imageArray = this.props.fileArray;
    Promise.all(imageArray.map((file) => this.loadImage(file)))
    .then(
      newArray =>
        newArray.map(item =>
          item = (
            <div className="photo-container">
              <img className="photo" src={item} alt='image not loaded' />
            </div>
          ))
    ).then(result => {
      console.log(result);
      this.setState({ transformedImageArray: result })
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
  render() {
    const container =
      (!!this.state.transformedImageArray ? this.state.transformedImageArray : <p>IMAGE IS STILL LOADING</p>);
    return (
      <Slider {...settings}>
        {container}
      </Slider>
    );
  }
}

export default ImageSlider;