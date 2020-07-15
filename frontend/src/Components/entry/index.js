import React from 'react';
import Axios from '../../Axios/axios'
import './index.scss';
import DanteEditor from 'Dante2';
import { ImageBlockConfig } from "Dante2/package/es/components/blocks/image.js";
import { VideoBlockConfig } from "Dante2/package/es/components/blocks/video";
import { PlaceholderBlockConfig } from "Dante2/package/es/components/blocks/placeholder";
import { EmbedBlockConfig } from "Dante2/package/es/components/blocks/embed";

import { Container, Row, Col } from "react-bootstrap";
import debounce from 'lodash/debounce';
import { withFirebase } from '../../Firebase';
import { convertToHTML } from 'draft-convert';


class NewEntry extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            isMilestone: false,
            username: this.props.firebase.returnUsername(),
            prevDraft: ''
        };

        this.handleTypeToggle = this.handleTypeToggle.bind(this);
        this.handleImagePost = this.handleImagePost.bind(this);

    }
    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted && this.state.username) {
            Axios.retrieveDraft(this.state.username).then((previousDraft) => {
                console.log(previousDraft);
                this.setState({ prevDraft: previousDraft.data });
            })
                .catch(error => {
                    console.log(
                        "Error: " + error
                    );
                    this.setState({ prevDraft: null })
                })
        };
    }
    componentWillUnmount() {
        this._isMounted = false;
    }

    handleTypeToggle(e) {
        e.preventDefault();
        this.setState(state => ({
            isMilestone: !state.isMilestone
        }))
    }

    handleImagePost(e) {
        e.preventDefault()
        const file = document.getElementById('inputGroupFile01').files;
        const formData = new FormData();
        formData.append('img', file[0]);
        if (file[0]) Axios.postImage(formData)
            .then(r => {
                console.log(r)
            }).then(

                () =>
                    document
                        .getElementById('img')
                        .setAttribute('src', `http://localhost:5000/entry/image/${file[0].name}`)
            );
        console.log(file[0]);

    }


    render() {
        console.log(this.state.username);
        console.log(this.state.prevDraft);
        
        let mainContent = null;
        if (this.state.prevDraft !== '') {
            mainContent = < DanteEditor
                onChange={
                    editor => {
                    //     console.log(convertToHTML({}));
                    // console.log(editor.state.editorState._immutable.currentContent);
                    console.log(editor.state.editorState.getCurrentContent());
                    const html = convertToHTML({
                        styleToHTML: (style) => {
                          if (style === 'BOLD') {
                            return <span style={{color: 'blue'}} />;
                          }
                        },
                        blockToHTML: (block) => {
                          if (block.type === 'PARAGRAPH') {
                            return <p />;
                          }
                        },
                        entityToHTML: (entity, originalText) => {
                          if (entity.type === 'LINK') {
                            return <a href='google.com'>{originalText}</a>;
                          }
                          return originalText;
                        }
                      })(editor.state.editorState.getCurrentContent());
                      console.log(html);
                }}
                // content={this.state.prevDraft}
                default_wrappers={[
                    { className: 'my-custom-h1', block: 'header-one' },
                    { className: 'my-custom-h2', block: 'header-two' },
                    { className: 'my-custom-h3', block: 'header-three'},
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
        }
        else mainContent = (<div>Loading...</div>);
    

        return (

            <div id="milestone-page-container">
                <div id="editor-container">
                    <div id="button-container">
                        <span id="toggle-button-span">
                            <button id="toggle-button">Toggle Mode</button>
                        </span>
                        <span id="post-button-span">
                            <button id="post-button">Post!</button>
                        </span>
                    </div>
                </div>
                <div id="text-editor">
                    {mainContent}
                </div>
            </div>
        )
    }
}

export default withFirebase(NewEntry);