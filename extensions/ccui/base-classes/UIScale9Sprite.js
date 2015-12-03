/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.
 Copyright (c) 2012 Neofect. All rights reserved.

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

 Created by Jung Sang-Taik on 2012-03-16
 ****************************************************************************/

/**
 * <p>
 * A 9-slice sprite for cocos2d UI.                                                                    <br/>
 *                                                                                                     <br/>
 * 9-slice scaling allows you to specify how scaling is applied                                        <br/>
 * to specific areas of a sprite. With 9-slice scaling (3x3 grid),                                     <br/>
 * you can ensure that the sprite does not become distorted when                                       <br/>
 * scaled.                                                                                             <br/>
 * @note: it will refactor in v3.1                                                                    <br/>
 * @see http://yannickloriot.com/library/ios/cccontrolextension/Classes/CCScale9Sprite.html            <br/>
 * </p>
 * @class
 * @extends cc.Node
 *
 * @property {cc.Size}  preferredSize   - The preferred size of the 9-slice sprite
 * @property {cc.Rect}  capInsets       - The cap insets of the 9-slice sprite
 * @property {Number}   insetLeft       - The left inset of the 9-slice sprite
 * @property {Number}   insetTop        - The top inset of the 9-slice sprite
 * @property {Number}   insetRight      - The right inset of the 9-slice sprite
 * @property {Number}   insetBottom     - The bottom inset of the 9-slice sprite
 */

