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
 * The button controls of Cocos UI.
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

    _zoomScale: 0.1,

    _normalTextureLoaded: false,
    _pressedTextureLoaded: false,
    _disabledTextureLoaded: false,

    _className: "Button",
    _normalTextureAdaptDirty: true,
    _pressedTextureAdaptDirty: true,
    _disabledTextureAdaptDirty: true,

    _fontName: "Thonburi",
    _fontSize: 12,
    _type: 0,

    /**
     * Allocates and initializes a UIButton.
     * Constructor of ccui.Button. override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.
     * @param {String} normalImage
     * @param {String} [selectedImage=""]
     * @param {String} [disableImage=""]
     * @param {Number} [texType=ccui.Widget.LOCAL_TEXTURE]
     * @example
     * // example
     * var uiButton = new ccui.Button();
     */
    ctor: function (normalImage, selectedImage, disableImage, texType) {
        this._capInsetsNormal = cc.rect(0, 0, 0, 0);
        this._capInsetsPressed = cc.rect(0, 0, 0, 0);
        this._capInsetsDisabled = cc.rect(0, 0, 0, 0);
        this._normalTextureSize = cc.size(0, 0);
        this._pressedTextureSize = cc.size(0, 0);
        this._disabledTextureSize = cc.size(0, 0);
        this._titleColor = cc.color.WHITE;
        ccui.Widget.prototype.ctor.call(this);
        this.setTouchEnabled(true);

        texType !== undefined && this.init(normalImage, selectedImage, disableImage, texType);
    },

    /**
     * Initializes a button. please do not call this function by yourself, you should pass the parameters to constructor to initialize it.
     * @param {String} normalImage
     * @param {String} [selectedImage=""]
     * @param {String} [disableImage=""]
     * @param {Number} [texType=ccui.Widget.LOCAL_TEXTURE]
     * @returns {boolean}
     * @override
     */
    init: function (normalImage, selectedImage,disableImage, texType) {
        if (ccui.Widget.prototype.init.call(this)) {
            if(normalImage === undefined)
                return true;
            this.loadTextures(normalImage, selectedImage,disableImage, texType);
        }
        return false;
    },

    _initRenderer: function () {
        this._buttonNormalRenderer = new cc.Sprite();
        this._buttonClickedRenderer = new cc.Sprite();
        this._buttonDisableRenderer = new cc.Sprite();
        this._titleRenderer = new cc.LabelTTF("");
        this._titleRenderer.setAnchorPoint(0.5, 0.5);

        this.addProtectedChild(this._buttonNormalRenderer, ccui.Button.NORMAL_RENDERER_ZORDER, -1);
        this.addProtectedChild(this._buttonClickedRenderer, ccui.Button.PRESSED_RENDERER_ZORDER, -1);
        this.addProtectedChild(this._buttonDisableRenderer, ccui.Button.DISABLED_RENDERER_ZORDER, -1);
        this.addProtectedChild(this._titleRenderer, ccui.Button.TITLE_RENDERER_ZORDER, -1);
    },

    /**
     * Sets if button is using scale9 renderer.
     * @param {Boolean} able true that using scale9 renderer, false otherwise.
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
            this._buttonNormalRenderer = new ccui.Scale9Sprite();
            this._buttonClickedRenderer = new ccui.Scale9Sprite();
            this._buttonDisableRenderer = new ccui.Scale9Sprite();
        } else {
            this._buttonNormalRenderer = new cc.Sprite();
            this._buttonClickedRenderer = new cc.Sprite();
            this._buttonDisableRenderer = new cc.Sprite();
        }

        this._buttonClickedRenderer.setVisible(false);
        this._buttonDisableRenderer.setVisible(false);

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
     *  Returns button is using scale9 renderer or not.
     * @returns {Boolean}
     */
    isScale9Enabled: function () {
        return this._scale9Enabled;
    },

    /**
     * Sets whether ignore the widget size
     * @param {Boolean} ignore true that widget will ignore it's size, use texture size, false otherwise. Default value is true.
     * @override
     */
    ignoreContentAdaptWithSize: function (ignore) {
        if(this._unifySize){
            if(this._scale9Enabled){
                ccui.ProtectedNode.prototype.setContentSize.call(this, this._customSize);
            }else{
                var s = this.getVirtualRendererSize();
                ccui.ProtectedNode.prototype.setContentSize.call(this, s);
            }
            this._onSizeChanged();
            return;
        }
        if (!this._scale9Enabled || (this._scale9Enabled && !ignore)) {
            ccui.Widget.prototype.ignoreContentAdaptWithSize.call(this, ignore);
            this._prevIgnoreSize = ignore;
        }
    },

    /**
     * Returns the renderer size.
     * @returns {cc.Size}
     */
    getVirtualRendererSize: function(){
        var titleSize = this._titleRenderer.getContentSize();
        if (!this._normalTextureLoaded && this._titleRenderer.getString().length > 0) {
            return titleSize;
        }
        return cc.size(this._normalTextureSize);
    },

    /**
     * Load textures for button.
     * @param {String} normal normal state of texture's filename.
     * @param {String} selected  selected state of texture's filename.
     * @param {String} disabled  disabled state of texture's filename.
     * @param {ccui.Widget.LOCAL_TEXTURE|ccui.Widget.PLIST_TEXTURE} texType
     */
    loadTextures: function (normal, selected, disabled, texType) {
        this.loadTextureNormal(normal, texType);
        this.loadTexturePressed(selected, texType);
        this.loadTextureDisabled(disabled, texType);
    },

    /**
     * Load normal state texture for button.
     * @param {String} normal normal state of texture's filename.
     * @param {ccui.Widget.LOCAL_TEXTURE|ccui.Widget.PLIST_TEXTURE} texType
     */
    loadTextureNormal: function (normal, texType) {
        if (!normal)
            return;
        texType = texType || ccui.Widget.LOCAL_TEXTURE;
        this._normalFileName = normal;
        this._normalTexType = texType;

        var self = this;
        if(!this._buttonNormalRenderer.texture || !this._buttonNormalRenderer.texture.isLoaded()){
            this._buttonNormalRenderer.addEventListener("load", function(){
                self._findLayout();

                self._normalTextureSize = self._buttonNormalRenderer.getContentSize();
                self._updateFlippedX();
                self._updateFlippedY();
                self._updateChildrenDisplayedRGBA();

                self._buttonNormalRenderer.setColor(self.getColor());
                self._buttonNormalRenderer.setOpacity(self.getOpacity());

                self._updateContentSizeWithTextureSize(self._normalTextureSize);
                self._normalTextureLoaded = true;
                self._normalTextureAdaptDirty = true;
            });
        }

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
                    //SetTexture cannot load resource
                    normalRenderer.initWithFile(normal);
                    break;
                case ccui.Widget.PLIST_TEXTURE:
                    //SetTexture cannot load resource
                    normalRenderer.initWithSpriteFrameName(normal);
                    break;
                default:
                    break;
            }
        }
        this._normalTextureSize = this._buttonNormalRenderer.getContentSize();
        this._updateFlippedX();
        this._updateFlippedY();

        this._updateChildrenDisplayedRGBA();

        this._updateContentSizeWithTextureSize(this._normalTextureSize);
        this._normalTextureLoaded = true;
        this._normalTextureAdaptDirty = true;
    },

    /**
     * Load selected state texture for button.
     * @param {String} selected selected state of texture's filename.
     * @param {ccui.Widget.LOCAL_TEXTURE|ccui.Widget.PLIST_TEXTURE} texType
     */
    loadTexturePressed: function (selected, texType) {
        if (!selected)
            return;
        texType = texType || ccui.Widget.LOCAL_TEXTURE;
        this._clickedFileName = selected;
        this._pressedTexType = texType;

        var self = this;
        if(!this._buttonClickedRenderer.texture || !this._buttonClickedRenderer.texture.isLoaded()){
            this._buttonClickedRenderer.addEventListener("load", function(){
                self._findLayout();

                self._pressedTextureSize = self._buttonClickedRenderer.getContentSize();
                self._updateFlippedX();
                self._updateFlippedY();
                self._updateChildrenDisplayedRGBA();

                self._pressedTextureLoaded = true;
                self._pressedTextureAdaptDirty = true;
            });
        }

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
                    //SetTexture cannot load resource
                    clickedRenderer.initWithFile(selected);
                    break;
                case ccui.Widget.PLIST_TEXTURE:
                    //SetTexture cannot load resource
                    clickedRenderer.initWithSpriteFrameName(selected);
                    break;
                default:
                    break;
            }
        }
        this._pressedTextureSize = this._buttonClickedRenderer.getContentSize();
        this._updateFlippedX();
        this._updateFlippedY();

        this._updateChildrenDisplayedRGBA();

        this._pressedTextureLoaded = true;
        this._pressedTextureAdaptDirty = true;
    },

    /**
     * Load dark state texture for button.
     * @param {String} disabled disabled state of texture's filename.
     * @param {ccui.Widget.LOCAL_TEXTURE|ccui.Widget.PLIST_TEXTURE} texType
     */
    loadTextureDisabled: function (disabled, texType) {
        if (!disabled)
            return;

        texType = texType || ccui.Widget.LOCAL_TEXTURE;
        this._disabledFileName = disabled;
        this._disabledTexType = texType;

        var self = this;
        if(!this._buttonDisableRenderer.texture || !this._buttonDisableRenderer.texture.isLoaded()){
            this._buttonDisableRenderer.addEventListener("load", function() {
                self._findLayout();

                self._disabledTextureSize = self._buttonDisableRenderer.getContentSize();
                self._updateFlippedX();
                self._updateFlippedY();
                self._updateChildrenDisplayedRGBA();

                self._disabledTextureLoaded = true;
                self._disabledTextureAdaptDirty = true;
            });
        }

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
                    //SetTexture cannot load resource
                    disabledRenderer.initWithFile(disabled);
                    break;
                case ccui.Widget.PLIST_TEXTURE:
                    //SetTexture cannot load resource
                    disabledRenderer.initWithSpriteFrameName(disabled);
                    break;
                default:
                    break;
            }
        }
        this._disabledTextureSize = this._buttonDisableRenderer.getContentSize();
        this._updateFlippedX();
        this._updateFlippedY();

        this._updateChildrenDisplayedRGBA();

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
        if(!capInsets)
            return;
        var x = capInsets.x;
        var y = capInsets.y;
        var width = capInsets.width;
        var height = capInsets.height;

        if (this._normalTextureSize.width < width)
        {
            x = 0;
            width = 0;
        }
        if (this._normalTextureSize.height < height)
        {
            y = 0;
            height = 0;
        }
        var rect = cc.rect(x, y, width, height);

        var locInsets = this._capInsetsNormal;
        locInsets.x = x;
        locInsets.y = y;
        locInsets.width = width;
        locInsets.height = height;

        if (!this._scale9Enabled)
            return;
        this._buttonNormalRenderer.setCapInsets(rect);
    },

    /**
     *  Returns normal renderer cap insets.
     * @returns {cc.Rect}
     */
    getCapInsetsNormalRenderer:function(){
        return cc.rect(this._capInsetsNormal);
    },

    /**
     * Sets capinsets for button, if button is using scale9 renderer.
     * @param {cc.Rect} capInsets
     */
    setCapInsetsPressedRenderer: function (capInsets) {
        if(!capInsets)
            return;

        var x = capInsets.x;
        var y = capInsets.y;
        var width = capInsets.width;
        var height = capInsets.height;

        if (this._normalTextureSize.width < width)
        {
            x = 0;
            width = 0;
        }
        if (this._normalTextureSize.height < height)
        {
            y = 0;
            height = 0;
        }
        var rect = cc.rect(x, y, width, height);

        var locInsets = this._capInsetsPressed;
        locInsets.x = x;
        locInsets.y = y;
        locInsets.width = width;
        locInsets.height = height;
        if (!this._scale9Enabled)
            return;
        this._buttonClickedRenderer.setCapInsets(rect);
    },

    /**
     *  Returns pressed renderer cap insets.
     * @returns {cc.Rect}
     */
    getCapInsetsPressedRenderer: function () {
        return cc.rect(this._capInsetsPressed);
    },

    /**
     * Sets capinsets for button, if button is using scale9 renderer.
     * @param {cc.Rect} capInsets
     */
    setCapInsetsDisabledRenderer: function (capInsets) {
        if(!capInsets)
            return;

        var x = capInsets.x;
        var y = capInsets.y;
        var width = capInsets.width;
        var height = capInsets.height;

        if (this._normalTextureSize.width < width)
        {
            x = 0;
            width = 0;
        }
        if (this._normalTextureSize.height < height)
        {
            y = 0;
            height = 0;
        }
        var rect = cc.rect(x, y, width, height);

        var locInsets = this._capInsetsDisabled;
        locInsets.x = x;
        locInsets.y = y;
        locInsets.width = width;
        locInsets.height = height;

        if (!this._scale9Enabled)
            return;
        this._buttonDisableRenderer.setCapInsets(rect);
    },

    /**
     * Returns disable renderer cap insets.
     * @returns {cc.Rect}
     */
    getCapInsetsDisabledRenderer: function () {
        return cc.rect(this._capInsetsDisabled);
    },

    _onPressStateChangedToNormal: function () {
        this._buttonNormalRenderer.setVisible(true);
        this._buttonClickedRenderer.setVisible(false);
        this._buttonDisableRenderer.setVisible(false);
        if (this._pressedTextureLoaded) {
            if (this.pressedActionEnabled){
                this._buttonNormalRenderer.stopAllActions();
                this._buttonClickedRenderer.stopAllActions();
                var zoomAction = cc.scaleTo(0.05, this._normalTextureScaleXInSize, this._normalTextureScaleYInSize);
                this._buttonNormalRenderer.runAction(zoomAction);
                this._buttonClickedRenderer.setScale(this._pressedTextureScaleXInSize, this._pressedTextureScaleYInSize);

                this._titleRenderer.stopAllActions();
                this._titleRenderer.runAction(zoomAction.clone());
            }
        } else {
            if (this._scale9Enabled){
                //todo checking here. old -> this._updateTexturesRGBA();
                this._buttonNormalRenderer.setColor(cc.color.WHITE);
            }
            else {
                this._buttonNormalRenderer.stopAllActions();
                this._buttonNormalRenderer.setScale(this._normalTextureScaleXInSize, this._normalTextureScaleYInSize);

                this._titleRenderer.stopAllActions();
                this._titleRenderer.setScaleX(this._normalTextureScaleXInSize);
                this._titleRenderer.setScaleY(this._normalTextureScaleYInSize);
            }
        }
    },

    _onPressStateChangedToPressed: function () {
        var locNormalRenderer = this._buttonNormalRenderer;
        if (this._pressedTextureLoaded) {
            locNormalRenderer.setVisible(false);
            this._buttonClickedRenderer.setVisible(true);
            this._buttonDisableRenderer.setVisible(false);
            if (this.pressedActionEnabled) {
                locNormalRenderer.stopAllActions();
                this._buttonClickedRenderer.stopAllActions();
                var zoomAction = cc.scaleTo(0.05, this._pressedTextureScaleXInSize + 0.1,this._pressedTextureScaleYInSize + 0.1);
                this._buttonClickedRenderer.runAction(zoomAction);
                locNormalRenderer.setScale(this._pressedTextureScaleXInSize + 0.1, this._pressedTextureScaleYInSize + 0.1);

                this._titleRenderer.stopAllActions();
                //we must call zoomAction->clone here
                this._titleRenderer.runAction(zoomAction.clone());
            }
        } else {
            locNormalRenderer.setVisible(true);
            this._buttonClickedRenderer.setVisible(true);
            this._buttonDisableRenderer.setVisible(false);
            if (this._scale9Enabled)
                locNormalRenderer.setColor(cc.color.GRAY);
            else {
                locNormalRenderer.stopAllActions();
                locNormalRenderer.setScale(this._normalTextureScaleXInSize + 0.1, this._normalTextureScaleYInSize + 0.1);

                this._titleRenderer.stopAllActions();
                this._titleRenderer.setScaleX(this._normalTextureScaleXInSize + this._zoomScale);
                this._titleRenderer.setScaleY(this._normalTextureScaleYInSize + this._zoomScale);
            }
        }
    },

    _onPressStateChangedToDisabled: function () {
        this._buttonNormalRenderer.setVisible(false);
        this._buttonClickedRenderer.setVisible(false);
        this._buttonDisableRenderer.setVisible(true);
        this._buttonNormalRenderer.setScale(this._normalTextureScaleXInSize, this._normalTextureScaleYInSize);
        this._buttonClickedRenderer.setScale(this._pressedTextureScaleXInSize, this._pressedTextureScaleYInSize);
    },

    _updateFlippedX: function () {
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

    _updateFlippedY: function () {
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

    _updateTexturesRGBA: function(){
        this._buttonNormalRenderer.setColor(this.getColor());
        this._buttonClickedRenderer.setColor(this.getColor());
        this._buttonDisableRenderer.setColor(this.getColor());

        this._buttonNormalRenderer.setOpacity(this.getOpacity());
        this._buttonClickedRenderer.setOpacity(this.getOpacity());
        this._buttonDisableRenderer.setOpacity(this.getOpacity());
    },

    _onSizeChanged: function () {
        ccui.Widget.prototype._onSizeChanged.call(this);
        this._updateTitleLocation();
        this._normalTextureAdaptDirty = true;
        this._pressedTextureAdaptDirty = true;
        this._disabledTextureAdaptDirty = true;
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

    _normalTextureScaleChangedWithSize: function () {
        if(this._unifySize){
            if (this._scale9Enabled)
                this._buttonNormalRenderer.setPreferredSize(this._contentSize);
        }else if (this._ignoreSize) {
            if (!this._scale9Enabled) {
                this._buttonNormalRenderer.setScale(1.0);
                this._normalTextureScaleXInSize = this._normalTextureScaleYInSize = 1;
            }
        } else {
            if (this._scale9Enabled) {
                this._buttonNormalRenderer.setPreferredSize(this._contentSize);
                this._normalTextureScaleXInSize = this._normalTextureScaleYInSize = 1;
            } else {
                var textureSize = this._normalTextureSize;
                if (textureSize.width <= 0.0 || textureSize.height <= 0.0) {
                    this._buttonNormalRenderer.setScale(1.0);
                    return;
                }
                var scaleX = this._contentSize.width / textureSize.width;
                var scaleY = this._contentSize.height / textureSize.height;
                this._buttonNormalRenderer.setScaleX(scaleX);
                this._buttonNormalRenderer.setScaleY(scaleY);
                this._normalTextureScaleXInSize = scaleX;
                this._normalTextureScaleYInSize = scaleY;
            }
        }
        this._buttonNormalRenderer.setPosition(this._contentSize.width / 2.0, this._contentSize.height / 2.0);
    },

    _pressedTextureScaleChangedWithSize: function () {
        if (this._ignoreSize) {
            if (!this._scale9Enabled) {
                this._buttonClickedRenderer.setScale(1.0);
                this._pressedTextureScaleXInSize = this._pressedTextureScaleYInSize = 1;
            }
        } else {
            if (this._scale9Enabled) {
                this._buttonClickedRenderer.setPreferredSize(this._contentSize);
                this._pressedTextureScaleXInSize = this._pressedTextureScaleYInSize = 1;
            } else {
                var textureSize = this._pressedTextureSize;
                if (textureSize.width <= 0.0 || textureSize.height <= 0.0) {
                    this._buttonClickedRenderer.setScale(1.0);
                    return;
                }
                var scaleX = this._contentSize.width / textureSize.width;
                var scaleY = this._contentSize.height / textureSize.height;
                this._buttonClickedRenderer.setScaleX(scaleX);
                this._buttonClickedRenderer.setScaleY(scaleY);
                this._pressedTextureScaleXInSize = scaleX;
                this._pressedTextureScaleYInSize = scaleY;
            }
        }
        this._buttonClickedRenderer.setPosition(this._contentSize.width / 2.0, this._contentSize.height / 2.0);
    },

    _disabledTextureScaleChangedWithSize: function () {
        if(this._unifySize){
            if (this._scale9Enabled)
                this._buttonNormalRenderer.setPreferredSize(this._contentSize);
        }else if (this._ignoreSize) {
            if (!this._scale9Enabled)
                this._buttonDisableRenderer.setScale(1.0);
        } else {
            if (this._scale9Enabled)
                this._buttonDisableRenderer.setPreferredSize(this._contentSize);
            else {
                var textureSize = this._disabledTextureSize;
                if (textureSize.width <= 0.0 || textureSize.height <= 0.0) {
                    this._buttonDisableRenderer.setScale(1.0);
                    return;
                }
                var scaleX = this._contentSize.width / textureSize.width;
                var scaleY = this._contentSize.height / textureSize.height;
                this._buttonDisableRenderer.setScaleX(scaleX);
                this._buttonDisableRenderer.setScaleY(scaleY);
            }
        }
        this._buttonDisableRenderer.setPosition(this._contentSize.width / 2.0, this._contentSize.height / 2.0);
    },

    _adaptRenderers: function(){
        if (this._normalTextureAdaptDirty) {
            this._normalTextureScaleChangedWithSize();
            this._normalTextureAdaptDirty = false;
        }
        if (this._pressedTextureAdaptDirty) {
            this._pressedTextureScaleChangedWithSize();
            this._pressedTextureAdaptDirty = false;
        }
        if (this._disabledTextureAdaptDirty) {
            this._disabledTextureScaleChangedWithSize();
            this._disabledTextureAdaptDirty = false;
        }
    },

    _updateTitleLocation: function(){
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
     * Sets title text to ccui.Button
     * @param {String} text
     */
    setTitleText: function (text) {
        this._titleRenderer.setString(text);
        if (this._ignoreSize)
        {
            var s = this.getVirtualRendererSize();
            this.setContentSize(s);
        }
    },

    /**
     * Returns title text of ccui.Button
     * @returns {String} text
     */
    getTitleText: function () {
        return this._titleRenderer.getString();
    },

    /**
     * Sets title color to ccui.Button.
     * @param {cc.Color} color
     */
    setTitleColor: function (color) {
        this._titleColor.r = color.r;
        this._titleColor.g = color.g;
        this._titleColor.b = color.b;
        this._titleRenderer.updateDisplayedColor(color);
    },

    /**
     * Returns title color of ccui.Button
     * @returns {cc.Color}
     */
    getTitleColor: function () {
        return this._titleRenderer.getColor();
    },

    /**
     * Sets title fontSize to ccui.Button
     * @param {cc.Size} size
     */
    setTitleFontSize: function (size) {
        this._titleRenderer.setFontSize(size);
    },

    /**
     * Returns title fontSize of ccui.Button.
     * @returns {cc.Size}
     */
    getTitleFontSize: function () {
        return this._titleRenderer.getFontSize();
    },

    setZoomScale: function(scale){
        this._zoomScale = scale;
    },

    getZoomScale: function(){
        return this._zoomScale;
    },

    /**
     * Sets title fontName to ccui.Button.
     * @param {String} fontName
     */
    setTitleFontName: function (fontName) {
        this._titleRenderer.setFontName(fontName);
        this._fontName = fontName;
    },

    /**
     * Get the title renderer.
     * title ttf object.
     * @returns {cc.LabelTTF}
     */
    getTitleRenderer: function(){
        return this._titleRenderer;
    },

    /**
     * Gets title fontName of ccui.Button.
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

    /**
     * Returns the "class name" of widget.
     * @override
     * @returns {string}
     */
    getDescription: function () {
        return "Button";
    },

    _createCloneInstance: function () {
        return new ccui.Button();
    },

    _copySpecialProperties: function (uiButton) {
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
        this.setZoomScale(uiButton._zoomScale);
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
 * @deprecated since v3.0, please use new ccui.Button() instead.
 * @param {string} [normalImage]    normal state texture name
 * @param {string} [selectedImage]  selected state texture name
 * @param {string} [disableImage]   disabled state texture name
 * @param {string} [texType]
 * @return {ccui.Button}
 */
ccui.Button.create = function (normalImage, selectedImage, disableImage, texType) {
    return new ccui.Button(normalImage, selectedImage, disableImage, texType);
};

// Constants
/**
 * The normal renderer's zOrder value.
 * @constant
 * @type {number}
 */
ccui.Button.NORMAL_RENDERER_ZORDER = -2;
/**
 * The pressed renderer's zOrder value.
 * @constant
 * @type {number}
 */
ccui.Button.PRESSED_RENDERER_ZORDER = -2;
/**
 * The disabled renderer's zOrder value.
 * @constant
 * @type {number}
 */
ccui.Button.DISABLED_RENDERER_ZORDER = -2;
/**
 * The title renderer's zOrder value.
 * @constant
 * @type {number}
 */
ccui.Button.TITLE_RENDERER_ZORDER = -1;

/**
 * @ignore
 */
ccui.Button.SYSTEM = 0;
ccui.Button.TTF = 1;
