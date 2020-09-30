import axios from 'axios';
import urls from "../Components/constants/urls";

export default class AxiosHelper {
    static testString() {
        console.log("TEST SUCCESS");
    }

    static checkUsernameAvailable(username) {
        console.log(urls.CHECK_USERNAME_URL);
        return axios.get(urls.CHECK_USERNAME_URL, { params: { username: username } });
    }

    static createUserProfile(formData) {
        return axios.put(urls.USER_BASE_URL, formData);
    }

    // static setFriendStatus(formData){
    //     return axios.put(urls.RELATION_STATUS_URL, formData);
    // }
    static setFriendStatus(visitorUsername, targetUserRelationId, action) {
        return axios.put(urls.RELATION_STATUS_URL, {
            visitorUsername: visitorUsername,
            targetUserRelationId: targetUserRelationId,
            action: action
        });
    }

    static setDraftPreviewTitle(previewTitle) {
        return axios.post(urls.DRAFT_BASE_URL, { previewTitle: previewTitle });
    }

    static returnPursuitNames(username) {
        return axios.get(urls.INDEX_USER_PURSUITS_URL, {
            params: {
                username: username
            }
        });
    }

    static returnIndexUser(username) {
        return axios.get(urls.INDEX_BASE_URL, {
            params: {
                username: username
            }
        })
    }

    static returnUser(username) {
        return axios.get(urls.USER_BASE_URL, { params: { username: username } });
    }

    static returnFollowerStatus(visitorUsername, userRelationArrayId) {
        return axios.get(urls.RELATION_BASE_URL, {
            params: {
                visitorUsername: visitorUsername,
                userRelationArrayId: userRelationArrayId,
            }
        })
    }

    // static returnIndexUsername(uid) {
    //     return axios.post(UserEndpoint.USERNAME_URL, {
    //         uid: uid
    //     })
    // }

    // static postImage(formData) {
    //     return axios.post(PostEndpoint.IMAGE_POST, formData);
    // }

    static createPost(postInfoForm) {
        return axios.put(urls.POST_BASE_URL, postInfoForm);
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

    static saveDraftMetaInfo(metaInfoForm) {
        return axios.put(urls.DRAFT_BASE_URL, metaInfoForm)
    }

    static saveDraft(username, draft) {
        return axios.put(urls.DRAFT_BASE_URL,
            { username: username, draft: draft }
        )
    }
    static retrieveDraft(username) {
        return axios.get(urls.DRAFT_BASE_URL,
            { params: { username: username } }
        )
    }
}

