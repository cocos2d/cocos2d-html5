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

cc.Layout = cc.UIWidget.extend({
    _clippingEnabled: null,

//background
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

    init: function () {
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

    setBackGroundImage: function (fileName, texType) {
        if (!fileName) {
            return;
        }
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

    setBackGroundImageCapInsets: function (capInsets) {
        this._backGroundImageCapInsets = capInsets;
        if (this._backGroundScale9Enable) {
            this._backGroundImage.setCapInsets(capInsets);
        }
    },

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

    removeBackGroundImage: function () {
        if (!this._backGroundImage) {
            return;
        }
        this._renderer.removeChild(this._backGroundImage, true);
        this._backGroundImage = null;
        this._backGroundImageFileName = "";
        this._backGroundImageTextureSize = cc.SizeZero();
    },

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
                this._gradientRender = cc.LayerGradient.create();
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

    setBackGroundColor: function (color) {
        this._color = color;
        if (this._colorRender) {
            this._colorRender.setColor(color);
        }
    },

    setBackGroundColor: function (startColor, endColor) {
        this._startColor = startColor;
        if (this._gradientRender) {
            this._gradientRender.setStartColor(startColor);
        }
        this._endColor = endColor;
        if (this._gradientRender) {
            this._gradientRender.setEndColor(endColor);
        }
    },

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

    setBackGroundColorVector: function (vector) {
        this._alongVector = vector;
        if (this._gradientRender) {
            this._gradientRender.setVector(vector);
        }
    },

    setColor: function (color) {
        cc.UIWidget.prototype.setColor.call(this, color);
        if (this._backGroundImage) {
            if (this._backGroundImage.RGBAProtocol) {
                this._backGroundImage.setColor(color);
            }
        }
    },

    setOpacity: function (opacity) {
        cc.UIWidget.prototype.setOpacity.call(this, opacity);
        if (this._backGroundImage) {
            if (this._backGroundImage.RGBAProtocol) {
                this._backGroundImage.setOpacity(opacity);
            }
        }
    },

    getBackGroundImageTextureSize: function () {
        return this._backGroundImageTextureSize;
    },

    getContentSize: function () {
        return this._renderer.getContentSize();
    },

    setLayoutType: function (type) {
        this._layoutType = type;
    },

    getLayoutType: function () {
        return this._layoutType;
    },

    doLayout: function () {
        switch (this._layoutType) {
            case cc.LayoutType.ABSOLUTE:
                break;
            case cc.LayoutType.LINEAR_VERTICAL:
            {
                var layoutChildrenArray = this.getChildren();
                var length = layoutChildrenArray.length;
                var layoutSize = this.getSize();
                var topBoundary = layoutSize.height;
                var child, layoutParameter;
                for (var i = 0; i < length; ++i) {
                    child = layoutChildrenArray.arr[i];
                    layoutParameter = child.getLayoutParameter();

                    if (layoutParameter) {
                        var childType = child.getWidgetType();
                        var childGravity = layoutParameter.getGravity();
                        var ap = child.getAnchorPoint();
                        var cs = child.getSize();
                        var finalPosX = childType == cc.WidgetType.Widget ? ap.x * cs.width : 0;
                        var finalPosY = childType == cc.WidgetType.Widget ? topBoundary - ((1.0 - ap.y) * cs.height) : topBoundary - cs.height;
                        switch (childGravity) {
                            case cc.UILinearGravity.NONE:
                            case cc.UILinearGravity.LEFT:
                                break;
                            case cc.UILinearGravity.RIGHT:
                                finalPosX = childType == cc.WidgetType.Widget ? layoutSize.width - ((1.0 - ap.x) * cs.width) : layoutSize.width - cs.width;
                                break;
                            case cc.UILinearGravity.CENTER_HORIZONTAL:
                                finalPosX = childType == cc.WidgetType.Widget ? layoutSize.width / 2.0 - cs.width * (0.5 - ap.x) : (layoutSize.width - cs.width) * 0.5;
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
                break;
            }
            case cc.LayoutType.LINEAR_HORIZONTAL:
            {
                var layoutChildrenArray = this.getChildren();
                var length = layoutChildrenArray.length;
                var layoutSize = this.getSize();
                var leftBoundary = 0, child, layoutParameter;
                for (var i = 0; i < length; ++i) {
                    child = layoutChildrenArray[i];
                    layoutParameter = child.getLayoutParameter();

                    if (layoutParameter) {
                        var childType = child.getWidgetType();
                        var childGravity = layoutParameter.getGravity();
                        var ap = child.getAnchorPoint();
                        var cs = child.getSize();
                        var finalPosX = childType == cc.WidgetType.Widget ? leftBoundary + (ap.x * cs.width) : leftBoundary;
                        var finalPosY = childType == cc.WidgetType.Widget ? layoutSize.height - (1.0 - ap.y) * cs.height : layoutSize.height - cs.height;
                        switch (childGravity) {
                            case cc.UILinearGravity.NONE:
                            case cc.UILinearGravity.TOP:
                                break;
                            case cc.UILinearGravity.BOTTOM:
                                finalPosY = childType == cc.WidgetType.Widget ? ap.y * cs.height : 0;
                                break;
                            case cc.UILinearGravity.CENTER_VERTICAL:
                                finalPosY = childType == cc.WidgetType.Widget ? layoutSize.height / 2.0 - cs.height * (0.5 - ap.y) : (layoutSize.height - cs.height) * 0.5;
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
                break;
            }
            case cc.LayoutType.RELATIVE:
            {
                var layoutChildrenArray = this.getChildren().data;
                var length = layoutChildrenArray.length;
                var layoutSize = this.getSize();
                for (var i = 0; i < length; i++) {
                    var child = layoutChildrenArray[i];
                    var childType = child.getWidgetType();
                    var ap = child.getAnchorPoint();
                    var cs = child.getSize();
                    var layoutParameter = child.getLayoutParameter();
                    if (layoutParameter) {
                        var finalPosX = childType == cc.WidgetType.Widget ? ap.x * cs.width : 0;
                        var finalPosY = childType == cc.WidgetType.Widget ? layoutSize.height - ((1.0 - ap.y) * cs.height) : layoutSize.height - cs.height;
                        var align = layoutParameter.getAlign();
                        var relativeName = layoutParameter.getRelativeToWidgetName();
                        var relativeWidget = null;
                        if (relativeName) {
                            relativeWidget = cc.UIHelper.getInstance().seekWidgetByRelativeName(this, relativeName);
                        }
                        switch (align) {
                            case cc.UIRelativeAlign.NONE:
                                break;
                            case cc.UIRelativeAlign.PARENT_LEFT:
                                break;
                            case cc.UIRelativeAlign.PARENT_TOP:
                                break;
                            case cc.UIRelativeAlign.PARENT_RIGHT:
                                finalPosX = childType == cc.WidgetType.Widget ? layoutSize.width - ((1 - ap.x) * cs.width) : layoutSize.width - cs.width;
                                break;
                            case cc.UIRelativeAlign.PARENT_BOTTOM:
                                finalPosY = childType == cc.WidgetType.Widget ? ap.y * cs.height : 0;
                                break;
                            case cc.UIRelativeAlign.CENTER_IN_PARENT:
                                finalPosX = childType == cc.WidgetType.Widget ? layoutSize.width * 0.5 - cs.width * (0.5 - ap.x) : (layoutSize.width - cs.width) * 0.5;
                                finalPosY = childType == cc.WidgetType.Widget ? layoutSize.height * 0.5 - cs.height * (0.5 - ap.y) : (layoutSize.height - cs.height) * 0.5;
                                break;
                            case cc.UIRelativeAlign.CENTER_HORIZONTAL:
                                finalPosX = childType == cc.WidgetType.Widget ? layoutSize.width * 0.5 - cs.width * (0.5 - ap.x) : (layoutSize.width - cs.width) * 0.5;
                                break;
                            case cc.UIRelativeAlign.CENTER_VERTICAL:
                                finalPosY = childType == cc.WidgetType.Widget ? layoutSize.height * 0.5 - cs.height * (0.5 - ap.y) : (layoutSize.height - cs.height) * 0.5;
                                break;
                            case cc.UIRelativeAlign.LOCATION_LEFT_OF_TOPALIGN:
                                if (relativeWidget) {
                                    var locationTop = relativeWidget.getTopInParent();
                                    var locationRight = relativeWidget.getLeftInParent();
                                    finalPosY = childType == cc.WidgetType.Widget ? locationTop - ap.y * cs.height : locationTop - cs.height;
                                    finalPosX = childType == cc.WidgetType.Widget ? locationRight - (1 - ap.x) * cs.width : locationRight - cs.width;
                                }
                                break;
                            case cc.UIRelativeAlign.LOCATION_LEFT_OF_CENTER:
                                break;
                            case cc.UIRelativeAlign.LOCATION_LEFT_OF_BOTTOMALIGN:
                                if (relativeWidget) {
                                    var locationRight = relativeWidget.getLeftInParent();
                                    var locationBottom = relativeWidget.getBottomInParent();
                                    finalPosY = childType == cc.WidgetType.Widget ? locationBottom + ap.y * cs.height : locationBottom;
                                    finalPosX = childType == cc.WidgetType.Widget ? locationRight - (1 - ap.x) * cs.width : locationRight - cs.width;
                                }
                                break;
                            case cc.UIRelativeAlign.LOCATION_RIGHT_OF_TOPALIGN:
                                if (relativeWidget) {
                                    var locationTop = relativeWidget.getTopInParent();
                                    var locationLeft = relativeWidget.getRightInParent();
                                    finalPosY = childType == cc.WidgetType.Widget ? locationTop - ap.y * cs.height : locationTop - cs.height;
                                    finalPosX = childType == cc.WidgetType.Widget ? locationLeft + ap.x * cs.width : locationLeft;
                                }
                                break;
                            case cc.UIRelativeAlign.LOCATION_RIGHT_OF_CENTER:
                                break;
                            case cc.UIRelativeAlign.LOCATION_RIGHT_OF_BOTTOMALIGN:
                                if (relativeWidget) {
                                    var locationLeft = relativeWidget.getRightInParent();
                                    var locationBottom = relativeWidget.getBottomInParent();
                                    finalPosY = childType == cc.WidgetType.Widget ? locationBottom + ap.y * cs.height : locationBottom;
                                    finalPosX = childType == cc.WidgetType.Widget ? locationLeft + ap.x * cs.width : locationLeft;
                                }
                                break;
                            case cc.UIRelativeAlign.LOCATION_ABOVE_LEFTALIGN:
                                if (relativeWidget) {
                                    var locationBottom = relativeWidget.getTopInParent();
                                    var locationLeft = relativeWidget.getLeftInParent();
                                    finalPosY = childType == cc.WidgetType.Widget ? locationBottom + ap.y * cs.height : locationBottom;
                                    finalPosX = childType == cc.WidgetType.Widget ? locationLeft + ap.x * cs.width : locationLeft;
                                }
                                break;
                            case cc.UIRelativeAlign.LOCATION_ABOVE_CENTER:
                                break;
                            case cc.UIRelativeAlign.LOCATION_ABOVE_RIGHTALIGN:
                                if (relativeWidget) {
                                    var locationBottom = relativeWidget.getTopInParent();
                                    var locationRight = relativeWidget.getRightInParent();
                                    finalPosY = childType == cc.WidgetType.Widget ? locationBottom + ap.y * cs.height : locationBottom;
                                    finalPosX = childType == cc.WidgetType.Widget ? locationRight - (1 - ap.x) * cs.width : locationRight - cs.width;
                                }
                                break;
                            case cc.UIRelativeAlign.LOCATION_BELOW_LEFTALIGN:
                                if (relativeWidget) {
                                    var locationTop = relativeWidget.getBottomInParent();
                                    var locationLeft = relativeWidget.getLeftInParent();
                                    finalPosY = childType == cc.WidgetType.Widget ? locationTop - (1 - ap.y) * cs.height : locationTop - cs.height;
                                    finalPosX = childType == cc.WidgetType.Widget ? locationLeft + ap.x * cs.width : locationLeft;
                                }
                                break;
                            case cc.UIRelativeAlign.LOCATION_BELOW_CENTER:
                                break;
                            case cc.UIRelativeAlign.LOCATION_BELOW_RIGHTALIGN:
                                if (relativeWidget) {
                                    var locationTop = relativeWidget.getBottomInParent();
                                    var locationRight = relativeWidget.getRightInParent();
                                    finalPosY = childType == cc.WidgetType.Widget ? locationTop - (1 - ap.y) * cs.height : locationTop - cs.height;
                                    finalPosX = childType == cc.WidgetType.Widget ? locationRight - (1 - ap.x) * cs.width : locationRight - cs.width;
                                }
                                break;
                            default:
                                break;
                        }
                        var relativeWidgetMargin;
                        var mg;
                        if (relativeWidget) {
                            relativeWidgetMargin = relativeWidget.getLayoutParameter().getMargin();
                            mg = child.getLayoutParameter().getMargin();
                        }
                        //handle margin
                        switch (align) {
                            case cc.UIRelativeAlign.LOCATION_ABOVE_LEFTALIGN:
                            case cc.UIRelativeAlign.LOCATION_ABOVE_RIGHTALIGN:
                            case cc.UIRelativeAlign.LOCATION_ABOVE_CENTER:
                                finalPosY += relativeWidgetMargin.top;
                                finalPosY += mg.bottom;
                                break;
                            case cc.UIRelativeAlign.LOCATION_BELOW_LEFTALIGN:
                            case cc.UIRelativeAlign.LOCATION_BELOW_RIGHTALIGN:
                            case cc.UIRelativeAlign.LOCATION_BELOW_CENTER:
                                finalPosY -= relativeWidgetMargin.bottom;
                                finalPosY -= mg.top;
                                break;
                            case cc.UIRelativeAlign.LOCATION_LEFT_OF_TOPALIGN:
                            case cc.UIRelativeAlign.LOCATION_LEFT_OF_BOTTOMALIGN:
                            case cc.UIRelativeAlign.LOCATION_LEFT_OF_CENTER:
                                finalPosX -= relativeWidgetMargin.left;
                                finalPosX -= mg.right;
                                break;
                            case cc.UIRelativeAlign.LOCATION_RIGHT_OF_TOPALIGN:
                            case cc.UIRelativeAlign.LOCATION_RIGHT_OF_BOTTOMALIGN:
                            case cc.UIRelativeAlign.LOCATION_RIGHT_OF_CENTER:
                                finalPosX += relativeWidgetMargin.right;
                                finalPosX += mg.left;
                                break;
                            default:
                                break;
                        }
                        child.setPosition(cc.p(finalPosX, finalPosY));
                    }
                }
                break;
            }
            default:
                break;
        }
    },

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
        this.rect = [];
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
        if (cc.ClippingNode.prototype.init.call(this,this._innerStencil)) {
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
    }
});
cc.RectClippingNode.create = function () {
    var node = new cc.RectClippingNode();
    if (node && node.init()) {
        return node;
    }
    return null;
};