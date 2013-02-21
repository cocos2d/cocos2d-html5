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
    EXACTFIT:0,
    // The entire application fills the specified area, without distortion but possibly with some cropping,
    // while maintaining the original aspect ratio of the application.
    NOBORDER:1,
    // The entire application is visible in the specified area without distortion while maintaining the original
    // aspect ratio of the application. Borders can appear on two sides of the application.
    SHOW_ALL:2,

    UNKNOWN:3
};

cc.MAX_TOUCHES = 5;


var s_pTouches = [];
var s_indexBitsUsed = 0;
var s_TouchesIntergerDict;


/**
 * @addtogroup platform
 * @{
 */

cc.EGLView = cc.Class.extend({
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
    _scaleY:1,
    _resolutionPolicy:cc.RESOLUTION_POLICY.UNKNOWN,
    init:function () {
        //this._super();
        //this._screenSize.width = this._designResolutionSize.width;
        //this._screenSize.height = this._designResolutionSize.height;
        this._screenSize = cc.size(cc.canvas.width, cc.canvas.height);
    },
    /** Force destroying EGL view, subclass must implement this method. */
    end:function () {
        this.removeFromSuperview();
    },

    /** Get whether opengl render system is ready, subclass must implement this method. */
    isOpenGLReady:function () {
    },

    /** Exchanges the front and back buffers, subclass must implement this method. */
    swapBuffers:function () {
    },

    /** Open or close IME keyboard , subclass must implement this method. */
    setIMEKeyboardState:function (bOpen) {
        if (bOpen) {
            // [EAGLView sharedEGLView] becomeFirstResponder
        }
        else {
            //  [EAGLView sharedEGLView] resignFirstResponder
        }
    },
    setContentScaleFactor:function (scaleFactor) {
        cc.Assert(this._resolutionPolicy == cc.RESOLUTION_POLICY.UNKNOWN); // cannot enable retina mode

        this._scaleX = this._scaleY = scaleFactor;

        return true;


        if (scaleFactor != this._contentScaleFactor) {
            this._contentScaleFactor = scaleFactor;
            this._winSizeInPixels = cc.size(this._winSizeInPoints.width * scaleFactor, this._winSizeInPoints.height * scaleFactor);

            if (this._openGLView) {
                this.updateContentScaleFactor();
            }

            // update projection
            this.setProjection(this._projection);
        }
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
     */
    setFrameSize:function (width, height) {
        this._designResolutionSize = this._screenSize = cc.size(width, height);
    },

    /**
     * Get the visible area size of opengl viewport.
     */
    getVisibleSize:function () {
        if (this._resolutionPolicy == cc.RESOLUTION_POLICY.NOBORDER) {
            return cc.size(this._screenSize.width / this._scaleX, this._screenSize.height / this._scaleY);
        }
        else {
            return this._designResolutionSize;
        }
    },

    /**
     * Get the visible origin point of opengl viewport.
     */
    getVisibleOrigin:function () {
        if (this._resolutionPolicy == cc.RESOLUTION_POLICY.NOBORDER) {
            return cc.p((this._designResolutionSize.width - this._screenSize.width / this._scaleX) / 2,
                (this._designResolutionSize.height - this._screenSize.height / this._scaleY) / 2);
        }
        else {
            return cc.p(0, 0);
        }
    },

    /**
     * Set the design resolution size.
     * @param width Design resolution width.
     * @param height Design resolution height.
     * @param resolutionPolicy The resolution policy desired, you may choose:
     *                         [1] ResolutionExactFit Fill screen by stretch-to-fit: if the design resolution ratio of width to height is different from the screen resolution ratio, your game view will be stretched.
     *                         [2] ResolutionNoBorder Full screen without black border: if the design resolution ratio of width to height is different from the screen resolution ratio, two areas of your game view will be cut.
     *                         [3] ResolutionShowAll  Full screen with black border: if the design resolution ratio of width to height is different from the screen resolution ratio, two black borders will be shown.
     */
    setDesignResolutionSize:function (width, height, resolutionPolicy) {
        cc.Assert(resolutionPolicy != cc.RESOLUTION_POLICY.UNKNOWN, "should set resolutionPolicy");

        if (width == 0 || height == 0) {
            return;
        }

        this._designResolutionSize = cc.size(width, height);

        this._scaleX = this._screenSize.width / this._designResolutionSize.width;
        this._scaleY = this._screenSize.height / this._designResolutionSize.height;

        if (resolutionPolicy == cc.RESOLUTION_POLICY.NOBORDER) {
            this._scaleX = this._scaleY = Math.max(this._scaleX, this._scaleY);
        }

        if (resolutionPolicy == cc.RESOLUTION_POLICY.SHOW_ALL) {
            this._scaleX = this._scaleY = Math.min(this._scaleX, this._scaleY);
        }

        // calculate the rect of viewport
        var viewPortW = this._designResolutionSize.width * this._scaleX;
        var viewPortH = this._designResolutionSize.height * this._scaleY;

        this._viewPortRect = cc.rect((this._screenSize.width - viewPortW) / 2, (this._screenSize.height - viewPortH) / 2, viewPortW, viewPortH);

        this._resolutionPolicy = resolutionPolicy;

        // reset director's member variables to fit visible rect
        var diretor = cc.Director.getInstance();
        diretor._winSizeInPoints = this.getDesignResolutionSize();


        var width,height;
        switch(resolutionPolicy){
            case cc.RESOLUTION_POLICY.EXACTFIT:
                width = 0;
                height = 0;
            case cc.RESOLUTION_POLICY.NOBORDER:
                width = 0;
                height = 0;
            case cc.RESOLUTION_POLICY.SHOW_ALL:
                width = (this._screenSize.width - viewPortW) / 2;
                height = - (this._screenSize.height - viewPortH) / 2;
        }

        cc.renderContext.translate(width,height);
        cc.renderContext.scale(this._scaleX, this._scaleY);
        diretor.setContentScaleFactor(this._scaleX);
        //diretor.setGLDefaultValues();
    },

    /** Get design resolution size.
     *  Default resolution size is the same as 'getFrameSize'.
     */
    getDesignResolutionSize:function () {
        return this._designResolutionSize;
    },

    /** Set touch delegate */
    setTouchDelegate:function (delegate) {
        this._delegate = delegate;
    },

    /**
     * Set opengl view port rectangle with points.
     */
    setViewPortInPoints:function (x, y, w, h) {
        //todo WEBGL
        /*glViewport((GLint)(x * this._scaleX + this._viewPortRect.origin.x),
         (GLint)(y * this._scaleY + this._viewPortRect.origin.y),
         (GLsizei)(w * this._scaleX),
         (GLsizei)(h * this._scaleY));*/

    },

    /**
     * Set Scissor rectangle with points.
     */
    setScissorInPoints:function (x, y, w, h) {
        //todo WEBGL
        /*glScissor((GLint)(x * this._scaleX + this._viewPortRect.origin.x),
         (GLint)(y * this._scaleY + this._viewPortRect.origin.y),
         (GLsizei)(w * this._scaleX),
         (GLsizei)(h * this._scaleY));*/

    },

    setViewName:function (viewName) {
        if (viewName != null && viewName.length > 0) {
            this._viewName = viewName;
        }

    },

    getViewName:function () {
        return this._viewName;
    },

    /** Touch events are handled by default; if you want to customize your handlers, please override these functions: */
    handleTouchesBegin:function (num, ids, xs, ys) {
        var set1 = new cc.Set();
        for (var i = 0; i < num; ++i) {
            var id = ids[i];
            var x = xs[i];
            var y = ys[i];

            var pIndex = s_TouchesIntergerDict.objectForKey(id);
            var nUnusedIndex = 0;

            // it is a new touch
            if (pIndex == null) {
                nUnusedIndex = this._getUnUsedIndex();

                // The touches is more than MAX_TOUCHES ?
                if (nUnusedIndex == -1) {
                    cc.log("The touches is more than MAX_TOUCHES, nUnusedIndex = %d", nUnusedIndex);
                    continue;
                }

                var touch = s_pTouches[nUnusedIndex] = new cc.Touch();
                touch.setTouchInfo(nUnusedIndex, (x - this._viewPortRect.origin.x) / this._scaleX,
                    (y - this._viewPortRect.origin.y) / this._scaleY);

                //cc.log("x = %f y = %f", touch.getLocationInView().x, touch.getLocationInView().y);

                var pInterObj = 0 | nUnusedIndex;
                s_TouchesIntergerDict.setObject(pInterObj, id);
                set1.addObject(touch);
                pInterObj.release();
            }
        }

        if (set1.length == 0) {
            cc.log("touchesBegan: count = 0");
            return;
        }

        this._delegate.touchesBegan(set1, null);
    },
    handleTouchesMove:function (num, ids, xs, ys) {
        var set1 = new cc.Set();
        for (var i = 0; i < num; ++i) {
            var id = ids[i];
            var x = xs[i];
            var y = ys[i];

            var pIndex = s_TouchesIntergerDict.objectForKey(id);
            if (pIndex == null) {
                cc.log("if the index doesn't exist, it is an error");
                continue;
            }

            cc.logINFO("Moving touches with id: %d, x=%f, y=%f", id, x, y);
            var touch = s_pTouches[pIndex.getValue()];
            if (touch) {
                touch.setTouchInfo(pIndex.getValue(), (x - this._viewPortRect.origin.x) / this._scaleX,
                    (y - this._viewPortRect.origin.y) / this._scaleY);

                set1.addObject(touch);
            }
            else {
                // It is error, should return.
                cc.log("Moving touches with id: %d error", id);
                return;
            }
        }

        if (set1.length == 0) {
            cc.log("touchesMoved: count = 0");
            return;
        }

        this._delegate.touchesMoved(set1, null);
    },
    handleTouchesEnd:function (num, ids, xs, ys) {
        var set1 = new cc.Set();
        this.getSetOfTouchesEndOrCancel(set1, num, ids, xs, ys);
        this._delegate.touchesEnded(set1, null);
    },
    handleTouchesCancel:function (num, ids, xs, ys) {
        var set1 = new cc.Set();
        this.getSetOfTouchesEndOrCancel(set1, num, ids, xs, ys);
        this._delegate.touchesCancelled(set1, null);
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

    getSetOfTouchesEndOrCancel:function (set1, num, ids, xs, ys) {
        for (var i = 0; i < num; ++i) {
            var id = ids[i];
            var x = xs[i];
            var y = ys[i];

            var index = s_TouchesIntergerDict.objectForKey(id);
            if (index == null) {
                cc.log("if the index doesn't exist, it is an error");
                continue;
            }
            /* Add to the set to send to the director */
            var touch = s_pTouches[index.getValue()];
            if (touch) {
                cc.logINFO("Ending touches with id: %d, x=%f, y=%f", id, x, y);
                touch.setTouchInfo(index.getValue(), (x - this._viewPortRect.origin.x) / this._scaleX,
                    (y - this._viewPortRect.origin.y) / this._scaleY);

                set1.addObject(touch);

                // release the object
                touch.release();
                s_pTouches[index.getValue()] = null;
                this._removeUsedIndexBit(index.getValue());

                s_TouchesIntergerDict.removeObjectForKey(id);

            }
            else {
                cc.log("Ending touches with id: " + id + " error");
                return;
            }

        }

        if (set1.length == 0) {
            cc.log("touchesEnded or touchesCancel: count = 0");
            return;
        }
    },

    _getUnUsedIndex:function () {
        var i;
        var temp = s_indexBitsUsed;

        for (i = 0; i < cc.MAX_TOUCHES; i++) {
            if (!(temp & 0x00000001)) {
                s_indexBitsUsed |= (1 << i);
                return i;
            }

            temp >>= 1;
        }

        // all bits are used
        return -1;
    },

    _removeUsedIndexBit:function (index) {
        if (index < 0 || index >= cc.MAX_TOUCHES) {
            return;
        }

        var temp = 1 << index;
        temp = ~temp;
        s_indexBitsUsed &= temp;
    }
});


cc.EGLView.getInstance = function () {
    if (!this._instance) {
        this._instance = new cc.EGLView();
        this._instance.init();
    }
    return this._instance;
};
