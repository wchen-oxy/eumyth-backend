import axios from 'axios';
import React from 'react';
import {IMAGE_UPLOAD_URL, DRAFT_UPLOAD_URL} from "../Components/constants/index";
import * as UserEndpoint from "../Components/constants/user";
import * as EntryEndpoint from "../Components/constants/entry";



export default class AxiosHelper {
    static testString() {
        console.log("TEST SUCCESS");
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

    static checkUsernameAvailable(username) {
        return axios.post(UserEndpoint.USERNAME_AVAILABLE_URL, { username: username });
    }

    static createUserProfile(username, pursuitsArray) {
        return axios.post(UserEndpoint.NEW_USER_URL, { username: username, pursuits: pursuitsArray });

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

    // static createIndexUserProfile(uid, username, pursuits){
    //     return axios.post('http://localhost:5000/user/index', { uid: uid, username: username, private: false, pursuits: pursuits})

    // }

    static postImage(formData) {
        return axios.post(EntryEndpoint.IMAGE_POST, formData);
    }

    static postShortPost(formData, progressRef, uploadRef, textOnly){
        if (textOnly) return axios.post(EntryEndpoint.SHORT_POST_URL, formData);
        else{
            return axios.post(EntryEndpoint.SHORT_POST_URL, formData, {
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

    static saveEntry(content) {
        return axios.post(EntryEndpoint.NEW_ENTRY_URL, content)
    }

}

