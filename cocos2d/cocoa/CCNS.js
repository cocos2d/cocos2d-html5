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
var CCNS_REG1 = /^\s*\{\s*([\-]?\d+[.]?\d*)\s*,\s*([\-]?\d+[.]?\d*)\s*\}\s*$/;
var CCNS_REG2 = /^\s*\{\s*\{\s*([\-]?\d+[.]?\d*)\s*,\s*([\-]?\d+[.]?\d*)\s*\}\s*,\s*\{\s*([\-]?\d+[.]?\d*)\s*,\s*([\-]?\d+[.]?\d*)\s*\}\s*\}\s*$/
/**
 * Returns a Core Graphics rectangle structure corresponding to the data in a given string. <br/>
 * The string is not localized, so items are always separated with a comma. <br/>
 * If the string is not well-formed, the function returns cc.RectZero.
 * @function
 * @param {String} content content A string object whose contents are of the form "{{x,y},{w, h}}",<br/>
 * where x is the x coordinate, y is the y coordinate, w is the width, and h is the height. <br/>
 * These components can represent integer or float values.
 * @return {cc.Rect} A Core Graphics structure that represents a rectangle.
 * Constructor
 * @example
 * // example
 * var rect = cc.RectFromString("{{3,2},{4,5}}");
 */
cc.RectFromString = function (content) {
    var result = CCNS_REG2.exec(content);
    if(!result) return cc.RectZero();
    return cc.rect(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]), parseFloat(result[4]));
};

/**
 * Returns a Core Graphics point structure corresponding to the data in a given string.
 * @function
 * @param {String} content   A string object whose contents are of the form "{x,y}",
 * where x is the x coordinate and y is the y coordinate.<br/>
 * The x and y values can represent integer or float values. <br/>
 * The string is not localized, so items are always separated with a comma.<br/>
 * @return {cc.Point} A Core Graphics structure that represents a point.<br/>
 * If the string is not well-formed, the function returns cc.PointZero.
 * Constructor
 * @example
 * //example
 * var point = cc.PointFromString("{3.0,2.5}");
 */
cc.PointFromString = function (content) {
    var result = CCNS_REG1.exec(content);
    if(!result) return cc.PointZero();
    return cc.p(parseFloat(result[1]), parseFloat(result[2]));
};

/**
 * Returns a Core Graphics size structure corresponding to the data in a given string.
 * @function
 * @param {String} content   A string object whose contents are of the form "{w, h}",<br/>
 * where w is the width and h is the height.<br/>
 * The w and h values can be integer or float values. <br/>
 * The string is not localized, so items are always separated with a comma.<br/>
 * @return {cc.Size} A Core Graphics structure that represents a size.<br/>
 * If the string is not well-formed, the function returns cc.SizeZero.
 * @example
 * // example
 * var size = cc.SizeFromString("{3.0,2.5}");
 */
cc.SizeFromString = function (content) {
    var result = CCNS_REG1.exec(content);
    if(!result) return cc.SizeZero();
    return cc.size(parseFloat(result[1]), parseFloat(result[2]));
};