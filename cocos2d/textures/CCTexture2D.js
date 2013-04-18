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

//----------------------Possible texture pixel formats----------------------------
/**
 * 32-bit texture: RGBA8888
 * @constant
 * @type {Number}
 */
cc.TEXTURE_2D_PIXEL_FORMAT_RGBA8888 = 0;

/**
 * 24-bit texture: RGBA888
 * @constant
 * @type {Number}
 */
cc.TEXTURE_2D_PIXEL_FORMAT_RGB888 = 1;

/**
 * 16-bit texture without Alpha channel
 * @constant
 * @type {Number}
 */
cc.TEXTURE_2D_PIXEL_FORMAT_RGB565 = 2;

/**
 * 8-bit textures used as masks
 * @constant
 * @type {Number}
 */
cc.TEXTURE_2D_PIXEL_FORMAT_A8 = 3;

/**
 * 8-bit intensity texture
 * @constant
 * @type {Number}
 */
cc.TEXTURE_2D_PIXEL_FORMAT_I8 = 4;

/**
 * 16-bit textures used as masks
 * @constant
 * @type {Number}
 */
cc.TEXTURE_2D_PIXEL_FORMAT_AI88 = 5;

/**
 * 16-bit textures: RGBA4444
 * @constant
 * @type {Number}
 */
cc.TEXTURE_2D_PIXEL_FORMAT_RGBA4444 = 6;

/**
 * 16-bit textures: RGB5A1
 * @constant
 * @type {Number}
 */
cc.TEXTURE_2D_PIXEL_FORMAT_RGB5A1 = 7;

/**
 * 4-bit PVRTC-compressed texture: PVRTC4
 * @constant
 * @type {Number}
 */
cc.TEXTURE_2D_PIXEL_FORMAT_PVRTC4 = 8;

/**
 * 2-bit PVRTC-compressed texture: PVRTC2
 * @constant
 * @type {Number}
 */
cc.TEXTURE_2D_PIXEL_FORMAT_PVRTC2 = 9;

/**
 * Default texture format: RGBA8888
 * @constant
 * @type {Number}
 */
cc.TEXTURE_2D_PIXEL_FORMAT_DEFAULT = cc.TEXTURE_2D_PIXEL_FORMAT_RGBA8888;

// If the image has alpha, you can create RGBA8 (32-bit) or RGBA4 (16-bit) or RGB5A1 (16-bit)
// Default is: RGBA8888 (32-bit textures)
cc._defaultAlphaPixelFormat = cc.TEXTURE_2D_PIXEL_FORMAT_DEFAULT;

// By default PVR images are treated as if they don't have the alpha channel premultiplied
cc.PVRHaveAlphaPremultiplied_ = false;

/**
 Extension to set the Min / Mag filter
 */
cc._texParams = function (minFilter, magFilter, wrapS, wrapT) {
    this.minFilter = minFilter || 0;
    this.magFilter = magFilter || 0;
    this.wrapS = wrapS || 0;
    this.wrapT = wrapT || 0;
};

/**
 * <p>
 * This class allows to easily create OpenGL 2D textures from images, text or raw data.                                    <br/>
 * The created cc.Texture2D object will always have power-of-two dimensions.                                                <br/>
 * Depending on how you create the cc.Texture2D object, the actual image area of the texture might be smaller than the texture dimensions <br/>
 *  i.e. "contentSize" != (pixelsWide, pixelsHigh) and (maxS, maxT) != (1.0, 1.0).                                           <br/>
 * Be aware that the content of the generated textures will be upside-down! </p>
 * @class
 * @extends cc.Class
 */
