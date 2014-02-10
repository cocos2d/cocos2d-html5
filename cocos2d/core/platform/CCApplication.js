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
 * Device type
 * @constant
 * @type {Object}
 */
cc.TARGET_PLATFORM = {
    WINDOWS:0,
    LINUX:1,
    MACOS:2,
    ANDROID:3,
    IPHONE:4,
    IPAD:5,
    BLACKBERRY:6,
    NACL:7,
    EMSCRIPTEN:8,
    MOBILE_BROWSER:100,
    PC_BROWSER:101
};

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

/**
 * save original size of canvas, use for resize canvas
 * @type cc.Size
 */
cc.originalCanvasSize = cc.size(0, 0);

window.requestAnimFrame = (function () {
    return  window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame
})();


if (!window.console) {
    window.console = {};
    window.console.log = function () {
    };
    window.console.assert = function () {
    };
}

cc.isAddedHiddenEvent = false;

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
    var element = cc.$(el) || cc.$('#' + el);
    var localCanvas, localContainer, localConStyle;
    if (element.tagName == "CANVAS") {
        width = width || element.width;
        height = height || element.height;

        //it is already a canvas, we wrap it around with a div
        localContainer = cc.container = cc.$new("DIV");
        localConStyle = localContainer.style;
        localCanvas = cc.canvas = element;
        localCanvas.parentNode.insertBefore(localContainer, localCanvas);
        localCanvas.appendTo(localContainer);
        localConStyle.width = (width || 480) + "px";
        localConStyle.height = (height || 320) + "px";
        localContainer.setAttribute('id', 'Cocos2dGameContainer');
        localConStyle.margin = "0 auto";
        localCanvas.setAttribute("width", width || 480);
        localCanvas.setAttribute("height", height || 320);
    } else {//we must make a new canvas and place into this element
        if (element.tagName != "DIV") {
            cc.log("Warning: target element is not a DIV or CANVAS");
        }
        width = width || element.clientWidth;
        height = height || element.clientHeight;

        localCanvas = cc.canvas = cc.$new("CANVAS");
        localCanvas.addClass("gameCanvas");
        localCanvas.setAttribute("width", width || 480);
        localCanvas.setAttribute("height", height || 320);
        localContainer = cc.container = element;
        localConStyle = localContainer.style;
        element.appendChild(localCanvas);
        localConStyle.width = (width || 480) + "px";
        localConStyle.height = (height || 320) + "px";
        localConStyle.margin = "0 auto";
    }
    localConStyle.position = 'relative';
    localConStyle.overflow = 'hidden';
    localContainer.top = '100%';

    if(cc.__renderDoesnotSupport)
        return;

    if (cc.Browser.supportWebGL)
        cc.renderContext = cc.webglContext = cc.create3DContext(localCanvas,{
            'stencil': true,
            'preserveDrawingBuffer': true,
            'antialias': !cc.Browser.isMobile,
            'alpha': false});
    if(cc.renderContext){
        cc.renderContextType = cc.WEBGL;
        window.gl = cc.renderContext; // global variable declared in CCMacro.js
        cc.drawingUtil = new cc.DrawingPrimitiveWebGL(cc.renderContext);
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

    if(cc.Browser.isMobile){
        cc._addUserSelectStatus();
    }

    var hidden, visibilityChange;
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

    function handleVisibilityChange() {
        if(!cc.AudioEngine) return;
        var audioEngine = cc.AudioEngine.getInstance();
        if (!document[hidden]){
            cc.Director.getInstance()._resetLastUpdate();
            audioEngine._resumePlaying();
        } else{
            audioEngine._pausePlaying();
        }
    }

    if (typeof document.addEventListener === "undefined" ||
        typeof hidden === "undefined") {
        cc.isAddedHiddenEvent = false;
        window.addEventListener("focus", function () {
            if(!cc.AudioEngine) return;
            cc.AudioEngine.getInstance()._resumePlaying();
        }, false);
        window.addEventListener("blur", function () {
            if(!cc.AudioEngine) return;
            cc.AudioEngine.getInstance()._pausePlaying();
        }, false);
    } else {
        cc.isAddedHiddenEvent = true;
        document.addEventListener(visibilityChange, handleVisibilityChange, false);
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
    if (!cc._isContextMenuEnable) {
        cc.canvas.oncontextmenu = function () {
            return false;
        };
    } else {
        cc.canvas.oncontextmenu = function () {
        };
    }
};

/**
 * Run main loop of game engine
 * @class
 * @extends cc.Class
 */
cc.Application = cc.Class.extend(/** @lends cc.Application# */{
    _animationInterval:null,
    /**
     * Constructor
     */
    ctor:function () {
        this._animationInterval = 0;
        if(cc._sharedApplication)
            throw "Application has been initialized";
        cc._sharedApplication = this;
    },

    /**
     * Callback by cc.Director for limit FPS.
     * @param {Number} interval The time, which expressed in second, between current frame and next.
     */
    setAnimationInterval:function (interval) {
        this._animationInterval = interval;
    },

    /**
     *  Get status bar rectangle in EGLView window.
     * @param {cc.Rect} rect
     * @deprecated
     */
    statusBarFrame:function (rect) {
        if (rect) {
            // Windows doesn't have status bar.
            rect = cc.rect(0, 0, 0, 0);
        }
    },

    getTargetPlatform:function(){
        return cc.Browser.isMobile ? cc.TARGET_PLATFORM.MOBILE_BROWSER : cc.TARGET_PLATFORM.PC_BROWSER;
    },

    /**
     * Run the message loop.
     * @return {Number}
     */
    run:function () {
        // Initialize instance and cocos2d.
        if (!this.applicationDidFinishLaunching())
            return 0;

        var callback, director = cc.Director.getInstance(), w = window;
        cc.director = director;
        if (w.requestAnimFrame && this._animationInterval == 1 / 60) {
            callback = function () {
                director.mainLoop();
                w.requestAnimFrame(callback);
            };
            //cc.log(window.requestAnimFrame);
            w.requestAnimFrame(callback);
        } else {
            callback = function () {
                director.mainLoop();
            };
            setInterval(callback, this._animationInterval * 1000);
        }
        return 0;
    }
});

/**
 * Get current application instance.
 * @return {cc.Application}  Current application instance pointer.
 */
cc.Application.getInstance = function () {
    return cc._sharedApplication;
};

/**
 * Get current language config
 * @return {Number} Current language config
 */
cc.Application.getCurrentLanguage = function () {
    var ret = cc.LANGUAGE_ENGLISH;

    var currentLang = navigator.language;
    if(!currentLang)
        currentLang = navigator.browserLanguage || navigator.userLanguage;
    if(!currentLang)
        return ret;

    currentLang = currentLang.toLowerCase();
    switch (currentLang) {
        case "zh-cn":
            ret = cc.LANGUAGE_CHINESE;
            break;
        case "fr":
            ret = cc.LANGUAGE_FRENCH;
            break;
        case "it":
            ret = cc.LANGUAGE_ITALIAN;
            break;
        case "de":
            ret = cc.LANGUAGE_GERMAN;
            break;
        case "es":
            ret = cc.LANGUAGE_SPANISH;
            break;
        case "ru":
            ret = cc.LANGUAGE_RUSSIAN;
            break;
        case "ko":
            ret = cc.LANGUAGE_KOREAN;
            break;
        case "ja":
            ret = cc.LANGUAGE_JAPANESE;
            break;
        case "hu":
            ret = cc.LANGUAGE_HUNGARIAN;
            break;
        case "pt":
            ret = cc.LANGUAGE_PORTUGUESE;
            break;
        case "ar":
            ret = cc.LANGUAGE_ARABIC;
            break;
        case "no":
            ret = cc.LANGUAGE_NORWEGIAN;
            break;
        case "pl":
            ret = cc.LANGUAGE_POLISH;
            break;
    }

    return ret;
};

cc._sharedApplication = null;
