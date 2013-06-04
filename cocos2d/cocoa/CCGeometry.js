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

//--------------------------------------------------------
//
// POINT
//
//--------------------------------------------------------
/**
 * @class
 * @param {Number} _x
 * @param {Number} _y
 * Constructor
 */
cc.Point = function (_x, _y) {
    this.x = _x || 0;
    this.y = _y || 0;
};

/**
 * @function
 * @param {Number} x
 * @param {Number} y
 * @return {cc.Point}
 */
cc.PointMake = function (x, y) {
    return new cc.Point(x, y);
};

/**
 * Helper macro that creates a cc.Point.
 * @param {Number} x
 * @param {Number} y
 */
cc.p = function (x, y) {
    // This can actually make use of "hidden classes" in JITs and thus decrease
    // memory usage and overall peformance drastically
    return new cc.Point(x, y);
    // but this one will instead flood the heap with newly allocated hash maps
    // giving little room for optimization by the JIT
    // return {x:x, y:y};
};

// JSB compatbility: in JSB, cc._p reuses objects instead of creating new ones
cc._p = cc.p;

/**
 * The "left bottom" point -- equivalent to cc.p(0, 0).
 * @function
 * @return {cc.Point}
 */
cc.PointZero = function () {
    return cc.p(0, 0);
};

Object.defineProperties(cc, {
    POINT_ZERO:{
        get:function () {
            return cc.p(0, 0);
        }
    },
    SIZE_ZERO:{
        get:function () {
            return cc.size(0, 0);
        }
    },
    RECT_ZERO:{
        get:function () {
            return cc.rect(0, 0, 0, 0);
        }
    }
});



/**
 * @function
 * @param {cc.Point} point1
 * @param {cc.Point} point2
 * @return {Boolean}
 */
cc.pointEqualToPoint = function (point1, point2) {
    if (!point1 || !point2)
        return false;
    return ((point1.x === point2.x) && (point1.y === point2.y));
};

// deprecated
//cc.Point.CCPointEqualToPoint = cc.pointEqualToPoint;


//--------------------------------------------------------
//
// SIZE
//
//--------------------------------------------------------

/**
 * @class
 * @param {Number} _width
 * @param {Number} _height
 * Constructor
 */
cc.Size = function (_width, _height) {
    this.width = _width || 0;
    this.height = _height || 0;
};

/**
 * @function
 * @param {Number} width
 * @param {Number} height
 * @return {cc.Size}
 */
cc.SizeMake = function (width, height) {
    return cc.size(width, height);
};

/**
 * @function
 * @param {Number} w width
 * @param {Number} h height
 * @return {cc.Size}
 */
cc.size = function (w, h) {
    // This can actually make use of "hidden classes" in JITs and thus decrease
    // memory usage and overall peformance drastically
    return new cc.Size(w, h);
    // but this one will instead flood the heap with newly allocated hash maps
    // giving little room for optimization by the JIT
    //return {width:w, height:h};
};

// JSB compatbility: in JSB, cc._size reuses objects instead of creating new ones
cc._size = cc.size;

/**
 * The "zero" size -- equivalent to cc.size(0, 0).
 * @function
 * @return {cc.Size}
 */
cc.SizeZero = function () {
    return cc.size(0, 0);
};


/**
 * @function
 * @param {cc.Size} size1
 * @param {cc.Size} size2
 * @return {Boolean}
 */
cc.sizeEqualToSize = function (size1, size2) {
    if (!size1 || !size2)
        return false;
    return ((size1.width == size2.width) && (size1.height == size2.height));
};

// deprecated
//cc.Size.CCSizeEqualToSize = cc.sizeEqualToSize;

//--------------------------------------------------------
//
// RECT
//
//--------------------------------------------------------

/**
 * @class
 * @param {Number} x1
 * @param {Number} y1
 * @param {Number} width1
 * @param {Number} height1
 * Constructor
 */
cc.Rect = function (x1, y1, width1, height1) {
    switch (arguments.length) {
        case 0:
            this.origin = cc.p(0, 0);
            this.size = cc.size(0, 0);
            break;
        case 1:
            var oldRect = x1;
            if (!oldRect) {
                this.origin = cc.p(0, 0);
                this.size = cc.size(0, 0);
            } else {
                if (oldRect instanceof cc.Rect) {
                    this.origin = cc.p(oldRect.origin.x, oldRect.origin.y);
                    this.size = cc.size(oldRect.size.width, oldRect.size.height);
                } else {
                    throw "unknown argument type";
                }
            }
            break;
        case 2:
            this.origin = x1 ? cc.p(x1.x, x1.y) : cc.p(0, 0);
            this.size = y1 ? cc.size(y1.width, y1.height) : cc.size(0, 0);
            break;
        case 4:
            this.origin = cc.p(x1 || 0, y1 || 0);
            this.size = cc.size(width1 || 0, height1 || 0);
            break;
        default:
            throw "unknown argument type";
            break;
    }
};

