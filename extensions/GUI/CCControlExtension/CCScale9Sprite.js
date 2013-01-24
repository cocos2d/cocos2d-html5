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

cc.Scale9Sprite = cc.Node.extend({
    RGBAProtocol:true,

    _spriteRect:null,
    _capInsetsInternal:null,
    _positionsAreDirty:false,

    _scale9Image:null,
    _topLeft:null,
    _top:null,
    _topRight:null,
    _left:null,
    _centre:null,
    _right:null,
    _bottomLeft:null,
    _bottom:null,
    _bottomRight:null,

    _colorUnmodified:null,
    _isOpacityModifyRGB:false,

    _originalSize:null,
    _preferredSize:null,
    _opacity:0,
    _color:null,
    _capInsets:null,
    _insetLeft:0,
    _insetTop:0,
    _insetRight:0,
    _insetBottom:0,

    _updateCapInset:function () {
        var insets;
        if (this._insetLeft == 0 && this._insetTop == 0 && this._insetRight == 0 && this._insetBottom == 0) {
            insets = cc.RectZero();
        } else {
            insets = cc.RectMake(this._insetLeft,
                this._insetTop,
                this._spriteRect.size.width - this._insetLeft - this._insetRight,
                this._spriteRect.size.height - this._insetTop - this._insetBottom);
        }
        this.setCapInsets(insets);
    },

    _updatePositions:function () {
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

    ctor:function () {
        this._spriteRect = cc.RectZero();
        this._capInsetsInternal = cc.RectZero();

        this._colorUnmodified = cc.white();
        this._originalSize = new cc.Size(0, 0);
        this._preferredSize = new cc.Size(0, 0);
        this._color = cc.white();
        this._capInsets = cc.RectZero();
    },

    /** Original sprite's size. */
    getOriginalSize:function () {
        return this._originalSize;
    },
    setOriginalSize:function (originalSize) {
        this._originalSize = originalSize;
    },

    //if the preferredSize component is given as -1, it is ignored
    getPreferredSize:function () {
        return this._preferredSize;
    },
    setPreferredSize:function (preferredSize) {
        this.setContentSize(preferredSize);
        this._preferredSize = preferredSize;
    },

    /** Opacity: conforms to CCRGBAProtocol protocol */
    getOpacity:function () {
        return this._opacity;
    },
    setOpacity:function (opacity) {
        this._opacity = opacity;
    },

    /** Color: conforms to CCRGBAProtocol protocol */
    getColor:function () {
        return this._color;
    },
    setColor:function (color) {
        this._color = color;
        var scaleChildren = this._scale9Image.getChildren();
        if (scaleChildren && scaleChildren.length != 0) {
            for (var i = 0; i < scaleChildren.length; i++) {
                if (scaleChildren[i] && scaleChildren.RGBAProtocol) {
                    scaleChildren[i].setColor(this._color);
                }
            }
        }
    },

    getCapInsets:function () {
        return this._capInsets;
    },
    setCapInsets:function (capInsets) {
        var contentSize = this._contentSize;
        this.updateWithBatchNode(this._scale9Image, this._spriteRect, false, capInsets);
        this.setContentSize(contentSize);
    },

    getInsetLeft:function () {
        return this._insetLeft;
    },
    setInsetLeft:function (insetLeft) {
        this._insetLeft = insetLeft;
        this._updateCapInset();
    },

    getInsetTop:function () {
        return this._insetTop;
    },
    setInsetTop:function (insetTop) {
        this._insetTop = insetTop;
        this._updateCapInset();
    },

    getInsetRight:function () {
        return this._insetRight;
    },
    setInsetRight:function (insetRight) {
        this._insetRight = insetRight;
        this._updateCapInset();
    },

    getInsetBottom:function () {
        return this._insetBottom;
    },
    setInsetBottom:function (insetBottom) {
        this._insetBottom = insetBottom;
        this._updateCapInset();
    },

    setContentSize:function (size) {
        this._super(size);
        this.m_positionsAreDirty = true;
    },

    visit:function () {
        if (this.m_positionsAreDirty) {
            this._updatePositions();
            this.m_positionsAreDirty = false;
        }
        this._super();
    },

    init:function () {
        return this.initWithBatchNode(null, cc.RectZero(), false, cc.RectZero());
    },

    initWithBatchNode:function (batchNode, rect, unused, capInsets) {
        if (batchNode) {
            this.updateWithBatchNode(batchNode, rect, unused, capInsets);
        }
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
    initWithFile:function (file, rect, capInsets) {
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
    initWithSpriteFrame:function (spriteFrame, capInsets) {
        capInsets = capInsets || cc.RectZero();

        cc.Assert(spriteFrame != null, "Sprite frame must not be nil");

        var batchNode = cc.SpriteBatchNode.createWithTexture(spriteFrame.getTexture(), 9);
        return this.initWithBatchNode(batchNode, spriteFrame.getRect(), false, capInsets);
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
    initWithSpriteFrameName:function (spriteFrameName, capInsets) {
        capInsets = capInsets || cc.RectZero();

        cc.Assert(spriteFrameName != null, "Invalid spriteFrameName for sprite");
        var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(spriteFrameName);
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
    resizableSpriteWithCapInsets:function (capInsets) {
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
    setOpacityModifyRGB:function (value) {
        this._isOpacityModifyRGB = value;
        var scaleChildren = this._scale9Image.getChildren();
        if (scaleChildren && scaleChildren.length != 0) {
            for (var i = 0; i < scaleChildren.length; i++) {
                if (scaleChildren[i] && scaleChildren.RGBAProtocol) {
                    scaleChildren[i].setOpacityModifyRGB(this._isOpacityModifyRGB);
                }
            }
        }
    },

    /** returns whether or not the opacity will be applied using glColor(R,G,B,opacity) or glColor(opacity, opacity, opacity, opacity);
     @since v0.8
     */
    isOpacityModifyRGB:function () {
        return this._isOpacityModifyRGB;
    },

    updateWithBatchNode:function (batchNode, rect, unused, capInsets) {
        // Release old sprites
        this.removeAllChildren(true);

        if (this._scale9Image != batchNode) {
            this._scale9Image = batchNode;
        }

        this._scale9Image.removeAllChildren(true);

        this._capInsets = capInsets;

        // If there is no given rect
        if (cc.Rect.CCRectEqualToRect(rect, cc.RectZero())) {
            // Get the texture size as original
            var selTexture  = this._scale9Image.getTextureAtlas().getTexture();
            if(selTexture instanceof  cc.Texture2D){
                var textureSize = selTexture.getContentSize();
                rect = cc.RectMake(0, 0, textureSize.width, textureSize.height);
            }else{
                rect = cc.RectMake(0, 0, selTexture.width, selTexture.height);
            }
        }

        // Set the given rect's size as original size
        this._spriteRect = rect;
        this._originalSize = new cc.Size(rect.size.width, rect.size.height);
        this._preferredSize = this._originalSize;
        this._capInsetsInternal = capInsets || cc.RectZero();

        // If there is no specified center region
        if (cc.Rect.CCRectEqualToRect(this._capInsetsInternal, cc.RectZero()) ||
            cc.Rect.CCRectEqualToRect(this._capInsetsInternal, this._spriteRect)) {
            // Apply the 3x3 grid format
            this._capInsetsInternal = cc.RectMake(
                rect.origin.x + this._originalSize.width / 3,
                rect.origin.y + this._originalSize.height / 3,
                this._originalSize.width / 3,
                this._originalSize.height / 3);
            this._capInsets = null;
        }
        else
        {
            this._capInsetsInternal = cc.RectMake(
                rect.origin.x + this._capInsetsInternal.origin.x,
                rect.origin.y + this._capInsetsInternal.origin.y,
                this._capInsetsInternal.size.width,
                this._capInsetsInternal.size.height
            );
        }

        // Get the image edges
        var l = rect.origin.x;
        var t = rect.origin.y;
        var h = rect.size.height;
        var w = rect.size.width;

        //
        // Set up the image
        //

        // Centre
        this._centre = cc.Sprite.createWithTexture(this._scale9Image.getTexture(), this._capInsetsInternal);
        this._scale9Image.addChild(this._centre, 0, cc.POSITIONS_CENTRE);

        // Top
        this._top = cc.Sprite.createWithTexture(this._scale9Image.getTexture(), cc.RectMake(this._capInsetsInternal.origin.x, t, this._capInsetsInternal.size.width,
            this._capInsetsInternal.origin.y - t));
        this._scale9Image.addChild(this._top, 1, cc.POSITIONS_TOP);

        // Bottom
        this._bottom = cc.Sprite.createWithTexture(this._scale9Image.getTexture(), cc.RectMake(this._capInsetsInternal.origin.x,
            this._capInsetsInternal.origin.y + this._capInsetsInternal.size.height, this._capInsetsInternal.size.width,
            h - (this._capInsetsInternal.origin.y - t + this._capInsetsInternal.size.height)));
        this._scale9Image.addChild(this._bottom, 1, cc.POSITIONS_BOTTOM);

        // Left
        this._left = cc.Sprite.createWithTexture(this._scale9Image.getTexture(), cc.RectMake(
            l, this._capInsetsInternal.origin.y, this._capInsetsInternal.origin.x - l,
            this._capInsetsInternal.size.height));
        this._scale9Image.addChild(this._left, 1, cc.POSITIONS_LEFT);

        // Right
        this._right = cc.Sprite.createWithTexture(this._scale9Image.getTexture(), cc.RectMake(
            this._capInsetsInternal.origin.x + this._capInsetsInternal.size.width,
            this._capInsetsInternal.origin.y,
            w - (this._capInsetsInternal.origin.x - l + this._capInsetsInternal.size.width),
            this._capInsetsInternal.size.height));
        this._scale9Image.addChild(this._right, 1, cc.POSITIONS_RIGHT);

        // Top left
        this._topLeft = cc.Sprite.createWithTexture(this._scale9Image.getTexture(), cc.RectMake(
            l, t, this._capInsetsInternal.origin.x - l, this._capInsetsInternal.origin.y - t));
        this._scale9Image.addChild(this._topLeft, 2, cc.POSITIONS_TOPLEFT);

        // Top right
        this._topRight = cc.Sprite.createWithTexture(this._scale9Image.getTexture(), cc.RectMake(
            this._capInsetsInternal.origin.x + this._capInsetsInternal.size.width, t,
            w - (this._capInsetsInternal.origin.x - l + this._capInsetsInternal.size.width),
            this._capInsetsInternal.origin.y - t));
        this._scale9Image.addChild(this._topRight, 2, cc.POSITIONS_TOPRIGHT);

        // Bottom left
        this._bottomLeft = cc.Sprite.createWithTexture(this._scale9Image.getTexture(), cc.RectMake(
            l, this._capInsetsInternal.origin.y + this._capInsetsInternal.size.height,
            this._capInsetsInternal.origin.x - l, h - (this._capInsetsInternal.origin.y - t + this._capInsetsInternal.size.height)));
        this._scale9Image.addChild(this._bottomLeft, 2, cc.POSITIONS_BOTTOMLEFT);

        // Bottom right
        this._bottomRight = cc.Sprite.createWithTexture(this._scale9Image.getTexture(), cc.RectMake(
            this._capInsetsInternal.origin.x + this._capInsetsInternal.size.width,
            this._capInsetsInternal.origin.y + this._capInsetsInternal.size.height,
            w - (this._capInsetsInternal.origin.x - l + this._capInsetsInternal.size.width),
            h - (this._capInsetsInternal.origin.y - t + this._capInsetsInternal.size.height)));
        this._scale9Image.addChild(this._bottomRight, 2, cc.POSITIONS_BOTTOMRIGHT);

        this.setContentSize(rect.size);
        this.addChild(this._scale9Image);
        this.setAnchorPoint(cc.p(0.5, 0.5));
        return true;
    },

    setSpriteFrame:function (spriteFrame) {
        var batchNode = cc.SpriteBatchNode.createWithTexture(spriteFrame.getTexture(), 9);
        this.updateWithBatchNode(batchNode, spriteFrame.getRect(), false, cc.RectZero());

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
    if (arguments.length == 2) {
        if (typeof(file) == "string") {
            pReturn = new cc.Scale9Sprite();
            if (pReturn && pReturn.initWithFile(file, rect)) {
                return pReturn;
            }
            return null;
        } else if (file instanceof cc.Rect) {
            pReturn = new cc.Scale9Sprite();
            if (pReturn && pReturn.initWithFile(file, capInsets)) {
                return pReturn;
            }
            return null;
        }
    } else if (arguments.length == 3) {
        pReturn = new cc.Scale9Sprite();
        if (pReturn && pReturn.initWithFile(file, rect, capInsets)) {
            return pReturn;
        }
        return null;
    } else if (arguments.length == 1) {
        pReturn = new cc.Scale9Sprite();
        if (pReturn && pReturn.initWithFile(file)) {
            return pReturn;
        }
        return null;
    } else if (arguments.length == 0) {
        pReturn = new cc.Scale9Sprite();
        if (pReturn) {
            return pReturn;
        }
        return null;
    }
};

cc.Scale9Sprite.createWithSpriteFrame = function (spriteFrame, capInsets) {
    var pReturn = new cc.Scale9Sprite();
    if (pReturn && pReturn.initWithSpriteFrame(spriteFrame, capInsets)) {
        return pReturn;
    }
    return null;
};

cc.Scale9Sprite.createWithSpriteFrameName = function (spriteFrameName, capInsets) {
    var pReturn = new cc.Scale9Sprite();
    if (pReturn && pReturn.initWithSpriteFrameName(spriteFrameName, capInsets)) {
        return pReturn;
    }
    return null;
};
