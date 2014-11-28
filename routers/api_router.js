var express = require('express');

var apiControllers = require('../controllers/api');
var schoolNewsController = apiControllers.schoolNews;
var userController = apiControllers.user;
var topicController = apiControllers.topic;
var notificationController = apiControllers.notification;

var apiRbac = require('../middlewares/api_rbac');

var tietukuSdk = require('../libs/tietuku');

var apiRouter = express.Router();

// 参数验证
apiRouter.param(function (name, fn) {
    if (fn instanceof RegExp) {
        return function (req, res, next, val) {
            if (val.match(fn)) {
//                console.log(val.match(fn));
                next();

            } else {
//                console.error(val.match(fn));
                next('route');
            }
        }
    }
});

apiRouter.param('id', /^[0-9a-f]{24}$/);

// CSRF token
apiRouter.get('/get_csrf', function (req, res) {
    var csrfToken = req.csrfToken();
    console.log(req.headers['referer']);
//    res.cookie('_csrf', csrfToken, {maxAge:600000});  //  废弃，因为跨域限制
    return res.json.success({
        csrf: csrfToken,
        needCaptcha: false
    });
});

// 图床token
apiRouter.get('/get_img_token', function (req, res) {
    return res.json.success({
        token: tietukuSdk.getToken()
    });
});

// SchoolNews Controller
const SCHOOL_NEWS_PRE = '/school_news';
apiRouter.get(SCHOOL_NEWS_PRE + '/latest', schoolNewsController.latest);
apiRouter.get(SCHOOL_NEWS_PRE + '/single/:id', schoolNewsController.singleNews);

// User Controller
const USER_PRE = '/user';
// Reg
//apiRouter.post(USER_PRE + '/reg',apiRbac.checkNotLogin);
apiRouter.post(USER_PRE + '/reg', userController.postReg);
apiRouter.get(USER_PRE + '/reg/check', userController.checkUsernameOrEmail);
// Login
apiRouter.post(USER_PRE + '/login', userController.login);
// Logout
apiRouter.get(USER_PRE + '/logout', userController.logout);
// 修改用户资料
apiRouter.post(USER_PRE + '/update_profile', apiRbac.checkLogin, userController.postProfile);
//修改密码
apiRouter.post(USER_PRE + '/change_password', apiRbac.checkLogin, userController.postNewPassword);
// 获取用户信息
apiRouter.get(USER_PRE + '/:id/info', apiRbac.checkLogin, userController.getUserInfo);
// 获取当前用户的信息
apiRouter.get(USER_PRE + '/current/info', apiRbac.checkLogin, userController.getCurrentUserInfo);
// 获取用户的topics
apiRouter.get(USER_PRE + '/:id/topics', userController.getUserTopics);
// 获取用户的replies
apiRouter.get(USER_PRE + '/:id/replies', userController.getUserReplies);

// Topic Controller
const TOPIC_PRE = '/topic';
// 创建新的话题
apiRouter.post(TOPIC_PRE + '/create', apiRbac.checkLogin, topicController.postNew);
// 创建新的回复
apiRouter.post(TOPIC_PRE + '/reply', apiRbac.checkLogin, apiRbac.postLimit, topicController.postReply);
apiRouter.get(TOPIC_PRE + '/list', topicController.getList);
apiRouter.get(TOPIC_PRE + '/single/:id', topicController.getSingle);
// 报告不适当主题
apiRouter.get(TOPIC_PRE + '/report/:id', apiRbac.checkLogin, topicController.getReport);

// Notification Controller
const NOTI_PRE = '/noti';
apiRouter.get(NOTI_PRE + '/count', apiRbac.checkLogin, notificationController.getCount);
apiRouter.get(NOTI_PRE + '/list', apiRbac.checkLogin, notificationController.getList);

// Version
apiRouter.get('/version', function (req, res) {
    return res.json.success(
        {
            version: '0.6.3',
            link: null
        }
    );
});


module.exports = apiRouter;