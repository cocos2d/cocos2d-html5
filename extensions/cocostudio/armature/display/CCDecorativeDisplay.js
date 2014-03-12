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
 * Base class for ccs.DecorativeDisplay
 * @class
 * @extends ccs.Class
 */
ccs.DecorativeDisplay = ccs.Class.extend(/** @lends ccs.DecorativeDisplay# */{
    _display:null,
    _colliderDetector:null,
    _displayData:null,

    ctor:function () {
        this._display = null;
        this._colliderDetector = null;
        this._displayData = null;
    },

    init:function () {
        return true;
    },

    /**
     * display setter
     * @param {cc.Node} display
     */
    setDisplay:function (display) {
        this._display = display;
    },

    /**
     * display getter
     * @returns {cc.Node}
     */
    getDisplay:function () {
        return this._display;
    },

    /**
     * colliderDetector setter
     * @param {ccs.ColliderDetector} colliderDetector
     */
    setColliderDetector:function (colliderDetector) {
        this._colliderDetector = colliderDetector;
    },

    /**
     * colliderDetector getter
     * @returns {ccs.ColliderDetector}
     */
    getColliderDetector:function () {
        return this._colliderDetector;
    },

    /**
     * display data setter
     * @param {ccs.DisplayData} displayData
     */
    setDisplayData:function (displayData) {
        this._displayData = displayData;
    },

    /**
     * display data getter
     * @returns {ccs.DisplayData}
     */
    getDisplayData:function () {
        return this._displayData;
    },
    release:function () {
        CC_SAFE_RELEASE(this._display);
        this._display = null;
        CC_SAFE_RELEASE(this._displayData);
        this._displayData = null;
        CC_SAFE_RELEASE(this._colliderDetector);
        this._colliderDetector = null;
    }

});

/**
 * allocates and initializes a decorative display.
 * @constructs
 * @return {ccs.DecorativeDisplay}
 * @example
 * // example
 * var display = ccs.DecorativeDisplay.create();
 */
ccs.DecorativeDisplay.create = function () {
    var decorativeDisplay = new ccs.DecorativeDisplay();
    if (decorativeDisplay && decorativeDisplay.init()) {
        return decorativeDisplay;
    }
    return null;
};