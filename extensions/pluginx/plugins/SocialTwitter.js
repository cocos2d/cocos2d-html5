plugin.SocialTwitter = cc.Class.extend({
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
        this._shareInfo.appkey = cpInfo["WeiboAppKey"];
    },
    share: function (shareInfo) {
        this._shareInfo.title = shareInfo["SharedText"];
        this._shareInfo.pic = shareInfo["SharedImagePath"];


        cc.openURL("http://twitter.com/intent/tweet?text=" + this._shareInfo.title + " " + this._shareInfo.url);
    },
    setDebugMode: function (debug) {
        //invalid on html5
    },
    getSDKVersion: function () {
        return "20130607";
    },
    getPluginVersion: function () {
        return plugin.Version;
    }
});