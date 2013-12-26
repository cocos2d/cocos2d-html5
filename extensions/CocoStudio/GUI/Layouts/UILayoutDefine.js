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
 * LinearGravity
 * @type {Object}
 */
ccs.LinearGravity = {
    none: 0,
    left: 1,
    top: 2,
    right: 3,
    bottom: 4,
    centerVertical: 5,
    centerHorizontal: 6
};

/**
 * RelativeAlign
 * @type {Object}
 */
ccs.RelativeAlign = {
    alignNone: 0,
    alignParentTopLeft: 1,
    alignParentTopCenterHorizontal: 2,
    alignParentTopRight: 3,
    alignParentLeftCenterVertical: 4,
    centerInParent: 5,
    alignParentRightCenterVertical: 6,
    alignParentLeftBottom: 7,
    alignParentBottomCenterHorizontal: 8,
    alignParentRightBottom: 9,
    locationAboveLeftAlign: 10,
    locationAboveCenter: 11,
    locationAboveRightAlign: 12,
    locationLeftOfTopAlign: 13,
    locationLeftOfCenter: 14,
    locationLeftOfBottomAlign: 15,
    locationRightOfTopAlign: 16,
    locationRightOfCenter: 17,
    locationRightOfBottomAlign: 18,
    locationBelowLeftAlign: 19,
    locationBelowCenter: 20,
    locationBelowRightAlign: 21
};

/**
 * Base class for ccs.Margin
 * @class
 * @extends ccs.Class
 */
ccs.Margin = ccs.Class.extend(/** @lends ccs.Margin# */{
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    ctor: function () {
        if (arguments.length == 1) {
            var uiMargin = arguments[0];
            this.left = uiMargin.left;
            this.top = uiMargin.top;
            this.right = uiMargin.right;
            this.bottom = uiMargin.bottom;
        }
        if (arguments.length == 4) {
            this.left = arguments[0];
            this.top = arguments[1];
            this.right = arguments[2];
            this.bottom = arguments[3];
        }
    },
    /**
     *  set margin
     * @param {Number} l
     * @param {Number} t
     * @param {Number} r
     * @param {Number} b
     */
    setMargin: function (l, t, r, b) {
        this.left = l;
        this.top = t;
        this.right = r;
        this.bottom = b;
    },
    /**
     *  check is equals
     * @param {ccs.Margin} target
     * @returns {boolean}
     */
    equals: function (target) {
        return (this.left == target.left && this.top == target.top && this.right == target.right && this.bottom == target.bottom);
    }
});

ccs.MarginZero = function(){
   return new ccs.Margin(0,0,0,0);
};