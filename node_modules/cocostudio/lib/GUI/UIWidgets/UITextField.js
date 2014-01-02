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
ccs.TextFiledEventType = {
    attach_with_me: 0,
    detach_with_ime: 1,
    insert_text: 2,
    delete_backward: 3
};

ccs.TEXTFIELDRENDERERZ = -1;
/**
 * Base class for ccs.UICCTextField
 * @class
 * @extends cc.TextFieldTTF
 */
ccs.UICCTextField = cc.TextFieldTTF.extend({
    _maxLengthEnabled: false,
    _maxLength: 0,
    _passwordEnabled: false,
    _passwordStyleText: "",
    _attachWithIME: false,
    _detachWithIME: false,
    _insertText: false,
    _deleteBackward: false,
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
        if (this._maxLengthEnabled) {
            if (cc.TextFieldTTF.prototype.getCharCount.call(this) >= this._maxLength) {
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
            if (this._maxLengthEnabled) {
                multiple = 1;
                header = text.charCodeAt(0);
                if (header < 0 || header > 127) {
                    multiple = 3;
                }

                if (str_len + len > this._maxLength * multiple) {
                    str_text = str_text.substr(0, this._maxLength * multiple);
                    len = this._maxLength * multiple;
                }
            }
        }
        cc.TextFieldTTF.prototype.insertText.call(this,str_text, len);

        // password
        if (this._passwordEnabled) {
            if (cc.TextFieldTTF.prototype.getCharCount.call(this) > 0) {
                this.setPasswordText(this._inputText);
            }
        }
    },

    deleteBackward: function () {
        cc.TextFieldTTF.prototype.deleteBackward.call(this);

        if (cc.TextFieldTTF.prototype.getCharCount.call(this) > 0) {
            // password
            if (this._passwordEnabled) {
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

ccs.UICCTextField.create = function (placeholder, fontName, fontSize) {
    var ret = new ccs.UICCTextField();
    if (ret && ret.initWithString("", fontName, fontSize)) {
        if (placeholder) {
            ret.setPlaceHolder(placeholder);
        }
        return ret;
    }
    return null;
};

/**
 * Base class for ccs.TextField
 * @class
 * @extends ccs.Widget
 */
ccs.TextField = ccs.Widget.extend(/** @lends ccs.TextField# */{
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
        ccs.Widget.prototype.ctor.call(this);
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

    init: function () {
        if (ccs.Widget.prototype.init.call(this)) {
            this.setUpdateEnabled(true);
            return true;
        }
        return false;
    },

    initRenderer: function () {
        this._textFieldRender = ccs.UICCTextField.create("input words here", "Thonburi", 20);
        cc.NodeRGBA.prototype.addChild.call(this, this._textFieldRender, ccs.TEXTFIELDRENDERERZ, -1);

    },

    /**
     * set touch size
     * @param {cc.Size} size
     */
    setTouchSize: function (size) {
        this._useTouchArea = true;
        this._touchWidth = size.width;
        this._touchHeight = size.height;
    },

    /**
     *  Changes the string value of textField.
     * @param {String} text
     */
    setText: function (text) {
        if (!text) {
            return;
        }
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
     * @param {cc.Size} size
     */
    setFontSize: function (size) {
        this._textFieldRender.setFontSize(size);
        this.textfieldRendererScaleChangedWithSize();
    },

    /**
     * @param {String} name
     */
    setFontName: function (name) {
        this._textFieldRender.setFontName(name);
        this.textfieldRendererScaleChangedWithSize();
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
        var pass = ccs.Widget.prototype.onTouchBegan.call(this, touchPoint);
        return pass;
    },

    /**
     * touch ended
     * @param touchPoint
     */
    onTouchEnded: function (touchPoint) {
        ccs.Widget.prototype.onTouchEnded.call(this, touchPoint);
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
            this._textFieldEventSelector.call(this._textFieldEventListener, this, ccs.TextFiledEventType.attach_with_me);
        }
    },

    detachWithIMEEvent: function () {
        if (this._textFieldEventListener && this._textFieldEventSelector) {
            this._textFieldEventSelector.call(this._textFieldEventListener, this, ccs.TextFiledEventType.detach_with_ime);
        }
    },

    insertTextEvent: function () {
        if (this._textFieldEventListener && this._textFieldEventSelector) {
            this._textFieldEventSelector.call(this._textFieldEventListener, this, ccs.TextFiledEventType.insert_text);
        }
    },

    deleteBackwardEvent: function () {
        if (this._textFieldEventListener && this._textFieldEventSelector) {
            this._textFieldEventSelector.call(this._textFieldEventListener, this, ccs.TextFiledEventType.delete_backward);
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
        var bb = cc.rect(-locSize.width * this._anchorPoint._x, -locSize.height * this._anchorPoint._y, locSize.width, locSize.height);
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
        if(arguments.length === 2){
            ccs.Widget.prototype.setAnchorPoint.call(this, point, y);
            this._textFieldRender.setAnchorPoint(point, y);
        } else {
            ccs.Widget.prototype.setAnchorPoint.call(this, point);
            this._textFieldRender.setAnchorPoint(point);
        }
    },

    onSizeChanged: function () {
        ccs.Widget.prototype.onSizeChanged.call(this);
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

    /**
     * override "getContentSize" method of widget.
     * @returns {cc.Node}
     */
    getVirtualRenderer: function () {
        return this._textFieldRender;
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
        return ccs.TextField.create();
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
/**
 * allocates and initializes a UITextField.
 * @constructs
 * @return {ccs.TextField}
 * @example
 * // example
 * var uiTextField = ccs.TextField.create();
 */
ccs.TextField.create = function () {
    var uiTextField = new ccs.TextField();
    if (uiTextField && uiTextField.init()) {
        return uiTextField;
    }
    return null;
};