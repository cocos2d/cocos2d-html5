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
        var index = pathStr.indexOf("?");
        if(index > 0) pathStr = pathStr.substring(0, index);
        index = pathStr.lastIndexOf(".");
        if(index < 0) return null;
        return pathStr.substring(index, pathStr.length);
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

    resPath : "",//root path of resource
    audioPath : "",//root path of audio
    _register : {},//register of loaders
    cache : {},//cache for data loaded
    _langPathCache : {},//cache for lang path

    /**
     * Get XMLHttpRequest.
     * @returns {XMLHttpRequest}
     */
    getXMLHttpRequest : function () {
        return window.XMLHttpRequest ? new window.XMLHttpRequest() : new ActiveXObject("MSXML2.XMLHTTP");
    },


    //@MODE_BEGIN DEV

    _jsCache : {},//cache for js

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
    },

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
            if(!cb) return;
            cb(null, img);
        });
        img.addEventListener("error", function () {
            this.removeEventListener('error', arguments.callee, false);
            if(!cb) return;
            cb("error");
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
            url = langPathCache[url] = url.substring(0, url.length - extname.length) + "_" + cc.language.current + extname;
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
        return this.cache[url];
    },

    /**
     * Release the cache of resource by url.
     * @param url
     */
    release : function(url){
        delete this.cache[url];
    },

    /**
     * Resource cache of all resources.
     */
    releaseAll : function(){
        var locCache = this.cache;
        for (var key in locCache) {
            delete locCache[key];
        }
    },

    //@MODE_BEGIN NPM
    /**
     * path of res.js
     * @constant
     * @type string
     */
    RES_JS_PATH : "cfg/res.js",
    /**
     * path of jsRes.js
     * @constant
     * @type string
     */
    JS_RES_JS_PATH : "cfg/jsRes.js",
    /**
     * path of resCfg.js
     * @constant
     * @type string
     */
    RES_CFG_JS_PATH : "cfg/resCfg.js",

    /**
     * path of node_module
     * @constant
     * @type string
     */
    NODE_MODULE_PATH : "node_module",

    _resCache : {},//cache of res
    _jsCacheOfCfg : {},//cache of js
    _deps : [],//dependencies of cocos2d-html5
    _depsOf3rdParty : [],//dependencies of 3rd party

    /**
     * load for npm branch
     * @param cb
     */
    loadNpm : function(cb){
        var self = this, config = cc.game.config, tempArr = [self.RES_JS_PATH];
        self.loadJson(cc.game.PACKAGE_PATH, function(err, pkg){
            self._handleCfgAndPkg("", config, pkg, tempArr, function(err){
                if(err) return cb(err);
                self.loadJsWithImg("", tempArr, function(err1){
                    if(err1) return cb(err1);
                    var result = {jsArr : [], resArr : []}
                    var deps = self._deps, depsOf3rdParty = self._depsOf3rdParty;
                    for(var i = 0, li = deps.length; i < li; i++){
                        var r = cc.loader.getResCfg(deps[i]);
                        if(!r) continue;
                        result.jsArr = result.jsArr.concat(r.jsArr);
                        result.resArr = result.resArr.concat(r.resArr);
                    }
                    for(var i = 0, li = depsOf3rdParty.length; i < li; i++){
                        var r = cc.loader.getResCfg(depsOf3rdParty[i]);
                        if(!r) continue;
                        result.jsArr = result.jsArr.concat(r.jsArr);
                        result.resArr = result.resArr.concat(r.resArr);
                    }
                    var r = cc.loader.getResCfg(cc.projName);
                    if(r){
                        result.jsArr = result.jsArr.concat(r.jsArr);
                        result.resArr = result.resArr.concat(r.resArr);
                    }
                    self.loadJsWithImg("", result.jsArr, function(err2){
                        err2 ? cb(err2) : cb(null, result.resArr);
                    });
                });
            });
        });
    },

    /**
     * Handle config and package.
     * @param depPath
     * @param cfg
     * @param pkg
     * @param arr
     * @param cb
     * @private
     */
    _handleCfgAndPkg : function(depPath, cfg, pkg, arr, cb){
        var self = this, path = cc.path, depArr = [], is3rdPartyArr = [];
        var deps = cfg[cc.game.CONFIG_KEY.dependencies] || [],
            depsOf3rdParty = pkg[cc.game.PACKAGE_KEY.dependencies] || {};
        depsOf3rdParty = Object.keys(depsOf3rdParty);
        for(var i = 0, li = deps.length; i < li; i++){
            depArr.push(deps[i]);
            is3rdPartyArr.push(false);
        }
        for(var i = 0, li = depsOf3rdParty.length; i < li; i++){
            depArr.push(depsOf3rdParty[i]);
            is3rdPartyArr.push(true);
        }
        cc.async.map(depArr, function(item, index, cb1){
            self._loadDep(arr, item, is3rdPartyArr[index], cb1);
        }, function(err){
            if(err) return cb(err);
            arr.push(path.join(depPath, self.JS_RES_JS_PATH));
            arr.push(path.join(depPath, self.RES_CFG_JS_PATH));
            cb();
        });
    },

    /**
     * Load dependency.
     * @param arr
     * @param name
     * @param is3rdParty
     * @param cb
     * @private
     */
    _loadDep : function(arr, name, is3rdParty, cb){
        var self = this, path = cc.path, engineDir = cc.game.config[cc.game.CONFIG_KEY.engineDir],
            locDeps = self._deps, locDepsOf3rdParty = self._depsOf3rdParty;
        if(locDeps.indexOf(name) >= 0 || locDepsOf3rdParty.indexOf(name) >= 0) cb();//has loaded
        var depPath = path.join((is3rdParty ? self.NODE_MODULE_PATH : engineDir), name);
        cc.async.map([cc.game.CONFIG_PATH, cc.game.PACKAGE_PATH], function(item, index, cb1){
            self.loadJson(path.join(depPath, item), cb1);
        }, function(err, results){
            if(err) return cb(err);
            if(locDeps.indexOf(name) >= 0 || locDepsOf3rdParty.indexOf(name) >= 0) cb();//has loaded
            self._handleCfgAndPkg(depPath, results[0], results[1], arr, function(err){
                if(err) return cb(err);
                is3rdParty ? locDepsOf3rdParty.push(name) : locDeps.push(name);
                cb();
            });
        });
    },
    /**
     * Get config of res from resCfg by cfgName.
     * @param cfgName
     * @returns {*}
     */
    getResCfg : function(cfgName){
        var self = this, jsCacheOfCfg = self._jsCacheOfCfg, resCfg = cc.resCfg, resCache = self._resCache;
        if(!cfgName || jsCacheOfCfg[cfgName] >= 0) return null;
        var cfg = resCfg[cfgName];
        var extname = cc.path.extname(cfgName);
        var isJs = extname && extname.toLowerCase() == ".js";//is js ?

        cfg = cfg || {};

        var result = {jsArr:[], resArr:[]};
        var requireArr = cfg.require || [];
        for(var i = 0, li = requireArr.length; i < li; i++){//js
            if(!requireArr[i]) continue;
            var r = self.getResCfg(requireArr[i]);
            if(r){
                if(r.jsArr && r.jsArr.length > 0) result.jsArr = result.jsArr.concat(r.jsArr);
                if(r.resArr && r.resArr.length > 0) result.resArr = result.resArr.concat(r.resArr);
            }
        }
        var res = cfg.res || [];
        for(var i = 0, li = res.length; i < li; ++i){//res
            var resPath = res[i];
            if(!resPath) continue;
            var resPathTemp = typeof resPath == "string" ? resPath : resPath.name + "." + resPath.type.toLowerCase();
            if(resCache[resPathTemp]) continue;
            result.resArr.push(resPath);
            resCache[resPathTemp] = true;
        }
        if(isJs) {//cfgName is a path of js.
            var results = cfgName.match(/\[\%[\w_\d\-]+\%\]/);
            if(results && results.length > 0){
                var moduleName = results[0].substring(2, results[0].length - 2);
                var repStr = "";
                if(self._deps.indexOf(moduleName) >= 0) repStr = cc.path.join(cc.game.config[cc.game.CONFIG_KEY.engineDir], moduleName, "/");
                else if(self._depsOf3rdParty.indexOf(moduleName) >= 0) repStr = cc.path.join(self.NODE_MODULE_PATH, moduleName, "/");
                cfgName = cfgName.replace(/\[\%[\w_\d\-]+\%\]/, repStr);//replace module name with path
            }
            result.jsArr.push(cfgName);
        }
        jsCacheOfCfg[cfgName] = true;
        return result;
    },

    //@MODE_BEGIN TEST
    _is4Test : false,
    //@MODE_END TEST
    loadGameModule : function(moduleName, cb){
        var self = this, r = self.getResCfg(moduleName) || {jsArr:[], resArr:[]};
        //@MODE_BEGIN TEST
        if(self._is4Test){
            var rOfTest = self.getResCfg(cc.TEST_BASE) || {jsArr:[], resArr:[]};
            r.jsArr = rOfTest.jsArr.concat(r.jsArr);
            r.resArr = rOfTest.resArr.concat(r.resArr);
        }
        if(cc.game._baseRes4Npm) {
            r.resArr = cc.game._baseRes4Npm.concat(r.resArr);
            cc.game._baseRes4Npm = null;
        }
        //@MODE_END TEST
        self.loadJsWithImg("", r.jsArr, function(){
            this._isBaseLoaded = true;
            cb(r.resArr);
        });
    }
    //@MODE_END NPM

};
//+++++++++++++++++++++++++something about loader end+++++++++++++++++++++++++++++


