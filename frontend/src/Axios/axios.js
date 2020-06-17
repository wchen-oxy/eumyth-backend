import axios from 'axios';
import React from 'react';

export default class AxiosHelper{
    static testString(){
        console.log("TEST SUCCESS");
    }

    static returnPursuitNames(username){
        return axios.get('http://localhost:5000/user/index', {
            params: {
                username: username
            }
        });
    }

    static checkUsernameAvailable(username){
        return axios.post('http://localhost:5000/user/available', {
                username: username
                })
    }

    static createUserProfile(uid, pursuitsArray){
        return axios.post('http://localhost:5000/pursuit', { uid: uid, pursuits: pursuitsArray });

    }

    static createIndexUserProfile(uid, username, pursuits){
        return axios.post('http://localhost:5000/user/index', { uid: uid, username: username, private: false, pursuits: pursuits})

    }

}

