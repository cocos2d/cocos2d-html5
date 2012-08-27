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
 * main Canvas 2D Context of game engine
 * @type CanvasContext
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
    if (element.tagName == "CANVAS") {
        //it is already a canvas, we wrap it around with a div
        cc.container = cc.$new("DIV");
        cc.canvas = element;
        cc.canvas.parentNode.insertBefore(cc.container, cc.canvas);
        cc.canvas.appendTo(cc.container);
        cc.container.style.width = (width || cc.canvas.width || 480) + "px";
        cc.container.style.height = (height || cc.canvas.height || 320) + "px";
        cc.container.setAttribute('id', 'Cocos2dGameContainer');
    }
    else {//we must make a new canvas and place into this element
        if (element.tagName != "DIV") {
            cc.log("Warning: target element is not a DIV or CANVAS");
        }
        cc.canvas = cc.$new("CANVAS");
        cc.canvas.addClass("gameCanvas");
        cc.canvas.setAttribute("width", width || 480);
        cc.canvas.setAttribute("height", height || 320);
        cc.container = element;
    }
    cc.container.style.position = 'relative';
    cc.container.style.overflow = 'hidden';
    cc.container.top = '100%';
    cc.renderContext = cc.canvas.getContext("2d");
    cc.renderContextType = cc.CANVAS;
    if (cc.renderContextType == cc.CANVAS) {
        cc.renderContext.translate(0, cc.canvas.height);
        cc.drawingUtil = new cc.DrawingPrimitiveCanvas(cc.renderContext);
    }
    cc.originalCanvasSize = cc.size(cc.canvas.width, cc.canvas.height);

    cc.log(cc.ENGINE_VERSION);

    //binding window size
    /*
     cc.canvas.addEventListener("resize", function () {
     if (!cc.firstRun) {
     cc.Director.getInstance().addRegionToDirtyRegion(cc.rect(0, 0, cc.canvas.width, cc.canvas.height));
     }
     }, true);
     */
};

/**
 * Run main loop of game engine
 * @class
 * @extends cc.Class
 */
cc.Application = cc.Class.extend(/** @lends cc.Application# */{
    /**
     * Constructor
     */
    ctor:function () {
        this._animationInterval = 0;
        cc.Assert(!cc._sharedApplication, "CCApplication ctor");
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

    /**
     * Run the message loop.
     * @return {Number}
     */
    run:function () {
        // Initialize instance and cocos2d.
        if (!this.applicationDidFinishLaunching()) {
            return 0;
        }
        // TODO, need to be fixed.
        if (window.requestAnimFrame && this._animationInterval == 1/60) {
            var callback = function () {
                cc.Director.getInstance().mainLoop();
                window.requestAnimFrame(callback);
            };
            cc.log(window.requestAnimFrame);
            window.requestAnimFrame(callback);
        }
        else {
            var callback = function () {
                cc.Director.getInstance().mainLoop();
            };
            setInterval(callback, this._animationInterval * 1000);
        }

    },
    _animationInterval:null
});

/**
 * Get current applicaiton instance.
 * @return {cc.Application}  Current application instance pointer.
 */
cc.Application.sharedApplication = function () {

    cc.Assert(cc._sharedApplication, "sharedApplication");
    return cc._sharedApplication;
};

/**
 * Get current language config
 * @return {Number} Current language config
 */
cc.Application.getCurrentLanguage = function () {
    var ret = cc.LANGUAGE_ENGLISH;

    var currentLang = navigator.language;
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
    }

    return ret;
};

cc._sharedApplication = null;
