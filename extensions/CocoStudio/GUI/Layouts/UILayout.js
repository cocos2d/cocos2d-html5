/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org

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
 * layoutBackGround color type
 * @type {Object}
 */
ccs.LayoutBackGroundColorType = {
    none: 0,
    solid: 1,
    gradient: 2
};

/**
 * Layout type
 * @type {Object}
 */
ccs.LayoutType = {
    absolute: 0,
    linearVertical: 1,
    linearHorizontal: 2,
    relative: 3
};

/**
 * Layout type
 * @type {Object}
 */
ccs.LayoutClippingType = {
    stencil: 0,
    scissor: 1
};

/**
 * Base class for ccs.UILayout
 * @class
 * @extends ccs.UIWidget
 */
ccs.UILayout = ccs.UIWidget.extend(/** @lends ccs.UILayout# */{
    _clippingEnabled: null,
    _backGroundScale9Enabled: null,
    _backGroundImage: null,
    _backGroundImageFileName: null,
    _backGroundImageCapInsets: null,
    _colorType: null,
    _bgImageTexType: null,
    _colorRender: null,
    _gradientRender: null,
    _color: null,
    _startColor: null,
    _endColor: null,
    _alongVector: null,
    _opacity: null,
    _backGroundImageTextureSize: null,
    _layoutType: null,
    _doLayoutDirty: false,
    _clippingType : null,
    _clippingStencil: null,
    _handleScissor: false,
    _scissorRectDirty: false,
    _clippingRect: null,
    _clippingParent: null,
    ctor: function () {
        ccs.UIWidget.prototype.ctor.call(this);
        this._clippingEnabled = false;
        this._backGroundScale9Enabled = false;
        this._backGroundImage = null;
        this._backGroundImageFileName = "";
        this._backGroundImageCapInsets = cc.RectZero();
        this._colorType = ccs.LayoutBackGroundColorType.none;
        this._bgImageTexType = ccs.TextureResType.local;
        this._colorRender = null;
        this._gradientRender = null;
        this._color = cc.WHITE;
        this._startColor = cc.WHITE;
        this._endColor = cc.WHITE;
        this._alongVector = cc.p(0, -1);
        this._opacity = 255;
        this._backGroundImageTextureSize = cc.SizeZero();
        this._layoutType = ccs.LayoutType.absolute;
        this._widgetType = ccs.WidgetType.container;
        this._doLayoutDirty = false;
        this._clippingType = ccs.LayoutClippingType.stencil;
        this._clippingStencil = null;
        this._handleScissor = false;
        this._scissorRectDirty = false;
        this._clippingRect = cc.rect(0, 0, 0, 0);
        this._clippingParent = null;
    },
    init: function () {
        if (cc.NodeRGBA.prototype.init.call(this)){
            this._layoutParameterDictionary = {};
            this._widgetChildren = [];
            this.initRenderer();
            this.setCascadeColorEnabled(false);
            this.setCascadeOpacityEnabled(false);
            this.ignoreContentAdaptWithSize(false);
            this.setSize(cc.SizeZero());
            this.setBright(true);
            this.setAnchorPoint(0, 0);
            return true;
        }
        return false;
    },

    initRenderer: function () {
        this._renderer = ccs.UIRectClippingNode.create();
        this._renderer.setVisitEventListener(this.rendererVisitCallBack,this);
    },

    /**
     * Adds a locChild to the container.
     * @param {ccs.UIWidget} locChild
     * @param {Number} zOrder
     * @param {Number} tag
     * @returns {boolean}
     */
    addChild: function (locChild, zOrder, tag) {
        if(!(child instanceof ccs.UIWidget)){
            cc.log("Widget only supports Widgets as children");
        }
        this.supplyTheLayoutParameterLackToChild(locChild);
        this._doLayoutDirty = true;
        ccs.UIWidget.prototype.addChild.call(this, locChild, zOrder, tag)
    },

    /**
     * Gets if layout is clipping enabled.
     * @returns {Boolean}
     */
    isClippingEnabled: function () {
        return this._clippingEnabled;
    },

    visit: function () {
        if (!this._enabled) {
            return;
        }
        if (this._clippingEnabled) {
            switch (this._clippingType) {
                case ccs.LayoutClippingType.stencil:
                    this.stencilClippingVisit();
                    break;
                case ccs.LayoutClippingType.scissor:
                    this.scissorClippingVisit();
                    break;
                default:
                    break;
            }
        }
        else {
            cc.NodeRGBA.prototype.visit.call(this);
        }
    },

    sortAllChildren: function () {
        ccs.UIWidget.prototype.sortAllChildren();
        this.doLayout();
    },

    stencilClippingVisit: function (ctx) {

    },

    scissorClippingVisit: function (ctx) {
        var clippingRect = this.getClippingRect();
        var gl = ctx || cc.renderContext;
        if (this._handleScissor) {
            gl.enabled(gl.SCISSOR_TEST);
        }
        cc.EGLView.getInstance().setScissorInPoints(clippingRect.x, clippingRect.y, clippingRect.width, clippingRect.height);
        cc.NodeRGBA.prototype.visit.call(this);
        if (this._handleScissor) {
            gl.disabled(gl.SCISSOR_TEST);
        }
    },

    /**
     * Changes if layout can clip it's content and locChild.
     * @param {Boolean} able
     */
    setClippingEnabled: function (able) {
        if (able == this._clippingEnabled) {
            return;
        }
        this._clippingEnabled = able;
        switch (this._clippingType) {
            case ccs.LayoutClippingType.stencil:
                if (able) {
                    var gl = cc.renderContext;
                    //glGetIntegerv(GL_STENCIL_BITS, && g_sStencilBits);
                    this._clippingStencil = cc.DrawNode.create();
                    this._clippingStencil.onEnter();
                    this.setStencilClippingSize(this._size);
                }
                else {
                    this._clippingStencil.onExit();
                    this._clippingStencil = null;
                }
                break;
            default:
                break;
        }
    },

    /**
     * set clipping type
     * @param {ccs.LayoutClippingType} type
     */
    setClippingType: function (type) {
        if (type == this._clippingType) {
            return;
        }
        var clippingEnabled = this.isClippingEnabled();
        this.setClippingEnabled(false);
        this._clippingType = type;
        this.setClippingEnabled(clippingEnabled);
    },

    setStencilClippingSize: function (size) {
        if (this._clippingEnabled && this._clippingType == ccs.stencil) {
            var rect = [];
            rect[0] = cc.p(0, 0);
            rect[1] = cc.p(size.width, 0);
            rect[2] = cc.p(size.width, size.height);
            rect[3] = cc.p(0, size.height);
            var green = cc.c4f(0, 1, 0, 1);
            this._clippingStencil.clear();
            this._clippingStencil.drawPoly(rect, 4, green, 0, green);
        }
    },

    rendererVisitCallBack: function () {
        this.doLayout();
    },

    getClippingRect: function () {
        this._handleScissor = true;
        var worldPos = this.convertToWorldSpace(cc.p(0, 0));
        var t = this.nodeToWorldTransform();
        var scissorWidth = this._size.width * t.a;
        var scissorHeight = this._size.height * t.d;
        var parentClippingRect;
        var parent = this;
        var firstClippingParentFounded = false;
        while (parent) {
            parent = parent.getParent();
            if (parent && parent instanceof ccs.UILayout) {
                if (parent.isClippingEnabled()) {
                    if (!firstClippingParentFounded) {
                        this._clippingParent = parent;
                        firstClippingParentFounded = true;
                    }

                    if (parent._clippingType == ccs.LayoutClippingType.scissor) {
                        this._handleScissor = false;
                        break;
                    }
                }
            }
        }

        if (this._clippingParent) {
            parentClippingRect = this._clippingParent.getClippingRect();
            var finalX = worldPos.x - (scissorWidth * this._anchorPoint.x);
            var finalY = worldPos.y - (scissorHeight * this._anchorPoint.y);
            var finalWidth = scissorWidth;
            var finalHeight = scissorHeight;

            var leftOffset = worldPos.x - parentClippingRect.x;
            if (leftOffset < 0) {
                finalX = parentClippingRect.x;
                finalWidth += leftOffset;
            }
            var rightOffset = (worldPos.x + scissorWidth) - (parentClippingRect.x + parentClippingRect.width);
            if (rightOffset > 0) {
                finalWidth -= rightOffset;
            }
            var topOffset = (worldPos.y + scissorHeight) - (parentClippingRect.y + parentClippingRect.height);
            if (topOffset > 0) {
                finalHeight -= topOffset;
            }
            var bottomOffset = worldPos.y - parentClippingRect.y;
            if (bottomOffset < 0) {
                finalY = parentClippingRect.x;
                finalHeight += bottomOffset;
            }
            if (finalWidth < 0) {
                finalWidth = 0;
            }
            if (finalHeight < 0) {
                finalHeight = 0;
            }
            this._clippingRect.x = finalX;
            this._clippingRect.y = finalY;
            this._clippingRect.width = finalWidth;
            this._clippingRect.height = finalHeight;
        }
        else {
            this._clippingRect.x = worldPos.x - (scissorWidth * this._anchorPoint.x);
            this._clippingRect.y = worldPos.y - (scissorHeight * this._anchorPoint.y);
            this._clippingRect.width = scissorWidth;
            this._clippingRect.height = scissorHeight;
        }
        return this._clippingRect;
    },

    onSizeChanged: function () {
        ccs.UIWidget.prototype.onSizeChanged.call(this);
        this.setStencilClippingSize(this._size);
        /*if (this._renderer instanceof ccs.UIRectClippingNode)
            this._renderer.setClippingSize(this._size);*/

        this._doLayoutDirty = true;

        if (this._backGroundImage) {
            this._backGroundImage.setPosition(this._size.width / 2.0, this._size.height / 2.0);
            if (this._backGroundScale9Enabled) {
                if (this._backGroundImage instanceof cc.Scale9Sprite) {
                    this._backGroundImage.setPreferredSize(this._size);
                }
            }
        }
        if (this._colorRender) {
            this._colorRender.setContentSize(this._size);
        }
        if (this._gradientRender) {
            this._gradientRender.setContentSize(this._size);
        }
    },

    /**
     * Sets background iamge use scale9 renderer.
     * @param {Boolean} able
     */
    setBackGroundImageScale9Enabled: function (able) {
        if (this._backGroundScale9Enabled == able) {
            return;
        }
        this._renderer.removeChild(this._backGroundImage, true);
        this._backGroundImage = null;
        this._backGroundScale9Enabled = able;
        if (this._backGroundScale9Enabled) {
            this._backGroundImage = cc.Scale9Sprite.create();
        }
        else {
            this._backGroundImage = cc.Sprite.create();
        }
        this._renderer.addChild(this._backGroundImage);
        this._backGroundImage.setZOrder(-1);
        this.setBackGroundImage(this._backGroundImageFileName, this._bgImageTexType);
        this.setBackGroundImageCapInsets(this._backGroundImageCapInsets);
    },

    /**
     * Sets a background image for layout
     * @param {String} fileName
     * @param {ccs.TextureResType} texType
     */
    setBackGroundImage: function (fileName, texType) {
        if (!fileName) {
            return;
        }
        texType = texType || ccs.TextureResType.local;
        if (this._backGroundImage == null) {
            this.addBackGroundImage();
        }
        this._backGroundImageFileName = fileName;
        this._bgImageTexType = texType;
        switch (this._bgImageTexType) {
            case ccs.TextureResType.local:
                this._backGroundImage.initWithFile(fileName);
                break;
            case ccs.TextureResType.plist:
                this._backGroundImage.initWithSpriteFrameName(fileName);
                break;
            default:
                break;
        }
        if (this._backGroundScale9Enabled) {
            this._backGroundImage.setPreferredSize(this._size);
        }
        this._backGroundImage.setColor(this.getColor());
        this._backGroundImage.setOpacity(this.getOpacity());
        this._backGroundImageTextureSize = this._backGroundImage.getContentSize();
        this._backGroundImage.setPosition(this._size.width / 2.0, this._size.height / 2.0);
    },

    /**
     * Sets a background image capinsets for layout, if the background image is a scale9 render.
     * @param {cc.Rect} capInsets
     */
    setBackGroundImageCapInsets: function (capInsets) {
        this._backGroundImageCapInsets = capInsets;
        if (this._backGroundScale9Enabled) {
            this._backGroundImage.setCapInsets(capInsets);
        }
    },

    supplyTheLayoutParameterLackToChild: function (locChild) {
        if (!locChild) {
            return;
        }
        switch (this._layoutType) {
            case ccs.LayoutType.absolute:
                break;
            case ccs.LayoutType.linearHorizontal:
            case ccs.LayoutType.linearVertical:
                var layoutParameter = locChild.getLayoutParameter(ccs.LayoutParameterType.linear);
                if (!layoutParameter) {
                    locChild.setLayoutParameter(ccs.UILinearLayoutParameter.create());
                }
                break;
            case ccs.LayoutType.relative:
                var layoutParameter = locChild.getLayoutParameter(ccs.LayoutParameterType.relative);
                if (!layoutParameter) {
                    locChild.setLayoutParameter(ccs.UIRelativeLayoutParameter.create());
                }
                break;
            default:
                break;
        }
    },

    /**
     * init background image renderer.
     */
    addBackGroundImage: function () {
        if (this._backGroundScale9Enabled) {
            this._backGroundImage = cc.Scale9Sprite.create();
            this._backGroundImage.setPreferredSize(this._size);
        }
        else {
            this._backGroundImage = cc.Sprite.create();
        }
        this._backGroundImage.setZOrder(-1);
        this._renderer.addChild(this._backGroundImage);
        this._backGroundImage.setPosition(this._size.width / 2.0, this._size.height / 2.0);
    },

    /**
     * Remove the background image of layout.
     */
    removeBackGroundImage: function () {
        if (!this._backGroundImage) {
            return;
        }
        this._renderer.removeChild(this._backGroundImage, true);
        this._backGroundImage = null;
        this._backGroundImageFileName = "";
        this._backGroundImageTextureSize = cc.SizeZero();
    },

    /**
     * Sets Color Type for layout.
     * @param {ccs.LayoutBackGroundColorType} type
     */
    setBackGroundColorType: function (type) {
        if (this._colorType == type) {
            return;
        }
        switch (this._colorType) {
            case ccs.LayoutBackGroundColorType.none:
                if (this._colorRender) {
                    this._renderer.removeChild(this._colorRender, true);
                    this._colorRender = null;
                }
                if (this._gradientRender) {
                    this._renderer.removeChild(this._gradientRender, true);
                    this._gradientRender = null;
                }
                break;
            case ccs.LayoutBackGroundColorType.solid:
                if (this._colorRender) {
                    this._renderer.removeChild(this._colorRender, true);
                    this._colorRender = null;
                }
                break;
            case ccs.LayoutBackGroundColorType.gradient:
                if (this._gradientRender) {
                    this._renderer.removeChild(this._gradientRender, true);
                    this._gradientRender = null;
                }
                break;
            default:
                break;
        }
        this._colorType = type;
        switch (this._colorType) {
            case ccs.LayoutBackGroundColorType.none:
                break;
            case ccs.LayoutBackGroundColorType.solid:
                this._colorRender = cc.LayerColor.create();
                this._colorRender.setContentSize(this._size);
                this._colorRender.setOpacity(this._opacity);
                this._colorRender.setColor(this._color);
                this._renderer.addChild(this._colorRender, -2);
                break;
            case ccs.LayoutBackGroundColorType.gradient:
                this._gradientRender = cc.LayerGradient.create(cc.c4b(255, 0, 0, 255), cc.c4b(0, 255, 0, 255));
                this._gradientRender.setContentSize(this._size);
                this._gradientRender.setOpacity(this._opacity);
                this._gradientRender.setStartColor(this._startColor);
                this._gradientRender.setEndColor(this._endColor);
                this._gradientRender.setVector(this._alongVector);
                this._renderer.addChild(this._gradientRender, -2);
                break;
            default:
                break;
        }
    },

    /**
     * Sets background color for layout, if color type is LAYOUT_COLOR_SOLID
     * @param {cc.c3b} color
     * @param {cc.c3b} endColor
     */
    setBackGroundColor: function (color, endColor) {
        if (!endColor) {
            this._color = color;
            if (this._colorRender) {
                this._colorRender.setColor(color);
            }
        } else {
            this._startColor = color;
            if (this._gradientRender) {
                this._gradientRender.setStartColor(color);
            }
            this._endColor = endColor;
            if (this._gradientRender) {
                this._gradientRender.setEndColor(endColor);
            }
        }
    },

    /**
     * Sets background opacity layout.
     * @param {number} opacity
     */
    setBackGroundColorOpacity: function (opacity) {
        this._opacity = opacity;
        switch (this._colorType) {
            case ccs.LayoutBackGroundColorType.none:
                break;
            case ccs.LayoutBackGroundColorType.solid:
                this._colorRender.setOpacity(opacity);
                break;
            case ccs.LayoutBackGroundColorType.gradient:
                this._gradientRender.setOpacity(opacity);
                break;
            default:
                break;
        }
    },

    /**
     * Sets background color vector for layout, if color type is LAYOUT_COLOR_GRADIENT
     * @param {cc.Point} vector
     */
    setBackGroundColorVector: function (vector) {
        this._alongVector = vector;
        if (this._gradientRender) {
            this._gradientRender.setVector(vector);
        }
    },

    /**
     * Gets background image texture size.
     * @returns {cc.Size}
     */
    getBackGroundImageTextureSize: function () {
        return this._backGroundImageTextureSize;
    },

    /**
     * Sets LayoutType.
     * @param {ccs.LayoutType} type
     */
    setLayoutType: function (type) {
        this._layoutType = type;
        var layoutChildrenArray = this.getChildren();
        var locChild = null;
        for (var i = 0; i < layoutChildrenArray.length; i++) {
            locChild = layoutChildrenArray[i];
            this.supplyTheLayoutParameterLackToChild(locChild);
        }
        this._doLayoutDirty = true;
    },

    /**
     * Gets LayoutType.
     * @returns {null}
     */
    getLayoutType: function () {
        return this._layoutType;
    },

    doLayout_LINEAR_VERTICAL: function () {
        var layoutChildrenArray = this.getChildren();
        var layoutSize = this.getSize();
        var topBoundary = layoutSize.height;
        for (var i = 0; i < layoutChildrenArray.length; ++i) {
            var locChild = layoutChildrenArray[i];
            var locLayoutParameter = locChild.getLayoutParameter(ccs.LayoutParameterType.linear);

            if (locLayoutParameter) {
                var locChildGravity = locLayoutParameter.getGravity();
                var locAP = locChild.getAnchorPoint();
                var locSize = locChild.getSize();
                var locFinalPosX = locAP.x * locSize.width;
                var locFinalPosY = topBoundary - ((1 - locAP.y) * locSize.height);
                switch (locChildGravity) {
                    case ccs.UILinearGravity.none:
                    case ccs.UILinearGravity.left:
                        break;
                    case ccs.UILinearGravity.right:
                        locFinalPosX = layoutSize.width - ((1 - locAP.x) * locSize.width);
                        break;
                    case ccs.UILinearGravity.centerHorizontal:
                        locFinalPosX = layoutSize.width / 2 - locSize.width * (0.5 - locAP.x);
                        break;
                    default:
                        break;
                }
                var locMargin = locLayoutParameter.getMargin();
                locFinalPosX += locMargin.left;
                locFinalPosY -= locMargin.top;
                locChild.setPosition(cc.p(locFinalPosX, locFinalPosY));
                topBoundary = locChild.getBottomInParent() - locMargin.bottom;
            }
        }
    },
    doLayout_LINEAR_HORIZONTAL: function () {
        var layoutChildrenArray = this.getChildren();
        var layoutSize = this.getSize();
        var leftBoundary = 0;
        for (var i = 0; i < layoutChildrenArray.length; ++i) {
            var locChild = layoutChildrenArray[i];
            var locLayoutParameter = locChild.getLayoutParameter(ccs.LayoutParameterType.linear);

            if (locLayoutParameter) {
                var locChildGravity = locLayoutParameter.getGravity();
                var locAP = locChild.getAnchorPoint();
                var locSize = locChild.getSize();
                var locFinalPosX = leftBoundary + (locAP.x * locSize.width);
                var locFinalPosY = layoutSize.height - (1 - locAP.y) * locSize.height;
                switch (locChildGravity) {
                    case ccs.UILinearGravity.none:
                    case ccs.UILinearGravity.top:
                        break;
                    case ccs.UILinearGravity.bottom:
                        locFinalPosY = locAP.y * locSize.height;
                        break;
                    case ccs.UILinearGravity.centerVertical:
                        locFinalPosY = layoutSize.height / 2 - locSize.height * (0.5 - locAP.y);
                        break;
                    default:
                        break;
                }
                var locMargin = locLayoutParameter.getMargin();
                locFinalPosX += locMargin.left;
                locFinalPosY -= locMargin.top;
                locChild.setPosition(cc.p(locFinalPosX, locFinalPosY));
                leftBoundary = locChild.getRightInParent() + locMargin.right;
            }
        }
    },
    doLayout_RELATIVE: function () {
        var layoutChildrenArray = this.getChildren();
        var length = layoutChildrenArray.length;
        var unlayoutChildCount = length;
        var layoutSize = this.getSize();

        for (var i = 0; i < length; i++) {
            var locChild = layoutChildrenArray[i];
            var locLayoutParameter = locChild.getLayoutParameter(ccs.LayoutParameterType.relative);
            locLayoutParameter._put = false;
        }

        while (unlayoutChildCount > 0) {
            for (var i = 0; i < length; i++) {
                var locChild = layoutChildrenArray[i];
                var locLayoutParameter = locChild.getLayoutParameter(ccs.LayoutParameterType.relative);

                if (locLayoutParameter) {
                    if (locLayoutParameter._put) {
                        continue;
                    }
                    var locAP = locChild.getAnchorPoint();
                    var locSize = locChild.getSize();
                    var locAlign = locLayoutParameter.getAlign();
                    var locRelativeName = locLayoutParameter.getRelativeToWidgetName();
                    var locRelativeWidget = null;
                    var locRelativeWidgetLP = null;
                    var locFinalPosX = 0;
                    var locFinalPosY = 0;
                    if (locRelativeName) {
                        locRelativeWidget = ccs.UIHelper.seekWidgetByRelativeName(this, locRelativeName);
                        if (locRelativeWidget) {
                            locRelativeWidgetLP = locRelativeWidget.getLayoutParameter(ccs.LayoutParameterType.relative);
                        }
                    }
                    switch (locAlign) {
                        case ccs.UIRelativeAlign.alignNone:
                        case ccs.UIRelativeAlign.alignParentTopLeft:
                            locFinalPosX = locAP.x * locSize.width;
                            locFinalPosY = layoutSize.height - ((1 - locAP.y) * locSize.height);
                            break;
                        case ccs.UIRelativeAlign.alignParentTopCenterHorizontal:
                            locFinalPosX = layoutSize.width * 0.5 - locSize.width * (0.5 - locAP.x);
                            locFinalPosY = layoutSize.height - ((1 - locAP.y) * locSize.height);
                            break;
                        case ccs.UIRelativeAlign.alignParentTopRight:
                            locFinalPosX = layoutSize.width - ((1 - locAP.x) * locSize.width);
                            locFinalPosY = layoutSize.height - ((1 - locAP.y) * locSize.height);
                            break;
                        case ccs.UIRelativeAlign.alignParentLeftCenterVertical:
                            locFinalPosX = locAP.x * locSize.width;
                            locFinalPosY = layoutSize.height * 0.5 - locSize.height * (0.5 - locAP.y);
                            break;
                        case ccs.UIRelativeAlign.centerInParent:
                            locFinalPosX = layoutSize.width * 0.5 - locSize.width * (0.5 - locAP.x);
                            locFinalPosY = layoutSize.height * 0.5 - locSize.height * (0.5 - locAP.y);
                            break;
                        case ccs.UIRelativeAlign.alignParentRightCenterVertical:
                            locFinalPosX = layoutSize.width - ((1 - locAP.x) * locSize.width);
                            locFinalPosY = layoutSize.height * 0.5 - locSize.height * (0.5 - locAP.y);
                            break;
                        case ccs.UIRelativeAlign.alignParentLeftBottom:
                            locFinalPosX = locAP.x * locSize.width;
                            locFinalPosY = locAP.y * locSize.height;
                            break;
                        case ccs.UIRelativeAlign.alignParentBottomCenterHorizontal:
                            locFinalPosX = layoutSize.width * 0.5 - locSize.width * (0.5 - locAP.x);
                            locFinalPosY = locAP.y * locSize.height;
                            break;
                        case ccs.UIRelativeAlign.alignParentRightBottom:
                            locFinalPosX = layoutSize.width - ((1 - locAP.x) * locSize.width);
                            locFinalPosY = locAP.y * locSize.height;
                            break;

                        case ccs.UIRelativeAlign.locationAboveLeftAlign:
                            if (locRelativeWidget) {
                                if (locRelativeWidgetLP && !locRelativeWidgetLP._put) {
                                    continue;
                                }
                                var locationBottom = locRelativeWidget.getTopInParent();
                                var locationLeft = locRelativeWidget.getLeftInParent();
                                locFinalPosY = locationBottom + locAP.y * locSize.height;
                                locFinalPosX = locationLeft + locAP.x * locSize.width;
                            }
                            break;
                        case ccs.UIRelativeAlign.locationAboveCenter:
                            if (locRelativeWidget) {
                                if (locRelativeWidgetLP && !locRelativeWidgetLP._put) {
                                    continue;
                                }
                                var rbs = locRelativeWidget.getSize();
                                var locationBottom = locRelativeWidget.getTopInParent();

                                locFinalPosY = locationBottom + locAP.y * locSize.height;
                                locFinalPosX = locRelativeWidget.getLeftInParent() + rbs.width * 0.5 + locAP.x * locSize.width - locSize.width * 0.5;
                            }
                            break;
                        case ccs.UIRelativeAlign.locationAboveRightAlign:
                            if (locRelativeWidget) {
                                if (locRelativeWidgetLP && !locRelativeWidgetLP._put) {
                                    continue;
                                }
                                var locationBottom = locRelativeWidget.getTopInParent();
                                var locationRight = locRelativeWidget.getRightInParent();
                                locFinalPosY = locationBottom + locAP.y * locSize.height;
                                locFinalPosX = locationRight - (1 - locAP.x) * locSize.width;
                            }
                            break;
                        case ccs.UIRelativeAlign.locationLeftOfTopAlign:
                            if (locRelativeWidget) {
                                if (locRelativeWidgetLP && !locRelativeWidgetLP._put) {
                                    continue;
                                }
                                var locationTop = locRelativeWidget.getTopInParent();
                                var locationRight = locRelativeWidget.getLeftInParent();
                                locFinalPosY = locationTop - (1 - locAP.y) * locSize.height;
                                locFinalPosX = locationRight - (1 - locAP.x) * locSize.width;
                            }
                            break;
                        case ccs.UIRelativeAlign.locationLeftOfCenter:
                            if (locRelativeWidget) {
                                if (locRelativeWidgetLP && !locRelativeWidgetLP._put) {
                                    continue;
                                }
                                var rbs = locRelativeWidget.getSize();
                                var locationRight = locRelativeWidget.getLeftInParent();
                                locFinalPosX = locationRight - (1 - locAP.x) * locSize.width;

                                locFinalPosY = locRelativeWidget.getBottomInParent() + rbs.height * 0.5 + locAP.y * locSize.height - locSize.height * 0.5;
                            }
                            break;
                        case ccs.UIRelativeAlign.locationLeftOfBottomAlign:
                            if (locRelativeWidget) {
                                if (locRelativeWidgetLP && !locRelativeWidgetLP._put) {
                                    continue;
                                }
                                var locationBottom = locRelativeWidget.getBottomInParent();
                                var locationRight = locRelativeWidget.getLeftInParent();
                                locFinalPosY = locationBottom + locAP.y * locSize.height;
                                locFinalPosX = locationRight - (1 - locAP.x) * locSize.width;
                            }
                            break;
                        case ccs.UIRelativeAlign.locationRightOfTopAlign:
                            if (locRelativeWidget) {
                                if (locRelativeWidgetLP && !locRelativeWidgetLP._put) {
                                    continue;
                                }
                                var locationTop = locRelativeWidget.getTopInParent();
                                var locationLeft = locRelativeWidget.getRightInParent();
                                locFinalPosY = locationTop - (1 - locAP.y) * locSize.height;
                                locFinalPosX = locationLeft + locAP.x * locSize.width;
                            }
                            break;
                        case ccs.UIRelativeAlign.locationRightOfCenter:
                            if (locRelativeWidget) {
                                if (locRelativeWidgetLP && !locRelativeWidgetLP._put) {
                                    continue;
                                }
                                var rbs = locRelativeWidget.getSize();
                                var locationLeft = locRelativeWidget.getRightInParent();
                                locFinalPosX = locationLeft + locAP.x * locSize.width;

                                locFinalPosY = locRelativeWidget.getBottomInParent() + rbs.height * 0.5 + locAP.y * locSize.height - locSize.height * 0.5;
                            }
                            break;
                        case ccs.UIRelativeAlign.locationRightOfBottomAlign:
                            if (locRelativeWidget) {
                                if (locRelativeWidgetLP && !locRelativeWidgetLP._put) {
                                    continue;
                                }
                                var locationBottom = locRelativeWidget.getBottomInParent();
                                var locationLeft = locRelativeWidget.getRightInParent();
                                locFinalPosY = locationBottom + locAP.y * locSize.height;
                                locFinalPosX = locationLeft + locAP.x * locSize.width;
                            }
                            break;
                        case ccs.UIRelativeAlign.locationBelowLeftAlign:
                            if (locRelativeWidget) {
                                if (locRelativeWidgetLP && !locRelativeWidgetLP._put) {
                                    continue;
                                }
                                var locationTop = locRelativeWidget.getBottomInParent();
                                var locationLeft = locRelativeWidget.getLeftInParent();
                                locFinalPosY = locationTop - (1 - locAP.y) * locSize.height;
                                locFinalPosX = locationLeft + locAP.x * locSize.width;
                            }
                            break;
                        case ccs.UIRelativeAlign.locationBelowCenter:
                            if (locRelativeWidget) {
                                if (locRelativeWidgetLP && !locRelativeWidgetLP._put) {
                                    continue;
                                }
                                var rbs = locRelativeWidget.getSize();
                                var locationTop = locRelativeWidget.getBottomInParent();

                                locFinalPosY = locationTop - (1 - locAP.y) * locSize.height;
                                locFinalPosX = locRelativeWidget.getLeftInParent() + rbs.width * 0.5 + locAP.x * locSize.width - locSize.width * 0.5;
                            }
                            break;
                        case ccs.UIRelativeAlign.locationBelowRightAlign:
                            if (locRelativeWidget) {
                                if (locRelativeWidgetLP && !locRelativeWidgetLP._put) {
                                    continue;
                                }
                                var locationTop = locRelativeWidget.getBottomInParent();
                                var locationRight = locRelativeWidget.getRightInParent();
                                locFinalPosY = locationTop - (1 - locAP.y) * locSize.height;
                                locFinalPosX = locationRight - (1 - locAP.x) * locSize.width;
                            }
                            break;
                        default:
                            break;
                    }
                    var locRelativeWidgetMargin,locRelativeWidgetLPAlign;
                    var locMargin = locLayoutParameter.getMargin();
                    if (locRelativeWidgetLP) {
                        locRelativeWidgetMargin = locRelativeWidgetLP.getMargin();
                        locRelativeWidgetLPAlign = locRelativeWidgetLP.getAlign();
                    }
                    //handle margin
                    switch (locAlign) {
                        case ccs.UIRelativeAlign.alignNone:
                        case ccs.UIRelativeAlign.alignParentTopLeft:
                            locFinalPosX += locMargin.left;
                            locFinalPosY -= locMargin.top;
                            break;
                        case ccs.UIRelativeAlign.alignParentTopCenterHorizontal:
                            locFinalPosY -= locMargin.top;
                            break;
                        case ccs.UIRelativeAlign.alignParentTopRight:
                            locFinalPosX -= locMargin.right;
                            locFinalPosY -= locMargin.top;
                            break;
                        case ccs.UIRelativeAlign.alignParentLeftCenterVertical:
                            locFinalPosX += locMargin.left;
                            break;
                        case ccs.UIRelativeAlign.centerInParent:
                            break;
                        case ccs.UIRelativeAlign.alignParentRightCenterVertical:
                            locFinalPosX -= locMargin.right;
                            break;
                        case ccs.UIRelativeAlign.alignParentLeftBottom:
                            locFinalPosX += locMargin.left;
                            locFinalPosY += locMargin.bottom;
                            break;
                        case ccs.UIRelativeAlign.alignParentBottomCenterHorizontal:
                            locFinalPosY += locMargin.bottom;
                            break;
                        case ccs.UIRelativeAlign.alignParentRightBottom:
                            locFinalPosX -= locMargin.right;
                            locFinalPosY += locMargin.bottom;
                            break;

                        case ccs.UIRelativeAlign.locationAboveLeftAlign:
                            locFinalPosY += locMargin.bottom;
                            if (locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentTopCenterHorizontal
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentTopLeft
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignNone
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentTopRight)
                            {
                                locFinalPosY += locRelativeWidgetMargin.top;
                            }
                            locFinalPosY += locMargin.left;
                            break;
                        case ccs.UIRelativeAlign.locationAboveCenter:
                            locFinalPosY += locMargin.bottom;
                            if (locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentTopCenterHorizontal
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentTopLeft
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignNone
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentTopRight)
                            {
                                locFinalPosY += locRelativeWidgetMargin.top;
                            }
                            break;
                        case ccs.UIRelativeAlign.locationAboveRightAlign:
                            locFinalPosY += locMargin.bottom;
                            if (locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentTopCenterHorizontal
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentTopLeft
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignNone
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentTopRight)
                            {
                                locFinalPosY += locRelativeWidgetMargin.top;
                            }
                            locFinalPosX -= locMargin.right;
                            break;
                        case ccs.UIRelativeAlign.locationLeftOfTopAlign:
                            locFinalPosX -= locMargin.right;
                            if (locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentTopLeft
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignNone
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentLeftBottom
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentLeftCenterVertical)
                            {
                                locFinalPosX -= locRelativeWidgetMargin.left;
                            }
                            locFinalPosY -= locMargin.top;
                            break;
                        case ccs.UIRelativeAlign.locationLeftOfCenter:
                            locFinalPosX -= locMargin.right;
                            if (locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentTopLeft
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignNone
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentLeftBottom
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentLeftCenterVertical)
                            {
                                locFinalPosX -= locRelativeWidgetMargin.left;
                            }
                            break;
                        case ccs.UIRelativeAlign.locationLeftOfBottomAlign:
                            locFinalPosX -= locMargin.right;
                            if (locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentTopLeft
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignNone
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentLeftBottom
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentLeftCenterVertical)
                            {
                                locFinalPosX -= locRelativeWidgetMargin.left;
                            }
                            locFinalPosY += locMargin.bottom;
                            break;
                            break;
                        case ccs.UIRelativeAlign.locationRightOfTopAlign:
                            locFinalPosX += locMargin.left;
                            if (locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentTopRight
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentRightBottom
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentRightCenterVertical)
                            {
                                locFinalPosX += locRelativeWidgetMargin.right;
                            }
                            locFinalPosY -= locMargin.top;
                            break;
                        case ccs.UIRelativeAlign.locationRightOfCenter:
                            locFinalPosX += locMargin.left;
                            if (locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentTopRight
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentRightBottom
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentRightCenterVertical)
                            {
                                locFinalPosX += locRelativeWidgetMargin.right;
                            }
                            break;
                        case ccs.UIRelativeAlign.locationRightOfBottomAlign:
                            locFinalPosX += locMargin.left;
                            if (locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentTopRight
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentRightBottom
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentRightCenterVertical)
                            {
                                locFinalPosX += locRelativeWidgetMargin.right;
                            }
                            locFinalPosY += locMargin.bottom;
                            break;
                            break;
                        case ccs.UIRelativeAlign.locationBelowLeftAlign:
                            locFinalPosY -= locMargin.top;
                            if (locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentLeftBottom
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentRightBottom
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentBottomCenterHorizontal)
                            {
                                locFinalPosY -= locRelativeWidgetMargin.bottom;
                            }
                            locFinalPosX += locMargin.left;
                            break;
                        case ccs.UIRelativeAlign.locationBelowCenter:
                            locFinalPosY -= locMargin.top;
                            if (locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentLeftBottom
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentRightBottom
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentBottomCenterHorizontal)
                            {
                                locFinalPosY -= locRelativeWidgetMargin.bottom;
                            }
                            break;
                        case ccs.UIRelativeAlign.locationBelowRightAlign:
                            locFinalPosY -= locMargin.top;
                            if (locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentLeftBottom
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentRightBottom
                                && locRelativeWidgetLPAlign != ccs.UIRelativeAlign.alignParentBottomCenterHorizontal)
                            {
                                locFinalPosY -= locRelativeWidgetMargin.bottom;
                            }
                            locFinalPosX -= locMargin.right;
                            break;
                        default:
                            break;
                    }
                    locChild.setPosition(cc.p(locFinalPosX, locFinalPosY));
                    locLayoutParameter._put = true;
                    unlayoutChildCount--;
                }
            }
        }
    },
    doLayout: function () {
        if(!this._doLayoutDirty){
            return;
        }
        switch (this._layoutType) {
            case ccs.LayoutType.absolute:
                break;
            case ccs.LayoutType.linearVertical:
                this.doLayout_LINEAR_VERTICAL();
                break;
            case ccs.LayoutType.linearHorizontal:
                this.doLayout_LINEAR_HORIZONTAL();
                break;
            case ccs.LayoutType.relative:
                this.doLayout_RELATIVE();
                break;
            default:
                break;
        }
        this._doLayoutDirty = false;
    },

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "Layout";
    },

    createCloneInstance: function () {
        return ccs.UILayout.create();
    },

    copyClonedWidgetChildren: function (model) {
        ccs.UIWidget.prototype.copyClonedWidgetChildren.call(this, model);
    },

    copySpecialProperties: function (layout) {
        this.setBackGroundImageScale9Enabled(layout._backGroundScale9Enabled);
        this.setBackGroundImage(layout._backGroundImageFileName, layout._bgImageTexType);
        this.setBackGroundImageCapInsets(layout._backGroundImageCapInsets);
        this.setBackGroundColorType(layout._colorType);
        this.setBackGroundColor(layout._color);
        this.setBackGroundColor(layout._startColor, layout._endColor);
        this.setBackGroundColorOpacity(layout._opacity);
        this.setBackGroundColorVector(layout._alongVector);
        this.setLayoutType(layout._layoutType);
        this.setClippingEnabled(layout._clippingEnabled);
        this.setClippingType(layout._clippingType);
    }
});
/**
 * allocates and initializes a UILayout.
 * @constructs
 * @return {ccs.UILayout}
 * @example
 * // example
 * var uiLayout = ccs.UILayout.create();
 */
