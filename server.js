var csurf = require('csurf');
var compress = require('compression');
var path = require('path'); // Path Util
var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

//var logger = require('./libs/logger'); // 弃用logger，BAE麻烦多多
var config = require('./config');
var routers = require('./routers');
var jobs = require('./jobs');

var app = express();

app.use(require('body-parser')());
app.use(require('cookie-parser')(config.sessionSecret));
app.use(require('./middlewares/global/respond_handler'));

// Session: 使用MongoDB实现
app.use(session({
    secret: config.sessionSecret,
    key:'sid',
    store: new MongoStore({
        db: config.db.name,
        host: config.db.host,
        port: config.db.port,
        username: config.db.user,
        password: config.db.pass,
        auto_reconnect: true
    })
}));

// 设置模板引擎
var swig = require('swig'); // Template engine
var pjson = require('./package.json');

const CURRENT_VERSION = pjson.version;

app.engine('html', swig.renderFile);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'html');
if (!config.isBae) {
    swig.setDefaults({ cache: false });
}
swig.setDefaults({ locals: { current_version: CURRENT_VERSION} });

app.use('/public', express.static(__dirname + '/public'));


// 压缩中间件
app.use(compress());

// CSRF中间件
app.use(csurf());

// 如果不是BAE环境，启用logger输出
if (!config.isBae) {
    var requestLogger = require('morgan');
    app.use(requestLogger('dev'));
    console.info('印象山财 服务器开始运行，目前为开发模式，请访问 http://localhost:18080/');
//    logger.trace('印象山财 服务器开始运行，目前为开发模式.');
} else {
    console.info('印象山财 服务器开始运行，目前为BAE模式.');
}

routers(app);

app.listen(18080);

// 开始定时任务
jobs.init();