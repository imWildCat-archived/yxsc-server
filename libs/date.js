/**
 * Date 工具
 *
 * @author WildCat <wildcat.name@gmail.com>
 * @date 2014-06-02
 */

/**
 * 转换为常用时间字符串
 * @param date {Date}
 * @param isFriendly {Boolean} 是否为友好字符串 eg. x 秒前
 */
exports.toNormalString = function (date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();

    var thisYear = new Date().getFullYear();
    year = (thisYear === year) ? '' : (year + '-');

    return year + month + '-' + day + ' ' + hour + ':' + minute;
};