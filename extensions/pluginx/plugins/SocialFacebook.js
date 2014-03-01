plugin.SocialFacebook = cc.Class.extend({

    /**
     methods of protocol : InterfaceSocial
     */
    init: function () {
        this._shareInfo = {
            'url': window.location.href
        };
    },
    configDeveloperInfo: function (cpInfo) {
        //invalid on html5
    },
    share: function (shareInfo) {
        var url = shareInfo["SharedURLPath"];
        if(url !== null){
            this._shareInfo.url = url;
        }

        cc.openURL("http://www.facebook.com/sharer/sharer.php?u=" + url);
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