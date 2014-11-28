/***
 *  学校新闻模型
 */

var mongoose = require('mongoose');

var SchoolNewsSchema = new mongoose.Schema({
    newsId: {type: Number, required: true, unique: true},
    subject: {type: String, required: true },
    date: {type: Date, default: Date.now},
    editor: {type: String },
    click: {type: Number},
    content: {type: String, required: true}
}, {
    versionKey: false,
    collection: 'school_news'
});

//SchoolNewsSchema.path('date').get(function(val){
//    return dateUtil.toNormalString(val);
//});

module.exports = SchoolNewsSchema;