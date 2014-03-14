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
 * cc.Sprite invalid index on the cc.SpriteBatchNode
 * @constant
 * @type Number
 */
cc.SPRITE_INDEX_NOT_INITIALIZED = -1;

/**
 * generate texture's cache for texture tint
 * @function
 * @param {HTMLImageElement} texture
 * @return {Array}
 */

cc.generateTextureCacheForColor = function (texture) {
    if (texture.channelCache) {
        return texture.channelCache;
    }

    var textureCache = [
        document.createElement("canvas"),
        document.createElement("canvas"),
        document.createElement("canvas"),
        document.createElement("canvas")
    ];

    function renderToCache() {
        var ref = cc.generateTextureCacheForColor;

        var w = texture.width;
        var h = texture.height;

        textureCache[0].width = w;
        textureCache[0].height = h;
        textureCache[1].width = w;
        textureCache[1].height = h;
        textureCache[2].width = w;
        textureCache[2].height = h;
        textureCache[3].width = w;
        textureCache[3].height = h;

        ref.canvas.width = w;
        ref.canvas.height = h;

        var ctx = ref.canvas.getContext("2d");
        ctx.drawImage(texture, 0, 0);

        ref.tempCanvas.width = w;
        ref.tempCanvas.height = h;

        var pixels = ctx.getImageData(0, 0, w, h).data;

        for (var rgbI = 0; rgbI < 4; rgbI++) {
            var cacheCtx = textureCache[rgbI].getContext('2d');
            cacheCtx.getImageData(0, 0, w, h).data;
            ref.tempCtx.drawImage(texture, 0, 0);

            var to = ref.tempCtx.getImageData(0, 0, w, h);
            var toData = to.data;

            for (var i = 0; i < pixels.length; i += 4) {
                toData[i  ] = (rgbI === 0) ? pixels[i  ] : 0;
                toData[i + 1] = (rgbI === 1) ? pixels[i + 1] : 0;
                toData[i + 2] = (rgbI === 2) ? pixels[i + 2] : 0;
                toData[i + 3] = pixels[i + 3];
            }
            cacheCtx.putImageData(to, 0, 0);
        }
        texture.onload = null;
    }

    try {
        renderToCache();
    } catch (e) {
        texture.onload = renderToCache;
    }

    texture.channelCache = textureCache;
    return textureCache;
};

cc.generateTextureCacheForColor.canvas = document.createElement('canvas');
cc.generateTextureCacheForColor.tempCanvas = document.createElement('canvas');
cc.generateTextureCacheForColor.tempCtx = cc.generateTextureCacheForColor.tempCanvas.getContext('2d');

/**
 * generate tinted texture
 * source-in: Where source and destination overlaps and both are opaque, the source is displayed.
 * Everywhere else transparency is displayed.
 * @function
 * @param {HTMLImageElement} texture
 * @param {cc.Color} color
 * @param {cc.Rect} rect
 * @return {HTMLCanvasElement}
 */
cc.generateTintImage2 = function (texture, color, rect) {
    if (!rect) {
        rect = cc.rect(0, 0, texture.width, texture.height);
        rect = cc.RECT_PIXELS_TO_POINTS(rect);
    }

    var buff = document.createElement("canvas");
    var ctx = buff.getContext("2d");

    if (buff.width != rect.width) buff.width = rect.width;
    if (buff.height != rect.height) buff.height = rect.height;
    ctx.save();

    ctx.drawImage(texture, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);

    ctx.globalCompositeOperation = "source-in";
    ctx.globalAlpha = color.a / 255.0;
    ctx.fillStyle = "rgb(" + color.r + "," + color.g + "," + color.b + ")";
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.restore();

    return buff;
};

/**
 * generate tinted texture
 * lighter:    The source and destination colors are added to each other, resulting in brighter colors,
 * moving towards color values of 1 (maximum brightness for that color).
 * @function
 * @param {HTMLImageElement} texture
 * @param {Array} tintedImgCache
 * @param {cc.Color} color
 * @param {cc.Rect} rect
 * @param {HTMLCanvasElement} [renderCanvas]
 * @return {HTMLCanvasElement}
 */
