import React from 'react';
import DanteEditor from 'Dante2';
import _ from 'lodash';
import { ImageBlockConfig } from "Dante2/package/es/components/blocks/image.js";
import { PlaceholderBlockConfig } from "Dante2/package/es/components/blocks/placeholder";
import { withFirebase } from '../../Firebase';
import { IMAGE_BASE_URL, DRAFT_BASE_URL } from "../constants/urls";
import './long-editor.scss';
import AxiosHelper from '../../Axios/axios';


const saveInterval = 4000;
class LongEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: this.props.username,
            isInitial: true
        }
        this.handleSave = this.handleSave.bind(this);
        this.handleSaveSuccess = this.handleSaveSuccess.bind(this);
        this.handleSaveError = this.handleSaveError.bind(this);
    }
    handleSave(editorContext, content) {
        //prevent false save
        if (!this.props.isSavePending){
            console.log("Catch uneccessary save");
            console.log(content);
            console.log(this.props.localDraft);
        }
        else{
            console.log("Saving");
            // console.log(editorContext);
            console.log(content);
            this.props.onSavePending(true);
            AxiosHelper.saveDraft(this.props.username, JSON.stringify(content))
            .then(
                (result) => this.handleSaveSuccess(result)
                )
                .catch(
                    (err) => this.handleSaveError(err)
                )
            //write up the new handle save with axioshelper. Also double check whether put and post is necessary.
        }
    }

    handleSaveSuccess(result) {
        console.log("Reached");
        this.props.onSavePending(false);

    }
    handleSaveError(result) {
        console.log("fail")
        this.props.onSavePending(false);
        alert("Draft Failed to Save. Please check your connection or save your draft locally for now. : (");
    }

    render() {
        return (
            <div id="long-editor-container">
                < DanteEditor
                    onChange={
                        (editor) => {
                            const editorState = editor.emitSerializedOutput();
                            if (this.props.hasContent === false) {
                                for (let block of editorState.blocks) {
                                    if (block.text !== '') {
                                        this.props.setHasContent(true);
                                        break;
                                    }
                                }
                            }
                            else {
                                if (this.state.isInitial) {
                                    console.log("Mounted");
                                    this.setState({ isInitial: false });
                                    this.props.setLocalDraft(editorState);

                                }
                                else {
                                    console.log("After Mount");
                                    const draftsIdentical = _.isEqual(editorState, this.props.localDraft);
                                    if (!draftsIdentical) {
                                        this.props.onSavePending(true);
                                        this.props.setLocalDraft(editorState);
                                    }
                                }
                            }
                        }}
                    content={this.props.onlineDraft}
                    default_wrappers={[
                        { className: 'my-custom-h1', block: 'header-one' },
                        { className: 'my-custom-h2', block: 'header-two' },
                        { className: 'my-custom-h3', block: 'header-three' },
                    ]}
                    widgets={[
                        ImageBlockConfig({
                            options: {
                                upload_url: IMAGE_BASE_URL,
                                upload_callback: (ctx, img) => {
                                    console.log(ctx);
                                    console.log(img);
                                    alert('file uploaded: ' +
                                        ctx.data.url)
                                },
                                upload_error_callback: (ctx,
                                    img) => {
                                    console.log(ctx)
                                },
                            },
                        }),
                        PlaceholderBlockConfig(),

                    ]}
                    data_storage={
                        {
                            save_handler: this.handleSave,
                            // url: 'null',
                            interval: saveInterval,
                            success_handler: this.handleSaveSuccess,
                            failure_handler: this.handleSaveError,

                        }
                        //     {
                        //     success_handler: this.handleSaveSuccess,
                        //     failure_handler: this.handleSaveError,
                        //     url: DRAFT_URL,
                        //     method: "POST",
                        //     interval: saveInterval, //original is 4000 sec
                        //     withCredentials: false,
                        //     crossDomain: true,
                        //     headers: {
                        //         'Content-Type': 'application/json',
                        //         'username': this.state.username,
                        //     }

                        // }
                    }
                />
            </div>
        );
    }

}

export default withFirebase(LongEditor);