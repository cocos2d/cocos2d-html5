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
cc.Scale9Sprite = cc.NodeRGBA.extend(/** @lends cc.Scale9Sprite# */{
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
        var insets, locInsetLeft = this._insetLeft, locInsetTop = this._insetTop, locInsetRight = this._insetRight;
        var locSpriteRect = this._spriteRect, locInsetBottom = this._insetBottom;
        if (locInsetLeft === 0 && locInsetTop === 0 && locInsetRight === 0 && locInsetBottom === 0) {
            insets = cc.RectZero();
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
        var locTopLeft = this._topLeft, locTopRight = this._topRight, locBottomRight = this._bottomRight;
        var locCenter = this._centre, locCenterContentSize = this._centre.getContentSize();

        var sizableWidth = size.width - locTopLeft.getContentSize().width - locTopRight.getContentSize().width;
        var sizableHeight = size.height - locTopLeft.getContentSize().height - locBottomRight.getContentSize().height;
        var horizontalScale = sizableWidth / locCenterContentSize.width;
        var verticalScale = sizableHeight / locCenterContentSize.height;
        var rescaledWidth = locCenterContentSize.width * horizontalScale;
        var rescaledHeight = locCenterContentSize.height * verticalScale;

        var locBottomLeft = this._bottomLeft;
        var leftWidth = locBottomLeft.getContentSize().width;
        var bottomHeight = locBottomLeft.getContentSize().height;

        if(!cc.Browser.supportWebGL) {
            //browser is in canvas mode, need to manually control rounding to prevent overlapping pixels
            var roundedRescaledWidth = Math.round(rescaledWidth);
            if(rescaledWidth != roundedRescaledWidth) {
                rescaledWidth = roundedRescaledWidth;
                horizontalScale = rescaledWidth/locCenterContentSize.width;
            }
            var roundedRescaledHeight = Math.round(rescaledHeight);
            if(rescaledHeight != roundedRescaledHeight) {
                rescaledHeight = roundedRescaledHeight;
                verticalScale = rescaledHeight/locCenterContentSize.height;
            }
        }
        locCenter.setScaleX(horizontalScale);
        locCenter.setScaleY(verticalScale);

        var locLeft = this._left, locRight = this._right, locTop = this._top, locBottom = this._bottom;
        var tempAP = cc.p(0, 0);
        locBottomLeft.setAnchorPoint(tempAP);
        locBottomRight.setAnchorPoint(tempAP);
        locTopLeft.setAnchorPoint(tempAP);
        locTopRight.setAnchorPoint(tempAP);
        locLeft.setAnchorPoint(tempAP);
        locRight.setAnchorPoint(tempAP);
        locTop.setAnchorPoint(tempAP);
        locBottom.setAnchorPoint(tempAP);
        locCenter.setAnchorPoint(tempAP);

        // Position corners
        locBottomLeft.setPosition(0, 0);
        locBottomRight.setPosition(leftWidth + rescaledWidth, 0);
        locTopLeft.setPosition(0, bottomHeight + rescaledHeight);
        locTopRight.setPosition(leftWidth + rescaledWidth, bottomHeight + rescaledHeight);

        // Scale and position borders
        locLeft.setPosition(0, bottomHeight);
        locLeft.setScaleY(verticalScale);
        locRight.setPosition(leftWidth + rescaledWidth, bottomHeight);
        locRight.setScaleY(verticalScale);
        locBottom.setPosition(leftWidth, 0);
        locBottom.setScaleX(horizontalScale);
        locTop.setPosition(leftWidth, bottomHeight + rescaledHeight);
        locTop.setScaleX(horizontalScale);

        // Position centre
        locCenter.setPosition(leftWidth, bottomHeight);
    },

    ctor: function () {
        cc.NodeRGBA.prototype.ctor.call(this);
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
        if(!this._scale9Image){
            return;
        }
        this._opacity = opacity;
        var scaleChildren = this._scale9Image.getChildren();
        for (var i = 0; i < scaleChildren.length; i++) {
            var selChild = scaleChildren[i];
            if (selChild && selChild.RGBAProtocol)
                selChild.setOpacity(opacity);
        }
    },

    /** Color: conforms to CCRGBAProtocol protocol */
    getColor: function () {
        return this._color;
    },
    setColor: function (color) {
        if(!this._scale9Image){
            return;
        }
        this._color = color;
        var scaleChildren = this._scale9Image.getChildren();
        for (var i = 0; i < scaleChildren.length; i++) {
            var selChild = scaleChildren[i];
            if (selChild && selChild.RGBAProtocol)
                selChild.setColor(color);
        }
    },

    getCapInsets: function () {
        return this._capInsets;
    },

    setCapInsets: function (capInsets) {
        if(!this._scale9Image){
            return;
        }
        //backup the contentSize
        var contentSize = this._contentSize;
        contentSize = new cc.Size(contentSize.width,contentSize.height);

        this.updateWithBatchNode(this._scale9Image, this._spriteRect, this._spriteFrameRotated, capInsets);
        //restore the contentSize
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
        cc.Node.prototype.setContentSize.call(this, size);
        this._positionsAreDirty = true;
    },

    visit: function () {
        if (this._positionsAreDirty) {
            this._updatePositions();
            this._positionsAreDirty = false;
        }
        cc.NodeRGBA.prototype.visit.call(this);
    },

    init: function () {
        return this.initWithBatchNode(null, cc.RectZero(), false, cc.RectZero());
    },

    initWithBatchNode: function (batchNode, rect, rotated, capInsets) {
        if (arguments.length === 3) {
            capInsets = rotated;
            rotated = false;
        }

        if (batchNode) {
            this.updateWithBatchNode(batchNode, rect, rotated, capInsets);
        }
        this.setAnchorPoint(cc.p(0.5, 0.5));
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

        if(!file)
            throw "cc.Scale9Sprite.initWithFile(): file should be non-null";
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
        if(!spriteFrame || !spriteFrame.getTexture())
            throw "cc.Scale9Sprite.initWithSpriteFrame(): spriteFrame should be non-null and its texture should be non-null";

        capInsets = capInsets || cc.RectZero();

        if(!spriteFrame.textureLoaded()){
            spriteFrame.addLoadedEventListener(function(sender){
                // the texture is rotated on Canvas render mode, so isRotated always is false.
                var preferredSize = this._preferredSize;
                preferredSize = cc.size(preferredSize.width, preferredSize.height);
                this.updateWithBatchNode(this._scale9Image, sender.getRect(), cc.Browser.supportWebGL ? sender.isRotated() : false, this._capInsets);
                this.setPreferredSize(preferredSize);
                this._positionsAreDirty = true;
            },this);
        }
        var batchNode = cc.SpriteBatchNode.createWithTexture(spriteFrame.getTexture(), 9);
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
        if(!spriteFrameName)
            throw "cc.Scale9Sprite.initWithSpriteFrameName(): spriteFrameName should be non-null";
        capInsets = capInsets || cc.RectZero();

        var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(spriteFrameName);
        if (frame == null) {
            cc.log("cc.Scale9Sprite.initWithSpriteFrameName(): can't find the sprite frame by spriteFrameName");
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
        if(!this._scale9Image){
            return;
        }
        this._opacityModifyRGB = value;
        var scaleChildren = this._scale9Image.getChildren();
        if (scaleChildren) {
            for (var i = 0, len = scaleChildren.length; i < len; i++)
                scaleChildren[i].setOpacityModifyRGB(value);
        }
    },

    /** returns whether or not the opacity will be applied using glColor(R,G,B,opacity) or glColor(opacity, opacity, opacity, opacity);
     @since v0.8
     */
    isOpacityModifyRGB: function () {
        return this._opacityModifyRGB;
    },

    updateWithBatchNode: function (batchNode, originalRect, rotated, capInsets) {
        var opacity = this.getOpacity();
        var color = this.getColor();
        var rect = cc.rect(originalRect.x, originalRect.y, originalRect.width, originalRect.height);

        // Release old sprites
        this.removeAllChildren(true);

        if (this._scale9Image != batchNode){
            this._scale9Image = batchNode;
            var tmpTexture = batchNode.getTexture();
            if(!tmpTexture.isLoaded()){
                tmpTexture.addLoadedEventListener(function(sender){
                    this._positionsAreDirty = true;
                },this);
            }
        }

        var locScale9Image = this._scale9Image;
        locScale9Image.removeAllChildren(true);

        //this._capInsets = capInsets;
        var locCapInsets = this._capInsets;
        locCapInsets.x = capInsets.x;
        locCapInsets.y = capInsets.y;
        locCapInsets.width = capInsets.width;
        locCapInsets.height = capInsets.height;
        this._spriteFrameRotated = rotated;

        var selTexture = locScale9Image.getTexture();

        // If there is no given rect
        if (cc._rectEqualToZero(rect)) {
            // Get the texture size as original
            var textureSize = selTexture.getContentSize();
            rect = cc.rect(0, 0, textureSize.width, textureSize.height);
        }

        // Set the given rect's size as original size
        this._spriteRect = rect;
        var locSpriteRect = this._spriteRect;
        locSpriteRect.x = rect.x;
        locSpriteRect.y = rect.y;
        locSpriteRect.width = rect.width;
        locSpriteRect.height = rect.height;

        var rectSize = rect.size;
        this._originalSize.width = rectSize.width;
        this._originalSize.height = rectSize.height;

        var locPreferredSize = this._preferredSize;
        if(locPreferredSize.width === 0 && locPreferredSize.height === 0){
            locPreferredSize.width = rectSize.width;
            locPreferredSize.height = rectSize.height;
        }

        var locCapInsetsInternal = this._capInsetsInternal;
        if(capInsets){
            locCapInsetsInternal.x = capInsets.x;
            locCapInsetsInternal.y = capInsets.y;
            locCapInsetsInternal.width = capInsets.width;
            locCapInsetsInternal.height = capInsets.height;
        }
        var w = rectSize.width;
        var h = rectSize.height;

        // If there is no specified center region
        if (cc._rectEqualToZero(locCapInsetsInternal)) {
            // CCLog("... cap insets not specified : using default cap insets ...");
            locCapInsetsInternal.x = w / 3;
            locCapInsetsInternal.y = h / 3;
            locCapInsetsInternal.width = w / 3;
            locCapInsetsInternal.height = h / 3;
        }

        var left_w = locCapInsetsInternal.x;
        var center_w = locCapInsetsInternal.width;
        var right_w = w - (left_w + center_w);

        var top_h = locCapInsetsInternal.y;
        var center_h = locCapInsetsInternal.height;
        var bottom_h = h - (top_h + center_h);

        // calculate rects
        // ... top row
        var x = 0.0;
        var y = 0.0;

        // top left
        var lefttopbounds = cc.rect(x, y, left_w, top_h);

        // top center
        x += left_w;
        var centertopbounds = cc.rect(x, y, center_w, top_h);

        // top right
        x += center_w;
        var righttopbounds = cc.rect(x, y, right_w, top_h);

        // ... center row
        x = 0.0;
        y = 0.0;

        y += top_h;
        // center left
        var leftcenterbounds = cc.rect(x, y, left_w, center_h);

        // center center
        x += left_w;
        var centerbounds = cc.rect(x, y, center_w, center_h);

        // center right
        x += center_w;
        var rightcenterbounds = cc.rect(x, y, right_w, center_h);

        // ... bottom row
        x = 0.0;
        y = 0.0;
        y += top_h;
        y += center_h;

        // bottom left
        var leftbottombounds = cc.rect(x, y, left_w, bottom_h);

        // bottom center
        x += left_w;
        var centerbottombounds = cc.rect(x, y, center_w, bottom_h);

        // bottom right
        x += center_w;
        var rightbottombounds = cc.rect(x, y, right_w, bottom_h);

        var t = cc.AffineTransformMakeIdentity();
        if (!rotated) {
            // CCLog("!rotated");
            t = cc.AffineTransformTranslate(t, rect.x, rect.y);

            cc._RectApplyAffineTransformIn(centerbounds, t);
            cc._RectApplyAffineTransformIn(rightbottombounds, t);
            cc._RectApplyAffineTransformIn(leftbottombounds, t);
            cc._RectApplyAffineTransformIn(righttopbounds, t);
            cc._RectApplyAffineTransformIn(lefttopbounds, t);
            cc._RectApplyAffineTransformIn(rightcenterbounds, t);
            cc._RectApplyAffineTransformIn(leftcenterbounds, t);
            cc._RectApplyAffineTransformIn(centerbottombounds, t);
            cc._RectApplyAffineTransformIn(centertopbounds, t);

            // Centre
            this._centre = new cc.Sprite();
            this._centre.initWithTexture(selTexture, centerbounds);
            locScale9Image.addChild(this._centre, 0, cc.POSITIONS_CENTRE);

            // Top
            this._top = new cc.Sprite();
            this._top.initWithTexture(selTexture, centertopbounds);
            locScale9Image.addChild(this._top, 1, cc.POSITIONS_TOP);

            // Bottom
            this._bottom = new cc.Sprite();
            this._bottom.initWithTexture(selTexture, centerbottombounds);
            locScale9Image.addChild(this._bottom, 1, cc.POSITIONS_BOTTOM);

            // Left
            this._left = new cc.Sprite();
            this._left.initWithTexture(selTexture, leftcenterbounds);
            locScale9Image.addChild(this._left, 1, cc.POSITIONS_LEFT);

            // Right
            this._right = new cc.Sprite();
            this._right.initWithTexture(selTexture, rightcenterbounds);
            locScale9Image.addChild(this._right, 1, cc.POSITIONS_RIGHT);

            // Top left
            this._topLeft = new cc.Sprite();
            this._topLeft.initWithTexture(selTexture, lefttopbounds);
            locScale9Image.addChild(this._topLeft, 2, cc.POSITIONS_TOPLEFT);

            // Top right
            this._topRight = new cc.Sprite();
            this._topRight.initWithTexture(selTexture, righttopbounds);
            locScale9Image.addChild(this._topRight, 2, cc.POSITIONS_TOPRIGHT);

            // Bottom left
            this._bottomLeft = new cc.Sprite();
            this._bottomLeft.initWithTexture(selTexture, leftbottombounds);
            locScale9Image.addChild(this._bottomLeft, 2, cc.POSITIONS_BOTTOMLEFT);

            // Bottom right
            this._bottomRight = new cc.Sprite();
            this._bottomRight.initWithTexture(selTexture, rightbottombounds);
            locScale9Image.addChild(this._bottomRight, 2, cc.POSITIONS_BOTTOMRIGHT);
        } else {
            // set up transformation of coordinates
            // to handle the case where the sprite is stored rotated
            // in the spritesheet
            // CCLog("rotated");
            var rotatedcenterbounds = centerbounds;
            var rotatedrightbottombounds = rightbottombounds;
            var rotatedleftbottombounds = leftbottombounds;
            var rotatedrighttopbounds = righttopbounds;
            var rotatedlefttopbounds = lefttopbounds;
            var rotatedrightcenterbounds = rightcenterbounds;
            var rotatedleftcenterbounds = leftcenterbounds;
            var rotatedcenterbottombounds = centerbottombounds;
            var rotatedcentertopbounds = centertopbounds;

            t = cc.AffineTransformTranslate(t, rect.height + rect.x, rect.y);
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

            rotatedcenterbounds.x = centerbounds.x;
            rotatedcenterbounds.y = centerbounds.y;

            rotatedrightbottombounds.x = rightbottombounds.x;
            rotatedrightbottombounds.y = rightbottombounds.y;

            rotatedleftbottombounds.x = leftbottombounds.x;
            rotatedleftbottombounds.y = leftbottombounds.y;

            rotatedrighttopbounds.x = righttopbounds.x;
            rotatedrighttopbounds.y = righttopbounds.y;

            rotatedlefttopbounds.x = lefttopbounds.x;
            rotatedlefttopbounds.y = lefttopbounds.y;

            rotatedrightcenterbounds.x = rightcenterbounds.x;
            rotatedrightcenterbounds.y = rightcenterbounds.y;

            rotatedleftcenterbounds.x = leftcenterbounds.x;
            rotatedleftcenterbounds.y = leftcenterbounds.y;

            rotatedcenterbottombounds.x = centerbottombounds.x;
            rotatedcenterbottombounds.y = centerbottombounds.y;

            rotatedcentertopbounds.x = centertopbounds.x;
            rotatedcentertopbounds.y = centertopbounds.y;

            // Centre
            this._centre = new cc.Sprite();
            this._centre.initWithTexture(selTexture, rotatedcenterbounds, true);
            locScale9Image.addChild(this._centre, 0, cc.POSITIONS_CENTRE);

            // Top
            this._top = new cc.Sprite();
            this._top.initWithTexture(selTexture, rotatedcentertopbounds, true);
            locScale9Image.addChild(this._top, 1, cc.POSITIONS_TOP);

            // Bottom
            this._bottom = new cc.Sprite();
            this._bottom.initWithTexture(selTexture, rotatedcenterbottombounds, true);
            locScale9Image.addChild(this._bottom, 1, cc.POSITIONS_BOTTOM);

            // Left
            this._left = new cc.Sprite();
            this._left.initWithTexture(selTexture, rotatedleftcenterbounds, true);
            locScale9Image.addChild(this._left, 1, cc.POSITIONS_LEFT);

            // Right
            this._right = new cc.Sprite();
            this._right.initWithTexture(selTexture, rotatedrightcenterbounds, true);
            locScale9Image.addChild(this._right, 1, cc.POSITIONS_RIGHT);

            // Top left
            this._topLeft = new cc.Sprite();
            this._topLeft.initWithTexture(selTexture, rotatedlefttopbounds, true);
            locScale9Image.addChild(this._topLeft, 2, cc.POSITIONS_TOPLEFT);

            // Top right
            this._topRight = new cc.Sprite();
            this._topRight.initWithTexture(selTexture, rotatedrighttopbounds, true);
            locScale9Image.addChild(this._topRight, 2, cc.POSITIONS_TOPRIGHT);

            // Bottom left
            this._bottomLeft = new cc.Sprite();
            this._bottomLeft.initWithTexture(selTexture, rotatedleftbottombounds, true);
            locScale9Image.addChild(this._bottomLeft, 2, cc.POSITIONS_BOTTOMLEFT);

            // Bottom right
            this._bottomRight = new cc.Sprite();
            this._bottomRight.initWithTexture(selTexture, rotatedrightbottombounds, true);
            locScale9Image.addChild(this._bottomRight, 2, cc.POSITIONS_BOTTOMRIGHT);
        }

        this.setContentSize(rect.size);
        this.addChild(locScale9Image);

        if (this._spritesGenerated) {
            // Restore color and opacity
            this.setOpacity(opacity);
            if(color.r !== 255 || color.g !== 255 || color.b !== 255){
                this.setColor(color);
            }
        }
        this._spritesGenerated = true;
        return true;
    },

    setSpriteFrame: function (spriteFrame) {
        var batchNode = cc.SpriteBatchNode.createWithTexture(spriteFrame.getTexture(), 9);
        // the texture is rotated on Canvas render mode, so isRotated always is false.
        if(!spriteFrame.textureLoaded()){
            spriteFrame.addLoadedEventListener(function(sender){
                // the texture is rotated on Canvas render mode, so isRotated always is false.
                var preferredSize = this._preferredSize;
                preferredSize = cc.size(preferredSize.width, preferredSize.height);
                this.updateWithBatchNode(this._scale9Image, sender.getRect(), cc.Browser.supportWebGL ? sender.isRotated() : false, this._capInsets);
                this.setPreferredSize(preferredSize);
                this._positionsAreDirty = true;
            },this);
        }
        this.updateWithBatchNode(batchNode, spriteFrame.getRect(), cc.Browser.supportWebGL ? spriteFrame.isRotated() : false, cc.RectZero());

        // Reset insets
        this._insetLeft = 0;
        this._insetTop = 0;
        this._insetRight = 0;
        this._insetBottom = 0;
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
    if(!spriteFrameName)
        throw "cc.Scale9Sprite.createWithSpriteFrameName(): spriteFrameName should be non-null";
    var pReturn = new cc.Scale9Sprite();
    if (pReturn && pReturn.initWithSpriteFrameName(spriteFrameName, capInsets))
        return pReturn;
    return null;
};
