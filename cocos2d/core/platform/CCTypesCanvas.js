/****************************************************************************
 Copyright (c) 2010-2014 cocos2d-x.org

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

if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
    /**
     * The color class
     * @param {Number} r 0 to 255
     * @param {Number} g 0 to 255
     * @param {Number} b 0 to 255
     * @param {Number} a 0 to 255
     * @constructor
     */
    cc.Color = function (r, g, b, a) {
        this.r = r || 0;
        this.g = g || 0;
        this.b = b || 0;
        this.a = a || 0;
    };

    /**
     *
     * @param {Number|String|cc.Color} r
     * @param {Number} g
     * @param {Number} b
     * @param {Number} a
     * @returns {cc.Color}
     */
    cc.color = function (r, g, b, a) {
        if (r === undefined)
            return {r: 0, g: 0, b: 0, a: 255};
        if (typeof r === "string")
            return cc.hexToColor(r);
        if (typeof r === "object")
            return {r: r.r, g: r.g, b: r.b, a: r.a};
        return  {r: r, g: g, b: b, a: a };
    };

    /**
     * A vertex composed of 2 floats: x, y
     * @Class
     * @Construct
     * @param {Number} x1
     * @param {Number} y1
     */
    cc.Vertex2F = function (x1, y1) {
        this.x = x1 || 0;
        this.y = y1 || 0;
    };

    /**
     * A vertex composed of 3 floats: x, y, z
     * @Class
     * @Construct
     * @param {Number} x1
     * @param {Number} y1
     * @param {Number} z1
     */
    cc.Vertex3F = function (x1, y1, z1) {
        this.x = x1 || 0;
        this.y = y1 || 0;
        this.z = z1 || 0;
    };

    /**
     * A texcoord composed of 2 floats: u, y
     * @Class
     * @Construct
     * @param {Number} u1
     * @param {Number} v1
     */
    cc.Tex2F = function (u1, v1) {
        this.u = u1 || 0;
        this.v = v1 || 0;
    };
}