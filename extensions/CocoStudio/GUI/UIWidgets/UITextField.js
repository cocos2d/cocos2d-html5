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
cc.TextFiledEventType = {
    ATTACH_WITH_IME: 0,
    DETACH_WITH_IME: 1,
    INDERT_TEXT: 2,
    DELETE_BACKWARD: 3
};

/**
 * Base class for cc.UISlider
 * @class
 * @extends cc.UIWidget
 */
cc.UICCTextField = cc.TextFieldTTF.extend({
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

cc.UICCTextField.create = function (placeholder, fontName, fontSize) {
    var ret = new cc.UICCTextField();
    if (ret && ret.initWithString("", fontName, fontSize)) {
        if (placeholder) {
            ret.setPlaceHolder(placeholder);
        }
        return ret;
    }
    return null;
};

/**
 * Base class for cc.UITextField
 * @class
 * @extends cc.UIWidget
 */
cc.UITextField = cc.UIWidget.extend({
    _textFieldRenderer: null,
    _touchWidth: 0,
    _touchHeight: 0,
    _useTouchArea: false,
    _eventListener: null,
    _eventSelector: null,
    _attachWithIMEListener: null,
    _detachWithIMEListener: null,
    _insertTextListener: null,
    _deleteBackwardListener: null,
    _attachWithIMESelector: null,
    _detachWithIMESelector: null,
    _insertTextSelector: null,
    _deleteBackwardSelector: null,
    ctor: function () {
        cc.UIWidget.prototype.ctor.call(this);
        this._textFieldRenderer = null;
        this._touchWidth = 0;
        this._touchHeight = 0;
        this._useTouchArea = false;

        this._eventListener = null;
        this._eventSelector = null;
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
        if (cc.UIWidget.prototype.init.call(this)) {
            this.setUpdateEnabled(true);
            return true;
        }
        return false;
    },

    initRenderer: function () {
        cc.UIWidget.prototype.initRenderer.call(this);
        this._textFieldRenderer = cc.UICCTextField.create("input words here", "Thonburi", 20);
        this._renderer.addChild(this._textFieldRenderer);

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
        this._textFieldRenderer.setString(text);
        this.textfieldRendererScaleChangedWithSize();
    },

    /**
     * @param {String} value
     */
    setPlaceHolder: function (value) {
        this._textFieldRenderer.setPlaceHolder(value);
        this.textfieldRendererScaleChangedWithSize();
    },

    /**
     * @param {cc.Size} size
     */
    setFontSize: function (size) {
        this._textFieldRenderer.setFontSize(size);
        this.textfieldRendererScaleChangedWithSize();
    },

    /**
     * @param {String} name
     */
    setFontName: function (name) {
        this._textFieldRenderer.setFontName(name);
        this.textfieldRendererScaleChangedWithSize();
    },

    didNotSelectSelf: function () {
        this._textFieldRenderer.detachWithIME();
    },

    getStringValue: function () {
        return this._textFieldRenderer.getString();
    },

    onTouchBegan: function (touchPoint) {
        var pass = cc.UIWidget.prototype.onTouchBegan.call(this, touchPoint);
        return pass;
    },

    onTouchEnded: function (touchPoint) {
        cc.UIWidget.prototype.onTouchEnded.call(this, touchPoint);
        this._textFieldRenderer.attachWithIME();
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

    /**
     * @param {String} enable
     */
    setPasswordStyleText: function (styleText) {
        this._textFieldRenderer.setPasswordStyleText(styleText);
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

    getAttachWithIME: function () {
        return this._textFieldRenderer.getAttachWithIME();
    },

    setAttachWithIME: function (attach) {
        this._textFieldRenderer.setAttachWithIME(attach);
    },

    getDetachWithIME: function () {
        return this._textFieldRenderer.getDetachWithIME();
    },

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

    attachWithIMEEvent: function () {
        if (this._eventListener && this._eventSelector) {
            this._eventSelector.call(this._eventListener, this, cc.TextFiledEventType.ATTACH_WITH_IME);
        }
    },

    detachWithIMEEvent: function () {
        if (this._eventListener && this._eventSelector) {
            this._eventSelector.call(this._eventListener, this, cc.TextFiledEventType.DETACH_WITH_IME);
        }
    },

    insertTextEvent: function () {
        if (this._eventListener && this._eventSelector) {
            this._eventSelector.call(this._eventListener, this, cc.TextFiledEventType.INDERT_TEXT);
        }
    },

    deleteBackwardEvent: function () {
        if (this._eventListener && this._eventSelector) {
            this._eventSelector.call(this._eventListener, this, cc.TextFiledEventType.DELETE_BACKWARD);
        }
    },

    /**
     * add event listener
     * @param {Object} target
     * @param {Function} selector
     */
    addEventListener: function (target, selector) {
        this._eventListener = target;
        this._eventSelector = selector;
    },

    hitTest: function (pt) {
        var nsp = this._renderer.convertToNodeSpace(pt);
        var locSize = this._textFieldRenderer.getContentSize();
        var bb = cc.rect(-locSize.width * this._anchorPoint.x, -locSize.height * this._anchorPoint.y, locSize.width, locSize.height);
        if (nsp.x >= bb.x && nsp.x <= bb.x + bb.width && nsp.y >= bb.y && nsp.y <= bb.y + bb.height) {
            return true;
        }
        return false;
    },

    /**
     * override "setAnchorPoint" of widget.
     * @param {cc.Point} pt
     */
    setAnchorPoint: function (pt) {
        cc.UIWidget.prototype.setAnchorPoint.call(this, pt);
        this._textFieldRenderer.setAnchorPoint(pt);
    },

    /**
     * @param {cc.c3b} color
     */
    setColor: function (color) {
        cc.UIWidget.prototype.setColor.call(this, color);
        this._textFieldRenderer.setColor(color);
    },

    /**
     * @param {number} opacity
     */
    setOpacity: function (opacity) {
        cc.UIWidget.prototype.setOpacity.call(this, opacity);
        this._textFieldRenderer.setOpacity(opacity);
    },

    onSizeChanged: function () {
        this.textfieldRendererScaleChangedWithSize();
    },

    textfieldRendererScaleChangedWithSize: function () {
        if (this._ignoreSize) {
            this._textFieldRenderer.setScale(1.0);
            this._size = this.getContentSize();
        }
        else {
            var textureSize = this.getContentSize();
            if (textureSize.width <= 0.0 || textureSize.height <= 0.0) {
                this._textFieldRenderer.setScale(1.0);
                return;
            }
            var scaleX = this._size.width / textureSize.width;
            var scaleY = this._size.height / textureSize.height;
            this._textFieldRenderer.setScaleX(scaleX);
            this._textFieldRenderer.setScaleY(scaleY);
        }
    },

    /**
     * override "getContentSize" method of widget.
     * @returns {cc.Size}
     */
    getContentSize: function () {
        return this._textFieldRenderer.getContentSize();
    },

    /**
     * override "getContentSize" method of widget.
     * @returns {cc.Node}
     */
    getVirtualRenderer: function () {
        return this._textFieldRenderer;
    },

    getDescription: function () {
        return "TextField";
    }
});
cc.UITextField.create = function () {
    var uiTextField = new cc.UITextField();
    if (uiTextField && uiTextField.init()) {
        return uiTextField;
    }
    return null;
};