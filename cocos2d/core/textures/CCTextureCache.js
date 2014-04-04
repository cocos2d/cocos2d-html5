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
 * @namespace The global cache for cc.Texture2D
 */
cc.textureCache = /** @lends cc.textureCache# */{
    _textures: {},
    _textureColorsCache: {},
    _textureKeySeq:(0 | Math.random() * 1000),

    _loadedTexturesBefore: {},

    handleLoadedTexture : function(url){
        var locTexs = this._textures;
        if(cc._renderType === cc._RENDER_TYPE_WEBGL && !cc._rendererInitialized){
            locTexs = this._loadedTexturesBefore;
        }
        var tex = locTexs[url];
        if(!tex) {
            tex = locTexs[url] = new cc.Texture2D();
            tex.url = url;
        }
        tex.handleLoadedTexture();
    },

    _initializingRenderer : function(){
        var selPath;
        //init texture from _loadedTexturesBefore
        var locLoadedTexturesBefore = this._loadedTexturesBefore, locTextures = this._textures;
        for(selPath in locLoadedTexturesBefore){
            var tex2d = locLoadedTexturesBefore[selPath];
            tex2d.handleLoadedTexture();
            locTextures[selPath] = tex2d;
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
     * var key = cc.textureCache.textureForKey("hello.png");
     */
    textureForKey:function (textureKeyName) {
        return this._textures[textureKeyName] || this._textures[cc.loader._aliases[textureKeyName]];
    },

    /**
     * @param {Image} texture
     * @return {String|Null}
     * @example
     * //example
     * var key = cc.textureCache.getKeyByTexture(texture);
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
     * var cacheTextureForColor = cc.textureCache.getTextureColors(texture);
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
        cc.log("addPVRImage does not support on HTML5");
    },

    /**
     * <p>Purges the dictionary of loaded textures. <br />
     * Call this method if you receive the "Memory Warning"  <br />
     * In the short term: it will free some resources preventing your app from being killed  <br />
     * In the medium term: it will allocate more resources <br />
     * In the long term: it will be the same</p>
     * @example
     * //example
     * cc.textureCache.removeAllTextures();
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
     * cc.textureCache.removeTexture(texture);
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
     * cc.textureCache.removeTexture("hello.png");
     */
    removeTextureForKey:function (textureKeyName) {
        if (textureKeyName == null)
            return;
        if (this._textures[textureKeyName])
            delete(this._textures[textureKeyName]);
    },

    /**
     * <p>Returns a Texture2D object given an file image <br />
     * If the file image was not previously loaded, it will create a new Texture2D <br />
     *  object and it will return it. It will use the filename as a key.<br />
     * Otherwise it will return a reference of a previously loaded image. <br />
     * Supported image extensions: .png, .jpg, .gif</p>
     * @param {String} url
     * @param {Function} cb
     * @param {Object} target
     * @return {cc.Texture2D}
     * @example
     * //example
     * cc.textureCache.addImage("hello.png");
     */
    addImage:function (url, cb, target) {
        if(!url)
            throw "cc.Texture.addImage(): path should be non-null";

        var locTexs = this._textures;
        if(cc._renderType === cc._RENDER_TYPE_WEBGL && !cc._rendererInitialized){
            locTexs = this._loadedTexturesBefore;
        }
        var tex = locTexs[url] || locTexs[cc.loader._aliases[url]];
        if(tex) {
            if(cb)
                cb.call(target);
            return tex;
        }

        if(!cc.loader.getRes(url)){
            if (cc.loader._checkIsImageURL(url)) {
                cc.loader.load(url, function (err) {
                    if (cb)
                        cb.call(target);
                });
            } else {
                cc.loader.cache[url] = cc.loader.loadImg(url, function (err, img) {
                    if(err)
                        return cb(err);
                    cc.textureCache.handleLoadedTexture(url);
                    cb(null, img);
                });
            }
        }

        tex = locTexs[url] = new cc.Texture2D();
        tex.url = url;
        return tex;
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
                cc.log("cocos2d: '" + key + "' id=" + selTexture.getHtmlElementObj().src + " " + selTexture.pixelsWidth + " x " + selTexture.pixelsHeight);
            else {
                cc.log("cocos2d: '" + key + "' id= HTMLCanvasElement " + selTexture.pixelsWidth + " x " + selTexture.pixelsHeight);
            }
            totalBytes += selTexture.pixelsWidth * selTexture.pixelsHeight * 4;
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
    },

	_clear: function () {
		this._textures = {};
		this._textureColorsCache = {};
		this._textureKeySeq = (0 | Math.random() * 1000);
		this._loadedTexturesBefore = {};
	}
};