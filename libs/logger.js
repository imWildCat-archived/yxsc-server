/**
 * BAE logger 封装
 *
 * @author WildCat <wildcat.name@gmail.com>
 * @date 2014-05-29
 */

var log4js = require('log4js');

var config = require('../config');


var logger;

if (config.isBae) {
    log4js.loadAppender('baev3-log');
    var options = {
        'user': config.baeLogger.user,
        'passwd': config.baeLogger.passwd
    };
    log4js.addAppender(log4js.appenders['baev3-log'](options));
    logger = log4js.getLogger('node-log-sdk');
} else {
    logger = log4js.getLogger();
}

module.exports = logger;


