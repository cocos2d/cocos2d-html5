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


CCPoint = CCClass.extend(
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
CCPoint.CCPointEqualToPoint = function(point1, point2)
{
    return ((point1.x == point2.x) && (point1.y == point2.y));

};

CCSize = CCClass.extend(
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
CCSize.CCSizeEqualToSize = function(size1, size2)
{
    return ((size1.width == size2.width) && (size1.height == size2.height));

};

CCRect = CCClass.extend(
{

     origin : null,
     size : null,

    ctor:function( x1, y1, width1,  height1)
    {
        this.origin = new CCPoint();
        this.size = new CCSize();
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
CCRect.CCRectEqualToRect = function(rect1, rect2)
{
    return ((CCPoint.CCPointEqualToPoint(rect1.origin, rect2.origin)) &&
        (CCSize.CCSizeEqualToSize(rect1.size, rect2.size)));

};

CCRect.CCrectGetMaxX = function(rect)
{
    return (rect.origin.x + rect.size.width);
};

CCRect.CCRectGetMidX = function(rect)
{
    return ((rect.origin.x +rect.size.width)/2.0);
};

CCRect.CCRectGetMinX = function(rect)
{
    return rect.origin.x;
};

CCRect.CCRectGetMaxY = function(rect)
{
    return(rect.origin.y+rect.size.height);
};

CCRect.CCRectGetMidY = function(rect)
{
    return ((rect.origin.y+rect.size.height)/2.0);
};

CCRect.CCGetRectMinY = function(rect)
{
    return rect.origin.y;
};

CCRect.CCRectContainPoint = function(rect, point)
{
    var bRet = false;
    if(point.x >= CCRect.CCRectGetMinX(rect) && point.x <= CCRect.CCrectGetMaxX(rect)
        && point.y >= CCRect.CCRectGetMinY(rect) && point.y <= CCRect.CCrectGetMaxY(rect)){
        bRet = true;
    }
    retrun bRet;
};

CCRect.CCRectIntersectsRect = function(rectA, rectB)
{
    return !(CCRect.CCrectGetMaxX(rectA)< CCRect.CCRectGetMinX(rectB) ||
        CCRect.CCrectGetMaxX(rectB) < CCRect.CCRectGetMinX(rectA)||
        CCRect.CCrectGetMaxY(rectA)< CCRect.CCRectGetMinY(rectB) ||
        CCRect.CCrectGetMaxY(rectB) < CCRect.CCRectGetMinY(rectA));
};

function CCPointMake(x, y)
{
    return new CCPOint(x,y);
}
CC.CCPoiintMake = CCPointMake;

function CCSizeMake(width, height)
{
    return new CCSize(width, height);
}
CC.CCSizeMake = CCSizeMake;

function CCRectMake(x, y, width, height)
{
    return new CCRect(x, y, width, height);
}
CC.CCRectMake = CCRectMake;

CC.CCPointZero = new CCPoint(0,0);
CC.CCSizeZero = new CCSize(0,0);
CC.CCRectZero = new CCRect(0,0,0,0);

