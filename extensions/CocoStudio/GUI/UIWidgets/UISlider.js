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
 * slider event type
 * @type {Obejct}
 */
ccs.SliderEventType = {percent_changed: 0};

/**
 * Base class for ccs.UISlider
 * @class
 * @extends ccs.UIWidget
 */
ccs.UISlider = ccs.UIWidget.extend(/** @lends ccs.UISlider# */{
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
    _barTexType: null,
    _progressBarTexType: null,
    _ballNTexType: null,
    _ballPTexType: null,
    _ballDTexType: null,
    ctor: function () {
        ccs.UIWidget.prototype.ctor.call(this);
        this._barRenderer = null;
        this._progressBarRenderer = null;
        this._progressBarTextureSize = cc.size(0, 0);
        this._slidBallNormalRenderer = null;
        this._slidBallPressedRenderer = null;
        this._slidBallDisabledRenderer = null;
        this._slidBallRenderer = null;
        this._barLength = 0;
        this._percent = 0;
        this._scale9Enabled = false;
        this._prevIgnoreSize = true;
        this._textureFile = "";
        this._progressBarTextureFile = "";
        this._slidBallNormalTextureFile = "";
        this._slidBallPressedTextureFile = "";
        this._slidBallDisabledTextureFile = "";
        this._capInsetsBarRenderer = cc.RectZero();
        this._capInsetsProgressBarRenderer = cc.RectZero();
        this._sliderEventListener = null;
        this._sliderEventSelector = null;
        this._barTexType = ccs.TextureResType.local;
        this._progressBarTexType = ccs.TextureResType.local;
        this._ballNTexType = ccs.TextureResType.local;
        this._ballPTexType = ccs.TextureResType.local;
        this._ballDTexType = ccs.TextureResType.local;
    },

    initRenderer: function () {
        ccs.UIWidget.prototype.initRenderer.call(this);
        this._barRenderer = cc.Sprite.create();
        this._progressBarRenderer = cc.Sprite.create();
        this._progressBarRenderer.setAnchorPoint(cc.p(0.0, 0.5));
        this._renderer.addChild(this._barRenderer, -1);
        this._renderer.addChild(this._progressBarRenderer, -1);
        this._slidBallNormalRenderer = cc.Sprite.create();
        this._slidBallPressedRenderer = cc.Sprite.create();
        this._slidBallPressedRenderer.setVisible(false);
        this._slidBallDisabledRenderer = cc.Sprite.create();
        this._slidBallDisabledRenderer.setVisible(false);
        this._slidBallRenderer = cc.Node.create();
        this._slidBallRenderer.addChild(this._slidBallNormalRenderer);
        this._slidBallRenderer.addChild(this._slidBallPressedRenderer);
        this._slidBallRenderer.addChild(this._slidBallDisabledRenderer);
        this._renderer.addChild(this._slidBallRenderer);
    },

    /**
     * Load texture for slider bar.
     * @param {String} fileName
     * @param {ccs.TextureResType} texType
     */
    loadBarTexture: function (fileName, texType) {
        if (!fileName) {
            return;
        }
        texType = texType || ccs.TextureResType.local;
        this._textureFile = fileName;
        this._barTexType = texType;
        switch (this._barTexType) {
            case ccs.TextureResType.local:
                this._barRenderer.initWithFile(fileName);
                break;
            case ccs.TextureResType.plist:
                this._barRenderer.initWithSpriteFrameName(fileName);
                break;
            default:
                break;
        }
        if (this._scale9Enabled) {
            this._barRenderer.setColor(this.getColor());
            this._barRenderer.setOpacity(this.getOpacity());
        }
        else {
            this._barRenderer.setColor(this.getColor());
            this._barRenderer.setOpacity(this.getOpacity());
        }
        this.barRendererScaleChangedWithSize();
    },

    /**
     * Load dark state texture for slider progress bar.
     * @param {String} fileName
     * @param {ccs.TextureResType} texType
     */
    loadProgressBarTexture: function (fileName, texType) {
        if (!fileName) {
            return;
        }
        texType = texType || ccs.TextureResType.local;
        this._progressBarTextureFile = fileName;
        this._progressBarTexType = texType;
        switch (this._progressBarTexType) {
            case ccs.TextureResType.local:
                this._progressBarRenderer.initWithFile(fileName);
                break;
            case ccs.TextureResType.plist:
                this._progressBarRenderer.initWithSpriteFrameName(fileName);
                break;
            default:
                break;
        }
        if (this._scale9Enabled) {
            this._progressBarRenderer.setColor(this.getColor());
            this._progressBarRenderer.setOpacity(this.getOpacity());
        }
        else {
            this._progressBarRenderer.setColor(this.getColor());
            this._progressBarRenderer.setOpacity(this.getOpacity());
        }
        this._progressBarRenderer.setAnchorPoint(cc.p(0.0, 0.5));
        var locSize = this._progressBarRenderer.getContentSize();
        this._progressBarTextureSize.width = locSize.width;
        this._progressBarTextureSize.height = locSize.height;
        this.progressBarRendererScaleChangedWithSize();
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
        this._renderer.removeChild(this._barRenderer, true);
        this._renderer.removeChild(this._progressBarRenderer, true);
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
        this._renderer.addChild(this._barRenderer, -1);
        this._renderer.addChild(this._progressBarRenderer, -1);
        if (this._scale9Enabled) {
            var ignoreBefore = this._ignoreSize;
            this.ignoreContentAdaptWithSize(false);
            this._prevIgnoreSize = ignoreBefore;
        }
        else {
            this.ignoreContentAdaptWithSize(this._prevIgnoreSize);
        }
        this.setCapInsetsBarRenderer(this._capInsetsBarRenderer);
        this.setCapInsetProgressBarRebderer(this._capInsetsProgressBarRenderer);
    },

    /**
     * override "ignoreContentAdaptWithSize" method of widget.
     * @param {Boolean} ignore
     */
    ignoreContentAdaptWithSize: function (ignore) {
        if (!this._scale9Enabled || (this._scale9Enabled && !ignore)) {
            ccs.UIWidget.prototype.ignoreContentAdaptWithSize.call(this, ignore);
            this._prevIgnoreSize = ignore;
        }
    },

    /**
     * Sets capinsets for slider, if slider is using scale9 renderer.
     * @param {cc.Rect} capInsets
     */
    setCapInsets: function (capInsets) {
        this.setCapInsetsBarRenderer(capInsets);
        this.setCapInsetProgressBarRebderer(capInsets);
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
     * Sets capinsets for slider, if slider is using scale9 renderer.
     * @param {cc.Rect} capInsets
     */
    setCapInsetProgressBarRebderer: function (capInsets) {
        this._capInsetsProgressBarRenderer = capInsets;
        if (!this._scale9Enabled) {
            return;
        }
        this._progressBarRenderer.setCapInsets(capInsets);
    },

    /**
     * Load textures for slider ball.
     * @param {String} normal
     * @param {String} pressed
     * @param {String} disabled
     * @param {ccs.TextureResType} texType
     */
    loadSlidBallTextures: function (normal, pressed, disabled, texType) {
        this.loadSlidBallTextureNormal(normal, texType);
        this.loadSlidBallTexturePressed(pressed, texType);
        this.loadSlidBallTextureDisabled(disabled, texType);
    },

    /**
     * Load normal state texture for slider ball.
     * @param {String} normal
     * @param {ccs.TextureResType} texType
     */
    loadSlidBallTextureNormal: function (normal, texType) {
        if (!normal) {
            return;
        }
        texType = texType || ccs.TextureResType.local;
        this._slidBallNormalTextureFile = normal;
        this._ballNTexType = texType;
        switch (this._ballNTexType) {
            case ccs.TextureResType.local:
                this._slidBallNormalRenderer.initWithFile(normal);
                break;
            case ccs.TextureResType.plist:
                this._slidBallNormalRenderer.initWithSpriteFrameName(normal);
                break;
            default:
                break;
        }
        this._slidBallNormalRenderer.setColor(this.getColor());
        this._slidBallNormalRenderer.setOpacity(this.getOpacity());
    },

    /**
     * Load selected state texture for slider ball.
     * @param {String} pressed
     * @param {ccs.TextureResType} texType
     */
    loadSlidBallTexturePressed: function (pressed, texType) {
        if (!pressed) {
            return;
        }
        texType = texType || ccs.TextureResType.local;
        this._slidBallPressedTextureFile = pressed;
        this._ballPTexType = texType;
        switch (this._ballPTexType) {
            case ccs.TextureResType.local:
                this._slidBallPressedRenderer.initWithFile(pressed);
                break;
            case ccs.TextureResType.plist:
                this._slidBallPressedRenderer.initWithSpriteFrameName(pressed);
                break;
            default:
                break;
        }
        this._slidBallPressedRenderer.setColor(this.getColor());
        this._slidBallPressedRenderer.setOpacity(this.getOpacity());
    },

    /**
     * Load dark state texture for slider ball.
     * @param {String} disabled
     * @param {ccs.TextureResType} texType
     */
    loadSlidBallTextureDisabled: function (disabled, texType) {
        if (!disabled) {
            return;
        }
        texType = texType || ccs.TextureResType.local;
        this._slidBallDisabledTextureFile = disabled;
        this._ballDTexType = texType;
        switch (this._ballDTexType) {
            case ccs.TextureResType.local:
                this._slidBallDisabledRenderer.initWithFile(disabled);
                break;
            case ccs.TextureResType.plist:
                this._slidBallDisabledRenderer.initWithSpriteFrameName(disabled);
                break;
            default:
                break;
        }
        this._slidBallDisabledRenderer.setColor(this.getColor());
        this._slidBallDisabledRenderer.setOpacity(this.getOpacity());
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
        var dis = this._barLength * (percent / 100.0);
        this._slidBallRenderer.setPosition(cc.p(-this._barLength / 2.0 + dis, 0.0));
        if (this._scale9Enabled) {
            this._progressBarRenderer.setPreferredSize(cc.size(dis, this._progressBarTextureSize.height));
        }
        else {
            var x = 0, y = 0;
            switch (this._progressBarTexType) {
                case ccs.TextureResType.plist:
                    var barNode = this._progressBarRenderer;
                    if (barNode) {
                        var to = barNode.getTextureRect().origin;
                        x = to.x;
                        y = to.y;
                    }
                    break;
                default:
                    break;
            }
            this._progressBarRenderer.setTextureRect(cc.rect(x, y, this._progressBarTextureSize.width * (percent / 100.0), this._progressBarTextureSize.height));
        }
    },

    onTouchBegan: function (touchPoint) {
        var pass = ccs.UIWidget.prototype.onTouchBegan.call(this,touchPoint);
        var nsp = this._renderer.convertToNodeSpace(touchPoint);
        this.setPercent(this.getPercentWithBallPos(nsp.x));
        this.percentChangedEvent();
        return pass;
    },

    onTouchMoved: function (touchPoint) {
        var nsp = this._renderer.convertToNodeSpace(touchPoint);
        this._slidBallRenderer.setPosition(cc.p(nsp.x, 0));
        this.setPercent(this.getPercentWithBallPos(nsp.x));
        this.percentChangedEvent();
    },

    onTouchEnded: function (touchPoint) {
        ccs.UIWidget.prototype.onTouchEnded.call(this, touchPoint);
    },

    onTouchCancelled: function (touchPoint) {
        ccs.UIWidget.prototype.onTouchCancelled.call(this, touchPoint);
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
            this._sliderEventSelector.call(this._sliderEventListener, this, ccs.SliderEventType.percent_changed);
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
        this.barRendererScaleChangedWithSize();
        this.progressBarRendererScaleChangedWithSize();
    },

    /**
     * override "getContentSize" method of widget.
     * @returns {cc.Size}
     */
    getContentSize: function () {
        var locContentSize = this._barRenderer.getContentSize();
        return cc.size(locContentSize.width,locContentSize.height);
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
                this._barRenderer.setPreferredSize(cc.size(this._size.width,this._size.height));
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
                this._progressBarRenderer.setPreferredSize(cc.size(this._size.width,this._size.height));
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
        this._progressBarRenderer.setPosition(cc.p(-this._barLength * 0.5, 0.0));
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

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "Slider";
    },

    createCloneInstance: function () {
        return ccs.UISlider.create();
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
/**
 * allocates and initializes a UISlider.
 * @constructs
 * @return {ccs.UISlider}
 * @example
 * // example
 * var uiSlider = ccs.UISlider.create();
 */
ccs.UISlider.create = function () {
    var uiSlider = new ccs.UISlider();
    if (uiSlider && uiSlider.init()) {
        return uiSlider;
    }
    return null;
};