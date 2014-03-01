plugin.SocialQQWeibo = cc.Class.extend({
    _shareInfo: null,

    /**
     methods of protocol : InterfaceSocial
     */
    init: function () {
        this._shareInfo = {
            'appkey': 12345678,
            'title': "Hello, Cocos2d-html5!",
            'url': window.location.href,
            'pic': null
        };
    },
    configDeveloperInfo: function (cpInfo) {
        this._shareInfo.appkey = cpInfo["QQWeiboAppKey"];
    },
    share: function (shareInfo) {
        this._shareInfo.title = shareInfo["SharedText"];
        this._shareInfo.pic = shareInfo["SharedImagePath"];

        var urlstring = "", value;
        for (var key in this._shareInfo) {
            value = this._shareInfo[key];
            if (value !== null) {
                urlstring += encodeURI(key + "=" + value) + "&";
            }
        }
        urlstring = urlstring.substr(0, urlstring.length - 1);
        cc.openURL("http://share.v.t.qq.com/index.php?c=share&a=index&" + urlstring);

    },
    setDebugMode: function (debug) {
        //invalid on html5
    },
    getSDKVersion: function () {
        return "unkown";
    },
    getPluginVersion: function () {
        return plugin.Version;
    }
});