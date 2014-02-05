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

cc.ConfigurationType = {ConfigurationError:0, ConfigurationString:1, ConfigurationInt:2, ConfigurationDouble:3, ConfigurationBoolean:4};

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
    _valueDict:null,

    ctor: function () {
        this._maxTextureSize = 0;
        this._maxModelviewStackDepth = 0;
        this._supportsPVRTC = false;
        this._supportsNPOT = false;
        this._supportsBGRA8888 = false;
        this._supportsDiscardFramebuffer = false;
        this._supportsShareableVAO = false;
        this._maxSamplesAllowed = 0;
        this._maxTextureUnits = 0;
        this._GlExtensions = "";
        this._valueDict = {};
    },

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
        var locValueDict = this._valueDict;
        locValueDict["cocos2d.x.version"] = cc.ENGINE_VERSION;
        locValueDict["cocos2d.x.compiled_with_profiler"] = false;
        locValueDict["cocos2d.x.compiled_with_gl_state_cache"] = cc.ENABLE_GL_STATE_CACHE;
        return true;
    },

    /**
     * returns the value of a given key as a string.  If the key is not found, it will return the default value
     * @param {String} key
     * @param {String} [default_value=null]
     * @returns {String}
     */
    getCString:function(key, default_value){
       var locValueDict = this._valueDict;
        if(locValueDict[key])
            return locValueDict[key];
        return default_value;
    },

    /**
     * returns the value of a given key as a boolean. If the key is not found, it will return the default value
     * @param {string} key
     * @param {boolean|null} [default_value=false]
     * @returns {boolean}
     */
    getBool: function(key, default_value){
        if(default_value == null)
            default_value = false;
        var locValueDict = this._valueDict;
        if(locValueDict[key])
            return locValueDict[key];
        return default_value;
    },

    /**
     * returns the value of a given key as a double. If the key is not found, it will return the default value
     * @param {string} key
     * @param {number} [default_value=0]
     * @returns {number}
     */
    getNumber: function(key, default_value){
        if(default_value == null)
            default_value = 0;
        var locValueDict = this._valueDict;
        if(locValueDict[key])
            return locValueDict[key];
        return default_value;
    },

    /**
     * returns the value of a given key as a double
     * @param {string} key
     * @returns {Object|null}
     */
    getObject:function(key){
        var locValueDict = this._valueDict;
        if(locValueDict[key])
            return locValueDict[key];
        return null;
    },

    /**
     * sets a new key/value pair  in the configuration dictionary
     * @param {string} key
     * @param {Object} value
     */
    setObject: function(key, value){
        this._valueDict[key] = value;
    },

    /**
     * dumps the current configuration on the console
     */
    dumpInfo: function(){
         if(cc.ENABLE_GL_STATE_CACHE === 0){
             cc.log("");
             cc.log("cocos2d: **** WARNING **** CC_ENABLE_PROFILERS is defined. Disable it when you finish profiling (from ccConfig.js)");
             cc.log("")
         }
    },

    /**
     * gathers OpenGL / GPU information
     */
    gatherGPUInfo: function(){
        if(cc.renderContextType === cc.CANVAS)
            return;

        var gl = cc.renderContext;
        var locValueDict = this._valueDict;
        locValueDict["gl.vendor"] = gl.getParameter(gl.VENDOR);
        locValueDict["gl.renderer"] = gl.getParameter(gl.RENDERER);
        locValueDict["gl.version"] = gl.getParameter(gl.VERSION);

        this._GlExtensions = "";
        var extArr = gl.getSupportedExtensions();
        for (var i = 0; i < extArr.length; i++)
            this._GlExtensions += extArr[i] + " ";

        this._maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        locValueDict["gl.max_texture_size"] = this._maxTextureSize;
        this._maxTextureUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
        locValueDict["gl.max_texture_units"] = this._maxTextureUnits;

        this._supportsPVRTC = this.checkForGLExtension("GL_IMG_texture_compression_pvrtc");
        locValueDict["gl.supports_PVRTC"] = this._supportsPVRTC;

        this._supportsNPOT = false; //true;
        locValueDict["gl.supports_NPOT"] = this._supportsNPOT;

        this._supportsBGRA8888 = this.checkForGLExtension("GL_IMG_texture_format_BGRA888");
        locValueDict["gl.supports_BGRA8888"] = this._supportsBGRA8888;

        this._supportsDiscardFramebuffer = this.checkForGLExtension("GL_EXT_discard_framebuffer");
        locValueDict["gl.supports_discard_framebuffer"] = this._supportsDiscardFramebuffer;

        this._supportsShareableVAO = this.checkForGLExtension("vertex_array_object");
        locValueDict["gl.supports_vertex_array_object"] = this._supportsShareableVAO;

        cc.CHECK_GL_ERROR_DEBUG();
    },

    /**
     * Loads a config file. If the keys are already present, then they are going to be replaced. Otherwise the new keys are added.
     * @param {string} filename
     */
    loadConfigFile: function( filename){
        var fileUtils = cc.FileUtils.getInstance();
        var fullPath = fileUtils.fullPathForFilename(filename);
        var dict = fileUtils.dictionaryWithContentsOfFileThreadSafe(fullPath);

        if(dict == null)
            return;

        var getDatas = dict["data"];
        if(!getDatas){
            cc.log("Expected 'data' dict, but not found. Config file: " + filename);
            return;
        }

        // Add all keys in the existing dictionary
        for(var selKey in getDatas)
            this._valueDict[selKey] = getDatas[selKey];
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