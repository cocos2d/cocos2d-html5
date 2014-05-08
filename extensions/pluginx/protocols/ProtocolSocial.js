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
