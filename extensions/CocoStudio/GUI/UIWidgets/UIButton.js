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

var NORMALRENDERERZ = 0;
var PRESSEDRENDERERZ = 0;
var DISABLEDRENDERERZ = 0;
var TITLERENDERERZ = 1;

/**
 * Base class for cc.UIButton
 * @class
 * @extends cc.UIWidget
 */
cc.UIButton = cc.UIWidget.extend({
    _buttonNormalRenderer: null,
    _buttonClickedRenderer: null,
    _buttonDisableRenderer: null,
    _titleRenderer: null,
    _normalFileName: "",
    _clickedFileName: "",
    _disabledFileName: "",
    _prevIgnoreSize: true,
    _scale9Enabled: false,
//    CCRect _capInsets:null,
    _capInsetsNormal: null,
    _capInsetsPressed: null,
    _capInsetsDisabled: null,
    _normalTexType: null,
    _pressedTexType: null,
    _disabledTexType: null,
    _normalTextureSize: null,
    _pressedTextureSize: null,
    _disabledTextureSize: null,
    _pressedActionEnabled: false,
    _titleColor: null,
    ctor: function () {
        cc.UIWidget.prototype.ctor.call(this);
        this._buttonNormalRenderer = null;
        this._buttonClickedRenderer = null;
        this._buttonDisableRenderer = null;
        this._titleRenderer = null;
        this._normalFileName = "";
        this._clickedFileName = "";
        this._disabledFileName = "";
        this._prevIgnoreSize = true;
        this._scale9Enabled = false;
        this._capInsetsNormal = cc.RectZero();
        this._capInsetsPressed = cc.RectZero();
        this._capInsetsDisabled = cc.RectZero();
        this._normalTexType = cc.TextureResType.LOCAL;
        this._pressedTexType = cc.TextureResType.LOCAL;
        this._disabledTexType = cc.TextureResType.LOCAL;
        var locSize = this._size;
        this._normalTextureSize = cc.size(locSize.width, locSize.height);
        this._pressedTextureSize = cc.size(locSize.width, locSize.height);
        this._disabledTextureSize = cc.size(locSize.width, locSize.height);
        this._pressedActionEnabled = false;
        this._titleColor = cc.white();
    },

    init: function () {
        if (cc.UIWidget.prototype.init.call(this))
            return true;
        return false;
    },

    initRenderer: function () {
        cc.UIWidget.prototype.initRenderer.call(this);
        this._buttonNormalRenderer = cc.Sprite.create();
        this._buttonClickedRenderer = cc.Sprite.create();
        this._buttonDisableRenderer = cc.Sprite.create();
        this._titleRenderer = cc.LabelTTF.create("");
        this._renderer.addChild(this._buttonNormalRenderer, NORMALRENDERERZ);
        this._renderer.addChild(this._buttonClickedRenderer, PRESSEDRENDERERZ);
        this._renderer.addChild(this._buttonDisableRenderer, DISABLEDRENDERERZ);
        this._renderer.addChild(this._titleRenderer, TITLERENDERERZ);
    },

    /**
     * Sets if button is using scale9 renderer.
     * @param {Boolean} able
     */
    setScale9Enabled: function (able) {
        if (this._scale9Enabled == able) {
            return;
        }
        this._brightStyle = cc.BrightStyle.NONE;
        this._scale9Enabled = able;

        this._renderer.removeChild(this._buttonNormalRenderer, true);
        this._renderer.removeChild(this._buttonClickedRenderer, true);
        this._renderer.removeChild(this._buttonDisableRenderer, true);

        this._buttonNormalRenderer = null;
        this._buttonClickedRenderer = null;
        this._buttonDisableRenderer = null;
        if (this._scale9Enabled) {
            this._buttonNormalRenderer = cc.Scale9Sprite.create();
            this._buttonClickedRenderer = cc.Scale9Sprite.create();
            this._buttonDisableRenderer = cc.Scale9Sprite.create();
        }
        else {
            this._buttonNormalRenderer = cc.Sprite.create();
            this._buttonClickedRenderer = cc.Sprite.create();
            this._buttonDisableRenderer = cc.Sprite.create();
        }

        this.loadTextureNormal(this._normalFileName, this._normalTexType);
        this.loadTexturePressed(this._clickedFileName, this._pressedTexType);
        this.loadTextureDisabled(this._disabledFileName, this._disabledTexType);
        this._renderer.addChild(this._buttonNormalRenderer, NORMALRENDERERZ);
        this._renderer.addChild(this._buttonClickedRenderer, PRESSEDRENDERERZ);
        this._renderer.addChild(this._buttonDisableRenderer, DISABLEDRENDERERZ);
        if (this._scale9Enabled) {
            var ignoreBefore = this._ignoreSize;
            this.ignoreContentAdaptWithSize(false);
            this._prevIgnoreSize = ignoreBefore;
        }
        else {
            this.ignoreContentAdaptWithSize(this._prevIgnoreSize);
        }
        this.setCapInsetsNormalRenderer(this._capInsetsNormal);
        this.setCapInsetsPressedRenderer(this._capInsetsPressed);
        this.setCapInsetsDisabledRenderer(this._capInsetsDisabled);
        this.setBright(this._bright);
    },

    /**
     * ignoreContentAdaptWithSize
     * @param {Boolean} ignore
     */
    ignoreContentAdaptWithSize: function (ignore) {
        if (!this._scale9Enabled || (this._scale9Enabled && !ignore)) {
            cc.UIWidget.prototype.ignoreContentAdaptWithSize.call(this, ignore);
            this._prevIgnoreSize = ignore;
        }
    },

    /**
     * Load textures for button.
     * @param {String} normal
     * @param {String} selected
     * @param {String} disabled
     * @param {cc.TextureResType} texType
     */
    loadTextures: function (normal, selected, disabled, texType) {
        this.loadTextureNormal(normal, texType);
        this.loadTexturePressed(selected, texType);
        this.loadTextureDisabled(disabled, texType);
    },

    /**
     * Load normal state texture for button.
     * @param {String} normal
     * @param {cc.TextureResType} texType
     */
    loadTextureNormal: function (normal, texType) {
        if (!normal) {
            return;
        }
        texType = texType||cc.TextureResType.LOCAL;
        this._normalFileName = normal;
        this._normalTexType = texType;
        if (this._scale9Enabled) {
            switch (this._normalTexType) {
                case cc.TextureResType.LOCAL:
                    this._buttonNormalRenderer.initWithFile(normal);
                    break;
                case cc.TextureResType.PLIST:
                    this._buttonNormalRenderer.initWithSpriteFrameName(normal);
                    break;
                default:
                    break;
            }
            this._buttonNormalRenderer.setColor(this.getColor());
            this._buttonNormalRenderer.setOpacity(this.getOpacity());
        }
        else {
            switch (this._normalTexType) {
                case cc.TextureResType.LOCAL:
                    this._buttonNormalRenderer.initWithFile(normal);
                    break;
                case cc.TextureResType.PLIST:
                    this._buttonNormalRenderer.initWithSpriteFrameName(normal);
                    break;
                default:
                    break;
            }
            this._buttonNormalRenderer.setColor(this.getColor());
            this._buttonNormalRenderer.setOpacity(this.getOpacity());
        }
        this._normalTextureSize = this._buttonNormalRenderer.getContentSize();
        this.updateAnchorPoint();
        this.normalTextureScaleChangedWithSize();
    },

    /**
     * Load selected state texture for button.
     * @param {String} selected
     * @param {cc.TextureResType} texType
     */
    loadTexturePressed: function (selected, texType) {
        if (!selected) {
            return;
        }
        texType = texType || cc.TextureResType.LOCAL;
        this._clickedFileName = selected;
        this._pressedTexType = texType;
        if (this._scale9Enabled) {
            switch (this._pressedTexType) {
                case cc.TextureResType.LOCAL:
                    this._buttonClickedRenderer.initWithFile(selected);
                    break;
                case cc.TextureResType.PLIST:
                    this._buttonClickedRenderer.initWithSpriteFrameName(selected);
                    break;
                default:
                    break;
            }
            this._buttonClickedRenderer.setColor(this.getColor());
            this._buttonClickedRenderer.setOpacity(this.getOpacity());
        }
        else {
            switch (this._pressedTexType) {
                case cc.TextureResType.LOCAL:
                    this._buttonClickedRenderer.initWithFile(selected);
                    break;
                case cc.TextureResType.PLIST:
                    this._buttonClickedRenderer.initWithSpriteFrameName(selected);
                    break;
                default:
                    break;
            }
            this._buttonClickedRenderer.setColor(this.getColor());
            this._buttonClickedRenderer.setOpacity(this.getOpacity());
        }
        this._pressedTextureSize = this._buttonClickedRenderer.getContentSize();
        this.updateAnchorPoint();
        this.pressedTextureScaleChangedWithSize();
    },

    /**
     * Load dark state texture for button.
     * @param {String} disabled
     * @param {cc.TextureResType} texType
     */
    loadTextureDisabled: function (disabled, texType) {
        if (!disabled) {
            return;
        }
        texType = texType || cc.TextureResType.LOCAL;
        this._disabledFileName = disabled;
        this._disabledTexType = texType;
        if (this._scale9Enabled) {
            switch (this._disabledTexType) {
                case cc.TextureResType.LOCAL:
                    this._buttonDisableRenderer.initWithFile(disabled);
                    break;
                case cc.TextureResType.PLIST:
                    this._buttonDisableRenderer.initWithSpriteFrameName(disabled);
                    break;
                default:
                    break;
            }
            this._buttonDisableRenderer.setColor(this.getColor());
            this._buttonDisableRenderer.setOpacity(this.getOpacity());
        }
        else {
            switch (this._disabledTexType) {
                case cc.TextureResType.LOCAL:
                    this._buttonDisableRenderer.initWithFile(disabled);
                    break;
                case cc.TextureResType.PLIST:
                    this._buttonDisableRenderer.initWithSpriteFrameName(disabled);
                    break;
                default:
                    break;
            }
            this._buttonDisableRenderer.setColor(this.getColor());
            this._buttonDisableRenderer.setOpacity(this.getOpacity());
        }
        this._disabledTextureSize = this._buttonDisableRenderer.getContentSize();
        this.updateAnchorPoint();
        this.disabledTextureScaleChangedWithSize();
    },

    /**
     * Sets capinsets for button, if button is using scale9 renderer.
     * @param {cc.Rect} capInsets
     */
    setCapInsets: function (capInsets) {
        this.setCapInsetsNormalRenderer(capInsets);
        this.setCapInsetsPressedRenderer(capInsets);
        this.setCapInsetsDisabledRenderer(capInsets);
    },

    /**
     * Sets capinsets for button, if button is using scale9 renderer.
     * @param {cc.Rect} capInsets
     */
    setCapInsetsNormalRenderer: function (capInsets) {
        this._capInsetsNormal = capInsets;
        if (!this._scale9Enabled) {
            return;
        }
        this._buttonNormalRenderer.setCapInsets(capInsets);
    },

    /**
     * Sets capinsets for button, if button is using scale9 renderer.
     * @param {cc.Rect} capInsets
     */
    setCapInsetsPressedRenderer: function (capInsets) {
        this._capInsetsPressed = capInsets;
        if (!this._scale9Enabled) {
            return;
        }
        this._buttonClickedRenderer.setCapInsets(capInsets);
    },

    /**
     * Sets capinsets for button, if button is using scale9 renderer.
     * @param {cc.Rect} capInsets
     */
    setCapInsetsDisabledRenderer: function (capInsets) {
        this._capInsetsDisabled = capInsets;
        if (!this._scale9Enabled) {
            return;
        }
        this._buttonDisableRenderer.setCapInsets(capInsets);
    },

    onPressStateChangedToNormal: function () {
        this._buttonNormalRenderer.setVisible(true);
        this._buttonClickedRenderer.setVisible(false);
        this._buttonDisableRenderer.setVisible(false);
        if (this._pressedActionEnabled) {
            this._buttonNormalRenderer.stopAllActions();
            this._buttonClickedRenderer.stopAllActions();
            this._buttonDisableRenderer.stopAllActions();
            var zoomAction = cc.ScaleTo.create(0.05, 1.0);
            var zoomAction1 = cc.ScaleTo.create(0.05, 1.0);
            var zoomAction2 = cc.ScaleTo.create(0.05, 1.0);
            this._buttonNormalRenderer.runAction(zoomAction);
            this._buttonClickedRenderer.runAction(zoomAction1);
            this._buttonDisableRenderer.runAction(zoomAction2);
        }
    },

    onPressStateChangedToPressed: function () {
        this._buttonNormalRenderer.setVisible(false);
        this._buttonClickedRenderer.setVisible(true);
        this._buttonDisableRenderer.setVisible(false);
        if (this._pressedActionEnabled) {
            this._buttonNormalRenderer.stopAllActions();
            this._buttonClickedRenderer.stopAllActions();
            this._buttonDisableRenderer.stopAllActions();
            var zoomAction = cc.ScaleTo.create(0.05, 1.1);
            var zoomAction1 = cc.ScaleTo.create(0.05, 1.1);
            var zoomAction2 = cc.ScaleTo.create(0.05, 1.1);
            this._buttonNormalRenderer.runAction(zoomAction);
            this._buttonClickedRenderer.runAction(zoomAction1);
            this._buttonDisableRenderer.runAction(zoomAction2);
        }
    },

    onPressStateChangedToDisabled: function () {
        this._buttonNormalRenderer.setVisible(false);
        this._buttonClickedRenderer.setVisible(false);
        this._buttonDisableRenderer.setVisible(true);
    },

    /**
     * override "setFlippedX" of widget.
     * @param {Boolean} flipX
     */
    setFlippedX: function (flipX) {
        this._titleRenderer.setFlippedX(flipX);
        if (this._scale9Enabled) {
            return;
        }
        this._buttonNormalRenderer.setFlippedX(flipX);
        this._buttonClickedRenderer.setFlippedX(flipX);
        this._buttonDisableRenderer.setFlippedX(flipX);
    },

    /**
     * override "setFlippedY" of widget.
     * @param {Boolean} flipY
     */
    setFlippedY: function (flipY) {
        this._titleRenderer.setFlippedY(flipY);
        if (this._scale9Enabled) {
            return;
        }
        this._buttonNormalRenderer.setFlippedY(flipY);
        this._buttonClickedRenderer.setFlippedY(flipY);
        this._buttonDisableRenderer.setFlippedY(flipY);
    },

    /**
     * override "isFlippedX" of widget.
     * @returns {Boolean}
     */
    isFlippedX: function () {
        if (this._scale9Enabled) {
            return false;
        }
        return this._buttonNormalRenderer.isFlippedX();
    },

    /**
     * override "isFlippedY" of widget.
     * @returns {Boolean}
     */
    isFlippedY: function () {
        if (this._scale9Enabled) {
            return false;
        }
        return this._buttonNormalRenderer.isFlippedY();
    },

    /**
     * override "setAnchorPoint" of widget.
     * @param {cc.Point} pt
     */
    setAnchorPoint: function (pt) {
        cc.UIWidget.prototype.setAnchorPoint.call(this,pt);
        this._buttonNormalRenderer.setAnchorPoint(pt);
        this._buttonClickedRenderer.setAnchorPoint(pt);
        this._buttonDisableRenderer.setAnchorPoint(pt);
        this._titleRenderer.setPosition(cc.p(this._size.width * (0.5 - this._anchorPoint.x), this._size.height * (0.5 - this._anchorPoint.y)));
    },

    onSizeChanged: function () {
        this.normalTextureScaleChangedWithSize();
        this.pressedTextureScaleChangedWithSize();
        this.disabledTextureScaleChangedWithSize();
    },

    /**
     * override "getContentSize" method of widget.
     * @returns {cc.Size}
     */
    getContentSize: function () {
        return this._normalTextureSize;
    },

    /**
     * override "getContentSize" method of widget.
     * @returns {cc.Node}
     */
    getVirtualRenderer: function () {
        if (this._bright) {
            switch (this._brightStyle) {
                case cc.BrightStyle.NORMAL:
                    return this._buttonNormalRenderer;
                case cc.BrightStyle.HIGHLIGHT:
                    return this._buttonClickedRenderer;
                default:
                    return null;
            }
        }
        else {
            return this._buttonDisableRenderer;
        }
    },

    normalTextureScaleChangedWithSize: function () {
        if (this._ignoreSize) {
            if (!this._scale9Enabled) {
                this._buttonNormalRenderer.setScale(1.0);
                this._size = this._normalTextureSize;
            }
        }
        else {
            if (this._scale9Enabled) {
                this._buttonNormalRenderer.setPreferredSize(this._size);
            }
            else {
                var textureSize = this._normalTextureSize;
                if (textureSize.width <= 0.0 || textureSize.height <= 0.0) {
                    this._buttonNormalRenderer.setScale(1.0);
                    return;
                }
                var scaleX = this._size.width / textureSize.width;
                var scaleY = this._size.height / textureSize.height;
                this._buttonNormalRenderer.setScaleX(scaleX);
                this._buttonNormalRenderer.setScaleY(scaleY);
            }
        }
    },

    pressedTextureScaleChangedWithSize: function () {
        if (this._ignoreSize) {
            if (!this._scale9Enabled) {
                this._buttonClickedRenderer.setScale(1.0);
            }
        }
        else {
            if (this._scale9Enabled) {
                this._buttonClickedRenderer.setPreferredSize(this._size);
            }
            else {
                var textureSize = this._pressedTextureSize;
                if (textureSize.width <= 0.0 || textureSize.height <= 0.0) {
                    this._buttonClickedRenderer.setScale(1.0);
                    return;
                }
                var scaleX = this._size.width / this._pressedTextureSize.width;
                var scaleY = this._size.height / this._pressedTextureSize.height;
                this._buttonClickedRenderer.setScaleX(scaleX);
                this._buttonClickedRenderer.setScaleY(scaleY);
            }
        }
    },

    disabledTextureScaleChangedWithSize: function () {
        if (this._ignoreSize) {
            if (!this._scale9Enabled) {
                this._buttonDisableRenderer.setScale(1.0);
            }
        }
        else {
            if (this._scale9Enabled) {
                this._buttonDisableRenderer.setPreferredSize(this._size);
            }
            else {
                var textureSize = this._disabledTextureSize;
                if (textureSize.width <= 0.0 || textureSize.height <= 0.0) {
                    this._buttonDisableRenderer.setScale(1.0);
                    return;
                }
                var scaleX = this._size.width / this._disabledTextureSize.width;
                var scaleY = this._size.height / this._disabledTextureSize.height;
                this._buttonDisableRenderer.setScaleX(scaleX);
                this._buttonDisableRenderer.setScaleY(scaleY);
            }
        }
    },

    /**
     * Changes if button can be clicked zoom effect.
     * @param {Boolean} enabled
     */
    setPressedActionEnabled: function (enabled) {
        this._pressedActionEnabled = enabled;
    },

    /**
     * set title text
     * @param {String} text
     */
    setTitleText: function (text) {
        this._titleRenderer.setString(text);
    },

    /**
     * get title text
     * @returns {String} text
     */
    getTitleText: function () {
        return this._titleRenderer.getString();
    },

    /**
     * set title color
     * @param {cc.c3b} color
     */
    setTitleColor: function (color) {
        this._titleColor = color;
        this._titleRenderer.setColor(color);
    },

    /**
     * get title color
     * @returns {cc.c3b}
     */
    getTitleColor: function () {
        return this._titleRenderer.getColor();
    },

    /**
     * set title fontSize
     * @param {cc.Size} size
     */
    setTitleFontSize: function (size) {
        this._titleRenderer.setFontSize(size);
    },

    /**
     * get title fontSize
     * @returns {cc.Size}
     */
    getTitleFontSize: function () {
        return this._titleRenderer.getFontSize();
    },

    /**
     * set title fontName
     * @param {String} fontName
     */
    setTitleFontName: function (fontName) {
        this._titleRenderer.setFontName(fontName);
    },

    /**
     * get title fontName
     * @returns {String}
     */
    getTitleFontName: function () {
        return this._titleRenderer.getFontName();
    },

    /**
     * Sets color to widget
     * It default change the color of widget's children.
     * @param color
     */
    setColor: function (color) {
        cc.UIWidget.prototype.setColor.call(this,color);
        this.setTitleColor(this._titleColor);
    },

    getDescription: function () {
        return "Button";
    }

});
cc.UIButton.create = function () {
    var uiButton = new cc.UIButton();
    if (uiButton && uiButton.init()) {
        return uiButton;
    }
    return null;
};