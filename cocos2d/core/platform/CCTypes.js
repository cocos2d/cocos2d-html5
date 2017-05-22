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

/**
 * Color class, please use cc.color() to construct a color
 * @class cc.Color
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @param {Number} a
 * @see cc.color
 */
cc.Color = function (r, g, b, a) {
    r = r || 0;
    g = g || 0;
    b = b || 0;
    a = typeof a === 'number' ? a : 255;
    this._val = ((r << 24) >>> 0) + (g << 16) + (b << 8) + a;
};

var _p = cc.Color.prototype;
_p._getR = function () {
    return (this._val & 0xff000000) >>> 24;
};
_p._setR = function (value) {
    this._val = (this._val & 0x00ffffff) | ((value << 24) >>> 0);
};
_p._getG = function () {
    return (this._val & 0x00ff0000) >> 16;
};
_p._setG = function (value) {
    this._val = (this._val & 0xff00ffff) | (value << 16);
};
_p._getB = function () {
    return (this._val & 0x0000ff00) >> 8;
};
_p._setB = function (value) {
    this._val = (this._val & 0xffff00ff) | (value << 8);
};
_p._getA = function () {
    return this._val & 0x000000ff;
};
_p._setA = function (value) {
    this._val = (this._val & 0xffffff00) | value;
};


/** @expose */
_p.r;
cc.defineGetterSetter(_p, "r", _p._getR, _p._setR);
/** @expose */
_p.g;
cc.defineGetterSetter(_p, "g", _p._getG, _p._setG);
/** @expose */
_p.b;
cc.defineGetterSetter(_p, "b", _p._getB, _p._setB);
/** @expose */
_p.a;
cc.defineGetterSetter(_p, "a", _p._getA, _p._setA);

/**
 * Generate a color object based on multiple forms of parameters
 * @example
 *
 * // 1. All channels separately as parameters
 * var color1 = cc.color(255, 255, 255, 255);
 *
 * // 2. Convert a hex string to a color
 * var color2 = cc.color("#000000");
 *
 * // 3. An color object as parameter
 * var color3 = cc.color({r: 255, g: 255, b: 255, a: 255});
 *
 * Alpha channel is optional. Default value is 255
 *
 * @param {Number|String|cc.Color} r
 * @param {Number} [g]
 * @param {Number} [b]
 * @param {Number} [a=255]
 * @return {cc.Color}
 */
cc.color = function (r, g, b, a) {
    if (r === undefined)
        return new cc.Color(0, 0, 0, 255);
    if (typeof r === 'object')
        return new cc.Color(r.r, r.g, r.b, (r.a == null) ? 255 : r.a);
    if (typeof r === 'string')
        return cc.hexToColor(r);
    return new cc.Color(r, g, b, (a == null ? 255 : a));
};

/**
 * returns true if both ccColor3B are equal. Otherwise it returns false.
 * @function
 * @param {cc.Color} color1
 * @param {cc.Color} color2
 * @return {Boolean}  true if both ccColor3B are equal. Otherwise it returns false.
 */
cc.colorEqual = function (color1, color2) {
    return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b;
};

/**
 * the device accelerometer reports values for each axis in units of g-force
 * @class cc.Acceleration
 * @constructor
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @param {Number} timestamp
 */
cc.Acceleration = function (x, y, z, timestamp) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.timestamp = timestamp || 0;
};

/**
 * @class cc.Vertex2F
 * @param {Number} x
 * @param {Number}y
 * @param {Array} arrayBuffer
 * @param {Number}offset
 * @constructor
 */
cc.Vertex2F = function (x, y, arrayBuffer, offset) {
    this._arrayBuffer = arrayBuffer || new ArrayBuffer(cc.Vertex2F.BYTES_PER_ELEMENT);
    this._offset = offset || 0;

    this._view = new Float32Array(this._arrayBuffer, this._offset, 2);
    this._view[0] = x || 0;
    this._view[1] = y || 0;
};
/**
 * @constant
 * @type {number}
 */
cc.Vertex2F.BYTES_PER_ELEMENT = 8;

_p = cc.Vertex2F.prototype;
_p._getX = function () {
    return this._view[0];
};
_p._setX = function (xValue) {
    this._view[0] = xValue;
};
_p._getY = function () {
    return this._view[1];
};
_p._setY = function (yValue) {
    this._view[1] = yValue;
};
/** @expose */
_p.x;
cc.defineGetterSetter(_p, "x", _p._getX, _p._setX);
/** @expose */
_p.y;
cc.defineGetterSetter(_p, "y", _p._getY, _p._setY);

/**
 * @class cc.Vertex3F
 * @param {Number} x
 * @param {Number} y
 * @param {Number}z
 * @param {Array} arrayBuffer
 * @param {Number} offset
 * @constructor
 */
