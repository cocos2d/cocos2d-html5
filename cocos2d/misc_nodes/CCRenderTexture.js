/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2009      Jason Booth
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
 * enum for jpg
 * @constant
 * @type Number
 */
cc.IMAGE_FORMAT_JPEG = 0;
/**
 * enum for png
 * @constant
 * @type Number
 */
cc.IMAGE_FORMAT_PNG = 1;
/**
 * enum for raw
 * @constant
 * @type Number
 */
cc.IMAGE_FORMAT_RAWDATA = 2;

/**
 * @param {Number} x
 * @return {Number}
 * Constructor
 */
cc.NextPOT = function (x) {
    x = x - 1;
    x = x | (x >> 1);
    x = x | (x >> 2);
    x = x | (x >> 4);
    x = x | (x >> 8);
    x = x | (x >> 16);
    return x + 1;
};

/**
 * cc.RenderTexture is a generic rendering target. To render things into it,<br/>
 * simply construct a render target, call begin on it, call visit on any cocos<br/>
 * scenes or objects to render them, and call end. For convenience, render texture<br/>
 * adds a sprite as it's display child with the results, so you can simply add<br/>
 * the render texture to your scene and treat it like any other CocosNode.<br/>
 * There are also functions for saving the render texture to disk in PNG or JPG format.
 * @class
 * @extends cc.Node
 */
