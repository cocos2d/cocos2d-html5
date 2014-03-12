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
    _className:"UICCTextField",
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
    init:function(){
        if(ccui.Widget.prototype.init.call(this)){
            this.setTouchEnabled(true);
            return true;
        }
        return false;
    },
    onEnter: function () {
        cc.TextFieldTTF.prototype.onEnter.call(this);
        cc.TextFieldTTF.prototype.setDelegate.call(this,this);
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

    insertText: function (text, len) {
        var str_text = text;
        var locString = cc.TextFieldTTF.prototype.getString.call(this);
        var str_len = locString.length;
        var multiple, header;
        if (text != "\n") {
            if (this.maxLengthEnabled) {
                multiple = 1;
                header = text.charCodeAt(0);
                if (header < 0 || header > 127) {
                    multiple = 3;
                }

                if (str_len + len > this.maxLength * multiple) {
                    str_text = str_text.substr(0, this.maxLength * multiple);
                    len = this.maxLength * multiple;
                }
            }
        }
        cc.TextFieldTTF.prototype.insertText.call(this,str_text, len);

        // password
        if (this.passwordEnabled) {
            if (cc.TextFieldTTF.prototype.getCharCount.call(this) > 0) {
                this.setPasswordText(this._inputText);
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
    onDraw:function (sender) {
        return false;
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
        for (var i = 0; i < text.length; ++i) {
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
    _passwordStyleText:"",
    ctor: function () {
        ccui.Widget.prototype.ctor.call(this);
        this._textFieldRender = null;
        this._touchWidth = 0;
        this._touchHeight = 0;
        this._useTouchArea = false;

        this._textFieldEventListener = null;
        this._textFieldEventSelector = null;
        this._attachWithIMEListener = null;
        this._detachWithIMEListener = null;
        this._insertTextListener = null;
        this._deleteBackwardListener = null;
        this._attachWithIMESelector = null;
        this._detachWithIMESelector = null;
        this._insertTextSelector = null;
        this._deleteBackwardSelector = null;
    },

    onEnter:function(){
        ccui.Widget.prototype.onEnter.call(this);
        this.setUpdateEnabled(true);
    },

    initRenderer: function () {
        this._textFieldRender = ccui.UICCTextField.create("input words here", "Thonburi", 20);
        cc.Node.prototype.addChild.call(this, this._textFieldRender, ccui.TextField.RENDERER_ZORDER, -1);

    },

    /**
     * Set touch size
     * @param {cc.Size} size
     */
    setTouchSize: function (size) {
        this._useTouchArea = true;
        this._touchWidth = size.width;
        this._touchHeight = size.height;
    },

    /**
     * Get touch size.
     * @returns {cc.Size}
     */
    getTouchSize:function(){
        return cc.size(this._touchWidth,this._touchHeight);
    },

    /**
     *  Changes the string value of textField.
     * @param {String} text
     */
    setText: function (text) {
        if (!text) {
            return;
        }
        text = String(text);
        if (this.isMaxLengthEnabled()) {
            text = text.substr(0, this.getMaxLength());
        }
        if (this.isPasswordEnabled()) {
            this._textFieldRender.setPasswordText(text);
            this._textFieldRender.insertText(text, text.length);
        }
        else {
            this._textFieldRender.setString(text);
        }
        this._textFieldRender.setString(text);
        this.textfieldRendererScaleChangedWithSize();
    },

    /**
     * @param {String} value
     */
    setPlaceHolder: function (value) {
        this._textFieldRender.setPlaceHolder(value);
        this.textfieldRendererScaleChangedWithSize();
    },

    /**
     * @returns {String}
     */
    getPlaceHolder:function(){
        return this._textFieldRender.getPlaceHolder();
    },

	_setFont: function (font) {
		this._textFieldRender._setFont(font);
		this.textfieldRendererScaleChangedWithSize();
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
        this.textfieldRendererScaleChangedWithSize();
    },

	/**
	 * Get font size for text field content
	 * @param {cc.Size} size
	 */
	getFontSize: function () {
		return this._textFieldRender.getFontSize();
	},

    /**
     * Set font name for text field content
     * @param {String} name
     */
    setFontName: function (name) {
        this._textFieldRender.setFontName(name);
        this.textfieldRendererScaleChangedWithSize();
    },

	/**
	 * Get font name for text field content
	 * @param {cc.Size} size
	 */
	getFontName: function () {
		return this._textFieldRender.getFontName();
	},

    /**
     * detach with IME
     */
    didNotSelectSelf: function () {
        this._textFieldRender.detachWithIME();
    },

    /**
     * get textField string value
     * @returns {String}
     */
    getStringValue: function () {
        return this._textFieldRender.getString();
    },

    /**
     * touch began
     * @param {cc.Point} touchPoint
     */
    onTouchBegan: function (touchPoint) {
        var pass = ccui.Widget.prototype.onTouchBegan.call(this, touchPoint);
        return pass;
    },

    /**
     * touch ended
     * @param touchPoint
     */
    onTouchEnded: function (touchPoint) {
        ccui.Widget.prototype.onTouchEnded.call(this, touchPoint);
        this._textFieldRender.attachWithIME();
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
    },

    /**
     * @returns {String}
     */
    getPasswordStyleText:function(){
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

            this.textfieldRendererScaleChangedWithSize();
        }
        if (this.getDeleteBackward()) {
            this.deleteBackwardEvent();
            this.setDeleteBackward(false);
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
    },

    detachWithIMEEvent: function () {
        if (this._textFieldEventListener && this._textFieldEventSelector) {
            this._textFieldEventSelector.call(this._textFieldEventListener, this, ccui.TextField.EVENT_DETACH_WITH_ME);
        }
    },

    insertTextEvent: function () {
        if (this._textFieldEventListener && this._textFieldEventSelector) {
            this._textFieldEventSelector.call(this._textFieldEventListener, this, ccui.TextField.EVENT_INSERT_TEXT);
        }
    },

    deleteBackwardEvent: function () {
        if (this._textFieldEventListener && this._textFieldEventSelector) {
            this._textFieldEventSelector.call(this._textFieldEventListener, this, ccui.TextField.EVENT_DELETE_BACKWARD);
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
     * check hit
     * @param {cc.Point} pt
     * @returns {boolean}
     */
    hitTest: function (pt) {
        var nsp = this.convertToNodeSpace(pt);
        var locSize = this._textFieldRender.getContentSize();
        var bb = cc.rect(-locSize.width * this._anchorPoint.x, -locSize.height * this._anchorPoint.y, locSize.width, locSize.height);
        if (nsp.x >= bb.x && nsp.x <= bb.x + bb.width && nsp.y >= bb.y && nsp.y <= bb.y + bb.height) {
            return true;
        }
        return false;
    },

    /**
     * override "setAnchorPoint" of widget.
     * @param {cc.Point|Number} point The anchor point of UILabelBMFont or The anchor point.x of UILabelBMFont.
     * @param {Number} [y] The anchor point.y of UILabelBMFont.
     */
    setAnchorPoint: function (point, y) {
        if(y === undefined){
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
        this.textfieldRendererScaleChangedWithSize();
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
        this.setText(textField._textFieldRender.getString());
        this.setPlaceHolder(textField.getStringValue());
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

window._p = ccui.TextField.prototype;

// Extended properties
/** @expose */
_p.string;
cc.defineGetterSetter(_p, "string", _p.getStringValue, _p.setText);
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

delete window._p;

/**
 * allocates and initializes a UITextField.
 * @constructs
 * @return {ccui.TextField}
 * @example
 * // example
 * var uiTextField = ccui.TextField.create();
 */
ccui.TextField.create = function () {
    var uiTextField = new ccui.TextField();
    if (uiTextField && uiTextField.init()) {
        return uiTextField;
    }
    return null;
};

// Constants
//TextField event
ccui.TextField.EVENT_ATTACH_WITH_ME = 0;
ccui.TextField.EVENT_DETACH_WITH_ME = 1;
ccui.TextField.EVENT_INSERT_TEXT = 2;
ccui.TextField.EVENT_DELETE_BACKWARD = 3;

ccui.TextField.RENDERER_ZORDER = -1;