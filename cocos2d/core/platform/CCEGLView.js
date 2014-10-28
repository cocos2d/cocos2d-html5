/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

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
 * Gets the browser data
 */
cc.__NormalGetter = cc.Class.extend({
    devicePixelRatio: function(){
        return window.devicePixelRatio || 1;
    },
    availHeight: function(){
        return window.innerHeight
    },
    availWidth: function(){
        return window.innerWidth;
    },
    _metas: {
        "user-scalable": "no",
        "maximum-scale": "1.0",
        "initial-scale": "1.0",
        "target-densitydpi": "device-dpi"
    },
    viewPort: function(){
        return this._metas;
    },
    printParam: function(){
        cc.log(this.devicePixelRatio());
        cc.log(this.availWidth());
        cc.log(this.availHeight());
        cc.log(cc.sys.browserType);
    },
    printAllParam: function(){
        cc.log("devicePixelRatio " + window.devicePixelRatio);

        cc.log("window.innerHeight " + window.innerHeight);
        cc.log("window.innerWidth " + window.innerWidth);

        cc.log("document.body.clientWidth " + document.body.clientWidth);
        cc.log("document.body.clientHeight " + document.body.clientHeight);

        cc.log("document.body.offsetWidth " + document.body.offsetWidth);
        cc.log("document.body.offsetHeight " + document.body.offsetHeight);

        cc.log("document.body.scrollWidth " + document.body.scrollWidth);
        cc.log("document.body.scrollHeight " + document.body.scrollHeight);

        cc.log("window.screen.width " + window.screen.width);
        cc.log("window.screen.height " + window.screen.height);

        cc.log("window.screen.availWidth " + window.screen.availWidth);
        cc.log("window.screen.availHeight " + window.screen.availHeight);
    }
});

cc.__FireFoxGetter = cc.__NormalGetter.extend({
    viewPort: function(){
        var vp = cc.__NormalGetter.prototype.viewPort();
        vp["width"] = this.availWidth();
        return vp;
    }
});

cc.DENSITYDPI_DEVICE = "device-dpi";
cc.DENSITYDPI_HIGH = "high-dpi";
cc.DENSITYDPI_MEDIUM = "medium-dpi";
cc.DENSITYDPI_LOW = "low-dpi";

/**
 * cc.view is the singleton object which represents the game window.<br/>
 * It's main task include: <br/>
 *  - Apply the design resolution policy<br/>
 *  - Provide interaction with the window, like resize event on web, retina display support, etc...<br/>
 *  - Manage the game view port which can be different with the window<br/>
 *  - Manage the content scale and translation<br/>
 * <br/>
 * Since the cc.view is a singleton, you don't need to call any constructor or create functions,<br/>
 * the standard way to use it is by calling:<br/>
 *  - cc.view.methodName(); <br/>
 * @class
 * @name cc.view
 * @extend cc.Class
 */
