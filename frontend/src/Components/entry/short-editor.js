import React, { useRef, createRef } from 'react';
import DanteEditor from 'Dante2';
import { convertToHTML } from 'draft-convert';
import { ImageBlockConfig } from "Dante2/package/es/components/blocks/image.js";
import { VideoBlockConfig } from "Dante2/package/es/components/blocks/video";
import { PlaceholderBlockConfig } from "Dante2/package/es/components/blocks/placeholder";
import { EmbedBlockConfig } from "Dante2/package/es/components/blocks/embed";
import DragDropFiles from './sub-components/drag-drop-file';
import { withFirebase } from '../../Firebase';
import AxiosHelper from '../../Axios/axios';
import ImageSlider from '../image-carousel';
import './short-editor.scss';

var isAdvancedUpload = function () {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}();

class ShortEditor extends React.Component {
    constructor(props) {
        super(props);
        this.fileInputRef = React.createRef();
        this.modalImageRef = React.createRef();
        this.modalRef = React.createRef();
       

        this.state = {
            content: this.props.content,
            username: this.props.firebase.returnUsername(),
            imageExists: false,
            postType: '',
           
            selectedFiles: [],
            validFiles: [],
            unsupportedFiles: [],
            errorMessage: ''
        }
        this.handleImagePost = this.handleImagePost.bind(this);
        // this.handleMoveDropzone = this.handleMoveDropzone.bind(this);
        this.setSelectedFiles = this.setSelectedFiles.bind(this);
        this.setValidFiles = this.setValidFiles.bind(this);
        this.setUnsupportedFiles = this.setUnsupportedFiles.bind(this);
        this.setErrorMessage = this.setErrorMessage.bind(this);
        this.indicateImageExists = this.indicateImageExists.bind(this);
        this.generateValidFiles = this.generateValidFiles.bind(this);

    }

    
    componentDidMount() {

    }
    indicateImageExists(boolean) {
        this.setState({ imageExists: boolean })
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
    setErrorMessage(value) {
        this.setState({ value });
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



    handleImagePost(e) {
        e.preventDefault();
        const file = document.getElementById('inputGroupFile01').files;
        const formData = new FormData();
        formData.append('file', file[0]);
        if (file[0]) AxiosHelper.postImage(formData)
            .then(result => {
            }).then(
                () =>
                    document
                        .getElementById('img')
                        .setAttribute('src', `http://localhost:5000/entry/image/${file[0].name}`)
            );
    }

    // handleMoveDropzone(e) {
    //     e.preventDefault();
    //     console.log("3");
    // }

    preventDefault = (e) => {
        e.preventDefault();
        // e.stopPropagation();
    }

    dragOver = (e) => {
        this.preventDefault(e);
    }

    dragEnter = (e) => {
        this.preventDefault(e);
    }

    dragLeave = (e) => {
        this.preventDefault(e);
    }

    fileDrop = (e) => {
        this.preventDefault(e);
        const files = e.dataTransfer.files;
        if (files.length) {
            this.handleFiles(files);
        }
    }

    filesSelected = () => {
        if (this.fileInputRef.current.files.length) {
            this.handleFiles(this.fileInputRef.current.files);
        }
    }

    fileInputClicked = () => {
        this.fileInputRef.current.click();
    }
    //TODO CHANGE ALL THE SETSTATE FUNCTIONS TO UPDATE THE EXISTING ARRAY
    handleFiles = (files) => {
        let invalidFound = false;
        for (let i = 0; i < files.length; i++) {
            if (this.validateFile(files[i])) {
                this.setState((state) => ({ selectedFiles: state.selectedFiles.concat(files[i]) }), this.generateValidFiles);
            } else {
                invalidFound = true;
                files[i]['invalid'] = true;
                this.setState((state) => ({ selectedFiles: state.selectedFiles.concat(files[i]) }), this.generateValidFiles);
                this.setErrorMessage('File type not permitted');
                this.setState((state) => ({ unsupportedFiles: state.unsupportedFiles.concat(files[i]) }));
            }
        }
        this.updateDisabilityState(invalidFound);

    }

    validateFile = (file) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/x-icon'];
        if (validTypes.indexOf(file.type) === -1) {
            return false;
        }
        return true;
    }

    fileSize = (size) => {
        if (size === 0) {
            return '0 Bytes';
        }
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(size) / Math.log(k));
        return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    fileType = (fileName) => {
        return fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length) || fileName;
    }

    removeFile = (name) => {
        const index = this.state.validFiles.findIndex(e => e.name === name);
        const index2 = this.state.selectedFiles.findIndex(e => e.name === name);
        const index3 = this.state.unsupportedFiles.findIndex(e => e.name === name);
        let validFiles = this.state.validFiles;
        let selectedFiles = this.state.selectedFiles;
        let unsupportedFiles = this.state.unsupportedFiles;

        validFiles.splice(index, 1);
        selectedFiles.splice(index2, 1);
        this.setValidFiles(validFiles);
        this.setSelectedFiles(selectedFiles);
        if (index3 !== -1) {
            unsupportedFiles.splice(index3, 1);
            this.setUnsupportedFiles(unsupportedFiles);
        }

        if (validFiles.length > 0 && unsupportedFiles.length === 0) {
            this.updateDisabilityState(false);
        }
        else {
            this.updateDisabilityState(true);
        }
    }

    updateDisabilityState = (invalidFound) => {
        invalidFound ? this.props.disablePost(true) : this.props.disablePost(false);
    }

