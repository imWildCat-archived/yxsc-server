var apiRouter = require('./api_router');
var adminRouter = require('./admin_router');
/**
 * 路由
 * @param app {Object}
 */
module.exports = function (app) {
    app.get('/', function (req, res) {
        res.render('index');
    });

    app.get('/privacy_policy', function (req, res) {
        res.render('privacy_policy');
    });

    app.use('/api/v1', apiRouter);
//    app.use('/admin', adminRouter);
};
