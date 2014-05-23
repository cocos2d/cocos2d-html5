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
 */
ccui.ImageView = ccui.Widget.extend(/** @lends ccui.ImageView# */{
    _scale9Enabled: false,
    _prevIgnoreSize: true,
    _capInsets: null,
    _imageRenderer: null,
    _textureFile: "",
    _imageTexType: ccui.Widget.LOCAL_TEXTURE,
    _imageTextureSize: null,
    _className:"ImageView",

    /**
     * allocates and initializes a UIImageView.
     * Constructor of ccui.ImageView
     * @example
     * // example
     * var uiImageView = new ccui.ImageView;
     */
    ctor: function () {
        this._capInsets = cc.rect(0,0,0,0);
        this._imageTextureSize = cc.size(this._size.width, this._size.height);
        ccui.Widget.prototype.ctor.call(this);
    },

    initRenderer: function () {
        this._imageRenderer = cc.Sprite.create();
        cc.Node.prototype.addChild.call(this, this._imageRenderer, ccui.ImageView.RENDERER_ZORDER, -1);
    },

    /**
     * Load textures for button.
     * @param {String} fileName
     * @param {ccui.Widget.LOCAL_TEXTURE|ccui.Widget.PLIST_TEXTURE} texType
     */
    loadTexture: function (fileName, texType) {
        if (!fileName) {
            return;
        }
        texType = texType || ccui.Widget.LOCAL_TEXTURE;
        this._textureFile = fileName;
        this._imageTexType = texType;
        var imageRenderer = this._imageRenderer;
        switch (this._imageTexType) {
            case ccui.Widget.LOCAL_TEXTURE:
                imageRenderer.initWithFile(fileName);
                break;
            case ccui.Widget.PLIST_TEXTURE:
                imageRenderer.initWithSpriteFrameName(fileName);
                break;
            default:
                break;
        }

        var locRendererSize = imageRenderer.getContentSize();
        if(imageRenderer.textureLoaded()){
            this._imageTextureSize.width = this._customSize.width ? this._customSize.width : locRendererSize.width;
            this._imageTextureSize.height = this._customSize.height ? this._customSize.height : locRendererSize.height;
        }else{
            imageRenderer.addLoadedEventListener(function(){
                var locSize = imageRenderer.getContentSize();
                this._imageTextureSize.width = this._customSize.width ? this._customSize.width : locSize.width;
                this._imageTextureSize.height = this._customSize.height ? this._customSize.height : locSize.height;
                if (imageRenderer.setCapInsets) {
                    imageRenderer.setCapInsets(this._capInsets);
                }
                this.imageTextureScaleChangedWithSize();
            },this);
            this._imageTextureSize.width = this._customSize.width;
            this._imageTextureSize.height = this._customSize.height;
        }

        if (this._scale9Enabled) {
            imageRenderer.setCapInsets(this._capInsets);
        }

        this.updateColorToRenderer(imageRenderer);
        this.updateAnchorPoint();
        this.updateFlippedX();
        this.updateFlippedY();
        this.imageTextureScaleChangedWithSize();
    },

    /**
     * set texture rect
     * @param {cc.Rect} rect
     */
    setTextureRect: function (rect) {
        if (!this._scale9Enabled){
            this._imageRenderer.setTextureRect(rect);
            var locRendererSize = this._imageRenderer.getContentSize();
            this._imageTextureSize.width = locRendererSize.width;
            this._imageTextureSize.height = locRendererSize.height;
            this.imageTextureScaleChangedWithSize();
        }
    },

    updateFlippedX: function () {
        if (this._scale9Enabled) {
            this._imageRenderer.setScaleX(this._flippedX ? -1 : 1);
        } else {
            this._imageRenderer.setFlippedX(this._flippedX);
        }
    },

    updateFlippedY: function () {
        if (this._scale9Enabled) {
            this._imageRenderer.setScaleY(this._flippedY ? -1 : 1);
        } else {
            this._imageRenderer.setFlippedY(this._flippedY);
        }
    },

    /**
     * Sets if button is using scale9 renderer.
     * @param {Boolean} able
     */
    setScale9Enabled: function (able) {
        if (this._scale9Enabled == able) {
            return;
        }


        this._scale9Enabled = able;
        cc.Node.prototype.removeChild.call(this, this._imageRenderer, true);
        this._imageRenderer = null;
        if (this._scale9Enabled) {
            this._imageRenderer = cc.Scale9Sprite.create();
        }
        else {
            this._imageRenderer = cc.Sprite.create();
        }
        this.loadTexture(this._textureFile, this._imageTexType);
        cc.Node.prototype.addChild.call(this, this._imageRenderer, ccui.ImageView.RENDERER_ZORDER, -1);
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
     * Get  button is using scale9 renderer or not.
     * @returns {Boolean}
     */
    isScale9Enabled:function(){
        return this._scale9Enabled;
    },

    /**
     * ignoreContentAdaptWithSize
     * @param {Boolean} ignore
     */
    ignoreContentAdaptWithSize: function (ignore) {
        if (!this._scale9Enabled || (this._scale9Enabled && !ignore)) {
            ccui.Widget.prototype.ignoreContentAdaptWithSize.call(this, ignore);
            this._prevIgnoreSize = ignore;
        }
    },

    /**
     * Sets capinsets for button, if button is using scale9 renderer.
     * @param {cc.Rect} capInsets
     */
    setCapInsets: function (capInsets) {
        this._capInsets = capInsets;
        if (!this._scale9Enabled) {
            return;
        }
        this._imageRenderer.setCapInsets(capInsets);
    },

    /**
     * Get cap insets.
     * @returns {cc.Rect}
     */
    getCapInsets:function(){
        return this._capInsets;
    },

    /**
     * override "setAnchorPoint" of widget.
     * @param {cc.Point|Number} point The anchor point of UIImageView or The anchor point.x of UIImageView.
     * @param {Number} [y] The anchor point.y of UIImageView.
     */
    setAnchorPoint: function (point, y) {
        if(y === undefined){
	        ccui.Widget.prototype.setAnchorPoint.call(this, point);
	        this._imageRenderer.setAnchorPoint(point);
        } else {
	        ccui.Widget.prototype.setAnchorPoint.call(this, point, y);
	        this._imageRenderer.setAnchorPoint(point, y);
        }
    },
	_setAnchorX: function (value) {
		ccui.Widget.prototype._setAnchorX.call(this, value);
		this._imageRenderer._setAnchorX(value);
	},
	_setAnchorY: function (value) {
		ccui.Widget.prototype._setAnchorY.call(this, value);
		this._imageRenderer._setAnchorY(value);
	},


    onSizeChanged: function () {
        ccui.Widget.prototype.onSizeChanged.call(this);
        this.imageTextureScaleChangedWithSize();
    },

    /**
     * override "getContentSize" method of widget.
     * @returns {cc.Size}
     */
    getContentSize: function () {
        return this._imageTextureSize;
    },
	_getWidth: function () {
		return this._imageTextureSize.width;
	},
	_getHeight: function () {
		return this._imageTextureSize.height;
	},

    /**
     * override "getVirtualRenderer" method of widget.
     * @returns {cc.Node}
     */
    getVirtualRenderer: function () {
        return this._imageRenderer;
    },

    imageTextureScaleChangedWithSize: function () {
        if (this._ignoreSize) {
            if (!this._scale9Enabled) {
                this._imageRenderer.setScale(1.0);
                this._size = this._imageTextureSize;
            }
        }
        else {
            if (this._scale9Enabled) {
                this._imageRenderer.setPreferredSize(this._size);
            }
            else {
                var textureSize = this._imageRenderer.getContentSize();
                if (textureSize.width <= 0.0 || textureSize.height <= 0.0) {
                    this._imageRenderer.setScale(1.0);
                    return;
                }
                var scaleX = this._size.width / textureSize.width; var scaleY = this._size.height / textureSize.height;
                this._imageRenderer.setScaleX(scaleX);
                this._imageRenderer.setScaleY(scaleY);
            }
        }
    },

    updateTextureColor: function () {
        this.updateColorToRenderer(this._imageRenderer);
    },

    updateTextureOpacity: function () {
        this.updateOpacityToRenderer(this._imageRenderer);
    },

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "ImageView";
    },

    createCloneInstance:function(){
        return ccui.ImageView.create();
    },

    copySpecialProperties: function (imageView) {
        this._prevIgnoreSize = imageView._prevIgnoreSize;
        this.setScale9Enabled(imageView._scale9Enabled);
        this.loadTexture(imageView._textureFile, imageView._imageTexType);
        this.setCapInsets(imageView._capInsets);
    }

});

/**
 * allocates and initializes a UIImageView.
 * @constructs
 * @return {ccui.ImageView}
 * @example
 * // example
 * var uiImageView = ccui.ImageView.create();
 */
ccui.ImageView.create = function () {
    return new ccui.ImageView();
};

// Constants
ccui.ImageView.RENDERER_ZORDER = -1;