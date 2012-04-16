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

/** @brief Singleton that handles the loading of textures
 * Once the texture is loaded, the next time it will return
 * a reference of the previously loaded texture reducing GPU & CPU memory
 */
function _AsyncStruct(filename, target, selector) {
    this.filename = filename;
    this.target = target;
    this.selector = selector;
}

function _ImageInfo(asyncStruct, image, imageType) {
    this.asyncStruct = asyncStruct;
    this.image = image;
    this.imageType = imageType;
}

// TextureCache - Alloc, Init & Dealloc
cc.g_sharedTextureCache = null;

cc.loadImage = function (imageUrl) {
    // compute image type
    var imageType = cc.computeImageFormatType(imageUrl);
    if (imageType == cc.kFmtUnKnown) {
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
        return cc.kFmtJpg;
    } else if (filename.indexOf('.png') > 0 || filename.indexOf('.PNG') > 0) {
        return cc.kFmtPng;
    }
    return cc.kFmtUnKnown;
};

// implementation TextureCache
cc.TextureCache = cc.Class.extend({
    /*protected && private:*/
    m_pTextures:null,
    _m_pImages:null,

    _addImageAsyncCallBack:function (dt) {
        // the image is generated in loading thread
        var imagesQueue = cc.s_pImageQueue;

        cc.pthread_mutex_lock(cc.s_ImageInfoMutex);
        if (imagesQueue.empty()) {
            cc.pthread_mutex_unlock(cc.s_ImageInfoMutex);
        }
        else {
            var pImageInfo = imagesQueue.front();
            imagesQueue.pop();
            cc.pthread_mutex_unlock(cc.s_ImageInfoMutex);
            var pAsyncStruct = new _AsyncStruct();
            pAsyncStruct = pImageInfo.asyncStruct;
            var pImage = new cc.Image();
            pImage = pImageInfo.image;

            var target = pAsyncStruct.target;
            var selector = pAsyncStruct.selector;
            var filename = pAsyncStruct.filename.c_str();

            // generate texture in render thread
            var texture = new cc.Texture2D();
            texture.initWithImage(pImage);

            if (cc.ENABLE_CACHE_TEXTTURE_DATA) {
                // cache the texture file name
                if (pImageInfo.imageType == cc.kFmtJpg) {
                    cc.VolatileTexture.addImageTexture(texture, filename, cc.kFmtJpg);
                }
                else {
                    cc.VolatileTexture.addImageTexture(texture, filename, cc.kFmtPng);
                }
            }

            // cache the texture
            this.m_pTextures.setObject(texture, filename);

            if (target && selector) {
                window[target][selector](texture);
            }

            delete pImage;
            delete pAsyncStruct;
            delete pImageInfo;
        }
    },

    ctor:function () {
        cc.Assert(cc.g_sharedTextureCache == null, "Attempted to allocate a second instance of a singleton.");
        this.m_pTextures = new Object();
        this._m_pImages = new Object();
    },

    addPVRTCImage:function (path, bpp, hasAlpha, width) {
        cc.Assert(path != null, "TextureCache:addPVRTCImage fileimage MUST not be nill");
        cc.Assert(bpp == 2 || bpp == 4, "TextureCache:addPVRTCImage bpp must be either 2 or 4");
        var texture = new cc.Texture2D();
        var temp = path;
        cc.FileUtils.RemoveHDSuffixFromFile(temp);
        if ((texture = this.m_pTextures.objectForKey(temp))) {
            return texture;
        }

        // Split up directory and filename
        var fullpath = cc.FileUtils.fullPathFromRelativePath(path);

        var data = new cc.Data();
        data = cc.Data.dataWithContentsOfFile(fullpath);
        texture = new cc.Texture2D();

        if (texture.initWithPVRTCData(data.bytes(), 0, bpp, hasAlpha, width,
            (bpp == 2 ? cc.kTexture2DPixelFormat_PVRTC2 : cc.kTexture2DPixelFormat_PVRTC4))) {
            this.m_pTextures.setObject(texture, temp);
        } else {
            cc.LOG("cocos2d: Couldn't add PVRTCImage:" + path + " in TextureCache");
        }
        return texture;
    },

    /*public:*/
    description:function () {
        return "<TextureCache | Number of textures = " + this.m_pTextures.count() + ">";
    },

    /** Returns a Texture2D object given an file image
     * If the file image was not previously loaded, it will create a new Texture2D
     *  object and it will return it. It will use the filename as a key.
     * Otherwise it will return a reference of a previosly loaded image.
     * Supported image extensions: .png, .bmp, .tiff, .jpeg, .pvr, .gif
     */
    addImage:function (path, loadCallback, errorCallback) {
        cc.Assert(path != null, "TextureCache: fileimage MUST not be null");

        var getImage = new Image();
        this._m_pImages[path] = getImage;
        if (loadCallback)
            getImage.onload = function (e) {
                loadCallback(e);
            };
        if (errorCallback)
            getImage.onerror = function (e) {
                errorCallback(e);
            };
        getImage.src = path;

        if (cc.renderContextType == cc.kCanvas) {
            return getImage;
        } else {
            var texture = this.m_pTextures[path];

            if (texture != null) {
                return texture;
            }

            var lowerCase = path.toLowerCase();

            if (lowerCase.indexOf('.pvr') > 0) {
                texture = this.addPVRImage(path);
            } else if (lowerCase.indexOf('.jpg') > 0 || lowerCase.indexOf('.jpeg') > 0) {
                var image = new cc.Image();
                if (!image.initWithImageData(pBuffer, nSize, cc.kFmtJpg))return null;

                texture = new cc.Texture2D();
                texture.initWithImage(image);

                if (texture) {
                    this.m_pTextures[path] = texture;
                }
                else {
                    cc.LOG("cocos2d: Couldn't add image:" + path + " in TextureCache");
                }
            }
            else {
                // prevents overloading the autorelease pool
                var image = new cc.Image();

                if (!image.initWithImageData(pBuffer, nSize, cc.kFmtPng)) return null;

                texture = new cc.Texture2D();
                texture.initWithImage(image);

                if (texture) {
                    this.m_pTextures[pathKey] = texture;
                }
                else {
                    cc.LOG("cocos2d: Couldn't add image:" + path + " in TextureCache");
                }
            }

            //cc.pthread_mutex_unlock(this.m_pDictLock);
            return texture;
        }
    },

    cacheImage:function (imageUrl, image) {
        if ((imageUrl == null) || (image == null))
            return;

        this._m_pImages[imageUrl] = image;
        if (cc.renderContextType == cc.kWebGL) {
            //webgl
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

        if (key != null) {
            texture = this.m_pTextures[key];
            if (texture != null) {
                return texture;
            }
        }

        // prevents overloading the autorelease pool
        texture = new cc.Texture2D();
        texture.initWithImage(image);

        if ((key != null) && (texture != null)) {
            this.m_pTextures[key] = texture;
        } else {
            cc.LOG("cocos2d: Couldn't add UIImage in TextureCache");
        }

        return texture;
    },

    /** Returns an already created texture. Returns nil if the texture doesn't exist.
     @since v0.99.5
     */
    textureForKey:function (key) {
        //var strKey = cc.FileUtils.fullPathFromRelativePath(key);
        if (cc.renderContextType == cc.kCanvas)
            return this._m_pImages[key];
        return this.m_pTextures[key];
    },

    /** Purges the dictionary of loaded textures.
     * Call this method if you receive the "Memory Warning"
     * In the short term: it will free some resources preventing your app from being killed
     * In the medium term: it will allocate more resources
     * In the long term: it will be the same
     */
    removeAllTextures:function () {
        this._m_pImages = new Object();
        this.m_pTextures = new Object();
    },

    /** Deletes a texture from the cache given a texture
     */
    removeTexture:function (texture) {
        if (!texture)
            return;

        for (var key in this._m_pImages) {
            if (this._m_pImages[key] == texture) {
                delete(this._m_pImages[key]);
                return;
            }
        }

        for (var key in this.m_pTextures) {
            if (this.m_pTextures[key] == texture) {
                delete(this.m_pTextures[key]);
                delete(this._m_pImages[key]);
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

        //var fullPath = cc.FileUtils.fullPathFromRelativePath(textureKeyName);
        delete(this._m_pImages[textureKeyName]);
        delete(this.m_pTextures[textureKeyName]);
    },

    /** Output to cc.LOG the current contents of this TextureCache
     * This will attempt to calculate the size of each texture, and the total texture memory in use
     *
     * @since v1.0
     */
    dumpCachedTextureInfo:function () {
        var count = 0;
        var totalBytes = 0;
        for (var key in this.m_pTextures) {
            var tex = this.m_pTextures[key];
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

        if (this.m_pTextures[key] != null) {
            return this.m_pTextures[key];
        }

        // Split up directory and filename
        //var fullpath = cc.FileUtils.fullPathFromRelativePath(key.c_str());
        var tex = new cc.Texture2D();
        if (tex.initWithPVRFile(key)) {
            this.m_pTextures[key] = tex;
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


cc.kInvalid = 0;
cc.kImageFile = 1;
cc.kImageData = 2;
cc.kString = 3;
