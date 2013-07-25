plugin.ShareResultCode = {
    Success: 0,
    Fail: 1,
    Cancel: 2,
    TimeOut: 3
};

plugin.ShareResultListener = cc.Class.extend({
    onShareResult: function (ret, msg) {

    }
});

/**
 * @class ProtocolSocial
 */
plugin.ProtocolSocial = plugin.PluginProtocol.extend({

    /**
     * share result callback
     * @param {Number} ret
     * @param {String} msg
     */
    onShareResult: function (ret, msg) {
        if (this._listener) {
            this._listener.onShareResult(ret, msg);
        }
        else {
            cc.log("Share result listener of " + this.getPluginName() + " is null!");
        }
        cc.log("Share result of " + this.getPluginName() + " is : " + ret + msg);
    },

    /**
     * set the result listener
     * @param {Function} listener The callback object for share result
     */
    setResultListener: function (listener) {
        this._listener = listener;
    },

    /**
     * share information
     * @param {Object} info  The info of share, contains key:
     * SharedText The text need to share
     * SharedImagePath The full path of image file need to share (optinal)
     * SharedURL url of the site
     */
    share: function (info) {
        if (Object.keys(info).length == 0) {
            if (null != this._listener) {
                this.onShareResult(plugin.ShareResultCode.Fail, "Share info error");
            }
            cc.log("The Share info of " + this.getPluginName() + " is empty!");
        }
        else {
            var data = plugin.PluginUtils.getPluginData(this);
            var obj = data.obj;
            obj.share(info);
        }
    },

    /**
     * config the social developer info
     * @param {Object} devInfo This parameter is the info of developer,different plugin have different format
     */
    configDeveloperInfo: function (devInfo) {
        if (Object.keys(devInfo).length == 0) {
            cc.log("The developer info is empty for " + this.getPluginName());
        }
        else {
            var data = plugin.PluginUtils.getPluginData(this);
            var obj = data.obj;
            obj.configDeveloperInfo(devInfo);
        }
    },

    setDebugMode:function(value){
        //invalid on html5
    }
});
