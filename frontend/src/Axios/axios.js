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

    static returnMultipleProjects(projectIdList) {
        return axios.get(urls.MULTIPLE_PROJECTS_URL, {
            params: {
                projectIdList: projectIdList
            }
        })
    }

    static returnMultiplePosts(postIdList, includePostText) {
        return axios.get(urls.MULTIPLE_POSTS_URL, {
            params: {
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

    static returnBio(username) {
        return axios.get(urls.USER_BIO_URL, {
            params: {
                username: username
            }
        })
    }
    static updateBio(formData) {
        return axios.put(urls.USER_BIO_URL, formData);
    }
    static updatePost(postInfoForm) {
        return axios.put(urls.POST_BASE_URL, postInfoForm);
    }

    static createProject(projectInfo) {
        return axios.post(urls.PROJECT_BASE_URL, projectInfo)
    }

    static updateAccountImage(formData, photoType) {
        return axios.post(photoType === "COVER" ? urls.COVER_PHOTO_URL : urls.DISPLAY_PHOTO_URL, formData)
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

    static deleteAccountPhoto(username, photoType) {
        return axios.delete(photoType === "COVER" ? urls.COVER_PHOTO_URL : urls.DISPLAY_PHOTO_URL, {
            data: {
                username: username,
                contentType: photoType
            }
        })
    }

    static saveDraftMetaInfo(metaInfoForm) {
        return axios.put(urls.DRAFT_BASE_URL, metaInfoForm)
    }

    static saveDraft(username, draft) {
        return axios.put(urls.DRAFT_BASE_URL,
            { username: username, draft: JSON.stringify(draft) }
        )
    }
    static retrieveNewPostInfo(username) {
        return axios.get(urls.DRAFT_BASE_URL,
            { params: { username: username } }
        )
    }
}

