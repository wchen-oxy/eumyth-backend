import React from 'react';
import ShortEditor from '../editor/short-editor';
import ReviewPost from './review-post';
import { INITIAL_STATE, REVIEW_STATE, SHORT, NONE } from "../../constants/flags";
import "./short-post.scss";

const TITLE = "TITLE";

class ShortPost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFiles: [],
      validFiles: [],
      unsupportedFiles: [],
      imageArray: [],
      imageIndex: 0,
      textData: '',
      isPaginated: false,
      postDisabled: true,
      window: INITIAL_STATE,
      previewTitle: null
    };

    this.handleIndexChange = this.handleIndexChange.bind(this);
    this.setSelectedFiles = this.setSelectedFiles.bind(this);
    this.setValidFiles = this.setValidFiles.bind(this);
    this.setUnsupportedFiles = this.setUnsupportedFiles.bind(this);
    this.setImageArray = this.setImageArray.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleUnsupportedFileChange = this.handleUnsupportedFileChange.bind(this);
    this.handleSelectedFileChange = this.handleSelectedFileChange.bind(this);
    this.handleDisablePost = this.handleDisablePost.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.generateValidFiles = this.generateValidFiles.bind(this);
    this.handlePaginatedChange = this.handlePaginatedChange.bind(this);
    this.handleSortEnd = this.handleSortEnd.bind(this);
    this.loadImage = this.loadImage.bind(this);
    this.transformImageProp = this.transformImageProp.bind(this);
  }

  transformImageProp(validFiles) {
    let imageArray = validFiles;
    Promise.all(imageArray.map((file) => this.loadImage(file)))
      .then(result => {
        this.setState({
          imageArray: result,
          displayedItemCount: result.length,
          validFiles: validFiles
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

  handleIndexChange(value) {
    this.setState({ imageIndex: value });
  }

  handlePaginatedChange() {
    if (this.state.isPaginated === false) {
      let postArray = [];
      const imageCount = this.state.validFiles.length;
      postArray.push(this.state.textData);
      for (let i = 1; i < imageCount; i++) {
        postArray.push([]);
      }
      this.setState({ textData: postArray, isPaginated: true });
    }
    else {
      if (window.confirm(`Switching back will remove all your captions except 
                          for the first one. Keep going?`
      )) {
        const textData = this.state.textData[0];
        this.setState({ textData: textData, isPaginated: false });
      }
    }
  }

  setImageArray(imageArray) {
    this.setState({ imageArray: imageArray });
  }

  setSelectedFiles(value) {
    this.setState({ selectedFiles: value },
      this.generateValidFiles
    )
  }

  setValidFiles(value) {
    this.transformImageProp(value);
  }

  setUnsupportedFiles(value) {
    this.setState({ unsupportedFiles: value })
  }

  handleTextChange(e) {
    const text = e.target.value;
    if (e.target.name === TITLE) {
      this.setState({ previewTitle: text });
    }
    else {
      let newState;
      const areFilesValid = this.state.validFiles.length === 0
        || this.state.unsupportedFiles.length > 0;
      if (this.state.isPaginated) {
        let updatedArray = this.state.textData;
        updatedArray[this.state.imageIndex] = text;
        newState = updatedArray;
      }
      else {
        newState = text;
      }
      this.setState(({
        textData: newState,
        postDisabled: (text.length === 0) && areFilesValid
      }));
    }

  }

  handleUnsupportedFileChange(file) {
    this.setState((state) => ({
      unsupportedFiles: state.unsupportedFiles.concat(file)
    }));
  }


  handleSelectedFileChange(file) {
    this.setState((state) => ({
      selectedFiles: state.selectedFiles.concat(file)
    }), this.generateValidFiles);
  }


  handleDisablePost(disabled) {
    this.setState({ postDisabled: disabled });
  }

  handleClick(value) {
    this.setState({ window: value });
  }


  generateValidFiles() {
    let selectedFiles = this.state.selectedFiles;
    let filteredArr = selectedFiles.reduce((acc, current) => {
      const x = acc.find(item => item.name === current.name);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
    this.setValidFiles(filteredArr);
  }


  handleSortEnd({ oldIndex, newIndex }) {

    const items = Array.from(this.state.validFiles);
    const [reorderedItem] = items.splice(oldIndex, 1);
    items.splice(newIndex, 0, reorderedItem);
    this.transformImageProp(items);
    // this.setState({ validFiles: items });
  }


  render() {
    if (this.state.window === INITIAL_STATE) {
      return (
        <div id="shortpost-window">
          <div className="shortpost-button-container">
            <h2>Placeholder for short</h2>
            <div>
              <span >
                <button
                  value={NONE}
                  onClick={e => this.props.onPostTypeSet(e.target.value, false)}
                >
                  Return
                  </button>
              </span>
              <span >
                <button
                  value={REVIEW_STATE}
                  disabled={this.state.postDisabled}
                  onClick={e => this.handleClick(e.target.value)}
                >
                  Review Post
                  </button>
              </span>
            </div>
          </div>
          <ShortEditor
            username={this.props.username}
            selectedFiles={this.state.selectedFiles}
            validFiles={this.state.validFiles}
            imageArray={this.state.imageArray}
            unsupportedFiles={this.state.unsupportedFiles}
            isPaginated={this.state.isPaginated}
            textPageText={this.state.textData}
            imageIndex={this.state.imageIndex}
            onSortEnd={this.handleSortEnd}
            setImageArray={this.setImageArray}
            onPaginatedChange={this.handlePaginatedChange}
            onIndexChange={this.handleIndexChange}
            onTextChange={this.handleTextChange}
            onSelectedFileChange={this.handleSelectedFileChange}
            onUnsupportedFileChange={this.handleUnsupportedFileChange}
            onDisablePost={this.handleDisablePost}
            setValidFiles={this.setValidFiles}
            setSelectedFiles={this.setSelectedFiles}
            setUnsupportedFiles={this.setUnsupportedFiles}
          />
        </div>
      );
    }
    else {
      return (
        <ReviewPost
          previousState={INITIAL_STATE}
          displayPhoto={this.props.displayPhoto}
          isPaginated={this.state.isPaginated}
          previewTitle={this.state.previewTitle}
          closeModal={this.props.closeModal}
          postType={SHORT}
          setPostStage={this.handleClick}
          imageArray={this.state.validFiles}
          textData={this.state.textData}
          username={this.props.username}
          preferredPostType={this.props.preferredPostType}
          pursuitNames={this.props.pursuitNames}
          handlePreferredPostTypeChange={this.props.handlePreferredPostTypeChange}
        />
      );
    }
  }
}
export default ShortPost;