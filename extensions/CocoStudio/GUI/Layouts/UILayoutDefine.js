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

cc.UILinearGravity = {
    NONE: 0,
    LEFT: 1,
    TOP: 2,
    RIGHT: 3,
    BOTTOM: 4,
    CENTER_VERTICAL: 5,
    CENTER_HORIZONTAL: 6
};

cc.UIRelativeAlign = {
    ALIGN_NONE: 0,
    ALIGN_PARENT_TOP_LEFT: 1,
    ALIGN_PARENT_TOP_CENTER_HORIZONTAL: 2,
    ALIGN_PARENT_TOP_RIGHT: 3,
    ALIGN_PARENT_LEFT_CENTER_VERTICAL: 4,
    CENTER_IN_PARENT: 5,
    ALIGN_PARENT_RIGHT_CENTER_VERTICAL: 6,
    ALIGN_PARENT_LEFT_BOTTOM: 7,
    ALIGN_PARENT_BOTTOM_CENTER_HORIZONTAL: 8,
    ALIGN_PARENT_RIGHT_BOTTOM: 9,
    LOCATION_ABOVE_LEFTALIGN: 10,
    LOCATION_ABOVE_CENTER: 11,
    LOCATION_ABOVE_RIGHTALIGN: 12,
    LOCATION_LEFT_OF_TOPALIGN: 13,
    LOCATION_LEFT_OF_CENTER: 14,
    LOCATION_LEFT_OF_BOTTOMALIGN: 15,
    LOCATION_RIGHT_OF_TOPALIGN: 16,
    LOCATION_RIGHT_OF_CENTER: 17,
    LOCATION_RIGHT_OF_BOTTOMALIGN: 18,
    LOCATION_BELOW_LEFTALIGN: 19,
    LOCATION_BELOW_CENTER: 20,
    LOCATION_BELOW_RIGHTALIGN: 21
};

/**
 * Base class for cc.UIMargin
 * @class
 * @extends cc.Class
 */
cc.UIMargin = cc.Class.extend({
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
    setMargin: function (l, t, r, b) {
        this.left = l;
        this.top = t;
        this.right = r;
        this.bottom = b;
    },
    equals: function (target) {
        return (this.left == target.left && this.top == target.top && this.right == target.right && this.bottom == target.bottom);
    }
});