cc.EGLView = cc.Class.extend({
    _isAdjustViewPort: true,
    _getter: null,

    /**
     * Constructor of cc.EGLView
     */
    ctor: function(){
        var w = cc._canvas.width,
               h = cc._canvas.height;

        this._frame = (cc.container.parentNode === document.body) ? document.documentElement : cc.container.parentNode;

        if(cc.sys.isMobile){
            var ua = window.navigator.userAgent.toLowerCase();

            if(
                cc.sys.browserType === cc.sys.BROWSER_TYPE_FIREFOX ||
                /sogou/.test(ua)
            ){
                this._getter = new cc.__FireFoxGetter();
            }else{
                this._getter = new cc.__NormalGetter();
            }
        }else{
            this._getter = new cc.__NormalGetter();
        }
        this._scaleX = this._scaleY = 1;
        this._devicePixelRatio = this._getter.devicePixelRatio();

        this._designResolutionSize = cc.size(w, h);
        this._viewPortRect = cc.rect(0, 0, w, h);
        this._visibleRect = cc.rect(0, 0, w, h);
        this._contentTranslateLeftTop = {left: 0, top: 0};
        this._viewName = "Cocos2dHTML5";

        cc.visibleRect && cc.visibleRect.init(this._visibleRect);
    },

    /**
     * <p>
     * Sets view's target-densitydpi for android mobile browser. it can be set to:           <br/>
     *   1. cc.DENSITYDPI_DEVICE, value is "device-dpi"                                      <br/>
     *   2. cc.DENSITYDPI_HIGH, value is "high-dpi"  (default value)                         <br/>
     *   3. cc.DENSITYDPI_MEDIUM, value is "medium-dpi" (browser's default value)            <br/>
     *   4. cc.DENSITYDPI_LOW, value is "low-dpi"                                            <br/>
     *   5. Custom value, e.g: "480"                                                         <br/>
     * </p>
     * @param {String} densityDPI
     */
    setTargetDensityDPI: function(densityDPI){
        this._targetDensityDPI = densityDPI;
        this._setViewPortMeta();
    },

    /**
     * Returns the frame size of the view.<br/>
     * On native platforms, it returns the screen size since the view is a fullscreen view.<br/>
     * On web, it returns the size of the canvas's outer DOM element.
     * @return {cc.Size}
     */
    getFrameSize: function(){
        return {
            width: this._frame.clientWidth,
            height: this._frame.clientHeight
        }
    },

    /**
     * On native, it sets the frame size of view.<br/>
     * On web, it sets the size of the canvas's outer DOM element.
     * @param {Number} width
     * @param {Number} height
     */
    setFrameSize: function (width, height) {
        this._frameSize.width = width;
        this._frameSize.height = height;
        this._frame.style.width = width + "px";
        this._frame.style.height = height + "px";
        //this.centerWindow();
        this._resizeEvent();
        cc.director.setProjection(cc.director.getProjection());
    },

    /**
     * Empty function
     */
    centerWindow: function () {
    },

    /**
     * Returns the visible area size of the view port.
     * @return {cc.Size}
     */
    getVisibleOrigin: function () {
        return cc.size(this._visibleRect.width,this._visibleRect.height);
    },

    /**
     * Returns the designed size for the view.
     * Default resolution size is the same as 'getFrameSize'.
     * @return {cc.Size}
     */
    getDesignResolutionSize: function(){
        return this._designResolutionSize;
    },

    /**
     * Sets whether the engine modify the "viewport" meta in your web page.<br/>
     * It's enabled by default, we strongly suggest you not to disable it.<br/>
     * And even when it's enabled, you can still set your own "viewport" meta, it won't be overridden<br/>
     * Only useful on web
     * @param {Boolean} enabled Enable automatic modification to "viewport" meta
     */
    adjustViewPort: function(){
        this._isAdjustViewPort = true;
    },

    /**
     * Sets the resolution policy with designed view size in points.<br/>
     * The resolution policy include: <br/>
     * [1] ResolutionExactFit       Fill screen by stretch-to-fit: if the design resolution ratio of width to height is different from the screen resolution ratio, your game view will be stretched.<br/>
     * [2] ResolutionNoBorder       Full screen without black border: if the design resolution ratio of width to height is different from the screen resolution ratio, two areas of your game view will be cut.<br/>
     * [3] ResolutionShowAll        Full screen with black border: if the design resolution ratio of width to height is different from the screen resolution ratio, two black borders will be shown.<br/>
     * [4] ResolutionFixedHeight    Scale the content's height to screen's height and proportionally scale its width<br/>
     * [5] ResolutionFixedWidth     Scale the content's width to screen's width and proportionally scale its height<br/>
     * [cc.ResolutionPolicy]        [Web only feature] Custom resolution policy, constructed by cc.ResolutionPolicy<br/>
     * @param {Number} width Design resolution width.
     * @param {Number} height Design resolution height.
     * @param {cc.ResolutionPolicy|Number} resolutionPolicy The resolution policy desired
     */
    _resolutionPolicy: null,
    setDesignResolutionSize: function(width, height, resolutionPolicy){
        if(cc.sys.isMobile)
            this._setViewPortMeta();

        //Don't remove
        document.body.clientWidth;

        var drs = this._designResolutionSize,
            vr = this._visibleRect,
            vp = this._viewPortRect,
            getter = this._getter;
        width = width || drs.width;
        height = height || drs.height;
        resolutionPolicy = resolutionPolicy != null ? resolutionPolicy : this._resolutionPolicy;
        this._resolutionPolicy = resolutionPolicy;

        drs.width = width;
        drs.height = height;

        document.body.style.padding = "0";
        document.body.style.margin = "0";

        var data = {};
        if(cc.__adapter[resolutionPolicy]){
            data = cc.__adapter[resolutionPolicy](width, height, getter.availWidth(), getter.availHeight());
        }

        data.scaleX && ( this._scaleX = data.scaleX);
        data.scaleY && ( this._scaleY = data.scaleY);

        cc._canvas.width = data.viewPortWidth || data.width || cc._canvas.width;
        cc.container.style.width = cc._canvas.width  + "px";
        vr.width = data.width || vr.width;
        vp.width = data.viewPortWidth || data.width || vp.width;

        cc._canvas.height = data.viewPortHeight || data.height || cc._canvas.height;
        cc.container.style.height =  cc._canvas.height + "px";
        vr.height = data.height || vr.height;
        vp.height = data.viewPortHeight || data.height || vp.height;

        vp.x = data.viewPortX || 0;
        vp.y = data.viewPortY || 0;

        cc.director._winSizeInPoints.width = data.frameWidth ? data.frameWidth : width;
        cc.director._winSizeInPoints.height = data.frameHeight ? data.frameHeight : height;

        cc.winSize.width = data.frameWidth ? data.frameWidth * this._scaleX : width;
        cc.winSize.height = data.frameHeight ? data.frameHeight * this._scaleY : height;

        cc.visibleRect && cc.visibleRect.init(vr);
        // Translate the content
        if (cc._renderType == cc._RENDER_TYPE_CANVAS)
            cc._renderContext.translate(-vp.x, vp.height + vp.y);

        if (cc._renderType == cc._RENDER_TYPE_WEBGL) {
            // reset director's member variables to fit visible rect
            cc.director._createStatsLabel();
            cc.director.setGLDefaultValues();
        }
    },

    _setViewPortMeta: function(){
        if(!this._isAdjustViewPort) return;

        var meta = document.getElementById("cocosMetaElement");
        if(meta) document.head.removeChild(meta);

        var metas = this._getter.viewPort();
        metas["target-densitydpi"] = this._targetDensityDPI;

        var currentViewPort;
        if(this._orginViewPortMeta){
            currentViewPort = this._orginViewPortMeta;
        }else{
            var metaViewPort = document.getElementsByName("viewport");
            currentViewPort = metaViewPort ? metaViewPort[0] : null;
            if(currentViewPort){
                this._orginViewPortMeta = currentViewPort;
                document.head.removeChild(currentViewPort);
            }
        }

        meta = cc.newElement("meta");
        meta.id = "cocosMetaElement";
        meta.name = "viewport";
        meta.content = "";

        var content = currentViewPort ? currentViewPort.content : "";
        for (var key in metas) {
            var pattern = new RegExp(key);
            if (!pattern.test(content)) {
                content += "," + key + "=" + metas[key];
            }
        }
        if(/^,/.test(content))
            content = content.substr(1);

        meta.content = content;
        document.head.appendChild(meta);
    },

    _resizeTimer: null,
    _resizeFunc: function(){
        clearTimeout(cc.view._resizeTimer);
        cc.view._resizeTimer = setTimeout(function(){
            cc.view.setDesignResolutionSize();
        }, 300);
    },
    resizeWithBrowserSize: function(bool){
        if(bool){
            cc.view._resizeFunc();
            window.addEventListener("resize", cc.view._resizeFunc, false);
        }else{
            window.removeEventListener("resize", cc.view._resizeFunc, false);
        }
    },

    /**
     * If enabled, the application will try automatically to enter full screen mode on mobile devices<br/>
     * You can pass true as parameter to enable it and disable it by passing false.<br/>
     * Only useful on web
     * @param {Boolean} enabled  Enable or disable auto full screen on mobile devices
     */
    enableAutoFullScreen: function(enabled) {
        this._autoFullScreen = !!enabled;
    },

    /**
     * Returns the view port rectangle.
     * @return {cc.Rect}
     */
    getViewPortRect: function(){
        return this._visibleRect;
    },

    /**
     * Returns scale factor of the horizontal direction (X axis).
     * @return {Number}
     */
    getScaleX: function(){
        return this._scaleX;
    },

    /**
     * Returns scale factor of the vertical direction (Y axis).
     * @return {Number}
     */
    getScaleY: function(){
        return this._scaleY;
    },

    /**
     * Returns device pixel ratio for retina display.
     * @return {Number}
     */
    getDevicePixelRatio: function() {
        return this._getter.devicePixelRatio();
    },

    /**
     * Returns the real location in view for a translation based on a related position
     * @param {Number} tx The X axis translation
     * @param {Number} ty The Y axis translation
     * @param {Object} relatedPos The related position object including "left", "top", "width", "height" informations
     * @return {cc.Point}
     */
    convertToLocationInView: function(tx, ty, relatedPos){
        return {
            x: tx - relatedPos.left,
            y: relatedPos.top + relatedPos.height - ty
        };
    },

    setViewPortInPoints: function(x, y, w, h){
        var locScaleX = this._scaleX,
            locScaleY = this._scaleY;
        cc._renderContext.viewport(
            (x * locScaleX + this._viewPortRect.x),
            (y * locScaleY + this._viewPortRect.y),
            (w * locScaleX),
            (h * locScaleY));

    },

    _convertMouseToLocationInView: function(point, relatedPos){
        var vp = this._viewPortRect, _t = this;
        point.x = (point.x - relatedPos.left + vp.x) / _t._scaleX;
        point.y = (relatedPos.top + relatedPos.height - point.y + vp.y) / _t._scaleY;
    },

    _convertTouchesWithScale: function(touches){
        var vp = this._viewPortRect,
            locScaleX = this._scaleX,
            locScaleY = this._scaleY,
            selTouch, selPoint, selPrePoint;
        for( var i = 0; i < touches.length; i ++){
            selTouch = touches[i];
            selPoint = selTouch._point;
            selPrePoint = selTouch._prevPoint;
            selTouch._setPoint((selPoint.x + vp.x) / locScaleX,
                    (selPoint.y + vp.y) / locScaleY);
            selTouch._setPrevPoint((selPrePoint.x + vp.x) / locScaleX,
                    (selPrePoint.y + vp.y) / locScaleY);
        }
    }

});

