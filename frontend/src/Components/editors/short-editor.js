import React from 'react';
import { withFirebase } from '../../Firebase';
import ImageSlider from '../image-carousel';
import TextareaAutosize from 'react-textarea-autosize';

import './short-editor.scss';

var isAdvancedUpload = function () {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}();

class ShortEditor extends React.Component {
    constructor(props) {
        super(props);
        this.fileInputRef = React.createRef();
        this.state = {
            errorMessage: '',

        }
        this.setErrorMessage = this.setErrorMessage.bind(this);
        this.validateFile = this.validateFile.bind(this);

    }


    setErrorMessage(value) {
        this.setState({ value });
    }

    preventDefault = (e) => {
        e.preventDefault();
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
                // this.setState((state) => ({ selectedFiles: state.selectedFiles.concat(files[i]) }), this.generateValidFiles);
                this.props.onSelectedFileChange(files[i]);

            } else {
                invalidFound = true;
                files[i]['invalid'] = true;
                // this.setState((state) => ({ selectedFiles: state.selectedFiles.concat(files[i]) }), this.generateValidFiles);
                this.props.onSelectedFileChange(files[i]);
                this.setErrorMessage('File type not permitted');
                // this.setState((state) => ({ unsupportedFiles: state.unsupportedFiles.concat(files[i]) }));
                this.props.onUnsupportedFileChange(files[i]);
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
        const index = this.props.validFiles.findIndex(e => e.name === name);
        const index2 = this.props.selectedFiles.findIndex(e => e.name === name);
        const index3 = this.props.unsupportedFiles.findIndex(e => e.name === name);
        let validFiles = this.props.validFiles;
        let selectedFiles = this.props.selectedFiles;
        let unsupportedFiles = this.props.unsupportedFiles;

        validFiles.splice(index, 1);
        selectedFiles.splice(index2, 1);
        this.props.setValidFiles(validFiles);
        this.props.setSelectedFiles(selectedFiles);
        if (index3 !== -1) {
            unsupportedFiles.splice(index3, 1);
            this.props.setUnsupportedFiles(unsupportedFiles);
        }

        if (validFiles.length > 0 && unsupportedFiles.length === 0) {
            this.updateDisabilityState(false);
        }
        else {
            this.updateDisabilityState(true);
        }
    }

    updateDisabilityState = (invalidFound) => {
        invalidFound && this.props.text.length === 0 ? this.props.onDisablePost(true) : this.props.onDisablePost(false);
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
                    this.props.validFiles.map((data, i) =>
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
        console.log(this.props.validFiles);
        const textContainer = (
            <div id="text-container">
                <div className="description-container">
                    <h4>{this.props.username}</h4>
                    {this.props.validFiles.length > 0 && !this.props.isPaginated ? <button onClick={this.props.onCaptionStyleChange}>Caption Photos Individually</button> : <></>}
                    {this.props.validFiles.length > 0 && this.props.isPaginated ? <button onClick={this.props.onCaptionStyleChange}>Return to Single Caption</button> : <></>}

                    {/* <input name="title" type="text" maxlength="140" placeholder="Optional Title" onChange={(e) => this.props.onTextChange(e)}></input> */}
                    {/* <TextareaAutosize name="title" id='short-post-text' placeholder='Write something here.' maxRows={2} onChange={this.props.onTextChange}  value={this.props.title} maxLength={140}/> */}
                    <div id="description-input-container" >
                        <TextareaAutosize
                            id='short-post-text'
                            placeholder='Write something here.'
                            onChange={this.props.onTextChange}
                            minRows={5}
                            value={
                                this.props.isPaginated ?
                                    this.props.textPageText[this.props.textPageIndex] :
                                    this.props.textPageText
                            }
                        />
                    </div>
                </div>
            </div>
        );

        if (!isAdvancedUpload) {
            console.log("It's not a modern browser!");
            //   advBrowserText = (<label for="file"><strong>Choose a file</strong><span className="box__dragndrop"> or drag it here</span>.</label>);

        }
        if (this.props.validFiles.length === 0) {
            return (
                <div className="short-editor-container">
                    <div className="post-preview-container" id="before-image-container">
                        {textContainer}
                    </div>

                    <div className="photo-upload-container">
                        {/* {unsupportedFiles.length === 0 && validFiles.length ? <button className="file-upload-btn" onClick={() => uploadFiles()}>Upload Files</button> : ''} */}
                        {this.props.unsupportedFiles.length ? <p>Please remove all unsupported files.</p> : ''}
                        <div className="drop-image-container" id="drop-image-container-before"
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
                    <div className="editor-component-container">
                        <div className="post-preview-container" id="after-image-container">
                            <div className="photo-upload-container">
                                {this.props.unsupportedFiles.length ? <p>Please remove all unsupported files.</p> : ''}
                                <ImageSlider onArrowClick={this.props.onArrowClick} fileArray={this.props.validFiles} setImageArray={this.props.setImageArray} />
                            </div>
                            {textContainer}
                        </div>
                    </div>
                    <div className="editor-component-container">
                        <div className="uploaded-file-container post-button-container">
                            {miniDropContainer}
                            {fileDisplayContainer}
                        </div>
                    </div>
                </>
            );
        }
    }

}

export default withFirebase(ShortEditor);