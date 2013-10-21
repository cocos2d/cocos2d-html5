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
cc.LayoutBackGroundColorType = {
    NONE: 0,
    SOLID: 1,
    GRADIENT: 2
};

cc.LayoutType = {
    ABSOLUTE: 0,
    LINEAR_VERTICAL: 1,
    LINEAR_HORIZONTAL: 2,
    RELATIVE: 3
};

/**
 * Base class for cc.Layout
 * @class
 * @extends cc.UIWidget
 */
cc.Layout = cc.UIWidget.extend({
    _clippingEnabled: null,
    _backGroundScale9Enable: null,
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
    ctor: function () {
        cc.UIWidget.prototype.ctor.call(this);
        this._clippingEnabled = false;
        this._backGroundScale9Enable = false;
        this._backGroundImage = null;
        this._backGroundImageFileName = "";
        this._backGroundImageCapInsets = cc.RectZero();
        this._colorType = cc.LayoutBackGroundColorType.NONE;
        this._bgImageTexType = cc.TextureResType.LOCAL;
        this._colorRender = null;
        this._gradientRender = null;
        this._color = cc.WHITE;
        this._startColor = cc.WHITE;
        this._endColor = cc.WHITE;
        this._alongVector = cc.p(0, -1);
        this._opacity = 255;
        this._backGroundImageTextureSize = cc.SizeZero();
        this._layoutType = cc.LayoutType.ABSOLUTE;
        this._widgetType = cc.WidgetType.Container;
    },
    init: function () {
        this._layoutParameterDictionary = {};
        this._children = [];
        this.initRenderer();
        this._renderer.setZOrder(this._widgetZOrder);
        if (this._renderer.RGBAProtocol) {
            this._renderer.setCascadeColorEnabled(false);
            this._renderer.setCascadeOpacityEnabled(false);
        }
        this.ignoreContentAdaptWithSize(false);
        this.setSize(cc.SizeZero());
        this.setBright(true);
        this.setAnchorPoint(cc.p(0, 0));
        this._scheduler = cc.Director.getInstance().getScheduler();
        return true;
    },

    initRenderer: function () {
        this._renderer = cc.RectClippingNode.create();
    },

    /**
     * Adds a child to the container.
     * @param {cc.UIWidget} child
     * @returns {boolean}
     */
    addChild: function (child) {
        this.supplyTheLayoutParameterLackToChild(child);
        return cc.UIWidget.prototype.addChild.call(this, child);
    },

    /**
     * Gets if layout is clipping enabled.
     * @returns {Boolean}
     */
    isClippingEnabled: function () {
        return this._clippingEnabled;
    },

    hitTest: function (pt) {
        var nsp = this._renderer.convertToNodeSpace(pt);
        var bb = cc.rect(0.0, 0, this._size.width, this._size.height);
        if (nsp.x >= bb.x && nsp.x <= bb.x + bb.width && nsp.y >= bb.y && nsp.y <= bb.y + bb.height) {
            return true;
        }
        return false;
    },

    /**
     * Changes if layout can clip it's content and child.
     * @param {Boolean} able
     */
    setClippingEnabled: function (able) {
        this._clippingEnabled = able;
        if (this._renderer instanceof cc.RectClippingNode)
            this._renderer.setClippingEnabled(able);
    },

    onSizeChanged: function () {
        if (this._renderer instanceof cc.RectClippingNode)
            this._renderer.setClippingSize(this._size);
        this.doLayout();
        if (this._backGroundImage) {
            this._backGroundImage.setPosition(cc.p(this._size.width / 2.0, this._size.height / 2.0));
            if (this._backGroundScale9Enable) {
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
        if (this._backGroundScale9Enable == able) {
            return;
        }
        this._renderer.removeChild(this._backGroundImage, true);
        this._backGroundImage = null;
        this._backGroundScale9Enable = able;
        if (this._backGroundScale9Enable) {
            this._backGroundImage = cc.Scale9Sprite.create();
            this._renderer.addChild(this._backGroundImage);
        }
        else {
            this._backGroundImage = cc.Sprite.create();
            this._renderer.addChild(this._backGroundImage);
        }
        this._backGroundImage.setZOrder(-1);
        this.setBackGroundImage(this._backGroundImageFileName, this._bgImageTexType);
        this.setBackGroundImageCapInsets(this._backGroundImageCapInsets);
    },

    /**
     * Sets a background image for layout
     * @param {String} fileName
     * @param {cc.TextureResType} texType
     */
    setBackGroundImage: function (fileName, texType) {
        if (!fileName) {
            return;
        }
        texType = texType || cc.TextureResType.LOCAL;
        if (this._backGroundImage == null) {
            this.addBackGroundImage();
        }
        this._backGroundImageFileName = fileName;
        this._bgImageTexType = texType;
        if (this._backGroundScale9Enable) {
            switch (this._bgImageTexType) {
                case cc.TextureResType.LOCAL:
                    this._backGroundImage.initWithFile(fileName);
                    break;
                case cc.TextureResType.PLIST:
                    this._backGroundImage.initWithSpriteFrameName(fileName);
                    break;
                default:
                    break;
            }
            this._backGroundImage.setPreferredSize(this._size);
        }
        else {
            switch (this._bgImageTexType) {
                case cc.TextureResType.LOCAL:
                    this._backGroundImage.initWithFile(fileName);
                    break;
                case cc.TextureResType.PLIST:
                    this._backGroundImage.initWithSpriteFrameName(fileName);
                    break;
                default:
                    break;
            }
        }
        if (this._backGroundScale9Enable) {
            this._backGroundImage.setColor(this.getColor());
            this._backGroundImage.setOpacity(this.getOpacity());
        }
        else {
            this._backGroundImage.setColor(this.getColor());
            this._backGroundImage.setOpacity(this.getOpacity());
        }
        this._backGroundImageTextureSize = this._backGroundImage.getContentSize();
        this._backGroundImage.setPosition(cc.p(this._size.width / 2.0, this._size.height / 2.0));
    },

    /**
     * Sets a background image capinsets for layout, if the background image is a scale9 render.
     * @param {cc.Rect} capInsets
     */
    setBackGroundImageCapInsets: function (capInsets) {
        this._backGroundImageCapInsets = capInsets;
        if (this._backGroundScale9Enable) {
            this._backGroundImage.setCapInsets(capInsets);
        }
    },

    supplyTheLayoutParameterLackToChild: function (child) {
        if (!child) {
            return;
        }
        switch (this._layoutType) {
            case cc.LayoutType.ABSOLUTE:
                break;
            case cc.LayoutType.LINEAR_HORIZONTAL:
            case cc.LayoutType.LINEAR_VERTICAL:
                var layoutParameter = child.getLayoutParameter(cc.LayoutParameterType.LINEAR);
                if (!layoutParameter) {
                    child.setLayoutParameter(cc.LinearLayoutParameter.create());
                }
                break;
            case cc.LayoutType.RELATIVE:
                var layoutParameter = child.getLayoutParameter(cc.LayoutParameterType.RELATIVE);
                if (!layoutParameter) {
                    child.setLayoutParameter(cc.RelativeLayoutParameter.create());
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
        if (this._backGroundScale9Enable) {
            this._backGroundImage = cc.Scale9Sprite.create();
            this._backGroundImage.setZOrder(-1);
            this._renderer.addChild(this._backGroundImage);
            this._backGroundImage.setPreferredSize(this._size);
        }
        else {
            this._backGroundImage = cc.Sprite.create();
            this._backGroundImage.setZOrder(-1);
            this._renderer.addChild(this._backGroundImage);
        }
        this._backGroundImage.setPosition(cc.p(this._size.width / 2.0, this._size.height / 2.0));
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
     * @param {cc.LayoutBackGroundColorType} type
     */
    setBackGroundColorType: function (type) {
        if (this._colorType == type) {
            return;
        }
        switch (this._colorType) {
            case cc.LayoutBackGroundColorType.NONE:
                if (this._colorRender) {
                    this._renderer.removeChild(this._colorRender, true);
                    this._colorRender = null;
                }
                if (this._gradientRender) {
                    this._renderer.removeChild(this._gradientRender, true);
                    this._gradientRender = null;
                }
                break;
            case cc.LayoutBackGroundColorType.SOLID:
                if (this._colorRender) {
                    this._renderer.removeChild(this._colorRender, true);
                    this._colorRender = null;
                }
                break;
            case cc.LayoutBackGroundColorType.GRADIENT:
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
            case cc.LayoutBackGroundColorType.NONE:
                break;
            case cc.LayoutBackGroundColorType.SOLID:
                this._colorRender = cc.LayerColor.create();
                this._colorRender.setContentSize(this._size);
                this._colorRender.setOpacity(this._opacity);
                this._colorRender.setColor(this._color);
                this._renderer.addChild(this._colorRender, -2);
                break;
            case cc.LayoutBackGroundColorType.GRADIENT:
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
            case cc.LayoutBackGroundColorType.NONE:
                break;
            case cc.LayoutBackGroundColorType.SOLID:
                this._colorRender.setOpacity(opacity);
                break;
            case cc.LayoutBackGroundColorType.GRADIENT:
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
     * Sets background color
     * @param {cc.c3b} color
     */
    setColor: function (color) {
        cc.UIWidget.prototype.setColor.call(this, color);
        if (this._backGroundImage) {
            if (this._backGroundImage.RGBAProtocol) {
                this._backGroundImage.setColor(color);
            }
        }
    },

    /**
     * Sets background opacity
     * @param {number} opacity
     */
    setOpacity: function (opacity) {
        cc.UIWidget.prototype.setOpacity.call(this, opacity);
        if (this._backGroundImage) {
            if (this._backGroundImage.RGBAProtocol) {
                this._backGroundImage.setOpacity(opacity);
            }
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
     * Gets the content size of widget.
     * @returns {cc.Size}
     */
    getContentSize: function () {
        return this._renderer.getContentSize();
    },

    /**
     * Sets LayoutType.
     * @param {cc.LayoutType} type
     */
    setLayoutType: function (type) {
        this._layoutType = type;
        var layoutChildrenArray = this.getChildren();
        var child = null;
        for (var i = 0; i < layoutChildrenArray.length; i++) {
            child = layoutChildrenArray[i];
            this.supplyTheLayoutParameterLackToChild(child);
        }
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
        var length = layoutChildrenArray.length;
        var layoutSize = this.getSize();
        var topBoundary = layoutSize.height;
        for (var i = 0; i < length; ++i) {
            var child = layoutChildrenArray[i];
            var layoutParameter = child.getLayoutParameter(cc.LayoutParameterType.LINEAR);

            if (layoutParameter) {
                var childGravity = layoutParameter.getGravity();
                var ap = child.getAnchorPoint();
                var cs = child.getSize();
                var finalPosX = ap.x * cs.width;
                var finalPosY = topBoundary - ((1 - ap.y) * cs.height);
                switch (childGravity) {
                    case cc.UILinearGravity.NONE:
                    case cc.UILinearGravity.LEFT:
                        break;
                    case cc.UILinearGravity.RIGHT:
                        finalPosX = layoutSize.width - ((1 - ap.x) * cs.width);
                        break;
                    case cc.UILinearGravity.CENTER_HORIZONTAL:
                        finalPosX = layoutSize.width / 2 - cs.width * (0.5 - ap.x);
                        break;
                    default:
                        break;
                }
                var mg = layoutParameter.getMargin();
                finalPosX += mg.left;
                finalPosY -= mg.top;
                child.setPosition(cc.p(finalPosX, finalPosY));
                topBoundary = child.getBottomInParent() - mg.bottom;
            }
        }
    },
    doLayout_LINEAR_HORIZONTAL: function () {
        var layoutChildrenArray = this.getChildren();
        var length = layoutChildrenArray.length;
        var layoutSize = this.getSize();
        var leftBoundary = 0;
        for (var i = 0; i < length; ++i) {
            var child = layoutChildrenArray[i];
            var layoutParameter = child.getLayoutParameter(cc.LayoutParameterType.LINEAR);

            if (layoutParameter) {
                var childGravity = layoutParameter.getGravity();
                var ap = child.getAnchorPoint();
                var cs = child.getSize();
                var finalPosX = leftBoundary + (ap.x * cs.width);
                var finalPosY = layoutSize.height - (1 - ap.y) * cs.height;
                switch (childGravity) {
                    case cc.UILinearGravity.NONE:
                    case cc.UILinearGravity.TOP:
                        break;
                    case cc.UILinearGravity.BOTTOM:
                        finalPosY = ap.y * cs.height;
                        break;
                    case cc.UILinearGravity.CENTER_VERTICAL:
                        finalPosY = layoutSize.height / 2 - cs.height * (0.5 - ap.y);
                        break;
                    default:
                        break;
                }
                var mg = layoutParameter.getMargin();
                finalPosX += mg.left;
                finalPosY -= mg.top;
                child.setPosition(cc.p(finalPosX, finalPosY));
                leftBoundary = child.getRightInParent() + mg.right;
            }
        }
    },
    doLayout_RELATIVE: function () {
        var layoutChildrenArray = this.getChildren();
        var length = layoutChildrenArray.length;
        var unlayoutChildCount = length;
        var layoutSize = this.getSize();

        for (var i = 0; i < length; i++) {
            var child = layoutChildrenArray[i];
            var layoutParameter = child.getLayoutParameter(cc.LayoutParameterType.RELATIVE);
            layoutParameter._put = false;
        }

        while (unlayoutChildCount > 0) {
            for (var i = 0; i < length; i++) {
                var child = layoutChildrenArray[i];
                var layoutParameter = child.getLayoutParameter(cc.LayoutParameterType.RELATIVE);

                if (layoutParameter) {
                    if (layoutParameter._put) {
                        continue;
                    }
                    var ap = child.getAnchorPoint();
                    var cs = child.getSize();
                    var align = layoutParameter.getAlign();
                    var relativeName = layoutParameter.getRelativeToWidgetName();
                    var relativeWidget = null;
                    var relativeWidgetLP = null;
                    var finalPosX = 0;
                    var finalPosY = 0;
                    if (relativeName) {
                        relativeWidget = cc.UIHelper.getInstance().seekWidgetByRelativeName(this, relativeName);
                        if (relativeWidget) {
                            relativeWidgetLP = relativeWidget.getLayoutParameter(cc.LayoutParameterType.RELATIVE);
                        }
                    }
                    switch (align) {
                        case cc.UIRelativeAlign.ALIGN_NONE:
                        case cc.UIRelativeAlign.ALIGN_PARENT_TOP_LEFT:
                            finalPosX = ap.x * cs.width;
                            finalPosY = layoutSize.height - ((1 - ap.y) * cs.height);
                            break;
                        case cc.UIRelativeAlign.ALIGN_PARENT_TOP_CENTER_HORIZONTAL:
                            finalPosX = layoutSize.width * 0.5 - cs.width * (0.5 - ap.x);
                            finalPosY = layoutSize.height - ((1 - ap.y) * cs.height);
                            break;
                        case cc.UIRelativeAlign.ALIGN_PARENT_TOP_RIGHT:
                            finalPosX = layoutSize.width - ((1 - ap.x) * cs.width);
                            finalPosY = layoutSize.height - ((1 - ap.y) * cs.height);
                            break;
                        case cc.UIRelativeAlign.ALIGN_PARENT_LEFT_CENTER_VERTICAL:
                            finalPosX = ap.x * cs.width;
                            finalPosY = layoutSize.height * 0.5 - cs.height * (0.5 - ap.y);
                            break;
                        case cc.UIRelativeAlign.CENTER_IN_PARENT:
                            finalPosX = layoutSize.width * 0.5 - cs.width * (0.5 - ap.x);
                            finalPosY = layoutSize.height * 0.5 - cs.height * (0.5 - ap.y);
                            break;
                        case cc.UIRelativeAlign.ALIGN_PARENT_RIGHT_CENTER_VERTICAL:
                            finalPosX = layoutSize.width - ((1 - ap.x) * cs.width);
                            finalPosY = layoutSize.height * 0.5 - cs.height * (0.5 - ap.y);
                            break;
                        case cc.UIRelativeAlign.ALIGN_PARENT_LEFT_BOTTOM:
                            finalPosX = ap.x * cs.width;
                            finalPosY = ap.y * cs.height;
                            break;
                        case cc.UIRelativeAlign.ALIGN_PARENT_BOTTOM_CENTER_HORIZONTAL:
                            finalPosX = layoutSize.width * 0.5 - cs.width * (0.5 - ap.x);
                            finalPosY = ap.y * cs.height;
                            break;
                        case cc.UIRelativeAlign.ALIGN_PARENT_RIGHT_BOTTOM:
                            finalPosX = layoutSize.width - ((1 - ap.x) * cs.width);
                            finalPosY = ap.y * cs.height;
                            break;

                        case cc.UIRelativeAlign.LOCATION_ABOVE_LEFTALIGN:
                            if (relativeWidget) {
                                if (relativeWidgetLP && !relativeWidgetLP._put) {
                                    continue;
                                }
                                var locationBottom = relativeWidget.getTopInParent();
                                var locationLeft = relativeWidget.getLeftInParent();
                                finalPosY = locationBottom + ap.y * cs.height;
                                finalPosX = locationLeft + ap.x * cs.width;
                            }
                            break;
                        case cc.UIRelativeAlign.LOCATION_ABOVE_CENTER:
                            if (relativeWidget) {
                                if (relativeWidgetLP && !relativeWidgetLP._put) {
                                    continue;
                                }
                                var rbs = relativeWidget.getSize();
                                var locationBottom = relativeWidget.getTopInParent();

                                finalPosY = locationBottom + ap.y * cs.height;
                                finalPosX = relativeWidget.getLeftInParent() + rbs.width * 0.5 + ap.x * cs.width - cs.width * 0.5;
                            }
                            break;
                        case cc.UIRelativeAlign.LOCATION_ABOVE_RIGHTALIGN:
                            if (relativeWidget) {
                                if (relativeWidgetLP && !relativeWidgetLP._put) {
                                    continue;
                                }
                                var locationBottom = relativeWidget.getTopInParent();
                                var locationRight = relativeWidget.getRightInParent();
                                finalPosY = locationBottom + ap.y * cs.height;
                                finalPosX = locationRight - (1 - ap.x) * cs.width;
                            }
                            break;
                        case cc.UIRelativeAlign.LOCATION_LEFT_OF_TOPALIGN:
                            if (relativeWidget) {
                                if (relativeWidgetLP && !relativeWidgetLP._put) {
                                    continue;
                                }
                                var locationTop = relativeWidget.getTopInParent();
                                var locationRight = relativeWidget.getLeftInParent();
                                finalPosY = locationTop - (1 - ap.y) * cs.height;
                                finalPosX = locationRight - (1 - ap.x) * cs.width;
                            }
                            break;
                        case cc.UIRelativeAlign.LOCATION_LEFT_OF_CENTER:
                            if (relativeWidget) {
                                if (relativeWidgetLP && !relativeWidgetLP._put) {
                                    continue;
                                }
                                var rbs = relativeWidget.getSize();
                                var locationRight = relativeWidget.getLeftInParent();
                                finalPosX = locationRight - (1 - ap.x) * cs.width;

                                finalPosY = relativeWidget.getBottomInParent() + rbs.height * 0.5 + ap.y * cs.height - cs.height * 0.5;
                            }
                            break;
                        case cc.UIRelativeAlign.LOCATION_LEFT_OF_BOTTOMALIGN:
                            if (relativeWidget) {
                                if (relativeWidgetLP && !relativeWidgetLP._put) {
                                    continue;
                                }
                                var locationBottom = relativeWidget.getBottomInParent();
                                var locationRight = relativeWidget.getLeftInParent();
                                finalPosY = locationBottom + ap.y * cs.height;
                                finalPosX = locationRight - (1 - ap.x) * cs.width;
                            }
                            break;
                        case cc.UIRelativeAlign.LOCATION_RIGHT_OF_TOPALIGN:
                            if (relativeWidget) {
                                if (relativeWidgetLP && !relativeWidgetLP._put) {
                                    continue;
                                }
                                var locationTop = relativeWidget.getTopInParent();
                                var locationLeft = relativeWidget.getRightInParent();
                                finalPosY = locationTop - (1 - ap.y) * cs.height;
                                finalPosX = locationLeft + ap.x * cs.width;
                            }
                            break;
                        case cc.UIRelativeAlign.LOCATION_RIGHT_OF_CENTER:
                            if (relativeWidget) {
                                if (relativeWidgetLP && !relativeWidgetLP._put) {
                                    continue;
                                }
                                var rbs = relativeWidget.getSize();
                                var locationLeft = relativeWidget.getRightInParent();
                                finalPosX = finalPosX = locationLeft + ap.x * cs.width;

                                finalPosY = relativeWidget.getBottomInParent() + rbs.height * 0.5 + ap.y * cs.height - cs.height * 0.5;
                            }
                            break;
                        case cc.UIRelativeAlign.LOCATION_RIGHT_OF_BOTTOMALIGN:
                            if (relativeWidget) {
                                if (relativeWidgetLP && !relativeWidgetLP._put) {
                                    continue;
                                }
                                var locationBottom = relativeWidget.getBottomInParent();
                                var locationLeft = relativeWidget.getRightInParent();
                                finalPosY = locationBottom + ap.y * cs.height;
                                finalPosX = locationLeft + ap.x * cs.width;
                            }
                            break;
                        case cc.UIRelativeAlign.LOCATION_BELOW_LEFTALIGN:
                            if (relativeWidget) {
                                if (relativeWidgetLP && !relativeWidgetLP._put) {
                                    continue;
                                }
                                var locationTop = relativeWidget.getBottomInParent();
                                var locationLeft = relativeWidget.getLeftInParent();
                                finalPosY = locationTop - (1 - ap.y) * cs.height;
                                finalPosX = locationLeft + ap.x * cs.width;
                            }
                            break;
                        case cc.UIRelativeAlign.LOCATION_BELOW_CENTER:
                            if (relativeWidget) {
                                if (relativeWidgetLP && !relativeWidgetLP._put) {
                                    continue;
                                }
                                var rbs = relativeWidget.getSize();
                                var locationTop = relativeWidget.getBottomInParent();

                                finalPosY = locationTop - (1 - ap.y) * cs.height;
                                finalPosX = relativeWidget.getLeftInParent() + rbs.width * 0.5 + ap.x * cs.width - cs.width * 0.5;
                            }
                            break;
                        case cc.UIRelativeAlign.LOCATION_BELOW_RIGHTALIGN:
                            if (relativeWidget) {
                                if (relativeWidgetLP && !relativeWidgetLP._put) {
                                    continue;
                                }
                                var locationTop = relativeWidget.getBottomInParent();
                                var locationRight = relativeWidget.getRightInParent();
                                finalPosY = locationTop - (1 - ap.y) * cs.height;
                                finalPosX = locationRight - (1 - ap.x) * cs.width;
                            }
                            break;
                        default:
                            break;
                    }
                    var relativeWidgetMargin;
                    var mg = layoutParameter.getMargin();
                    if (relativeWidget) {
                        relativeWidgetMargin = relativeWidget.getLayoutParameter(cc.LayoutParameterType.RELATIVE).getMargin();
                    }
                    //handle margin
                    switch (align) {
                        case cc.UIRelativeAlign.ALIGN_NONE:
                        case cc.UIRelativeAlign.ALIGN_PARENT_TOP_LEFT:
                            finalPosX += mg.left;
                            finalPosY -= mg.top;
                            break;
                        case cc.UIRelativeAlign.ALIGN_PARENT_TOP_CENTER_HORIZONTAL:
                            finalPosY -= mg.top;
                            break;
                        case cc.UIRelativeAlign.ALIGN_PARENT_TOP_RIGHT:
                            finalPosX -= mg.right;
                            finalPosY -= mg.top;
                            break;
                        case cc.UIRelativeAlign.ALIGN_PARENT_LEFT_CENTER_VERTICAL:
                            finalPosX += mg.left;
                            break;
                        case cc.UIRelativeAlign.CENTER_IN_PARENT:
                            break;
                        case cc.UIRelativeAlign.ALIGN_PARENT_RIGHT_CENTER_VERTICAL:
                            finalPosX -= mg.right;
                            break;
                        case cc.UIRelativeAlign.ALIGN_PARENT_LEFT_BOTTOM:
                            finalPosX += mg.left;
                            finalPosY += mg.bottom;
                            break;
                        case cc.UIRelativeAlign.ALIGN_PARENT_BOTTOM_CENTER_HORIZONTAL:
                            finalPosY += mg.bottom;
                            break;
                        case cc.UIRelativeAlign.ALIGN_PARENT_RIGHT_BOTTOM:
                            finalPosX -= mg.right;
                            finalPosY += mg.bottom;
                            break;

                        case cc.UIRelativeAlign.LOCATION_ABOVE_LEFTALIGN:
                        case cc.UIRelativeAlign.LOCATION_ABOVE_CENTER:
                        case cc.UIRelativeAlign.LOCATION_ABOVE_RIGHTALIGN:
                            finalPosY += mg.bottom;
                            finalPosY += relativeWidgetMargin.top;
                            break;
                        case cc.UIRelativeAlign.LOCATION_LEFT_OF_TOPALIGN:
                        case cc.UIRelativeAlign.LOCATION_LEFT_OF_CENTER:
                        case cc.UIRelativeAlign.LOCATION_LEFT_OF_BOTTOMALIGN:
                            finalPosX -= mg.right;
                            finalPosX -= relativeWidgetMargin.left;
                            break;
                        case cc.UIRelativeAlign.LOCATION_RIGHT_OF_TOPALIGN:
                        case cc.UIRelativeAlign.LOCATION_RIGHT_OF_CENTER:
                        case cc.UIRelativeAlign.LOCATION_RIGHT_OF_BOTTOMALIGN:
                            finalPosX += mg.left;
                            finalPosX += relativeWidgetMargin.right;
                            break;
                        case cc.UIRelativeAlign.LOCATION_BELOW_LEFTALIGN:
                        case cc.UIRelativeAlign.LOCATION_BELOW_CENTER:
                        case cc.UIRelativeAlign.LOCATION_BELOW_RIGHTALIGN:
                            finalPosY -= mg.top;
                            finalPosY -= relativeWidgetMargin.bottom;
                            break;
                        default:
                            break;
                    }
                    child.setPosition(ccp(finalPosX, finalPosY));
                    layoutParameter._put = true;
                    unlayoutChildCount--;
                }
            }
        }
    },
    doLayout: function () {
        switch (this._layoutType) {
            case cc.LayoutType.ABSOLUTE:
                break;
            case cc.LayoutType.LINEAR_VERTICAL:
                this.doLayout_LINEAR_VERTICAL();
                break;
            case cc.LayoutType.LINEAR_HORIZONTAL:
                this.doLayout_LINEAR_HORIZONTAL();
                break;
            case cc.LayoutType.RELATIVE:
                this.doLayout_RELATIVE();
                break;
            default:
                break;
        }
    },

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "Layout";
    }
});

cc.Layout.create = function () {
    var layout = new cc.Layout();
    if (layout && layout.init()) {
        return layout;
    }
    return null;
};

cc.RectClippingNode = cc.ClippingNode.extend({
    _innerStencil: null,
    _enabled: null,
    _arrRect: null,
    _clippingSize: null,
    _clippingEnabled: null,
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
        this._innerStencil.drawPoly(this._arrRect, 4, green, 0, green);
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
        this._clippingSize = size;
        this._arrRect[0] = cc.p(0, 0);
        this._arrRect[1] = cc.p(this._clippingSize.width, 0);
        this._arrRect[2] = cc.p(this._clippingSize.width, this._clippingSize.height);
        this._arrRect[3] = cc.p(0, this._clippingSize.height);
        var green = cc.c4f(0, 1, 0, 1);
        this._innerStencil.clear();
        this._innerStencil.drawPoly(this._arrRect, 4, green, 0, green);
    },

    setClippingEnabled: function (enabled) {
        this._clippingEnabled = enabled;
    },

    visit: function (ctx) {
        if (!this._enabled) {
            return;
        }
        if (this._clippingEnabled) {
            if (cc.Browser.supportWebGL) {
                cc.ClippingNode.prototype.visit.call(this, ctx);
            } else {
                this.visitCanvas(ctx);
            }
        }
        else {
            cc.Node.prototype.visit.call(this, ctx);
        }
    },

    visitCanvas: function (ctx) {
        // quick return if not visible
        if (!this._visible)
            return;

        //visit for canvas
        var context = ctx || cc.renderContext, i;
        var children = this._children, child;
        context.save();
        this.transform(context);
        context.beginPath();
        var locContentSize = this.getContentSize();
        var locRect = cc.rect(0, 0, locContentSize.width, locContentSize.height);
        var locEGL_ScaleX = cc.EGLView.getInstance().getScaleX(), locEGL_ScaleY = cc.EGLView.getInstance().getScaleY();

        context.rect(locRect.x * locEGL_ScaleX, locRect.y * locEGL_ScaleY, locRect.width * locEGL_ScaleX, -locRect.height * locEGL_ScaleY);
        context.clip();
        context.closePath();
        var len = children.length;
        if (len > 0) {
            this.sortAllChildren();
            // draw children zOrder < 0
            for (i = 0; i < len; i++) {
                child = children[i];
                if (child._zOrder < 0)
                    child.visit(context);
                else
                    break;
            }
            this.draw(context);
            for (; i < len; i++) {
                children[i].visit(context);
            }
        } else
            this.draw(context);

        this._orderOfArrival = 0;
        context.restore();
    },

    setEnabled: function (enabled) {
        this._enabled = enabled;
    },

    isEnabled: function () {
        return this._enabled;
    }
});
cc.RectClippingNode.create = function () {
    var node = new cc.RectClippingNode();
    if (node && node.init()) {
        return node;
    }
    return null;
};