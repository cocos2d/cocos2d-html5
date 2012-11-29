/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2012 lzn

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
 * Default Node tag
 * @constant
 * @type Number
 */

cc.KEYBOARD_RETURNTYPE_DEFAULT = 0;
cc.KEYBOARD_RETURNTYPE_DONE = 1;
cc.KEYBOARD_RETURNTYPE_SEND = 2;
cc.KEYBOARD_RETURNTYPE_SEARCH = 3;
cc.KEYBOARD_RETURNTYPE_GO = 4;

/**
 * * The EditBoxInputMode defines the type of text that the user is allowed * to enter.
 */
cc.EDITBOX_INPUT_MODE_ANY = 0;

/**
 * The user is allowed to enter an e-mail address.
 */
cc.EDITBOX_INPUT_MODE_EMAILADDR = 1;

/**
 * The user is allowed to enter an integer value.
 */
cc.EDITBOX_INPUT_MODE_NUMERIC = 2;

/**
 * The user is allowed to enter a phone number.
 */
cc.EDITBOX_INPUT_MODE_PHONENUMBER = 3;

/**
 * The user is allowed to enter a URL.
 */
cc.EDITBOX_INPUT_MODE_URL = 4;

/**
 * The user is allowed to enter a real number value.
 * This extends kEditBoxInputModeNumeric by allowing a decimal point.
 */
cc.EDITBOX_INPUT_MODE_DECIMAL = 5;

/**
 * The user is allowed to enter any text, except for line breaks.
 */
cc.EDITBOX_INPUT_MODE_SINGLELINE = 6;

/**
 * Indicates that the text entered is confidential data that should be
 * obscured whenever possible. This implies EDIT_BOX_INPUT_FLAG_SENSITIVE.
 */
cc.EDITBOX_INPUT_FLAG_PASSWORD = 0;

/**
 * Indicates that the text entered is sensitive data that the
 * implementation must never store into a dictionary or table for use
 * in predictive, auto-completing, or other accelerated input schemes.
 * A credit card number is an example of sensitive data.
 */
cc.EDITBOX_INPUT_FLAG_SENSITIVE = 1;

/**
 * This flag is a hint to the implementation that during text editing,
 * the initial letter of each word should be capitalized.
 */
cc.EDITBOX_INPUT_FLAG_INITIAL_CAPS_WORD = 2;

/**
 * This flag is a hint to the implementation that during text editing,
 * the initial letter of each sentence should be capitalized.
 */
cc.EDITBOX_INPUT_FLAG_INITIAL_CAPS_SENTENCE = 3;

/**
 * Capitalize all characters automatically.
 */
cc.EDITBOX_INPUT_FLAG_INITIAL_CAPS_ALL_CHARACTERS = 4;


