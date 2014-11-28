var is_weixin;

is_weixin = function() {
    var ua, _ref;
    ua = navigator.userAgent.toLowerCase();
    if (((_ref = ua.match(/MicroMessenger/i)) != null ? _ref[0] : void 0) === "micromessenger") {
        return true;
    } else {
        return false;
    }
};

if (is_weixin()) {
    document.getElementById("weixin").style.display = "block";
}
