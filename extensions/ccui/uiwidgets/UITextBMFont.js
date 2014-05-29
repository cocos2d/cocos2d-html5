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
 * Base class for ccui.TextBMFont
 * @class
 * @extends ccui.Widget
 *
 * @property {String}   string  - Content string of the label
 */
ccui.TextBMFont = ccui.Widget.extend(/** @lends ccui.TextBMFont# */{
    _labelBMFontRenderer: null,
    _fileHasInit: false,
    _fntFileName: "",
    _stringValue: "",
    _className: "TextBMFont",

    /**
     * allocates and initializes a UILabelBMFont.
     * Constructor of ccui.TextBMFont
     * @example
     * // example
     * var uiLabelBMFont = new ccui.TextBMFont();
     */
    ctor: function () {
        ccui.Widget.prototype.ctor.call(this);
    },
    initRenderer: function () {
        this._labelBMFontRenderer = cc.LabelBMFont.create();
        cc.Node.prototype.addChild.call(this, this._labelBMFontRenderer, ccui.TextBMFont.RENDERER_ZORDER, -1);
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
        this.setString(this._stringValue);

        if (!this._labelBMFontRenderer.textureLoaded()) {
            this._labelBMFontRenderer.addLoadedEventListener(function () {
                this.labelBMFontScaleChangedWithSize();
            }, this);
        }
    },

    /**
     * set string value for labelbmfont
     * @deprecated
     * @param {String} value
     */
    setText: function (value) {
        cc.log("Please use the setString");
        if (!value) {
            return;
        }
        this._stringValue = value;
        this._labelBMFontRenderer.setString(value);
        this.labelBMFontScaleChangedWithSize();
    },

    /**
     * set string value for labelbmfont
     * @param {String} value
     */
    setString: function (value) {
        if (!value) {
            return;
        }
        this._stringValue = value;
        this._labelBMFontRenderer.setString(value);
        this.labelBMFontScaleChangedWithSize();
    },

    /**
     * get string value for labelbmfont.
     * @returns {String}
     */
    getString: function () {
        return this._stringValue;
    },

    /**
     * override "setAnchorPoint" of widget.
     * @param {cc.Point|Number} point The anchor point of UILabelBMFont or The anchor point.x of UILabelBMFont.
     * @param {Number} [y] The anchor point.y of UILabelBMFont.
     */
    setAnchorPoint: function (point, y) {
        if (y === undefined) {
            ccui.Widget.prototype.setAnchorPoint.call(this, point);
            this._labelBMFontRenderer.setAnchorPoint(point);
        } else {
            ccui.Widget.prototype.setAnchorPoint.call(this, point, y);
            this._labelBMFontRenderer.setAnchorPoint(point, y);
        }
    },
    _setAnchorX: function (value) {
        ccui.Widget.prototype._setAnchorX.call(this, value);
        this._labelBMFontRenderer._setAnchorX(value);
    },
    _setAnchorY: function (value) {
        ccui.Widget.prototype._setAnchorY.call(this, value);
        this._labelBMFontRenderer._setAnchorY(value);
    },

    onSizeChanged: function () {
        ccui.Widget.prototype.onSizeChanged.call(this);
        this.labelBMFontScaleChangedWithSize();
    },

    /**
     * get content size
     * @returns {cc.Size}
     */
    getContentSize: function () {
        return this._labelBMFontRenderer.getContentSize();
    },
    _getWidth: function () {
        return this._labelBMFontRenderer._getWidth();
    },
    _getHeight: function () {
        return this._labelBMFontRenderer._getHeight();
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

    updateTextureColor: function () {
        this.updateColorToRenderer(this._labelBMFontRenderer);
    },

    updateTextureOpacity: function () {
        this.updateOpacityToRenderer(this._labelBMFontRenderer);
    },

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "LabelBMFont";
    },

    createCloneInstance: function () {
        return ccui.TextBMFont.create();
    },

    copySpecialProperties: function (labelBMFont) {
        this.setFntFile(labelBMFont._fntFileName);
        this.setText(labelBMFont._stringValue);
    }
});

var _p = ccui.TextBMFont.prototype;

// Extended properties
/** @expose */
_p.string;
cc.defineGetterSetter(_p, "string", _p.getString, _p.setStringValue);

_p = null;

/**
 * allocates and initializes a UILabelBMFont.
 * @constructs
 * @return {ccui.TextBMFont}
 * @example
 * // example
 * var uiLabelBMFont = ccui.TextBMFont.create();
 */
ccui.TextBMFont.create = function () {
    return new ccui.TextBMFont();
};

// Constants
ccui.TextBMFont.RENDERER_ZORDER = -1;