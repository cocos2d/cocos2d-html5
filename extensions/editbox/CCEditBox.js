/****************************************************************************
 Copyright (c) 2013-2016 Chukong Technologies Inc.
 Copyright (c) 2012 James Chen
 Copyright (c) 2011-2012 cocos2d-x.org

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

// https://segmentfault.com/q/1010000002914610
var SCROLLY = 40;
var TIMER_NAME = 400;
var LEFT_PADDING = 2;

function scrollWindowUp(editBox) {
    if (cc.sys.os === cc.sys.OS_IOS && cc.sys.osMainVersion === 9) {
        var worldPos = editBox.convertToWorldSpace(cc.p(0,0));
        var windowHeight = cc.visibleRect.height;
        var windowWidth = cc.visibleRect.width;
        var factor = 0.5;
        if(windowWidth > windowHeight) {
            factor = 0.7;
        }
        setTimeout(function() {
            if(window.scrollY < SCROLLY && worldPos.y < windowHeight * factor) {
                var scrollOffset = windowHeight * factor - worldPos.y - window.scrollY;
                if (scrollOffset < 35) scrollOffset = 35;
                if (scrollOffset > 320) scrollOffset = 320;
                window.scrollTo(0, scrollOffset);
            }
        }, TIMER_NAME);
    }
}

var capitalize = function(string) {
    return string.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * @constant
 * @type Number
 */
cc.KEYBOARD_RETURNTYPE_DEFAULT = 0;

/**
 * @constant
 * @type Number
 */
cc.KEYBOARD_RETURNTYPE_DONE = 1;

/**
 * @constant
 * @type Number
 */
cc.KEYBOARD_RETURNTYPE_SEND = 2;

/**
 * @constant
 * @type Number
 */
cc.KEYBOARD_RETURNTYPE_SEARCH = 3;

/**
 * @constant
 * @type Number
 */
cc.KEYBOARD_RETURNTYPE_GO = 4;

/**
 * The EditBoxInputMode defines the type of text that the user is allowed * to enter.
 * @constant
 * @type Number
 */
cc.EDITBOX_INPUT_MODE_ANY = 0;

/**
 * The user is allowed to enter an e-mail address.
 * @constant
 * @type Number
 */
cc.EDITBOX_INPUT_MODE_EMAILADDR = 1;

/**
 * The user is allowed to enter an integer value.
 * @constant
 * @type Number
 */
cc.EDITBOX_INPUT_MODE_NUMERIC = 2;

/**
 * The user is allowed to enter a phone number.
 * @constant
 * @type Number
 */
cc.EDITBOX_INPUT_MODE_PHONENUMBER = 3;

/**
 * The user is allowed to enter a URL.
 * @constant
 * @type Number
 */
cc.EDITBOX_INPUT_MODE_URL = 4;

/**
 * The user is allowed to enter a real number value.
 * This extends kEditBoxInputModeNumeric by allowing a decimal point.
 * @constant
 * @type Number
 */
cc.EDITBOX_INPUT_MODE_DECIMAL = 5;

/**
 * The user is allowed to enter any text, except for line breaks.
 * @constant
 * @type Number
 */
cc.EDITBOX_INPUT_MODE_SINGLELINE = 6;

/**
 * Indicates that the text entered is confidential data that should be
 * obscured whenever possible. This implies EDIT_BOX_INPUT_FLAG_SENSITIVE.
 * @constant
 * @type Number
 */
cc.EDITBOX_INPUT_FLAG_PASSWORD = 0;

/**
 * Indicates that the text entered is sensitive data that the
 * implementation must never store into a dictionary or table for use
 * in predictive, auto-completing, or other accelerated input schemes.
 * A credit card number is an example of sensitive data.
 * @constant
 * @type Number
 */
cc.EDITBOX_INPUT_FLAG_SENSITIVE = 1;

/**
 * This flag is a hint to the implementation that during text editing,
 * the initial letter of each word should be capitalized.
 * @constant
 * @type Number
 */
cc.EDITBOX_INPUT_FLAG_INITIAL_CAPS_WORD = 2;

/**
 * This flag is a hint to the implementation that during text editing,
 * the initial letter of each sentence should be capitalized.
 * @constant
 * @type Number
 */
cc.EDITBOX_INPUT_FLAG_INITIAL_CAPS_SENTENCE = 3;

/**
 * Capitalize all characters automatically.
 * @constant
 * @type Number
 */
cc.EDITBOX_INPUT_FLAG_INITIAL_CAPS_ALL_CHARACTERS = 4;

