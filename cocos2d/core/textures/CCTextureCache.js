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
 * TextureCache - Alloc, Init & Dealloc
 * @type object
 */
cc.g_sharedTextureCache = null;

/**
 * Load the images to the cache
 * @param {String} imageUrl
 */
cc.loadImage = function (imageUrl) {
    // compute image type
    var imageType = cc.computeImageFormatType(imageUrl);
    if (imageType == cc.FMT_UNKNOWN) {
        cc.log("unsupported format:" + imageUrl);
        return;
    }
    var image = new Image();
    image.src = imageUrl;
    image.addEventListener('load', cc.loadImage.handler, false);
};
cc.loadImage.handler = function(){
    cc.TextureCache.getInstance().cacheImage(this.src, this);
    this.removeEventListener('load', cc.loadImage.handler, false);
};

/**
 *  Support image format type
 * @param {String} filename
 * @return {Number}
 */
cc.computeImageFormatType = function (filename) {
    if (filename.toLowerCase().indexOf('.jpg') > 0 || filename.toLowerCase().indexOf('.jpeg') > 0) {
        return cc.FMT_JPG;
    } else if (filename.toLowerCase().indexOf('.png') > 0) {
        return cc.FMT_PNG;
    } else if (filename.toLowerCase().indexOf('.webp') > 0) {
        return cc.FMT_WEBP;
    }

    return cc.FMT_UNKNOWN;
};

/**
 *  Implementation TextureCache
 * @class
 * @extends cc.Class
 */
