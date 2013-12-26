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
 * loadingBar type
 * @type {Object}
 */
ccs.LoadingBarType = { left: 0, right: 1};

ccs.BARRENDERERZ = -1;
/**
 * Base class for ccs.LoadingBar
 * @class
 * @extends ccs.Widget
 */
ccs.LoadingBar = ccs.Widget.extend(/** @lends ccs.LoadingBar# */{
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
    _isTextureLoaded: false,
    ctor: function () {
        ccs.Widget.prototype.ctor.call(this);
        this._barType = ccs.LoadingBarType.left;
        this._percent = 100;
        this._totalLength = 0;
        this._barRenderer = null;
        this._renderBarTexType = ccs.TextureResType.local;
        this._barRendererTextureSize = cc.size(0, 0);
        this._scale9Enabled = false;
        this._prevIgnoreSize = true;
        this._capInsets = cc.rect(0, 0, 0, 0);
        this._textureFile = "";
    },

    initRenderer: function () {
        this._barRenderer = cc.Sprite.create();
        cc.NodeRGBA.prototype.addChild.call(this, this._barRenderer, ccs.BARRENDERERZ, -1);
        this._barRenderer.setAnchorPoint(0.0, 0.5);
    },

    /**
     * Changes the progress direction of loadingbar.
     * LoadingBarTypeLeft means progress left to right, LoadingBarTypeRight otherwise.
     * @param {ccs.LoadingBarType} dir
     */
    setDirection: function (dir) {
        if (this._barType == dir) {
            return;
        }
        this._barType = dir;

        switch (this._barType) {
            case ccs.LoadingBarType.left:
                this._barRenderer.setAnchorPoint(0.0, 0.5);
                this._barRenderer.setPosition(-this._totalLength * 0.5, 0.0);
                if (!this._scale9Enabled) {
                    this._barRenderer.setFlippedX(false);
                }
                break;
            case ccs.LoadingBarType.right:
                this._barRenderer.setAnchorPoint(1.0, 0.5);
                this._barRenderer.setPosition(this._totalLength * 0.5, 0.0);
                if (!this._scale9Enabled) {
                    this._barRenderer.setFlippedX(true);
                }
                break;
        }
    },

    /**
     * Gets the progress direction of loadingbar.
     * LoadingBarTypeLeft means progress left to right, LoadingBarTypeRight otherwise.
     * @returns {ccs.LoadingBarType}
     */
    getDirection: function () {
        return this._barType;
    },

    /**
     * Load texture for loadingbar.
     * @param {String} texture
     * @param {ccs.TextureResType} texType
     */
    loadTexture: function (texture, texType) {
        if (!texture) {
            return;
        }
        texType = texType || ccs.TextureResType.local;
        this._renderBarTexType = texType;
        this._textureFile = texture;
        var barRenderer = this._barRenderer;
        switch (this._renderBarTexType) {
            case ccs.TextureResType.local:
                barRenderer.initWithFile(texture);
                break;
            case ccs.TextureResType.plist:
                barRenderer.initWithSpriteFrameName(texture);
                break;
            default:
                break;
        }
        if (this._scale9Enabled){
            barRenderer.setCapInsets(this._capInsets);
        }
        this.updateDisplayedColor(this.getColor());
        this.updateDisplayedOpacity(this.getOpacity());

        var textLoaded = barRenderer.textureLoaded();
        this._isTextureLoaded = textLoaded;
        if (!textLoaded) {
            this._barRendererTextureSize.width = this._customSize.width;
            this._barRendererTextureSize.height = this._customSize.height;
            barRenderer.addLoadedEventListener(function () {
                this._isTextureLoaded = true;
                if (barRenderer.setCapInsets) {
                    barRenderer.setCapInsets(this._capInsets);
                }
                var locSize = barRenderer.getContentSize();
                this._barRendererTextureSize.width = locSize.width;
                this._barRendererTextureSize.height = locSize.height;
                this.barRendererScaleChangedWithSize();
                this.setPercent(this._percent);
            }, this);
        } else {
            var locBarSize = barRenderer.getContentSize();
            this._barRendererTextureSize.width = locBarSize.width;
            this._barRendererTextureSize.height = locBarSize.height;
        }

        switch (this._barType) {
            case ccs.LoadingBarType.left:
                barRenderer.setAnchorPoint(0.0, 0.5);
                if (!this._scale9Enabled) {
                    barRenderer.setFlippedX(false);
                }
                break;
            case ccs.LoadingBarType.right:
                barRenderer.setAnchorPoint(1.0, 0.5);
                if (!this._scale9Enabled) {
                    barRenderer.setFlippedX(true);
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
        cc.NodeRGBA.prototype.removeChild.call(this, this._barRenderer, true);
        this._barRenderer = null;
        if (this._scale9Enabled) {
            this._barRenderer = cc.Scale9Sprite.create();
        }
        else {
            this._barRenderer = cc.Sprite.create();
        }
        this.loadTexture(this._textureFile, this._renderBarTexType);
        cc.NodeRGBA.prototype.addChild.call(this, this._barRenderer, ccs.BARRENDERERZ, -1);
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
        if(!this._isTextureLoaded){
            return;
        }
        var res = this._percent / 100.0;

        var x = 0, y = 0;
        if(this._renderBarTexType==ccs.TextureResType.plist){
            var barNode = this._barRenderer;
            if (barNode) {
                var to = barNode.getTextureRect()._origin;
                x = to.x;
                y = to.y;
            }
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
        ccs.Widget.prototype.onSizeChanged.call(this);
        this.barRendererScaleChangedWithSize();
    },

    /**
     * override "ignoreContentAdaptWithSize" method of widget.
     * @param {Boolean}ignore
     */
    ignoreContentAdaptWithSize: function (ignore) {
        if (!this._scale9Enabled || (this._scale9Enabled && !ignore)) {
            ccs.Widget.prototype.ignoreContentAdaptWithSize.call(this, ignore);
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
                this._size.width = this._barRendererTextureSize;
            }
        }
        else {
            this._totalLength = this._size.width;
            if (this._scale9Enabled) {
                this.setScale9Scale();
            }
            else {

                var textureSize = this._barRendererTextureSize;
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
            case ccs.LoadingBarType.left:
                this._barRenderer.setPosition(-this._totalLength * 0.5, 0.0);
                break;
            case ccs.LoadingBarType.right:
                this._barRenderer.setPosition(this._totalLength * 0.5, 0.0);
                break;
            default:
                break;
        }
    },

    setScale9Scale: function () {
        var width = (this._percent) / 100 * this._totalLength;
        this._barRenderer.setPreferredSize(cc.size(width, this._size.height));
    },

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "LoadingBar";
    },

    createCloneInstance: function () {
        return ccs.LoadingBar.create();
    },

    copySpecialProperties: function (loadingBar) {
        this._prevIgnoreSize = loadingBar._prevIgnoreSize;
        this.setScale9Enabled(loadingBar._scale9Enabled);
        this.loadTexture(loadingBar._textureFile, loadingBar._renderBarTexType);
        this.setCapInsets(loadingBar._capInsets);
        this.setPercent(loadingBar._percent);
    }
});
/**
 * allocates and initializes a UILoadingBar.
 * @constructs
 * @return {ccs.LoadingBar}
 * @example
 * // example
 * var uiLoadingBar = ccs.LoadingBar.create();
 */
ccs.LoadingBar.create = function () {
    var uiLoadingBar = new ccs.LoadingBar();
    if (uiLoadingBar && uiLoadingBar.init()) {
        return uiLoadingBar;
    }
    return null;
};