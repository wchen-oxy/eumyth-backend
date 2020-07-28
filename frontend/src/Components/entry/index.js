import React from 'react';
import Axios from '../../Axios/axios';
import './index.scss';
import LongEditor from './long-editor';
import ShortEditor from './short-editor';

import { Container, Row, Col } from "react-bootstrap";
import debounce from 'lodash/debounce';
import { withFirebase } from '../../Firebase';


class NewEntry extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            isMilestone: false,
            username: this.props.firebase.returnUsername(),
            prevDraft: '',
            windowType: 'main',
            postDisabled: true,
            imageArray: null,

        };

        this.handleTypeToggle = this.handleTypeToggle.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleDisablePost = this.handleDisablePost.bind(this);
        this.setImageArray = this.setImageArray.bind(this);
        // this.handleImagePost = this.handleImagePost.bind(this);
       

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
        console.log(this.state.imageArray);

        this.setState(state => ({
            isMilestone: !state.isMilestone
        }))
    }

    handleClick(e, value) {
        e.preventDefault();
        this.setState({ windowType: value })
    }

    handleWindowSelection(e) {

    }

    setImageArray(imageArray){
        // if (!!imageArray)
         this.setState({imageArray: imageArray});
    }

    // handleImagePost(e) {
    //     e.preventDefault()
    //     const file = document.getElementById('inputGroupFile01').files;
    //     const formData = new FormData();
    //     formData.append('img', file[0]);
    //     if (file[0]) Axios.postImage(formData)
    //         .then(r => {
    //             console.log(r)
    //         }).then(

    //             () =>
    //                 document
    //                     .getElementById('img')
    //                     .setAttribute('src', `http://localhost:5000/entry/image/${file[0].name}`)
    //         );
    //     console.log(file[0]);

    // }

    handleDisablePost(disabled){
        this.setState({postDisabled : disabled});
    }

    



    render() {
        let editorType = null;
        let topButtons = null;
        if (this.state.windowType === 'main') {
            editorType = (
                <div id="selection-window">
                    <div className="vertical-grouping">
                        <h4>
                            Begin a New Check-In!
                        </h4>
                        <div className="single-button-container">
                            <button value="short" onClick={e => this.handleClick(e, e.target.value)}>
                                New Short
                            </button>
                        </div>

                    </div>

                    <div className="vertical-grouping">
                        <h4>
                            Begin a New Post! (Will Delete Saved data)
                        </h4>
                        <div className="single-button-container">

                            <button value="long" onClick={e => this.handleClick(e, e.target.value)}>
                                New Entry
                            </button>
                        </div>
                        <div className="single-button-container">
                            <button value="long" onClick={e => this.handleClick(e, e.target.value)}>
                                Continue Previous Draft?
                            </button>
                        </div>
                    </div>


                </div>)
        }
        else {
            topButtons = (
                <div id="button-container">
                    <span id="toggle-button-span">
                        <button id="toggle-button" value="main" onClick={e => this.handleClick(e, e.target.value)}>Return</button>
                    </span>
                    <span id="toggle-button-span">
                        <button id="toggle-button" value="main" onClick={this.handleTypeToggle}>Test</button>
                    </span>
                    <span id="post-button-span">
                        <button id="post-button" disabled={this.state.postDisabled}>Post!</button>
                    </span>
                </div>
            );

            if (this.state.windowType === 'short') {

                editorType = (
                <ShortEditor 
                    // selectedFiles={this.state.selectedFiles}
                    // validFiles={this.state.validFiles}
                    // unsupportedFiles={this.state.unsupportedFiles}
                    // errorMessage={this.state.errorMessage}
                    username={this.state.username}
                    disablePost={this.handleDisablePost} 
                    setImageArray={this.setImageArray}

                    // setSelectedFiles = {this.setSelectedfiles}
                    // setValidFiles = {this.setValidFiles}
                    // setUnsupportedFiles = {this.setUnsupportedFiles}
                    // setErrorMessage = {this.setErrorMessage}
                />
                );
            }

            else if (this.state.windowType === 'long') {
                if (this.state.prevDraft !== '') {
                    editorType = <LongEditor content={this.state.prevDraft} />;
                }
                else {
                    editorType = (<div>Loading...</div>);
                }
            }
        }


        return (

            <div className="vertical-grouping">
                <div id="editor-container">
                    {topButtons}
                    {editorType}
                </div>
            </div>
        )
    }
}

export default withFirebase(NewEntry);