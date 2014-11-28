var cheerio = require('cheerio');
var Q = require('q');

var request = require('../libs/request');
var SchoolNewsModel = require('../models').SchoolNews;

console.log('[Job] 采集学校新闻, at [%s]', new Date().toLocaleString());

requestNewsList().then(function (list) {
    for (var i = 0; i < list.length; i++) {
        requestSingleNews(list[i]).then(function (singleSchoolNews) {
            saveNews2Db(singleSchoolNews);
        }, function (err) {
            console.error(err);
        });
    }
});


/**
 * 请求新闻ID列表
 * @return Q: newsIdList {Array} 新闻ID列表 eg. [12823, 12736, 12701, 12717]
 */
function requestNewsList() {
    var deferred = Q.defer();
    request('http://pub.sdufe.edu.cn/news/list.php?class_id=1001', true).then(function (ret) {
        var $ = cheerio.load(ret);
        var newsIdList = [];

        $('body > table:nth-child(7) td:nth-child(3) > table td a').each(function () {
            if ($(this).attr('target') === '_blank') {
                newsIdList.push(parseInt($(this).attr('href').replace('view.php?id=', '')));
            }
        });

        deferred.resolve(newsIdList);
    }, function (err) {
        deferred.reject(err);
    });

    return deferred.promise;
}


/**
 * 请求新闻页
 * @param newsId
 * @return Q: singleSchoolNews {Object} 学校新闻对象
 */
function requestSingleNews(newsId) {
    var deferred = Q.defer();
    request('http://pub.sdufe.edu.cn/news/view.php?id=' + newsId, true).then(function (content) {
        var $ = cheerio.load(content);
        var singleSchoolNews = {};

        var editorRegx = /单位:\S{1,32}/;
        var dateRegx = /\d{4}-\d{1,2}-\d{1,2}\s{1}\d{1,2}:\d{2}:\d{2}/;
        var clickCountRegx = /浏览\d{1,99}次/;

        singleSchoolNews.newsId = newsId;
        singleSchoolNews.subject = $('strong').text();

        // 提取作者名称
        var editorMatched = $('td > div > font').text().match(editorRegx);
        if (editorMatched) {
            singleSchoolNews.editor = editorMatched[0].replace('单位:', '');
        }
        // 提取日期
        var dateMatched = $('td > div > font').text().match(dateRegx);
        if (dateMatched) {
            singleSchoolNews.date = new Date(dateMatched[0]);
        }

        // 提取点击数
        var clickCountMatched = $('td > div > font').text().match(clickCountRegx);
        if (clickCountMatched) {
            singleSchoolNews.click = parseInt(clickCountMatched[0].replace('浏览', '').replace('次', ''));
        }

        // 提取新闻内容
        singleSchoolNews.content = $('body > table:nth-child(7) td[style=\'padding:20px\'] td[style=\'line-height:23pt; font-size:11pt; word-break:break-all;\']').html();

        deferred.resolve(singleSchoolNews);
    }, function (err) {
        deferred.reject(err);
    });

    return deferred.promise;
}

/**
 * 新闻存储入数据库
 * @param singleSchoolNews {Object} 单条新闻
 */
function saveNews2Db(singleSchoolNews) {
    SchoolNewsModel.create(singleSchoolNews).then(function (ret) {
        console.log('采集新闻[%s], ID:[%s]', ret.subject, ret.newsId);
    }, function (err) {
//        console.error(err);
    });
}