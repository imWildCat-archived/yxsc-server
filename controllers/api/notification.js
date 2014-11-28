var models = require('../../models');
var NotificationModel = models.Notification;

exports.getCount = function (req, res) {
    NotificationModel.fetchUnreadCount(req.session.user._id).then(function (ret) {
        return res.json.success(ret);
    }, function (err) {
        return res.json.error();
    });
};

exports.getList = function (req, res) {
    var page = req.param('page');

    NotificationModel.fetchList(req.session.user._id, page).then(function (ret) {
        return res.json.success(ret);
    }, function (err) {
        return res.json.error();
    });
};