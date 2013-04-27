/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
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

cc.POSITIONS_CENTRE = 0;
cc.POSITIONS_TOP = 1;
cc.POSITIONS_LEFT = 2;
cc.POSITIONS_RIGHT = 3;
cc.POSITIONS_BOTTOM = 4;
cc.POSITIONS_TOPRIGHT = 5;
cc.POSITIONS_TOPLEFT = 6;
cc.POSITIONS_BOTTOMRIGHT = 7;
cc.POSITIONS_BOTTOMLEFT = 8;

/**
 * A 9-slice sprite for cocos2d.
 *
 * 9-slice scaling allows you to specify how scaling is applied
 * to specific areas of a sprite. With 9-slice scaling (3x3 grid),
 * you can ensure that the sprite does not become distorted when
 * scaled.
 *
 * @see http://yannickloriot.com/library/ios/cccontrolextension/Classes/CCScale9Sprite.html
 * @class
 * @extends cc.Sprite
 */
cc.Scale9Sprite = cc.Node.extend(/** @lends cc.Scale9Sprite# */{
    RGBAProtocol: true,

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

    _colorUnmodified: null,
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

    _updateCapInset: function () {
        var insets;
        if (this._insetLeft == 0 && this._insetTop == 0 && this._insetRight == 0 && this._insetBottom == 0) {
            insets = cc.RectZero();
        } else {
            insets = this._spriteFrameRotated ? cc.RectMake(this._insetBottom, this._insetLeft,
                this._spriteRect.size.width - this._insetRight - this._insetLeft,
                this._spriteRect.size.height - this._insetTop - this._insetBottom) :
                cc.RectMake(this._insetLeft, this._insetTop,
                    this._spriteRect.size.width - this._insetLeft - this._insetRight,
                    this._spriteRect.size.height - this._insetTop - this._insetBottom);
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
        var sizableWidth = size.width - this._topLeft.getContentSize().width - this._topRight.getContentSize().width;
        var sizableHeight = size.height - this._topLeft.getContentSize().height - this._bottomRight.getContentSize().height;
        var horizontalScale = sizableWidth / this._centre.getContentSize().width;
        var verticalScale = sizableHeight / this._centre.getContentSize().height;
        this._centre.setScaleX(horizontalScale);
        this._centre.setScaleY(verticalScale);
        var rescaledWidth = this._centre.getContentSize().width * horizontalScale;
        var rescaledHeight = this._centre.getContentSize().height * verticalScale;

        var leftWidth = this._bottomLeft.getContentSize().width;
        var bottomHeight = this._bottomLeft.getContentSize().height;

        this._bottomLeft.setAnchorPoint(cc.p(0, 0));
        this._bottomRight.setAnchorPoint(cc.p(0, 0));
        this._topLeft.setAnchorPoint(cc.p(0, 0));
        this._topRight.setAnchorPoint(cc.p(0, 0));
        this._left.setAnchorPoint(cc.p(0, 0));
        this._right.setAnchorPoint(cc.p(0, 0));
        this._top.setAnchorPoint(cc.p(0, 0));
        this._bottom.setAnchorPoint(cc.p(0, 0));
        this._centre.setAnchorPoint(cc.p(0, 0));

        // Position corners
        this._bottomLeft.setPosition(cc.p(0, 0));
        this._bottomRight.setPosition(cc.p(leftWidth + rescaledWidth, 0));
        this._topLeft.setPosition(cc.p(0, bottomHeight + rescaledHeight));
        this._topRight.setPosition(cc.p(leftWidth + rescaledWidth, bottomHeight + rescaledHeight));

        // Scale and position borders
        this._left.setPosition(cc.p(0, bottomHeight));
        this._left.setScaleY(verticalScale);
        this._right.setPosition(cc.p(leftWidth + rescaledWidth, bottomHeight));
        this._right.setScaleY(verticalScale);
        this._bottom.setPosition(cc.p(leftWidth, 0));
        this._bottom.setScaleX(horizontalScale);
        this._top.setPosition(cc.p(leftWidth, bottomHeight + rescaledHeight));
        this._top.setScaleX(horizontalScale);

        // Position centre
        this._centre.setPosition(cc.p(leftWidth, bottomHeight));
    },

    ctor: function () {
        this._super();
        this._spriteRect = cc.RectZero();
        this._capInsetsInternal = cc.RectZero();

        this._colorUnmodified = cc.white();
        this._originalSize = new cc.Size(0, 0);
        this._preferredSize = new cc.Size(0, 0);
        this._color = cc.white();
        this._opacity = 255;
        this._capInsets = cc.RectZero();
    },

    /** Original sprite's size. */
    getOriginalSize: function () {
        return this._originalSize;
    },

    //if the preferredSize component is given as -1, it is ignored
    getPreferredSize: function () {
        return this._preferredSize;
    },
    setPreferredSize: function (preferredSize) {
        this.setContentSize(preferredSize);
        this._preferredSize = preferredSize;
    },

    /** Opacity: conforms to CCRGBAProtocol protocol */
    getOpacity: function () {
        return this._opacity;
    },
    setOpacity: function (opacity) {
        this._opacity = opacity;
    },

    /** Color: conforms to CCRGBAProtocol protocol */
    getColor: function () {
        return this._color;
    },
    setColor: function (color) {
        this._color = color;
        var scaleChildren = this._scale9Image.getChildren();
        if (scaleChildren && scaleChildren.length != 0) {
            for (var i = 0; i < scaleChildren.length; i++) {
                if (scaleChildren[i] && scaleChildren[i].RGBAProtocol) {
                    scaleChildren[i].setColor(this._color);
                }
            }
        }
    },

    getCapInsets: function () {
        return this._capInsets;
    },

    setCapInsets: function (capInsets) {
        var contentSize = this._contentSize;
        this.updateWithBatchNode(this._scale9Image, this._spriteRect, this._spriteFrameRotated, capInsets);
        this.setContentSize(contentSize);
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

    setContentSize: function (size) {
        this._super(size);
        this.m_positionsAreDirty = true;
    },

    visit: function () {
        if (this.m_positionsAreDirty) {
            this._updatePositions();
            this.m_positionsAreDirty = false;
        }
        this._super();
    },

    init: function () {
        return this.initWithBatchNode(null, cc.RectZero(), false, cc.RectZero());
    },

    initWithBatchNode: function (batchNode, rect, rotated, capInsets) {
        if (arguments.length == 3) {
            capInsets = rotated;
            rotated = false;
        }

        if (batchNode) {
            this.updateWithBatchNode(batchNode, rect, rotated, capInsets);
        }
        this.setAnchorPoint(cc.p(0.5, 0.5));
        this.m_positionsAreDirty = true;
        return true;
    },

    /**
     * Initializes a 9-slice sprite with a texture file, a delimitation zone and
     * with the specified cap insets.
     * Once the sprite is created, you can then call its "setContentSize:" method
     * to resize the sprite will all it's 9-slice goodness intract.
     * It respects the anchorPoint too.
     *
     * @param file The name of the texture file.
     * @param rect The rectangle that describes the sub-part of the texture that
     * is the whole image. If the shape is the whole texture, set this to the
     * texture's full rect.
     * @param capInsets The values to use for the cap insets.
     */
    initWithFile: function (file, rect, capInsets) {
        if (file instanceof cc.Rect) {
            file = arguments[1];
            capInsets = arguments[0];
            rect = cc.RectZero();
        } else {
            rect = rect || cc.RectZero();
            capInsets = capInsets || cc.RectZero();
        }

        cc.Assert(file != null, "Invalid file for sprite");
        var batchnode = cc.SpriteBatchNode.create(file, 9);
        return this.initWithBatchNode(batchnode, rect, false, capInsets);
    },

    /**
     * Initializes a 9-slice sprite with an sprite frame and with the specified
     * cap insets.
     * Once the sprite is created, you can then call its "setContentSize:" method
     * to resize the sprite will all it's 9-slice goodness intract.
     * It respects the anchorPoint too.
     *
     * @param spriteFrame The sprite frame object.
     * @param capInsets The values to use for the cap insets.
     */
    initWithSpriteFrame: function (spriteFrame, capInsets) {
        capInsets = capInsets || cc.RectZero();

        cc.Assert(spriteFrame != null, "Sprite frame must not be nil");
        var selTexture = spriteFrame.getTexture();
        cc.Assert(selTexture != null, "Texture must be not nil");

        var batchNode = cc.SpriteBatchNode.createWithTexture(selTexture, 9);
        // the texture is rotated on Canvas render mode, so isRotated always is false.
        return this.initWithBatchNode(batchNode, spriteFrame.getRect(), cc.Browser.supportWebGL ? spriteFrame.isRotated() : false, capInsets);
    },

    /**
     * Initializes a 9-slice sprite with an sprite frame name and with the specified
     * cap insets.
     * Once the sprite is created, you can then call its "setContentSize:" method
     * to resize the sprite will all it's 9-slice goodness intract.
     * It respects the anchorPoint too.
     *
     * @param spriteFrameName The sprite frame name.
     * @param capInsets The values to use for the cap insets.
     */
    initWithSpriteFrameName: function (spriteFrameName, capInsets) {
        capInsets = capInsets || cc.RectZero();

        cc.Assert(spriteFrameName != null, "Invalid spriteFrameName for sprite");
        var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(spriteFrameName);
        cc.Assert(frame != null, "cc.SpriteFrame must be non-NULL");
        if (frame == null)
            return false;
        return this.initWithSpriteFrame(frame, capInsets);
    },

    /**
     * Creates and returns a new sprite object with the specified cap insets.
     * You use this method to add cap insets to a sprite or to change the existing
     * cap insets of a sprite. In both cases, you get back a new image and the
     * original sprite remains untouched.
     *
     * @param capInsets The values to use for the cap insets.
     */
    resizableSpriteWithCapInsets: function (capInsets) {
        var pReturn = new cc.Scale9Sprite();
        if (pReturn && pReturn.initWithBatchNode(this._scale9Image, this._spriteRect, false, capInsets)) {
            return pReturn;
        }
        return null;
    },

    /** sets the premultipliedAlphaOpacity property.
     If set to NO then opacity will be applied as: glColor(R,G,B,opacity);
     If set to YES then oapcity will be applied as: glColor(opacity, opacity, opacity, opacity );
     Textures with premultiplied alpha will have this property by default on YES. Otherwise the default value is NO
     @since v0.8
     */
    setOpacityModifyRGB: function (value) {
        this._opacityModifyRGB = value;
        var scaleChildren = this._scale9Image.getChildren();
        if (scaleChildren) {
            for (var i = 0; i < scaleChildren.length; i++) {
                scaleChildren[i].setOpacityModifyRGB(this._opacityModifyRGB);
            }
        }
    },

    /** returns whether or not the opacity will be applied using glColor(R,G,B,opacity) or glColor(opacity, opacity, opacity, opacity);
     @since v0.8
     */
    isOpacityModifyRGB: function () {
        return this._opacityModifyRGB;
    },

    updateWithBatchNode: function (batchNode, rect, rotated, capInsets) {
        var opacity = this.getOpacity();
        var color = this.getColor();

        // Release old sprites
        this.removeAllChildren(true);

        if (this._scale9Image != batchNode)
            this._scale9Image = batchNode;

        this._scale9Image.removeAllChildren(true);

        this._capInsets = capInsets;
        var selTexture = this._scale9Image.getTexture();

        var rectZero = cc.RectZero();
        // If there is no given rect
        if (cc.Rect.CCRectEqualToRect(rect, rectZero)) {
            // Get the texture size as original
            if (selTexture instanceof  cc.Texture2D) {
                var textureSize = selTexture.getContentSize();
                rect = cc.RectMake(0, 0, textureSize.width, textureSize.height);
            } else {
                rect = cc.RectMake(0, 0, selTexture.width, selTexture.height);
            }
        }

        // Set the given rect's size as original size
        this._spriteRect = rect;
        var rectSize = rect.size;
        this._originalSize = new cc.Size(rectSize.width, rectSize.height);
        this._preferredSize = new cc.Size(rectSize.width, rectSize.height);
        this._capInsetsInternal = capInsets || cc.RectZero();
        var w = rectSize.width;
        var h = rectSize.height;

        // If there is no specified center region
        if (cc.Rect.CCRectEqualToRect(this._capInsetsInternal, rectZero)) {
            // CCLog("... cap insets not specified : using default cap insets ...");
            this._capInsetsInternal = cc.rect(w / 3, h / 3, w / 3, h / 3);
        }

        var left_w = this._capInsetsInternal.origin.x;
        var center_w = this._capInsetsInternal.size.width;
        var right_w = w - (left_w + center_w);

        var top_h = this._capInsetsInternal.origin.y;
        var center_h = this._capInsetsInternal.size.height;
        var bottom_h = h - (top_h + center_h);

        // calculate rects
        // ... top row
        var x = 0.0;
        var y = 0.0;

        // top left
        var lefttopbounds = cc.RectMake(x, y, left_w, top_h);

        // top center
        x += left_w;
        var centertopbounds = cc.RectMake(x, y, center_w, top_h);

        // top right
        x += center_w;
        var righttopbounds = cc.RectMake(x, y, right_w, top_h);

        // ... center row
        x = 0.0;
        y = 0.0;

        // center left
        y += top_h;
        var leftcenterbounds = cc.RectMake(x, y, left_w, center_h);

        // center center
        x += left_w;
        var centerbounds = cc.RectMake(x, y, center_w, center_h);

        // center right
        x += center_w;
        var rightcenterbounds = cc.RectMake(x, y, right_w, center_h);

        // ... bottom row
        x = 0.0;
        y = 0.0;
        y += top_h;
        y += center_h;

        // bottom left
        var leftbottombounds = cc.RectMake(x, y, left_w, bottom_h);

        // bottom center
        x += left_w;
        var centerbottombounds = cc.RectMake(x, y, center_w, bottom_h);

        // bottom right
        x += center_w;
        var rightbottombounds = cc.RectMake(x, y, right_w, bottom_h);

        if (!rotated) {
            // CCLog("!rotated");
            var t = cc.AffineTransformMakeIdentity();
            t = cc.AffineTransformTranslate(t, rect.origin.x, rect.origin.y);

            centerbounds = cc.RectApplyAffineTransform(centerbounds, t);
            rightbottombounds = cc.RectApplyAffineTransform(rightbottombounds, t);
            leftbottombounds = cc.RectApplyAffineTransform(leftbottombounds, t);
            righttopbounds = cc.RectApplyAffineTransform(righttopbounds, t);
            lefttopbounds = cc.RectApplyAffineTransform(lefttopbounds, t);
            rightcenterbounds = cc.RectApplyAffineTransform(rightcenterbounds, t);
            leftcenterbounds = cc.RectApplyAffineTransform(leftcenterbounds, t);
            centerbottombounds = cc.RectApplyAffineTransform(centerbottombounds, t);
            centertopbounds = cc.RectApplyAffineTransform(centertopbounds, t);

            // Centre
            this._centre = new cc.Sprite();
            this._centre.initWithTexture(selTexture, centerbounds);
            this._scale9Image.addChild(this._centre, 0, cc.POSITIONS_CENTRE);

            // Top
            this._top = new cc.Sprite();
            this._top.initWithTexture(selTexture, centertopbounds);
            this._scale9Image.addChild(this._top, 1, cc.POSITIONS_TOP);

            // Bottom
            this._bottom = new cc.Sprite();
            this._bottom.initWithTexture(selTexture, centerbottombounds);
            this._scale9Image.addChild(this._bottom, 1, cc.POSITIONS_BOTTOM);

            // Left
            this._left = new cc.Sprite();
            this._left.initWithTexture(selTexture, leftcenterbounds);
            this._scale9Image.addChild(this._left, 1, cc.POSITIONS_LEFT);

            // Right
            this._right = new cc.Sprite();
            this._right.initWithTexture(selTexture, rightcenterbounds);
            this._scale9Image.addChild(this._right, 1, cc.POSITIONS_RIGHT);

            // Top left
            this._topLeft = new cc.Sprite();
            this._topLeft.initWithTexture(selTexture, lefttopbounds);
            this._scale9Image.addChild(this._topLeft, 2, cc.POSITIONS_TOPLEFT);

            // Top right
            this._topRight = new cc.Sprite();
            this._topRight.initWithTexture(selTexture, righttopbounds);
            this._scale9Image.addChild(this._topRight, 2, cc.POSITIONS_TOPRIGHT);

            // Bottom left
            this._bottomLeft = new cc.Sprite();
            this._bottomLeft.initWithTexture(selTexture, leftbottombounds);
            this._scale9Image.addChild(this._bottomLeft, 2, cc.POSITIONS_BOTTOMLEFT);

            // Bottom right
            this._bottomRight = new cc.Sprite();
            this._bottomRight.initWithTexture(selTexture, rightbottombounds);
            this._scale9Image.addChild(this._bottomRight, 2, cc.POSITIONS_BOTTOMRIGHT);
        } else {
            // set up transformation of coordinates
            // to handle the case where the sprite is stored rotated
            // in the spritesheet
            // CCLog("rotated");

            var t = cc.AffineTransformMakeIdentity();

            var rotatedcenterbounds = centerbounds;
            var rotatedrightbottombounds = rightbottombounds;
            var rotatedleftbottombounds = leftbottombounds;
            var rotatedrighttopbounds = righttopbounds;
            var rotatedlefttopbounds = lefttopbounds;
            var rotatedrightcenterbounds = rightcenterbounds;
            var rotatedleftcenterbounds = leftcenterbounds;
            var rotatedcenterbottombounds = centerbottombounds;
            var rotatedcentertopbounds = centertopbounds;

            t = cc.AffineTransformTranslate(t, rect.size.height + rect.origin.x, rect.origin.y);
            t = cc.AffineTransformRotate(t, 1.57079633);

            centerbounds = cc.RectApplyAffineTransform(centerbounds, t);
            rightbottombounds = cc.RectApplyAffineTransform(rightbottombounds, t);
            leftbottombounds = cc.RectApplyAffineTransform(leftbottombounds, t);
            righttopbounds = cc.RectApplyAffineTransform(righttopbounds, t);
            lefttopbounds = cc.RectApplyAffineTransform(lefttopbounds, t);
            rightcenterbounds = cc.RectApplyAffineTransform(rightcenterbounds, t);
            leftcenterbounds = cc.RectApplyAffineTransform(leftcenterbounds, t);
            centerbottombounds = cc.RectApplyAffineTransform(centerbottombounds, t);
            centertopbounds = cc.RectApplyAffineTransform(centertopbounds, t);

            rotatedcenterbounds.origin = {x: centerbounds.origin.x, y: centerbounds.origin.y};
            rotatedrightbottombounds.origin = {x: rightbottombounds.origin.x, y: rightbottombounds.origin.y};
            rotatedleftbottombounds.origin = {x: leftbottombounds.origin.x, y: leftbottombounds.origin.y};
            rotatedrighttopbounds.origin = {x: righttopbounds.origin.x, y: righttopbounds.origin.y};
            rotatedlefttopbounds.origin = {x: lefttopbounds.origin.x, y: lefttopbounds.origin.y};
            rotatedrightcenterbounds.origin = {x: rightcenterbounds.origin.x, y: rightcenterbounds.origin.y};
            rotatedleftcenterbounds.origin = {x: leftcenterbounds.origin.x, y: leftcenterbounds.origin.y};
            rotatedcenterbottombounds.origin = {x: centerbottombounds.origin.x, y: centerbottombounds.origin.y};
            rotatedcentertopbounds.origin = {x: centertopbounds.origin.x, y: centertopbounds.origin.y};

            // Centre
            this._centre = new cc.Sprite();
            this._centre.initWithTexture(selTexture, rotatedcenterbounds, true);
            this._scale9Image.addChild(this._centre, 0, cc.POSITIONS_CENTRE);

            // Top
            this._top = new cc.Sprite();
            this._top.initWithTexture(selTexture, rotatedcentertopbounds, true);
            this._scale9Image.addChild(this._top, 1, cc.POSITIONS_TOP);

            // Bottom
            this._bottom = new cc.Sprite();
            this._bottom.initWithTexture(selTexture, rotatedcenterbottombounds, true);
            this._scale9Image.addChild(this._bottom, 1, cc.POSITIONS_BOTTOM);

            // Left
            this._left = new cc.Sprite();
            this._left.initWithTexture(selTexture, rotatedleftcenterbounds, true);
            this._scale9Image.addChild(this._left, 1, cc.POSITIONS_LEFT);

            // Right
            this._right = new cc.Sprite();
            this._right.initWithTexture(selTexture, rotatedrightcenterbounds, true);
            this._scale9Image.addChild(this._right, 1, cc.POSITIONS_RIGHT);

            // Top left
            this._topLeft = new cc.Sprite();
            this._topLeft.initWithTexture(selTexture, rotatedlefttopbounds, true);
            this._scale9Image.addChild(this._topLeft, 2, cc.POSITIONS_TOPLEFT);

            // Top right
            this._topRight = new cc.Sprite();
            this._topRight.initWithTexture(selTexture, rotatedrighttopbounds, true);
            this._scale9Image.addChild(this._topRight, 2, cc.POSITIONS_TOPRIGHT);

            // Bottom left
            this._bottomLeft = new cc.Sprite();
            this._bottomLeft.initWithTexture(selTexture, rotatedleftbottombounds, true);
            this._scale9Image.addChild(this._bottomLeft, 2, cc.POSITIONS_BOTTOMLEFT);

            // Bottom right
            this._bottomRight = new cc.Sprite();
            this._bottomRight.initWithTexture(selTexture, rotatedrightbottombounds, true);
            this._scale9Image.addChild(this._bottomRight, 2, cc.POSITIONS_BOTTOMRIGHT);
        }

        this.setContentSize(rect.size);
        this.addChild(this._scale9Image);

        if (this._spritesGenerated) {
            // Restore color and opacity
            this.setOpacity(opacity);
            this.setColor(color);
        }
        this._spritesGenerated = true;
        return true;
    },

    setSpriteFrame: function (spriteFrame) {
        var batchNode = cc.SpriteBatchNode.createWithTexture(spriteFrame.getTexture(), 9);
        // the texture is rotated on Canvas render mode, so isRotated always is false.
        this.updateWithBatchNode(batchNode, spriteFrame.getRect(), cc.Browser.supportWebGL ? spriteFrame.isRotated() : false, cc.RectZero());

        // Reset insets
        this._insetLeft = 0;
        this._insetTop = 0;
        this._insetRight = 0;
        this._insetBottom = 0;
    },

    setColor: function (color) {
        this._color = color;
        var scaleChildren = this._scale9Image.getChildren();
        if (scaleChildren) {
            for (var i = 0; i < scaleChildren.length; i++) {
                scaleChildren[i].setColor(this._color);
            }
        }
    },

    setOpacity: function (opacity) {
        this._opacity = opacity;
        var scaleChildren = this._scale9Image.getChildren();
        if (scaleChildren) {
            for (var i = 0; i < scaleChildren.length; i++) {
                scaleChildren[i].setOpacity(this._color);
            }
        }
    }
});

/**
 * Creates a 9-slice sprite with a texture file, a delimitation zone and
 * with the specified cap insets.
 *
 * @see initWithFile:rect:centerRegion:
 */
cc.Scale9Sprite.create = function (file, rect, capInsets) {
    var pReturn;
    if (arguments.length === 2) {
        if (typeof(file) == "string") {
            pReturn = new cc.Scale9Sprite();
            if (pReturn && pReturn.initWithFile(file, rect)) {
                return pReturn;
            }
        } else if (file instanceof cc.Rect) {
            pReturn = new cc.Scale9Sprite();
            if (pReturn && pReturn.initWithFile(file, capInsets)) {
                return pReturn;
            }
        }
    } else if (arguments.length === 3) {
        pReturn = new cc.Scale9Sprite();
        if (pReturn && pReturn.initWithFile(file, rect, capInsets)) {
            return pReturn;
        }
    } else if (arguments.length === 1) {
        pReturn = new cc.Scale9Sprite();
        if (pReturn && pReturn.initWithFile(file)) {
            return pReturn;
        }
    } else if (arguments.length === 0) {
        pReturn = new cc.Scale9Sprite();
        if (pReturn && pReturn.init()) {
            return pReturn;
        }
    }
    return null;
};

cc.Scale9Sprite.createWithSpriteFrame = function (spriteFrame, capInsets) {
    var pReturn = new cc.Scale9Sprite();
    if (pReturn && pReturn.initWithSpriteFrame(spriteFrame, capInsets)) {
        return pReturn;
    }
    return null;
};

cc.Scale9Sprite.createWithSpriteFrameName = function (spriteFrameName, capInsets) {
    cc.Assert(spriteFrameName != null, "spriteFrameName must be non-NULL");
    var pReturn = new cc.Scale9Sprite();
    if (pReturn && pReturn.initWithSpriteFrameName(spriteFrameName, capInsets)) {
        return pReturn;
    }
    return null;
};
