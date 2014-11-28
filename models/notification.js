/***
 *  系统消息 - Notification
 *
 * @author WildCat <wildcat.name@gmail.com>
 * @date 2014-06-06
 */

var mongoose = require('mongoose');

var ModelUtilities = require('../libs/model_utilities');

var NotificationSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    from: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false},
    topic: {type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: false},
    reply: {type: mongoose.Schema.Types.ObjectId, ref: 'Reply', required: false},
    unread: {type: Boolean, default: true},
    date: {type: Date, default: Date.now},
    type: {type: Number, required: true}
}, {
    versionKey: false,
    collection: 'notification'
});

// TODO
/**
 * 创建提醒
 * @param user
 * @param from
 * @param type
 */
NotificationSchema.statics.makeSingle = function (user, from, type, topic, reply) {
    if (!topic) topic = null;
    if (!reply) reply = null;
    return this.create({
        user: user,
        from: from,
        type: type,
        topic: topic,
        reply: reply
    });
};

/**
 * 创建回复提醒
 * @param user
 * @param from
 */
NotificationSchema.statics.makeReply = function (user, from, topic, reply) {
    return this.makeSingle(user, from, 1, topic, reply);
};

NotificationSchema.statics.fetchList = function (user, page) {
    const LIMIT_PER_PAGE = 20;
    var startLine = ModelUtilities.startLine(page, LIMIT_PER_PAGE);

    this.update({user: user, unread: true}, {$set: {unread: false}}, {multi: true}, function (error, ret) {
//        console.log(error);
//        console.log(ret);
    });

    return this.find({user: user}).populate('reply', 'content').populate('topic', 'subject').populate('from', 'username avatar').sort({date: -1}).skip(startLine).limit(LIMIT_PER_PAGE).exec();
};

NotificationSchema.statics.fetchUnreadCount = function (user) {
    return this.count({user: user, unread: true}).exec();
};

module.exports = NotificationSchema;