ccui.Scale9Sprite = cc.Scale9Sprite = cc.Node.extend(/** @lends ccui.Scale9Sprite# */{
    _spriteRect: null,
    _capInsetsInternal: null,
    _positionsAreDirty: false,

    _scale9Image: null,
    _topLeft: null,
    _top: null,
    _topRight: null,
    _left: null,
    _centre: null,
    _right: null,
    _bottomLeft: null,
    _bottom: null,
    _bottomRight: null,

    _scale9Enabled: true,
    _brightState: 0,
    _renderers: null,

    _opacityModifyRGB: false,

    _originalSize: null,
    _preferredSize: null,
    _opacity: 0,
    _color: null,
    _capInsets: null,
    _insetLeft: 0,
    _insetTop: 0,
    _insetRight: 0,
    _insetBottom: 0,

    _spritesGenerated: false,
    _spriteFrameRotated: false,
    _textureLoaded:false,
    _className:"Scale9Sprite",

    //v3.3
    _flippedX: false,
    _flippedY: false,

    /**
     * return  texture is loaded
     * @returns {boolean}
     */
    textureLoaded:function(){
        return this._textureLoaded;
    },

    /**
     * add texture loaded event listener
     * @param {Function} callback
     * @param {Object} target
     * @deprecated since 3.1, please use addEventListener instead
     */
    addLoadedEventListener:function(callback, target){
        this.addEventListener("load", callback, target);
    },

    _updateCapInset: function () {
        var insets, locInsetLeft = this._insetLeft, locInsetTop = this._insetTop, locInsetRight = this._insetRight;
        var locSpriteRect = this._spriteRect, locInsetBottom = this._insetBottom;
        if (locInsetLeft === 0 && locInsetTop === 0 && locInsetRight === 0 && locInsetBottom === 0) {
            insets = cc.rect(0, 0, 0, 0);
        } else {
            insets = this._spriteFrameRotated ? cc.rect(locInsetBottom, locInsetLeft,
                    locSpriteRect.width - locInsetRight - locInsetLeft,
                    locSpriteRect.height - locInsetTop - locInsetBottom) :
                cc.rect(locInsetLeft, locInsetTop,
                        locSpriteRect.width - locInsetLeft - locInsetRight,
                        locSpriteRect.height - locInsetTop - locInsetBottom);
        }
        this.setCapInsets(insets);
    },

    _updatePositions: function () {
        // Check that instances are non-NULL
        if (!((this._topLeft) && (this._topRight) && (this._bottomRight) &&
            (this._bottomLeft) && (this._centre))) {
            // if any of the above sprites are NULL, return
            return;
        }

        var size = this._contentSize;
        var locTopLeft = this._topLeft, locTopRight = this._topRight, locBottomRight = this._bottomRight, locBottomLeft = this._bottomLeft;
        var locLeft = this._left, locRight = this._right, locTop = this._top, locBottom = this._bottom;
        var locCenter = this._centre, locCenterContentSize = this._centre.getContentSize();
        var locTopLeftContentSize = locTopLeft.getContentSize();
        var locBottomLeftContentSize = locBottomLeft.getContentSize();

        var sizableWidth = size.width - locTopLeftContentSize.width - locTopRight.getContentSize().width;
        var sizableHeight = size.height - locTopLeftContentSize.height - locBottomRight.getContentSize().height;

        var horizontalScale = sizableWidth / locCenterContentSize.width;
        var verticalScale = sizableHeight / locCenterContentSize.height;

        var rescaledWidth = locCenterContentSize.width * horizontalScale;
        var rescaledHeight = locCenterContentSize.height * verticalScale;

        var leftWidth = locBottomLeftContentSize.width;
        var bottomHeight = locBottomLeftContentSize.height;
        var centerOffset = cc.p(this._offset.x * horizontalScale, this._offset.y*verticalScale);

        if (cc._renderType === cc.game.RENDER_TYPE_WEBGL) {
            //browser is in canvas mode, need to manually control rounding to prevent overlapping pixels
            var roundedRescaledWidth = Math.round(rescaledWidth);
            if (rescaledWidth !== roundedRescaledWidth) {
                rescaledWidth = roundedRescaledWidth;
                horizontalScale = rescaledWidth / locCenterContentSize.width;
            }
            var roundedRescaledHeight = Math.round(rescaledHeight);
            if (rescaledHeight !== roundedRescaledHeight) {
                rescaledHeight = roundedRescaledHeight;
                verticalScale = rescaledHeight / locCenterContentSize.height;
            }
        }

        locCenter.setScaleX(horizontalScale);
        locCenter.setScaleY(verticalScale);

        locBottomLeft.setAnchorPoint(1, 1);
        locBottomLeft.setPosition(leftWidth,bottomHeight);

        locBottomRight.setAnchorPoint(0, 1);
        locBottomRight.setPosition(leftWidth+rescaledWidth,bottomHeight);


        locTopLeft.setAnchorPoint(1, 0);
        locTopLeft.setPosition(leftWidth, bottomHeight+rescaledHeight);

        locTopRight.setAnchorPoint(0, 0);
        locTopRight.setPosition(leftWidth+rescaledWidth, bottomHeight+rescaledHeight);

        locLeft.setAnchorPoint(1, 0.5);
        locLeft.setPosition(leftWidth, bottomHeight+rescaledHeight/2 + centerOffset.y);
        locLeft.setScaleY(verticalScale);

        locRight.setAnchorPoint(0, 0.5);
        locRight.setPosition(leftWidth+rescaledWidth,bottomHeight+rescaledHeight/2 + centerOffset.y);
        locRight.setScaleY(verticalScale);

        locTop.setAnchorPoint(0.5, 0);
        locTop.setPosition(leftWidth+rescaledWidth/2 + centerOffset.x,bottomHeight+rescaledHeight);
        locTop.setScaleX(horizontalScale);

        locBottom.setAnchorPoint(0.5, 1);
        locBottom.setPosition(leftWidth+rescaledWidth/2 + centerOffset.x,bottomHeight);
        locBottom.setScaleX(horizontalScale);

        locCenter.setAnchorPoint(0.5, 0.5);
        locCenter.setPosition(leftWidth+rescaledWidth/2 + centerOffset.x, bottomHeight+rescaledHeight/2 + centerOffset.y);
        locCenter.setScaleX(horizontalScale);
        locCenter.setScaleY(verticalScale);
    },

    /**
     * Constructor function. override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     * @function
     * @param {string|cc.SpriteFrame} file file name of texture or a SpriteFrame
     * @param {cc.Rect} rect
     * @param {cc.Rect} capInsets
     * @returns {Scale9Sprite}
     */
    ctor: function (file, rect, capInsets) {
        cc.Node.prototype.ctor.call(this);
        this._spriteRect = cc.rect(0, 0, 0, 0);
        this._capInsetsInternal = cc.rect(0, 0, 0, 0);

        this._originalSize = cc.size(0, 0);
        this._preferredSize = cc.size(0, 0);
        this._capInsets = cc.rect(0, 0, 0, 0);
        this._renderers = [];

        if(file != undefined){
            if(file instanceof cc.SpriteFrame)
                this.initWithSpriteFrame(file, rect);
            else{
                var frame = cc.spriteFrameCache.getSpriteFrame(file);
                if(frame != null)
                    this.initWithSpriteFrame(frame, rect);
                else
                    this.initWithFile(file, rect, capInsets);
            }
        }else{
            this.init();
        }
    },

    getSprite: function () {
        return this._scale9Image;
    },

    /** Original sprite's size. */
    getOriginalSize: function () {
        return cc.size(this._originalSize);
    },

    //if the preferredSize component is given as -1, it is ignored
    getPreferredSize: function () {
        return cc.size(this._preferredSize);
    },
    _getPreferredWidth: function () {
        return this._preferredSize.width;
    },
    _getPreferredHeight: function () {
        return this._preferredSize.height;
    },
    setPreferredSize: function (preferredSize) {
        this.setContentSize(preferredSize);
        this._preferredSize = preferredSize;

        if (this._positionsAreDirty) {
            this._updatePositions();
            this._positionsAreDirty = false;
            this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.cacheDirty);
        }
    },
    _setPreferredWidth: function (value) {
        this._setWidth(value);
        this._preferredSize.width = value;
    },
    _setPreferredHeight: function (value) {
        this._setHeight(value);
        this._preferredSize.height = value;
    },

    /** Opacity: conforms to CCRGBAProtocol protocol */
    setOpacity: function (opacity) {
        cc.Node.prototype.setOpacity.call(this, opacity);
        if(this._scale9Enabled) {
            var pChildren = this._renderers;
            for(var i=0; i<pChildren.length; i++)
                pChildren[i].setOpacity(opacity);
        }
        else if(this._scale9Image)
            this._scale9Image.setOpacity(opacity);
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.cacheDirty);
    },

    /** Color: conforms to CCRGBAProtocol protocol */
    setColor: function (color) {
        cc.Node.prototype.setColor.call(this, color);
        if(this._scale9Enabled) {
            var scaleChildren = this._renderers;
            for (var i = 0; i < scaleChildren.length; i++) {
                var selChild = scaleChildren[i];
                if (selChild)
                    selChild.setColor(color);
            }
        }
        else if (this._scale9Image)
            this._scale9Image.setColor(color);
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.cacheDirty);
    },

    getCapInsets: function () {
        return cc.rect(this._capInsets);
    },

    setCapInsets: function (capInsets) {
        var contentSize = this._contentSize;
        var tempWidth = contentSize.width, tempHeight = contentSize.height;

        this.updateWithSprite(  this._scale9Image,
                                this._spriteRect,
                                this._spriteFrameRotated,
                                this._offset,
                                this._originalSize,
                                capInsets );
        this._insetLeft = capInsets.x;
        this._insetTop = capInsets.y;
        this._insetRight = this._originalSize.width - this._insetLeft - capInsets.width;
        this._insetBottom = this._originalSize.height - this._insetTop - capInsets.height;
        //restore the contentSize
        this.setContentSize(tempWidth, tempHeight);
    },

    /**
     * Gets the left side inset
     * @returns {number}
     */
    getInsetLeft: function () {
        return this._insetLeft;
    },

    /**
     * Sets the left side inset
     * @param {Number} insetLeft
     */
    setInsetLeft: function (insetLeft) {
        this._insetLeft = insetLeft;
        this._updateCapInset();
    },

    /**
     * Gets the top side inset
     * @returns {number}
     */
    getInsetTop: function () {
        return this._insetTop;
    },

    /**
     * Sets the top side inset
     * @param {Number} insetTop
     */
    setInsetTop: function (insetTop) {
        this._insetTop = insetTop;
        this._updateCapInset();
    },

    /**
     * Gets the right side inset
     * @returns {number}
     */
    getInsetRight: function () {
        return this._insetRight;
    },
    /**
     * Sets the right side inset
     * @param {Number} insetRight
     */
    setInsetRight: function (insetRight) {
        this._insetRight = insetRight;
        this._updateCapInset();
    },

    /**
     * Gets the bottom side inset
     * @returns {number}
     */
    getInsetBottom: function () {
        return this._insetBottom;
    },
    /**
     * Sets the bottom side inset
     * @param {number} insetBottom
     */
    setInsetBottom: function (insetBottom) {
        this._insetBottom = insetBottom;
        this._updateCapInset();
    },

    /**
     * Sets the untransformed size of the Scale9Sprite.
     * @override
     * @param {cc.Size|Number} size The untransformed size of the Scale9Sprite or The untransformed size's width of the Scale9Sprite.
     * @param {Number} [height] The untransformed size's height of the Scale9Sprite.
     */
    setContentSize: function (size, height) {
        cc.Node.prototype.setContentSize.call(this, size, height);
        this._positionsAreDirty = true;
    },

    setAnchorPoint: function (point, y) {
        cc.Node.prototype.setAnchorPoint.call(this, point, y);
        if(!this._scale9Enabled) {
            if(this._scale9Image) {
                this._scale9Image.setAnchorPoint(point, y);
                this._positionsAreDirty = true;
            }
        }
    },
    _setWidth: function (value) {
        cc.Node.prototype._setWidth.call(this, value);
        this._positionsAreDirty = true;
    },

    _setHeight: function (value) {
        cc.Node.prototype._setHeight.call(this, value);
        this._positionsAreDirty = true;
    },

    /**
     * Initializes a ccui.Scale9Sprite. please do not call this function by yourself, you should pass the parameters to constructor to initialize it.
     * @returns {boolean}
     */
    init: function () {
        return this.initWithBatchNode(null, cc.rect(0, 0, 0, 0), false, cc.rect(0, 0, 0, 0));
    },

    /**
     * Initializes a 9-slice sprite with a SpriteBatchNode.
     * @param {cc.SpriteBatchNode} batchNode
     * @param {cc.Rect} rect
     * @param {boolean|cc.Rect} rotated
     * @param {cc.Rect} [capInsets]
     * @returns {boolean}
     */
    initWithBatchNode: function (batchNode, rect, rotated, capInsets) {
        if (capInsets === undefined) {
            capInsets = rotated;
            rotated = false;
        }

        if (batchNode)
            this.updateWithBatchNode(batchNode, rect, rotated, capInsets);

        this.setCascadeColorEnabled(true);
        this.setCascadeOpacityEnabled(true);
        this.setAnchorPoint(0.5, 0.5);
        this._positionsAreDirty = true;
        return true;
    },

    /**
     * Initializes a 9-slice sprite with a texture file, a delimitation zone and
     * with the specified cap insets.
     * Once the sprite is created, you can then call its "setContentSize:" method
     * to resize the sprite will all it's 9-slice goodness intact.
     * It respects the anchorPoint too.
     *
     * @param {String} file The name of the texture file.
     * @param {cc.Rect} rect The rectangle that describes the sub-part of the texture that
     * is the whole image. If the shape is the whole texture, set this to the texture's full rect.
     * @param {cc.Rect} capInsets The values to use for the cap insets.
     */
    initWithFile: function (file, rect, capInsets) {
        if (file instanceof cc.Rect) {
            file = arguments[1];
            capInsets = arguments[0];
            rect = cc.rect(0, 0, 0, 0);
        } else {
            rect = rect || cc.rect(0, 0, 0, 0);
            capInsets = capInsets || cc.rect(0, 0, 0, 0);
        }

        if(!file)
            throw new Error("ccui.Scale9Sprite.initWithFile(): file should be non-null");

        var texture = cc.textureCache.getTextureForKey(file);
        if (!texture) {
            texture = cc.textureCache.addImage(file);
        }

        var locLoaded = texture.isLoaded();
        this._textureLoaded = locLoaded;
        if(!locLoaded){
            texture.addEventListener("load", function(sender){
                // the texture is rotated on Canvas render mode, so isRotated always is false.
                var preferredSize = this._preferredSize, restorePreferredSize = preferredSize.width !== 0 && preferredSize.height !== 0;
                if (restorePreferredSize) preferredSize = cc.size(preferredSize.width, preferredSize.height);
                var size  = sender.getContentSize();
                this.updateWithBatchNode(this._scale9Image, cc.rect(0,0,size.width,size.height), false, this._capInsets);
                if (restorePreferredSize)this.setPreferredSize(preferredSize);
                this._positionsAreDirty = true;
                this.setNodeDirty();
                this.dispatchEvent("load");
            }, this);
        }

        return this.initWithBatchNode(new cc.SpriteBatchNode(file, 9), rect, false, capInsets);
    },

    /**
     * Initializes a 9-slice sprite with an sprite frame and with the specified
     * cap insets.
     * Once the sprite is created, you can then call its "setContentSize:" method
     * to resize the sprite will all it's 9-slice goodness interact.
     * It respects the anchorPoint too.
     *
     * @param spriteFrame The sprite frame object.
     * @param capInsets The values to use for the cap insets.
     */
    initWithSpriteFrame: function (spriteFrame, capInsets) {
        if(!spriteFrame || !spriteFrame.getTexture())
            throw new Error("ccui.Scale9Sprite.initWithSpriteFrame(): spriteFrame should be non-null and its texture should be non-null");

        capInsets = capInsets || cc.rect(0, 0, 0, 0);
        var locLoaded = spriteFrame.textureLoaded();
        this._textureLoaded = locLoaded;
        if(!locLoaded){
            spriteFrame.addEventListener("load", function(sender){
                // the texture is rotated on Canvas render mode, so isRotated always is false.
                var preferredSize = this._preferredSize, restorePreferredSize = preferredSize.width !== 0 && preferredSize.height !== 0;
                if (restorePreferredSize) preferredSize = cc.size(preferredSize.width, preferredSize.height);
                this.updateWithBatchNode(this._scale9Image, sender.getRect(), cc._renderType === cc.game.RENDER_TYPE_WEBGL && sender.isRotated(), this._capInsets);
                if (restorePreferredSize)this.setPreferredSize(preferredSize);
                this._positionsAreDirty = true;
                this.setNodeDirty();
                this.dispatchEvent("load");
            },this);
        }
        var batchNode = new cc.SpriteBatchNode(spriteFrame.getTexture(), 9);
        // the texture is rotated on Canvas render mode, so isRotated always is false.
        return this.initWithBatchNode(batchNode, spriteFrame.getRect(), cc._renderType === cc.game.RENDER_TYPE_WEBGL && spriteFrame.isRotated(), capInsets);
    },

    /**
     * Initializes a 9-slice sprite with an sprite frame name and with the specified
     * cap insets.
     * Once the sprite is created, you can then call its "setContentSize:" method
     * to resize the sprite will all it's 9-slice goodness interact.
     * It respects the anchorPoint too.
     *
     * @param spriteFrameName The sprite frame name.
     * @param capInsets The values to use for the cap insets.
     */
    initWithSpriteFrameName: function (spriteFrameName, capInsets) {
        if(!spriteFrameName)
            throw new Error("ccui.Scale9Sprite.initWithSpriteFrameName(): spriteFrameName should be non-null");
        capInsets = capInsets || cc.rect(0, 0, 0, 0);

        var frame = cc.spriteFrameCache.getSpriteFrame(spriteFrameName);
        if (frame == null) {
            cc.log("ccui.Scale9Sprite.initWithSpriteFrameName(): can't find the sprite frame by spriteFrameName");
            return false;
        }

        return this.initWithSpriteFrame(frame, capInsets);
    },

    /**
     * Creates and returns a new sprite object with the specified cap insets.
     * You use this method to add cap insets to a sprite or to change the existing
     * cap insets of a sprite. In both cases, you get back a new image and the
     * original sprite remains untouched.
     *
     * @param {cc.Rect} capInsets The values to use for the cap insets.
     */
    resizableSpriteWithCapInsets: function (capInsets) {
        var pReturn = new ccui.Scale9Sprite();
        if (pReturn && pReturn.initWithBatchNode(this._scale9Image, this._spriteRect, false, capInsets))
            return pReturn;
        return null;
    },

    /** sets the premultipliedAlphaOpacity property.
     If set to NO then opacity will be applied as: glColor(R,G,B,opacity);
     If set to YES then opacity will be applied as: glColor(opacity, opacity, opacity, opacity );
     Textures with premultiplied alpha will have this property by default on YES. Otherwise the default value is NO
     @since v0.8
     */
    setOpacityModifyRGB: function (value) {
        if(!this._scale9Image)
            return;
        this._opacityModifyRGB = value;
        var scaleChildren = this._scale9Image.getChildren();
        if (scaleChildren) {
            for (var i = 0, len = scaleChildren.length; i < len; i++)
                scaleChildren[i].setOpacityModifyRGB(value);
        }
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.cacheDirty);
    },

    /** returns whether or not the opacity will be applied using glColor(R,G,B,opacity) or glColor(opacity, opacity, opacity, opacity);
     @since v0.8
     */
    isOpacityModifyRGB: function () {
        return this._opacityModifyRGB;
    },

    createSlicedSprites: function() {
        var width = this._originalSize.width,
            height = this._originalSize.height;
        var originalRect = this._spriteRect;
        var offsetX = Math.floor(this._offset.x + (width - originalRect.width) / 2.0);
        var offsetY = Math.floor(this._offset.y + (height - originalRect.height) / 2.0);
        var sx = originalRect.x,
            sy = originalRect.y;
        var capInsetsInternal = this._capInsetsInternal;
        var locScale9Image = this._scale9Image;
        var selTexture = locScale9Image.getTexture();
        var rotated = this._spriteFrameRotated;
        var rect = cc.rect(originalRect.x, originalRect.y, originalRect.width, originalRect.height);

        if(cc._rectEqualToZero(capInsetsInternal))
            capInsetsInternal = cc.rect(width /3, height /3, width /3, height /3);

        if(this._spriteFrameRotated) {
            sx -= offsetY;  sy -= offsetX;
        }else{
            sx -= offsetX;  sy -= offsetY;
        }
        originalRect = cc.rect(sx, sy, width, height);

        var leftWidth = capInsetsInternal.x,
            centerWidth = capInsetsInternal.width,
            rightWidth = originalRect.width - (leftWidth + centerWidth),
            topHeight = capInsetsInternal.y,
            centerHeight = capInsetsInternal.height,
            bottomHeight = originalRect.height - (topHeight + centerHeight);


        var x = 0.0, y = 0.0;

        // top left
        var leftTopBoundsOriginal = cc.rect(x + 0.5 | 0, y + 0.5 | 0, leftWidth + 0.5 | 0, topHeight + 0.5 | 0);
        var leftTopBounds = leftTopBoundsOriginal;

        // top center
        x += leftWidth;
        var centerTopBoundsOriginal = cc.rect(x + 0.5 | 0, y + 0.5 | 0, centerWidth + 0.5 | 0, topHeight + 0.5 | 0);
        var centerTopBounds = centerTopBoundsOriginal;

        // top right
        x += centerWidth;
        var  rightTopBoundsOriginal = cc.rect(x + 0.5 | 0, y + 0.5 | 0, rightWidth + 0.5 | 0, topHeight + 0.5 | 0);
        var  rightTopBounds = rightTopBoundsOriginal;

        // ... center row
        x = 0.0;
        y = 0.0;
        y += topHeight;

        // center left
        var leftCenterBounds = cc.rect(x + 0.5 | 0, y + 0.5 | 0, leftWidth + 0.5 | 0, centerHeight + 0.5 | 0);

        // center center
        x += leftWidth;
        var centerBoundsOriginal = cc.rect(x + 0.5 | 0, y + 0.5 | 0, centerWidth + 0.5 | 0, centerHeight + 0.5 | 0);
        var centerBounds = centerBoundsOriginal;

        // center right
        x += centerWidth;
        var rightCenterBounds = cc.rect(x + 0.5 | 0, y + 0.5 | 0, rightWidth + 0.5 | 0, centerHeight + 0.5 | 0);

        // ... bottom row
        x = 0.0;
        y = 0.0;
        y += topHeight;
        y += centerHeight;

        // bottom left
        var leftBottomBounds = cc.rect(x + 0.5 | 0, y + 0.5 | 0, leftWidth + 0.5 | 0, bottomHeight + 0.5 | 0);

        // bottom center
        x += leftWidth;
        var centerBottomBounds = cc.rect(x + 0.5 | 0, y + 0.5 | 0, centerWidth + 0.5 | 0, bottomHeight + 0.5 | 0);

        // bottom right
        x += centerWidth;
        var rightBottomBoundsOriginal = cc.rect(x + 0.5 | 0, y + 0.5 | 0, rightWidth + 0.5 | 0, bottomHeight + 0.5 | 0);
        var rightBottomBounds = rightBottomBoundsOriginal;

        var rotatedLeftTopBoundsOriginal = leftTopBoundsOriginal;
        var rotatedCenterBoundsOriginal = centerBoundsOriginal;
        var rotatedRightBottomBoundsOriginal = rightBottomBoundsOriginal;

        var rotatedCenterBounds = centerBounds;
        var rotatedRightBottomBounds = rightBottomBounds;
        var rotatedLeftBottomBounds = leftBottomBounds;
        var rotatedRightTopBounds = rightTopBounds;
        var rotatedLeftTopBounds = leftTopBounds;
        var rotatedRightCenterBounds = rightCenterBounds;
        var rotatedLeftCenterBounds = leftCenterBounds;
        var rotatedCenterBottomBounds = centerBottomBounds;
        var rotatedCenterTopBounds = centerTopBounds;

        var t = cc.affineTransformMakeIdentity();
        if (!rotated) {
            t = cc.affineTransformTranslate(t, rect.x, rect.y);
        
            rotatedLeftTopBoundsOriginal = cc.rectApplyAffineTransform(rotatedLeftTopBoundsOriginal, t);
            rotatedCenterBoundsOriginal = cc.rectApplyAffineTransform(rotatedCenterBoundsOriginal, t);
            rotatedRightBottomBoundsOriginal = cc.rectApplyAffineTransform(rotatedRightBottomBoundsOriginal, t);
        
            rotatedCenterBounds = cc.rectApplyAffineTransform(rotatedCenterBounds, t);
            rotatedRightBottomBounds = cc.rectApplyAffineTransform(rotatedRightBottomBounds, t);
            rotatedLeftBottomBounds = cc.rectApplyAffineTransform(rotatedLeftBottomBounds, t);
            rotatedRightTopBounds = cc.rectApplyAffineTransform(rotatedRightTopBounds, t);
            rotatedLeftTopBounds = cc.rectApplyAffineTransform(rotatedLeftTopBounds, t);
            rotatedRightCenterBounds = cc.rectApplyAffineTransform(rotatedRightCenterBounds, t);
            rotatedLeftCenterBounds = cc.rectApplyAffineTransform(rotatedLeftCenterBounds, t);
            rotatedCenterBottomBounds = cc.rectApplyAffineTransform(rotatedCenterBottomBounds, t);
            rotatedCenterTopBounds = cc.rectApplyAffineTransform(rotatedCenterTopBounds, t);

        } else {
            t = cc.affineTransformTranslate(t, rect.height + rect.x, rect.y);
            t = cc.affineTransformRotate(t, 1.57079633);
        
            leftTopBoundsOriginal = cc.rectApplyAffineTransform(leftTopBoundsOriginal, t);
            centerBoundsOriginal = cc.rectApplyAffineTransform(centerBoundsOriginal, t);
            rightBottomBoundsOriginal = cc.rectApplyAffineTransform(rightBottomBoundsOriginal, t);
        
            centerBounds = cc.rectApplyAffineTransform(centerBounds, t);
            rightBottomBounds = cc.rectApplyAffineTransform(rightBottomBounds, t);
            leftBottomBounds = cc.rectApplyAffineTransform(leftBottomBounds, t);
            rightTopBounds = cc.rectApplyAffineTransform(rightTopBounds, t);
            leftTopBounds = cc.rectApplyAffineTransform(leftTopBounds, t);
            rightCenterBounds = cc.rectApplyAffineTransform(rightCenterBounds, t);
            leftCenterBounds = cc.rectApplyAffineTransform(leftCenterBounds, t);
            centerBottomBounds = cc.rectApplyAffineTransform(centerBottomBounds, t);
            centerTopBounds = cc.rectApplyAffineTransform(centerTopBounds, t);
        
            rotatedLeftTopBoundsOriginal.x = leftTopBoundsOriginal.x;
            rotatedCenterBoundsOriginal.x = centerBoundsOriginal.x;
            rotatedRightBottomBoundsOriginal.x = rightBottomBoundsOriginal.x;
        
            rotatedCenterBounds.x = centerBounds.x;
            rotatedRightBottomBounds.x = rightBottomBounds.x;
            rotatedLeftBottomBounds.x = leftBottomBounds.x;
            rotatedRightTopBounds.x = rightTopBounds.x;
            rotatedLeftTopBounds.x = leftTopBounds.x;
            rotatedRightCenterBounds.x = rightCenterBounds.x;
            rotatedLeftCenterBounds.x = leftCenterBounds.x;
            rotatedCenterBottomBounds.x = centerBottomBounds.x;
            rotatedCenterTopBounds.x = centerTopBounds.x;
        
        
            rotatedLeftTopBoundsOriginal.y = leftTopBoundsOriginal.y;
            rotatedCenterBoundsOriginal.y = centerBoundsOriginal.y;
            rotatedRightBottomBoundsOriginal.y = rightBottomBoundsOriginal.y;
        
            rotatedCenterBounds.y = centerBounds.y;
            rotatedRightBottomBounds.y = rightBottomBounds.y;
            rotatedLeftBottomBounds.y = leftBottomBounds.y;
            rotatedRightTopBounds.y = rightTopBounds.y;
            rotatedLeftTopBounds.y = leftTopBounds.y;
            rotatedRightCenterBounds.y = rightCenterBounds.y;
            rotatedLeftCenterBounds.y = leftCenterBounds.y;
            rotatedCenterBottomBounds.y = centerBottomBounds.y;
            rotatedCenterTopBounds.y = centerTopBounds.y;
        }

        // Centre
        if(!this._centre)
            this._centre = new cc.Sprite();
        this._centre.initWithTexture(selTexture, rotatedCenterBounds, rotated);
        if(rotatedCenterBounds.width > 0 && rotatedCenterBounds.height > 0 )
            this._renderers.push(this._centre);

        // Top
        if(!this._top)
            this._top = new cc.Sprite();
        this._top.initWithTexture(selTexture, rotatedCenterTopBounds, rotated);
        if(rotatedCenterTopBounds.width > 0 && rotatedCenterTopBounds.height > 0 )
            this._renderers.push(this._top);

        // Bottom
        if(!this._bottom)
            this._bottom = new cc.Sprite();
        this._bottom.initWithTexture(selTexture, rotatedCenterBottomBounds, rotated);
        if(rotatedCenterBottomBounds.width > 0 && rotatedCenterBottomBounds.height > 0 )
            this._renderers.push(this._bottom);

        // Left
        if(!this._left)
            this._left = new cc.Sprite();
        this._left.initWithTexture(selTexture, rotatedLeftCenterBounds, rotated);
        if(rotatedLeftCenterBounds.width > 0 && rotatedLeftCenterBounds.height > 0 )
            this._renderers.push(this._left);

        // Right
        if(!this._right)
            this._right = new cc.Sprite();
        this._right.initWithTexture(selTexture, rotatedRightCenterBounds, rotated);
        if(rotatedRightCenterBounds.width > 0 && rotatedRightCenterBounds.height > 0 )
            this._renderers.push(this._right);

        // Top left
        if(!this._topLeft)
            this._topLeft = new cc.Sprite();
        this._topLeft.initWithTexture(selTexture, rotatedLeftTopBounds, rotated);
        if(rotatedLeftTopBounds.width > 0 && rotatedLeftTopBounds.height > 0 )
            this._renderers.push(this._topLeft);

        // Top right
        if(!this._topRight)
            this._topRight = new cc.Sprite();
        this._topRight.initWithTexture(selTexture, rotatedRightTopBounds, rotated);
        if(rotatedRightTopBounds.width > 0 && rotatedRightTopBounds.height > 0 )
            this._renderers.push(this._topRight);

        // Bottom left
        if(!this._bottomLeft)
            this._bottomLeft = new cc.Sprite();
        this._bottomLeft.initWithTexture(selTexture, rotatedLeftBottomBounds, rotated);
        if(rotatedLeftBottomBounds.width > 0 && rotatedLeftBottomBounds.height > 0 )
            this._renderers.push(this._bottomLeft);

        // Bottom right
        if(!this._bottomRight)
            this._bottomRight = new cc.Sprite();
        this._bottomRight.initWithTexture(selTexture, rotatedRightBottomBounds, rotated);
        if(rotatedRightBottomBounds.width > 0 && rotatedRightBottomBounds.height > 0 )
            this._renderers.push(this._bottomRight);
    },
    /**
     * @brief Update Scale9Sprite with a specified sprite.
     *
     * @param sprite A sprite pointer.
     * @param rect A delimitation zone.
     * @param rotated Whether the sprite is rotated or not.
     * @param offset The offset when slice the sprite.
     * @param originalSize The origial size of the sprite.
     * @param capInsets The Values to use for the cap insets.
     * @return True if update success, false otherwise.
     */
    updateWithSprite: function(sprite, spriteRect, spriteFrameRotated, offset, originalSize, capInsets) {
        var opacity = this.getOpacity();
        var color = this.getColor();
        this._renderers.length = 0;
        if(sprite) {
            if(!sprite.getSpriteFrame())
                return false;
            if(!this._scale9Image)
                this._scale9Image = sprite;
        }
        if(!this._scale9Image)  return false;
        var rect = spriteRect;
        var size = originalSize;

        var tmpTexture = this._scale9Image.getTexture();
        var locLoaded = tmpTexture && tmpTexture.isLoaded();
        this._textureLoaded = locLoaded;
        if(!locLoaded){
            tmpTexture.addEventListener("load", function(sender){
                this._positionsAreDirty = true;
                this.updateWithSprite(sprite, spriteRect, spriteFrameRotated, offset, originalSize, capInsets);
                this.setVisible(true);
                this.setNodeDirty();
                this.dispatchEvent("load");
            }, this);
            this.setVisible(false);
            return true;
        }
        if(cc._rectEqualToZero(rect)) {
            var textureSize = tmpTexture.getContentSize();
            rect = cc.rect(0, 0, textureSize.width, textureSize.height);
        }
        if(size.width === 0 && size.height === 0)
            size = cc.size(rect.width, rect.height);
        this._capInsets = capInsets;
        this._spriteRect = rect;
        this._offset = offset;
        this._spriteFrameRotated = spriteFrameRotated;
        this._originalSize = size;
        this._preferredSize = size;
        this._capInsetsInternal = capInsets;
        if(this._scale9Enabled)
            this.createSlicedSprites();
        else
            this._scale9Image.initWithTexture(tmpTexture, this._spriteRect, this._spriteFrameRotated);

        this.setState(this._brightState);
        this.setContentSize(size);
        if(this._spritesGenerated === true) {
            this.setOpacity(opacity);
            this.setColor(color);
        }
        this._spritesGenerated = true;
        return true;
    },
    /**
     * Update the scale9Sprite with a SpriteBatchNode.
     * @param {cc.SpriteBatchNode} batchNode
     * @param {cc.Rect} originalRect
     * @param {boolean} rotated
     * @param {cc.Rect} capInsets
     * @returns {boolean}
     */
    updateWithBatchNode: function (batchNode, originalRect, rotated, capInsets) {
        var sprite = new cc.Sprite(batchNode.getTexture());
        var pos = cc.p(0,0);
        var originalSize = cc.size(originalRect.width,originalRect.height);

        var tmpTexture = batchNode.getTexture();
        var locLoaded = tmpTexture.isLoaded();
        this._textureLoaded = locLoaded;
        if(!locLoaded){
            tmpTexture.addEventListener("load", function(sender){
                this._positionsAreDirty = true;
                this.updateWithBatchNode(batchNode, originalRect, rotated, capInsets);
                this.setVisible(true);
                this.setNodeDirty();
                this.dispatchEvent("load");
            }, this);
            this.setVisible(false);
            return true;
        }
        return this.updateWithSprite(sprite, originalRect, rotated, pos, originalSize, capInsets);
    },

    /**
     * set the sprite frame of ccui.Scale9Sprite
     * @param {cc.SpriteFrame} spriteFrame
     * @param {cc.rect} capInsets
     */
    setSpriteFrame: function (spriteFrame, capInsets) {
        // Reset insets
        if (!capInsets)
            capInsets = cc.rect();
        var sprite = new cc.Sprite(spriteFrame.getTexture());
        var locLoaded = spriteFrame.textureLoaded();
        this._textureLoaded = locLoaded;
        if(!locLoaded){
            spriteFrame.addEventListener("load", function(sender){
                // the texture is rotated on Canvas render mode, so isRotated always is false.
                var preferredSize = this._preferredSize, restorePreferredSize = preferredSize.width !== 0 && preferredSize.height !== 0;
                if (restorePreferredSize) preferredSize = cc.size(preferredSize.width, preferredSize.height);
                this.updateWithBatchNode(this._scale9Image, sender.getRect(), cc._renderType === cc.game.RENDER_TYPE_WEBGL && sender.isRotated(), this._capInsets);
                if (restorePreferredSize)this.setPreferredSize(preferredSize);
                this._positionsAreDirty = true;
                this.setNodeDirty();
                this.dispatchEvent("load");
            },this);
        }
        this.updateWithSprite(sprite, spriteFrame.getRect(),spriteFrame.isRotated(),spriteFrame.getOffset(),spriteFrame.getOriginalSize(),capInsets);

        this._insetLeft = capInsets.x;
        this._insetTop = capInsets.y;
        this._insetRight = this._originalSize.width - this._insetLeft - capInsets.width;
        this._insetBottom = this._originalSize.height - this._insetTop - capInsets.height;
    },

    //v3.3
    /**
     * Sets ccui.Scale9Sprite's state
     * @since v3.3
     * @param {Number} state
     */
    setState: function(state){
        this._renderCmd.setState(state);
    },
    /**
     * @brief Toggle 9-slice feature.
     * If Scale9Sprite is 9-slice disabled, the Scale9Sprite will rendered as a normal sprite.
     * @param {boolean}    enabled    True to enable 9-slice, false otherwise.
     */
    setScale9Enabled: function(enabled){
        if (this._scale9Enabled === enabled)
        {
            return;
        }
        this._scale9Enabled = enabled;
        this._renderers.length = 0;
        //we must invalide the transform when toggling scale9enabled
        cc.Node.transformDirty = true;
        if (this._scale9Enabled) {
            if (this._scale9Image) {
                this.updateWithSprite(this._scale9Image,
                    this._spriteRect,
                    this._spriteFrameRotated,
                    this._offset,
                    this._originalSize,
                    this._capInsets);
            }
        }
        this._positionsAreDirty = true;
    },

    _setRenderersPosition: function() {
        if(this._positionsAreDirty) {
            this._updatePositions();
            this._adjustScale9ImagePosition();
            this._positionsAreDirty = false;
        }
    },

    _adjustScale9ImagePosition: function() {
        var image = this._scale9Image;
        var contentSize = this._contentSize;
        if(image) {
            image.x = contentSize.width * image.getAnchorPoint().x;
            image.y = contentSize.height * image.getAnchorPoint().y;
        }
    },

    _adjustScale9ImageScale: function() {
        var image = this._scale9Image;
        var contentSize = this._contentSize;
        if(image) {
            image.setScale(contentSize.width/image.width, contentSize.height/image.height);
        }
    },

    /**
     * Sets whether the widget should be flipped horizontally or not.
     * @since v3.3
     * @param flippedX true if the widget should be flipped horizontally, false otherwise.
     */
    setFlippedX: function(flippedX){
        var realScale = this.getScaleX();
        this._flippedX = flippedX;
        this.setScaleX(realScale);
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.cacheDirty);
    },

    /**
     * <p>
     * Returns the flag which indicates whether the widget is flipped horizontally or not.                         <br/>
     *                                                                                                             <br/>
     * It only flips the texture of the widget, and not the texture of the widget's children.                      <br/>
     * Also, flipping the texture doesn't alter the anchorPoint.                                                   <br/>
     * If you want to flip the anchorPoint too, and/or to flip the children too use:                               <br/>
     * widget->setScaleX(sprite->getScaleX() * -1);                                                                <br/>
     * </p>
     * @since v3.3
     * @return {Boolean} true if the widget is flipped horizontally, false otherwise.
     */
    isFlippedX: function(){
        return this._flippedX;
    },

    /**
     * Sets whether the widget should be flipped vertically or not.
     * @since v3.3
     * @param flippedY true if the widget should be flipped vertically, false otherwise.
     */
    setFlippedY:function(flippedY){
        var realScale = this.getScaleY();
        this._flippedY = flippedY;
        this.setScaleY(realScale);
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.cacheDirty);
    },

    /**
     * <p>
     * Return the flag which indicates whether the widget is flipped vertically or not.                             <br/>
     *                                                                                                              <br/>
     * It only flips the texture of the widget, and not the texture of the widget's children.                       <br/>
     * Also, flipping the texture doesn't alter the anchorPoint.                                                    <br/>
     * If you want to flip the anchorPoint too, and/or to flip the children too use:                                <br/>
     * widget->setScaleY(widget->getScaleY() * -1);                                                                 <br/>
     * </p>
     * @since v3.3
     * @return {Boolean} true if the widget is flipped vertically, false otherwise.
     */
    isFlippedY:function(){
        return this._flippedY;
    },

    setScaleX: function (scaleX) {
        if (this._flippedX)
            scaleX = scaleX * -1;
        cc.Node.prototype.setScaleX.call(this, scaleX);
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.cacheDirty);
    },

    setScaleY: function (scaleY) {
        if (this._flippedY)
            scaleY = scaleY * -1;
        cc.Node.prototype.setScaleY.call(this, scaleY);
        this._renderCmd.setDirtyFlag(cc.Node._dirtyFlags.cacheDirty);
    },

    setScale: function (scaleX, scaleY) {
        if(scaleY === undefined)
            scaleY = scaleX;
        this.setScaleX(scaleX);
        this.setScaleY(scaleY);
    },

    getScaleX: function () {
        var originalScale = cc.Node.prototype.getScaleX.call(this);
        if (this._flippedX)
            originalScale = originalScale * -1.0;
        return originalScale;
    },

    getScaleY: function () {
        var originalScale = cc.Node.prototype.getScaleY.call(this);
        if (this._flippedY)
            originalScale = originalScale * -1.0;
        return originalScale;
    },

    getScale: function () {
        if(this.getScaleX() !== this.getScaleY())
            cc.log("Scale9Sprite#scale. ScaleX != ScaleY. Don't know which one to return");
        return this.getScaleX();
    },

    _createRenderCmd: function(){
        if(cc._renderType === cc.game.RENDER_TYPE_CANVAS)
            return new ccui.Scale9Sprite.CanvasRenderCmd(this);
        else
            return new ccui.Scale9Sprite.WebGLRenderCmd(this);
    }
});

