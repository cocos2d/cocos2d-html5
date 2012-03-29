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


cc.Point = cc.Class.extend(
{

    x : 0.0,
    y : 0.0,

    ctor:function(x1,  y1)
    {
        if(x1 === undefined && y1 === undefined){
            this.x = 0;
            this.y = 0;
        }
        else{
            this.x = x1;
            this.y = y1;
        }

    }

});
cc.Point.CCPointEqualToPoint = function(point1, point2)
{
    return ((point1.x == point2.x) && (point1.y == point2.y));

};

cc.Size = cc.Class.extend(
{

    width : 0.0,
    height : 0.0,

    ctor:function(width1,  height1)
    {
        if(width1 === undefined && height1 === undefined){
            this.width = 0;
            this.height = 0;
        }
        else{
            this.width = width1;
            this.height = height1;
        }

    }

});
cc.Size.CCSizeEqualToSize = function(size1, size2)
{
    return ((size1.width == size2.width) && (size1.height == size2.height));

};

cc.Rect = cc.Class.extend(
{

     origin : null,
     size : null,

    ctor:function( x1, y1, width1,  height1)
    {
        this.origin = new cc.Point();
        this.size = new cc.Size();
        if(width1 > 0 && height1 > 0){
            this.origin.x = x1;
            this.origin.y = y1;
            this.size.width = width1;
            this.size.height = height1;
        }
        else{
            this.origin.x = 0;
            this.origin.y = 0;
            this.size.width = 0;
            this.size.height = 0;
        }

    }

});
cc.Rect.CCRectEqualToRect = function(rect1, rect2)
{
    return ((cc.Point.CCPointEqualToPoint(rect1.origin, rect2.origin)) &&
        (cc.Size.CCSizeEqualToSize(rect1.size, rect2.size)));

};

//! return the rightmost x-value of 'rect'
cc.Rect.CCRectGetMaxX = function(rect)
{
    return (rect.origin.x + rect.size.width);
};

//! return the midpoint x-value of 'rect'
cc.Rect.CCRectGetMidX = function(rect)
{
    return ((rect.origin.x +rect.size.width)/2.0);
};
//! return the leftmost x-value of 'rect'
cc.Rect.CCRectGetMinX = function(rect)
{
    return rect.origin.x;
};

//! Return the topmost y-value of `rect'
cc.Rect.CCRectGetMaxY = function(rect)
{
    return(rect.origin.y+rect.size.height);
};

//! Return the midpoint y-value of `rect'
cc.Rect.CCRectGetMidY = function(rect)
{
    return ((rect.origin.y+rect.size.height)/2.0);
};

//! Return the bottommost y-value of `rect'
cc.Rect.CCRectGetMinY = function(rect)
{
    return rect.origin.y;
};

cc.Rect.CCRectContainsPoint = function(rect, point)
{
    var bRet = false;
    if(point.x >= cc.Rect.CCRectGetMinX(rect) && point.x <= cc.Rect.CCRectGetMaxX(rect)
        && point.y >= cc.Rect.CCRectGetMinY(rect) && point.y <= cc.Rect.CCRectGetMaxY(rect)){
        bRet = true;
    }
    return bRet;
};

cc.Rect.CCRectIntersectsRect = function(rectA, rectB)
{
    return !(cc.Rect.CCRectGetMaxX(rectA)< cc.Rect.CCRectGetMinX(rectB) ||
        cc.Rect.CCRectGetMaxX(rectB) < cc.Rect.CCRectGetMinX(rectA)||
        cc.Rect.CCRectGetMaxY(rectA)< cc.Rect.CCRectGetMinY(rectB) ||
        cc.Rect.CCRectGetMaxY(rectB) < cc.Rect.CCRectGetMinY(rectA));
};


cc.PointMake =  function(x, y)
{
    return new cc.Point(x,y);
};

cc.SizeMake = function(width, height)
{
    return new cc.Size(width, height);
};

cc.RectMake = function(x, y, width, height)
{
    return new cc.Rect(x, y, width, height);
};

/* The "left bottom" point -- equivalent to CCPointMake(0, 0). */
cc.PointZero = function(){ return new cc.Point(0,0)};

/* The "zero" size -- equivalent to CCSizeMake(0, 0). */
cc.SizeZero = function(){ return new cc.Size(0,0)};

/* The "zero" rectangle -- equivalent to CCRectMake(0, 0, 0, 0). */
cc.RectZero = function(){ return new cc.Rect(0,0,0,0)};

