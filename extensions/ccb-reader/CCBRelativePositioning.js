/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

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

cc.getAbsolutePosition = function (x, y, type, containerSize, propName, out) {
    var absPt = out || cc.p(0, 0);
    if (type === CCB_POSITIONTYPE_RELATIVE_BOTTOM_LEFT) {
        absPt.x = x;
        absPt.y = y;
    } else if (type === CCB_POSITIONTYPE_RELATIVE_TOP_LEFT) {
        absPt.x = x;
        absPt.y = containerSize.height - y;
    } else if (type === CCB_POSITIONTYPE_RELATIVE_TOP_RIGHT) {
        absPt.x = containerSize.width - x;
        absPt.y = containerSize.height - y;
    } else if (type === CCB_POSITIONTYPE_RELATIVE_BOTTOM_RIGHT) {
        absPt.x = containerSize.width - x;
        absPt.y = y;
    } else if (type === CCB_POSITIONTYPE_PERCENT) {
        absPt.x = (containerSize.width * x / 100.0);
        absPt.y = (containerSize.height * y / 100.0);
    } else if (type === CCB_POSITIONTYPE_MULTIPLY_RESOLUTION) {
        var resolutionScale = cc.BuilderReader.getResolutionScale();
        absPt.x = x * resolutionScale;
        absPt.y = y * resolutionScale;
    }
    return absPt;
};

cc.setRelativeScale = function (node, scaleX, scaleY, type, propName) {
    if (!node)
        throw new Error("cc.setRelativeScale(): node should be non-null");

    if (type === CCB_POSITIONTYPE_MULTIPLY_RESOLUTION) {
        var resolutionScale = cc.BuilderReader.getResolutionScale();

        scaleX *= resolutionScale;
        scaleY *= resolutionScale;
    }

    node.setScale(scaleX, scaleY);
};
