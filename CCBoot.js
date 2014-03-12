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

var cc = cc || {};

/** @expose */
window._p;
_p = window;
/** @expose */
_p.gl;
/** @expose */
_p.WebGLRenderingContext;
/** @expose */
_p.DeviceOrientationEvent;
/** @expose */
_p.DeviceMotionEvent;
/** @expose */
_p.AudioContext;
/** @expose */
_p.webkitAudioContext;
/** @expose */
_p.mozAudioContext;
_p = Object.prototype;
/** @expose */
_p._super;
/** @expose */
_p.ctor;
delete window._p;

//is nodejs ? Used to support node-webkit.
cc._isNodeJs = typeof require !== 'undefined' && require("fs");

/**
 * Iterate over an object or an array, executing a function for each matched element.
 * @param {object|array} obj
 * @param {function} iterator
 * @param [{object}] context
 */
cc.each = function(obj, iterator, context){
    if(!obj) return;
    if(obj instanceof Array){
        for(var i = 0, li = obj.length; i < li; i++){
            if(iterator.call(context, obj[i], i) === false) return;
        }
    }else{
        for (var key in obj) {
            if(iterator.call(context, obj[key], key) === false) return;
        }
    }
};


//+++++++++++++++++++++++++something about async begin+++++++++++++++++++++++++++++++
cc.async = {
    /**
     * Counter for cc.async
     * @param err
     */
    _counterFunc : function(err){
        var counter = this.counter;
        if(counter.err) return;
        var length = counter.length;
        var results = counter.results;
        var option = counter.option;
        var cb = option.cb, cbTarget = option.cbTarget, trigger = option.trigger, triggerTarget = option.triggerTarget;
        if(err) {
            counter.err = err;
            if(cb) return cb.call(cbTarget, err);
            return;
        }
        var result = Array.apply(null, arguments).slice(1);
        var l = result.length;
        if(l == 0) result = null;
        else if(l == 1) result = result[0];
        else result = result;
        results[this.index] = result;
        counter.count--;
        if(trigger) trigger.call(triggerTarget, result, length - counter.count, length);
        if(counter.count == 0 && cb) cb.apply(cbTarget, [null, results]);
    },

    /**
     * Empty function for async.
     * @private
     */
    _emptyFunc : function(){},
    /**
     * Do tasks parallel.
     * @param tasks
     * @param option
     * @param cb
     */
    parallel : function(tasks, option, cb){
        var async = cc.async;
        var l = arguments.length;
        if(l == 3) {
            if(typeof option == "function") option = {trigger : option};
            option.cb = cb || option.cb;
        }
        else if(l == 2){
            if(typeof option == "function") option = {cb : option};
        }else if(l == 1) option = {};
        else throw "arguments error!";
        var isArr = tasks instanceof Array;
        var li = isArr ? tasks.length : Object.keys(tasks).length;
        if(li == 0){
            if(option.cb) option.cb.call(option.cbTarget, null);
            return;
        }
        var results = isArr ? [] : {};
        var counter = { length : li, count : li, option : option, results : results};

        cc.each(tasks, function(task, index){
            if(counter.err) return false;
            var counterFunc = !option.cb && !option.trigger ? async._emptyFunc : async._counterFunc.bind({counter : counter, index : index});//bind counter and index
            task(counterFunc, index);
        });
    },

    /**
     * Do tasks by iterator.
     * @param tasks
     * @param {{cb:{function}, target:{object}, iterator:{function}, iteratorTarget:{function}}|function} option
     * @param cb
     */
    map : function(tasks, option, cb){
        var self = this;
        var l = arguments.length;
        if(typeof option == "function") option = {iterator : option};
        if(l == 3) option.cb = cb || option.cb;
        else if(l == 2);
        else throw "arguments error!";
        var isArr = tasks instanceof Array;
        var li = isArr ? tasks.length : Object.keys(tasks).length;
        if(li == 0){
            if(option.cb) option.cb.call(option.cbTarget, null);
            return;
        }
        var results = isArr ? [] : {};
        var counter = { length : li, count : li, option : option, results : results};
        cc.each(tasks, function(task, index){
            if(counter.err) return false;
            var counterFunc = !option.cb ? self._emptyFunc : self._counterFunc.bind({counter : counter, index : index});//bind counter and index
            option.iterator.call(option.iteratorTarget, task, index, counterFunc);
        });
    }
};
//+++++++++++++++++++++++++something about async end+++++++++++++++++++++++++++++++++

//+++++++++++++++++++++++++something about path begin++++++++++++++++++++++++++++++++
cc.path = {
    /**
     * Join strings to be a path.
     * @example
     cc.path.join("a", "b.png");//-->"a/b.png"
     cc.path.join("a", "b", "c.png");//-->"a/b/c.png"
     cc.path.join("a", "b");//-->"a/b"
     cc.path.join("a", "b", "/");//-->"a/b/"
     cc.path.join("a", "b/", "/");//-->"a/b/"
     * @returns {string}
     */
    join : function(){
        var l = arguments.length;
        var result = "";
        for(var i = 0; i < l; i++) {
            result = (result + (result == "" ? "" : "/") + arguments[i]).replace(/(\/|\\\\)$/, "");
        }
        return result;
    },

    /**
     * Get the ext name of a path.
     * @example
     cc.path.extname("a/b.png");//-->".png"
     cc.path.extname("a/b.png?a=1&b=2");//-->".png"
     cc.path.extname("a/b");//-->null
     cc.path.extname("a/b?a=1&b=2");//-->null
     * @param pathStr
     * @returns {*}
     */
    extname : function(pathStr){
        var temp = /(\.[^\.\/\?\\]*)(\?.*)?$/.exec(pathStr);
        return temp ? temp[1] : null;
    },

    /**
     * Get the file name of a file path.
     * @example
     cc.path.basename("a/b.png");//-->"b.png"
     cc.path.basename("a/b.png?a=1&b=2");//-->"b.png"
     cc.path.basename("a/b.png", ".png");//-->"b"
     cc.path.basename("a/b.png?a=1&b=2", ".png");//-->"b"
     cc.path.basename("a/b.png", ".txt");//-->"b.png"
     * @param pathStr
     * @param extname
     * @returns {*}
     */
    basename : function(pathStr, extname){
        var index = pathStr.indexOf("?");
        if(index > 0) pathStr = pathStr.substring(0, index);
        var reg = /(\/|\\\\)([^(\/|\\\\)]+)$/g;
        var result = reg.exec(pathStr.replace(/(\/|\\\\)$/, ""));
        if(!result) return null;
        var baseName = result[2];
        if(extname && pathStr.substring(pathStr.length - extname.length).toLowerCase() == extname.toLowerCase())
            return baseName.substring(0, baseName.length - extname.length);
        return baseName;
    },

    /**
     * Get ext name of a file path.
     * @example
     cc.path.driname("a/b/c.png");//-->"a/b"
     cc.path.driname("a/b/c.png?a=1&b=2");//-->"a/b"
     * @param {String} pathStr
     * @returns {*}
     */
    dirname : function(pathStr){
        return pathStr.replace(/(\/|\\\\)$/, "").replace(/(\/|\\\\)[^(\/|\\\\)]+$/, "");
    },

    /**
     * Change extname of a file path.
     * @example
     cc.path.changeExtname("a/b.png", ".plist");//-->"a/b.plist"
     cc.path.changeExtname("a/b.png?a=1&b=2", ".plist");//-->"a/b.plist?a=1&b=2"
     * @param pathStr
     * @param extname
     * @returns {string}
     */
    changeExtname : function(pathStr, extname){
        extname = extname || "";
        var index = pathStr.indexOf("?");
        var tempStr = "";
        if(index > 0) {
            tempStr = pathStr.substring(index);
            pathStr = pathStr.substring(0, index);
        };
        index = pathStr.lastIndexOf(".");
        if(index < 0) return pathStr + extname + tempStr;
        return pathStr.substring(0, index) + extname + tempStr;
    },
    /**
     * Change file name of a file path.
     * @example
     cc.path.changeBasename("a/b/c.plist", "b.plist");//-->"a/b/b.plist"
     cc.path.changeBasename("a/b/c.plist?a=1&b=2", "b.plist");//-->"a/b/b.plist?a=1&b=2"
     cc.path.changeBasename("a/b/c.plist", ".png");//-->"a/b/c.png"
     cc.path.changeBasename("a/b/c.plist", "b");//-->"a/b/b"
     cc.path.changeBasename("a/b/c.plist", "b", true);//-->"a/b/b.plist"
     * @param {String} pathStr
     * @param {String} basename
     * @param [{Boolean}] isSameExt
     * @returns {string}
     */
    changeBasename : function(pathStr, basename, isSameExt){
        if(basename.indexOf(".") == 0) return this.changeExtname(pathStr, basename);
        var index = pathStr.indexOf("?");
        var tempStr = "";
        var ext = isSameExt ? this.extname(pathStr) : "";
        if(index > 0) {
            tempStr = pathStr.substring(index);
            pathStr = pathStr.substring(0, index);
        };
        index = pathStr.lastIndexOf("/");
        index = index <= 0 ? 0 : index+1;
        return pathStr.substring(0, index) + basename + ext + tempStr;
    }
};
//+++++++++++++++++++++++++something about path end++++++++++++++++++++++++++++++++

