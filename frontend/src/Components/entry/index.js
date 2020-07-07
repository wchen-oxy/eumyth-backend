import React from 'react';
import Axios from '../../Axios/axios'
import './index.scss';
import DanteEditor from 'Dante2';
import {ImageBlockConfig} from "Dante2/package/es/components/blocks/image.js";
import { VideoBlockConfig } from "Dante2/package/es/components/blocks/video";
import { PlaceholderBlockConfig } from "Dante2/package/es/components/blocks/placeholder";
import {EmbedBlockConfig} from "Dante2/package/es/components/blocks/embed";
import {Edit} from 'Dante2';
import Dante from 'Dante2';
import dantet from './dante';
import { Container, Row, Col } from "react-bootstrap";
import debounce from 'lodash/debounce';


class NewEntry extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isMilestone: false,
            
           
                };

        this.handleTypeToggle = this.handleTypeToggle.bind(this);
        this.handleImagePost = this.handleImagePost.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.onChange = this.onChange.bind(this);

    }

    componentDidMount(){
     
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

    handleChange(editorState) {
        this.setState({editorState});
    }
    
    onChange(state){
        console.log(state);
        console.log('editor content: ', state.emitSerializedOutput());
        
        
    }

    render() {
        console.log(ImageBlockConfig)

        return (
               
            <div id="milestone-page-container">
                {/* <div id="cover-container">
                     
                     <input type="file" id='inputGroupFile01' onChange={this.handleImagePost} />
                     <img id="img"
                         style={{
                             display: "block"
                         }} alt="">

                     </img>

                
                 </div>  */}
                
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
                {/* <Container>
                    <Row>
                        <Col sm={12} className="dante">
                        <DanteEditor 
                            title_placeholder={'Title'}
                            body_placeholder={'Write your article'}
                        />
                        </Col>
                    </Row>
                </Container> */}
                
                
                < DanteEditor
                onChange={this.onChange}
                widgets={[
                    ImageBlockConfig({
                      options: {
                        upload_url: "http://localhost:5000/entry/image",
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

                        success_handler: function() {console.log("Reached")},
                        failure_handler:  function() {console.log("fail")},
                        url: "http://localhost:5000/entry",
                        method: "POST",
                        interval: 4000,
                        withCredentials: false,
                        crossDomain: true,
                        headers: {'Content-Type': 'application/json'}
                      
                    }}
                />
      
                   </div>

            </div>
        )
    }
}

export default NewEntry;