cc.RenderTexture = cc.Node.extend(/** @lends cc.RenderTexture# */{
    /**
     * the off-screen canvas for rendering and storing the texture
     * @type HTMLCanvasElement
     */
    _cacheCanvas:null,
    /**
     * stores a reference to the canvas context object
     * @type CanvasRenderingContext2D
     */
    _cacheContext:null,

    _fBO:0,
    _depthRenderBuffer:0,
    _oldFBO:0,
    _texture:null,
    _textureCopy:null,
    _uITextureImage:null,

    _pixelFormat:cc.TEXTURE_2D_PIXEL_FORMAT_RGBA8888,
    _sprite:null,

    //code for "auto" update
    _clearFlags:0,
    _clearColor:null,
    _clearDepth:0,
    _clearStencil:0,
    _autoDraw:false,

    _clearColorStr:null,

    /**
     * Constructor
     */
    ctor: null,

    _ctorForCanvas: function () {
        cc.Node.prototype.ctor.call(this);
        this._clearColor = cc.c4f(1, 1, 1, 1);
        this._clearColorStr = "rgba(255,255,255,1)";

        this._cacheCanvas = document.createElement('canvas');
        this._cacheContext = this._cacheCanvas.getContext('2d');
        this.setAnchorPoint(0, 0);
    },

    _ctorForWebGL: function () {
        cc.Node.prototype.ctor.call(this);
        this._clearColor = cc.c4f(0, 0, 0, 0);
    },

    cleanup:null,

    _cleanupForCanvas:function () {
        cc.Node.prototype.onExit.call(this);
        this._cacheContext = null;
        this._cacheCanvas = null;
    },

    _cleanupForWebGL: function () {
        cc.Node.prototype.onExit.call(this);

        //this._sprite = null;
        this._textureCopy = null;

        var gl = cc.renderContext;
        gl.deleteFramebuffer(this._fBO);
        if (this._depthRenderBuffer)
            gl.deleteRenderbuffer(this._depthRenderBuffer);
        this._uITextureImage = null;
        //if (this._texture)
        //    this._texture.releaseTexture();
    },

    /**
     * The sprite
     * @return {cc.Sprite}
     */
    getSprite:function () {
        return this._sprite;
    },

    /**
     * @param {cc.Sprite} sprite
     */
    setSprite:function (sprite) {
        this._sprite = sprite;
    },

    /**
     * @param {Number} width
     * @param {Number} height
     * @param {cc.IMAGE_FORMAT_JPEG|cc.IMAGE_FORMAT_PNG|cc.IMAGE_FORMAT_RAWDATA} format
     * @param {Number} depthStencilFormat
     * @return {Boolean}
     */
    initWithWidthAndHeight: null,

    _initWithWidthAndHeightForCanvas: function (width, height, format, depthStencilFormat) {
        var locCacheCanvas = this._cacheCanvas, locScaleFactor = cc.CONTENT_SCALE_FACTOR();
        locCacheCanvas.width = 0 | (width * locScaleFactor);
        locCacheCanvas.height = 0 | (height * locScaleFactor);
        this._cacheContext.translate(0, locCacheCanvas.height);
        var texture = new cc.Texture2D();
        texture.initWithElement(locCacheCanvas);
        texture.handleLoadedTexture();
        this._sprite = cc.Sprite.createWithTexture(texture);
        return true;
    },

    _initWithWidthAndHeightForWebGL: function (width, height, format, depthStencilFormat) {
        if(format == cc.TEXTURE_2D_PIXEL_FORMAT_A8)
            cc.log( "cc.RenderTexture._initWithWidthAndHeightForWebGL() : only RGB and RGBA formats are valid for a render texture;");

        var gl = cc.renderContext, locScaleFactor = cc.CONTENT_SCALE_FACTOR();

        width = 0 | (width * locScaleFactor);
        height = 0 | (height * locScaleFactor);

        this._oldFBO = gl.getParameter(gl.FRAMEBUFFER_BINDING);

        // textures must be power of two squared
        var powW , powH;

        if (cc.Configuration.getInstance().supportsNPOT()) {
            powW = width;
            powH = height;
        } else {
            powW = cc.NextPOT(width);
            powH = cc.NextPOT(height);
        }

        //void *data = malloc(powW * powH * 4);
        var dataLen = powW * powH * 4;
        var data = new Uint8Array(dataLen);
        //memset(data, 0, (int)(powW * powH * 4));
        for (var i = 0; i < powW * powH * 4; i++)
            data[i] = 0;

        this._pixelFormat = format;

        this._texture = new cc.Texture2D();
        if (!this._texture)
            return false;

        var locTexture = this._texture;
        locTexture.initWithData(data, this._pixelFormat, powW, powH, cc.size(width, height));
        //free( data );

        var oldRBO = gl.getParameter(gl.RENDERBUFFER_BINDING);

        if (cc.Configuration.getInstance().checkForGLExtension("GL_QCOM")) {
            this._textureCopy = new cc.Texture2D();
            if (!this._textureCopy) {
                return false;
            }
            this._textureCopy.initWithData(data, this._pixelFormat, powW, powH, cc.size(width, height));
        }

        // generate FBO
        this._fBO = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._fBO);

        // associate texture with FBO
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, locTexture._webTextureObj, 0);

        if (depthStencilFormat != 0) {
            //create and attach depth buffer
            this._depthRenderBuffer = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, this._depthRenderBuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, depthStencilFormat, powW, powH);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._depthRenderBuffer);

            // if depth format is the one with stencil part, bind same render buffer as stencil attachment
            //if (depthStencilFormat == gl.DEPTH24_STENCIL8)
            //    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._depthRenderBuffer);
        }

        // check if it worked (probably worth doing :) )
        if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
            cc.log("Could not attach texture to the framebuffer");

        locTexture.setAliasTexParameters();

        this._sprite = cc.Sprite.createWithTexture(locTexture);
        var locSprite = this._sprite;
        locSprite.setScaleY(-1);
        locSprite.setBlendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        gl.bindRenderbuffer(gl.RENDERBUFFER, oldRBO);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._oldFBO);

        // Disabled by default.
        this._autoDraw = false;

        // add sprite for backward compatibility
        this.addChild(locSprite);
        return true;
    },

    /**
     * starts grabbing
     */
    begin: null,

    _beginForCanvas: function () {
        cc.renderContext = this._cacheContext;
        cc.EGLView.getInstance()._setScaleXYForRenderTexture();

        /*// Save the current matrix
         cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
         cc.kmGLPushMatrix();
         cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
         cc.kmGLPushMatrix();*/
    },

    _beginForWebGL: function () {
        // Save the current matrix
        cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
        cc.kmGLPushMatrix();
        cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
        cc.kmGLPushMatrix();

        var director = cc.Director.getInstance();
        director.setProjection(director.getProjection());

        var texSize = this._texture.getContentSizeInPixels();

        // Calculate the adjustment ratios based on the old and new projections
        var size = cc.Director.getInstance().getWinSizeInPixels();
        var widthRatio = size.width / texSize.width;
        var heightRatio = size.height / texSize.height;

        var gl = cc.renderContext;

        // Adjust the orthographic projection and viewport
        gl.viewport(0, 0, texSize.width, texSize.height);

        var orthoMatrix = new cc.kmMat4();
        cc.kmMat4OrthographicProjection(orthoMatrix, -1.0 / widthRatio, 1.0 / widthRatio,
            -1.0 / heightRatio, 1.0 / heightRatio, -1, 1);
        cc.kmGLMultMatrix(orthoMatrix);

        this._oldFBO = gl.getParameter(gl.FRAMEBUFFER_BINDING);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._fBO);//Will direct drawing to the frame buffer created above

        /*  Certain Qualcomm Andreno gpu's will retain data in memory after a frame buffer switch which corrupts the render to the texture.
         *   The solution is to clear the frame buffer before rendering to the texture. However, calling glClear has the unintended result of clearing the current texture.
         *   Create a temporary texture to overcome this. At the end of CCRenderTexture::begin(), switch the attached texture to the second one, call glClear,
         *   and then switch back to the original texture. This solution is unnecessary for other devices as they don't have the same issue with switching frame buffers.
         */
        if (cc.Configuration.getInstance().checkForGLExtension("GL_QCOM")) {
            // -- bind a temporary texture so we can clear the render buffer without losing our texture
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._textureCopy._webTextureObj, 0);
            //cc.CHECK_GL_ERROR_DEBUG();
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._texture._webTextureObj, 0);
        }
    },

    /**
     * starts rendering to the texture while clearing the texture first.<br/>
     * This is more efficient then calling -clear first and then -begin
     * @param {Number} r red 0-1
     * @param {Number} g green 0-1
     * @param {Number} b blue 0-1
     * @param {Number} a alpha 0-1 0 is transparent
     * @param {Number} [depthValue=]
     * @param {Number} [stencilValue=]
     */
    beginWithClear:function (r, g, b, a, depthValue, stencilValue) {
        var gl = cc.renderContext;
        depthValue = depthValue || gl.COLOR_BUFFER_BIT;
        stencilValue = stencilValue || (gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this._beginWithClear(r, g, b, a, depthValue, stencilValue, (gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT));
    },

    _beginWithClear: null,

    _beginWithClearForCanvas: function (r, g, b, a, depthValue, stencilValue, flags) {
        this.begin();

        r = r || 0;
        g = g || 0;
        b = b || 0;
        a = isNaN(a) ? 1 : a;

        //var context = cc.renderContext;
        var context = this._cacheContext;
        var locCanvas = this._cacheCanvas;
        context.save();
        context.fillStyle = "rgba(" + (0 | (r * 255)) + "," + (0 | (g * 255)) + "," + (0 | (b * 255)) + "," + a + ")";
        context.clearRect(0, 0, locCanvas.width, -locCanvas.height);
        context.fillRect(0, 0, locCanvas.width, -locCanvas.height);
        context.restore();
    },

    _beginWithClearForWebGL: function (r, g, b, a, depthValue, stencilValue, flags) {
        this.begin();

        var gl = cc.renderContext;

        // save clear color
        var clearColor = [0.0, 0.0, 0.0, 0.0];
        var depthClearValue = 0.0;
        var stencilClearValue = 0;

        if (flags & gl.COLOR_BUFFER_BIT) {
            clearColor = gl.getParameter(gl.COLOR_CLEAR_VALUE);
            gl.clearColor(r, g, b, a);
        }

        if (flags & gl.DEPTH_BUFFER_BIT) {
            depthClearValue = gl.getParameter(gl.DEPTH_CLEAR_VALUE);
            gl.clearDepth(depthValue);
        }

        if (flags & gl.STENCIL_BUFFER_BIT) {
            stencilClearValue = gl.getParameter(gl.STENCIL_CLEAR_VALUE);
            gl.clearStencil(stencilValue);
        }

        gl.clear(flags);

        // restore
        if (flags & gl.COLOR_BUFFER_BIT)
            gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);

        if (flags & gl.DEPTH_BUFFER_BIT)
            gl.clearDepth(depthClearValue);

        if (flags & gl.STENCIL_BUFFER_BIT)
            gl.clearStencil(stencilClearValue);
    },

    /**
     * ends grabbing
     */
    end: null,

    _endForCanvas: function () {
        cc.renderContext = cc.mainRenderContextBackup;
        cc.EGLView.getInstance()._resetScale();

        //TODO
        /*//restore viewport
         director.setViewport();
         cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
         cc.kmGLPopMatrix();
         cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
         cc.kmGLPopMatrix();*/
    },

    _endForWebGL: function () {
        var gl = cc.renderContext;
        var director = cc.Director.getInstance();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._oldFBO);

        //restore viewport
        director.setViewport();
        cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
        cc.kmGLPopMatrix();
        cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
        cc.kmGLPopMatrix();

        /* var size = director.getWinSizeInPixels();

         // restore viewport
         gl.viewport(0, 0, size.width * cc.CONTENT_SCALE_FACTOR(), size.height * cc.CONTENT_SCALE_FACTOR());

         // special viewport for 3d projection + retina display
         if (director.getProjection() == cc.DIRECTOR_PROJECTION_3D && cc.CONTENT_SCALE_FACTOR() != 1) {
         gl.viewport((-size.width / 2), (-size.height / 2), (size.width * cc.CONTENT_SCALE_FACTOR()), (size.height * cc.CONTENT_SCALE_FACTOR()));
         }

         director.setProjection(director.getProjection());*/
    },

    /**
     * clears the texture with a color
     * @param {Number|cc.Rect} r red 0-1
     * @param {Number} g green 0-1
     * @param {Number} b blue 0-1
     * @param {Number} a alpha 0-1
     */
    clear:function (r, g, b, a) {
        this.beginWithClear(r, g, b, a);
        this.end();
    },

    clearRect:null,

    _clearRectForCanvas:function(x, y, width, height){
        this._cacheContext.clearRect(x, y, width, -height);
    },

    _clearRectForWebGL:function(x, y, width, height){
        //TODO need to implement
    },

    /**
     * clears the texture with a specified depth value
     * @param {Number} depthValue
     */
    clearDepth:null,

    _clearDepthForCanvas:function (depthValue) {
        cc.log("clearDepth isn't supported on Cocos2d-Html5");
    },

    _clearDepthForWebGL:function (depthValue) {
        this.begin();

        var gl = cc.renderContext;
        //! save old depth value
        var depthClearValue = gl.getParameter(gl.DEPTH_CLEAR_VALUE);

        gl.clearDepth(depthValue);
        gl.clear(gl.DEPTH_BUFFER_BIT);

        // restore clear color
        gl.clearDepth(depthClearValue);
        this.end();
    },

    /**
     * clears the texture with a specified stencil value
     * @param {Number} stencilValue
     */
    clearStencil:null,

    _clearStencilForCanvas:function (stencilValue) {
        cc.log("clearDepth isn't supported on Cocos2d-Html5");
    },

    _clearStencilForWebGL:function (stencilValue) {
        var gl = cc.renderContext;
        // save old stencil value
        var stencilClearValue = gl.getParameter(gl.STENCIL_CLEAR_VALUE);

        gl.clearStencil(stencilValue);
        gl.clear(gl.STENCIL_BUFFER_BIT);

        // restore clear color
        gl.clearStencil(stencilClearValue);
    },

    visit:null,

    _visitForCanvas:function (ctx) {
        // override visit.
        // Don't call visit on its children
        if (!this._visible)
            return;

        ctx = ctx || cc.renderContext;
        ctx.save();

        this.draw(ctx);                                                   // update children of RenderTexture before
        this.transform(ctx);
        this._sprite.visit();                                             // draw the RenderTexture

        ctx.restore();

        this._orderOfArrival = 0;
    },

    _visitForWebGL:function (ctx) {
        // override visit.
        // Don't call visit on its children
        if (!this._visible)
            return;

        cc.kmGLPushMatrix();

        var locGrid = this._grid;
        if (locGrid && locGrid.isActive()) {
            locGrid.beforeDraw();
            this.transformAncestors();
        }

        this.transform(ctx);
        this._sprite.visit();
        this.draw(ctx);

        if (locGrid && locGrid.isActive())
            locGrid.afterDraw(this);

        cc.kmGLPopMatrix();

        this._orderOfArrival = 0;
    },

    draw:null,

    _drawForCanvas: function (ctx) {
        ctx = ctx || cc.renderContext;
        if (this._autoDraw) {
            this.begin();

            if (this._clearFlags) {
                var locCanvas = this._cacheCanvas;
                ctx.save();
                ctx.fillStyle = this._clearColorStr;
                ctx.clearRect(0, 0, locCanvas.width, -locCanvas.height);
                ctx.fillRect(0, 0, locCanvas.width, -locCanvas.height);
                ctx.restore();
            }

            //! make sure all children are drawn
            this.sortAllChildren();
            var locChildren = this._children;
            var childrenLen = locChildren.length;
            var selfSprite = this._sprite;
            for (var i = 0; i < childrenLen; i++) {
                var getChild = locChildren[i];
                if (getChild != selfSprite)
                    getChild.visit();
            }

            this.end();
        }
    },

    _drawForWebGL: function (ctx) {
        var gl = cc.renderContext;
        if (this._autoDraw) {
            this.begin();

            var locClearFlags = this._clearFlags;
            if (locClearFlags) {
                var oldClearColor = [0.0, 0.0, 0.0, 0.0];
                var oldDepthClearValue = 0.0;
                var oldStencilClearValue = 0;

                // backup and set
                if (locClearFlags & gl.COLOR_BUFFER_BIT) {
                    oldClearColor = gl.getParameter(gl.COLOR_CLEAR_VALUE);
                    gl.clearColor(this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearColor.a);
                }

                if (locClearFlags & gl.DEPTH_BUFFER_BIT) {
                    oldDepthClearValue = gl.getParameter(gl.DEPTH_CLEAR_VALUE);
                    gl.clearDepth(this._clearDepth);
                }

                if (locClearFlags & gl.STENCIL_BUFFER_BIT) {
                    oldStencilClearValue = gl.getParameter(gl.STENCIL_CLEAR_VALUE);
                    gl.clearStencil(this._clearStencil);
                }

                // clear
                gl.clear(locClearFlags);

                // restore
                if (locClearFlags & gl.COLOR_BUFFER_BIT)
                    gl.clearColor(oldClearColor[0], oldClearColor[1], oldClearColor[2], oldClearColor[3]);

                if (locClearFlags & gl.DEPTH_BUFFER_BIT)
                    gl.clearDepth(oldDepthClearValue);

                if (locClearFlags & gl.STENCIL_BUFFER_BIT)
                    gl.clearStencil(oldStencilClearValue);
            }

            //! make sure all children are drawn
            this.sortAllChildren();
            var locChildren = this._children;
            for (var i = 0; i < locChildren.length; i++) {
                var getChild = locChildren[i];
                if (getChild != this._sprite)
                    getChild.visit();
            }

            this.end();
        }
    },

    /**
     * creates a new CCImage from with the texture's data. Caller is responsible for releasing it by calling delete.
     * @return {cc.Image}
     */
    newCCImage:null,

    _newCCImageForCanvas:function (flipImage) {
        cc.log("saveToFile isn't supported on Cocos2d-Html5");
        return null;
    },

    _newCCImageForWebGL:function (flipImage) {
        cc.log("saveToFile isn't supported on Cocos2d-Html5");

        if(flipImage === null)
            flipImage = true;
        cc.Assert(this._pixelFormat == cc.TEXTURE_2D_PIXEL_FORMAT_RGBA8888, "only RGBA8888 can be saved as image");

        if (!this._texture)
            return null;

        var size = this._texture.getContentSizeInPixels();

        // to get the image size to save
        //        if the saving image domain exeeds the buffer texture domain,
        //        it should be cut
        var nSavedBufferWidth = size.width;
        var nSavedBufferHeight = size.height;

        var pImage = new cc.Image();
        var gl = cc.renderContext;

        var pBuffer = new Uint8Array(nSavedBufferWidth * nSavedBufferHeight * 4);
        if (!(pBuffer))
            return pImage;

        var pTempData = new Uint8Array(nSavedBufferWidth * nSavedBufferHeight * 4);
        if (!(pTempData))
            return null;

        this.begin();
        gl.pixelStorei(gl.PACK_ALIGNMENT, 1);
        gl.readPixels(0, 0, nSavedBufferWidth, nSavedBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pTempData);
        this.end();

        // to get the actual texture data
        // #640 the image read from rendertexture is upseted
        for (var i = 0; i < nSavedBufferHeight; ++i) {
            this._memcpy(pBuffer, i * nSavedBufferWidth * 4,
                pTempData, (nSavedBufferHeight - i - 1) * nSavedBufferWidth * 4,
                nSavedBufferWidth * 4);
        }
        pImage.initWithImageData(pBuffer, nSavedBufferWidth * nSavedBufferHeight * 4, cc.FMT_RAWDATA, nSavedBufferWidth, nSavedBufferHeight, 8);

        pBuffer = null;
        pTempData = null;
        return pImage;
    },

    _memcpy:function (destArr, destIndex, srcArr, srcIndex, size) {
        for (var i = 0; i < size; i++) {
            destArr[destIndex + i] = srcArr[srcIndex + i];
        }
    },

    /**
     * saves the texture into a file using JPEG format. The file will be saved in the Documents folder.
     * Returns YES if the operation is successful.
     * (doesn't support in HTML5)
     * @param {Number} filePath
     * @param {Number} format
     */
    saveToFile:function (filePath, format) {
        cc.log("saveToFile isn't supported on Cocos2d-Html5");
    },

    /**
     * Listen "come to background" message, and save render texture. It only has effect on Android.
     * @param {cc.Class} obj
     */
    listenToBackground:function (obj) {
        cc.log("listenToBackground isn't supported on Cocos2d-Html5");
    },

    /**
     * Listen "come to foreground" message and restore the frame buffer object. It only has effect on Android.
     * @param {cc.Class} obj
     */
    listenToForeground:function (obj) {
        cc.log("listenToForeground isn't supported on Cocos2d-Html5");
    },

    /**
     * Valid flags: GL_COLOR_BUFFER_BIT, GL_DEPTH_BUFFER_BIT, GL_STENCIL_BUFFER_BIT. They can be OR'ed. Valid when "autoDraw is YES.
     * @return {Number}
     */
    getClearFlags:function () {
        return this._clearFlags;
    },

    setClearFlags:function (clearFlags) {
        this._clearFlags = clearFlags;
    },

    /**
     * Clear color value. Valid only when "autoDraw" is true.
     * @return {cc.Color4F}
     */
    getClearColor:function () {
        return this._clearColor;
    },

    setClearColor:null,

    _setClearColorForCanvas:function (clearColor) {
        var locClearColor = this._clearColor;
        locClearColor.r = clearColor.r;
        locClearColor.g = clearColor.g;
        locClearColor.b = clearColor.b;
        locClearColor.a = clearColor.a;

        this._clearColorStr = "rgba(" + (0 | (clearColor.r * 255)) + "," + (0 | (clearColor.g * 255)) + "," + (0 | (clearColor.b * 255)) + "," + clearColor.a + ")";
    },

    _setClearColorForWebGL:function (clearColor) {
        var locClearColor = this._clearColor;
        locClearColor.r = clearColor.r;
        locClearColor.g = clearColor.g;
        locClearColor.b = clearColor.b;
        locClearColor.a = clearColor.a;
    },

    /**
     * Value for clearDepth. Valid only when autoDraw is true.
     * @return {Number}
     */
    getClearDepth:function () {
        return this._clearDepth;
    },

    setClearDepth:function (clearDepth) {
        this._clearDepth = clearDepth;
    },

    /**
     * Value for clear Stencil. Valid only when autoDraw is true
     * @return {Number}
     */
    getClearStencil:function () {
        return this._clearStencil;
    },

    setClearStencil:function (clearStencil) {
        this._clearStencil = clearStencil;
    },

    /**
     * When enabled, it will render its children into the texture automatically. Disabled by default for compatiblity reasons. <br/>
     * Will be enabled in the future.
     * @return {Boolean}
     */
    isAutoDraw:function () {
        return this._autoDraw;
    },

    setAutoDraw:function (autoDraw) {
        this._autoDraw = autoDraw;
    }
});

