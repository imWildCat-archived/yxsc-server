var SchoolNewsModel = require('../../models').SchoolNews;

var ModelUtilities = require('../../libs/model_utilities');

var dateUtil = require('../../libs/date');

/**
 * 获取最新学校新闻列表 /api/v1/school_news/latest
 * @param req
 * @param res
 */
const LIMIT_PER_PAGE = 20;
exports.latest = function (req, res) {
    var page = req.param('page');
    var startLine = ModelUtilities.startLine(page, LIMIT_PER_PAGE);

    var query = SchoolNewsModel.find(null, 'subject editor click').sort({'date': -1}).skip(startLine).limit(LIMIT_PER_PAGE);
    query.exec().then(function (ret) {
        return res.json.success(ret);
    }, function (err) {
        return res.json.error(err);
    });
};

/**
 * 获取单条新闻 /api/v1/school_news/single/:id
 * @param req
 * @param res
 */
exports.singleNews = function (req, res) {
    var query = SchoolNewsModel.findOne({_id: req.param('id')});
    query.exec().then(function (ret) {
        // 日期格式转换， 似乎ret对象是只读的，不知道有什么更好的办法?
            return res.json.success({
            _id: ret._id,
            subject: ret.subject,
            editor: ret.editor,
            click: ret.click,
            content:ret.content,
            date:dateUtil.toNormalString(ret.date)
        });
    }, function (err) {
        return res.json.error(err);
    }).end(function (err) {
        return res.json.error(err);
    });
};