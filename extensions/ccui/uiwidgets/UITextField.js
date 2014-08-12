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
 * Base class for ccui.UICCTextField
 * @class
 * @extends cc.TextFieldTTF
 *
 * @property {Boolean}  maxLengthEnabled    - Indicate whether max length limit is enabled
 * @property {Number}   maxLength           - The max length of the text field
 * @property {Boolean}  passwordEnabled     - Indicate whether the text field is for entering password
 */
ccui.UICCTextField = cc.TextFieldTTF.extend(/** @lends ccui.UICCTextField# */{
    _maxLengthEnabled: false,
    _maxLength: 0,
    _passwordEnabled: false,
    _passwordStyleText: "",
    _attachWithIME: false,
    _detachWithIME: false,
    _insertText: false,
    _deleteBackward: false,
    _className: "UICCTextField",
    _textFieldRendererAdaptDirty: true,

    ctor: function () {
        cc.TextFieldTTF.prototype.ctor.call(this);
        this._maxLengthEnabled = false;
        this._maxLength = 0;
        this._passwordEnabled = false;
        this._passwordStyleText = "*";
        this._attachWithIME = false;
        this._detachWithIME = false;
        this._insertText = false;
        this._deleteBackward = false;
    },

    onEnter: function () {
        cc.TextFieldTTF.prototype.onEnter.call(this);
        cc.TextFieldTTF.prototype.setDelegate.call(this, this);
    },

    //CCTextFieldDelegate
    onTextFieldAttachWithIME: function (sender) {
        this.setAttachWithIME(true);
        return false;
    },

    onTextFieldInsertText: function (sender, text, len) {
        if (len == 1 && text == "\n")
            return false;

        this.setInsertText(true);
        return (this._maxLengthEnabled) && (cc.TextFieldTTF.prototype.getCharCount.call(this) >= this._maxLength);
    },

    onTextFieldDeleteBackward: function (sender, delText, nLen) {
        this.setDeleteBackward(true);
        return false;
    },

    onTextFieldDetachWithIME: function (sender) {
        this.setDetachWithIME(true);
        return false;
    },

    insertText: function (text, len) {
        var input_text = text;

        if (text != "\n"){
            if (this._maxLengthEnabled){
                var text_count = this.getString().length;
                if (text_count >= this._maxLength){
                    // password
                    if (this._passwordEnabled)
                        this.setPasswordText(this.getString());
                    return;
                }
            }
        }
        cc.TextFieldTTF.prototype.insertText.call(this, input_text, len);

        // password
        if (this._passwordEnabled && cc.TextFieldTTF.prototype.getCharCount.call(this) > 0)
            this.setPasswordText(this.getString());
    },

    deleteBackward: function () {
        cc.TextFieldTTF.prototype.deleteBackward.call(this);

        if (cc.TextFieldTTF.prototype.getCharCount.call(this) > 0 && this._passwordEnabled)
            this.setPasswordText(this._inputText);
    },

    openIME: function () {
        cc.TextFieldTTF.prototype.attachWithIME.call(this);
    },

    closeIME: function () {
        cc.TextFieldTTF.prototype.detachWithIME.call(this);
    },

    setMaxLengthEnabled: function (enable) {
        this._maxLengthEnabled = enable;
    },

    isMaxLengthEnabled: function () {
        return this._maxLengthEnabled;
    },

    setMaxLength: function (length) {
        this._maxLength = length;
    },

    getMaxLength: function () {
        return this._maxLength;
    },

    getCharCount: function () {
        return cc.TextFieldTTF.prototype.getCharCount.call(this);
    },

    setPasswordEnabled: function (enable) {
        this._passwordEnabled = enable;
    },

    isPasswordEnabled: function () {
        return this._passwordEnabled;
    },

    setPasswordStyleText: function (styleText) {
        if (styleText.length > 1)
            return;
        var header = styleText.charCodeAt(0);
        if (header < 33 || header > 126)
            return;
        this._passwordStyleText = styleText;
    },

    setPasswordText: function (text) {
        var tempStr = "";
        var text_count = text.length;
        var max = text_count;

        if (this._maxLengthEnabled && text_count > this._maxLength)
            max = this._maxLength;

        for (var i = 0; i < max; ++i)
            tempStr += this._passwordStyleText;

        cc.LabelTTF.prototype.setString.call(this, tempStr);
    },

    setAttachWithIME: function (attach) {
        this._attachWithIME = attach;
    },

    getAttachWithIME: function () {
        return this._attachWithIME;
    },

    setDetachWithIME: function (detach) {
        this._detachWithIME = detach;
    },

    getDetachWithIME: function () {
        return this._detachWithIME;
    },

    setInsertText: function (insert) {
        this._insertText = insert;
    },

    getInsertText: function () {
        return this._insertText;
    },

    setDeleteBackward: function (deleteBackward) {
        this._deleteBackward = deleteBackward;
    },

    getDeleteBackward: function () {
        return this._deleteBackward;
    },

    init: function () {
        if (ccui.Widget.prototype.init.call(this)) {
            this.setTouchEnabled(true);
            return true;
        }
        return false;
    },

    onDraw: function (sender) {
        return false;
    }
});

