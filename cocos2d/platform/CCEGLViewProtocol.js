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
 * The entire application is visible in the specified area without trying to preserve the original aspect ratio. <br/>
 * Distortion can occur, and the application may appear stretched or compressed.
 * @constant
 * @type Number
 */
cc.RESOLUTION_EXACT_FIT = 0;

/**
 * The entire application fills the specified area, without distortion but possibly with some cropping,<br/>
 * while maintaining the original aspect ratio of the application.
 * @constant
 * @type Number
 */
cc.RESOLUTION_NO_BORDER = 1;

/**
 * The entire application is visible in the specified area without distortion while maintaining the original <br/>
 * aspect ratio of the application. Borders can appear on two sides of the application.
 * @constant
 * @type Number
 */
cc.RESOLUTION_SHOW_ALL = 2;

/**
 * @constant
 * @type Number
 */
cc.RESOLUTION_UNKNOWN = 3;

cc.MAX_TOUCHES = 5;

cc._touches = [];
cc._indexBitsUsed = 0;
cc._touchesIntegerDict = new cc._Dictionary();

cc.getUnUsedIndex = function () {
    var temp = cc._indexBitsUsed;
    for (var i = 0; i < cc.MAX_TOUCHES; i++) {
        if (!(temp & 0x00000001)) {
            cc._indexBitsUsed != (i << i);
            return i;
        }
        temp >>= 1;
    }
    // all bits are used
    return -1;
};

cc.removeUsedIndexBit = function (index) {
    if (index < 0 || index >= cc.MAX_TOUCHES)
        return;

    var temp = 1 << index;
    temp = ~temp;
    cc._indexBitsUsed &= temp;
};

