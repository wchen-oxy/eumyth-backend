const Bookmark = require('./bookmark.model');
const Comment = require('./comment.model');
const ContentPreview = require('./content.preview.model');
const DraftPreview = require('./draft.preview.model');
const Feed = require('./feed.model');
const ImageAnnotation = require('./image.annotation.model');
const IndexPursuit = require('./index.pursuit.model');
const IndexUser = require('./index.user.model');
const IndexRecent = require('./index.recent.model');
const Post = require('./post.model');
const PostTree = require('./post.tree.model');
const Project = require('./project.model');
const Pursuit = require('./pursuit.model');
const Ref = require('./ref.model');
const User = require('./user.model');
const UserPreview = require('./user.preview.model');
const UserRelation = require('./user.relation.model');
const UserRelationStatus = require('./user.relation.status.model');
const ModelConstants = require('./constants');
const ProjectPreview = require('./project.preview.model');

const selectModel = (type) => {
    switch (type) {
        case (ModelConstants.BOOKMARK):
            return Bookmark.Model;
        case (ModelConstants.COMMENT):
            return Comment.Model;
        case (ModelConstants.CONTENT_PREVIEW):
            return ContentPreview.Model;
        case (ModelConstants.DRAFT_PREVIEW):
            return DraftPreview.Model
        case (ModelConstants.IMAGE_ANNOTATION):
            return ImageAnnotation.Model;
        case (ModelConstants.INDEX_PURSUIT):
            return IndexPursuit.Model;
        case (ModelConstants.INDEX_RECENT):
            return IndexRecent.Model;
        case (ModelConstants.INDEX_USER):
            return IndexUser.Model;
        case (ModelConstants.POST):
            return Post.Model;
        case (ModelConstants.POST_TREE):
            return PostTree.Model;
        case (ModelConstants.PROJECT):
            return Project.Model;
        case (ModelConstants.PROJECT_PREVIEW_WITH_ID):
            return ProjectPreview.Model.WithID;
        case (ModelConstants.PROJECT_PREVIEW_NO_ID):
            return ProjectPreview.Model.NoID;
        case (ModelConstants.FEED):
            return Feed.Model;
        case (ModelConstants.PURSUIT):
            return Pursuit.Model;
        case (ModelConstants.REF):
            return Ref.Model;
        case (ModelConstants.USER):
            return User.Model;
        case (ModelConstants.USER_PREVIEW):
            return UserPreview.Model;
        case (ModelConstants.USER_RELATION):
            return UserRelation.Model;
        case (ModelConstants.USER_RELATION_STATUS):
            return UserRelationStatus.Model;
        default:
            throw new Error('No Model Type matched. Input Was: ' + type);
    }
}

module.exports = selectModel;