if(cc.Browser.supportWebGL){
    cc.RenderTexture.prototype.ctor = cc.RenderTexture.prototype._ctorForWebGL;
    cc.RenderTexture.prototype.cleanup = cc.RenderTexture.prototype._cleanupForWebGL;
    cc.RenderTexture.prototype.initWithWidthAndHeight = cc.RenderTexture.prototype._initWithWidthAndHeightForWebGL;
    cc.RenderTexture.prototype.begin = cc.RenderTexture.prototype._beginForWebGL;
    cc.RenderTexture.prototype._beginWithClear = cc.RenderTexture.prototype._beginWithClearForWebGL;
    cc.RenderTexture.prototype.end = cc.RenderTexture.prototype._endForWebGL;
    cc.RenderTexture.prototype.clearRect = cc.RenderTexture.prototype._clearRectForWebGL;
    cc.RenderTexture.prototype.clearDepth = cc.RenderTexture.prototype._clearDepthForWebGL;
    cc.RenderTexture.prototype.clearStencil = cc.RenderTexture.prototype._clearStencilForWebGL;
    cc.RenderTexture.prototype.visit = cc.RenderTexture.prototype._visitForWebGL;
    cc.RenderTexture.prototype.draw = cc.RenderTexture.prototype._drawForWebGL;
    cc.RenderTexture.prototype.newCCImage = cc.RenderTexture.prototype._newCCImageForWebGL;
    cc.RenderTexture.prototype.setClearColor = cc.RenderTexture.prototype._setClearColorForWebGL;
} else {
    cc.RenderTexture.prototype.ctor = cc.RenderTexture.prototype._ctorForCanvas;
    cc.RenderTexture.prototype.cleanup = cc.RenderTexture.prototype._cleanupForCanvas;
    cc.RenderTexture.prototype.initWithWidthAndHeight = cc.RenderTexture.prototype._initWithWidthAndHeightForCanvas;
    cc.RenderTexture.prototype.begin = cc.RenderTexture.prototype._beginForCanvas;
    cc.RenderTexture.prototype._beginWithClear = cc.RenderTexture.prototype._beginWithClearForCanvas;
    cc.RenderTexture.prototype.end = cc.RenderTexture.prototype._endForCanvas;
    cc.RenderTexture.prototype.clearRect = cc.RenderTexture.prototype._clearRectForCanvas;
    cc.RenderTexture.prototype.clearDepth = cc.RenderTexture.prototype._clearDepthForCanvas;
    cc.RenderTexture.prototype.clearStencil = cc.RenderTexture.prototype._clearStencilForCanvas;
    cc.RenderTexture.prototype.visit = cc.RenderTexture.prototype._visitForCanvas;
    cc.RenderTexture.prototype.draw = cc.RenderTexture.prototype._drawForCanvas;
    cc.RenderTexture.prototype.newCCImage = cc.RenderTexture.prototype._newCCImageForCanvas;
    cc.RenderTexture.prototype.setClearColor = cc.RenderTexture.prototype._setClearColorForCanvas;
}

/**
 * creates a RenderTexture object with width and height in Points and a pixel format, only RGB and RGBA formats are valid
 * @param {Number} width
 * @param {Number} height
 * @param {cc.IMAGE_FORMAT_JPEG|cc.IMAGE_FORMAT_PNG|cc.IMAGE_FORMAT_RAWDATA} format
 * @param {Number} depthStencilFormat
 * @return {cc.RenderTexture}
 * @example
 * // Example
 * var rt = cc.RenderTexture.create()
 */
cc.RenderTexture.create = function (width, height, format, depthStencilFormat) {
    format = format || cc.TEXTURE_2D_PIXEL_FORMAT_RGBA8888;
    depthStencilFormat = depthStencilFormat || 0;

    var ret = new cc.RenderTexture();
    if (ret && ret.initWithWidthAndHeight(width, height, format, depthStencilFormat))
        return ret;
    return null;
};