//+++++++++++++++++++++++++something about window events begin+++++++++++++++++++++++++++
(function(){
    var win = window, hidden, visibilityChange;
    cc.winEvents = {
        hiddens : [],
        shows : []
    };
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
        for(var i = 0, funcs = cc.winEvents.hiddens, li = funcs.length; i < li; i++){
            var func = funcs[i];
            if(func) func();
        }
    };
    var onShow = function(){
        for(var i = 0, funcs = cc.winEvents.shows, li = funcs.length; i < li; i++){
            var func = funcs[i];
            if(func) func();
        }
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
})();
//+++++++++++++++++++++++++something about window events end+++++++++++++++++++++++++++++

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

//engine render type
/**
 * Canvas of render type
 * @constant
 * @type Number
 */
cc.CANVAS = 0;

/**
 * WebGL of render type
 * @constant
 * @type Number
 */
cc.WEBGL = 1;

/**
 * drawing primitive of game engine
 * @type cc.DrawingPrimitive
 */
cc.drawingUtil = null;

/**
 * main Canvas 2D/3D Context of game engine
 * @type CanvasRenderingContext2D|WebGLRenderingContext
 */
cc.renderContext = null;

/**
 * main Canvas of game engine
 * @type HTMLCanvasElement
 */
cc.canvas = null;