/**
 * @function
 * @param {Number} x
 * @param {Number} y
 * @param {Number} width
 * @param {Number} height
 * @return {cc.Rect}
 */
cc.RectMake = function (x, y, width, height) {
    return cc.rect(x, y, width, height);
};

// backward compatible
cc.rect = function (x, y, w, h) {
    return new cc.Rect(x,y,w,h);
};

// JSB compatbility: in JSB, cc._rect reuses objects instead of creating new ones
cc._rect = cc.rect;

/**
 * The "zero" rectangle -- equivalent to cc.rect(0, 0, 0, 0).
 * @function
 * @return {cc.Rect}
 */
cc.RectZero = function () {
    return cc.rect(0, 0, 0, 0);
};

/**
 * @function
 * @param {cc.Rect} rect1
 * @param {cc.Rect} rect2
 * @return {Boolean}
 */
cc.rectEqualToRect = function (rect1, rect2) {
    if(!rect1 || !rect2)
        return false;
    return ((cc.pointEqualToPoint(rect1.origin, rect2.origin)) &&
        (cc.sizeEqualToSize(rect1.size, rect2.size)));
};

/**
 * @function
 * @param {cc.Rect} rect1
 * @param {cc.Rect} rect2
 * @return {Boolean}
 */
cc.rectContainsRect = function (rect1, rect2) {
    if (!rect1 || !rect2)
        return false;

    return !((rect1.x >= rect2.x) || (rect1.y >= rect2.y) ||
        ( rect1.x + rect1.width <= rect2.x + rect2.width) ||
        ( rect1.y + rect1.height <= rect2.y + rect2.height));
};

/**
 * return the rightmost x-value of 'rect'
 * @function
 * @param {cc.Rect} rect
 * @return {Number}
 */
cc.rectGetMaxX = function (rect) {
    return (rect.x + rect.width);
};

/**
 * return the midpoint x-value of 'rect'
 * @function
 * @param {cc.Rect} rect
 * @return {Number}
 */
cc.rectGetMidX = function (rect) {
    return (rect.x + rect.width / 2.0);
};
/**
 * return the leftmost x-value of 'rect'
 * @function
 * @param {cc.Rect} rect
 * @return {Number}
 */
cc.rectGetMinX = function (rect) {
    return rect.x;
};

/**
 * Return the topmost y-value of `rect'
 * @function
 * @param {cc.Rect} rect
 * @return {Number}
 */
cc.rectGetMaxY = function (rect) {
    return(rect.y + rect.height);
};

/**
 * Return the midpoint y-value of `rect'
 * @function
 * @param {cc.Rect} rect
 * @return {Number}
 */
cc.rectGetMidY = function (rect) {
    return rect.y + rect.height / 2.0;
};

/**
 * Return the bottommost y-value of `rect'
 * @function
 * @param {cc.Rect} rect
 * @return {Number}
 */
cc.rectGetMinY = function (rect) {
    return rect.y;
};

/**
 * @function
 * @param {cc.Rect} rect
 * @param {cc.Point} point
 * @return {Boolean}
 */
cc.rectContainsPoint = function (rect, point) {
    return (point.x >= cc.rectGetMinX(rect) && point.x <= cc.rectGetMaxX(rect) &&
        point.y >= cc.rectGetMinY(rect) && point.y <= cc.rectGetMaxY(rect)) ;
};

/**
 * @function
 * @param {cc.Rect} rectA
 * @param {cc.Rect} rectB
 * @return {Boolean}
 */
cc.rectIntersectsRect = function (rectA, rectB) {
    return !(cc.rectGetMaxX(rectA) < cc.rectGetMinX(rectB) ||
        cc.rectGetMaxX(rectB) < cc.rectGetMinX(rectA) ||
        cc.rectGetMaxY(rectA) < cc.rectGetMinY(rectB) ||
        cc.rectGetMaxY(rectB) < cc.rectGetMinY(rectA));
};