//Compatibility with IE9
var Uint8Array = Uint8Array || Array;

if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
    var IEBinaryToArray_ByteStr_Script =
        "<!-- IEBinaryToArray_ByteStr -->\r\n" +
            //"<script type='text/vbscript'>\r\n" +
            "Function IEBinaryToArray_ByteStr(Binary)\r\n" +
            "   IEBinaryToArray_ByteStr = CStr(Binary)\r\n" +
            "End Function\r\n" +
            "Function IEBinaryToArray_ByteStr_Last(Binary)\r\n" +
            "   Dim lastIndex\r\n" +
            "   lastIndex = LenB(Binary)\r\n" +
            "   if lastIndex mod 2 Then\r\n" +
            "       IEBinaryToArray_ByteStr_Last = Chr( AscB( MidB( Binary, lastIndex, 1 ) ) )\r\n" +
            "   Else\r\n" +
            "       IEBinaryToArray_ByteStr_Last = " + '""' + "\r\n" +
            "   End If\r\n" +
            "End Function\r\n";// +
    //"</script>\r\n";

    // inject VBScript
    //document.write(IEBinaryToArray_ByteStr_Script);
    var myVBScript = document.createElement('script');
    myVBScript.type = "text/vbscript";
    myVBScript.textContent = IEBinaryToArray_ByteStr_Script;
    document.body.appendChild(myVBScript);

    // helper to convert from responseBody to a "responseText" like thing
    cc._convertResponseBodyToText = function (binary) {
        var byteMapping = {};
        for (var i = 0; i < 256; i++) {
            for (var j = 0; j < 256; j++) {
                byteMapping[ String.fromCharCode(i + j * 256) ] =
                    String.fromCharCode(i) + String.fromCharCode(j);
            }
        }
        var rawBytes = IEBinaryToArray_ByteStr(binary);
        var lastChr = IEBinaryToArray_ByteStr_Last(binary);
        return rawBytes.replace(/[\s\S]/g,
            function (match) {
                return byteMapping[match];
            }) + lastChr;
    };
}


