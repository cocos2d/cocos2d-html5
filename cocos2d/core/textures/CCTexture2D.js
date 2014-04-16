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

//CONSTANTS:

/**
 * Horizontal center and vertical center.
 * @constant
 * @type Number
 */
cc.ALIGN_CENTER = 0x33;

/**
 * Horizontal center and vertical top.
 * @constant
 * @type Number
 */
cc.ALIGN_TOP = 0x13;

/**
 * Horizontal right and vertical top.
 * @constant
 * @type Number
 */
cc.ALIGN_TOP_RIGHT = 0x12;

/**
 * Horizontal right and vertical center.
 * @constant
 * @type Number
 */
cc.ALIGN_RIGHT = 0x32;

/**
 * Horizontal right and vertical bottom.
 * @constant
 * @type Number
 */
cc.ALIGN_BOTTOM_RIGHT = 0x22;

/**
 * Horizontal center and vertical bottom.
 * @constant
 * @type Number
 */
cc.ALIGN_BOTTOM = 0x23;

/**
 * Horizontal left and vertical bottom.
 * @constant
 * @type Number
 */
cc.ALIGN_BOTTOM_LEFT = 0x21;

/**
 * Horizontal left and vertical center.
 * @constant
 * @type Number
 */
cc.ALIGN_LEFT = 0x31;

/**
 * Horizontal left and vertical top.
 * @constant
 * @type Number
 */
cc.ALIGN_TOP_LEFT = 0x11;
//----------------------Possible texture pixel formats----------------------------


// By default PVR images are treated as if they don't have the alpha channel premultiplied
cc.PVRHaveAlphaPremultiplied_ = false;

//cc.Texture2DWebGL move to TextureWebGL.js

