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

cc.LoadingBarType = { Left: 0, Right: 1};

/**
 * Base class for cc.UILoadingBar
 * @class
 * @extends cc.UIWidget
 */
cc.UILoadingBar = cc.UIWidget.extend({
    _barType: null,
    _percent: 100,
    _totalLength: 0,
    _barRenderer: null,
    _renderBarTexType: null,
    _barRendererTextureSize: null,
    _scale9Enabled: false,
    _prevIgnoreSize: true,
    _capInsets: null,
    _textureFile: "",
    ctor: function () {
        cc.UIWidget.prototype.ctor.call(this);
        this._barType = cc.LoadingBarType.Left;
        this._percent = 100;
        this._totalLength = 0;
        this._barRenderer = null;
        this._renderBarTexType = cc.TextureResType.LOCAL;
        this._barRendererTextureSize = cc.size(0, 0);
        this._scale9Enabled = false;
        this._prevIgnoreSize = true;
        this._capInsets = cc.rect(0, 0, 0, 0);
        this._textureFile = "";
    },

    initRenderer: function () {
        cc.UIWidget.prototype.initRenderer.call(this);
        this._barRenderer = cc.Sprite.create();
        this._renderer.addChild(this._barRenderer);
        this._barRenderer.setAnchorPoint(cc.p(0.0, 0.5));
    },

    /**
     * Changes the progress direction of loadingbar.
     * LoadingBarTypeLeft means progress left to right, LoadingBarTypeRight otherwise.
     * @param {cc.LoadingBarType} dir
     */
    setDirection: function (dir) {
        if (this._barType == dir) {
            return;
        }
        this._barType = dir;

        switch (this._barType) {
            case cc.LoadingBarType.Left:
                this._barRenderer.setAnchorPoint(cc.p(0.0, 0.5));
                this._barRenderer.setPosition(cc.p(-this._totalLength * 0.5, 0.0));
                if (!this._scale9Enabled) {
                    this._barRenderer.setFlippedX(false);
                }
                break;
            case cc.LoadingBarType.Right:
                this._barRenderer.setAnchorPoint(cc.p(1.0, 0.5));
                this._barRenderer.setPosition(cc.p(this._totalLength * 0.5, 0.0));
                if (!this._scale9Enabled) {
                    this._barRenderer.setFlippedX(true);
                }
                break;
        }
    },

    /**
     * Gets the progress direction of loadingbar.
     * LoadingBarTypeLeft means progress left to right, LoadingBarTypeRight otherwise.
     * @returns {cc.LoadingBarType}
     */
    getDirection: function () {
        return this._barType;
    },

    /**
     * Load texture for loadingbar.
     * @param {String} texture
     * @param {cc.TextureResType} texType
     */
    loadTexture: function (texture, texType) {
        if (!texture) {
            return;
        }
        texType = texType || cc.TextureResType.LOCAL;
        this._renderBarTexType = texType;
        this._textureFile = texture;
        switch (this._renderBarTexType) {
            case cc.TextureResType.LOCAL:
                if (this._scale9Enabled)
                    this._barRenderer.initWithFile(texture);
                else
                    this._barRenderer.initWithFile(texture);
                break;
            case cc.TextureResType.PLIST:
                if (this._scale9Enabled)
                    this._barRenderer.initWithSpriteFrameName(texture);
                else
                    this._barRenderer.initWithSpriteFrameName(texture);
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
        this._barRendererTextureSize.width = this._barRenderer.getContentSize().width;
        this._barRendererTextureSize.height = this._barRenderer.getContentSize().height;

        switch (this._barType) {
            case cc.LoadingBarType.Left:
                this._barRenderer.setAnchorPoint(cc.p(0.0, 0.5));
                if (!this._scale9Enabled) {
                    this._barRenderer.setFlippedX(false);
                }
                break;
            case cc.LoadingBarType.Right:
                this._barRenderer.setAnchorPoint(cc.p(1.0, 0.5));
                if (!this._scale9Enabled) {
                    this._barRenderer.setFlippedX(true);
                }
                break;
        }
        this.barRendererScaleChangedWithSize();
    },

    /**
     * Sets if loadingbar is using scale9 renderer.
     * @param {Boolean} enabled
     */
    setScale9Enabled: function (enabled) {
        if (this._scale9Enabled == enabled) {
            return;
        }
        this._scale9Enabled = enabled;
        this._renderer.removeChild(this._barRenderer, true);
        this._barRenderer = null;
        if (this._scale9Enabled) {
            this._barRenderer = cc.Scale9Sprite.create();
        }
        else {
            this._barRenderer = cc.Sprite.create();
        }
        this.loadTexture(this._textureFile, this._renderBarTexType);
        this._renderer.addChild(this._barRenderer);
        if (this._scale9Enabled) {
            var ignoreBefore = this._ignoreSize;
            this.ignoreContentAdaptWithSize(false);
            this._prevIgnoreSize = ignoreBefore;
        }
        else {
            this.ignoreContentAdaptWithSize(this._prevIgnoreSize);
        }
        this.setCapInsets(this._capInsets);
    },

    /**
     * Sets capinsets for loadingbar, if loadingbar is using scale9 renderer.
     * @param {cc.Rect} capInsets
     */
    setCapInsets: function (capInsets) {
        this._capInsets = capInsets;
        if (!this._scale9Enabled) {
            return;
        }
        this._barRenderer.setCapInsets(capInsets);
    },

    /**
     * Changes the progress direction of loadingbar.
     * @param {number} percent
     */
    setPercent: function (percent) {
        if (percent < 0 || percent > 100) {
            return;
        }
        if (this._totalLength <= 0) {
            return;
        }
        this._percent = percent;
        var res = this._percent / 100.0;

        var x = 0, y = 0;
        switch (this._renderBarTexType) {
            case cc.TextureResType.PLIST:
                var barNode = this._barRenderer;
                if (barNode) {
                    var to = barNode.getTextureRect().origin;
                    x = to.x;
                    y = to.y;
                }
                break;
            default:
                break;
        }
        if (this._scale9Enabled)
            this.setScale9Scale();
        else
            this._barRenderer.setTextureRect(cc.rect(x, y, this._barRendererTextureSize.width * res, this._barRendererTextureSize.height));
    },

    /**
     * Gets the progress direction of loadingbar.
     * @returns {number}
     */
    getPercent: function () {
        return this._percent;
    },

    onSizeChanged: function () {
        this.barRendererScaleChangedWithSize();
    },

    /**
     * override "ignoreContentAdaptWithSize" method of widget.
     * @param {Boolean}ignore
     */
    ignoreContentAdaptWithSize: function (ignore) {
        if (!this._scale9Enabled || (this._scale9Enabled && !ignore)) {
            cc.UIWidget.prototype.ignoreContentAdaptWithSize.call(this, ignore);
            this._prevIgnoreSize = ignore;
        }
    },

    /**
     * override "getContentSize" method of widget.
     * @returns {cc.Size}
     */
    getContentSize: function () {
        return this._barRendererTextureSize;
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
            if (!this._scale9Enabled) {
                this._totalLength = this._barRendererTextureSize.width;
                this._barRenderer.setScale(1.0);
                this._size = this._barRendererTextureSize;
            }
        }
        else {
            this._totalLength = this._size.width;
            if (this._scale9Enabled) {
                this.setScale9Scale();
            }
            else {

                var textureSize = this._barRenderer.getContentSize();
                if (textureSize.width <= 0.0 || textureSize.height <= 0.0) {
                    this._barRenderer.setScale(1.0);
                    return;
                }
                var scaleX = this._size.width / textureSize.width;
                var scaleY = this._size.height / textureSize.height;
                this._barRenderer.setScaleX(scaleX);
                this._barRenderer.setScaleY(scaleY);
            }
        }
        switch (this._barType) {
            case cc.LoadingBarType.Left:
                this._barRenderer.setPosition(cc.p(-this._totalLength * 0.5, 0.0));
                break;
            case cc.LoadingBarType.Right:
                this._barRenderer.setPosition(cc.p(this._totalLength * 0.5, 0.0));
                break;
            default:
                break;
        }
    },

    setScale9Scale: function () {
        var width = (this._percent) / 100 * this._totalLength;
        this._barRenderer.setPreferredSize(cc.size(width, this._barRendererTextureSize.height));
    },

    getDescription: function () {
        return "LoadingBar";
    }
});

cc.UILoadingBar.create = function () {
    var uiLoadingBar = new cc.UILoadingBar();
    if (uiLoadingBar && uiLoadingBar.init()) {
        return uiLoadingBar;
    }
    return null;
};