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
 * cc.Sprite invalid index on the cc.SpriteBatchode
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
    if (texture.hasOwnProperty('channelCache')) {
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
 * @param {cc.Color3B|cc.Color4F} color
 * @param {cc.Rect} rect
 * @return {HTMLCanvasElement}
 */
cc.generateTintImage2 = function (texture, color, rect) {
    if (!rect) {
        rect = cc.rect(0, 0, texture.width, texture.height);
    }
    var selColor;
    if (color instanceof cc.Color4F) {
        selColor = cc.c4b(color.r * 255, color.g * 255, color.b * 255, color.a * 255);
    } else {
        selColor = cc.c4b(color.r, color.g, color.b, 50);//color;
    }

    var buff = document.createElement("canvas");
    var ctx = buff.getContext("2d");

    if (buff.width != rect.width) buff.width = rect.width;
    if (buff.height != rect.height) buff.height = rect.height;
    ctx.save();

    ctx.drawImage(texture, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);

    ctx.globalCompositeOperation = "source-in";
    ctx.globalAlpha = selColor.a / 255.0;
    ctx.fillStyle = "rgb(" + selColor.r + "," + selColor.g + "," + selColor.b + ")";
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
 * @param {cc.Color3B|cc.Color4F} color
 * @param {cc.Rect} rect
 * @param {HTMLCanvasElement} [renderCanvas]
 * @return {HTMLCanvasElement}
 */
cc.generateTintImage = function (texture, tintedImgCache, color, rect, renderCanvas) {
    if (!rect)
        rect = cc.rect(0, 0, texture.width, texture.height);

    var selColor;
    if (color instanceof cc.Color3B) {
        // Optimization for the particle system which mainly uses c4f colors
        selColor = cc.c4f(color.r / 255.0, color.g / 255.0, color.b / 255, 1);
    } else {
        selColor = color;
    }

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
    if (selColor.r > 0) {
        ctx.globalAlpha = selColor.r * a;
        ctx.drawImage(tintedImgCache[0], rect.x, rect.y, w, h, 0, 0, w, h);
    }
    if (selColor.g > 0) {
        ctx.globalAlpha = selColor.g * a;
        ctx.drawImage(tintedImgCache[1], rect.x, rect.y, w, h, 0, 0, w, h);
    }
    if (selColor.b > 0) {
        ctx.globalAlpha = selColor.b * a;
        ctx.drawImage(tintedImgCache[2], rect.x, rect.y, w, h, 0, 0, w, h);
    }

    if((selColor.r === 0) && (selColor.g === 0) &&(selColor.b === 0)){
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

/**
 * a Values object for transform
 * @Class
 * @Construct
 * @param {cc.Point} pos position x and y
 * @param {cc.Point} scale scale x and y
 * @param {Number} rotation
 * @param {cc.Point} skew skew x and y
 * @param {cc.Point} ap anchor point in pixels
 * @param {Boolean} visible
 */
cc.TransformValues = function (pos, scale, rotation, skew, ap, visible) {
    this.pos = pos;		// position x and y
    this.scale = scale;		// scale x and y
    this.rotation = rotation;
    this.skew = skew;		// skew x and y
    this.ap = ap;			// anchor point in pixels
    this.visible = visible;
};

cc.RENDER_IN_SUBPIXEL = function (A) {
    return (0 | A);
};
if(cc.SPRITEBATCHNODE_RENDER_SUBPIXEL){
    cc.RENDER_IN_SUBPIXEL = function (A) {
        return A;
    };
}

/**
 * <p>cc.Sprite is a 2d image ( http://en.wikipedia.org/wiki/Sprite_(computer_graphics) ) (Canvas implement) <br/>
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
 * @example
 * var aSprite = new cc.Sprite();
 * aSprite.initWithFile("HelloHTML5World.png",cc.rect(0,0,480,320));
 */
cc.SpriteCanvas = cc.NodeRGBA.extend(/** @lends cc.SpriteCanvas# */{
    /// ---- common properties start ----
    RGBAProtocol:true,
    //
    // Data used when the sprite is rendered using a CCSpriteSheet
    //
    _textureAtlas:null,                                      //cc.SpriteBatchNode texture atlas

    _atlasIndex:0,
    _batchNode:null,
    _dirty:false,                                            //Whether the sprite needs to be updated
    _recursiveDirty:null,                                   //Whether all of the sprite's children needs to be updated
    _hasChildren:null,                                      //Whether the sprite contains children
    _shouldBeHidden:false,                                  //should not be drawn because one of the ancestors is not visible
    _transformToBatch:null,

    //
    // Data used when the sprite is self-rendered
    //
    _blendFunc:null,                                         //It's required for CCTextureProtocol inheritance
    _texture:null,                                           //cc.Texture2D object that is used to render the sprite

    //
    // Shared data
    //
    // texture
    _rect:cc.rect(0, 0, 0, 0),                               //Retangle of cc.Texture2D
    _rectRotated:false,                                      //Whether the texture is rotated

    // Offset Position (used by Zwoptex)
    _offsetPosition:null, // absolute
    _unflippedOffsetPositionFromCenter:null,

    _opacityModifyRGB:false,

    // image is flipped
    _flipX:false,                                           //Whether the sprite is flipped horizontally or not.
    _flipY:false,                                           //Whether the sprite is flipped vertically or not.

    /**
     * Whether or not the Sprite needs to be updated in the Atlas
     * @return {Boolean} true if the sprite needs to be updated in the Atlas, false otherwise.
     */
    isDirty:function () {
        return this._dirty;
    },

    /**
     * Makes the Sprite to be updated in the Atlas.
     * @param {Boolean} bDirty
     */
    setDirty:function (bDirty) {
        this._dirty = bDirty;
    },

    /**
     * Returns the quad (tex coords, vertex coords and color) information. (Use in WebGL model only)
     * @return {null}
     */
    getQuad:function () {
        return null;
    },

    /**
     * returns whether or not the texture rectangle is rotated
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
        return this._atlasIndex;
    },

    /**
     * Set the index used on the TextureAtlas.
     * @warning Don't modify this value unless you know what you are doing
     * @param {Number} atlasIndex
     */
    setAtlasIndex:function (atlasIndex) {
        this._atlasIndex = atlasIndex;
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
        return this._textureAtlas;
    },

    /**
     * Sets the weak reference of the cc.TextureAtlas when the sprite is rendered using via cc.SpriteBatchNode
     * @param {cc.TextureAtlas} textureAtlas
     */
    setTextureAtlas:function (textureAtlas) {
        this._textureAtlas = textureAtlas;
    },

    /**
     * Gets the offset position of the sprite. Calculated automatically by editors like Zwoptex.
     * @return {cc.Point}
     */
    getOffsetPosition:function () {
        return cc.p(this._offsetPosition.x, this._offsetPosition.y);
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
     * var spriteFrame = cc.SpriteFrameCache.getInstance().getSpriteFrame("grossini_dance_01.png");
     * var sprite = new cc.Sprite();
     * sprite.initWithSpriteFrame(spriteFrame);
     */
    initWithSpriteFrame:function (spriteFrame) {
        cc.Assert(spriteFrame != null, "");
        var ret = this.initWithTexture(spriteFrame.getTexture(), spriteFrame.getRect());
        this.setDisplayFrame(spriteFrame);

        return ret;
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
        cc.Assert(spriteFrameName != null, "");
        var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(spriteFrameName);
        return this.initWithSpriteFrame(frame);
    },

    /**
     * tell the sprite to use batch node render.
     * @param {cc.SpriteBatchNode} batchNode
     */
    useBatchNode:function (batchNode) {
        this._textureAtlas = batchNode.getTextureAtlas(); // weak ref
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
     * @param rect
     */
    setVertexRect:function (rect) {
        this._rect = rect;
    },

    sortAllChildren:function () {
        if (this._reorderChildDirty) {
            var j, tempItem, locChildren = this._children;
            for (var i = 1; i < locChildren.length; i++) {
                tempItem = locChildren[i];
                j = i - 1;

                //continue moving element downwards while zOrder is smaller or when zOrder is the same but orderOfArrival is smaller
                while (j >= 0 && ( tempItem.getZOrder() < locChildren[j].getZOrder() || ( tempItem.getZOrder() === locChildren[j].getZOrder()
                    && tempItem.getOrderOfArrival() < locChildren[j].getOrderOfArrival() ) )) {
                    locChildren[j + 1] = locChildren[j];
                    j = j - 1;
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
        cc.Assert(child != null, "child is null");
        cc.Assert(this._children.indexOf(child) > -1, "this child is not in children list");

        if (zOrder === child.getZOrder())
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
        var locChildren = this._children;
        if (this._batchNode && locChildren != null) {
            for (var i = 0; i < locChildren.length; i++)
                this._batchNode.removeSpriteFromAtlas(locChildren[i]);
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
        this.setDirty(value);
        // recursively set dirty
        var locChildren = this._children;
        if (locChildren != null) {
            for (var i = 0; i < locChildren.length; i++)
                locChildren[i].setDirtyRecursively(true);
        }
    },

    /**
     * HACK: optimization
     */
    SET_DIRTY_RECURSIVELY:function () {
        if (this._batchNode && !this._recursiveDirty) {
            this._recursiveDirty = true;
            this._dirty = true;
            if (this._hasChildren)
                this.setDirtyRecursively(true);
        }
    },

    /**
     * position setter (override cc.Node )
     * @param {cc.Point} pos
     * @override
     */
    setPosition:function (pos) {
        if (arguments.length >= 2)
            cc.Node.prototype.setPosition.call(this, pos, arguments[1]);
        else
            cc.Node.prototype.setPosition.call(this, pos);
        this.SET_DIRTY_RECURSIVELY();
    },

    /**
     * Rotation setter (override cc.Node )
     * @param {Number} rotation
     * @override
     */
    setRotation:function (rotation) {
        cc.Node.prototype.setRotation.call(this, rotation);
        this.SET_DIRTY_RECURSIVELY();
    },

    setRotationX:function (rotationX) {
        cc.Node.prototype.setRotationX.call(this, rotationX);
        this.SET_DIRTY_RECURSIVELY();
    },

    setRotationY:function (rotationY) {
        cc.Node.prototype.setRotationY.call(this, rotationY);
        this.SET_DIRTY_RECURSIVELY();
    },

    /**
     * SkewX setter (override cc.Node )
     * @param {Number} sx SkewX value
     * @override
     */
    setSkewX:function (sx) {
        cc.Node.prototype.setSkewX.call(this, sx);
        this.SET_DIRTY_RECURSIVELY();
    },

    /**
     * SkewY setter (override cc.Node )
     * @param {Number} sy SkewY value
     * @override
     */
    setSkewY:function (sy) {
        cc.Node.prototype.setSkewY.call(this, sy);
        this.SET_DIRTY_RECURSIVELY();
    },

    /**
     * ScaleX setter (override cc.Node )
     * @param {Number} scaleX
     * @override
     */
    setScaleX:function (scaleX) {
        cc.Node.prototype.setScaleX.call(this, scaleX);
        this.SET_DIRTY_RECURSIVELY();
    },

    /**
     * ScaleY setter (override cc.Node )
     * @param {Number} scaleY
     * @override
     */
    setScaleY:function (scaleY) {
        cc.Node.prototype.setScaleY.call(this, scaleY);
        this.SET_DIRTY_RECURSIVELY();
    },

    /**
     * <p>The scale factor of the node. 1.0 is the default scale factor. <br/>
     * It modifies the X and Y scale at the same time. (override cc.Node ) <p/>
     * @param {Number} scale
     * @override
     */
    setScale:function (scale, scaleY) {
        cc.Node.prototype.setScale.call(this, scale, scaleY);
        this.SET_DIRTY_RECURSIVELY();
    },

    /**
     * VertexZ setter (override cc.Node )
     * @param {Number} vertexZ
     * @override
     */
    setVertexZ:function (vertexZ) {
        cc.Node.prototype.setVertexZ.call(this, vertexZ);
        this.SET_DIRTY_RECURSIVELY();
    },

    /**
     * AnchorPoint setter  (override cc.Node )
     * @param {cc.Point} anchor
     * @override
     */
    setAnchorPoint:function (anchor) {
        cc.Node.prototype.setAnchorPoint.call(this, anchor);
        this.SET_DIRTY_RECURSIVELY();
    },

    /**
     * visible setter  (override cc.Node )
     * @param {Boolean} visible
     * @override
     */
    setVisible:function (visible) {
        cc.Node.prototype.setVisible.call(this, visible);
        this.SET_DIRTY_RECURSIVELY();
    },

    /**
     * IsRelativeAnchorPoint setter  (override cc.Node )
     * @param {Boolean} relative
     * @override
     */
    ignoreAnchorPointForPosition:function (relative) {
        cc.Assert(!this._batchNode, "ignoreAnchorPointForPosition is invalid in cc.Sprite");
        cc.Node.prototype.ignoreAnchorPointForPosition.call(this,relative);
    },

    /**
     * Sets whether the sprite should be flipped horizontally or not.
     * @param {Boolean} flipX true if the sprite should be flipped horizaontally, false otherwise.
     */
    setFlipX:function (flipX) {
        if (this._flipX != flipX) {
            this._flipX = flipX;
            this.setTextureRect(this._rect, this._rectRotated, this._contentSize);
            this.setNodeDirty();
        }
    },

    /**
     * Sets whether the sprite should be flipped vertically or not.
     * @param {Boolean} flipY true if the sprite should be flipped vertically, flase otherwise.
     */
    setFlipY:function (flipY) {
        if (this._flipY != flipY) {
            this._flipY = flipY;
            this.setTextureRect(this._rect, this._rectRotated, this._contentSize);
            this.setNodeDirty();
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
        return this._flipX;
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
        return this._flipY;
    },

    //
    // RGBA protocol
    //

    // RGBAProtocol
    /**
     * opacity: conforms to cc.RGBAProtocol protocol
     * @param {Boolean} modify
     */
    setOpacityModifyRGB:function (modify) {
        if(this._opacityModifyRGB !== modify){
            this._opacityModifyRGB = modify;
            this.setNodeDirty();
        }
    },

    /**
     * return IsOpacityModifyRGB value
     * @return {Boolean}
     */
    isOpacityModifyRGB:function () {
        return this._opacityModifyRGB;
    },

    updateDisplayedOpacity:function(parentOpacity){
        cc.NodeRGBA.prototype.updateDisplayedOpacity.call(this, parentOpacity);
        this._changeTextureColor();
        this.setNodeDirty();
    },

    // Animation

    /**
     * changes the display frame with animation name and index.<br/>
     * The animation name will be get from the CCAnimationCache
     * @param animationName
     * @param frameIndex
     */
    setDisplayFrameWithAnimationName:function (animationName, frameIndex) {
        cc.Assert(animationName, "cc.Sprite#setDisplayFrameWithAnimationName. animationName must not be null");
        var cache = cc.AnimationCache.getInstance().getAnimation(animationName);
        cc.Assert(cache, "cc.Sprite#setDisplayFrameWithAnimationName: Frame not found");
        var animFrame = cache.getFrames()[frameIndex];
        cc.Assert(animFrame, "cc.Sprite#setDisplayFrame. Invalid frame");
        this.setDisplayFrame(animFrame.getSpriteFrame());
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
                pNode = pNode.getParent();
            }
        }
    },

    // CCTextureProtocol
    getTexture:function () {
        return this._texture;
    },
    /// ---- common properties end   ----

    _colorized:false,
    _isLighterMode:false,
    _originalTexture:null,

    /**
     * Constructor
     * @param {String|cc.SpriteFrame|cc.SpriteBatchNode|HTMLImageElement} fileName sprite construct parameter
     */
    ctor:function (fileName) {
        cc.NodeRGBA.prototype.ctor.call(this);
        this._shouldBeHidden = false;
        this._offsetPosition = cc.p(0, 0);
        this._unflippedOffsetPositionFromCenter = cc.p(0, 0);
        this._blendFunc = {src:cc.BLEND_SRC, dst:cc.BLEND_DST};

        if (fileName) {
            if (typeof(fileName) == "string") {
                var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(fileName);
                this.initWithSpriteFrame(frame);
            } else if (typeof(fileName) === "object") {
                if (fileName instanceof cc.SpriteFrame) {
                    this.initWithSpriteFrame(fileName);
                } else if (fileName instanceof cc.SpriteBatchNode) {
                    if (arguments.length > 1) {
                        var rect = arguments[1];
                        if (rect instanceof cc.Rect)
                            this.initWithBatchNode(fileName, rect);
                    }
                } else if ((fileName instanceof HTMLImageElement) || (fileName instanceof HTMLCanvasElement)) {
                    this.initWithTexture(fileName)
                }
            }
        }
    },

    /**
     * conforms to cc.TextureProtocol protocol
     * @param {Number|cc.BlendFunc} src
     * @param {Number} dst
     */
    setBlendFunc:function (src, dst) {
        if (arguments.length == 1)
            this._blendFunc = src;
        else
            this._blendFunc = {src:src, dst:dst};
        this._isLighterMode = (this._blendFunc && (this._blendFunc.src === gl.SRC_ALPHA) && (this._blendFunc.dst === gl.ONE));
    },

    /**
     * Initializes an empty sprite with nothing init.
     * @return {Boolean}
     */
    init:function () {
        if(arguments.length > 0)
            return this.initWithFile(arguments[0], arguments[1]);

        cc.NodeRGBA.prototype.init.call(this);
        this._dirty = this._recursiveDirty = false;
        this._opacityModifyRGB = true;

        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;

        // update texture (calls _updateBlendFunc)
        this.setTexture(null);
        this._flipX = this._flipY = false;

        // default transform anchor: center
        this.setAnchorPoint(cc.p(0.5, 0.5));

        // zwoptex default values
        this._offsetPosition = cc.PointZero();
        this._hasChildren = false;

        // updated in "useSelfRender"
        // Atlas: TexCoords
        this.setTextureRect(cc.RectZero(), false, cc.SizeZero());
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
        cc.Assert(filename != null, "Sprite#initWithFile():Invalid filename for sprite");
        var selfPointer = this;
        var texture = cc.TextureCache.getInstance().textureForKey(filename);
        if (!texture) {
            this._visible = false;
            var loadImg = new Image();
            loadImg.addEventListener("load", function () {
                if (!rect) {
                    rect = cc.rect(0, 0, loadImg.width, loadImg.height);
                }
                selfPointer.initWithTexture(loadImg, rect);
                cc.TextureCache.getInstance().cacheImage(filename, loadImg);
                selfPointer._visible = true;
            });
            loadImg.addEventListener("error", function () {
                cc.log("load failure:" + filename);
            });
            loadImg.src = filename;
            return true;
        } else {
            if (texture) {
                if (!rect) {
                    rect = cc.rect(0, 0, texture.width, texture.height);
                }
                return this.initWithTexture(texture, rect);
            }
        }
        return false;
    },

    /**
     * Initializes a sprite with a texture and a rect in points, optionally rotated. <br/>
     * After initialization, the rect used will be the size of the texture, and the offset will be (0,0).
     * @param {cc.Texture2D|HTMLImageElement|HTMLCanvasElement} texture A pointer to an existing CCTexture2D object. You can use a CCTexture2D object for many sprites.
     * @param {cc.Rect} rect Only the contents inside rect of this texture will be applied for this sprite.
     * @param {Boolean} rotated Whether or not the texture rectangle is rotated.
     * @return {Boolean} true if the sprite is initialized properly, false otherwise.
     * @example
     * var img =cc.TextureCache.getInstance().addImage("HelloHTML5World.png");
     * var mySprite = new cc.Sprite();
     * mySprite.initWithTexture(img,cc.rect(0,0,480,320));
     */
    initWithTexture:function (texture, rect, rotated) {
        var argnum = arguments.length;
        if (argnum == 0)
            throw "Sprite.initWithTexture(): Argument must be non-nil ";

        rotated = rotated || false;

        if(!cc.NodeRGBA.prototype.init.call(this))
            return false;

        this._batchNode = null;

        this._recursiveDirty = false;
        this._dirty = false;
        this._opacityModifyRGB = true;

        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;

        this._flipX = this._flipY = false;

        // default transform anchor: center
        this.setAnchorPoint(cc.p(0.5, 0.5));

        // zwoptex default values
        this._offsetPosition = cc.p(0, 0);
        this._hasChildren = false;

        if (!rect) {
            rect = cc.rect(0, 0, 0, 0);
            if ((texture instanceof HTMLImageElement) || (texture instanceof HTMLCanvasElement))
                rect.size = cc.size(texture.width, texture.height);
        }
        this._originalTexture = texture;

        this.setTexture(texture);
        this.setTextureRect(rect, rotated, rect.size);

        // by default use "Self Render".
        // if the sprite is added to a batchnode, then it will automatically switch to "batchnode Render"
        this.setBatchNode(null);
        return true;
    },

    /**
     * updates the texture rect of the CCSprite in points.
     * @param {cc.Rect} rect a rect of texture
     * @param {Boolean} rotated
     * @param {cc.Size} untrimmedSize
     */
    setTextureRect:function (rect, rotated, untrimmedSize) {
        this._rectRotated = rotated || false;
        untrimmedSize = untrimmedSize || rect.size;

        this.setContentSize(untrimmedSize);
        this.setVertexRect(rect);

        var relativeOffset = this._unflippedOffsetPositionFromCenter;
        if (this._flipX)
            relativeOffset.x = -relativeOffset.x;
        if (this._flipY)
            relativeOffset.y = -relativeOffset.y;
        this._offsetPosition.x = relativeOffset.x + (this._contentSize.width - this._rect.width) / 2;
        this._offsetPosition.y = relativeOffset.y + (this._contentSize.height - this._rect.height) / 2;

        // rendering using batch node
        if (this._batchNode) {
            // update dirty_, don't update recursiveDirty_
            //this.setDirty(true);
            this._dirty = true;
        }
    },

    // BatchNode methods
    /**
     * updates the quad according the the rotation, position, scale values.
     */
    updateTransform:function () {
        //cc.Assert(this._batchNode, "updateTransform is only valid when cc.Sprite is being rendered using an cc.SpriteBatchNode");

        // recaculate matrix only if it is dirty
        if (this.isDirty()) {
            // If it is not visible, or one of its ancestors is not visible, then do nothing:
            if (!this._visible || ( this._parent && this._parent != this._batchNode && this._parent._shouldBeHidden)) {
                this._shouldBeHidden = true;
            } else {
                this._shouldBeHidden = false;

                if (!this._parent || this._parent == this._batchNode) {
                    this._transformToBatch = this.nodeToParentTransform();
                } else {
                    //cc.Assert(this._parent instanceof cc.Sprite, "Logic error in CCSprite. Parent must be a CCSprite");
                    this._transformToBatch = cc.AffineTransformConcat(this.nodeToParentTransform(), this._parent._transformToBatch);
                }
            }
            this._recursiveDirty = false;
            this.setDirty(false);
        }

        // recursively iterate over children
        if (this._hasChildren)
            this._arrayMakeObjectsPerformSelector(this._children, cc.Node.StateCallbackType.updateTransform);
    },

    /**
     * Add child to sprite (override cc.Node )
     * @param {cc.Sprite} child
     * @param {Number} zOrder  child's zOrder
     * @param {String} tag child's tag
     * @override
     */
    addChild:function (child, zOrder, tag) {
        cc.Assert(child != null, "Argument must be non-NULL");
        if (zOrder == null)
            zOrder = child._zOrder;
        if (tag == null)
            tag = child._tag;

        //cc.Node already sets isReorderChildDirty_ so this needs to be after batchNode check
        cc.Node.prototype.addChild.call(this, child, zOrder, tag);
        this._hasChildren = true;
    },

    /**
     * opacity setter
     * @param {Number} opacity
     */
    setOpacity:function (opacity) {
        cc.NodeRGBA.prototype.setOpacity.call(this, opacity);
        this.setNodeDirty();
    },

    /**
     * color setter
     * @param {cc.Color3B} color3
     */
    setColor:function (color3) {
        var curColor = this.getColor();
        if ((curColor.r === color3.r) && (curColor.g === color3.g) && (curColor.b === color3.b))
            return;

        cc.NodeRGBA.prototype.setColor.call(this, color3);
        this._changeTextureColor();
        this.setNodeDirty();
    },

    updateDisplayedColor:function(parentColor){
        cc.NodeRGBA.prototype.updateDisplayedColor.call(this, parentColor);
        this._changeTextureColor();
        this.setNodeDirty();
    },

    // Frames
    /**
     * Sets a new display frame to the cc.Sprite.
     * @param {cc.SpriteFrame} newFrame
     */
    setDisplayFrame:function (newFrame) {
        this.setNodeDirty();
        this._unflippedOffsetPositionFromCenter = newFrame.getOffset();
        var pNewTexture = newFrame.getTexture();
        // update texture before updating texture rect
        if (pNewTexture != this._texture)
            this.setTexture(pNewTexture);

        // update rect
        this._rectRotated = newFrame.isRotated();

        if (this._rectRotated)
            this._originalTexture = pNewTexture;

        this.setTextureRect(newFrame.getRect(), this._rectRotated, newFrame.getOriginalSize());
        this._colorized = false;
        var curColor = this.getColor();
        if (curColor.r !== 255 || curColor.g !== 255 || curColor.b !== 255)
            this._changeTextureColor();
    },

    /**
     * Returns whether or not a cc.SpriteFrame is being displayed
     * @param {cc.SpriteFrame} frame
     * @return {Boolean}
     */
    isFrameDisplayed:function (frame) {
        if (frame.getTexture() != this._texture)
            return false;
        return cc.rectEqualToRect(frame.getRect(), this._rect);
    },

    /**
     * Returns the current displayed frame.
     * @return {cc.SpriteFrame}
     */
    displayFrame:function () {
        return cc.SpriteFrame._frameWithTextureForCanvas(this._texture,
            cc.RECT_POINTS_TO_PIXELS(this._rect),
            this._rectRotated,
            this._unflippedOffsetPositionFromCenter,
            cc.SIZE_POINTS_TO_PIXELS(this._contentSize));
    },

    /**
     * Sets the batch node to sprite
     * @param {cc.SpriteBatchNode|null} spriteBatchNode
     * @example
     *  var batch = cc.SpriteBatchNode.create("Images/grossini_dance_atlas.png", 15);
     *  var sprite = cc.Sprite.createWithTexture(batch.getTexture(), cc.RectMake(0, 0, 57, 57));
     *  batch.addChild(sprite);
     *  layer.addChild(batch);
     */
    setBatchNode:function (spriteBatchNode) {
        this._batchNode = spriteBatchNode; // weak reference

        // self render
        if (!this._batchNode) {
            this._atlasIndex = cc.SPRITE_INDEX_NOT_INITIALIZED;
            this.setTextureAtlas(null);
            this._recursiveDirty = false;
            this.setDirty(false);
        } else {
            // using batch
            this._transformToBatch = cc.AffineTransformIdentity();
            this.setTextureAtlas(this._batchNode.getTextureAtlas()); // weak ref
        }
    },

    // CCTextureProtocol
    /**
     * Texture of sprite setter
     * @param {HTMLImageElement|HTMLCanvasElement|cc.Texture2D} texture
     */
    setTexture:function (texture) {
        // CCSprite: setTexture doesn't work when the sprite is rendered using a CCSpriteSheet
        cc.Assert(!texture || texture instanceof HTMLImageElement || texture instanceof HTMLCanvasElement, "setTexture expects a CCTexture2D. Invalid argument");

        if (this._texture != texture) {
            if (texture instanceof  HTMLImageElement) {
                if (!this._rect || cc.rectEqualToRect(this._rect, cc.RectZero()))
                    this._rect = cc.rect(0, 0, texture.width, texture.height);
                this._originalTexture = texture;
            }
            this._texture = texture;
        }
    },

    _changeTextureColor:function () {
        if (this.getTexture()) {
            var cacheTextureForColor = cc.TextureCache.getInstance().getTextureColors(this._originalTexture);
            if (cacheTextureForColor) {
                this._colorized = true;
                //generate color texture cache
                if (this._texture instanceof HTMLCanvasElement && !this._rectRotated)
                    cc.generateTintImage(this.getTexture(), cacheTextureForColor, this._displayedColor, this.getTextureRect(), this._texture);
                else {
                    var colorTexture = cc.generateTintImage(this.getTexture(), cacheTextureForColor, this._displayedColor, this.getTextureRect());
                    this.setTexture(colorTexture);
                }
            }
        }
    },

    /**
     * draw sprite to canvas
     * @param {CanvasContext} ctx 2d context of canvas
     */
    draw:function (ctx) {
        var context = ctx || cc.renderContext;
        if (this._isLighterMode)
            context.globalCompositeOperation = 'lighter';

        context.globalAlpha = this._realOpacity / 255;
        var locRect = this._rect;
        var flipXOffset = 0 | (this._offsetPosition.x), flipYOffset = -this._offsetPosition.y - locRect.height;
        if (this._flipX) {
            flipXOffset = -this._offsetPosition.x - locRect.width;
            context.scale(-1, 1);
        }
        if (this._flipY) {
            flipYOffset = this._offsetPosition.y;
            context.scale(1, -1);
        }
        if (this._texture) {
            if (this._colorized) {
                context.drawImage(this._texture,
                    0, 0, locRect.width, locRect.height,
                    flipXOffset, flipYOffset, locRect.width, locRect.height);
            } else {
                context.drawImage(this._texture,
                    locRect.x, locRect.y, locRect.width, locRect.height,
                    flipXOffset, flipYOffset, locRect.width, locRect.height);
            }
        } else if (this._contentSize.width !== 0) {
            var curColor = this.getColor();
            context.fillStyle = "rgba(" + curColor.r + "," + curColor.g + "," + curColor.b + ",1)";
            context.fillRect(flipXOffset, flipYOffset, this._contentSize.width, this._contentSize.height);
        }

        if (cc.SPRITE_DEBUG_DRAW === 1) {
            // draw bounding box
            context.strokeStyle = "rgba(0,255,0,1)";
            flipYOffset = -flipYOffset;
            var vertices1 = [cc.p(flipXOffset, flipYOffset), cc.p(flipXOffset + locRect.width, flipYOffset), cc.p(flipXOffset + locRect.width, flipYOffset - locRect.height),
                cc.p(flipXOffset, flipYOffset - locRect.height)];
            cc.drawingUtil.drawPoly(vertices1, 4, true);
        } else if (cc.SPRITE_DEBUG_DRAW === 2) {
            // draw texture box
            context.strokeStyle = "rgba(0,255,0,1)";
            var drawSize = this._rect.size;
            flipYOffset = -flipYOffset;
            var vertices2 = [cc.p(flipXOffset, flipYOffset), cc.p(flipXOffset + drawSize.width, flipYOffset),
                cc.p(flipXOffset + drawSize.width, flipYOffset - drawSize.height), cc.p(flipXOffset, flipYOffset - drawSize.height)];
            cc.drawingUtil.drawPoly(vertices2, 4, true);
        }
        cc.g_NumberOfDraws++;
    }
});

/**
 * <p>
 *     Creates a sprite with an exsiting texture contained                                                         <br/>
 *     After creation, the rect will be the size of the texture, and the offset will be (0,0).
 * </p>
 * @constructs
 * @param {HTMLImageElement|HTMLCanvasElement|cc.Texture2D} texture  A pointer to an existing CCTexture2D object. You can use a CCTexture2D object for many sprites.
 * @param {cc.Rect} rect Only the contents inside the rect of this texture will be applied for this sprite.
 * @param {cc.Point} offset offset of the texture
 * @return {cc.Sprite} A valid sprite object
 * @example
 * //get an image
 * var img = cc.TextureCache.getInstance().addImage("HelloHTML5World.png");
 *
 * //create a sprite with texture
 * var sprite1 = cc.Sprite.createWithTexture(img);
 *
 * //create a sprite with texture and rect
 * var sprite2 = cc.Sprite.createWithTexture(img, cc.rect(0,0,480,320));
 *
 * //create a sprite with texture and rect and offset
 * var sprite3 = cc.Sprite.createWithTexture(img, cc.rect(0,0,480,320),cc.p(0,0));
 */
cc.SpriteCanvas.createWithTexture = function (texture, rect, offset) {
    var argnum = arguments.length;
    var sprite = new cc.SpriteCanvas();
    switch (argnum) {
        case 1:
            /** Creates an sprite with a texture.
             The rect used will be the size of the texture.
             The offset will be (0,0).
             */
            if (sprite && sprite.initWithTexture(texture)) {
                return sprite;
            }
            return null;
            break;

        case 2:
            /** Creates an sprite with a texture and a rect.
             The offset will be (0,0).
             */
            if (sprite && sprite.initWithTexture(texture, rect)) {
                return sprite;
            }
            return null;
            break;

        case 3:
            /** Creates an sprite with a texture, a rect and offset. */
                // not implement
            cc.Assert(0, "");
            return null;
            break;

        default:
            throw "Sprite.createWithTexture(): Argument must be non-nil ";
            break;
    }
};

/**
 * Create a sprite with filename and rect
 * @constructs
 * @param {String} fileName  The string which indicates a path to image file, e.g., "scene1/monster.png".
 * @param {cc.Rect} rect  Only the contents inside rect of pszFileName's texture will be applied for this sprite.
 * @return {cc.Sprite} A valid sprite object
 * @example
 * //create a sprite with filename
 * var sprite1 = cc.Sprite.create("HelloHTML5World.png");
 *
 * //create a sprite with filename and rect
 * var sprite2 = cc.Sprite.create("HelloHTML5World.png",cc.rect(0,0,480,320));
 */
cc.SpriteCanvas.create = function (fileName, rect) {
    var argnum = arguments.length;
    var sprite = new cc.SpriteCanvas();
    if (argnum === 0) {
        if (sprite.init())
            return sprite;
    } else {
        if (sprite && sprite.init(fileName, rect))
            return sprite;
    }
    return null;
};

/**
 * Creates a sprite with a sprite frame name
 * @param {String} spriteFrameName name
 * @return {cc.Sprite} A valid sprite object
 * @example
 *
 * //create a sprite with a sprite frame
 * var sprite = cc.Sprite.createWithSpriteFrameName('grossini_dance_01.png');
 */
cc.SpriteCanvas.createWithSpriteFrameName = function (spriteFrameName) {
    var spriteFrame = null;
    if (typeof(spriteFrameName) == 'string') {
        spriteFrame = cc.SpriteFrameCache.getInstance().getSpriteFrame(spriteFrameName);
        if (!spriteFrame) {
            cc.log("Invalid spriteFrameName: " + spriteFrameName);
            return null;
        }
    } else {
        cc.log("Invalid argument. Expecting string.");
        return null;
    }
    var sprite = new cc.SpriteCanvas();
    if (sprite && sprite.initWithSpriteFrame(spriteFrame)) {
        return sprite;
    }
    return null;
};

/**
 * Creates a sprite with a sprite frame.
 * @param {cc.SpriteFrame} spriteFrame A sprite frame which involves a texture and a rect
 * @return {cc.Sprite} A valid sprite object
 * @example
 * //get a sprite frame
 * var spriteFrame = cc.SpriteFrameCache.getInstance().getSpriteFrame("grossini_dance_01.png");
 *
 * //create a sprite with a sprite frame
 * var sprite = cc.Sprite.createWithSpriteFrame(spriteFrame);
 */
cc.SpriteCanvas.createWithSpriteFrame = function (spriteFrame) {
    var sprite = new cc.SpriteCanvas();
    if (sprite && sprite.initWithSpriteFrame(spriteFrame)) {
        return sprite;
    }
    return null;
};

/**
 * <p>cc.Sprite is a 2d image ( http://en.wikipedia.org/wiki/Sprite_(computer_graphics) ) (WebGL implement) <br/>
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
 * @example
 * var aSprite = new cc.Sprite();
 * aSprite.initWithFile("HelloHTML5World.png",cc.rect(0,0,480,320));
 */
cc.SpriteWebGL = cc.NodeRGBA.extend(/** @lends cc.SpriteWebGL# */{
    /// ---- common properties start ----
    RGBAProtocol:true,
    //
    // Data used when the sprite is rendered using a CCSpriteSheet
    //
    _textureAtlas:null,                                      //cc.SpriteBatchNode texture atlas

    _atlasIndex:0,
    _batchNode:null,
    _dirty:false,                                            //Whether the sprite needs to be updated
    _recursiveDirty:null,                                   //Whether all of the sprite's children needs to be updated
    _hasChildren:null,                                      //Whether the sprite contains children
    _shouldBeHidden:false,                                  //should not be drawn because one of the ancestors is not visible
    _transformToBatch:null,

    //
    // Data used when the sprite is self-rendered
    //
    _blendFunc:null,                                         //It's required for CCTextureProtocol inheritance
    _texture:null,                                           //cc.Texture2D object that is used to render the sprite

    //
    // Shared data
    //
    // texture
    _rect:cc.rect(0, 0, 0, 0),                               //Retangle of cc.Texture2D
    _rectRotated:false,                                      //Whether the texture is rotated

    // Offset Position (used by Zwoptex)
    _offsetPosition:null, // absolute
    _unflippedOffsetPositionFromCenter:null,

    // opacity and RGB protocol
    _opacityModifyRGB:false,

    // image is flipped
    _flipX:false,                                           //Whether the sprite is flipped horizontally or not.
    _flipY:false,                                           //Whether the sprite is flipped vertically or not.

    /**
     * Whether or not the Sprite needs to be updated in the Atlas
     * @return {Boolean} true if the sprite needs to be updated in the Atlas, false otherwise.
     */
    isDirty:function () {
        return this._dirty;
    },

    /**
     * Makes the Sprite to be updated in the Atlas.
     * @param {Boolean} bDirty
     */
    setDirty:function (bDirty) {
        this._dirty = bDirty;
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
        return this._atlasIndex;
    },

    /**
     * Set the index used on the TextureAtlas.
     * @warning Don't modify this value unless you know what you are doing
     * @param {Number} atlasIndex
     */
    setAtlasIndex:function (atlasIndex) {
        this._atlasIndex = atlasIndex;
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
        return this._textureAtlas;
    },

    /**
     * Sets the weak reference of the cc.TextureAtlas when the sprite is rendered using via cc.SpriteBatchNode
     * @param {cc.TextureAtlas} textureAtlas
     */
    setTextureAtlas:function (textureAtlas) {
        this._textureAtlas = textureAtlas;
    },

    /**
     * return the SpriteBatchNode of the cc.Sprite
     * @return {cc.SpriteBatchNode}
     */
    getSpriteBatchNode:function () {
        return this._batchNode;
    },

    /**
     * set the SpriteBatchNode of the cc.Sprite
     * @param {cc.SpriteBatchNode} spriteBatchNode
     */
    setSpriteBatchNode:function (spriteBatchNode) {
        this._batchNode = spriteBatchNode;
    },

    /**
     * Gets the offset position of the sprite. Calculated automatically by editors like Zwoptex.
     * @return {cc.Point}
     */
    getOffsetPosition:function () {
        return cc.p(this._offsetPosition.x, this._offsetPosition.y);
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
     * var spriteFrame = cc.SpriteFrameCache.getInstance().getSpriteFrame("grossini_dance_01.png");
     * var sprite = new cc.Sprite();
     * sprite.initWithSpriteFrame(spriteFrame);
     */
    initWithSpriteFrame:function (spriteFrame) {
        cc.Assert(spriteFrame != null, "");
        var ret = this.initWithTexture(spriteFrame.getTexture(), spriteFrame.getRect());
        this.setDisplayFrame(spriteFrame);

        return ret;
    },

    /**
     * Initializes a sprite with a sprite frame name. <br/>
     * A cc.SpriteFrame will be fetched from the cc.SpriteFrameCache by name.  <br/>
     * If the cc.SpriteFrame doesn't exist it will raise an exception. <br/>
     * @param {String} spriteFrameName A key string that can fected a volid CCSpriteFrame from CCSpriteFrameCache
     * @return {Boolean} true if the sprite is initialized properly, false otherwise.
     * @example
     * var sprite = new cc.Sprite();
     * sprite.initWithSpriteFrameName("grossini_dance_01.png");
     */
    initWithSpriteFrameName:function (spriteFrameName) {
        cc.Assert(spriteFrameName != null, "");
        var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(spriteFrameName);
        return this.initWithSpriteFrame(frame);
    },

    /**
     * tell the sprite to use batch node render.
     * @param {cc.SpriteBatchNode} batchNode
     */
    useBatchNode:function (batchNode) {
        this._textureAtlas = batchNode.getTextureAtlas(); // weak ref
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
     * @param rect
     */
    setVertexRect:function (rect) {
        this._rect = rect;
    },

    sortAllChildren:function () {
        if (this._reorderChildDirty) {
            var j, tempItem, locChildren = this._children;
            for (var i = 1; i < locChildren.length; i++) {
                tempItem = locChildren[i];
                j = i - 1;

                //continue moving element downwards while zOrder is smaller or when zOrder is the same but orderOfArrival is smaller
                while (j >= 0 && ( tempItem.getZOrder() < locChildren[j].getZOrder() || ( tempItem.getZOrder() === locChildren[j].getZOrder()
                    && tempItem.getOrderOfArrival() < locChildren[j].getOrderOfArrival() ) )) {
                    locChildren[j + 1] = locChildren[j];
                    j = j - 1;
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
        cc.Assert(child != null, "child is null");
        cc.Assert(this._children.indexOf(child) > -1, "this child is not in children list");

        if (zOrder === child.getZOrder())
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
        var locChildren = this._children;
        if (this._batchNode && locChildren != null) {
            for (var i = 0; i < locChildren.length; i++)
                this._batchNode.removeSpriteFromAtlas(locChildren[i]);
        }

        cc.Node.prototype.removeAllChildren.call(this, cleanup);
        this._hasChildren = false;
    },

    //
    // cc.Node property overloads
    //

    /**
     * set Recursively is or isn't Dirty
     * used only when parent is CCSpriteBatchNode
     * @param {Boolean} value
     */
    setDirtyRecursively:function (value) {
        this._recursiveDirty = value;
        this.setDirty(value);
        // recursively set dirty
        var locChildren = this._children;
        if (locChildren != null) {
            for (var i = 0; i < locChildren.length; i++) {
                if (locChildren[i] instanceof cc.Sprite)
                    locChildren[i].setDirtyRecursively(true);
            }
        }
    },

    /**
     * HACK: optimization
     */
    SET_DIRTY_RECURSIVELY:function () {
        if (this._batchNode && !this._recursiveDirty) {
            this._recursiveDirty = true;
            this._dirty = true;
            if (this._hasChildren)
                this.setDirtyRecursively(true);
        }
    },

    /**
     * position setter (override cc.Node )
     * @param {cc.Point} pos
     * @override
     */
    setPosition:function (pos) {
        if (arguments.length >= 2)
            cc.Node.prototype.setPosition.call(this, pos, arguments[1]);
        else
            cc.Node.prototype.setPosition.call(this, pos);
        this.SET_DIRTY_RECURSIVELY();
    },

    /**
     * Rotation setter (override cc.Node )
     * @param {Number} rotation
     * @override
     */
    setRotation:function (rotation) {
        cc.Node.prototype.setRotation.call(this, rotation);
        this.SET_DIRTY_RECURSIVELY();
    },

    setRotationX:function (rotationX) {
        cc.Node.prototype.setRotationX.call(this, rotationX);
        this.SET_DIRTY_RECURSIVELY();
    },

    setRotationY:function (rotationY) {
        cc.Node.prototype.setRotationY.call(this, rotationY);
        this.SET_DIRTY_RECURSIVELY();
    },

    /**
     * SkewX setter (override cc.Node )
     * @param {Number} sx SkewX value
     * @override
     */
    setSkewX:function (sx) {
        cc.Node.prototype.setSkewX.call(this, sx);
        this.SET_DIRTY_RECURSIVELY();
    },

    /**
     * SkewY setter (override cc.Node )
     * @param {Number} sy SkewY value
     * @override
     */
    setSkewY:function (sy) {
        cc.Node.prototype.setSkewY.call(this, sy);
        this.SET_DIRTY_RECURSIVELY();
    },

    /**
     * ScaleX setter (override cc.Node )
     * @param {Number} scaleX
     * @override
     */
    setScaleX:function (scaleX) {
        cc.Node.prototype.setScaleX.call(this, scaleX);
        this.SET_DIRTY_RECURSIVELY();
    },

    /**
     * ScaleY setter (override cc.Node )
     * @param {Number} scaleY
     * @override
     */
    setScaleY:function (scaleY) {
        cc.Node.prototype.setScaleY.call(this, scaleY);
        this.SET_DIRTY_RECURSIVELY();
    },

    /**
     * <p>The scale factor of the node. 1.0 is the default scale factor. <br/>
     * It modifies the X and Y scale at the same time. (override cc.Node ) <p/>
     * @param {Number} scale
     * @param {Number|null} scaleY
     * @override
     */
    setScale:function (scale, scaleY) {
        cc.Node.prototype.setScale.call(this, scale, scaleY);
        this.SET_DIRTY_RECURSIVELY();
    },

    /**
     * VertexZ setter (override cc.Node )
     * @param {Number} vertexZ
     * @override
     */
    setVertexZ:function (vertexZ) {
        cc.Node.prototype.setVertexZ.call(this, vertexZ);
        this.SET_DIRTY_RECURSIVELY();
    },

    /**
     * AnchorPoint setter  (override cc.Node )
     * @param {cc.Point} anchor
     * @override
     */
    setAnchorPoint:function (anchor) {
        cc.Node.prototype.setAnchorPoint.call(this, anchor);
        this.SET_DIRTY_RECURSIVELY();
    },

    /**
     * visible setter  (override cc.Node )
     * @param {Boolean} visible
     * @override
     */
    setVisible:function (visible) {
        cc.Node.prototype.setVisible.call(this, visible);
        this.SET_DIRTY_RECURSIVELY();
    },

    /**
     * IsRelativeAnchorPoint setter  (override cc.Node )
     * @param {Boolean} relative
     * @override
     */
    ignoreAnchorPointForPosition:function (relative) {
        cc.Assert(!this._batchNode, "ignoreAnchorPointForPosition is invalid in cc.Sprite");
        cc.Node.prototype.ignoreAnchorPointForPosition.call(this,relative);
    },

    /**
     * Sets whether the sprite should be flipped horizontally or not.
     * @param {Boolean} flipX true if the sprite should be flipped horizaontally, false otherwise.
     */
    setFlipX:function (flipX) {
        if (this._flipX != flipX) {
            this._flipX = flipX;
            this.setTextureRect(this._rect, this._rectRotated, this._contentSize);
            this.setNodeDirty();
        }
    },

    /**
     * FlipY value setter  (override cc.Node )
     * @param {Boolean} flipY
     */
    setFlipY:function (flipY) {
        if (this._flipY != flipY) {
            this._flipY = flipY;
            this.setTextureRect(this._rect, this._rectRotated, this._contentSize);
            this.setNodeDirty();
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
        return this._flipX;
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
        return this._flipY;
    },

    //
    // RGBA protocol
    //

    // RGBAProtocol
    /**
     * opacity: conforms to CCRGBAProtocol protocol
     * @param {Boolean} modify
     */
    setOpacityModifyRGB:function (modify) {
        if (this._opacityModifyRGB !== modify) {
            this._opacityModifyRGB = modify;
            this.updateColor();
        }
    },

    /**
     * return IsOpacityModifyRGB value
     * @return {Boolean}
     */
    isOpacityModifyRGB:function () {
        return this._opacityModifyRGB;
    },

    updateDisplayedOpacity:function(parentOpacity){
        cc.NodeRGBA.prototype.updateDisplayedOpacity.call(this, parentOpacity);
        this.updateColor();
    },

    // Animation

    /**
     * changes the display frame with animation name and index.<br/>
     * The animation name will be get from the CCAnimationCache
     * @param animationName
     * @param frameIndex
     */
    setDisplayFrameWithAnimationName:function (animationName, frameIndex) {
        cc.Assert(animationName, "cc.Sprite#setDisplayFrameWithAnimationName. animationName must not be null");
        var cache = cc.AnimationCache.getInstance().getAnimation(animationName);
        cc.Assert(cache, "cc.Sprite#setDisplayFrameWithAnimationName: Frame not found");
        var animFrame = cache.getFrames()[frameIndex];
        cc.Assert(animFrame, "cc.Sprite#setDisplayFrame. Invalid frame");
        this.setDisplayFrame(animFrame.getSpriteFrame());
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
                pNode = pNode.getParent();
            }
        }
    },

    // CCTextureProtocol
    getTexture:function () {
        return this._texture;
    },
    /// ---- common properties end   ----

    _quad:null,              // vertex coords, texture coords and color info
    _quadWebBuffer:null,
    _quadDirty:false,

    /**
     * Constructor
     * @param {String|cc.SpriteFrame|cc.SpriteBatchNode|HTMLImageElement|cc.Texture2D} fileName sprite construct parameter
     */
    ctor:function (fileName) {
        cc.NodeRGBA.prototype.ctor.call(this);
        this._shouldBeHidden = false;
        this._offsetPosition = cc.p(0, 0);
        this._unflippedOffsetPositionFromCenter = cc.p(0, 0);
        this._blendFunc = {src:cc.BLEND_SRC, dst:cc.BLEND_DST};

        this._quad = new cc.V3F_C4B_T2F_Quad();
        this._quadWebBuffer = cc.renderContext.createBuffer();
        this._quadDirty = true;

        if (fileName) {
            if (typeof(fileName) == "string") {
                var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(fileName);
                this.initWithSpriteFrame(frame);
            } else if (typeof(fileName) == "object") {
                if (fileName instanceof cc.SpriteFrame) {
                    this.initWithSpriteFrame(fileName);
                } else if (fileName instanceof cc.SpriteBatchNode) {
                    if (arguments.length > 1) {
                        var rect = arguments[1];
                        if (rect instanceof cc.Rect)
                            this.initWithBatchNode(fileName, rect);
                    }
                } else if ((fileName instanceof HTMLImageElement) || (fileName instanceof HTMLCanvasElement)) {
                    var texture2d = new cc.Texture2D();
                    texture2d.initWithElement(fileName);
                    texture2d.handleLoadedTexture();
                    this.initWithTexture(texture2d)
                } else if (fileName instanceof cc.Texture2D) {
                    this.initWithTexture(fileName)
                }
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
     * @param {Number|cc.BlendFunc} src
     * @param {Number} dst
     */
    setBlendFunc:function (src, dst) {
        if (arguments.length == 1)
            this._blendFunc = src;
        else
            this._blendFunc = {src:src, dst:dst};
    },

    /**
     * Initializes an empty sprite with nothing init.
     * @return {Boolean}
     */
    init:function () {
        if(arguments.length > 0)
            return this.initWithFile(arguments[0], arguments[1]);

        cc.NodeRGBA.prototype.init.call(this);
        this._dirty = this._recursiveDirty = false;
        this._opacityModifyRGB = true;

        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;

        // update texture (calls _updateBlendFunc)
        this.setTexture(null);

        this._flipX = this._flipY = false;

        // default transform anchor: center
        this.setAnchorPoint(cc.p(0.5, 0.5));

        // zwoptex default values
        this._offsetPosition = cc.PointZero();
        this._hasChildren = false;

        // Atlas: Color
        var tempColor = {r:255, g:255, b:255, a:255};
        this._quad.bl.colors = tempColor;
        this._quad.br.colors = tempColor;
        this._quad.tl.colors = tempColor;
        this._quad.tr.colors = tempColor;
        this._quadDirty = true;

        // updated in "useSelfRender"
        // Atlas: TexCoords
        this.setTextureRect(cc.RectZero(), false, cc.SizeZero());
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
        cc.Assert(filename != null, "Sprite#initWithFile():Invalid filename for sprite");
        var selfPointer = this;

        var texture = cc.TextureCache.getInstance().textureForKey(filename);
        if (!texture) {
            this._visible = false;
            var loadImg = new Image();
            loadImg.addEventListener("load", function () {
                if (!rect) {
                    rect = cc.rect(0, 0, loadImg.width, loadImg.height);
                }
                var texture2d = new cc.Texture2D();
                texture2d.initWithElement(loadImg);
                texture2d.handleLoadedTexture();
                selfPointer.initWithTexture(texture2d, rect);
                cc.TextureCache.getInstance().cacheImage(filename, loadImg);
                selfPointer._visible = true;
            });
            loadImg.addEventListener("error", function () {
                cc.log("load failure:" + filename);
            });
            loadImg.src = filename;
            return true;
        } else {
            if (texture) {
                if (!rect) {
                    var size = texture.getContentSize();
                    rect = cc.rect(0, 0, size.width, size.height);
                }
                return this.initWithTexture(texture, rect);
            }
        }
        return false;
    },

    /**
     * Initializes a sprite with a texture. <br/>
     * After initialization, the rect used will be the size of the texture, and the offset will be (0,0).
     * @param {cc.Texture2D|HTMLImageElement|HTMLCanvasElement} texture A pointer to an existing CCTexture2D object. You can use a CCTexture2D object for many sprites.
     * @param {cc.Rect} rect Only the contents inside rect of this texture will be applied for this sprite.
     * @param {Boolean} rotated Whether or not the texture rectangle is rotated.
     * @return {Boolean} true if the sprite is initialized properly, false otherwise.
     * @example
     * var img =cc.TextureCache.getInstance().addImage("HelloHTML5World.png");
     * var mySprite = new cc.Sprite();
     * mySprite.initWithTexture(img,cc.rect(0,0,480,320));
     */
    initWithTexture:function (texture, rect, rotated) {
        var argnum = arguments.length;
        if (argnum == 0)
            throw "Sprite.initWithTexture(): Argument must be non-nil ";

        rotated = rotated || false;

        if(!cc.NodeRGBA.prototype.init.call(this))
            return false;

        this._batchNode = null;
        this._recursiveDirty = false;
        this._dirty = false;
        this._opacityModifyRGB = true;

        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;

        this._flipX = this._flipY = false;

        // default transform anchor: center
        this.setAnchorPoint(cc.p(0.5, 0.5));

        // zwoptex default values
        this._offsetPosition = cc.p(0, 0);
        this._hasChildren = false;

        // Atlas: Color
        var tmpColor = new cc.Color4B(255, 255, 255, 255);
        this._quad.bl.colors = tmpColor;
        this._quad.br.colors = tmpColor;
        this._quad.tl.colors = tmpColor;
        this._quad.tr.colors = tmpColor;

        if (!rect) {
            rect = cc.rect(0, 0, 0, 0);
            rect.size = texture.getContentSize();
        }
        this.setTexture(texture);
        this.setTextureRect(rect, rotated, rect.size);

        // by default use "Self Render".
        // if the sprite is added to a batchnode, then it will automatically switch to "batchnode Render"
        this.setBatchNode(null);
        this._quadDirty = true;
        return true;
    },
    /**
     * updates the texture rect of the CCSprite in points.
     * @param {cc.Rect} rect a rect of texture
     * @param {Boolean} rotated
     * @param {cc.Size} untrimmedSize
     */
    setTextureRect:function (rect, rotated, untrimmedSize) {
        this._rectRotated = rotated || false;
        untrimmedSize = untrimmedSize || rect.size;

        this.setContentSize(untrimmedSize);
        this.setVertexRect(rect);
        this._setTextureCoords(rect);

        var relativeOffset = this._unflippedOffsetPositionFromCenter;
        if (this._flipX)
            relativeOffset.x = -relativeOffset.x;
        if (this._flipY)
            relativeOffset.y = -relativeOffset.y;

        this._offsetPosition.x = relativeOffset.x + (this._contentSize.width - this._rect.width) / 2;
        this._offsetPosition.y = relativeOffset.y + (this._contentSize.height - this._rect.height) / 2;

        // rendering using batch node
        if (this._batchNode) {
            // update dirty_, don't update recursiveDirty_
            //this.setDirty(true);
            this._dirty = true;
        } else {
            // self rendering
            // Atlas: Vertex
            var x1 = 0 + this._offsetPosition.x;
            var y1 = 0 + this._offsetPosition.y;
            var x2 = x1 + this._rect.width;
            var y2 = y1 + this._rect.height;

            // Don't update Z.
            this._quad.bl.vertices = {x:x1, y:y1, z:0};
            this._quad.br.vertices = {x:x2, y:y1, z:0};
            this._quad.tl.vertices = {x:x1, y:y2, z:0};
            this._quad.tr.vertices = {x:x2, y:y2, z:0};

            this._quadDirty = true;
        }
    },

    // BatchNode methods
    /**
     * updates the quad according the the rotation, position, scale values.
     */
    updateTransform:function () {
        //cc.Assert(this._batchNode, "updateTransform is only valid when cc.Sprite is being rendered using an cc.SpriteBatchNode");

        // recaculate matrix only if it is dirty
        if (this.isDirty()) {
            // If it is not visible, or one of its ancestors is not visible, then do nothing:
            if (!this._visible || ( this._parent && this._parent != this._batchNode && this._parent._shouldBeHidden)) {
                this._quad.br.vertices = {x:0, y:0, z:0};
                this._quad.tl.vertices = {x:0, y:0, z:0};
                this._quad.tr.vertices = {x:0, y:0, z:0};
                this._quad.bl.vertices = {x:0, y:0, z:0};
                this._shouldBeHidden = true;
            } else {
                this._shouldBeHidden = false;

                if (!this._parent || this._parent == this._batchNode) {
                    this._transformToBatch = this.nodeToParentTransform();
                } else {
                    //cc.Assert(this._parent instanceof cc.Sprite, "Logic error in CCSprite. Parent must be a CCSprite");
                    this._transformToBatch = cc.AffineTransformConcat(this.nodeToParentTransform(), this._parent._transformToBatch);
                }

                //
                // calculate the Quad based on the Affine Matrix
                //
                var size = this._rect.size;
                var x1 = this._offsetPosition.x;
                var y1 = this._offsetPosition.y;

                var x2 = x1 + size.width;
                var y2 = y1 + size.height;
                var x = this._transformToBatch.tx;
                var y = this._transformToBatch.ty;

                var cr = this._transformToBatch.a;
                var sr = this._transformToBatch.b;
                var cr2 = this._transformToBatch.d;
                var sr2 = -this._transformToBatch.c;
                var ax = x1 * cr - y1 * sr2 + x;
                var ay = x1 * sr + y1 * cr2 + y;

                var bx = x2 * cr - y1 * sr2 + x;
                var by = x2 * sr + y1 * cr2 + y;

                var cx = x2 * cr - y2 * sr2 + x;
                var cy = x2 * sr + y2 * cr2 + y;

                var dx = x1 * cr - y2 * sr2 + x;
                var dy = x1 * sr + y2 * cr2 + y;

                this._quad.bl.vertices = {x:cc.RENDER_IN_SUBPIXEL(ax), y:cc.RENDER_IN_SUBPIXEL(ay), z:this._vertexZ};
                this._quad.br.vertices = {x:cc.RENDER_IN_SUBPIXEL(bx), y:cc.RENDER_IN_SUBPIXEL(by), z:this._vertexZ};
                this._quad.tl.vertices = {x:cc.RENDER_IN_SUBPIXEL(dx), y:cc.RENDER_IN_SUBPIXEL(dy), z:this._vertexZ};
                this._quad.tr.vertices = {x:cc.RENDER_IN_SUBPIXEL(cx), y:cc.RENDER_IN_SUBPIXEL(cy), z:this._vertexZ};
            }
            if (cc.renderContextType === cc.WEBGL)
                this._textureAtlas.updateQuad(this._quad, this._atlasIndex);
            this._recursiveDirty = false;
            this.setDirty(false);
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
            cc.drawingUtil.drawPoly(vertices, 4, true);
        }
    },

    /**
     * Add child to sprite (override cc.Node )
     * @param {cc.Sprite} child
     * @param {Number} zOrder  child's zOrder
     * @param {String} tag child's tag
     * @override
     */
    addChild:function (child, zOrder, tag) {
        cc.Assert(child != null, "Argument must be non-NULL");
        if (zOrder == null)
            zOrder = child._zOrder;
        if (tag == null)
            tag = child._tag;

        if (this._batchNode) {
            cc.Assert((child instanceof cc.Sprite), "cc.Sprite only supports cc.Sprites as children when using cc.SpriteBatchNode");
            cc.Assert(child.getTexture()._webTextureObj === this._textureAtlas.getTexture()._webTextureObj, "");

            //put it in descendants array of batch node
            this._batchNode.appendChild(child);
            if (!this._reorderChildDirty)
                this._setReorderChildDirtyRecursively();
        }

        //cc.Node already sets isReorderChildDirty_ so this needs to be after batchNode check
        cc.Node.prototype.addChild.call(this, child, zOrder, tag);
        this._hasChildren = true;
    },
    /**
     * Update sprite's color
     */
    updateColor:function () {
        var color4 = {r:this._displayedColor.r, g:this._displayedColor.g, b:this._displayedColor.b, a:this._displayedOpacity};
        // special opacity for premultiplied textures
        if (this._opacityModifyRGB)
        {
            color4.r *= this._displayedOpacity/255.0;
            color4.g *= this._displayedOpacity/255.0;
            color4.b *= this._displayedOpacity/255.0;
        }
        this._quad.bl.colors = color4;
        this._quad.br.colors = color4;
        this._quad.tl.colors = color4;
        this._quad.tr.colors = color4;

        // renders using Sprite Manager
        if (this._batchNode) {
            if (this._atlasIndex != cc.SPRITE_INDEX_NOT_INITIALIZED) {
                this._textureAtlas.updateQuad(this._quad, this._atlasIndex)
            } else {
                // no need to set it recursively
                // update dirty_, don't update recursiveDirty_
                //this.setDirty(true);
                this._dirty = true;
            }
        }
        // self render
        // do nothing
        this._quadDirty = true;
    },

    /**
     * opacity setter
     * @param {Number} opacity
     */
    setOpacity:function (opacity) {
        cc.NodeRGBA.prototype.setOpacity.call(this, opacity);
        this.updateColor();
    },

    /**
     * color setter
     * @param {cc.Color3B} color3
     */
    setColor:function (color3) {
        cc.NodeRGBA.prototype.setColor.call(this, color3);
        this.updateColor();
    },

    updateDisplayedColor:function(parentColor){
        cc.NodeRGBA.prototype.updateDisplayedColor.call(this, parentColor);
        this.updateColor();
    },

    // Frames
    /**
     * Sets a new display frame to the cc.Sprite.
     * @param {cc.SpriteFrame} newFrame
     */
    setDisplayFrame:function (newFrame) {
        this.setNodeDirty();
        this._unflippedOffsetPositionFromCenter = newFrame.getOffset();
        var pNewTexture = newFrame.getTexture();
        // update texture before updating texture rect
        if (pNewTexture != this._texture)
            this.setTexture(pNewTexture);

        // update rect
        this._rectRotated = newFrame.isRotated();
        this.setTextureRect(newFrame.getRect(), this._rectRotated, newFrame.getOriginalSize());
    },

    /**
     * Returns whether or not a cc.SpriteFrame is being displayed
     * @param {cc.SpriteFrame} frame
     * @return {Boolean}
     */
    isFrameDisplayed:function (frame) {
        return (cc.rectEqualToRect(frame.getRect(), this._rect) && frame.getTexture().getName() == this._texture.getName()
            && cc.pointEqualToPoint(frame.getOffset(), this._unflippedOffsetPositionFromCenter));
    },

    /**
     * Returns the current displayed frame.
     * @return {cc.SpriteFrame}
     */
    displayFrame:function () {
        return cc.SpriteFrame.createWithTexture(this._texture,
            cc.RECT_POINTS_TO_PIXELS(this._rect),
            this._rectRotated,
            this._unflippedOffsetPositionFromCenter,
            cc.SIZE_POINTS_TO_PIXELS(this._contentSize));
    },

    /**
     * Sets the batch node to sprite
     * @param {cc.SpriteBatchNode|null} spriteBatchNode
     * @example
     *  var batch = cc.SpriteBatchNode.create("Images/grossini_dance_atlas.png", 15);
     *  var sprite = cc.Sprite.createWithTexture(batch.getTexture(), cc.RectMake(0, 0, 57, 57));
     *  batch.addChild(sprite);
     *  layer.addChild(batch);
     */
    setBatchNode:function (spriteBatchNode) {
        this._batchNode = spriteBatchNode; // weak reference

        // self render
        if (!this._batchNode) {
            this._atlasIndex = cc.SPRITE_INDEX_NOT_INITIALIZED;
            this.setTextureAtlas(null);
            this._recursiveDirty = false;
            this.setDirty(false);

            var x1 = this._offsetPosition.x;
            var y1 = this._offsetPosition.y;
            var x2 = x1 + this._rect.width;
            var y2 = y1 + this._rect.height;
            this._quad.bl.vertices = {x:x1, y:y1, z:0};
            this._quad.br.vertices = {x:x2, y:y1, z:0};
            this._quad.tl.vertices = {x:x1, y:y2, z:0};
            this._quad.tr.vertices = {x:x2, y:y2, z:0};

            this._quadDirty = true;
        } else {
            // using batch
            this._transformToBatch = cc.AffineTransformIdentity();
            this.setTextureAtlas(this._batchNode.getTextureAtlas()); // weak ref
        }
    },

    // CCTextureProtocol
    /**
     * Texture of sprite setter
     * @param {HTMLImageElement|HTMLCanvasElement|cc.Texture2D} texture
     */
    setTexture:function (texture) {
        // CCSprite: setTexture doesn't work when the sprite is rendered using a CCSpriteSheet
        cc.Assert(!texture || texture instanceof cc.Texture2D, "setTexture expects a CCTexture2D. Invalid argument");

        // If batchnode, then texture id should be the same
        cc.Assert(!this._batchNode, "cc.Sprite: Batched sprites should use the same texture as the batchnode");

        if(texture)
            this.setShaderProgram(cc.ShaderCache.getInstance().programForKey(cc.SHADER_POSITION_TEXTURECOLOR));
        else
            this.setShaderProgram(cc.ShaderCache.getInstance().programForKey(cc.SHADER_POSITION_COLOR));

        if (!this._batchNode && this._texture != texture) {
            this._texture = texture;
            this._updateBlendFunc();
        }
    },

    // Texture protocol
    _updateBlendFunc:function () {
        cc.Assert(!this._batchNode, "cc.Sprite: _updateBlendFunc doesn't work when the sprite is rendered using a cc.CCSpriteBatchNode");
        // it's possible to have an untextured sprite
        if (!this._texture || !this._texture.hasPremultipliedAlpha()) {
            this._blendFunc.src = gl.SRC_ALPHA;
            this._blendFunc.dst = gl.ONE_MINUS_SRC_ALPHA;
            this.setOpacityModifyRGB(false);
        } else {
            this._blendFunc.src = cc.BLEND_SRC;
            this._blendFunc.dst = cc.BLEND_DST;
            this.setOpacityModifyRGB(true);
        }
    },

    _setTextureCoords:function (rect) {
        rect = cc.RECT_POINTS_TO_PIXELS(rect);

        var tex = this._batchNode ? this._textureAtlas.getTexture() : this._texture;
        if (!tex)
            return;

        var atlasWidth = tex.getPixelsWide();
        var atlasHeight = tex.getPixelsHigh();

        var left, right, top, bottom, tempSwap;
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

            if (this._flipX) {
                tempSwap = top;
                top = bottom;
                bottom = tempSwap;
            }

            if (this._flipY) {
                tempSwap = left;
                left = right;
                right = tempSwap;
            }

            this._quad.bl.texCoords.u = left;
            this._quad.bl.texCoords.v = top;
            this._quad.br.texCoords.u = left;
            this._quad.br.texCoords.v = bottom;
            this._quad.tl.texCoords.u = right;
            this._quad.tl.texCoords.v = top;
            this._quad.tr.texCoords.u = right;
            this._quad.tr.texCoords.v = bottom;
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

            if (this._flipX) {
                tempSwap = left;
                left = right;
                right = tempSwap;
            }

            if (this._flipY) {
                tempSwap = top;
                top = bottom;
                bottom = tempSwap;
            }

            this._quad.bl.texCoords.u = left;
            this._quad.bl.texCoords.v = bottom;
            this._quad.br.texCoords.u = right;
            this._quad.br.texCoords.v = bottom;
            this._quad.tl.texCoords.u = left;
            this._quad.tl.texCoords.v = top;
            this._quad.tr.texCoords.u = right;
            this._quad.tr.texCoords.v = top;
        }
        this._quadDirty = true;
    },
    /**
     * draw sprite to canvas
     */
    draw:function () {
        var gl = cc.renderContext, locTexture = this._texture;
        //cc.Assert(!this._batchNode, "If cc.Sprite is being rendered by cc.SpriteBatchNode, cc.Sprite#draw SHOULD NOT be called");

        if (locTexture) {
            if(locTexture._isLoaded){
                this._shaderProgram.use();
                this._shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4();

                cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);
                //optimize performance for javascript
                cc.glBindTexture2DN(0, locTexture);                   // = cc.glBindTexture2D(locTexture);
                cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSCOLORTEX);

                gl.bindBuffer(gl.ARRAY_BUFFER, this._quadWebBuffer);
                if(this._quadDirty){
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
            if(this._quadDirty){
                cc.renderContext.bufferData(cc.renderContext.ARRAY_BUFFER, this._quad.arrayBuffer, cc.renderContext.STATIC_DRAW);
                this._quadDirty = false;
            }
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0);
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        cc.g_NumberOfDraws++;
        if(cc.SPRITE_DEBUG_DRAW === 0)
            return;

        if (cc.SPRITE_DEBUG_DRAW === 1) {
            // draw bounding box
            var verticesG1 = [
                cc.p(this._quad.tl.vertices.x, this._quad.tl.vertices.y),
                cc.p(this._quad.bl.vertices.x, this._quad.bl.vertices.y),
                cc.p(this._quad.br.vertices.x, this._quad.br.vertices.y),
                cc.p(this._quad.tr.vertices.x, this._quad.tr.vertices.y)
            ];
            cc.drawingUtil.drawPoly(verticesG1, 4, true);
        } else if (cc.SPRITE_DEBUG_DRAW === 2) {
            // draw texture box
            var drawSizeG2 = this.getTextureRect().size;
            var offsetPixG2 = this.getOffsetPosition();
            var verticesG2 = [cc.p(offsetPixG2.x, offsetPixG2.y), cc.p(offsetPixG2.x + drawSizeG2.width, offsetPixG2.y),
                cc.p(offsetPixG2.x + drawSizeG2.width, offsetPixG2.y + drawSizeG2.height), cc.p(offsetPixG2.x, offsetPixG2.y + drawSizeG2.height)];
            cc.drawingUtil.drawPoly(verticesG2, 4, true);
        } // CC_SPRITE_DEBUG_DRAW
    }
});

/**
 * <p>
 *     Creates a sprite with an exsiting texture contained in a CCTexture2D object                           <br/>
 *     After creation, the rect will be the size of the texture, and the offset will be (0,0).
 * </p>
 * @constructs
 * @param {cc.Texture2D} texture  A pointer to an existing CCTexture2D object. You can use a CCTexture2D object for many sprites.
 * @param {cc.Rect} rect Only the contents inside the rect of this texture will be applied for this sprite.
 * @param {cc.Point} offset offset of the texture
 * @return {cc.Sprite} A valid sprite object
 * @example
 * //get an image
 * var img = cc.TextureCache.getInstance().addImage("HelloHTML5World.png");
 *
 * //create a sprite with texture
 * var sprite1 = cc.Sprite.createWithTexture(img);
 *
 * //create a sprite with texture and rect
 * var sprite2 = cc.Sprite.createWithTexture(img, cc.rect(0,0,480,320));
 *
 * //create a sprite with texture and rect and offset
 * var sprite3 = cc.Sprite.createWithTexture(img, cc.rect(0,0,480,320),cc.p(0,0));
 */
cc.SpriteWebGL.createWithTexture = function (texture, rect, offset) {
    var argnum = arguments.length;
    var sprite = new cc.SpriteWebGL();
    switch (argnum) {
        case 1:
            /** Creates an sprite with a texture.
             The rect used will be the size of the texture.
             The offset will be (0,0).
             */
            if (sprite && sprite.initWithTexture(texture)) {
                return sprite;
            }
            return null;
            break;

        case 2:
            /** Creates an sprite with a texture and a rect.
             The offset will be (0,0).
             */
            if (sprite && sprite.initWithTexture(texture, rect)) {
                return sprite;
            }
            return null;
            break;

        case 3:
            /** Creates an sprite with a texture, a rect and offset. */
                // not implement
            cc.Assert(0, "");
            return null;
            break;

        default:
            throw "Sprite.createWithTexture(): Argument must be non-nil ";
            break;
    }
};

/**
 * Create a sprite with filename and rect
 * @constructs
 * @param {String} fileName  The string which indicates a path to image file, e.g., "scene1/monster.png".
 * @param {cc.Rect} rect  Only the contents inside rect of pszFileName's texture will be applied for this sprite.
 * @return {cc.Sprite} A valid sprite object
 * @example
 * //create a sprite with filename
 * var sprite1 = cc.Sprite.create("HelloHTML5World.png");
 *
 * //create a sprite with filename and rect
 * var sprite2 = cc.Sprite.create("HelloHTML5World.png",cc.rect(0,0,480,320));
 */
cc.SpriteWebGL.create = function (fileName, rect) {
    var argnum = arguments.length;
    var sprite = new cc.SpriteWebGL();
    if (argnum === 0) {
        if (sprite.init())
            return sprite;
    } else {
        /** Creates an sprite with an image filename.
         If the rect equal undefined, the rect used will be the size of the image.
         The offset will be (0,0).
         */
        if (sprite && sprite.init(fileName, rect))
            return sprite;
    }
    return null;
};

/**
 * <p>
 *     Creates a sprite with a sprite frame.                                                                  <br/>
 *                                                                                                            <br/>
 *    A CCSpriteFrame will be fetched from the CCSpriteFrameCache by pszSpriteFrameName param.                <br/>
 *    If the CCSpriteFrame doesn't exist it will raise an exception.
 * </p>
 * @param {String} spriteFrameName A sprite frame which involves a texture and a rect
 * @return {cc.Sprite} A valid sprite object
 * @example
 *
 * //create a sprite with a sprite frame
 * var sprite = cc.Sprite.createWithSpriteFrameName('grossini_dance_01.png');
 */
cc.SpriteWebGL.createWithSpriteFrameName = function (spriteFrameName) {
    var spriteFrame = null;
    if (typeof(spriteFrameName) == 'string') {
        spriteFrame = cc.SpriteFrameCache.getInstance().getSpriteFrame(spriteFrameName);
        if (!spriteFrame) {
            cc.log("Invalid spriteFrameName: " + spriteFrameName);
            return null;
        }
    } else {
        cc.log("Invalid argument. Expecting string.");
        return null;
    }
    var sprite = new cc.SpriteWebGL();
    if (sprite && sprite.initWithSpriteFrame(spriteFrame)) {
        return sprite;
    }
    return null;
};

/**
 * <p>
 *     Creates a sprite with a sprite frame.                                                                  <br/>
 *                                                                                                            <br/>
 *    A CCSpriteFrame will be fetched from the CCSpriteFrameCache by pszSpriteFrameName param.                <br/>
 *    If the CCSpriteFrame doesn't exist it will raise an exception.
 * </p>
 * @param {cc.SpriteFrame} spriteFrame A sprite frame which involves a texture and a rect
 * @return {cc.Sprite} A valid sprite object
 * @example
 * //get a sprite frame
 * var spriteFrame = cc.SpriteFrameCache.getInstance().getSpriteFrame("grossini_dance_01.png");
 *
 * //create a sprite with a sprite frame
 * var sprite = cc.Sprite.createWithSpriteFrame(spriteFrame);
 */
cc.SpriteWebGL.createWithSpriteFrame = function (spriteFrame) {
    var sprite = new cc.SpriteWebGL();
    if (sprite && sprite.initWithSpriteFrame(spriteFrame)) {
        return sprite;
    }
    return null;
};

cc.Sprite = cc.Browser.supportWebGL ? cc.SpriteWebGL : cc.SpriteCanvas;