/**
 * @function
 * @param {cc.Rect} rectA
 * @param {cc.Rect} rectB
 * @return {Boolean}
 */
cc.rectOverlapsRect = function (rectA, rectB) {
    return !((rectA.x + rectA.width < rectB.x) ||
        (rectB.x + rectB.width < rectA.x) ||
        (rectA.y + rectA.height < rectB.y) ||
        (rectB.y + rectB.height < rectA.y));
};

/**
 * Returns the smallest rectangle that contains the two source rectangles.
 * @function
 * @param {cc.Rect} rectA
 * @param {cc.Rect} rectB
 * @return {cc.Rect}
 */
cc.rectUnion = function (rectA, rectB) {
    var rect = cc.rect(0, 0, 0, 0);
    rect.x = Math.min(rectA.x, rectB.x);
    rect.y = Math.min(rectA.y, rectB.y);
    rect.width = Math.max(rectA.x + rectA.width, rectB.x + rectB.width) - rect.x;
    rect.height = Math.max(rectA.y + rectA.height, rectB.y + rectB.height) - rect.y;
    return rect;
};

/**
 * Returns the overlapping portion of 2 rectangles
 * @function
 * @param {cc.Rect} rectA
 * @param {cc.Rect} rectB
 * @return {cc.Rect}
 */
cc.rectIntersection = function (rectA, rectB) {
    var intersection = cc.rect(
        Math.max(cc.rectGetMinX(rectA), cc.rectGetMinX(rectB)),
        Math.max(cc.rectGetMinY(rectA), cc.rectGetMinY(rectB)),
        0, 0);

    intersection.width = Math.min(cc.rectGetMaxX(rectA), cc.rectGetMaxX(rectB)) - cc.rectGetMinX(intersection);
    intersection.height = Math.min(cc.rectGetMaxY(rectA), cc.rectGetMaxY(rectB)) - cc.rectGetMinY(intersection);
    return intersection;
};

//
// Rect JSB compatibility
// JSB uses:
//   rect.x, rect.y, rect.width and rect.height
// while HTML5 uses:
//   rect.origin, rect.size
//
cc.Rect.prototype.getX = function() {
    return this.origin.x;
};
cc.Rect.prototype.setX = function(x) {
    this.origin.x = x;
};
cc.Rect.prototype.getY = function() {
    return this.origin.y;
};
cc.Rect.prototype.setY = function(y) {
    this.origin.y = y;
};
cc.Rect.prototype.getWidth = function(){
    return this.size.width;
};
cc.Rect.prototype.setWidth = function(w){
    this.size.width = w;
};
cc.Rect.prototype.getHeight = function(){
    return this.size.height;
};
cc.Rect.prototype.setHeight = function(h){
    this.size.height = h;
};
Object.defineProperties(cc.Rect.prototype,
                {
                    "x" : {
                        get : function(){
                            return this.getX();
                        },
                        set : function(newValue){
                            this.setX(newValue);
                        },
                        enumerable : true,
                        configurable : true
                    },
                    "y" : {
                        get : function(){
                            return this.getY();
                        },
                        set : function(newValue){
                            this.setY(newValue);
                        },
                        enumerable : true,
                        configurable : true
                    },
                    "width" : {
                        get : function(){
                            return this.getWidth();
                        },
                        set : function(newValue){
                            this.setWidth(newValue);
                        },
                        enumerable : true,
                        configurable : true
                    },
                    "height" : {
                        get : function(){
                            return this.getHeight();
                        },
                        set : function(newValue){
                            this.setHeight(newValue);
                        },
                        enumerable : true,
                        configurable : true
                    }
                });


// Deprecated
/*cc.Rect.CCRectEqualToRect = cc.rectEqualToRect;
cc.Rect.CCRectContainsRect = cc.rectContainsRect;
cc.Rect.CCRectGetMaxX = cc.rectGetMaxX;
cc.Rect.CCRectGetMidX = cc.rectGetMidX;
cc.Rect.CCRectGetMinX = cc.rectGetMinX;
cc.Rect.CCRectGetMaxY = cc.rectGetMaxY;
cc.Rect.CCRectGetMidY = cc.rectGetMidY;
cc.Rect.CCRectGetMinY = cc.rectGetMinY;
cc.Rect.CCRectContainsPoint = cc.rectContainsPoint;
cc.Rect.CCRectIntersectsRect = cc.rectIntersectsRect;
cc.Rect.CCRectUnion = cc.rectUnion;
cc.Rect.CCRectIntersection = cc.rectIntersection;*/

