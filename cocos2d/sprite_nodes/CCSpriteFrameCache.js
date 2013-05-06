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
 * Singleton that handles the loading of the sprite frames. It saves in a cache the sprite frames.
 * @class
 * @extends cc.Class
 * @example
 * // add SpriteFrames to SpriteFrameCache With File
 * cc.SpriteFrameCache.getInstance().addSpriteFrames(s_grossiniPlist);
 */
cc.SpriteFrameCache = cc.Class.extend(/** @lends cc.SpriteFrameCache# */{
    _spriteFrames:null,
    _spriteFramesAliases:null,
    _loadedFileNames:null,

    /**
     * Constructor
     */
    ctor:function () {
        this._spriteFrames = {};
        this._spriteFramesAliases = {};
        this._loadedFileNames = [];
    },

    /**
     * Adds multiple Sprite Frames with a dictionary. The texture will be associated with the created sprite frames.
     * @param {object} dictionary
     * @param {HTMLImageElement|cc.Texture2D} texture
     */
    _addSpriteFramesWithDictionary:function (dictionary, texture) {
        var metadataDict = dictionary["metadata"];
        var framesDict = dictionary["frames"];
        var format = 0;
        // get the format
        if (metadataDict != null) {
            format = parseInt(this._valueForKey("format", metadataDict));
        }

        // check the format
        cc.Assert(format >= 0 && format <= 3, "format is not supported for cc.SpriteFrameCache addSpriteFramesWithDictionary:textureFilename:");

        for (var key in framesDict) {
            var frameDict = framesDict[key];
            if (frameDict) {
                var spriteFrame = this._spriteFrames[key];
                if (spriteFrame) {
                    continue;
                }

                if (format == 0) {
                    var x = parseFloat(this._valueForKey("x", frameDict));
                    var y = parseFloat(this._valueForKey("y", frameDict));
                    var w = parseFloat(this._valueForKey("width", frameDict));
                    var h = parseFloat(this._valueForKey("height", frameDict));
                    var ox = parseFloat(this._valueForKey("offsetX", frameDict));
                    var oy = parseFloat(this._valueForKey("offsetY", frameDict));
                    var ow = parseInt(this._valueForKey("originalWidth", frameDict));
                    var oh = parseInt(this._valueForKey("originalHeight", frameDict));
                    // check ow/oh
                    if (!ow || !oh) {
                        cc.log("cocos2d: WARNING: originalWidth/Height not found on the cc.SpriteFrame. AnchorPoint won't work as expected. Regenrate the .plist");
                    }
                    // Math.abs ow/oh
                    ow = Math.abs(ow);
                    oh = Math.abs(oh);
                    // create frame
                    spriteFrame = new cc.SpriteFrame();
                    spriteFrame.initWithTexture(texture, cc.rect(x, y, w, h), false, cc.p(ox, oy), cc.size(ow, oh));
                } else if (format == 1 || format == 2) {
                    var frame = cc.RectFromString(this._valueForKey("frame", frameDict));
                    var rotated = false;

                    // rotation
                    if (format == 2) {
                        rotated = this._valueForKey("rotated", frameDict) == "true";
                    }
                    var offset = cc.PointFromString(this._valueForKey("offset", frameDict));
                    var sourceSize = cc.SizeFromString(this._valueForKey("sourceSize", frameDict));
                    // create frame
                    spriteFrame = new cc.SpriteFrame();
                    spriteFrame.initWithTexture(texture, frame, rotated, offset, sourceSize);
                } else if (format == 3) {
                    // get values
                    var spriteSize, spriteOffset, spriteSourceSize, textureRect, textureRotated;
                    spriteSize = cc.SizeFromString(this._valueForKey("spriteSize", frameDict));
                    spriteOffset = cc.PointFromString(this._valueForKey("spriteOffset", frameDict));
                    spriteSourceSize = cc.SizeFromString(this._valueForKey("spriteSourceSize", frameDict));
                    textureRect = cc.RectFromString(this._valueForKey("textureRect", frameDict));
                    textureRotated = this._valueForKey("textureRotated", frameDict) == "true";

                    // get aliases
                    var aliases = frameDict["aliases"];
                    var frameKey = key.toString();

                    for (var aliasKey in aliases) {
                        if (this._spriteFramesAliases.hasOwnProperty(aliases[aliasKey])) {
                            cc.log("cocos2d: WARNING: an alias with name " + aliasKey + " already exists");
                        }
                        this._spriteFramesAliases[aliases[aliasKey]] = frameKey;
                    }

                    // create frame
                    spriteFrame = new cc.SpriteFrame();
                    if (frameDict.hasOwnProperty("spriteSize")) {
                        spriteFrame.initWithTexture(texture,
                            cc.rect(textureRect.origin.x, textureRect.origin.y, spriteSize.width, spriteSize.height),
                            textureRotated,
                            spriteOffset,
                            spriteSourceSize);
                    } else {
                        spriteFrame.initWithTexture(texture, spriteSize, textureRotated, spriteOffset, spriteSourceSize);
                    }
                }

                if(cc.renderContextType === cc.CANVAS && spriteFrame.isRotated()){
                    //clip to canvas
                    var tempTexture = cc.cutRotateImageToCanvas(spriteFrame.getTexture(), spriteFrame.getRect());
                    var rect = spriteFrame.getRect();
                    spriteFrame.setRect(cc.rect(0, 0, rect.size.width, rect.size.height));
                    spriteFrame.setTexture(tempTexture);
                }

                // add sprite frame
                this._spriteFrames[key] = spriteFrame;
            }
        }
    },

    /**
     * Adds multiple Sprite Frames from a json file. A texture will be loaded automatically.
     * @param {object} jsonData
     */
    addSpriteFramesWithJson:function (jsonData) {
        var dict = jsonData;
        var texturePath = "";

        var metadataDict = dict["metadata"];
        if (metadataDict) {
            // try to read  texture file name from meta data
            texturePath = this._valueForKey("textureFileName", metadataDict);
            texturePath = texturePath.toString();
        }

        var texture = cc.TextureCache.getInstance().addImage(texturePath);
        if (texture) {
            this._addSpriteFramesWithDictionary(dict, texture);
        }
        else {
            cc.log("cocos2d: cc.SpriteFrameCache: Couldn't load texture");
        }
    },

    /**
     * <p>
     *   Adds multiple Sprite Frames from a plist file.<br/>
     *   A texture will be loaded automatically. The texture name will composed by replacing the .plist suffix with .png<br/>
     *   If you want to use another texture, you should use the addSpriteFrames:texture method.<br/>
     * </p>
     * @param {String} plist plist filename
     * @param {HTMLImageElement|cc.Texture2D} texture
     * @example
     * // add SpriteFrames to SpriteFrameCache With File
     * cc.SpriteFrameCache.getInstance().addSpriteFrames(s_grossiniPlist);
     */
    addSpriteFrames:function (plist, texture) {
        var dict = cc.FileUtils.getInstance().dictionaryWithContentsOfFileThreadSafe(plist);

        switch (arguments.length) {
            case 1:
                cc.Assert(plist, "plist filename should not be NULL");
                if (!cc.ArrayContainsObject(this._loadedFileNames, plist)) {
                    var texturePath = "";
                    var metadataDict = dict["metadata"];
                    if (metadataDict) {
                        // try to read  texture file name from meta data
                        texturePath = this._valueForKey("textureFileName", metadataDict).toString();
                    }
                    if (texturePath != "") {
                        // build texture path relative to plist file
                        var getIndex = plist.lastIndexOf('/'), pszPath;
                        pszPath = getIndex ? plist.substring(0, getIndex + 1) : "";
                        texturePath = pszPath + texturePath;
                    } else {
                        // build texture path by replacing file extension
                        texturePath = plist;

                        // remove .xxx
                        var startPos = texturePath.lastIndexOf(".", texturePath.length);
                        texturePath = texturePath.substr(0, startPos);

                        // append .png
                        texturePath = texturePath + ".png";
                    }

                    var getTexture = cc.TextureCache.getInstance().addImage(texturePath);
                    if (getTexture) {
                        this._addSpriteFramesWithDictionary(dict, getTexture);
                    } else {
                        cc.log("cocos2d: cc.SpriteFrameCache: Couldn't load texture");
                    }
                }
                break;
            case 2:
                if ((texture instanceof cc.Texture2D) || (texture instanceof HTMLImageElement) || (texture instanceof HTMLCanvasElement)) {
                    /** Adds multiple Sprite Frames from a plist file. The texture will be associated with the created sprite frames. */
                    this._addSpriteFramesWithDictionary(dict, texture);
                } else {
                    /** Adds multiple Sprite Frames from a plist file. The texture will be associated with the created sprite frames.
                     @since v0.99.5
                     */
                    var textureFileName = texture;
                    cc.Assert(textureFileName, "texture name should not be null");
                    var gTexture = cc.TextureCache.getInstance().addImage(textureFileName);

                    if (gTexture) {
                        this._addSpriteFramesWithDictionary(dict, gTexture);
                    } else {
                        cc.log("cocos2d: cc.SpriteFrameCache: couldn't load texture file. File not found " + textureFileName);
                    }
                }
                break;
            default:
                throw "Argument must be non-nil ";
        }
    },

    /**
     * <p>
     *  Adds an sprite frame with a given name.<br/>
     *  If the name already exists, then the contents of the old name will be replaced with the new one.
     * </p>
     * @param {cc.SpriteFrame} frame
     * @param {String} frameName
     */
    addSpriteFrame:function (frame, frameName) {
        this._spriteFrames[frameName] = frame;
    },

    /**
     * <p>
     *   Purges the dictionary of loaded sprite frames.<br/>
     *   Call this method if you receive the "Memory Warning".<br/>
     *   In the short term: it will free some resources preventing your app from being killed.<br/>
     *   In the medium term: it will allocate more resources.<br/>
     *   In the long term: it will be the same.<br/>
     * </p>
     */
    removeSpriteFrames:function () {
        this._spriteFrames = [];
        this._spriteFramesAliases = [];
        this._loadedFileNames = {};
    },

    /**
     * Deletes an sprite frame from the sprite frame cache.
     * @param {String} name
     */
    removeSpriteFrameByName:function (name) {
        // explicit nil handling
        if (!name) {
            return;
        }

        // Is this an alias ?
        if (this._spriteFramesAliases.hasOwnProperty(name)) {
            delete(this._spriteFramesAliases[name]);
        }
        if (this._spriteFrames.hasOwnProperty(name)) {
            delete(this._spriteFrames[name]);
        }
        // XXX. Since we don't know the .plist file that originated the frame, we must remove all .plist from the cache
        this._loadedFileNames = {};
    },

    /**
     * <p>
     *     Removes multiple Sprite Frames from a plist file.<br/>
     *     Sprite Frames stored in this file will be removed.<br/>
     *     It is convinient to call this method when a specific texture needs to be removed.<br/>
     * </p>
     * @param {String} plist plist filename
     */
    removeSpriteFramesFromFile:function (plist) {
        var path = cc.FileUtils.getInstance().fullPathFromRelativePath(plist);
        var dict = cc.FileUtils.getInstance().dictionaryWithContentsOfFileThreadSafe(path);

        this._removeSpriteFramesFromDictionary(dict);

        //remove it from the cache
        if (cc.ArrayContainsObject(this._loadedFileNames, plist)) {
            cc.ArrayRemoveObject(plist);
        }
    },

    /**
     * Removes multiple Sprite Frames from Dictionary.
     * @param {object} dictionary SpriteFrame of Dictionary
     */
    _removeSpriteFramesFromDictionary:function (dictionary) {
        var framesDict = dictionary["frames"];

        for (var key in framesDict) {
            if (this._spriteFrames.hasOwnProperty(key)) {
                delete(this._spriteFrames[key]);
            }
        }
    },

    /**
     * <p>
     *    Removes all Sprite Frames associated with the specified textures.<br/>
     *    It is convinient to call this method when a specific texture needs to be removed.
     * </p>
     * @param {HTMLImageElement|HTMLCanvasElement|cc.Texture2D} texture
     */
    removeSpriteFramesFromTexture:function (texture) {
        for (var key in this._spriteFrames) {
            var frame = this._spriteFrames[key];
            if (frame && (frame.getTexture() == texture)) {
                delete(this._spriteFrames[key]);
            }
        }
    },

    /**
     * <p>
     *   Returns an Sprite Frame that was previously added.<br/>
     *   If the name is not found it will return nil.<br/>
     *   You should retain the returned copy if you are going to use it.<br/>
     * </p>
     * @param {String} name name of SpriteFrame
     * @return {cc.SpriteFrame}
     * @example
     * //get a SpriteFrame by name
     * var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame("grossini_dance_01.png");
     */
    getSpriteFrame:function (name) {
        var frame;
        if (this._spriteFrames.hasOwnProperty(name)) {
            frame = this._spriteFrames[name];
        }

        if (!frame) {
            // try alias dictionary
            var key;
            if (this._spriteFramesAliases.hasOwnProperty(name)) {
                key = this._spriteFramesAliases[name];
            }
            if (key) {
                if (this._spriteFrames.hasOwnProperty(key.toString())) {
                    frame = this._spriteFrames[key.toString()];
                }
                if (!frame) {
                    cc.log("cocos2d: cc.SpriteFrameCahce: Frame " + name + " not found");
                }
            }
        }
        return frame;
    },

    _valueForKey:function (key, dict) {
        if (dict) {
            if (dict.hasOwnProperty(key)) {
                return dict[key].toString();
            }
        }
        return "";
    }
});

cc.s_sharedSpriteFrameCache = null;

/**
 * Returns the shared instance of the Sprite Frame cache
 * @return {cc.SpriteFrameCache}
 */
cc.SpriteFrameCache.getInstance = function () {
    if (!cc.s_sharedSpriteFrameCache) {
        cc.s_sharedSpriteFrameCache = new cc.SpriteFrameCache();
    }
    return cc.s_sharedSpriteFrameCache;
};

/**
 * Purges the cache. It releases all the Sprite Frames and the retained instance.
 */
cc.SpriteFrameCache.purgeSharedSpriteFrameCache = function () {
    cc.s_sharedSpriteFrameCache = null;
};
