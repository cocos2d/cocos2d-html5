/****************************************************************************
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

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
 * Base class for ccui.Button
 * @class
 * @extends ccui.Widget
 *
 * @property {String}   titleText               - The content string of the button title
 * @property {String}   titleFont               - The content string font of the button title
 * @property {Number}   titleFontSize           - The content string font size of the button title
 * @property {String}   titleFontName           - The content string font name of the button title
 * @property {cc.Color} titleFontColor          - The content string font color of the button title
 * @property {Boolean}  pressedActionEnabled    - Indicate whether button has zoom effect when clicked
 */
ccui.Button = ccui.Widget.extend(/** @lends ccui.Button# */{
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
    _normalTexType: ccui.Widget.LOCAL_TEXTURE,
    _pressedTexType: ccui.Widget.LOCAL_TEXTURE,
    _disabledTexType: ccui.Widget.LOCAL_TEXTURE,
    _normalTextureSize: null,
    _pressedTextureSize: null,
    _disabledTextureSize: null,
    pressedActionEnabled: false,
    _titleColor: null,
    _normalTextureScaleXInSize: 1,
    _normalTextureScaleYInSize: 1,
    _pressedTextureScaleXInSize: 1,
    _pressedTextureScaleYInSize: 1,
    _normalTextureLoaded: false,
    _pressedTextureLoaded: false,
    _disabledTextureLoaded: false,
    _cascadeOpacityEnabled: true,
    _className: "Button",
    _normalTextureAdaptDirty: true,
    _pressedTextureAdaptDirty: true,
    _disabledTextureAdaptDirty: true,

    _fontName: "Thonburi",
    _fontSize: 12,
    _type: 0,

    /**
     * allocates and initializes a UIButton.
     * Constructor of ccui.Button
     * @example
     * // example
     * var uiButton = new ccui.Button();
     */
    ctor: function () {
        this._capInsetsNormal = cc.rect(0, 0, 0, 0);
        this._capInsetsPressed = cc.rect(0, 0, 0, 0);
        this._capInsetsDisabled = cc.rect(0, 0, 0, 0);
        var locSize = this._size;
        this._normalTextureSize = cc.size(locSize.width, locSize.height);
        this._pressedTextureSize = cc.size(locSize.width, locSize.height);
        this._disabledTextureSize = cc.size(locSize.width, locSize.height);
        this._titleColor = cc.color.WHITE;
        ccui.Widget.prototype.ctor.call(this);
    },

    init: function (normalImage, selectedImage,disableImage, texType) {
        if (ccui.Widget.prototype.init.call(this)) {
            this.setTouchEnabled(true);
            if(normalImage === undefined)
                return true;
            this.loadTextures(normalImage, selectedImage,disableImage, texType);
        }
        return false;
    },

    initRenderer: function () {
        this._buttonNormalRenderer = cc.Sprite.create();
        this._buttonClickedRenderer = cc.Sprite.create();
        this._buttonDisableRenderer = cc.Sprite.create();
        this._titleRenderer = cc.LabelTTF.create("");
        this.addProtectedChild(this._buttonNormalRenderer, ccui.Button.NORMAL_RENDERER_ZORDER, -1);
        this.addProtectedChild(this._buttonClickedRenderer, ccui.Button.PRESSED_RENDERER_ZORDER, -1);
        this.addProtectedChild(this._buttonDisableRenderer, ccui.Button.DISABLED_RENDERER_ZORDER, -1);
        this.addProtectedChild(this._titleRenderer, ccui.Button.TITLE_RENDERER_ZORDER, -1);
    },

    /**
     * Sets if button is using scale9 renderer.
     * @param {Boolean} able
     */
    setScale9Enabled: function (able) {
        if (this._scale9Enabled == able)
            return;

        this._brightStyle = ccui.Widget.BRIGHT_STYLE_NONE;
        this._scale9Enabled = able;

        this.removeProtectedChild(this._buttonNormalRenderer);
        this.removeProtectedChild(this._buttonClickedRenderer);
        this.removeProtectedChild(this._buttonDisableRenderer);

        if (this._scale9Enabled) {
            this._buttonNormalRenderer = cc.Scale9Sprite.create();
            this._buttonClickedRenderer = cc.Scale9Sprite.create();
            this._buttonDisableRenderer = cc.Scale9Sprite.create();
        } else {
            this._buttonNormalRenderer = cc.Sprite.create();
            this._buttonClickedRenderer = cc.Sprite.create();
            this._buttonDisableRenderer = cc.Sprite.create();
        }

        this.loadTextureNormal(this._normalFileName, this._normalTexType);
        this.loadTexturePressed(this._clickedFileName, this._pressedTexType);
        this.loadTextureDisabled(this._disabledFileName, this._disabledTexType);

        this.addProtectedChild(this._buttonNormalRenderer, ccui.Button.NORMAL_RENDERER_ZORDER, -1);
        this.addProtectedChild(this._buttonClickedRenderer, ccui.Button.PRESSED_RENDERER_ZORDER, -1);
        this.addProtectedChild(this._buttonDisableRenderer, ccui.Button.DISABLED_RENDERER_ZORDER, -1);
        if (this._scale9Enabled) {
            var ignoreBefore = this._ignoreSize;
            this.ignoreContentAdaptWithSize(false);
            this._prevIgnoreSize = ignoreBefore;
        } else {
            this.ignoreContentAdaptWithSize(this._prevIgnoreSize);
        }
        this.setCapInsetsNormalRenderer(this._capInsetsNormal);
        this.setCapInsetsPressedRenderer(this._capInsetsPressed);
        this.setCapInsetsDisabledRenderer(this._capInsetsDisabled);
        this.setBright(this._bright);
    },

    /**
     *  Get button is using scale9 renderer or not.
     * @returns {Boolean}
     */
    isScale9Enabled: function () {
        return this._scale9Enabled;
    },

    ignoreContentAdaptWithSize: function (ignore) {
        if (!this._scale9Enabled || (this._scale9Enabled && !ignore)) {
            ccui.Widget.prototype.ignoreContentAdaptWithSize.call(this, ignore);
            this._prevIgnoreSize = ignore;
        }
    },

    getVirtualRendererSize: function(){
        return this._normalTextureSize;
    },

    /**
     * Load textures for button.
     * @param {String} normal
     * @param {String} selected
     * @param {String} disabled
     * @param {ccui.Widget.LOCAL_TEXTURE|ccui.Widget.PLIST_TEXTURE} texType
     */
    loadTextures: function (normal, selected, disabled, texType) {
        this.loadTextureNormal(normal, texType);
        this.loadTexturePressed(selected, texType);
        this.loadTextureDisabled(disabled, texType);
    },

    /**
     * Load normal state texture for button.
     * @param {String} normal
     * @param {ccui.Widget.LOCAL_TEXTURE|ccui.Widget.PLIST_TEXTURE} texType
     */
    loadTextureNormal: function (normal, texType) {
        if (!normal)
            return;
        texType = texType || ccui.Widget.LOCAL_TEXTURE;
        this._normalFileName = normal;
        this._normalTexType = texType;
        if (this._scale9Enabled) {
            var normalRendererScale9 = this._buttonNormalRenderer;
            switch (this._normalTexType){
                case ccui.Widget.LOCAL_TEXTURE:
                    normalRendererScale9.initWithFile(normal);
                    break;
                case ccui.Widget.PLIST_TEXTURE:
                    normalRendererScale9.initWithSpriteFrameName(normal);
                    break;
                default:
                    break;
            }
            normalRendererScale9.setCapInsets(this._capInsetsNormal);
        } else {
            var normalRenderer = this._buttonNormalRenderer;
            switch (this._normalTexType){
                case ccui.Widget.LOCAL_TEXTURE:
                    normalRenderer.setTexture(normal);
                    break;
                case ccui.Widget.PLIST_TEXTURE:
                    normalRenderer.setSpriteFrame(normal);
                    break;
                default:
                    break;
            }
        }
        this._normalTextureSize = this._buttonNormalRenderer.getContentSize();
        this.updateFlippedX();
        this.updateFlippedY();

        this._buttonNormalRenderer.setColor(this.getColor());
        this._buttonNormalRenderer.setOpacity(this.getOpacity());

        this._updateContentSizeWithTextureSize(this._normalTextureSize);
        this._normalTextureLoaded = true;
        this._normalTextureAdaptDirty = true;
    },

    /**
     * Load selected state texture for button.
     * @param {String} selected
     * @param {ccui.Widget.LOCAL_TEXTURE|ccui.Widget.PLIST_TEXTURE} texType
     */
    loadTexturePressed: function (selected, texType) {
        if (!selected)
            return;
        texType = texType || ccui.Widget.LOCAL_TEXTURE;
        this._clickedFileName = selected;
        this._pressedTexType = texType;
        if (this._scale9Enabled) {
            var clickedRendererScale9 = this._buttonClickedRenderer;
            switch (this._pressedTexType) {
                case ccui.Widget.LOCAL_TEXTURE:
                    clickedRendererScale9.initWithFile(selected);
                    break;
                case ccui.Widget.PLIST_TEXTURE:
                    clickedRendererScale9.initWithSpriteFrameName(selected);
                    break;
                default:
                    break;
            }
            clickedRendererScale9.setCapInsets(this._capInsetsPressed);
        } else {
            var clickedRenderer = this._buttonClickedRenderer;
            switch (this._pressedTexType) {
                case ccui.Widget.LOCAL_TEXTURE:
                    clickedRenderer.setTexture(selected);
                    break;
                case ccui.Widget.PLIST_TEXTURE:
                    clickedRenderer.setSpriteFrame(selected);
                    break;
                default:
                    break;
            }
        }
        this._pressedTextureSize = this._buttonClickedRenderer.getContentSize();
        this.updateFlippedX();
        this.updateFlippedY();

        this._buttonDisableRenderer.setColor(this.getColor());
        this._buttonDisableRenderer.setOpacity(this.getOpacity());

        this._pressedTextureLoaded = true;
        this._pressedTextureAdaptDirty = true;
    },

    /**
     * Load dark state texture for button.
     * @param {String} disabled
     * @param {ccui.Widget.LOCAL_TEXTURE|ccui.Widget.PLIST_TEXTURE} texType
     */
    loadTextureDisabled: function (disabled, texType) {
        if (!disabled) {
            return;
        }
        texType = texType || ccui.Widget.LOCAL_TEXTURE;
        this._disabledFileName = disabled;
        this._disabledTexType = texType;
        if (this._scale9Enabled) {
            var disabledScale9 = this._buttonDisableRenderer;
            switch (this._disabledTexType) {
                case ccui.Widget.LOCAL_TEXTURE:
                    disabledScale9.initWithFile(disabled);
                    break;
                case ccui.Widget.PLIST_TEXTURE:
                    disabledScale9.initWithSpriteFrameName(disabled);
                    break;
                default:
                    break;
            }
            disabledScale9.setCapInsets(this._capInsetsDisabled);
        } else {
            var disabledRenderer = this._buttonDisableRenderer;
            switch (this._disabledTexType) {
                case ccui.Widget.LOCAL_TEXTURE:
                    disabledRenderer.setTexture(disabled);
                    break;
                case ccui.Widget.PLIST_TEXTURE:
                    disabledRenderer.setSpriteFrame(disabled);
                    break;
                default:
                    break;
            }
        }
        this._disabledTextureSize = this._buttonDisableRenderer.getContentSize();
        this.updateFlippedX();
        this.updateFlippedY();
        this._buttonDisableRenderer.setColor(this.getColor());
        this._buttonDisableRenderer.setOpacity(this.getOpacity());

        this._disabledTextureLoaded = true;
        this._disabledTextureAdaptDirty = true;
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
     *  Get normal renderer cap insets  .
     * @returns {cc.Rect}
     */
    getCapInsetsNormalRenderer:function(){
        return this._capInsetsNormal;
    },

    /**
     * Sets capinsets for button, if button is using scale9 renderer.
     * @param {cc.Rect} capInsets
     */
    setCapInsetsPressedRenderer: function (capInsets) {
        this._capInsetsPressed = capInsets;
        if (!this._scale9Enabled)
            return;
        this._buttonClickedRenderer.setCapInsets(capInsets);
    },

    /**
     *  Get pressed renderer cap insets  .
     * @returns {cc.Rect}
     */
    getCapInsetsPressedRenderer: function () {
        return this._capInsetsPressed;
    },

    /**
     * Sets capinsets for button, if button is using scale9 renderer.
     * @param {cc.Rect} capInsets
     */
    setCapInsetsDisabledRenderer: function (capInsets) {
        this._capInsetsDisabled = capInsets;
        if (!this._scale9Enabled)
            return;
        this._buttonDisableRenderer.setCapInsets(capInsets);
    },

    /**
     *  Get disable renderer cap insets  .
     * @returns {cc.Rect}
     */
    getCapInsetsDisabledRenderer: function () {
        return this._capInsetsDisabled;
    },

    onPressStateChangedToNormal: function () {
        this._buttonNormalRenderer.setVisible(true);
        this._buttonClickedRenderer.setVisible(false);
        this._buttonDisableRenderer.setVisible(false);
        if (this._pressedTextureLoaded) {
            if (this.pressedActionEnabled){
                this._buttonNormalRenderer.stopAllActions();
                this._buttonClickedRenderer.stopAllActions();
                var zoomAction = cc.ScaleTo.create(0.05, this._normalTextureScaleXInSize, this._normalTextureScaleYInSize);
                this._buttonNormalRenderer.runAction(zoomAction);
                this._buttonClickedRenderer.setScale(this._pressedTextureScaleXInSize, this._pressedTextureScaleYInSize);
            }
        } else {
            if (this._scale9Enabled)
                this.updateTexturesRGBA();
            else {
                this._buttonNormalRenderer.stopAllActions();
                this._buttonNormalRenderer.setScale(this._normalTextureScaleXInSize, this._normalTextureScaleYInSize);
            }
        }
    },

    onPressStateChangedToPressed: function () {
        if (this._pressedTextureLoaded) {
            this._buttonNormalRenderer.setVisible(false);
            this._buttonClickedRenderer.setVisible(true);
            this._buttonDisableRenderer.setVisible(false);
            if (this.pressedActionEnabled) {
                this._buttonNormalRenderer.stopAllActions();
                this._buttonClickedRenderer.stopAllActions();
                var zoomAction = cc.ScaleTo.create(0.05, this._pressedTextureScaleXInSize + 0.1,this._pressedTextureScaleYInSize + 0.1);
                this._buttonClickedRenderer.runAction(zoomAction);
                this._buttonNormalRenderer.setScale(this._pressedTextureScaleXInSize + 0.1, this._pressedTextureScaleYInSize + 0.1);
            }
        } else {
            this._buttonNormalRenderer.setVisible(true);
            this._buttonClickedRenderer.setVisible(true);
            this._buttonDisableRenderer.setVisible(false);
            if (this._scale9Enabled)
                this._buttonNormalRenderer.setColor(cc.Color.GRAY);
            else {
                this._buttonNormalRenderer.stopAllActions();
                this._buttonNormalRenderer.setScale(this._normalTextureScaleXInSize + 0.1, this._normalTextureScaleYInSize + 0.1);
            }
        }
    },

    onPressStateChangedToDisabled: function () {
        this._buttonNormalRenderer.setVisible(false);
        this._buttonClickedRenderer.setVisible(false);
        this._buttonDisableRenderer.setVisible(true);
        this._buttonNormalRenderer.setScale(this._normalTextureScaleXInSize, this._normalTextureScaleYInSize);
        this._buttonClickedRenderer.setScale(this._pressedTextureScaleXInSize, this._pressedTextureScaleYInSize);
    },

    setFlippedX: function(flippedX){
        this._titleRenderer.setFlippedX(flippedX);
        if (this._scale9Enabled)
        {
            return;
        }
        this._buttonNormalRenderer.setFlippedX(flippedX);
        this._buttonClickedRenderer.setFlippedX(flippedX);
        this._buttonDisableRenderer.setFlippedX(flippedX);
    },

    setFlipY: function(flippedY){
        this._titleRenderer.setFlippedY(flippedY);
        if (this._scale9Enabled)
        {
            return;
        }
        this._buttonNormalRenderer.setFlippedY(flippedY);
        this._buttonClickedRenderer.setFlippedY(flippedY);
        this._buttonDisableRenderer.setFlippedY(flippedY);
    },

    isFlippedX: function(){
        if (this._scale9Enabled)
        {
            return false;
        }
        return this._buttonNormalRenderer.isFlippedX();
    },

    isFlippedY: function(){
        if (this._scale9Enabled)
        {
            return false;
        }
        return this._buttonNormalRenderer.isFlippedY();
    },

    updateFlippedX: function () {
        var flip = this._flippedX ? -1.0 : 1.0;
        this._titleRenderer.setScaleX(flip);
        if (this._scale9Enabled) {
            this._buttonNormalRenderer.setScaleX(flip);
            this._buttonClickedRenderer.setScaleX(flip);
            this._buttonDisableRenderer.setScaleX(flip);
        } else {
            this._buttonNormalRenderer.setFlippedX(this._flippedX);
            this._buttonClickedRenderer.setFlippedX(this._flippedX);
            this._buttonDisableRenderer.setFlippedX(this._flippedX);
        }
    },

    updateFlippedY: function () {
        var flip = this._flippedY ? -1.0 : 1.0;
        this._titleRenderer.setScaleY(flip);
        if (this._scale9Enabled) {
            this._buttonNormalRenderer.setScaleY(flip);
            this._buttonClickedRenderer.setScaleY(flip);
            this._buttonDisableRenderer.setScaleY(flip);
        } else {
            this._buttonNormalRenderer.setFlippedY(this._flippedY);
            this._buttonClickedRenderer.setFlippedY(this._flippedY);
            this._buttonDisableRenderer.setFlippedY(this._flippedY);
        }
    },

    updateTexturesRGBA: function(){
        this._buttonNormalRenderer.setColor(this.getColor());
        this._buttonClickedRenderer.setColor(this.getColor());
        this._buttonDisableRenderer.setColor(this.getColor());

        this._buttonNormalRenderer.setOpacity(this.getOpacity());
        this._buttonClickedRenderer.setOpacity(this.getOpacity());
        this._buttonDisableRenderer.setOpacity(this.getOpacity());
    },

    /**
     * override "setAnchorPoint" of widget.
     * @param {cc.Point|Number} point The anchor point of UIButton or The anchor point.x of UIButton.
     * @param {Number} [y] The anchor point.y of UIButton.
     */
    setAnchorPoint: function (point, y) {
        if (y === undefined) {
            ccui.Widget.prototype.setAnchorPoint.call(this, point);
            this._buttonNormalRenderer.setAnchorPoint(point);
            this._buttonClickedRenderer.setAnchorPoint(point);
            this._buttonDisableRenderer.setAnchorPoint(point);
        } else {
            ccui.Widget.prototype.setAnchorPoint.call(this, point, y);
            this._buttonNormalRenderer.setAnchorPoint(point, y);
            this._buttonClickedRenderer.setAnchorPoint(point, y);
            this._buttonDisableRenderer.setAnchorPoint(point, y);
        }
        this._titleRenderer.setPosition(this._size.width * (0.5 - this._anchorPoint.x), this._size.height * (0.5 - this._anchorPoint.y));
    },
    _setAnchorX: function (value) {
        ccui.Widget.prototype._setAnchorX.call(this, value);
        this._buttonNormalRenderer._setAnchorX(value);
        this._buttonClickedRenderer._setAnchorX(value);
        this._buttonDisableRenderer._setAnchorX(value);

        this._titleRenderer.setPositionX(this._size.width * (0.5 - this._anchorPoint.x));
    },
    _setAnchorY: function (value) {
        ccui.Widget.prototype._setAnchorY.call(this, value);
        this._buttonNormalRenderer._setAnchorY(value);
        this._buttonClickedRenderer._setAnchorY(value);
        this._buttonDisableRenderer._setAnchorY(value);

        this._titleRenderer.setPositionY(this._size.height * (0.5 - this._anchorPoint.y));
    },

    onSizeChanged: function () {
        ccui.Widget.prototype.onSizeChanged.call(this);
        this.updateTitleLocation();
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
    _getWidth: function () {
        return this._scale9Enabled ? this._size.width : this._normalTextureSize.width;
    },
    _getHeight: function () {
        return this._scale9Enabled ? this._size.height : this._normalTextureSize.height;
    },

    /**
     * Gets the Virtual Renderer of widget.
     * @returns {cc.Node}
     */
    getVirtualRenderer: function () {
        if (this._bright) {
            switch (this._brightStyle) {
                case ccui.Widget.BRIGHT_STYLE_NORMAL:
                    return this._buttonNormalRenderer;
                case ccui.Widget.BRIGHT_STYLE_HIGH_LIGHT:
                    return this._buttonClickedRenderer;
                default:
                    return null;
            }
        } else
            return this._buttonDisableRenderer;
    },

    normalTextureScaleChangedWithSize: function () {
        if (this._ignoreSize) {
            if (!this._scale9Enabled) {
                this._buttonNormalRenderer.setScale(1.0);
                this._normalTextureScaleXInSize = this._normalTextureScaleYInSize = 1;
                //this._size.width = this._normalTextureSize.width;
                //this._size.height = this._normalTextureSize.height;            //TODO need test
            }
        } else {
            if (this._scale9Enabled) {
                this._buttonNormalRenderer.setPreferredSize(this._size);
                this._normalTextureScaleXInSize = this._normalTextureScaleYInSize = 1;
            } else {
                var textureSize = this._normalTextureSize;
                if (textureSize.width <= 0.0 || textureSize.height <= 0.0) {
                    this._buttonNormalRenderer.setScale(1.0);
                    return;
                }
                var scaleX = this._size.width / textureSize.width;
                var scaleY = this._size.height / textureSize.height;
                this._buttonNormalRenderer.setScaleX(scaleX);
                this._buttonNormalRenderer.setScaleY(scaleY);
                this._normalTextureScaleXInSize = scaleX;
                this._normalTextureScaleYInSize = scaleY;
            }
        }
        this._buttonNormalRenderer.setPosition(this._contentSize.width / 2.0, this._contentSize.height / 2.0);
    },

    pressedTextureScaleChangedWithSize: function () {
        if (this._ignoreSize) {
            if (!this._scale9Enabled) {
                this._buttonClickedRenderer.setScale(1.0);
                this._pressedTextureScaleXInSize = this._pressedTextureScaleYInSize = 1;
            }
        } else {
            if (this._scale9Enabled) {
                this._buttonClickedRenderer.setPreferredSize(this._size);
                this._pressedTextureScaleXInSize = this._pressedTextureScaleYInSize = 1;
            } else {
                var textureSize = this._pressedTextureSize;
                if (textureSize.width <= 0.0 || textureSize.height <= 0.0) {
                    this._buttonClickedRenderer.setScale(1.0);
                    return;
                }
                var scaleX = this._size.width / textureSize.width;
                var scaleY = this._size.height / textureSize.height;
                this._buttonClickedRenderer.setScaleX(scaleX);
                this._buttonClickedRenderer.setScaleY(scaleY);
                this._pressedTextureScaleXInSize = scaleX;
                this._pressedTextureScaleYInSize = scaleY;
            }
        }
        this._buttonClickedRenderer.setPosition(this._contentSize.width / 2.0, this._contentSize.height / 2.0);
    },

    disabledTextureScaleChangedWithSize: function () {
        if (this._ignoreSize) {
            if (!this._scale9Enabled)
                this._buttonDisableRenderer.setScale(1.0);
        } else {
            if (this._scale9Enabled)
                this._buttonDisableRenderer.setPreferredSize(this._size);
            else {
                var textureSize = this._disabledTextureSize;
                if (textureSize.width <= 0.0 || textureSize.height <= 0.0) {
                    this._buttonDisableRenderer.setScale(1.0);
                    return;
                }
                var scaleX = this._size.width / textureSize.width;
                var scaleY = this._size.height / textureSize.height;
                this._buttonDisableRenderer.setScaleX(scaleX);
                this._buttonDisableRenderer.setScaleY(scaleY);
            }
        }
        this._buttonDisableRenderer.setPosition(this._contentSize.width / 2.0, this._contentSize.height / 2.0);
    },

    adaptRenderers: function(){
        if (this._normalTextureAdaptDirty) {
            this.normalTextureScaleChangedWithSize();
            this._normalTextureAdaptDirty = false;
        }
        if (this._pressedTextureAdaptDirty) {
            this.pressedTextureScaleChangedWithSize();
            this._pressedTextureAdaptDirty = false;
        }
        if (this._disabledTextureAdaptDirty) {
            this.disabledTextureScaleChangedWithSize();
            this._disabledTextureAdaptDirty = false;
        }
    },

    updateTitleLocation: function(){
        this._titleRenderer.setPosition(this._contentSize.width * 0.5, this._contentSize.height * 0.5);
    },

    /**
     * Changes if button can be clicked zoom effect.
     * @param {Boolean} enabled
     */
    setPressedActionEnabled: function (enabled) {
        this.pressedActionEnabled = enabled;
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
     * @param {cc.Color} color
     */
    setTitleColor: function (color) {
        this._titleColor.r = color.r;
        this._titleColor.g = color.g;
        this._titleColor.b = color.b;
        this._titleRenderer.updateDisplayedColor(color);
    },

    /**
     * get title color
     * @returns {cc.Color}
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

    _setTitleFont: function (font) {
        this._titleRenderer.font = font;
    },
    _getTitleFont: function () {
        return this._titleRenderer.font;
    },

    updateTextureColor: function () {
        this.updateColorToRenderer(this._buttonNormalRenderer);
        this.updateColorToRenderer(this._buttonClickedRenderer);
        this.updateColorToRenderer(this._buttonDisableRenderer);
    },

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "Button";
    },

    createCloneInstance: function () {
        return ccui.Button.create();
    },

    copySpecialProperties: function (uiButton) {
        this._prevIgnoreSize = uiButton._prevIgnoreSize;
        this.setScale9Enabled(uiButton._scale9Enabled);
        this.loadTextureNormal(uiButton._normalFileName, uiButton._normalTexType);
        this.loadTexturePressed(uiButton._clickedFileName, uiButton._pressedTexType);
        this.loadTextureDisabled(uiButton._disabledFileName, uiButton._disabledTexType);
        this.setCapInsetsNormalRenderer(uiButton._capInsetsNormal);
        this.setCapInsetsPressedRenderer(uiButton._capInsetsPressed);
        this.setCapInsetsDisabledRenderer(uiButton._capInsetsDisabled);
        this.setTitleText(uiButton.getTitleText());
        this.setTitleFontName(uiButton.getTitleFontName());
        this.setTitleFontSize(uiButton.getTitleFontSize());
        this.setTitleColor(uiButton.getTitleColor());
        this.setPressedActionEnabled(uiButton.pressedActionEnabled);
    }

});

var _p = ccui.Button.prototype;

// Extended properties
/** @expose */
_p.titleText;
cc.defineGetterSetter(_p, "titleText", _p.getTitleText, _p.setTitleText);
/** @expose */
_p.titleFont;
cc.defineGetterSetter(_p, "titleFont", _p._getTitleFont, _p._setTitleFont);
/** @expose */
_p.titleFontSize;
cc.defineGetterSetter(_p, "titleFontSize", _p.getTitleFontSize, _p.setTitleFontSize);
/** @expose */
_p.titleFontName;
cc.defineGetterSetter(_p, "titleFontName", _p.getTitleFontName, _p.setTitleFontName);
/** @expose */
_p.titleColor;
cc.defineGetterSetter(_p, "titleColor", _p.getTitleColor, _p.setTitleColor);

_p = null;

/**
 * allocates and initializes a UIButton.
 * @param {string} [normalImage]    normal state texture name
 * @param {string} [selectedImage]  selected state texture name
 * @param {string} [disableImage]   disabled state texture name
 * @param {string} [texType]
 * @return {ccui.Button}
 * @example
 * // example
 * var uiButton = ccui.Button.create();
 */
ccui.Button.create = function (normalImage, selectedImage, disableImage, texType) {
    var btn = new ccui.Button();
    if(normalImage === undefined)
        return btn;

    btn.init(normalImage, selectedImage, disableImage, texType)
};

// Constants
ccui.Button.NORMAL_RENDERER_ZORDER = -2;
ccui.Button.PRESSED_RENDERER_ZORDER = -2;
ccui.Button.DISABLED_RENDERER_ZORDER = -2;
ccui.Button.TITLE_RENDERER_ZORDER = -1;

ccui.Button.SYSTEM = 0;
ccui.Button.TTF = 1;
