import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";



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

// https://css-tricks.com/centering-css-complete-guide/#center-vertically
//Explains the weird -50% and top 50% thing

class ImageSlider extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      transformedImageArray: null,
      displayedItemCount: 0
    }
    this.loadImage = this.loadImage.bind(this);
    this.transformImageProp = this.transformImageProp.bind(this);
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
    let count = 0;
    Promise.all(imageArray.map((file) => this.loadImage(file)))
      .then(
        newArray =>
          newArray.map(item =>
            item = (
              <div className="image-container">
                <img alt="" className="preview-image" key={count++} src={item} />
              </div>
            ))
      ).then(result => {
        this.setState({ transformedImageArray: result, displayedItemCount: result.length })
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
    const settings = {
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      centerPadding: 0,
      nextArrow: <Arrow direction="right" />,
      prevArrow: <Arrow direction="left" />

    };

    const container =
      (!!this.state.transformedImageArray ? this.state.transformedImageArray : <p>IMAGE IS STILL LOADING</p>);
    return (
      <Slider afterChange={index => (this.props.onIndexChange(index))} {...settings}>
        {container}
      </Slider>
    );
  }
}

export default ImageSlider;