cc.TextureCache = cc.Class.extend(/** @lends cc.TextureCache# */{
    _textures:null,
    _textureColorsCache:null,
    _textureKeySeq:null,

    _rendererInitialized:false,
    _loadedTexturesBefore:null,
    _loadingTexturesBefore:null,

    /**
     * Constructor
     */
    ctor: function () {
        if(cc.g_sharedTextureCache)
            throw "Attempted to allocate a second instance of a singleton.";
        this._textureKeySeq += (0 | Math.random() * 1000);
        this._textures = {};
        this._textureColorsCache = {};
        if(cc.renderContextType === cc.WEBGL){
            this._loadedTexturesBefore = {};
            this._loadingTexturesBefore = {};
        }
    },

    _addImageAsyncCallBack:function (target, selector) {
        if (target && (typeof(selector) === "string")) {
            target[selector]();
        } else if (target && (typeof(selector) === "function")) {
            selector.call(target);
        }
    },

    _initializingRenderer : function(){
        this._rendererInitialized = true;

        var selPath;
        //init texture from _loadedTexturesBefore
        var locLoadedTexturesBefore = this._loadedTexturesBefore, locTextures = this._textures;
        for(selPath in locLoadedTexturesBefore){
            var htmlImage = locLoadedTexturesBefore[selPath];

            var texture2d = new cc.Texture2D();
            texture2d.initWithElement(htmlImage);
            texture2d.handleLoadedTexture();
            locTextures[selPath] = texture2d;
        }
        this._loadedTexturesBefore = {};
    },

    /**
     * <p>
     *     Returns a Texture2D object given an PVR filename                                                              <br/>
     *     If the file image was not previously loaded, it will create a new CCTexture2D                                 <br/>
     *     object and it will return it. Otherwise it will return a reference of a previously loaded image              <br/>
     *     note: AddPVRTCImage does not support on HTML5
     * </p>
     * @param {String} filename
     * @return {cc.Texture2D}
     */
    addPVRTCImage:function (filename) {
        cc.log("TextureCache:addPVRTCImage does not support on HTML5");
    },


    /**
     * <p>
     *     Returns a Texture2D object given an ETC filename                                                               <br/>
     *     If the file image was not previously loaded, it will create a new CCTexture2D                                  <br/>
     *     object and it will return it. Otherwise it will return a reference of a previously loaded image                <br/>
     *    note:addETCImage does not support on HTML5
     * </p>
     * @param {String} filename
     * @return {cc.Texture2D}
     */
    addETCImage:function (filename) {
        cc.log("TextureCache:addPVRTCImage does not support on HTML5");
    },

    /**
     * Description
     * @return {String}
     */
    description:function () {
        return "<TextureCache | Number of textures = " + this._textures.length + ">";
    },

    /**
     * Returns an already created texture. Returns null if the texture doesn't exist.
     * @param {String} textureKeyName
     * @return {cc.Texture2D|Null}
     * @example
     * //example
     * var key = cc.TextureCache.getInstance().textureForKey("hello.png");
     */
    textureForKey:function (textureKeyName) {
        var fullPath = cc.FileUtils.getInstance().fullPathForFilename(textureKeyName);
        if (this._textures[fullPath])
            return this._textures[fullPath];
        return null;
    },

    /**
     * @param {Image} texture
     * @return {String|Null}
     * @example
     * //example
     * var key = cc.TextureCache.getInstance().getKeyByTexture(texture);
     */
    getKeyByTexture:function (texture) {
        for (var key in this._textures) {
            if (this._textures[key] == texture) {
                return key;
            }
        }
        return null;
    },

    _generalTextureKey:function () {
        this._textureKeySeq++;
        return "_textureKey_" + this._textureKeySeq;
    },

    /**
     * @param {Image} texture
     * @return {Array}
     * @example
     * //example
     * var cacheTextureForColor = cc.TextureCache.getInstance().getTextureColors(texture);
     */
    getTextureColors:function (texture) {
        var key = this.getKeyByTexture(texture);
        if (!key) {
            if (texture instanceof HTMLImageElement)
                key = texture.src;
            else
                key = this._generalTextureKey();
        }

        if (!this._textureColorsCache[key])
            this._textureColorsCache[key] = cc.generateTextureCacheForColor(texture);
        return this._textureColorsCache[key];
    },

    /**
     * <p>Returns a Texture2D object given an PVR filename<br />
     * If the file image was not previously loaded, it will create a new Texture2D<br />
     *  object and it will return it. Otherwise it will return a reference of a previously loaded image </p>
     * @param {String} path
     * @return {cc.Texture2D}
     */
    addPVRImage:function (path) {
        if(!path)
            throw "cc.TextureCache.addPVRImage(): path should be non-null";

        path = cc.FileUtils.getInstance().fullPathForFilename(path);

        var key = path;

        if (this._textures[key] != null)
            return this._textures[key];

        // Split up directory and filename
        var tex = new cc.Texture2D();
        if (tex.initWithPVRFile(key)) {
            this._textures[key] = tex;
        } else {
            cc.log("cocos2d: Couldn't add PVRImage:" + key + " in TextureCache");
        }
        return tex;
    },

    /**
     * <p>Purges the dictionary of loaded textures. <br />
     * Call this method if you receive the "Memory Warning"  <br />
     * In the short term: it will free some resources preventing your app from being killed  <br />
     * In the medium term: it will allocate more resources <br />
     * In the long term: it will be the same</p>
     * @example
     * //example
     * cc.TextureCache.getInstance().removeAllTextures();
     */
    removeAllTextures:function () {
        var locTextures = this._textures;
        for (var selKey in locTextures) {
            if(locTextures[selKey])
                locTextures[selKey].releaseTexture();
        }
        this._textures = {};
    },

    /**
     * Deletes a texture from the cache given a texture
     * @param {Image} texture
     * @example
     * //example
     * cc.TextureCache.getInstance().removeTexture(texture);
     */
    removeTexture:function (texture) {
        if (!texture)
            return;

        var locTextures = this._textures;
        for (var selKey in locTextures) {
            if (locTextures[selKey] == texture) {
                locTextures[selKey].releaseTexture();
                delete(locTextures[selKey]);
            }
        }
    },

    /**
     * Deletes a texture from the cache given a its key name
     * @param {String} textureKeyName
     * @example
     * //example
     * cc.TextureCache.getInstance().removeTexture("hello.png");
     */
    removeTextureForKey:function (textureKeyName) {
        if (textureKeyName == null)
            return;
        var fullPath = cc.FileUtils.getInstance().fullPathForFilename(textureKeyName);
        if (this._textures[fullPath])
            delete(this._textures[fullPath]);
    },

    // Use same function for all load image error event callback
    _loadErrorHandler: function(path, textureCache, removeFrom) {
        cc.Loader.getInstance().onResLoadingErr(path);
        //remove from cache
        if (removeFrom[path])
            delete removeFrom[path];

        this.removeEventListener('error', textureCache._loadErrorHandler, false);
    },

    // Use same function for addImage image load event (with callback)
    _clientLoadHandler: function (texture, textureCache, callback, target) {
        if(texture instanceof cc.Texture2D)
            texture.handleLoadedTexture();
        else if(textureCache._textures[texture])
            textureCache._textures[texture].handleLoadedTexture();
        textureCache._addImageAsyncCallBack(target, callback);
        this.removeEventListener('load', textureCache._addAsyncLoadHandler, false);
    },

    _preloadHandler: function (texture, textureCache) {
        if(texture instanceof cc.Texture2D)
            texture.handleLoadedTexture();
        else if(textureCache._textures[texture])
            textureCache._textures[texture].handleLoadedTexture();
        cc.Loader.getInstance().onResLoaded();
        this.removeEventListener('load', textureCache._addAsyncLoadHandler, false);
    },

    _beforeRendererLoadHandler: function (path, textureCache) {
        cc.Loader.getInstance().onResLoaded();
        var loading = textureCache._loadingTexturesBefore;
        if(loading[path]) {
            textureCache._loadedTexturesBefore[path] = loading[path];
            delete loading[path];
        }
        this.removeEventListener('load', textureCache._beforeRendererLoadHandler, false);
    },

    /**
     *  Loading the images asynchronously
     * @param {String} path
     * @param {cc.Node} target
     * @param {Function} selector
     * @return {cc.Texture2D}
     * @example
     * //example
     * cc.TextureCache.getInstance().addImageAsync("hello.png", this, this.loadingCallBack);
     */
    addImageAsync:function (path, target, selector) {
        if(!path)
            throw "cc.TextureCache.addImageAsync(): path should be non-null";
        path = cc.FileUtils.getInstance().fullPathForFilename(path);
        var texture = this._textures[path];
        var image,that;
        if (texture) {
            if(texture.isLoaded()){
                this._addImageAsyncCallBack(target, selector);
            }else{
                image = texture.getHtmlElementObj();
                image.addEventListener("load", this._clientLoadHandler.bind(image, texture, this, selector, target));
            }
        } else {
            image = new Image();
            image.crossOrigin = "Anonymous";

            image.addEventListener("load", this._clientLoadHandler.bind(image, path, this, selector, target));
            image.addEventListener("error", this._loadErrorHandler.bind(image, path, this, this._textures));
            image.src = path;
            var texture2d = new cc.Texture2D();
            texture2d.initWithElement(image);
            this._textures[path] = texture2d;
        }
        return this._textures[path];
    },

    _addImageBeforeRenderer:function(path){
        var texture = new Image();
        texture.crossOrigin = "Anonymous";

        texture.addEventListener("load", this._beforeRendererLoadHandler.bind(texture, path, this));
        texture.addEventListener("error", this._loadErrorHandler.bind(texture, path, this, this._loadingTexturesBefore));
        texture.src = path;
        this._loadingTexturesBefore[path] = texture;
    },

    /**
     * <p>Returns a Texture2D object given an file image <br />
     * If the file image was not previously loaded, it will create a new Texture2D <br />
     *  object and it will return it. It will use the filename as a key.<br />
     * Otherwise it will return a reference of a previously loaded image. <br />
     * Supported image extensions: .png, .jpg, .gif</p>
     * @param {String} path
     * @return {cc.Texture2D}
     * @example
     * //example
     * cc.TextureCache.getInstance().addImage("hello.png");
     */
    addImage:function (path) {
        if(!path)
            throw "cc.Texture.addImage(): path should be non-null";
        if(cc.renderContextType === cc.WEBGL){
            if (!this._rendererInitialized)
                return this._addImageBeforeRenderer(path);
        }

        path = cc.FileUtils.getInstance().fullPathForFilename(path);

        var texture = this._textures[path];
        var image;
        if (texture) {
            if (texture.isLoaded()) {
                cc.Loader.getInstance().onResLoaded();
            } else {
                image = texture.getHtmlElementObj();
                image.addEventListener("load", this._preloadHandler.bind(image, texture, this));
            }
        } else {
            image = new Image();
            image.crossOrigin = "Anonymous";

            image.addEventListener("load", this._preloadHandler.bind(image, path, this));
            image.addEventListener("error", this._loadErrorHandler.bind(image, path, this, this._textures));
            image.src = path;
            var texture2d = new cc.Texture2D();
            texture2d.initWithElement(image);
            this._textures[path] = texture2d;
        }

        return this._textures[path];
    },

    /**
     *  Cache the image data
     * @param {String} path
     * @param {Image|HTMLImageElement|HTMLCanvasElement} texture
     */
    cacheImage:function (path, texture) {
        if(texture instanceof  cc.Texture2D){
            this._textures[path] = texture;
            return ;
        }
        var texture2d = new cc.Texture2D();
        texture2d.initWithElement(texture);
        texture2d.handleLoadedTexture();
        this._textures[path] = texture2d;
    },

    /**
     * <p>Returns a Texture2D object given an UIImage image<br />
     * If the image was not previously loaded, it will create a new Texture2D object and it will return it.<br />
     * Otherwise it will return a reference of a previously loaded image<br />
     * The "key" parameter will be used as the "key" for the cache.<br />
     * If "key" is null, then a new texture will be created each time.</p>
     * @param {HTMLImageElement|HTMLCanvasElement} image
     * @param {String} key
     * @return {cc.Texture2D}
     */
    addUIImage:function (image, key) {
        if(!image)
            throw "cc.Texture.addUIImage(): image should be non-null";

        if (key) {
            if (this._textures[key])
                return this._textures[key];
        }

        // prevents overloading the autorelease pool
        var texture = new cc.Texture2D();
        texture.initWithImage(image);
        if ((key != null) && (texture != null))
            this._textures[key] = texture;
        else
            cc.log("cocos2d: Couldn't add UIImage in TextureCache");
        return texture;
    },

    /**
     * <p>Output to cc.log the current contents of this TextureCache <br />
     * This will attempt to calculate the size of each texture, and the total texture memory in use. </p>
     */
    dumpCachedTextureInfo:function () {
        var count = 0;
        var totalBytes = 0, locTextures = this._textures;

        for (var key in locTextures) {
            var selTexture = locTextures[key];
            count++;
            if (selTexture.getHtmlElementObj() instanceof  HTMLImageElement)
                cc.log("cocos2d: '" + key + "' id=" + selTexture.getHtmlElementObj().src + " " + selTexture.getPixelsWide() + " x " + selTexture.getPixelsHigh());
            else {
                cc.log("cocos2d: '" + key + "' id= HTMLCanvasElement " + selTexture.getPixelsWide() + " x " + selTexture.getPixelsHigh());
            }
            totalBytes += selTexture.getPixelsWide() * selTexture.getPixelsHigh() * 4;
        }

        var locTextureColorsCache = this._textureColorsCache;
        for (key in locTextureColorsCache) {
            var selCanvasColorsArr = locTextureColorsCache[key];
            for (var selCanvasKey in selCanvasColorsArr){
                var selCanvas = selCanvasColorsArr[selCanvasKey];
                count++;
                cc.log("cocos2d: '" + key + "' id= HTMLCanvasElement " + selCanvas.width + " x " + selCanvas.height);
                totalBytes += selCanvas.width * selCanvas.height * 4;
            }

        }
        cc.log("cocos2d: TextureCache dumpDebugInfo: " + count + " textures, HTMLCanvasElement for "
            + (totalBytes / 1024) + " KB (" + (totalBytes / (1024.0 * 1024.0)).toFixed(2) + " MB)");
    }
});

/**
 * Return ths shared instance of the cache
 * @return {cc.TextureCache}
 */
cc.TextureCache.getInstance = function () {
    if (!cc.g_sharedTextureCache)
        cc.g_sharedTextureCache = new cc.TextureCache();
    return cc.g_sharedTextureCache;
};

/**
 * Purges the cache. It releases the retained instance.
 */
cc.TextureCache.purgeSharedTextureCache = function () {
    cc.g_sharedTextureCache = null;
};
