import React, { useRef } from 'react';
import DanteEditor from 'Dante2';
import { convertToHTML } from 'draft-convert';
import { ImageBlockConfig } from "Dante2/package/es/components/blocks/image.js";
import { VideoBlockConfig } from "Dante2/package/es/components/blocks/video";
import { PlaceholderBlockConfig } from "Dante2/package/es/components/blocks/placeholder";
import { EmbedBlockConfig } from "Dante2/package/es/components/blocks/embed";
import DragDropFiles from './sub-components/drag-drop-file';
import { withFirebase } from '../../Firebase';
import AxiosHelper from '../../Axios/axios';
import './short-editor.scss';

var isAdvancedUpload = function () {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}();

class ShortEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: this.props.content,
            username: this.props.firebase.returnUsername(),
            imageExists: false,
        }
        this.handleImagePost = this.handleImagePost.bind(this);
        this.handleMoveDropzone = this.handleMoveDropzone.bind(this);
        
    }

    handleImagePost(e) {
        e.preventDefault();
        const file = document.getElementById('inputGroupFile01').files;
        const formData = new FormData();
        formData.append('file', file[0]);
        if (file[0]) AxiosHelper.postImage(formData)
            .then(result => {
                console.log(result)
            }).then(
                () =>
                    document
                        .getElementById('img')
                        .setAttribute('src', `http://localhost:5000/entry/image/${file[0].name}`)
            );
        console.log(file[0]);

    }

    handleMoveDropzone(e) {
        e.preventDefault();
        console.log("3");
    }

    render() {
        // let advBrowserText = (<label for="file"><strong>Choose a file</strong>.</label>);
        
        if (!isAdvancedUpload) {
            console.log("It's not a modern browser!");
            //   advBrowserText = (<label for="file"><strong>Choose a file</strong><span className="box__dragndrop"> or drag it here</span>.</label>);

        }
        if (!this.state.imageExists) {
            return (
                <div id="short-editor-container">
                    <div id="drag-drop-container">
                        <DragDropFiles onImagePost={this.handleImagePost} onChange={this.handleMoveDropzone} disablePost={this.props.disablePost} setImageArray={this.props.setImageArray}/>
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
                    <div id="text-container">
                        <p>Hello</p>
                    </div>

                </div>
            );
        }
        else{
            return (
                <div>
                    Tester
                </div>
            );
        }
    }

}

export default withFirebase(ShortEditor);