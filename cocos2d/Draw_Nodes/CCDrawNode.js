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
    return new cc.Vertex2F(0, 0);
};

cc.v2f = function (x, y) {
    return new cc.Vertex2F(x, y);
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
    return new cc.Tex2F(v.x, v.y);
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
    _blendFunc:null,
    _dirty:false,
    _vertexF32Buffer:null,
    _colorU8Buffer:null,
    _texCoordF32Buffer:null,

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
            this._dirty = true;
            return true;
        }
        return false;
    },

    _getVerticesBuffer:function () {
        var vertexBuffer = cc.renderContext.createBuffer();
        var vertArray = new Float32Array(this._buffer.length * 6);
        for (var i = 0; i < this._buffer.length; i++) {
            var selTriangle = this._buffer[i];
            vertArray[i * 6 ] = selTriangle.a.vertices.x;
            vertArray[i * 6 + 1] = selTriangle.a.vertices.y;
            vertArray[i * 6 + 2] = selTriangle.b.vertices.x;
            vertArray[i * 6 + 3] = selTriangle.b.vertices.y;
            vertArray[i * 6 + 4] = selTriangle.c.vertices.x;
            vertArray[i * 6 + 5] = selTriangle.c.vertices.y;
        }
        cc.renderContext.bindBuffer(cc.renderContext.ARRAY_BUFFER, vertexBuffer);
        cc.renderContext.bufferData(cc.renderContext.ARRAY_BUFFER, vertArray, cc.renderContext.STREAM_DRAW);
        return vertexBuffer;
    },

    _getColorsBuffer:function () {
        var colorBuffer = cc.renderContext.createBuffer();
        var colorArray = new Uint8Array(this._buffer.length * 12);
        for (var i = 0; i < this._buffer.length; i++) {
            var selTriangle = this._buffer[i];
            colorArray[i * 12 ] = selTriangle.a.colors.r;
            colorArray[i * 12 + 1] = selTriangle.a.colors.g;
            colorArray[i * 12 + 2] = selTriangle.a.colors.b;
            colorArray[i * 12 + 3] = selTriangle.a.colors.a;

            colorArray[i * 12 + 4] = selTriangle.b.colors.r;
            colorArray[i * 12 + 5] = selTriangle.b.colors.g;
            colorArray[i * 12 + 6] = selTriangle.b.colors.b;
            colorArray[i * 12 + 7] = selTriangle.b.colors.a;

            colorArray[i * 12 + 8] = selTriangle.c.colors.r;
            colorArray[i * 12 + 9] = selTriangle.c.colors.g;
            colorArray[i * 12 + 10] = selTriangle.c.colors.b;
            colorArray[i * 12 + 11] = selTriangle.c.colors.a;
        }
        cc.renderContext.bindBuffer(cc.renderContext.ARRAY_BUFFER, colorBuffer);
        cc.renderContext.bufferData(cc.renderContext.ARRAY_BUFFER, colorArray, cc.renderContext.STREAM_DRAW);
        return colorBuffer;
    },

    _getTexCoordsBuffer:function () {
        var texCoordsBuffer = cc.renderContext.createBuffer();
        var texCoordsArray = new Float32Array(this._buffer.length * 6);
        for (var i = 0; i < this._buffer.length; i++) {
            var selTriangle = this._buffer[i];
            texCoordsArray[i * 6 ] = selTriangle.a.texCoords.u;
            texCoordsArray[i * 6 + 1] = selTriangle.a.texCoords.v;
            texCoordsArray[i * 6 + 2] = selTriangle.b.texCoords.u;
            texCoordsArray[i * 6 + 3] = selTriangle.b.texCoords.v;
            texCoordsArray[i * 6 + 4] = selTriangle.c.texCoords.u;
            texCoordsArray[i * 6 + 5] = selTriangle.c.texCoords.v;
        }
        cc.renderContext.bindBuffer(cc.renderContext.ARRAY_BUFFER, texCoordsBuffer);
        cc.renderContext.bufferData(cc.renderContext.ARRAY_BUFFER, texCoordsArray, cc.renderContext.STREAM_DRAW);
        return texCoordsBuffer;
    },

    _render:function () {
        var gl = cc.renderContext;
        if (this._dirty) {
            this._vertexF32Buffer = this._getVerticesBuffer();
            this._colorU8Buffer = this._getColorsBuffer();
            this._texCoordF32Buffer = this._getTexCoordsBuffer();
            this._dirty = false;
        }
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSCOLORTEX);

        // vertex
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexF32Buffer);
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, gl.FLOAT, false, 0, 0);

        // color
        gl.bindBuffer(gl.ARRAY_BUFFER, this._colorU8Buffer);
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 0, 0);

        // texcood
        gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordF32Buffer);
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, this._buffer.length * 3);
        cc.INCREMENT_GL_DRAWS(1);
        cc.CHECK_GL_ERROR_DEBUG();
    },

    draw:function (ctx) {
        cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);
        this.getShaderProgram().use();
        this.getShaderProgram().setUniformsForBuiltins();
        this._render();
    },

    /**
     *  draw a dot at a position, with a given radius and color
     * @param {cc.Point} pos
     * @param {Number} radius
     * @param {cc.Color4F} color
     */
    drawDot:function (pos, radius, color) {
        var a = new cc.V2F_C4B_T2F(cc.p(pos.x - radius, pos.y - radius), cc.c4BFromccc4F(color), new cc.Tex2F(-1.0, -1.0));
        var b = new cc.V2F_C4B_T2F(cc.p(pos.x - radius, pos.y + radius), cc.c4BFromccc4F(color), new cc.Tex2F(-1.0, 1.0));
        var c = new cc.V2F_C4B_T2F(cc.p(pos.x + radius, pos.y + radius), cc.c4BFromccc4F(color), new cc.Tex2F(1.0, 1.0));
        var d = new cc.V2F_C4B_T2F(cc.p(pos.x + radius, pos.y - radius), cc.c4BFromccc4F(color), new cc.Tex2F(1.0, -1.0));
        this._buffer.push(new cc.V2F_C4B_T2F_Triangle(a, b, c));
        this._buffer.push(new cc.V2F_C4B_T2F_Triangle(a, c, d));
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

        this._buffer.push(new cc.V2F_C4B_T2F_Triangle(new cc.V2F_C4B_T2F(v0, cc.c4BFromccc4F(color), cc.__t(cc.v2fneg(cc.v2fadd(n, t)))),
            new cc.V2F_C4B_T2F(v1, cc.c4BFromccc4F(color), cc.__t(cc.v2fsub(n, t))),
            new cc.V2F_C4B_T2F(v2, cc.c4BFromccc4F(color), cc.__t(cc.v2fneg(n)))));

        this._buffer.push(new cc.V2F_C4B_T2F_Triangle(new cc.V2F_C4B_T2F(v3, cc.c4BFromccc4F(color), cc.__t(n)),
            new cc.V2F_C4B_T2F(v1, cc.c4BFromccc4F(color), cc.__t(cc.v2fsub(n, t))),
            new cc.V2F_C4B_T2F(v2, cc.c4BFromccc4F(color), cc.__t(cc.v2fneg(n)))));

        this._buffer.push(new cc.V2F_C4B_T2F_Triangle(new cc.V2F_C4B_T2F(v3, cc.c4BFromccc4F(color), cc.__t(n)),
            new cc.V2F_C4B_T2F(v4, cc.c4BFromccc4F(color), cc.__t(cc.v2fneg(n))),
            new cc.V2F_C4B_T2F(v2, cc.c4BFromccc4F(color), cc.__t(cc.v2fneg(n)))));

        this._buffer.push(new cc.V2F_C4B_T2F_Triangle(new cc.V2F_C4B_T2F(v3, cc.c4BFromccc4F(color), cc.__t(n)),
            new cc.V2F_C4B_T2F(v4, cc.c4BFromccc4F(color), cc.__t(cc.v2fneg(n))),
            new cc.V2F_C4B_T2F(v5, cc.c4BFromccc4F(color), cc.__t(n))));

        this._buffer.push(new cc.V2F_C4B_T2F_Triangle(new cc.V2F_C4B_T2F(v6, cc.c4BFromccc4F(color), cc.__t(cc.v2fsub(t, n))),
            new cc.V2F_C4B_T2F(v4, cc.c4BFromccc4F(color), cc.__t(cc.v2fneg(n))),
            new cc.V2F_C4B_T2F(v5, cc.c4BFromccc4F(color), cc.__t(n))));

        this._buffer.push(new cc.V2F_C4B_T2F_Triangle(new cc.V2F_C4B_T2F(v6, cc.c4BFromccc4F(color), cc.__t(cc.v2fsub(t, n))),
            new cc.V2F_C4B_T2F(v7, cc.c4BFromccc4F(color), cc.__t(cc.v2fadd(n, t))),
            new cc.V2F_C4B_T2F(v5, cc.c4BFromccc4F(color), cc.__t(n))));
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
        var ExtrudeVerts = function (offset, n) {
            this.offset = offset || new cc.Vertex2F();
            this.n = n || 0;
        };
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
            extrude[i] = new ExtrudeVerts(offset, n2);
        }
        var outline = (fillColor.a > 0.0 && borderWidth > 0.0);

        var inset = (outline == 0.0 ? 0.5 : 0.0);
        for (i = 0; i < count - 2; i++) {
            v0 = cc.v2fsub(cc.__v2f(verts[0  ]), cc.v2fmult(extrude[0  ].offset, inset));
            v1 = cc.v2fsub(cc.__v2f(verts[i + 1]), cc.v2fmult(extrude[i + 1].offset, inset));
            v2 = cc.v2fsub(cc.__v2f(verts[i + 2]), cc.v2fmult(extrude[i + 2].offset, inset));
            this._buffer.push(new cc.V2F_C4B_T2F_Triangle(new cc.V2F_C4B_T2F(v0, cc.c4BFromccc4F(fillColor), cc.__t(cc.v2fzero())),
                new cc.V2F_C4B_T2F(v1, cc.c4BFromccc4F(fillColor), cc.__t(cc.v2fzero())),
                new cc.V2F_C4B_T2F(v2, cc.c4BFromccc4F(fillColor), cc.__t(cc.v2fzero()))));
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
                this._buffer.push(new cc.V2F_C4B_T2F_Triangle(new cc.V2F_C4B_T2F(inner0, cc.c4BFromccc4F(borderColor), cc.__t(cc.v2fneg(n0))),
                    new cc.V2F_C4B_T2F(inner1, cc.c4BFromccc4F(borderColor), cc.__t(cc.v2fneg(n0))),
                    new cc.V2F_C4B_T2F(outer1, cc.c4BFromccc4F(borderColor), cc.__t(n0))));
                this._buffer.push(new cc.V2F_C4B_T2F_Triangle(new cc.V2F_C4B_T2F(inner0, cc.c4BFromccc4F(borderColor), cc.__t(cc.v2fneg(n0))),
                    new cc.V2F_C4B_T2F(outer0, cc.c4BFromccc4F(borderColor), cc.__t(n0)),
                    new cc.V2F_C4B_T2F(outer1, cc.c4BFromccc4F(borderColor), cc.__t(n0))));
            } else {
                this._buffer.push(new cc.V2F_C4B_T2F_Triangle(new cc.V2F_C4B_T2F(inner0, cc.c4BFromccc4F(fillColor), cc.__t(cc.v2fzero())),
                    new cc.V2F_C4B_T2F(inner1, cc.c4BFromccc4F(fillColor), cc.__t(cc.v2fzero())),
                    new cc.V2F_C4B_T2F(outer1, cc.c4BFromccc4F(fillColor), cc.__t(n0))));
                this._buffer.push(new cc.V2F_C4B_T2F_Triangle(new cc.V2F_C4B_T2F(inner0, cc.c4BFromccc4F(fillColor), cc.__t(cc.v2fzero())),
                    new cc.V2F_C4B_T2F(outer0, cc.c4BFromccc4F(fillColor), cc.__t(n0)),
                    new cc.V2F_C4B_T2F(outer1, cc.c4BFromccc4F(fillColor), cc.__t(n0))));
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
 * @return {cc.DrawNodeCanvas}
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
