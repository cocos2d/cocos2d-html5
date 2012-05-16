/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

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

var cc = cc = cc || {};

cc.TextFieldDelegate = cc.Class.extend({
    /**
     @brief    If the sender doesn't want to attach with IME, return true;
     */
    onTextFieldAttachWithIME:function (sender) {
        return false;
    },

    /**
     @brief    If the sender doesn't want to detach with IME, return true;
     */
    onTextFieldDetachWithIME:function (sender) {
        return false;
    },

    /**
     @brief    If the sender doesn't want to insert the text, return true;
     */
    onTextFieldInsertText:function (sender, text, nLen) {
        return false
    },

    /**
     @brief    If the sender doesn't want to delete the delText, return true;
     */
    onTextFieldDeleteBackward:function (sender, delText, nLen) {
        return false;
    },

    /**
     @brief    If doesn't want draw sender as default, return true.
     */
    onDraw:function (sender) {
        return false;
    }
});

/**
 @brief    A simple text input field with TTF font.
 */
cc.TextFieldTTF = cc.LabelTTF.extend({
    _pLens:null,
    _pInputText:"",
    _pPlaceHolder:"",

    //////////////////////////////////////////////////////////////////////////
    // properties
    //////////////////////////////////////////////////////////////////////////
    _pDelegate:null,
    getDelegate:function () {
        return this._pDelegate;
    },
    setDelegate:function (value) {
        this._pDelegate = value;
    },

    _nCharCount:0,
    getCharCount:function () {
        return this._nCharCount;
    },

    _ColorSpaceHolder:null,
    getColorSpaceHolder:function () {
        return this._ColorSpaceHolder;
    },
    setColorSpaceHolder:function (value) {
        this._ColorSpaceHolder = value;
    },

    ctor:function () {
        this._ColorSpaceHolder = new cc.Color3B(127, 127, 127);
        cc.IMEDispatcher.sharedDispatcher().addDelegate(this);
        this._super();
    },

    /** initializes the CCTextFieldTTF with a font name, alignment, dimension and font size */
    initWithPlaceHolder:function (placeholder, dimensions, alignment, fontName, fontSize) {
        switch (arguments.length) {
            case 5:
                if (placeholder) {
                    this._pPlaceHolder = placeholder;
                }
                return this.initWithString(this._pPlaceHolder, dimensions, alignment, fontName, fontSize);
                break;
            case 3:
                if (placeholder) {
                    this._pPlaceHolder = placeholder;
                }
                fontName = arguments[1];
                fontSize = arguments[2];
                return this.initWithString(this._pPlaceHolder, fontName, fontSize);
                break;
            default:
                throw "Argument must be non-nil ";
                break;
        }
    },

    // input text property
    setString:function (text, isCallParent) {
        if (isCallParent && isCallParent == true) {
            this._super(text);
            return;
        }
        if (text) {
            this._pInputText = text;
        } else {
            this._pInputText = "";
        }

        // if there is no input text, display placeholder instead
        if (!this._pInputText.length) {
            this._super(this._pPlaceHolder);
        } else {
            this._super(this._pInputText);
        }
        this._nCharCount = this._pInputText.length;
    },
    getString:function () {
        return this._pInputText;
    },

    setPlaceHolder:function (text) {
        this._pPlaceHolder = text || "";
        if (!this._pInputText.length) {
            this.setString(this._pPlaceHolder, true);
        }
    },
    getPlaceHolder:function () {
        return this._pPlaceHolder;
    },

    draw:function (ctx) {
        var context = ctx || cc.renderContext;
        if (this._pDelegate && this._pDelegate.onDraw(this)) {
            return;
        }
        if (this._pInputText) {
            this._super(context);
            return;
        }

        // draw placeholder
        var color = this.getColor();
        this.setColor(this._ColorSpaceHolder);
        this._super(context);
        this.setColor(color);
    },

    //////////////////////////////////////////////////////////////////////////
    // CCIMEDelegate interface
    //////////////////////////////////////////////////////////////////////////
    /**
     @brief    Open keyboard and receive input text.
     */
    attachWithIME:function () {
        //c++ code
        var bRet = cc.IMEDispatcher.sharedDispatcher().attachDelegateWithIME(this);
        if (bRet) {
            // open keyboard
            /*
             var pGlView = cc.Director.sharedDirector().getOpenGLView();
             if (pGlView) {
             pGlView.setIMEKeyboardState(true);
             }
             */
        }
        return bRet;
    },

    /**
     @brief    End text input  and close keyboard.
     */
    detachWithIME:function () {
        // C++ code
        var bRet = cc.IMEDispatcher.sharedDispatcher().detachDelegateWithIME(this);
        if (bRet) {
            // close keyboard
            /*
             var pGlView = cc.Director.sharedDirector().getOpenGLView();
             if (pGlView) {
             pGlView.setIMEKeyboardState(false);
             }
             */
        }
        return bRet;
    },

    canAttachWithIME:function () {
        return (this._pDelegate) ? (!this._pDelegate.onTextFieldAttachWithIME(this)) : true;
    },

    /**
     @brief    When the delegate detach with IME, this method call by CCIMEDispatcher.
     */
    didAttachWithIME:function () {
    },

    canDetachWithIME:function () {
        return (this._pDelegate) ? (!this._pDelegate.onTextFieldDetachWithIME(this)) : true;
    },

    /**
     @brief    When the delegate detach with IME, this method call by CCIMEDispatcher.
     */
    didDetachWithIME:function () {
    },

    deleteBackward:function () {
        var nStrLen = this._pInputText.length;
        if (nStrLen == 0) {
            // there is no string
            return;
        }

        // get the delete byte number
        var nDeleteLen = 1;    // default, erase 1 byte

        if (this._pDelegate && this._pDelegate.onTextFieldDeleteBackward(this, this._pInputText[nStrLen - nDeleteLen], nDeleteLen)) {
            // delegate don't wan't delete backward
            return;
        }

        // if delete all text, show space holder string
        if (nStrLen <= nDeleteLen) {
            this._pInputText = "";
            this._nCharCount = 0;
            this.setString(this._pPlaceHolder, true);
            return;
        }

        // set new input text
        var sText = this._pInputText.substring(0, nStrLen - nDeleteLen);
        this.setString(sText);
    },

    removeDelegate:function () {
        cc.IMEDispatcher.sharedDispatcher().removeDelegate(this);
    },

    insertText:function (text, len) {
        var sInsert = text;

        // insert \n means input end
        var nPos = sInsert.indexOf('\n');
        if (nPos > -1) {
            sInsert = sInsert.substring(0, nPos);
        }

        if (sInsert.length > 0) {
            if (this._pDelegate && this._pDelegate.onTextFieldInsertText(this, sInsert, sInsert.length)) {
                // delegate doesn't want insert text
                return;
            }

            var sText = this._pInputText + sInsert;
            this._nCharCount = sText.length;
            this.setString(sText);
        }

        if (nPos == -1) {
            return;
        }

        // '\n' has inserted,  let delegate process first
        if (this._pDelegate && this._pDelegate.onTextFieldInsertText(this, "\n", 1)) {
            return;
        }

        // if delegate hasn't process, detach with ime as default
        this.detachWithIME();
    },

    getContentText:function () {
        return this._pInputText;
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

/** creates a CCTextFieldTTF from a fontname, alignment, dimension and font size */
cc.TextFieldTTF.textFieldWithPlaceHolder = function (placeholder, dimensions, alignment, fontName, fontSize) {
    switch (arguments.length) {
        case 5:
            var pRet = new cc.TextFieldTTF();
            if (pRet && pRet.initWithPlaceHolder("", dimensions, alignment, fontName, fontSize)) {
                if (placeholder) {
                    pRet.setPlaceHolder(placeholder);
                }
                return pRet;
            }
            return null;
            break;
        case 3:
            var pRet = new cc.TextFieldTTF();
            fontName = arguments[1];
            fontSize = arguments[2];
            if (pRet && pRet.initWithString("", fontName, fontSize)) {
                if (placeholder) {
                    pRet.setPlaceHolder(placeholder);
                }
                return pRet;
            }
            return null;
            break;
        default:
            throw "Argument must be non-nil ";
            break;
    }

};