/**
 * @class
 * @extends cc._Class
 */
cc.EditBoxDelegate = cc.Class.extend({
    /**
     * This method is called when an edit box gains focus after keyboard is shown.
     * @param {cc.EditBox} sender
     */
    editBoxEditingDidBegan: function (sender) {
    },

    /**
     * This method is called when an edit box loses focus after keyboard is hidden.
     * @param {cc.EditBox} sender
     */
    editBoxEditingDidEnded: function (sender) {
    },

    /**
     * This method is called when the edit box text was changed.
     * @param {cc.EditBox} sender
     * @param {String} text
     */
    editBoxTextChanged: function (sender, text) {
    },

    /**
     * This method is called when the return button was pressed.
     * @param {cc.EditBox} sender
     */
    editBoxEditingReturn: function (sender) {
    }
});


/**
 * <p>cc.EditBox is a brief Class for edit box.<br/>
 * You can use this widget to gather small amounts of text from the user.</p>
 *
 */
cc.EditBox = cc.Node.extend({
    _backgroundSprite: null,
    _delegate: null,
    _editBoxInputMode: cc.EDITBOX_INPUT_MODE_SINGLELINE,
    _editBoxInputFlag: cc.EDITBOX_INPUT_FLAG_SENSITIVE,
    _keyboardReturnType: cc.KEYBOARD_RETURNTYPE_DEFAULT,
    _maxLength: 50,
    _text: '',
    _textColor: null,
    _placeholderText: '',
    _placeholderFontName: '',
    _placeholderFontSize: 14,
    _placeholderColor: null,
    _className: 'EditBox',

    ctor: function (size, normal9SpriteBg) {
        cc.Node.prototype.ctor.call(this);

        this._textColor = cc.color.WHITE;
        this._placeholderColor = cc.color.GRAY;
        cc.Node.prototype.setContentSize.call(this, size);

        this._renderCmd._createLabels();
        this.createDomElementIfNeeded();

        this.initWithSizeAndBackgroundSprite(size, normal9SpriteBg);

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this._onTouchBegan.bind(this),
            onTouchEnded: this._onTouchEnded.bind(this)
        }, this);

        this.setInputFlag(this._editBoxInputFlag);
    },

    _createRenderCmd: function () {
        if (cc._renderType === cc.game.RENDER_TYPE_CANVAS) {
            return new cc.EditBox.CanvasRenderCmd(this);
        } else {
            return new cc.EditBox.WebGLRenderCmd(this);
        }
    },

    setContentSize: function (width, height) {
        if (width.width !== undefined && width.height !== undefined) {
            height = width.height;
            width = width.width;
        }
        cc.Node.prototype.setContentSize.call(this, width, height);
        this._updateEditBoxSize(width, height);
    },

    setVisible: function ( visible ) {
        cc.Node.prototype.setVisible.call(this, visible);
        this._renderCmd.updateVisibility();
    },

    createDomElementIfNeeded: function () {
        if(!this._renderCmd._edTxt) {
            this._renderCmd.createNativeControl();
        }
    },

    cleanup: function () {
        this._super();

        this._renderCmd._removeDomInputControl();
    },

    _onTouchBegan: function (touch) {
        var touchPoint = touch.getLocation();
        var bb = cc.rect(0,0, this._contentSize.width, this._contentSize.height);
        var hitted = cc.rectContainsPoint(bb, this.convertToNodeSpace(touchPoint));
        if(hitted) {
            return true;
        }
        else {
            this._renderCmd.hidden();
            return false;
        }
    },

    _onTouchEnded: function () {
        this._renderCmd.show();
    },

    _updateBackgroundSpriteSize: function (width, height) {
        if(this._backgroundSprite) {
            this._backgroundSprite.setContentSize(width, height);
        }
    },

    _updateEditBoxSize: function(size, height) {
        var newWidth = (typeof size.width === 'number') ? size.width : size;
        var newHeight = (typeof size.height === 'number') ? size.height : height;

        this._updateBackgroundSpriteSize(newWidth, newHeight);
        this._renderCmd.updateSize(newWidth, newHeight);
    },

    setLineHeight: function (lineHeight) {
        this._renderCmd.setLineHeight(lineHeight);
    },

    setFont: function (fontName, fontSize) {
        this._renderCmd.setFont(fontName, fontSize);
    },

    _setFont: function (fontStyle) {
        this._renderCmd._setFont(fontStyle);
    },

    getBackgroundSprite: function() {
        return this._backgroundSprite;
    },

    setFontName: function (fontName) {
        this._renderCmd.setFontName(fontName);
    },

    setFontSize: function (fontSize) {
        this._renderCmd.setFontSize(fontSize);
    },

    setString: function (text) {
        if (text.length >= this._maxLength) {
            text = text.slice(0, this._maxLength);
        }
        this._text = text;
        this._renderCmd.setString(text);
    },

    setFontColor: function (color) {
        this._textColor = color;
        this._renderCmd.setFontColor(color);
    },

    setMaxLength: function (maxLength) {
        if (!isNaN(maxLength) && maxLength > 0) {
            this._maxLength = maxLength;
            this._renderCmd.setMaxLength(maxLength);
        }
    },

    getMaxLength: function () {
        return this._maxLength;
    },

    setPlaceHolder: function (text) {
        if (text !== null) {
            this._renderCmd.setPlaceHolder(text);
            this._placeholderText = text;
        }
    },

    setPlaceholderFont: function (fontName, fontSize) {
        this._placeholderFontName = fontName;
        this._placeholderFontSize = fontSize;
        this._renderCmd._updateDOMPlaceholderFontStyle();
    },

    _setPlaceholderFont: function (fontStyle) {
        var res = cc.LabelTTF._fontStyleRE.exec(fontStyle);
        if (res) {
            this._placeholderFontName = res[2];
            this._placeholderFontSize = parseInt(res[1]);
            this._renderCmd._updateDOMPlaceholderFontStyle();
        }
    },

    setPlaceholderFontName: function (fontName) {
        this._placeholderFontName = fontName;
        this._renderCmd._updateDOMPlaceholderFontStyle();
    },

    setPlaceholderFontSize: function (fontSize) {
        this._placeholderFontSize = fontSize;
        this._renderCmd._updateDOMPlaceholderFontStyle();
    },

    setPlaceholderFontColor: function (color) {
        this._placeholderColor = color;
        this._renderCmd.setPlaceholderFontColor(color);
    },

    setInputFlag: function (inputFlag) {
        this._editBoxInputFlag = inputFlag;
        this._renderCmd.setInputFlag(inputFlag);
    },

    getString: function () {
        return this._text;
    },

    initWithSizeAndBackgroundSprite: function (size, normal9SpriteBg) {
        if(this._backgroundSprite) {
            this._backgroundSprite.removeFromParent();
        }
        this._backgroundSprite = normal9SpriteBg;
        this.setContentSize(size);

        if(this._backgroundSprite && !this._backgroundSprite.parent) {
            this._backgroundSprite.setAnchorPoint(cc.p(0, 0));
            this.addChild(this._backgroundSprite);

            this._updateBackgroundSpriteSize(size.width, size.height);
        }


        this.x = 0;
        this.y = 0;
        return true;
    },

    setDelegate: function (delegate) {
        this._delegate = delegate;
    },

    getPlaceHolder: function () {
        return this._placeholderText;
    },

    setInputMode: function (inputMode) {
        if (this._editBoxInputMode === inputMode) return;

        var oldText = this.getString();
        this._editBoxInputMode = inputMode;

        this._renderCmd.setInputMode(inputMode);
        this._renderCmd.transform();

        this.setString(oldText);
        this._renderCmd._updateLabelPosition(this.getContentSize());
    },

    setReturnType: function (returnType) {
        this._keyboardReturnType = returnType;
    },

    initWithBackgroundColor: function (size, bgColor) {
        this._edWidth = size.width;
        this.dom.style.width = this._edWidth.toString() + 'px';
        this._edHeight = size.height;
        this.dom.style.height = this._edHeight.toString() + 'px';
        this.dom.style.backgroundColor = cc.colorToHex(bgColor);
    }
});

