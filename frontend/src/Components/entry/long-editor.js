import React from 'react';
import DanteEditor from 'Dante2';
import { convertToHTML } from 'draft-convert';
import { ImageBlockConfig } from "Dante2/package/es/components/blocks/image.js";
import { VideoBlockConfig } from "Dante2/package/es/components/blocks/video";
import { PlaceholderBlockConfig } from "Dante2/package/es/components/blocks/placeholder";
import { EmbedBlockConfig } from "Dante2/package/es/components/blocks/embed";
import { withFirebase } from '../../Firebase';
import './long-editor.scss';


class LongEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: this.props.content,
            username: this.props.firebase.returnUsername()
        }
    }

    render() {
        return (
            <div id="long-editor-container">
                < DanteEditor
                    // onChange={
                    //     editor => {
                    //     //     console.log(convertToHTML({}));
                    //     // console.log(editor.state.editorState._immutable.currentContent);
                    //     console.log(editor.state.editorState.getCurrentContent());
                    //     const html = convertToHTML({
                    //         styleToHTML: (style) => {
                    //           if (style === 'BOLD') {
                    //             return <span style={{color: 'blue'}} />;
                    //           }
                    //         },
                    //         blockToHTML: (block) => {
                    //           if (block.type === 'PARAGRAPH') {
                    //             return <p />;
                    //           }
                    //         },
                    //         entityToHTML: (entity, originalText) => {
                    //           if (entity.type === 'LINK') {
                    //             return <a href='google.com'>{originalText}</a>;
                    //           }
                    //           return originalText;
                    //         }
                    //       })(editor.state.editorState.getCurrentContent());
                    //       console.log(html);
                    // }}
                    content={this.state.content}
                    default_wrappers={[
                        { className: 'my-custom-h1', block: 'header-one' },
                        { className: 'my-custom-h2', block: 'header-two' },
                        { className: 'my-custom-h3', block: 'header-three' },
                    ]}
                    widgets={[
                        ImageBlockConfig({
                            options: {
                                upload_url: "http://localhost:5000/image",
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
                        url: "http://localhost:5000/draft",
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