cc.generateTintImage = function (texture, tintedImgCache, color, rect, renderCanvas) {
    if (!rect)
        rect = cc.rect(0, 0, texture.width, texture.height);

    var r = color.r / 255;
    var g = color.g / 255;
    var b = color.b / 255;

    var w = Math.min(rect.width, tintedImgCache[0].width);
    var h = Math.min(rect.height, tintedImgCache[0].height);
    var buff = renderCanvas;
    var ctx;

    // Create a new buffer if required
    if (!buff) {
        buff = document.createElement("canvas");
        buff.width = w;
        buff.height = h;
        ctx = buff.getContext("2d");
    } else {
        ctx = buff.getContext("2d");
        ctx.clearRect(0, 0, w, h);
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Make sure to keep the renderCanvas alpha in mind in case of overdraw
    var a = ctx.globalAlpha;
    if (r > 0) {
        ctx.globalAlpha = r * a;
        ctx.drawImage(tintedImgCache[0], rect.x, rect.y, w, h, 0, 0, w, h);
    }
    if (g > 0) {
        ctx.globalAlpha = g * a;
        ctx.drawImage(tintedImgCache[1], rect.x, rect.y, w, h, 0, 0, w, h);
    }
    if (b > 0) {
        ctx.globalAlpha = b * a;
        ctx.drawImage(tintedImgCache[2], rect.x, rect.y, w, h, 0, 0, w, h);
    }

    if (r + g + b < 1) {
        ctx.globalAlpha = a;
        ctx.drawImage(tintedImgCache[3], rect.x, rect.y, w, h, 0, 0, w, h);
    }

    ctx.restore();
    return buff;
};

cc.cutRotateImageToCanvas = function (texture, rect) {
    if (!texture)
        return null;

    if (!rect)
        return texture;

    var nCanvas = document.createElement("canvas");
    nCanvas.width = rect.width;
    nCanvas.height = rect.height;

    var ctx = nCanvas.getContext("2d");
    ctx.translate(nCanvas.width / 2, nCanvas.height / 2);
    ctx.rotate(-1.5707963267948966);
    ctx.drawImage(texture, rect.x, rect.y, rect.height, rect.width, -rect.height / 2, -rect.width / 2, rect.height, rect.width);
    return nCanvas;
};

cc.RENDER_IN_SUBPIXEL = function (A) {
    return (0 | A);
};
if (cc.SPRITEBATCHNODE_RENDER_SUBPIXEL) {
    cc.RENDER_IN_SUBPIXEL = function (A) {
        return A;
    };
}

/**
 * <p>cc.Sprite is a 2d image ( http://en.wikipedia.org/wiki/Sprite_(computer_graphics) )  <br/>
 *
 * cc.Sprite can be created with an image, or with a sub-rectangle of an image.  <br/>
 *
 * If the parent or any of its ancestors is a cc.SpriteBatchNode then the following features/limitations are valid   <br/>
 *    - Features when the parent is a cc.BatchNode: <br/>
 *        - MUCH faster rendering, specially if the cc.SpriteBatchNode has many children. All the children will be drawn in a single batch.  <br/>
 *
 *    - Limitations   <br/>
 *        - Camera is not supported yet (eg: CCOrbitCamera action doesn't work)  <br/>
 *        - GridBase actions are not supported (eg: CCLens, CCRipple, CCTwirl) <br/>
 *        - The Alias/Antialias property belongs to CCSpriteBatchNode, so you can't individually set the aliased property.  <br/>
 *        - The Blending function property belongs to CCSpriteBatchNode, so you can't individually set the blending function property. <br/>
 *        - Parallax scroller is not supported, but can be simulated with a "proxy" sprite.        <br/>
 *
 *  If the parent is an standard cc.Node, then cc.Sprite behaves like any other cc.Node:      <br/>
 *    - It supports blending functions    <br/>
 *    - It supports aliasing / antialiasing    <br/>
 *    - But the rendering will be slower: 1 draw per children.   <br/>
 *
 * The default anchorPoint in cc.Sprite is (0.5, 0.5). </p>
 * @class
 * @extends cc.NodeRGBA
 *
 * @property {Boolean}              dirty               - Indicates whether the sprite needs to be updated.
 * @property {Boolean}              flippedX            - Indicates whether or not the spirte is flipped on x axis.
 * @property {Boolean}              flippedY            - Indicates whether or not the spirte is flipped on y axis.
 * @property {Number}               offsetX             - <@readonly> The offset position on x axis of the sprite in texture. Calculated automatically by editors like Zwoptex.
 * @property {Number}               offsetY             - <@readonly> The offset position on x axis of the sprite in texture. Calculated automatically by editors like Zwoptex.
 * @property {Number}               atlasIndex          - The index used on the TextureAtlas.
 * @property {cc.Texture2D}         texture             - Texture used to render the sprite.
 * @property {Boolean}              textureRectRotated  - <@readonly> Indicate whether the texture rectangle is rotated.
 * @property {cc.TextureAtlas}      textureAtlas        - The weak reference of the cc.TextureAtlas when the sprite is rendered using via cc.SpriteBatchNode.
 * @property {cc.SpriteBatchNode}   batchNode           - The batch node object if this sprite is rendered by cc.SpriteBatchNode.
 * @property {cc.V3F_C4B_T2F_Quad}  quad                - <@readonly> The quad (tex coords, vertex coords and color) information.
 *
 * @example
 * var aSprite = new cc.Sprite();
 * aSprite.initWithFile("HelloHTML5World.png",cc.rect(0,0,480,320));
 */
cc.Sprite = cc.NodeRGBA.extend(/** @lends cc.Sprite# */{
    RGBAProtocol:true,
	dirty:false,
	atlasIndex:0,
    textureAtlas:null,

    _batchNode:null,
    _recursiveDirty:null, //Whether all of the sprite's children needs to be updated
    _hasChildren:null, //Whether the sprite contains children
    _shouldBeHidden:false, //should not be drawn because one of the ancestors is not visible
    _transformToBatch:null,

    //
    // Data used when the sprite is self-rendered
    //
    _blendFunc:null, //It's required for CCTextureProtocol inheritance
    _texture:null, //cc.Texture2D object that is used to render the sprite

    //
    // Shared data
    //
    // texture
    _rect:null, //Retangle of cc.Texture2D
    _rectRotated:false, //Whether the texture is rotated

    // Offset Position (used by Zwoptex)
    _offsetPosition:null, // absolute
    _unflippedOffsetPositionFromCenter:null,

    _opacityModifyRGB:false,

    // image is flipped
    _flippedX:false, //Whether the sprite is flipped horizontally or not.
    _flippedY:false, //Whether the sprite is flipped vertically or not.

    _textureLoaded:false,
    _loadedEventListeners: null,
    _newTextureWhenChangeColor: null,         //hack property for LabelBMFont
    _className:"Sprite",

    textureLoaded:function(){
        return this._textureLoaded;
    },

    addLoadedEventListener:function(callback, target){
        if(!this._loadedEventListeners)
            this._loadedEventListeners = [];
        this._loadedEventListeners.push({eventCallback:callback, eventTarget:target});
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
    },

    /**
     * Whether or not the Sprite needs to be updated in the Atlas
     * @return {Boolean} true if the sprite needs to be updated in the Atlas, false otherwise.
     */
    isDirty:function () {
        return this.dirty;
    },

    /**
     * Makes the Sprite to be updated in the Atlas.
     * @param {Boolean} bDirty
     */
    setDirty:function (bDirty) {
        this.dirty = bDirty;
    },

    /**
     * Returns whether or not the texture rectangle is rotated.
     * @return {Boolean}
     */
    isTextureRectRotated:function () {
        return this._rectRotated;
    },

    /**
     * Returns the index used on the TextureAtlas.
     * @return {Number}
     */
    getAtlasIndex:function () {
        return this.atlasIndex;
    },

    /**
     * Set the index used on the TextureAtlas.
     * @warning Don't modify this value unless you know what you are doing
     * @param {Number} atlasIndex
     */
    setAtlasIndex:function (atlasIndex) {
        this.atlasIndex = atlasIndex;
    },

    /**
     * returns the rect of the cc.Sprite in points
     * @return {cc.Rect}
     */
    getTextureRect:function () {
        return cc.rect(this._rect.x, this._rect.y, this._rect.width, this._rect.height);
    },

    /**
     * Gets the weak reference of the cc.TextureAtlas when the sprite is rendered using via cc.SpriteBatchNode
     * @return {cc.TextureAtlas}
     */
    getTextureAtlas:function () {
        return this.textureAtlas;
    },

    /**
     * Sets the weak reference of the cc.TextureAtlas when the sprite is rendered using via cc.SpriteBatchNode
     * @param {cc.TextureAtlas} textureAtlas
     */
    setTextureAtlas:function (textureAtlas) {
        this.textureAtlas = textureAtlas;
    },

    /**
     * Gets the offset position of the sprite. Calculated automatically by editors like Zwoptex.
     * @return {cc.Point}
     */
    getOffsetPosition:function () {
        return this._offsetPosition;
    },

	_getOffsetX: function () {
		return this._offsetPosition.x;
	},
	_getOffsetY: function () {
		return this._offsetPosition.y;
	},

    /**
     * conforms to cc.TextureProtocol protocol
     * @return {cc.BlendFunc}
     */
    getBlendFunc:function () {
        return this._blendFunc;
    },

    /**
     * Initializes a sprite with an SpriteFrame. The texture and rect in SpriteFrame will be applied on this sprite
     * @param {cc.SpriteFrame} spriteFrame A CCSpriteFrame object. It should includes a valid texture and a rect
     * @return {Boolean}  true if the sprite is initialized properly, false otherwise.
     * @example
     * var spriteFrame = cc.spriteFrameCache.getSpriteFrame("grossini_dance_01.png");
     * var sprite = new cc.Sprite();
     * sprite.initWithSpriteFrame(spriteFrame);
     */
    initWithSpriteFrame:function (spriteFrame) {
        if(!spriteFrame)
           throw "cc.Sprite.initWithSpriteFrame(): spriteFrame should be non-null";
        if(!spriteFrame.textureLoaded()){
            //add event listener
            this._textureLoaded = false;
            spriteFrame.addLoadedEventListener(this._spriteFrameLoadedCallback, this);
        }
        var ret = this.initWithTexture(spriteFrame.getTexture(), spriteFrame.getRect());
        this.setSpriteFrame(spriteFrame);

        return ret;
    },

    _spriteFrameLoadedCallback:null,

    _spriteFrameLoadedCallbackForWebGL:function(spriteFrame){
        this.setNodeDirty(true);
        this.setTextureRect(spriteFrame.getRect(), spriteFrame.isRotated(), spriteFrame.getOriginalSize());
        this._callLoadedEventCallbacks();
    },

    _spriteFrameLoadedCallbackForCanvas:function(spriteFrame){
        this.setNodeDirty(true);
        this.setTextureRect(spriteFrame.getRect(), spriteFrame.isRotated(), spriteFrame.getOriginalSize());
        var curColor = this.color;
        if (curColor.r !== 255 || curColor.g !== 255 || curColor.b !== 255)
            this._changeTextureColor();

        this._callLoadedEventCallbacks();
    },

    /**
     * Initializes a sprite with a sprite frame name. <br/>
     * A cc.SpriteFrame will be fetched from the cc.SpriteFrameCache by name.  <br/>
     * If the cc.SpriteFrame doesn't exist it will raise an exception. <br/>
     * @param {String} spriteFrameName A key string that can fected a volid cc.SpriteFrame from cc.SpriteFrameCache
     * @return {Boolean} true if the sprite is initialized properly, false otherwise.
     * @example
     * var sprite = new cc.Sprite();
     * sprite.initWithSpriteFrameName("grossini_dance_01.png");
     */
    initWithSpriteFrameName:function (spriteFrameName) {
        if(!spriteFrameName)
            throw "cc.Sprite.initWithSpriteFrameName(): spriteFrameName should be non-null";
        var frame = cc.spriteFrameCache.getSpriteFrame(spriteFrameName);
        return this.initWithSpriteFrame(frame);
    },

    /**
     * tell the sprite to use batch node render.
     * @param {cc.SpriteBatchNode} batchNode
     */
    useBatchNode:function (batchNode) {
        this.textureAtlas = batchNode.textureAtlas; // weak ref
        this._batchNode = batchNode;
    },

    /**
     * <p>
     *    set the vertex rect.<br/>
     *    It will be called internally by setTextureRect.                           <br/>
     *    Useful if you want to create 2x images from SD images in Retina Display.  <br/>
     *    Do not call it manually. Use setTextureRect instead.  <br/>
     *    (override this method to generate "double scale" sprites)
     * </p>
     * @param {cc.Rect} rect
     */
    setVertexRect:function (rect) {
        this._rect.x = rect.x;
        this._rect.y = rect.y;
        this._rect.width = rect.width;
        this._rect.height = rect.height;
    },

    sortAllChildren:function () {
        if (this._reorderChildDirty) {
            var j, tempItem, locChildren = this._children, tempChild;
            for (var i = 1; i < locChildren.length; i++) {
                tempItem = locChildren[i];
                j = i - 1;
                tempChild =  locChildren[j];

                //continue moving element downwards while zOrder is smaller or when zOrder is the same but mutatedIndex is smaller
                while (j >= 0 && ( tempItem._localZOrder < tempChild._localZOrder ||
                    ( tempItem._localZOrder == tempChild._localZOrder && tempItem.arrivalOrder < tempChild.arrivalOrder ))) {
                    locChildren[j + 1] = tempChild;
                    j = j - 1;
                    tempChild =  locChildren[j];
                }
                locChildren[j + 1] = tempItem;
            }

            if (this._batchNode) {
                this._arrayMakeObjectsPerformSelector(locChildren, cc.Node.StateCallbackType.sortAllChildren);
            }
            this._reorderChildDirty = false;
        }
    },

    /**
     * Reorders a child according to a new z value.  (override cc.Node )
     * @param {cc.Node} child
     * @param {Number} zOrder
     * @override
     */
    reorderChild:function (child, zOrder) {
        if(!child)
            throw "cc.Sprite.reorderChild(): child should be non-null";
        if(this._children.indexOf(child) === -1){
            cc.log("cc.Sprite.reorderChild(): this child is not in children list");
            return;
        }

        if (zOrder === child.zIndex)
            return;

        if (this._batchNode && !this._reorderChildDirty) {
            this._setReorderChildDirtyRecursively();
            this._batchNode.reorderBatch(true);
        }
        cc.Node.prototype.reorderChild.call(this, child, zOrder);
    },

    /**
     * Removes a child from the sprite. (override cc.Node )
     * @param child
     * @param cleanup  whether or not cleanup all running actions
     * @override
     */
    removeChild:function (child, cleanup) {
        if (this._batchNode)
            this._batchNode.removeSpriteFromAtlas(child);
        cc.Node.prototype.removeChild.call(this, child, cleanup);
    },

    /**
     * Removes all children from the container  (override cc.Node )
     * @param cleanup whether or not cleanup all running actions
     * @override
     */
    removeAllChildren:function (cleanup) {
        var locChildren = this._children, locBatchNode = this._batchNode;
        if (locBatchNode && locChildren != null) {
            for (var i = 0, len = locChildren.length; i < len; i++)
                locBatchNode.removeSpriteFromAtlas(locChildren[i]);
        }

        cc.Node.prototype.removeAllChildren.call(this, cleanup);
        this._hasChildren = false;
    },

    //
    // cc.Node property overloads
    //

	/**
	 * set Recursively is or isn't Dirty
	 * used only when parent is cc.SpriteBatchNode
	 * @param {Boolean} value
	 */
	setDirtyRecursively:function (value) {
		this._recursiveDirty = value;
		this.dirty = value;
		// recursively set dirty
		var locChildren = this._children, child, l = locChildren ? locChildren.length : 0;
		for (var i = 0; i < l; i++) {
			child = locChildren[i];
			(child instanceof cc.Sprite) && child.setDirtyRecursively(true);
		}
	},

	/**
	 * Make the node dirty
	 * @param {Boolean} norecursive When true children will not be set dirty recursively, by default, they will be.
	 * @override
	 */
	setNodeDirty: function(norecursive) {
		cc.Node.prototype.setNodeDirty.call(this);
		// Lazy set dirty
		if (!norecursive && this._batchNode && !this._recursiveDirty) {
			if (this._hasChildren)
				this.setDirtyRecursively(true);
			else {
				this._recursiveDirty = true;
				this.dirty = true;
			}
		}
	},

    /**
     * IsRelativeAnchorPoint setter  (override cc.Node )
     * @param {Boolean} relative
     * @override
     */
    ignoreAnchorPointForPosition:function (relative) {
        if(this._batchNode){
            cc.log("cc.Sprite.ignoreAnchorPointForPosition(): it is invalid in cc.Sprite when using SpriteBatchNode");
            return;
        }
        cc.Node.prototype.ignoreAnchorPointForPosition.call(this, relative);
    },

    /**
     * Sets whether the sprite should be flipped horizontally or not.
     * @param {Boolean} flippedX true if the sprite should be flipped horizontally, false otherwise.
     */
    setFlippedX:function (flippedX) {
        if (this._flippedX != flippedX) {
            this._flippedX = flippedX;
            this.setTextureRect(this._rect, this._rectRotated, this._contentSize);
            this.setNodeDirty(true);
        }
    },

    /**
     * Sets whether the sprite should be flipped vertically or not.
     * @param {Boolean} flippedY true if the sprite should be flipped vertically, false otherwise.
     */
    setFlippedY:function (flippedY) {
        if (this._flippedY != flippedY) {
            this._flippedY = flippedY;
            this.setTextureRect(this._rect, this._rectRotated, this._contentSize);
            this.setNodeDirty(true);
        }
    },

    /**
     * <p>
     *     Returns the flag which indicates whether the sprite is flipped horizontally or not.                      <br/>
     *                                                                                                              <br/>
     * It only flips the texture of the sprite, and not the texture of the sprite's children.                       <br/>
     * Also, flipping the texture doesn't alter the anchorPoint.                                                    <br/>
     * If you want to flip the anchorPoint too, and/or to flip the children too use:                                <br/>
     *      sprite->setScaleX(sprite->getScaleX() * -1);  <p/>
     * @return {Boolean} true if the sprite is flipped horizaontally, false otherwise.
     */
    isFlippedX:function () {
        return this._flippedX;
    },

    /**
     * <p>
     *     Return the flag which indicates whether the sprite is flipped vertically or not.                         <br/>
     *                                                                                                              <br/>
     *      It only flips the texture of the sprite, and not the texture of the sprite's children.                  <br/>
     *      Also, flipping the texture doesn't alter the anchorPoint.                                               <br/>
     *      If you want to flip the anchorPoint too, and/or to flip the children too use:                           <br/>
     *         sprite->setScaleY(sprite->getScaleY() * -1); <p/>
     * @return {Boolean} true if the sprite is flipped vertically, flase otherwise.
     */
    isFlippedY:function () {
        return this._flippedY;
    },

    //
    // RGBA protocol
    //
    /**
     * opacity: conforms to CCRGBAProtocol protocol
     * @function
     * @param {Boolean} modify
     */
    setOpacityModifyRGB:null,

    _setOpacityModifyRGBForWebGL: function (modify) {
        if (this._opacityModifyRGB !== modify) {
            this._opacityModifyRGB = modify;
            this.updateColor();
        }
    },

    _setOpacityModifyRGBForCanvas: function (modify) {
        if (this._opacityModifyRGB !== modify) {
            this._opacityModifyRGB = modify;
            this.setNodeDirty(true);
        }
    },

    /**
     * return IsOpacityModifyRGB value
     * @return {Boolean}
     */
    isOpacityModifyRGB:function () {
        return this._opacityModifyRGB;
    },

    updateDisplayedOpacity: null,

    _updateDisplayedOpacityForWebGL:function (parentOpacity) {
        cc.NodeRGBA.prototype.updateDisplayedOpacity.call(this, parentOpacity);
        this.updateColor();
    },

    _updateDisplayedOpacityForCanvas:function (parentOpacity) {
        cc.NodeRGBA.prototype.updateDisplayedOpacity.call(this, parentOpacity);
        this._setNodeDirtyForCache();
    },

    // Animation

    /**
     * changes the display frame with animation name and index.<br/>
     * The animation name will be get from the CCAnimationCache
     * @param animationName
     * @param frameIndex
     */
    setDisplayFrameWithAnimationName:function (animationName, frameIndex) {
        if(!animationName)
            throw "cc.Sprite.setDisplayFrameWithAnimationName(): animationName must be non-null";
        var cache = cc.animationCache.getAnimation(animationName);
        if(!cache){
            cc.log("cc.Sprite.setDisplayFrameWithAnimationName(): Frame not found");
            return;
        }
        var animFrame = cache.getFrames()[frameIndex];
        if(!animFrame){
            cc.log("cc.Sprite.setDisplayFrameWithAnimationName(): Invalid frame index");
            return;
        }
        this.setSpriteFrame(animFrame.getSpriteFrame());
    },

    /**
     * Returns the batch node object if this sprite is rendered by cc.SpriteBatchNode
     * @returns {cc.SpriteBatchNode|null} The cc.SpriteBatchNode object if this sprite is rendered by cc.SpriteBatchNode, null if the sprite isn't used batch node.
     */
    getBatchNode:function () {
        return this._batchNode;
    },

    _setReorderChildDirtyRecursively:function () {
        //only set parents flag the first time
        if (!this._reorderChildDirty) {
            this._reorderChildDirty = true;
            var pNode = this._parent;
            while (pNode && pNode != this._batchNode) {
                pNode._setReorderChildDirtyRecursively();
                pNode = pNode.parent;
            }
        }
    },

    // CCTextureProtocol
    getTexture:function () {
        return this._texture;
    },

    _quad:null, // vertex coords, texture coords and color info
    _quadWebBuffer:null,
    _quadDirty:false,
    _colorized:false,
    _isLighterMode:false,
    _originalTexture:null,
    _textureRect_Canvas:null,
    _drawSize_Canvas:null,

    /**
     * Constructor
     * @function
     * @param {String|cc.SpriteFrame|cc.SpriteBatchNode|HTMLImageElement|cc.Texture2D} fileName sprite construct parameter
     * @param {cc.Rect} rect  Only the contents inside rect of pszFileName's texture will be applied for this sprite.
     */
    ctor: null,

    _ctorForWebGL: function (fileName, rect) {
	    var self = this;
        cc.NodeRGBA.prototype.ctor.call(self);
	    self._shouldBeHidden = false;
	    self._offsetPosition = cc.p(0, 0);
	    self._unflippedOffsetPositionFromCenter = cc.p(0, 0);
	    self._blendFunc = {src: cc.BLEND_SRC, dst: cc.BLEND_DST};
	    self._rect = cc.rect(0,0,0,0);

	    self._quad = new cc.V3F_C4B_T2F_Quad();
	    self._quadWebBuffer = cc._renderContext.createBuffer();
	    self._quadDirty = true;

	    self._textureLoaded = true;

	    self._softInit(fileName, rect);
    },

    _ctorForCanvas: function (fileName, rect) {
	    var self = this;
        cc.NodeRGBA.prototype.ctor.call(self);
	    self._shouldBeHidden = false;
	    self._offsetPosition = cc.p(0, 0);
	    self._unflippedOffsetPositionFromCenter = cc.p(0, 0);
	    self._blendFunc = {src: cc.BLEND_SRC, dst: cc.BLEND_DST};
	    self._rect = cc.rect(0, 0, 0, 0);

	    self._newTextureWhenChangeColor = false;
	    self._textureLoaded = true;
	    self._textureRect_Canvas = {x: 0, y: 0, width: 0, height:0, validRect: false};
	    self._drawSize_Canvas = cc.size(0, 0);

	    self._softInit(fileName, rect);
    },

	_softInit: function (fileName, rect) {
		if (fileName === undefined)
			cc.Sprite.prototype.init.call(this);
		else if (typeof(fileName) === "string") {
			if (fileName[0] === "#") {
				// Init with a sprite frame name
				var frameName = fileName.substr(1, fileName.length - 1);
				var spriteFrame = cc.spriteFrameCache.getSpriteFrame(frameName);
				this.initWithSpriteFrame(spriteFrame);
			} else {
				// Init  with filename and rect
				cc.Sprite.prototype.init.call(this, fileName, rect);
			}
		}
		else if (typeof(fileName) === "object") {
			if (fileName instanceof cc.Texture2D) {
				// Init  with texture and rect
				this.initWithTexture(fileName, rect);
			} else if (fileName instanceof cc.SpriteFrame) {
				// Init with a sprite frame
				this.initWithSpriteFrame(fileName);
			} else if ((fileName instanceof HTMLImageElement) || (fileName instanceof HTMLCanvasElement)) {
				// Init with a canvas or image element
				var texture2d = new cc.Texture2D();
				texture2d.initWithElement(fileName);
				texture2d.handleLoadedTexture();
				this.initWithTexture(texture2d);
			}
		}
	},

    /**
     * Returns the quad (tex coords, vertex coords and color) information.
     * @return {cc.V3F_C4B_T2F_Quad}
     */
    getQuad:function () {
        return this._quad;
    },

    /**
     * conforms to cc.TextureProtocol protocol
     * @function
     * @param {Number|cc.BlendFunc} src
     * @param {Number} dst
     */
    setBlendFunc: null,

    _setBlendFuncForWebGL: function (src, dst) {
        var locBlendFunc = this._blendFunc;
        if (dst === undefined) {
            locBlendFunc.src = src.src;
            locBlendFunc.dst = src.dst;
        } else {
            locBlendFunc.src = src;
            locBlendFunc.dst = dst;
        }
    },

    _setBlendFuncForCanvas: function (src, dst) {
        var locBlendFunc = this._blendFunc;
        if (dst === undefined) {
            locBlendFunc.src = src.src;
            locBlendFunc.dst = src.dst;
        } else {
            locBlendFunc.src = src;
            locBlendFunc.dst = dst;
        }
        this._isLighterMode = (locBlendFunc &&
            (( locBlendFunc.src == cc.SRC_ALPHA && locBlendFunc.dst == cc.ONE) || (locBlendFunc.src == cc.ONE && locBlendFunc.dst == cc.ONE)));
    },

    /**
     * Initializes an empty sprite with nothing init.
     * @function
     * @return {Boolean}
     */
    init:null,

    _initForWebGL: function () {
        if (arguments.length > 0)
            return this.initWithFile(arguments[0], arguments[1]);

        cc.NodeRGBA.prototype.init.call(this);
        this.dirty = this._recursiveDirty = false;
        this._opacityModifyRGB = true;

        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;

        // update texture (calls _updateBlendFunc)
        this.texture = null;
        this._textureLoaded = true;
        this._flippedX = this._flippedY = false;

        // default transform anchor: center
        this.anchorX = 0.5;
	    this.anchorY = 0.5;

        // zwoptex default values
        this._offsetPosition.x = 0;
        this._offsetPosition.y = 0;

        this._hasChildren = false;

        // Atlas: Color
        var tempColor = {r: 255, g: 255, b: 255, a: 255};
        this._quad.bl.colors = tempColor;
        this._quad.br.colors = tempColor;
        this._quad.tl.colors = tempColor;
        this._quad.tr.colors = tempColor;
        this._quadDirty = true;

        // updated in "useSelfRender"
        // Atlas: TexCoords
        this.setTextureRect(cc.rect(0, 0, 0, 0), false, cc.size(0, 0));
        return true;
    },

    _initForCanvas: function () {
        if (arguments.length > 0)
            return this.initWithFile(arguments[0], arguments[1]);

        cc.NodeRGBA.prototype.init.call(this);
        this.dirty = this._recursiveDirty = false;
        this._opacityModifyRGB = true;

        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;

        // update texture (calls _updateBlendFunc)
        this.texture = null;
        this._textureLoaded = true;
        this._flippedX = this._flippedY = false;

        // default transform anchor: center
        this.anchorX = 0.5;
	    this.anchorY = 0.5;

        // zwoptex default values
        this._offsetPosition.x = 0;
        this._offsetPosition.y = 0;
        this._hasChildren = false;

        // updated in "useSelfRender"
        // Atlas: TexCoords
        this.setTextureRect(cc.rect(0, 0, 0, 0), false, cc.size(0, 0));
        return true;
    },

    /**
     * <p>
     *     Initializes a sprite with an image filename.
     *
     *     This method will find pszFilename from local file system, load its content to CCTexture2D,
     *     then use CCTexture2D to create a sprite.
     *     After initialization, the rect used will be the size of the image. The offset will be (0,0).
     * </p>
     * @param {String} filename The path to an image file in local file system
     * @param {cc.Rect} rect The rectangle assigned the content area from texture.
     * @return {Boolean} true if the sprite is initialized properly, false otherwise.
     * @example
     * var mySprite = new cc.Sprite();
     * mySprite.initWithFile("HelloHTML5World.png",cc.rect(0,0,480,320));
     */
    initWithFile:function (filename, rect) {
        if(!filename)
            throw "cc.Sprite.initWithFile(): filename should be non-null";

        var texture = cc.textureCache.textureForKey(filename);
        if (!texture) {
            texture = cc.textureCache.addImage(filename);
            return this.initWithTexture(texture, rect);
        } else {
            if (!rect) {
                var size = texture.getContentSize();
                rect = cc.rect(0, 0, size.width, size.height);
            }
            return this.initWithTexture(texture, rect);
        }
    },

    /**
     * Initializes a sprite with a texture and a rect in points, optionally rotated.  <br/>
     * After initialization, the rect used will be the size of the texture, and the offset will be (0,0).
     * @function
     * @param {cc.Texture2D|HTMLImageElement|HTMLCanvasElement} texture A pointer to an existing CCTexture2D object. You can use a CCTexture2D object for many sprites.
     * @param {cc.Rect} rect Only the contents inside rect of this texture will be applied for this sprite.
     * @param {Boolean} [rotated] Whether or not the texture rectangle is rotated.
     * @return {Boolean} true if the sprite is initialized properly, false otherwise.
     * @example
     * var img =cc.textureCache.addImage("HelloHTML5World.png");
     * var mySprite = new cc.Sprite();
     * mySprite.initWithTexture(img,cc.rect(0,0,480,320));
     */
    initWithTexture: null,

    _initWithTextureForWebGL: function (texture, rect, rotated) {
        var argnum = arguments.length;
        if (argnum == 0)
            throw "Sprite.initWithTexture(): Argument must be non-nil ";

        rotated = rotated || false;

        if (!cc.NodeRGBA.prototype.init.call(this))
            return false;

        this._batchNode = null;
        this._recursiveDirty = false;
        this.dirty = false;
        this._opacityModifyRGB = true;

        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;

        this._flippedX = this._flippedY = false;

        // default transform anchor: center
        this.anchorX = 0.5;
	    this.anchorY = 0.5;

        // zwoptex default values
        this._offsetPosition.x = 0;
        this._offsetPosition.y = 0;
        this._hasChildren = false;

        // Atlas: Color
        var tmpColor = cc.color(255, 255, 255, 255);
        var locQuad = this._quad;
        locQuad.bl.colors = tmpColor;
        locQuad.br.colors = tmpColor;
        locQuad.tl.colors = tmpColor;
        locQuad.tr.colors = tmpColor;

        var locTextureLoaded = texture.isLoaded();
        this._textureLoaded = locTextureLoaded;

        if (!locTextureLoaded) {
            this._rectRotated = rotated || false;
            if (rect) {
                var locRect = this._rect;
                locRect.x = rect.x;
                locRect.y = rect.y;
                locRect.width = rect.width;
                locRect.height = rect.height;
            }
            texture.addLoadedEventListener(this._textureLoadedCallback, this);
            return true;
        }

        if (!rect) {
            rect = cc.rect(0, 0, texture.width, texture.height);
        }
        this.texture = texture;
        this.setTextureRect(rect, rotated);

        // by default use "Self Render".
        // if the sprite is added to a batchnode, then it will automatically switch to "batchnode Render"
        this.batchNode = null;
        this._quadDirty = true;
        return true;
    },

    _initWithTextureForCanvas: function (texture, rect, rotated) {
        var argnum = arguments.length;
        if (argnum == 0)
            throw "Sprite.initWithTexture(): Argument must be non-nil ";

        rotated = rotated || false;

        if (!cc.NodeRGBA.prototype.init.call(this))
            return false;

        this._batchNode = null;

        this._recursiveDirty = false;
        this.dirty = false;
        this._opacityModifyRGB = true;

        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;

        this._flippedX = this._flippedY = false;

        // default transform anchor: center
        this.anchorX = 0.5;
	    this.anchorY = 0.5;

        // zwoptex default values
        this._offsetPosition.x = 0;
        this._offsetPosition.y = 0;
        this._hasChildren = false;

        var locTextureLoaded = texture.isLoaded();
        this._textureLoaded = locTextureLoaded;

        if (!locTextureLoaded) {
            this._rectRotated = rotated || false;
            if (rect) {
                this._rect.x = rect.x;
                this._rect.y = rect.y;
                this._rect.width = rect.width;
                this._rect.height = rect.height;
            }
            texture.addLoadedEventListener(this._textureLoadedCallback, this);
            return true;
        }

        if (!rect) {
            rect = cc.rect(0, 0, texture.width, texture.height);
        }
        this._originalTexture = texture;

        this.texture = texture;
        this.setTextureRect(rect, rotated);

        // by default use "Self Render".
        // if the sprite is added to a batchnode, then it will automatically switch to "batchnode Render"
        this.batchNode = null;
        return true;
    },

    _textureLoadedCallback: null,

    _textureLoadedCallbackForWebGL: function (sender) {
        if(this._textureLoaded)
            return;

        this._textureLoaded = true;
        var locRect = this._rect;
        if (!locRect) {
            locRect = cc.rect(0, 0, sender.width, sender.height);
        } else if (cc._rectEqualToZero(locRect)) {
            locRect.width = sender.width;
            locRect.height = sender.height;
        }

        this.texture = sender;
        this.setTextureRect(locRect, this._rectRotated);

        // by default use "Self Render".
        // if the sprite is added to a batchnode, then it will automatically switch to "batchnode Render"
        this.batchNode = null;
        this._quadDirty = true;
        this._callLoadedEventCallbacks();
    },

    _textureLoadedCallbackForCanvas: function (sender) {
        if(this._textureLoaded)
            return;

        this._textureLoaded = true;
        var locRect = this._rect;
        if (!locRect) {
            locRect = cc.rect(0, 0, sender.width, sender.height);
        } else if (cc._rectEqualToZero(locRect)) {
            locRect.width = sender.width;
            locRect.height = sender.height;
        }
        this._originalTexture = sender;

        this.texture = sender;
        this.setTextureRect(locRect, this._rectRotated);

        // by default use "Self Render".
        // if the sprite is added to a batchnode, then it will automatically switch to "batchnode Render"
        this.batchNode = null;
        this._callLoadedEventCallbacks();
    },

    /**
     * updates the texture rect of the CCSprite in points.
     * @function
     * @param {cc.Rect} rect a rect of texture
     * @param {Boolean} rotated
     * @param {cc.Size} untrimmedSize
     */
    setTextureRect:null,

    _setTextureRectForWebGL:function (rect, rotated, untrimmedSize) {
        this._rectRotated = rotated || false;
	    this.setContentSize(untrimmedSize || rect);

        this.setVertexRect(rect);
        this._setTextureCoords(rect);

        var relativeOffset = this._unflippedOffsetPositionFromCenter;
        if (this._flippedX)
            relativeOffset.x = -relativeOffset.x;
        if (this._flippedY)
            relativeOffset.y = -relativeOffset.y;

        var locRect = this._rect;
        this._offsetPosition.x = relativeOffset.x + (this._contentSize.width - locRect.width) / 2;
        this._offsetPosition.y = relativeOffset.y + (this._contentSize.height - locRect.height) / 2;

        // rendering using batch node
        if (this._batchNode) {
            // update dirty, don't update _recursiveDirty
            this.dirty = true;
        } else {
            // self rendering
            // Atlas: Vertex
            var x1 = 0 + this._offsetPosition.x;
            var y1 = 0 + this._offsetPosition.y;
            var x2 = x1 + locRect.width;
            var y2 = y1 + locRect.height;

            // Don't update Z.
            var locQuad = this._quad;
            locQuad.bl.vertices = {x:x1, y:y1, z:0};
            locQuad.br.vertices = {x:x2, y:y1, z:0};
            locQuad.tl.vertices = {x:x1, y:y2, z:0};
            locQuad.tr.vertices = {x:x2, y:y2, z:0};

            this._quadDirty = true;
        }
    },

    _setTextureRectForCanvas: function (rect, rotated, untrimmedSize) {
        this._rectRotated = rotated || false;
	    this.setContentSize(untrimmedSize || rect);

        this.setVertexRect(rect);

        var locTextureRect = this._textureRect_Canvas, scaleFactor = cc.CONTENT_SCALE_FACTOR();
        locTextureRect.x = 0 | (rect.x * scaleFactor);
        locTextureRect.y = 0 | (rect.y * scaleFactor);
        locTextureRect.width = 0 | (rect.width * scaleFactor);
        locTextureRect.height = 0 | (rect.height * scaleFactor);
        locTextureRect.validRect = !(locTextureRect.width === 0 || locTextureRect.height === 0 || locTextureRect.x < 0 || locTextureRect.y < 0);

        var relativeOffset = this._unflippedOffsetPositionFromCenter;
        if (this._flippedX)
            relativeOffset.x = -relativeOffset.x;
        if (this._flippedY)
            relativeOffset.y = -relativeOffset.y;
        this._offsetPosition.x = relativeOffset.x + (this._contentSize.width - this._rect.width) / 2;
        this._offsetPosition.y = relativeOffset.y + (this._contentSize.height - this._rect.height) / 2;

        // rendering using batch node
        if (this._batchNode) {
            // update dirty, don't update _recursiveDirty
            this.dirty = true;
        }
    },

    // BatchNode methods
    /**
     * updates the quad according the the rotation, position, scale values.
     * @function
     */
    updateTransform: null,

    _updateTransformForWebGL: function () {
        //cc.assert(this._batchNode, "updateTransform is only valid when cc.Sprite is being rendered using an cc.SpriteBatchNode");

        // recaculate matrix only if it is dirty
        if (this.dirty) {
            var locQuad = this._quad, locParent = this._parent;
            // If it is not visible, or one of its ancestors is not visible, then do nothing:
            if (!this._visible || ( locParent && locParent != this._batchNode && locParent._shouldBeHidden)) {
                locQuad.br.vertices = {x: 0, y: 0, z: 0};
                locQuad.tl.vertices = {x: 0, y: 0, z: 0};
                locQuad.tr.vertices = {x: 0, y: 0, z: 0};
                locQuad.bl.vertices = {x: 0, y: 0, z: 0};
                this._shouldBeHidden = true;
            } else {
                this._shouldBeHidden = false;

                if (!locParent || locParent == this._batchNode) {
                    this._transformToBatch = this.nodeToParentTransform();
                } else {
                    //cc.assert(this._parent instanceof cc.Sprite, "Logic error in CCSprite. Parent must be a CCSprite");
                    this._transformToBatch = cc.AffineTransformConcat(this.nodeToParentTransform(), locParent._transformToBatch);
                }

                //
                // calculate the Quad based on the Affine Matrix
                //
                var locTransformToBatch = this._transformToBatch;
                var rect = this._rect;
                var x1 = this._offsetPosition.x;
                var y1 = this._offsetPosition.y;

                var x2 = x1 + rect.width;
                var y2 = y1 + rect.height;
                var x = locTransformToBatch.tx;
                var y = locTransformToBatch.ty;

                var cr = locTransformToBatch.a;
                var sr = locTransformToBatch.b;
                var cr2 = locTransformToBatch.d;
                var sr2 = -locTransformToBatch.c;
                var ax = x1 * cr - y1 * sr2 + x;
                var ay = x1 * sr + y1 * cr2 + y;

                var bx = x2 * cr - y1 * sr2 + x;
                var by = x2 * sr + y1 * cr2 + y;

                var cx = x2 * cr - y2 * sr2 + x;
                var cy = x2 * sr + y2 * cr2 + y;

                var dx = x1 * cr - y2 * sr2 + x;
                var dy = x1 * sr + y2 * cr2 + y;

                var locVertexZ = this._vertexZ;
                locQuad.bl.vertices = {x: cc.RENDER_IN_SUBPIXEL(ax), y: cc.RENDER_IN_SUBPIXEL(ay), z: locVertexZ};
                locQuad.br.vertices = {x: cc.RENDER_IN_SUBPIXEL(bx), y: cc.RENDER_IN_SUBPIXEL(by), z: locVertexZ};
                locQuad.tl.vertices = {x: cc.RENDER_IN_SUBPIXEL(dx), y: cc.RENDER_IN_SUBPIXEL(dy), z: locVertexZ};
                locQuad.tr.vertices = {x: cc.RENDER_IN_SUBPIXEL(cx), y: cc.RENDER_IN_SUBPIXEL(cy), z: locVertexZ};
            }
            this.textureAtlas.updateQuad(locQuad, this.atlasIndex);
            this._recursiveDirty = false;
            this.dirty = false;
        }

        // recursively iterate over children
        if (this._hasChildren)
            this._arrayMakeObjectsPerformSelector(this._children, cc.Node.StateCallbackType.updateTransform);

        if (cc.SPRITE_DEBUG_DRAW) {
            // draw bounding box
            var vertices = [
                cc.p(this._quad.bl.vertices.x, this._quad.bl.vertices.y),
                cc.p(this._quad.br.vertices.x, this._quad.br.vertices.y),
                cc.p(this._quad.tr.vertices.x, this._quad.tr.vertices.y),
                cc.p(this._quad.tl.vertices.x, this._quad.tl.vertices.y)
            ];
            cc._drawingUtil.drawPoly(vertices, 4, true);
        }
    },

    _updateTransformForCanvas: function () {
        //cc.assert(this._batchNode, "updateTransform is only valid when cc.Sprite is being rendered using an cc.SpriteBatchNode");

        // recaculate matrix only if it is dirty
        if (this.dirty) {
            // If it is not visible, or one of its ancestors is not visible, then do nothing:
            var locParent = this._parent;
            if (!this._visible || ( locParent && locParent != this._batchNode && locParent._shouldBeHidden)) {
                this._shouldBeHidden = true;
            } else {
                this._shouldBeHidden = false;

                if (!locParent || locParent == this._batchNode) {
                    this._transformToBatch = this.nodeToParentTransform();
                } else {
                    //cc.assert(this._parent instanceof cc.Sprite, "Logic error in CCSprite. Parent must be a CCSprite");
                    this._transformToBatch = cc.AffineTransformConcat(this.nodeToParentTransform(), locParent._transformToBatch);
                }
            }
            this._recursiveDirty = false;
            this.dirty = false;
        }

        // recursively iterate over children
        if (this._hasChildren)
            this._arrayMakeObjectsPerformSelector(this._children, cc.Node.StateCallbackType.updateTransform);
    },

    /**
     * Add child to sprite (override cc.Node )
     * @function
     * @param {cc.Sprite} child
     * @param {Number} localZOrder  child's zOrder
     * @param {String} tag child's tag
     * @override
     */
    addChild: null,

    _addChildForWebGL:function (child, localZOrder, tag) {
        if(!child)
            throw "cc.Sprite.addChild(): child should be non-null";
        if (localZOrder == null)
            localZOrder = child._localZOrder;
        if (tag == null)
            tag = child.tag;

        if (this._batchNode) {
            if(!(child instanceof cc.Sprite)){
                cc.log("cc.Sprite.addChild(): cc.Sprite only supports cc.Sprites as children when using cc.SpriteBatchNode");
                return;
            }
            if(child.texture._webTextureObj !== this.textureAtlas.texture._webTextureObj)
                cc.log("cc.Sprite.addChild(): cc.Sprite only supports a sprite using same texture as children when using cc.SpriteBatchNode");

            //put it in descendants array of batch node
            this._batchNode.appendChild(child);
            if (!this._reorderChildDirty)
                this._setReorderChildDirtyRecursively();
        }

        //cc.Node already sets isReorderChildDirty_ so this needs to be after batchNode check
        cc.NodeRGBA.prototype.addChild.call(this, child, localZOrder, tag);
        this._hasChildren = true;
    },

    _addChildForCanvas: function (child, localZOrder, tag) {
        if(!child)
            throw "cc.Sprite.addChild(): child should be non-null";
        if (localZOrder == null)
            localZOrder = child._localZOrder;
        if (tag == null)
            tag = child.tag;

        //cc.Node already sets isReorderChildDirty_ so this needs to be after batchNode check
        cc.NodeRGBA.prototype.addChild.call(this, child, localZOrder, tag);
        this._hasChildren = true;
    },

    /**
     * Update sprite's color
     */
    updateColor:function () {
        var locDisplayedColor = this._displayedColor, locDisplayedOpacity = this._displayedOpacity;
        var color4 = {r: locDisplayedColor.r, g: locDisplayedColor.g, b: locDisplayedColor.b, a: locDisplayedOpacity};
        // special opacity for premultiplied textures
        if (this._opacityModifyRGB) {
            color4.r *= locDisplayedOpacity / 255.0;
            color4.g *= locDisplayedOpacity / 255.0;
            color4.b *= locDisplayedOpacity / 255.0;
        }
        var locQuad = this._quad;
        locQuad.bl.colors = color4;
        locQuad.br.colors = color4;
        locQuad.tl.colors = color4;
        locQuad.tr.colors = color4;

        // renders using Sprite Manager
        if (this._batchNode) {
            if (this.atlasIndex != cc.SPRITE_INDEX_NOT_INITIALIZED) {
                this.textureAtlas.updateQuad(locQuad, this.atlasIndex)
            } else {
                // no need to set it recursively
                // update dirty_, don't update recursiveDirty_
                this.dirty = true;
            }
        }
        // self render
        // do nothing
        this._quadDirty = true;
    },

    /**
     * Opacity setter
     * @function
     * @param {Number} opacity
     */
    setOpacity:null,

    _setOpacityForWebGL: function (opacity) {
        cc.NodeRGBA.prototype.setOpacity.call(this, opacity);
        this.updateColor();
    },

    _setOpacityForCanvas: function (opacity) {
        cc.NodeRGBA.prototype.setOpacity.call(this, opacity);
        this._setNodeDirtyForCache();
    },

    /**
     * Color setter
     * @function
     * @param {cc.Color} color3
     */
    setColor: null,

    _setColorForWebGL: function (color3) {
        cc.NodeRGBA.prototype.setColor.call(this, color3);
        this.updateColor();
    },

    _setColorForCanvas: function (color3) {
        var curColor = this.color;
        if ((curColor.r === color3.r) && (curColor.g === color3.g) && (curColor.b === color3.b) && (curColor.a === color3.a))
            return;

        cc.NodeRGBA.prototype.setColor.call(this, color3);
        this._changeTextureColor();
        this._setNodeDirtyForCache();
    },

    updateDisplayedColor: null,

    _updateDisplayedColorForWebGL: function (parentColor) {
        cc.NodeRGBA.prototype.updateDisplayedColor.call(this, parentColor);
        this.updateColor();
    },

    _updateDisplayedColorForCanvas: function (parentColor) {
        var oldColor = this.color;
        cc.NodeRGBA.prototype.updateDisplayedColor.call(this, parentColor);
        var newColor = this._displayedColor;
        if ((oldColor.r === newColor.r) && (oldColor.g === newColor.g) && (oldColor.b === newColor.b))
            return;
        this._changeTextureColor();
        this._setNodeDirtyForCache();
    },

    // Frames
    /**
     * Sets a new spriteFrame to the cc.Sprite.
     * @function
     * @param {cc.SpriteFrame|String} newFrame
     */
    setSpriteFrame: null,

    _setSpriteFrameForWebGL: function (newFrame) {
        if(typeof(newFrame) == "string"){
             newFrame = cc.spriteFrameCache.getSpriteFrame(newFrame);
            if(!newFrame)
                throw "Invalid spriteFrameName";
        }

        this.setNodeDirty(true);
        var frameOffset = newFrame.getOffset();
        this._unflippedOffsetPositionFromCenter.x = frameOffset.x;
        this._unflippedOffsetPositionFromCenter.y = frameOffset.y;

        var pNewTexture = newFrame.getTexture();
        var locTextureLoaded = newFrame.textureLoaded();
        if (!locTextureLoaded) {
            this._textureLoaded = false;
            newFrame.addLoadedEventListener(function (sender) {
                this._textureLoaded = true;
                var locNewTexture = sender.getTexture();
                if (locNewTexture != this._texture)
                    this.texture = locNewTexture;
                this.setTextureRect(sender.getRect(), sender.isRotated(), sender.getOriginalSize());

                this._callLoadedEventCallbacks();
            }, this);
        }
        // update texture before updating texture rect
        if (pNewTexture != this._texture)
            this.texture = pNewTexture;

        // update rect
        this._rectRotated = newFrame.isRotated();
        this.setTextureRect(newFrame.getRect(), this._rectRotated, newFrame.getOriginalSize());
    },

    _setSpriteFrameForCanvas: function (newFrame) {
        if(typeof(newFrame) == "string"){
            newFrame = cc.spriteFrameCache.getSpriteFrame(newFrame);
            if(!newFrame)
                throw "Invalid spriteFrameName";
        }

        this.setNodeDirty(true);

        var frameOffset = newFrame.getOffset();
        this._unflippedOffsetPositionFromCenter.x = frameOffset.x;
        this._unflippedOffsetPositionFromCenter.y = frameOffset.y;

        // update rect
        this._rectRotated = newFrame.isRotated();

        var pNewTexture = newFrame.getTexture();
        var locTextureLoaded = newFrame.textureLoaded();
        if (!locTextureLoaded) {
            this._textureLoaded = false;
            newFrame.addLoadedEventListener(function (sender) {
                this._textureLoaded = true;
                var locNewTexture = sender.getTexture();
                if (locNewTexture != this._texture)
                    this.texture = locNewTexture;
                this.setTextureRect(sender.getRect(), sender.isRotated(), sender.getOriginalSize());
                this._callLoadedEventCallbacks();
            }, this);
        }
        // update texture before updating texture rect
        if (pNewTexture != this._texture)
            this.texture = pNewTexture;

        if (this._rectRotated)
            this._originalTexture = pNewTexture;

        this.setTextureRect(newFrame.getRect(), this._rectRotated, newFrame.getOriginalSize());
        this._colorized = false;
        if (locTextureLoaded) {
            var curColor = this.color;
            if (curColor.r !== 255 || curColor.g !== 255 || curColor.b !== 255)
                this._changeTextureColor();
        }
    },

    /**
     * Sets a new display frame to the cc.Sprite.
     * @param {cc.SpriteFrame|String} newFrame
     * @deprecated
     */
    setDisplayFrame: function(newFrame){
        cc.log("setDisplayFrame is deprecated, please use setSpriteFrame instead.");
        this.setSpriteFrame(newFrame);
    },

    /**
     * Returns whether or not a cc.SpriteFrame is being displayed
     * @function
     * @param {cc.SpriteFrame} frame
     * @return {Boolean}
     */
    isFrameDisplayed: null,

    _isFrameDisplayedForWebGL: function (frame) {
        return (cc.rectEqualToRect(frame.getRect(), this._rect) && frame.getTexture().getName() == this._texture.getName()
            && cc.pointEqualToPoint(frame.getOffset(), this._unflippedOffsetPositionFromCenter));
    },

    _isFrameDisplayedForCanvas: function (frame) {
        if (frame.getTexture() != this._texture)
            return false;
        return cc.rectEqualToRect(frame.getRect(), this._rect);
    },

    /**
     * Returns the current displayed frame.
     * @return {cc.SpriteFrame}
     */
    displayFrame: function () {
        return cc.SpriteFrame.create(this._texture,
            cc.RECT_POINTS_TO_PIXELS(this._rect),
            this._rectRotated,
            cc.POINT_POINTS_TO_PIXELS(this._unflippedOffsetPositionFromCenter),
            cc.SIZE_POINTS_TO_PIXELS(this._contentSize));
    },

    /**
     * Sets the batch node to sprite
     * @function
     * @param {cc.SpriteBatchNode|null} spriteBatchNode
     * @example
     *  var batch = cc.SpriteBatchNode.create("Images/grossini_dance_atlas.png", 15);
     *  var sprite = cc.Sprite.create(batch.texture, cc.rect(0, 0, 57, 57));
     *  batch.addChild(sprite);
     *  layer.addChild(batch);
     */
    setBatchNode:null,

    _setBatchNodeForWebGL:function (spriteBatchNode) {
        this._batchNode = spriteBatchNode; // weak reference

        // self render
        if (!this._batchNode) {
            this.atlasIndex = cc.SPRITE_INDEX_NOT_INITIALIZED;
            this.textureAtlas = null;
            this._recursiveDirty = false;
            this.dirty = false;

            var x1 = this._offsetPosition.x;
            var y1 = this._offsetPosition.y;
            var x2 = x1 + this._rect.width;
            var y2 = y1 + this._rect.height;
            var locQuad = this._quad;
            locQuad.bl.vertices = {x:x1, y:y1, z:0};
            locQuad.br.vertices = {x:x2, y:y1, z:0};
            locQuad.tl.vertices = {x:x1, y:y2, z:0};
            locQuad.tr.vertices = {x:x2, y:y2, z:0};

            this._quadDirty = true;
        } else {
            // using batch
            this._transformToBatch = cc.AffineTransformIdentity();
            this.textureAtlas = this._batchNode.textureAtlas; // weak ref
        }
    },

    _setBatchNodeForCanvas:function (spriteBatchNode) {
        this._batchNode = spriteBatchNode; // weak reference

        // self render
        if (!this._batchNode) {
            this.atlasIndex = cc.SPRITE_INDEX_NOT_INITIALIZED;
            this.textureAtlas = null;
            this._recursiveDirty = false;
            this.dirty = false;
        } else {
            // using batch
            this._transformToBatch = cc.AffineTransformIdentity();
            this.textureAtlas = this._batchNode.textureAtlas; // weak ref
        }
    },

    // CCTextureProtocol
    /**
     * Texture of sprite setter
     * @function
     * @param {cc.Texture2D|String} texture
     */
    setTexture: null,

    _setTextureForWebGL: function (texture) {
        if(texture && (typeof(texture) === "string")){
            texture = cc.textureCache.addImage(texture);
            this._setTextureForWebGL(texture);

            //TODO
            var size = texture.getContentSize();
            this.setTextureRect(cc.rect(0,0, size.width, size.height));
            return;
        }
        // CCSprite: setTexture doesn't work when the sprite is rendered using a CCSpriteSheet
        if(texture && !(texture instanceof cc.Texture2D))
            throw "Invalid argument: cc.Sprite.texture setter expects a CCTexture2D.";

        // If batchnode, then texture id should be the same
        if(this._batchNode && this._batchNode.texture != texture) {
            cc.log("cc.Sprite.texture setter: Batched sprites should use the same texture as the batchnode");
            return;
        }

        if (texture)
            this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
        else
            this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_COLOR);

        if (!this._batchNode && this._texture != texture) {
            this._texture = texture;
            this._updateBlendFunc();
        }
    },

    _setTextureForCanvas: function (texture) {
        if(texture && (typeof(texture) === "string")){
            texture = cc.textureCache.addImage(texture);
            this._setTextureForCanvas(texture);

            //TODO
            var size = texture.getContentSize();
            this.setTextureRect(cc.rect(0,0, size.width, size.height));
            return;
        }

        // CCSprite: setTexture doesn't work when the sprite is rendered using a CCSpriteSheet
        if(texture && !(texture instanceof cc.Texture2D))
            throw "Invalid argument: cc.Sprite texture setter expects a CCTexture2D.";

        if (this._texture != texture) {
            if (texture && texture.getHtmlElementObj() instanceof  HTMLImageElement) {
                this._originalTexture = texture;
            }
            this._texture = texture;
        }
    },

    // Texture protocol
    _updateBlendFunc:function () {
        if(this._batchNode){
            cc.log("cc.Sprite._updateBlendFunc(): _updateBlendFunc doesn't work when the sprite is rendered using a cc.CCSpriteBatchNode");
            return;
        }

        // it's possible to have an untextured sprite
        if (!this._texture || !this._texture.hasPremultipliedAlpha()) {
            this._blendFunc.src = cc.SRC_ALPHA;
            this._blendFunc.dst = cc.ONE_MINUS_SRC_ALPHA;
            this.opacityModifyRGB = false;
        } else {
            this._blendFunc.src = cc.BLEND_SRC;
            this._blendFunc.dst = cc.BLEND_DST;
            this.opacityModifyRGB = true;
        }
    },

    _changeTextureColor: function () {
        var locElement, locTexture = this._texture, locRect = this._textureRect_Canvas; //this.getTextureRect();
        if (locTexture && locRect.validRect && this._originalTexture) {
            locElement = locTexture.getHtmlElementObj();
            if (!locElement)
                return;

            var cacheTextureForColor = cc.textureCache.getTextureColors(this._originalTexture.getHtmlElementObj());
            if (cacheTextureForColor) {
                this._colorized = true;
                //generate color texture cache
                if (locElement instanceof HTMLCanvasElement && !this._rectRotated && !this._newTextureWhenChangeColor)
                    cc.generateTintImage(locElement, cacheTextureForColor, this._displayedColor, locRect, locElement);
                else {
                    locElement = cc.generateTintImage(locElement, cacheTextureForColor, this._displayedColor, locRect);
                    locTexture = new cc.Texture2D();
                    locTexture.initWithElement(locElement);
                    locTexture.handleLoadedTexture();
                    this.texture = locTexture;
                }
            }
        }
    },

    _setTextureCoords:function (rect) {
        rect = cc.RECT_POINTS_TO_PIXELS(rect);

        var tex = this._batchNode ? this.textureAtlas.texture : this._texture;
        if (!tex)
            return;

        var atlasWidth = tex.pixelsWidth;
        var atlasHeight = tex.pixelsHeight;

        var left, right, top, bottom, tempSwap, locQuad = this._quad;
        if (this._rectRotated) {
            if (cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL) {
                left = (2 * rect.x + 1) / (2 * atlasWidth);
                right = left + (rect.height * 2 - 2) / (2 * atlasWidth);
                top = (2 * rect.y + 1) / (2 * atlasHeight);
                bottom = top + (rect.width * 2 - 2) / (2 * atlasHeight);
            } else {
                left = rect.x / atlasWidth;
                right = (rect.x + rect.height) / atlasWidth;
                top = rect.y / atlasHeight;
                bottom = (rect.y + rect.width) / atlasHeight;
            }// CC_FIX_ARTIFACTS_BY_STRECHING_TEXEL

            if (this._flippedX) {
                tempSwap = top;
                top = bottom;
                bottom = tempSwap;
            }

            if (this._flippedY) {
                tempSwap = left;
                left = right;
                right = tempSwap;
            }

            locQuad.bl.texCoords.u = left;
            locQuad.bl.texCoords.v = top;
            locQuad.br.texCoords.u = left;
            locQuad.br.texCoords.v = bottom;
            locQuad.tl.texCoords.u = right;
            locQuad.tl.texCoords.v = top;
            locQuad.tr.texCoords.u = right;
            locQuad.tr.texCoords.v = bottom;
        } else {
            if (cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL) {
                left = (2 * rect.x + 1) / (2 * atlasWidth);
                right = left + (rect.width * 2 - 2) / (2 * atlasWidth);
                top = (2 * rect.y + 1) / (2 * atlasHeight);
                bottom = top + (rect.height * 2 - 2) / (2 * atlasHeight);
            } else {
                left = rect.x / atlasWidth;
                right = (rect.x + rect.width) / atlasWidth;
                top = rect.y / atlasHeight;
                bottom = (rect.y + rect.height) / atlasHeight;
            } // ! CC_FIX_ARTIFACTS_BY_STRECHING_TEXEL

            if (this._flippedX) {
                tempSwap = left;
                left = right;
                right = tempSwap;
            }

            if (this._flippedY) {
                tempSwap = top;
                top = bottom;
                bottom = tempSwap;
            }

            locQuad.bl.texCoords.u = left;
            locQuad.bl.texCoords.v = bottom;
            locQuad.br.texCoords.u = right;
            locQuad.br.texCoords.v = bottom;
            locQuad.tl.texCoords.u = left;
            locQuad.tl.texCoords.v = top;
            locQuad.tr.texCoords.u = right;
            locQuad.tr.texCoords.v = top;
        }
        this._quadDirty = true;
    },
    /**
     * draw sprite to canvas
     * @function
     */
    draw: null,

    _drawForWebGL: function () {
        if (!this._textureLoaded)
            return;

        var gl = cc._renderContext, locTexture = this._texture;
        //cc.assert(!this._batchNode, "If cc.Sprite is being rendered by cc.SpriteBatchNode, cc.Sprite#draw SHOULD NOT be called");

        if (locTexture) {
            if (locTexture._isLoaded) {
                this._shaderProgram.use();
                this._shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4();

                cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);
                //optimize performance for javascript
                cc.glBindTexture2DN(0, locTexture);                   // = cc.glBindTexture2D(locTexture);
                cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);

                gl.bindBuffer(gl.ARRAY_BUFFER, this._quadWebBuffer);
                if (this._quadDirty) {
                    gl.bufferData(gl.ARRAY_BUFFER, this._quad.arrayBuffer, gl.DYNAMIC_DRAW);
                    this._quadDirty = false;
                }
                gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);                   //cc.VERTEX_ATTRIB_POSITION
                gl.vertexAttribPointer(1, 4, gl.UNSIGNED_BYTE, true, 24, 12);           //cc.VERTEX_ATTRIB_COLOR
                gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 24, 16);                  //cc.VERTEX_ATTRIB_TEX_COORDS

                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            }
        } else {
            this._shaderProgram.use();
            this._shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4();

            cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);
            cc.glBindTexture2D(null);

            cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_COLOR);

            gl.bindBuffer(gl.ARRAY_BUFFER, this._quadWebBuffer);
            if (this._quadDirty) {
                cc._renderContext.bufferData(cc._renderContext.ARRAY_BUFFER, this._quad.arrayBuffer, cc._renderContext.STATIC_DRAW);
                this._quadDirty = false;
            }
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0);
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        cc.g_NumberOfDraws++;
        if (cc.SPRITE_DEBUG_DRAW === 0 && !this._showNode)
            return;

        if (cc.SPRITE_DEBUG_DRAW === 1 || this._showNode) {
            // draw bounding box
            var locQuad = this._quad;
            var verticesG1 = [
                cc.p(locQuad.tl.vertices.x, locQuad.tl.vertices.y),
                cc.p(locQuad.bl.vertices.x, locQuad.bl.vertices.y),
                cc.p(locQuad.br.vertices.x, locQuad.br.vertices.y),
                cc.p(locQuad.tr.vertices.x, locQuad.tr.vertices.y)
            ];
            cc._drawingUtil.drawPoly(verticesG1, 4, true);
        } else if (cc.SPRITE_DEBUG_DRAW === 2) {
            // draw texture box
            var drawRectG2 = this.getTextureRect();
            var offsetPixG2 = this.getOffsetPosition();
            var verticesG2 = [cc.p(offsetPixG2.x, offsetPixG2.y), cc.p(offsetPixG2.x + drawRectG2.width, offsetPixG2.y),
                cc.p(offsetPixG2.x + drawRectG2.width, offsetPixG2.y + drawRectG2.height), cc.p(offsetPixG2.x, offsetPixG2.y + drawRectG2.height)];
            cc._drawingUtil.drawPoly(verticesG2, 4, true);
        } // CC_SPRITE_DEBUG_DRAW
    },

    _drawForCanvas: function (ctx) {
        if (!this._textureLoaded)
            return;

        var context = ctx || cc._renderContext;
        if (this._isLighterMode)
            context.globalCompositeOperation = 'lighter';

        var locEGL_ScaleX = cc.view.getScaleX(), locEGL_ScaleY = cc.view.getScaleY();

        context.globalAlpha = this._displayedOpacity / 255;
        var locRect = this._rect, locContentSize = this._contentSize, locOffsetPosition = this._offsetPosition, locDrawSizeCanvas = this._drawSize_Canvas;
        var flipXOffset = 0 | (locOffsetPosition.x), flipYOffset = -locOffsetPosition.y - locRect.height, locTextureCoord = this._textureRect_Canvas;
        locDrawSizeCanvas.width = locRect.width * locEGL_ScaleX;
        locDrawSizeCanvas.height = locRect.height * locEGL_ScaleY;

        if (this._flippedX || this._flippedY) {
            context.save();
            if (this._flippedX) {
                flipXOffset = -locOffsetPosition.x - locRect.width;
                context.scale(-1, 1);
            }
            if (this._flippedY) {
                flipYOffset = locOffsetPosition.y;
                context.scale(1, -1);
            }
        }

        flipXOffset *= locEGL_ScaleX;
        flipYOffset *= locEGL_ScaleY;

        if (this._texture && locTextureCoord.validRect) {
            var image = this._texture.getHtmlElementObj();
            if (this._colorized) {
                context.drawImage(image,
                    0, 0, locTextureCoord.width, locTextureCoord.height,
                    flipXOffset, flipYOffset, locDrawSizeCanvas.width, locDrawSizeCanvas.height);
            } else {
                context.drawImage(image,
                    locTextureCoord.x, locTextureCoord.y, locTextureCoord.width,  locTextureCoord.height,
                    flipXOffset, flipYOffset, locDrawSizeCanvas.width , locDrawSizeCanvas.height);
            }
        } else if (locContentSize.width !== 0) {
            var curColor = this.color;
            context.fillStyle = "rgba(" + curColor.r + "," + curColor.g + "," + curColor.b + ",1)";
            context.fillRect(flipXOffset, flipYOffset, locContentSize.width * locEGL_ScaleX, locContentSize.height * locEGL_ScaleY);
        }

        if (cc.SPRITE_DEBUG_DRAW === 1 || this._showNode) {
            // draw bounding box
            context.strokeStyle = "rgba(0,255,0,1)";
            flipXOffset /= locEGL_ScaleX;
            flipYOffset /= locEGL_ScaleY;
            flipYOffset = -flipYOffset;
            var vertices1 = [cc.p(flipXOffset, flipYOffset),
                cc.p(flipXOffset + locRect.width, flipYOffset),
                cc.p(flipXOffset + locRect.width, flipYOffset - locRect.height),
                cc.p(flipXOffset, flipYOffset - locRect.height)];
            cc._drawingUtil.drawPoly(vertices1, 4, true);
        } else if (cc.SPRITE_DEBUG_DRAW === 2) {
            // draw texture box
            context.strokeStyle = "rgba(0,255,0,1)";
            var drawRect = this._rect;
            flipYOffset = -flipYOffset;
            var vertices2 = [cc.p(flipXOffset, flipYOffset), cc.p(flipXOffset + drawRect.width, flipYOffset),
                cc.p(flipXOffset + drawRect.width, flipYOffset - drawRect.height), cc.p(flipXOffset, flipYOffset - drawRect.height)];
            cc._drawingUtil.drawPoly(vertices2, 4, true);
        }
        if (this._flippedX || this._flippedY)
            context.restore();
        cc.g_NumberOfDraws++;
    }
});

