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

cc._txtLoader = {
    load: function (realUrl, url, res, cb) {
        cc.loader.loadTxt(realUrl, cb);
    }
};
cc.loader.register(["txt", "xml", "vsh", "fsh", "atlas"], cc._txtLoader);

cc._jsonLoader = {
    load: function (realUrl, url, res, cb) {
        cc.loader.loadJson(realUrl, cb);
    }
};
cc.loader.register(["json", "ExportJson"], cc._jsonLoader);

cc._jsLoader = {
    load: function (realUrl, url, res, cb) {
        cc.loader.loadJs(realUrl, cb);
    }
};
cc.loader.register(["js"], cc._jsLoader);

cc._imgLoader = {
    load: function (realUrl, url, res, cb) {
        var callback;
        if (cc.loader.isLoading(realUrl)) {
            callback = cb;
        }
        else {
            callback = function (err, img) {
                if (err)
                    return cb(err);
                cc.loader.cache[url] = img;
                cc.textureCache.handleLoadedTexture(url);
                cb(null, img);
            };
        }
        cc.loader.loadImg(realUrl, callback);
    }
};
cc.loader.register(["png", "jpg", "bmp", "jpeg", "gif", "ico", "tiff", "webp"], cc._imgLoader);
cc._serverImgLoader = {
    load: function (realUrl, url, res, cb) {
        cc._imgLoader.load(res.src, url, res, cb);
    }
};
cc.loader.register(["serverImg"], cc._serverImgLoader);

cc._plistLoader = {
    load: function (realUrl, url, res, cb) {
        cc.loader.loadTxt(realUrl, function (err, txt) {
            if (err)
                return cb(err);
            cb(null, cc.plistParser.parse(txt));
        });
    }
};
cc.loader.register(["plist"], cc._plistLoader);

cc._fontLoader = {
    TYPE: {
        ".eot": "embedded-opentype",
        ".ttf": "truetype",
        ".ttc": "truetype",
        ".woff": "woff",
        ".svg": "svg"
    },
    _loadFont: function (name, srcs, type) {
        var doc = document, path = cc.path, TYPE = this.TYPE, fontStyle = document.createElement("style");
        fontStyle.type = "text/css";
        doc.body.appendChild(fontStyle);

        var fontStr = "";
        if (isNaN(name - 0))
            fontStr += "@font-face { font-family:" + name + "; src:";
        else
            fontStr += "@font-face { font-family:'" + name + "'; src:";
        if (srcs instanceof Array) {
            for (var i = 0, li = srcs.length; i < li; i++) {
                var src = srcs[i];
                type = path.extname(src).toLowerCase();
                fontStr += "url('" + srcs[i] + "') format('" + TYPE[type] + "')";
                fontStr += (i === li - 1) ? ";" : ",";
            }
        } else {
            type = type.toLowerCase();
            fontStr += "url('" + srcs + "') format('" + TYPE[type] + "');";
        }
        fontStyle.textContent += fontStr + "}";

        //<div style="font-family: PressStart;">.</div>
        var preloadDiv = document.createElement("div");
        var _divStyle = preloadDiv.style;
        _divStyle.fontFamily = name;
        preloadDiv.innerHTML = ".";
        _divStyle.position = "absolute";
        _divStyle.left = "-100px";
        _divStyle.top = "-100px";
        doc.body.appendChild(preloadDiv);
    },
    load: function (realUrl, url, res, cb) {
        var self = this;
        var type = res.type, name = res.name, srcs = res.srcs;
        if (cc.isString(res)) {
            type = cc.path.extname(res);
            name = cc.path.basename(res, type);
            self._loadFont(name, res, type);
        } else {
            self._loadFont(name, srcs);
        }
        if (document.fonts) {
            document.fonts.load("1em " + name).then(function () {
                cb(null, true);
            }, function (err) {
                cb(err);
            });
        } else {
            cb(null, true);
        }
    }
};
cc.loader.register(["font", "eot", "ttf", "woff", "svg", "ttc"], cc._fontLoader);

cc._binaryLoader = {
    load: function (realUrl, url, res, cb) {
        cc.loader.loadBinary(realUrl, cb);
    }
};

cc._csbLoader = {
    load: function(realUrl, url, res, cb){
        cc.loader.loadCsb(realUrl, cb);
    }
};
cc.loader.register(["csb"], cc._csbLoader);
