import axios from 'axios';
import urls from "../Components/constants/urls";

export default class AxiosHelper {

    static changeRelationStatus(action, targetUsername, currentUsername, id) {
        return axios.put(urls.RELATION_SET_FOLLOWER_URL, {
            action: action,
            targetUsername: targetUsername,
            currentUsername: currentUsername,
            id: id
        })
    }

    static checkUsernameAvailable(username) {
        console.log(urls.CHECK_USERNAME_URL);
        return axios.get(urls.CHECK_USERNAME_URL, { params: { username: username } });
    }

    static createPost(postInfoForm) {
        return axios.post(urls.POST_BASE_URL, postInfoForm);
    }

    static createProject(projectInfo) {
        return axios.post(urls.PROJECT_BASE_URL, projectInfo)
    }

    static createUserProfile(formData) {
        return axios.post(urls.USER_BASE_URL, formData);
    }

    static deleteAccountPhoto(username, photoType) {
        return axios.delete(photoType === "COVER" ? urls.COVER_PHOTO_URL : urls.DISPLAY_PHOTO_URL, {
            data: {
                username: username,
                contentType: photoType
            }
        })
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

    static getUserPreviewId(query) {
        return axios.get(urls.USER_PREVIEW_ID_URL, query);
    }

    static returnUserRelationInfo(username) {
        return axios.get(urls.RELATION_INFO_URL, {
            params: {
                username: username
            }
        });
    }

    static returnTinyDisplayPhoto(username) {
        return axios.get(urls.TINY_DISPLAY_PHOTO_URL, {
            params: {
                username: username
            }
        })
    }

    static setProfilePrivacy(username, isPrivate) {
        return axios.put(urls.USER_PRIVACY, {
            username: username,
            private: isPrivate
        });
    }

    static setFollowerStatus(payload) {
        return axios.put(urls.RELATION_STATUS_URL, payload);
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

    static returnMultipleProjects(projectIdList) {
        return axios.get(urls.MULTIPLE_PROJECTS_URL, {
            params: {
                projectIdList: projectIdList
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

    static returnMultiplePosts(postIdList, includePostText) {
        return axios.get(urls.MULTIPLE_POSTS_URL, {
            params: {
                postIdList: postIdList,
                includePostText: includePostText
            }
        })
    }

    static retrievePost(postId, textOnly) {
        return axios.get(urls.SINGLE_POST_TEXT_DATA_URL, {
            params: {
                postId: postId,
                textOnly: textOnly
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

    static returnAccountSettingsInfo(username) {
        return axios.get(urls.USER_ACCOUNT_SETTINGS_INFO, {
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

    static updateAccountImage(formData, photoType) {
        return axios.post(photoType === "COVER" ? urls.COVER_PHOTO_URL : urls.DISPLAY_PHOTO_URL, formData)
    }

    static getComments(query) {
        return axios.get(urls.COMMENT_BASE_URL, query)
    }
    static postComment(payload) {
        return axios.post(urls.ROOT_COMMENT_URL, payload);
    }

    static postReply(payload) {
        return axios.post(urls.REPLY_COMMENT_URL, payload);
    }

    static retrieveNewPostInfo(username) {
        return axios.get(urls.DRAFT_BASE_URL,
            { params: { username: username } }
        )
    }

    static refreshComments(query) {
        return axios.get(urls.REFRESH_COMMENTS_URL, query);
    }

    static saveDraft(username, draft) {
        return axios.put(urls.DRAFT_BASE_URL,
            { username: username, draft: JSON.stringify(draft) }
        )
    }

    static saveDraftMetaInfo(metaInfoForm) {
        return axios.put(urls.DRAFT_BASE_URL, metaInfoForm)
    }

    static updatePostDisplayPhotos(formData) {
        return axios.patch(urls.POST_DISPLAY_PHOTO_URL, formData);
    }

    static voteOnComment(payload) {
        return axios.put(urls.VOTE_ON_COMMENT_URL, payload);
    }

}