window._p = cc.Sprite.prototype;
if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
	_p._spriteFrameLoadedCallback = _p._spriteFrameLoadedCallbackForWebGL;
	_p.setOpacityModifyRGB = _p._setOpacityModifyRGBForWebGL;
	_p.updateDisplayedOpacity = _p._updateDisplayedOpacityForWebGL;
	_p.ctor = _p._ctorForWebGL;
    _p.setBlendFunc = _p._setBlendFuncForWebGL;
    _p.init = _p._initForWebGL;
    _p.initWithTexture = _p._initWithTextureForWebGL;
    _p._textureLoadedCallback = _p._textureLoadedCallbackForWebGL;
    _p.setTextureRect = _p._setTextureRectForWebGL;
    _p.updateTransform = _p._updateTransformForWebGL;
    _p.addChild = _p._addChildForWebGL;
    _p.setOpacity = _p._setOpacityForWebGL;
    _p.setColor = _p._setColorForWebGL;
    _p.updateDisplayedColor = _p._updateDisplayedColorForWebGL;
    _p.setSpriteFrame = _p._setSpriteFrameForWebGL;
    _p.isFrameDisplayed = _p._isFrameDisplayedForWebGL;
    _p.setBatchNode = _p._setBatchNodeForWebGL;
    _p.setTexture = _p._setTextureForWebGL;
    _p.draw = _p._drawForWebGL;
}else{
    _p._spriteFrameLoadedCallback = _p._spriteFrameLoadedCallbackForCanvas;
    _p.setOpacityModifyRGB = _p._setOpacityModifyRGBForCanvas;
    _p.updateDisplayedOpacity = _p._updateDisplayedOpacityForCanvas;
    _p.ctor = _p._ctorForCanvas;
    _p.setBlendFunc = _p._setBlendFuncForCanvas;
    _p.init = _p._initForCanvas;
    _p.initWithTexture = _p._initWithTextureForCanvas;
    _p._textureLoadedCallback = _p._textureLoadedCallbackForCanvas;
    _p.setTextureRect = _p._setTextureRectForCanvas;
    _p.updateTransform = _p._updateTransformForCanvas;
    _p.addChild = _p._addChildForCanvas;
    _p.setOpacity = _p._setOpacityForCanvas;
    _p.setColor = _p._setColorForCanvas;
    _p.updateDisplayedColor = _p._updateDisplayedColorForCanvas;
    _p.setSpriteFrame = _p._setSpriteFrameForCanvas;
    _p.isFrameDisplayed = _p._isFrameDisplayedForCanvas;
    _p.setBatchNode = _p._setBatchNodeForCanvas;
    _p.setTexture = _p._setTextureForCanvas;
    _p.draw = _p._drawForCanvas;
}

