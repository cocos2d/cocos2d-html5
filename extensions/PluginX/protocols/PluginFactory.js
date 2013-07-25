plugin.PluginType = {
    ADS:["AdSense"],
    ANALYTICS:["AdsGoogle"],
    IAP:[""],
    SOCIAL:["SocialTwitter","SocialFacebook","SocialQzone","SocialQQWeibo","SocialWeibo"]
};

/**
 * Plugin Factory
 * @extend cc.Class
 * @class
 */
plugin.PluginFactory = cc.Class.extend({
    /**
     * create the plugin by name
     */
    createPlugin:function (name) {
        if (name == null || name.length == 0) return null;

        var ret;
        var obj = new plugin[name]();
        obj.init();

        switch (name) {
            case plugin.PluginType.ADS[0]:
                ret = new plugin.ProtocolAds();
                break;
            case plugin.PluginType.ANALYTICS:
                ret = new plugin.ProtocolAnalytics();
                break;
            case plugin.PluginType.IAP:
                ret = new plugin.ProtocolIAP();
                break;
            case plugin.PluginType.SOCIAL[0]:
            case plugin.PluginType.SOCIAL[1]:
            case plugin.PluginType.SOCIAL[2]:
            case plugin.PluginType.SOCIAL[3]:
            case plugin.PluginType.SOCIAL[4]:
                ret = new plugin.ProtocolSocial();
                break;
            default:
                throw "Plugin " + name + " not implements a right protocol";

        }

        if (ret !== null) {
            ret.setPluginName(name);
            plugin.PluginUtils.initPlugin(ret, obj, name);
        }
        return ret;
    }
});

/**
 * Get singleton of PluginFactory
 */
plugin.PluginFactory.getInstance = function () {
    if (!this._instnace) {
        this._instnace = new plugin.PluginFactory();
    }
    return this._instnace;
};

/**
 * Destory the instance of PluginFactory
 */
plugin.PluginFactory.purgeFactory = function () {
    if (this._instnace) {
        delete this._instnace;
    }
};