import axios from 'axios';
import React from 'react';
import {DRAFT_UPLOAD_URL} from "../Components/constants/index";
import * as UserEndpoint from "../Components/constants/user";
import * as PostEndpoint from "../Components/constants/post";



export default class AxiosHelper {
    static testString() {
        console.log("TEST SUCCESS");
    }
    static checkUsernameAvailable(username) {
        return axios.post(UserEndpoint.USERNAME_AVAILABLE_URL, { username: username });
    }

    static createUserProfile(username, pursuitsArray) {
        return axios.post(UserEndpoint.NEW_USER_URL, { username: username, pursuits: pursuitsArray });

    }

    static returnPursuitNames(username) {
        return axios.get(UserEndpoint.INDEX_INFO_URL, {
            params: {
                username: username
            }
        });
    }

    static returnIndexUsername(uid) {
        return axios.post(UserEndpoint.USERNAME_URL, {
            uid: uid
        })
    }

    static postImage(formData) {
        return axios.post(PostEndpoint.IMAGE_POST, formData);
    }

    static postShortPost(formData, progressRef, uploadRef, textOnly){
        if (textOnly) return axios.post(PostEndpoint.SHORT_POST_URL, formData);
        else{
            return axios.post(PostEndpoint.SHORT_POST_URL, formData, {
            onUploadProgress: (progressEvent) => {
                const uploadPercentage = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
                progressRef.current.innerHTML = `${uploadPercentage}%`;
                progressRef.current.style.width = `${uploadPercentage}%`;

                if (uploadPercentage === 100) {
                    uploadRef.current.innerHTML = 'File(s) Uploaded';
                    // alert("Upload Complete!")
                    // validFiles.length = 0;
                    // setValidFiles([...validFiles]);
                    // setSelectedFiles([...validFiles]);
                    // setUnsupportedFiles([...validFiles]);
                }
            },
        });
        }
    }

    static savePost(content) {
        return axios.post(PostEndpoint.NEW_POST_URL, content)
    }
    
    static saveDraft(username, editorState) {
        return axios.post(DRAFT_UPLOAD_URL, { username: username, editorState: editorState });
    }

    static retrieveDraft(username) {
        return axios.get(DRAFT_UPLOAD_URL,
            {
                params: { username: username }
            }
        )
    }


}

