/**
 * Request 对象封装
 *
 * @author WildCat <wildcat.name@gmail.com>
 * @date 2014-05-28
 */

var request = require('request');
var iconv = require('iconv-lite');
var Q = require('q');

module.exports = function (url, isGbk) {
    var deferred = Q.defer();
    request({
        url: url,
        encoding: null
    }, function (err, response, body) {
        if (!err && response.statusCode === 200) {
            var content;
            if (isGbk) {
                content = iconv.decode(body, 'GBK');
            } else {
                content = iconv.decode(body, 'UTF8');
            }
            deferred.resolve(content);

        } else {
            deferred.reject(err);
        }
    });

    return deferred.promise;
};