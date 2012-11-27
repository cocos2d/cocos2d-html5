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

/**
 * A class to pre-load resources before engine start game main loop.
 * @class
 * @extends cc.Class
 */
cc.Loader = cc.Class.extend(/**  @lends cc.Loader# */{
    resourceCount:0,
    loadedResourceCount:0,
    timer:0,

    /**
     *  Check the loading status
     */
    isLoadedComplete:function () {
        var loaderCache = cc.Loader.getInstance();
        if (loaderCache.loadedResourceCount == loaderCache.resourceCount) {
            if (loaderCache.onload) {
                loaderCache.timer = setTimeout(loaderCache.onload, 16);
            } else {
                cc.Assert(0, "cocos2d:no load callback defined");
            }
        } else {
            if (loaderCache.onloading) {
                loaderCache.timer = setTimeout(loaderCache.onloading, 16);
            }
            else {
                cc.LoaderScene.getInstance().draw();
            }
            loaderCache.timer = setTimeout(loaderCache.isLoadedComplete, 16);
        }
    },

    /**
     * Callback when loading resource error
     * @param {String} name
     * @example
     * //example
     * cc.Loader.getInstance().onResLoadingErr(name);
     */
    onResLoadingErr:function (name) {
        cc.log("cocos2d:Failed loading resource: " + name);
    },

    /**
     *Callback when a resource file loaded.
     * @example
     * //example
     * cc.Loader.getInstance().onResLoaded();
     */
    onResLoaded:function () {
        this.loadedResourceCount++;
    },

    /**
     *  For loading percentage
     *  You can use this method to create a custom loading screen.
     * @return {Number}
     * @example
     * //example
     * cc.log(cc.Loader.getInstance().getProgressBar() + "%");
     */
    getProgressBar:function () {
        var per = this.loadedResourceCount / this.resourceCount;
        per = 0 | (per * 100);
        return per;
    },

    /**
     * status when resources loading success
     * @example
     *  //example
     * cc.Loader.getInstance().onload = function () {
     *      cc.AppController.shareAppController().didFinishLaunchingWithOptions();
     * };
     */
    onload:undefined,

    /**
     *  status when res loading error
     * @example
     * //example
     * cc.Loader.getInstance().onerror = function () {
     *      //do something
     * };
     */
    onerror:undefined,

    /**
     *  status when res loading
     * @example
     * //example
     * cc.Loader.getInstance().onloading = function () {
     *       cc.LoaderScene.getInstance().draw();
     * };
     */
    onloading:undefined,

    _registerFaceFont:function (fontRes) {
        var srcArr = fontRes.srcArr;
        if (fontRes.srcArr && srcArr.length > 0) {
            var fontStyle = document.createElement("style");
            fontStyle.type = "text/css";
            document.body.appendChild(fontStyle);

            var fontStr = "@font-face { font-family:" + fontRes.fontName + "; src:";
            for (var i = 0; i < srcArr.length; i++) {
                fontStr += "url('" + encodeURI(srcArr[i].src) + "') format('" + srcArr[i].type + "')";
                fontStr += (i == (srcArr.length - 1)) ? ";" : ",";
            }
            fontStyle.textContent += fontStr + "};";
        }
        cc.Loader.getInstance().onResLoaded();
    },

    /**
     * Pre-load the resources before engine start game main loop.
     * There will be some error without pre-loading resources.
     * @param {object} res
     * @example
     * //example
     * var res = [
     *               {type:"image", src:"hello.png"},
     *               {type:"tmx", src:"hello.tmx"}
     *     ]
     * cc.Loader.getInstance().preload(res);
     */
    preload:function (res) {
        var sharedTextureCache = cc.TextureCache.getInstance();
        var sharedEngine = cc.AudioEngine.getInstance();
        var sharedParser = cc.SAXParser.getInstance();
        var sharedFileUtils = cc.FileUtils.getInstance();

        this.loadedResourceCount = 0;
        this.resourceCount = res.length;
        for (var i = 0; i < res.length; i++) {
            switch (res[i].type) {
                case "image":
                    sharedTextureCache.addImage(res[i].src);
                    break;
                case "bgm":
                    sharedEngine.preloadMusic(res[i].src);
                    break;
                case "effect":
                    sharedEngine.preloadEffect(res[i].src);
                    break;
                case "plist":
                case "tmx":
                case "fnt":
                    sharedParser.preloadPlist(res[i].src);
                    break;
                case "tga":
                    //cc.log("cocos2d:not implemented yet")
                    break;
                case "ccbi":
                case "binary":
                    sharedFileUtils.preloadBinaryFileData(res[i].src);
                    break;
                case "face-font":
                    this._registerFaceFont(res[i]);
                    break;
                default:
                    throw "cocos2d:unknow type : " + res[i].type;
                    break;
            }
        }
        this.isLoadedComplete();
    }
});

