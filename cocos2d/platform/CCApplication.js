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
cc.originalCanvasSize = new cc.Size(0, 0);

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
cc.setup = function () {
    //Browser Support Information
    //event register
    var gameCanvas;
    switch (arguments.length) {
        case 0:
            //add canvas at document
            gameCanvas = document.createElement("Canvas");
            gameCanvas.setAttribute("id", "gameCanvas");
            gameCanvas.setAttribute("width", 480);
            gameCanvas.setAttribute("height", 320);
            document.body.appendChild(gameCanvas);
            cc.canvas = gameCanvas;
            cc.renderContext = cc.canvas.getContext("2d");
            cc.gameDiv = document.body;
            cc.renderContextType = cc.CANVAS;
            //document
            break;
        case 1:
            var name = arguments[0];
            var getElement = null;
            if (typeof(name) == "string") {
                getElement = document.getElementById(name);
            } else {
                getElement = arguments[0];
            }

            if (getElement instanceof HTMLCanvasElement) {
                //HTMLCanvasElement
                cc.canvas = getElement;
                cc.gameDiv = getElement.parentNode;
                cc.renderContext = cc.canvas.getContext("2d");
                cc.renderContextType = cc.CANVAS;
            } else if (getElement instanceof HTMLDivElement) {
                //HTMLDivElement
                gameCanvas = document.createElement("Canvas");
                gameCanvas.setAttribute("id", "gameCanvas");
                gameCanvas.setAttribute("width", getElement.width);
                gameCanvas.setAttribute("height", getElement.height);
                getElement.appendChild(gameCanvas);
                cc.canvas = gameCanvas;
                cc.renderContext = cc.canvas.getContext("2d");
                cc.gameDiv = getElement;
                cc.renderContextType = cc.CANVAS;
            }
            break;
        case 2:
            break;
        case 3:
            break;
    }

    if (cc.renderContextType == cc.CANVAS) {
        cc.renderContext.translate(0, cc.canvas.height);
        cc.drawingUtil = new cc.DrawingPrimitiveCanvas(cc.renderContext);
    }
    cc.originalCanvasSize = new cc.Size(cc.canvas.width, cc.canvas.height);

    console.log(cc.ENGINE_VERSION);

    //binding window size
    /*
     cc.canvas.addEventListener("resize", function () {
     if (!cc.firstRun) {
     cc.Director.sharedDirector().addRegionToDirtyRegion(new cc.Rect(0, 0, cc.canvas.width, cc.canvas.height));
     }
     }, true);
     */
};

/**
 * setup css style of game div
 * @param {cc.Node} obj
 */
cc.setupHTML = function (obj) {
    var canvas = cc.canvas;

    canvas.style.zIndex = 0;
    var _container = cc.$new("div");
    _container.id = "Cocos2dGameContainer";
    _container.style.position = "relative";
    _container.style.display = "inline-block";

    if (obj) {
        _container.setAttribute("height", obj.getContentSize().height);
    }
    canvas.parentNode.insertBefore(_container, canvas);
    _container.appendChild(canvas);
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
     * Callback by cc.Director for change device orientation.
     * @param {Number} orientation The defination of orientation which cc.Director want change to.
     * @return {Number} The actual orientation of the application.
     * @deprecated Does not require in html5
     */
    setOrientation:function (orientation) {
        // swap width and height
        // TODO, need to be fixed.
        /* var pView = cc.Director.sharedDirector().getOpenGLView();
         if (pView)
         {
         return pView.setDeviceOrientation(orientation);
         }
         return cc.Director.sharedDirector().getDeviceOrientation(); */
        return orientation;

    },

    /**
     *  Get status bar rectangle in EGLView window.
     * @param {cc.Rect} rect
     * @deprecated
     */
    statusBarFrame:function (rect) {
        if (rect) {
            // Windows doesn't have status bar.
            rect = cc.RectMake(0, 0, 0, 0);
        }
    },

    /**
     * Run the message loop.
     * @return {Number}
     */
    run:function () {
        // Initialize instance and cocos2d.
        if (!this.initInstance() || !this.applicationDidFinishLaunching()) {
            return 0;
        }
        // TODO, need to be fixed.
        if (window.requestAnimFrame) {
            var callback = function () {
                cc.Director.sharedDirector().mainLoop();
                window.requestAnimFrame(callback);
            };
            cc.Log(window.requestAnimFrame);
            window.requestAnimFrame(callback);
        }
        else {
            var callback = function () {
                cc.Director.sharedDirector().mainLoop();
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