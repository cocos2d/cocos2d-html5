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

ccs.LABELRENDERERZ = -1;
/**
 * Base class for ccs.Button
 * @class
 * @extends ccs.Widget
 */
ccs.Label = ccs.Widget.extend(/** @lends ccs.Label# */{
    _touchScaleChangeEnabled: false,
    _normalScaleValueX: 0,
    _normalScaleValueY: 0,
    _fontName: "",
    _fontSize: 0,
    _onSelectedScaleOffset: 0,
    _labelRenderer: "",
    _textAreaSize:null,
    _textVerticalAlignment:0,
    _textHorizontalAlignment:0,
    ctor: function () {
        ccs.Widget.prototype.ctor.call(this);
        this._touchScaleChangeEnabled = false;
        this._normalScaleValueX = 0;
        this._normalScaleValueY = 0;
        this._fontName = "Thonburi";
        this._fontSize = 10;
        this._onSelectedScaleOffset = 0.5;
        this._labelRenderer = "";
        this._textAreaSize = cc.size(0, 0);
        this._textVerticalAlignment = 0;
        this._textHorizontalAlignment = 0;
    },

    init: function () {
        if (ccs.Widget.prototype.init.call(this)) {
            return true;
        }
        return false;
    },

    initRenderer: function () {
        this._labelRenderer = cc.LabelTTF.create();
        cc.NodeRGBA.prototype.addChild.call(this, this._labelRenderer, ccs.LABELRENDERERZ, -1);
    },

    /**
     *  Changes the string value of label.
     * @param {String} text
     */
    setText: function (text) {
        this._labelRenderer.setString(text);
        this.labelScaleChangedWithSize();
    },

    /**
     * Gets the string value of label.
     * @returns {String}
     */
    getStringValue: function () {
        return this._labelRenderer.getString();
    },

    /**
     * Gets the string length of label.
     * @returns {Number}
     */
    getStringLength: function () {
        var str = this._labelRenderer.getString();
        return str.length;
    },

    /**
     * set fontSize
     * @param {Number} size
     */
    setFontSize: function (size) {
        this._fontSize = size;
        this._labelRenderer.setFontSize(size);
        this.labelScaleChangedWithSize();
    },

    /**
     * set fontName
     * @param {String} name
     */
    setFontName: function (name) {
        this._fontName = name;
        this._labelRenderer.setFontName(name);
        this.labelScaleChangedWithSize();
    },

    /**
     * set textAreaSize
     * @param {cc.Size} size
     */
    setTextAreaSize: function (size) {
        this._textAreaSize.width = size.width;
        this._textAreaSize.height = size.height;
        this._labelRenderer.setDimensions(size);
        this.labelScaleChangedWithSize();
    },

    /**
     * set Horizontal Alignment of cc.LabelTTF
     * @param {cc.TEXT_ALIGNMENT_LEFT|cc.TEXT_ALIGNMENT_CENTER|cc.TEXT_ALIGNMENT_RIGHT} alignment Horizontal Alignment
     */
    setTextHorizontalAlignment: function (alignment) {
        this._textHorizontalAlignment = alignment;
        this._labelRenderer.setHorizontalAlignment(alignment);
        this.labelScaleChangedWithSize();
    },

    /**
     * set Vertical Alignment of cc.LabelTTF
     * @param {cc.VERTICAL_TEXT_ALIGNMENT_TOP|cc.VERTICAL_TEXT_ALIGNMENT_CENTER|cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM} verticalAlignment
     */
    setTextVerticalAlignment: function (alignment) {
        this._textVerticalAlignment = alignment;
        this._labelRenderer.setVerticalAlignment(alignment);
        this.labelScaleChangedWithSize();
    },

    /**
     * Sets the touch scale enabled of label.
     * @param {Boolean} enable
     */
    setTouchScaleChangeAble: function (enable) {
        this.setTouchScaleChangeEnabled(enable);
    },

    /**
     * Gets the touch scale enabled of label.
     * @returns {Boolean}
     */
    getTouchScaleChangeAble: function () {
        return this.isTouchScaleChangeEnabled();
    },

    /**
     * Sets the touch scale enabled of label.
     * @param {Boolean} enable
     */
    setTouchScaleChangeEnabled: function (enable) {
        this._touchScaleChangeEnabled = enable;
        this._normalScaleValueX = this.getScaleX();
        this._normalScaleValueY = this.getScaleY();
    },

    /**
     * Gets the touch scale enabled of label.
     * @returns {Boolean}
     */
    isTouchScaleChangeEnabled: function () {
        return this._touchScaleChangeEnabled;
    },

    onPressStateChangedToNormal: function () {
        if (!this._touchScaleChangeEnabled) {
            return;
        }
        this.clickScale(this._normalScaleValueX,this._normalScaleValueY);
    },

    onPressStateChangedToPressed: function () {
        if (!this._touchScaleChangeEnabled) {
            return;
        }
        this.clickScale(this._normalScaleValueX + this._onSelectedScaleOffset,this._normalScaleValueY + this._onSelectedScaleOffset);
    },

    onPressStateChangedToDisabled: function () {

    },

    /**
     * set scale
     * @param {Number} scale
     */
    setScale: function (scale) {
        ccs.Widget.prototype.setScale.call(this, scale);
        this._normalScaleValueX = this._normalScaleValueY = scale;
    },

    /**
     * set scaleX
     * @param {Number} scaleX
     */
    setScaleX: function (scaleX) {
        ccs.Widget.prototype.setScaleX.call(this, scaleX);
        this._normalScaleValueX = scaleX;
    },

    /**
     * set scaleY
     * @param {Number} scaleY
     */
    setScaleY: function (scaleY) {
        ccs.Widget.prototype.setScaleY.call(this, scaleY);
        this._normalScaleValueY = scaleY;
    },

    clickScale: function (scale, scaleY) {
        this.setScale(scale, scaleY);
    },

    /**
     * override "setFlippedX" of widget.
     * @param {Boolean} flipX
     */
    setFlippedX: function (flipX) {
        this._labelRenderer.setFlippedX(flipX);
    },

    /**
     * override "setFlippedY" of widget.
     * @param {Boolean} flipY
     */
    setFlippedY: function (flipY) {
        this._labelRenderer.setFlippedY(flipY);
    },

    /**
     * override "isFlippedX" of widget.
     * @returns {Boolean}
     */
    isFlippedX: function () {
        return this._labelRenderer.isFlippedX();
    },

    /**
     * override "isFlippedY" of widget.
     * @returns {Boolean}
     */
    isFlippedY: function () {
        return this._labelRenderer.isFlippedY();
    },

    /**
     * override "setAnchorPoint" of widget.
     * @param {cc.Point|Number} point The anchor point of UILabel or The anchor point.x of UILabel.
     * @param {Number} [y] The anchor point.y of UILabel.
     */
    setAnchorPoint: function (point, y) {
        if(arguments.length === 2){
            ccs.Widget.prototype.setAnchorPoint.call(this, point, y);
            this._labelRenderer.setAnchorPoint(point, y);
        } else {
            ccs.Widget.prototype.setAnchorPoint.call(this, point);
            this._labelRenderer.setAnchorPoint(point);
        }
    },

    onSizeChanged: function () {
        ccs.Widget.prototype.onSizeChanged.call(this);
        this.labelScaleChangedWithSize();
    },

    /**
     * override "getContentSize" method of widget.
     * @returns {cc.Size}
     */
    getContentSize: function () {
        return this._labelRenderer.getContentSize();
    },

    /**
     * override "getVirtualRenderer" method of widget.
     * @returns {cc.Node}
     */
    getVirtualRenderer: function () {
        return this._labelRenderer;
    },

    labelScaleChangedWithSize: function () {
        if (this._ignoreSize) {
            this._labelRenderer.setScale(1.0);
            var renderSize = this._labelRenderer.getContentSize();
            this._size.width = renderSize.width;
            this._size.height = renderSize.height;
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

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "Label";
    },

    createCloneInstance: function () {
        return ccs.Label.create();
    },

    copySpecialProperties: function (uiLabel) {
        this.setFontName(uiLabel._fontName);
        this.setFontSize(uiLabel._labelRenderer.getFontSize());
        this.setText(uiLabel.getStringValue());
        this.setTouchScaleChangeEnabled(uiLabel._touchScaleChangeEnabled);
        this.setTextAreaSize(uiLabel._size);
        this.setTextHorizontalAlignment(uiLabel._textHorizontalAlignment);
        this.setTextVerticalAlignment(uiLabel._textVerticalAlignment);
    }
});
/**
 * allocates and initializes a UILabel.
 * @constructs
 * @return {ccs.Label}
 * @example
 * // example
 * var uiLabel = ccs.Label.create();
 */
ccs.Label.create = function () {
    var uiLabel = new ccs.Label();
    if (uiLabel && uiLabel.init()) {
        return uiLabel;
    }
    return null;
};
