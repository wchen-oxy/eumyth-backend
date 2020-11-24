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
        return axios.post(urls.USER_BASE_URL, formData);
    }


    static setFollowerStatus(visitorUsername, targetUsername, targetUserRelationId, isPrivate, action) {
        return axios.put(urls.RELATION_STATUS_URL, {
            visitorUsername: visitorUsername,
            targetUsername: targetUsername,
            targetUserRelationId: targetUserRelationId,
            isPrivate: isPrivate,
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

    static returnMultiplePostInfo(targetUserDataId, postIdList) {
        return axios.get(urls.MULTIPLE_POSTS_URL, {
            params: {
                targetUserDataId: targetUserDataId,
                postIdList: postIdList
            }
        })
    }

    static returnMultiplePosts(targetUserDataId, postIdList, includePostText) {
        return axios.get(urls.MULTIPLE_POSTS_URL, {
            params: {
                targetUserDataId: targetUserDataId,
                postIdList: postIdList,
                includePostText: includePostText
            }
        })
    }

    static retrieveTextData(postId) {
        return axios.get(urls.SINGLE_POST_TEXT_DATA_URL, {
            params: {
                postId: postId
            }
        })
    }

    static returnSocialFeedPosts(indexUserId, postIdList) {
        return axios.get(urls.SOCIAL_FEED_POSTS_URL, {
            params: {
                indexUserId: indexUserId,
                postIdList: postIdList

            }
        })
    }

    static createPost(postInfoForm) {
        return axios.post(urls.POST_BASE_URL, postInfoForm);
    }

    static updatePost(postInfoForm) {
        return axios.put(urls.POST_BASE_URL, postInfoForm);
    }

    static deletePost(userDataId, indexUserId, postId) {
        return axios.delete(urls.POST_BASE_URL, {
            data: {
                userId: userDataId,
                indexUserId: indexUserId,
                postId: postId
            }
        });
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

    static saveDraftMetaInfo(metaInfoForm) {
        return axios.put(urls.DRAFT_BASE_URL, metaInfoForm)
    }

    static saveDraft(username, draft) {
        return axios.put(urls.DRAFT_BASE_URL,
            { username: username, draft: JSON.stringify(draft) }
        )
    }
    static retrieveDraft(username) {
        return axios.get(urls.DRAFT_BASE_URL,
            { params: { username: username } }
        )
    }
}