//+++++++++++++++++++++++++something about loader start+++++++++++++++++++++++++++
cc.loader = {

    _jsCache : {},//cache for js
    _register : {},//register of loaders
    _langPathCache : {},//cache for lang path
    _aliases : {},//aliases for res url

    resPath : "",//root path of resource
    audioPath : "",//root path of audio
    cache : {},//cache for data loaded

    /**
     * Get XMLHttpRequest.
     * @returns {XMLHttpRequest}
     */
    getXMLHttpRequest : function () {
        return window.XMLHttpRequest ? new window.XMLHttpRequest() : new ActiveXObject("MSXML2.XMLHTTP");
    },


    //@MODE_BEGIN DEV

    _getArgs4Js : function(args){
        var a0 = args[0], a1 = args[1], a2 = args[2], results = ["", null, null];

        if(args.length == 1){
            results[1] = a0 instanceof Array ? a0 : [a0];
        }else if(args.length == 2){
            if(typeof a1 == "function"){
                results[1] = a0 instanceof Array ? a0 : [a0];
                results[2] = a1;
            }else{
                results[0] = a0 || "";
                results[1] = a1 instanceof Array ? a1 : [a1];
            }
        }else if(args.length == 3){
            results[0] = a0 || "";
            results[1] = a1 instanceof Array ? a1 : [a1];
            results[2] = a2;
        }else throw "arguments error to load js!";
        return results;
    },
    /**
     * Load js files.
     * @param {?string=} baseDir   The pre path for jsList.
     * @param {array.<string>} jsList    List of js path.
     * @param {function} cb        Callback function
     *
     *      If the arguments.length == 2, then the baseDir turns to be "".
     * @returns {*}
     */
    loadJs : function(baseDir, jsList, cb){
        var self = this, localJsCache = self._jsCache,
            args = self._getArgs4Js(arguments);

        if (navigator.userAgent.indexOf("Trident/5") > -1) {
            self._loadJs4Dependency(args[0], args[1], 0, args[2]);
        } else {
            cc.async.map(args[1], function(item, index, cb1){
                var jsPath = cc.path.join(args[0], item);
                if(localJsCache[jsPath]) return cb1(null);
                self._createScript(jsPath, false, cb1);
            }, args[2]);
        }
    },
    /**
     * Load js width loading image.
     * @param {?string} baseDir
     * @param {array} jsList
     * @param {function} cb
     */
    loadJsWithImg : function(baseDir, jsList, cb){
        var self = this, jsLoadingImg = self._loadJsImg(),
            args = self._getArgs4Js(arguments);
        this.loadJs(args[0], args[1], function(err){
            if(err) throw err;
            jsLoadingImg.parentNode.removeChild(jsLoadingImg);//remove loading gif
            if(args[2]) args[2]();
        });
    },
    _createScript : function(jsPath, isAsync, cb){
        var d = document, self = this, s = d.createElement('script');
        s.async = isAsync;
        s.src = jsPath;
        self._jsCache[jsPath] = true;
        s.addEventListener('load',function(){
            this.removeEventListener('load', arguments.callee, false);
            cb();
        },false);
        s.addEventListener('error',function(){
            cb("Load " + jsPath + " failed!");
        },false);
        d.body.appendChild(s);
    },
    _loadJs4Dependency : function(baseDir, jsList, index, cb){
        if(index >= jsList.length) {
            if(cb) cb();
            return;
        }
        var self = this;
        self._createScript(cc.path.join(baseDir, jsList[index]), false, function(err){
            if(err) return cb(err);
            self._loadJs4Dependency(baseDir, jsList, index+1, cb);
        });
    },
    _loadJsImg : function(){
        var d = document, jsLoadingImg = d.getElementById("cocos2d_loadJsImg");
        if(!jsLoadingImg){
            jsLoadingImg = d.createElement('img');
            jsLoadingImg.src = "data:image/gif;base64,R0lGODlhEAAQALMNAD8/P7+/vyoqKlVVVX9/fxUVFUBAQGBgYMDAwC8vL5CQkP///wAAAP///wAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFAAANACwAAAAAEAAQAAAEO5DJSau9OOvNex0IMnDIsiCkiW6g6BmKYlBFkhSUEgQKlQCARG6nEBwOgl+QApMdCIRD7YZ5RjlGpCUCACH5BAUAAA0ALAAAAgAOAA4AAAQ6kLGB0JA4M7QW0hrngRllkYyhKAYqKUGguAws0ypLS8JxCLQDgXAIDg+FRKIA6v0SAECCBpXSkstMBAAh+QQFAAANACwAAAAACgAQAAAEOJDJORAac6K1kDSKYmydpASBUl0mqmRfaGTCcQgwcxDEke+9XO2WkxQSiUIuAQAkls0n7JgsWq8RACH5BAUAAA0ALAAAAAAOAA4AAAQ6kMlplDIzTxWC0oxwHALnDQgySAdBHNWFLAvCukc215JIZihVIZEogDIJACBxnCSXTcmwGK1ar1hrBAAh+QQFAAANACwAAAAAEAAKAAAEN5DJKc4RM+tDyNFTkSQF5xmKYmQJACTVpQSBwrpJNteZSGYoFWjIGCAQA2IGsVgglBOmEyoxIiMAIfkEBQAADQAsAgAAAA4ADgAABDmQSVZSKjPPBEDSGucJxyGA1XUQxAFma/tOpDlnhqIYN6MEAUXvF+zldrMBAjHoIRYLhBMqvSmZkggAIfkEBQAADQAsBgAAAAoAEAAABDeQyUmrnSWlYhMASfeFVbZdjHAcgnUQxOHCcqWylKEohqUEAYVkgEAMfkEJYrFA6HhKJsJCNFoiACH5BAUAAA0ALAIAAgAOAA4AAAQ3kMlJq704611SKloCAEk4lln3DQgyUMJxCBKyLAh1EMRR3wiDQmHY9SQslyIQUMRmlmVTIyRaIgA7";

            var canvasNode = d.getElementById(cc.game.config["id"]);
            canvasNode.style.backgroundColor = "black";
            canvasNode.parentNode.appendChild(jsLoadingImg);

            var canvasStyle = getComputedStyle?getComputedStyle(canvasNode):canvasNode.currentStyle;
            jsLoadingImg.style.left = canvasNode.offsetLeft + (parseFloat(canvasStyle.width) - jsLoadingImg.width)/2 + "px";
            jsLoadingImg.style.top = canvasNode.offsetTop + (parseFloat(canvasStyle.height) - jsLoadingImg.height)/2 + "px";
            jsLoadingImg.style.position = "absolute";
        }
        return jsLoadingImg;
    },
    //@MODE_END DEV

    /**
     * Load a single resource as txt.
     * @param {!string} url
     * @param {function} cb arguments are : err, txt
     */
    loadTxt : function(url, cb){
        if(!cc._isNodeJs){
            var xhr = this.getXMLHttpRequest(),
                errInfo = "load " + url + " failed!";
            xhr.open("GET", url, true);
            if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
                // IE-specific logic here
                xhr.setRequestHeader("Accept-Charset", "utf-8");
                xhr.onreadystatechange = function () {
                    xhr.readyState == 4 && xhr.status == 200 ? cb(null, xhr.responseText) : cb(errInfo);
                };
            } else {
                if (xhr.overrideMimeType) xhr.overrideMimeType("text\/plain; charset=utf-8");
                xhr.onload = function () {
                    xhr.readyState == 4 && xhr.status == 200 ? cb(null, xhr.responseText) : cb(errInfo);
                };
            }
            xhr.send(null);
        }else{
            var fs = require("fs");
            fs.readFile(url, function(err, data){
                err ? cb(err) : cb(null, data.toString());
            });
        }
    },
    _loadTxtSync : function(url){
        if(!cc._isNodeJs){
            var xhr = this.getXMLHttpRequest();
            xhr.open("GET", url, false);
            if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
                // IE-specific logic here
                xhr.setRequestHeader("Accept-Charset", "utf-8");
            } else {
                if (xhr.overrideMimeType) xhr.overrideMimeType("text\/plain; charset=utf-8");
            }
            xhr.send(null);
            if (!xhr.readyState == 4 || xhr.status != 200) {
                return null;
            }
            return xhr.responseText;
        }else{
            var fs = require("fs");
            return fs.readFileSync(url).toString();
        }
    },

    /**
     * Load a single resource as json.
     * @param {!string} url
     * @param {function} cb arguments are : err, json
     */
    loadJson : function(url, cb){
        this.loadTxt(url, function(err, txt){
            try{
                err ? cb(err) : cb(null, JSON.parse(txt));
            }catch(e){
                throw e;
                cb("load json [" + url + "] failed : " + e);
            }
        });
    },

    /**
     * Load a single image.
     * @param {!string} url
     * @param [{object}] option
     * @param {function} cb
     * @returns {Image}
     */
    loadImg : function(url, option, cb){
        var l = arguments.length;
        var opt = {
            isCrossOrigin : true
        };
        if(l == 3) {
            opt.isCrossOrigin = option.isCrossOrigin == null ? opt.isCrossOrigin : option.isCrossOrigin;
        }
        else if(l == 2) cb = option;

        var img = new Image();
        if(opt.isCrossOrigin) img.crossOrigin = "Anonymous";

        img.addEventListener("load", function () {
            this.removeEventListener('load', arguments.callee, false);
            this.removeEventListener('error', arguments.callee, false);
            if(cb) cb(null, img);
        });
        img.addEventListener("error", function () {
            this.removeEventListener('error', arguments.callee, false);
            if(cb) cb("load image failed");
        });
        img.src = url;
        return img;
    },

    _str2Uint8Array : function(strData){
        if (!strData)
            return null;

        var arrData = new Uint8Array(strData.length);
        for (var i = 0; i < strData.length; i++) {
            arrData[i] = strData.charCodeAt(i) & 0xff;
        }
        return arrData;
    },
    /**
     * Load binary data by url.
     * @param {String} url
     * @param {Function} cb
     */
    loadBinary : function(url, cb){
        var self = this;
        var xhr = this.getXMLHttpRequest(),
            errInfo = "load " + url + " failed!";
        xhr.open("GET", url, true);
        if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
            // IE-specific logic here
            xhr.setRequestHeader("Accept-Charset", "x-user-defined");
            xhr.onreadystatechange = function () {
                if(xhr.readyState == 4 && xhr.status == 200){
                    var fileContents = cc._convertResponseBodyToText(xhr["responseBody"]);
                    cb(null, self._str2Uint8Array(fileContents));
                } else cb(errInfo);
            };
        } else {
            if (xhr.overrideMimeType) xhr.overrideMimeType("text\/plain; charset=x-user-defined");
            xhr.onload = function () {
                xhr.readyState == 4 && xhr.status == 200 ? cb(null, self._str2Uint8Array(xhr.responseText)) : cb(errInfo);
            };
        }
        xhr.send(null);
    },
    loadBinarySync : function(url){
        var self = this;
        var req = this.getXMLHttpRequest();
        var errInfo = "load " + url + " failed!";
        req.open('GET', url, false);
        var arrayInfo = null;
        if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
            req.setRequestHeader("Accept-Charset", "x-user-defined");
            req.send(null);
            if (req.status != 200) {
                cc.log(errInfo);
                return null;
            }

            var fileContents = cc._convertResponseBodyToText(req["responseBody"]);
            if (fileContents) {
                arrayInfo = self._str2Uint8Array(fileContents);
            }
        } else {
            if (req.overrideMimeType)
                req.overrideMimeType('text\/plain; charset=x-user-defined');
            req.send(null);
            if (req.status != 200) {
                cc.log(errInfo);
                return null;
            }

            arrayInfo = this._str2Uint8Array(req.responseText);
        }
        return arrayInfo;
    },

    /**
     * Iterator function to load res
     * @param {object} item
     * @param {number} index
     * @param {function} cb
     * @returns {*}
     * @private
     */
    _loadResIterator : function(item, index, cb){
        var self = this, url = null;
        var type = item.type;
        if(type){
            type = "." + type.toLowerCase();
            url = item.name + type;
        }else{
            url = item;
            type = cc.path.extname(url);
        }

        var obj = self.cache[url];
        if(obj) return cb(null, obj);
        var loader = self._register[type.toLowerCase()];
        if(!loader) return cb("loader for [" + type + "] not exists!");
        var basePath = loader.getBasePath ? loader.getBasePath() : self.resPath;
        var realUrl = self.getUrl(basePath, url);
        loader.load(realUrl, url, item, function(err, data){
            if(err){
                cc.log(err);
                self.cache[url] = null;
                cb();
            }else{
                self.cache[url] = data;
                cb(null, data);
            }
        });
    },

    /**
     * Get url with basePath.
     * @param [{string}] basePath
     * @param {string} url
     * @returns {*}
     */
    getUrl : function(basePath, url){
        var self = this, langPathCache = self._langPathCache, path = cc.path;
        if(arguments.length == 1){
            url = basePath;
            var type = path.extname(url);
            type = type ? type.toLowerCase() : "";
            var loader = self._register[type];
            if(!loader) basePath = self.resPath;
            else basePath = loader.getBasePath ? loader.getBasePath() : self.resPath;
        }
        url = cc.path.join(basePath || "", url)
        if(url.match(/[\/(\\\\)]lang[\/(\\\\)]/i)){
            if(langPathCache[url]) return langPathCache[url];
            var extname = path.extname(url) || "";
            url = langPathCache[url] = url.substring(0, url.length - extname.length) + "_" + cc.sys.language + extname;
        }
        return url;
    },

    /**
     * Load resources then call the callback.
     * @param {[string]} res
     * @param [{function}|{}] option
     * @param {function} cb :
     */
    load : function(res, option, cb){
        var l = arguments.length;
        if(l == 3) {
            if(typeof option == "function") option = {trigger : option};
        }
        else if(l == 2){
            if(typeof option == "function") {
                cb = option;
                option = {};
            }
        }else if(l == 1) option = {};
        else throw "arguments error!";
        option.cb = function(err, results){
            if(err) cc.log(err);
            if(cb) cb(results);
        };
        if(!(res instanceof Array)) res = [res];
        option.iterator = this._loadResIterator;
        option.iteratorTarget = this;
        cc.async.map(res, option);
    },

    _handleAliases : function(fileNames, cb){
        var self = this, aliases = self._aliases;
        var resList = [];
        for (var key in fileNames) {
            var value = fileNames[key];
            aliases[key] = value;
            resList.push(value);
        }
        this.load(resList, cb);
    },

    /**
     * <p>
     *     Loads alias map from the contents of a filename.                                        <br/>
     *                                                                                                                 <br/>
     *     @note The plist file name should follow the format below:                                                   <br/>
     *     <?xml version="1.0" encoding="UTF-8"?>                                                                      <br/>
     *         <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">  <br/>
     *             <plist version="1.0">                                                                               <br/>
     *                 <dict>                                                                                          <br/>
     *                     <key>filenames</key>                                                                        <br/>
     *                     <dict>                                                                                      <br/>
     *                         <key>sounds/click.wav</key>                                                             <br/>
     *                         <string>sounds/click.caf</string>                                                       <br/>
     *                         <key>sounds/endgame.wav</key>                                                           <br/>
     *                         <string>sounds/endgame.caf</string>                                                     <br/>
     *                         <key>sounds/gem-0.wav</key>                                                             <br/>
     *                         <string>sounds/gem-0.caf</string>                                                       <br/>
     *                     </dict>                                                                                     <br/>
     *                     <key>metadata</key>                                                                         <br/>
     *                     <dict>                                                                                      <br/>
     *                         <key>version</key>                                                                      <br/>
     *                         <integer>1</integer>                                                                    <br/>
     *                     </dict>                                                                                     <br/>
     *                 </dict>                                                                                         <br/>
     *              </plist>                                                                                           <br/>
     * </p>
     * @param {String} filename  The plist file name.
     * @param {Function} cb     callback
     */
    loadAliases : function(url, cb){
        var self = this, dict = self.getRes(url);
        if(!dict){
            self.load(url, function(results){
                self._handleAliases(results[0]["filenames"], cb);
            });
        }else self._handleAliases(dict["filenames"], cb);
    },

    /**
     * Register a resource loader into loader.
     * @param {string} extname
     * @param {load : function} loader
     */
    register : function(extNames, loader){
        if(!extNames || !loader) return;
        var self = this;
        if(typeof extNames == "string") return this._register[extNames.trim().toLowerCase()] = loader;
        for(var i = 0, li = extNames.length; i < li; i++){
            self._register["." + extNames[i].trim().toLowerCase()] = loader;
        }
    },

    /**
     * Get resource data by url.
     * @param url
     * @returns {*}
     */
    getRes : function(url){
        return this.cache[url] || this.cache[this._aliases[url]];
    },

    /**
     * Release the cache of resource by url.
     * @param url
     */
    release : function(url){
        var cache = this.cache, aliases = this._aliases;
        delete cache[url];
        delete cache[aliases[url]];
        delete aliases[url];
    },

    /**
     * Resource cache of all resources.
     */
    releaseAll : function(){
        var locCache = this.cache, aliases = this._aliases;
        for (var key in locCache) {
            delete locCache[key];
        }
        for (var key in aliases) {
            delete aliases[key];
        }
    }

};
//+++++++++++++++++++++++++something about loader end+++++++++++++++++++++++++++++


