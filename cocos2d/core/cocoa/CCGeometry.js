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
 * @param {Number|cc.Point} _x
 * @param {Number} _y
 * Constructor
 */
cc.Point = function (_x, _y) {
    if(_x !== undefined && _y === undefined){
        this.x = _x.x;
        this.y = _x.y;
    } else {
        this.x = _x || 0;
        this.y = _y || 0;
    }
};

cc._PointConst = function (x, y) {
    this._x = x || 0;
    this._y = y || 0;

    this.setX = function (x) {
        this._x = x;
    };
    this.setY = function (y) {
        this._y = y;
    }
};

cc._pConst = function (x, y) {
    return new cc._PointConst(x, y);
};

Object.defineProperties(cc._PointConst.prototype, {
    x: {
        get: function () {
            return this._x;
        },
        set: function () {
            console.warn("Warning of _PointConst: Modification to const or private property is forbidden");
        },
        enumerable: true
    },

    y: {
        get: function () {
            return this._y;
        },
        set: function () {
            console.warn("Warning of _PointConst: Modification to const or private property is forbidden");
        },
        enumerable: true
    }
});

/**
 * @function
 * @param {Number} x
 * @param {Number} y
 * @return {cc.Point}
 * @deprecated
 */
cc.PointMake = function (x, y) {
    cc.log("cc.PointMake will be deprecated sooner or later. Use cc.p instead.");
    return new cc.Point(x, y);
};

/**
 * Helper macro that creates a cc.Point.
 * @param {Number|cc.Point} x
 * @param {Number} y
 */