ccui.UICCTextField.create = function (placeholder, fontName, fontSize) {
    var ret = new ccui.UICCTextField();
    if (ret && ret.initWithString("", fontName, fontSize)) {
        if (placeholder)
            ret.setPlaceHolder(placeholder);
        return ret;
    }
    return null;
};

/**
 * Base class for ccui.TextField
 * @class
 * @extends ccui.Widget
 *
 * @property {String}   string              - The content string of the label
 * @property {Number}   placeHolder         - The place holder of the text field
 * @property {String}   font                - The text field font with a style string: e.g. "18px Verdana"
 * @property {String}   fontName            - The text field font name
 * @property {Number}   fontSize            - The text field font size
 * @property {Boolean}  maxLengthEnabled    - Indicate whether max length limit is enabled
 * @property {Number}   maxLength           - The max length of the text field
 * @property {Boolean}  passwordEnabled     - Indicate whether the text field is for entering password
 */
ccui.TextField = ccui.Widget.extend(/** @lends ccui.TextField# */{
    _textFieldRenderer: null,
    _touchWidth: 0,
    _touchHeight: 0,
    _useTouchArea: false,
    _textFieldEventListener: null,
    _textFieldEventSelector: null,
    _passwordStyleText: "",
    _textFieldRendererAdaptDirty: true,
    _fontName: "",
    _fontSize: 12,

    /**
     * allocates and initializes a UITextField.
     * Constructor of ccui.TextField
     * @example
     * // example
     * var uiTextField = new ccui.TextField();
     */
    ctor: function () {
        ccui.Widget.prototype.ctor.call(this);
    },

    init: function(){
        if(ccui.Widget.prototype.init.call(this)){
            this.setTouchEnabled(true);
            return true;
        }
        return false;
    },

    onEnter: function () {
        ccui.Widget.prototype.onEnter.call(this);
        this.scheduleUpdate();
    },

    _initRenderer: function () {
        this._textFieldRenderer = ccui.UICCTextField.create("input words here", "Thonburi", 20);
        this.addProtectedChild(this._textFieldRenderer, ccui.TextField.RENDERER_ZORDER, -1);
    },

    /**
     * Set touch size
     * @param {cc.Size} size
     */
    setTouchSize: function (size) {
        this._touchWidth = size.width;
        this._touchHeight = size.height;
    },

    setTouchAreaEnabled: function(enable){
        this._useTouchArea = enable;
    },

    hitTest: function(pt){
        if (this._useTouchArea) {
            var nsp = this.convertToNodeSpace(pt);
            var bb = cc.rect(
                -this._touchWidth * this._anchorPoint.x,
                -this._touchHeight * this._anchorPoint.y,
                this._touchWidth, this._touchHeight
            );

            return ( nsp.x >= bb.x && nsp.x <= bb.x + bb.width &&
                nsp.y >= bb.y && nsp.y <= bb.y + bb.height );
        } else
            return ccui.Widget.prototype.hitTest.call(this, pt);
    },

    /**
     * Get touch size.
     * @returns {cc.Size}
     */
    getTouchSize: function () {
        return cc.size(this._touchWidth, this._touchHeight);
    },

    /**
     *  Changes the string value of textField.
     * @deprecated
     * @param {String} text
     */
    setText: function (text) {
        cc.log("Please use the setString");
        this.setString(text);
    },

    /**
     *  Changes the string value of textField.
     * @param {String} text
     */
    setString: function (text) {
        if (!text) {
            return;
        }
        text = String(text);
        if (this.isMaxLengthEnabled()) {
            text = text.substr(0, this.getMaxLength());
        }
        if (this.isPasswordEnabled()) {
            this._textFieldRenderer.setPasswordText(text);
            this._textFieldRenderer.setString("");
            this._textFieldRenderer.insertText(text, text.length);
        } else {
            this._textFieldRenderer.setString(text);
        }
        this._textFieldRendererAdaptDirty = true;
        this._updateContentSizeWithTextureSize(this._textFieldRenderer.getContentSize());
    },

    /**
     * @param {String} value
     */
    setPlaceHolder: function (value) {
        this._textFieldRenderer.setPlaceHolder(value);
        this._textFieldRendererAdaptDirty = true;
        this._updateContentSizeWithTextureSize(this._textFieldRenderer.getContentSize());
    },

    /**
     * @returns {String}
     */
    getPlaceHolder: function () {
        return this._textFieldRenderer.getPlaceHolder();
    },

    /**
     * Set font size for text field content
     * @param {Number} size
     */
    setFontSize: function (size) {
        this._textFieldRenderer.setFontSize(size);
        this._fontSize = size;
        this._textFieldRendererAdaptDirty = true;
        this._updateContentSizeWithTextureSize(this._textFieldRenderer.getContentSize());
    },

    /**
     * Get font size for text field content
     * @return {Number} size
     */
    getFontSize: function () {
        return this._fontSize;
    },

    /**
     * Set font name for text field content
     * @param {String} name
     */
    setFontName: function (name) {
        this._textFieldRenderer.setFontName(name);
        this._fontName = name;
        this._textFieldRendererAdaptDirty = true;
        this._updateContentSizeWithTextureSize(this._textFieldRenderer.getContentSize());
    },

    /**
     * Get font name for text field content
     * @return {String} font name
     */
    getFontName: function () {
        return this._fontName;
    },

    /**
     * detach with IME
     */
    didNotSelectSelf: function () {
        this._textFieldRenderer.detachWithIME();
    },

    /**
     * get textField string value
     * @deprecated
     * @returns {String}
     */
    getStringValue: function () {
        cc.log("Please use the getString");
        return this.getString();
    },

    /**
     * get textField string value
     * @returns {String}
     */
    getString: function () {
        return this._textFieldRenderer.getString();
    },

    getStringLength: function(){
        return this._textFieldRenderer.getStringLength();
    },

    /**
     * touch began
     * @param {cc.Point} touchPoint
     */
    onTouchBegan: function (touchPoint, unusedEvent) {
        var self = this;
        var pass = ccui.Widget.prototype.onTouchBegan.call(self, touchPoint, unusedEvent);
        if (self._hit) {
            setTimeout(function(){
                self._textFieldRenderer.attachWithIME();
            }, 0);
        }
        return pass;
    },

    /**
     * @param {Boolean} enable
     */
    setMaxLengthEnabled: function (enable) {
        this._textFieldRenderer.setMaxLengthEnabled(enable);
    },

    /**
     * @returns {Boolean}
     */
    isMaxLengthEnabled: function () {
        return this._textFieldRenderer.isMaxLengthEnabled();
    },

    /**
     * @param {number} length
     */
    setMaxLength: function (length) {
        this._textFieldRenderer.setMaxLength(length);
        this.setString(this.getString());
    },

    /**
     * @returns {number} length
     */
    getMaxLength: function () {
        return this._textFieldRenderer.getMaxLength();
    },

    /**
     * @param {Boolean} enable
     */
    setPasswordEnabled: function (enable) {
        this._textFieldRenderer.setPasswordEnabled(enable);
    },

    /**
     * @returns {Boolean}
     */
    isPasswordEnabled: function () {
        return this._textFieldRenderer.isPasswordEnabled();
    },

    setPasswordStyleText: function(styleText){
        this._textFieldRenderer.setPasswordStyleText(styleText);
        this._passwordStyleText = styleText;

        this.setString(this.getString());
    },

    /**
     * @returns {String}
     */
    getPasswordStyleText: function () {
        return this._passwordStyleText;
    },

    update: function (dt) {
        if (this.getAttachWithIME()) {
            this._attachWithIMEEvent();
            this.setAttachWithIME(false);
        }
        if (this.getDetachWithIME()) {
            this._detachWithIMEEvent();
            this.setDetachWithIME(false);
        }
        if (this.getInsertText()) {
            this._insertTextEvent();
            this.setInsertText(false);

            this._textFieldRendererAdaptDirty = true;
            this._updateContentSizeWithTextureSize(this._textFieldRenderer.getContentSize());
        }
        if (this.getDeleteBackward()) {
            this._deleteBackwardEvent();
            this.setDeleteBackward(false);

            this._textFieldRendererAdaptDirty = true;
            this._updateContentSizeWithTextureSize(this._textFieldRenderer.getContentSize());
        }
    },

    /**
     * get whether attach with IME.
     * @returns {Boolean}
     */
    getAttachWithIME: function () {
        return this._textFieldRenderer.getAttachWithIME();
    },

    /**
     * set attach with IME.
     * @param {Boolean} attach
     */
    setAttachWithIME: function (attach) {
        this._textFieldRenderer.setAttachWithIME(attach);
    },

    /**
     * get whether eetach with IME.
     * @returns {Boolean}
     */
    getDetachWithIME: function () {
        return this._textFieldRenderer.getDetachWithIME();
    },

    /**
     * set detach with IME.
     * @param {Boolean} detach
     */
    setDetachWithIME: function (detach) {
        this._textFieldRenderer.setDetachWithIME(detach);
    },

    /**
     * get insertText
     * @returns {String}
     */
    getInsertText: function () {
        return this._textFieldRenderer.getInsertText();
    },

    /**
     * set insertText
     * @param {String} insertText
     */
    setInsertText: function (insertText) {
        this._textFieldRenderer.setInsertText(insertText);
    },

    /**
     * @returns {Boolean}
     */
    getDeleteBackward: function () {
        return this._textFieldRenderer.getDeleteBackward();
    },

    /**
     * @param {Boolean} deleteBackward
     */
    setDeleteBackward: function (deleteBackward) {
        this._textFieldRenderer.setDeleteBackward(deleteBackward);
    },

    _attachWithIMEEvent: function () {
        if (this._textFieldEventListener && this._textFieldEventSelector)
            this._textFieldEventSelector.call(this._textFieldEventListener, this, ccui.TextField.EVENT_ATTACH_WITH_IME);
        if (this._eventCallback)
            this._eventCallback(this, ccui.TextField.EVENT_ATTACH_WITH_IME);
    },

    _detachWithIMEEvent: function () {
        if (this._textFieldEventListener && this._textFieldEventSelector)
            this._textFieldEventSelector.call(this._textFieldEventListener, this, ccui.TextField.EVENT_DETACH_WITH_IME);
        if (this._eventCallback)
            this._eventCallback(this, ccui.TextField.EVENT_DETACH_WITH_IME);
    },

    _insertTextEvent: function () {
        if (this._textFieldEventListener && this._textFieldEventSelector)
            this._textFieldEventSelector.call(this._textFieldEventListener, this, ccui.TextField.EVENT_INSERT_TEXT);
        if (this._eventCallback)
            this._eventCallback(this, ccui.TextField.EVENT_INSERT_TEXT);
    },

    _deleteBackwardEvent: function () {
        if (this._textFieldEventListener && this._textFieldEventSelector)
            this._textFieldEventSelector.call(this._textFieldEventListener, this, ccui.TextField.EVENT_DELETE_BACKWARD);
        if (this._eventCallback)
            this._eventCallback(this, ccui.TextField.EVENT_DELETE_BACKWARD);
    },

    /**
     * add event listener
     * @param {Object} target
     * @param {Function} selector
     * @deprecated
     */
    addEventListenerTextField: function (selector, target) {
        this._textFieldEventSelector = selector;
        this._textFieldEventListener = target;
    },

    addEventListener: function(callback){
        this._eventCallback = callback;
    },

    _onSizeChanged: function () {
        ccui.Widget.prototype._onSizeChanged.call(this);
        this._textFieldRendererAdaptDirty = true;
    },

    _adaptRenderers: function(){
        if (this._textFieldRendererAdaptDirty) {
            this._textfieldRendererScaleChangedWithSize();
            this._textFieldRendererAdaptDirty = false;
        }
    },

    _textfieldRendererScaleChangedWithSize: function () {
        if (!this._ignoreSize)
            this._textFieldRenderer.setDimensions(this._contentSize);
        this._textFieldRenderer.setPosition(this._contentSize.width / 2, this._contentSize.height / 2);
    },

    getVirtualRendererSize: function(){
        return this._textFieldRenderer.getContentSize();
    },

    /**
     * override "getContentSize" method of widget.
     * @returns {cc.Node}
     */
    getVirtualRenderer: function () {
        return this._textFieldRenderer;
    },

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "TextField";
    },

    attachWithIME: function () {
        this._textFieldRenderer.attachWithIME();
    },

    _createCloneInstance: function () {
        return ccui.TextField.create();
    },

    _copySpecialProperties: function (textField) {
        this.setString(textField._textFieldRenderer.getString());
        this.setPlaceHolder(textField.getString());
        this.setFontSize(textField._textFieldRenderer.getFontSize());
        this.setFontName(textField._textFieldRenderer.getFontName());
        this.setMaxLengthEnabled(textField.isMaxLengthEnabled());
        this.setMaxLength(textField.getMaxLength());
        this.setPasswordEnabled(textField.isPasswordEnabled());
        this.setPasswordStyleText(textField._passwordStyleText);
        this.setAttachWithIME(textField.getAttachWithIME());
        this.setDetachWithIME(textField.getDetachWithIME());
        this.setInsertText(textField.getInsertText());
        this.setDeleteBackward(textField.getDeleteBackward());
    },

    setTextAreaSize: function(size){
        this.setContentSize(size);
    },

    setTextHorizontalAlignment: function(alignment){
        this._textFieldRenderer.setHorizontalAlignment(alignment);
    },

    setTextVerticalAlignment: function(alignment){
        this._textFieldRenderer.setVerticalAlignment(alignment);
    },
    _setFont: function (font) {
        this._textFieldRender._setFont(font);
        this._textFieldRendererAdaptDirty = true;
    },

    _getFont: function () {
        return this._textFieldRender._getFont();
    }
});

