/**
 * 邮件服务 mail
 *
 * @author WildCat <wildcat.name@gmail.com>
 * @date 2014-06-06
 */
var util = require('util');
var nodemailer = require('nodemailer');
//var Q = require('q');
var config = require('../config');

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP", config.mailService.stmp);


exports.sendRegMail = function (email, username) {
    var mailOptions = {
        from: config.mailService.from, // sender address
        to: email, // list of receivers
        subject: util.format('%s, 欢迎您注册『印象·山财』', username), // Subject line
        html: username + '， 感谢您注册『印象·山财』。' +
            '<br /> 我们一直致力于更好地服务山财师生。' +
            '<br /> 愿您能在本社区中享受一段美好时光 ^_^' +
            '<hr /> <p style="text-align: right">『印象·山财』运营团队 </p>' // html body
    };
    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            util.log('邮件发送错误: ' + error);
        }
//        } else {
//            console.log("Message sent: " + response.message);
//        }

        // if you don't want to use this transport object anymore, uncomment following line
        smtpTransport.close(); // shut down the connection pool, no more messages
    });
};

/**
 * 发送修改密码提示邮件
 * @param email
 * @param username
 */
exports.sendChangePasswordMail = function (email, username) {
    var mailOptions = {
        from: config.mailService.from, // sender address
        to: email, // list of receivers
        subject: util.format('%s, 您在『印象·山财』的密码已被修改', username), // Subject line
        html: username + '， 您好!' +
            '<br /> 您在『印象·山财』的密码已经被修改。' +
            '<br /> 如果您对本邮件的内容有疑问，请前往 http://www.yinxiangshancai.com 找回您的密码，或者联系本站运营团队。' +
            '<br /> 愿您能在本社区中享受一段美好时光 ^_^' +
            '<hr /> <p style="text-align: right">『印象·山财』运营团队 </p>' // html body
    };
    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            util.log('邮件发送错误: ' + error);
        }
        smtpTransport.close();
    });
};