/**
 * This Div element contain all game canvas
 * @type HTMLDivElement
 */
cc.gameDiv = null;

/**
 * current render type of game engine
 * @type Number
 */
cc.renderContextType = cc.CANVAS;

cc.isAddedHiddenEvent = false;

cc._rendererInitialized = false;
/**
 * <p>
 *   setup game main canvas,renderContext,gameDiv and drawingUtil with argument  <br/>
 *   <br/>
 *   can receive follow type of arguemnt: <br/>
 *      - empty: create a canvas append to document's body, and setup other option    <br/>
 *      - string: search the element by document.getElementById(),    <br/>
 *          if this element is HTMLCanvasElement, set this element as main canvas of engine, and set it's ParentNode as cc.gameDiv.<br/>
 *          if this element is HTMLDivElement, set it's ParentNode to cc.gameDiv， and create a canvas as main canvas of engine.   <br/>
 * </p>
 * @function
 * @example
 * //setup with null
 * cc.setup();
 *
 * // setup with HTMLCanvasElement, gameCanvas is Canvas element
 * // declare like this: <canvas id="gameCanvas" width="800" height="450"></canvas>
 * cc.setup("gameCanvas");
 *
 * //setup with HTMLDivElement, gameDiv is Div element
 * // declare like this: <div id="Cocos2dGameContainer" width="800" height="450"></div>
 * cc.setup("Cocos2dGameContainer");
 */
