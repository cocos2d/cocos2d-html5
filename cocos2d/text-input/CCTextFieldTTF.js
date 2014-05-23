/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
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
 * Text field delegate
 * @class
 * @extends cc.Class
 */
cc.TextFieldDelegate = cc.Class.extend(/** @lends cc.TextFieldDelegate# */{
    /**
     * If the sender doesn't want to attach with IME, return true;
     * @param {cc.TextFieldTTF} sender
     * @return {Boolean}
     */
    onTextFieldAttachWithIME:function (sender) {
        return false;
    },

    /**
     * If the sender doesn't want to detach with IME, return true;
     * @param {cc.TextFieldTTF} sender
     * @return {Boolean}
     */
    onTextFieldDetachWithIME:function (sender) {
        return false;
    },

    /**
     * If the sender doesn't want to insert the text, return true;
     * @param {cc.TextFieldTTF} sender
     * @param {String} text
     * @param {Number} len
     * @return {Boolean}
     */
    onTextFieldInsertText:function (sender, text, len) {
        return false
    },

    /**
     * If the sender doesn't want to delete the delText, return true;
     * @param {cc.TextFieldTTF} sender
     * @param {String} delText
     * @param {Number} len
     * @return {Boolean}
     */
    onTextFieldDeleteBackward:function (sender, delText, len) {
        return false;
    },

    /**
     * If doesn't want draw sender as default, return true.
     * @param {cc.TextFieldTTF} sender
     * @return {Boolean}
     */
    onDraw:function (sender) {
        return false;
    }
});

/**
 * A simple text input field with TTF font.
 * @class
 * @extends cc.LabelTTF
 *
 * @property {cc.Node}      delegate            - Delegate
 * @property {Number}       charCount           - <@readonly> Characators count
 * @property {String}       placeHolder         - Place holder for the field
 * @property {cc.Color}     colorSpaceHolder
 */
