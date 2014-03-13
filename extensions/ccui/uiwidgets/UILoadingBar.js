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
 * Base class for ccui.LoadingBar
 * @class
 * @extends ccui.Widget
 *
 * @property {ccui.LoadingBar.TYPE_LEFT | ccui.LoadingBar.TYPE_RIGHT}   direction   - The progress direction of loadingbar
 * @property {Number}               percent     - The current progress of loadingbar
 */
ccui.LoadingBar = ccui.Widget.extend(/** @lends ccui.LoadingBar# */{
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
    _className:"LoadingBar",
    ctor: function () {
        ccui.Widget.prototype.ctor.call(this);
        this._barType = ccui.LoadingBar.TYPE_LEFT;
        this._percent = 100;
        this._totalLength = 0;
        this._barRenderer = null;
        this._renderBarTexType = ccui.Widget.LOCAL_TEXTURE;
        this._barRendererTextureSize = cc.size(0, 0);
        this._scale9Enabled = false;
        this._prevIgnoreSize = true;
        this._capInsets = cc.rect(0, 0, 0, 0);
        this._textureFile = "";
    },

    initRenderer: function () {
        this._barRenderer = cc.Sprite.create();
        cc.Node.prototype.addChild.call(this, this._barRenderer, ccui.LoadingBar.RENDERER_ZORDER, -1);
        this._barRenderer.setAnchorPoint(0.0, 0.5);
    },

    /**
     * Changes the progress direction of loadingbar.
     * LoadingBarTypeLeft means progress left to right, LoadingBarTypeRight otherwise.
     * @param {ccui.LoadingBar.TYPE_LEFT | ccui.LoadingBar.TYPE_RIGHT} dir
     */
    setDirection: function (dir) {
        if (this._barType == dir) {
            return;
        }
        this._barType = dir;

        switch (this._barType) {
            case ccui.LoadingBar.TYPE_LEFT:
                this._barRenderer.setAnchorPoint(0.0, 0.5);
                this._barRenderer.setPosition(-this._totalLength * 0.5, 0.0);
                if (!this._scale9Enabled) {
                    this._barRenderer.setFlippedX(false);
                }
                break;
            case ccui.LoadingBar.TYPE_RIGHT:
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
     * @returns {ccui.LoadingBar.TYPE_LEFT | ccui.LoadingBar.TYPE_RIGHT}
     */
    getDirection: function () {
        return this._barType;
    },

    /**
     * Load texture for loadingbar.
     * @param {String} texture
     * @param {ccui.Widget.LOCAL_TEXTURE|ccui.Widget.PLIST_TEXTURE} texType
     */
    loadTexture: function (texture, texType) {
        if (!texture) {
            return;
        }
        texType = texType || ccui.Widget.LOCAL_TEXTURE;
        this._renderBarTexType = texType;
        this._textureFile = texture;
        var barRenderer = this._barRenderer;
        switch (this._renderBarTexType) {
            case ccui.Widget.LOCAL_TEXTURE:
                if(this._scale9Enabled)
                    barRenderer.initWithFile(texture);
                else
                    barRenderer.init(texture);
                break;
            case ccui.Widget.PLIST_TEXTURE:
                barRenderer.initWithSpriteFrameName(texture);
                break;
            default:
                break;
        }
        if (this._scale9Enabled){
            barRenderer.setCapInsets(this._capInsets);
        }
        this.updateColorToRenderer(barRenderer);

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
            case ccui.LoadingBar.TYPE_LEFT:
                barRenderer.setAnchorPoint(0.0, 0.5);
                if (!this._scale9Enabled) {
                    barRenderer.setFlippedX(false);
                }
                break;
            case ccui.LoadingBar.TYPE_RIGHT:
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
        cc.Node.prototype.removeChild.call(this, this._barRenderer, true);
        this._barRenderer = null;
        if (this._scale9Enabled) {
            this._barRenderer = cc.Scale9Sprite.create();
        }
        else {
            this._barRenderer = cc.Sprite.create();
        }
        this.loadTexture(this._textureFile, this._renderBarTexType);
        cc.Node.prototype.addChild.call(this, this._barRenderer, ccui.LoadingBar.RENDERER_ZORDER, -1);
        if (this._scale9Enabled) {
            var ignoreBefore = this._ignoreSize;
            this.ignoreContentAdaptWithSize(false);
            this._prevIgnoreSize = ignoreBefore;
        }
        else {
            this.ignoreContentAdaptWithSize(this._prevIgnoreSize);
        }
        this.setCapInsets(this._capInsets);
        this.setPercent(this._percent);
    },

    /**
     * Get  loadingBar is using scale9 renderer or not..
     * @returns {Boolean}
     */
    isScale9Enabled:function(){
        return this._scale9Enabled;
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
     * Get cap insets for loadingBar.
     * @returns {cc.Rect}
     */
    getCapInsets:function(){
        return this._capInsets;
    },

    /**
     * The current progress of loadingbar
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
        if(this._renderBarTexType==ccui.Widget.PLIST_TEXTURE){
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
        ccui.Widget.prototype.onSizeChanged.call(this);
        this.barRendererScaleChangedWithSize();
    },

    /**
     * override "ignoreContentAdaptWithSize" method of widget.
     * @param {Boolean}ignore
     */
    ignoreContentAdaptWithSize: function (ignore) {
        if (!this._scale9Enabled || (this._scale9Enabled && !ignore)) {
            ccui.Widget.prototype.ignoreContentAdaptWithSize.call(this, ignore);
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
	_getWidth: function () {
		return this._barRendererTextureSize.width;
	},
	_getHeight: function () {
		return this._barRendererTextureSize.height;
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
                this._size.width = this._barRendererTextureSize.width;
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
            case ccui.LoadingBar.TYPE_LEFT:
                this._barRenderer.setPosition(-this._totalLength * 0.5, 0.0);
                break;
            case ccui.LoadingBar.TYPE_RIGHT:
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

    updateTextureColor: function () {
        this.updateColorToRenderer(this._barRenderer);
    },

    updateTextureOpacity: function () {
        this.updateOpacityToRenderer(this._barRenderer);
    },

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "LoadingBar";
    },

    createCloneInstance: function () {
        return ccui.LoadingBar.create();
    },

    copySpecialProperties: function (loadingBar) {
        this._prevIgnoreSize = loadingBar._prevIgnoreSize;
        this.setScale9Enabled(loadingBar._scale9Enabled);
        this.loadTexture(loadingBar._textureFile, loadingBar._renderBarTexType);
        this.setCapInsets(loadingBar._capInsets);
        this.setPercent(loadingBar._percent);
        this.setDirection(loadingBar._barType);
    }
});

window._p = ccui.LoadingBar.prototype;

// Extended properties
/** @expose */
_p.direction;
cc.defineGetterSetter(_p, "direction", _p.getDirection, _p.setDirection);
/** @expose */
_p.percent;
cc.defineGetterSetter(_p, "percent", _p.getPercent, _p.setPercent);

delete window._p;

/**
 * allocates and initializes a UILoadingBar.
 * @constructs
 * @return {ccui.LoadingBar}
 * @example
 * // example
 * var uiLoadingBar = ccui.LoadingBar.create();
 */
ccui.LoadingBar.create = function () {
    var uiLoadingBar = new ccui.LoadingBar();
    if (uiLoadingBar && uiLoadingBar.init()) {
        return uiLoadingBar;
    }
    return null;
};

// Constants
//loadingBar Type
ccui.LoadingBar.TYPE_LEFT = 0;
ccui.LoadingBar.TYPE_RIGHT = 1;

ccui.LoadingBar.RENDERER_ZORDER = -1;