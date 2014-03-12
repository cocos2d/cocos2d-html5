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
cc.Texture2DWebGL = cc.Class.extend(/** @lends cc.Texture2D# */{
    // By default PVR images are treated as if they don't have the alpha channel premultiplied
    _pVRHaveAlphaPremultiplied:true,
    _pixelFormat:null,
    _pixelsWide:0,
    _pixelsHigh:0,
    _name:"",
    _contentSize:null,
    maxS:0,
    maxT:0,
    _hasPremultipliedAlpha:false,
    _hasMipmaps:false,

    shaderProgram:null,

    _isLoaded:false,
    _htmlElementObj:null,
    _webTextureObj:null,

    url : null,
    _loadedEventListeners:null,

    /*public:*/
    ctor:function () {
        this._contentSize = cc.size(0, 0);
        this._pixelFormat = cc.Texture2D.defaultPixelFormat;
    },

    releaseTexture:function () {
        if (this._webTextureObj)
            cc._renderContext.deleteTexture(this._webTextureObj);
        cc.loader.release(this.url);
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
     * height in pixels
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
    getContentSize:function () {
        return cc.size(this._contentSize.width / cc.CONTENT_SCALE_FACTOR(), this._contentSize.height / cc.CONTENT_SCALE_FACTOR());
    },

    _getWidth:function () {
        return this._contentSize.width / cc.CONTENT_SCALE_FACTOR();
    },
    _getHeight:function () {
        return this._contentSize.height / cc.CONTENT_SCALE_FACTOR();
    },

    getContentSizeInPixels:function () {
        return this._contentSize;
    },

    /** texture max S */
    getMaxS:function () {
        return this.maxS;
    },

    setMaxS:function (maxS) {
        this.maxS = maxS;
    },

    /** texture max T */
    getMaxT:function () {
        return this.maxT;
    },

    setMaxT:function (maxT) {
        this.maxT = maxT;
    },

    /**
     * return shader program used by drawAtPoint and drawInRect
     * @return {cc.GLProgram}
     */
    getShaderProgram:function () {
        return this.shaderProgram;
    },

    /**
     * set shader program used by drawAtPoint and drawInRect
     * @param {cc.GLProgram} shaderProgram
     */
    setShaderProgram:function (shaderProgram) {
        this.shaderProgram = shaderProgram;
    },

    /**
     * whether or not the texture has their Alpha premultiplied
     * @return {Boolean}
     */
    hasPremultipliedAlpha:function () {
        return this._hasPremultipliedAlpha;
    },

    hasMipmaps:function () {
        return this._hasMipmaps;
    },

    description:function () {
        return "<cc.Texture2D | Name = " + this._name + " | Dimensions = " + this._pixelsWide + " x " + this._pixelsHigh
            + " | Coordinates = (" + this.maxS + ", " + this.maxT + ")>";
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
        var self = this, tex2d = cc.Texture2D;
        var gl = cc._renderContext;
        var format = gl.RGBA, type = gl.UNSIGNED_BYTE;

        var bitsPerPixel = cc.Texture2D._B[pixelFormat];

        var bytesPerRow = pixelsWide * bitsPerPixel / 8;
        if (bytesPerRow % 8 === 0) {
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 8);
        } else if (bytesPerRow % 4 === 0) {
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
        } else if (bytesPerRow % 2 === 0) {
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 2);
        } else {
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        }

        self._webTextureObj = gl.createTexture();
        cc.glBindTexture2D(self);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Specify OpenGL texture image
        switch (pixelFormat) {
	        case tex2d.PIXEL_FORMAT_RGBA8888:
		        format = gl.RGBA;
		        break;
            case tex2d.PIXEL_FORMAT_RGB888:
                format = gl.RGB;
                break;
            case tex2d.PIXEL_FORMAT_RGBA4444:
                type = gl.UNSIGNED_SHORT_4_4_4_4;
                break;
            case tex2d.PIXEL_FORMAT_RGB5A1:
                type = gl.UNSIGNED_SHORT_5_5_5_1;
                break;
            case tex2d.PIXEL_FORMAT_RGB565:
                type = gl.UNSIGNED_SHORT_5_6_5;
                break;
            case tex2d.PIXEL_FORMAT_AI88:
                format = gl.LUMINANCE_ALPHA;
                break;
            case tex2d.PIXEL_FORMAT_A8:
                format = gl.ALPHA;
                break;
            case tex2d.PIXEL_FORMAT_I8:
                format = gl.LUMINANCE;
                break;
            default:
                throw "NSInternalInconsistencyException";
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, format, pixelsWide, pixelsHigh, 0, format, type, data);


        self._contentSize.width = contentSize.width;
        self._contentSize.height = contentSize.height;
        self._pixelsWide = pixelsWide;
        self._pixelsHigh = pixelsHigh;
        self._pixelFormat = pixelFormat;
        self.maxS = contentSize.width / pixelsWide;
        self.maxT = contentSize.height / pixelsHigh;

        self._hasPremultipliedAlpha = false;
        self._hasMipmaps = false;
        self.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURE);

        self._isLoaded = true;

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
        var self = this;
        var coordinates = [
            0.0, self.maxT,
            self.maxS, self.maxT,
            0.0, 0.0,
            self.maxS, 0.0 ];

        var width = self._pixelsWide * self.maxS,
            height = self._pixelsHigh * self.maxT;

        var vertices = [
            point.x, point.y, 0.0,
            width + point.x, point.y, 0.0,
            point.x, height + point.y, 0.0,
            width + point.x, height + point.y, 0.0 ];

        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_TEX_COORDS);
        self._shaderProgram.use();
        self._shaderProgram.setUniformsForBuiltins();

        cc.glBindTexture2D(self);

        var gl = cc._renderContext;
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, gl.FLOAT, false, 0, vertices);
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 0, coordinates);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },

    /**
     * draws a texture inside a rect
     * @param {cc.Rect} rect
     */
    drawInRect:function (rect) {
        var self = this;
        var coordinates = [
            0.0, self.maxT,
            self.maxS, self.maxT,
            0.0, 0.0,
            self.maxS, 0.0];

        var vertices = [    rect.x, rect.y, /*0.0,*/
            rect.x + rect.width, rect.y, /*0.0,*/
            rect.x, rect.y + rect.height, /*0.0,*/
            rect.x + rect.width, rect.y + rect.height        /*0.0*/ ];

        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_TEX_COORDS);
        self._shaderProgram.use();
        self._shaderProgram.setUniformsForBuiltins();

        cc.glBindTexture2D(self);

        var gl = cc._renderContext;
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

        var maxTextureSize = cc.configuration.getMaxTextureSize();
        if (imageWidth > maxTextureSize || imageHeight > maxTextureSize) {
            cc.log("cocos2d: WARNING: Image (" + imageWidth + " x " + imageHeight + ") is bigger than the supported " + maxTextureSize + " x " + maxTextureSize);
            return false;
        }
        this._isLoaded = true;

        // always load premultiplied images
        return this._initPremultipliedATextureWithImage(uiImage, imageWidth, imageHeight);
    },

    initWithElement:function (element) {
        if (!element)
            return;
        this._webTextureObj = cc._renderContext.createTexture();
        this._htmlElementObj = element;
    },

    /**
     * HTMLElement Object getter
     * @return {HTMLElement}
     */
    getHtmlElementObj:function(){
        return this._htmlElementObj;
    },

    isLoaded:function () {
        return this._isLoaded;
    },

    handleLoadedTexture:function () {
        var self = this;
	    // Not sure about this ! Some texture need to be updated even after loaded
        if(!cc._rendererInitialized) return;
        if(!self._htmlElementObj){
            var img = cc.loader.getRes(self.url);
            if(!img) return;
            self.initWithElement(img);
        }
        self._isLoaded = true;
        //upload image to buffer
        var gl = cc._renderContext;

        cc.glBindTexture2D(self);

        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);

        // Specify OpenGL texture image
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, self._htmlElementObj);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        self.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURE);
        cc.glBindTexture2D(null);

        var pixelsWide = self._htmlElementObj.width;
        var pixelsHigh = self._htmlElementObj.height;

        self._pixelsWide = self._contentSize.width = pixelsWide;
        self._pixelsHigh = self._contentSize.height = pixelsHigh;
        self._pixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888;
        self.maxS = 1;
        self.maxT = 1;

        self._hasPremultipliedAlpha = false;
        self._hasMipmaps = false;

        this._callLoadedEventCallbacks();
    },

    /**
     Extensions to make it easy to create a cc.Texture2D object from a string of text.
     Note that the generated textures are of type A8 - use the blending mode (gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA).
     */
    /**
     * Initializes a texture from a string with dimensions, alignment, font name and font size (note: initWithString does not support on HTML5)
     * @param {String} text
     * @param {String | cc.FontDefinition} fontName or fontDefinition
     * @param {Number} fontSize
     * @param {cc.Size} dimensions
     * @param {Number} hAlignment
     * @param {Number} vAlignment
     * @return {Boolean}
     */
    initWithString:function (text, fontName, fontSize, dimensions, hAlignment, vAlignment) {
        cc.log("initWithString isn't supported on cocos2d-html5");
        return null;
    },

    /**
     * Initializes a texture from a ETC file  (note: initWithETCFile does not support on HTML5)
     * @note Compatible to Cocos2d-x
     * @param {String} file
     * @return {Boolean}
     */
    initWithETCFile:function (file) {
        cc.log("initWithETCFile does not support on HTML5");
        return false;
    },

    /**
     * Initializes a texture from a PVR file
     * @param {String} file
     * @return {Boolean}
     */
    initWithPVRFile:function (file) {
        cc.log("initWithPVRFile does not support on HTML5");
        return false;
    },

    /**
     Extensions to make it easy to create a cc.Texture2D object from a PVRTC file
     Note that the generated textures don't have their alpha premultiplied - use the blending mode (gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA).
     */
    /**
     * Initializes a texture from a PVRTC buffer
     * @note compatible to cocos2d-iphone interface.
     * @param {Array} data
     * @param {Number} level
     * @param {Number} bpp
     * @param {Boolean} hasAlpha
     * @param {Number} length
     * @param {Number} pixelFormat
     * @return {Boolean}
     */
    initWithPVRTCData:function (data, level, bpp, hasAlpha, length, pixelFormat) {
        cc.log("initWithPVRTCData does not support on HTML5");
        return false;
    },

    /**
     * sets the min filter, mag filter, wrap s and wrap t texture parameters. <br/>
     * If the texture size is NPOT (non power of 2), then in can only use gl.CLAMP_TO_EDGE in gl.TEXTURE_WRAP_{S,T}.
     * @param texParams
     */
    setTexParameters:function (texParams) {
        var gl = cc._renderContext;

        cc.assert((this._pixelsWide == cc.NextPOT(this._pixelsWide) && this._pixelsHigh == cc.NextPOT(this._pixelsHigh)) ||
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
        var gl = cc._renderContext;

        cc.glBindTexture2D(this);
        if (!this._hasMipmaps)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        else
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
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
    setAliasTexParameters:function () {
        var gl = cc._renderContext;

        cc.glBindTexture2D(this);
        if (!this._hasMipmaps)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        else
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

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
        cc.assert(this._pixelsWide == cc.NextPOT(this._pixelsWide) && this._pixelsHigh == cc.NextPOT(this._pixelsHigh), "Mimpap texture only works in POT textures");

        cc.glBindTexture2D(this);
        cc._renderContext.generateMipmap(cc._renderContext.TEXTURE_2D);
        this._hasMipmaps = true;
    },

    /**
     * returns the pixel format.
     * @return {String}
     */
    stringForFormat:function () {
        return cc.Texture2D._M[this._pixelFormat];
    },

    /**
     * returns the bits-per-pixel of the in-memory OpenGL texture
     * @return {Number}
     */
    bitsPerPixelForFormat:function (format) {//TODO I want to delete the format argument, use this._pixelFormat
        format = format || this._pixelFormat;
        var value = cc.Texture2D._B[format];
        if(value != null) return value;
        cc.log("bitsPerPixelForFormat: " + format + ", cannot give useful result, it's a illegal pixel format");
        return -1;
    },

    _initPremultipliedATextureWithImage:function (uiImage, width, height) {
        var tex2d = cc.Texture2D;
        var tempData = uiImage.getData();
        var inPixel32 = null;
        var inPixel8 = null;
        var outPixel16 = null;
        var hasAlpha = uiImage.hasAlpha();
        var imageSize = cc.size(uiImage.getWidth(), uiImage.getHeight());
        var pixelFormat = tex2d.defaultPixelFormat;
        var bpp = uiImage.getBitsPerComponent();
        var i;

        // compute pixel format
        if (!hasAlpha) {
            if (bpp >= 8) {
                pixelFormat = tex2d.PIXEL_FORMAT_RGB888;
            } else {
                cc.log("cocos2d: cc.Texture2D: Using RGB565 texture since image has no alpha");
                pixelFormat = tex2d.PIXEL_FORMAT_RGB565;
            }
        }

        // Repack the pixel data into the right format
        var length = width * height;

        if (pixelFormat == tex2d.PIXEL_FORMAT_RGB565) {
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
        } else if (pixelFormat == tex2d.PIXEL_FORMAT_RGBA4444) {
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
        } else if (pixelFormat == tex2d.PIXEL_FORMAT_RGB5A1) {
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
        } else if (pixelFormat == tex2d.PIXEL_FORMAT_A8) {
            // Convert "RRRRRRRRRGGGGGGGGBBBBBBBBAAAAAAAA" to "AAAAAAAA"
            tempData = new Uint8Array(width * height);
            inPixel32 = uiImage.getData();

            for (i = 0; i < length; ++i) {
                tempData[i] = (inPixel32 >> 24) & 0xFF;  // A
            }
        }

        if (hasAlpha && pixelFormat == tex2d.PIXEL_FORMAT_RGB888) {
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
    },

    addLoadedEventListener: function (callback, target) {
        if(!this._loadedEventListeners)
            this._loadedEventListeners = [];
        this._loadedEventListeners.push({eventCallback: callback, eventTarget: target});
    },

    removeLoadedEventListener:function(target){
        if(!this._loadedEventListeners)
            return;
        var locListeners = this._loadedEventListeners;
        for(var i = 0;  i < locListeners.length; i++){
            var selCallback = locListeners[i];
            if(selCallback.eventTarget == target){
                locListeners.splice(i, 1);
            }
        }
    },

    _callLoadedEventCallbacks: function () {
        if(!this._loadedEventListeners)
            return;
        var locListeners = this._loadedEventListeners;
        for (var i = 0, len = locListeners.length; i < len; i++) {
            var selCallback = locListeners[i];
            selCallback.eventCallback.call(selCallback.eventTarget, this);
        }
        locListeners.length = 0;
    }
});

cc.Texture2DCanvas = cc.Class.extend({
    _contentSize:null,
    _isLoaded:false,
    _htmlElementObj:null,
    _loadedEventListeners:null,

    url : null,

    ctor:function () {
        this._contentSize = cc.size(0,0);
        this._isLoaded = false;
        this._htmlElementObj = null;
    },

    getPixelsWide:function () {
        return this._contentSize.width;
    },

    getPixelsHigh:function () {
        return this._contentSize.height;
    },

    getContentSize:function () {
        var locScaleFactor = cc.CONTENT_SCALE_FACTOR();
        return cc.size(this._contentSize.width / locScaleFactor, this._contentSize.height / locScaleFactor);
    },

    _getWidth:function () {
        return this._contentSize.width / cc.CONTENT_SCALE_FACTOR();
    },
    _getHeight:function () {
        return this._contentSize.height / cc.CONTENT_SCALE_FACTOR();
    },

    getContentSizeInPixels:function () {
        return this._contentSize;
    },

    initWithElement:function (element) {
        if (!element)
            return;
        this._htmlElementObj = element;
    },

    /**
     * HTMLElement Object getter
     * @return {HTMLElement}
     */
    getHtmlElementObj:function(){
        return this._htmlElementObj;
    },

    isLoaded:function () {
        return this._isLoaded;
    },

    handleLoadedTexture:function () {
        var self = this
        if(self._isLoaded) return;
        if(!self._htmlElementObj){
            var img = cc.loader.getRes(self.url);
            if(!img) return;
            self.initWithElement(img);
        }

        self._isLoaded = true;
        var locElement =  self._htmlElementObj;
        self._contentSize.width = locElement.width;
        self._contentSize.height = locElement.height;

        self._callLoadedEventCallbacks();
    },

    description:function () {
        return "<cc.Texture2D | width = " + this._contentSize.width + " height " + this._contentSize.height+">";
    },

    initWithData:function (data, pixelFormat, pixelsWide, pixelsHigh, contentSize) {
        //support only in WebGl rendering mode
        return false;
    },

    initWithImage:function (uiImage) {
        //support only in WebGl rendering mode
        return false;
    },

    initWithString:function (text, fontName, fontSize, dimensions, hAlignment, vAlignment) {
        //support only in WebGl rendering mode
        return false;
    },

    releaseTexture:function () {
        //support only in WebGl rendering mode
    },

    getName:function () {
        //support only in WebGl rendering mode
        return null;
    },

    getMaxS:function () {
        //support only in WebGl rendering mode
        return 1;
    },

    setMaxS:function (maxS) {
        //support only in WebGl rendering mode
    },

    getMaxT:function () {
        return 1;
    },

    setMaxT:function (maxT) {
        //support only in WebGl rendering mode
    },

    getPixelFormat:function () {
        //support only in WebGl rendering mode
        return null;
    },

    getShaderProgram:function () {
        //support only in WebGl rendering mode
        return null;
    },

    setShaderProgram:function (shaderProgram) {
        //support only in WebGl rendering mode
    },

    hasPremultipliedAlpha:function () {
        //support only in WebGl rendering mode
        return false;
    },

    hasMipmaps:function () {
        //support only in WebGl rendering mode
        return false;
    },

    releaseData:function (data) {
        //support only in WebGl rendering mode
        data = null;
    },

    keepData:function (data, length) {
        //support only in WebGl rendering mode
        return data;
    },

    drawAtPoint:function (point) {
        //support only in WebGl rendering mode
    },

    drawInRect:function (rect) {
        //support only in WebGl rendering mode
    },

    initWithETCFile:function (file) {
        cc.log("initWithETCFile does not support on HTML5");
        return false;
    },

    initWithPVRFile:function (file) {
        cc.log("initWithPVRFile does not support on HTML5");
        return false;
    },

    initWithPVRTCData:function (data, level, bpp, hasAlpha, length, pixelFormat) {
        cc.log("initWithPVRTCData does not support on HTML5");
        return false;
    },

    setTexParameters:function (texParams) {
        //support only in WebGl rendering mode
    },

    setAntiAliasTexParameters:function () {
        //support only in WebGl rendering mode
    },

    setAliasTexParameters:function () {
        //support only in WebGl rendering mode
    },

    generateMipmap:function () {
        //support only in WebGl rendering mode
    },

    stringForFormat:function () {
        //support only in WebGl rendering mode
        return "";
    },

    bitsPerPixelForFormat:function (format) {
        //support only in WebGl rendering mode
        return -1;
    },

    addLoadedEventListener:function(callback, target){
        if(!this._loadedEventListeners)
            this._loadedEventListeners = [];
        this._loadedEventListeners.push({eventCallback:callback, eventTarget:target});
    },

    removeLoadedEventListener:function(target){
        if(!this._loadedEventListeners)
            return;
        var locListeners = this._loadedEventListeners;
        for(var i = 0;  i < locListeners.length; i++){
            var selCallback = locListeners[i];
            if(selCallback.eventTarget == target){
                locListeners.splice(i, 1);
            }
        }
    },

    _callLoadedEventCallbacks:function(){
        if(!this._loadedEventListeners)
            return;
        var locListeners = this._loadedEventListeners;
        for(var i = 0, len = locListeners.length;  i < len; i++){
            var selCallback = locListeners[i];
            selCallback.eventCallback.call(selCallback.eventTarget, this);
        }
        locListeners.length = 0;
    }
});

cc.Texture2D = cc._renderType === cc._RENDER_TYPE_WEBGL ? cc.Texture2DWebGL : cc.Texture2DCanvas;

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

window._c = cc.Texture2D;

/**
 * 32-bit texture: RGBA8888
 * @memberOf cc.Texture2D
 * @name PIXEL_FORMAT_RGBA8888
 * @static
 * @constant
 * @type {Number}
 */
_c.PIXEL_FORMAT_RGBA8888 = 0;

/**
 * 24-bit texture: RGBA888
 * @memberOf cc.Texture2D
 * @name PIXEL_FORMAT_RGB888
 * @static
 * @constant
 * @type {Number}
 */
_c.PIXEL_FORMAT_RGB888 = 1;

/**
 * 16-bit texture without Alpha channel
 * @memberOf cc.Texture2D
 * @name PIXEL_FORMAT_RGB565
 * @static
 * @constant
 * @type {Number}
 */
_c.PIXEL_FORMAT_RGB565 = 2;

/**
 * 8-bit textures used as masks
 * @memberOf cc.Texture2D
 * @name PIXEL_FORMAT_A8
 * @static
 * @constant
 * @type {Number}
 */
_c.PIXEL_FORMAT_A8 = 3;

/**
 * 8-bit intensity texture
 * @memberOf cc.Texture2D
 * @name PIXEL_FORMAT_I8
 * @static
 * @constant
 * @type {Number}
 */
_c.PIXEL_FORMAT_I8 = 4;

/**
 * 16-bit textures used as masks
 * @memberOf cc.Texture2D
 * @name PIXEL_FORMAT_AI88
 * @static
 * @constant
 * @type {Number}
 */
_c.PIXEL_FORMAT_AI88 = 5;

/**
 * 16-bit textures: RGBA4444
 * @memberOf cc.Texture2D
 * @name PIXEL_FORMAT_RGBA4444
 * @static
 * @constant
 * @type {Number}
 */
_c.PIXEL_FORMAT_RGBA4444 = 6;

/**
 * 16-bit textures: RGB5A1
 * @memberOf cc.Texture2D
 * @name PIXEL_FORMAT_RGB5A1
 * @static
 * @constant
 * @type {Number}
 */
_c.PIXEL_FORMAT_RGB5A1 = 7;

/**
 * 4-bit PVRTC-compressed texture: PVRTC4
 * @memberOf cc.Texture2D
 * @name PIXEL_FORMAT_PVRTC4
 * @static
 * @constant
 * @type {Number}
 */
_c.PIXEL_FORMAT_PVRTC4 = 8;

/**
 * 2-bit PVRTC-compressed texture: PVRTC2
 * @memberOf cc.Texture2D
 * @name PIXEL_FORMAT_PVRTC2
 * @static
 * @constant
 * @type {Number}
 */
_c.PIXEL_FORMAT_PVRTC2 = 9;

/**
 * Default texture format: RGBA8888
 * @memberOf cc.Texture2D
 * @name PIXEL_FORMAT_DEFAULT
 * @static
 * @constant
 * @type {Number}
 */
_c.PIXEL_FORMAT_DEFAULT = _c.PIXEL_FORMAT_RGBA8888;

window._M = cc.Texture2D._M = {};
_M[_c.PIXEL_FORMAT_RGBA8888] = "RGBA8888";
_M[_c.PIXEL_FORMAT_RGB888] = "RGB888";
_M[_c.PIXEL_FORMAT_RGB565] = "RGB565";
_M[_c.PIXEL_FORMAT_A8] = "A8";
_M[_c.PIXEL_FORMAT_I8] = "I8";
_M[_c.PIXEL_FORMAT_AI88] = "AI88";
_M[_c.PIXEL_FORMAT_RGBA4444] = "RGBA4444";
_M[_c.PIXEL_FORMAT_RGB5A1] = "RGB5A1";
_M[_c.PIXEL_FORMAT_PVRTC4] = "PVRTC4";
_M[_c.PIXEL_FORMAT_PVRTC2] = "PVRTC2";

window._B = cc.Texture2D._B = {};
_B[_c.PIXEL_FORMAT_RGBA8888] = 32;
_B[_c.PIXEL_FORMAT_RGB888] = 24;
_B[_c.PIXEL_FORMAT_RGB565] = 16;
_B[_c.PIXEL_FORMAT_A8] = 8;
_B[_c.PIXEL_FORMAT_I8] = 8;
_B[_c.PIXEL_FORMAT_AI88] = 16;
_B[_c.PIXEL_FORMAT_RGBA4444] = 16;
_B[_c.PIXEL_FORMAT_RGB5A1] = 16;
_B[_c.PIXEL_FORMAT_PVRTC4] = 4;
_B[_c.PIXEL_FORMAT_PVRTC2] = 3;


window._p = cc.Texture2D.prototype;

// Extended properties
/** @expose */
_p.name;
cc.defineGetterSetter(_p, "name", _p.getName);
/** @expose */
_p.pixelFormat;
cc.defineGetterSetter(_p, "pixelFormat", _p.getPixelFormat);
/** @expose */
_p.pixelsWidth;
cc.defineGetterSetter(_p, "pixelsWidth", _p.getPixelsWide);
/** @expose */
_p.pixelsHeight;
cc.defineGetterSetter(_p, "pixelsHeight", _p.getPixelsHigh);
//cc.defineGetterSetter(_p, "size", _p.getContentSize, _p.setContentSize);
/** @expose */
_p.width;
cc.defineGetterSetter(_p, "width", _p._getWidth, _p._setWidth);
/** @expose */
_p.height;
cc.defineGetterSetter(_p, "height", _p._getHeight, _p._setHeight);

cc.Texture2D.defaultPixelFormat = _c.PIXEL_FORMAT_DEFAULT;

/** @expose */
window._c;
/** @expose */
window._M;
/** @expose */
window._B;

delete window._p;
delete window._c;
delete window._M;
delete window._B;
