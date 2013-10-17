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

cc.RESOLUTION_POLICY = {
    // The entire application is visible in the specified area without trying to preserve the original aspect ratio.
    // Distortion can occur, and the application may appear stretched or compressed.
    EXACT_FIT:0,
    // The entire application fills the specified area, without distortion but possibly with some cropping,
    // while maintaining the original aspect ratio of the application.
    NO_BORDER:1,
    // The entire application is visible in the specified area without distortion while maintaining the original
    // aspect ratio of the application. Borders can appear on two sides of the application.
    SHOW_ALL:2,
    // The application takes the height of the design resolution size and modifies the width of the internal
    // canvas so that it fits the aspect ratio of the device
    // no distortion will occur however you must make sure your application works on different
    // aspect ratios
    FIXED_HEIGHT:3,
    // The application takes the width of the design resolution size and modifies the height of the internal
    // canvas so that it fits the aspect ratio of the device
    // no distortion will occur however you must make sure your application works on different
    // aspect ratios
    FIXED_WIDTH:4,

    UNKNOWN:5
};

cc.Touches = [];
cc.TouchesIntergerDict = {};

/**
 * @class
 * @extends cc.Class
 */
cc.EGLView = cc.Class.extend(/** @lends cc.EGLView# */{
    _delegate:null,
    // real screen size
    _screenSize:null,
    // resolution size, it is the size appropriate for the app resources.
    _designResolutionSize:null,
    // the view port size
    _viewPortRect:null,
    // the view name
    _viewName:"",
    _scaleX:1,
    _originalScaleX:1,
    _scaleY:1,
    _originalScaleY:1,
    _indexBitsUsed:0,
    _maxTouches:5,
    _resolutionPolicy:cc.RESOLUTION_POLICY.UNKNOWN,
    _initialize:false,

    _captured:false,
    _wnd:null,
    _hDC:null,
    _hRC:null,
    _accelerometerKeyHook:null,
    _supportTouch:false,
    _contentTranslateLeftTop:null,

    _menu:null,
    _wndProc:null,
    _ele:null,
    _frameZoomFactor:1.0,
    __resizeWithBrowserSize:false,
    __isAdjustSizeToBrowser:false,

    ctor:function () {
        this._ele = (cc.container.parentNode === document.body) ? document.documentElement : cc.container.parentNode;
        this._viewName = "Cocos2dHTML5";

        this._designResolutionSize = cc.SizeZero();
        this._viewPortRect = cc.RectZero();
        this._delegate = cc.Director.getInstance().getTouchDispatcher();
        this._contentTranslateLeftTop = {left:0, top:0};
        this._screenSize = cc.size(cc.canvas.width, cc.canvas.height);

        this._hDC = cc.canvas;
        this._hRC = cc.renderContext;
    },

    /**
     * init
     */
    initialize:function () {
        this._scrollToBottom();
        this._initialize = true;
    },

    _resizeWithBrowserSize:function(enabled){
        var adjustSize;
        if(enabled){
           //enable
            if(!this.__resizeWithBrowserSize){
                this.__resizeWithBrowserSize = true;
                adjustSize = this._adjustSizeToBrowser.bind(this);
                window.addEventListener('resize', adjustSize, false);
            }
        }else{
           //disable
            if(this.__resizeWithBrowserSize){
                this.__resizeWithBrowserSize = true;
                adjustSize = this._adjustSizeToBrowser.bind(this);
                window.removeEventListener('resize', adjustSize, false);
            }
        }
    },

    _scrollToBottom:function(){
        if(cc.Browser.isMobile){
            cc.canvas.height = this._ele.clientHeight + 500;
            window.location.href="#bottom";
        }
    },

    _initScreenSize:function(){
        var locScreenSize = this._screenSize;
        locScreenSize.width = this._ele.clientWidth;
        locScreenSize.height = this._ele.clientHeight;
        if(navigator.userAgent.match(/iPhone/i)){
            locScreenSize.height +=(locScreenSize.width/320)*60;       //TODO
        }
    },

    _setupViewport:function(isWidth, wohValue){
        var viewportMeta, locHeadElement = document.head;
        var locMetaElements = locHeadElement.getElementsByTagName("meta");
        for(var i = 0; i < locMetaElements.length; i++){
            var selElement = locMetaElements[i];
            if(selElement.name.toLowerCase() == "viewport"){
                viewportMeta = selElement;
                break;
            }
        }
        if(!viewportMeta){
            viewportMeta = document.createElement("meta");
            viewportMeta.name = "viewport";
            locHeadElement.appendChild(viewportMeta);
        }

        if(isWidth)
            viewportMeta.content = "width=" + wohValue + ",user-scalable=no";
        else
            viewportMeta.content = "height=" + wohValue + ",user-scalable=no";
    },

    _adjustSizeToBrowser:function () {
        this.__isAdjustSizeToBrowser = true;

        this._scrollToBottom();
        this._initScreenSize();

        if (!cc.Browser.isMobile) {
            var locCanvasElement = cc.canvas;
            locCanvasElement.width = this._screenSize.width;
            locCanvasElement.height = this._screenSize.height;

            if (!("opengl" in sys.capabilities))
                cc.renderContext.translate(0, locCanvasElement.height);

            var parent = document.querySelector("#" + document['ccConfig']['tag']).parentNode;
            if (parent) {
                parent.style.width = locCanvasElement.width + "px";
                parent.style.height = locCanvasElement.height + "px";
            }
            var body = document.body;
            if (body) {
                body.style.padding = 0 + "px";
                body.style.border = 0 + "px";
                body.style.margin = 0 + "px";
            }
        }
        this.setDesignResolutionSize();
    },

    // hack
    _adjustSizeKeepCanvasSize:function () {
        if (!("opengl" in sys.capabilities))
            cc.renderContext.translate(0, cc.canvas.height);
        this._screenSize = cc.size(cc.canvas.width, cc.canvas.height);
        this.setDesignResolutionSize();
    },

    /**
     * Force destroying EGL view, subclass must implement this method.
     */
    end:function () {
    },

    /**
     * Get whether opengl render system is ready, subclass must implement this method.
     * @return {Boolean}
     */
    isOpenGLReady:function () {
        return (this._hDC != null && this._hRC != null);
    },

    /*
     * Set zoom factor for frame. This method is for debugging big resolution (e.g.new ipad) app on desktop.
     * @param {Number} zoomFactor
     */
    setFrameZoomFactor:function (zoomFactor) {
        this._frameZoomFactor = zoomFactor;
        this.centerWindow();
        cc.Director.getInstance().setProjection(cc.Director.getInstance().getProjection());
    },

    /**
     * Exchanges the front and back buffers, subclass must implement this method.
     */
    swapBuffers:function () {
    },

    /**
     * Open or close IME keyboard , subclass must implement this method.
     */
    setIMEKeyboardState:function (isOpen) {
        if (isOpen) {
            // [EAGLView sharedEGLView] becomeFirstResponder
        } else {
            //  [EAGLView sharedEGLView] resignFirstResponder
        }
    },

    /**
     * <p>
     *   The resolution translate on EGLView
     * </p>
     * @param {Number} offsetLeft
     * @param {Number} offsetTop
     */
    setContentTranslateLeftTop:function (offsetLeft, offsetTop) {
        this._contentTranslateLeftTop = {left:offsetLeft, top:offsetTop};
    },

    /**
     * <p>
     *   get the resolution translate on EGLView
     * </p>
     * @return {cc.Size|Object}
     */
    getContentTranslateLeftTop:function () {
        return this._contentTranslateLeftTop;
    },

    /**
     * Get the frame size of EGL view.
     * In general, it returns the screen size since the EGL view is a fullscreen view.
     * @return {cc.Size}
     */
    getFrameSize:function () {
        return cc.size(this._screenSize.width, this._screenSize.height);
    },

    /**
     * Set the frame size of EGL view.
     * @param {Number} width
     * @param {Number} height
     */
    setFrameSize:function (width, height) {
        this._designResolutionSize.width = this._screenSize.width = width;
        this._designResolutionSize.height = this._screenSize.height = height;
        this.centerWindow();
        cc.Director.getInstance().setProjection(cc.Director.getInstance().getProjection());
    },

    centerWindow:function () {
        //do nothing
    },

    setAccelerometerKeyHook:function (accelerometerKeyHook) {
        this._accelerometerKeyHook = accelerometerKeyHook;
    },

    /**
     * Get the visible area size of opengl viewport.
     * @return {cc.Size}
     */
    getVisibleSize:function () {
        if (this._resolutionPolicy === cc.RESOLUTION_POLICY.NO_BORDER) {
            return cc.size(this._screenSize.width / this._scaleX, this._screenSize.height / this._scaleY);
        } else {
            return cc.size(this._designResolutionSize.width, this._designResolutionSize.height);
        }
    },

    /**
     * Get the visible origin povar of opengl viewport.
     * @return {cc.Point}
     */
    getVisibleOrigin:function () {
        if (this._resolutionPolicy === cc.RESOLUTION_POLICY.NO_BORDER) {
            return cc.p((this._designResolutionSize.width - this._screenSize.width / this._scaleX) / 2,
                (this._designResolutionSize.height - this._screenSize.height / this._scaleY) / 2);
        } else {
            return cc.p(0, 0);
        }
    },

    canSetContentScaleFactor:function () {
        return true;
    },

    /**
     * Set the design resolution size.
     * @param {Number} width Design resolution width.
     * @param {Number} height Design resolution height.
     * @param {Number} resolutionPolicy The resolution policy desired, you may choose:
     * [1] ResolutionExactFit Fill screen by stretch-to-fit: if the design resolution ratio of width to height is different from the screen resolution ratio, your game view will be stretched.
     * [2] ResolutionNoBorder Full screen without black border: if the design resolution ratio of width to height is different from the screen resolution ratio, two areas of your game view will be cut.
     * [3] ResolutionShowAll  Full screen with black border: if the design resolution ratio of width to height is different from the screen resolution ratio, two black borders will be shown.
     */
    setDesignResolutionSize:function (width, height, resolutionPolicy) {
        cc.Assert(resolutionPolicy !== cc.RESOLUTION_POLICY.UNKNOWN, "should set resolutionPolicy");

        if (width == 0 || height == 0)
            return;

        if ((width != null) && (height != null))
            this._designResolutionSize = cc.size(width, height);

        if (resolutionPolicy != null)
            this._resolutionPolicy = resolutionPolicy;

        if (!this._initialize) {
            this.initialize();
        }

        var locScreenSize = this._screenSize, locDesignResolutionSize = this._designResolutionSize;
        var locResolutionPolicy = this._resolutionPolicy;

        this._scaleX = locScreenSize.width / locDesignResolutionSize.width;
        this._scaleY = locScreenSize.height / locDesignResolutionSize.height;

        if (locResolutionPolicy === cc.RESOLUTION_POLICY.NO_BORDER)
            this._scaleX = this._scaleY = Math.max(this._scaleX, this._scaleY);

        if (locResolutionPolicy === cc.RESOLUTION_POLICY.SHOW_ALL)
            this._scaleX = this._scaleY = Math.min(this._scaleX, this._scaleY);

        if (locResolutionPolicy === cc.RESOLUTION_POLICY.FIXED_HEIGHT) {
            this._scaleX = this._scaleY;
            locDesignResolutionSize.width = Math.ceil(locScreenSize.width / this._scaleX);
        }

        if (locResolutionPolicy === cc.RESOLUTION_POLICY.FIXED_WIDTH) {
            this._scaleY = this._scaleX;
            locDesignResolutionSize.height = Math.ceil(locScreenSize.height / this._scaleY);
        }

        // calculate the rect of viewport
        var viewPortW = locDesignResolutionSize.width * this._scaleX;
        var viewPortH = locDesignResolutionSize.height * this._scaleY;

        this._viewPortRect = cc.rect((locScreenSize.width - viewPortW) / 2, (locScreenSize.height - viewPortH) / 2, viewPortW, viewPortH);

        // reset director's member variables to fit visible rect
        var director = cc.Director.getInstance();
        director._winSizeInPoints = this.getDesignResolutionSize();

        if (cc.renderContextType === cc.CANVAS) {
            if (locResolutionPolicy === cc.RESOLUTION_POLICY.SHOW_ALL) {
                var locHeight = Math.abs(locScreenSize.height - viewPortH) / 2;
                cc.canvas.width = viewPortW;
                cc.canvas.height = viewPortH;
                cc.container.style.textAlign = "center";
                cc.container.style.verticalAlign = "middle";
                cc.renderContext.translate(0, viewPortH);
                this._ele.style.paddingTop = locHeight + "px";
                this._ele.style.paddingBottom = locHeight + "px";
                this._viewPortRect = cc.rect(0, 0, viewPortW, viewPortH);
            } else if ((locResolutionPolicy === cc.RESOLUTION_POLICY.NO_BORDER) || (locResolutionPolicy === cc.RESOLUTION_POLICY.FIXED_WIDTH)
                || (locResolutionPolicy === cc.RESOLUTION_POLICY.FIXED_HEIGHT)) {
                cc.canvas.width = cc.canvas.width;
                cc.canvas.height = cc.canvas.height;
                cc.renderContext.translate(this._viewPortRect.x, this._viewPortRect.y + this._viewPortRect.height);
            }
        } else {
            // reset director's member variables to fit visible rect
            director._createStatsLabel();
            director.setGLDefaultValues();
        }
        this._originalScaleX = this._scaleX;
        this._originalScaleY = this._scaleY;
        cc.DOM._resetEGLViewDiv();

        //set the viewport for mobile
        if (cc.Browser.isMobile && this.__isAdjustSizeToBrowser)
            this._calculateViewPortByPolicy();
    },

    _calculateViewPortByPolicy:function(){

    },

    _setScaleXYForRenderTexture:function(){
        //hack for RenderTexture on canvas mode when adapting multiple resolution resources
        var scaleFactor = cc.CONTENT_SCALE_FACTOR();
        this._scaleX = scaleFactor;
        this._scaleY = scaleFactor;
    },

    _resetScale:function(){
        this._scaleX = this._originalScaleX;
        this._scaleY = this._originalScaleY;
    },
    /**
     * Get design resolution size.
     * Default resolution size is the same as 'getFrameSize'.
     * @return {cc.Size}
     */
    getDesignResolutionSize:function () {
        return cc.size(this._designResolutionSize.width, this._designResolutionSize.height);
    },

    /**
     * set touch delegate
     * @param {cc.TouchDispatcher} delegate
     */
    setTouchDelegate:function (delegate) {
        this._delegate = delegate;
    },

    /**
     * Set opengl view port rectangle with points.
     * @param {Number} x
     * @param {Number} y
     * @param {Number} w width
     * @param {Number} h height
     */
    setViewPortInPoints:function (x, y, w, h) {
        var locFrameZoomFactor = this._frameZoomFactor, locScaleX = this._scaleX, locScaleY = this._scaleY;
        cc.renderContext.viewport((x * locScaleX * locFrameZoomFactor + this._viewPortRect.x * locFrameZoomFactor),
            (y * locScaleY * locFrameZoomFactor + this._viewPortRect.y * locFrameZoomFactor),
            (w * locScaleX * locFrameZoomFactor),
            (h * locScaleY * locFrameZoomFactor));
    },

    /**
     * Set Scissor rectangle with points.
     * @param {Number} x
     * @param {Number} y
     * @param {Number} w
     * @param {Number} h
     */
    setScissorInPoints:function (x, y, w, h) {
        var locFrameZoomFactor = this._frameZoomFactor, locScaleX = this._scaleX, locScaleY = this._scaleY;
        cc.renderContext.scissor((x * locScaleX * locFrameZoomFactor + this._viewPortRect.x * locFrameZoomFactor),
            (y * locScaleY * locFrameZoomFactor + this._viewPortRect.y * locFrameZoomFactor),
            (w * locScaleX * locFrameZoomFactor),
            (h * locScaleY * locFrameZoomFactor));
    },

    /**
     * Get whether GL_SCISSOR_TEST is enable
     */
    isScissorEnabled:function () {
        var gl = cc.renderContext;
        return gl.isEnabled(gl.SCISSOR_TEST);
    },

    /**
     * Get the current scissor rectangle
     * @return {cc.Rect}
     */
    getScissorRect:function () {
        var gl = cc.renderContext, scaleX = this._scaleX, scaleY = this._scaleY;
        var boxArr = gl.getParameter(gl.SCISSOR_BOX);
        return cc.rect((boxArr[0] - this._viewPortRect.x) / scaleX, (boxArr[1] - this._viewPortRect.y) / scaleY,
            boxArr[2] / scaleX, boxArr[3] / scaleY);
    },

    /**
     * @param {String} viewName
     */
    setViewName:function (viewName) {
        if (viewName != null && viewName.length > 0) {
            this._viewName = viewName;
        }
    },

    /**
     * get view name
     * @return {String}
     */
    getViewName:function () {
        return this._viewName;
    },

    /**
     * Get the opengl view port rectangle.
     */
    getViewPortRect:function () {
        return this._viewPortRect;
    },

    /**
     * Get scale factor of the horizontal direction.
     */
    getScaleX:function () {
        return this._scaleX;
    },

    /**
     * Get scale factor of the vertical direction.
     */
    getScaleY:function () {
        return this._scaleY;
    },

    /**
     * Get the real location in view
     */
    convertToLocationInView:function (tx, ty, relatedPos) {
        return {x:tx - relatedPos.left, y:relatedPos.top + relatedPos.height - ty};
    },

    /**
     * Touch events are handled by default; if you want to customize your handlers, please override these functions:
     * @param {Number} num
     * @param {Number} ids
     * @param {Number} xs
     * @param {Number} ys
     */
    handleTouchesBegin:function (num, ids, xs, ys) {
        var arr = [], locViewPortRect = this._viewPortRect, locScaleX = this._scaleX, locScaleY = this._scaleY;
        for (var i = 0; i < num; ++i) {
            var id = ids[i];
            var x = xs[i];
            var y = ys[i];

            var index = cc.TouchesIntergerDict[id];
            var unusedIndex = 0;

            // it is a new touch
            if (index == null) {
                unusedIndex = this._getUnUsedIndex();

                // The touches is more than MAX_TOUCHES ?
                if (unusedIndex == -1) {
                    cc.log("The touches is more than MAX_TOUCHES, nUnusedIndex = " + unusedIndex);
                    continue;
                }

                var touch = cc.Touches[unusedIndex] = new cc.Touch();
                touch.setTouchInfo(unusedIndex, (x - locViewPortRect.x) / locScaleX,
                    (y - locViewPortRect.y) / locScaleY);

                //console.log("x ="+x+" y = "+y, touch.getLocation());

                var interObj = 0 | unusedIndex;
                cc.TouchesIntergerDict[id] = interObj;
                arr.push(touch);
            }
        }

        if (arr.length == 0) {
            //cc.log("touchesBegan: count = 0");
            return;
        }
        this._delegate.touchesBegan(arr, null);
    },

    /**
     * @param {Number} num
     * @param {Number} ids
     * @param {Number} xs
     * @param {Number} ys
     */
    handleTouchesMove:function (num, ids, xs, ys) {
        var arr = [];
        var locScaleX = this._scaleX, locScaleY = this._scaleY, locViewPortX = this._viewPortRect.x, locViewPortY = this._viewPortRect.y;
        for (var i = 0; i < num; ++i) {
            var id = ids[i];
            var x = xs[i];
            var y = ys[i];

            var index = cc.TouchesIntergerDict[id];
            if (index == null) {
                //cc.log("if the index doesn't exist, it is an error");
                continue;
            }

            var touch = cc.Touches[index];
            if (touch) {
                touch.setTouchInfo(index, (x - locViewPortX) / locScaleX,
                    (y - locViewPortY) / locScaleY);
                arr.push(touch);
            }
            else {
                // It is error, should return.
                //cc.log("Moving touches with id: " + id + " error");
                return;
            }
        }

        if (arr.length == 0) {
            //cc.log("touchesMoved: count = 0");
            return;
        }

        this._delegate.touchesMoved(arr, null);
    },

    /**
     * @param {Number} num
     * @param {Number} ids
     * @param {Number} xs
     * @param {Number} ys
     */
    handleTouchesEnd:function (num, ids, xs, ys) {
        var arr = [];
        this.getSetOfTouchesEndOrCancel(arr, num, ids, xs, ys);
        this._delegate.touchesEnded(arr, null);
    },

    /**
     * @param {Number} num
     * @param {Number} ids
     * @param {Number} xs
     * @param {Number} ys
     */
    handleTouchesCancel:function (num, ids, xs, ys) {
        var arr = [];
        this.getSetOfTouchesEndOrCancel(arr, num, ids, xs, ys);
        this._delegate.touchesCancelled(arr, null);
    },

    /**
     * @param {Array} arr
     * @param {Number} num
     * @param {Number} ids
     * @param {Number} xs
     * @param {Number} ys
     */
    getSetOfTouchesEndOrCancel:function (arr, num, ids, xs, ys) {
        var locScaleX = this._scaleX, locScaleY = this._scaleY, locViewPortRect = this._viewPortRect;
        for (var i = 0; i < num; ++i) {
            var id = ids[i];
            var x = xs[i];
            var y = ys[i];

            var index = cc.TouchesIntergerDict[id];
            if (index == null) {
                //cc.log("if the index doesn't exist, it is an error");
                continue;
            }
            /* Add to the set to send to the director */
            var touch = cc.Touches[index];
            if (touch) {
                //cc.log("Ending touches with id: " + id + ", x=" + x + ", y=" + y);
                touch.setTouchInfo(index, (x - locViewPortRect.x) / locScaleX,
                    (y - locViewPortRect.y) / locScaleY);

                arr.push(touch);

                // release the object
                cc.Touches[index] = null;
                this._removeUsedIndexBit(index);

                delete cc.TouchesIntergerDict[id];
            } else {
                //cc.log("Ending touches with id: " + id + " error");
                return;
            }
        }

        /*if (arr.length == 0) {
         cc.log("touchesEnded or touchesCancel: count = 0");
         }*/
    },

    _getUnUsedIndex:function () {
        var i;
        var temp = this._indexBitsUsed;

        for (i = 0; i < this._maxTouches; i++) {
            if (!(temp & 0x00000001)) {
                this._indexBitsUsed |= (1 << i);
                return i;
            }

            temp >>= 1;
        }

        // all bits are used
        return -1;
    },

    _removeUsedIndexBit:function (index) {
        if (index < 0 || index >= this._maxTouches) {
            return;
        }

        var temp = 1 << index;
        temp = ~temp;
        this._indexBitsUsed &= temp;
    },

    // Pass the touches to the superview
    touchesBegan:function (touches, event) {
        var ids = [];
        var xs = [];
        var ys = [];

        var i = 0;
        var touch;
        for (var j = 0; j < touches.length; j++) {
        	touch = touches[j];
            ids[i] = touch.getId() || j;
            xs[i] = touch.getLocation().x;
            ys[i] = touch.getLocation().y;
            ++i;
        }
        this.handleTouchesBegin(i, ids, xs, ys);
    },

    touchesMoved:function (touches, event) {
        var ids = [];
        var xs = [];
        var ys = [];

        var i = 0;
        var touch;
        for (var j = 0; j < touches.length; j++) {
        	touch = touches[j];
            ids[i] = touch.getId() || j;
            xs[i] = touch.getLocation().x;
            ys[i] = touch.getLocation().y;
            ++i;
        }
        this.handleTouchesMove(i, ids, xs, ys);
    },

    touchesEnded:function (touches, event) {
        var ids = [];
        var xs = [];
        var ys = [];

        var i = 0;
        var touch;
        for (var j = 0; j < touches.length; j++) {
        	touch = touches[j];
            ids[i] = touch.getId() || j;
            xs[i] = touch.getLocation().x;
            ys[i] = touch.getLocation().y;
            ++i;
        }
        this.handleTouchesEnd(i, ids, xs, ys);
    },

    touchesCancelled:function (touches, event) {
        var ids = [];
        var xs = [];
        var ys = [];

        var i = 0;
        var touch;
        for (var j = 0; j < touches.length; j++) {
        	touch = touches[j];
            ids[i] = touch.getId() || j;
            xs[i] = touch.getLocation().x;
            ys[i] = touch.getLocation().y;
            ++i;
        }
        this.handleTouchesCancel(i, ids, xs, ys);
    }
});


cc.EGLView.getInstance = function () {
    if (!this._instance) {
        this._instance = new cc.EGLView();
    }
    return this._instance;
};
