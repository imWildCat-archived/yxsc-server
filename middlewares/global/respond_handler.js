/**
 * 响应对象封装 - 扩展 Express res 对象
 *
 * @author WildCat <wildcat.name@gmail.com>
 * @date 2014-06-10
 */

/**
 * 响应:成功
 */

/**
 *
 * @param data {Object} 数据
 * @returns {{status: number, data: *}}
 */
var _success = function (data) {
    if (data === null) {
        return _error('NO_DATA');
    }
    return {
        status: 1,
        data: data
    };
};

/**
 * 响应:失败
 */


/**
 * 手工创建err响应
 * @param errCode
 * @param errMsg
 * @returns {{status: number, error: {code: *}}}
 */
var _errorWithCode = function (errCode) {
    return {
        status: 0,
        error: {
            code: errCode
        }
    };
};

/**
 *  失败状态码列表：
 *  1 - 用户
 *      -   1001 用户未登录
 *      -   1004 用户积分不足以操作
 *
 * @param {String} errDescription 错误描述
 * @returns {{status: number, error: {code: *}}}
 */
var _error = function (errDescription) {
    var des2code = {
        NO_DATA: 9000, // 未知错误，没有找到相关数据

        USER_NOT_LOGIN: 1001,       // 用户未登录
        USER_PASSWORD_ERROR: 1002,   // 用户名或密码错误

        USER_REG_NAME_USED: 1101,  // 用户名已被使用
        USER_REG_EMAIL_USED: 1102,  // 邮箱已被使用
        USER_REG_NAME_INVALID: 1103, // 用户名格式错误
        USER_REG_EMAIL_INVALID: 1104, // 邮箱格式错误

        USER_MONEY_NOT_ENOUGH: 1201, // 用户积分不足
        USER_POST_LIMITED: 1202, // 两次提交间隔小于30秒

        USER_PASSWORD_ERROR_WHEN_CHANGE: 1301, // 用户密码错误，当修改密码时

        TOPIC_EMPTY_LIST: 2001, // 空话题列表
        TOPIC_NOT_FOUND: 2002  // 未找到话题

    };
    var errCode = des2code[errDescription];
    if (!errCode) {
        errCode = 0;
    }
    return _errorWithCode(errCode);
};


/**
 * 使用err对象创建err响应
 * @param errCode
 * @param errMsg
 */
//exports.errorWithObj = function(errCode, errMsg){
//
//};


/**
 * 中间件主体
 * @param req
 * @param res
 * @param next
 */
module.exports = function (req, res, next) {
    res.json.success = function (data) {
        return res.json(_success(data));
    };

    res.json.error = function (errDescription) {
        return res.json(_error(errDescription));
    };

    next();
};