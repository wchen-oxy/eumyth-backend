import React from "react";
import Axios from "../../Axios/axios";
import "./index.scss";
import LongEditor from "./long-editor";
import ShortEditor from "./short-editor";
import { withFirebase } from "../../Firebase";


class NewEntry extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.progressRef = React.createRef();
        this.uploadRef = React.createRef();
        this.uploadModalRef = React.createRef();
        this.modalRef = React.createRef();
        this.state = {
            isMilestone: false,
            username: this.props.firebase.returnUsername(),
            shortPostText: "",
            previousLongDraft: null,
            windowType: "main",
            postDisabled: true,
            imageArray: [],

        };
        this.closeModal = this.closeModal.bind(this);
        this.handleTypeToggle = this.handleTypeToggle.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleDisablePost = this.handleDisablePost.bind(this);
        this.setImageArray = this.setImageArray.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.openSubmitLongPostModal = this.openSubmitLongPostModal.bind(this);
        this.handleSubmitPost = this.handleSubmitPost.bind(this);


    }
    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted && this.state.username) {
            Axios.retrieveDraft(this.state.username).then((previousDraft) => {
                this.setState({ previousLongDraft: previousDraft.data });
            })
                .catch(error => {
                    console.log(
                        "Error: " + error
                    );
                })
        };
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    closeUploadModal = () => {
        this.uploadModalRef.current.style.display = "none";
    }
    handleChange(e) {
        this.setState({ shortPostText: e.target.value })
    }
    handleTypeToggle(e) {
        e.preventDefault();
        this.setState(state => ({
            isMilestone: !state.isMilestone
        }))
    }

    handleClick(e, value) {
        e.preventDefault();
        this.setState({ windowType: value, postDisabled: true })
    }

    setImageArray(imageArray) {
        this.setState({ imageArray: imageArray });
    }

    openSubmitLongPostModal(){
        this.modalRef.current.style.display = "block";
    }

    closeModal(){
        this.modalRef.current.style.display = "none";
    }

    handleSubmitPost(e) {
        e.preventDefault()
        if (this.state.windowType === "short") {
            const formData = new FormData();
            formData.append("images", this.state.imageArray);
            formData.append("short-post-text", this.state.shortPostText);
            formData.append("text-only", false);
            if (this.state.imageArray) Axios.postShortPost(formData, this.progressRef, this.uploadRef, false)
                .then(r => {
                    console.log(r)
                });
        }
        if (this.state.windowType === "long"){
            this.openSubmitLongPostModal();            
        }
    }

    handleDisablePost(disabled) {
        this.setState({ postDisabled: disabled });
    }

    render() {
        let editorType = null;
        let topButtons = null;
        if (this.state.windowType === "main") {
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
                        <button id="post-button" disabled={this.state.postDisabled} onClick={this.handleSubmitPost}>Post!</button>
                    </span>
                </div>
            );

            if (this.state.windowType === "short") {

                editorType = (
                    <>
                        <ShortEditor
                            username={this.state.username}
                            disablePost={this.handleDisablePost}
                            setImageArray={this.setImageArray}
                            handleChange={this.handleChange}
                        />

                        <div className="upload-modal" ref={this.uploadModalRef}>
                            <div className="overlay"></div>
                            <div className="progress-container">
                                <span ref={this.uploadRef}></span>
                                <div className="progress">
                                    <div className="progress-bar" ref={this.progressRef}></div>
                                </div>
                            </div>
                        </div>

                    </>
                );
            }

            else if (this.state.windowType === "long") {
                if (this.state.previousLongDraft !== "") {
                    editorType = 
                    <LongEditor
                        content={this.state.previousLongDraft}
                        disablePost={this.handleDisablePost}
                    />;
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
                
                <div className="modal" ref={this.modalRef}>
                    <div className="overlay"></div>
                    <span className="close" onClick={(() => this.closeModal())}>X</span>
                    <div className="vertical-grouping" id="option-modal">
                        <div id="buttons-container">
                            <div className="button-group">
                            <label>Title</label>
                            <input type="text"/>
                            </div>
                            <div className="button-group">
                            <label>Cover Photo</label>
                            <input type="file" />
                            </div>
                            <div className="button-group">
                            <label>Date</label>
                            <input type="date"></input>
                            </div>
                            <div className="button-group">
                            <label>Minutes Spent</label>
                            <input type="number"/>
                            </div>
                        </div>
                        <button>Publish Now!</button>
                    </div>
                </div>
        
            </div>
        )
    }
}

export default withFirebase(NewEntry);