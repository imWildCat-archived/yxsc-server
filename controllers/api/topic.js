/**
 * Topic Controller
 *
 * @author WildCat <wildcat.name@gmail.com>
 * @date 2014-06-08
 */

var models = require('../../models');
var TopicModel = models.Topic;
var ReplyModel = models.Reply;
var UserModel = models.User;
var NotificationModel = models.Notification;

//const NEW_TOPIC_COST = 20;
//const NEW_REPLY_COST = 5;

/**
 * 发表新话题
 * @param req
 * @param res
 */
exports.postNew = function (req, res) {
    var campus = req.param('campus');
    var subject = req.param('subject');
    var content = req.param('content');
    var type = req.param('type');

    UserModel.execNewTopicAction(req.session.user).then(function () {
        return TopicModel.createNew(req.session.user, type, campus, subject, content)
    }, function (error) {
        // 积分不足
        return res.json.error(error);
    }).then(function (ret) {
        return res.json.success(ret);
    }).fail(function () {
        return res.json.error();
    });
};

/**
 * 获取话题列表
 * @param req
 * @param res
 */
exports.getList = function (req, res) {
    var campus = req.param('campus');
    var type = req.param('type');
    var page = req.param('page');

    TopicModel.getList(type, campus, page).then(function (ret) {
        if (ret.length === 0) {
            return res.json.error('TOPIC_EMPTY_LIST');
        }
        return res.json.success(ret);
    }).end(function () {
        return res.json.error();
    });
};

/**
 * 获取单个Topic
 * @param req
 * @param res
 */
exports.getSingle = function (req, res) {
    var id = req.param('id');
    var page = req.param('page');

    var data = {topic: null, replies: null};

    TopicModel.fetchSingle(id).then(function (ret) {
        data.topic = ret;
        return ReplyModel.fetchReplies(id, page);
    }).then(function (ret) {
        data.replies = ret;
        res.json.success(data);
    }, function () {
        return res.json.error();
    }).end(function () {
        return res.json.error('TOPIC_NOT_FOUND');
    });
};

/**
 * 发表回复
 * @param req
 * @param res
 */
exports.postReply = function (req, res) {
    var topicId = req.param('id');
    var content = req.param('content');
    var topicAuthorId = null;

    UserModel.execNewReplyAction(req.session.user).then(function () {
        return TopicModel.fetchSingle(topicId);
    }, function (error) {
        // 积分不足
        return res.json.error(error);
    }).then(function (ret) {
        // topic 回复数加1
        ret.replyCount += 1;
        // 最后回复时间
        ret.lastModified = Date.now();
        topicAuthorId = ret.author._id;
        ret.save();
        return ReplyModel.createReply(req.session.user, topicId, content, ret.replyCount);
    }).then(function (ret) {
        if(topicAuthorId !=  req.session.user._id) {
            // 创建回复提醒
//            console.log('User: '. req.session.user);
            NotificationModel.makeReply(topicAuthorId, req.session.user._id, topicId, ret._id).then(function(success){
                   console.log(success);
            },function(error){
                console.log(error);
            });
        }

        res.json.success(ret);
    }, function (error) {
        res.json.error(error);
    });
};

/**
 * 处理举报 尚未实现
 * @param req
 * @param res
 * @returns {*}
 */
exports.getReport = function (req, res) {
    return res.json.success({reported: true});
};