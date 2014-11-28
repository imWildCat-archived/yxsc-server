/**
 * API RBAC 基于角色的访问控制 中间件 (API 接口)
 *
 * @author WildCat <wildcat.name@gmail.com>
 * @date 2014-06-06
 */

//exports.checkNotLogin = function (req, res, next) {
//    if (req.session.user) {
//        return res.json.error('USER_NOT_LOGIN');
//    }
//    next();
//};

exports.checkLogin = function (req, res, next) {
    if (!req.session.user) {
        return res.json.error('USER_NOT_LOGIN');
    }
    next();
};

exports.postLimit = function (req, res, next) {
    if (!req.session.user) {
        return res.json.error('USER_NOT_LOGIN');
    }
    if (req.session.lastPost) {
        if ((Date.now() - req.session.lastPost) < 30000) {
            return res.json.error('USER_POST_LIMITED');
        }
    }
    req.session.lastPost = Date.now();

    next();
};