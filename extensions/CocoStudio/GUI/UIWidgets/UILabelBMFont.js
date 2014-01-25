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

ccs.LABELBMFONTRENDERERZ = -1;
/**
 * Base class for ccs.LabelBMFont
 * @class
 * @extends ccs.Widget
 */
ccs.LabelBMFont = ccs.Widget.extend(/** @lends ccs.LabelBMFont# */{
    _labelBMFontRenderer: null,
    _fileHasInit: false,
    _fntFileName: "",
    _stringValue: "",
    ctor: function () {
        ccs.Widget.prototype.ctor.call(this);
        this._labelBMFontRenderer = null;
        this._fileHasInit = false;
    },
    initRenderer: function () {
        this._labelBMFontRenderer = cc.LabelBMFont.create();
        cc.NodeRGBA.prototype.addChild.call(this, this._labelBMFontRenderer, ccs.LABELBMFONTRENDERERZ, -1);
    },

    /**
     * init a bitmap font atlas with an initial string and the FNT file
     * @param {String} fileName
     */
    setFntFile: function (fileName) {
        if (!fileName) {
            return;
        }
        this._fntFileName = fileName;
        this._labelBMFontRenderer.initWithString("", fileName);
        this.updateAnchorPoint();
        this.labelBMFontScaleChangedWithSize();
        this._fileHasInit = true;
        this.setText(this._stringValue);

        if (!this._labelBMFontRenderer.textureLoaded()) {
            this._labelBMFontRenderer.addLoadedEventListener(function () {
                this.labelBMFontScaleChangedWithSize();
            }, this);
        }
    },

    /**
     * set string value for labelbmfont
     * @param {String} value
     */
    setText: function (value) {
        if (!value) {
            return;
        }
        this._strStringValue = value;
        this._labelBMFontRenderer.setString(value);
        this.labelBMFontScaleChangedWithSize();
    },

    /**
     * get string value for labelbmfont.
     * @returns {String}
     */
    getStringValue: function () {
        return this._strStringValue;
    },

    /**
     * override "setAnchorPoint" of widget.
     * @param {cc.Point|Number} point The anchor point of UILabelBMFont or The anchor point.x of UILabelBMFont.
     * @param {Number} [y] The anchor point.y of UILabelBMFont.
     */
    setAnchorPoint: function (point, y) {
        if(arguments.length === 2){
            ccs.Widget.prototype.setAnchorPoint.call(this, point, y);
            this._labelBMFontRenderer.setAnchorPoint(point, y);
        } else {
            ccs.Widget.prototype.setAnchorPoint.call(this, point);
            this._labelBMFontRenderer.setAnchorPoint(point);
        }
    },

    onSizeChanged: function () {
        ccs.Widget.prototype.onSizeChanged.call(this);
        this.labelBMFontScaleChangedWithSize();
    },

    /**
     * get content size
     * @returns {cc.Size}
     */
    getContentSize: function () {
        return this._labelBMFontRenderer.getContentSize();
    },

    /**
     * override "getVirtualRenderer" method of widget.
     * @returns {cc.Node}
     */
    getVirtualRenderer: function () {
        return this._labelBMFontRenderer;
    },

    labelBMFontScaleChangedWithSize: function () {
        if (this._ignoreSize) {
            this._labelBMFontRenderer.setScale(1.0);
            var rendererSize = this._labelBMFontRenderer.getContentSize();
            this._size.width = rendererSize.width;
            this._size.height = rendererSize.height;
        }
        else {
            var textureSize = this._labelBMFontRenderer.getContentSize();
            if (textureSize.width <= 0.0 || textureSize.height <= 0.0) {
                this._labelBMFontRenderer.setScale(1.0);
                return;
            }
            var scaleX = this._size.width / textureSize.width;
            var scaleY = this._size.height / textureSize.height;
            this._labelBMFontRenderer.setScaleX(scaleX);
            this._labelBMFontRenderer.setScaleY(scaleY);
        }
    },

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "LabelBMFont";
    },

    createCloneInstance: function () {
        return ccs.LabelBMFont.create();
    },

    copySpecialProperties: function (labelBMFont) {
        this.setFntFile(labelBMFont._fntFileName);
        this.setText(labelBMFont._stringValue);
    }
});
/**
 * allocates and initializes a UILabelBMFont.
 * @constructs
 * @return {ccs.LabelBMFont}
 * @example
 * // example
 * var uiLabelBMFont = ccs.LabelBMFont.create();
 */
ccs.LabelBMFont.create = function () {
    var uiLabelBMFont = new ccs.LabelBMFont();
    if (uiLabelBMFont && uiLabelBMFont.init()) {
        return uiLabelBMFont;
    }
    return null;
};