cc.Vertex3F = function (x, y, z, arrayBuffer, offset) {
    this._arrayBuffer = arrayBuffer || new ArrayBuffer(cc.Vertex3F.BYTES_PER_ELEMENT);
    this._offset = offset || 0;

    var locArrayBuffer = this._arrayBuffer, locOffset = this._offset;
    this._view = new Float32Array(locArrayBuffer, locOffset, 3);
    this._view[0] = x || 0;
    this._view[1] = y || 0;
    this._view[2] = z || 0;
};
/**
 * @constant
 * @type {number}
 */
cc.Vertex3F.BYTES_PER_ELEMENT = 12;

_p = cc.Vertex3F.prototype;
_p._getX = function () {
    return this._view[0];
};
_p._setX = function (xValue) {
    this._view[0] = xValue;
};
_p._getY = function () {
    return this._view[1];
};
_p._setY = function (yValue) {
    this._view[1] = yValue;
};
_p._getZ = function () {
    return this._view[2];
};
_p._setZ = function (zValue) {
    this._view[2] = zValue;
};
/** @expose */
_p.x;
cc.defineGetterSetter(_p, "x", _p._getX, _p._setX);
/** @expose */
_p.y;
cc.defineGetterSetter(_p, "y", _p._getY, _p._setY);
/** @expose */
_p.z;
cc.defineGetterSetter(_p, "z", _p._getZ, _p._setZ);

/**
 * @class cc.Tex2F
 * @param {Number} u
 * @param {Number} v
 * @param {Array} arrayBuffer
 * @param {Number} offset
 * @constructor
 */
cc.Tex2F = function (u, v, arrayBuffer, offset) {
    this._arrayBuffer = arrayBuffer || new ArrayBuffer(cc.Tex2F.BYTES_PER_ELEMENT);
    this._offset = offset || 0;

    this._view = new Float32Array(this._arrayBuffer, this._offset, 2);
    this._view[0] = u || 0;
    this._view[1] = v || 0;
};
/**
 * @constants
 * @type {number}
 */
cc.Tex2F.BYTES_PER_ELEMENT = 8;

_p = cc.Tex2F.prototype;
_p._getU = function () {
    return this._view[0];
};
_p._setU = function (xValue) {
    this._view[0] = xValue;
};
_p._getV = function () {
    return this._view[1];
};
_p._setV = function (yValue) {
    this._view[1] = yValue;
};
/** @expose */
_p.u;
cc.defineGetterSetter(_p, "u", _p._getU, _p._setU);
/** @expose */
_p.v;
cc.defineGetterSetter(_p, "v", _p._getV, _p._setV);

/**
 * @class cc.Quad2
 * @param {cc.Vertex2F} tl
 * @param {cc.Vertex2F} tr
 * @param {cc.Vertex2F} bl
 * @param {cc.Vertex2F} br
 * @param {Array} arrayBuffer
 * @param {Number} offset
 * @constructor
 */
cc.Quad2 = function (tl, tr, bl, br, arrayBuffer, offset) {
    this._arrayBuffer = arrayBuffer || new ArrayBuffer(cc.Quad2.BYTES_PER_ELEMENT);
    this._offset = offset || 0;

    var locArrayBuffer = this._arrayBuffer, locOffset = this._offset, locElementLen = cc.Vertex2F.BYTES_PER_ELEMENT;
    this._tl = tl ? new cc.Vertex2F(tl.x, tl.y, locArrayBuffer, locOffset) : new cc.Vertex2F(0, 0, locArrayBuffer, locOffset);
    locOffset += locElementLen;
    this._tr = tr ? new cc.Vertex2F(tr.x, tr.y, locArrayBuffer, locOffset) : new cc.Vertex2F(0, 0, locArrayBuffer, locOffset);
    locOffset += locElementLen;
    this._bl = bl ? new cc.Vertex2F(bl.x, bl.y, locArrayBuffer, locOffset) : new cc.Vertex2F(0, 0, locArrayBuffer, locOffset);
    locOffset += locElementLen;
    this._br = br ? new cc.Vertex2F(br.x, br.y, locArrayBuffer, locOffset) : new cc.Vertex2F(0, 0, locArrayBuffer, locOffset);
};
/**
 * @constant
 * @type {number}
 */
cc.Quad2.BYTES_PER_ELEMENT = 32;

_p = cc.Quad2.prototype;
_p._getTL = function () {
    return this._tl;
};
_p._setTL = function (tlValue) {
    this._tl._view[0] = tlValue.x;
    this._tl._view[1] = tlValue.y;
};
_p._getTR = function () {
    return this._tr;
};
_p._setTR = function (trValue) {
    this._tr._view[0] = trValue.x;
    this._tr._view[1] = trValue.y;
};
_p._getBL = function () {
    return this._bl;
};
_p._setBL = function (blValue) {
    this._bl._view[0] = blValue.x;
    this._bl._view[1] = blValue.y;
};
_p._getBR = function () {
    return this._br;
};
_p._setBR = function (brValue) {
    this._br._view[0] = brValue.x;
    this._br._view[1] = brValue.y;
};

