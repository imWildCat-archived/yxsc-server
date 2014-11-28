/***
 *  回复 Reply 模型
 *
 * @author WildCat <wildcat.name@gmail.com>
 * @date 2014-06-19
 */

var mongoose = require('mongoose');

var ModelUtilities = require('../libs/model_utilities');

var ReplySchema = new mongoose.Schema({
    topic: {type: mongoose.Schema.Types.ObjectId, ref: 'Topic'},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    date: {type: Date, default: Date.now, required: true},
    isDeleted: {type: Boolean, default: false},
    content: {type: String, required: true},
    position: {type: Number, required: true}
}, {
    versionKey: false,
    collection: 'reply'
});

/**
 * 创建新回复
 * @param author
 * @param topic
 * @param content
 * @returns {Promise|*|Array|{index: number, input: string}|"mongoose".Promise<T>}
 */
ReplySchema.statics.createReply = function (author, topicId, content, position) {
    return this.create({
        author: author._id,
        topic: topicId,
        content: content,
        position: position
    });
};


/**
 * 获取回复
 * @param topicId
 * @param page
 * @returns {"mongoose".Promise<T>}
 */
ReplySchema.statics.fetchReplies = function (topicId, page) {
    const LIMIT_PER_PAGE = 20;
    page = parseInt(page);

    var startLine = ModelUtilities.startLine(page, LIMIT_PER_PAGE);

    var condition = {
        topic: topicId,
        isDeleted: false
    };

    var query = this.find(condition, 'author date content position').populate('author', 'username avatar').sort({date: 1}).skip(startLine).limit(LIMIT_PER_PAGE);
    return query.exec();
};


/**
 * 获取单个用户的回复列表
 * @param userId
 * @param page
 * @returns {"mongoose".Query<T>}
 */
ReplySchema.statics.fetchListOfUser = function (userId, page) {
    const LIMIT_PER_PAGE = 20;

    var startLine = ModelUtilities.startLine(page, LIMIT_PER_PAGE);
    return this.find({
        author: userId,
        isDeleted: false
    }).populate('topic', 'subject').sort({date: -1}).skip(startLine).limit(LIMIT_PER_PAGE).exec();
};

module.exports = ReplySchema;