import axios from 'axios';
import React from 'react';
import {IMAGE_UPLOAD_URL, DRAFT_UPLOAD_URL} from "../Components/constants/index";


export default class AxiosHelper {
    static testString() {
        console.log("TEST SUCCESS");
    }

    static returnPursuitNames(username) {
        return axios.get('http://localhost:5000/user/index', {
            params: {
                username: username
            }
        });
    }

    static returnIndexUsername(uid) {
        return axios.post('http://localhost:5000/user/username', {
            uid: uid
        })
    }

    static checkUsernameAvailable(username) {
        return axios.post('http://localhost:5000/user/available', { username: username });
    }

    static createUserProfile(username, pursuitsArray) {
        return axios.post('http://localhost:5000/user', { username: username, pursuits: pursuitsArray });

    }

    static saveDraft(username, editorState) {
        return axios.post('http://localhost:5000/draft', { username: username, editorState: editorState });
    }

    static retrieveDraft(username) {
        return axios.get('http://localhost:5000/draft',
            {
                params: { username: username }
            }
        )
    }

    // static createIndexUserProfile(uid, username, pursuits){
    //     return axios.post('http://localhost:5000/user/index', { uid: uid, username: username, private: false, pursuits: pursuits})

    // }

    static postImage(formData) {
        return axios.post('http://localhost:5000/entry/image', formData);
    }

    static postShortPost(formData, progressRef, uploadRef, textOnly){
        if (textOnly) return axios.post('http://localhost:5000/entry/short', formData);
        else{
            return axios.post('http://localhost:5000/entry/short', formData, {
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
        return axios.post('http://localhost:5000/entry/', content)
    }

}

