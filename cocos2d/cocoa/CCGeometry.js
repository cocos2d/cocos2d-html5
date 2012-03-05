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


CC.CCPoint = CC.Class.extend(
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
CC.CCPoint.CCPointEqualToPoint = function(point1, point2)
{
    return ((point1.x == point2.x) && (point1.y == point2.y));

};

CC.CCSize = CC.Class.extend(
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
CC.CCSize.CCSizeEqualToSize = function(size1, size2)
{
    return ((size1.width == size2.width) && (size1.height == size2.height));

};

CC.CCRect = CC.Class.extend(
{

     origin : null,
     size : null,

    ctor:function( x1, y1, width1,  height1)
    {
        this.origin = new CC.CCPoint();
        this.size = new CC.CCSize();
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
CC.CCRect.CCRectEqualToRect = function(rect1, rect2)
{
    return ((CC.CCPoint.CCPointEqualToPoint(rect1.origin, rect2.origin)) &&
        (CC.CCSize.CCSizeEqualToSize(rect1.size, rect2.size)));

};

//! return the rightmost x-value of 'rect'
CC.CCRect.CCrectGetMaxX = function(rect)
{
    return (rect.origin.x + rect.size.width);
};

//! return the midpoint x-value of 'rect'
CC.CCRect.CCRectGetMidX = function(rect)
{
    return ((rect.origin.x +rect.size.width)/2.0);
};
//! return the leftmost x-value of 'rect'
CC.CCRect.CCRectGetMinX = function(rect)
{
    return rect.origin.x;
};

//! Return the topmost y-value of `rect'
CC.CCRect.CCRectGetMaxY = function(rect)
{
    return(rect.origin.y+rect.size.height);
};

//! Return the midpoint y-value of `rect'
CC.CCRect.CCRectGetMidY = function(rect)
{
    return ((rect.origin.y+rect.size.height)/2.0);
};

//! Return the bottommost y-value of `rect'
CC.CCRect.CCRectGetMinY = function(rect)
{
    return rect.origin.y;
};

CC.CCRect.CCRectContainPoint = function(rect, point)
{
    var bRet = false;
    if(point.x >= CC.CCRect.CCRectGetMinX(rect) && point.x <= CC.CCRect.CCrectGetMaxX(rect)
        && point.y >= CC.CCRect.CCRectGetMinY(rect) && point.y <= CC.CCRect.CCRectGetMaxY(rect)){
        bRet = true;
    }
    return bRet;
};

CC.CCRect.CCRectIntersectsRect = function(rectA, rectB)
{
    return !(CC.CCRect.CCrectGetMaxX(rectA)< CC.CCRect.CCRectGetMinX(rectB) ||
        CC.CCRect.CCrectGetMaxX(rectB) < CC.CCRect.CCRectGetMinX(rectA)||
        CC.CCRect.CCRectGetMaxY(rectA)< CC.CCRect.CCRectGetMinY(rectB) ||
        CC.CCRect.CCRectGetMaxY(rectB) < CC.CCRect.CCRectGetMinY(rectA));
};


CC.CCPointMake =  function(x, y)
{
    return new CC.CCPoint(x,y);
};

CC.CCSizeMake = function(width, height)
{
    return new CC.CCSize(width, height);
};

CC.CCRectMake = function(x, y, width, height)
{
    return new CC.CCRect(x, y, width, height);
};

/* The "left bottom" point -- equivalent to CCPointMake(0, 0). */
CC.CCPointZero = new CC.CCPoint(0,0);

/* The "zero" size -- equivalent to CCSizeMake(0, 0). */
CC.CCSizeZero = new CC.CCSize(0,0);

/* The "zero" rectangle -- equivalent to CCRectMake(0, 0, 0, 0). */
CC.CCRectZero = new CC.CCRect(0,0,0,0);