var _p = ccui.Scale9Sprite.prototype;
cc.EventHelper.prototype.apply(_p);

// Extended properties
/** @expose */
_p.preferredSize;
cc.defineGetterSetter(_p, "preferredSize", _p.getPreferredSize, _p.setPreferredSize);
/** @expose */
_p.capInsets;
cc.defineGetterSetter(_p, "capInsets", _p.getCapInsets, _p.setCapInsets);
/** @expose */
_p.insetLeft;
cc.defineGetterSetter(_p, "insetLeft", _p.getInsetLeft, _p.setInsetLeft);
/** @expose */
_p.insetTop;
cc.defineGetterSetter(_p, "insetTop", _p.getInsetTop, _p.setInsetTop);
/** @expose */
_p.insetRight;
cc.defineGetterSetter(_p, "insetRight", _p.getInsetRight, _p.setInsetRight);
/** @expose */
_p.insetBottom;
cc.defineGetterSetter(_p, "insetBottom", _p.getInsetBottom, _p.setInsetBottom);

_p = null;

/**
 * Creates a 9-slice sprite with a texture file, a delimitation zone and
 * with the specified cap insets.
 * @deprecated since v3.0, please use new ccui.Scale9Sprite(file, rect, capInsets) instead.
 * @param {String|cc.SpriteFrame} file file name of texture or a cc.Sprite object
 * @param {cc.Rect} rect the rect of the texture
 * @param {cc.Rect} capInsets the cap insets of ccui.Scale9Sprite
 * @returns {ccui.Scale9Sprite}
 */