cc.EGLView._getInstance = function(){
    return new cc.EGLView();
};

cc.ResolutionPolicy = {
    /**
     * @memberOf cc.ResolutionPolicy#
     * @name EXACT_FIT
     * @constant
     * @type Number
     * @static
     * The entire application is visible in the specified area without trying to preserve the original aspect ratio.<br/>
     * Distortion can occur, and the application may appear stretched or compressed.
     */
    EXACT_FIT: 0,
    /**
     * @memberOf cc.ResolutionPolicy#
     * @name NO_BORDER
     * @constant
     * @type Number
     * @static
     * The entire application fills the specified area, without distortion but possibly with some cropping,<br/>
     * while maintaining the original aspect ratio of the application.
     */
    NO_BORDER: 1,
    /**
     * @memberOf cc.ResolutionPolicy#
     * @name SHOW_ALL
     * @constant
     * @type Number
     * @static
     * The entire application is visible in the specified area without distortion while maintaining the original<br/>
     * aspect ratio of the application. Borders can appear on two sides of the application.
     */
    SHOW_ALL: 2,
    /**
     * @memberOf cc.ResolutionPolicy#
     * @name FIXED_HEIGHT
     * @constant
     * @type Number
     * @static
     * The application takes the height of the design resolution size and modifies the width of the internal<br/>
     * canvas so that it fits the aspect ratio of the device<br/>
     * no distortion will occur however you must make sure your application works on different<br/>
     * aspect ratios
     */
    FIXED_HEIGHT: 3,
    /**
     * @memberOf cc.ResolutionPolicy#
     * @name FIXED_WIDTH
     * @constant
     * @type Number
     * @static
     * The application takes the width of the design resolution size and modifies the height of the internal<br/>
     * canvas so that it fits the aspect ratio of the device<br/>
     * no distortion will occur however you must make sure your application works on different<br/>
     * aspect ratios
     */
    FIXED_WIDTH: 4,
    /**
     * @memberOf cc.ResolutionPolicy#
     * @name UNKNOWN
     * @constant
     * @type Number
     * @static
     * Unknow policy
     */
    UNKNOWN: 5
};

