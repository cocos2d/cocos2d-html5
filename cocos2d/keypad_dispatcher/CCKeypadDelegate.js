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
 * you must extend the keypadDelegate and
 * implement your own game logic in
 * keydown and keyup functions
 * @class
 * @extends cc.Class
 */
cc.KeypadDelegate = cc.Class.extend(/** @lends cc.KeypadDelegate# */{
    /**
     * Call back when a key is pressed down
     */
    keyDown:function () {
    },

    /**
     * Call back when a key is released
     */
    keyUp:function () {
    }
});

/**
 * KeypadHandler is an object that contains KeypadDelegate
 * @class
 * @extends cc.Class
 */
cc.KeypadHandler = cc.Class.extend(/** @lends cc.KeypadHandler# */{
    /**
     * returns the keypad delegate
     * @return {cc.KeypadDelegate}
     */
    getDelegate:function () {
        return this._delegate;
    },

    /**
     * set the keypad delegate
     * @param {cc.KeypadDelegate} delegate
     */
    setDelegate:function (delegate) {
        this._delegate = delegate;
    },
    /**
     * initializes a cc.KeypadHandler with a delegate
     * @param {cc.KeypadDelegate} delegate
     * @return {Boolean}
     */
    initWithDelegate:function (delegate) {
        cc.Assert(delegate != null, "It's a wrong delegate!");

        this._delegate = delegate;

        return true;
    },
    _delegate:null
});
/**
 * Create a KeypadHandler with KeypadDelegate
 * @param delegate
 * @return {cc.KeypadHandler}
 */
cc.KeypadHandler.create = function (delegate) {
    var handler = new cc.KeypadHandler();
    handler.initWithDelegate(delegate);
    return handler;
};