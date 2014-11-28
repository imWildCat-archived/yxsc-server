/***
 *  管理员 - Admin
 *
 * @author WildCat <wildcat.name@gmail.com>
 * @date 2014-07-04
 */

var mongoose = require('mongoose');

var AdminSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    lastLogin: {type: Date, default: Date.now},
    lastLoginIp: {type: String, required: false}
}, {
    versionKey: false,
    collection: 'admin'
});

// TODO

module.exports = AdminSchema;