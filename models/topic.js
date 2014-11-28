/***
 *  话题 Topic 模型
 *
 * @author WildCat <wildcat.name@gmail.com>
 * @date 2014-06-06
 */

var mongoose = require('mongoose');

var ModelUtilities = require('../libs/model_utilities');

var TopicSchema = new mongoose.Schema({
    subject: {type: String, required: true},                            // 标题
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},                     // 作者
    type: {type: Number, requried: true},                               // 话题类型: 1 -> 系统公告, 2 -> 社团招募, 3 -> 学长帮帮忙, 4 -> 寻物启事, 5 -> 失物招领， 6 -> 二手交易
    campus: {type: Number, required: true, default: 1},                 // 所属校区: 1 -> 燕山, 2 -> 舜耕, 3 -> 圣井, 4 -> 明水
    isDeleted: {type: Boolean, default: false},                                         // 是否被删除，被删除的不会被显示
    isTopMarked: {type: Boolean, default: false},                                       // 是否被置顶
    date: {type: Date, default: Date.now, required: true},              // 发布日期
    lastModified: {type: Date, default: Date.now, required: true, index: true},      // 最后回复/append
//    visitCount: {type: Number, default: 0, required: true},             // 浏览次数
    replyCount: {type: Number, default: 0, required: true},             // 回复数
    content: {type: String, required: false},                           // 内容
    appendages: {type: [String], require: false}                        // 附加信息
}, {
    versionKey: false,
    collection: 'topic'
});

/** - 模型方法 - **/

/**
 * 创建新话题 (一般情况下需要被其他方法调用)
 * @param author {ObjectId}
 * @param type {Number}
 * @param campus {Number}
 * @param subject {String}
 * @param content {String}
 * @returns {Promise|*|Array|{index: number, input: string}|"mongoose".Promise<T>}
 */
TopicSchema.statics.createNew = function (author, type, campus, subject, content) {
    campus = parseInt(campus);
    type = parseInt(type);
    if (type < 2 || type > 6) type = null;
    if (campus < 1 || campus > 4) campus = 1;
    return this.create({
        subject: subject,
        type: type,
        author: author['_id'],
        content: content,
        campus: campus
    });
};

/**
 * 获取某个分类(某个校区)下的话题列表 (一般情况下需要被其他方法调用)
 * @param type {number}
 * @param campus {number} 5 - All campus
 * @param page {number}
 * @returns {Promise|*|Array|{index: number, input: string}|"mongoose".Promise<T>}
 */

TopicSchema.statics.getList = function (type, campus, page) {
    const LIMIT_PER_PAGE = 15;
    campus = parseInt(campus);
    type = parseInt(type);

    var startLine = ModelUtilities.startLine(page, LIMIT_PER_PAGE);

    if (type < 1 || type > 5) type = 1;
    if (campus < 1 || campus > 5) campus = 1;

    var condition = {
        type: type,
        isDeleted: false // 屏蔽掉被删除的
    };

    // 如果是5，查找全部
    if (campus < 5) condition.campus = campus;

    var query = this.find(condition, 'subject author date').populate('author', 'username').sort({lastModified: -1}).skip(startLine).limit(LIMIT_PER_PAGE);
    return query.exec();
};

/**
 * 获取单个话题
 * @param id
 * @returns {"mongoose".Promise<T>|Promise}
 */
TopicSchema.statics.fetchSingle = function (id) {
    return this.findOne({
        _id: id,
        isDeleted: false
    }).populate('author', 'username avatar').exec();
};

/**
 * 获取一个用户的贴子列表
 * @param userId
 * @param page
 * @returns {"mongoose".Query<T>}
 */
TopicSchema.statics.fetchListOfUser = function (userId, page) {
    const LIMIT_PER_PAGE = 20;

    var startLine = ModelUtilities.startLine(page, LIMIT_PER_PAGE);
    return this.find({
        author: userId,
        isDeleted: false
    }, 'subject type replyCount visitCount date lastModified').sort({lastModified: -1}).skip(startLine).limit(LIMIT_PER_PAGE).exec();
};


///**
// * 创建新寻物启事
// * @param author
// * @param campus
// * @param subject
// * @param content
// * @returns {Promise}
// */
//TopicSchema.statics.createLost = function (author, campus, subject, content) {
//    return this.createNew(author, 4, campus, subject, content);
//};

///**
// * 获取 寻物启事 下的话题列表
// * @param campus
// * @returns {Promise}
// */
//TopicSchema.statics.getList4Lost = function (campus) {
//    return this.getList(4, campus);
//};

module.exports = TopicSchema;