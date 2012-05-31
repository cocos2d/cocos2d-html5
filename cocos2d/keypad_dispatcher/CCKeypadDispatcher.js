/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Created by JetBrains WebStorm.
 User: wuhao
 Date: 12-3-5

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

cc.TYPE_BACK_CLICKED = 1;
cc.TYPE_MENU_CLICKED = 2;
cc.KEY = {
    backspace:8,
    tab:9,
    enter:13,
    shift:16, //should use shiftkey instead
    ctrl:17, //should use ctrlkey
    alt:18, //should use altkey
    pause:19,
    capslock:20,
    escape:27,
    pageup:33,
    pagedown:34,
    end:35,
    home:36,
    left:37,
    up:38,
    right:39,
    down:40,
    insert:45,
    Delete:46,
    0:48,
    1:49,
    2:50,
    3:51,
    4:52,
    5:53,
    6:54,
    7:55,
    8:56,
    9:57,
    a:65,
    b:66,
    c:67,
    d:68,
    e:69,
    f:70,
    g:71,
    h:72,
    i:73,
    j:74,
    k:75,
    l:76,
    m:77,
    n:78,
    o:79,
    p:80,
    q:81,
    r:82,
    s:83,
    t:84,
    u:85,
    v:86,
    w:87,
    x:88,
    y:89,
    z:90,
    num0:96,
    num1:97,
    num2:98,
    num3:99,
    num4:100,
    num5:101,
    num6:102,
    num7:103,
    num8:104,
    num9:105,
    '*':106,
    '+':107,
    '-':109,
    'numdel':110,
    '/':111,
    f1:112, //f1-f12 dont work on ie
    f2:113,
    f3:114,
    f4:115,
    f5:116,
    f6:117,
    f7:118,
    f8:119,
    f9:120,
    f10:121,
    f11:122,
    f12:123,
    numlock:144,
    scrolllock:145,
    semicolon:186,
    ',':186,
    equal:187,
    '=':187,
    ';':188,
    comma:188,
    dash:189,
    '.':190,
    period:190,
    forwardslash:191,
    grave:192,
    '[':219,
    openbracket:219,
    ']':221,
    closebracket:221,
    backslash:220,
    quote:222,
    space:32
};
/*keymap usage
 to mark a keydown, do cc.keyDown[65] = true; or cc.keyMap[cc.KEY.a]
 to mark a keyup, do cc.keyDown[65] = false; or = null,
 to find out if a key is down, check if(cc.keyDown[65]) or if,(cc.keyDown[cc.KEY.space])
 if its undefined or false or null, its not pressed
 */

cc.keypadDispatcher = null;
/**
 @class CCKeypadDispatcher
 @brief Dispatch the keypad message from the phone
 */
cc.KeypadDispatcher = cc.Class.extend({
    /**
     @brief add delegate to concern keypad msg
     */
    addDelegate:function (delegate) {
        if (!delegate) {
            return;
        }
        if (!this._locked) {
            this.forceAddDelegate(delegate);
        }
        else {
            this._handlersToAdd.push(delegate);
            this._toAdd = true;
        }
    },
    /**
     @brief remove the delegate from the delegates who concern keypad msg
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
     @brief force add the delegate
     */
    forceAddDelegate:function (delegate) {
        var handler = cc.KeypadHandler.handlerWithDelegate(delegate);
        if (handler) {
            //if handler already exist
            for (var i = 0; i < this._delegates; i++) {
                if (this._delegates[i].getDelegate() == handler.getDelegate()) {
                }
            }
            this._delegates.push(handler);
        }
    },
    /**
     @brief force remove the delegate
     */
    forceRemoveDelegate:function (delegate) {
        var i = this._delegates.indexOf(delegate);
        if (i != -1) {
            this._delegates.splice(this._delegates.indexOf(delegate), 1);
        }
    },
    /**
     @brief dispatch the key pad msg
     */
    dispatchKeypadMSG:function (e, keydown) {
        this._locked = true;
        e.stopPropagation();
        e.preventDefault();
        //update keymap
        if (keydown && e)//if keydown and our keymap doesnt have it
        {
            //execute all deletegate that registered a keyboard event
            for (var i = 0; i < this._delegates.length; i++) {
                this._delegates[i].getDelegate().keyDown(e.keyCode);
            }
        }
        else if (!keydown && e)//if keyup and our keymap have that key in it
        {
            for (var i = 0; i < this._delegates.length; i++) {
                this._delegates[i].getDelegate().keyUp(e.keyCode);
            }
        }
        this._locked = false;
        if (this._toRemove) {
            this._toRemove = false;
            for (var i = 0; i < this._handlersToRemove.length; ++i) {
                this.forceRemoveDelegate(this._handlersToRemove[i]);
            }
            delete this._handlersToRemove;
            this._handlersToRemove = [];
        }

        if (this._toAdd) {
            this._toAdd = false;
            for (var i = 0; i < this._handlersToAdd.length; ++i) {
                this.forceAddDelegate(this._handlersToAdd[i]);
            }
            this._handlersToAdd = [];
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
 @brief Returns the shared CCKeypadDispatcher object for the system.
 */
cc.KeypadDispatcher.sharedDispatcher = function () {
    if (!cc.keypadDispatcher) {
        cc.keypadDispatcher = new cc.KeypadDispatcher();
        document.addEventListener("keydown", function (e) {
            cc.keypadDispatcher.dispatchKeypadMSG(e, true);
            cc.IMEDispatcher.sharedDispatcher().processKeycode(e.keyCode);
        });
        document.addEventListener("keyup", function (e) {
            cc.keypadDispatcher.dispatchKeypadMSG(e, false);
        });
    }
    return cc.keypadDispatcher;
};
/**
 @brief Release the shared CCKeypadDispatcher object from the system.
 */
cc.KeypadDispatcher.purgeSharedDispatcher = function () {
    if (cc.keypadDispatcher) {
        delete cc.keypadDispatcher;
        cc.keypadDispatcher = null;
    }
};