import axios from 'axios';
import { DRAFT_URL } from "../Components/constants/index";
import * as IndexUserEndpoint from "../Components/constants/index-user";
import * as UserEndpoint from "../Components/constants/user";
import * as PostEndpoint from "../Components/constants/post";




export default class AxiosHelper {
    static testString() {
        console.log("TEST SUCCESS");
    }

    static checkUsernameAvailable(username) {
        console.log(IndexUserEndpoint.CHECK_USERNAME_URL);
        return axios.get(IndexUserEndpoint.CHECK_USERNAME_URL, { params: { username: username } });
    }

    static createUserProfile(username, pursuits, croppedImage, smallCroppedImage, tinyCroppedImage) {
        let formData = new FormData();
        formData.append("username", username);
        formData.append("croppedImage", croppedImage);
        formData.append("smallCroppedImage", smallCroppedImage);
        formData.append("tinyCroppedImage", tinyCroppedImage);
        formData.append("pursuits", JSON.stringify(pursuits));
        return axios.post(UserEndpoint.USER_URL, formData);
    }

    static setDraftPreviewTitle(previewTitle) {
        return axios.post(DRAFT_URL, { previewTitle: previewTitle });
    }

    static returnPursuitNames(username) {
        return axios.get(IndexUserEndpoint.INDEX_USER_PURSUITS_URL, {
            params: {
                username: username
            }
        });
    }

    static returnIndexUser(username) {
        return axios.get(IndexUserEndpoint.INDEX_USER_URL, {
            params: {
                username: username
            }
        })
    }

    static returnUser(username) {
        return axios.get(UserEndpoint.USER_URL, { params: { username: username } });
    }

    // static returnIndexUsername(uid) {
    //     return axios.post(UserEndpoint.USERNAME_URL, {
    //         uid: uid
    //     })
    // }

    // static postImage(formData) {
    //     return axios.post(PostEndpoint.IMAGE_POST, formData);
    // }

    static createPost(username, postType, textData, imageArray, coverPhoto, date, minDuration, isMilestone, title, postPrivacyType, pursuitCategory) {
        let formData = new FormData();
        console.log(imageArray);
        console.log(coverPhoto);
        formData.append("postType", postType);
        formData.append("username", username);
        console.log(minDuration);
        if (title) formData.append("previewTitle", title);
        if (postPrivacyType) formData.append("postPrivacyType", postPrivacyType);
        if (pursuitCategory) formData.append("pursuitCategory", pursuitCategory)
        if (date) formData.append("date", date);
        if (minDuration) formData.append("minDuration", minDuration);
        if (isMilestone) formData.append("isMilestone", isMilestone);
        if (textData) formData.append("textData", textData);
        if (coverPhoto) formData.append("coverPhoto", coverPhoto);
        if (imageArray && imageArray.length > 0) {
            for (const image of imageArray) {
                formData.append("images", image);
            }
            return axios.post(PostEndpoint.POST_URL, formData);
        }
        return axios.post(PostEndpoint.POST_URL, formData);
    }
    //FIXME 
    //STEAL THE UPLOAD THING FROM HERE
    // static postShortPost(formData, progressRef, uploadRef, textOnly){
    //     if (textOnly) return axios.post(PostEndpoint.SHORT_POST_URL, formData);
    //     else{
    //         return axios.post(PostEndpoint.SHORT_POST_URL, formData, {
    //         onUploadProgress: (progressEvent) => {
    //             const uploadPercentage = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
    //             progressRef.current.innerHTML = `${uploadPercentage}%`;
    //             progressRef.current.style.width = `${uploadPercentage}%`;

    //             if (uploadPercentage === 100) {
    //                 uploadRef.current.innerHTML = 'File(s) Uploaded';
    //                 // alert("Upload Complete!")
    //                 // validFiles.length = 0;
    //                 // setValidFiles([...validFiles]);
    //                 // setSelectedFiles([...validFiles]);
    //                 // setUnsupportedFiles([...validFiles]);
    //             }
    //         },
    //     });
    //     }
    // }

    // static savePost(content) {
    //     return axios.post(PostEndpoint.NEW_POST_URL, content)
    // }

    // static saveDraft(username, editorState) {
    //     return axios.post(DRAFT_UPLOAD_URL, { username: username, editorState: editorState });
    // }

    static retrieveDraft(username) {
        return axios.get(DRAFT_URL,
            { params: { username: username } }
        )
    }
}

