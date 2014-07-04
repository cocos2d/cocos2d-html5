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
ccui.Text = ccui.Widget.extend(/** @lends ccui.Text# */{
    _touchScaleChangeEnabled: false,
    _normalScaleValueX: 1,
    _normalScaleValueY: 1,
    _fontName: "Thonburi",
    _fontSize: 10,
    _onSelectedScaleOffset:0.5,
    _labelRenderer: "",
    _textAreaSize: null,
    _textVerticalAlignment: 0,
    _textHorizontalAlignment: 0,
    _className: "Text",
    _type: null,
    _labelRendererAdaptDirty: true,

    /**
     * allocates and initializes a UILabel.
     * Constructor of ccui.Text
     * @example
     * // example
     * var uiLabel = new ccui.Text();
     */
    ctor: function () {
        this._type = ccui.Text.Type.SYSTEM;
        this._textAreaSize = cc.size(0, 0);
        ccui.Widget.prototype.ctor.call(this);
    },

    init: function (textContent, fontName, fontSize) {
        if (ccui.Widget.prototype.init.call(this)) {
            if(arguments.length > 0){
                this.setString(textContent);
                this.setFontName(fontName);
                this.setFontSize(fontSize);
            }
            return true;
        }
        return false;
    },

    initRenderer: function () {
        this._labelRenderer = cc.LabelTTF.create();
        cc.Node.prototype.addChild.call(this, this._labelRenderer, ccui.Text.RENDERER_ZORDER, -1);
    },

    /**
     * Changes the  value of label.
     * @deprecated
     * @param {String} text
     */
    setText: function (text) {
        cc.log("Please use the setString");
        this.setString(text);
    },

    /**
     * Changes the  value of label.
     * @param {String} text
     */
    setString: function (text) {
        this._labelRenderer.setString(text);
//        this.labelScaleChangedWithSize();
        this._updateContentSizeWithTextureSize(this._labelRenderer.getContentSize());
        this._labelRendererAdaptDirty = true;
    },

    /**
     * Gets the string value of label.
     * @deprecated
     * @returns {String}
     */
    getStringValue: function () {
        cc.log("Please use the getString");
        return this._labelRenderer.getString();
    },

    /**
     * Gets the string value of label.
     * @returns {String}
     */
    getString: function () {
        return this._labelRenderer.getString();
    },

    /**
     * Gets the string length of label.
     * @returns {Number}
     */
    getStringLength: function () {
//        var str = this._labelRenderer.getString();
//        return str.length;
        return this._labelRenderer.getStringLength();
    },

    /**
     * set fontSize
     * @param {Number} size
     */
    setFontSize: function (size) {
        this._fontSize = size;
        this._labelRenderer.setFontSize(size);
//        this.labelScaleChangedWithSize();
//        var config = this._labelRenderer.getTTFConfig();
//        config.fontSize = size;
//        this._fontSize = size;
        this._updateContentSizeWithTextureSize(this._labelRenderer.getContentSize());
        this._labelRendererAdaptDirty = true;
    },

    /**
     * Get font Size
     * @returns {Number}
     */
    getFontSize: function () {
        return this._fontSize;
    },

    /**
     * Set font name
     * @return {String} name
     */
    setFontName: function (name) {
        this._fontName = name;
        this._labelRenderer.setFontName(name);
//        this.labelScaleChangedWithSize();
//        if(FileUtils::getInstance()->isFileExist(name))
//        {
//            TTFConfig config = _labelRenderer->getTTFConfig();
//            config.fontFilePath = name;
//            config.fontSize = _fontSize;
//            _labelRenderer->setTTFConfig(config);
//            _type = Type::TTF;
//        }
//        else{
//            _labelRenderer->setSystemFontName(name);
//            _type = Type::SYSTEM;
//        }
//        _fontName = name;
        this._updateContentSizeWithTextureSize(this._labelRenderer.getContentSize());
        this._labelRendererAdaptDirty = true;
    },

    /**
     * set textAreaSize
     * @param {cc.Size} size
     */
    setTextAreaSize: function (size) {
//        this._textAreaSize.width = size.width;
//        this._textAreaSize.height = size.height;
        this._labelRenderer.setDimensions(size);
//        this.labelScaleChangedWithSize();

        this._updateContentSizeWithTextureSize(this._labelRenderer.getContentSize());
        this._labelRendererAdaptDirty = true;
    },
    getTextAreaSize: function(){
        return this._labelRenderer.getDimensions();
    },

    /**
     * set Horizontal Alignment of cc.LabelTTF
     * @param {cc.TEXT_ALIGNMENT_LEFT|cc.TEXT_ALIGNMENT_CENTER|cc.TEXT_ALIGNMENT_RIGHT} alignment Horizontal Alignment
     */
    setTextHorizontalAlignment: function (alignment) {
//        this._textHorizontalAlignment = alignment;
        this._labelRenderer.setHorizontalAlignment(alignment);
//        this.labelScaleChangedWithSize();

        this._updateContentSizeWithTextureSize(this._labelRenderer.getContentSize());
        this._labelRendererAdaptDirty = true;
    },

    /**
     * Return Horizontal Alignment of label
     * @returns {TEXT_ALIGNMENT_LEFT|TEXT_ALIGNMENT_CENTER|TEXT_ALIGNMENT_RIGHT}
     */
    getTextHorizontalAlignment: function () {
        return this._labelRenderer.getHorizontalAlignment();
    },

    /**
     * Set Vertical Alignment of label
     * @param {cc.VERTICAL_TEXT_ALIGNMENT_TOP|cc.VERTICAL_TEXT_ALIGNMENT_CENTER|cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM} alignment
     */
    setTextVerticalAlignment: function (alignment) {
//        this._textVerticalAlignment = alignment;
        this._labelRenderer.setVerticalAlignment(alignment);
//        this.labelScaleChangedWithSize();
        this._updateContentSizeWithTextureSize(this._labelRenderer.getContentSize());
        this._labelRendererAdaptDirty = true;
    },

    /**
     * Get text vertical alignment.
     * @returns {VERTICAL_TEXT_ALIGNMENT_TOP|VERTICAL_TEXT_ALIGNMENT_CENTER|VERTICAL_TEXT_ALIGNMENT_BOTTOM}
     */
    getTextVerticalAlignment: function () {
        return this._labelRenderer.getVerticalAlignment();
    },

    /**
     * Sets the touch scale enabled of label.
     * @param {Boolean} enable
     */
    setTouchScaleChangeEnabled: function (enable) {
        this._touchScaleChangeEnabled = enable;
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
        this._labelRenderer.setScaleX(this._normalScaleValueX);
        this._labelRenderer.setScaleY(this._normalScaleValueY);
    },

    onPressStateChangedToPressed: function () {
        if (!this._touchScaleChangeEnabled) {
            return;
        }
        this._labelRenderer.setScaleX(this._normalScaleValueX + this._onSelectedScaleOffset);
        this._labelRenderer.setScaleY(this._normalScaleValueY + this._onSelectedScaleOffset);
    },

    onPressStateChangedToDisabled: function () {

    },

    updateFlippedX: function () {

        if (this._flippedX)
        {
            this._labelRenderer.setScaleX(-1.0);
        }
        else
        {
            this._labelRenderer.setScaleX(1.0);
        }
    },

    onSizeChanged: function () {
        ccui.Widget.prototype.onSizeChanged.call(this);
//        this.labelScaleChangedWithSize();
        this._labelRendererAdaptDirty = true;
    },

    adaptRenderers: function(){
        if (this._labelRendererAdaptDirty)
        {
            this.labelScaleChangedWithSize();
            this._labelRendererAdaptDirty = false;
        }
    },

    getVirtualRendererSize: function(){
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
            //this._labelRenderer.setDimensions(cc.size(0, 0));
            this._labelRenderer.setScale(1.0);
            this._normalScaleValueX = this._normalScaleValueY = 1;
        } else {
            this._labelRenderer.setDimensions(cc.size(this._contentSize.width, this._contentSize.height));
            var textureSize = this._labelRenderer.getContentSize();
            if (textureSize.width <= 0.0 || textureSize.height <= 0.0) {
                this._labelRenderer.setScale(1.0);
                return;
            }
            var scaleX = this._contentSize.width / textureSize.width;
            var scaleY = this._contentSize.height / textureSize.height;
            this._labelRenderer.setScaleX(scaleX);
            this._labelRenderer.setScaleY(scaleY);
            this._normalScaleValueX = scaleX;
            this._normalScaleValueY = scaleY;
        }
        this._labelRenderer.setPosition(this._contentSize.width / 2.0, this._contentSize.height / 2.0);
    },

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "Label";
    },

    enableShadow: function(shadowColor, offset, blurRadius){
        this._labelRenderer.enableShadow(shadowColor, offset, blurRadius);
    },

    enableOutline: function(outlineColor, outlineSize){
        this._labelRenderer.enableOutline(outlineColor, outlineSize);
    },

    enableGlow: function(glowColor){
        if (this._type == ccui.Text.Type.TTF)
            this._labelRenderer.enableGlow(glowColor);
    },

    disableEffect: function(){
        this._labelRenderer.disableEffect();
    },

    createCloneInstance: function () {
        return ccui.Text.create();
    },

    /**
     * Get font name
     * @returns {string}
     */
    getFontName: function () {
        return this._fontName;
    },

    getType: function(){
        return  this._type;
    },

    _setFont: function (font) {
        var res = cc.LabelTTF._fontStyleRE.exec(font);
        if (res) {
            this._fontSize = parseInt(res[1]);
            this._fontName = res[2];
            this._labelRenderer._setFont(font);
            this.labelScaleChangedWithSize();
        }
    },
    _getFont: function () {
        return this._labelRenderer._getFont();
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
//
//    /**
//     * Gets the touch scale enabled of label.
//     * @returns {Boolean}
//     */
//    getTouchScaleChangeAble: function () {
//        return this.isTouchScaleChangeEnabled();
//    },
//
//    updateFlippedY: function () {
//        this._labelRenderer.setFlippedY(this._flippedY);
//    },
//
//    /**
//     * override "setAnchorPoint" of widget.
//     * @param {cc.Point|Number} point The anchor point of UILabel or The anchor point.x of UILabel.
//     * @param {Number} [y] The anchor point.y of UILabel.
//     */
//    setAnchorPoint: function (point, y) {
//        if (y === undefined) {
//            ccui.Widget.prototype.setAnchorPoint.call(this, point);
//            this._labelRenderer.setAnchorPoint(point);
//        } else {
//            ccui.Widget.prototype.setAnchorPoint.call(this, point, y);
//            this._labelRenderer.setAnchorPoint(point, y);
//        }
//    },
//    _setAnchorX: function (value) {
//        ccui.Widget.prototype._setAnchorX.call(this, value);
//        this._labelRenderer._setAnchorX(value);
//    },
//    _setAnchorY: function (value) {
//        ccui.Widget.prototype._setAnchorY.call(this, value);
//        this._labelRenderer._setAnchorY(value);
//    },
//
//    /**
//     * override "getContentSize" method of widget.
//     * @returns {cc.Size}
//     */
//    getContentSize: function () {
//        return this._labelRenderer.getContentSize();
//    },
//    _getWidth: function () {
//        return this._labelRenderer._getWidth();
//    },
//    _getHeight: function () {
//        return this._labelRenderer._getHeight();
//    },
//
//    updateTextureColor: function () {
//        this.updateColorToRenderer(this._labelRenderer);
//    },
//
//    updateTextureOpacity: function () {
//        this.updateOpacityToRenderer(this._labelRenderer);
//    },
//
    copySpecialProperties: function (uiLabel) {
        if(uiLabel instanceof uiLabel){
            this.setFontName(uiLabel._fontName);
            this.setFontSize(uiLabel.getFontSize());
            this.setString(uiLabel.getString());
            this.setTouchScaleChangeEnabled(uiLabel.touchScaleEnabled);
            this.setTextAreaSize(uiLabel._textAreaSize);
            this.setTextHorizontalAlignment(uiLabel._labelRenderer.getHorizontalAlignment());
            this.setTextVerticalAlignment(uiLabel._labelRenderer.getVerticalAlignment());
        }
    }
});

