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

cc.UILabel = cc.UIWidget.extend({
    _touchScaleChangeEnabled: false,
    _normalScaleValue: 0,
    _fontName: "",
    _fontSize: 0,
    _onSelectedScaleOffset: 0,
    _labelRenderer: "",
    ctor: function () {
        cc.UIWidget.prototype.ctor.call(this);
        this._touchScaleChangeEnabled = false;
        this._normalScaleValue = 0;
        this._fontName = "Thonburi";
        this._fontSize = 10;
        this._onSelectedScaleOffset = 0.5;
        this._labelRenderer = "";
    },

    init: function () {
        if (cc.UIWidget.prototype.init.call(this)) {
            return true;
        }
        return false;
    },

    initRenderer: function () {
        cc.UIWidget.prototype.initRenderer.call(this);
        this._labelRenderer = cc.LabelTTF.create();
        this._renderer.addChild(this._labelRenderer);
    },

    setText: function (text) {
        if (!text) {
            return;
        }
        this._labelRenderer.setString(text);
        this.labelScaleChangedWithSize();
    },

    getStringValue: function () {
        return this._labelRenderer.getString();
    },

    getStringLength: function () {
        var str = this._labelRenderer.getString();
        return str.length;
    },

    setFontSize: function (size) {
        this._labelRenderer.setFontSize(size);
        this.labelScaleChangedWithSize();
    },

    setFontName: function (name) {
        this._labelRenderer.setFontName(name);
        this.labelScaleChangedWithSize();
    },

    setTextAreaSize: function (size) {
        this._labelRenderer.setDimensions(size);
        this.labelScaleChangedWithSize();
    },

    setTextHorizontalAlignment: function (alignment) {
        this._labelRenderer.setHorizontalAlignment(alignment);
        this.labelScaleChangedWithSize();
    },

    setTextVerticalAlignment: function (alignment) {
        this._labelRenderer.setVerticalAlignment(alignment);
        this.labelScaleChangedWithSize();
    },

    setTouchScaleChangeEnabled: function (enable) {
        this._touchScaleChangeEnabled = enable;
        this._normalScaleValue = this.getScale();
    },

    isTouchScaleChangeEnabled: function () {
        return this._touchScaleChangeEnabled;
    },

    onPressStateChangedToNormal: function () {
        if (!this._touchScaleChangeEnabled) {
            return;
        }
        this.clickScale(this._normalScaleValue);
    },

    onPressStateChangedToPressed: function () {
        if (!this._touchScaleChangeEnabled) {
            return;
        }
        this.clickScale(this._normalScaleValue + this._onSelectedScaleOffset);
    },

    onPressStateChangedToDisabled: function () {

    },

    clickScale: function (scale) {
        this._renderer.setScale(scale);
    },

    setFlipX: function (flipX) {
        this._labelRenderer.setFlipX(flipX);
    },

    setFlipY: function (flipY) {
        this._labelRenderer.setFlipY(flipY);
    },

    isFlipX: function () {
        return this._labelRenderer.isFlipX();
    },

    isFlipY: function () {
        return this._labelRenderer.isFlipY();
    },

    setAnchorPoint: function (pt) {
        cc.UIWidget.prototype.setAnchorPoint.call(this, pt);
        this._labelRenderer.setAnchorPoint(pt);
    },

    onSizeChanged: function () {
        this.labelScaleChangedWithSize();
    },

    getContentSize: function () {
        return this._labelRenderer.getContentSize();
    },

    getVirtualRenderer: function () {
        return this._labelRenderer;
    },

    labelScaleChangedWithSize: function () {
        if (this._ignoreSize) {
            this._labelRenderer.setScale(1.0);
            this._size = this._labelRenderer.getContentSize();
        }
        else {
            var textureSize = this._labelRenderer.getContentSize();
            if (textureSize.width <= 0.0 || textureSize.height <= 0.0) {
                this._labelRenderer.setScale(1.0);
                return;
            }
            var scaleX = this._size.width / textureSize.width;
            var scaleY = this._size.height / textureSize.height;
            this._labelRenderer.setScaleX(scaleX);
            this._labelRenderer.setScaleY(scaleY);
        }

    },

    getDescription: function () {
        return "Label";
    }
});

cc.UILabel.create = function () {
    var uiLabel = new cc.UILabel();
    if (uiLabel && uiLabel.init()) {
        return uiLabel;
    }
    return null;
};
