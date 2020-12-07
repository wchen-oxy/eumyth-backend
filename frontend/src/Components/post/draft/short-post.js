import React from 'react';
import ShortEditor from '../editor/short-editor';
import ReviewPost from './review-post';
import "../index.scss";

const NONE = "NONE";
const INITIAL = "INITIAL";
const REVIEW = "REVIEW";
const SHORT = "SHORT";
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
      window: INITIAL,
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
    this.handleCaptionStyleChange = this.handleCaptionStyleChange.bind(this);
    this.handleSortEnd = this.handleSortEnd.bind(this);


  }
  handleIndexChange(value) {
    this.setState({ imageIndex: value });
  }

  // handlePaginatedToggle() {
  //   this.setState((state) => ({ isPaginated: !state.isPaginated }))
  // }

  handleCaptionStyleChange() {
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
      if (window.confirm("Switching back will remove all your captions except for the first one. Keep going?")) {
        const textData = this.state.textData[0];
        this.setState({ textData: textData, isPaginated: false });
      }
    }
  }

  // handleTitleChange(e)

  setImageArray(imageArray) {
    this.setState({ imageArray: imageArray });
  }

  setSelectedFiles(value) {
    this.setState({ selectedFiles: value },
      this.generateValidFiles
    )
  }

  setValidFiles(value) {
    this.setState({ validFiles: value })
  }

  setUnsupportedFiles(value) {
    this.setState({ unsupportedFiles: value })
  }

  handleTextChange(e) {
    // console.log(e.target.value);
    const text = e.target.value;
    if (e.target.name === TITLE) {
      this.setState({ previewTitle: text });
    }
    else {
      let newState;
      if (this.state.isPaginated) {
        let updatedArray = this.state.textData;
        updatedArray[this.state.imageIndex] = text;
        newState = updatedArray;
      }
      else {
        newState = text;
      }
      this.setState((state) => ({
        textData: newState,
        postDisabled: (text.length === 0) && (state.validFiles.length === 0 || state.unsupportedFiles.length > 0)
      }));
    }

  }

  handleUnsupportedFileChange(file) {
    this.setState((state) => ({ unsupportedFiles: state.unsupportedFiles.concat(file) }));
  }


  handleSelectedFileChange(file) {
    this.setState((state) => ({ selectedFiles: state.selectedFiles.concat(file) }), this.generateValidFiles);
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


  handleSortEnd({oldIndex, newIndex}) {
    const items = Array.from(this.state.validFiles);
    const [reorderedItem] = items.splice(oldIndex, 1);
    items.splice(newIndex, 0, reorderedItem);
    this.setState({validFiles: items});
}


  render() {
    console.log(this.state.validFiles);
    if (this.state.window === INITIAL) {
      return (
        <div className="flex-display flex-direction-column small-post-window">
          <div className="post-button-container">
            <h2>Placeholder for short</h2>
            <div id="button-container">
              <span id="toggle-button-span">
                <button id="toggle-button" value={NONE} onClick={e => this.props.onPostTypeSet(e.target.value, false)}>Return</button>
              </span>
              <span id="post-button-span">
                <button id="post-button" value={REVIEW} disabled={this.state.postDisabled} onClick={e => this.handleClick(e.target.value)}>Review Post</button>
              </span>
            </div>
          </div>
          <ShortEditor
            username={this.props.username}
            selectedFiles={this.state.selectedFiles}
            validFiles={this.state.validFiles}
            unsupportedFiles={this.state.unsupportedFiles}
            isPaginated={this.state.isPaginated}
            textPageText={this.state.textData}
            textPageIndex={this.state.imageIndex}
            onSortEnd={this.handleSortEnd}
            setImageArray={this.setImageArray}
            onCaptionStyleChange={this.handleCaptionStyleChange}
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
          displayPhoto={this.props.displayPhoto}
          isPaginated={this.state.isPaginated}
          previewTitle={this.state.previewTitle}
          closeModal={this.props.closeModal}
          postType={SHORT}
          onClick={this.handleClick}
          imageArray={this.state.imageArray}
          textData={this.state.textData}
          username={this.props.username}
          preferredPostType={this.props.preferredPostType}
          pursuits={this.props.pursuits}
          handlePreferredPostTypeChange={this.props.handlePreferredPostTypeChange}
        />
      );
    }
  }
}
export default ShortPost;