cc.Texture2D = cc.Class.extend(/** @lends cc.Texture2D# */{
    // By default PVR images are treated as if they don't have the alpha channel premultiplied
    _pVRHaveAlphaPremultiplied:null,
    _pixelFormat:null,
    _pixelsWide:null,
    _pixelsHigh:null,
    _name:null,
    _contentSize:null,
    _maxS:null,
    _maxT:null,
    _hasPremultipliedAlpha:null,
    _hasMipmaps:false,

    _shaderProgram:null,

    _isLoaded:false,
    _htmlElementObj:null,
    _webTextureObj:null,

    /*public:*/
    ctor:function () {
        this._pixelsWide = 0;
        this._pixelsWide = 0;
        this._name = "";
        this._maxS = 0;
        this._maxT = 0;
        this._hasPremultipliedAlpha = false;
        this._hasMipmaps = false;
        this._pVRHaveAlphaPremultiplied = true;
        this._pixelFormat = cc.Texture2D.defaultAlphaPixelFormat();
    },

    /**
     * pixel format of the texture
     * @return {Number}
     */
    getPixelFormat:function () {
        return this._pixelFormat;
    },

    /**
     * width in pixels
      * @return {Number}
     */
    getPixelsWide:function () {
        return this._pixelsWide;
    },

    /**
     * hight in pixels
     * @return {Number}
     */
    getPixelsHigh:function () {
        return this._pixelsHigh;
    },

    /**
     * get WebGLTexture Object
     * @return {WebGLTexture}
     */
    getName:function () {
        return this._webTextureObj;
    },

    /**
     * content size
     * @return {cc.Size}
     */
    getContentSize:function(){
        return cc.size(this._contentSize.width / cc.CONTENT_SCALE_FACTOR(), this._contentSize.height / cc.CONTENT_SCALE_FACTOR());
    },

    getContentSizeInPixels:function () {
        return this._contentSize;
    },

    /** texture max S */
    getMaxS:function () {
        return this._maxS;
    },

    setMaxS:function (maxS) {
        this._maxS = maxS;
    },

    /** texture max T */
    getMaxT:function () {
        return this._maxT;
    },

    setMaxT:function (maxT) {
        this._maxT = maxT;
    },

    /**
     * return shader program used by drawAtPoint and drawInRect
     * @return {cc.GLProgram}
     */
    getShaderProgram:function(){
        return this._shaderProgram;
    },

    /**
     * set shader program used by drawAtPoint and drawInRect
     * @param {cc.GLProgram} shaderProgram
     */
    setShaderProgram:function(shaderProgram){
        this._shaderProgram = shaderProgram;
    },

    /**
     * whether or not the texture has their Alpha premultiplied
     * @return {Boolean}
     */
    hasPremultipliedAlpha:function () {
        return this._hasPremultipliedAlpha;
    },

    hasMipmaps:function(){
        return this._hasMipmaps;
    },

    description:function () {
        return "<cc.Texture2D | Name = " + this._name + " | Dimensions = " + this._pixelsWide + " x " + this._pixelsHigh
            + " | Coordinates = (" + this._maxS + ", " + this._maxT + ")>";
    },

    /**
     * These functions are needed to create mutable textures
     * @param {Array} data
     */
    releaseData:function (data) {
        data = null;
    },

    keepData:function (data, length) {
        //The texture data mustn't be saved becuase it isn't a mutable texture.
        return data;
    },

    /**
     * Intializes with a texture2d with data
     * @param {Array} data
     * @param {Number} pixelFormat
     * @param {Number} pixelsWide
     * @param {Number} pixelsHigh
     * @param {cc.Size} contentSize
     * @return {Boolean}
     */
    initWithData:function (data, pixelFormat, pixelsWide, pixelsHigh, contentSize) {
        var gl = cc.renderContext;
        // XXX: 32 bits or POT textures uses UNPACK of 4 (is this correct ??? )
        if( pixelFormat === cc.TEXTURE_2D_PIXEL_FORMAT_RGBA8888 || ( cc.NextPOT(pixelsWide)==pixelsWide && cc.NextPOT(pixelsHigh)==pixelsHigh) )
            gl.pixelStorei(gl.UNPACK_ALIGNMENT,4);
        else
            gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);

        this._webTextureObj = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this._webTextureObj);

        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );

        // Specify OpenGL texture image
        switch (pixelFormat) {
            case cc.TEXTURE_2D_PIXEL_FORMAT_RGBA8888:
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, pixelsWide, pixelsHigh, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
                break;
            case cc.TEXTURE_2D_PIXEL_FORMAT_RGB888:
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, pixelsWide, pixelsHigh, 0, gl.RGB, gl.UNSIGNED_BYTE, data);
                break;
            case cc.TEXTURE_2D_PIXEL_FORMAT_RGBA4444:
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, pixelsWide, pixelsHigh, 0, gl.RGBA, gl.UNSIGNED_SHORT_4_4_4_4, data);
                break;
            case cc.TEXTURE_2D_PIXEL_FORMAT_RGB5A1:
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, pixelsWide, pixelsHigh, 0, gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1, data);
                break;
            case cc.TEXTURE_2D_PIXEL_FORMAT_RGB565:
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, pixelsWide, pixelsHigh, 0, gl.RGB, gl.UNSIGNED_SHORT_5_6_5, data);
                break;
            case cc.TEXTURE_2D_PIXEL_FORMAT_AI88:
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE_ALPHA, pixelsWide, pixelsHigh, 0, gl.LUMINANCE_ALPHA, gl.UNSIGNED_BYTE, data);
                break;
            case cc.TEXTURE_2D_PIXEL_FORMAT_A8:
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, pixelsWide, pixelsHigh, 0, gl.ALPHA, gl.UNSIGNED_BYTE, data);
                break;
            case cc.TEXTURE_2D_PIXEL_FORMAT_I8:
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, pixelsWide, pixelsHigh, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, data);
                break;
            default:
                cc.Assert(0, "NSInternalInconsistencyException");
                break;
        }

        this._contentSize = contentSize;
        this._pixelsWide = pixelsWide;
        this._pixelsHigh = pixelsHigh;
        this._pixelFormat = pixelFormat;
        this._maxS = contentSize.width / pixelsWide;
        this._maxT = contentSize.height / pixelsHigh;

        this._hasPremultipliedAlpha = false;
        this._hasMipmaps = false;
        this.setShaderProgram(cc.ShaderCache.getInstance().programForKey(cc.SHADER_POSITION_TEXTURE));

        this._isLoaded = true;

        return true;
    },

    /**
     Drawing extensions to make it easy to draw basic quads using a CCTexture2D object.
     These functions require gl.TEXTURE_2D and both gl.VERTEX_ARRAY and gl.TEXTURE_COORD_ARRAY client states to be enabled.
     */

    /**
     * draws a texture at a given point
     * @param {cc.Point} point
     */
    drawAtPoint:function (point) {
        var coordinates = [
            0.0, this._maxT,
            this._maxS, this._maxT,
            0.0, 0.0,
            this._maxS, 0.0 ];

        var width = this._pixelsWide * this._maxS,
            height = this._pixelsHigh * this._maxT;

        var vertices = [
            point.x, point.y, 0.0,
            width + point.x, point.y, 0.0,
            point.x, height + point.y, 0.0,
            width + point.x, height + point.y, 0.0 ];

        cc.glEnableVertexAttribs( cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_TEXCOORDS );
        this._shaderProgram.use();
        this._shaderProgram.setUniformsForBuiltins();

        cc.glBindTexture2D( this );

        var gl = cc.renderContext;
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, gl.FLOAT, false, 0, vertices);
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 0, coordinates);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },

    /**
     * draws a texture inside a rect
     * @param {cc.Rect} rect
     */
    drawInRect:function (rect) {
        var coordinates = [
            0.0, this._maxT,
            this._maxS, this._maxT,
            0.0, 0.0,
            this._maxS, 0.0];

        var vertices = [    rect.origin.x, rect.origin.y, /*0.0,*/
            rect.origin.x + rect.size.width, rect.origin.y, /*0.0,*/
            rect.origin.x, rect.origin.y + rect.size.height, /*0.0,*/
            rect.origin.x + rect.size.width, rect.origin.y + rect.size.height        /*0.0*/ ];

        cc.glEnableVertexAttribs( cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_TEXCOORDS );
        this._shaderProgram.use();
        this._shaderProgram.setUniformsForBuiltins();

        cc.glBindTexture2D( this );

        var gl = cc.renderContext;
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, gl.FLOAT, false, 0, vertices);
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 0, coordinates);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },

    /**
     Extensions to make it easy to create a CCTexture2D object from an image file.
     Note that RGBA type textures will have their alpha premultiplied - use the blending mode (gl.ONE, gl.ONE_MINUS_SRC_ALPHA).
     */

    /**
     * Initializes a texture from a UIImage object
     * @param uiImage
     * @return {Boolean}
     */
    initWithImage:function (uiImage) {
        if (uiImage == null) {
            cc.log("cocos2d: cc.Texture2D. Can't create Texture. UIImage is nil");
            return false;
        }

        var imageWidth = uiImage.getWidth();
        var imageHeight = uiImage.getHeight();

        var conf = cc.Configuration.getInstance();

        var maxTextureSize = conf.getMaxTextureSize();
        if (imageWidth > maxTextureSize || imageHeight > maxTextureSize) {
            cc.log("cocos2d: WARNING: Image (" + imageWidth + " x " + imageHeight+ ") is bigger than the supported " + maxTextureSize + " x " + maxTextureSize);
            return false;
        }
        this._isLoaded = true;

        // always load premultiplied images
        return this._initPremultipliedATextureWithImage(uiImage, imageWidth, imageHeight);
    },

    initWithElement:function(element){
        if(!element)
            return;

        this._webTextureObj = cc.renderContext.createTexture();
        this._htmlElementObj = element;
    },

    isLoaded:function(){
       return this._isLoaded;
    },

    handleLoadedTexture:function(){
        this._isLoaded = true;
        //upload image to buffer
        var gl = cc.renderContext;

        var pixelsWide = this._htmlElementObj.width;
        var pixelsHigh = this._htmlElementObj.height;

        cc.glBindTexture2D(this);

        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);

        // Specify OpenGL texture image
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._htmlElementObj);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        this._contentSize = new cc.Size(pixelsWide,pixelsHigh);
        this._pixelsWide = pixelsWide;
        this._pixelsHigh = pixelsHigh;
        this._pixelFormat = cc.TEXTURE_2D_PIXEL_FORMAT_RGBA8888;
        this._maxS = 1;
        this._maxT = 1;

        this._hasPremultipliedAlpha = false;
        this._hasMipmaps = false;

        this.setShaderProgram(cc.ShaderCache.getInstance().programForKey(cc.SHADER_POSITION_TEXTURE));

        gl.bindTexture(gl.TEXTURE_2D, null);
    },

    /**
     Extensions to make it easy to create a cc.Texture2D object from a string of text.
     Note that the generated textures are of type A8 - use the blending mode (gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA).
     */
    /**
     * Initializes a texture from a string with dimensions, alignment, font name and font size
     * @param {String} text
     * @param {String} fontName
     * @param {Number} fontSize
     * @param {cc.Size} dimensions
     * @param {Number} hAlignment
     * @param {Number} vAlignment
     * @return {Boolean}
     */
    initWithString:function (text, fontName, fontSize, dimensions, hAlignment, vAlignment) {
        if (arguments.length == 3) {
            fontName = arguments[1];
            fontSize = arguments[2];
            dimensions = cc.size(0, 0);
            hAlignment = cc.TEXT_ALIGNMENT_CENTER;
            vAlignment = cc.VERTICAL_TEXT_ALIGNMENT_TOP;
        }

        /*if (cc.ENABLE_CACHE_TEXTURE_DATA) {
            // cache the texture data
            cc.VolatileTexture.addStringTexture(this, text, dimensions, alignment, fontName, fontSize);
        }*/

        var image = new cc.Image();
        var eAlign ;

        if(cc.VERTICAL_TEXT_ALIGNMENT_TOP === vAlignment){
            eAlign = (cc.TEXT_ALIGNMENT_CENTER === hAlignment) ? cc.ALIGN_TOP
                : (cc.TEXT_ALIGNMENT_LEFT === hAlignment) ? cc.ALIGN_TOP_LEFT : cc.ALIGN_TOP_RIGHT;
        }else if(cc.VERTICAL_TEXT_ALIGNMENT_CENTER === vAlignment){
            eAlign = (cc.TEXT_ALIGNMENT_CENTER === hAlignment) ? cc.ALIGN_CENTER
                : (cc.TEXT_ALIGNMENT_LEFT === hAlignment) ? cc.ALIGN_LEFT : cc.ALIGN_RIGHT;
        }else if(cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM === vAlignment){
            eAlign = (cc.TEXT_ALIGNMENT_CENTER === hAlignment) ? cc.ALIGN_BOTTOM
                : (cc.TEXT_ALIGNMENT_LEFT === hAlignment) ? cc.ALIGN_BOTTOM_LEFT : cc.ALIGN_BOTTOM_RIGHT;
        } else {
            cc.Assert(false, "Not supported alignment format!");
        }

        if (!image.initWithString(text, dimensions.width, dimensions.height, eAlign, fontName, fontSize))
            return false;

        return this.initWithImage(image);
    },

    /**
     * Initializes a texture from a PVR file
     * @param {String} file
     * @return {Boolean}
     */
    initWithPVRFile:function (file) {
        var ret = false;
        // nothing to do with cc.Object.init

        var pvr = new cc.TexturePVR;
        ret = pvr.initWithContentsOfFile(file);

        if (ret) {
            pvr.setRetainName(true); // don't dealloc texture on release

            this._name = pvr.getName();
            this._maxS = 1.0;
            this._maxT = 1.0;
            this._pixelsWide = pvr.getWidth();
            this._pixelsHigh = pvr.getHeight();
            this._contentSize = cc.size(this._pixelsWide, this._pixelsHigh);
            this._hasPremultipliedAlpha = cc.PVRHaveAlphaPremultiplied_;
            this._pixelFormat = pvr.getFormat();

            this.setAntiAliasTexParameters();
        } else {
            cc.log("cocos2d: Couldn't load PVR image " + file);
        }
        return ret;
    },

    /**
     Extensions to make it easy to create a cc.Texture2D object from a PVRTC file
     Note that the generated textures don't have their alpha premultiplied - use the blending mode (gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA).
     */
    /**
     * Initializes a texture from a PVRTC buffer
     * @param {Array} data
     * @param {Number} level
     * @param {Number} bpp
     * @param {Boolean} hasAlpha
     * @param {Number} length
     * @param {Number} pixelFormat
     * @return {Boolean}
     */
    initWithPVRTCData:function (data, level, bpp, hasAlpha, length, pixelFormat) {
        if (!(cc.Configuration.getInstance().supportsPVRTC())) {
            cc.log("cocos2d: WARNING: PVRTC images is not supported.");
            return false;
        }

        var gl = cc.renderContext;
        this._webTextureObj = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this._webTextureObj);

        this.setAntiAliasTexParameters();

        var format;
        var size = length * length * bpp / 8;
        if (hasAlpha) {
            format = (bpp == 4) ? gl.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG : gl.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
        } else {
            format = (bpp == 4) ? gl.COMPRESSED_RGB_PVRTC_4BPPV1_IMG : gl.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        }
        if (size < 32) {
            size = 32;
        }
        //TODO
        gl.compressedTexImage2D(gl.TEXTURE_2D, level, format, length, length, 0, size, data);

        this._contentSize = cc.size(length, length);
        this._pixelsWide = length;
        this._pixelsHigh = length;
        this._maxS = 1.0;
        this._maxT = 1.0;
        this._hasPremultipliedAlpha = cc.PVRHaveAlphaPremultiplied_;
        this._pixelFormat = pixelFormat;

        return true;
    },

    /**
     * sets the min filter, mag filter, wrap s and wrap t texture parameters. <br/>
     * If the texture size is NPOT (non power of 2), then in can only use gl.CLAMP_TO_EDGE in gl.TEXTURE_WRAP_{S,T}.
     * @param texParams
     */
    setTexParameters:function (texParams) {
        var gl = cc.renderContext;

        cc.Assert((this._pixelsWide == cc.NextPOT(this._pixelsWide) && this._pixelsHigh == cc.NextPOT(this._pixelsHigh)) ||
            (texParams.wrapS == gl.CLAMP_TO_EDGE && texParams.wrapT == gl.CLAMP_TO_EDGE),
            "WebGLRenderingContext.CLAMP_TO_EDGE should be used in NPOT textures");

        cc.glBindTexture2D(this);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texParams.minFilter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texParams.magFilter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, texParams.wrapS);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, texParams.wrapT);

        //TODO
        //VolatileTexture::setTexParameters(this, texParams);
    },

    /**
     * sets antialias texture parameters:              <br/>
     *  - GL_TEXTURE_MIN_FILTER = GL_NEAREST           <br/>
     *  - GL_TEXTURE_MAG_FILTER = GL_NEAREST
     */
    setAntiAliasTexParameters:function () {
        var gl = cc.renderContext;

        cc.glBindTexture2D(this);
        if(!this._hasMipmaps)
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        else
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
        //TODO
        /*#if CC_ENABLE_CACHE_TEXTURE_DATA
                    ccTexParams texParams = {m_bHasMipmaps?GL_LINEAR_MIPMAP_NEAREST:GL_LINEAR,GL_LINEAR,GL_NONE,GL_NONE};
                VolatileTexture::setTexParameters(this, &texParams);
        #endif*/
    },

    /**
     *  sets alias texture parameters:
     *   GL_TEXTURE_MIN_FILTER = GL_NEAREST
     *   GL_TEXTURE_MAG_FILTER = GL_NEAREST
     */
    setAliasTexParameters:function(){
        var gl = cc.renderContext;

        cc.glBindTexture2D(this);
        if(!this._hasMipmaps)
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER, gl.NEAREST);
         else
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

        //TODO
        /*#if CC_ENABLE_CACHE_TEXTURE_DATA
                    ccTexParams texParams = {m_bHasMipmaps?GL_NEAREST_MIPMAP_NEAREST:GL_NEAREST,GL_NEAREST,GL_NONE,GL_NONE};
                VolatileTexture::setTexParameters(this, &texParams);
        #endif*/
    },

    /**
     *  Generates mipmap images for the texture.<br/>
     *  It only works if the texture size is POT (power of 2).
     */
    generateMipmap:function () {
        cc.Assert(this._pixelsWide == cc.NextPOT(this._pixelsWide) && this._pixelsHigh == cc.NextPOT(this._pixelsHigh), "Mimpap texture only works in POT textures");

        cc.glBindTexture2D(this);
        cc.renderContext.generateMipmap(cc.renderContext.TEXTURE_2D);
        this._hasMipmaps = true;
    },

    /**
     * returns the pixel format.
     * @return {String}
     */
    stringForFormat:function(){
        switch (this._pixelFormat) {
            case cc.TEXTURE_2D_PIXEL_FORMAT_RGBA8888:
                return  "RGBA8888";

            case cc.TEXTURE_2D_PIXEL_FORMAT_RGB888:
                return  "RGB888";

            case cc.TEXTURE_2D_PIXEL_FORMAT_RGB565:
                return  "RGB565";

            case cc.TEXTURE_2D_PIXEL_FORMAT_RGBA4444:
                return  "RGBA4444";

            case cc.TEXTURE_2D_PIXEL_FORMAT_RGB5A1:
                return  "RGB5A1";

            case cc.TEXTURE_2D_PIXEL_FORMAT_AI88:
                return  "AI88";

            case cc.TEXTURE_2D_PIXEL_FORMAT_A8:
                return  "A8";

            case cc.TEXTURE_2D_PIXEL_FORMAT_I8:
                return  "I8";

            case cc.TEXTURE_2D_PIXEL_FORMAT_PVRTC4:
                return  "PVRTC4";

            case cc.TEXTURE_2D_PIXEL_FORMAT_PVRTC2:
                return  "PVRTC2";

            default:
                cc.Assert(false , "unrecognized pixel format");
                cc.log("stringForFormat: " + this._pixelFormat + ", cannot give useful result");
                break;
        }
       return "";
    },

    /**
     * returns the bits-per-pixel of the in-memory OpenGL texture
     * @return {Number}
     */
    bitsPerPixelForFormat:function (format) {
        format = format || this._pixelFormat;
        switch (format) {
            case cc.TEXTURE_2D_PIXEL_FORMAT_RGBA8888:
                return 32;

            case cc.TEXTURE_2D_PIXEL_FORMAT_RGB888:
                return 32;

            case cc.TEXTURE_2D_PIXEL_FORMAT_RGB565:
                return 16;

            case cc.TEXTURE_2D_PIXEL_FORMAT_A8:
                return 8;

            case cc.TEXTURE_2D_PIXEL_FORMAT_RGBA4444:
                return 16;

            case cc.TEXTURE_2D_PIXEL_FORMAT_RGB5A1:
                return 16;

            case cc.TEXTURE_2D_PIXEL_FORMAT_PVRTC4:
                return 4;

            case cc.TEXTURE_2D_PIXEL_FORMAT_PVRTC2:
                return 2;

            case cc.TEXTURE_2D_PIXEL_FORMAT_I8:
                return 8;

            case cc.TEXTURE_2D_PIXEL_FORMAT_AI88:
                return 16;

            default:
                cc.Assert(false, "illegal pixel format");
                cc.log("bitsPerPixelForFormat: " + this._pixelFormat + ", cannot give useful result");
                return -1;
        }
    },

    _initPremultipliedATextureWithImage:function (uiImage, width, height) {
        var tempData = uiImage.getData();
        var inPixel32 = null;
        var inPixel8 = null;
        var outPixel16 = null;
        var hasAlpha = uiImage.hasAlpha();
        var imageSize = cc.size(uiImage.getWidth(), uiImage.getHeight());
        var pixelFormat = cc.TEXTURE_2D_PIXEL_FORMAT_DEFAULT;
        var bpp = uiImage.getBitsPerComponent();
        var i;

        // compute pixel format
        if (!hasAlpha) {
            if (bpp >= 8) {
                pixelFormat = cc.TEXTURE_2D_PIXEL_FORMAT_RGB888;
            } else {
                cc.log("cocos2d: cc.Texture2D: Using RGB565 texture since image has no alpha");
                pixelFormat = cc.TEXTURE_2D_PIXEL_FORMAT_RGB565;
            }
        }

        // Repack the pixel data into the right format
        var length = width * height;

        if (pixelFormat == cc.TEXTURE_2D_PIXEL_FORMAT_RGB565) {
            if (hasAlpha) {
                // Convert "RRRRRRRRRGGGGGGGGBBBBBBBBAAAAAAAA" to "RRRRRGGGGGGBBBBB"
                tempData = new Uint16Array(width * height);
                inPixel32 = uiImage.getData();

                for (i = 0; i < length; ++i) {
                    tempData[i] =
                        ((((inPixel32[i] >> 0) & 0xFF) >> 3) << 11) | // R
                            ((((inPixel32[i] >> 8) & 0xFF) >> 2) << 5) | // G
                            ((((inPixel32[i] >> 16) & 0xFF) >> 3) << 0);    // B
                }
            } else {
                // Convert "RRRRRRRRRGGGGGGGGBBBBBBBB" to "RRRRRGGGGGGBBBBB"
                tempData = new Uint16Array(width * height);
                inPixel8 = uiImage.getData();

                for (i = 0; i < length; ++i) {
                    tempData[i] =
                        (((inPixel8[i] & 0xFF) >> 3) << 11) | // R
                            (((inPixel8[i] & 0xFF) >> 2) << 5) | // G
                            (((inPixel8[i] & 0xFF) >> 3) << 0);    // B
                }
            }
        } else if (pixelFormat == cc.TEXTURE_2D_PIXEL_FORMAT_RGBA4444) {
            // Convert "RRRRRRRRRGGGGGGGGBBBBBBBBAAAAAAAA" to "RRRRGGGGBBBBAAAA"
            tempData = new Uint16Array(width * height);
            inPixel32 = uiImage.getData();

            for (i = 0; i < length; ++i) {
                tempData[i] =
                    ((((inPixel32[i] >> 0) & 0xFF) >> 4) << 12) | // R
                        ((((inPixel32[i] >> 8) & 0xFF) >> 4) << 8) | // G
                        ((((inPixel32[i] >> 16) & 0xFF) >> 4) << 4) | // B
                        ((((inPixel32[i] >> 24) & 0xFF) >> 4) << 0);  // A
            }
        } else if (pixelFormat == cc.TEXTURE_2D_PIXEL_FORMAT_RGB5A1) {
            // Convert "RRRRRRRRRGGGGGGGGBBBBBBBBAAAAAAAA" to "RRRRRGGGGGBBBBBA"
            tempData = new Uint16Array(width * height);
            inPixel32 = uiImage.getData();

            for (i = 0; i < length; ++i) {
                tempData[i] =
                    ((((inPixel32[i] >> 0) & 0xFF) >> 3) << 11) | // R
                        ((((inPixel32[i] >> 8) & 0xFF) >> 3) << 6) | // G
                        ((((inPixel32[i] >> 16) & 0xFF) >> 3) << 1) | // B
                        ((((inPixel32[i] >> 24) & 0xFF) >> 7) << 0);  // A
            }
        } else if (pixelFormat == cc.TEXTURE_2D_PIXEL_FORMAT_A8) {
            // Convert "RRRRRRRRRGGGGGGGGBBBBBBBBAAAAAAAA" to "AAAAAAAA"
            tempData = new Uint8Array(width * height);
            inPixel32 = uiImage.getData();

            for (i = 0; i < length; ++i) {
                tempData[i] = (inPixel32 >> 24) & 0xFF;  // A
            }
        }

        if (hasAlpha && pixelFormat == cc.TEXTURE_2D_PIXEL_FORMAT_RGB888) {
            // Convert "RRRRRRRRRGGGGGGGGBBBBBBBBAAAAAAAA" to "RRRRRRRRGGGGGGGGBBBBBBBB"
            inPixel32 = uiImage.getData();
            tempData = new Uint8Array(width * height * 3);

            for (i = 0; i < length; ++i) {
                tempData[i * 3] = (inPixel32 >> 0) & 0xFF; // R
                tempData[i * 3 + 1] = (inPixel32 >> 8) & 0xFF; // G
                tempData[i * 3 + 2] = (inPixel32 >> 16) & 0xFF; // B
            }
        }

        this.initWithData(tempData, pixelFormat, width, height, imageSize);

        if (tempData != uiImage.getData())
            tempData = null;

        this._hasPremultipliedAlpha = uiImage.isPremultipliedAlpha();
        return true;
    }
});

