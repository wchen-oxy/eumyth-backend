import React from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { withFirebase } from '../../../Firebase';
import ImageSlider from '../../image-carousel';
import TextareaAutosize from 'react-textarea-autosize';
import ImageDrop from './sub-components/image-drop';
import FileDisplayContainer from './sub-components/file-display-container';
import TextContainer from './sub-components/text-container';
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
        };

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
        console.log("validity");
        console.log(invalidFound);

        this.updateDisabilityState(invalidFound);

    }

    validateFile(file) {
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
        invalidFound && this.props.textPageText.length === 0 ? this.props.onDisablePost(true) : this.props.onDisablePost(false);
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

        const textContainer = (
            <div id="text-container flex-display">
                <div className=" description-container flex-display flex-direction-column">
                    <h4>{this.props.username}</h4>
                    {/* {this.props.validFiles.length > 0 && !this.props.isPaginated ? <button onClick={this.props.onCaptionStyleChange}>Caption Photos Individually</button> : <></>}
                    {this.props.validFiles.length > 0 && this.props.isPaginated ? <button onClick={this.props.onCaptionStyleChange}>Return to Single Caption</button> : <></>} */}
                    <div id="description-input-container">
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
        }
        if (this.props.validFiles.length === 0) {
            return (
                <>
                    <div className="post-preview-container flex-display flex-direction-column"  >
                        {textContainer}
                    </div>
                    {this.props.unsupportedFiles.length ? <p>Please remove all unsupported files.</p> : ''}
                    <ImageDrop
                        reference={this.fileInputRef}
                        dragOver={this.dragOver}
                        dragEnter={this.dragEnter}
                        dragLeave={this.dragLeave}
                        fileDrop={this.fileDrop}
                        fileInputClicked={this.fileInputClicked}
                        filesSelected={this.filesSelected}
                    />
                </>
            );
        }
        else {
            return (
                <>
                    <div className="short-viewer-main-container flex-display">
                        <div className="short-viewer-hero-container flex-display flex-direction-column black-background">
                            {this.props.unsupportedFiles.length ? <p>Please remove all unsupported files.</p> : ''}
                            <ImageSlider onIndexChange={this.props.onIndexChange} fileArray={this.props.validFiles} setImageArray={this.props.setImageArray} />
                        </div>
                        <div className="short-viewer-side-container">
                            <TextContainer
                                validFilesLength={this.props.validFiles.length}
                                isPaginated={this.props.isPaginated}
                                onCaptionStyleChange={this.props.onCaptionStyleChange}
                                onTextChange={this.props.onTextChange}
                                textPageText={this.props.textPageText}
                                textPageIndex={this.props.textPageIndex}

                            />
                        </div>
                    </div>
                    <div className="flex-display flex-direction-column">
                        <ImageDrop
                            reference={this.fileInputRef}
                            dragOver={this.dragOver}
                            dragEnter={this.dragEnter}
                            dragLeave={this.dragLeave}
                            fileDrop={this.fileDrop}
                            fileInputClicked={this.fileInputClicked}
                            filesSelected={this.filesSelected}
                        />
                        <DragDropContext onDragEnd={this.props.handleDragEnd}>
                            <FileDisplayContainer
                                validFiles={this.props.validFiles}
                                openImageModal={this.openImageModal}
                                removeFile={this.removeFile}
                                fileType={this.fileType}
                                fileSize={this.fileSize}
                                errorMessage={this.state.errorMessage}
                            />
                        </DragDropContext>
                    </div>
                </>
            );
        }
    }

}

export default withFirebase(ShortEditor);