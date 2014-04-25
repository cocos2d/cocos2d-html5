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
        cc.openURL("http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?"+urlstring);
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