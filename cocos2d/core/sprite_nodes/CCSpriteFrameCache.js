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
    _spriteFrames: null,
    _spriteFramesAliases: null,
    _loadedFileNames: null,

    /**
     * Constructor
     */
    ctor: function () {
        this._spriteFrames = {};
        this._spriteFramesAliases = {};
        this._loadedFileNames = [];
    },

    /**
     * Adds multiple Sprite Frames with a dictionary. The texture will be associated with the created sprite frames.
     * @param {object} dictionary
     * @param {cc.Texture2D} texture
     */
    _addSpriteFramesWithDictionary: function (dictionary, texture) {
        var metadataDict = dictionary["metadata"] || dictionary["meta"];
        var framesDict = dictionary["frames"];

        var format = 0;
        // get the format
        if (metadataDict) {
            var tmpFormat = metadataDict["format"];
            format = (tmpFormat.length <= 1) ? parseInt(tmpFormat) : tmpFormat;
        }

        // check the format
        if (format < 0 || format > 3) {
            cc.log("format is not supported for cc.SpriteFrameCache.addSpriteFramesWithDictionary");
            return;
        }

        for (var key in framesDict) {
            var frameDict = framesDict[key];
            if (frameDict) {
                var spriteFrame = this._spriteFrames[key];
                if (spriteFrame) {
	                continue;
                }

                if (format == 0) {
                    var x = parseFloat(frameDict["x"]);
                    var y = parseFloat(frameDict["y"]);
                    var w = parseFloat(frameDict["width"]);
                    var h = parseFloat(frameDict["height"]);
                    var ox = parseFloat(frameDict["offsetX"]);
                    var oy = parseFloat(frameDict["offsetY"]);
                    var ow = parseInt(frameDict["originalWidth"]);
                    var oh = parseInt(frameDict["originalHeight"]);
                    // check ow/oh
                    if (!ow || !oh) {
                        cc.log("cocos2d: WARNING: originalWidth/Height not found on the cc.SpriteFrame. AnchorPoint won't work as expected. Regenrate the .plist");
                    }
                    // Math.abs ow/oh
                    ow = Math.abs(ow);
                    oh = Math.abs(oh);
                    // create frame
                    spriteFrame = cc.SpriteFrame.createWithTexture(texture, cc.rect(x, y, w, h), false, cc.p(ox, oy), cc.size(ow, oh));
                }
                else if (format == 1 || format == 2) {
                    var frame = cc.RectFromString(frameDict["frame"]);
                    var rotated = false;

                    // rotation
                    if (format == 2) {
                        rotated = frameDict["rotated"];// == "true";
                    }
                    var offset = cc.PointFromString(frameDict["offset"]);
                    var sourceSize = cc.SizeFromString(frameDict["sourceSize"]);
                    // create frame
                    spriteFrame = cc.SpriteFrame.createWithTexture(texture, frame, rotated, offset, sourceSize);
                }
                else if (format == 3) {
                    // get values
                    var spriteSize, spriteOffset, spriteSourceSize, textureRect, textureRotated;
                    spriteSize = cc.SizeFromString(frameDict["spriteSize"]);
                    spriteOffset = cc.PointFromString(frameDict["spriteOffset"]);
                    spriteSourceSize = cc.SizeFromString(frameDict["spriteSourceSize"]);
                    textureRect = cc.RectFromString(frameDict["textureRect"]);
                    textureRotated = frameDict["textureRotated"]; // == "true";

                    // get aliases
                    var aliases = frameDict["aliases"];
                    var frameKey = key.toString();

                    for (var aliasKey in aliases) {
	                    var alias = aliases[aliasKey];
                        if (this._spriteFramesAliases[alias]) {
                            cc.log("cocos2d: WARNING: an alias with name " + aliasKey + " already exists");
                        }
                        this._spriteFramesAliases[alias] = frameKey;
                    }
                    if (frameDict["spriteSize"] !== undefined) {
                        textureRect = cc.rect(textureRect.x, textureRect.y, spriteSize.width, spriteSize.height);
                    }
                    //create frame
                    spriteFrame = cc.SpriteFrame.createWithTexture(texture, textureRect, textureRotated, spriteOffset, spriteSourceSize);
                }
                else {
                    var filename = frameDict["filename"], tmpFrame = frameDict["frame"], tmpSourceSize = frameDict["sourceSize"];
                    var jsonFrame = cc.rect(tmpFrame.x, tmpFrame.y, tmpFrame.w, tmpFrame.h);
                    var jsonRotated = frameDict["rotated"];
                    var jsonOffset = cc.p(0, 0);
                    var jsonSourceSize = cc.size(tmpSourceSize.w, tmpSourceSize.h);
                    // create frame
                    spriteFrame = cc.SpriteFrame.createWithTexture(texture, jsonFrame, jsonRotated, jsonOffset, jsonSourceSize);
                }

                if (cc.renderContextType === cc.CANVAS && spriteFrame.isRotated()) {
                    //clip to canvas
                    var locTexture = spriteFrame.getTexture();
                    if (locTexture.isLoaded()) {
                        var tempElement = spriteFrame.getTexture().getHtmlElementObj();
                        tempElement = cc.cutRotateImageToCanvas(tempElement, spriteFrame.getRectInPixels());
                        var tempTexture = new cc.Texture2D();
                        tempTexture.initWithElement(tempElement);
                        tempTexture.handleLoadedTexture();
                        spriteFrame.setTexture(tempTexture);

                        var rect = spriteFrame._rect;
                        spriteFrame.setRect(cc.rect(0, 0, rect.width, rect.height));
                    }
                }

                // add sprite frame
                var keyName = (filename != null) ? filename : key;
                this._spriteFrames[keyName] = spriteFrame;
            }
        }
    },

    /**
     * <p>
     *   Adds multiple Sprite Frames from a plist or json file.<br/>
     *   A texture will be loaded automatically. The texture name will composed by replacing the .plist or .json suffix with .png<br/>
     *   If you want to use another texture, you should use the addSpriteFrames:texture method.<br/>
     * </p>
     * @param {String} filePath file path
     * @param {HTMLImageElement|cc.Texture2D|string} texture
     * @example
     * // add SpriteFrames to SpriteFrameCache With File
     * cc.SpriteFrameCache.getInstance().addSpriteFrames(s_grossiniPlist);
     * cc.SpriteFrameCache.getInstance().addSpriteFrames(s_grossiniJson);
     */
    addSpriteFrames: function (filePath, texture) {
        if (!filePath)
            throw "cc.SpriteFrameCache.addSpriteFrames(): plist should be non-null";

        var fileUtils = cc.FileUtils.getInstance(), dict;
        var ext = filePath.substr(filePath.lastIndexOf(".", filePath.length) + 1, filePath.length);
        if (ext == "plist") {
            var fullPath = fileUtils.fullPathForFilename(filePath);
            dict = fileUtils.dictionaryWithContentsOfFileThreadSafe(fullPath);
        } else {
            dict = JSON.parse(fileUtils.getTextFileData(filePath));
        }

        switch (arguments.length) {
            case 1:
                if (!cc.ArrayContainsObject(this._loadedFileNames, filePath)) {
                    var texturePath = "";
                    var metadataDict = dict["metadata"] || dict["meta"];
                    if (metadataDict) {
                        // try to read  texture file name from meta data
                        texturePath = metadataDict["textureFileName"] || metadataDict["image"];
                    }

                    if (texturePath != "") {
                        // build texture path relative to plist file
                        texturePath = fileUtils.fullPathFromRelativeFile(texturePath, filePath);
                    } else {
                        // build texture path by replacing file extension
                        texturePath = filePath;

                        // remove .xxx
                        var startPos = texturePath.lastIndexOf(".", texturePath.length);
                        texturePath = texturePath.substr(0, startPos);

                        // append .png
                        texturePath = texturePath + ".png";
                    }

                    var getTexture = cc.TextureCache.getInstance().addImage(texturePath);
                    if (getTexture){
                        this._addSpriteFramesWithDictionary(dict, getTexture);
                        this._loadedFileNames.push(filePath);
                    } else
                        cc.log("cocos2d: cc.SpriteFrameCache: Couldn't load texture");
                }
                break;
            case 2:
                if (texture instanceof cc.Texture2D) {
	                if(this._loadedFileNames.indexOf(filePath) === -1) {
		                this._checkConflict(dict);
	                }
                    /** Adds multiple Sprite Frames from a plist file. The texture will be associated with the created sprite frames. */
                    this._addSpriteFramesWithDictionary(dict, texture);
                } else {
                    /** Adds multiple Sprite Frames from a plist file. The texture will be associated with the created sprite frames.
                     @since v0.99.5
                     */
                    var textureFileName = texture;
                    if (!textureFileName)
                        throw "cc.SpriteFrameCache.addSpriteFrames(): texture name should not be null";
                    var gTexture = cc.TextureCache.getInstance().addImage(textureFileName);

                    if (gTexture) {
	                    if(this._loadedFileNames.indexOf(filePath) === -1) {
		                    this._checkConflict(dict);
		                    this._loadedFileNames.push(filePath);
	                    }
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

	// Function to check if frames to add exists already, if so there may be name conflit that must be solved
	_checkConflict: function (dictionary) {
		var framesDict = dictionary["frames"];

		for (var key in framesDict) {
			if (this._spriteFrames[key]) {
				cc.log("cocos2d: WARNING: Sprite frame: "+key+" has already been added by another source, please fix name conflit");
			}
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
    addSpriteFrame: function (frame, frameName) {
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
    removeSpriteFrames: function () {
        this._spriteFrames = {};
        this._spriteFramesAliases = {};
        this._loadedFileNames.length = 0;
    },

    /**
     * Deletes an sprite frame from the sprite frame cache.
     * @param {String} name
     */
    removeSpriteFrameByName: function (name) {
        // explicit nil handling
        if (!name) {
            return;
        }

        // Is this an alias ?
        if (this._spriteFramesAliases[name]) {
            delete(this._spriteFramesAliases[name]);
        }
        if (this._spriteFrames[name]) {
            delete(this._spriteFrames[name]);
        }
        // XXX. Since we don't know the .plist file that originated the frame, we must remove all .plist from the cache
        this._loadedFileNames.length = 0;
    },

    /**
     * <p>
     *     Removes multiple Sprite Frames from a plist file.<br/>
     *     Sprite Frames stored in this file will be removed.<br/>
     *     It is convinient to call this method when a specific texture needs to be removed.<br/>
     * </p>
     * @param {String} plist plist filename
     */
    removeSpriteFramesFromFile: function (plist) {
        var fileUtils = cc.FileUtils.getInstance();
        var path = fileUtils.fullPathForFilename(plist);
        var dict = fileUtils.dictionaryWithContentsOfFileThreadSafe(path);

        this._removeSpriteFramesFromDictionary(dict);

        //remove it from the cache
        if (cc.ArrayContainsObject(this._loadedFileNames, plist)) {
            cc.ArrayRemoveObject(this._loadedFileNames, plist);
        }
    },

    /**
     * Removes multiple Sprite Frames from Dictionary.
     * @param {object} dictionary SpriteFrame of Dictionary
     */
    _removeSpriteFramesFromDictionary: function (dictionary) {
        var framesDict = dictionary["frames"];

        for (var key in framesDict) {
            if (this._spriteFrames[key]) {
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
    removeSpriteFramesFromTexture: function (texture) {
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
    getSpriteFrame: function (name) {
        var frame;
        if (this._spriteFrames[name]) {
            frame = this._spriteFrames[name];
        }

        if (!frame) {
            // try alias dictionary
            var key;
            if (this._spriteFramesAliases[name]) {
                key = this._spriteFramesAliases[name];
            }
            if (key) {
	            var keystr = key.toString();
                if (this._spriteFrames[keystr]) {
                    frame = this._spriteFrames[keystr];
                }
                if (!frame) {
                    cc.log("cocos2d: cc.SpriteFrameCahce: Frame " + name + " not found");
                }
            }
        }
        return frame;
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
