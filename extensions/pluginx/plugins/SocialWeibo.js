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

plugin.SocialWeibo = cc.Class.extend({
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

        var urlstring = "?", value;
        for (var key in this._shareInfo) {
            value = this._shareInfo[key];
            if (value) {
                urlstring += encodeURI(key + "=" + value) + "&";
            }
        }
        urlstring = urlstring.substr(0, urlstring.length - 1);
        cc.openURL("http://v.t.sina.com.cn/share/share.php?" + urlstring);
    },
    setDebugMode: function (debug) {
        //invalid on html5
    },
    getSDKVersion: function () {
        return "2.0";
    },
    getPluginVersion: function () {
        return plugin.Version;
    }
});