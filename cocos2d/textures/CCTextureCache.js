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
var cc = cc = cc || {};

// TextureCache - Alloc, Init & Dealloc
cc.g_sharedTextureCache = null;

cc.loadImage = function (imageUrl) {
    // compute image type
    var imageType = cc.computeImageFormatType(imageUrl);
    if (imageType == cc.FMT_UNKNOWN) {
        cc.LOG("unsupportted format" + imageUrl);
        return;
    }

    var getImage = new Image();
    getImage.onload = function (e) {
        cc.TextureCache.sharedTextureCache().cacheImage(imageUrl, getImage);
    };

    getImage.src = imageUrl;
};

cc.computeImageFormatType = function (filename) {
    if (filename.toLowerCase().indexOf('.jpg') > 0 || filename.toLowerCase().indexOf('.jpeg') > 0) {
        return cc.FMT_JPG;
    } else if (filename.indexOf('.png') > 0 || filename.indexOf('.PNG') > 0) {
        return cc.FMT_PNG;
    }
    return cc.FMT_UNKNOWN;
};

// implementation TextureCache
cc.TextureCache = cc.Class.extend({
    /*protected && private:*/
    textures:new Object(),
    _textureColorsCache:new Object(),
    ctor:function () {
        cc.Assert(cc.g_sharedTextureCache == null, "Attempted to allocate a second instance of a singleton.");
    },
    addImageAsync:function (path, target, selector) {
        cc.Assert(path != null, "TextureCache: fileimage MUST not be null");
        var texture = this.textures[path.toString()];

        if (texture) {
            this._addImageAsyncCallBack(target, selector);
        }
        else {
            texture = new Image();
            var that = this;
            texture.addEventListener("load", function () {
                that._addImageAsyncCallBack(target, selector);
            });
            texture.src = path;
            this.textures[path.toString()] = texture;
        }

        if (cc.renderContextType == cc.CANVAS) {
            return this.textures[path.toString()];
        } else {
            //todo texure for gl
        }
    },
    _addImageAsyncCallBack:function (target, selector) {
        if (target && (typeof(selector) == "string")) {
            target[selector]();
        } else if (target && (typeof(selector) == "function")) {
            selector.call(target);
        }
    },
    addPVRTCImage:function (path, bpp, hasAlpha, width) {
        cc.Assert(0, "TextureCache:addPVRTCImage does not support");
    },
    /*public:*/
    description:function () {
        return "<TextureCache | Number of textures = " + this.textures.length + ">";
    },

    /** Returns a Texture2D object given an file image
     * If the file image was not previously loaded, it will create a new Texture2D
     *  object and it will return it. It will use the filename as a key.
     * Otherwise it will return a reference of a previosly loaded image.
     * Supported image extensions: .png, .jpeg, .gif
     */
    addImage:function (path) {
        cc.Assert(path != null, "TextureCache: fileimage MUST not be null");
        var texture = this.textures[path.toString()];
        if (texture) {
            cc.Loader.shareLoader().onResLoaded();
        }
        else {
            texture = new Image();
            var that = this;
            texture.addEventListener("load", function () {

                cc.Loader.shareLoader().onResLoaded();
            });
            texture.addEventListener("error", function () {
                cc.Loader.shareLoader().onResLoadingErr(path);
            });
            texture.src = path;
            this.textures[path.toString()] = texture;
        }

        if (cc.renderContextType == cc.CANVAS) {
            return this.textures[path.toString()];
        } else {
            //todo texure for gl
        }
    },

    /* Returns a Texture2D object given an CGImageRef image
     * If the image was not previously loaded, it will create a new Texture2D object and it will return it.
     * Otherwise it will return a reference of a previously loaded image
     * The "key" parameter will be used as the "key" for the cache.
     * If "key" is nil, then a new texture will be created each time.
     * @since v0.8
     */
// @todo CGImageRef Texture2D* addCGImage(CGImageRef image, string &  key);
    /** Returns a Texture2D object given an UIImage image
     * If the image was not previously loaded, it will create a new Texture2D object and it will return it.
     * Otherwise it will return a reference of a previously loaded image
     * The "key" parameter will be used as the "key" for the cache.
     * If "key" is nil, then a new texture will be created each time.
     */
    addUIImage:function (image, key) {
        cc.Assert(image != null, "TextureCache: image MUST not be nill");

        var texture = null;

        if (key) {
            if ( this.textures.hasOwnProperty(key)){
                texture = this.textures[key];
                if (texture) {
                    return texture;
                }
            }
        }

        // prevents overloading the autorelease pool
        texture = new cc.Texture2D();
        texture.initWithImage(image);

        if ((key != null) && (texture != null)) {
            this.textures[key] = texture;
        } else {
            cc.LOG("cocos2d: Couldn't add UIImage in TextureCache");
        }

        return texture;
    },

    /** Returns an already created texture. Returns nil if the texture doesn't exist.
     @since v0.99.5
     */
    textureForKey:function (key) {
        if (this.textures.hasOwnProperty(key)) {
            return this.textures[key];
        } else {
            return null;
        }
    },

    getKeyByTexture:function(texture) {
        for(var key in this.textures){
            if(this.textures[key] == texture){
                return key;
            }
        }
        return null;
    },

    getTextureColors:function(texture){
        var key = this.getKeyByTexture(texture);
        if(key){
            if(texture instanceof HTMLImageElement){
                key = texture.src;
            }else{
                return null;
            }
        }

        if(!this._textureColorsCache.hasOwnProperty(key)){
            this._textureColorsCache[key] = cc.generateTextureCacheForColor(texture);
        }
        return this._textureColorsCache[key];
    },

    /** Purges the dictionary of loaded textures.
     * Call this method if you receive the "Memory Warning"
     * In the short term: it will free some resources preventing your app from being killed
     * In the medium term: it will allocate more resources
     * In the long term: it will be the same
     */
    removeAllTextures:function () {
        this.textures = new Object();
    },

    /** Deletes a texture from the cache given a texture
     */
    removeTexture:function (texture) {
        if (!texture)
            return;

        for (var key in this.textures) {
            if (this.textures[key] == texture) {
                delete(this.textures[key]);
                return;
            }
        }
    },

    /** Deletes a texture from the cache given a its key name
     @since v0.99.4
     */
    removeTextureForKey:function (textureKeyName) {
        if (textureKeyName == null) {
            return;
        }

        delete(this.textures[textureKeyName]);
    },

    /** Output to cc.LOG the current contents of this TextureCache
     * This will attempt to calculate the size of each texture, and the total texture memory in use
     *
     * @since v1.0
     */
    dumpCachedTextureInfo:function () {
        var count = 0;
        var totalBytes = 0;
        for (var key in this.textures) {
            var tex = this.textures[key];
            var bpp = tex.bitsPerPixelForFormat();
            // Each texture takes up width * height * bytesPerPixel bytes.
            var bytes = tex.getPixelsWide() * tex.getPixelsHigh() * bpp / 8;
            totalBytes += bytes;
            count++;
            cc.LOG("cocos2d: '" + tex.toString() + "' id=" + tex.getName() + " " + tex.getPixelsWide() + " x " + tex.getPixelsHigh() + " @ " + bpp + " bpp => " + bytes / 1024 + " KB");
        }

        cc.LOG("cocos2d: TextureCache dumpDebugInfo: " + count + " textures, for " + (totalBytes / 1024) + " KB (" + (totalBytes / (1024.0 * 1024.0)).toFixed(2) + " MB)");
    },


    /** Returns a Texture2D object given an PVRTC RAW filename
     * If the file image was not previously loaded, it will create a new Texture2D
     *  object and it will return it. Otherwise it will return a reference of a previosly loaded image
     *
     * It can only load square images: width == height, and it must be a power of 2 (128,256,512...)
     * bpp can only be 2 or 4. 2 means more compression but lower quality.
     * hasAlpha: whether or not the image contains alpha channel
     */

    // cc.SUPPORT_PVRTC

    /** Returns a Texture2D object given an PVR filename
     * If the file image was not previously loaded, it will create a new Texture2D
     *  object and it will return it. Otherwise it will return a reference of a previosly loaded image
     */
    addPVRImage:function (path) {
        cc.Assert(path != null, "TextureCache: fileimage MUST not be nill");

        var key = path;
        // remove possible -HD suffix to prevent caching the same image twice (issue #1040)
        //cc.FileUtils.RemoveHDSuffixFromFile(key);

        if (this.textures[key] != null) {
            return this.textures[key];
        }

        // Split up directory and filename
        //var fullpath = cc.FileUtils.fullPathFromRelativePath(key.c_str());
        var tex = new cc.Texture2D();
        if (tex.initWithPVRFile(key)) {
            this.textures[key] = tex;
        } else {
            cc.LOG("cocos2d: Couldn't add PVRImage:" + key + " in TextureCache");
        }

        return tex;
    }
});

/** Retruns ths shared instance of the cache */
cc.TextureCache.sharedTextureCache = function () {
    if (!cc.g_sharedTextureCache)
        cc.g_sharedTextureCache = new cc.TextureCache();

    return cc.g_sharedTextureCache;
};

/** purges the cache. It releases the retained instance.
 @since v0.99.0
 */
cc.TextureCache.purgeSharedTextureCache = function () {
    cc.g_sharedTextureCache = null;
};


cc.INVALID = 0;
cc.IMAGE_FILE = 1;
cc.IMAGE_DATA = 2;
cc.STRING = 3;