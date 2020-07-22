import axios from 'axios';
import React from 'react';

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
        return axios.post('http://localhost:5000/entry/image', formData)
    }

    static saveEntry(content) {
        return axios.post('http://localhost:5000/entry/', content)
    }

}

