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
 * Base class for ccui.Slider
 * @class
 * @extends ccui.Widget
 *
 * @property {Number}   percent     - The current progress of loadingbar
 */
ccui.Slider = ccui.Widget.extend(/** @lends ccui.Slider# */{
    _barRenderer: null,
    _progressBarRenderer: null,
    _progressBarTextureSize: null,
    _slidBallNormalRenderer: null,
    _slidBallPressedRenderer: null,
    _slidBallDisabledRenderer: null,
    _slidBallRenderer: null,
    _barLength: 0,
    _percent: 0,
    _scale9Enabled: false,
    _prevIgnoreSize: true,
    _textureFile: "",
    _progressBarTextureFile: "",
    _slidBallNormalTextureFile: "",
    _slidBallPressedTextureFile: "",
    _slidBallDisabledTextureFile: "",
    _capInsetsBarRenderer: null,
    _capInsetsProgressBarRenderer: null,
    _sliderEventListener: null,
    _sliderEventSelector: null,
    _barTexType: ccui.Widget.LOCAL_TEXTURE,
    _progressBarTexType: ccui.Widget.LOCAL_TEXTURE,
    _ballNTexType: ccui.Widget.LOCAL_TEXTURE,
    _ballPTexType: ccui.Widget.LOCAL_TEXTURE,
    _ballDTexType: ccui.Widget.LOCAL_TEXTURE,
    _isTextureLoaded: false,
    _className: "Slider",
    /**
     * allocates and initializes a UISlider.
     * Constructor of ccui.Slider
     * @example
     * // example
     * var uiSlider = new ccui.Slider();
     */
    ctor: function () {
        this._progressBarTextureSize = cc.size(0, 0);
        this._capInsetsBarRenderer = cc.rect(0, 0, 0, 0);
        this._capInsetsProgressBarRenderer = cc.rect(0, 0, 0, 0);
        ccui.Widget.prototype.ctor.call(this);
    },

    init: function () {
        if (ccui.Widget.prototype.init.call(this)) {
            this.setTouchEnabled(true);
            return true;
        }
        return false;
    },

    initRenderer: function () {
        this._barRenderer = cc.Sprite.create();
        this._progressBarRenderer = cc.Sprite.create();
        this._progressBarRenderer.setAnchorPoint(0.0, 0.5);
        cc.Node.prototype.addChild.call(this, this._barRenderer, ccui.Slider.BASEBAR_RENDERER_ZORDER, -1);
        cc.Node.prototype.addChild.call(this, this._progressBarRenderer, ccui.Slider.PROGRESSBAR_RENDERER_ZORDER, -1);
        this._slidBallNormalRenderer = cc.Sprite.create();
        this._slidBallPressedRenderer = cc.Sprite.create();
        this._slidBallPressedRenderer.setVisible(false);
        this._slidBallDisabledRenderer = cc.Sprite.create();
        this._slidBallDisabledRenderer.setVisible(false);
        this._slidBallRenderer = cc.Node.create();
        this._slidBallRenderer.addChild(this._slidBallNormalRenderer);
        this._slidBallRenderer.addChild(this._slidBallPressedRenderer);
        this._slidBallRenderer.addChild(this._slidBallDisabledRenderer);
        cc.Node.prototype.addChild.call(this, this._slidBallRenderer, ccui.Slider.BALL_RENDERER_ZORDER, -1);
    },

    /**
     * Load texture for slider bar.
     * @param {String} fileName
     * @param {ccui.Widget.LOCAL_TEXTURE|ccui.Widget.PLIST_TEXTURE} texType
     */
    loadBarTexture: function (fileName, texType) {
        if (!fileName) {
            return;
        }
        texType = texType || ccui.Widget.LOCAL_TEXTURE;
        this._textureFile = fileName;
        this._barTexType = texType;
        var barRenderer = this._barRenderer;
        switch (this._barTexType) {
            case ccui.Widget.LOCAL_TEXTURE:
                barRenderer.initWithFile(fileName);
                break;
            case ccui.Widget.PLIST_TEXTURE:
                barRenderer.initWithSpriteFrameName(fileName);
                break;
            default:
                break;
        }
        this.updateColorToRenderer(barRenderer);
        this.barRendererScaleChangedWithSize();

        if (!barRenderer.textureLoaded()) {
            barRenderer.addLoadedEventListener(function () {
                this.barRendererScaleChangedWithSize();
            }, this);
        }
    },

    /**
     * Load dark state texture for slider progress bar.
     * @param {String} fileName
     * @param {ccui.Widget.LOCAL_TEXTURE|ccui.Widget.PLIST_TEXTURE} texType
     */
    loadProgressBarTexture: function (fileName, texType) {
        if (!fileName) {
            return;
        }
        texType = texType || ccui.Widget.LOCAL_TEXTURE;
        this._progressBarTextureFile = fileName;
        this._progressBarTexType = texType;
        var progressBarRenderer = this._progressBarRenderer;
        switch (this._progressBarTexType) {
            case ccui.Widget.LOCAL_TEXTURE:
                progressBarRenderer.initWithFile(fileName);
                break;
            case ccui.Widget.PLIST_TEXTURE:
                progressBarRenderer.initWithSpriteFrameName(fileName);
                break;
            default:
                break;
        }
        this.updateColorToRenderer(progressBarRenderer);
        progressBarRenderer.setAnchorPoint(0.0, 0.5);
        var locSize = progressBarRenderer.getContentSize();
        this._progressBarTextureSize.width = locSize.width;
        this._progressBarTextureSize.height = locSize.height;
        this.progressBarRendererScaleChangedWithSize();

        var textLoaded = progressBarRenderer.textureLoaded();
        this._isTextureLoaded = textLoaded;
        if (!textLoaded) {
            progressBarRenderer.addLoadedEventListener(function () {
                this._isTextureLoaded = true;
                var locSize = progressBarRenderer.getContentSize();
                this._progressBarTextureSize.width = locSize.width;
                this._progressBarTextureSize.height = locSize.height;
                this.progressBarRendererScaleChangedWithSize();
            }, this);
        }
    },

    /**
     * Sets if slider is using scale9 renderer.
     * @param {Boolean} able
     */
    setScale9Enabled: function (able) {
        if (this._scale9Enabled == able) {
            return;
        }

        this._scale9Enabled = able;
        cc.Node.prototype.removeChild.call(this, this._barRenderer, true);
        cc.Node.prototype.removeChild.call(this, this._progressBarRenderer, true);
        this._barRenderer = null;
        this._progressBarRenderer = null;
        if (this._scale9Enabled) {
            this._barRenderer = cc.Scale9Sprite.create();
            this._progressBarRenderer = cc.Scale9Sprite.create();
        }
        else {
            this._barRenderer = cc.Sprite.create();
            this._progressBarRenderer = cc.Sprite.create();
        }
        this.loadBarTexture(this._textureFile, this._barTexType);
        this.loadProgressBarTexture(this._progressBarTextureFile, this._progressBarTexType);
        cc.Node.prototype.addChild.call(this, this._barRenderer, ccui.Slider.BASEBAR_RENDERER_ZORDER, -1);
        cc.Node.prototype.addChild.call(this, this._progressBarRenderer, ccui.Slider.PROGRESSBAR_RENDERER_ZORDER, -1);
        if (this._scale9Enabled) {
            var ignoreBefore = this._ignoreSize;
            this.ignoreContentAdaptWithSize(false);
            this._prevIgnoreSize = ignoreBefore;
        }
        else {
            this.ignoreContentAdaptWithSize(this._prevIgnoreSize);
        }
        this.setCapInsetsBarRenderer(this._capInsetsBarRenderer);
        this.setCapInsetProgressBarRenderer(this._capInsetsProgressBarRenderer);
    },

    /**
     * Get  slider is using scale9 renderer or not.
     * @returns {Boolean}
     */
    isScale9Enabled: function () {
        return this._scale9Enabled;
    },

    /**
     * override "ignoreContentAdaptWithSize" method of widget.
     * @param {Boolean} ignore
     */
    ignoreContentAdaptWithSize: function (ignore) {
        if (!this._scale9Enabled || (this._scale9Enabled && !ignore)) {
            ccui.Widget.prototype.ignoreContentAdaptWithSize.call(this, ignore);
            this._prevIgnoreSize = ignore;
        }
    },

    /**
     * Sets capinsets for slider, if slider is using scale9 renderer.
     * @param {cc.Rect} capInsets
     */
    setCapInsets: function (capInsets) {
        this.setCapInsetsBarRenderer(capInsets);
        this.setCapInsetProgressBarRenderer(capInsets);
    },

    /**
     * Sets capinsets for slider, if slider is using scale9 renderer.
     * @param {cc.Rect} capInsets
     */
    setCapInsetsBarRenderer: function (capInsets) {
        this._capInsetsBarRenderer = capInsets;
        if (!this._scale9Enabled) {
            return;
        }
        this._barRenderer.setCapInsets(capInsets);
    },

    /**
     * Get cap insets for slider.
     * @returns {cc.Rect}
     */
    getCapInsetBarRenderer: function () {
        return this._capInsetsBarRenderer;
    },

    /**
     * Sets capinsets for slider, if slider is using scale9 renderer.
     * @param {cc.Rect} capInsets
     */
    setCapInsetProgressBarRenderer: function (capInsets) {
        this._capInsetsProgressBarRenderer = capInsets;
        if (!this._scale9Enabled) {
            return;
        }
        this._progressBarRenderer.setCapInsets(capInsets);
    },

    /**
     * Get cap insets for slider.
     * @returns {cc.Rect}
     */
    getCapInsetProgressBarRenderer: function () {
        return this._capInsetsProgressBarRenderer;
    },

    /**
     * Load textures for slider ball.
     * @param {String} normal
     * @param {String} pressed
     * @param {String} disabled
     * @param {ccui.Widget.LOCAL_TEXTURE|ccui.Widget.PLIST_TEXTURE} texType
     */
    loadSlidBallTextures: function (normal, pressed, disabled, texType) {
        this.loadSlidBallTextureNormal(normal, texType);
        this.loadSlidBallTexturePressed(pressed, texType);
        this.loadSlidBallTextureDisabled(disabled, texType);
    },

    /**
     * Load normal state texture for slider ball.
     * @param {String} normal
     * @param {ccui.Widget.LOCAL_TEXTURE|ccui.Widget.PLIST_TEXTURE} texType
     */
    loadSlidBallTextureNormal: function (normal, texType) {
        if (!normal) {
            return;
        }
        texType = texType || ccui.Widget.LOCAL_TEXTURE;
        this._slidBallNormalTextureFile = normal;
        this._ballNTexType = texType;
        switch (this._ballNTexType) {
            case ccui.Widget.LOCAL_TEXTURE:
                this._slidBallNormalRenderer.initWithFile(normal);
                break;
            case ccui.Widget.PLIST_TEXTURE:
                this._slidBallNormalRenderer.initWithSpriteFrameName(normal);
                break;
            default:
                break;
        }
        this.updateColorToRenderer(this._slidBallNormalRenderer);
    },

    /**
     * Load selected state texture for slider ball.
     * @param {String} pressed
     * @param {ccui.Widget.LOCAL_TEXTURE|ccui.Widget.PLIST_TEXTURE} texType
     */
    loadSlidBallTexturePressed: function (pressed, texType) {
        if (!pressed) {
            return;
        }
        texType = texType || ccui.Widget.LOCAL_TEXTURE;
        this._slidBallPressedTextureFile = pressed;
        this._ballPTexType = texType;
        switch (this._ballPTexType) {
            case ccui.Widget.LOCAL_TEXTURE:
                this._slidBallPressedRenderer.initWithFile(pressed);
                break;
            case ccui.Widget.PLIST_TEXTURE:
                this._slidBallPressedRenderer.initWithSpriteFrameName(pressed);
                break;
            default:
                break;
        }
        this.updateColorToRenderer(this._slidBallPressedRenderer);
    },

    /**
     * Load dark state texture for slider ball.
     * @param {String} disabled
     * @param {ccui.Widget.LOCAL_TEXTURE|ccui.Widget.PLIST_TEXTURE} texType
     */
    loadSlidBallTextureDisabled: function (disabled, texType) {
        if (!disabled) {
            return;
        }
        texType = texType || ccui.Widget.LOCAL_TEXTURE;
        this._slidBallDisabledTextureFile = disabled;
        this._ballDTexType = texType;
        switch (this._ballDTexType) {
            case ccui.Widget.LOCAL_TEXTURE:
                this._slidBallDisabledRenderer.initWithFile(disabled);
                break;
            case ccui.Widget.PLIST_TEXTURE:
                this._slidBallDisabledRenderer.initWithSpriteFrameName(disabled);
                break;
            default:
                break;
        }
        this.updateColorToRenderer(this._slidBallDisabledRenderer);
    },

    /**
     * Changes the progress direction of slider.
     * @param {number} percent
     */
    setPercent: function (percent) {
        if (percent > 100) {
            percent = 100;
        }
        if (percent < 0) {
            percent = 0;
        }
        this._percent = percent;
        if (!this._isTextureLoaded) {
            return;
        }
        var dis = this._barLength * (percent / 100.0);
        this._slidBallRenderer.setPosition(-this._barLength / 2.0 + dis, 0.0);
        if (this._scale9Enabled) {
            this._progressBarRenderer.setPreferredSize(cc.size(dis, this._progressBarTextureSize.height));
        }
        else {
            var x = 0, y = 0;
            if (this._progressBarTexType == ccui.Widget.PLIST_TEXTURE) {
                var barNode = this._progressBarRenderer;
                if (barNode) {
                    var rect = barNode.getTextureRect();
                    x = rect.x;
                    y = rect.y;
                }
            }
            this._progressBarRenderer.setTextureRect(cc.rect(x, y, this._progressBarTextureSize.width * (percent / 100.0), this._progressBarTextureSize.height));
        }
    },

    onTouchBegan: function (touch, event) {
        var pass = ccui.Widget.prototype.onTouchBegan.call(this, touch, event);
        if (this._hitted) {
            var nsp = this.convertToNodeSpace(this._touchStartPos);
            this.setPercent(this.getPercentWithBallPos(nsp.x));
            this.percentChangedEvent();
        }
        return pass;
    },

    onTouchMoved: function (touch, event) {
        var touchPoint = touch.getLocation();
        this._touchMovePos.x = touchPoint.x;
        this._touchMovePos.y = touchPoint.y;
        var nsp = this.convertToNodeSpace(touchPoint);
        this._slidBallRenderer.setPosition(nsp.x, 0);
        this.setPercent(this.getPercentWithBallPos(nsp.x));
        this.percentChangedEvent();
    },

    onTouchEnded: function (touch, event) {
        ccui.Widget.prototype.onTouchEnded.call(this, touch, event);
    },

    onTouchCancelled: function (touch, event) {
        ccui.Widget.prototype.onTouchCancelled.call(this, touch, event);
    },

    /**
     * get percent with ballPos
     * @param {cc.Point} px
     * @returns {number}
     */
    getPercentWithBallPos: function (px) {
        return (((px - (-this._barLength / 2.0)) / this._barLength) * 100.0);
    },

    /**
     * add event listener
     * @param {Function} selector
     * @param {Object} target
     */
    addEventListenerSlider: function (selector, target) {
        this._sliderEventSelector = selector;
        this._sliderEventListener = target;
    },

    percentChangedEvent: function () {
        if (this._sliderEventListener && this._sliderEventSelector) {
            this._sliderEventSelector.call(this._sliderEventListener, this, ccui.Slider.EVENT_PERCENT_CHANGED);
        }
    },

    /**
     * Gets the progress direction of slider.
     * @returns {number}
     */
    getPercent: function () {
        return this._percent;
    },

    onSizeChanged: function () {
        ccui.Widget.prototype.onSizeChanged.call(this);
        this.barRendererScaleChangedWithSize();
        this.progressBarRendererScaleChangedWithSize();
    },

    /**
     * override "getContentSize" method of widget.
     * @returns {cc.Size}
     */
    getContentSize: function () {
        var locContentSize = this._barRenderer.getContentSize();
        return cc.size(locContentSize.width, locContentSize.height);
    },
    _getWidth: function () {
        return this._barRenderer._getWidth();
    },
    _getHeight: function () {
        return this._barRenderer._getHeight();
    },

    /**
     * override "getContentSize" method of widget.
     * @returns {cc.Node}
     */
    getVirtualRenderer: function () {
        return this._barRenderer;
    },

    barRendererScaleChangedWithSize: function () {
        if (this._ignoreSize) {
            this._barRenderer.setScale(1.0);
            var locSize = this._barRenderer.getContentSize();
            this._size.width = locSize.width;
            this._size.height = locSize.height;
            this._barLength = locSize.width;
        }
        else {
            this._barLength = this._size.width;
            if (this._scale9Enabled) {
                this._barRenderer.setPreferredSize(cc.size(this._size.width, this._size.height));
            }
            else {
                var btextureSize = this._barRenderer.getContentSize();
                if (btextureSize.width <= 0.0 || btextureSize.height <= 0.0) {
                    this._barRenderer.setScale(1.0);
                    return;
                }
                var bscaleX = this._size.width / btextureSize.width;
                var bscaleY = this._size.height / btextureSize.height;
                this._barRenderer.setScaleX(bscaleX);
                this._barRenderer.setScaleY(bscaleY);
            }
        }
        this.setPercent(this._percent);
    },

    progressBarRendererScaleChangedWithSize: function () {
        if (this._ignoreSize) {
            if (!this._scale9Enabled) {
                var ptextureSize = this._progressBarTextureSize;
                var pscaleX = this._size.width / ptextureSize.width;
                var pscaleY = this._size.height / ptextureSize.height;
                this._progressBarRenderer.setScaleX(pscaleX);
                this._progressBarRenderer.setScaleY(pscaleY);
            }
        }
        else {
            if (this._scale9Enabled) {
                this._progressBarRenderer.setPreferredSize(cc.size(this._size.width, this._size.height));
            }
            else {
                var ptextureSize = this._progressBarTextureSize;
                if (ptextureSize.width <= 0.0 || ptextureSize.height <= 0.0) {
                    this._progressBarRenderer.setScale(1.0);
                    return;
                }
                var pscaleX = this._size.width / ptextureSize.width;
                var pscaleY = this._size.height / ptextureSize.height;
                this._progressBarRenderer.setScaleX(pscaleX);
                this._progressBarRenderer.setScaleY(pscaleY);
            }
        }
        this._progressBarRenderer.setPosition(-this._barLength * 0.5, 0.0);
        this.setPercent(this._percent);
    },

    onPressStateChangedToNormal: function () {
        this._slidBallNormalRenderer.setVisible(true);
        this._slidBallPressedRenderer.setVisible(false);
        this._slidBallDisabledRenderer.setVisible(false);
    },

    onPressStateChangedToPressed: function () {
        this._slidBallNormalRenderer.setVisible(false);
        this._slidBallPressedRenderer.setVisible(true);
        this._slidBallDisabledRenderer.setVisible(false);
    },

    onPressStateChangedToDisabled: function () {
        this._slidBallNormalRenderer.setVisible(false);
        this._slidBallPressedRenderer.setVisible(false);
        this._slidBallDisabledRenderer.setVisible(true);
    },

    updateTextureColor: function () {
        this.updateColorToRenderer(this._barRenderer);
        this.updateColorToRenderer(this._progressBarRenderer);
        this.updateColorToRenderer(this._slidBallNormalRenderer);
        this.updateColorToRenderer(this._slidBallPressedRenderer);
        this.updateColorToRenderer(this._slidBallDisabledRenderer);
    },

    updateTextureOpacity: function () {
        this.updateOpacityToRenderer(this._barRenderer);
        this.updateOpacityToRenderer(this._progressBarRenderer);
        this.updateOpacityToRenderer(this._slidBallNormalRenderer);
        this.updateOpacityToRenderer(this._slidBallPressedRenderer);
        this.updateOpacityToRenderer(this._slidBallDisabledRenderer);
    },

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "Slider";
    },

    createCloneInstance: function () {
        return ccui.Slider.create();
    },

    copySpecialProperties: function (slider) {
        this._prevIgnoreSize = slider._prevIgnoreSize;
        this.setScale9Enabled(slider._scale9Enabled);
        this.loadBarTexture(slider._textureFile, slider._barTexType);
        this.loadProgressBarTexture(slider._progressBarTextureFile, slider._progressBarTexType);
        this.loadSlidBallTextureNormal(slider._slidBallNormalTextureFile, slider._ballNTexType);
        this.loadSlidBallTexturePressed(slider._slidBallPressedTextureFile, slider._ballPTexType);
        this.loadSlidBallTextureDisabled(slider._slidBallDisabledTextureFile, slider._ballDTexType);
        this.setPercent(slider.getPercent());
    }
});

var _p = ccui.Slider.prototype;

// Extended properties
/** @expose */
_p.percent;
cc.defineGetterSetter(_p, "percent", _p.getPercent, _p.setPercent);

_p = null;

/**
 * allocates and initializes a UISlider.
 * @constructs
 * @return {ccui.Slider}
 * @example
 * // example
 * var uiSlider = ccui.Slider.create();
 */
ccui.Slider.create = function () {
    return new ccui.Slider();
};

// Constant
//Slider event type
ccui.Slider.EVENT_PERCENT_CHANGED = 0;

//Render zorder
ccui.Slider.BASEBAR_RENDERER_ZORDER = -3;
ccui.Slider.PROGRESSBAR_RENDERER_ZORDER = -2;
ccui.Slider.BALL_RENDERER_ZORDER = -1;