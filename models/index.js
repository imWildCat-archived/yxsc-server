/***
 *  model
 *
 * @author WildCat <wildcat.name@gmail.com>
 * @date 2014-05-20
 */

var mongoose = require('mongoose');

var config = require('../config');

var db = mongoose.createConnection();

var options = {
    db: { native_parser: true },
    server: {
        poolSize: 5,
        // 增加自动重连配置，不知道是否奏效
        auto_reconnect: true
    },
    user: config.db.user,
    pass: config.db.pass
};


// 由于BAE数据库只能支持短链接，遂使用断开重连
// Mongoose连接最佳实践参考: http://stackoverflow.com/questions/16226472/mongoose-autoreconnect-option

db.on('connecting', function () {
    console.log('connecting to MongoDB...');
});
// 侦听错误与数据库断开事件
db.on('error', function (err) {
//    console.log("[DB] 数据库出错 :" + err);
    //监听BAE mongodb异常后关闭闲置连接
    db.close();
});
db.on('connected', function () {
    console.log('[%s]MongoDB connected!', new Date().toLocaleString());
});
db.once('open', function () {
//    console.log('MongoDB connection opened!');
});
db.on('reconnected', function () {
    console.log('MongoDB reconnected!');
});
//监听db close event并重新连接
db.on('close', function () {
//    console.info("[DB] 重新连接数据库");
//    db.open(config.db.host, config.db.name, config.db.port, options);
});
db.on('reconnected', function () {
    console.log('MongoDB reconnected!');
});
db.on('disconnected', function () {
//    console.log('MongoDB disconnected!');
    db.open(config.db.host, config.db.name, config.db.port, options);
});

db.open(config.db.host, config.db.name, config.db.port, options);


// 如果不是BAE环境，启用调试模式
if (!config.isBae) {
    mongoose.set('debug', true);
}

// 引用模型
var UserSchema = require('./user');
var SchoolNewsSchema = require('./school_news');
var TopicSchema = require('./topic');
var ReplySchema = require('./reply');
var NotificationSchema = require('./notification');
var SellerSchema = require('./seller');

exports.User = db.model('User', UserSchema);
exports.SchoolNews = db.model('SchoolNews', SchoolNewsSchema);
exports.Topic = db.model('Topic', TopicSchema);
exports.Reply = db.model('Reply', ReplySchema);
exports.Notification = db.model('Notification', NotificationSchema);
exports.Seller = db.model('Seller', SellerSchema);