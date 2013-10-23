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
 * Base class for cc.UIButton
 * @class
 * @extends cc.UIWidget
 */
cc.UIImageView = cc.UIWidget.extend({
    _clickCount: 0,
    _clickTimeInterval: 0,
    _startCheckDoubleClick: false,
    _touchRelease: false,
    _doubleClickEnabled: false,
    _scale9Enabled: false,
    _prevIgnoreSize: true,
    _capInsets: null,
    _imageRenderer: null,
    _textureFile: "",
    _imageTexType: null,
    _imageTextureSize: null,
    ctor: function () {
        cc.UIWidget.prototype.ctor.call(this);
        this._clickCount = 0;
        this._clickTimeInterval = 0;
        this._startCheckDoubleClick = false;
        this._touchRelease = false;
        this._doubleClickEnabled = false;
        this._scale9Enabled = false;
        this._prevIgnoreSize = true;
        this._capInsets = null;
        this._imageRenderer = null;
        this._textureFile = "";
        this._imageTexType = cc.TextureResType.LOCAL;
        this._imageTextureSize = this._size;
    },

    initRenderer: function () {
        cc.UIWidget.prototype.initRenderer.call(this);
        this._imageRenderer = cc.Sprite.create();
        this._renderer.addChild(this._imageRenderer);
    },

    /**
     * Load textures for button.
     * @param {String} fileName
     * @param {cc.TextureResType} texType
     */
    loadTexture: function (fileName, texType) {
        if (!fileName) {
            return;
        }
        texType = texType || cc.TextureResType.LOCAL;
        this._textureFile = fileName;
        this._imageTexType = texType;
        switch (this._imageTexType) {
            case cc.TextureResType.LOCAL:
                if (this._scale9Enabled) {
                    this._imageRenderer.initWithFile(fileName);
                    this._imageRenderer.setColor(this.getColor());
                    this._imageRenderer.setOpacity(this.getOpacity());
                }
                else {
                    this._imageRenderer.initWithFile(fileName);
                    this._imageRenderer.setColor(this.getColor());
                    this._imageRenderer.setOpacity(this.getOpacity());
                }
                break;
            case cc.TextureResType.PLIST:
                if (this._scale9Enabled) {
                    this._imageRenderer.initWithSpriteFrameName(fileName);
                    this._imageRenderer.setColor(this.getColor());
                    this._imageRenderer.setOpacity(this.getOpacity());
                }
                else {
                    this._imageRenderer.initWithSpriteFrameName(fileName);
                    this._imageRenderer.setColor(this.getColor());
                    this._imageRenderer.setOpacity(this.getOpacity());
                }
                break;
            default:
                break;
        }
        this._imageTextureSize = this._imageRenderer.getContentSize();
        this.updateAnchorPoint();
        this.imageTextureScaleChangedWithSize();
    },

    /**
     * set texture rect
     * @param {cc.Rect} rect
     */
    setTextureRect: function (rect) {
        if (!this._scale9Enabled){
            this._imageRenderer.setTextureRect(rect);
        }
    },

    onTouchBegan: function (touchPoint) {
        this.setFocused(true);
        this._touchStartPos.x = touchPoint.x;
        this._touchStartPos.y = touchPoint.y;
        this._widgetParent.checkChildInfo(0, this, touchPoint);
        this.pushDownEvent();

        if (this._doubleClickEnabled) {
            this._clickTimeInterval = 0;
            this._startCheckDoubleClick = true;
            this._clickCount++;
            this._touchRelease = false;
        }
        return this._touchPassedEnabled;
    },

    onTouchEnded: function (touchPoint) {
        if (this._doubleClickEnabled) {
            if (this._clickCount >= 2) {
                this.doubleClickEvent();
                this._clickCount = 0;
                this._startCheckDoubleClick = false;
            }
            else {
                this._touchRelease = true;
            }
        }
        else {
            cc.UIWidget.prototype.onTouchEnded.call(this, touchPoint);
        }
    },

    doubleClickEvent: function () {

    },

    checkDoubleClick: function (dt) {
        if (this._startCheckDoubleClick) {
            this._clickTimeInterval += dt;
            if (this._clickTimeInterval >= 200 && this._clickCount > 0) {
                this._clickTimeInterval = 0;
                this._clickCount--;
                this._startCheckDoubleClick = false;
            }
        }
        else {
            if (this._clickCount <= 1) {
                if (this._touchRelease) {
                    this.releaseUpEvent();
                    this._clickTimeInterval = 0;
                    this._clickCount = 0;
                    this._touchRelease = false;
                }
            }
        }
    },

    setDoubleClickEnabled: function (bool) {
        if (bool == this._doubleClickEnabled) {
            return;
        }
        this._doubleClickEnabled = bool;
    },

    /**
     * Sets whether the widget should be flipped horizontally or not.
     * @param {Boolean} flipX
     */
    setFlippedX: function (flipX) {
        if (!this._scale9Enabled) {
            this._imageRenderer.setFlippedX(flipX);
        }
    },

    /**
     * override "setFlippedY" of widget.
     * @param {Boolean} flipY
     */
    setFlippedY: function (flipY) {
        if (!this._scale9Enabled) {
            this._imageRenderer.setFlippedY(flipY);
        }
    },

    /**
     * override "isFlippedX" of widget.
     * @returns {Boolean}
     */
    isFlippedX: function () {
        if (this._scale9Enabled)
            return false;
        else
            return this._imageRenderer.isFlippedX();
    },

    /**
     * override "isFlippedY" of widget.
     * @returns {Boolean}
     */
    isFlippedY: function () {
        if (this._scale9Enabled)
            return false;
        else
            return this._imageRenderer.isFlippedY();
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
        this._renderer.removeChild(this._imageRenderer, true);
        this._imageRenderer = null;
        if (this._scale9Enabled) {
            this._imageRenderer = cc.Scale9Sprite.create();
        }
        else {
            this._imageRenderer = cc.Sprite.create();
        }
        this.loadTexture(this._textureFile, this._imageTexType);
        this._renderer.addChild(this._imageRenderer);
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
     * override "setAnchorPoint" of widget.
     * @param {cc.Point} pt
     */
    setAnchorPoint: function (pt) {
        cc.UIWidget.prototype.setAnchorPoint.call(this, pt);
        this._imageRenderer.setAnchorPoint(pt);
    },

    onSizeChanged: function () {
        this.imageTextureScaleChangedWithSize();
    },

    /**
     * override "getContentSize" method of widget.
     * @returns {cc.Size}
     */
    getContentSize: function () {
        return this._imageTextureSize;
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
                var scaleX = this._size.width / textureSize.width;
                var scaleY = this._size.height / textureSize.height;
                this._imageRenderer.setScaleX(scaleX);
                this._imageRenderer.setScaleY(scaleY);
            }
        }
    },
    getDescription: function () {
        return "ImageView";
    }

});

cc.UIImageView.create = function () {
    var uiImageView = new cc.UIImageView();
    if (uiImageView && uiImageView.init()) {
        return uiImageView;
    }
    return null;
};
