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
 *
 * @property {Number}   boundingWidth       - Width of the bounding area of label, the real content width is limited by boundingWidth
 * @property {Number}   boundingHeight      - Height of the bounding area of label, the real content height is limited by boundingHeight
 * @property {String}   string              - The content string of the label
 * @property {Number}   stringLength        - <@readonly> The content string length of the label
 * @property {String}   font                - The label font with a style string: e.g. "18px Verdana"
 * @property {String}   fontName            - The label font name
 * @property {Number}   fontSize            - The label font size
 * @property {Number}   textAlign           - Horizontal Alignment of label, cc.TEXT_ALIGNMENT_LEFT|cc.TEXT_ALIGNMENT_CENTER|cc.TEXT_ALIGNMENT_RIGHT
 * @property {Number}   verticalAlign       - Vertical Alignment of label: cc.VERTICAL_TEXT_ALIGNMENT_TOP|cc.VERTICAL_TEXT_ALIGNMENT_CENTER|cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM
 * @property {Boolean}  touchScaleEnabled   - Indicate whether the label will scale when touching
 */
ccs.Label = ccs.Widget.extend(/** @lends ccs.Label# */{
    touchScaleEnabled: false,
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
        this.touchScaleEnabled = false;
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
     * Get font Size
     * @returns {Number}
     */
    getFontSize:function(){
        return this._fontSize;
    },

    /**
     * Set font name
     * @return {String} name
     */
    setFontName: function (name) {
        this._fontName = name;
        this._labelRenderer.setFontName(name);
        this.labelScaleChangedWithSize();
    },

    /**
     * Get font name
     * @returns {string}
     */
    getFontName:function(){
        return this._fontName;
    },

	_setFont: function (font) {
		var res = cc.LabelTTF._fontStyleRE.exec(font);
		if(res) {
			this._fontSize = parseInt(res[1]);
			this._fontName = res[2];
			this._labelRenderer._setFont(font);
			this.labelScaleChangedWithSize();
		}
	},
	_getFont: function () {
		return this._labelRenderer._getFont();
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
	_setBoundingWidth: function (value) {
		this._textAreaSize.width = value;
		this._labelRenderer._setBoundingWidth(value);
		this.labelScaleChangedWithSize();
	},
	_setBoundingHeight: function (value) {
		this._textAreaSize.height = value;
		this._labelRenderer._setBoundingHeight(value);
		this.labelScaleChangedWithSize();
	},
	_getBoundingWidth: function () {
		return this._textAreaSize.width;
	},
	_getBoundingHeight: function () {
		return this._textAreaSize.height;
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
     * Return Horizontal Alignment of label
     * @returns {TEXT_ALIGNMENT_LEFT|TEXT_ALIGNMENT_CENTER|TEXT_ALIGNMENT_RIGHT}
     */
    getTextHorizontalAlignment:function(){
        return this._textHorizontalAlignment;
    },

    /**
     * Set Vertical Alignment of label
     * @param {cc.VERTICAL_TEXT_ALIGNMENT_TOP|cc.VERTICAL_TEXT_ALIGNMENT_CENTER|cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM} verticalAlignment
     */
    setTextVerticalAlignment: function (alignment) {
        this._textVerticalAlignment = alignment;
        this._labelRenderer.setVerticalAlignment(alignment);
        this.labelScaleChangedWithSize();
    },

    /**
     * Get text vertical alignment.
     * @returns {VERTICAL_TEXT_ALIGNMENT_TOP|VERTICAL_TEXT_ALIGNMENT_CENTER|VERTICAL_TEXT_ALIGNMENT_BOTTOM}
     */
    getTextVerticalAlignment:function(){
        return this._textVerticalAlignment;
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
        this.touchScaleEnabled = enable;
    },

    /**
     * Gets the touch scale enabled of label.
     * @returns {Boolean}
     */
    isTouchScaleChangeEnabled: function () {
        return this.touchScaleEnabled;
    },

    onPressStateChangedToNormal: function () {
        if (!this.touchScaleEnabled) {
            return;
        }
        this._labelRenderer.setScaleX(this._normalScaleValueX);
        this._labelRenderer.setScaleY(this._normalScaleValueY);
    },

    onPressStateChangedToPressed: function () {
        if (!this.touchScaleEnabled) {
            return;
        }
        this._labelRenderer.setScaleX(this._normalScaleValueX + this._onSelectedScaleOffset);
        this._labelRenderer.setScaleY(this._normalScaleValueY + this._onSelectedScaleOffset);
    },

    onPressStateChangedToDisabled: function () {

    },

    /**
     * set scale
     * @param {Number} scale
     */
    setScale: function (scale) {
        ccs.Widget.prototype.setScale.call(this, scale);
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
        if(y === undefined){
	        ccs.Widget.prototype.setAnchorPoint.call(this, point);
	        this._labelRenderer.setAnchorPoint(point);
        } else {
	        ccs.Widget.prototype.setAnchorPoint.call(this, point, y);
	        this._labelRenderer.setAnchorPoint(point, y);
        }
    },
	_setAnchorX: function (value) {
		ccs.Widget.prototype._setAnchorX.call(this, value);
		this._labelRenderer._setAnchorX(value);
	},
	_setAnchorY: function (value) {
		ccs.Widget.prototype._setAnchorY.call(this, value);
		this._labelRenderer._setAnchorY(value);
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
	_getWidth: function () {
		return this._labelRenderer._getWidth();
	},
	_getHeight: function () {
		return this._labelRenderer._getHeight();
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
            this._normalScaleValueX = this._normalScaleValueY = 1;
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
            this._normalScaleValueX = scaleX;
            this._normalScaleValueY = scaleY;
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
        this.setTouchScaleChangeEnabled(uiLabel.touchScaleEnabled);
        this.setTextAreaSize(uiLabel._size);
        this.setTextHorizontalAlignment(uiLabel._textHorizontalAlignment);
        this.setTextVerticalAlignment(uiLabel._textVerticalAlignment);
    }
});

window._proto = ccs.Label.prototype;

// Extended properties
cc.defineGetterSetter(_proto, "boundingWidth", _proto._getBoundingWidth, _proto._setBoundingWidth);
cc.defineGetterSetter(_proto, "boundingHeight", _proto._getBoundingHeight, _proto._setBoundingHeight);
cc.defineGetterSetter(_proto, "string", _proto.getStringValue, _proto.setText);
cc.defineGetterSetter(_proto, "stringLength", _proto.getStringLength);
cc.defineGetterSetter(_proto, "font", _proto._getFont, _proto._setFont);
cc.defineGetterSetter(_proto, "fontSize", _proto.getFontSize, _proto.setFontSize);
cc.defineGetterSetter(_proto, "fontName", _proto.getFontName, _proto.setFontName);
cc.defineGetterSetter(_proto, "textAlign", _proto.getTextHorizontalAlignment, _proto.setTextHorizontalAlignment);
cc.defineGetterSetter(_proto, "verticalAlign", _proto.getTextVerticalAlignment, _proto.setTextVerticalAlignment);

delete window._proto;

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
