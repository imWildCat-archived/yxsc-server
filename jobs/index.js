var cronJob = require('cron').CronJob;
var spawn = require('child_process').spawn;
var path = require('path');

var config = require('../config');

var job = new cronJob({
    cronTime: config.cronTime.updateSchoolNews,
    onTick: function() {
        var update = spawn(process.execPath, [path.resolve(__dirname, 'school_news.js')]);
        update.stdout.pipe(process.stdout);
        update.stderr.pipe(process.stderr);
        update.on('close', function(code){
            console.log('新闻采集任务异常结束, 代码=%d', code);
        });
    },
    start: false
//    timeZone: "America/Los_Angeles"
});

exports.init = function(){
    job.start();
};