/** @expose */
_p.tl;
cc.defineGetterSetter(_p, "tl", _p._getTL, _p._setTL);
/** @expose */
_p.tr;
cc.defineGetterSetter(_p, "tr", _p._getTR, _p._setTR);
/** @expose */
_p.bl;
cc.defineGetterSetter(_p, "bl", _p._getBL, _p._setBL);
/** @expose */
_p.br;
cc.defineGetterSetter(_p, "br", _p._getBR, _p._setBR);

/**
 * A 3D Quad. 4 * 3 floats
 * @Class cc.Quad3
 * @Construct
 * @param {cc.Vertex3F} bl
 * @param {cc.Vertex3F} br
 * @param {cc.Vertex3F} tl
 * @param {cc.Vertex3F} tr
 */
cc.Quad3 = function (bl, br, tl, tr, arrayBuffer, offset) {
    this._arrayBuffer = arrayBuffer || new ArrayBuffer(cc.Quad3.BYTES_PER_ELEMENT);
    this._offset = offset || 0;
    
    var locArrayBuffer = this._arrayBuffer, locOffset = this._offset, locElementLen = cc.Vertex3F.BYTES_PER_ELEMENT;
    this.bl = bl ? new cc.Vertex3F(bl.x, bl.y, bl.z, locArrayBuffer, locOffset) : new cc.Vertex3F(0, 0, 0, locArrayBuffer, locOffset);
    locOffset += locElementLen;
    this.br = br ? new cc.Vertex3F(br.x, br.y, br.z, locArrayBuffer, locOffset) : new cc.Vertex3F(0, 0, 0, locArrayBuffer, locOffset);
    locOffset += locElementLen;
    this.tl = tl ? new cc.Vertex3F(tl.x, tl.y, tl.z, locArrayBuffer, locOffset) : new cc.Vertex3F(0, 0, 0, locArrayBuffer, locOffset);
    locOffset += locElementLen;
    this.tr = tr ? new cc.Vertex3F(tr.x, tr.y, tr.z, locArrayBuffer, locOffset) : new cc.Vertex3F(0, 0, 0, locArrayBuffer, locOffset);
};
/**
 * @constant
 * @type {number}
 */
cc.Quad3.BYTES_PER_ELEMENT = 48;

/**
 * @class cc.V3F_C4B_T2F
 * @param {cc.Vertex3F} vertices
 * @param {cc.Color} colors
 * @param {cc.Tex2F} texCoords
 * @param {Array} arrayBuffer
 * @param {Number} offset
 * @constructor
 */
cc.V3F_C4B_T2F = function (vertices, colors, texCoords, arrayBuffer, offset) {
    this._arrayBuffer = arrayBuffer || new ArrayBuffer(cc.V3F_C4B_T2F.BYTES_PER_ELEMENT);
    this._offset = offset || 0;

    var locArrayBuffer = this._arrayBuffer, locOffset = this._offset;
    this._vertices = vertices ? new cc.Vertex3F(vertices.x, vertices.y, vertices.z, locArrayBuffer, locOffset) :
        new cc.Vertex3F(0, 0, 0, locArrayBuffer, locOffset);

    locOffset += cc.Vertex3F.BYTES_PER_ELEMENT;
    this._colors = colors ? new cc._WebGLColor(colors.r, colors.g, colors.b, colors.a, locArrayBuffer, locOffset) :
        new cc._WebGLColor(0, 0, 0, 0, locArrayBuffer, locOffset);

    locOffset += cc._WebGLColor.BYTES_PER_ELEMENT;
    this._texCoords = texCoords ? new cc.Tex2F(texCoords.u, texCoords.v, locArrayBuffer, locOffset) :
        new cc.Tex2F(0, 0, locArrayBuffer, locOffset);
};
/**
 * @constant
 * @type {number}
 */
cc.V3F_C4B_T2F.BYTES_PER_ELEMENT = 24;

_p = cc.V3F_C4B_T2F.prototype;
_p._getVertices = function () {
    return this._vertices;
};
_p._setVertices = function (verticesValue) {
    var locVertices = this._vertices;
    locVertices._view[0] = verticesValue.x;
    locVertices._view[1] = verticesValue.y;
    locVertices._view[2] = verticesValue.z;
};
_p._getColor = function () {
    return this._colors;
};
_p._setColor = function (colorValue) {
    var locColors = this._colors;
    locColors._view[0] = colorValue.r;
    locColors._view[1] = colorValue.g;
    locColors._view[2] = colorValue.b;
    locColors._view[3] = colorValue.a;
};
_p._getTexCoords = function () {
    return this._texCoords;
};
_p._setTexCoords = function (texValue) {
    this._texCoords._view[0] = texValue.u;
    this._texCoords._view[1] = texValue.v;
};
/** @expose */
_p.vertices;
cc.defineGetterSetter(_p, "vertices", _p._getVertices, _p._setVertices);
/** @expose */
_p.colors;
cc.defineGetterSetter(_p, "colors", _p._getColor, _p._setColor);
/** @expose */
_p.texCoords;
cc.defineGetterSetter(_p, "texCoords", _p._getTexCoords, _p._setTexCoords);

