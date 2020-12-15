import React, { useState } from 'react';
import PasswordChangeForm from '../password/change';
import AvatarEditor from 'react-avatar-editor';
import Dropzone from 'react-dropzone';
import imageCompression from 'browser-image-compression';

import AxiosHelper from "../../Axios/axios";
import { AuthUserContext, withAuthorization } from '../session';
import { withFirebase } from '../../Firebase';

import "./index.scss";

const DISPLAY = "DISPLAY";
const COVER = "COVER";

const AccountPage = (props) => {
  const [displayPhoto, setDisplay] = useState(null);
  const [coverPhoto, setCover] = useState(null);
  const [bio, setBioText] = useState('');
  const [imageScale, setImageScale] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const displayRef = React.createRef();
  const coverRef = React.createRef();
  const editorRef = React.createRef();

  const handleImageDrop = (dropped) => {
    setDisplay(dropped);
  }
  const manageDisplayDiv = (ref) => {
    console.log(ref.current.style.display);
    if (ref.current.style.display === "") { ref.current.style.display = "flex" }
    else {
      ref.current.style.display = "";
    }
  }

  const removePhoto = (photoType) => {
    if (window.confirm("Are you sure you want to remove your photo?")) {
      AxiosHelper.deleteAccountPhoto(props.firebase.returnUsername(), photoType)
        .then((res) => {
          console.log("Success!", res.status);
          if (photoType === DISPLAY) {
            window.alert("Your Display Photo has been removed. You should see the changes take effect soon.");
          }
          else if (photoType === COVER) {
            window.alert("Your cover photo has been removed. You should see the changes take effect immediately.");
          }
        })
        .catch((err) => {
          console.log(err);
          window.alert("Something went wrong while deleting your image. Please wait and try again later");
        });
    }
  }
  const handleSubmit = (photoType) => {
    let formData = new FormData();
    formData.append('displayName', props.firebase.returnUsername());
    if (photoType === DISPLAY) {
      const titles = ["normal", "small", "tiny"];
      const image = imageCompression.canvasToFile(this.editorRef.getImage());
      const results =
        [
          imageCompression(image, { maxWidthOrHeight: 250, maxSizeMB: 1, fileType: "image/jpeg" }),
          imageCompression(image, { maxWidthOrHeight: 125, maxSizeMB: 1, fileType: "image/jpeg" }),
          imageCompression(image, { maxWidthOrHeight: 62, maxSizeMB: 1, fileType: "image/jpeg" })
        ]
      let imageArray = [];
      for (let i = 0; i < 3; i++) {
        imageArray.push(new File([results[i]], titles[i], { type: "image/jpeg" }));
      }
      formData.append("croppedImage", results[0]);
      formData.append("smallCroppedImage", results[1]);
      formData.append("tinyCroppedImage", results[2]);
    }
    else if (photoType === COVER) {
      formData.append('coverPhoto', coverPhoto);
      console.log(coverPhoto);
    }
    return AxiosHelper.deleteAccountPhoto(props.firebase.returnUsername(), COVER)
      .then(() => AxiosHelper.updateAccountImage(formData, photoType)).then(() => alert("Successfully updated!"))
      .catch((err) => {
        console.log(err);
        alert("Something has gone wrong while updating :(")
      });

  }

  return (
    <AuthUserContext.Consumer>
      {authUser => {
        console.log(authUser);
        return (
          <div id="settings-hero-container">
            <h1>Account: {authUser.email}</h1>
            <PasswordChangeForm />
            <button onClick={() => manageDisplayDiv(displayRef)}>Edit your Display Photo</button>
            <div ref={displayRef} className="photo-edit-input-container">
              <label>Change your display photo!</label>
              <input type="file" onChange={(e) => {
                setDisplay(e.target.files[0]);
              }}></input>
              {
                displayPhoto ?
                  <>
                    <Dropzone
                      onDrop={handleImageDrop}
                      noClick
                      noKeyboard
                      style={{ width: '200px', height: '200px' }}
                    >
                      {({ getRootProps, getInputProps }) => {
                        return (
                          <div {...getRootProps()}>
                            <AvatarEditor
                              ref={editorRef}
                              image={displayPhoto}
                              width={170}
                              height={170}
                              borderRadius={200}
                              border={50}
                              color={[215, 215, 215, 0.8]} // RGBA
                              scale={imageScale}
                              rotate={imageRotation}
                            />
                            <input {...getInputProps()} />
                          </div>
                        )
                      }}
                    </Dropzone>
                    <label>Rotation</label>
                    <input
                      type="range"
                      id="points"
                      name="points"
                      min="-20"
                      max="20"
                      value={imageRotation}
                      onChange={(e) => setImageRotation(parseFloat(e.target.value))} />
                    <label>Scale</label>
                    {console.log(imageScale)};
                <input
                      type="range"
                      id="points"
                      name="points"
                      step="0.1"
                      min="1"
                      max="10"
                      value={imageScale}
                      onChange={(e) => setImageScale(parseFloat(e.target.value))} />
                  </>
                  :
                  <div id="temp-profile-photo-container"></div>
              }
              <button onClick={() => handleSubmit(DISPLAY)}>Submit your display photo!</button>
              <button onClick={() => removePhoto(DISPLAY)}>Remove display Photo?</button>
            </div>
            <button onClick={() => manageDisplayDiv(coverRef)}>Edit your Cover Photo</button>
            <div ref={coverRef} className="photo-edit-input-container">
              <label>Change your cover photo!</label>
              <input type="file" onChange={(e) => {
                setCover(e.target.files[0]);
              }}></input>
              <button onClick={() => handleSubmit(COVER)}>Submit your cover photo!</button>
              <button onClick={() => removePhoto(COVER)}>Remove your cover photo</button>
            </div>
            <label>Edit your bio</label>
            <input type="text" onChange={e => setBioText(e.target.value)} />
          </div>
        );
      }}
    </AuthUserContext.Consumer>
  );
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(withFirebase(AccountPage));