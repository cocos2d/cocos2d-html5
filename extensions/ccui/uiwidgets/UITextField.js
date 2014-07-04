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
    maxLengthEnabled: false,
    maxLength: 0,
    passwordEnabled: false,
    _passwordStyleText: "",
    _attachWithIME: false,
    _detachWithIME: false,
    _insertText: false,
    _deleteBackward: false,
    _className: "UICCTextField",
    _textFieldRendererAdaptDirty: true,
    ctor: function () {
        cc.TextFieldTTF.prototype.ctor.call(this);
        this.maxLengthEnabled = false;
        this.maxLength = 0;
        this.passwordEnabled = false;
        this._passwordStyleText = "*";
        this._attachWithIME = false;
        this._detachWithIME = false;
        this._insertText = false;
        this._deleteBackward = false;
    },
    onEnter: function () {
        cc.TextFieldTTF.prototype.setDelegate.call(this, this);
    },
    //CCTextFieldDelegate
    onTextFieldAttachWithIME: function (sender) {
        this.setAttachWithIME(true);
        return false;
    },
    onTextFieldInsertText: function (sender, text, len) {
        if (len == 1 && text == "\n") {
            return false;
        }
        this.setInsertText(true);
        if (this.maxLengthEnabled) {
            if (cc.TextFieldTTF.prototype.getCharCount.call(this) >= this.maxLength) {
                return true;
            }
        }

        return false;
    },
    onTextFieldDeleteBackward: function (sender, delText, nLen) {
        this.setDeleteBackward(true);
        return false;
    },
    onTextFieldDetachWithIME: function (sender) {
        this.setDetachWithIME(true);
        return false;
    },
    insertText: function (text, len) {        //todo need to delete
        var input_text = text;

        if (text != "\n")
        {
            if (this.maxLengthEnabled)
            {
                var text_count = this.getString().length;
                if (text_count >= this.maxLength)
                {
                    // password
                    if (this.passwordEnabled)
                    {
                        this.setPasswordText(this.getString());
                    }
                    return;
                }
            }
        }
        cc.TextFieldTTF.prototype.insertText.call(this, input_text, len);

        // password
        if (this.passwordEnabled)
        {
            if (cc.TextFieldTTF.prototype.getCharCount.call(this) > 0)
            {
                this.setPasswordText(this.getString());
            }
        }
    },
    deleteBackward: function () {
        cc.TextFieldTTF.prototype.deleteBackward.call(this);

        if (cc.TextFieldTTF.prototype.getCharCount.call(this) > 0) {
            // password
            if (this.passwordEnabled) {
                this.setPasswordText(this._inputText);
            }
        }
    },
    openIME: function () {
        cc.TextFieldTTF.prototype.attachWithIME.call(this);
    },
    closeIME: function () {
        cc.TextFieldTTF.prototype.detachWithIME.call(this);
    },
    setMaxLengthEnabled: function (enable) {
        this.maxLengthEnabled = enable;
    },
    isMaxLengthEnabled: function () {
        return this.maxLengthEnabled;
    },
    setMaxLength: function (length) {
        this.maxLength = length;
    },
    getMaxLength: function () {
        return this.maxLength;
    },
    getCharCount: function () {
        return cc.TextFieldTTF.prototype.getCharCount.call(this);
    },
    setPasswordEnabled: function (enable) {
        this.passwordEnabled = enable;
    },
    isPasswordEnabled: function () {
        return this.passwordEnabled;
    },
    setPasswordStyleText: function (styleText) {
        if (styleText.length > 1) {
            return;
        }
        var header = styleText.charCodeAt(0);
        if (header < 33 || header > 126) {
            return;
        }
        this._passwordStyleText = styleText;
    },
    setPasswordText: function (text) {
        var tempStr = "";
        var text_count = text.length;
        var max = text_count;

        if (this.maxLengthEnabled)
        {
            if (text_count > this.maxLength)
            {
                max = this.maxLength;
            }
        }

        for (var i = 0; i < max; ++i)
        {
            tempStr += this._passwordStyleText;
        }

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
        if (placeholder) {
            ret.setPlaceHolder(placeholder);
        }
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
    _textFieldRender: null,
    _touchWidth: 0,
    _touchHeight: 0,
    _useTouchArea: false,
    _textFieldEventListener: null,
    _textFieldEventSelector: null,
    _attachWithIMEListener: null,
    _detachWithIMEListener: null,
    _insertTextListener: null,
    _deleteBackwardListener: null,
    _attachWithIMESelector: null,
    _detachWithIMESelector: null,
    _insertTextSelector: null,
    _deleteBackwardSelector: null,
    _passwordStyleText: "",
    _textFieldRendererAdaptDirty: true,

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
        this.setUpdateEnabled(true);
    },

    onExit:function(){
        this.setUpdateEnabled(false);
        ccui.Layout.prototype.onExit.call(this);
    },

    initRenderer: function () {
        this._textFieldRender = ccui.UICCTextField.create("input words here", "Thonburi", 20);
        this.addProtectedChild(this._textFieldRender, ccui.TextField.RENDERER_ZORDER, -1);

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

    adaptRenderers: function(){
        if (this._textFieldRendererAdaptDirty)
        {
            this.textfieldRendererScaleChangedWithSize();
            this._textFieldRendererAdaptDirty = false;
        }
    },

    hitTest: function(pt){
        if (this._useTouchArea)
        {
            var nsp = this.convertToNodeSpace(pt);
            var bb = cc.rect(
                -this._touchWidth * this._anchorPoint.x,
                -this._touchHeight * this._anchorPoint.y,
                this._touchWidth, this._touchHeight
            );
            if (
                nsp.x >= bb.origin.x &&
                nsp.x <= bb.origin.x + bb.size.width &&
                nsp.y >= bb.origin.y &&
                nsp.y <= bb.origin.y + bb.size.height
            )
            {
                return true;
            }
        }
        else
        {
            return ccui.Widget.prototype.hitTest.call(this, pt);
        }

        return false;
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
            this._textFieldRender.setPasswordText(text);
            this._textFieldRender.setString("");
            this._textFieldRender.insertText(text, text.length);
        }
        else {
            this._textFieldRender.setString(text);
        }
        this._textFieldRendererAdaptDirty = true;
        this._updateContentSizeWithTextureSize(this._textFieldRender.getContentSize());
    },

    /**
     * @param {String} value
     */
    setPlaceHolder: function (value) {
        this._textFieldRender.setPlaceHolder(value);
        this._textFieldRendererAdaptDirty = true;
        this._updateContentSizeWithTextureSize(this._textFieldRender.getContentSize());
    },

    /**
     * @returns {String}
     */
    getPlaceHolder: function () {
        return this._textFieldRender.getPlaceHolder();
    },

    _setFont: function (font) {
        this._textFieldRender._setFont(font);
        this._textFieldRendererAdaptDirty = true;
    },

    _getFont: function () {
        return this._textFieldRender._getFont();
    },

    /**
     * Set font size for text field content
     * @param {cc.Size} size
     */
    setFontSize: function (size) {
        this._textFieldRender.setFontSize(size);
        this._textFieldRendererAdaptDirty = true;
        this._updateContentSizeWithTextureSize(this._textFieldRender.getContentSize());
    },

    /**
     * Get font size for text field content
     * @param {cc.Size} size
     */
    getFontSize: function () {
        return this._textFieldRender.getSystemFontSize();
    },

    /**
     * Set font name for text field content
     * @param {String} name
     */
    setFontName: function (name) {
        this._textFieldRender.setFontName(name);
        this._textFieldRendererAdaptDirty = true;
        this._updateContentSizeWithTextureSize(this._textFieldRender.getContentSize());

    },

    /**
     * Get font name for text field content
     * @param {cc.Size} size
     */
    getFontName: function () {
        return this._textFieldRender.getSystemFontName();
    },

    /**
     * detach with IME
     */
    didNotSelectSelf: function () {
        this._textFieldRender.detachWithIME();
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
        return this._textFieldRender.getString();
    },

    getStringLength: function(){
        return this._textFieldRender.getStringLength();
    },

    /**
     * touch began
     * @param {cc.Point} touchPoint
     */
    onTouchBegan: function (touchPoint, unusedEvent) {
        var self = this;
        var pass = ccui.Widget.prototype.onTouchBegan.call(self, touchPoint, unusedEvent);
        if (self._hitted)
        {
            setTimeout(function(){
                self._textFieldRender.attachWithIME();
            }, 0);
        }
        return pass;
    },

    /**
     * @param {Boolean} enable
     */
    setMaxLengthEnabled: function (enable) {
        this._textFieldRender.setMaxLengthEnabled(enable);
    },

    /**
     * @returns {Boolean}
     */
    isMaxLengthEnabled: function () {
        return this._textFieldRender.isMaxLengthEnabled();
    },

    /**
     * @param {number} length
     */
    setMaxLength: function (length) {
        this._textFieldRender.setMaxLength(length);

        this.setString(this.getString());
    },

    /**
     * @returns {number} length
     */
    getMaxLength: function () {
        return this._textFieldRender.getMaxLength();
    },

    /**
     * @param {Boolean} enable
     */
    setPasswordEnabled: function (enable) {
        this._textFieldRender.setPasswordEnabled(enable);
    },

    /**
     * @returns {Boolean}
     */
    isPasswordEnabled: function () {
        return this._textFieldRender.isPasswordEnabled();
    },

    /**
     * @param {String} enable
     */
    setPasswordStyleText: function (styleText) {
        this._textFieldRender.setPasswordStyleText(styleText);
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
            this.attachWithIMEEvent();
            this.setAttachWithIME(false);
        }
        if (this.getDetachWithIME()) {
            this.detachWithIMEEvent();
            this.setDetachWithIME(false);
        }
        if (this.getInsertText()) {
            this.insertTextEvent();
            this.setInsertText(false);

            this._textFieldRendererAdaptDirty = true;
            this._updateContentSizeWithTextureSize(this._textFieldRender.getContentSize());
        }
        if (this.getDeleteBackward()) {
            this.deleteBackwardEvent();
            this.setDeleteBackward(false);

            this._textFieldRendererAdaptDirty = true;
            this._updateContentSizeWithTextureSize(this._textFieldRender.getContentSize());
        }
    },

    /**
     * get whether attach with IME.
     * @returns {Boolean}
     */
    getAttachWithIME: function () {
        return this._textFieldRender.getAttachWithIME();
    },

    /**
     * set attach with IME.
     * @param {Boolean} attach
     */
    setAttachWithIME: function (attach) {
        this._textFieldRender.setAttachWithIME(attach);
    },

    /**
     * get whether eetach with IME.
     * @returns {Boolean}
     */
    getDetachWithIME: function () {
        return this._textFieldRender.getDetachWithIME();
    },

    /**
     * set detach with IME.
     * @param {Boolean} detach
     */
    setDetachWithIME: function (detach) {
        this._textFieldRender.setDetachWithIME(detach);
    },

    /**
     * get insertText
     * @returns {String}
     */
    getInsertText: function () {
        return this._textFieldRender.getInsertText();
    },

    /**
     * set insertText
     * @param {String} insertText
     */
    setInsertText: function (insertText) {
        this._textFieldRender.setInsertText(insertText);
    },

    /**
     * @returns {Boolean}
     */
    getDeleteBackward: function () {
        return this._textFieldRender.getDeleteBackward();
    },

    /**
     * @param {Boolean} deleteBackward
     */
    setDeleteBackward: function (deleteBackward) {
        this._textFieldRender.setDeleteBackward(deleteBackward);
    },

    attachWithIMEEvent: function () {
        if (this._textFieldEventListener && this._textFieldEventSelector) {
            this._textFieldEventSelector.call(this._textFieldEventListener, this, ccui.TextField.EVENT_ATTACH_WITH_ME);
        }
        if (this._eventCallback) {
            this._eventCallback(this, 0);
        }
    },

    detachWithIMEEvent: function () {
        if (this._textFieldEventListener && this._textFieldEventSelector) {
            this._textFieldEventSelector.call(this._textFieldEventListener, this, ccui.TextField.EVENT_DETACH_WITH_ME);
        }
        if (this._eventCallback) {
            this._eventCallback(this, 1);
        }
    },

    insertTextEvent: function () {
        if (this._textFieldEventListener && this._textFieldEventSelector) {
            this._textFieldEventSelector.call(this._textFieldEventListener, this, ccui.TextField.EVENT_INSERT_TEXT);
        }
        if (this._eventCallback) {
            this._eventCallback(this, 2);
        }
    },

    deleteBackwardEvent: function () {
        if (this._textFieldEventListener && this._textFieldEventSelector) {
            this._textFieldEventSelector.call(this._textFieldEventListener, this, ccui.TextField.EVENT_DELETE_BACKWARD);
        }
        if (this._eventCallback) {
            this._eventCallback(this, 3);
        }
    },

    /**
     * add event listener
     * @param {Function} selector
     * @param {Object} target
     */
    addEventListenerTextField: function (selector, target) {
        this._textFieldEventSelector = selector;
        this._textFieldEventListener = target;
    },

    /**
     * override "setAnchorPoint" of widget.
     * @param {cc.Point|Number} point The anchor point of UILabelBMFont or The anchor point.x of UILabelBMFont.
     * @param {Number} [y] The anchor point.y of UILabelBMFont.
     */
    setAnchorPoint: function (point, y) {
        if (y === undefined) {
            ccui.Widget.prototype.setAnchorPoint.call(this, point);
            this._textFieldRender.setAnchorPoint(point);
        } else {
            ccui.Widget.prototype.setAnchorPoint.call(this, point, y);
            this._textFieldRender.setAnchorPoint(point, y);
        }
    },
    _setAnchorX: function (value) {
        ccui.Widget.prototype._setAnchorX.call(this, value);
        this._textFieldRender._setAnchorX(value);
    },
    _setAnchorY: function (value) {
        ccui.Widget.prototype._setAnchorY.call(this, value);
        this._textFieldRender._setAnchorY(value);
    },

    onSizeChanged: function () {
        ccui.Widget.prototype.onSizeChanged.call(this);
        this._textFieldRendererAdaptDirty = true;
    },

    textfieldRendererScaleChangedWithSize: function () {
        if (this._ignoreSize) {
            this._textFieldRender.setScale(1.0);
            var rendererSize = this.getContentSize();
            this._size.width = rendererSize.width;
            this._size.height = rendererSize.height;
        }
        else {
            var textureSize = this.getContentSize();
            if (textureSize.width <= 0.0 || textureSize.height <= 0.0) {
                this._textFieldRender.setScale(1.0);
                return;
            }
            var scaleX = this._size.width / textureSize.width;
            var scaleY = this._size.height / textureSize.height;
            this._textFieldRender.setScaleX(scaleX);
            this._textFieldRender.setScaleY(scaleY);
        }
        this._textFieldRender.setPosition(this._contentSize.width / 2, this._contentSize.height / 2);
    },

    /**
     * override "getContentSize" method of widget.
     * @returns {cc.Size}
     */
    getContentSize: function () {
        return this._textFieldRender.getContentSize();
    },
    _getWidth: function () {
        return this._textFieldRender._getWidth();
    },
    _getHeight: function () {
        return this._textFieldRender._getHeight();
    },

    /**
     * override "getContentSize" method of widget.
     * @returns {cc.Node}
     */
    getVirtualRenderer: function () {
        return this._textFieldRender;
    },

    updateTextureColor: function () {
        this.updateColorToRenderer(this._textFieldRender);
    },

    updateTextureOpacity: function () {
        this.updateOpacityToRenderer(this._textFieldRender);
    },

    /**
     * Returns the "class name" of widget.
     * @returns {string}
     */
    getDescription: function () {
        return "TextField";
    },

    attachWithIME: function () {
        this._textFieldRender.attachWithIME();
    },

    createCloneInstance: function () {
        return ccui.TextField.create();
    },

    copySpecialProperties: function (textField) {
        this.setString(textField._textFieldRender.getString());
        this.setPlaceHolder(textField.getString());
        this.setFontSize(textField._textFieldRender.getFontSize());
        this.setFontName(textField._textFieldRender.getFontName());
        this.setMaxLengthEnabled(textField.isMaxLengthEnabled());
        this.setMaxLength(textField.getMaxLength());
        this.setPasswordEnabled(textField.isPasswordEnabled());
        this.setPasswordStyleText(textField._passwordStyleText);
        this.setAttachWithIME(textField.getAttachWithIME());
        this.setDetachWithIME(textField.getDetachWithIME());
        this.setInsertText(textField.getInsertText());
        this.setDeleteBackward(textField.getDeleteBackward());
    }
});

ccui.TextField.create = function(placeholder, fontName, fontSize){
    var widget = new ccui.TextField();
    if (widget && widget.init())
    {
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
 * @constructs
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
ccui.TextField.EVENT_ATTACH_WITH_ME = 0;
ccui.TextField.EVENT_DETACH_WITH_ME = 1;
ccui.TextField.EVENT_INSERT_TEXT = 2;
ccui.TextField.EVENT_DELETE_BACKWARD = 3;

ccui.TextField.RENDERER_ZORDER = -1;