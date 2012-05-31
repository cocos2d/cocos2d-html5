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

cc.IMEKeyboardNotificationInfo = function (begin, end, duration) {
    // the soft keyboard rectangle when animatin begin
    this.begin = begin || cc.RectZero();

    // the soft keyboard rectangle when animatin end
    this.end = end || cc.RectZero();

    // the soft keyboard animation duration
    this.duration = duration || 0;
};

/**
 @brief    Input method editor delegate.
 */
cc.IMEDelegate = cc.Class.extend({
    ctor:function () {
        cc.IMEDispatcher.sharedDispatcher().addDelegate(this);
    },

    removeDelegate:function () {
        cc.IMEDispatcher.sharedDispatcher().removeDelegate(this);
    },

    attachWithIME:function () {
        return cc.IMEDispatcher.sharedDispatcher().attachDelegateWithIME(this);
    },
    detachWithIME:function () {
        return cc.IMEDispatcher.sharedDispatcher().detachDelegateWithIME(this);
    },

    /**
     @brief    Decide the delegate instance is ready for receive ime message or not.

     Called by CCIMEDispatcher.
     */
    canAttachWithIME:function () {
        return false;
    },

    /**
     @brief    When the delegate detach with IME, this method call by CCIMEDispatcher.
     */
    didAttachWithIME:function () {
    },

    /**
     @brief    Decide the delegate instance can stop receive ime message or not.
     */
    canDetachWithIME:function () {
        return false;
    },

    /**
     @brief    When the delegate detach with IME, this method call by CCIMEDispatcher.
     */
    didDetachWithIME:function () {
    },

    /**
     @brief    Called by CCIMEDispatcher when some text input from IME.
     */
    insertText:function (text, len) {
    },

    /**
     @brief    Called by CCIMEDispatcher when user clicked the backward key.
     */
    deleteBackward:function () {
    },

    /**
     @brief    Called by CCIMEDispatcher for get text which delegate already has.
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
 @brief    Input Method Edit Message Dispatcher.
 */
cc.IMEDispatcher = cc.Class.extend({
    impl:null,
    //private construction method
    ctor:function () {
        this.impl = new cc.IMEDispatcher.Impl();
    },
    /**
     @brief dispatch the input text from ime
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
     @brief    dispatch the delete backward operation
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
     @brief    get the content text, which current CCIMEDelegate which attached with IME has.
     */
    getContentText:function () {
        if (this.impl && this.impl._delegateWithIme) {
            var pszContentText = this.impl._delegateWithIme.getContentText();
            return (pszContentText) ? pszContentText : "";
        }
        return "";
    },

    //////////////////////////////////////////////////////////////////////////
    // dispatch keyboard notification
    //////////////////////////////////////////////////////////////////////////
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
     @brief add delegate to concern ime msg
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
     @brief    attach the pDeleate with ime.
     @return If the old delegate can detattach with ime and the new delegate
     can attach with ime, return true, otherwise return false.
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
     @brief remove the delegate from the delegates who concern ime msg
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

    //process keydown's keycode
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

cc.IMEDispatcher.Impl = cc.Class.extend({
    _delegateWithIme:null,
    _delegateList:null,
    ctor:function () {
        this._delegateList = [];
    },

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
 @brief Returns the shared CCIMEDispatcher object for the system.
 */
cc.IMEDispatcher.sharedDispatcher = function () {
    if (!cc.IMEDispatcher.instance) {
        cc.IMEDispatcher.instance = new cc.IMEDispatcher();
        cc.KeypadDispatcher.sharedDispatcher();
    }
    return cc.IMEDispatcher.instance;
};
cc.IMEDispatcher.instance = null;