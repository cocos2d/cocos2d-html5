plugin.SocialQzone = cc.Class.extend({
    _shareInfo: null,

    /**
     methods of protocol : InterfaceSocial
     */
    init: function () {
        this._shareInfo = {
            'desc': "Hello, Cocos2d-html5!",
            'url': window.location.href,
            'pics': null,
            'showcount':1
        };
    },
    configDeveloperInfo: function (cpInfo) {
        //invalid on html5
    },
    share: function (shareInfo) {
        this._shareInfo.desc = shareInfo["SharedText"];
        this._shareInfo.pics = shareInfo["SharedImagePath"];
        var url = shareInfo["SharedURLPath"];
        if(url !== null){
            this._shareInfo.url = url;
        }

        var urlstring = "", value;
        for (var key in this._shareInfo) {
            value = this._shareInfo[key];
            if (value) {
                urlstring += encodeURI(key + "=" + value) + "&";
            }
        }
        urlstring = urlstring.substr(0, urlstring.length - 1);
        cc.Browser.openURL("http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?"+urlstring);
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