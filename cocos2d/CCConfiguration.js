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
 * cc.Configuration contains some openGL variables
 * @class
 * @extends cc.Class
 */
cc.Configuration = cc.Class.extend(/** @lends cc.Configuration# */{
    _maxTextureSize:0,
    _maxModelviewStackDepth:0,
    _supportsPVRTC:false,
    _supportsNPOT:false,
    _supportsBGRA8888:false,
    _supportsDiscardFramebuffer:false,
    _supportsShareableVAO:false,
    _maxSamplesAllowed:0,
    _maxTextureUnits:0,
    _GlExtensions:"",

    /**
     * OpenGL Max texture size.
     * @return {Number}
     */
    getMaxTextureSize:function () {
        return this._maxTextureSize;
    },

    /**
     * OpenGL Max Modelview Stack Depth.
     * @return {Number}
     */
    getMaxModelviewStackDepth:function () {
        return this._maxModelviewStackDepth;
    },

    /**
     * returns the maximum texture units
     * @return {Number}
     */
    getMaxTextureUnits:function () {
        return this._maxTextureUnits;
    },

    /**
     * Whether or not the GPU supports NPOT (Non Power Of Two) textures.
     * OpenGL ES 2.0 already supports NPOT (iOS).
     * @return {Boolean}
     */
    supportsNPOT:function () {
        return this._supportsNPOT;
    },

    /**
     * Whether or not PVR Texture Compressed is supported
     * @return {Boolean}
     */
    supportsPVRTC:function () {
        return this._supportsPVRTC;
    },

    /**
     * Whether or not BGRA8888 textures are supported.
     * @return {Boolean}
     */
    supportsBGRA8888:function () {
        return this._supportsBGRA8888;
    },

    /**
     * Whether or not glDiscardFramebufferEXT is supported
     * @return {Boolean}
     */
    supportsDiscardFramebuffer:function () {
        return this._supportsDiscardFramebuffer;
    },

    /**
     * Whether or not shareable VAOs are supported.
     * @return {Boolean}
     */
    supportsShareableVAO:function () {
        return this._supportsShareableVAO;
    },

    /**
     * returns whether or not an OpenGL is supported
     * @param {String} searchName
     */
    checkForGLExtension:function (searchName) {
        return this._GlExtensions.indexOf(searchName) > -1;
    },

    init:function () {
        if(cc.renderContextType === cc.CANVAS)
            return true;

        var gl = cc.renderContext;
        cc.log("cocos2d: GL_VENDOR:     " + gl.getParameter(gl.VENDOR));
        cc.log("cocos2d: GL_RENDERER:   " + gl.getParameter(gl.RENDERER));
        cc.log("cocos2d: GL_VERSION:    " + gl.getParameter(gl.VERSION));

        this._GlExtensions = "";
        var extArr = gl.getSupportedExtensions();
        for (var i = 0; i < extArr.length; i++)
            this._GlExtensions += extArr[i] + " ";
        cc.log("cocos2d: GL_EXTENSIONS:  " + this._GlExtensions);

        this._maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        this._maxTextureUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);

        this._supportsPVRTC = this.checkForGLExtension("GL_IMG_texture_compression_pvrtc");
        this._supportsNPOT = true;
        this._supportsBGRA8888 = this.checkForGLExtension("GL_IMG_texture_format_BGRA888");
        this._supportsDiscardFramebuffer = this.checkForGLExtension("GL_EXT_discard_framebuffer");

        this._supportsShareableVAO = this.checkForGLExtension("vertex_array_object");

        cc.log("cocos2d: GL_MAX_TEXTURE_SIZE: " + this._maxTextureSize);
        cc.log("cocos2d: GL_MAX_TEXTURE_UNITS: " + this._maxTextureUnits);
        cc.log("cocos2d: GL supports PVRTC: " + (this._supportsPVRTC ? "YES" : "NO"));
        cc.log("cocos2d: GL supports BGRA8888 textures: " + (this._supportsBGRA8888 ? "YES" : "NO"));
        cc.log("cocos2d: GL supports NPOT textures: " + (this._supportsNPOT ? "YES" : "NO"));
        cc.log("cocos2d: GL supports discard_framebuffer: " + (this._supportsDiscardFramebuffer ? "YES" : "NO"));
        cc.log("cocos2d: GL supports shareable VAO: " + (this._supportsShareableVAO ? "YES" : "NO"));

        if (cc.ENABLE_GL_STATE_CACHE == 0)
            cc.log("cocos2d: **** WARNING **** CC_ENABLE_GL_STATE_CACHE is disabled. To improve performance, enable it by editing ccConfig.h");

        cc.CHECK_GL_ERROR_DEBUG();
        return true;
    }
});


cc.Configuration._sharedConfiguration = null;

/**
 * returns a shared instance of CCConfiguration
 * @return {cc.Configuration}
 */
cc.Configuration.getInstance = function () {
    if(!cc.Configuration._sharedConfiguration){
        cc.Configuration._sharedConfiguration = new cc.Configuration();
        cc.Configuration._sharedConfiguration.init();
    }
    return cc.Configuration._sharedConfiguration;
};

/**
 * purge the shared instance of CCConfiguration
 */
cc.Configuration.purgeConfiguration = function () {
    cc.Configuration._sharedConfiguration = null;
};