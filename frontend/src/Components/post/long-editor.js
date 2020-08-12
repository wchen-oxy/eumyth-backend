import React from 'react';
import DanteEditor from 'Dante2';
import { convertToHTML } from 'draft-convert';
import { ImageBlockConfig } from "Dante2/package/es/components/blocks/image.js";
import { VideoBlockConfig } from "Dante2/package/es/components/blocks/video";
import { PlaceholderBlockConfig } from "Dante2/package/es/components/blocks/placeholder";
import { EmbedBlockConfig } from "Dante2/package/es/components/blocks/embed";
import { withFirebase } from '../../Firebase';
import './long-editor.scss';
import { IMAGE_URL, DRAFT_URL } from "../constants/index";


class LongEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: this.props.firebase.returnUsername()
        }
    }

    render() {
        console.log(this.props.content);
        return (
            <div id="long-editor-container">
                < DanteEditor
                    onChange={
                        (editor) => {
                            const editorState = editor.emitSerializedOutput().blocks;
                            if (this.props.hasContent === false) {
                                for (let block of editorState) {
                                    if (block.text !== '') {
                                        this.props.setHasContent(true);
                                        break;
                                    }
                                }
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
                        // VideoBlockConfig(),
                        PlaceholderBlockConfig(),
                        // EmbedBlockConfig(),

                    ]}
                    data_storage={{
                        success_handler: function () { console.log("Reached") },
                        failure_handler: function () { console.log("fail") },
                        url: DRAFT_URL,
                        method: "POST",
                        interval: 1000, //original is 4000 sec
                        withCredentials: false,
                        crossDomain: true,
                        headers: {
                            'Content-Type': 'application/json',
                            'username': this.state.username
                        }

                    }}
                />
            </div>
        );
    }

}

export default withFirebase(LongEditor);