//+++++++++++++++++++++++++something about window events begin+++++++++++++++++++++++++++
(function(){
    var win = window, hidden, visibilityChange;
    if (typeof document.hidden !== "undefined") {
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.mozHidden !== "undefined") {
        hidden = "mozHidden";
        visibilityChange = "mozvisibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }

    var onHidden = function(){
        if(cc.eventManager)
            cc.eventManager.dispatchEvent(cc.game._eventHide);
    };
    var onShow = function(){
        if(cc.eventManager)
            cc.eventManager.dispatchEvent(cc.game._eventShow);
    };

    if (typeof document.addEventListener !== "undefined" && hidden) {
        document.addEventListener(visibilityChange, function(){
            if (document[hidden]) onHidden();
            else onShow();
        }, false);
    }else{
        win.addEventListener("blur", onHidden, false);
        win.addEventListener("focus", onShow, false);
    }
    win = null;
    visibilityChange = null;
})();
//+++++++++++++++++++++++++something about window events end+++++++++++++++++++++++++++++

//+++++++++++++++++++++++++something about log start++++++++++++++++++++++++++++

cc._logToWebPage = function (msg) {
    if(!cc._canvas)
        return;

    var logList = cc._logList;
    var doc = document;
    if(!logList){
        var logDiv = doc.createElement("Div");
        var logDivStyle = logDiv.style;

        logDiv.setAttribute("id", "logInfoDiv");
        cc._canvas.parentNode.appendChild(logDiv);
        logDiv.setAttribute("width", "200");
        logDiv.setAttribute("height", cc._canvas.height);
        logDivStyle.zIndex = "99999";
        logDivStyle.position = "absolute";
        logDivStyle.top = "0";
        logDivStyle.left = "0";

        logList = cc._logList = doc.createElement("textarea");
        var logListStyle = logList.style;

        logList.setAttribute("rows", "20");
        logList.setAttribute("cols", "30");
        logList.setAttribute("disabled", true);
        logDiv.appendChild(logList);
        logListStyle.backgroundColor = "transparent";
        logListStyle.borderBottom = "1px solid #cccccc";
        logListStyle.borderRightWidth = "0px";
        logListStyle.borderLeftWidth = "0px";
        logListStyle.borderTopWidth = "0px";
        logListStyle.borderTopStyle = "none";
        logListStyle.borderRightStyle = "none";
        logListStyle.borderLeftStyle = "none";
        logListStyle.padding = "0px";
        logListStyle.margin = 0;

    }
    msg = typeof msg == "string" ? msg : JSON.stringify(msg);
    logList.value = logList.value + msg + "\r\n";
    logList.scrollTop = logList.scrollHeight;
};


//to make sure the cc.log, cc.warn, cc.error and cc.assert would not throw error before init by debugger mode.
if(console.log){
    cc.log = console.log.bind(console);
    cc.warn = console.warn.bind(console);
    cc.error = console.error.bind(console);
    cc.assert = console.assert.bind(console);
}else{
    cc.log = cc.warn = cc.error = cc.assert = function(){};
}
/**
 * Init Debug setting.
 * @function
 */
cc._initDebugSetting = function (mode) {
    var ccGame = cc.game;

    //log
    if(mode == ccGame.DEBUG_MODE_INFO && console.log) {
    }else if((mode == ccGame.DEBUG_MODE_INFO && !console.log)
        || mode == ccGame.DEBUG_MODE_INFO_FOR_WEB_PAGE){
        cc.log = cc._logToWebPage.bind(cc);
    }else cc.log = function(){}

    //warn
    if(!mode || mode == ccGame.DEBUG_MODE_NONE
        || mode == ccGame.DEBUG_MODE_ERROR
        || mode == ccGame.DEBUG_MODE_ERROR_FOR_WEB_PAGE) cc.warn = function(){};
    else if(mode == ccGame.DEBUG_MODE_INFO_FOR_WEB_PAGE
        || mode == ccGame.DEBUG_MODE_WARN_FOR_WEB_PAGE
        || !console.warn) {
        cc.warn = cc._logToWebPage.bind(cc);
    }

    //error and assert
    if(!mode || mode == ccGame.DEBUG_MODE_NONE) {
        cc.error = function(){};
        cc.assert = function(){};
    }
    else if(mode == ccGame.DEBUG_MODE_INFO_FOR_WEB_PAGE
        || mode == ccGame.DEBUG_MODE_WARN_FOR_WEB_PAGE
        || mode == ccGame.DEBUG_MODE_ERROR_FOR_WEB_PAGE
        || !console.error){
        cc.error = cc._logToWebPage.bind(cc);
        cc.assert = function(cond, msg){
            if(!cond && msg) cc._logToWebPage(msg);
        }
    }
};
//+++++++++++++++++++++++++something about log end+++++++++++++++++++++++++++++

/**
 * create a webgl context
 * @param {HTMLCanvasElement} canvas
 * @param {Object} opt_attribs
 * @return {WebGLRenderingContext}
 */
cc.create3DContext = function (canvas, opt_attribs) {
    var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    var context = null;
    for (var ii = 0; ii < names.length; ++ii) {
        try {
            context = canvas.getContext(names[ii], opt_attribs);
        } catch (e) {
        }
        if (context) {
            break;
        }
    }
    return context;
};
//+++++++++++++++++++++++++something about sys begin+++++++++++++++++++++++++++++
cc._initSys = function(config, CONFIG_KEY){
    /**
     * Canvas of render type
     * @constant
     * @type Number
     */
    cc._RENDER_TYPE_CANVAS = 0;

    /**
     * WebGL of render type
     * @constant
     * @type Number
     */
    cc._RENDER_TYPE_WEBGL = 1;

    var sys = cc.sys = {};

    /**
     * English language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_ENGLISH = "en";

    /**
     * Chinese language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_CHINESE = "zh";

    /**
     * French language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_FRENCH = "fr";

    /**
     * Italian language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_ITALIAN = "it";

    /**
     * German language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_GERMAN = "de";

    /**
     * Spanish language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_SPANISH = "es";

    /**
     * Russian language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_RUSSIAN = "ru";

    /**
     * Korean language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_KOREAN = "ko";

    /**
     * Japanese language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_JAPANESE = "ja";

    /**
     * Hungarian language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_HUNGARIAN = "hu";

    /**
     * Portuguese language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_PORTUGUESE = "pt";

    /**
     * Arabic language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_ARABIC = "ar";

    /**
     * Norwegian language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_NORWEGIAN = "no";

    /**
     * Polish language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_POLISH = "pl";

    /**
     * @constant
     * @type {string}
     */
    sys.OS_WINDOWS = "Windows";
    /**
     * @constant
     * @type {string}
     */
    sys.OS_IOS = "iOS";
    /**
     * @constant
     * @type {string}
     */
    sys.OS_OSX = "OS X";
    /**
     * @constant
     * @type {string}
     */
    sys.OS_UNIX = "UNIX";
    /**
     * @constant
     * @type {string}
     */
    sys.OS_LINUX = "Linux";
    /**
     * @constant
     * @type {string}
     */
    sys.OS_ANDROID = "Android";
    sys.OS_UNKNOWN = "Unknown";

    sys.BROWSER_TYPE_WECHAT = "wechat";
    sys.BROWSER_TYPE_ANDROID = "androidbrowser";
    sys.BROWSER_TYPE_IE = "ie";
    sys.BROWSER_TYPE_QQ = "qqbrowser";
    sys.BROWSER_TYPE_MOBILE_QQ = "mqqbrowser";
    sys.BROWSER_TYPE_UC = "ucbrowser";
    sys.BROWSER_TYPE_360 = "360browser";
    sys.BROWSER_TYPE_BAIDU_APP = "baiduboxapp";
    sys.BROWSER_TYPE_BAIDU = "baidubrowser";
    sys.BROWSER_TYPE_MAXTHON = "maxthon";
    sys.BROWSER_TYPE_OPERA = "opera";
    sys.BROWSER_TYPE_MIUI = "miuibrowser";
    sys.BROWSER_TYPE_FIREFOX = "firefox";
    sys.BROWSER_TYPE_SAFARI = "safari";
    sys.BROWSER_TYPE_CHROME = "chrome";
    sys.BROWSER_TYPE_UNKNOWN = "unknown";

    /**
     * Is native ? This is set to be true in jsb auto.
     * @constant
     * @type Boolean
     */
    sys.isNative = false;

    /**
     * WhiteList of browser for WebGL.
     * @constant
     * @type Array
     */
    var webglWhiteList = [sys.BROWSER_TYPE_BAIDU, sys.BROWSER_TYPE_OPERA, sys.BROWSER_TYPE_FIREFOX, sys.BROWSER_TYPE_CHROME, sys.BROWSER_TYPE_SAFARI];
    var multipleAudioWhiteList = [
        sys.BROWSER_TYPE_BAIDU, sys.BROWSER_TYPE_OPERA, sys.BROWSER_TYPE_FIREFOX, sys.BROWSER_TYPE_CHROME,
        sys.BROWSER_TYPE_SAFARI, sys.BROWSER_TYPE_UC, sys.BROWSER_TYPE_QQ, sys.BROWSER_TYPE_MOBILE_QQ, sys.BROWSER_TYPE_IE
    ];

    var win = window, nav = win.navigator, doc = document, docEle = doc.documentElement;
    var ua = nav.userAgent.toLowerCase();

    sys.isMobile = ua.indexOf('mobile') != -1 || ua.indexOf('android') != -1;

    var currLanguage = nav.language;
    currLanguage = currLanguage ? currLanguage : nav.browserLanguage;
    currLanguage = currLanguage ? currLanguage.split("-")[0] : sys.LANGUAGE_ENGLISH;
    sys.language = currLanguage;

    /** The type of browser */

    var browserType = sys.BROWSER_TYPE_UNKNOWN;
    var browserTypes = ua.match(/micromessenger|qqbrowser|mqqbrowser|ucbrowser|360browser|baiduboxapp|baidubrowser|maxthon|trident|opera|miuibrowser|firefox/i)
        || ua.match(/chrome|safari/i);
    if (browserTypes && browserTypes.length > 0) {
        browserType = browserTypes[0].toLowerCase();
        if (browserType == 'micromessenger') {
            browserType = sys.BROWSER_TYPE_WECHAT;
        }else if( browserType === "safari" && (ua.match(/android.*applewebkit/)))
            browserType = sys.BROWSER_TYPE_ANDROID;
        else if(browserType == "trident") browserType = sys.BROWSER_TYPE_IE;
    }
    sys.browserType = browserType;

    sys._supportMultipleAudio = multipleAudioWhiteList.indexOf(sys.browserType) > -1;

    //++++++++++++++++++something about cc._renderTYpe and cc._supportRender begin++++++++++++++++++++++++++++
    var userRenderMode = parseInt(config[CONFIG_KEY.renderMode]);
    var renderType = cc._RENDER_TYPE_WEBGL;
    var tempCanvas = document.createElement("Canvas");
    cc._supportRender = true;
    var notInWhiteList = webglWhiteList.indexOf(sys.browserType) == -1;
    if(userRenderMode === 1 || (userRenderMode === 0 && (sys.isMobile || notInWhiteList))){
        renderType = cc._RENDER_TYPE_CANVAS;
    }


    if(renderType == cc._RENDER_TYPE_WEBGL){
        if(!win.WebGLRenderingContext
            || !cc.create3DContext(tempCanvas, {'stencil': true, 'preserveDrawingBuffer': true })){
            if(userRenderMode == 0) renderType = cc._RENDER_TYPE_CANVAS;
            else cc._supportRender = false;
        }
    }

    if(renderType == cc._RENDER_TYPE_CANVAS){
        try {
            tempCanvas.getContext("2d");
        } catch (e) {
            cc._supportRender = false;
        }
    }
    cc._renderType = renderType;
    //++++++++++++++++++something about cc._renderTYpe and cc._supportRender end++++++++++++++++++++++++++++++


    // check if browser supports Web Audio
    // check Web Audio's context
    try {
        sys._supportWebAudio = !!(new (win.AudioContext || win.webkitAudioContext || win.mozAudioContext)());
    } catch (e) {
        sys._supportWebAudio = false;
    }

    /** LocalStorage is a local storage component.
     */
    try{
        var localStorage = sys.localStorage = win.localStorage;
        localStorage.setItem("storage", "");
        localStorage.removeItem("storage");
        localStorage = null;
    }catch(e){
        if( e.name === "SECURITY_ERR" || e.name === "QuotaExceededError" ) {
            cc.warn("Warning: localStorage isn't enabled. Please confirm browser cookie or privacy option");
        }
        sys.localStorage = function(){};
    }


    var capabilities = sys.capabilities = {"canvas":true};
    if(cc._renderType == cc._RENDER_TYPE_WEBGL)
        capabilities["opengl"] = true;
    if( docEle['ontouchstart'] !== undefined || nav.msPointerEnabled)
        capabilities["touches"] = true;
    else if( docEle['onmouseup'] !== undefined )
        capabilities["mouse"] = true;
    if( docEle['onkeyup'] !== undefined )
        capabilities["keyboard"] = true;
    if(win.DeviceMotionEvent || win.DeviceOrientationEvent)
        capabilities["accelerometer"] = true;

    /** Get the os of system */
    var iOS = ( ua.match(/(iPad|iPhone|iPod)/i) ? true : false );
    var isAndroid = ua.match(/android/i) || nav.platform.match(/android/i) ? true : false;
    var osName = sys.OS_UNKNOWN;
    if (nav.appVersion.indexOf("Win")!=-1) osName=sys.OS_WINDOWS;
    else if( iOS ) osName = sys.OS_IOS;
    else if (nav.appVersion.indexOf("Mac")!=-1) osName=sys.OS_OSX;
    else if (nav.appVersion.indexOf("X11")!=-1) osName=sys.OS_UNIX;
    else if (nav.appVersion.indexOf("Linux")!=-1) osName=sys.OS_LINUX;
    else if( isAndroid ) osName = sys.OS_ANDROID;
    sys.os = osName;

    // Forces the garbage collector
    sys.garbageCollect = function() {
        // N/A in cocos2d-html5
    };

    // Dumps rooted objects
    sys.dumpRoot = function() {
        // N/A in cocos2d-html5
    };

    // restarts the JS VM
    sys.restartVM = function() {
        // N/A in cocos2d-html5
    };

    sys.dump = function(){
        var self = this;
        var str = "";
        str += "isMobile : " + self.isMobile + "\r\n";
        str += "language : " + self.language + "\r\n";
        str += "browserType : " + self.browserType + "\r\n";
        str += "capabilities : " + JSON.stringify(self.capabilities) + "\r\n";
        str += "os : " + self.os + "\r\n";
        cc.log(str);
    }
};

//+++++++++++++++++++++++++something about sys end+++++++++++++++++++++++++++++

//+++++++++++++++++++++++++something about CCGame begin+++++++++++++++++++++++++++

/**
 * Device oriented vertically, home button on the bottom
 * @constant
 * @type Number
 */
cc.ORIENTATION_PORTRAIT = 0;

/**
 * Device oriented vertically, home button on the top
 * @constant
 * @type Number
 */
cc.ORIENTATION_PORTRAIT_UPSIDE_DOWN = 1;

/**
 * Device oriented horizontally, home button on the right
 * @constant
 * @type Number
 */
cc.ORIENTATION_LANDSCAPE_LEFT = 2;

/**
 * Device oriented horizontally, home button on the left
 * @constant
 * @type Number
 */
cc.ORIENTATION_LANDSCAPE_RIGHT = 3;

/**
 * drawing primitive of game engine
 * @type cc.DrawingPrimitive
 */
cc._drawingUtil = null;

/**
 * main Canvas 2D/3D Context of game engine
 * @type CanvasRenderingContext2D|WebGLRenderingContext
 */
cc._renderContext = null;

/**
 * main Canvas of game engine
 * @type HTMLCanvasElement
 */
cc._canvas = null;

/**
 * This Div element contain all game canvas
 * @type HTMLDivElement
 */
cc._gameDiv = null;

cc._rendererInitialized = false;
/**
 * <p>
 *   setup game main canvas,renderContext,gameDiv and drawingUtil with argument  <br/>
 *   <br/>
 *   can receive follow type of arguemnt: <br/>
 *      - empty: create a canvas append to document's body, and setup other option    <br/>
 *      - string: search the element by document.getElementById(),    <br/>
 *          if this element is HTMLCanvasElement, set this element as main canvas of engine, and set it's ParentNode as cc._gameDiv.<br/>
 *          if this element is HTMLDivElement, set it's ParentNode to cc._gameDiv， and create a canvas as main canvas of engine.   <br/>
 * </p>
 * @function
 * @example
 * //setup with null
 * cc._setup();
 *
 * // setup with HTMLCanvasElement, gameCanvas is Canvas element
 * // declare like this: <canvas id="gameCanvas" width="800" height="450"></canvas>
 * cc._setup("gameCanvas");
 *
 * //setup with HTMLDivElement, gameDiv is Div element
 * // declare like this: <div id="Cocos2dGameContainer" width="800" height="450"></div>
 * cc._setup("Cocos2dGameContainer");
 */
cc._setup = function (el, width, height) {
    var win = window;
    win.requestAnimFrame = win.requestAnimationFrame ||
        win.webkitRequestAnimationFrame ||
        win.mozRequestAnimationFrame ||
        win.oRequestAnimationFrame ||
        win.msRequestAnimationFrame;

    var element = cc.$(el) || cc.$('#' + el);
    var localCanvas, localContainer, localConStyle;
    if (element.tagName == "CANVAS") {
        width = width || element.width;
        height = height || element.height;

        //it is already a canvas, we wrap it around with a div
        localContainer = cc.container = cc.$new("DIV");
        localCanvas = cc._canvas = element;
        localCanvas.parentNode.insertBefore(localContainer, localCanvas);
        localCanvas.appendTo(localContainer);
        localContainer.setAttribute('id', 'Cocos2dGameContainer');
    } else {//we must make a new canvas and place into this element
        if (element.tagName != "DIV") {
            cc.log("Warning: target element is not a DIV or CANVAS");
        }
        width = width || element.clientWidth;
        height = height || element.clientHeight;
        localContainer = cc.container = element;
        localCanvas = cc._canvas = cc.$new("CANVAS");
        element.appendChild(localCanvas);
    }

    localCanvas.addClass("gameCanvas");
    localCanvas.setAttribute("width", width || 480);
    localCanvas.setAttribute("height", height || 320);
    localConStyle = localContainer.style;
    localConStyle.width = (width || 480) + "px";
    localConStyle.height = (height || 320) + "px";
    localConStyle.margin = "0 auto";

    localConStyle.position = 'relative';
    localConStyle.overflow = 'hidden';
    localContainer.top = '100%';

    if (cc._renderType == cc._RENDER_TYPE_WEBGL)
        cc._renderContext = cc.webglContext = cc.create3DContext(localCanvas,{
            'stencil': true,
            'preserveDrawingBuffer': true,
            'antialias': !cc.sys.isMobile,
            'alpha': false});
    if(cc._renderContext){
        win.gl = cc._renderContext; // global variable declared in CCMacro.js
        cc._drawingUtil = new cc.DrawingPrimitiveWebGL(cc._renderContext);
        cc._rendererInitialized = true;
        cc.textureCache._initializingRenderer();
        cc.shaderCache._init();
    } else {
        cc._renderContext = localCanvas.getContext("2d");
        cc._mainRenderContextBackup = cc._renderContext;
        cc._renderContext.translate(0, localCanvas.height);
        cc._drawingUtil = cc.DrawingPrimitiveCanvas ? new cc.DrawingPrimitiveCanvas(cc._renderContext) : null;
    }

    cc._gameDiv = localContainer;

    cc.log(cc.ENGINE_VERSION);

    cc._setContextMenuEnable(false);

    if(cc.sys.isMobile){
        var fontStyle = document.createElement("style");
        fontStyle.type = "text/css";
        document.body.appendChild(fontStyle);

        fontStyle.textContent = "body,canvas,div{ -moz-user-select: none;-webkit-user-select: none;-ms-user-select: none;-khtml-user-select: none;"
            +"-webkit-tap-highlight-color:rgba(0,0,0,0);}";
    }

	// Init singletons

	// View
	cc.view = cc.EGLView._getInstance();
	// register system events
	cc.inputManager.registerSystemEvent(cc._canvas);

	// Director
	cc.director = cc.Director._getInstance();
	cc.director.setOpenGLView(cc.view);
    cc.winSize = cc.director.getWinSize();

	// Parsers
	cc.saxParser = new cc.SAXParser();
	cc.plistParser = new cc.PlistParser();
};


cc._isContextMenuEnable = false;
/**
 * enable/disable contextMenu for Canvas
 * @param {Boolean} enabled
 */
cc._setContextMenuEnable = function (enabled) {
    cc._isContextMenuEnable = enabled;
    cc._canvas.oncontextmenu = function () {
        if(!cc._isContextMenuEnable) return false;
    };
};

/**
 * An object to boot the game.
 */
cc.game = {
    DEBUG_MODE_NONE : 0,
    DEBUG_MODE_INFO : 1,
    DEBUG_MODE_WARN : 2,
    DEBUG_MODE_ERROR : 3,
    DEBUG_MODE_INFO_FOR_WEB_PAGE : 4,
    DEBUG_MODE_WARN_FOR_WEB_PAGE : 5,
    DEBUG_MODE_ERROR_FOR_WEB_PAGE : 6,

    EVENT_HIDE: "game_on_hide",
    EVENT_SHOW: "game_on_show",
    _eventHide: null,
    _eventShow: null,
    _onBeforeStartArr : [],

    /**
     * Key of config
     * @constant
     * @type Object
     */
    CONFIG_KEY : {
        engineDir : "engineDir",
        dependencies : "dependencies",
        debugMode : "debugMode",
        showFPS : "showFPS",
        frameRate : "frameRate",
        id : "id",
        renderMode : "renderMode",
        jsList : "jsList",
        classReleaseMode : "classReleaseMode"
    },

    _prepareCalled : false,//whether the prepare function has been called
    _prepared : false,//whether the engine has prepared
    _paused : true,//whether the game is paused

    _intervalId : null,//interval target of main

    /**
     * Config of game
     * @type Object
     */
    config : null,

    /**
     * Callback when the scripts of engine have been load.
     * @type Function
     */
    onStart : null,

    /**
     * Callback when game exits.
     * @type Function
     */
    onStop : null,

    /**
     * Set frameRate of game.
     * @param frameRate
     */
    setFrameRate : function(frameRate){
        var self = this, config = self.config, CONFIG_KEY = self.CONFIG_KEY;
        config[CONFIG_KEY.frameRate] = frameRate;
        if(self._intervalId) clearInterval(self._intervalId);
        self._paused = true;
        self._runMainLoop();
    },
    /**
     * Run game.
     * @private
     */
    _runMainLoop : function(){
        var self = this, callback, config = self.config, CONFIG_KEY = self.CONFIG_KEY,
            win = window, frameRate = config[CONFIG_KEY.frameRate],
            director = cc.director;
        director.setDisplayStats(config[CONFIG_KEY.showFPS]);
        if (win.requestAnimFrame && frameRate == 60) {
            callback = function () {
                if(!self._paused){
                    director.mainLoop();
                    win.requestAnimFrame(callback);
                }
            };
            win.requestAnimFrame(callback);
        } else {
            callback = function () {
                director.mainLoop();
            };
            self._intervalId = setInterval(callback, 1000.0/frameRate);
        }
        self._paused = false;
    },


    /**
     * Run game.
     */
    run : function(){
        var self = this;
        if(!self._prepareCalled){
            self.prepare(function(){
                if(cc._supportRender) {
                    cc._setup(self.config[self.CONFIG_KEY.id]);
                    self._runMainLoop();
                    self._eventHide = self._eventHide || new cc.EventCustom(self.EVENT_HIDE);
                    self._eventHide.setUserData(self);
                    self._eventShow = self._eventShow || new cc.EventCustom(self.EVENT_SHOW);
                    self._eventShow.setUserData(self);
                    self.onStart();
                }
            });
        }else{
            if(cc._supportRender) {
                self._checkPrepare = setInterval(function(){
                    if(self._prepared){
                        cc._setup(self.config[self.CONFIG_KEY.id]);
                        self._runMainLoop();
                        self._eventHide = self._eventHide || new cc.EventCustom(self.EVENT_HIDE);
                        self._eventHide.setUserData(self);
                        self._eventShow = self._eventShow || new cc.EventCustom(self.EVENT_SHOW);
                        self._eventShow.setUserData(self);
                        self.onStart();
                        clearInterval(self._checkPrepare);
                    }
                }, 10);
            }
        }
    },
    /**
     * Init config.
     * @param cb
     * @returns {*}
     * @private
     */
    _initConfig : function(){
        var self = this, CONFIG_KEY = self.CONFIG_KEY;
        var _init = function(cfg){
            cfg[CONFIG_KEY.engineDir] = cfg[CONFIG_KEY.engineDir] || "libs/cocos2d-html5";
            cfg[CONFIG_KEY.debugMode] = cfg[CONFIG_KEY.debugMode] || 0;
            cfg[CONFIG_KEY.frameRate] = cfg[CONFIG_KEY.frameRate] || 60;
            cfg[CONFIG_KEY.renderMode] = cfg[CONFIG_KEY.renderMode] || 0;
            return cfg;
        };
        if(document["ccConfig"]){
            self.config = _init(document["ccConfig"]);
        }else{
            try{
                var txt = cc.loader._loadTxtSync("project.json");
                var data = JSON.parse(txt);
                self.config = _init(data || {});
            }catch(e){
                self.config = _init({});
            }
        }
        cc._initDebugSetting(self.config[CONFIG_KEY.debugMode]);
        cc._initSys(self.config, CONFIG_KEY);
    },

    //cache for js and module that has added into jsList to be loaded.
    _jsAddedCache : {},
    _getJsListOfModule : function(moduleMap, moduleName, dir){
        var jsAddedCache = this._jsAddedCache;
        if(jsAddedCache[moduleName]) return null;
        dir = dir || "";
        var jsList = [];
        var tempList = moduleMap[moduleName];
        if(!tempList) throw "can not find module [" + moduleName + "]";
        var ccPath = cc.path;
        for(var i = 0, li = tempList.length; i < li; i++){
            var item = tempList[i];
            if(jsAddedCache[item]) continue;
            var extname = ccPath.extname(item);
            if(!extname) {
                var arr = this._getJsListOfModule(moduleMap, item, dir);
                if(arr) jsList = jsList.concat(arr);
            }else if(extname.toLowerCase() == ".js") jsList.push(ccPath.join(dir, item));
            jsAddedCache[item] = 1;
        }
        return jsList;
    },
    /**
     * Prepare game.
     * @param cb
     */
    prepare : function(cb){
        var self = this;
        var config = self.config, CONFIG_KEY = self.CONFIG_KEY, engineDir = config[CONFIG_KEY.engineDir], loader = cc.loader;
        if(!cc._supportRender){
            cc.error("Can not support render!")
            return;
        }
        self._prepareCalled = true;

        var jsList = config[CONFIG_KEY.jsList] || [];
        if(cc.Class){//is single file
            //load user's jsList only
            loader.loadJsWithImg("", jsList, function(err){
                if(err) throw err;
                self._prepared = true;
                if(cb) cb();
            });
        }else{
            //load cc's jsList first
            var ccModulesPath = cc.path.join(engineDir, "moduleConfig.json");
            loader.loadJson(ccModulesPath, function(err, modulesJson){
                if(err) throw err;
                var modules = config["modules"] || [];
                var moduleMap = modulesJson["module"];
                var newJsList = [];
                if(cc._renderType == cc._RENDER_TYPE_WEBGL) modules.splice(0, 0, "shaders");
                else if(modules.indexOf("core") < 0) modules.splice(0, 0, "core");
                for(var i = 0, li = modules.length; i < li; i++){
                    var arr = self._getJsListOfModule(moduleMap, modules[i], engineDir);
                    if(arr) newJsList = newJsList.concat(arr);
                }
                newJsList = newJsList.concat(jsList);
                cc.loader.loadJsWithImg(newJsList, function(err){
                    if(err) throw err;
                    self._prepared = true;
                    if(cb) cb();
                });
            });
        }
    }
};
cc.game._initConfig();
//+++++++++++++++++++++++++something about CCGame end+++++++++++++++++++++++++++++
