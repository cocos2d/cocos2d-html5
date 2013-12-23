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

/**
 * first, judge whether the form of the string like this: {x,y}  <br/>
 * if the form is right,the string will be splited into the parameter strs;<br/>
 * or the parameter strs will be empty. <br/>
 * if the form is right return true,else return false.<br/>
 * @function
 * @param {String} content
 * @param {String} strs
 * @return {String}
 */
cc.splitWithForm = function (content, strs) {
    do {
        if (!content) break;

        // string is empty
        if (content.length == 0) break;

        var posLeft = content.indexOf('{');
        var posRight = content.indexOf('}');

        // don't have '{' and '}'
        if (posLeft == -1 || posRight == -1) break;
        // '}' is before '{'
        if (posLeft > posRight) break;

        var pointStr = content.substr(posLeft + 1, posRight - posLeft - 1);
        // nothing between '{' and '}'
        if (pointStr.length == 0) break;

        var nPos1 = pointStr.indexOf('{');
        var nPos2 = pointStr.indexOf('}');
        // contain '{' or '}'
        if (nPos1 != -1 || nPos2 != -1) break;
        strs = pointStr.split(",");
        if (strs.length != 2 || strs[0] != null || strs[1] != null) {
            break;
        }
    } while (0);

    return strs;
};

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
    var result = cc.RectZero();
    do {
        if (!content) break;

        // find the first '{' and the third '}'
        var posLeft = content.indexOf('{') + 1;
        var posRight = content.lastIndexOf('}', content.length);
        if (posLeft == -1 || posRight == -1) break;

        content = content.substring(posLeft, posRight);
        var nPointEnd = content.indexOf('}');
        if (nPointEnd == -1) break;
        nPointEnd = content.indexOf(',', nPointEnd);
        if (nPointEnd == -1) break;
        // get the point string and size string
        var pointStr = content.substr(0, nPointEnd);
        var sizeStr = content.substr(nPointEnd + 1, content.length - nPointEnd);

        // split the string with ','
        var pointInfo = cc.splitWithForm(pointStr);
        var sizeInfo = cc.splitWithForm(sizeStr);

        var x = parseFloat(pointInfo[0]);
        var y = parseFloat(pointInfo[1]);
        var width = parseFloat(sizeInfo[0]);
        var height = parseFloat(sizeInfo[1]);

        result = cc.rect(x, y, width, height);
    } while (0);
    return result;
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
    var ret = cc.PointZero();
    try {
        if (content == "")
            return ret;

        var strs = cc.splitWithForm(content);
        var x = parseFloat(strs[0]);
        var y = parseFloat(strs[1]);
        ret = cc.p(x, y);
    } catch (e) {
    }
    return ret;
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
    var ret = cc.SizeZero();
    try {
        if (content == "")
            return ret;

        var strs = cc.splitWithForm(content);
        var width = parseFloat(strs[0]);
        var height = parseFloat(strs[1]);
        ret = cc.size(width, height);
    } catch (e) {
    }
    return ret;
};
