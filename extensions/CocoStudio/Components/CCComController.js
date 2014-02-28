/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org

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
 * Base class for ccs.ComController
 * @class
 * @extends ccs.Component
 */
ccs.ComController = ccs.Component.extend(/** @lends ccs.ComController# */{
    ctor: function () {
        cc.Component.prototype.ctor.call(this);
        this._name = "ComController";
    },
    init: function () {
        return true;
    },

    onEnter: function () {

    },

    onExit: function () {

    },

    update: function (dt) {
    },

    /**
     * Enabled getter
     * @returns {Boolean}
     */
    isEnabled: function () {
        return this._enabled;
    },

    /**
     * Enabled setter
     * @param {Boolean} bool
     */
    setEnabled: function (bool) {
        this._enabled = b;
    }
});
/**
 * allocates and initializes a ComController.
 * @constructs
 * @return {ccs.ComController}
 * @example
 * // example
 * var com = ccs.ComController.create();
 */
ccs.ComController.create = function () {
    var com = new ccs.ComController();
    if (com && com.init()) {
        return com;
    }
    return null;
};