cc.ControlEditBox = cc.Node.extend({
    _edDiv:null,
    _edTxt:null,
    _edWidth:0,
    _edHeight:0,
    _edFontSize:14,
    _posX:0,
    _posY:0,
    _tooltip:false,
    _tooltipTxt:"",

    /**
     * * Constructor.
     * */
    ctor:function (w, h, size) {
        this._super();
        this._edDiv = document.createElement("div"),
        this._edTxt = document.createElement("input");
        this._edTxt.type = "text";
        this._edWidth = w;
        this._edHeight = h;
        this._edFontSize = size;
        this._edDiv.style.backgroundColor = new cc.Color3B(255, 0, 0);
        this._edDiv.style.width = this._edWidth.toString() + "px";
        this._edDiv.style.height = this._edHeight.toString() + "px";
        this._edDiv.style.borderColor = new cc.Color3B(255, 255, 255);
        this._edDiv.style.borderStyle = "solid";
        this._edDiv.style.border = 2;
        this._edDiv.style.borderRadius = "8px";
        this._edDiv.id = (Math.random()*1000).toString();

        this._edTxt.style.fontSize = this._edFontSize + "px";
        this._edTxt.style.color = new cc.Color3B(0, 0, 0);
        this._edTxt.style.border = 0;
        this._edTxt.style.background = "transparent";
        this._edTxt.style.paddingLeft = "2px";
        this._edTxt.style.width = "100%";
        this._edTxt.style.height = "100%";
        this._edTxt.style.active = 0;
        this._edTxt.style.outline = "medium";
        this._edTxt.id = (Math.random()*1000).toString();

        this._edDiv.appendChild(this._edTxt);

        this._tooltipTxt = "";
        var selfPointer = this;

        var onFocusHandle = function () {
            if (this._inputToolip) {
                this.value = "";
                this._inputToolip = false;
            }
        };
        var onBlurFocusHandle = function () {
            if ((this.value.length == 0) && (this._tooltipTxt.length > 0)) {
                this.value = this._tooltipTxt;
                this._inputToolip = true;
            }
        };
        this._edTxt.onfocus = onFocusHandle;
        this._edTxt.onblur = onBlurFocusHandle;
    },

    onEnter:function () {
        //
    },

    onExit:function () {
        this.disposeEditBox();
    },

    setWidth:function (w) {
        this._edWidth = w;
        this._edDiv.style.width = w.toString() + "px";
    },
    setHeight:function (h) {
        this._edHeight = h;
        this._edDiv.style.height = h.toString() + "px";
    },
    /**
     * * Set the font-size in the edit box.
     * * @param font-size of int.
     * */
    setContentSize:function (size) {
        this._edFontSize = size;
        this._edTxt.style.fontSize = this._edFontSize + "px";
    },
    /**
     * * Set the text entered in the edit box.
     * * @param pText The given text.
     * */
    setText:function (text) {
        this._edTxt.value = text;
    },
    /**
     *  Set the font color of the widget's text.
     */
    setFontColor:function (color) {
        this._edTxt.style.color = cc.convertColor3BtoHexString(color);
    },
    /**
     *  Set the background-color edit text.
     */
    setBgClr:function (color) {
        this._edDiv.style.backgroundColor = cc.convertColor3BtoHexString(color);
    },
    /**
     *  Set the border-color edit text.
     */
    setBorderClr:function (color) {
        this._edDiv.style.borderColor = cc.convertColor3BtoHexString(color);
    },

    /**
     * Sets the maximum input length of the edit box.
     * @param maxLength The maximum length.
     */
    setMaxLength:function (maxLength) {
        if (!isNaN(maxLength) && maxLength > 0) {
            this._edTxt.maxLength = maxLength;
        }
    },

    /**
     * Gets the maximum input length of the edit box.     *     * @return Maximum input length.
     */
    getMaxLength:function () {
        return this._edTxt.maxLength;
    },

    /**
     *  Set the position of edit text.
     */
    setPosition:function (x, y) {
        this._edDiv.style.position = "absolute";
        this._edDiv.style.left = x.toString() + "px";
        this._edDiv.style.top = y.toString() + "px";
    },

    /**
     *  Set the zindex of edit text.
     */
    setZIndex:function (z) {
        this._edDiv.zIndex = z;
    },

    /**
     *  Set the background-image of edit text.
     */
    setImgStyle:function (url) {
        this._edDiv.style.backgroundImage = "url('" + url + "')";
        this._edDiv.style.border = 0;
    },

    /**
     * Set a text in the edit box that acts as a placeholder when an edit box is empty.
     * @param pText The given text.
     */
    setPlaceHolder:function (text) {
        this._inputTooltip = true;
        this.tooltip = true;
        this._edTxt._inputToolip = this._inputTooltip;
        this._edTxt.value = text;
        this._edTxt._tooltipTxt = text;
    },

    /**
     * Set the input flags that are to be applied to the edit box.
     * @param inputFlag One of the EditBoxInputFlag constants.
     * e.g.cc.EDITBOX_INPUT_FLAG_PASSWORD
     */
    setInputFlag:function (inputMode) {
        if (inputMode == cc.EDITBOX_INPUT_FLAG_PASSWORD) {
            this._edTxt.type = "password";
        } else {
            this._edTxt.type = "text";
        }
    },
    /**
     * Gets the  input string of the edit box.
     */
    getText:function () {
        return this._edTxt.value;
    },

    /**
     * Hide the   edit box.
     */
    hideEditBox:function () {
        this._edDiv.style.display = "none";
    },
    /**
     * * Init edit box with specified size.
     * * @param size The size and background-color.     */
    initWithSizeAndBackgroundSprite:function (size, normal9SpriteBg) {
        this._edWidth = size.width;
        this._edDiv.style.width = this._edWidth.toString() + "px";
        this._edHeight = size.height;
        this._edDiv.style.height = this._edHeight.toString() + "px";
        this._edDiv.style.backgroundColor = cc.convertColor3BtoHexString(normal9SpriteBg);
    },

    /**
     * dispose EditBox
     * remove the editbox' div and input from there parentnode
     */
    disposeEditBox:function()
    {
        var divNode = this._edDiv;
        this._edDiv.parentNode.removeChild(divNode);
        var txtNode = this._edTxt;
        this._edTxt.parentNode.removeChild(txtNode);
    },

    /* override functions */
    setDelegate:function (delegate) {
    },
    setPlaceholderFontColor:function (color) {
    },
    getPlaceHolder:function () {
    },
    setInputMode:function () {
    },
    setReturnType:function (returnType) {
    },
    visit:function () {
    },
    keyboardWillShow:function (info) {
    },
    keyboardDidShow:function (info) {
    },
    keyboardWillHide:function (info) {
    },
    keyboardDidHide:function (info) {
    },
    touchDownAction:function (sender, controlEvent) {
    },
    ccEditBoxDelegate:function (editBox) {
    },
    editBoxEditingDidBegin:function (editBox) {
    },
    editBoxEditingDidEnd:function (editBox) {
    },
    editBoxTextChanged:function (editBox, text) {
    },
    editBoxReturn:function (editBox) {
        return 0
    }
});

/**
 * * create a edit box with size and background-color     *
 * */
cc.ControlEditBox.create = function (size, normal9SpriteBg) {
    var edbox1 = new cc.ControlEditBox(size.width, size.height, 14);
    edbox1.setBgClr(normal9SpriteBg);
    cc.$("#Cocos2dGameContainer").appendChild(edbox1._edDiv);
    return edbox1;
};




