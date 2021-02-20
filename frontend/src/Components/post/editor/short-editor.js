import React from 'react';
import { withFirebase } from '../../../Firebase';
import ImageSlider from '../../image-carousel';
import ImageDrop from './sub-components/image-drop';
import FileDisplayContainer from './sub-components/file-display-container';
import TextContainer from './sub-components/text-container';
import './short-editor.scss';

var isAdvancedUpload = function () {
    var div = document.createElement('div');
    return (('draggable' in div)
        || ('ondragstart' in div && 'ondrop' in div))
        && 'FormData' in window
        && 'FileReader' in window;
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
        this.renderTextContainer = this.renderTextContainer.bind(this);
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
    handleFiles = (files) => {
        let invalidFound = false;
        for (let i = 0; i < files.length; i++) {
            if (this.validateFile(files[i])) {
                this.props.onSelectedFileChange(files[i]);

            } else {
                invalidFound = true;
                files[i]['invalid'] = true;
                this.props.onSelectedFileChange(files[i]);
                this.setErrorMessage('File type not permitted');
                this.props.onUnsupportedFileChange(files[i]);
            }
        }

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
        return fileName.substring(
            fileName.lastIndexOf('.') + 1, fileName.length)
            || fileName;
    }

    removeFile = (name) => {
        console.log(name);
        console.log("asdfadf");
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
        invalidFound && this.props.textPageText.length === 0 ?
            (this.props.onDisablePost(true))
            :
            (this.props.onDisablePost(false));
    }

    openImageModal = (file) => {
        const that = this;
        const reader = new FileReader();
        this.modalRef.current.style.display = "block";
        reader.readAsDataURL(file);
        reader.onload = function (e) {
            that
                .modalImageRef
                .current.style
                .backgroundImage = `url(${e.target.result})`;
        }
    }

    closeModal = () => {
        this.modalRef.current.style.display = "none";
        this.modalImageRef.current.style.backgroundImage = 'none';
    }

    renderTextContainer() {
        return (
            <TextContainer
                validFilesLength={this.props.validFiles.length}
                isPaginated={this.props.isPaginated}
                onPaginatedChange={this.props.onPaginatedChange}
                onTextChange={this.props.onTextChange}
                textPageText={this.props.textPageText}
                imageIndex={this.props.imageIndex}
            />
        )
    }

    render() {

        if (!isAdvancedUpload) {
            console.log("Sorry, this is not a modern browser! Try another browser.");
        }

        if (this.props.validFiles.length === 0) {
            return (
                <>
                    <div id="shorteditor-text-container">
                        {this.renderTextContainer()}

                    </div>
                    {this.props.unsupportedFiles.length ?
                        (<p>Please remove all unsupported files.</p>) : ('')}
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
            console.log("short-editor")
            return (
                <>
                    <div id="shorteditor-main-container">
                        <div id="shorteditor-hero-container">
                            {this.props.unsupportedFiles.length ?
                                <p>Please remove all unsupported files.</p> : ''}
                            <div id="shorteditor-image-slider-container">
                                <ImageSlider
                                    disableAnnotations={true}
                                    onIndexChange={this.props.onIndexChange}
                                    imageArray={this.props.imageArray}
                                />
                            </div>
                        </div>
                        <div id="shorteditor-side-container">
                            {this.renderTextContainer()}
                        </div>
                    </div>
                    <div id="shorteditor-file-manager-container">
                        <ImageDrop
                            reference={this.fileInputRef}
                            dragOver={this.dragOver}
                            dragEnter={this.dragEnter}
                            dragLeave={this.dragLeave}
                            fileDrop={this.fileDrop}
                            fileInputClicked={this.fileInputClicked}
                            filesSelected={this.filesSelected}
                        />
                        <FileDisplayContainer
                            onSortEnd={this.props.onSortEnd}
                            validFiles={this.props.validFiles}
                            openImageModal={this.openImageModal}
                            removeFile={this.removeFile}
                            fileType={this.fileType}
                            fileSize={this.fileSize}
                            errorMessage={this.state.errorMessage}
                        />
                    </div>
                </>
            );
        }
    }

}

export default withFirebase(ShortEditor);