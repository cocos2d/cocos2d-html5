/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

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

cc.txtLoader = {
    load : function(realUrl, url, res, cb){
        cc.loader.loadTxt(realUrl, cb);
    }
}
cc.loader.register(["txt", "xml", "vsh", "fsh"], cc.txtLoader);

cc.jsonLoader = {
    load : function(realUrl, url, res, cb){
        cc.loader.loadJson(realUrl, cb);
    }
};
cc.loader.register(["json", "ExportJson"], cc.jsonLoader);

cc.imgLoader = {
    load : function(realUrl, url, res, cb){
        var image = cc.loader.loadImg(realUrl, function(err, img){
            if(err) return cb(err);
            cc.textureCache.handleLoadedTexture(url);
            cb(null, img);
        });
        cc.loader.cache[url] = image;
    }
};
cc.loader.register(["png", "jpg", "bmp","jpeg","gif"], cc.imgLoader);

cc.plistLoader = {
    load : function(realUrl, url, res, cb){
        cc.loader.loadTxt(realUrl, function(err, txt){
            if(err) return cb(err);
            cb(null, cc.plistParser.parse(txt));
        });
    }
}
cc.loader.register(["plist"], cc.plistLoader);
/**
 * This is a loader to merge plist files to one file.
 */
cc.pkgJsonLoader = {
    /**
     * @constant
     */
    KEY : {
        frames : "frames",
        rect : "rect", size : "size", offset : "offset", rotated : "rotated", aliases : "aliases",

        meta : "meta",
        image : "image"
    },
    /**
     * @constant
     */
    MIN_KEY : {
        frames : 0,
        rect : 0, size : 1, offset : 2, rotated : 3, aliases : 4,

        meta : 1,
        image : 0
    },
    _parse : function(data){
        var KEY = data instanceof Array ? this.MIN_KEY : this.KEY;
        var frames = {}, meta = data[KEY.meta] ? {image : data[KEY.meta][KEY.image]} : {};
        var tempFrames = data[KEY.frames];
        for (var frameName in tempFrames) {
            var f = tempFrames[frameName];
            var rect = f[KEY.rect];
            var size = f[KEY.size];
            var offset = f[KEY.offset];
            frames[frameName] = {
                rect : {x : rect[0], y : rect[1], width : rect[2], height : rect[3]},
                size : {width : size[0], height : size[1]},
                offset : {x : offset[0], y : offset[1]},
                rotated : f[KEY.rotated],
                aliases : f[KEY.aliases]
            }
        }
        return {_inited : true, frames : frames, meta : meta};
    },
    load : function(realUrl, url, res, cb){
        var self = this, locLoader = cc.loader, cache = locLoader.cache;
        locLoader.loadJson(realUrl, function(err, pkg){
            if(err) return cb(err);
            var dir = cc.path.dirname(url);
            for (var key in pkg) {
                var filePath = cc.path.join(dir, key);
                cache[filePath] = self._parse(pkg[key]);
            }
            cb(null, true);
        });
    }
};
cc.loader.register(["pkgJson"], cc.pkgJsonLoader);

cc.fontLoader = {
    TYPE : {
        "eot" : "embedded-opentype",
        "ttf" : "truetype",
        "woff" : "woff",
        "svg" : "svg"
    },
    _loadFont : function(name, srcs, type){
        var doc = document, path = cc.path, TYPE = this.TYPE, fontStyle = doc.createElement("style");
        fontStyle.type = "text/css";
        doc.body.appendChild(fontStyle);

        var fontStr = "@font-face { font-family:" + name + "; src:";
        if(srcs instanceof Array){
            for(var i = 0, li = srcs.length; i < li; i++){
                var src = srcs[i];
                type = path.extname(src);
                fontStr += "url('" + srcs[i] + "') format('" + TYPE[type] + "')";
                fontStr += (i == li - 1) ? ";" : ",";
            }
        }else{
            fontStr += "url('" + srcs + "') format('" + TYPE[type] + "');";
        }
        fontStyle.textContent += fontStr + "};";

        //<div style="font-family: PressStart;">.</div>
        var preloadDiv = document.createElement("div");
        preloadDiv.style.fontFamily = name;
        preloadDiv.innerHTML = ".";
        preloadDiv.style.position = "absolute";
        preloadDiv.style.left = "-100px";
        preloadDiv.style.top = "-100px";
        doc.body.appendChild(preloadDiv);
    },
    load : function(realUrl, url, res, cb){
        var self = this;
        var type = res.type, name = res.name, srcs = res.srcs;
        if(typeof res == "string"){
            type = cc.path.extname(res);
            name = cc.path.basename(res, type);
            self._loadFont(name, res, type);
        }else{
            self._loadFont(name, srcs);
        }
        cb(null, true);
    }
}
cc.loader.register(["font", "eot", "ttf", "woff", "svg"], cc.fontLoader);

cc.binaryLoader = {
    load : function(realUrl, url, res, cb){
        cc.loader.loadBinary(realUrl, cb);
    }
};