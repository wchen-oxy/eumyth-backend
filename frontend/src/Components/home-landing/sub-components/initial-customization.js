import React from 'react';
import './initial-customization.scss';
import CustomMultiSelect from "../../custom-clickables/createable-single";
import AvatarEditor from 'react-avatar-editor';
import Dropzone from 'react-dropzone';
import { withFirebase } from '../../../Firebase';
import AxiosHelper from '../../../Axios/axios';

const INITIAL_STATE = {
    firstName: '',
    lastName: '',
    username: '',
    pursuits: [],
    experienceSelects: [],
    isTaken: false,
    croppedImage: null,
    fullImage: null,
    imageScale: 1,
    imageRotation: 0,
}
class InitialCustomizationPage extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handlePursuitExperienceChange = this.handlePursuitExperienceChange.bind(this);
        this.handleProfilePhotoChange = this.handleProfilePhotoChange.bind(this);
        this.handleImageDrop = this.handleImageDrop.bind(this);
        this.preview = this.preview.bind(this);
        this.state = {
            ...INITIAL_STATE
        }
    }

    handleChange(e) {
        e.preventDefault();
        console.log(e.target.value);
        this.setState({ [e.target.name]: e.target.value });
        if (e.target.name === "username") {
            AxiosHelper.checkUsernameAvailable(e.target.value)
                .then(
                    (response) => {
                        console.log(response);
                        console.log(response.data);
                        response.status === 200 ? this.setState({ isTaken: true }) : this.setState({ isTaken: false });
                    }
                );


        }
    }
    handleSelect(newValue, actionMeta) {
        console.group('Value Changed');
        console.log(newValue);
        this.setState({ pursuits: newValue });
        console.log(`action: ${actionMeta.action}`);
        console.groupEnd();

        let pursuitArray = [];
        let experienceSelects = [];
        for (const pursuit of newValue) {
            pursuitArray.push({ name: pursuit.value, experience: "" });
            experienceSelects.push(
                <span key={pursuit.value}>
                    <label>{pursuit.value}</label>
                    <select name={pursuit.value} id="experience-select" onChange={this.handlePursuitExperienceChange}>
                        <option value=""></option>
                        <option value="Beginner">Beginner</option>
                        <option value="Familiar">Familiar</option>
                        <option value="Experienced">Experienced</option>
                        <option value="Expert">Expert</option>
                    </select>
                </span>
            );
        }
        console.log(pursuitArray);
        this.setState({ pursuits: pursuitArray, experienceSelects: experienceSelects });
    }

    handleSubmit(e) {
        e.preventDefault();
        if (this.editor) {
            // This returns a HTMLCanvasElement, it can be made into a data URL or a blob,
            // drawn on another canvas, or added to the DOM.
            const canvas = this.editor.getImage().toDataURL();
            // If you want the image resized to the canvas size (also a HTMLCanvasElement)
            const canvasScaled = this.editor.getImageScaledToCanvas().toDataURL();
            // this.setState({ croppedImage: canvasScaled.toDataURL(), fullImage: canvas.toDataURL() });


            this.props.firebase.writeBasicUserData(
                this.state.username,
                this.state.firstName,
                this.state.lastName
            )
                .then(
                    () => this.props.firebase.doUsernameUpdate(this.state.username)
                )
                .then(
                    () => AxiosHelper.createUserProfile(this.state.username, this.state.pursuits, canvas, canvasScaled)
                )
                .then(
                    (success) => {
                        console.log(success);
                        if (success) window.location.reload();
                    }
                );
        }
    }

    handlePursuitExperienceChange(e) {
        const pursuit = e.target.name;
        const experience = e.target.value;
        console.log(pursuit);
        console.log(experience);
        let previousPursuitState = this.state.pursuits;
        console.log(previousPursuitState);
        for (const pursuit of previousPursuitState) {
            if (pursuit.name === e.target.name) pursuit.experience = e.target.value;
        }
        this.setState({ pursuits: previousPursuitState });
    }

    handleProfilePhotoChange(photo) {
        this.setState({ profilePhoto: photo });
    }

    handleImageDrop(dropped) {
        this.setState({ profilePhoto: dropped[0] })
    }
    setEditorRef = (editor) => this.editor = editor;

    preview() {
        console.log("inner");

    }
    render() {
        console.log(this.state.isTaken);
        const available = this.state.username !== '' && !this.state.isTaken ? "Available" : "Taken";
        const { username, firstName, lastName, pursuits } = this.state;
        let isInvalid =
            username === '' ||
            firstName === '' ||
            lastName === '' ||
            pursuits === null ||
            pursuits.length === 0 ||
            this.state.isTaken === true;

        const pursuitDetails = this.state.pursuits.length !== 0 ? this.state.experienceSelects : <></>;

        const photoArea = (
            <>
                <Dropzone
                    onDrop={this.handleImageDrop}
                    noClick
                    noKeyboard
                    style={{ width: '200px', height: '200px' }}
                >
                    {({ getRootProps, getInputProps }) => (
                        <div {...getRootProps()}>
                            <AvatarEditor
                                ref={this.setEditorRef}
                                image={this.state.profilePhoto}
                                width={200}
                                height={200}
                                borderRadius={200}
                                border={50}
                                color={[215, 215, 215, 0.8]} // RGBA
                                scale={this.state.imageScale}
                                rotate={this.state.imageRotation}
                            />
                            <input {...getInputProps()} />
                        </div>
                    )}
                </Dropzone>
                {/* <AvatarEditor
                    image={this.state.profilePhoto}
                    width={250}
                    height={250}
                    borderRadius={250}
                    border={50}
                    color={[255, 255, 255, 0.6]} // RGBA
                    scale={this.state.imageScale}
                    rotate={this.state.imageRotation}
                    onPositionChange={(position) => {
                        this.setState({ imagePosition: position });
                    }}
                /> */}
                <label>Rotation</label>
                <input
                    type="range"
                    id="points"
                    name="points"
                    min="-20"
                    max="20"
                    value={this.state.imageRotation}
                    onChange={(e) => this.setState({ imageRotation: e.target.value })} />
                <label>Scale</label>
                <input
                    type="range"
                    id="points"
                    name="points"
                    step="0.1"
                    min="1"
                    max="10"
                    value={this.state.imageScale}
                    onChange={(e) => this.setState({ imageScale: e.target.value })} />

            </>

        )


        return (
            <div className="basic-info-container">
                <form className="basic-info-form-container" onSubmit={this.handleSubmit}>
                    <h2>Let us know about you!</h2>
                    <label>
                        Don't worry this won't be public if you don't want it to.
                    </label>
                    <div className="info-container">
                        <label>Choose a display profile!</label>
                        <input type="file" name="displayPhoto" onChange={(e) => this.handleProfilePhotoChange(e.target.files[0])} />
                        {this.state.profilePhoto ? photoArea : <div id="temp-profile-photo-container"></div>}

                    </div>
                    <div className="info-container">

                        <label>
                            Choose a username! {available}
                        </label>
                        <input type="text" name="username" placeholder="Username" onChange={this.handleChange} />
                        <label>First Name</label>
                        <input type="text" name="firstName" placeholder="First Name" onChange={this.handleChange} />
                        <label>Last Name</label>
                        <input type="text" name="lastName" placeholder="Last Name" onChange={this.handleChange} />
                    </div>
                    <div className="info-container">

                        <label>
                            Tell us what you want to pursue or choose one from the list!
                    </label>
                        <CustomMultiSelect name="pursuits" onSelect={this.handleSelect} />
                        {pursuitDetails}
                        <button disabled={isInvalid} type="submit" >
                            Submit
                    </button>
                    </div>
                </form>

            </div>
        );
    }
}
export default withFirebase(InitialCustomizationPage);