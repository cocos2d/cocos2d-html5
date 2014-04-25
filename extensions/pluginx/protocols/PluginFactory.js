/****************************************************************************
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

plugin.PluginType = {
    ADS:["AdSense"],
    ANALYTICS:["AdsGoogle","AnalyticsFlurry"],
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
            case plugin.PluginType.ANALYTICS[0]:
            case plugin.PluginType.ANALYTICS[1]:
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
