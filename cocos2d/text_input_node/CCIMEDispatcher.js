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

/**
 * IME Keyboard Notification Info structure
 * @param {cc.Rect} begin the soft keyboard rectangle when animatin begin
 * @param {cc.Rect} end the soft keyboard rectangle when animatin end
 * @param {Number} duration the soft keyboard animation duration
 */
cc.IMEKeyboardNotificationInfo = function (begin, end, duration) {
    this.begin = begin || cc.RectZero();
    this.end = end || cc.RectZero();
    this.duration = duration || 0;
};

/**
 * Input method editor delegate.
 * @class
 * @extends cc.Class
 */
cc.IMEDelegate = cc.Class.extend(/** @lends cc.IMEDelegate# */{
    /**
     * Constructor
     */
    ctor:function () {
        cc.IMEDispatcher.getInstance().addDelegate(this);
    },
    /**
     * Remove delegate
     */
    removeDelegate:function () {
        cc.IMEDispatcher.getInstance().removeDelegate(this);
    },
    /**
     * Remove delegate
     * @return {Boolean}
     */
    attachWithIME:function () {
        return cc.IMEDispatcher.getInstance().attachDelegateWithIME(this);
    },
    /**
     * Detach with IME
     * @return {Boolean}
     */
    detachWithIME:function () {
        return cc.IMEDispatcher.getInstance().detachDelegateWithIME(this);
    },

    /**
     * Decide the delegate instance is ready for receive ime message or not.<br />
     * Called by CCIMEDispatcher.
     * @return {Boolean}
     */
    canAttachWithIME:function () {
        return false;
    },

    /**
     * When the delegate detach with IME, this method call by CCIMEDispatcher.
     */
    didAttachWithIME:function () {
    },

    /**
     * Decide the delegate instance can stop receive ime message or not.
     * @return {Boolean}
     */
    canDetachWithIME:function () {
        return false;
    },

    /**
     * When the delegate detach with IME, this method call by CCIMEDispatcher.
     */
    didDetachWithIME:function () {
    },

    /**
     * Called by CCIMEDispatcher when some text input from IME.
     */
    insertText:function (text, len) {
    },

    /**
     * Called by CCIMEDispatcher when user clicked the backward key.
     */
    deleteBackward:function () {
    },

    /**
     * Called by CCIMEDispatcher for get text which delegate already has.
     * @return {String}
     */
    getContentText:function () {
        return "";
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


/**
 * Input Method Edit Message Dispatcher.
 * @class
 * @extends cc.Class
 */
cc.IMEDispatcher = cc.Class.extend(/**  @lends cc.IMEDispatcher# */{
    impl:null,
    /**
     * Constructor
     */
    ctor:function () {
        this.impl = new cc.IMEDispatcher.Impl();
    },
    /**
     * Dispatch the input text from ime
     * @param {String} text
     * @param {Number} len
     */
    dispatchInsertText:function (text, len) {
        if (!this.impl || !text || len <= 0)
            return;

        // there is no delegate attach with ime
        if (!this.impl._delegateWithIme)
            return;

        this.impl._delegateWithIme.insertText(text, len);
    },

    /**
     * Dispatch the delete backward operation
     */
    dispatchDeleteBackward:function () {
        if (!this.impl) {
            return;
        }

        // there is no delegate attach with ime
        if (!this.impl._delegateWithIme)
            return;

        this.impl._delegateWithIme.deleteBackward();
    },

    /**
     * Get the content text, which current CCIMEDelegate which attached with IME has.
     * @return {String}
     */
    getContentText:function () {
        if (this.impl && this.impl._delegateWithIme) {
            var pszContentText = this.impl._delegateWithIme.getContentText();
            return (pszContentText) ? pszContentText : "";
        }
        return "";
    },

    /**
     * Dispatch keyboard notification
     * @param {cc.IMEKeyboardNotificationInfo} info
     */
    dispatchKeyboardWillShow:function (info) {
        if (this.impl) {
            for (var i = 0; i < this.impl._delegateList.length; i++) {
                var delegate = this.impl._delegateList[i];
                if (delegate) {
                    delegate.keyboardWillShow(info);
                }
            }
        }
    },
    /**
     * Dispatch keyboard notification
     * @param {cc.IMEKeyboardNotificationInfo} info
     */
    dispatchKeyboardDidShow:function (info) {
        if (this.impl) {
            for (var i = 0; i < this.impl._delegateList.length; i++) {
                var delegate = this.impl._delegateList[i];
                if (delegate) {
                    delegate.keyboardDidShow(info);
                }
            }
        }
    },
    /**
     * Dispatch keyboard notification
     * @param {cc.IMEKeyboardNotificationInfo} info
     */
    dispatchKeyboardWillHide:function (info) {
        if (this.impl) {
            for (var i = 0; i < this.impl._delegateList.length; i++) {
                var delegate = this.impl._delegateList[i];
                if (delegate) {
                    delegate.keyboardWillHide(info);
                }
            }
        }
    },
    /**
     * Dispatch keyboard notification
     * @param {cc.IMEKeyboardNotificationInfo} info
     */
    dispatchKeyboardDidHide:function (info) {
        if (this.impl) {
            for (var i = 0; i < this.impl._delegateList.length; i++) {
                var delegate = this.impl._delegateList[i];
                if (delegate) {
                    delegate.keyboardDidHide(info);
                }
            }
        }
    },

    /**
     * Add delegate to concern ime msg
     * @param {cc.IMEDelegate} delegate
     * @example
     * //example
     * cc.IMEDispatcher.getInstance().addDelegate(this);
     */
    addDelegate:function (delegate) {
        if (!delegate || !this.impl) {
            return;
        }
        if (this.impl._delegateList.indexOf(delegate) > -1) {
            // delegate already in list
            return;
        }
        this.impl._delegateList = cc.ArrayAppendObjectToIndex(this.impl._delegateList, delegate, 0);
    },

    /**
     * Attach the pDeleate with ime.
     * @param {cc.IMEDelegate} delegate
     * @return {Boolean} If the old delegate can detattach with ime and the new delegate can attach with ime, return true, otherwise return false.
     * @example
     * //example
     * var ret = cc.IMEDispatcher.getInstance().attachDelegateWithIME(this);
     */
    attachDelegateWithIME:function (delegate) {
        if (!this.impl || !delegate) {
            return false;
        }

        // if delegate is not in delegate list, return
        if (this.impl._delegateList.indexOf(delegate) == -1) {
            return false;
        }

        if (this.impl._delegateWithIme) {
            // if old delegate canDetachWithIME return false
            // or delegate canAttachWithIME return false,
            // do nothing.
            if (!this.impl._delegateWithIme.canDetachWithIME()
                || !delegate.canAttachWithIME())
                return false;

            // detach first
            var pOldDelegate = this.impl._delegateWithIme;
            this.impl._delegateWithIme = null;
            pOldDelegate.didDetachWithIME();

            this.impl._delegateWithIme = delegate;
            delegate.didAttachWithIME();
            return true;
        }

        // havn't delegate attached with IME yet
        if (!delegate.canAttachWithIME())
            return false;

        this.impl._delegateWithIme = delegate;
        delegate.didAttachWithIME();
        return true;
    },
    /**
     * Detach the pDeleate with ime.
     * @param {cc.IMEDelegate} delegate
     * @return {Boolean} If the old delegate can detattach with ime and the new delegate can attach with ime, return true, otherwise return false.
     * @example
     * //example
     * var ret = cc.IMEDispatcher.getInstance().detachDelegateWithIME(this);
     */
    detachDelegateWithIME:function (delegate) {
        if (!this.impl || !delegate) {
            return false;
        }

        // if delegate is not the current delegate attached with ime, return
        if (this.impl._delegateWithIme != delegate) {
            return false;
        }

        if (!delegate.canDetachWithIME()) {
            return false;
        }

        this.impl._delegateWithIme = 0;
        delegate.didDetachWithIME();
        return true;
    },

    /**
     * Remove the delegate from the delegates who concern ime msg
     * @param {cc.IMEDelegate} delegate
     * @example
     * //example
     * cc.IMEDispatcher.getInstance().removeDelegate(this);
     */
    removeDelegate:function (delegate) {
        if (!this.impl || !delegate) {
            return;
        }

        // if delegate is not in delegate list, return
        if (this.impl._delegateList.indexOf(delegate) == -1) {
            return;
        }

        if (this.impl._delegateWithIme) {
            if (delegate == this.impl._delegateWithIme) {
                this.impl._delegateWithIme = null;
            }
        }
        cc.ArrayRemoveObject(this.impl._delegateList, delegate);
    },

    /**
     * Process keydown's keycode
     * @param {Number} keyCode
     * @example
     * //example
     * document.addEventListener("keydown", function (e) {
     *      cc.IMEDispatcher.getInstance().processKeycode(e.keyCode);
     * });
     */
    processKeycode:function (keyCode) {
        if (keyCode < 32) {
            if (keyCode == cc.KEY.backspace) {
                this.dispatchDeleteBackward();
            } else if (keyCode == cc.KEY.enter) {
                this.dispatchInsertText("\n", 1);
            } else if (keyCode == cc.KEY.tab) {
                //tab input
            } else if (keyCode == cc.KEY.escape) {
                //ESC input
            }
        } else if (keyCode < 255) {
            this.dispatchInsertText(String.fromCharCode(keyCode), 1);
        } else {
            //
        }
    }
});

/**
 * @class
 * @extends cc.Class
 */
cc.IMEDispatcher.Impl = cc.Class.extend(/** @lends cc.IMEDispatcher.Impl# */{
    _delegateWithIme:null,
    _delegateList:null,
    /**
     * Constructor
     */
    ctor:function () {
        this._delegateList = [];
    },
    /**
     * Find delegate
     * @param {cc.IMEDelegate} delegate
     * @return {Number|Null}
     */
    findDelegate:function (delegate) {
        for (var i = 0; i < this._delegateList.length; i++) {
            if (this._delegateList[i] == delegate) {
                return i;
            }
        }
        return null;
    }
});

/**
 * Returns the shared CCIMEDispatcher object for the system.
 * @return {cc.IMEDispatcher}
 */
cc.IMEDispatcher.getInstance = function () {
    if (!cc.IMEDispatcher.instance) {
        cc.IMEDispatcher.instance = new cc.IMEDispatcher();
        cc.KeyboardDispatcher.getInstance();
    }
    return cc.IMEDispatcher.instance;
};

/**
 * @type object
 */
cc.IMEDispatcher.instance = null;