cc.__adapter = {};

cc.__adapter[cc.ResolutionPolicy.EXACT_FIT] = function(w, h, aw, ah){
    return {
        width: aw,
        height: ah,
        scaleX: aw / w,
        scaleY: ah / h
    };
};
cc.__adapter[cc.ResolutionPolicy.NO_BORDER] = function(w, h, aw, ah){
    var scaleW = aw / w;
    var scaleH = ah / h;
    if(scaleW > scaleH){
        return {
            width: w * scaleW,
            height: h * scaleW,
            scaleX: scaleW,
            scaleY: scaleW,
            viewPortHeight: ah,
            viewPortWidth: aw,
            viewPortY: (h * scaleW - ah) / 2
        }
    }else{
        return {
            width: w * scaleH,
            height: h * scaleH,
            scaleX: scaleH,
            scaleY: scaleH,
            viewPortHeight: ah,
            viewPortWidth: aw,
            viewPortX: (w * scaleH - aw) / 2
        }
    }
};
cc.__adapter[cc.ResolutionPolicy.SHOW_ALL] = function(w, h, aw, ah){
    var scaleW = aw / w;
    var scaleH = ah / h;
    if(scaleW < scaleH){
        return {
            width: aw,
            height: h * scaleW,
            scaleX: scaleW,
            scaleY: scaleW
        };
    }else{
        return {
            width: w * scaleH,
            height: ah,
            scaleX: scaleH,
            scaleY: scaleH
        };
    }
};
cc.__adapter[cc.ResolutionPolicy.FIXED_HEIGHT] = function(w, h, aw, ah){
    var scale = ah / h;
    return {
        width: aw,
        height: h * scale,
        scaleX: scale,
        scaleY: scale,
        frameWidth: aw / scale,
        frameHeight: ah / scale
    };
};
cc.__adapter[cc.ResolutionPolicy.FIXED_WIDTH] = function(w, h, aw, ah){
    var scale = aw / w;
    return {
        width: w * scale,
        height: ah,
        scaleX: scale,
        scaleY: scale,
        frameWidth: aw / scale,
        frameHeight: ah / scale
    };
};