if (cc._renderType === cc._RENDER_TYPE_CANVAS) {

    /**
     * <p>
     * This class allows to easily create OpenGL or Canvas 2D textures from images, text or raw data.                                    <br/>
     * The created cc.Texture2D object will always have power-of-two dimensions.                                                <br/>
     * Depending on how you create the cc.Texture2D object, the actual image area of the texture might be smaller than the texture dimensions <br/>
     *  i.e. "contentSize" != (pixelsWide, pixelsHigh) and (maxS, maxT) != (1.0, 1.0).                                           <br/>
     * Be aware that the content of the generated textures will be upside-down! </p>
     * @name cc.Texture2D
     * @class
     * @extends cc.Class
     *
     * @property {WebGLTexture}     name            - <@readonly> WebGLTexture Object
     * @property {Number}           pixelFormat     - <@readonly> Pixel format of the texture
     * @property {Number}           pixelsWidth     - <@readonly> Width in pixels
     * @property {Number}           pixelsHeight    - <@readonly> Height in pixels
     * @property {Number}           width           - Content width in points
     * @property {Number}           height          - Content height in points
     * @property {cc.GLProgram}     shaderProgram   - The shader program used by drawAtPoint and drawInRect
     * @property {Number}           maxS            - Texture max S
     * @property {Number}           maxT            - Texture max T
     */

    cc.Texture2D = cc.Class.extend({
        _contentSize: null,
        _isLoaded: false,
        _htmlElementObj: null,
        _loadedEventListeners: null,

        url: null,

        ctor: function () {
            this._contentSize = cc.size(0, 0);
            this._isLoaded = false;
            this._htmlElementObj = null;
        },

        getPixelsWide: function () {
            return this._contentSize.width;
        },

        getPixelsHigh: function () {
            return this._contentSize.height;
        },

        getContentSize: function () {
            var locScaleFactor = cc.contentScaleFactor();
            return cc.size(this._contentSize.width / locScaleFactor, this._contentSize.height / locScaleFactor);
        },

        _getWidth: function () {
            return this._contentSize.width / cc.contentScaleFactor();
        },
        _getHeight: function () {
            return this._contentSize.height / cc.contentScaleFactor();
        },

        getContentSizeInPixels: function () {
            return this._contentSize;
        },

        initWithElement: function (element) {
            if (!element)
                return;
            this._htmlElementObj = element;
        },

        /**
         * HTMLElement Object getter
         * @return {HTMLElement}
         */
        getHtmlElementObj: function () {
            return this._htmlElementObj;
        },

        isLoaded: function () {
            return this._isLoaded;
        },

        handleLoadedTexture: function () {
            var self = this
            if (self._isLoaded) return;
            if (!self._htmlElementObj) {
                var img = cc.loader.getRes(self.url);
                if (!img) return;
                self.initWithElement(img);
            }

            self._isLoaded = true;
            var locElement = self._htmlElementObj;
            self._contentSize.width = locElement.width;
            self._contentSize.height = locElement.height;

            self._callLoadedEventCallbacks();
        },

        description: function () {
            return "<cc.Texture2D | width = " + this._contentSize.width + " height " + this._contentSize.height + ">";
        },

        initWithData: function (data, pixelFormat, pixelsWide, pixelsHigh, contentSize) {
            //support only in WebGl rendering mode
            return false;
        },

        initWithImage: function (uiImage) {
            //support only in WebGl rendering mode
            return false;
        },

        initWithString: function (text, fontName, fontSize, dimensions, hAlignment, vAlignment) {
            //support only in WebGl rendering mode
            return false;
        },

        releaseTexture: function () {
            //support only in WebGl rendering mode
        },

        getName: function () {
            //support only in WebGl rendering mode
            return null;
        },

        getMaxS: function () {
            //support only in WebGl rendering mode
            return 1;
        },

        setMaxS: function (maxS) {
            //support only in WebGl rendering mode
        },

        getMaxT: function () {
            return 1;
        },

        setMaxT: function (maxT) {
            //support only in WebGl rendering mode
        },

        getPixelFormat: function () {
            //support only in WebGl rendering mode
            return null;
        },

        getShaderProgram: function () {
            //support only in WebGl rendering mode
            return null;
        },

        setShaderProgram: function (shaderProgram) {
            //support only in WebGl rendering mode
        },

        hasPremultipliedAlpha: function () {
            //support only in WebGl rendering mode
            return false;
        },

        hasMipmaps: function () {
            //support only in WebGl rendering mode
            return false;
        },

        releaseData: function (data) {
            //support only in WebGl rendering mode
            data = null;
        },

        keepData: function (data, length) {
            //support only in WebGl rendering mode
            return data;
        },

        drawAtPoint: function (point) {
            //support only in WebGl rendering mode
        },

        drawInRect: function (rect) {
            //support only in WebGl rendering mode
        },

        initWithETCFile: function (file) {
            cc.log(cc._LogInfos.Texture2D_initWithETCFile);
            return false;
        },

        initWithPVRFile: function (file) {
            cc.log(cc._LogInfos.Texture2D_initWithPVRFile);
            return false;
        },

        initWithPVRTCData: function (data, level, bpp, hasAlpha, length, pixelFormat) {
            cc.log(cc._LogInfos.Texture2D_initWithPVRTCData);
            return false;
        },

        setTexParameters: function (texParams) {
            //support only in WebGl rendering mode
        },

        setAntiAliasTexParameters: function () {
            //support only in WebGl rendering mode
        },

        setAliasTexParameters: function () {
            //support only in WebGl rendering mode
        },

        generateMipmap: function () {
            //support only in WebGl rendering mode
        },

        stringForFormat: function () {
            //support only in WebGl rendering mode
            return "";
        },

        bitsPerPixelForFormat: function (format) {
            //support only in WebGl rendering mode
            return -1;
        },

        addLoadedEventListener: function (callback, target) {
            if (!this._loadedEventListeners)
                this._loadedEventListeners = [];
            this._loadedEventListeners.push({eventCallback: callback, eventTarget: target});
        },

        removeLoadedEventListener: function (target) {
            if (!this._loadedEventListeners)
                return;
            var locListeners = this._loadedEventListeners;
            for (var i = 0; i < locListeners.length; i++) {
                var selCallback = locListeners[i];
                if (selCallback.eventTarget == target) {
                    locListeners.splice(i, 1);
                }
            }
        },

        _callLoadedEventCallbacks: function () {
            if (!this._loadedEventListeners)
                return;
            var locListeners = this._loadedEventListeners;
            for (var i = 0, len = locListeners.length; i < len; i++) {
                var selCallback = locListeners[i];
                selCallback.eventCallback.call(selCallback.eventTarget, this);
            }
            locListeners.length = 0;
        }
    });

} else {
    _tmp.WebGLTexture2D();
    delete _tmp.WebGLTexture2D;
}

_tmp.PrototypeTexture2D();
delete _tmp.PrototypeTexture2D;