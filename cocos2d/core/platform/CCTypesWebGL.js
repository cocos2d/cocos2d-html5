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

var cc = cc || {};
cc._tmp = cc._tmp || {};

cc.game.addEventListener(cc.game.EVENT_RENDERER_INITED, function () {
    if (cc._renderType !== cc.game.RENDER_TYPE_WEBGL) {
        return;
    }

    //redefine some types with ArrayBuffer for WebGL
    /**
     * @class cc.Color
     * @param {Number} r
     * @param {Number}g
     * @param {Number} b
     * @param {Number} a
     * @param {Array} arrayBuffer
     * @param {Number} offset
     * @returns {cc.Color}
     */
    cc.color = function (r, g, b, a, arrayBuffer, offset) {
        if (r === undefined)
            return new cc.Color(0, 0, 0, 255, arrayBuffer, offset);
        if (cc.isString(r)) {
            var color = cc.hexToColor(r);
            return new cc.Color(color.r, color.g, color.b, color.a);
        }
        if (cc.isObject(r))
            return new cc.Color(r.r, r.g, r.b, r.a, r.arrayBuffer, r.offset);
        return new cc.Color(r, g, b, a, arrayBuffer, offset);
    };
    //redefine cc.Color
    /**
     * @class cc.Color
     * @param {Number} r
     * @param {Number}g
     * @param {Number} b
     * @param {Number} a
     * @param {Array} arrayBuffer
     * @param {Number} offset
     * @constructor
     */
    cc.Color = function (r, g, b, a, arrayBuffer, offset) {
        this._arrayBuffer = arrayBuffer || new ArrayBuffer(cc.Color.BYTES_PER_ELEMENT);
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
    /**
     * @constant
     * @type {number}
     */
    cc.Color.BYTES_PER_ELEMENT = 4;
    var _p = cc.Color.prototype;
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

    cc.assert(cc.isFunction(cc._tmp.PrototypeColor), cc._LogInfos.MissingFile, "CCTypesPropertyDefine.js");
    cc._tmp.PrototypeColor();
    delete cc._tmp.PrototypeColor;

});
