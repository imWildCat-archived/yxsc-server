var config = require('../../config');

var param, sdk, tietusdk;

tietusdk = (function () {
    function tietusdk(accesskey, secretkey) {
        this.accesskey = accesskey;
        this.secretkey = secretkey;
    }

    tietusdk.prototype.Token = function (param) {
        var base64param, sign;
        base64param = this.Base64(JSON.stringify(param));
        sign = this.Sign(base64param, this.secretkey);
        return this.accesskey + ':' + sign + ':' + base64param;
    };

    tietusdk.prototype.Sign = function (str, key) {
        return this.Base64(require('crypto').createHmac('sha1', key).update(str).digest());
    };

    tietusdk.prototype.Base64 = function (str) {
        return new Buffer(str).toString('base64').replace('+', '-').replace('/', '_');
    };

    return tietusdk;

})();

//param = {
//    deadline: Math.floor(Date.now() / 1000) + 3600 * 24,
//    album: 5143,
//    returnBody: {
//        height: 'h',
//        width: 'w',
//        s_url: 'url',
//        t_url: 't_url'
//    }
//};

sdk = new tietusdk(config.tietukuService.accesskey, config.tietukuService.secretkey);

//console.log(sdk.Token(param));

exports.getToken = function () {
    return sdk.Token({
        deadline: Math.floor(Date.now() / 1000) + 3600 * 24,
        album: config.tietukuService.album,
        returnBody: {
            height: 'h',
            width: 'w',
            s_url: 'url',
            t_url: 't_url'
        }
    });
};