/**
 * Share Loader
 * @return {cc.Loader}
 */
cc.Loader.getInstance = function () {
    if (!this._instance) {
        this._instance = new cc.Loader();
    }
    return this._instance;
};
cc.Loader._instance = null;

/**
 * Default loading screen, you can customize the loading screen.
 * @class
 * @extends cc.Class
 */
cc.LoaderScene = cc.Class.extend(/**  @lends cc.LoaderScene# */{
    _logo:new Image(),

    /**
     * Constructor
     */
    ctor:function () {
        //this._logo.src = "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAABBAAD/4QMpaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjAtYzA2MCA2MS4xMzQ3NzcsIDIwMTAvMDIvMTItMTc6MzI6MDAgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkU2RTk0OEM5OERCNDExRTE5NEUyRkE3M0M3QkE1NTlEIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkU2RTk0OEM4OERCNDExRTE5NEUyRkE3M0M3QkE1NTlEIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzUgV2luZG93cyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuZGlkOjU1RUQ3MTcwQjQ4REUxMTE4RkUxODUzMUE4ODZGQ0I4IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjU1RUQ3MTcwQjQ4REUxMTE4RkUxODUzMUE4ODZGQ0I4Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+/+4ADkFkb2JlAGTAAAAAAf/bAIQABQQEBAQEBQQEBQcFBAUHCQYFBQYJ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";
        this._logo.src = "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAlAAD/4QMpaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjAtYzA2MCA2MS4xMzQ3NzcsIDIwMTAvMDIvMTItMTc6MzI6MDAgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjM4MDBEMDY2QTU1MjExRTFBQTAzQjEzMUNFNzMxRkQwIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjM4MDBEMDY1QTU1MjExRTFBQTAzQjEzMUNFNzMxRkQwIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzUgV2luZG93cyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkU2RTk0OEM4OERCNDExRTE5NEUyRkE3M0M3QkE1NTlEIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkU2RTk0OEM5OERCNDExRTE5NEUyRkE3M0M3QkE1NTlEIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+/+4ADkFkb2JlAGTAAAAAAf/bAIQADQkJCQoJDQoKDRMMCwwTFhENDREW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";

        this._logo.width = 160;
        this._logo.height = 200;
    },

    /**
     * Draw loading screen
     */
    draw:function () {
        var logoWidth = (cc.canvas.width - this._logo.width) / 2;
        var logoHeight = (cc.canvas.height - this._logo.height) / 2;
        cc.renderContext.clearRect(0, -cc.canvas.height, cc.canvas.width, cc.canvas.height);
        cc.renderContext.fillStyle = "#202020";
        cc.renderContext.fillRect(0, -cc.canvas.height, cc.canvas.width, cc.canvas.height);
        cc.drawingUtil.drawImage(this._logo, cc.p(logoWidth, logoHeight));
        cc.renderContext.fillStyle = "#b2b4b3";
        cc.renderContext.font = 'Bold 12px Verdana';
        cc.renderContext.textAlign = 'left';
        cc.drawingUtil.fillText("Loading " + cc.Loader.getInstance().getProgressBar() + "%", logoWidth + 30, logoHeight - 15);
    }
});

/**
 * Shared loader scene
 * @return {cc.LoaderScene}
 */
cc.LoaderScene.getInstance = function () {
    if (!this._instance) {
        this._instance = new cc.LoaderScene();
    }
    return this._instance;
};

cc.LoaderScene._instance = null;