cc.p = function (x, y) {
    // This can actually make use of "hidden classes" in JITs and thus decrease
    // memory usage and overall performance drastically
    // return new cc.Point(x, y);
    // but this one will instead flood the heap with newly allocated hash maps
    // giving little room for optimization by the JIT,
    // note: we have tested this item on Chrome and firefox, it is faster than new cc.Point(x, y)
    if(x !== undefined && y === undefined)
        return {x: x.x, y: x.y};
    else
        return {x: x || 0, y: y || 0};
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
 * @param {Number|cc.Size} _width
 * @param {Number} _height
 * Constructor
 */
cc.Size = function (_width, _height) {
    if(_width !== undefined && _height === undefined){
        this.width = _width.width;
        this.height = _width.height;
    } else {
        this.width = _width || 0;
        this.height = _height || 0;
    }
};

cc._SizeConst = function (width, height) {
    this._width = width || 0;
    this._height = height || 0;

    this.setWidth = function (width) {
        this._width = width;
    };
    this.setHeight = function (height) {
        this._height = height;
    }
};

cc._sizeConst = function (width, height) {
    return new cc._SizeConst(width, height);
};

Object.defineProperties(cc._SizeConst.prototype, {
    width: {
        get: function () {
            return this._width;
        },
        set: function () {
            console.warn("Warning of _SizeConst: Modification to const or private property is forbidden");
        },
        enumerable: true
    },

    height: {
        get: function () {
            return this._height;
        },
        set: function () {
            console.warn("Warning of _SizeConst: Modification to const or private property is forbidden");
        },
        enumerable: true
    }
});

/**
 * @function
 * @param {Number} width
 * @param {Number} height
 * @return {cc.Size}
 * @deprecated
 */
cc.SizeMake = function (width, height) {
    cc.log("cc.SizeMake will be deprecated sooner or later. Use cc.size instead.");
    return cc.size(width, height);
};

/**
 * @function
 * @param {Number|cc.Size} w width or a size object
 * @param {Number} h height
 * @return {cc.Size}
 */
cc.size = function (w, h) {
    // This can actually make use of "hidden classes" in JITs and thus decrease
    // memory usage and overall performance drastically
    //return new cc.Size(w, h);
    // but this one will instead flood the heap with newly allocated hash maps
    // giving little room for optimization by the JIT
    // note: we have tested this item on Chrome and firefox, it is faster than new cc.Size(w, h)
    if(w !== undefined && h === undefined)
        return { width: w.width, height: w.height};
    else
        return { width: w || 0, height: h || 0};
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

cc._zeroConsts = {pointZero: cc._pConst(0,0), sizeZero: cc._sizeConst(0,0)};

Object.defineProperties(cc, {
    POINT_ZERO:{
        get:function () {
            return cc._zeroConsts.pointZero;
        }
    },
    SIZE_ZERO:{
        get:function () {
            return cc._zeroConsts.sizeZero;
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
 * @param {Number|cc.Point|cc.Rect} [x1] a Number value as x or a cc.Point object as origin or a cc.Rect clone object
 * @param {Number|cc.Size} [y1] x1 a Number value as y or a cc.Size object as size
 * @param {Number} [width1]
 * @param {Number} [height1]
 * Constructor
 */
cc.Rect = function (x1, y1, width1, height1) {
    var argLen =arguments.length;
    if(argLen === 4){
        this._origin = new cc.Point(x1 || 0, y1 || 0);
        this._size = new cc.Size(width1 || 0, height1 || 0);
        return;
    }
    if(argLen === 1) {
        this._origin = new cc.Point(x1._origin.x, x1._origin.y);
        this._size = new cc.Size(x1._size.width, x1._size.height);
        return;
    }
    if(argLen === 0) {
        this._origin = new cc.Point(0, 0);
        this._size = new cc.Size(0,0);
        return;
    }
    if(argLen === 2) {
        this._origin = new cc.Point(x1.x, x1.y);
        this._size = new cc.Size(y1.width,y1.height);
        return;
    }
    throw "unknown argument type";
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
    cc.log("cc.RectMake will be deprecated sooner or later. Use cc.rect instead.");
    return cc.rect(x, y, width, height);
};

// backward compatible
cc.rect = function (x, y, w, h) {
    var argLen =arguments.length;
    if(argLen === 0)
        return new cc.Rect(0,0,0,0);

    if(argLen === 1)
        return new cc.Rect(x.x, x.y, x.width, x.height);

    if(argLen === 2)
        return new cc.Rect(x.x, x.y, y.width, y.height);

    if(argLen === 4)
        return new cc.Rect(x,y,w,h);

    throw "unknown argument type";
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
    return ((cc.pointEqualToPoint(rect1._origin, rect2._origin)) &&
        (cc.sizeEqualToSize(rect1._size, rect2._size)));
};

cc._rectEqualToZero = function(rect){
    if(!rect)
        return false;
    return (rect.x === 0) && (rect.y === 0) && (rect.width === 0) && (rect.height === 0);
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
    return this._origin.x;
};
cc.Rect.prototype.setX = function(x) {
    this._origin.x = x;
};
cc.Rect.prototype.getY = function() {
    return this._origin.y;
};
cc.Rect.prototype.setY = function(y) {
    this._origin.y = y;
};
cc.Rect.prototype.getWidth = function(){
    return this._size.width;
};
cc.Rect.prototype.setWidth = function(w){
    this._size.width = w;
};
cc.Rect.prototype.getHeight = function(){
    return this._size.height;
};
cc.Rect.prototype.setHeight = function(h){
    this._size.height = h;
};

Object.defineProperties(cc.Rect.prototype,
    {
        "x": {
            get: function () {
                return this.getX();
            },
            set: function (newValue) {
                this.setX(newValue);
            },
            enumerable: true,
            configurable: true
        },
        "y": {
            get: function () {
                return this.getY();
            },
            set: function (newValue) {
                this.setY(newValue);
            },
            enumerable: true,
            configurable: true
        },
        "width": {
            get: function () {
                return this.getWidth();
            },
            set: function (newValue) {
                this.setWidth(newValue);
            },
            enumerable: true,
            configurable: true
        },
        "height": {
            get: function () {
                return this.getHeight();
            },
            set: function (newValue) {
                this.setHeight(newValue);
            },
            enumerable: true,
            configurable: true
        }
    }
);

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

