import React from 'react';
import ShortEditor from "../post/short-editor";
import ReviewPost from "./review-post";
import './short-post.scss';

class ShortPost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFiles: [],
      validFiles: [],
      unsupportedFiles: [],
      imageArray: [],
      postDescription: '',
      postDisabled: true,
      window: 'initial',
      title: ''
    };

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
    if (e.target.name === "title") {
      console.log(text);
      return this.setState({title : text});}

    console.log(text.length);
    this.setState((state) => ({ 
      postDescription: text,
      postDisabled: (text.length === 0) && (state.validFiles.length === 0 || state.unsupportedFiles.length > 0 )
     })
     )
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

  handleClick(e, value) {
    e.preventDefault();
    this.setState({ window: value});
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


  render() {
    if (this.state.window === "initial") {
      return (
        <div className="short-post-container" id="short-post-container">
          <div>
            <h2>Placeholder for short</h2>
            <div id="button-container">
              <span id="toggle-button-span">
                <button id="toggle-button" value="main" onClick={e => this.props.handleClick(e, e.target.value, true)}>Return</button>
              </span>
              <span id="post-button-span">
                <button id="post-button" value="review" disabled={this.state.postDisabled} onClick={e => this.handleClick(e, e.target.value)}>Review Post</button>
              </span>
            </div>
          </div>
       
          <ShortEditor
            username={this.props.username}
            selectedFiles={this.state.selectedFiles}
            validFiles={this.state.validFiles}
            unsupportedFiles={this.state.unsupportedFiles}
            setImageArray={this.setImageArray}
            title={this.state.title}
            text={this.state.postDescription}
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
    else{

      return (
       <ReviewPost 
       title = {this.state.title}
       postType={"short"} 
       onClick={this.handleClick} 
       imageArray={this.state.imageArray} 
       postText={this.state.postDescription}
       username={this.props.username}
       preferredPostType= {this.props.preferredPostType }
       pursuits = {this.props.pursuits}
       handlePreferredPostTypeChange = {this.props.handlePreferredPostTypeChange}
       />
       
      );
    }
  }
}
export default ShortPost;