var _p = cc.EditBox.prototype;

// Extended properties
cc.defineGetterSetter(_p, 'font', null, _p._setFont);
cc.defineGetterSetter(_p, 'fontName', null, _p.setFontName);
cc.defineGetterSetter(_p, 'fontSize', null, _p.setFontSize);
cc.defineGetterSetter(_p, 'fontColor', null, _p.setFontColor);
cc.defineGetterSetter(_p, 'string', _p.getString, _p.setString);
cc.defineGetterSetter(_p, 'maxLength', _p.getMaxLength, _p.setMaxLength);
cc.defineGetterSetter(_p, 'placeholder', _p.getPlaceHolder, _p.setPlaceHolder);
cc.defineGetterSetter(_p, 'placeholderFont', null, _p._setPlaceholderFont);
cc.defineGetterSetter(_p, 'placeholderFontName', null, _p.setPlaceholderFontName);
cc.defineGetterSetter(_p, 'placeholderFontSize', null, _p.setPlaceholderFontSize);
cc.defineGetterSetter(_p, 'placeholderFontColor', null, _p.setPlaceholderFontColor);
cc.defineGetterSetter(_p, 'inputFlag', null, _p.setInputFlag);
cc.defineGetterSetter(_p, 'delegate', null, _p.setDelegate);
cc.defineGetterSetter(_p, 'inputMode', null, _p.setInputMode);
cc.defineGetterSetter(_p, 'returnType', null, _p.setReturnType);

