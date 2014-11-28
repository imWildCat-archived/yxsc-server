/**
 * 后台管理 路由
 *
 * @author WildCat <wildcat.name@gmail.com>
 * @date 2014-07-04
 */

var express = require('express');

var adminRouter = express.Router();

// 参数验证
adminRouter.param(function (name, fn) {
    if (fn instanceof RegExp) {
        return function (req, res, next, val) {
            if (val.match(fn)) {
                next();
            } else {
                next('route');
            }
        }
    }
});

adminRouter.param('id', /^[0-9a-f]{24}$/);

adminRouter.get('/index', function (req, res) {
       res.render('admin/index',{hello:'sdad'})
});
adminRouter.get('/login', function (req, res) {
    res.render('admin/login',{hello:'sdad'})
});

module.exports = adminRouter;