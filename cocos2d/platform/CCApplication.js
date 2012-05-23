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


/// Device oriented vertically, home button on the bottom
cc.kOrientationPortrait = 0;
/// Device oriented vertically, home button on the top
cc.kOrientationPortraitUpsideDown = 1;
/// Device oriented horizontally, home button on the right
cc.kOrientationLandscapeLeft = 2;
/// Device oriented horizontally, home button on the left
cc.kOrientationLandscapeRight = 3;

cc.kCanvas = 0;
cc.kWebGL = 1;

cc.drawingUtil = null;
cc.renderContext = null;
cc.canvas = null;
cc.gameDiv = null;
cc.renderContextType = cc.kCanvas;
cc.originalCanvasSize = new cc.Size(0,0);

window.requestAnimFrame = (function () {
    return  window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame
})();

//setup game context
cc.setup = function () {
    //Browser Support Information

    //event register
    switch (arguments.length) {
        case 0:
            //add canvas at document
            var gameCanvas = document.createElement("Canvas");
            gameCanvas.setAttribute("id", "gameCanvas");
            gameCanvas.setAttribute("width", 480);
            gameCanvas.setAttribute("height", 320);
            document.body.appendChild(gameCanvas);
            cc.canvas = gameCanvas;
            cc.renderContext = cc.canvas.getContext("2d");
            cc.gameDiv = document.body;
            cc.renderContextType = cc.kCanvas;
            //document
            break;
        case 1:
            var cName = arguments[0];
            var getElement = null;
            if (typeof(cName) == "string") {
                getElement = document.getElementById(cName);
            } else {
                getElement = arguments[0];
            }

            if (getElement instanceof HTMLCanvasElement) {
                //HTMLCanvasElement
                cc.canvas = getElement;
                cc.gameDiv = getElement.parentNode;
                cc.renderContext = cc.canvas.getContext("2d");
                cc.renderContextType = cc.kCanvas;
            } else if (getElement instanceof HTMLDivElement) {
                //HTMLDivElement
                var gameCanvas = document.createElement("Canvas");
                gameCanvas.setAttribute("id", "gameCanvas");
                gameCanvas.setAttribute("width", getElement.width);
                gameCanvas.setAttribute("height", getElement.height);
                getElement.appendChild(gameCanvas);
                cc.canvas = gameCanvas;
                cc.renderContext = cc.canvas.getContext("2d");
                cc.gameDiv = getElement;
                cc.renderContextType = cc.kCanvas;
            }
            break;
        case 2:
            break;
        case 3:
            break;
    }

    if (cc.renderContextType == cc.kCanvas) {
        cc.renderContext.translate(0, cc.canvas.height);
        cc.drawingUtil = new cc.DrawingPrimitiveCanvas(cc.renderContext);
    }
    cc.originalCanvasSize = new cc.Size(cc.canvas.width,cc.canvas.height);

    //binding window size
    /*
     cc.canvas.addEventListener("resize", function () {
     if (!cc.s_bFirstRun) {
     cc.Director.sharedDirector().addRegionToDirtyRegion(new cc.Rect(0, 0, cc.canvas.width, cc.canvas.height));
     }
     }, true);
     */
};

cc.setupHTML= function(obj){
    var canvas = cc.canvas;
    canvas.style.position ="absolute";
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.zIndex = 0;
    var _container = cc.$new("div");
    _container.id = "Cocos2dGameContainer";
    _container.style.position = "relative";
    //_container.style.width = cc.canvas.width;
    //_container.style.height = cc.canvas.height;
    //_container.style.overflow = "hidden";//TODO make it hidden when finished debugging
    //this._container.style.backgroundColor="RGBA(100,100,200,0.5)";
    //_container.style.top = canvas.offsetTop+parseInt(canvas.style.borderTopWidth)+"px";
    //_container.style.left = canvas.offsetLeft+parseInt(canvas.style.borderLeftWidth)+"px";
    //_container.style.height = canvas.clientHeight+"px";
    //_container.style.width = canvas.clientWidth+"px";
    if(obj){
        _container.setAttribute("fheight", obj.getContentSize().height);
    }
    document.body.insertBefore(_container, canvas);
    _container.appendChild(canvas);
};

cc.Application = cc.Class.extend({
    ctor:function () {
        this._m_nAnimationInterval = 0;
        cc.Assert(!cc.sm_pSharedApplication, "CCApplication ctor");
        cc.sm_pSharedApplication = this;
    },

    /**
     @brief    Callback by CCDirector for limit FPS.
     @interval       The time, which expressed in second in second, between current frame and next.
     */
    setAnimationInterval:function (interval) {
        this._m_nAnimationInterval = interval;
    },

    /**
     @brief    Callback by CCDirector for change device orientation.
     @orientation    The defination of orientation which CCDirector want change to.
     @return         The actual orientation of the application.
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
     @brief    Get status bar rectangle in EGLView window.
     */
    statusBarFrame:function (rect) {
        if (rect) {
            // Windows doesn't have status bar.
            rect = cc.RectMake(0, 0, 0, 0);
        }

    },

    /**
     @brief    Run the message loop.
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
            setInterval(callback, this._m_nAnimationInterval * 1000);
        }

    },
    _m_nAnimationInterval:null

});

/**
 @brief    Get current applicaiton instance.
 @return Current application instance pointer.
 */
cc.Application.sharedApplication = function () {

    cc.Assert(cc.sm_pSharedApplication, "sharedApplication");
    return cc.sm_pSharedApplication;
};

/**
 @brief Get current language config
 @return Current language config
 */
cc.Application.getCurrentLanguage = function () {
    var ret = cc.kLanguageEnglish;

    // TODO, need to be fixed.
    /*
     var localeID = cc.GetUserDefaultLCID();
     var primaryLanguageID = localeID & 0xFF;

     switch (primaryLanguageID)
     {
     case LANG_CHINESE:
     ret = cc.kLanguageChinese;
     break;
     case LANG_FRENCH:
     ret = cc.kLanguageFrench;
     break;
     case LANG_ITALIAN:
     ret = cc.kLanguageItalian;
     break;
     case LANG_GERMAN:
     ret = cc.kLanguageGerman;
     break;
     case LANG_SPANISH:
     ret = cc.kLanguageSpanish;
     break;
     case LANG_RUSSIAN:
     ret = cc.kLanguageRussian;
     break;
     }
     */

    var currentLang = navigator.language;
    currentLang = currentLang.toLowerCase();
    switch (currentLang)
    {
        case "zh-cn":
            ret = cc.kLanguageChinese;
            break;
        case "fr":
            ret = cc.kLanguageFrench;
            break;
        case "it":
            ret = cc.kLanguageItalian;
            break;
        case "de":
            ret = cc.kLanguageGerman;
            break;
        case "es":
            ret = cc.kLanguageSpanish;
            break;
        case "ru":
            ret = cc.kLanguageRussian;
            break;
    }

    return ret;
};

cc.sm_pSharedApplication = null;