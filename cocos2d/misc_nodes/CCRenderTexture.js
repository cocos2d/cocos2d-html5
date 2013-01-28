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
 * scenes or objects to render them, and call end. For convienience, render texture<br/>
 * adds a sprite as it's display child with the results, so you can simply add<br/>
 * the render texture to your scene and treat it like any other CocosNode.<br/>
 * There are also functions for saving the render texture to disk in PNG or JPG format.
 * @class
 * @extends cc.Node
 */
cc.RenderTexture = cc.Node.extend(/** @lends cc.RenderTexture# */{
    /**
     * the offscreen canvas for rendering and storing the texture
     * @type HTMLCanvasElement
     */
    canvas:null,
    /**
     * stores a reference to the canvas context object
     * @type CanvasContext
     */
    context:null,
    _fBO:0,
    _depthRenderBuffer:0,
    _oldFBO:0,
    _texture:null,
    _uITextureImage:null,
    _pixelFormat:cc.TEXTURE_PIXELFORMAT_RGBA8888,
    _sprite:null,

    /**
     * Constructor
     */
    ctor:function () {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.setAnchorPoint(cc.p(0, 0));

        // Listen this event to save render texture before come to background.
        // Then it can be restored after coming to foreground on Android.
        /*extension.CCNotificationCenter.sharedNotificationCenter().addObserver(this,
         callfuncO_selector(CCRenderTexture.listenToBackground),
         EVENT_COME_TO_BACKGROUND,
         null);*/
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
     * @return {HTMLCanvasElement}
     */
    getCanvas:function () {
        return this.canvas;
    },

    /**
     * @param {cc.Size} size
     */
    setContentSize:function (size) {
        if (!size) {
            return;
        }

        //if (!cc.Size.CCSizeEqualToSize(size, this._contentSize)) {
        this._super(size);
        this.canvas.width = size.width * 1.5;
        this.canvas.height = size.height * 1.5;

        this.context.translate(0, this.canvas.height);
        //}
    },

    /**
     * @param {Number} width
     * @param {Number} height
     * @param {cc.IMAGE_FORMAT_JPEG|cc.IMAGE_FORMAT_PNG|cc.IMAGE_FORMAT_RAWDATA} format
     * @param {Number} depthStencilFormat
     * @return {Boolean}
     */
    initWithWidthAndHeight:function (width, height, format, depthStencilFormat) {
        if (cc.renderContextType == cc.CANVAS) {
            this.canvas.width = (width == null) ? 10 : width;
            this.canvas.height = (height == null) ? 10 : height;

            this.context.translate(0, this.canvas.height);

            this._sprite = cc.Sprite.createWithTexture(this.canvas);

            return true;
        } else {
            //TODO
            cc.Assert(this._pixelFormat != cc.TEXTURE_PIXELFORMAT_A8, "only RGB and RGBA formats are valid for a render texture");

            try {
                width *= cc.CONTENT_SCALE_FACTOR();
                height *= cc.CONTENT_SCALE_FACTOR();

                glGetIntegerv(gl.FRAMEBUFFER_BINDING, this._oldFBO);

                // textures must be power of two squared
                var powW = 0;
                var powH = 0;

                if (cc.Configuration.getInstance().supportsNPOT()) {
                    powW = width;
                    powH = height;
                } else {
                    powW = cc.NextPOT(width);
                    powH = cc.NextPOT(height);
                }

                //void *data = malloc(powW * powH * 4);
                var data = [];
                //memset(data, 0, (int)(powW * powH * 4));
                for (var i = 0; i < powW * powH * 4; i++) {
                    data[i] = 0;
                }

                this._pixelFormat = format;

                this._texture = new cc.Texture2D();
                if (!this._texture)
                    return false;

                this._texture.initWithData(data, this._pixelFormat, powW, powH, cc.size(width, height));
                //free( data );

                var oldRBO;
                glGetIntegerv(GL_RENDERBUFFER_BINDING, oldRBO);

                // generate FBO
                glGenFramebuffers(1, this._fBO);
                glBindFramebuffer(GL_FRAMEBUFFER, this._fBO);

                // associate texture with FBO
                glFramebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, GL_TEXTURE_2D, this._texture.getName(), 0);

                if (this._depthRenderBuffer != 0) {
                    //create and attach depth buffer
                    glGenRenderbuffers(1, this._depthRenderBuffer);
                    glBindRenderbuffer(GL_RENDERBUFFER, this._depthRenderBuffer);
                    glRenderbufferStorage(GL_RENDERBUFFER, depthStencilFormat, powW, powH);
                    glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, this._depthRenderBuffer);

                    // if depth format is the one with stencil part, bind same render buffer as stencil attachment
                    if (depthStencilFormat == gl.DEPTH24_STENCIL8)
                        glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_STENCIL_ATTACHMENT, GL_RENDERBUFFER, this._depthRenderBuffer);
                }

                // check if it worked (probably worth doing :) )
                cc.Assert(glCheckFramebufferStatus(GL_FRAMEBUFFER) == GL_FRAMEBUFFER_COMPLETE, "Could not attach texture to framebuffer");

                this._texture.setAliasTexParameters();

                this._sprite = cc.Sprite.createWithTexture(this._texture);

                this._sprite.setScaleY(-1);
                this.addChild(this._sprite);

                this._sprite.setBlendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

                glBindRenderbuffer(GL_RENDERBUFFER, oldRBO);
                glBindFramebuffer(GL_FRAMEBUFFER, this._oldFBO);
            } catch (ex) {
                return false;
            }
            return true;
        }
    },

    /**
     * starts grabbing
     */
    begin:function () {
        //TODO
        // Save the current matrix
        kmGLPushMatrix();

        var texSize = this._texture.getContentSizeInPixels();

        // Calculate the adjustment ratios based on the old and new projections
        var size = cc.Director.getInstance().getWinSizeInPixels();
        var widthRatio = size.width / texSize.width;
        var heightRatio = size.height / texSize.height;

        // Adjust the orthographic projection and viewport
        glViewport(0, 0, texSize.width, texSize.height);

        var orthoMatrix;
        kmMat4OrthographicProjection(orthoMatrix, -1.0 / widthRatio, 1.0 / widthRatio,
            -1.0 / heightRatio, 1.0 / heightRatio, -1, 1);
        kmGLMultMatrix(orthoMatrix);

        glGetIntegerv(gl.FRAMEBUFFER_BINDING, this._oldFBO);
        glBindFramebuffer(gl.FRAMEBUFFER, this._fBO);//Will direct drawing to the frame buffer created above
    },

    /**
     * starts rendering to the texture while clearing the texture first.<br/>
     * This is more efficient then calling -clear first and then -begin
     * @param {Number} r red 0-255
     * @param {Number} g green 0-255
     * @param {Number} b blue 0-255
     * @param {Number} depthValue
     * @param {Number} stencilValue
     * @param {Number} a alpha 0-255 0 is transparent
     */
    beginWithClear:function (r, g, b, a, depthValue, stencilValue) {
        //TODO
        var clearColor;
        switch (arguments.length) {
            case 4:
                this.begin();

                // save clear color
                clearColor = [0, 0, 0, 0];
                glGetFloatv(GL_COLOR_CLEAR_VALUE, clearColor);

                glClearColor(r, g, b, a);
                glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

                // restore clear color
                glClearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
                break;
            case 5:
                this.begin();

                // save clear color
                clearColor = [0, 0, 0, 0];
                var depthClearValue;
                glGetFloatv(GL_COLOR_CLEAR_VALUE, clearColor);
                glGetFloatv(GL_DEPTH_CLEAR_VALUE, depthClearValue);

                glClearColor(r, g, b, a);
                glClearDepth(depthValue);
                glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

                // restore clear color
                glClearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
                glClearDepth(depthClearValue);
                break;
            case 6:
                this.begin();

                // save clear color
                clearColor = [0, 0, 0, 0];
                var depthClearValue;
                var stencilClearValue;
                glGetFloatv(GL_COLOR_CLEAR_VALUE, clearColor);
                glGetFloatv(GL_DEPTH_CLEAR_VALUE, depthClearValue);
                glGetIntegerv(GL_STENCIL_CLEAR_VALUE, stencilClearValue);

                glClearColor(r, g, b, a);
                glClearDepth(depthValue);
                glClearStencil(stencilValue);
                glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);

                // restore clear color
                glClearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
                glClearDepth(depthClearValue);
                glClearStencil(stencilClearValue);
                break;
            default :
                throw "unknown arguments";
                break;
        }
    },

    /**
     * ends grabbing
     */
    end:function () {
        glBindFramebuffer(GL_FRAMEBUFFER, this._oldFBO);
        kmGLPopMatrix();

        var director = cc.Director.getInstance();

        var size = director.getWinSizeInPixels();

        // restore viewport
        glViewport(0, 0, size.width * cc.CONTENT_SCALE_FACTOR(), size.height * cc.CONTENT_SCALE_FACTOR());

        // special viewport for 3d projection + retina display
        if (director.getProjection() == cc.DIRECTOR_PROJECTION_3D && cc.CONTENT_SCALE_FACTOR() != 1) {
            glViewport((-size.width / 2), (-size.height / 2), (size.width * cc.CONTENT_SCALE_FACTOR()), (size.height * cc.CONTENT_SCALE_FACTOR()));
        }

        director.setProjection(director.getProjection());
    },

    /**
     * clears the texture with a color
     * @param {Number} r red 0-255
     * @param {Number} g green 0-255
     * @param {Number} b blue 0-255
     * @param {Number} a alpha 0-255
     */
    clear:function (r, g, b, a) {
        if (cc.renderContextType == cc.CANVAS) {
            var rect = r;
            if (rect) {
                this.context.clearRect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
            } else {
                this.context.clearRect(0, 0, this.canvas.width, -this.canvas.height);
            }
        } else {
            this.beginWithClear(r, g, b, a);
            this.end();
        }
    },

    /**
     * clears the texture with a specified depth value
     * @param {Number} dep
     */
    clearDepth:function (dep) {
        this.begin();
        //! save old depth value
        var depthClearValue;
        glGetFloatv(GL_DEPTH_CLEAR_VALUE, depthClearValue);

        glClearDepth(depthValue);
        glClear(GL_DEPTH_BUFFER_BIT);

        // restore clear color
        glClearDepth(depthClearValue);
        this.end();
    },

    /**
     * clears the texture with a specified stencil value
     * @param {Number} stencilValue
     */
    clearStencil:function (stencilValue) {
        // save old stencil value
        var stencilClearValue;
        glGetIntegerv(GL_STENCIL_CLEAR_VALUE, stencilClearValue);

        glClearStencil(stencilValue);
        glClear(GL_STENCIL_BUFFER_BIT);

        // restore clear color
        glClearStencil(stencilClearValue);
    },

    /**
     * creates a new CCImage from with the texture's data. Caller is responsible for releasing it by calling delete.
     * @return {cc.Image}
     */
    newCCImage:function () {
        cc.Assert(this._pixelFormat == cc.TEXTURE_PIXELFORMAT_RGBA8888, "only RGBA8888 can be saved as image");

        if (!this._texture) {
            return null;
        }

        var size = this._texture.getContentSizeInPixels();

        // to get the image size to save
        //        if the saving image domain exeeds the buffer texture domain,
        //        it should be cut
        var nSavedBufferWidth = size.width;
        var nSavedBufferHeight = size.height;

        var pBuffer = null;
        var pTempData = null;
        var pImage = new cc.Image();

        try {
            pBuffer = [];
            pBuffer.length = nSavedBufferWidth * nSavedBufferHeight * 4;
            if (!(pBuffer))
                return pImage;

            pTempData = [];
            pTempData.length = nSavedBufferWidth * nSavedBufferHeight * 4;
            if (!(pTempData)) {
                pBuffer = null;
                return pImage;
            }

            this.begin();
            glPixelStorei(GL_PACK_ALIGNMENT, 1);
            glReadPixels(0, 0, nSavedBufferWidth, nSavedBufferHeight, GL_RGBA, GL_UNSIGNED_BYTE, pTempData);
            this.end();

            // to get the actual texture data
            // #640 the image read from rendertexture is upseted
            for (var i = 0; i < nSavedBufferHeight; ++i) {
                this._memcpy(pBuffer, i * nSavedBufferWidth * 4,
                    pTempData, (nSavedBufferHeight - i - 1) * nSavedBufferWidth * 4,
                    nSavedBufferWidth * 4);
            }

            pImage.initWithImageData(pBuffer, nSavedBufferWidth * nSavedBufferHeight * 4, cc.FMT_RAWDATA, nSavedBufferWidth, nSavedBufferHeight, 8);
        } catch (ex) {
            return pImage;
        }

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
     * @param {Number} filePath
     * @param {Number} format
     */
    saveToFile:function (filePath, format) {
        if (!format)
            filePath = cc.FileUtils.getInstance().getWriteablePath() + filePath;
        format = format || cc.IMAGE_FORMAT_JPEG;

        cc.Assert(format == cc.IMAGE_FORMAT_JPEG || format == cc.IMAGE_FORMAT_PNG,
            "the image can only be saved as JPG or PNG format");

        var pImage = this.newCCImage();
        if (pImage) {
            return pImage.saveToFile(filePath, true);
        }
        return false;
    },

    /**
     * Listen "come to background" message, and save render texture. It only has effect on Android.
     * @param {cc.Class} obj
     */
    listenToBackground:function (obj) {
        if (cc.ENABLE_CACHE_TEXTURE_DATA) {
            cc.SAFE_DELETE(this.pITextureImage);

            // to get the rendered texture data
            this.pITextureImage = this.newCCImage();

            if (this.pITextureImage) {
                var s = this._texture.getContentSizeInPixels();
                VolatileTexture.addDataTexture(this._texture, this.pITextureImage.getData(), cc.TEXTURE_PIXELFORMAT_RGBA8888, s);
            } else {
                cc.log("Cache rendertexture failed!");
            }
        }
    }
});

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
    format = format || cc.TEXTURE_PIXELFORMAT_RGBA8888;
    depthStencilFormat = depthStencilFormat || 0;

    var ret = new cc.RenderTexture();
    if (ret && ret.initWithWidthAndHeight(width, height, format, depthStencilFormat)) {
        return ret;
    }
    return null;
};