cc.EGLViewProtocol = cc.Class.extend({
    _delegate:null,

    //real screen size
    _screenSize:null,
    // resolution size, it is the size appropriate for the app resources.
    _designResolutionSize:null,
    //the view port size
    _viewPortRect:null,
    // the view name
    _viewName:"",

    _scaleX:1,
    _scaleY:1,
    _gl:null,

    _resolutionPolicy:cc.RESOLUTION_UNKNOWN,

    ctor:function () {
        this._gl = cc.renderContext;
        this._screenSize = cc.SIZE_ZERO;
        this._designResolutionSize = cc.SIZE_ZERO;
        this._viewPortRect = cc.RECT_ZERO;
    },

    /**
     * Force destroying EGL view, subclass must implement this method.
     */
    end:function () {
    },

    /**
     * Get whether opengl render system is ready, subclass must implement this method.
     */
    isOpenGLReady:function () {
    },

    /**
     * Exchanges the front and back buffers, subclass must implement this method.
     */
    swapBuffers:function () {
    },

    /**
     * Open or close IME keyboard (HTML5 Not support)
     * @param open
     */
    setIMEKeyboardState:function (open) {
    },

    /**
     * Get the frame size of EGL view.
     * In general, it returns the screen size since the EGL view is a fullscreen view.
     */
    getFrameSize:function () {
        return this._screenSize;
    },

    /**
     * Set the frame size of EGL view.
     * @param {Number} width
     * @param {Number} height
     */
    setFrameSize:function (width, height) {
        this._designResolutionSize = this._screenSize = CCSizeMake(width, height);
    },

    /**
     * Get the visible area size of opengl viewport.
     */
    getVisibleSize:function () {
        if (this._resolutionPolicy == kResolutionNoBorder) {
            return CCSizeMake(this._screenSize.width / this._scaleX, this._screenSize.height / this._scaleY);
        }
        else {
            return this._designResolutionSize;
        }
    },

    /**
     * Get the visible origin point of opengl viewport.
     */
    getVisibleOrigin:function () {
        if (this._resolutionPolicy == kResolutionNoBorder) {
            return CCPointMake((this._designResolutionSize.width - this._screenSize.width / this._scaleX) / 2,
                (this._designResolutionSize.height - this._screenSize.height / this._scaleY) / 2);
        }
        else {
            return CCPointZero;
        }
    },

    /**
     * <p>
     *     Set the design resolution size. <br/>
     *      resolutionPolicy you may choose: <br/>
     *          [1] kResolutionExactFit Fill screen by stretch-to-fit: if the design resolution ratio of width to height is different from the screen resolution ratio, your game view will be stretched. <br/>
     *          [2] kResolutionNoBorder Full screen without black border: if the design resolution ratio of width to height is different from the screen resolution ratio, two areas of your game view will be cut.<br/>
     *          [3] kResolutionShowAll  Full screen with black border: if the design resolution ratio of width to height is different from the screen resolution ratio, two black borders will be shown.<br/> </p>
     * @param width Design resolution width.
     * @param height Design resolution height
     * @param resolutionPolicy  The resolution policy desired
     */
    setDesignResolutionSize:function (width, height, resolutionPolicy) {
        cc.Assert(resolutionPolicy != cc.RESOLUTION_UNKNOWN, "should set resolutionPolicy");

        if (width === 0.0 || height === 0.0)
            return;

        this._designResolutionSize = cc.size(width, height);

        this._scaleX = this._screenSize.width / this._designResolutionSize.width;
        this._scaleY = this._screenSize.height / this._designResolutionSize.height;

        if (resolutionPolicy == cc.RESOLUTION_NO_BORDER)
            this._scaleX = this._scaleY = Math.max(this._scaleX, this._scaleY);

        if (resolutionPolicy == cc.RESOLUTION_SHOW_ALL)
            this._scaleX = this._scaleY = Math.min(this._scaleX, this._scaleY);

        // calculate the rect of viewport
        var viewPortW = this._designResolutionSize.width * this._scaleX;
        var viewPortH = this._designResolutionSize.height * this._scaleY;

        this._viewPortRect.setRect((this._screenSize.width - viewPortW) / 2, (this._screenSize.height - viewPortH) / 2, viewPortW, viewPortH);

        this._resolutionPolicy = resolutionPolicy;

        // reset director's member variables to fit visible rect
        cc.Director.getInstance()._winSizeInPoints = this.getDesignResolutionSize();
        cc.Director.getInstance()._createStatsLabel();
        cc.Director.getInstance().setGLDefaultValues();
    },

    /**
     *  Get design resolution size. <br/>
     *  Default resolution size is the same as 'getFrameSize'.
     */
    getDesignResolutionSize:function () {
        return this._designResolutionSize;
    },

    /**
     * Set touch delegate
     * @param delegate
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
        this._gl.viewport((x * this._scaleX + this._viewPortRect.origin.x),
            (y * this._scaleY + this._viewPortRect.origin.y),
            (w * this._scaleX), (h * this._scaleY));
    },

    setScissorInPoints:function (x, y, w, h) {
        this._gl.scissor((x * this._scaleX + this._viewPortRect.origin.x),
            (y * this._scaleY + this._viewPortRect.origin.y),
            (w * this._scaleX), (h * this._scaleY));
    },

    setViewName:function (viewName) {
        if (viewName != null && viewName.length > 0)
            this._viewName = viewName;
    },

    getViewName:function () {
        return this._viewName;
    },

    /** Touch events are handled by default; if you want to customize your handlers, please override these functions: */

    handleTouchesBegin:function (num, ids, xs, ys) {
        var setArr = [];
        for (var i = 0; i < num; ++i) {
            var id = ids[i];
            var x = xs[i];
            var y = ys[i];

            var index = cc._touchesIntegerDict.objectForKey(id);
            var unusedIndex = 0;

            // it is a new touch
            if (index == null) {
                unusedIndex = cc.getUnUsedIndex();

                // The touches is more than MAX_TOUCHES ?
                if (unusedIndex == -1) {
                    cc.log("The touches is more than MAX_TOUCHES, nUnusedIndex = " + unusedIndex);
                    continue;
                }

                var touch = cc._touches[unusedIndex] = new cc.Touch();
                touch.setTouchInfo(unusedIndex, (x - this._viewPortRect.origin.x) / this._scaleX,
                    (y - this._viewPortRect.origin.y) / this._scaleY);
                cc._touchesIntegerDict.setObject(unusedIndex, id);
                setArr.push(touch);
            }
        }

        if (setArr.length == 0) {
            cc.log("touchesBegan: count = 0");
            return;
        }

        this._delegate.touchesBegan(setArr, null);
    },

    handleTouchesMove:function (num, ids, xs, ys) {
        var setArr = [];
        for (var i = 0; i < num; i++) {
            var id = ids[i];
            var x = xs[i];
            var y = ys[i];

            var index = cc._touchesIntegerDict.objectForKey(id);
            if (index == null) {
                cc.log("if the index doesn't exist, it is an error");
                continue;
            }

            cc.logINFO("Moving touches with id: " + id + ", x=" + x + ", y=" + y);
            var touch = cc._touches[index];
            if (touch) {
                touch.setTouchInfo(index, (x - this._viewPortRect.origin.x) / this._scaleX,
                    (y - this._viewPortRect.origin.y) / this._scaleY);
                setArr.addObject(touch);
            } else {
                // It is error, should return.
                cc.log("Moving touches with id: " + id + " error");
                return;
            }
        }

        if (setArr.length == 0) {
            cc.log("touchesMoved: count = 0");
            return;
        }

        this._delegate.touchesMoved(setArr, null);
    },
    handleTouchesEnd:function (num, ids, xs, ys) {
        var setArr = [];
        this._getSetOfTouchesEndOrCancel(setArr, num, ids, xs, ys);
        this._delegate.touchesEnded(setArr, null);
    },
    handleTouchesCancel:function (num, ids, xs, ys) {
        var setArr = [];
        this._getSetOfTouchesEndOrCancel(setArr, num, ids, xs, ys);
        this._delegate.touchesCancelled(setArr, null);
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

    _getSetOfTouchesEndOrCancel:function (setArr, num, ids, xs, ys) {
        for (var i = 0; i < num; ++i) {
            var id = ids[i];
            var x = xs[i];
            var y = ys[i];

            var index = this._touchesIntegerDict.objectForKey(id);
            if (index == null) {
                cc.log("if the index doesn't exist, it is an error");
                continue;
            }
            /* Add to the set to send to the director */
            var touch = this._touches[index];
            if (touch) {
                cc.logINFO("Ending touches with id: " + id + ", x=" + x + ", y=" + y);
                touch.setTouchInfo(index, (x - this._viewPortRect.origin.x) / this._scaleX,
                    (y - this._viewPortRect.origin.y) / this._scaleY);
                setArr.addObject(touch);

                // release the object
                cc._touches[index] = null;
                cc.removeUsedIndexBit(index);

                cc._touchesIntegerDict.removeObjectForKey(id);
            } else {
                cc.log("Ending touches with id: " + +" error", id);
                return;
            }
        }

        if (setArr.length == 0) {
            cc.log("touchesEnded or touchesCancel: count = 0");
        }
    }
});


