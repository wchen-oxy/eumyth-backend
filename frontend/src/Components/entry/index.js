import React from 'react';
import Axios from '../../Axios/axios'
import { Editor, createEditorState, BLOCK_BUTTONS} from 'medium-draft';
import CustomImageSideButton from '../custom-image-upload/index';
import './index.scss';

const blockButtons = [{
    label: 'H1',
    style: 'header-one',
    icon: 'header',
    description: 'Heading 1',
  },].concat(BLOCK_BUTTONS);

// const FormData = require('form-data');
class NewEntry extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isMilestone: false,
            editorState: createEditorState(), // for empty content
        };

        this.handleTypeToggle = this.handleTypeToggle.bind(this);
        this.handleImagePost = this.handleImagePost.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.refsEditor = React.createRef();

        this.sideButtons = [{
            title: 'Image',
            component: CustomImageSideButton,
          }];
      

    }

    componentDidMount(){
        this.refsEditor.current.focus();
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
    

    render() {
        // var editor = new MediumEditor('.editable');
        const { editorState } = this.state;

        return (

               /* <div id="cover-container">
                     
                        <input type="file" id='inputGroupFile01' onChange={this.handleImagePost} />
                        <img id="img"
                            style={{
                                display: "block"
                            }} alt="">

                        </img>

                   
                    </div> */

            <div id="milestone-page-container">
                <link rel="stylesheet" type="text/css" href="https://unpkg.com/medium-draft/dist/medium-draft.css"/>
                <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.6.1/css/font-awesome.min.css"/>
                

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
                       
                       <Editor
                           ref={this.refsEditor}
                           editorState={editorState}
                           onChange={this.handleChange} 
                           placeholder='Title'
                           blockButtons={blockButtons}
                           sideButtons={this.sideButtons}
                           />
                       
                   
                  
                       {/* <form id="editor-form">
                           <label>Title</label>
                           <input type='text' />
                           <label>Desc</label>
                           <input id="description-box" type='text' />

                       </form> */}

                   </div>

            </div>
        )
    }
}

export default NewEntry;