/**
 * User Controller
 *
 * @author WildCat <wildcat.name@gmail.com>
 * @date 2014-06-01
 */

var UserModel = require('../../models').User;
var TopicModel = require('../../models').Topic;
var ReplyModel = require('../../models').Reply;
var mailService = require('../../services/mail');

/**
 * Register Action 用户注册
 * @param req
 * @param res
 * @return {Express Response} response
 */
exports.postReg = function (req, res) {
    UserModel.registerNew(req.param('username'), req.param('email'), req.param('password'), req.param('gender'))
        .then(function (ret) {
            if (ret.username != undefined && ret.email != undefined) {
                mailService.sendRegMail(ret.email, ret.username);
                req.session.user = ret;
            }
            return res.json.success(ret);
        }, function (err) {
            // 验证错误反馈
            if (err.name === 'ValidationError' && err.errors) {
                if (err.errors.email) {
                    return res.json.error('USER_REG_EMAIL_INVALID');
                }
                if (err.errors.username) {
                    return res.json.error('USER_REG_NAME_INVALID');
                }
            }

            // 验证用户名是否重复
            var queryUsername = UserModel.count({usernameUnique: req.param('username').toLowerCase()});
            queryUsername.exec().then(function (ret) {
                if (ret) {
                    // 如果存在用户名
                    return res.json.error('USER_REG_NAME_USED');
                }
            }).end(function () {
                return res.json.error();
            });
            // 验证邮箱是否重复
            var queryEmail = UserModel.count({email: req.param('email').toLowerCase()});
            queryEmail.exec().then(function (ret) {
                if (ret) {
                    // 如果存在邮箱
                    return res.json.error('USER_REG_EMAIL_USED');
                }
            }).end(function () {
                return res.json.error();
            });

        });
};

/**
 * 检测用户名或邮箱是否重复
 * @param req
 * @param res
 */
exports.checkUsernameOrEmail = function (req, res) {
    var username = req.param('username');
    var email = req.param('email');

    var query;

    if (username != undefined) {
        query = UserModel.count({username: username});
    } else if (email != undefined) {
        query = UserModel.count({email: email});
    } else {
        return res.json.error();
    }

    query.exec().then(function (ret) {
        if (ret) {
            // 如果存在用户名 or 邮箱
            return res.json.success({exist: true});
        } else {
            return res.json.success({exist: false});
        }
    }).end(function () {
        return res.json.error();
    });
};


/**
 * 登录
 * @param req
 * @param res
 * @returns {*|string|ServerResponse}
 */
exports.login = function (req, res) {
    var username = req.param('username');
    var password = req.param('password');

    if (username != undefined && password != undefined) {
        UserModel.authWithUsername(username, password).then(function (ret) {
            if (ret) {
                // 登录成功
                req.session.user = ret;

                res.json.success(ret);

                // 更新最后登录时间
                ret.lastLogin = new Date();
                ret.save();
            } else {
                return res.json.error('USER_PASSWORD_ERROR');
            }
        }).end(function () {
            return res.json.error();
        });
    } else {
        return res.json.error();
    }
};


/**
 * 注销
 * @param req
 * @param res
 * @returns {*}
 */
exports.logout = function (req, res) {
    req.session.user = null;
    return res.json.success({
        logout: true
    });
};

/**
 * 修改用户资料 (注意模型方法对可修改的字段的限制)
 * @param req
 * @param res
 */
exports.postProfile = function (req, res) {
    var userProfile = JSON.parse(req.param('user'));

    UserModel.updateProfile(req.session.user._id, userProfile).then(function (ret) {
        res.json.success(ret);
    }).fail(function (error) {
        res.json.error(error);
    });
};

/**
 * 修改密码
 * @param req
 * @param res
 */
exports.postNewPassword = function (req, res) {
    var currentPassword = req.param('currentPassword');
    var newPassword = req.param('newPassword');

    UserModel.changePassword(req.session.user, currentPassword, newPassword).then(function (ret) {
        // 发送邮件
        mailService.sendChangePasswordMail(req.session.user.email, req.session.user.username);

        res.json.success(ret);
    }).fail(function (error) {
        res.json.error(error);
    });
};

/**
 * 获取用户信息(包含第一页的用户话题列表和回复列表)
 * @param req
 * @param res
 */
exports.getUserInfo = function (req, res) {
    var userId = req.param('id');
    var respondData = {};

    UserModel.fetchNormalInfo(userId).then(function (ret) {
        respondData.user = ret;
        return TopicModel.fetchListOfUser(userId, 1);
    }).then(function (ret) {
        respondData.topics = ret;
        return ReplyModel.fetchListOfUser(userId, 1);
    }).then(function (ret) {
        respondData.replies = ret;
        if (respondData != {}) {
            return res.json.success(respondData);
        } else {
            return res.json.error();
        }
    }).end(function () {
        res.json.error();
    });
};

exports.getCurrentUserInfo = function (req, res) {
    if (!(req.session.user && req.session.user._id)) {
        return res.json.error();
    }
//console.log(req.session.user);
    var respondData = {};
    UserModel.fetchNormalInfo(req.session.user._id).then(function (ret) {
        respondData.user = ret;
        return TopicModel.fetchListOfUser(req.session.user._id, 1);
    }).then(function (ret) {
        respondData.topics = ret;
        return ReplyModel.fetchListOfUser(req.session.user._id, 1);
    }).then(function (ret) {
        respondData.replies = ret;
        if (respondData != {}) {
            return res.json.success(respondData);
        } else {
            return res.json.error();
        }
    }).end(function () {
        res.json.error();
    });
};

/**
 * 获取用户回复
 * @param req
 * @param res
 */
exports.getUserReplies = function (req, res) {
    var userId = req.param('id');
    var page = req.param('page');

    ReplyModel.fetchListOfUser(userId, page).then(function (ret) {
        if (ret.length > 0) {
            res.json.success(ret);
        } else {
            res.json.error('TOPIC_NOT_FOUND');
        }
    }, function (error) {
        res.json.error(error);
    });
};

/**
 * 获取用户话题
 * @param req
 * @param res
 */
exports.getUserTopics = function (req, res) {
    var userId = req.param('id');
    var page = req.param('page');

    TopicModel.fetchListOfUser(userId, page).then(function (ret) {
        if (ret.length > 0) {
            res.json.success(ret);
        } else {
            res.json.error('TOPIC_NOT_FOUND');
        }
    }, function (error) {
        res.json.error(error);
    });
};