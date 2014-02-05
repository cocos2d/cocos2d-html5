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
 * android back button
 * @deprecated These were for android devices, but does not work in html5 environment
 * @constant
 * @type Number
 */
cc.TYPE_BACK_CLICKED = 1;
/**
 * android menu button
 * @deprecated for android devices, does not work in html5 environment
 * @constant
 * @type Number
 */
cc.TYPE_MENU_CLICKED = 2;

/**
 * Dispatch the keyboard message
 * @class
 * @extends cc.Class
 */
cc.KeyboardDispatcher = cc.Class.extend(/** @lends cc.KeyboardDispatcher# */{
    /**
     * add delegate to concern keyboard msg
     * @param {cc.KeyboardDelegate} delegate keyboard delegate object
     */
    addDelegate:function (delegate) {
        if (!delegate)
            return;

        if (!this._locked)
            this.forceAddDelegate(delegate);
        else {
            this._handlersToAdd.push(delegate);
            this._toAdd = true;
        }
    },

    /**
     * remove the delegate from the delegates who concern keyboard msg
     * @param {cc.KeyboardDelegate} delegate
     */
    removeDelegate:function (delegate) {
        if (!delegate) {
            return;
        }
        if (!this._locked) {
            this.forceRemoveDelegate(delegate);
        }
        else {
            this._handlersToRemove.push(delegate);
            this._toRemove = true;
        }
    },

    /**
     * force add the delegate
     * @param {cc.KeyboardDelegate} delegate
     */
    forceAddDelegate:function (delegate) {
        var handler = cc.KeyboardHandler.create(delegate);
        if (handler) {
            //if handler already exist
            var locDelegates = this._delegates;
            for (var i = 0, len = locDelegates.length; i < len; i++) {
                if (locDelegates[i].getDelegate() == handler.getDelegate()) {
                    cc.log("cc.KeyboardDispatcher.forceAddDelegate(): the delegate has been added.");
                    return;
                }
            }
            this._delegates.push(handler);
        }
    },

    /**
     * force remove the delegate
     * @param {cc.KeyboardDelegate} delegate
     */
    forceRemoveDelegate:function (delegate) {
        var locDelegates = this._delegates;
        for (var i = 0, len = locDelegates.length; i < len; i++) {
            if (locDelegates[i].getDelegate() == delegate) {
                locDelegates.splice(i, 1);
                return;
            }
        }
    },

    /**
     * dispatch the keyboard message to the delegates
     * @param {event} e
     * @param {Boolean} keydown whether this is a keydown or keyup
     * @return {Boolean}
     */
    dispatchKeyboardMSG:function (e, keydown) {
        this._locked = true;
        e.stopPropagation();
        e.preventDefault();

        var i = 0;
        //update keymap
        if (keydown && e) {     //if keydown and our keymap doesnt have it
            //execute all deletegate that registered a keyboard event
            for (i = 0; i < this._delegates.length; i++) {
                if(this._delegates[i].getDelegate() && this._delegates[i].getDelegate().onKeyDown)
                    this._delegates[i].getDelegate().onKeyDown(e.keyCode);
            }
        }  else if (!keydown && e) {//if keyup and our keymap have that key in it
            for (i = 0; i < this._delegates.length; i++) {
                if(this._delegates[i].getDelegate() && this._delegates[i].getDelegate().onKeyUp)
                    this._delegates[i].getDelegate().onKeyUp(e.keyCode);
            }
        }
        this._locked = false;
        if (this._toRemove) {
            this._toRemove = false;
            var locHandlersToRemove = this._handlersToRemove;
            for (i = 0; i < locHandlersToRemove.length; ++i) {
                this.forceRemoveDelegate(locHandlersToRemove[i]);
            }
            locHandlersToRemove.length = 0;
        }

        if (this._toAdd) {
            this._toAdd = false;
            var locHandlersToAdd = this._handlersToAdd;
            for (i = 0; i < locHandlersToAdd.length; ++i) {
                this.forceAddDelegate(locHandlersToAdd[i]);
            }
            locHandlersToAdd.length = 0;
        }
        return true;
    },

    //private
    _delegates:[],
    _locked:false,
    _toAdd:false,
    _toRemove:false,
    _handlersToAdd:[],
    _handlersToRemove:[]
});

/**
 * Returns the shared cc.KeyboardDispatcher object for the system.
 * @return {cc.keyboardDispatcher}
 */
cc.KeyboardDispatcher.getInstance = function () {
    if (!cc.keyboardDispatcher) {
        cc.keyboardDispatcher = new cc.KeyboardDispatcher();
        //make canvas focusable
        cc.canvas.setAttribute('tabindex', 1);
        cc.canvas.style.outline = 'none';
        cc.canvas.style.cursor = 'default';
        cc.canvas.addEventListener("keydown", function (e) {
            cc.keyboardDispatcher.dispatchKeyboardMSG(e, true);
        });
        cc.canvas.addEventListener("keyup", function (e) {
            cc.keyboardDispatcher.dispatchKeyboardMSG(e, false);
        });
    }
    return cc.keyboardDispatcher;
};

/**
 * Release the shared cc.KeyboardDispatcher object from the system.
 */
cc.KeyboardDispatcher.purgeSharedDispatcher = function () {
    if (cc.keyboardDispatcher) {
        delete cc.keyboardDispatcher;
        cc.keyboardDispatcher = null;
    }
};
