/***
 *  用户模型
 *
 * @author WildCat <wildcat.name@gmail.com>
 * @date 2014-05-20
 */
var crypto = require('crypto');
var validator = require('validator');
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Q = require('q');

//var dateLib = require('../libs/date');
//var config = require('../config');

//const NEW_TOPIC_COST = 20;
//const NEW_REPLY_COST = 5;
const NEW_TOPIC_COST = 0;
const NEW_REPLY_COST = 0;

/**
 * 加密密码
 * @param rawPassword
 * @returns {*}
 * @private
 */
var _encryptPassword = function (rawPassword) {
    var md5 = crypto.createHash('md5');
    var sha1 = crypto.createHash('sha1');
    return md5.update(sha1.update(rawPassword).digest('hex')).digest('hex');
};

/**
 * 清除不安全的字段
 * @param changedUserData
 * @returns {*}
 * @private
 */
//var _removeUnsafeKey = function (changedUserData) {
//    for (var key in changedUserData) {
//        if (key == '_id'
//            || key == 'username'
//            || key == 'usernameUnique'
//            || key == 'email'
//            || key == 'password'
//            || key == 'money'
//            || key == 'userStatus'
//            || key == 'userLevel'
//            || key == 'userStatus'
//            || key == 'regDate'
//            || key == 'lastLogin') {
//            delete  changedUserData[key];
//        }
//    }
//    return changedUserData;
//};

var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        match: [/([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[_a-zA-Z0-9]){2,12}/, '用户名只能为中文、英文、数字和下划线']},
    usernameUnique: {
        type: String,
        lowercase: true,
        required: true,
        unique: true
    },
    password: {type: String, required: true},
    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        validate: [validator.isEmail, '邮箱格式错误.']
    },
    avatar: {type: String},
    gender: { type: Number, default: 0 }, // 0 - Secret; 1 - Female; 2 - Male
    campus: {type: Number, required: true, default: 1},          // 所属校区: 1 -> 燕山, 2 -> 舜耕, 3 -> 圣井, 4 -> 明水

    regDate: {type: Date, default: Date.now},
    lastLogin: {type: Date, default: Date.now},

    money: {type: Number, default: 50},
    topicCount: {type: Number, default: 0},
    replyCount: {type: Number, default: 0},

    // 用户状态: 用于判断用户的权限
    userStatus: {type: Number, default: 1},
    // 用户等级: 各种称号
    userLevel: {type: Number, default: 0},

    sysMsgCount: {type: Number, default: 0},
    privateMsgCount: {type: Number, default: 0},

    weibo: {type: String}
}, {
    versionKey: false
});

// Apply the uniqueValidator plugin to userSchema.
UserSchema.plugin(uniqueValidator);

// 验证器: 电子邮件
//UserSchema.path('email').validate(function (email) {
//    var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
//    return emailRegex.test(email.text); // Assuming email has a text attribute
//}, 'The e-mail field cannot be empty.')


// 虚拟属性: 判断用户是否被blocked
UserSchema.virtual('isBlocked').get(function () {
    return this.userStatus >= 0;
});

// 虚拟属性: 判断用户是否可回复
UserSchema.virtual('canReply').get(function () {
    return this.userStatus >= 1;
});

// 虚拟属性: 是否有新消息
UserSchema.virtual('hasNewMessage').get(function () {
    return (this.sysMsgCount > 0) || (this.privateMsgCount > 0);
});

/**
 * 注册新用户
 * @param username
 * @param email
 * @param password
 * @param gender {Number} 0 - Female; 1 - Male
 */
UserSchema.statics.registerNew = function (username, email, password, gender) {
    password = _encryptPassword(password);

    gender = parseInt(gender);
    if (gender < 0 || gender > 3) {
        gender = 0;
    }

    return this.create({
        username: username,
        usernameUnique: username,
        email: email,
        password: password,
        gender: gender
    });
};

const NORMAL_USER_INFO_FIELD = 'username avatar campus gender regDate lastLogin money topicCount replyCount userStatus userLevel weibo';
/**
 * 获取用户常用信息, 不包含密码
 * @param id
 * @returns {Promise|*|Array|{index: number, input: string}|"mongoose".Promise<T>}
 */
UserSchema.statics.fetchNormalInfo = function (id) {
    return this.findOne({_id: id}, NORMAL_USER_INFO_FIELD).exec();
};

/**
 * 登录 - 使用用户名
 * @param username
 * @param password
 * @returns {Promise|*|Array|{index: number, input: string}|"mongoose".Promise<T>}
 */
UserSchema.statics.authWithUsername = function (username, password) {
    password = _encryptPassword(password);
    return this.findOne({usernameUnique: username.toLowerCase(), password: password}, NORMAL_USER_INFO_FIELD).exec();
};

/**
 * 登录 - 使用电子邮件
 * @param email
 * @param password
 * @returns {Promise|*|Array|{index: number, input: string}|"mongoose".Promise<T>}
 */