ccui.Scale9Sprite.create = function (file, rect, capInsets) {
    return new ccui.Scale9Sprite(file, rect, capInsets);
};

/**
 * create a ccui.Scale9Sprite with Sprite frame.
 * @deprecated since v3.0, please use "new ccui.Scale9Sprite(spriteFrame, capInsets)" instead.
 * @param {cc.SpriteFrame} spriteFrame
 * @param {cc.Rect} capInsets
 * @returns {ccui.Scale9Sprite}
 */
ccui.Scale9Sprite.createWithSpriteFrame = function (spriteFrame, capInsets) {
    return new ccui.Scale9Sprite(spriteFrame, capInsets);
};

/**
 * create a ccui.Scale9Sprite with a Sprite frame name
 * @deprecated since v3.0, please use "new ccui.Scale9Sprite(spriteFrameName, capInsets)" instead.
 * @param {string} spriteFrameName
 * @param {cc.Rect} capInsets
 * @returns {Scale9Sprite}
 */
ccui.Scale9Sprite.createWithSpriteFrameName = function (spriteFrameName, capInsets) {
    return new ccui.Scale9Sprite(spriteFrameName, capInsets);
};

/**
 * @ignore
 */
ccui.Scale9Sprite.POSITIONS_CENTRE = 0;
ccui.Scale9Sprite.POSITIONS_TOP = 1;
ccui.Scale9Sprite.POSITIONS_LEFT = 2;
ccui.Scale9Sprite.POSITIONS_RIGHT = 3;
ccui.Scale9Sprite.POSITIONS_BOTTOM = 4;
ccui.Scale9Sprite.POSITIONS_TOPRIGHT = 5;
ccui.Scale9Sprite.POSITIONS_TOPLEFT = 6;
ccui.Scale9Sprite.POSITIONS_BOTTOMRIGHT = 7;

ccui.Scale9Sprite.state = {NORMAL: 0, GRAY: 1};
