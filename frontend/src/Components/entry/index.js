import React from 'react';
import Axios from '../../Axios/axios'
import './index.scss';
import DanteEditor from 'Dante2';
import Dante from 'Dante2';

class NewEntry extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isMilestone: false
           
                };

        this.handleTypeToggle = this.handleTypeToggle.bind(this);
        this.handleImagePost = this.handleImagePost.bind(this);
        this.handleChange = this.handleChange.bind(this);

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
    

    render() {

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
                <DanteEditor/>
                   </div>

            </div>
        )
    }
}

export default NewEntry;