// Override properties
cc.defineGetterSetter(_p, "opacityModifyRGB", _p.isOpacityModifyRGB, _p.setOpacityModifyRGB);
cc.defineGetterSetter(_p, "opacity", _p.getOpacity, _p.setOpacity);
cc.defineGetterSetter(_p, "color", _p.getColor, _p.setColor);

// Extended properties
/** @expose */
_p.dirty;
/** @expose */
_p.flippedX;
cc.defineGetterSetter(_p, "flippedX", _p.isFlippedX, _p.setFlippedX);
/** @expose */
_p.flippedY;
cc.defineGetterSetter(_p, "flippedY", _p.isFlippedY, _p.setFlippedY);
/** @expose */
_p.offsetX;
cc.defineGetterSetter(_p, "offsetX", _p._getOffsetX);
/** @expose */
_p.offsetY;
cc.defineGetterSetter(_p, "offsetY", _p._getOffsetY);
/** @expose */
_p.atlasIndex;
/** @expose */
_p.texture;
cc.defineGetterSetter(_p, "texture", _p.getTexture, _p.setTexture);
/** @expose */
_p.textureRectRotated;
cc.defineGetterSetter(_p, "textureRectRotated", _p.isTextureRectRotated);
/** @expose */
_p.textureAtlas;
/** @expose */
_p.batchNode;
cc.defineGetterSetter(_p, "batchNode", _p.getBatchNode, _p.setBatchNode);
/** @expose */
_p.quad;
cc.defineGetterSetter(_p, "quad", _p.getQuad);

