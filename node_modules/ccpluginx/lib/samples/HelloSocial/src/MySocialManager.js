var MyShareMode = {
    NoneMode:0,
    SNWeibo:1,
    QQWeibo:2,
    QZone:3,
    Twitter:4,
    Facebook:5
};


var MyShareResult = plugin.ShareResultListener.extend({
    onShareResult: function (ret, msg) {
        var shareStatus = "Share " + (ret == plugin.ShareResultCode.Success) ? " Successed" : " Failed";
        cc.log(msg + shareStatus);
    }
});

var MySocialManager = cc.Class.extend({
    _twitter:null,
    _snweibo:null,
    _qqweibo:null,
    _qzone:null,
    _facebook:null,
    _listener:null,
    ctor:function () {
        window.test = this;
    },
    unloadSocialPlugin:function () {
        if (this._twitter) {
            plugin.PluginManager.getInstance().unloadPlugin("SocialTwitter");
            this._twitter = null;
        }

        if (this._weibo) {
            plugin.PluginManager.getInstance().unloadPlugin("SocialWeibo");
            this._weibo = null;
        }
    },
    loadSocialPlugin:function () {
         if (this._listener == null) {
            this._listener = new MyShareResult();
         }

        this._snweibo = plugin.PluginManager.getInstance().loadPlugin("SocialWeibo");
        if (this._snweibo) {
            var weiboInfo = {};
            weiboInfo["WeiboAppKey"] = "3787440247";

            if (Object.keys(weiboInfo).length == 0) {
                cc.log("Developer info is empty. PLZ fill your weibo info in weiboInfo");
            }

            this._snweibo.setDebugMode(true);
            this._snweibo.configDeveloperInfo(weiboInfo);
            this._snweibo.setResultListener(this._listener);
        }

        this._qqweibo = plugin.PluginManager.getInstance().loadPlugin("SocialQQWeibo");
        if (this._qqweibo) {
            var qqweiboInfo = {};
            qqweiboInfo["QQWeiboAppKey"] = "b3410a01f51da238afdc92ea6e2c267a";

            if (Object.keys(qqweiboInfo).length == 0) {
                cc.log("Developer info is empty. PLZ fill your weibo info in qqweiboInfo");
            }

            this._qqweibo.setDebugMode(true);
            this._qqweibo.configDeveloperInfo(qqweiboInfo);
            this._qqweibo.setResultListener(this._listener);
        }

        this._qzone = plugin.PluginManager.getInstance().loadPlugin("SocialQzone");
        this._twitter = plugin.PluginManager.getInstance().loadPlugin("SocialTwitter");
        this._facebook = plugin.PluginManager.getInstance().loadPlugin("SocialFacebook");

        window.test = this;

    },
    shareByMode:function (info, mode) {
        var share = null;
        switch (mode) {
            case MyShareMode.SNWeibo:
                share = this._snweibo;
                break;
            case MyShareMode.QQWeibo:
                share = this._qqweibo;
                break;
            case MyShareMode.QZone:
                share = this._qzone;
                break;
            case MyShareMode.Twitter:
                share = this._twitter;
                break;
            case MyShareMode.Facebook:
                share = this._facebook;
                break;
            default:
                break;
        }


        if (share) {
            share.share(info);
        }
    }
});

MySocialManager.getInstance = function () {
    if (!this._instance) {
        this._instance = new MySocialManager();
    }
    return this._instance;
};

MySocialManager.purgeManager = function () {
    if (this._instance) {
        this._instance = null;
        delete this._instance;
    }
};