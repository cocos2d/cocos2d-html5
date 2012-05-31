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
cc.Point = function (_x, _y) {
    this.x = _x || 0;
    this.y = _y || 0;
};

cc.Point.CCPointEqualToPoint = function (point1, point2) {
    return ((point1.x == point2.x) && (point1.y == point2.y));
};

cc.Size = function (_width, _height) {
    this.width = _width || 0;
    this.height = _height || 0;
};

cc.Size.CCSizeEqualToSize = function (size1, size2) {
    return ((size1.width == size2.width) && (size1.height == size2.height));

};

cc.Rect = function (x1, y1, width1, height1) {
    switch (arguments.length) {
        case 0:
            this.origin = new cc.Point(0, 0);
            this.size = new cc.Size(0, 0);
            break;
        case 1:
            var oldRect = x1;
            if (!oldRect) {
                this.origin = new cc.Point(0, 0);
                this.size = new cc.Size(0, 0);
            } else {
                if (oldRect instanceof cc.Rect) {
                    this.origin = new cc.Point(oldRect.origin.x, oldRect.origin.y);
                    this.size = new cc.Size(oldRect.size.width, oldRect.size.height);
                } else {
                    throw "unknown argument type";
                }
            }
            break;
        case 2:
            this.origin = x1?new cc.Point(x1.x,x1.y):new cc.Point(0, 0);
            this.size = y1?new cc.Size(y1.width,y1.height):new cc.Size(0, 0);
            break;
        case 4:
            this.origin = new cc.Point(x1||0, y1||0);
            this.size = new cc.Size(width1||0, height1||0);
            break;
        default:
            throw "unknown argument type";
            break;
    }
};

cc.Rect.CCRectEqualToRect = function (rect1, rect2) {
    return ((cc.Point.CCPointEqualToPoint(rect1.origin, rect2.origin)) &&
        (cc.Size.CCSizeEqualToSize(rect1.size, rect2.size)));
};

//! return the rightmost x-value of 'rect'
cc.Rect.CCRectGetMaxX = function (rect) {
    return (rect.origin.x + rect.size.width);
};

//! return the midpoint x-value of 'rect'
cc.Rect.CCRectGetMidX = function (rect) {
    return ((rect.origin.x + rect.size.width) / 2.0);
};
//! return the leftmost x-value of 'rect'
cc.Rect.CCRectGetMinX = function (rect) {
    return rect.origin.x;
};

//! Return the topmost y-value of `rect'
cc.Rect.CCRectGetMaxY = function (rect) {
    return(rect.origin.y + rect.size.height);
};

//! Return the midpoint y-value of `rect'
cc.Rect.CCRectGetMidY = function (rect) {
    return rect.origin.y + rect.size.height / 2.0;
};

//! Return the bottommost y-value of `rect'
cc.Rect.CCRectGetMinY = function (rect) {
    return rect.origin.y;
};

cc.Rect.CCRectContainsPoint = function (rect, point) {
    var ret = false;
    if (point.x >= cc.Rect.CCRectGetMinX(rect) && point.x <= cc.Rect.CCRectGetMaxX(rect)
        && point.y >= cc.Rect.CCRectGetMinY(rect) && point.y <= cc.Rect.CCRectGetMaxY(rect)) {
        ret = true;
    }
    return ret;
};

cc.Rect.CCRectIntersectsRect = function (rectA, rectB) {
    return !(cc.Rect.CCRectGetMaxX(rectA) < cc.Rect.CCRectGetMinX(rectB) ||
        cc.Rect.CCRectGetMaxX(rectB) < cc.Rect.CCRectGetMinX(rectA) ||
        cc.Rect.CCRectGetMaxY(rectA) < cc.Rect.CCRectGetMinY(rectB) ||
        cc.Rect.CCRectGetMaxY(rectB) < cc.Rect.CCRectGetMinY(rectA));
};

cc.Rect.CCRectOverlapsRect = function (rectA, rectB) {
    if (rectA.origin.x + rectA.size.width < rectB.origin.x) {
        return false;
    }
    if (rectB.origin.x + rectB.size.width < rectA.origin.x) {
        return false;
    }
    if (rectA.origin.y + rectA.size.height < rectB.origin.y) {
        return false;
    }
    if (rectB.origin.y + rectB.size.height < rectA.origin.y) {
        return false;
    }
    return true;
};

//Returns the smallest rectangle that contains the two source rectangles.
cc.Rect.CCRectUnion = function (rectA, rectB) {
    var rect = new cc.Rect(0, 0, 0, 0);
    rect.origin.x = Math.min(rectA.origin.x, rectB.origin.x);
    rect.origin.y = Math.min(rectA.origin.y, rectB.origin.y);
    rect.size.width = Math.max(rectA.origin.x + rectA.size.width, rectB.origin.x + rectB.size.width) - rect.origin.x;
    rect.size.height = Math.max(rectA.origin.y + rectA.size.height, rectB.origin.y + rectB.size.height) - rect.origin.y;
    return rect
};

//Returns the overlapping portion of 2 rectangles
cc.Rect.CCRectIntersection = function (rectA, rectB) {
    var intersection = new cc.Rect(
        Math.max(cc.Rect.CCRectGetMinX(rectA), cc.Rect.CCRectGetMinX(rectB)),
        Math.max(cc.Rect.CCRectGetMinY(rectA), cc.Rect.CCRectGetMinY(rectB)),
        0, 0);

    intersection.size.width = Math.min(cc.Rect.CCRectGetMaxX(rectA), cc.Rect.CCRectGetMaxX(rectB)) - cc.Rect.CCRectGetMinX(intersection);
    intersection.size.height = Math.min(cc.Rect.CCRectGetMaxY(rectA), cc.Rect.CCRectGetMaxY(rectB)) - cc.Rect.CCRectGetMinY(intersection);
    return intersection
};


cc.PointMake = function (x, y) {
    return new cc.Point(x, y);
};

cc.SizeMake = function (width, height) {
    return new cc.Size(width, height);
};

cc.RectMake = function (x, y, width, height) {
    return new cc.Rect(x, y, width, height);
};

/* The "left bottom" point -- equivalent to CCPointMake(0, 0). */
cc.PointZero = function () {
    return new cc.Point(0, 0)
};

/* The "zero" size -- equivalent to CCSizeMake(0, 0). */
cc.SizeZero = function () {
    return new cc.Size(0, 0)
};

/* The "zero" rectangle -- equivalent to CCRectMake(0, 0, 0, 0). */
cc.RectZero = function () {
    return new cc.Rect(0, 0, 0, 0)
};

