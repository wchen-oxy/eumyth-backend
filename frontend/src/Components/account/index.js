import React, { useState, useEffect } from 'react';
import PasswordChangeForm from '../password/change';
import AvatarEditor from 'react-avatar-editor';
import Dropzone from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import AxiosHelper from "../../Axios/axios";
import { AuthUserContext, withAuthorization } from '../session';
import { withFirebase } from '../../Firebase';
import { PUBLIC, PRIVATE, DISPLAY, COVER } from "../constants/flags";
import "./index.scss";

const AccountPage = (props) => {
  const [displayPhoto, setDisplayPhoto] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [bio, setBioText] = useState('');
  const [displayPhotoScale, setDisplayPhotoScale] = useState(1);
  const [displayPhotoRotation, setDisplayPhotoRotation] = useState(0);
  const [AvatarEditorInstance, setAvatarEditorInstance] = useState(null);
  const [isPrivate, setIsPrivate] = useState(null);
  const displayPhotoRef = React.createRef();
  const coverPhotoRef = React.createRef();

  useEffect(
    () => {
      AxiosHelper
        .returnAccountSettingsInfo(props.firebase.returnUsername())
        .then((result) => {
          setBioText(result.data.bio);
          setIsPrivate(result.data.private);
        });
    }, [props.firebase])

  const handleImageDrop = (dropped) => {
    setDisplayPhoto(dropped);
  }

  const showPhotoEditor = (ref) => {
    if (ref.current.style.display === "") { ref.current.style.display = "flex"; }
    else {
      ref.current.style.display = "";
    }
  }

  const removePhoto = (photoType) => {
    const username = props.firebase.returnUsername();
    if (window.confirm("Are you sure you want to remove your photo?")) {
      AxiosHelper
        .deleteAccountPhoto(username, photoType)
        .then((results) => {
          let formData = new FormData();
          formData.append("username", username);
          formData.append("imageKey", "");
          return AxiosHelper.updatePostDisplayPhotos(formData)
        })
        .then(() => {
          if (photoType === DISPLAY) {
            window.alert(
              `Your Display Photo has been removed. 
              You should see the changes take effect soon.`
            );
          }
          else if (photoType === COVER) {
            window.alert(
              `Your cover photo has been removed. You should
               see the changes take effect immediately.`
            );
          }
          window.location.reload();
        })
        .catch((err) => {
          console.log(err);
          window.alert(
            `Something went wrong while deleting your image.
             Please wait and try again later`
          );
        });
    }
  }

  const handlePhotoSubmit = (formData, photoType) => {
    const username = props.firebase.returnUsername();
    return (
      AxiosHelper
        .deleteAccountPhoto(username, photoType)
        .then((result) => {
          console.log(result);
          return AxiosHelper.updateAccountImage(formData, photoType);
        })
        .then((results) => {
          const form = {
            username: username,
            imageKey: results.data.imageKey
          };
          return AxiosHelper.updatePostDisplayPhotos(form)
        })
        .then((results) => {
          console.log(results);
          alert("Successfully updated!");
          window.location.reload();
        })
        .catch((err) => {
          console.log(err);
          alert("Something has gone wrong while updating :(")
        })
    );
  }

  const handleBioSubmit = () => {
    return (
      AxiosHelper.updateBio({
        bio: bio,
        username: props.firebase.returnUsername()
      })
        .then(() => {
           alert("Successfully updated your bio!"); 
           window.location.reload();
          })
        .catch((err) => console.log(err))
    );
  }

  const handleProfilePrivacyChange = (privacySetting) => {
    const isPrivate = privacySetting === PRIVATE ? true : false;
    setIsPrivate(isPrivate);
    return AxiosHelper
      .setProfilePrivacy(
        props.firebase.returnUsername(),
        isPrivate
      ).catch((err) => {
        console.log(err);
        alert("Unable to update Profile Privacy.");
      })
  }

  const submitPhoto = (photoType) => {
    let formData = new FormData();
    formData.append('username', props.firebase.returnUsername());
    if (photoType === DISPLAY) {
      const titles = ["normal", "small", "tiny"];
      const canvas = AvatarEditorInstance.getImage();
      const image = imageCompression.canvasToFile(canvas);
      image.then((result) =>
        Promise.all([
          imageCompression(
            result,
            {
              maxWidthOrHeight: 250,
              maxSizeMB: 1,
              fileType: "image/jpeg"
            }),
          imageCompression(
            result,
            {
              maxWidthOrHeight: 125,
              maxSizeMB: 1,
              fileType: "image/jpeg"
            }),
          imageCompression(
            result,
            {
              maxWidthOrHeight: 62,
              maxSizeMB: 1,
              fileType: "image/jpeg"
            })
        ]))
        .then((results) => {
          let imageArray = [];
          for (let i = 0; i < 3; i++) {
            imageArray.push(
              new File([results[i]], titles[i], { type: "image/jpeg" })
            );
          }
          formData.append("croppedImage", results[0]);
          formData.append("smallCroppedImage", results[1]);
          formData.append("tinyCroppedImage", results[2]);
          return handlePhotoSubmit(formData, photoType);
        }
        )
    }
    else if (photoType === COVER) {
      if (coverPhoto.size > 1000000) {
        return (
          imageCompression(coverPhoto, { maxSizeMB: 1, fileType: "image/jpeg" })
            .then(formattedImage => {
              formData.append('coverPhoto', formattedImage);
              handlePhotoSubmit(formData, photoType);
            })
        );
      }
      else {
        formData.append('coverPhoto', coverPhoto);
        return handlePhotoSubmit(formData, photoType);
      }
    }
  }

  const renderProfilePhotoEditor = () => (
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
                ref={(editor) => setAvatarEditorInstance(editor)}
                image={displayPhoto}
                width={170}
                height={170}
                borderRadius={200}
                border={50}
                color={[215, 215, 215, 0.8]} // RGBA
                scale={displayPhotoScale}
                rotate={displayPhotoRotation}
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
        value={displayPhotoRotation}
        onChange={(e) => setDisplayPhotoRotation(parseFloat(e.target.value))} />
      <label>Scale</label>
      <input
        type="range"
        id="points"
        name="points"
        step="0.1"
        min="1"
        max="10"
        value={displayPhotoScale}
        onChange={(e) => setDisplayPhotoScale(parseFloat(e.target.value))} />
    </>
  );
  return (
    <AuthUserContext.Consumer>
      {
        authUser => {
          return (
            <div id="account-container">
              <h1>Account: {authUser.email}</h1>
              <PasswordChangeForm />
              <select
                name="pursuit-category"
                value={isPrivate ? PRIVATE : PUBLIC}
                onChange={(e) => handleProfilePrivacyChange(e.target.value)}>
                <option key="private" value={PRIVATE}>Private</option>
                <option key="public" value={PUBLIC}>Public</option>
              </select>
              <button onClick={() => showPhotoEditor(displayPhotoRef)}>
                Edit your Display Photo
              </button>
              <div
                ref={displayPhotoRef}
                className="account-photo-edit-container"
              >
                <label>Change your display photo!</label>
                <input
                  type="file"
                  onChange={(e) => setDisplayPhoto(e.target.files[0])}
                />
                {displayPhoto ? renderProfilePhotoEditor() : <div></div>}
                <button onClick={() => submitPhoto(DISPLAY)}>
                  Submit your display photo!
                </button>
                <button onClick={() => removePhoto(DISPLAY)}>
                  Remove display Photo?
                </button>
              </div>
              <button onClick={() => showPhotoEditor(coverPhotoRef)}>
                Edit your Cover Photo
              </button>
              <div ref={coverPhotoRef} className="account-photo-edit-container">
                <label>Change your cover photo!</label>
                <input type="file" onChange={(e) => {
                  setCoverPhoto(e.target.files[0]);
                }} />
                <button onClick={() => submitPhoto(COVER)}>
                  Submit your cover photo!
                </button>
                <button onClick={() => removePhoto(COVER)}>
                  Remove your cover photo
                </button>
              </div>
              <label>Edit your bio</label>
              <textarea
                type="text"
                onChange={e => setBioText(e.target.value)}
                value={bio}
                maxLength={500}
              />
              <button onClick={handleBioSubmit}>
                Submit Bio
              </button>
            </div>
          );
        }
      }
    </AuthUserContext.Consumer>
  );
}

const condition = authUser => !!authUser;
export default withAuthorization(condition)(withFirebase(AccountPage));