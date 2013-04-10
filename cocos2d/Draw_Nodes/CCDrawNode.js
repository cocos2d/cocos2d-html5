/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.
 Copyright (c) 2012 Scott Lembcke and Howling Moon Software

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

/*
 * Code copied & pasted from SpacePatrol game https://github.com/slembcke/SpacePatrol
 *
 * Renamed and added some changes for cocos2d
 *
 */
cc.v2fzero = function () {
    return {x: 0, y: 0};
};

cc.v2f = function (x, y) {
    return {x: x, y: y};
};

cc.v2fadd = function (v0, v1) {
    return cc.v2f(v0.x + v1.x, v0.y + v1.y);
};

cc.v2fsub = function (v0, v1) {
    return cc.v2f(v0.x - v1.x, v0.y - v1.y);
};

cc.v2fmult = function (v, s) {
    return cc.v2f(v.x * s, v.y * s);
};

cc.v2fperp = function (p0) {
    return cc.v2f(-p0.y, p0.x);
};

cc.v2fneg = function (p0) {
    return cc.v2f(-p0.x, -p0.y);
};

cc.v2fdot = function (p0, p1) {
    return  p0.x * p1.x + p0.y * p1.y;
};

cc.v2fforangle = function (_a_) {
    return cc.v2f(Math.cos(_a_), Math.sin(_a_));
};

cc.v2fnormalize = function (p) {
    var r = cc.pNormalize(cc.p(p.x, p.y));
    return cc.v2f(r.x, r.y);
};

cc.__v2f = function (v) {
    return cc.v2f(v.x, v.y);
};

cc.__t = function (v) {
    return {u: v.x, v: v.y};
};

/**
 * <p>CCDrawNode for Canvas                                             <br/>
 * Node that draws dots, segments and polygons.                        <br/>
 * Faster than the "drawing primitives" since they it draws everything in one single batch.</p>
 * @class
 * @extends cc.Node
 */
cc.DrawNodeCanvas = cc.Node.extend(/** @lends cc.DrawNodeCanvas# */{
    _buffer:null,
    _blendFunc:null,

    // ----common function start ----
    getBlendFunc:function () {
        return this._blendFunc;
    },

    setBlendFunc:function (blendFunc) {
        this._blendFunc = blendFunc;
    },
    // ----common function end ----

    ctor:function () {
        this._super();
        this._buffer = [];
        this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
    },

    draw:function (ctx) {
        var context = ctx || cc.renderContext;

        if ((this._blendFunc && (this._blendFunc.src == gl.SRC_ALPHA) && (this._blendFunc.dst == gl.ONE)))
            context.globalCompositeOperation = 'lighter';

        for (var i = 0; i < this._buffer.length; i++) {
            var element = this._buffer[i];
            if (element.type === cc.DRAWNODE_TYPE_DOT) {
                context.fillStyle = "rgba(" + (0 | (element.color.r * 255)) + "," + (0 | (element.color.g * 255)) + "," + (0 | (element.color.b * 255)) + "," + element.color.a + ")";
                cc.drawingUtil.drawPoint(element.position, element.radius);
            }

            if (element.type === cc.DRAWNODE_TYPE_SEGMENT) {
                context.strokeStyle = "rgba(" + (0 | (element.color.r * 255)) + "," + (0 | (element.color.g * 255)) + "," + (0 | (element.color.b * 255)) + "," + element.color.a + ")";
                context.lineWidth = element.radius * 2;
                context.lineCap = "round";
                cc.drawingUtil.drawLine(element.from, element.to);
            }

            if (element.type === cc.DRAWNODE_TYPE_POLY) {
                context.fillStyle = "rgba(" + (0 | (element.fillColor.r * 255)) + "," + (0 | (element.fillColor.g * 255)) + ","
                    + (0 | (element.fillColor.b * 255)) + "," + element.fillColor.a + ")";
                cc.drawingUtil.drawPoly(element.verts, element.count, false, true);
                context.lineWidth = element.borderWidth * 2;
                context.lineCap = "round";
                context.strokeStyle = "rgba(" + (0 | (element.borderColor.r * 255)) + "," + (0 | (element.borderColor.g * 255)) + ","
                    + (0 | (element.borderColor.b * 255)) + "," + element.borderColor.a + ")";
                cc.drawingUtil.drawPoly(element.verts, element.count, true, false);
            }
        }
    },

    /**
     *  draw a dot at a position, with a given radius and color
     * @param {cc.Point} pos
     * @param {Number} radius
     * @param {cc.Color4F} color
     */
    drawDot:function (pos, radius, color) {
        var element = new cc._DrawNodeElement(cc.DRAWNODE_TYPE_DOT);
        element.position = pos;
        element.radius = radius;
        element.color = color;
        this._buffer.push(element);
    },

    /**
     * draw a segment with a radius and color
     * @param {cc.Point} from
     * @param {cc.Point} to
     * @param {Number} radius
     * @param {cc.Color4F} color
     */
    drawSegment:function (from, to, radius, color) {
        var element = new cc._DrawNodeElement(cc.DRAWNODE_TYPE_SEGMENT);
        element.from = from;
        element.to = to;
        element.radius = radius;
        element.color = color;
        this._buffer.push(element);
    },

    /**
     * draw a polygon with a fill color and line color
     * @param {Array} verts
     * @param {cc.Color4F} fillColor
     * @param {Number} borderWidth
     * @param {cc.Color4F} borderColor
     */
    drawPoly:function (verts, fillColor, borderWidth, borderColor) {
        var element = new cc._DrawNodeElement(cc.DRAWNODE_TYPE_POLY);
        element.verts = verts;
        element.count = verts.length;
        element.fillColor = fillColor;
        element.borderWidth = borderWidth;
        element.borderColor = borderColor;
        this._buffer.push(element);
    },

    /**
     * Clear the geometry in the node's buffer.
     */
    clear:function () {
        this._buffer.length = 0;
    }
});