//UserSchema.statics.authWithEmail = function (email, password) {
//password = _encryptPassword(password);
//    return this.findOne({email: email.toLowerCase(), password: password}, NORMAL_USER_INFO_FIELD).exec();
//};

/**
 * 更改用户资料
 * @param userId
 * @param userProfile
 * @returns {Promise|*|Array|{index: number, input: string}|"mongoose".Promise<T>}
 */
UserSchema.statics.updateProfile = function (userId, userProfile) {
    var deferred = Q.defer();

    this.findOne({_id: userId}).exec().then(function (ret) {
        for (var key in userProfile) {
            // 限定只能修改 gender campus avatar weibo
            if (key === 'gender' || key === 'campus' || key === 'avatar' || key === 'weibo') {
                ret[key] = userProfile[key];
            }
        }

        ret.save(function (error, savedUser) {
            if (error) {
                deferred.reject(error);
            } else {
                deferred.resolve(savedUser);
            }
        });
    }, function (error) {
        deferred.reject(error);
    });

    return deferred.promise;
};

/**
 * 修改密码
 * @param user
 * @param currentPassword
 * @param newPassword
 * @returns {*}
 */
UserSchema.statics.changePassword = function (user, currentPassword, newPassword) {
    var deferred = Q.defer();

    this.findOne({_id: user._id}).exec().then(function (ret) {
        if (_encryptPassword(currentPassword) === ret.password) {
            ret.password = _encryptPassword(newPassword);
            ret.save();
            deferred.resolve(ret);
        } else {
            deferred.reject('USER_PASSWORD_ERROR_WHEN_CHANGE');
        }
    }, function (error) {
        deferred.reject(error);
    });

    return deferred.promise;
};


/**
 * 执行新主题(topic)积分增减 和 主题数量增减动作
 * @param user
 * @returns {*}
 */
UserSchema.statics.execNewTopicAction = function (user) {
    var deferred = Q.defer();

    if (!user || !user._id) {
        deferred.reject('USER_MONEY_NOT_ENOUGH');
    }

    this.findOne({_id: user._id}).exec().then(function (ret) {
        if (ret) {
            ret.money -= NEW_TOPIC_COST;
            ret.topicCount += 1;

            if (ret.money < 0) {
                deferred.reject('USER_MONEY_NOT_ENOUGH');
            } else {
                ret.save();
                deferred.resolve();
            }
        } else {
            deferred.reject('USER_MONEY_NOT_ENOUGH');
        }
    }, function () {
        deferred.reject('USER_MONEY_NOT_ENOUGH');
    });
    return deferred.promise;
};

/**
 * 执行新回复(reply)积分增减 和 回复数量增减动作
 * @param user
 * @returns {*}
 */
UserSchema.statics.execNewReplyAction = function (user) {
    var deferred = Q.defer();

    if (!user || !user._id) {
        deferred.reject('USER_MONEY_NOT_ENOUGH');
    }

    this.findOne({_id: user._id}).exec().then(function (ret) {
        if (ret) {
            ret.money -= NEW_REPLY_COST;
            ret.replyCount += 1;

            if (ret.money < 0) {
                deferred.reject('USER_MONEY_NOT_ENOUGH');
            } else {
                ret.save();
                deferred.resolve();
            }
        } else {
            deferred.reject('USER_MONEY_NOT_ENOUGH');
        }
    }, function () {
        deferred.reject('USER_MONEY_NOT_ENOUGH');
    });
    return deferred.promise;
};


///**
// * 减少用户积分
// * @param user {Object} session 中的用户对象
// * @param quantity {Number} 减少的积分数
// * @returns {Promise|*|Array|{index: number, input: string}|"mongoose".Promise<T>}
// */
//UserSchema.statics.decreaseMoneyWithUser = function (user, quantity, otherProperties) {
//    var deferred = Q.defer();
//
//
//    if (!user || !user._id) {
//        deferred.reject('USER_MONEY_NOT_ENOUGH');
//    }
//
//    this.findOne({_id: user._id}).exec().then(function (ret) {
//        if (ret) {
//            ret.decreaseMoney(quantity).then(function () {
//                deferred.resolve();
//            }, function () {
//                deferred.reject('USER_MONEY_NOT_ENOUGH');
//            });
//        } else {
//            deferred.reject('USER_MONEY_NOT_ENOUGH');
//        }
//    }, function () {
//        deferred.reject('USER_MONEY_NOT_ENOUGH');
//    });
//    return deferred.promise;
//};
//
//
///**
// * 减少用户积分
// * @param quantity {Number} 减少的积分数
// * @returns {Promise|*|Array|{index: number, input: string}|"mongoose".Promise<T>}
// */
//UserSchema.methods.decreaseMoney = function (quantity) {
//    var deferred = Q.defer();
//    this.money -= quantity;
//
//    if (this.money >= 0) {
//        this.save();
//        deferred.resolve();
//    } else {
//        deferred.reject('USER_MONEY_NOT_ENOUGH');
//    }
//    return deferred.promise;
//};

module.exports = UserSchema;