ccs.UILayout.create = function () {
    var layout = new ccs.UILayout();
    if (layout && layout.init()) {
        return layout;
    }
    return null;
};

ccs.UIRectClippingNode = cc.ClippingNode.extend({
    _innerStencil: null,
    _enabled: null,
    _arrRect: null,
    _clippingSize: null,
    _clippingEnabled: null,
    _visitTarget: null,
    _visitEvent: null,
    ctor: function () {
        cc.ClippingNode.prototype.ctor.call(this);
        this._innerStencil = null;
        this._enabled = true;
        this._arrRect = [];
        this._clippingSize = cc.size(50, 50);
        this._clippingEnabled = false;
    },

    init: function () {
        this._innerStencil = cc.DrawNode.create();
        this._arrRect[0] = cc.p(0, 0);
        this._arrRect[1] = cc.p(this._clippingSize.width, 0);
        this._arrRect[2] = cc.p(this._clippingSize.width, this._clippingSize.height);
        this._arrRect[3] = cc.p(0, this._clippingSize.height);

        var green = cc.c4f(0, 1, 0, 1);
        //this._innerStencil.drawPoly(this._arrRect,green, 0, green);
        if (cc.Browser.supportWebGL) {
            if (cc.ClippingNode.prototype.init.call(this, this._innerStencil)) {
                return true;
            }
        } else {
            this._stencil = this._innerStencil;
            this._alphaThreshold = 1;
            this._inverted = false;
            return true;
        }

        return false;
    },

    setClippingSize: function (size) {
        this.setContentSize(size);
        this._clippingSize = cc.size(size.width, size.height);
        this._arrRect[0] = cc.p(0, 0);
        this._arrRect[1] = cc.p(this._clippingSize.width, 0);
        this._arrRect[2] = cc.p(this._clippingSize.width, this._clippingSize.height);
        this._arrRect[3] = cc.p(0, this._clippingSize.height);
        var green = cc.c4f(0, 1, 0, 1);
        this._innerStencil.clear();
        this._innerStencil.drawPoly(this._arrRect, green, 0, green);
        this.setStencil(this._innerStencil);
    },

    setClippingEnabled: function (enabled) {
        this._clippingEnabled = enabled;
    },

    visit: function (ctx) {
        if (!this._enabled) {
            return;
        }
        if (this._clippingEnabled) {
            cc.ClippingNode.prototype.visit.call(this, ctx);
        }
        else {
            cc.Node.prototype.visit.call(this, ctx);
        }
    },

    setEnabled: function (enabled) {
        this._enabled = enabled;
    },

    isEnabled: function () {
        return this._enabled;
    },

    sortAllChildren: function () {
        cc.ClippingNode.prototype.sortAllChildren.call(this);
        if (this._visitTarget && this._visitEvent) {
            this._visitEvent.call(this._visitTarget);
        }
    },

    setVisitEventListener: function (selector, target) {
        this._visitTarget = target;
        this._visitEvent = selector;
    }
});
ccs.UIRectClippingNode.create = function () {
    var node = new ccs.UIRectClippingNode();
    if (node && node.init()) {
        return node;
    }
    return null;
};