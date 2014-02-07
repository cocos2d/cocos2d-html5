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
    _buffer: null,
    _blendFunc: null,
    _lineWidth: 0,
    _drawColor: null,

    ctor: function () {
        cc.Node.prototype.ctor.call(this);
        this._buffer = [];
        this._lineWidth = 1;
        this._drawColor = new cc.Color4F(255, 255, 255, 255);
        this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
    },

    // ----common function start ----
    getBlendFunc: function () {
        return this._blendFunc;
    },

    setBlendFunc: function (blendFunc) {
        this._blendFunc = blendFunc;
    },

    /**
     * line width setter
     * @param {Number} width
     */
    setLineWidth: function (width) {
        this._lineWidth = width;
    },

    /**
     * line width getter
     * @returns {Number}
     */
    getLineWidth: function () {
        return this._lineWidth;
    },

    /**
     * draw color setter
     * @param {cc.Color4F} color
     */
    setDrawColor: function (color) {
        this._drawColor.r = color.r;
        this._drawColor.g = color.g;
        this._drawColor.b = color.b;
        this._drawColor.a = color.a;
    },

    /**
     * draw color getter
     * @returns {cc.Color4F}
     */
    getDrawColor: function () {
        return  new cc.Color4F(this._drawColor.r, this._drawColor.g, this._drawColor.b, this._drawColor.a);
    },
    // ----common function end ----


    /**
     * draws a rectangle given the origin and destination point measured in points.
     * @param {cc.Point} origin
     * @param {cc.Point} destination
     *  @param {cc.Color4F} fillColor
     * @param {Number} lineWidth
     * @param {cc.Color4F} lineColor
     */
    drawRect: function (origin, destination, fillColor, lineWidth, lineColor) {
        lineWidth = lineWidth || this._lineWidth;
        lineColor = lineColor || this.getDrawColor();
        var vertices = [
            origin,
            cc.p(destination.x, origin.y),
            destination,
            cc.p(origin.x, destination.y)
        ];
        var element = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
        element.verts = vertices;
        element.lineWidth = lineWidth;
        element.lineColor = lineColor;
        element.isClosePolygon = true;
        element.isStroke = true;
        element.lineCap = "butt";
        element.fillColor = fillColor;
        if (fillColor) {
            element.isFill = true;
        }
        this._buffer.push(element);
    },

    /**
     * draws a circle given the center, radius and number of segments.
     * @override
     * @param {cc.Point} center center of circle
     * @param {Number} radius
     * @param {Number} angle angle in radians
     * @param {Number} segments
     * @param {Boolean} drawLineToCenter
     * @param {Number} lineWidth
     * @param {cc.Color4F} color
     */
    drawCircle: function (center, radius, angle, segments, drawLineToCenter, lineWidth, color) {
        lineWidth = lineWidth || this._lineWidth;
        color = color || this.getDrawColor();

        var coef = 2.0 * Math.PI / segments;
        var vertices = [];
        for (var i = 0; i <= segments; i++) {
            var rads = i * coef;
            var j = radius * Math.cos(rads + angle) + center.x;
            var k = radius * Math.sin(rads + angle) + center.y;
            vertices.push(cc.p(j, k));
        }
        if (drawLineToCenter) {
            vertices.push(cc.p(center.x, center.y));
        }

        var element = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
        element.verts = vertices;
        element.lineWidth = lineWidth;
        element.lineColor = color;
        element.isClosePolygon = true;
        element.isStroke = true;
        this._buffer.push(element);
    },

    /**
     * draws a quad bezier path
     * @override
     * @param {cc.Point} origin
     * @param {cc.Point} control
     * @param {cc.Point} destination
     * @param {Number} segments
     * @param {Number} lineWidth
     * @param {cc.Color4F} color
     */
    drawQuadBezier: function (origin, control, destination, segments, lineWidth, color) {
        lineWidth = lineWidth || this._lineWidth;
        color = color || this.getDrawColor();

        var vertices = [];
        var t = 0.0;
        for (var i = 0; i < segments; i++) {
            var x = Math.pow(1 - t, 2) * origin.x + 2.0 * (1 - t) * t * control.x + t * t * destination.x;
            var y = Math.pow(1 - t, 2) * origin.y + 2.0 * (1 - t) * t * control.y + t * t * destination.y;
            vertices.push(cc.p(x, y));
            t += 1.0 / segments;
        }
        vertices.push(cc.p(destination.x, destination.y));

        var element = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
        element.verts = vertices;
        element.lineWidth = lineWidth;
        element.lineColor = color;
        element.isStroke = true;
        element.lineCap = "round";
        this._buffer.push(element);
    },

    /**
     * draws a cubic bezier path
     * @override
     * @param {cc.Point} origin
     * @param {cc.Point} control1
     * @param {cc.Point} control2
     * @param {cc.Point} destination
     * @param {Number} segments
     * @param {Number} lineWidth
     * @param {cc.Color4F} color
     */
    drawCubicBezier: function (origin, control1, control2, destination, segments, lineWidth, color) {
        lineWidth = lineWidth || this._lineWidth;
        color = color || this.getDrawColor();

        var vertices = [];
        var t = 0;
        for (var i = 0; i < segments; i++) {
            var x = Math.pow(1 - t, 3) * origin.x + 3.0 * Math.pow(1 - t, 2) * t * control1.x + 3.0 * (1 - t) * t * t * control2.x + t * t * t * destination.x;
            var y = Math.pow(1 - t, 3) * origin.y + 3.0 * Math.pow(1 - t, 2) * t * control1.y + 3.0 * (1 - t) * t * t * control2.y + t * t * t * destination.y;
            vertices.push(cc.p(x, y));
            t += 1.0 / segments;
        }
        vertices.push(cc.p(destination.x, destination.y));

        var element = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
        element.verts = vertices;
        element.lineWidth = lineWidth;
        element.lineColor = color;
        element.isStroke = true;
        element.lineCap = "round";
        this._buffer.push(element);
    },

    /**
     * draw a CatmullRom curve
     * @override
     * @param {Array} points
     * @param {Number} segments
     * @param {Number} lineWidth
     * @param {cc.Color4F} color
     */
    drawCatmullRom: function (points, segments, lineWidth, color) {
        this.drawCardinalSpline(points, 0.5, segments, lineWidth, color);
    },

    /**
     * draw a cardinal spline path
     * @override
     * @param {Array} config
     * @param {Number} tension
     * @param {Number} segments
     * @param {Number} lineWidth
     * @param {cc.Color4F} color
     */
    drawCardinalSpline: function (config, tension, segments, lineWidth, color) {
        lineWidth = lineWidth || this._lineWidth;
        color = color || this.getDrawColor();

        var vertices = [];
        var p, lt;
        var deltaT = 1.0 / config.length;

        for (var i = 0; i < segments + 1; i++) {
            var dt = i / segments;

            // border
            if (dt == 1) {
                p = config.length - 1;
                lt = 1;
            } else {
                p = 0 | (dt / deltaT);
                lt = (dt - deltaT * p) / deltaT;
            }

            // Interpolate
            var newPos = cc.CardinalSplineAt(
                cc.getControlPointAt(config, p - 1),
                cc.getControlPointAt(config, p - 0),
                cc.getControlPointAt(config, p + 1),
                cc.getControlPointAt(config, p + 2),
                tension, lt);
            vertices.push(newPos);
        }

        var element = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
        element.verts = vertices;
        element.lineWidth = lineWidth;
        element.lineColor = color;
        element.isStroke = true;
        element.lineCap = "round";
        this._buffer.push(element);
    },

    /**
     *  draw a dot at a position, with a given radius and color
     * @param {cc.Point} pos
     * @param {Number} radius
     * @param {cc.Color4F} color
     */
    drawDot: function (pos, radius, color) {
        color = color || this.getDrawColor();
        var element = new cc._DrawNodeElement(cc.DrawNode.TYPE_DOT);
        element.verts = [pos];
        element.lineWidth = radius;
        element.fillColor = color;
        this._buffer.push(element);
    },

    /**
     * draw a segment with a radius and color
     * @param {cc.Point} from
     * @param {cc.Point} to
     * @param {Number} lineWidth
     * @param {cc.Color4F} color
     */
    drawSegment: function (from, to, lineWidth, color) {
        lineWidth = lineWidth || this._lineWidth;
        color = color || this.getDrawColor();

        var element = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
        element.verts = [from, to];
        element.lineWidth = lineWidth;
        element.lineColor = color;
        element.isStroke = true;
        element.lineCap = "round";
        this._buffer.push(element);
    },

    /**
     * draw a polygon with a fill color and line color without copying the vertex list
     * @param {Array} verts
     * @param {cc.Color4F} fillColor
     * @param {Number} lineWidth
     * @param {cc.Color4F} color
     */
    drawPoly_: function (verts, fillColor, lineWidth, color) {
        lineWidth = lineWidth || this._lineWidth;
        color = color || this.getDrawColor();
        var element = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
        
        element.verts = verts;
        element.fillColor = fillColor;
        element.lineWidth = lineWidth;
        element.lineColor = color;
        element.isClosePolygon = true;
        element.isStroke = true;
        element.lineCap = "round";
        if (fillColor) {
            element.isFill = true;
        }
        this._buffer.push(element);
    },
    
    /**
     * draw a polygon with a fill color and line color, copying the vertex list
     * @param {Array} verts
     * @param {cc.Color4F} fillColor
     * @param {Number} lineWidth
     * @param {cc.Color4F} color
     */
    drawPoly: function (verts, fillColor, lineWidth, color) {
        var vertsCopy = [];
        for (var i=0; i < verts.length; i++) {
            vertsCopy.push(cc.p(verts[i].x, verts[i].y));
        }
        return this.drawPoly_(vertsCopy, fillColor, lineWidth, color);     
    },

    draw: function (ctx) {
        var context = ctx || cc.renderContext;
        if ((this._blendFunc && (this._blendFunc.src == gl.SRC_ALPHA) && (this._blendFunc.dst == gl.ONE)))
            context.globalCompositeOperation = 'lighter';

        for (var i = 0; i < this._buffer.length; i++) {
            var element = this._buffer[i];
            switch (element.type) {
                case cc.DrawNode.TYPE_DOT:
                    this._drawDot(context, element);
                    break;
                case cc.DrawNode.TYPE_SEGMENT:
                    this._drawSegment(context, element);
                    break;
                case cc.DrawNode.TYPE_POLY:
                    this._drawPoly(context, element);
                    break;
            }
        }
    },

    _drawDot: function (ctx, element) {
        var locColor = element.fillColor;
        var locPos = element.verts[0];
        var locRadius = element.lineWidth;
        var locScaleX = cc.EGLView.getInstance().getScaleX(), locScaleY = cc.EGLView.getInstance().getScaleY();

        ctx.fillStyle = "rgba(" + (0 | (locColor.r * 255)) + "," + (0 | (locColor.g * 255)) + "," + (0 | (locColor.b * 255)) + "," + locColor.a + ")";
        ctx.beginPath();
        ctx.arc(locPos.x * locScaleX, -locPos.y * locScaleY, locRadius * locScaleX, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
    },

    _drawSegment: function (ctx, element) {
        var locColor = element.lineColor;
        var locFrom = element.verts[0];
        var locTo = element.verts[1];
        var locLineWidth = element.lineWidth;
        var locLineCap = element.lineCap;
        var locScaleX = cc.EGLView.getInstance().getScaleX(), locScaleY = cc.EGLView.getInstance().getScaleY();

        ctx.strokeStyle = "rgba(" + (0 | (locColor.r * 255)) + "," + (0 | (locColor.g * 255)) + "," + (0 | (locColor.b * 255)) + "," + locColor.a + ")";
        ctx.lineWidth = locLineWidth * locScaleX;
        ctx.beginPath();
        ctx.lineCap = locLineCap;
        ctx.moveTo(locFrom.x * locScaleX, -locFrom.y * locScaleY);
        ctx.lineTo(locTo.x * locScaleX, -locTo.y * locScaleY);
        ctx.stroke();
    },

    _drawPoly: function (ctx, element) {
        var locVertices = element.verts;
        var locLineCap = element.lineCap;
        var locFillColor = element.fillColor;
        var locLineWidth = element.lineWidth;
        var locLineColor = element.lineColor;
        var locIsClosePolygon = element.isClosePolygon;
        var locIsFill = element.isFill;
        var locIsStroke = element.isStroke;
        if (locVertices == null)
            return;

        var firstPoint = locVertices[0];
        var locScaleX = cc.EGLView.getInstance().getScaleX(), locScaleY = cc.EGLView.getInstance().getScaleY();

        ctx.lineCap = locLineCap;

        if (locFillColor) {
            ctx.fillStyle = "rgba(" + (0 | (locFillColor.r * 255)) + "," + (0 | (locFillColor.g * 255)) + ","
                + (0 | (locFillColor.b * 255)) + "," + locFillColor.a + ")";
        }

        if (locLineWidth) {
            ctx.lineWidth = locLineWidth * locScaleX;
        }
        if (locLineColor) {
            ctx.strokeStyle = "rgba(" + (0 | (locLineColor.r * 255)) + "," + (0 | (locLineColor.g * 255)) + ","
                + (0 | (locLineColor.b * 255)) + "," + locLineColor.a + ")";
        }
        ctx.beginPath();
        ctx.moveTo(firstPoint.x * locScaleX, -firstPoint.y * locScaleY);
        for (var i = 1, len = locVertices.length; i < len; i++)
            ctx.lineTo(locVertices[i].x * locScaleX, -locVertices[i].y * locScaleY);

        if (locIsClosePolygon)
            ctx.closePath();

        if (locIsFill)
            ctx.fill();
        if (locIsStroke)
            ctx.stroke();
    },

    /**
     * Clear the geometry in the node's buffer.
     */
    clear: function () {
        this._buffer.length = 0;
    }
});

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
        cc.Node.prototype.ctor.call(this);
        this._buffer = [];
        this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
    },

    init:function () {
        if (cc.Node.prototype.init.call(this)) {
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

        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);
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
            var TriangleLength = cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT;
            this._bufferCapacity += Math.max(this._bufferCapacity, count);
            //re alloc
            if((this._buffer == null) || (this._buffer.length === 0)){
                //init
                this._buffer = [];
                this._trianglesArrayBuffer = new ArrayBuffer(TriangleLength * this._bufferCapacity);
                this._trianglesReader = new Uint8Array(this._trianglesArrayBuffer);
            } else {
                var newTriangles = this._buffer;
                newTriangles.length = 0;
                var newArrayBuffer = new ArrayBuffer(TriangleLength * this._bufferCapacity);

                for(var i = 0; i < this._buffer.length;i++){
                    newTriangles[i] = new cc.V2F_C4B_T2F_Triangle(this._buffer[i].a,this._buffer[i].b,this._buffer[i].c,
                        newArrayBuffer,i * TriangleLength);
                }
                this._trianglesReader = new Uint8Array(newArrayBuffer);
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

        var TriangleLength = cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT, triangleBuffer = this._trianglesArrayBuffer;
        this._buffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: v0, colors: c4bColor, texCoords: cc.__t(cc.v2fneg(cc.v2fadd(n, t)))},
            {vertices: v1, colors: c4bColor, texCoords: cc.__t(cc.v2fsub(n, t))}, {vertices: v2, colors: c4bColor, texCoords: cc.__t(cc.v2fneg(n))},
            triangleBuffer, this._buffer.length * TriangleLength));

        this._buffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: v3, colors: c4bColor, texCoords: cc.__t(n)},
            {vertices: v1, colors: c4bColor, texCoords: cc.__t(cc.v2fsub(n, t))}, {vertices: v2, colors: c4bColor, texCoords: cc.__t(cc.v2fneg(n))},
            triangleBuffer, this._buffer.length * TriangleLength));

        this._buffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: v3, colors: c4bColor, texCoords: cc.__t(n)},
            {vertices: v4, colors: c4bColor, texCoords: cc.__t(cc.v2fneg(n))}, {vertices: v2, colors: c4bColor, texCoords: cc.__t(cc.v2fneg(n))},
            triangleBuffer, this._buffer.length * TriangleLength));

        this._buffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: v3, colors: c4bColor, texCoords: cc.__t(n)},
            {vertices: v4, colors: c4bColor, texCoords: cc.__t(cc.v2fneg(n))}, {vertices: v5, colors: c4bColor, texCoords: cc.__t(n)},
            triangleBuffer, this._buffer.length * TriangleLength));

        this._buffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: v6, colors: c4bColor, texCoords: cc.__t(cc.v2fsub(t, n))},
            {vertices: v4, colors: c4bColor, texCoords: cc.__t(cc.v2fneg(n))}, {vertices: v5, colors: c4bColor, texCoords: cc.__t(n)},
            triangleBuffer, this._buffer.length * TriangleLength));

        this._buffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: v6, colors: c4bColor, texCoords: cc.__t(cc.v2fsub(t, n))},
            {vertices: v7, colors: c4bColor, texCoords: cc.__t(cc.v2fadd(n, t))}, {vertices: v5, colors: c4bColor, texCoords: cc.__t(n)},
            triangleBuffer, this._buffer.length * TriangleLength));
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
        var outline = (borderWidth > 0.0);

        var triangleCount = 3 * count -2;
        var vertexCount = 3 * triangleCount;
        this._ensureCapacity(vertexCount);

        var triangleBytesLen = cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT, trianglesBuffer = this._trianglesArrayBuffer;
        var locBuffer = this._buffer;
        var inset = (outline == false ? 0.5 : 0.0);
        for (i = 0; i < count - 2; i++) {
            v0 = cc.v2fsub(cc.__v2f(verts[0]), cc.v2fmult(extrude[0].offset, inset));
            v1 = cc.v2fsub(cc.__v2f(verts[i + 1]), cc.v2fmult(extrude[i + 1].offset, inset));
            v2 = cc.v2fsub(cc.__v2f(verts[i + 2]), cc.v2fmult(extrude[i + 2].offset, inset));
            locBuffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: v0, colors: c4bFillColor, texCoords: cc.__t(cc.v2fzero())},
                {vertices: v1, colors: c4bFillColor, texCoords: cc.__t(cc.v2fzero())}, {vertices: v2, colors: c4bFillColor, texCoords: cc.__t(cc.v2fzero())},
                trianglesBuffer, locBuffer.length * triangleBytesLen));
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
                locBuffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: inner0, colors: c4bBorderColor, texCoords: cc.__t(cc.v2fneg(n0))},
                    {vertices: inner1, colors: c4bBorderColor, texCoords: cc.__t(cc.v2fneg(n0))}, {vertices: outer1, colors: c4bBorderColor, texCoords: cc.__t(n0)},
                    trianglesBuffer, locBuffer.length * triangleBytesLen));
                locBuffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: inner0, colors: c4bBorderColor, texCoords: cc.__t(cc.v2fneg(n0))},
                    {vertices: outer0, colors: c4bBorderColor, texCoords: cc.__t(n0)}, {vertices: outer1, colors: c4bBorderColor, texCoords: cc.__t(n0)},
                    trianglesBuffer, locBuffer.length * triangleBytesLen));
            } else {
                locBuffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: inner0, colors: c4bFillColor, texCoords: cc.__t(cc.v2fzero())},
                    {vertices: inner1, colors: c4bFillColor, texCoords: cc.__t(cc.v2fzero())}, {vertices: outer1, colors: c4bFillColor, texCoords: cc.__t(n0)},
                    trianglesBuffer, locBuffer.length * triangleBytesLen));
                locBuffer.push(new cc.V2F_C4B_T2F_Triangle({vertices: inner0, colors: c4bFillColor, texCoords: cc.__t(cc.v2fzero())},
                    {vertices: outer0, colors: c4bFillColor, texCoords: cc.__t(n0)}, {vertices: outer1, colors: c4bFillColor, texCoords: cc.__t(n0)},
                    trianglesBuffer, locBuffer.length * triangleBytesLen));
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

cc.DrawNode = cc.Browser.supportWebGL ? cc.DrawNodeWebGL : cc.DrawNodeCanvas;

/**
 * Creates a DrawNode
 * @return {cc.DrawNode}
 */
cc.DrawNode.create = function () {
    var ret = new cc.DrawNode();
    if (ret && ret.init())
        return ret;
    return null;
};

cc._DrawNodeElement = function (type, verts, fillColor, lineWidth, lineColor, lineCap, isClosePolygon, isFill, isStroke) {
    this.type = type;
    this.verts = verts || null;
    this.fillColor = fillColor || null;
    this.lineWidth = lineWidth || 0;
    this.lineColor = lineColor || null;
    this.lineCap = lineCap || "butt";
    this.isClosePolygon = isClosePolygon || false;
    this.isFill = isFill || false;
    this.isStroke = isStroke || false;
};

cc.DrawNode.TYPE_DOT = 0;
cc.DrawNode.TYPE_SEGMENT = 1;
cc.DrawNode.TYPE_POLY = 2;
