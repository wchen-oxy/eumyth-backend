import React from 'react';
import DanteEditor from 'Dante2';
import { ImageBlockConfig } from "Dante2/package/es/components/blocks/image.js";
import { PlaceholderBlockConfig } from "Dante2/package/es/components/blocks/placeholder";
import { withFirebase } from '../../Firebase';
import { IMAGE_URL, DRAFT_URL } from "../constants/index";
import './long-editor.scss';

class LongEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: this.props.username,
        }
    }

    render() {
        console.log(this.props.content);
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
                            else{
                                this.props.onSaveDraft(editorState);
                            }
                        }}
                    content={this.props.content}
                    default_wrappers={[
                        { className: 'my-custom-h1', block: 'header-one' },
                        { className: 'my-custom-h2', block: 'header-two' },
                        { className: 'my-custom-h3', block: 'header-three' },
                    ]}
                    widgets={[
                        ImageBlockConfig({
                            options: {
                                upload_url: IMAGE_URL,
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
                    data_storage={{
                        success_handler: function () { console.log("Reached") },
                        failure_handler: function () { console.log("fail") },
                        url: DRAFT_URL,
                        method: "POST",
                        interval: 4000, //original is 4000 sec
                        withCredentials: false,
                        crossDomain: true,
                        headers: {
                            'Content-Type': 'application/json',
                            'username': this.state.username,
                        }

                    }}
                />
            </div>
        );
    }

}

export default withFirebase(LongEditor);