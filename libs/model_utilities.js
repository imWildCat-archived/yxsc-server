/***
 *  模型工具
 *
 * @author WildCat <wildcat.name@gmail.com>
 * @date 2014-06-14
 */

/**
 * 计算分页起始行
 * @param page
 * @param limit
 * @returns {number}
 */
exports.startLine = function (page, limit) {
    page = parseInt(page);
    limit = parseInt(limit);

    if (page < 1) page = 1;
    if (limit < 1) limit = 1;

    return (page - 1) * limit;
};