delete window._p;

/**
 * Create a sprite with image path or frame name or texture or spriteFrame.
 * @constructs
 * @param {String|cc.SpriteFrame|HTMLImageElement|cc.Texture2D} fileName  The string which indicates a path to image file, e.g., "scene1/monster.png".
 * @param {cc.Rect} rect  Only the contents inside rect of pszFileName's texture will be applied for this sprite.
 * @return {cc.Sprite} A valid sprite object
 * @example
 *
 * 1.Create a sprite with image path and rect
 * var sprite1 = cc.Sprite.create("res/HelloHTML5World.png");
 * var sprite2 = cc.Sprite.create("res/HelloHTML5World.png",cc.rect(0,0,480,320));
 *
 * 2.Create a sprite with a sprite frame name. Must add "#" before frame name.
 * var sprite = cc.Sprite.create('#grossini_dance_01.png');
 *
 * 3.Create a sprite with a sprite frame
 * var spriteFrame = cc.spriteFrameCache.getSpriteFrame("grossini_dance_01.png");
 * var sprite = cc.Sprite.create(spriteFrame);
 *
 * 4.Create a sprite with an exsiting texture contained in a CCTexture2D object
 *      After creation, the rect will be the size of the texture, and the offset will be (0,0).
 * var texture = cc.textureCache.addImage("HelloHTML5World.png");
 * var sprite1 = cc.Sprite.create(texture);
 * var sprite2 = cc.Sprite.create(texture, cc.rect(0,0,480,320));
 *
 */
cc.Sprite.create = function (fileName, rect) {
    return new cc.Sprite(fileName, rect);
};
