/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.
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

/**
 * <p>CCDrawNode                                                <br/>
 * Node that draws dots, segments and polygons.                        <br/>
 * Faster than the "drawing primitives" since it draws everything in one single batch.</p>
 * @class
 * @name cc.DrawNode
 * @extends cc.Node
 */
cc.DrawNode = cc.Node.extend(/** @lends cc.DrawNode# */{
//TODO need refactor

    _buffer: null,
    _blendFunc: null,
    _lineWidth: 1,
    _drawColor: null,

    /**
     * Gets the blend func
     * @returns {Object}
     */
    getBlendFunc: function () {
        return this._blendFunc;
    },

    /**
     * Set the blend func
     * @param blendFunc
     * @param dst
     */
    setBlendFunc: function (blendFunc, dst) {
        if (dst === undefined) {
            this._blendFunc.src = blendFunc.src;
            this._blendFunc.dst = blendFunc.dst;
        } else {
            this._blendFunc.src = blendFunc;
            this._blendFunc.dst = dst;
        }
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
     * @param {cc.Color} color
     */
    setDrawColor: function (color) {
        var locDrawColor = this._drawColor;
        locDrawColor.r = color.r;
        locDrawColor.g = color.g;
        locDrawColor.b = color.b;
        locDrawColor.a = (color.a == null) ? 255 : color.a;
    },

    /**
     * draw color getter
     * @returns {cc.Color}
     */
    getDrawColor: function () {
        return cc.color(this._drawColor.r, this._drawColor.g, this._drawColor.b, this._drawColor.a);
    }
});

/**
 * Creates a DrawNode
 * @deprecated since v3.0 please use `new cc.DrawNode()` instead.
 * @return {cc.DrawNode}
 */
cc.DrawNode.create = function () {
    return new cc.DrawNode();
};

cc.DrawNode.TYPE_DOT = 0;
cc.DrawNode.TYPE_SEGMENT = 1;
cc.DrawNode.TYPE_POLY = 2;

cc.game.addEventListener(cc.game.EVENT_RENDERER_INITED, function () {

    function pMultOut(pin, floatVar, pout) {
        pout.x = pin.x * floatVar;
        pout.y = pin.y * floatVar;
    }

    if (cc._renderType === cc.game.RENDER_TYPE_CANVAS) {

        cc._DrawNodeElement = function (type, verts, fillColor, lineWidth, lineColor, lineCap, isClosePolygon, isFill, isStroke) {
            var _t = this;
            _t.type = type;
            _t.verts = verts || null;
            _t.fillColor = fillColor || null;
            _t.lineWidth = lineWidth || 0;
            _t.lineColor = lineColor || null;
            _t.lineCap = lineCap || "butt";
            _t.isClosePolygon = isClosePolygon || false;
            _t.isFill = isFill || false;
            _t.isStroke = isStroke || false;
        };

        cc.extend(cc.DrawNode.prototype, /** @lends cc.DrawNode# */{
            _className: "DrawNodeCanvas",

            /**
             * <p>The cc.DrawNodeCanvas's constructor. <br/>
             * This function will automatically be invoked when you create a node using new construction: "var node = new cc.DrawNodeCanvas()".<br/>
             * Override it to extend its behavior, remember to call "this._super()" in the extended "ctor" function.</p>
             */
            ctor: function () {
                cc.Node.prototype.ctor.call(this);
                var locCmd = this._renderCmd;
                locCmd._buffer = this._buffer = [];
                locCmd._drawColor = this._drawColor = cc.color(255, 255, 255, 255);
                locCmd._blendFunc = this._blendFunc = new cc.BlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA);

                this.init();
                this._localBB = new cc.Rect();
            },

            setLocalBB: function (rectorX, y, width, height) {
                var localBB = this._localBB;
                if (y === undefined) {
                    localBB.x = rectorX.x;
                    localBB.y = rectorX.y;
                    localBB.width = rectorX.width;
                    localBB.height = rectorX.height;
                } else {
                    localBB.x = rectorX;
                    localBB.y = y;
                    localBB.width = width;
                    localBB.height = height;
                }
            },
            /**
             * draws a rectangle given the origin and destination point measured in points.
             * @param {cc.Point} origin
             * @param {cc.Point} destination
             * @param {cc.Color} fillColor
             * @param {Number} lineWidth
             * @param {cc.Color} lineColor
             */
            drawRect: function (origin, destination, fillColor, lineWidth, lineColor) {
                lineWidth = (lineWidth == null) ? this._lineWidth : lineWidth;
                lineColor = lineColor || this.getDrawColor();
                if (lineColor.a == null)
                    lineColor.a = 255;

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
                    if (fillColor.a == null)
                        fillColor.a = 255;
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
             * @param {cc.Color} color
             */
            drawCircle: function (center, radius, angle, segments, drawLineToCenter, lineWidth, color) {
                lineWidth = lineWidth || this._lineWidth;
                color = color || this.getDrawColor();
                if (color.a == null)
                    color.a = 255;

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
             * @param {cc.Color} color
             */
            drawQuadBezier: function (origin, control, destination, segments, lineWidth, color) {
                lineWidth = lineWidth || this._lineWidth;
                color = color || this.getDrawColor();
                if (color.a == null)
                    color.a = 255;

                var vertices = [], t = 0.0;
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
             * @param {cc.Color} color
             */
            drawCubicBezier: function (origin, control1, control2, destination, segments, lineWidth, color) {
                lineWidth = lineWidth || this._lineWidth;
                color = color || this.getDrawColor();
                if (color.a == null)
                    color.a = 255;

                var vertices = [], t = 0;
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
             * @param {Number} [lineWidth]
             * @param {cc.Color} [color]
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
             * @param {Number} [lineWidth]
             * @param {cc.Color} [color]
             */
            drawCardinalSpline: function (config, tension, segments, lineWidth, color) {
                lineWidth = lineWidth || this._lineWidth;
                color = color || this.getDrawColor();
                if (color.a == null)
                    color.a = 255;

                var vertices = [], p, lt, deltaT = 1.0 / config.length;
                for (var i = 0; i < segments + 1; i++) {
                    var dt = i / segments;
                    // border
                    if (dt === 1) {
                        p = config.length - 1;
                        lt = 1;
                    } else {
                        p = 0 | (dt / deltaT);
                        lt = (dt - deltaT * p) / deltaT;
                    }

                    // Interpolate
                    var newPos = cc.cardinalSplineAt(
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
             * draw a dot at a position, with a given radius and color
             * @param {cc.Point} pos
             * @param {Number} radius
             * @param {cc.Color} [color]
             */
            drawDot: function (pos, radius, color) {
                color = color || this.getDrawColor();
                if (color.a == null)
                    color.a = 255;
                var element = new cc._DrawNodeElement(cc.DrawNode.TYPE_DOT);
                element.verts = [pos];
                element.lineWidth = radius;
                element.fillColor = color;
                this._buffer.push(element);
            },

            /**
             * draws an array of points.
             * @override
             * @param {Array} points point of array
             * @param {Number} radius
             * @param {cc.Color} [color]
             */
            drawDots: function (points, radius, color) {
                if (!points || points.length == 0)
                    return;
                color = color || this.getDrawColor();
                if (color.a == null)
                    color.a = 255;
                for (var i = 0, len = points.length; i < len; i++)
                    this.drawDot(points[i], radius, color);
            },

            /**
             * draw a segment with a radius and color
             * @param {cc.Point} from
             * @param {cc.Point} to
             * @param {Number} [lineWidth]
             * @param {cc.Color} [color]
             */
            drawSegment: function (from, to, lineWidth, color) {
                lineWidth = lineWidth || this._lineWidth;
                color = color || this.getDrawColor();
                if (color.a == null)
                    color.a = 255;
                var element = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
                element.verts = [from, to];
                element.lineWidth = lineWidth * 2;
                element.lineColor = color;
                element.isStroke = true;
                element.lineCap = "round";
                this._buffer.push(element);
            },

            /**
             * draw a polygon with a fill color and line color without copying the vertex list
             * @param {Array} verts
             * @param {cc.Color|null} fillColor Fill color or `null` for a hollow polygon.
             * @param {Number} [lineWidth]
             * @param {cc.Color} [color]
             */
            drawPoly_: function (verts, fillColor, lineWidth, color) {
                lineWidth = (lineWidth == null ) ? this._lineWidth : lineWidth;
                color = color || this.getDrawColor();
                if (color.a == null)
                    color.a = 255;
                var element = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);

                element.verts = verts;
                element.fillColor = fillColor;
                element.lineWidth = lineWidth;
                element.lineColor = color;
                element.isClosePolygon = true;
                element.isStroke = true;
                element.lineCap = "round";
                if (fillColor)
                    element.isFill = true;
                this._buffer.push(element);
            },

            /**
             * draw a polygon with a fill color and line color, copying the vertex list
             * @param {Array} verts
             * @param {cc.Color|null} fillColor Fill color or `null` for a hollow polygon.
             * @param {Number} [lineWidth]
             * @param {cc.Color} [lineColor]
             */
            drawPoly: function (verts, fillColor, lineWidth, lineColor) {
                var vertsCopy = [];
                for (var i = 0; i < verts.length; i++) {
                    vertsCopy.push(cc.p(verts[i].x, verts[i].y));
                }
                return this.drawPoly_(vertsCopy, fillColor, lineWidth, lineColor);
            },

            /**
             * Clear the geometry in the node's buffer.
             */
            clear: function () {
                this._buffer.length = 0;
            },

            _createRenderCmd: function () {
                return new cc.DrawNode.CanvasRenderCmd(this);
            }
        });
    }
    else if (cc._renderType === cc.game.RENDER_TYPE_WEBGL) {

        // 9600 vertices by default configurable in ccConfig.js
        // 20 is 2 float for position, 4 int for color and 2 float for uv
        var _sharedBuffer = null;
        var FLOAT_PER_VERTEX = 2 + 1 + 2;
        var VERTEX_BYTE = FLOAT_PER_VERTEX * 4;
        var FLOAT_PER_TRIANGLE = 3 * FLOAT_PER_VERTEX;
        var TRIANGLE_BYTES = FLOAT_PER_TRIANGLE * 4;
        var MAX_INCREMENT = 200;

        var _vertices = [],
            _from = cc.p(),
            _to = cc.p(),
            _color = new Uint32Array(1);

        // Used in drawSegment
        var _n = cc.p(), _t = cc.p(), _nw = cc.p(), _tw = cc.p(),
            _extrude = [];

        cc.extend(cc.DrawNode.prototype, {
            _bufferCapacity: 0,
            _vertexCount: 0,

            _offset: 0,
            _occupiedSize: 0,
            _f32Buffer: null,
            _ui32Buffer: null,

            _dirty: false,
            _className: "DrawNodeWebGL",

            manualRelease: false,

            ctor: function (capacity, manualRelease) {
                cc.Node.prototype.ctor.call(this);

                if (!_sharedBuffer) {
                    _sharedBuffer = new GlobalVertexBuffer(cc._renderContext, cc.DRAWNODE_TOTAL_VERTICES * VERTEX_BYTE);
                }

                this._renderCmd._shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_LENGTHTEXTURECOLOR);
                this._blendFunc = new cc.BlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA);
                this._drawColor = cc.color(255, 255, 255, 255);

                this._bufferCapacity = capacity || 64;
                this.manualRelease = manualRelease;

                this._dirty = true;
            },

            onEnter: function () {
                if (this._occupiedSize < this._bufferCapacity) {
                    this._ensureCapacity(this._bufferCapacity);
                }
            },

            onExit: function () {
                if (!this.manualRelease) {
                    this.release();
                }
            },

            release: function () {
                if (this._occupiedSize > 0) {
                    this._vertexCount = 0;
                    _sharedBuffer.freeBuffer(this._offset, VERTEX_BYTE * this._occupiedSize);
                    this._occupiedSize = 0;
                }
            },

            _ensureCapacity: function (count) {
                var _t = this;
                var prev = _t._occupiedSize;
                var prevOffset = _t._offset;
                if (count > prev || _t._bufferCapacity > prev) {
                    var request = Math.max(Math.min(prev + prev, MAX_INCREMENT), count, _t._bufferCapacity);
                    // free previous buffer
                    if (prev !== 0) {
                        _sharedBuffer.freeBuffer(prevOffset, VERTEX_BYTE * prev);
                        _t._occupiedSize = 0;
                    }
                    var offset = _t._offset = _sharedBuffer.requestBuffer(VERTEX_BYTE * request);
                    if (offset >= 0) {
                        _t._occupiedSize = _t._bufferCapacity = request;
                        // 5 floats per vertex
                        _t._f32Buffer = new Float32Array(_sharedBuffer.data, offset, FLOAT_PER_VERTEX * _t._occupiedSize);
                        _t._ui32Buffer = new Uint32Array(_sharedBuffer.data, offset, FLOAT_PER_VERTEX * _t._occupiedSize);
                        
                        // Copy old data
                        if (prev !== 0 && prevOffset !== offset) {
                            // offset is in byte, we need to transform to float32 index
                            var last = (prevOffset + prev) / 4;
                            for (var i = offset / 4, j = prevOffset / 4; j < last; i++, j++) {
                                _sharedBuffer.dataArray[i] = _sharedBuffer.dataArray[j];
                            }
                        }

                        return true;
                    }
                    else {
                        cc.warn('Failed to allocate buffer for DrawNode: buffer for ' + request + ' vertices requested');
                        return false;
                    }
                }
                else {
                    return true;
                }
            },

            drawRect: function (origin, destination, fillColor, lineWidth, lineColor) {
                lineWidth = (lineWidth == null) ? this._lineWidth : lineWidth;
                lineColor = lineColor || this._drawColor;
                _vertices.length = 0;
                _vertices.push(origin.x, origin.y, destination.x, origin.y, destination.x, destination.y, origin.x, destination.y);
                if (fillColor == null)
                    this._drawSegments(_vertices, lineWidth, lineColor, true);
                else
                    this.drawPoly(_vertices, fillColor, lineWidth, lineColor);
                _vertices.length = 0;
            },

            drawCircle: function (center, radius, angle, segments, drawLineToCenter, lineWidth, color) {
                lineWidth = lineWidth || this._lineWidth;
                color = color || this._drawColor;
                var coef = 2.0 * Math.PI / segments, i, len;
                _vertices.length = 0;
                for (i = 0; i <= segments; i++) {
                    var rads = i * coef;
                    var j = radius * Math.cos(rads + angle) + center.x;
                    var k = radius * Math.sin(rads + angle) + center.y;
                    _vertices.push(j, k);
                }
                if (drawLineToCenter)
                    _vertices.push(center.x, center.y);

                lineWidth *= 0.5;
                for (i = 0, len = _vertices.length - 2; i < len; i += 2) {
                    _from.x = _vertices[i];
                    _from.y = _vertices[i + 1];
                    _to.x = _vertices[i + 2];
                    _to.y = _vertices[i + 3];
                    this.drawSegment(_from, _to, lineWidth, color);
                }
                _vertices.length = 0;
            },

            drawQuadBezier: function (origin, control, destination, segments, lineWidth, color) {
                lineWidth = lineWidth || this._lineWidth;
                color = color || this._drawColor;
                var t = 0.0;
                _vertices.length = 0;
                for (var i = 0; i < segments; i++) {
                    var x = Math.pow(1 - t, 2) * origin.x + 2.0 * (1 - t) * t * control.x + t * t * destination.x;
                    var y = Math.pow(1 - t, 2) * origin.y + 2.0 * (1 - t) * t * control.y + t * t * destination.y;
                    _vertices.push(x, y);
                    t += 1.0 / segments;
                }
                _vertices.push(destination.x, destination.y);
                this._drawSegments(_vertices, lineWidth, color, false);
                _vertices.length = 0;
            },

            drawCubicBezier: function (origin, control1, control2, destination, segments, lineWidth, color) {
                lineWidth = lineWidth || this._lineWidth;
                color = color || this._drawColor;
                var t = 0;
                _vertices.length = 0;
                for (var i = 0; i < segments; i++) {
                    var x = Math.pow(1 - t, 3) * origin.x + 3.0 * Math.pow(1 - t, 2) * t * control1.x + 3.0 * (1 - t) * t * t * control2.x + t * t * t * destination.x;
                    var y = Math.pow(1 - t, 3) * origin.y + 3.0 * Math.pow(1 - t, 2) * t * control1.y + 3.0 * (1 - t) * t * t * control2.y + t * t * t * destination.y;
                    _vertices.push(x, y);
                    t += 1.0 / segments;
                }
                _vertices.push(destination.x, destination.y);
                this._drawSegments(_vertices, lineWidth, color, false);
                _vertices.length = 0;
            },

            drawCatmullRom: function (points, segments, lineWidth, color) {
                this.drawCardinalSpline(points, 0.5, segments, lineWidth, color);
            },

            drawCardinalSpline: function (config, tension, segments, lineWidth, color) {
                lineWidth = lineWidth || this._lineWidth;
                color = color || this._drawColor;
                var p, lt, deltaT = 1.0 / config.length;
                _vertices.length = 0;

                for (var i = 0; i < segments + 1; i++) {
                    var dt = i / segments;

                    // border
                    if (dt === 1) {
                        p = config.length - 1;
                        lt = 1;
                    } else {
                        p = 0 | (dt / deltaT);
                        lt = (dt - deltaT * p) / deltaT;
                    }

                    // Interpolate
                    cc.cardinalSplineAt(
                        cc.getControlPointAt(config, p - 1),
                        cc.getControlPointAt(config, p - 0),
                        cc.getControlPointAt(config, p + 1),
                        cc.getControlPointAt(config, p + 2),
                        tension, lt, _from);
                    _vertices.push(_from.x, _from.y);
                }

                lineWidth *= 0.5;
                for (var j = 0, len = _vertices.length - 2; j < len; j += 2) {
                    _from.x = _vertices[j];
                    _from.y = _vertices[j + 1];
                    _to.x = _vertices[j + 2];
                    _to.y = _vertices[j + 3];
                    this.drawSegment(_from, _to, lineWidth, color);
                }
                _vertices.length = 0;
            },

            drawDots: function (points, radius, color) {
                if (!points || points.length === 0)
                    return;
                color = color || this._drawColor;
                for (var i = 0, len = points.length; i < len; i++) {
                    this.drawDot(points[i], radius, color);
                }
            },

            _render: function () {
                var gl = cc._renderContext;
                if (this._offset < 0 || this._vertexCount <= 0) {
                    return;
                }

                if (this._dirty) {
                    // bindBuffer is done in updateSubData
                    _sharedBuffer.updateSubData(this._offset, this._f32Buffer);
                    this._dirty = false;
                }
                else {
                    gl.bindBuffer(gl.ARRAY_BUFFER, _sharedBuffer.vertexBuffer);
                }

                gl.enableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION);
                gl.enableVertexAttribArray(cc.VERTEX_ATTRIB_COLOR);
                gl.enableVertexAttribArray(cc.VERTEX_ATTRIB_TEX_COORDS);

                // vertex
                gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, gl.FLOAT, false, VERTEX_BYTE, 0);
                // color
                gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, VERTEX_BYTE, 8);
                // texcood
                gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, VERTEX_BYTE, 12);

                gl.drawArrays(gl.TRIANGLES, this._offset / VERTEX_BYTE, this._vertexCount);
                cc.incrementGLDraws(1);
                //cc.checkGLErrorDebug();
            },

            appendVertexData: function (x, y, color, u, v) {
                var f32Buffer = this._f32Buffer;
                // Float offset = byte offset / 4 + vertex count * floats by vertex
                var offset = this._vertexCount * FLOAT_PER_VERTEX;
                f32Buffer[offset] = x;
                f32Buffer[offset + 1] = y;
                _color[0] = ((color.a << 24) | (color.b << 16) | (color.g << 8) | color.r);
                this._ui32Buffer[offset + 2] = _color[0];
                f32Buffer[offset + 3] = u;
                f32Buffer[offset + 4] = v;
                this._vertexCount++;
            },

            drawDot: function (pos, radius, color) {
                color = color || this._drawColor;
                if (color.a == null)
                    color.a = 255;
                var l = pos.x - radius,
                    b = pos.y - radius,
                    r = pos.x + radius,
                    t = pos.y + radius;

                var vertexCount = 2 * 3;
                var succeed = this._ensureCapacity(this._vertexCount + vertexCount);
                if (!succeed)
                    return;

                // lb, lt, rt, lb, rt, rb
                this.appendVertexData(l, b, color, -1, -1);
                this.appendVertexData(l, t, color, -1, 1);
                this.appendVertexData(r, t, color, 1, 1);
                this.appendVertexData(l, b, color, -1, -1);
                this.appendVertexData(r, t, color, 1, 1);
                this.appendVertexData(r, b, color, 1, -1);

                this._dirty = true;
            },

            drawSegment: function (from, to, radius, color) {
                color = color || this.getDrawColor();
                if (color.a == null)
                    color.a = 255;
                radius = radius || (this._lineWidth * 0.5);
                var vertexCount = 6 * 3;
                var succeed = this._ensureCapacity(this._vertexCount + vertexCount);
                if (!succeed)
                    return;

                var a = from, b = to;
                // var n = normalize(perp(sub(b, a)))
                _n.x = a.y - b.y; _n.y = b.x - a.x;
                cc.pNormalizeIn(_n);
                // var t = perp(n);
                _t.x = -_n.y; _t.y = _n.x;
                // var nw = mult(n, radius), tw = mult(t, radius);
                pMultOut(_n, radius, _nw);
                pMultOut(_t, radius, _tw);

                // var v0 = sub(b, add(nw, tw)); uv0 = neg(add(n, t))
                var v0x = b.x - _nw.x - _tw.x, v0y = b.y - _nw.y - _tw.y, u0 = -(_n.x + _t.x), v0 = -(_n.y + _t.y);
                // var v1 = add(b, sub(nw, tw)); uv1 = sub(n, t)
                var v1x = b.x + _nw.x - _tw.x, v1y = b.y + _nw.y - _tw.y, u1 = _n.x - _t.x, v1 = _n.y - _t.y;
                // var v2 = sub(b, nw); uv2 = neg(n)
                var v2x = b.x - _nw.x, v2y = b.y - _nw.y, u2 = -_n.x, v2 = -_n.y;
                // var v3 = add(b, nw); uv3 = n
                var v3x = b.x + _nw.x, v3y = b.y + _nw.y, u3 = _n.x, v3 = _n.y;
                // var v4 = sub(a, nw); uv4 = neg(n)
                var v4x = a.x - _nw.x, v4y = a.y - _nw.y, u4 = u2, v4 = v2;
                // var v5 = add(a, nw); uv5 = n
                var v5x = a.x + _nw.x, v5y = a.y + _nw.y, u5 = _n.x, v5 = _n.y;
                // var v6 = sub(a, sub(nw, tw)); uv6 = sub(t, n)
                var v6x = a.x - _nw.x + _tw.x, v6y = a.y - _nw.y + _tw.y, u6 = _t.x - _n.x, v6 = _t.y - _n.y;
                // var v7 = add(a, add(nw, tw)); uv7 = add(n, t)
                var v7x = a.x + _nw.x + _tw.x, v7y = a.y + _nw.y + _tw.y, u7 = _n.x + _t.x, v7 = _n.y + _t.y;

                this.appendVertexData(v0x, v0y, color, u0, v0);
                this.appendVertexData(v1x, v1y, color, u1, v1);
                this.appendVertexData(v2x, v2y, color, u2, v2);

                this.appendVertexData(v3x, v3y, color, u3, v3);
                this.appendVertexData(v1x, v1y, color, u1, v1);
                this.appendVertexData(v2x, v2y, color, u2, v2);

                this.appendVertexData(v3x, v3y, color, u3, v3);
                this.appendVertexData(v4x, v4y, color, u4, v4);
                this.appendVertexData(v2x, v2y, color, u2, v2);

                this.appendVertexData(v3x, v3y, color, u3, v3);
                this.appendVertexData(v4x, v4y, color, u4, v4);
                this.appendVertexData(v5x, v5y, color, u5, v5);

                this.appendVertexData(v6x, v6y, color, u6, v6);
                this.appendVertexData(v4x, v4y, color, u4, v4);
                this.appendVertexData(v5x, v5y, color, u5, v5);

                this.appendVertexData(v6x, v6y, color, u6, v6);
                this.appendVertexData(v7x, v7y, color, u7, v7);
                this.appendVertexData(v5x, v5y, color, u5, v5);
                this._dirty = true;
            },

            drawPoly: function (verts, fillColor, borderWidth, borderColor) {
                // Backward compatibility
                if (typeof verts[0] === 'object') {
                    _vertices.length = 0;
                    for (var i = 0; i < verts.length; i++) {
                        _vertices.push(verts[i].x, verts[i].y);
                    }
                    verts = _vertices;
                }

                if (fillColor == null) {
                    this._drawSegments(verts, borderWidth, borderColor, true);
                    return;
                }
                if (fillColor.a == null)
                    fillColor.a = 255;
                if (borderColor.a == null)
                    borderColor.a = 255;
                borderWidth = (borderWidth == null) ? this._lineWidth : borderWidth;
                borderWidth *= 0.5;
                var v0x, v0y, v1x, v1y, v2x, v2y,
                    factor, offx, offy,
                    i, count = verts.length;
                _extrude.length = 0;
                for (i = 0; i < count; i += 2) {
                    v0x = verts[(i - 2 + count) % count];
                    v0y = verts[(i - 1 + count) % count];
                    v1x = verts[i];
                    v1y = verts[i + 1];
                    v2x = verts[(i + 2) % count];
                    v2y = verts[(i + 3) % count];
                    // var n1 = normalize(perp(sub(v1, v0)));
                    // var n2 = normalize(perp(sub(v2, v1)));
                    _n.x = v0y - v1y; _n.y = v1x - v0x;
                    _nw.x = v1y - v2y; _nw.y = v2x - v1x;
                    cc.pNormalizeIn(_n);
                    cc.pNormalizeIn(_nw);
                    // var offset = mult(add(n1, n2), 1.0 / (dot(n1, n2) + 1.0));
                    factor = _n.x * _nw.x + _n.y * _nw.y + 1;
                    offx = (_n.x + _nw.x) / factor;
                    offy = (_n.y + _nw.y) / factor;
                    // extrude[i] = {offset: offset, n: n2};
                    _extrude.push(offx, offy, _nw.x, _nw.y);
                }
                // The actual input vertex count
                count = count / 2;
                var outline = (borderWidth > 0.0), triangleCount = 3 * count - 2, vertexCount = 3 * triangleCount;
                var succeed = this._ensureCapacity(this._vertexCount + vertexCount);
                if (!succeed)
                    return;

                var inset = (outline == false ? 0.5 : 0.0);
                for (i = 0; i < count - 2; i++) {
                    // v0 = sub(verts[0], multi(extrude[0].offset, inset));
                    v0x = verts[0] - _extrude[0] * inset;
                    v0y = verts[1] - _extrude[1] * inset;
                    // v1 = sub(verts[i + 1], multi(extrude[i + 1].offset, inset));
                    v1x = verts[i * 2 + 2] - _extrude[(i + 1) * 4] * inset;
                    v1y = verts[i * 2 + 3] - _extrude[(i + 1) * 4 + 1] * inset;
                    // v2 = sub(verts[i + 2], multi(extrude[i + 2].offset, inset));
                    v2x = verts[i * 2 + 4] - _extrude[(i + 2) * 4] * inset;
                    v2y = verts[i * 2 + 5] - _extrude[(i + 2) * 4 + 1] * inset;

                    this.appendVertexData(v0x, v0y, fillColor, 0, 0);
                    this.appendVertexData(v1x, v1y, fillColor, 0, 0);
                    this.appendVertexData(v2x, v2y, fillColor, 0, 0);
                }

                var off0x, off0y, off1x, off1y,
                    bw = outline ? borderWidth : 0.5,
                    color = outline ? borderColor : fillColor,
                    in0x, in0y, in1x, in1y, out0x, out0y, out1x, out1y;
                for (i = 0; i < count; i++) {
                    var j = (i + 1) % count;
                    v0x = verts[i * 2];
                    v0y = verts[i * 2 + 1];
                    v1x = verts[j * 2];
                    v1y = verts[j * 2 + 1];

                    _n.x = _extrude[i * 4 + 2];
                    _n.y = _extrude[i * 4 + 3];
                    _nw.x = outline ? -_n.x : 0;
                    _nw.y = outline ? -_n.y : 0;
                    off0x = _extrude[i * 4];
                    off0y = _extrude[i * 4 + 1];
                    off1x = _extrude[j * 4];
                    off1y = _extrude[j * 4 + 1];

                    in0x = v0x - off0x * bw; in0y = v0y - off0y * bw;
                    in1x = v1x - off1x * bw; in1y = v1y - off1y * bw;
                    out0x = v0x + off0x * bw; out0y = v0y + off0y * bw;
                    out1x = v1x + off1x * bw; out1y = v1y + off1y * bw;

                    this.appendVertexData(in0x, in0y, color, _nw.x, _nw.y);
                    this.appendVertexData(in1x, in1y, color, _nw.x, _nw.y);
                    this.appendVertexData(out1x, out1y, color, _n.x, _n.y);

                    this.appendVertexData(in0x, in0y, color, _nw.x, _nw.y);
                    this.appendVertexData(out0x, out0y, color, _n.x, _n.y);
                    this.appendVertexData(out1x, out1y, color, _n.x, _n.y);
                }
                _extrude.length = 0;
                _vertices.length = 0;
                this._dirty = true;
            },

            _drawSegments: function (verts, borderWidth, borderColor, closePoly) {
                borderWidth = (borderWidth == null) ? this._lineWidth : borderWidth;
                if (borderWidth <= 0)
                    return;

                borderColor = borderColor || this._drawColor;
                if (borderColor.a == null)
                    borderColor.a = 255;
                borderWidth *= 0.5;

                var v0x, v0y, v1x, v1y, v2x, v2y,
                    factor, offx, offy,
                    i, count = verts.length;
                _extrude.length = 0;
                for (i = 0; i < count; i += 2) {
                    v0x = verts[(i - 2 + count) % count];
                    v0y = verts[(i - 1 + count) % count];
                    v1x = verts[i];
                    v1y = verts[i + 1];
                    v2x = verts[(i + 2) % count];
                    v2y = verts[(i + 3) % count];
                    // var n1 = normalize(perp(sub(v1, v0)));
                    // var n2 = normalize(perp(sub(v2, v1)));
                    _n.x = v0y - v1y; _n.y = v1x - v0x;
                    _nw.x = v1y - v2y; _nw.y = v2x - v1x;
                    cc.pNormalizeIn(_n);
                    cc.pNormalizeIn(_nw);
                    // var offset = multi(add(n1, n2), 1.0 / (dot(n1, n2) + 1.0));
                    factor = _n.x * _nw.x + _n.y * _nw.y + 1;
                    offx = (_n.x + _nw.x) / factor;
                    offy = (_n.y + _nw.y) / factor;
                    // extrude[i] = {offset: offset, n: n2};
                    _extrude.push(offx, offy, _nw.x, _nw.y);
                }

                // The actual input vertex count
                count = count / 2;
                var triangleCount = 3 * count - 2, vertexCount = 3 * triangleCount;
                var succeed = this._ensureCapacity(this._vertexCount + vertexCount);
                if (!succeed)
                    return;

                var len = closePoly ? count : count - 1,
                    off0x, off0y, off1x, off1y,
                    in0x, in0y, in1x, in1y, out0x, out0y, out1x, out1y;
                for (i = 0; i < len; i++) {
                    var j = (i + 1) % count;
                    v0x = verts[i * 2];
                    v0y = verts[i * 2 + 1];
                    v1x = verts[j * 2];
                    v1y = verts[j * 2 + 1];

                    _n.x = _extrude[i * 4 + 2];
                    _n.y = _extrude[i * 4 + 3];
                    off0x = _extrude[i * 4];
                    off0y = _extrude[i * 4 + 1];
                    off1x = _extrude[j * 4];
                    off1y = _extrude[j * 4 + 1];
                    in0x = v0x - off0x * borderWidth; in0y = v0y - off0y * borderWidth;
                    in1x = v1x - off1x * borderWidth; in1y = v1y - off1y * borderWidth;
                    out0x = v0x + off0x * borderWidth; out0y = v0y + off0y * borderWidth;
                    out1x = v1x + off1x * borderWidth; out1y = v1y + off1y * borderWidth;

                    this.appendVertexData(in0x, in0y, borderColor, -_n.x, -_n.y);
                    this.appendVertexData(in1x, in1y, borderColor, -_n.x, -_n.y);
                    this.appendVertexData(out1x, out1y, borderColor, _n.x, _n.y);

                    this.appendVertexData(in0x, in0y, borderColor, -_n.x, -_n.y);
                    this.appendVertexData(out0x, out0y, borderColor, _n.x, _n.y);
                    this.appendVertexData(out1x, out1y, borderColor, _n.x, _n.y);
                }
                _extrude.length = 0;
                this._dirty = true;
            },

            clear: function () {
                this.release();
                this._dirty = true;
            },

            _createRenderCmd: function () {
                return new cc.DrawNode.WebGLRenderCmd(this);
            }
        });
    }
});