    openImageModal = (file) => {
        const that = this;
        const reader = new FileReader();
        this.modalRef.current.style.display = "block";
        reader.readAsDataURL(file);
        reader.onload = function (e) {
            that.modalImageRef.current.style.backgroundImage = `url(${e.target.result})`;
        }
    }

    closeModal = () => {
        this.modalRef.current.style.display = "none";
        this.modalImageRef.current.style.backgroundImage = 'none';
    }

    // closeUploadModal = () => {
    //     this.uploadModalRef.current.style.display = 'none';
    // }

    render() {
        const miniDropContainer = (
            <div className="mini-drop-image-container"
                onDragOver={this.dragOver}
                onDragEnter={this.dragEnter}
                onDragLeave={this.dragLeave}
                onDrop={this.fileDrop}
                onClick={this.fileInputClicked}
            >
                <div className="drop-message">
                    <div className="upload-icon"></div>
                Drag and Drop files here or click to select file(s)
            </div>
                <input
                    ref={this.fileInputRef}
                    className="file-input"
                    type="file"
                    multiple
                    onChange={this.filesSelected}
                />
            </div>
        );

        const fileDisplayContainer = (
            <div className="file-display-container">
                {
                    this.state.validFiles.map((data, i) =>
                        <div className="file-status-bar" key={i}>
                            <div onClick={!data.invalid ? () => this.openImageModal(data) : () => this.removeFile(data.name)}>
                                <div className="file-type-logo"></div>
                                <div className="file-type">{this.fileType(data.name)}</div>
                                <span className={`file-name ${data.invalid ? 'file-error' : ''}`}>{data.name}</span>
                                <span className="file-size">({this.fileSize(data.size)})</span> {data.invalid && <span className='file-error-message'>({this.state.errorMessage})</span>}
                            </div>
                            <div className="file-remove" onClick={() => this.removeFile(data.name)}>X</div>
                        </div>
                    )
                }
            </div>
        );
        const modal = (
            <div className="modal" ref={this.modalRef}>
                <div className="overlay"></div>
                <span className="close" onClick={(() => this.closeModal())}>X</span>
                <div className="modal-image" ref={this.modalImageRef}></div>
            </div>
        );

        const textContainer = (
            <div id="text-container">
                <div className="description-container">
                    <h4>{this.props.username}</h4>
                    <div id="description-input-container" >
                        <textarea id='short-post-text' placeholder='Write something here.' value={this.state.value} onChange={this.props.handleChange}/>
                        {/* <form>
                            <input id='short-post-text' type='text' placeholder='Write something here.'>
                            </input>
                        </form> */}
                    </div>
                </div>
            </div>
        );

        if (!isAdvancedUpload) {
            console.log("It's not a modern browser!");
            //   advBrowserText = (<label for="file"><strong>Choose a file</strong><span className="box__dragndrop"> or drag it here</span>.</label>);

        }
        if (this.state.validFiles.length === 0) {
            return (
                <div className="short-editor-container">
                    <div id="post-preview-container">
                        <div className="photo-upload-container">
                            {/* {unsupportedFiles.length === 0 && validFiles.length ? <button className="file-upload-btn" onClick={() => uploadFiles()}>Upload Files</button> : ''} */}
                            {this.state.unsupportedFiles.length ? <p>Please remove all unsupported files.</p> : ''}
                            <div className="drop-image-container"
                                onDragOver={this.dragOver}
                                onDragEnter={this.dragEnter}
                                onDragLeave={this.dragLeave}
                                onDrop={this.fileDrop}
                                onClick={this.fileInputClicked}
                            >
                                <div className="drop-message">
                                    <div className="upload-icon"></div>
                            Drag and Drop files here or click to select file(s)
                                </div>
                                <input
                                    ref={this.fileInputRef}
                                    className="file-input"
                                    type="file"
                                    multiple
                                    onChange={this.filesSelected}
                                />
                            </div>
                            {/* {fileDisplayContainer} */}
                        </div>
                        {textContainer}
                    </div>

                    {/* <div className="box__input">
                            <form className="box" method="post" action="" enctype="multipart/form-data">
                                    <input
                                        name="files[]"
                                        type="file"
                                        multiple
                                        className="custom-file-input box__file"
                                        id="inputGroupFile01 file"
                                        aria-describedby="inputGroupFileAddon01"
                                        data-multiple-caption="{count} files selected"  
                                        onChange={this.handleImagePost}
                                    />
                                    <button className="box__button" type="submit">Upload</button>
                                </form>
                            </div> */}


                </div>
            );
        }
        else {
            return (
                <>
                    <div className="short-editor-container vertical-grouping">
                        <div id="post-preview-container">
                            <div className="photo-upload-container">
                                {this.state.unsupportedFiles.length ? <p>Please remove all unsupported files.</p> : ''}
                                <ImageSlider fileArray={this.state.validFiles} setImageArray={this.props.setImageArray} />
                            </div>
                            {textContainer}
                        </div>
                        {modal}
                    </div>
                    <div className="short-editor-container ">
                        <div className="uploaded-file-container vertical-grouping">
                        {miniDropContainer}
                        {fileDisplayContainer}
                        </div>
                        <div className='vertical-grouping'>
                            <h3>Optional Fields</h3>
                                <label>Title</label>
                                <input placeholder='Title' />
                                <label for="start">Start date:</label>
                                <input 
                                    type="date" 
                                    id="start" 
                                    name="trip-start"
                                    min="1900-01-01"/>
                                <label>Minutes Spent</label>
                                <input type='number' min='0'/>
                        </div>
                        
                    </div>
                </>
            );
        }
    }

}

export default withFirebase(ShortEditor);