/**
 * @cc.class cc.V3F_C4B_T2F_Quad
 * @param {cc.V3F_C4B_T2F} tl
 * @param {cc.V3F_C4B_T2F} bl
 * @param {cc.V3F_C4B_T2F} tr
 * @param {cc.V3F_C4B_T2F} br
 * @param {Array} arrayBuffer
 * @param {Number} offset
 * @constructor
 */
cc.V3F_C4B_T2F_Quad = function (tl, bl, tr, br, arrayBuffer, offset) {
    this._arrayBuffer = arrayBuffer || new ArrayBuffer(cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT);
    this._offset = offset || 0;

    var locArrayBuffer = this._arrayBuffer, locOffset = this._offset, locElementLen = cc.V3F_C4B_T2F.BYTES_PER_ELEMENT;
    this._tl = tl ? new cc.V3F_C4B_T2F(tl.vertices, tl.colors, tl.texCoords, locArrayBuffer, locOffset) :
        new cc.V3F_C4B_T2F(null, null, null, locArrayBuffer, locOffset);
    locOffset += locElementLen;
    this._bl = bl ? new cc.V3F_C4B_T2F(bl.vertices, bl.colors, bl.texCoords, locArrayBuffer, locOffset) :
        new cc.V3F_C4B_T2F(null, null, null, locArrayBuffer, locOffset);
    locOffset += locElementLen;
    this._tr = tr ? new cc.V3F_C4B_T2F(tr.vertices, tr.colors, tr.texCoords, locArrayBuffer, locOffset) :
        new cc.V3F_C4B_T2F(null, null, null, locArrayBuffer, locOffset);
    locOffset += locElementLen;
    this._br = br ? new cc.V3F_C4B_T2F(br.vertices, br.colors, br.texCoords, locArrayBuffer, locOffset) :
        new cc.V3F_C4B_T2F(null, null, null, locArrayBuffer, locOffset);
};
/**
 * @constant
 * @type {number}
 */
cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT = 96;
_p = cc.V3F_C4B_T2F_Quad.prototype;
_p._getTL = function () {
    return this._tl;
};
_p._setTL = function (tlValue) {
    var locTl = this._tl;
    locTl.vertices = tlValue.vertices;
    locTl.colors = tlValue.colors;
    locTl.texCoords = tlValue.texCoords;
};
_p._getBL = function () {
    return this._bl;
};
_p._setBL = function (blValue) {
    var locBl = this._bl;
    locBl.vertices = blValue.vertices;
    locBl.colors = blValue.colors;
    locBl.texCoords = blValue.texCoords;
};
_p._getTR = function () {
    return this._tr;
};
_p._setTR = function (trValue) {
    var locTr = this._tr;
    locTr.vertices = trValue.vertices;
    locTr.colors = trValue.colors;
    locTr.texCoords = trValue.texCoords;
};
_p._getBR = function () {
    return this._br;
};
_p._setBR = function (brValue) {
    var locBr = this._br;
    locBr.vertices = brValue.vertices;
    locBr.colors = brValue.colors;
    locBr.texCoords = brValue.texCoords;
};
_p._getArrayBuffer = function () {
    return this._arrayBuffer;
};

/** @expose */
_p.tl;
cc.defineGetterSetter(_p, "tl", _p._getTL, _p._setTL);
/** @expose */
_p.tr;
cc.defineGetterSetter(_p, "tr", _p._getTR, _p._setTR);
/** @expose */
_p.bl;
cc.defineGetterSetter(_p, "bl", _p._getBL, _p._setBL);
/** @expose */
_p.br;
cc.defineGetterSetter(_p, "br", _p._getBR, _p._setBR);
/** @expose */
_p.arrayBuffer;
cc.defineGetterSetter(_p, "arrayBuffer", _p._getArrayBuffer, null);

/**
 * @function
 * @returns {cc.V3F_C4B_T2F_Quad}
 */
cc.V3F_C4B_T2F_QuadZero = function () {
    return new cc.V3F_C4B_T2F_Quad();
};

/**
 * @function
 * @param {cc.V3F_C4B_T2F_Quad} sourceQuad
 * @return {cc.V3F_C4B_T2F_Quad}
 */