ccui.TextField.create = function(placeholder, fontName, fontSize){
    var widget = new ccui.TextField();
    if (widget && widget.init()) {
        if(placeholder && fontName && fontSize){
            widget.setPlaceHolder(placeholder);
            widget.setFontName(fontName);
            widget.setFontSize(fontSize);
        }
        return widget;
    }
    return null;

};

var _p = ccui.TextField.prototype;

// Extended properties
/** @expose */
_p.string;
cc.defineGetterSetter(_p, "string", _p.getString, _p.setString);
/** @expose */
_p.placeHolder;
cc.defineGetterSetter(_p, "placeHolder", _p.getPlaceHolder, _p.setPlaceHolder);
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
_p.maxLengthEnabled;
cc.defineGetterSetter(_p, "maxLengthEnabled", _p.isMaxLengthEnabled, _p.setMaxLengthEnabled);
/** @expose */
_p.maxLength;
cc.defineGetterSetter(_p, "maxLength", _p.getMaxLength, _p.setMaxLength);
/** @expose */
_p.passwordEnabled;
cc.defineGetterSetter(_p, "passwordEnabled", _p.isPasswordEnabled, _p.setPasswordEnabled);

_p = null;

/**
 * allocates and initializes a UITextField.
 * @deprecated
 * @return {ccui.TextField}
 * @example
 * // example
 * var uiTextField = ccui.TextField.create();
 */
ccui.TextField.create = function () {
    return new ccui.TextField();
};

// Constants
//TextField event
ccui.TextField.EVENT_ATTACH_WITH_IME = 0;
ccui.TextField.EVENT_DETACH_WITH_IME = 1;
ccui.TextField.EVENT_INSERT_TEXT = 2;
ccui.TextField.EVENT_DELETE_BACKWARD = 3;

ccui.TextField.RENDERER_ZORDER = -1;