cc.setup = function (el, width, height) {
    var win = window;
    win.requestAnimFrame = win.requestAnimationFrame ||
        win.webkitRequestAnimationFrame ||
        win.mozRequestAnimationFrame ||
        win.oRequestAnimationFrame ||
        win.msRequestAnimationFrame;

    win.console = win.console || {
        log : function(){},
        warn : function(){},
        error : function(){},
        assert : function(){}
    };

    var element = cc.$(el) || cc.$('#' + el);
    var localCanvas, localContainer, localConStyle;
    if (element.tagName == "CANVAS") {
        width = width || element.width;
        height = height || element.height;

        //it is already a canvas, we wrap it around with a div
        localContainer = cc.container = cc.$new("DIV");
        localCanvas = cc.canvas = element;
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
        localCanvas = cc.canvas = cc.$new("CANVAS");
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

    if(!cc._supportRender)
        return;

    if (cc.sys.supportWebGL)
        cc.renderContext = cc.webglContext = cc.create3DContext(localCanvas,{
            'stencil': true,
            'preserveDrawingBuffer': true,
            'antialias': !cc.sys.isMobile,
            'alpha': false});
    if(cc.renderContext){
        cc.renderContextType = cc.WEBGL;
        win.gl = cc.renderContext; // global variable declared in CCMacro.js
        cc.drawingUtil = new cc.DrawingPrimitiveWebGL(cc.renderContext);
        cc._rendererInitialized = true;
        cc.TextureCache.getInstance()._initializingRenderer();
    } else {
        cc.renderContext = localCanvas.getContext("2d");
        cc.mainRenderContextBackup = cc.renderContext;
        cc.renderContextType = cc.CANVAS;
        cc.renderContext.translate(0, localCanvas.height);
        cc.drawingUtil = cc.DrawingPrimitiveCanvas ? new cc.DrawingPrimitiveCanvas(cc.renderContext) : null;
    }

    cc.originalCanvasSize = cc.size(localCanvas.width, localCanvas.height);
    cc.gameDiv = localContainer;

    cc.log(cc.ENGINE_VERSION);
    cc.Configuration.getInstance();

    cc.setContextMenuEnable(false);

    if(cc.sys.isMobile){
        cc._addUserSelectStatus();
    }
};

cc._addUserSelectStatus = function(){
    var fontStyle = document.createElement("style");
    fontStyle.type = "text/css";
    document.body.appendChild(fontStyle);

    fontStyle.textContent = "body,canvas,div{ -moz-user-select: none;-webkit-user-select: none;-ms-user-select: none;-khtml-user-select: none;"
        +"-webkit-tap-highlight-color:rgba(0,0,0,0);}";
};

cc._isContextMenuEnable = false;
/**
 * enable/disable contextMenu for Canvas
 * @param {Boolean} enabled
 */
cc.setContextMenuEnable = function (enabled) {
    cc._isContextMenuEnable = enabled;
    cc.canvas.oncontextmenu = function () {
        if(!cc._isContextMenuEnable) return false;
    };
};

/**
 * An object to boot the game.
 */
cc.game = {
    _prepareCalled : false,//whether the prepare function has been called
    _prepared : false,//whether the engine has prepared
    _isContextMenuEnable : false,
    _paused : true,//whether the game is paused

    _baseRes4Npm : [],//cache to restore base resources for npm

    _intervalId : null,//interval target of main

    /**
     * Path of config.json
     * @constant
     * @type String
     */
    CONFIG_PATH : "project.json",
    /**
     * Default config
     * @constant
     * @type Object
     */
    DEFAULT_CONFIG : {
        engineDir : "libs/cocos2d-html5",
        engineDir4Npm : "../node_modules"
    },
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
        isNpm : "isNpm",
        jsList : "jsList",
        classReleaseMode : "classReleaseMode"
    },

    //@MODE_BEGIN NPM
    /**
     * Path of package.json
     * @constant
     * @type String
     */
    PACKAGE_PATH : "package.json",
    /**
     * Key of package.json
     * @constant
     * @type Object
     */
    PACKAGE_KEY : {
        dependencies : "dependencies"
    },
    //@MODE_BEGIN NPM

    /**
     * Config of game
     * @type Object
     */
    config : null,

    /**
     * Callback when the scripts of engine have been load.
     * @type Function
     */
    onEnter : null,

    /**
     * Callback when game exits.
     * @type Function
     */
    onExit : null,
    /**
     * Callback before game resumes.
     * @type Function
     */
    onBeforeResume : null,
    /**
     * Callback after game resumes.
     * @type Function
     */
    onAfterResume : null,
    /**
     * Callback before game pauses.
     * @type Function
     */
    onBeforePause : null,
    /**
     * Callback after game pauses.
     * @type Function
     */
    onAfterPause : null,

    /**
     * Resume game.
     */
    resume : function(){
        var self = this;
        if(self.onBeforeResume && self.onBeforeResume()) return;
        self._runMainLoop();
        if(self.onAfterResume) self.onAfterResume();
    },
    /**
     * Pause game.
     */
    pause : function(){
        var self = this;
        if(self.onBeforePause && self.onBeforePause()) return;
        if(self._intervalId) clearInterval(self._intervalId);
        self._paused = true;
        if(self.onAfterPause) self.onAfterPause();
    },
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
            director = cc.Director.getInstance();
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
                cc.setup(self.config["id"]);
                self._runMainLoop();
                self.onEnter(self._baseRes4Npm);
            });
        }else{
            self._checkPrepare = setInterval(function(){
                if(self._prepared){
                    cc.setup(self.config["id"]);
                    self._runMainLoop();
                    self.onEnter(self._baseRes4Npm);
                    clearInterval(self._checkPrepare);
                }
            }, 10);
        }
    },
    /**
     * Init config.
     * @param cb
     * @returns {*}
     * @private
     */
    _initConfig : function(cb){
        var self = this, CONFIG_KEY = self.CONFIG_KEY, DEFAULT_CONFIG = self.DEFAULT_CONFIG;
        var _init = function(cfg){
            cfg[CONFIG_KEY.engineDir] = cfg[CONFIG_KEY.engineDir] || (cfg[CONFIG_KEY.isNpm] ? DEFAULT_CONFIG.engineDir : DEFAULT_CONFIG.engineDir4Npm);
            cfg[CONFIG_KEY.debugMode] = cfg[CONFIG_KEY.debugMode] || 0;
            cfg[CONFIG_KEY.frameRate] = cfg[CONFIG_KEY.frameRate] || 60;
            cfg[CONFIG_KEY.renderMode] = cfg[CONFIG_KEY.renderMode] || 0;
            return cfg;
        };
        if(self.config) return cb(_init(self.config));
        cc.loader.loadJson(self.CONFIG_PATH, function(err, data){
            if(err) throw err;
            self.config = data;
            cb(_init(self.config));
        })
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
            jsAddedCache[item] = true;
        }
        return jsList;
    },
    /**
     * Prepare game.
     * @param cb
     */
    prepare : function(cb){
        var self = this;
        self._initConfig(function(config){
            var CONFIG_KEY = self.CONFIG_KEY, engineDir = config[CONFIG_KEY.engineDir], loader = cc.loader;
            self._prepareCalled = true;
            if(config[CONFIG_KEY.isNpm]){//for mpn
                loader.loadNpm(function(err, resArr){
                    if(err) throw err;
                    self._baseRes4Npm = resArr;
                    cb();
                });
            }else{
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
                        if(modules.indexOf("core") < 0) modules.splice(0, 0, "core");
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
        });
    }
};
//+++++++++++++++++++++++++something about CCGame end+++++++++++++++++++++++++++++