cc.V3F_C4B_T2F_QuadCopy = function (sourceQuad) {
    if (!sourceQuad)
        return cc.V3F_C4B_T2F_QuadZero();

    //return new cc.V3F_C4B_T2F_Quad(sourceQuad,tl,sourceQuad,bl,sourceQuad.tr,sourceQuad.br,null,0);
    var srcTL = sourceQuad.tl, srcBL = sourceQuad.bl, srcTR = sourceQuad.tr, srcBR = sourceQuad.br;
    return {
        tl: {
            vertices: {x: srcTL.vertices.x, y: srcTL.vertices.y, z: srcTL.vertices.z},
            colors: {r: srcTL.colors.r, g: srcTL.colors.g, b: srcTL.colors.b, a: srcTL.colors.a},
            texCoords: {u: srcTL.texCoords.u, v: srcTL.texCoords.v}
        },
        bl: {
            vertices: {x: srcBL.vertices.x, y: srcBL.vertices.y, z: srcBL.vertices.z},
            colors: {r: srcBL.colors.r, g: srcBL.colors.g, b: srcBL.colors.b, a: srcBL.colors.a},
            texCoords: {u: srcBL.texCoords.u, v: srcBL.texCoords.v}
        },
        tr: {
            vertices: {x: srcTR.vertices.x, y: srcTR.vertices.y, z: srcTR.vertices.z},
            colors: {r: srcTR.colors.r, g: srcTR.colors.g, b: srcTR.colors.b, a: srcTR.colors.a},
            texCoords: {u: srcTR.texCoords.u, v: srcTR.texCoords.v}
        },
        br: {
            vertices: {x: srcBR.vertices.x, y: srcBR.vertices.y, z: srcBR.vertices.z},
            colors: {r: srcBR.colors.r, g: srcBR.colors.g, b: srcBR.colors.b, a: srcBR.colors.a},
            texCoords: {u: srcBR.texCoords.u, v: srcBR.texCoords.v}
        }
    };
};

/**
 * @function
 * @param {Array} sourceQuads
 * @returns {Array}
 */
cc.V3F_C4B_T2F_QuadsCopy = function (sourceQuads) {
    if (!sourceQuads)
        return [];

    var retArr = [];
    for (var i = 0; i < sourceQuads.length; i++) {
        retArr.push(cc.V3F_C4B_T2F_QuadCopy(sourceQuads[i]));
    }
    return retArr;
};

//redefine cc.V2F_C4B_T2F
/**
 * @class cc.V2F_C4B_T2F
 * @param {cc.Vertex2F} vertices
 * @param {cc.Color} colors
 * @param {cc.Tex2F} texCoords
 * @param {Array} arrayBuffer
 * @param {Number} offset
 * @constructor
 */
cc.V2F_C4B_T2F = function (vertices, colors, texCoords, arrayBuffer, offset) {
    this._arrayBuffer = arrayBuffer || new ArrayBuffer(cc.V2F_C4B_T2F.BYTES_PER_ELEMENT);
    this._offset = offset || 0;

    var locArrayBuffer = this._arrayBuffer, locOffset = this._offset;
    this._vertices = vertices ? new cc.Vertex2F(vertices.x, vertices.y, locArrayBuffer, locOffset) :
        new cc.Vertex2F(0, 0, locArrayBuffer, locOffset);
    locOffset += cc.Vertex2F.BYTES_PER_ELEMENT;
    this._colors = colors ? new cc._WebGLColor(colors.r, colors.g, colors.b, colors.a, locArrayBuffer, locOffset) :
        new cc._WebGLColor(0, 0, 0, 0, locArrayBuffer, locOffset);
    locOffset += cc._WebGLColor.BYTES_PER_ELEMENT;
    this._texCoords = texCoords ? new cc.Tex2F(texCoords.u, texCoords.v, locArrayBuffer, locOffset) :
        new cc.Tex2F(0, 0, locArrayBuffer, locOffset);
};

/**
 * @constant
 * @type {number}
 */
cc.V2F_C4B_T2F.BYTES_PER_ELEMENT = 20;
_p = cc.V2F_C4B_T2F.prototype;
_p._getVertices = function () {
    return this._vertices;
};
_p._setVertices = function (verticesValue) {
    this._vertices._view[0] = verticesValue.x;
    this._vertices._view[1] = verticesValue.y;
};
_p._getColor = function () {
    return this._colors;
};
_p._setColor = function (colorValue) {
    var locColors = this._colors;
    locColors._view[0] = colorValue.r;
    locColors._view[1] = colorValue.g;
    locColors._view[2] = colorValue.b;
    locColors._view[3] = colorValue.a;
};
_p._getTexCoords = function () {
    return this._texCoords;
};
_p._setTexCoords = function (texValue) {
    this._texCoords._view[0] = texValue.u;
    this._texCoords._view[1] = texValue.v;
};

/** @expose */
_p.vertices;
cc.defineGetterSetter(_p, "vertices", _p._getVertices, _p._setVertices);
/** @expose */
_p.colors;
cc.defineGetterSetter(_p, "colors", _p._getColor, _p._setColor);
/** @expose */
_p.texCoords;
cc.defineGetterSetter(_p, "texCoords", _p._getTexCoords, _p._setTexCoords);

//redefine cc.V2F_C4B_T2F_Triangle
/**
 * @class cc.V2F_C4B_T2F_Triangle
 * @param {cc.V2F_C4B_T2F} a
 * @param {cc.V2F_C4B_T2F} b
 * @param {cc.V2F_C4B_T2F} c
 * @param {Array} arrayBuffer
 * @param {Number} offset
 * @constructor
 */