/**
 * Creates a DrawNodeCanvas
 * @return {cc.DrawNodeCanvas}
 */
cc.DrawNodeCanvas.create = function () {
    var ret = new cc.DrawNodeCanvas();
    if (ret && ret.init())
        return ret;
    return null;
};

/**
 * <p>CCDrawNode for WebGL                                             <br/>
 * Node that draws dots, segments and polygons.                        <br/>
 * Faster than the "drawing primitives" since they it draws everything in one single batch.</p>
 * @class
 * @extends cc.Node
 */
cc.DrawNodeWebGL = cc.Node.extend(/** @lends cc.DrawNodeWebGL# */{
    _bufferCapacity:0,
    _buffer:null,

    _trianglesArrayBuffer:null,
    _trianglesWebBuffer:null,
    _trianglesReader:null,

    _blendFunc:null,
    _dirty:false,

    // ----common function start ----
    getBlendFunc:function () {
        return this._blendFunc;
    },

    setBlendFunc:function (blendFunc) {
        this._blendFunc = blendFunc;
    },
    // ----common function end ----

    ctor:function () {
        this._super();
        this._buffer = [];
        this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
    },

    init:function () {
        if (this._super()) {
            this.setShaderProgram(cc.ShaderCache.getInstance().programForKey(cc.SHADER_POSITION_LENGTHTEXTURECOLOR));
            this._ensureCapacity(512);
            this._trianglesWebBuffer = cc.renderContext.createBuffer();
            this._dirty = true;
            return true;
        }
        return false;
    },

    _render:function () {
        var gl = cc.renderContext;

        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSCOLORTEX);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._trianglesWebBuffer);
        if (this._dirty) {
            gl.bufferData(gl.ARRAY_BUFFER, this._trianglesArrayBuffer, gl.STREAM_DRAW);
            this._dirty = false;
        }
        var triangleSize = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT;

        // vertex
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, gl.FLOAT, false, triangleSize, 0);
        // color
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, triangleSize, 8);
        // texcood
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, triangleSize, 12);

        gl.drawArrays(gl.TRIANGLES, 0, this._buffer.length * 3);
        cc.INCREMENT_GL_DRAWS(1);
        //cc.CHECK_GL_ERROR_DEBUG();
    },

    _ensureCapacity:function(count){
        if(this._buffer.length + count > this._bufferCapacity){
            this._bufferCapacity += Math.max(this._bufferCapacity, count);
            //re alloc
            if((this._buffer == null) || (this._buffer.length === 0)){
                //init
                this._buffer = [];
                this._trianglesArrayBuffer = new ArrayBuffer(cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT * this._bufferCapacity);
                this._trianglesReader = new Uint8Array(this._trianglesArrayBuffer);
            } else {
                var newTriangles = [];
                var newArrayBuffer = new ArrayBuffer(cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT * this._bufferCapacity);

                for(var i = 0; i < this._buffer.length;i++){
                    newTriangles[i] = new cc.V2F_C4B_T2F_Triangle(this._buffer[i].a,this._buffer[i].b,this._buffer[i].c,
                        newArrayBuffer,i * cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT);
                }
                this._trianglesReader = new Uint8Array(newArrayBuffer);
                this._buffer = newTriangles;
                this._trianglesArrayBuffer = newArrayBuffer;
            }
        }
    },

    draw:function () {
        cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);
        this._shaderProgram.use();
        this._shaderProgram.setUniformsForBuiltins();
        this._render();
    },

    /**
     *  draw a dot at a position, with a given radius and color
     * @param {cc.Point} pos
     * @param {Number} radius
     * @param {cc.Color4F} color
     */
    drawDot:function (pos, radius, color) {
        var c4bColor = {r: 0 | (color.r * 255), g: 0 | (color.g * 255), b: 0 | (color.b * 255), a: 0 | (color.a * 255)};
        var a = {vertices: {x: pos.x - radius, y: pos.y - radius}, colors: c4bColor, texCoords: {u: -1.0, v: -1.0}};
        var b = {vertices: {x: pos.x - radius, y: pos.y + radius}, colors: c4bColor, texCoords: {u: -1.0, v: 1.0}};
        var c = {vertices: {x: pos.x + radius, y: pos.y + radius}, colors: c4bColor, texCoords: {u: 1.0, v: 1.0}};
        var d = {vertices: {x: pos.x + radius, y: pos.y - radius}, colors: c4bColor, texCoords: {u: 1.0, v: -1.0}};
        this._buffer.push(new cc.V2F_C4B_T2F_Triangle(a, b, c, this._trianglesArrayBuffer, this._buffer.length * cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT));
        this._buffer.push(new cc.V2F_C4B_T2F_Triangle(a, c, d, this._trianglesArrayBuffer, this._buffer.length * cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT));
        this._dirty = true;
    },

    /**
     * draw a segment with a radius and color
     * @param {cc.Point} from
     * @param {cc.Point} to
     * @param {Number} radius
     * @param {cc.Color4F} color
     */
    drawSegment:function (from, to, radius, color) {
        var vertexCount = 6*3;
        this._ensureCapacity(vertexCount);

        var c4bColor = {r: 0 | (color.r * 255), g: 0 | (color.g * 255), b: 0 | (color.b * 255), a: 0 | (color.a * 255)};
        var a = cc.__v2f(from);
        var b = cc.__v2f(to);

        var n = cc.v2fnormalize(cc.v2fperp(cc.v2fsub(b, a)));
        var t = cc.v2fperp(n);

        var nw = cc.v2fmult(n, radius);
        var tw = cc.v2fmult(t, radius);
        var v0 = cc.v2fsub(b, cc.v2fadd(nw, tw));
        var v1 = cc.v2fadd(b, cc.v2fsub(nw, tw));
        var v2 = cc.v2fsub(b, nw);
        var v3 = cc.v2fadd(b, nw);
        var v4 = cc.v2fsub(a, nw);
        var v5 = cc.v2fadd(a, nw);
        var v6 = cc.v2fsub(a, cc.v2fsub(nw, tw));
        var v7 = cc.v2fadd(a, cc.v2fadd(nw, tw));

        this._buffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: v0, colors: c4bColor, texCoords: cc.__t(cc.v2fneg(cc.v2fadd(n, t)))},
            {vertices: v1, colors: c4bColor, texCoords: cc.__t(cc.v2fsub(n, t))}, {vertices: v2, colors: c4bColor, texCoords: cc.__t(cc.v2fneg(n))},
            this._trianglesArrayBuffer, this._buffer.length * cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT));

        this._buffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: v3, colors: c4bColor, texCoords: cc.__t(n)},
            {vertices: v1, colors: c4bColor, texCoords: cc.__t(cc.v2fsub(n, t))}, {vertices: v2, colors: c4bColor, texCoords: cc.__t(cc.v2fneg(n))},
            this._trianglesArrayBuffer, this._buffer.length * cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT));

        this._buffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: v3, colors: c4bColor, texCoords: cc.__t(n)},
            {vertices: v4, colors: c4bColor, texCoords: cc.__t(cc.v2fneg(n))}, {vertices: v2, colors: c4bColor, texCoords: cc.__t(cc.v2fneg(n))},
            this._trianglesArrayBuffer, this._buffer.length * cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT));

        this._buffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: v3, colors: c4bColor, texCoords: cc.__t(n)},
            {vertices: v4, colors: c4bColor, texCoords: cc.__t(cc.v2fneg(n))}, {vertices: v5, colors: c4bColor, texCoords: cc.__t(n)},
            this._trianglesArrayBuffer, this._buffer.length * cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT));

        this._buffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: v6, colors: c4bColor, texCoords: cc.__t(cc.v2fsub(t, n))},
            {vertices: v4, colors: c4bColor, texCoords: cc.__t(cc.v2fneg(n))}, {vertices: v5, colors: c4bColor, texCoords: cc.__t(n)},
            this._trianglesArrayBuffer, this._buffer.length * cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT));

        this._buffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: v6, colors: c4bColor, texCoords: cc.__t(cc.v2fsub(t, n))},
            {vertices: v7, colors: c4bColor, texCoords: cc.__t(cc.v2fadd(n, t))}, {vertices: v5, colors: c4bColor, texCoords: cc.__t(n)},
            this._trianglesArrayBuffer, this._buffer.length * cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT));
        this._dirty = true;
    },

    /**
     * draw a polygon with a fill color and line color
     * @param {Array} verts
     * @param {cc.Color4F} fillColor
     * @param {Number} borderWidth
     * @param {cc.Color4F} borderColor
     */
    drawPoly:function (verts, fillColor, borderWidth, borderColor) {
        var c4bFillColor = {r: 0 | (fillColor.r * 255), g: 0 | (fillColor.g * 255), b: 0 | (fillColor.b * 255), a: 0 | (fillColor.a * 255)};
        var c4bBorderColor = {r: 0 | (borderColor.r * 255), g: 0 | (borderColor.g * 255), b: 0 | (borderColor.b * 255), a: 0 | (borderColor.a * 255)};
        var extrude = [], i;
        var v0, v1, v2;
        var count = verts.length;
        for (i = 0; i < count; i++) {
            v0 = cc.__v2f(verts[(i - 1 + count) % count]);
            v1 = cc.__v2f(verts[i]);
            v2 = cc.__v2f(verts[(i + 1) % count]);
            var n1 = cc.v2fnormalize(cc.v2fperp(cc.v2fsub(v1, v0)));
            var n2 = cc.v2fnormalize(cc.v2fperp(cc.v2fsub(v2, v1)));
            var offset = cc.v2fmult(cc.v2fadd(n1, n2), 1.0 / (cc.v2fdot(n1, n2) + 1.0));
            extrude[i] = {offset: offset, n: n2};
        }
        var outline = (fillColor.a > 0.0 && borderWidth > 0.0);

        var triangleCount = 3 * count -2;
        var vertexCount = 3 * triangleCount;
        this._ensureCapacity(vertexCount);

        var inset = (outline == false ? 0.5 : 0.0);
        for (i = 0; i < count - 2; i++) {
            v0 = cc.v2fsub(cc.__v2f(verts[0]), cc.v2fmult(extrude[0].offset, inset));
            v1 = cc.v2fsub(cc.__v2f(verts[i + 1]), cc.v2fmult(extrude[i + 1].offset, inset));
            v2 = cc.v2fsub(cc.__v2f(verts[i + 2]), cc.v2fmult(extrude[i + 2].offset, inset));
            this._buffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: v0, colors: c4bFillColor, texCoords: cc.__t(cc.v2fzero())},
                {vertices: v1, colors: c4bFillColor, texCoords: cc.__t(cc.v2fzero())}, {vertices: v2, colors: c4bFillColor, texCoords: cc.__t(cc.v2fzero())},
                this._trianglesArrayBuffer, this._buffer.length * cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT));
        }

        for (i = 0; i < count; i++) {
            var j = (i + 1) % count;
            v0 = cc.__v2f(verts[i]);
            v1 = cc.__v2f(verts[j]);

            var n0 = extrude[i].n;
            var offset0 = extrude[i].offset;
            var offset1 = extrude[j].offset;
            var inner0 = outline ? cc.v2fsub(v0, cc.v2fmult(offset0, borderWidth)) : cc.v2fsub(v0, cc.v2fmult(offset0, 0.5));
            var inner1 = outline ? cc.v2fsub(v1, cc.v2fmult(offset1, borderWidth)) : cc.v2fsub(v1, cc.v2fmult(offset1, 0.5));
            var outer0 = outline ? cc.v2fadd(v0, cc.v2fmult(offset0, borderWidth)) : cc.v2fadd(v0, cc.v2fmult(offset0, 0.5));
            var outer1 = outline ? cc.v2fadd(v1, cc.v2fmult(offset1, borderWidth)) : cc.v2fadd(v1, cc.v2fmult(offset1, 0.5));

            if (outline) {
                this._buffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: inner0, colors: c4bBorderColor, texCoords: cc.__t(cc.v2fneg(n0))},
                    {vertices: inner1, colors: c4bBorderColor, texCoords: cc.__t(cc.v2fneg(n0))}, {vertices: outer1, colors: c4bBorderColor, texCoords: cc.__t(n0)},
                    this._trianglesArrayBuffer, this._buffer.length * cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT));
                this._buffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: inner0, colors: c4bBorderColor, texCoords: cc.__t(cc.v2fneg(n0))},
                    {vertices: outer0, colors: c4bBorderColor, texCoords: cc.__t(n0)}, {vertices: outer1, colors: c4bBorderColor, texCoords: cc.__t(n0)},
                    this._trianglesArrayBuffer, this._buffer.length * cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT));
            } else {
                this._buffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: inner0, colors: c4bFillColor, texCoords: cc.__t(cc.v2fzero())},
                    {vertices: inner1, colors: c4bFillColor, texCoords: cc.__t(cc.v2fzero())}, {vertices: outer1, colors: c4bFillColor, texCoords: cc.__t(n0)},
                    this._trianglesArrayBuffer, this._buffer.length * cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT));
                this._buffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: inner0, colors: c4bFillColor, texCoords: cc.__t(cc.v2fzero())},
                    {vertices: outer0, colors: c4bFillColor, texCoords: cc.__t(n0)}, {vertices: outer1, colors: c4bFillColor, texCoords: cc.__t(n0)},
                    this._trianglesArrayBuffer, this._buffer.length * cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT));
            }
        }
        extrude = null;
        this._dirty = true;
    },

    /**
     * Clear the geometry in the node's buffer.
     */
    clear:function () {
        this._buffer.length = 0;
        this._dirty = true;
    }
});

/**
 * Creates a DrawNodeCanvas
 * @return {cc.DrawNodeWebGL}
 */
cc.DrawNodeWebGL.create = function () {
    var ret = new cc.DrawNodeWebGL();
    if (ret && ret.init())
        return ret;
    return null;
};

cc.DrawNode = cc.Browser.supportWebGL ? cc.DrawNodeWebGL : cc.DrawNodeCanvas;

cc._DrawNodeElement = function (type) {
    this.type = type;
};

cc.DRAWNODE_TYPE_DOT = 0;
cc.DRAWNODE_TYPE_SEGMENT = 1;
cc.DRAWNODE_TYPE_POLY = 2;