/**
 * <p>
 *     sets the default pixel format for UIImagescontains alpha channel.                                             <br/>
 *     If the UIImage contains alpha channel, then the options are:                                                  <br/>
 *      - generate 32-bit textures: cc.TEXTURE_2D_PIXEL_FORMAT_RGBA8888 (default one)                                <br/>
 *      - generate 24-bit textures: cc.TEXTURE_2D_PIXEL_FORMAT_RGB888                                                <br/>
 *      - generate 16-bit textures: cc.TEXTURE_2D_PIXEL_FORMAT_RGBA4444                                              <br/>
 *      - generate 16-bit textures: cc.TEXTURE_2D_PIXEL_FORMAT_RGB5A1                                                <br/>
 *      - generate 16-bit textures: cc.TEXTURE_2D_PIXEL_FORMAT_RGB565                                                <br/>
 *      - generate 8-bit textures: cc.TEXTURE_2D_PIXEL_FORMAT_A8 (only use it if you use just 1 color)               <br/>
 *                                                                                                                   <br/>
 *      How does it work ?                                                                                           <br/>
 *      - If the image is an RGBA (with Alpha) then the default pixel format will be used (it can be a 8-bit, 16-bit or 32-bit texture)      <br/>
 *      - If the image is an RGB (without Alpha) then an RGB565 or RGB888 texture will be used (16-bit texture)      <br/>
 * </p>
 * @param {Number} format
 */
cc.Texture2D.setDefaultAlphaPixelFormat = function (format) {
    cc._defaultAlphaPixelFormat = format;
};

/**
 * returns the alpha pixel format
 * @return {Number}
 */
cc.Texture2D.defaultAlphaPixelFormat = function () {
    return cc._defaultAlphaPixelFormat;
};

cc.Texture2D.getDefaultAlphaPixelFormat = function () {
    return cc._defaultAlphaPixelFormat;
};

/**
 * <p>
 *    treats (or not) PVR files as if they have alpha premultiplied.                                                <br/>
 *    Since it is impossible to know at runtime if the PVR images have the alpha channel premultiplied, it is       <br/>
 *    possible load them as if they have (or not) the alpha channel premultiplied.                                  <br/>
 *                                                                                                                  <br/>
 *    By default it is disabled.                                                                                    <br/>
 * </p>
 * @param haveAlphaPremultiplied
 * @constructor
 */
cc.Texture2D.PVRImagesHavePremultipliedAlpha = function (haveAlphaPremultiplied) {
    cc.PVRHaveAlphaPremultiplied_ = haveAlphaPremultiplied;
};