cc.V2F_C4B_T2F_Triangle = function (a, b, c, arrayBuffer, offset) {
    this._arrayBuffer = arrayBuffer || new ArrayBuffer(cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT);
    this._offset = offset || 0;

    var locArrayBuffer = this._arrayBuffer, locOffset = this._offset, locElementLen = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT;
    this._a = a ? new cc.V2F_C4B_T2F(a.vertices, a.colors, a.texCoords, locArrayBuffer, locOffset) :
        new cc.V2F_C4B_T2F(null, null, null, locArrayBuffer, locOffset);
    locOffset += locElementLen;
    this._b = b ? new cc.V2F_C4B_T2F(b.vertices, b.colors, b.texCoords, locArrayBuffer, locOffset) :
        new cc.V2F_C4B_T2F(null, null, null, locArrayBuffer, locOffset);
    locOffset += locElementLen;
    this._c = c ? new cc.V2F_C4B_T2F(c.vertices, c.colors, c.texCoords, locArrayBuffer, locOffset) :
        new cc.V2F_C4B_T2F(null, null, null, locArrayBuffer, locOffset);
};
/**
 * @constant
 * @type {number}
 */
cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT = 60;
_p = cc.V2F_C4B_T2F_Triangle.prototype;
_p._getA = function () {
    return this._a;
};
_p._setA = function (aValue) {
    var locA = this._a;
    locA.vertices = aValue.vertices;
    locA.colors = aValue.colors;
    locA.texCoords = aValue.texCoords;
};
_p._getB = function () {
    return this._b;
};
_p._setB = function (bValue) {
    var locB = this._b;
    locB.vertices = bValue.vertices;
    locB.colors = bValue.colors;
    locB.texCoords = bValue.texCoords;
};
_p._getC = function () {
    return this._c;
};
_p._setC = function (cValue) {
    var locC = this._c;
    locC.vertices = cValue.vertices;
    locC.colors = cValue.colors;
    locC.texCoords = cValue.texCoords;
};

/** @expose */
_p.a;
cc.defineGetterSetter(_p, "a", _p._getA, _p._setA);
/** @expose */
_p.b;
cc.defineGetterSetter(_p, "b", _p._getB, _p._setB);
/** @expose */
_p.c;
cc.defineGetterSetter(_p, "c", _p._getC, _p._setC);

/**
 * Helper macro that creates an Vertex2F type composed of 2 floats: x, y
 * @function
 * @param {Number} x
 * @param {Number} y
 * @return {cc.Vertex2F}
 */
cc.vertex2 = function (x, y) {
    return new cc.Vertex2F(x, y);
};

/**
 * Helper macro that creates an Vertex3F type composed of 3 floats: x, y, z
 * @function
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @return {cc.Vertex3F}
 */
cc.vertex3 = function (x, y, z) {
    return new cc.Vertex3F(x, y, z);
};

/**
 * Helper macro that creates an Tex2F type: A texcoord composed of 2 floats: u, y
 * @function
 * @param {Number} u
 * @param {Number} v
 * @return {cc.Tex2F}
 */
cc.tex2 = function (u, v) {
    return new cc.Tex2F(u, v);
};

/**
 * Blend Function used for textures
 * @Class cc.BlendFunc
 * @Constructor
 * @param {Number} src1 source blend function
 * @param {Number} dst1 destination blend function
 */
cc.BlendFunc = function (src1, dst1) {
    this.src = src1;
    this.dst = dst1;
};

/**
 * @function
 * @returns {cc.BlendFunc}
 */
cc.blendFuncDisable = function () {
    return new cc.BlendFunc(cc.ONE, cc.ZERO);
};

/**
 * convert a string of color for style to Color.
 * e.g. "#ff06ff"  to : cc.color(255,6,255)
 * @function
 * @param {String} hex
 * @return {cc.Color}
 */