_p = null;

(function (editbox) {
    editbox._polyfill = {
        zoomInvalid: false
    };

    if (cc.sys.OS_ANDROID === cc.sys.os
        && (cc.sys.browserType === cc.sys.BROWSER_TYPE_SOUGOU
            || cc.sys.browserType === cc.sys.BROWSER_TYPE_360)) {
        editbox._polyfill.zoomInvalid = true;
    }
})(cc.EditBox);

(function (polyfill) {
    var EditBoxImpl = function () {
    };

    var proto = EditBoxImpl.prototype = Object.create(Object.prototype);

    proto.updateMatrix = function () {
        if (!this._edTxt) return;

        var node = this._node, scaleX = cc.view._scaleX, scaleY = cc.view._scaleY;
        var dpr = cc.view._devicePixelRatio;
        var t = this._worldTransform;

        scaleX /= dpr;
        scaleY /= dpr;

        var container = cc.game.container;
        var a = t.a * scaleX, b = t.b, c = t.c, d = t.d * scaleY;

        var offsetX = container && container.style.paddingLeft &&  parseInt(container.style.paddingLeft);
        var offsetY = container && container.style.paddingBottom && parseInt(container.style.paddingBottom);
        var tx = t.tx * scaleX + offsetX, ty = t.ty * scaleY + offsetY;

        if (polyfill.zoomInvalid) {
            this.updateSize(node._contentSize.width * a, node._contentSize.height * d);
            a = 1;
            d = 1;
        }

        var matrix = "matrix(" + a + "," + -b + "," + -c + "," + d + "," + tx + "," + -ty + ")";
        this._edTxt.style['transform'] = matrix;
        this._edTxt.style['-webkit-transform'] = matrix;
        this._edTxt.style['transform-origin'] = '0px 100% 0px';
        this._edTxt.style['-webkit-transform-origin'] = '0px 100% 0px';
    };

    proto.updateVisibility = function () {
        if (!this._edTxt) return;

        var node = this._node;
        var editBox = this._edTxt;
        if (node.visible) {
            editBox.style.visibility = 'visible';
            cc.game.container.appendChild(editBox);
        } else {
            editBox.style.visibility = 'hidden';
            var hasChild = false;
            if('contains' in cc.game.container) {
                hasChild = cc.game.container.contains(editBox);
            }else {
                hasChild = cc.game.container.compareDocumentPosition(editBox) % 16;
            }
            if(hasChild)
                cc.game.container.removeChild(editBox);
        }
    };

    proto._createDomInput = function () {
        this._removeDomInputControl();
        var thisPointer = this;
        var tmpEdTxt = this._edTxt = document.createElement('input');
        tmpEdTxt.type = 'text';
        tmpEdTxt.style.fontSize = this._edFontSize + 'px';
        tmpEdTxt.style.color = '#000000';
        tmpEdTxt.style.border = 0;
        tmpEdTxt.style.background = 'transparent';
        tmpEdTxt.style.width = '100%';
        tmpEdTxt.style.height = '100%';
        tmpEdTxt.style.active = 0;
        tmpEdTxt.style.outline = 'medium';
        tmpEdTxt.style.padding = '0';
        tmpEdTxt.style.textTransform = 'uppercase';
        tmpEdTxt.style.display = 'none';

        tmpEdTxt.style.position = "absolute";
        tmpEdTxt.style.bottom = "0px";
        tmpEdTxt.style.left = LEFT_PADDING + "px";
        tmpEdTxt.style.className = "cocosEditBox";
        this.setMaxLength(thisPointer._editBox._maxLength);

        tmpEdTxt.addEventListener('input', function () {
            var editBox = thisPointer._editBox;


            if (this.value.length > this._maxLength) {
                this.value = this.value.slice(0, this._maxLength);
            }

            if (editBox._delegate && editBox._delegate.editBoxTextChanged) {
                if (editBox._text.toLowerCase() !== this.value.toLowerCase()) {
                    editBox._text = this.value;
                    thisPointer._updateEditBoxContentStyle();
                    editBox._delegate.editBoxTextChanged(editBox, editBox._text);
                }
            }
        });
        tmpEdTxt.addEventListener('keypress', function (e) {
            var editBox = thisPointer._editBox;

            if (e.keyCode === cc.KEY.enter) {
                e.stopPropagation();
                e.preventDefault();
                if(this.value === '') {
                    this.style.fontSize = editBox._placeholderFontSize + 'px';
                    this.style.color = cc.colorToHex(editBox._placeholderColor);
                }

                editBox._text = this.value;
                thisPointer._updateEditBoxContentStyle();
                thisPointer.hidden();
                if (editBox._delegate && editBox._delegate.editBoxEditingReturn) {
                    editBox._delegate.editBoxEditingReturn(editBox);
                }
                cc._canvas.focus();
            }
        });

        tmpEdTxt.addEventListener('focus', function () {
            var editBox = thisPointer._editBox;
            this.style.fontSize = thisPointer._edFontSize + 'px';
            this.style.color = cc.colorToHex(editBox._textColor);
            if(cc.view.isAutoFullScreenEnabled()) {
                thisPointer.__fullscreen = true;
                cc.view.enableAutoFullScreen(false);
                cc.screen.exitFullScreen();
            } else {
                thisPointer.__fullscreen = false;
            }

            scrollWindowUp(editBox);

            if (editBox._delegate && editBox._delegate.editBoxEditingDidBegan) {
                editBox._delegate.editBoxEditingDidBegan(editBox);
            }
        });
        tmpEdTxt.addEventListener('blur', function () {
            var editBox = thisPointer._editBox;
            editBox._text = this.value;
            thisPointer._updateEditBoxContentStyle();
            if(thisPointer.__fullscreen) {
                cc.view.enableAutoFullScreen(true);
            }
            window.scrollY = 0;
            if (editBox._delegate && editBox._delegate.editBoxEditingDidEnded) {
                editBox._delegate.editBoxEditingDidEnded(editBox);
            }

            if (this.value === '') {
                this.style.fontSize = editBox._placeholderFontSize + 'px';
                this.style.color = cc.colorToHex(editBox._placeholderColor);
            }
            thisPointer.hidden();
        });
        return tmpEdTxt;
    };

    proto._createDomTextArea = function () {
        this._removeDomInputControl();
        var thisPointer = this;
        var tmpEdTxt = this._edTxt = document.createElement('textarea');
        tmpEdTxt.type = 'text';
        tmpEdTxt.style.fontSize = this._edFontSize + 'px';
        tmpEdTxt.style.color = '#000000';
        tmpEdTxt.style.border = 0;
        tmpEdTxt.style.background = 'transparent';
        tmpEdTxt.style.width = '100%';
        tmpEdTxt.style.height = '100%';
        tmpEdTxt.style.active = 0;
        tmpEdTxt.style.outline = 'medium';
        tmpEdTxt.style.padding = '0';
        tmpEdTxt.style.resize = 'none';
        tmpEdTxt.style.textTransform = 'uppercase';
        tmpEdTxt.style.overflow_y = 'scroll';
        tmpEdTxt.style.display = 'none';
        tmpEdTxt.style.position = "absolute";
        tmpEdTxt.style.bottom = "0px";
        tmpEdTxt.style.left = LEFT_PADDING + "px";
        tmpEdTxt.style.className = "cocosEditBox";
        this.setMaxLength(thisPointer._editBox._maxLength);

        tmpEdTxt.addEventListener('input', function () {
            if (this.value.length > this._maxLength) {
                this.value = this.value.slice(0, this._maxLength);
            }

            var editBox = thisPointer._editBox;
            if (editBox._delegate && editBox._delegate.editBoxTextChanged) {
                if(editBox._text.toLowerCase() !== this.value.toLowerCase()) {
                    editBox._text = this.value;
                    thisPointer._updateEditBoxContentStyle();
                    editBox._delegate.editBoxTextChanged(editBox, editBox._text);
                }
            }
        });

        tmpEdTxt.addEventListener('focus', function () {
            var editBox = thisPointer._editBox;

            this.style.fontSize = thisPointer._edFontSize + 'px';
            this.style.color = cc.colorToHex(editBox._textColor);
            if(cc.view.isAutoFullScreenEnabled()) {
                thisPointer.__fullscreen = true;
                cc.view.enableAutoFullScreen(false);
                cc.screen.exitFullScreen();
            } else {
                thisPointer.__fullscreen = false;
            }

            scrollWindowUp(editBox);

            if (editBox._delegate && editBox._delegate.editBoxEditingDidBegan) {
                editBox._delegate.editBoxEditingDidBegan(editBox);
            }

        });
        tmpEdTxt.addEventListener('keypress', function (e) {
            var editBox = thisPointer._editBox;

            if (e.keyCode === cc.KEY.enter) {
                e.stopPropagation();

                if (editBox._delegate && editBox._delegate.editBoxEditingReturn) {
                    editBox._delegate.editBoxEditingReturn(editBox);
                }
            }
        });
        tmpEdTxt.addEventListener('blur', function () {
            var editBox = thisPointer._editBox;
            editBox._text = this.value;
            thisPointer._updateEditBoxContentStyle();
            window.scrollY = 0;
            if(thisPointer.__fullscreen) {
                cc.view.enableAutoFullScreen(true);
            }

            if (editBox._delegate && editBox._delegate.editBoxEditingDidEnded) {
                editBox._delegate.editBoxEditingDidEnded(editBox);
            }

            if (this.value === '') {
                this.style.fontSize = editBox._placeholderFontSize + 'px';
                this.style.color = cc.colorToHex(editBox._placeholderColor);
            }

            thisPointer.hidden();
        });

        return tmpEdTxt;
    };

    proto._createLabels = function () {
        var editBoxSize = this._editBox.getContentSize();
        this._textLabel = new cc.LabelTTF();
        this._textLabel.setVisible(false);
        this._textLabel.setAnchorPoint(cc.p(0, 1));
        this._editBox.addChild(this._textLabel, 100);

        this._placeholderLabel = new cc.LabelTTF();
        this._placeholderLabel.setAnchorPoint(cc.p(0, 1));
        this._placeholderLabel.setColor(cc.color.GRAY);
        this._editBox.addChild(this._placeholderLabel, 100);

        this._updateLabelPosition(editBoxSize);
    };

    proto._updateLabelPosition = function (editBoxSize) {
        var labelContentSize = cc.size(editBoxSize.width - LEFT_PADDING, editBoxSize.height);
        this._textLabel.setContentSize(labelContentSize);
        this._textLabel.setDimensions(labelContentSize);
        this._placeholderLabel.setLineHeight(editBoxSize.height);
        var placeholderLabelSize = this._placeholderLabel.getContentSize();

        if (this._editBox._editBoxInputMode === cc.EDITBOX_INPUT_MODE_ANY){
            this._textLabel.setPosition(LEFT_PADDING, editBoxSize.height);
            this._placeholderLabel.setPosition(LEFT_PADDING, editBoxSize.height);
            this._placeholderLabel.setVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
            this._textLabel.setVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_TOP);
            // this._textLabel.enableWrapText(true);
        }
        else {
            // this._textLabel.enableWrapText(false);
            this._textLabel.setPosition(LEFT_PADDING, editBoxSize.height);
            this._placeholderLabel.setPosition(LEFT_PADDING, (editBoxSize.height + placeholderLabelSize.height) / 2);
            this._placeholderLabel.setVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
            this._textLabel.setVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        }

    };

    proto.setLineHeight = function (lineHeight) {
        this._textLabel.setLineHeight(lineHeight);
    };

    proto._hiddenLabels = function () {
        this._textLabel.setVisible(false);
        this._placeholderLabel.setVisible(false);
    };

    proto._updateEditBoxContentStyle = function() {
        var inputFlag = this._editBox._editBoxInputFlag;
        if (inputFlag === cc.EDITBOX_INPUT_FLAG_INITIAL_CAPS_ALL_CHARACTERS) {
            this._editBox._text = this._editBox._text.toUpperCase();
        }
        else if (inputFlag === cc.EDITBOX_INPUT_FLAG_INITIAL_CAPS_WORD) {
            this._editBox._text = capitalize(this._editBox._text);
        }
        else if (inputFlag === cc.EDITBOX_INPUT_FLAG_INITIAL_CAPS_SENTENCE) {
            this._editBox._text = capitalizeFirstLetter(this._editBox._text);
        }
    };

    proto._updateLabelString = function() {
        this._updateInputType();

        this._textLabel.setVisible(true);
        this._textLabel.setString(this._editBox._text);
        if (this._edTxt.type === 'password') {
            var passwordString = '';
            var len = this._editBox._text.length;
            for (var i = 0; i < len; ++i) {
                passwordString += '\u25CF';
            }
            this._textLabel.setString(passwordString);
        } else {
            this._updateEditBoxContentStyle();
            this._textLabel.setString(this._editBox._text);
        }
    };

    proto._showLabels = function () {
        this._hiddenLabels();
        if (this._edTxt.value === '') {
            this._placeholderLabel.setVisible(true);
            this._placeholderLabel.setString(this._editBox._placeholderText);
        }
        else {
            this._updateLabelString();
        }
    };

    proto.show = function() {
        if (this._edTxt.style.display === 'none') {
            this._edTxt.style.display = '';
            this._edTxt.focus();
            this._hiddenLabels();
        }
    };

    proto.hidden = function() {
        this._edTxt.style.display = 'none';
        this._showLabels();
    };

    proto._setFont = function (fontStyle) {
        var res = cc.LabelTTF._fontStyleRE.exec(fontStyle);
        var textFontName = res[2];
        var textFontSize = parseInt(res[1]);
        if (res) {
            this.setFont(textFontName, textFontSize);
        }
    };

    proto.setFont = function (fontName, fontSize) {
        this._edFontName = fontName || this._edFontName;
        this._edFontSize = fontSize || this._edFontSize;
        this._updateDOMFontStyle();
    };

    proto.setFontName = function (fontName) {
        this._edFontName = fontName || this._edFontName;
        this._updateDOMFontStyle();
    };

    proto.setFontSize = function (fontSize) {
        this._edFontSize = fontSize || this._edFontSize;
        this._updateDOMFontStyle();
    };

    proto.setFontColor = function (color) {
        if(!this._edTxt) return;

        if (this._edTxt.value !== this._editBox._placeholderText) {
            this._edTxt.style.color = cc.colorToHex(color);
        }
        this._textLabel.setColor(color);
    };

    proto.setPlaceHolder = function (text) {
        this._placeholderLabel.setString(text);
    };

    proto.setMaxLength = function (maxLength) {
        if(!this._edTxt) return;
        this._edTxt.maxLength = maxLength;
    };

    proto._updateDOMPlaceholderFontStyle = function () {
        this._placeholderLabel.setFontFileOrFamily(this._editBox._placeholderFontName);
        this._placeholderLabel.setFontSize(this._editBox._placeholderFontSize);
    };

    proto.setPlaceholderFontColor = function (color) {
        this._placeholderLabel.setColor(color);
    };

    proto._updateInputType = function () {
        if(this._editBox._keyboardReturnType === cc.KEYBOARD_RETURNTYPE_SEARCH) {
            this._edTxt.type = 'search';
        }

        var inputMode = this._editBox._editBoxInputMode;
        if(inputMode === cc.EDITBOX_INPUT_MODE_EMAILADDR) {
            this._edTxt.type = 'email';
        } else if(inputMode === cc.EDITBOX_INPUT_MODE_DECIMAL ||
                 inputMode === cc.EDITBOX_INPUT_MODE_NUMERIC) {
            this._edTxt.type = 'number';
        } else if(inputMode === cc.EDITBOX_INPUT_MODE_PHONENUMBER) {
            this._edTxt.type = 'number';
            this._edTxt.pattern = '[0-9]*';
        } else if(inputMode === cc.EDITBOX_INPUT_MODE_URL) {
            this._edTxt.type = 'url';
        } else {
            this._edTxt.type = 'text';
        }


        if (this._editBox._editBoxInputFlag === cc.EDITBOX_INPUT_FLAG_PASSWORD) {
            this._edTxt.type = 'password';
        }
    };

    proto.setInputFlag = function (inputFlag) {
        if(!this._edTxt) return;

        this._updateInputType();

        this._edTxt.style.textTransform = 'none';

        if (inputFlag === cc.EDITBOX_INPUT_FLAG_INITIAL_CAPS_ALL_CHARACTERS) {
            this._edTxt.style.textTransform = 'uppercase';
        }
        else if (inputFlag === cc.EDITBOX_INPUT_FLAG_INITIAL_CAPS_WORD) {
            this._edTxt.style.textTransform = 'capitalize';
        }
        this._updateLabelString();
    };

    proto.setInputMode = function (inputMode) {
        this._removeDomInputControl();
        if (inputMode === cc.EDITBOX_INPUT_MODE_ANY) {
            this._createDomTextArea();
        }
        else {
            this._createDomInput();
        }
        this._addDomInputControl();

        this._updateInputType();
        var contentSize = this._node.getContentSize();
        this.updateSize(contentSize.width, contentSize.height);
    };

    proto.setString = function (text) {
        if(!this._edTxt) return;

        if (text !== null) {
            this._edTxt.value = text;

            if (text === '') {
                this._placeholderLabel.setString(this._editBox._placeholderText);
                this._placeholderLabel.setColor(this._editBox._placeholderColor);
                this._placeholderLabel.setVisible(true);
                this._textLabel.setVisible(false);
            }
            else {
                this._edTxt.style.color = cc.colorToHex(this._editBox._textColor);
                this._textLabel.setColor(this._editBox._textColor);
                this._placeholderLabel.setVisible(false);

                this._updateLabelString();
            }
        }
    };

    proto._updateDOMFontStyle = function() {
        if(!this._edTxt) return;

        if (this._edTxt.value !== '') {
            this._edTxt.style.fontFamily = this._edFontName;
            this._edTxt.style.fontSize = this._edFontSize + 'px';
        }
        this._textLabel.setFontSize(this._edFontSize);
        this._textLabel.setFontFileOrFamily(this._edFontName);
    };


    proto.updateSize = function(newWidth, newHeight) {
        var editboxDomNode = this._edTxt;
        if (!editboxDomNode) return;

        editboxDomNode.style['width'] = newWidth + 'px';
        editboxDomNode.style['height'] = newHeight + 'px';

        this._updateLabelPosition(cc.size(newWidth, newHeight));
    };

    proto.createNativeControl = function() {
        this._createDomInput();
        this._addDomInputControl();
    };

    proto._addDomInputControl = function () {
        cc.game.container.appendChild(this._edTxt);
    };

    proto._removeDomInputControl = function () {
        var editBox = this._edTxt;
        if(editBox){
            var hasChild = false;
            if('contains' in cc.game.container) {
                hasChild = cc.game.container.contains(editBox);
            }else {
                hasChild = cc.game.container.compareDocumentPosition(editBox) % 16;
            }
            if(hasChild)
                cc.game.container.removeChild(editBox);
        }
        this._edTxt = null;
    };

    proto.initializeRenderCmd = function (node) {
        this._editBox = node;

        //it's a dom node, may be assigned with Input or TextArea.
        this._edFontSize = 14;
        this._edFontName = 'Arial';
        this._textLabel = null;
        this._placeholderLabel = null;
    };

    //define the canvas render command
    cc.EditBox.CanvasRenderCmd = function (node) {
        cc.Node.CanvasRenderCmd.call(this, node);
        this.initializeRenderCmd(node);
    };

    var canvasRenderCmdProto = cc.EditBox.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);

    function _getPropertyDescriptor (obj, name) {
        var pd = Object.getOwnPropertyDescriptor(obj, name);
        if (pd) {
            return pd;
        }
        var p = Object.getPrototypeOf(obj);
        if (p) {
            return _getPropertyDescriptor(p, name);
        }
        else {
            return null;
        }
    }

    function _copyprop(name, source, target) {
        var pd = _getPropertyDescriptor(source, name);
        Object.defineProperty(target, name, pd);
    }

    var _mixin = function (obj) {
        obj = obj || {};
        for (var i = 1, length = arguments.length; i < length; i++) {
            var source = arguments[i];
            if (source) {
                if (typeof source !== 'object') {
                    cc.error('cc.js.mixin: arguments must be type object:', source);
                    continue;
                }
                for ( var name in source) {
                    _copyprop( name, source, obj);
                }
            }
        }
        return obj;
    };

    _mixin(canvasRenderCmdProto, proto);
    canvasRenderCmdProto.constructor = cc.EditBox.CanvasRenderCmd;

    canvasRenderCmdProto.transform = function (parentCmd, recursive) {
        this.originTransform(parentCmd, recursive);
        this.updateMatrix();
    };


    //define the webgl render command
    cc.EditBox.WebGLRenderCmd = function (node) {
        cc.Node.WebGLRenderCmd.call(this, node);
        this.initializeRenderCmd(node);
    };

    var webGLRenderCmdProto = cc.EditBox.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    _mixin(webGLRenderCmdProto, proto);
    webGLRenderCmdProto.constructor = cc.EditBox.WebGLRenderCmd;

    webGLRenderCmdProto.transform = function (parentCmd, recursive) {
        this.originTransform(parentCmd, recursive);
        this.updateMatrix();
    };

}(cc.EditBox._polyfill));