cc.TextFieldTTF = cc.LabelTTF.extend(/** @lends cc.TextFieldTTF# */{
	delegate:null,
	colorSpaceHolder:null,

    _lens:null,
    _inputText:"",
    _placeHolder:"",
    _charCount:0,
    _className:"TextFieldTTF",

    /**
     *  creates a cc.TextFieldTTF from a fontName, alignment, dimension and font size   <br/>
     * Constructor of cc.TextFieldTTF
     * @param {String} placeholder
     * @param {cc.Size} dimensions
     * @param {Number} alignment
     * @param {String} fontName
     * @param {Number} fontSize
     * @example
     * //example
     * // When five parameters
     * var textField = cc.TextFieldTTF.create("<click here for input>", cc.size(100,50), cc.TEXT_ALIGNMENT_LEFT,"Arial", 32);
     * // When three parameters
     * var textField = cc.TextFieldTTF.create("<click here for input>", "Arial", 32);
     */
    ctor:function (placeholder, dimensions, alignment, fontName, fontSize) {
        this.colorSpaceHolder = cc.color(127, 127, 127);
        cc.imeDispatcher.addDelegate(this);
        cc.LabelTTF.prototype.ctor.call(this);

        if(fontSize !== undefined){
            this.initWithPlaceHolder("", dimensions, alignment, fontName, fontSize);
            if(placeholder)
                this.setPlaceHolder(placeholder);
        }else if(fontName === undefined && alignment !== undefined){
            this.initWithString("", arguments[1], arguments[2]);
            if(placeholder)
                this.setPlaceHolder(placeholder);
        }
    },

    /**
     * @return {cc.Node}
     */
    getDelegate:function () {
        return this.delegate;
    },

    /**
     * @param {cc.Node} value
     */
    setDelegate:function (value) {
        this.delegate = value;
    },

    /**
     * @return {Number}
     */
    getCharCount:function () {
        return this._charCount;
    },

    /**
     * @return {cc.Color}
     */
    getColorSpaceHolder:function () {
        return this.colorSpaceHolder;
    },

    /**
     * @param {cc.Color} value
     */
    setColorSpaceHolder:function (value) {
        this.colorSpaceHolder = value;
    },
    /**
     * Initializes the cc.TextFieldTTF with a font name, alignment, dimension and font size
     * @param {String} placeholder
     * @param {cc.Size} dimensions
     * @param {Number} alignment
     * @param {String} fontName
     * @param {Number} fontSize
     * @return {Boolean}
     * @example
     * //example
     * var  textField = new cc.TextFieldTTF();
     * // When five parameters
     * textField.initWithPlaceHolder("<click here for input>", cc.size(100,50), cc.TEXT_ALIGNMENT_LEFT,"Arial", 32);
     * // When three parameters
     * textField.initWithPlaceHolder("<click here for input>", "Arial", 32);
     */
    initWithPlaceHolder:function (placeholder, dimensions, alignment, fontName, fontSize) {
        switch (arguments.length) {
            case 5:
                if (placeholder) {
                    this.setPlaceHolder(placeholder);
                }
                return this.initWithString(this._placeHolder,fontName, fontSize, dimensions, alignment);
                break;
            case 3:
                if (placeholder) {
                    this.setPlaceHolder(placeholder);
                }
                return this.initWithString(this._placeHolder, arguments[1], arguments[2]);
                break;
            default:
                throw "Argument must be non-nil ";
                break;
        }
    },

    /**
     * Input text property
     * @param {String} text
     */
    setString:function (text) {
        text = String(text);
        this._inputText = text || "";

        // if there is no input text, display placeholder instead
        if (!this._inputText.length)
            cc.LabelTTF.prototype.setString.call(this, this._placeHolder);
        else
            cc.LabelTTF.prototype.setString.call(this,this._inputText);
        this._charCount = this._inputText.length;
    },

    /**
     * @return {String}
     */
    getString:function () {
        return this._inputText;
    },

    /**
     * @param {String} text
     */
    setPlaceHolder:function (text) {
        this._placeHolder = text || "";
        if (!this._inputText.length) {
            cc.LabelTTF.prototype.setString.call(this,this._placeHolder);
        }
    },

    /**
     * @return {String}
     */
    getPlaceHolder:function () {
        return this._placeHolder;
    },

    /**
     * @param {CanvasContext} ctx
     */
    draw:function (ctx) {
        //console.log("size",this._contentSize);
        var context = ctx || cc._renderContext;
        if (this.delegate && this.delegate.onDraw(this))
            return;

        if (this._inputText && this._inputText.length > 0) {
            cc.LabelTTF.prototype.draw.call(this, context);
            return;
        }

        // draw placeholder
        var color = this.color;
        this.color = this.colorSpaceHolder;
        if(cc._renderType === cc._RENDER_TYPE_CANVAS)
            this._updateTexture();
        cc.LabelTTF.prototype.draw.call(this, context);
        this.color = color;
    },

    visit: function(ctx){
        this._super(ctx);
    },

    //////////////////////////////////////////////////////////////////////////
    // CCIMEDelegate interface
    //////////////////////////////////////////////////////////////////////////
    /**
     * Open keyboard and receive input text.
     * @return {Boolean}
     */
    attachWithIME:function () {
        return cc.imeDispatcher.attachDelegateWithIME(this);
    },

    /**
     * End text input  and close keyboard.
     * @return {Boolean}
     */
    detachWithIME:function () {
        return cc.imeDispatcher.detachDelegateWithIME(this);
    },

    /**
     * @return {Boolean}
     */
    canAttachWithIME:function () {
        return (this.delegate) ? (!this.delegate.onTextFieldAttachWithIME(this)) : true;
    },

    /**
     * When the delegate detach with IME, this method call by CCIMEDispatcher.
     */
    didAttachWithIME:function () {
    },

    /**
     * @return {Boolean}
     */
    canDetachWithIME:function () {
        return (this.delegate) ? (!this.delegate.onTextFieldDetachWithIME(this)) : true;
    },

    /**
     * When the delegate detach with IME, this method call by CCIMEDispatcher.
     */
    didDetachWithIME:function () {
    },

    /**
     *  Delete backward
     */
    deleteBackward:function () {
        var strLen = this._inputText.length;
        if (strLen == 0)
            return;

        // get the delete byte number
        var deleteLen = 1;    // default, erase 1 byte

        if (this.delegate && this.delegate.onTextFieldDeleteBackward(this, this._inputText[strLen - deleteLen], deleteLen)) {
            // delegate don't want delete backward
            return;
        }

        // if delete all text, show space holder string
        if (strLen <= deleteLen) {
            this._inputText = "";
            this._charCount = 0;
            cc.LabelTTF.prototype.setString.call(this,this._placeHolder);
            return;
        }

        // set new input text
        this.string = this._inputText.substring(0, strLen - deleteLen);
    },

    /**
     *  Remove delegate
     */
    removeDelegate:function () {
        cc.imeDispatcher.removeDelegate(this);
    },

    /**
     * @param {String} text
     * @param {Number} len
     */
    insertText:function (text, len) {
        var sInsert = text;

        // insert \n means input end
        var pos = sInsert.indexOf('\n');
        if (pos > -1) {
            sInsert = sInsert.substring(0, pos);
        }

        if (sInsert.length > 0) {
            if (this.delegate && this.delegate.onTextFieldInsertText(this, sInsert, sInsert.length)) {
                // delegate doesn't want insert text
                return;
            }

            var sText = this._inputText + sInsert;
            this._charCount = sText.length;
            this.string = sText;
        }

        if (pos == -1)
            return;

        // '\n' has inserted,  let delegate process first
        if (this.delegate && this.delegate.onTextFieldInsertText(this, "\n", 1))
            return;

        // if delegate hasn't process, detach with ime as default
        this.detachWithIME();
    },
    /**
     * @return {String}
     */
    getContentText:function () {
        return this._inputText;
    },

    //////////////////////////////////////////////////////////////////////////
    // keyboard show/hide notification
    //////////////////////////////////////////////////////////////////////////
    keyboardWillShow:function (info) {
    },
    keyboardDidShow:function (info) {
    },
    keyboardWillHide:function (info) {
    },
    keyboardDidHide:function (info) {
    }
});

var _p = cc.TextFieldTTF.prototype;

// Extended properties
/** @expose */
_p.charCount;
cc.defineGetterSetter(_p, "charCount", _p.getCharCount);
/** @expose */
_p.placeHolder;
cc.defineGetterSetter(_p, "placeHolder", _p.getPlaceHolder, _p.setPlaceHolder);


/**
 *  creates a cc.TextFieldTTF from a fontName, alignment, dimension and font size
 * @param {String} placeholder
 * @param {cc.Size} dimensions
 * @param {Number} alignment
 * @param {String} fontName
 * @param {Number} fontSize
 * @return {cc.TextFieldTTF|Null}
 * @example
 * //example
 * // When five parameters
 * var textField = cc.TextFieldTTF.create("<click here for input>", cc.size(100,50), cc.TEXT_ALIGNMENT_LEFT,"Arial", 32);
 * // When three parameters
 * var textField = cc.TextFieldTTF.create("<click here for input>", "Arial", 32);
 */
cc.TextFieldTTF.create = function (placeholder, dimensions, alignment, fontName, fontSize) {
    return new cc.TextFieldTTF(placeholder, dimensions, alignment, fontName, fontSize);
};

