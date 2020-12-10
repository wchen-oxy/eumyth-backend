const ROOT_URL = "http://localhost:5000";

const IMAGE_BASE_URL = ROOT_URL + "/image";
const DRAFT_BASE_URL = ROOT_URL + "/draft";

//user
const USER_BASE_URL = ROOT_URL + "/user";

//relation
const RELATION_BASE_URL = ROOT_URL + "/relation";
const RELATION_STATUS_URL = RELATION_BASE_URL + "/status";

//post
const POST_BASE_URL = ROOT_URL + "/post";
// const UPDATE_POST_URL = POST_BASE_URL + "/update";

const MULTIPLE_POSTS_URL =  POST_BASE_URL + "/multiple";

const WITH_IMAGE_POST_URL = POST_BASE_URL + "/with-image";
const NO_IMAGE_POST_URL = POST_BASE_URL + "/no-image";
const SOCIAL_FEED_POSTS_URL = POST_BASE_URL + "/feed";

const SINGLE_POST_TEXT_DATA_URL = POST_BASE_URL + "/single-text"

//project
const PROJECT_BASE_URL = ROOT_URL + "/project";
const MULTIPLE_PROJECTS_URL =  PROJECT_BASE_URL + "/multiple";



//index
const INDEX_BASE_URL = ROOT_URL + "/index";
const CHECK_USERNAME_URL = INDEX_BASE_URL + '/username';
const INDEX_USER_PURSUITS_URL = INDEX_BASE_URL + '/pursuits';

module.exports = {
    ROOT_URL,
    IMAGE_BASE_URL,
    DRAFT_BASE_URL,
    USER_BASE_URL,
    RELATION_BASE_URL,
    RELATION_STATUS_URL,
    POST_BASE_URL,
    PROJECT_BASE_URL,
    MULTIPLE_PROJECTS_URL,
    MULTIPLE_POSTS_URL,
    WITH_IMAGE_POST_URL,
    NO_IMAGE_POST_URL,
    SOCIAL_FEED_POSTS_URL,
    SINGLE_POST_TEXT_DATA_URL,
    INDEX_BASE_URL,
    CHECK_USERNAME_URL,
    INDEX_USER_PURSUITS_URL
}