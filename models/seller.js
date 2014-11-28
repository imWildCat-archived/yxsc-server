/***
 *  卖家模型
 */

var mongoose = require('mongoose');

var SellerSchema = new mongoose.Schema({
    type: {type: Number, required: true, unique: true},
    name: {type: String, required: true },
    createdAt: {type: Date, default: Date.now},
    note: {type: String, required: true},
    image: {type: String},
    longtitude: {type: String},
    latitude: {type: String},
    wechatId: {type: String},
    phoneNumber: {type: Number},
    extraPhoneNumber: {type: Number}
}, {
    versionKey: false,
    collection: 'sellers'
});

module.exports = SellerSchema;

SellerSchema.statics.fetchList = function (page) {

}