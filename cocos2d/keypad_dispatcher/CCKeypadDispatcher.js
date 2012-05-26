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

cc.kTypeBackClicked = 1;
cc.kTypeMenuClicked = 2;
cc.key = {
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
 to mark a keydown, do cc.keyDown[65] = true; or cc.keyMap[cc.key.a]
 to mark a keyup, do cc.keyDown[65] = false; or = null,
 to find out if a key is down, check if(cc.keyDown[65]) or if,(cc.keyDown[cc.key.space])
 if its undefined or false or null, its not pressed
 */

cc.s_KeypadDispatcher = null;
/**
 @class CCKeypadDispatcher
 @brief Dispatch the keypad message from the phone
 */
cc.KeypadDispatcher = cc.Class.extend({
    /**
     @brief add delegate to concern keypad msg
     */
    addDelegate:function (pDelegate) {
        if (!pDelegate) {
            return;
        }
        if (!this._m_bLocked) {
            this.forceAddDelegate(pDelegate);
        }
        else {
            this._m_pHandlersToAdd.push(pDelegate);
            this._m_bToAdd = true;
        }
    },
    /**
     @brief remove the delegate from the delegates who concern keypad msg
     */
    removeDelegate:function (pDelegate) {
        if (!pDelegate) {
            return;
        }
        if (!this._m_bLocked) {
            this.forceRemoveDelegate(pDelegate);
        }
        else {
            this._m_pHandlersToRemove.push(pDelegate);
            this._m_bToRemove = true;
        }
    },
    /**
     @brief force add the delegate
     */
    forceAddDelegate:function (pDelegate) {
        var pHandler = cc.KeypadHandler.handlerWithDelegate(pDelegate);
        if (pHandler) {
            //if handler already exist
            for (var i = 0; i < this._m_pDelegates; i++) {
                if (this._m_pDelegates[i].getDelegate() == pHandler.getDelegate()) {
                }
            }
            this._m_pDelegates.push(pHandler);
        }
    },
    /**
     @brief force remove the delegate
     */
    forceRemoveDelegate:function (pDelegate) {
        var i = this._m_pDelegates.indexOf(pDelegate);
        if (i != -1) {
            this._m_pDelegates.splice(this._m_pDelegates.indexOf(pDelegate), 1);
        }
    },
    /**
     @brief dispatch the key pad msg
     */
    dispatchKeypadMSG:function (e, keydown) {
        this._m_bLocked = true;
        e.stopPropagation();
        e.preventDefault();
        //update keymap
        if (keydown && e)//if keydown and our keymap doesnt have it
        {
            //execute all deletegate that registered a keyboard event
            for (var i = 0; i < this._m_pDelegates.length; i++) {
                this._m_pDelegates[i].getDelegate().keyDown(e.keyCode);
            }
        }
        else if (!keydown && e)//if keyup and our keymap have that key in it
        {
            for (var i = 0; i < this._m_pDelegates.length; i++) {
                this._m_pDelegates[i].getDelegate().keyUp(e.keyCode);
            }
        }
        this._m_bLocked = false;
        if (this._m_bToRemove) {
            this._m_bToRemove = false;
            for (var i = 0; i < this._m_pHandlersToRemove.length; ++i) {
                this.forceRemoveDelegate(this._m_pHandlersToRemove[i]);
            }
            delete this._m_pHandlersToRemove;
            this._m_pHandlersToRemove = [];
        }

        if (this._m_bToAdd) {
            this._m_bToAdd = false;
            for (var i = 0; i < this._m_pHandlersToAdd.length; ++i) {
                this.forceAddDelegate(this._m_pHandlersToAdd[i]);
            }
            this._m_pHandlersToAdd = [];
        }
        return true;
    },

    //private
    _m_pDelegates:[],
    _m_bLocked:false,
    _m_bToAdd:false,
    _m_bToRemove:false,
    _m_pHandlersToAdd:[],
    _m_pHandlersToRemove:[]
});
/**
 @brief Returns the shared CCKeypadDispatcher object for the system.
 */
cc.KeypadDispatcher.sharedDispatcher = function () {
    if (!cc.s_KeypadDispatcher) {
        cc.s_KeypadDispatcher = new cc.KeypadDispatcher();
        document.addEventListener("keydown", function (e) {
            cc.s_KeypadDispatcher.dispatchKeypadMSG(e, true);
            cc.IMEDispatcher.sharedDispatcher().processKeycode(e.keyCode);
        });
        document.addEventListener("keyup", function (e) {
            cc.s_KeypadDispatcher.dispatchKeypadMSG(e, false);
        });
    }
    return cc.s_KeypadDispatcher;
};
/**
 @brief Release the shared CCKeypadDispatcher object from the system.
 */
cc.KeypadDispatcher.purgeSharedDispatcher = function () {
    if (cc.s_KeypadDispatcher) {
        delete cc.s_KeypadDispatcher;
        cc.s_KeypadDispatcher = null;
    }
};