var _p = ccui.Text.prototype;

// Extended properties
/** @expose */
_p.boundingWidth;
cc.defineGetterSetter(_p, "boundingWidth", _p._getBoundingWidth, _p._setBoundingWidth);
/** @expose */
_p.boundingHeight;
cc.defineGetterSetter(_p, "boundingHeight", _p._getBoundingHeight, _p._setBoundingHeight);
/** @expose */
_p.string;
cc.defineGetterSetter(_p, "string", _p.getString, _p.setString);
/** @expose */
_p.stringLength;
cc.defineGetterSetter(_p, "stringLength", _p.getStringLength);
/** @expose */
_p.font;
cc.defineGetterSetter(_p, "font", _p._getFont, _p._setFont);
/** @expose */
_p.fontSize;
cc.defineGetterSetter(_p, "fontSize", _p.getFontSize, _p.setFontSize);
/** @expose */
_p.fontName;
cc.defineGetterSetter(_p, "fontName", _p.getFontName, _p.setFontName);
/** @expose */
_p.textAlign;
cc.defineGetterSetter(_p, "textAlign", _p.getTextHorizontalAlignment, _p.setTextHorizontalAlignment);
/** @expose */
_p.verticalAlign;
cc.defineGetterSetter(_p, "verticalAlign", _p.getTextVerticalAlignment, _p.setTextVerticalAlignment);

_p = null;

/**
 * allocates and initializes a UILabel.
 * @constructs
 * @return {ccui.Text}
 * @example
 * // example
 * var uiLabel = ccui.Text.create();
 */
ccui.Label = ccui.Text.create = function (textContent, fontName, fontSize) {
    var widget = new ccui.Text();
    if(arguments.length > 0){
        if (widget && widget.init(textContent, fontName, fontSize))
        {
            return widget;
        }
    }else{
        if (widget && widget.init())
        {
            return widget;
        }
    }
    return null;
};

ccui.Text.RENDERER_ZORDER = -1;


ccui.Text.Type = {
    SYSTEM: 0,
    TTF: 1
};