cc.hexToColor = function (hex) {
    hex = hex.replace(/^#?/, "0x");
    var c = parseInt(hex);
    var r = c >> 16;
    var g = (c >> 8) % 256;
    var b = c % 256;
    return new cc.Color(r, g, b);
};

/**
 * convert Color to a string of color for style.
 * e.g.  cc.color(255,6,255)  to : "#ff06ff"
 * @function
 * @param {cc.Color} color
 * @return {String}
 */
cc.colorToHex = function (color) {
    var hR = color.r.toString(16), hG = color.g.toString(16), hB = color.b.toString(16);
    return "#" + (color.r < 16 ? ("0" + hR) : hR) + (color.g < 16 ? ("0" + hG) : hG) + (color.b < 16 ? ("0" + hB) : hB);
};

/**
 * text alignment : left
 * @constant
 * @type Number
 */
cc.TEXT_ALIGNMENT_LEFT = 0;

/**
 * text alignment : center
 * @constant
 * @type Number
 */
cc.TEXT_ALIGNMENT_CENTER = 1;

/**
 * text alignment : right
 * @constant
 * @type Number
 */
cc.TEXT_ALIGNMENT_RIGHT = 2;

/**
 * text alignment : top
 * @constant
 * @type Number
 */
cc.VERTICAL_TEXT_ALIGNMENT_TOP = 0;

/**
 * text alignment : center
 * @constant
 * @type Number
 */
cc.VERTICAL_TEXT_ALIGNMENT_CENTER = 1;

/**
 * text alignment : bottom
 * @constant
 * @type Number
 */
cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM = 2;

cc._Dictionary = cc.Class.extend({
    _keyMapTb: null,
    _valueMapTb: null,
    __currId: 0,

    ctor: function () {
        this._keyMapTb = {};
        this._valueMapTb = {};
        this.__currId = 2 << (0 | (Math.random() * 10));
    },

    __getKey: function () {
        this.__currId++;
        return "key_" + this.__currId;
    },

    setObject: function (value, key) {
        if (key == null)
            return;

        var keyId = this.__getKey();
        this._keyMapTb[keyId] = key;
        this._valueMapTb[keyId] = value;
    },

    objectForKey: function (key) {
        if (key == null)
            return null;

        var locKeyMapTb = this._keyMapTb;
        for (var keyId in locKeyMapTb) {
            if (locKeyMapTb[keyId] === key)
                return this._valueMapTb[keyId];
        }
        return null;
    },

    valueForKey: function (key) {
        return this.objectForKey(key);
    },

    removeObjectForKey: function (key) {
        if (key == null)
            return;

        var locKeyMapTb = this._keyMapTb;
        for (var keyId in locKeyMapTb) {
            if (locKeyMapTb[keyId] === key) {
                delete this._valueMapTb[keyId];
                delete locKeyMapTb[keyId];
                return;
            }
        }
    },

    removeObjectsForKeys: function (keys) {
        if (keys == null)
            return;

        for (var i = 0; i < keys.length; i++)
            this.removeObjectForKey(keys[i]);
    },

    allKeys: function () {
        var keyArr = [], locKeyMapTb = this._keyMapTb;
        for (var key in locKeyMapTb)
            keyArr.push(locKeyMapTb[key]);
        return keyArr;
    },

    removeAllObjects: function () {
        this._keyMapTb = {};
        this._valueMapTb = {};
    },

    count: function () {
        return this.allKeys().length;
    }
});

/**
 * Common usage:
 *
 * var fontDef = new cc.FontDefinition();
 * fontDef.fontName = "Arial";
 * fontDef.fontSize = 12;
 * ...
 *
 * OR using inline definition useful for constructor injection
 *
 * var fontDef = new cc.FontDefinition({
 *  fontName: "Arial",
 *  fontSize: 12
 * });
 *
 *
 *
 * @class cc.FontDefinition
 * @param {Object} properties - (OPTIONAL) Allow inline FontDefinition
 * @constructor
 */
cc.FontDefinition = function (properties) {
    var _t = this;
    _t.fontName = "Arial";
    _t.fontSize = 12;
    _t.textAlign = cc.TEXT_ALIGNMENT_CENTER;
    _t.verticalAlign = cc.VERTICAL_TEXT_ALIGNMENT_TOP;
    _t.fillStyle = cc.color(255, 255, 255, 255);
    _t.boundingWidth = 0;
    _t.boundingHeight = 0;

    _t.strokeEnabled = false;
    _t.strokeStyle = cc.color(255, 255, 255, 255);
    _t.lineWidth = 1;
    _t.lineHeight = "normal";
    _t.fontStyle = "normal";
    _t.fontWeight = "normal";

    _t.shadowEnabled = false;
    _t.shadowOffsetX = 0;
    _t.shadowOffsetY = 0;
    _t.shadowBlur = 0;
    _t.shadowOpacity = 1.0;

    //properties mapping:
    if (properties && properties instanceof Object) {
        for (var key in properties) {
            _t[key] = properties[key];
        }
    }
};
/**
 * Web ONLY
 * */
cc.FontDefinition.prototype._getCanvasFontStr = function () {
    var lineHeight = !this.lineHeight.charAt ? this.lineHeight + "px" : this.lineHeight;
    return this.fontStyle + " " + this.fontWeight + " " + this.fontSize + "px/" + lineHeight + " '" + this.fontName + "'";
};

cc.game.addEventListener(cc.game.EVENT_RENDERER_INITED, function () {
    if (cc._renderType === cc.game.RENDER_TYPE_WEBGL) {
        //redefine Color
        cc._WebGLColor = function (r, g, b, a, arrayBuffer, offset) {
            this._arrayBuffer = arrayBuffer || new ArrayBuffer(cc._WebGLColor.BYTES_PER_ELEMENT);
            this._offset = offset || 0;

            var locArrayBuffer = this._arrayBuffer, locOffset = this._offset;
            this._view = new Uint8Array(locArrayBuffer, locOffset, 4);

            this._view[0] = r || 0;
            this._view[1] = g || 0;
            this._view[2] = b || 0;
            this._view[3] = (a == null) ? 255 : a;

            if (a === undefined)
                this.a_undefined = true;
        };
        cc._WebGLColor.BYTES_PER_ELEMENT = 4;
        _p = cc._WebGLColor.prototype;
        _p._getR = function () {
            return this._view[0];
        };
        _p._setR = function (value) {
            this._view[0] = value < 0 ? 0 : value;
        };
        _p._getG = function () {
            return this._view[1];
        };
        _p._setG = function (value) {
            this._view[1] = value < 0 ? 0 : value;
        };
        _p._getB = function () {
            return this._view[2];
        };
        _p._setB = function (value) {
            this._view[2] = value < 0 ? 0 : value;
        };
        _p._getA = function () {
            return this._view[3];
        };
        _p._setA = function (value) {
            this._view[3] = value < 0 ? 0 : value;
        };
        cc.defineGetterSetter(_p, "r", _p._getR, _p._setR);
        cc.defineGetterSetter(_p, "g", _p._getG, _p._setG);
        cc.defineGetterSetter(_p, "b", _p._getB, _p._setB);
        cc.defineGetterSetter(_p, "a", _p._getA, _p._setA);
    }
});

_p = cc.color;
/**
 * White color (255, 255, 255, 255)
 * @returns {cc.Color}
 * @private
 */
_p._getWhite = function () {
    return cc.color(255, 255, 255);
};

/**
 *  Yellow color (255, 255, 0, 255)
 * @returns {cc.Color}
 * @private
 */
_p._getYellow = function () {
    return cc.color(255, 255, 0);
};

/**
 *  Blue color (0, 0, 255, 255)
 * @type {cc.Color}
 * @private
 */
_p._getBlue = function () {
    return  cc.color(0, 0, 255);
};

/**
 *  Green Color (0, 255, 0, 255)
 * @type {cc.Color}
 * @private
 */
_p._getGreen = function () {
    return cc.color(0, 255, 0);
};

/**
 *  Red Color (255, 0, 0, 255)
 * @type {cc.Color}
 * @private
 */
_p._getRed = function () {
    return cc.color(255, 0, 0);
};

/**
 *  Magenta Color (255, 0, 255, 255)
 * @type {cc.Color}
 * @private
 */
_p._getMagenta = function () {
    return cc.color(255, 0, 255);
};

/**
 *  Black Color (0, 0, 0, 255)
 * @type {cc.Color}
 * @private
 */
_p._getBlack = function () {
    return cc.color(0, 0, 0);
};

/**
 *  Orange Color (255, 127, 0, 255)
 * @type {_p}
 * @private
 */
_p._getOrange = function () {
    return cc.color(255, 127, 0);
};

/**
 *  Gray Color (166, 166, 166, 255)
 * @type {_p}
 * @private
 */
_p._getGray = function () {
    return cc.color(166, 166, 166);
};

/** @expose */
_p.WHITE;
cc.defineGetterSetter(_p, "WHITE", _p._getWhite);
/** @expose */
_p.YELLOW;
cc.defineGetterSetter(_p, "YELLOW", _p._getYellow);
/** @expose */
_p.BLUE;
cc.defineGetterSetter(_p, "BLUE", _p._getBlue);
/** @expose */
_p.GREEN;
cc.defineGetterSetter(_p, "GREEN", _p._getGreen);
/** @expose */
_p.RED;
cc.defineGetterSetter(_p, "RED", _p._getRed);
/** @expose */
_p.MAGENTA;
cc.defineGetterSetter(_p, "MAGENTA", _p._getMagenta);
/** @expose */
_p.BLACK;
cc.defineGetterSetter(_p, "BLACK", _p._getBlack);
/** @expose */
_p.ORANGE;
cc.defineGetterSetter(_p, "ORANGE", _p._getOrange);
/** @expose */
_p.GRAY;
cc.defineGetterSetter(_p, "GRAY", _p._getGray);

cc.BlendFunc._disable = function(){
    return new cc.BlendFunc(cc.ONE, cc.ZERO);
};
cc.BlendFunc._alphaPremultiplied = function(){
    return new cc.BlendFunc(cc.ONE, cc.ONE_MINUS_SRC_ALPHA);
};
cc.BlendFunc._alphaNonPremultiplied = function(){
    return new cc.BlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA);
};
cc.BlendFunc._additive = function(){
    return new cc.BlendFunc(cc.SRC_ALPHA, cc.ONE);
};

/** @expose */
cc.BlendFunc.DISABLE;
cc.defineGetterSetter(cc.BlendFunc, "DISABLE", cc.BlendFunc._disable);
/** @expose */
cc.BlendFunc.ALPHA_PREMULTIPLIED;
cc.defineGetterSetter(cc.BlendFunc, "ALPHA_PREMULTIPLIED", cc.BlendFunc._alphaPremultiplied);
/** @expose */
cc.BlendFunc.ALPHA_NON_PREMULTIPLIED;
cc.defineGetterSetter(cc.BlendFunc, "ALPHA_NON_PREMULTIPLIED", cc.BlendFunc._alphaNonPremultiplied);
/** @expose */
cc.BlendFunc.ADDITIVE;
cc.defineGetterSetter(cc.BlendFunc, "ADDITIVE", cc.BlendFunc._additive);
