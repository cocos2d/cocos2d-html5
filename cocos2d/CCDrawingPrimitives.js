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
 * <p>
 *   Drawing primitives Utility Class. this class is base class, it contain some render type version: Canvas, WebGL, DOM.<br/>
 *   this class contain some primitive Drawing Method: <br/>
 *     - drawPoint<br/>
 *     - drawLine<br/>
 *     - drawPoly<br/>
 *     - drawCircle<br/>
 *     - drawQuadBezier<br/>
 *     - drawCubicBezier<br/>
 *     You can change the color, width and other property by calling these WebGL API:<br/>
 *     glColor4ub(), glLineWidth(), glPointSize().<br/>
 * </p>
 * @class
 * @extends cc.Class
 * @warning These functions draws the Line, Point, Polygon, immediately. They aren't batched. <br/>
 *   If you are going to make a game that depends on these primitives, I suggest creating a batch.
 */
cc.DrawingPrimitive = cc.Class.extend(/** @lends cc.DrawingPrimitive# */{
    _renderContext:null,

    /**
     * set render context of drawing primitive
     * @param context
     */
    setRenderContext:function (context) {
        this._renderContext = context;
    },

    /**
     * returns render context of drawing primitive
     * @return {CanvasContext}
     */
    getRenderContext:function () {
        return this._renderContext;
    },

    /**
     * Constructor
     * @param {CanvasContext} renderContext
     */
    ctor:function (renderContext) {
        this._renderContext = renderContext;
    },

    /**
     * draws a point given x and y coordinate measured in points
     * @param {cc.Point} point
     */
    drawPoint:function (point) {
        cc.log("DrawingPrimitive.drawPoint() not implement!");
    },

    /**
     * draws an array of points.
     * @param {Array} points point of array
     * @param {Number} numberOfPoints
     */
    drawPoints:function (points, numberOfPoints) {
        cc.log("DrawingPrimitive.drawPoints() not implement!");
    },

    /**
     * draws a line given the origin and destination point measured in points
     * @param {cc.Point} origin
     * @param {cc.Point} destination
     */
    drawLine:function (origin, destination) {
        cc.log("DrawingPrimitive.drawLine() not implement!");
    },

    /**
     * draws a rectangle given the origin and destination point measured in points.
     * @param {cc.Point} origin
     * @param {cc.Point} destination
     */
    drawRect:function (origin, destination) {
        cc.log("DrawingPrimitive.drawRect() not implement!");
    },

    /**
     * draws a solid rectangle given the origin and destination point measured in points.
     * @param {cc.Point} origin
     * @param {cc.Point} destination
     * @param {cc.Color4F} color
     */
    drawSolidRect:function (origin, destination, color) {
        cc.log("DrawingPrimitive.drawSolidRect() not implement!");
    },

    /**
     * draws a poligon given a pointer to cc.Point coordiantes and the number of vertices measured in points.
     * @param {Array} vertices a pointer to cc.Point coordiantes
     * @param {Number} numOfVertices the number of vertices measured in points
     * @param {Boolean} closePolygon The polygon can be closed or open
     * @param {Boolean} fill The polygon can be closed or open and optionally filled with current color
     */
    drawPoly:function (vertices, numOfVertices, closePolygon, fill) {
        cc.log("DrawingPrimitive.drawPoly() not implement!");
    },

    /**
     * draws a solid polygon given a pointer to CGPoint coordiantes, the number of vertices measured in points, and a color.
     * @param {Array} poli
     * @param {Number} numberOfPoints
     * @param {cc.Color4F} color
     */
    drawSolidPoly:function (poli, numberOfPoints, color) {
        cc.log("DrawingPrimitive.drawSolidPoly() not implement!");
    },

    /**
     * draws a circle given the center, radius and number of segments.
     * @param {cc.Point} center center of circle
     * @param {Number} radius
     * @param {Number} angle angle in radians
     * @param {Number} segments
     * @param {Boolean} drawLineToCenter
     */
    drawCircle:function (center, radius, angle, segments, drawLineToCenter) {
        cc.log("DrawingPrimitive.drawCircle() not implement!");
    },

    /**
     * draws a quad bezier path
     * @param {cc.Point} origin
     * @param {cc.Point} control
     * @param {cc.Point} destination
     * @param {Number} segments
     */
    drawQuadBezier:function (origin, control, destination, segments) {
        cc.log("DrawingPrimitive.drawQuadBezier() not implement!");
    },

    /**
     * draws a cubic bezier path
     * @param {cc.Point} origin
     * @param {cc.Point} control1
     * @param {cc.Point} control2
     * @param {cc.Point} destination
     * @param {Number} segments
     */
    drawCubicBezier:function (origin, control1, control2, destination, segments) {
        cc.log("DrawingPrimitive.drawCubicBezier() not implement!");
    },

    /**
     * draw a catmull rom line
     * @param {cc.PointArray} points
     * @param {Number} segments
     */
    drawCatmullRom:function (points, segments) {
        cc.log("DrawingPrimitive.drawCardinalSpline() not implement!");
    },

    /**
     * draw a cardinal spline path
     * @param {cc.PointArray} config
     * @param {Number} tension
     * @param {Number} segments
     */
    drawCardinalSpline:function (config, tension, segments) {
        cc.log("DrawingPrimitive.drawCardinalSpline() not implement!");
    }
});

/**
 * Canvas of DrawingPrimitive implement version
 * @class
 * @extends cc.DrawingPrimitive
 */
cc.DrawingPrimitiveCanvas = cc.DrawingPrimitive.extend(/** @lends cc.DrawingPrimitiveCanvas# */{
    /**
     * draws a point given x and y coordinate measured in points
     * @override
     * @param {cc.Point} point
     */
    drawPoint:function (point, size) {
        if (!size) {
            size = 1;
        }
        var newPoint = cc.p(point.x * cc.CONTENT_SCALE_FACTOR(), point.y * cc.CONTENT_SCALE_FACTOR());
        this._renderContext.beginPath();
        this._renderContext.arc(newPoint.x, -newPoint.y, size * cc.CONTENT_SCALE_FACTOR(), 0, Math.PI * 2, false);
        this._renderContext.closePath();
        this._renderContext.fill();
    },

    /**
     * draws an array of points.
     * @override
     * @param {Array} points point of array
     * @param {Number} numberOfPoints
     */
    drawPoints:function (points, numberOfPoints, size) {
        if (points == null) {
            return;
        }
        if (!size) {
            size = 1;
        }

        this._renderContext.beginPath();
        for (var i = 0; i < points.length; i++) {
            this._renderContext.arc(points[i].x * cc.CONTENT_SCALE_FACTOR(), -points[i].y * cc.CONTENT_SCALE_FACTOR(),
                size * cc.CONTENT_SCALE_FACTOR(), 0, Math.PI * 2, false);
        }
        this._renderContext.closePath();
        this._renderContext.fill();
    },

    /**
     * draws a line given the origin and destination point measured in points
     * @override
     * @param {cc.Point} origin
     * @param {cc.Point} destination
     */
    drawLine:function (origin, destination) {
        this._renderContext.beginPath();
        this._renderContext.moveTo(origin.x * cc.CONTENT_SCALE_FACTOR(), -origin.y * cc.CONTENT_SCALE_FACTOR());
        this._renderContext.lineTo(destination.x * cc.CONTENT_SCALE_FACTOR(), -destination.y * cc.CONTENT_SCALE_FACTOR());
        this._renderContext.closePath();
        this._renderContext.stroke();
    },

    /**
     * draws a rectangle given the origin and destination point measured in points.
     * @param {cc.Point} origin
     * @param {cc.Point} destination
     */
    drawRect:function (origin, destination) {
        this.drawLine(cc.p(origin.x, origin.y), cc.p(destination.x, origin.y));
        this.drawLine(cc.p(destination.x, origin.y), cc.p(destination.x, destination.y));
        this.drawLine(cc.p(destination.x, destination.y), cc.p(origin.x, destination.y));
        this.drawLine(cc.p(origin.x, destination.y), cc.p(origin.x, origin.y));
    },

    /**
     * draws a solid rectangle given the origin and destination point measured in points.
     * @param {cc.Point} origin
     * @param {cc.Point} destination
     * @param {cc.Color4F} color
     */
    drawSolidRect:function (origin, destination, color) {
        var vertices = [
            origin,
            cc.p(destination.x, origin.y),
            destination,
            cc.p(origin.x, destination.y)
        ];

        this.drawSolidPoly(vertices, 4, color);
    },

    /**
     * draws a poligon given a pointer to cc.Point coordiantes and the number of vertices measured in points.
     * @override
     * @param {Array} vertices a pointer to cc.Point coordiantes
     * @param {Number} numOfVertices the number of vertices measured in points
     * @param {Boolean} closePolygon The polygon can be closed or open
     * @param {Boolean} fill The polygon can be closed or open and optionally filled with current color
     */
    drawPoly:function (vertices, numOfVertices, closePolygon, fill) {
        if (fill == 'undefined') {
            fill = false;
        }

        if (vertices == null) {
            return;
        }
        if (vertices.length < 3) {
            throw new Error("Polygon's point must greater than 2");
        }

        var firstPoint = vertices[0];
        this._renderContext.beginPath();
        this._renderContext.moveTo(firstPoint.x * cc.CONTENT_SCALE_FACTOR(), -firstPoint.y * cc.CONTENT_SCALE_FACTOR());
        for (var i = 1; i < vertices.length; i++) {
            this._renderContext.lineTo(vertices[i].x * cc.CONTENT_SCALE_FACTOR(), -vertices[i].y * cc.CONTENT_SCALE_FACTOR());
        }
        if (closePolygon) {
            this._renderContext.closePath();
        }

        if (fill) {
            this._renderContext.fill();
        } else {
            this._renderContext.stroke();
        }
    },

    /**
     * draws a solid polygon given a pointer to CGPoint coordiantes, the number of vertices measured in points, and a color.
     * @param {Array} poli
     * @param {Number} numberOfPoints
     * @param {cc.Color4F} color
     */
    drawSolidPoly:function (poli, numberOfPoints, color) {
        this.setDrawColor4F(color.r, color.g, color.b, color.a);
        this.drawPoly(poli, numberOfPoints, true, true);
    },

    /**
     * draws a circle given the center, radius and number of segments.
     * @override
     * @param {cc.Point} center center of circle
     * @param {Number} radius
     * @param {Number} angle angle in radians
     * @param {Number} segments
     * @param {Boolean} drawLineToCenter
     */
    drawCircle:function (center, radius, angle, segments, drawLineToCenter) {
        this._renderContext.beginPath();
        var endAngle = angle - Math.PI * 2;
        this._renderContext.arc(0 | center.x, 0 | -(center.y), radius, -angle, -endAngle, false);
        if (drawLineToCenter) {
            this._renderContext.lineTo(0 | center.x, 0 | -(center.y));
        }
        this._renderContext.stroke();
    },

    /**
     * draws a quad bezier path
     * @override
     * @param {cc.Point} origin
     * @param {cc.Point} control
     * @param {cc.Point} destination
     * @param {Number} segments
     */
    drawQuadBezier:function (origin, control, destination, segments) {
        //this is OpenGL Algorithm
        var vertices = [];

        var t = 0.0;
        for (var i = 0; i < segments; i++) {
            var x = Math.pow(1 - t, 2) * origin.x + 2.0 * (1 - t) * t * control.x + t * t * destination.x;
            var y = Math.pow(1 - t, 2) * origin.y + 2.0 * (1 - t) * t * control.y + t * t * destination.y;
            vertices.push(cc.p(x * cc.CONTENT_SCALE_FACTOR(), y * cc.CONTENT_SCALE_FACTOR()));
            t += 1.0 / segments;
        }
        vertices.push(cc.p(destination.x * cc.CONTENT_SCALE_FACTOR(), destination.y * cc.CONTENT_SCALE_FACTOR()));

        this.drawPoly(vertices, segments + 1, false, false);
    },

    /**
     * draws a cubic bezier path
     * @override
     * @param {cc.Point} origin
     * @param {cc.Point} control1
     * @param {cc.Point} control2
     * @param {cc.Point} destination
     * @param {Number} segments
     */
    drawCubicBezier:function (origin, control1, control2, destination, segments) {
        //this is OpenGL Algorithm
        var vertices = [];

        var t = 0;
        for (var i = 0; i < segments; i++) {
            var x = Math.pow(1 - t, 3) * origin.x + 3.0 * Math.pow(1 - t, 2) * t * control1.x + 3.0 * (1 - t) * t * t * control2.x + t * t * t * destination.x;
            var y = Math.pow(1 - t, 3) * origin.y + 3.0 * Math.pow(1 - t, 2) * t * control1.y + 3.0 * (1 - t) * t * t * control2.y + t * t * t * destination.y;
            vertices.push(cc.p(x * cc.CONTENT_SCALE_FACTOR(), y * cc.CONTENT_SCALE_FACTOR()));
            t += 1.0 / segments;
        }
        vertices.push(cc.p(destination.x * cc.CONTENT_SCALE_FACTOR(), destination.y * cc.CONTENT_SCALE_FACTOR()));

        this.drawPoly(vertices, segments + 1, false, false);
    },

    /**
     * draw a CatmullRom curve
     * @override
     * @param {cc.PointArray} points
     * @param {Number} segments
     */
    drawCatmullRom:function (points, segments) {
        this.drawCardinalSpline(points, 0.5, segments);
    },

    /**
     * draw a cardinal spline path
     * @override
     * @param {cc.PointArray} config
     * @param {Number} tension
     * @param {Number} segments
     */
    drawCardinalSpline:function (config, tension, segments) {
        //lazy_init();
        cc.renderContext.strokeStyle = "rgba(255,255,255,1)";
        var points = [];
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
            points.push(newPos);
        }
        this.drawPoly(points, segments + 1, false, false);
    },

    /**
     * draw an image
     * @override
     * @param {HTMLImageElement|HTMLCanvasElement} image
     * @param {cc.Point} sourcePoint
     * @param {cc.Size} sourceSize
     * @param {cc.Point} destPoint
     * @param {cc.Size} destSize
     */
    drawImage:function (image, sourcePoint, sourceSize, destPoint, destSize) {
        var len = arguments.length;
        switch (len) {
            case 2:
                var height = image.height;
                this._renderContext.drawImage(image, sourcePoint.x, -(sourcePoint.y + height));
                break;
            case 3:
                this._renderContext.drawImage(image, sourcePoint.x, -(sourcePoint.y + sourceSize.height), sourceSize.width, sourceSize.height);
                break;
            case 5:
                this._renderContext.drawImage(image, sourcePoint.x, sourcePoint.y, sourceSize.width, sourceSize.height, destPoint.x, -(destPoint.y + destSize.height),
                    destSize.width, destSize.height);
                break;
            default:
                throw new Error("Argument must be non-nil");
                break;
        }
    },

    /**
     * draw a star
     * @param {CanvasContext} ctx canvas context
     * @param {Number} radius
     * @param {cc.Color3B|cc.Color4B|cc.Color4F} color
     */
    drawStar:function (ctx, radius, color) {
        var context = ctx || this._renderContext;
        if (color instanceof cc.Color4F)
            color = new cc.Color3B(0 | (color.r * 255), 0 | (color.g * 255), 0 | (color.b * 255));
        var colorStr = "rgba(" + color.r + "," + color.g + "," + color.b;
        context.fillStyle = colorStr + ",1)";
        var subRadius = radius / 10;

        context.beginPath();
        context.moveTo(-radius, radius);
        context.lineTo(0, subRadius);
        context.lineTo(radius, radius);
        context.lineTo(subRadius, 0);
        context.lineTo(radius, -radius);
        context.lineTo(0, -subRadius);
        context.lineTo(-radius, -radius);
        context.lineTo(-subRadius, 0);
        context.lineTo(-radius, radius);
        context.closePath();
        context.fill();

        var g1 = context.createRadialGradient(0, 0, subRadius, 0, 0, radius);
        g1.addColorStop(0, colorStr + ", 1)");
        g1.addColorStop(0.3, colorStr + ", 0.8)");
        g1.addColorStop(1.0, colorStr + ", 0.0)");
        context.fillStyle = g1;
        context.beginPath();
        var startAngle_1 = 0;
        var endAngle_1 = cc.PI2;
        context.arc(0, 0, radius - subRadius, startAngle_1, endAngle_1, false);
        context.closePath();
        context.fill();
    },

    /**
     * draw a color ball
     * @param {CanvasContext} ctx canvas context
     * @param {Number} radius
     * @param {cc.Color3B|cc.Color4B|cc.Color4F} color
     */
    drawColorBall:function (ctx, radius, color) {
        var context = ctx || this._renderContext;
        if (color instanceof cc.Color4F)
            color = new cc.Color3B(0 | (color.r * 255), 0 | (color.g * 255), 0 | (color.b * 255));
        var colorStr = "rgba(" + color.r + "," + color.g + "," + color.b;
        var subRadius = radius / 10;

        var g1 = context.createRadialGradient(0, 0, subRadius, 0, 0, radius);
        g1.addColorStop(0, colorStr + ", 1)");
        g1.addColorStop(0.3, colorStr + ", 0.8)");
        g1.addColorStop(0.6, colorStr + ", 0.4)");
        g1.addColorStop(1.0, colorStr + ", 0.0)");
        context.fillStyle = g1;
        context.beginPath();
        var startAngle_1 = 0;
        var endAngle_1 = cc.PI2;
        context.arc(0, 0, radius, startAngle_1, endAngle_1, false);
        context.closePath();
        context.fill();
    },

    /**
     * fill text
     * @param {String} strText
     * @param {Number} x
     * @param {Number} y
     */
    fillText:function (strText, x, y) {
        this._renderContext.fillText(strText, x, -y);
    },

    /**
     * set the drawing color with 4 unsigned bytes
     * @param {Number} r red value (0 to 255)
     * @param {Number} r green value (0 to 255)
     * @param {Number} r blue value (0 to 255)
     * @param {Number} a Alpha value (0 to 255)
     */
    setDrawColor4B:function (r, g, b, a) {
        this._renderContext.fillStyle = "rgba(" + r + "," + g + "," + b + "," + a / 255 + ")";
        this._renderContext.strokeStyle = "rgba(" + r + "," + g + "," + b + "," + a / 255 + ")";
    },

    /**
     * set the drawing color with 4 floats
     * @param {Number} r red value (0 to 1)
     * @param {Number} r green value (0 to 1)
     * @param {Number} r blue value (0 to 1)
     * @param {Number} a Alpha value (0 to 1)
     */
    setDrawColor4F:function (r, g, b, a) {
        this._renderContext.fillStyle = "rgba(" + (0 | (r * 255)) + "," + (0 | (g * 255)) + "," + (0 | (b * 255)) + "," + a + ")";
        this._renderContext.strokeStyle = "rgba(" + (0 | (r * 255)) + "," + (0 | (g * 255)) + "," + (0 | (b * 255)) + "," + a + ")";
    },

    /**
     * set the point size in points. Default 1.
     * @param {Number} pointSize
     */
    setPointSize:function (pointSize) {
    },

    /**
     * set the line width. Default 1.
     * @param {Number} width
     */
    setLineWidth:function (width) {
        this._renderContext.lineWidth = width;
    }
});

/**
 * Canvas of DrawingPrimitive implement version
 * @class
 * @extends cc.DrawingPrimitive
 */
cc.DrawingPrimitiveWebGL = cc.DrawingPrimitive.extend({
    _initialized:false,
    _shader: null,
    _colorLocation:-1,
    _color: null,
    _pointSizeLocation:-1,
    _pointSize:-1,

    ctor:function (ctx) {
        if (ctx == null)
            ctx = cc.renderContext;

        if (!ctx instanceof  WebGLRenderingContext)
            throw "Can't initialise DrawingPrimitiveWebGL. context need is WebGLRenderingContext";

        this._super(ctx);
        this._color = new cc.Color4F(1.0, 1.0, 1.0, 1.0);
    },

    lazy_init:function () {
        if (!this._initialized) {
            //
            // Position and 1 color passed as a uniform (to similate glColor4ub )
            //
            this._shader = cc.ShaderCache.getInstance().programForKey(cc.SHADER_POSITION_UCOLOR);
            this._colorLocation = this._renderContext.getUniformLocation(this._shader.getProgram(), "u_color");
            this._pointSizeLocation = this._renderContext.getUniformLocation(this._shader.getProgram(), "u_pointSize");
            //cc.CHECK_GL_ERROR_DEBUG();

            this._initialized = true;
        }
    },

    /**
     * initlialize context
     */
    drawInit:function () {
        this._initialized = false;
    },

    /**
     * draws a point given x and y coordinate measured in points
     * @param {cc.Point} point
     */
    drawPoint:function (point) {
        this.lazy_init();

        this._shader.use();
        this._shader.setUniformForModelViewProjectionMatrix();
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        this._shader.setUniformLocationWith4fv(this._colorLocation, new Float32Array(this._color._arrayBuffer,0,4), 1);
        this._shader.setUniformLocationWith1f(this._pointSizeLocation, this._pointSize);

        var pointBuffer = this._renderContext.createBuffer();
        this._renderContext.bindBuffer(this._renderContext.ARRAY_BUFFER, pointBuffer);
        this._renderContext.bufferData(this._renderContext.ARRAY_BUFFER, new Float32Array([point.x, point.y]), this._renderContext.STATIC_DRAW);
        this._renderContext.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, this._renderContext.FLOAT, false, 0, 0);

        this._renderContext.drawArrays(this._renderContext.POINTS, 0, 1);

        cc.INCREMENT_GL_DRAWS(1);
    },

    /**
     * draws an array of points.
     * @param {Array} points point of array
     * @param {Number} numberOfPoints
     */
    drawPoints:function (points, numberOfPoints) {
        if (!points || points.length == 0)
            return;

        this.lazy_init();

        this._shader.use();
        this._shader.setUniformForModelViewProjectionMatrix();
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        this._shader.setUniformLocationWith4fv(this._colorLocation, new Float32Array(this._color._arrayBuffer,0,4), 1);
        this._shader.setUniformLocationWith1f(this._pointSizeLocation, this._pointSize);

        var pointBuffer = this._renderContext.createBuffer();
        this._renderContext.bindBuffer(this._renderContext.ARRAY_BUFFER, pointBuffer);
        this._renderContext.bufferData(this._renderContext.ARRAY_BUFFER, this._pointsToTypeArray(points), this._renderContext.STATIC_DRAW);
        this._renderContext.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, this._renderContext.FLOAT, false, 0, 0);

        this._renderContext.drawArrays(this._renderContext.POINTS, 0, points.length);

        cc.INCREMENT_GL_DRAWS(1);
    },

    _pointsToTypeArray:function (points) {
        var typeArr = new Float32Array(points.length * 2);
        for (var i = 0; i < points.length; i++) {
            typeArr[i * 2] = points[i].x;
            typeArr[i * 2 + 1] = points[i].y;
        }
        return typeArr;
    },

    /**
     * draws a line given the origin and destination point measured in points
     * @param {cc.Point} origin
     * @param {cc.Point} destination
     */
    drawLine:function (origin, destination) {
        this.lazy_init();

        this._shader.use();
        this._shader.setUniformForModelViewProjectionMatrix();
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        this._shader.setUniformLocationWith4fv(this._colorLocation, new Float32Array(this._color._arrayBuffer,0,4), 1);

        var pointBuffer = this._renderContext.createBuffer();
        this._renderContext.bindBuffer(this._renderContext.ARRAY_BUFFER, pointBuffer);
        this._renderContext.bufferData(this._renderContext.ARRAY_BUFFER, this._pointsToTypeArray([origin, destination]), this._renderContext.STATIC_DRAW);
        this._renderContext.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, this._renderContext.FLOAT, false, 0, 0);

        this._renderContext.drawArrays(this._renderContext.LINES, 0, 2);
        cc.INCREMENT_GL_DRAWS(1);
    },

    /**
     * draws a rectangle given the origin and destination point measured in points.
     * @param {cc.Point} origin
     * @param {cc.Point} destination
     */
    drawRect:function (origin, destination) {
        this.drawLine(cc.p(origin.x, origin.y), cc.p(destination.x, origin.y));
        this.drawLine(cc.p(destination.x, origin.y), cc.p(destination.x, destination.y));
        this.drawLine(cc.p(destination.x, destination.y), cc.p(origin.x, destination.y));
        this.drawLine(cc.p(origin.x, destination.y), cc.p(origin.x, origin.y));
    },

    /**
     * draws a solid rectangle given the origin and destination point measured in points.
     * @param {cc.Point} origin
     * @param {cc.Point} destination
     * @param {cc.Color4F} color
     */
    drawSolidRect:function (origin, destination, color) {
        var vertices = [
            origin,
            cc.p(destination.x, origin.y),
            destination,
            cc.p(origin.x, destination.y)
        ];

        this.drawSolidPoly(vertices, 4, color);
    },

    /**
     * draws a poligon given a pointer to cc.Point coordiantes and the number of vertices measured in points.
     * @param {Array} vertices a pointer to cc.Point coordiantes
     * @param {Number} numOfVertices the number of vertices measured in points
     * @param {Boolean} closePolygon The polygon can be closed or open
     */
    drawPoly:function (vertices, numOfVertices, closePolygon) {
        this.lazy_init();

        this._shader.use();
        this._shader.setUniformForModelViewProjectionMatrix();
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        this._shader.setUniformLocationWith4fv(this._colorLocation, new Float32Array(this._color._arrayBuffer,0,4), 1);

        var pointBuffer = this._renderContext.createBuffer();
        this._renderContext.bindBuffer(this._renderContext.ARRAY_BUFFER, pointBuffer);
        this._renderContext.bufferData(this._renderContext.ARRAY_BUFFER, this._pointsToTypeArray(vertices), this._renderContext.STATIC_DRAW);
        this._renderContext.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, this._renderContext.FLOAT, false, 0, 0);

        if (closePolygon)
            this._renderContext.drawArrays(this._renderContext.LINE_LOOP, 0, vertices.length);
        else
            this._renderContext.drawArrays(this._renderContext.LINE_STRIP, 0, vertices.length);

        cc.INCREMENT_GL_DRAWS(1);
    },

    /**
     * draws a solid polygon given a pointer to CGPoint coordiantes, the number of vertices measured in points, and a color.
     * @param {Array} poli
     * @param {Number} numberOfPoints
     * @param {cc.Color4F} color
     */
    drawSolidPoly:function (poli, numberOfPoints, color) {
        this.lazy_init();
        if (!color)
            color = this._color;

        this._shader.use();
        this._shader.setUniformForModelViewProjectionMatrix();
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        this._shader.setUniformLocationWith4fv(this._colorLocation, new Float32Array(color._arrayBuffer,0,4), 1);

        var pointBuffer = this._renderContext.createBuffer();
        this._renderContext.bindBuffer(this._renderContext.ARRAY_BUFFER, pointBuffer);
        this._renderContext.bufferData(this._renderContext.ARRAY_BUFFER, this._pointsToTypeArray(poli), this._renderContext.STATIC_DRAW);
        this._renderContext.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, this._renderContext.FLOAT, false, 0, 0);
        this._renderContext.drawArrays(this._renderContext.TRIANGLE_FAN, 0, poli.length);

        cc.INCREMENT_GL_DRAWS(1);
    },

    /**
     * draws a circle given the center, radius and number of segments.
     * @param {cc.Point} center center of circle
     * @param {Number} radius
     * @param {Number} angle angle in radians
     * @param {Number} segments
     * @param {Boolean} drawLineToCenter
     */
    drawCircle:function (center, radius, angle, segments, drawLineToCenter) {
        this.lazy_init();

        var additionalSegment = 1;
        if (drawLineToCenter)
            additionalSegment++;

        var coef = 2.0 * Math.PI / segments;

        var vertices = new Float32Array((segments + 2) * 2);
        if (!vertices)
            return;

        for (var i = 0; i <= segments; i++) {
            var rads = i * coef;
            var j = radius * Math.cos(rads + angle) + center.x;
            var k = radius * Math.sin(rads + angle) + center.y;

            vertices[i * 2] = j;
            vertices[i * 2 + 1] = k;
        }
        vertices[(segments + 1) * 2] = center.x;
        vertices[(segments + 1) * 2 + 1] = center.y;

        this._shader.use();
        this._shader.setUniformForModelViewProjectionMatrix();
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        this._shader.setUniformLocationWith4fv(this._colorLocation, new Float32Array(this._color._arrayBuffer,0,4), 1);

        var pointBuffer = this._renderContext.createBuffer();
        this._renderContext.bindBuffer(this._renderContext.ARRAY_BUFFER, pointBuffer);
        this._renderContext.bufferData(this._renderContext.ARRAY_BUFFER, vertices, this._renderContext.STATIC_DRAW);
        this._renderContext.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, this._renderContext.FLOAT, false, 0, 0);

        this._renderContext.drawArrays(this._renderContext.LINE_STRIP, 0, segments + additionalSegment);

        cc.INCREMENT_GL_DRAWS(1);
    },

    /**
     * draws a quad bezier path
     * @param {cc.Point} origin
     * @param {cc.Point} control
     * @param {cc.Point} destination
     * @param {Number} segments
     */
    drawQuadBezier:function (origin, control, destination, segments) {
        this.lazy_init();

        var vertices = new Float32Array((segments + 1) * 2);

        var t = 0.0;
        for (var i = 0; i < segments; i++) {
            vertices[i * 2] = Math.pow(1 - t, 2) * origin.x + 2.0 * (1 - t) * t * control.x + t * t * destination.x;
            vertices[i * 2 + 1] = Math.pow(1 - t, 2) * origin.y + 2.0 * (1 - t) * t * control.y + t * t * destination.y;
            t += 1.0 / segments;
        }
        vertices[segments * 2] = destination.x;
        vertices[segments * 2 + 1] = destination.y;

        this._shader.use();
        this._shader.setUniformForModelViewProjectionMatrix();
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        this._shader.setUniformLocationWith4fv(this._colorLocation, new Float32Array(this._color._arrayBuffer,0,4), 1);

        var pointBuffer = this._renderContext.createBuffer();
        this._renderContext.bindBuffer(this._renderContext.ARRAY_BUFFER, pointBuffer);
        this._renderContext.bufferData(this._renderContext.ARRAY_BUFFER, vertices, this._renderContext.STATIC_DRAW);
        this._renderContext.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, this._renderContext.FLOAT, false, 0, 0);

        this._renderContext.drawArrays(this._renderContext.LINE_STRIP, 0, segments + 1);

        cc.INCREMENT_GL_DRAWS(1);
    },

    /**
     * draws a cubic bezier path
     * @param {cc.Point} origin
     * @param {cc.Point} control1
     * @param {cc.Point} control2
     * @param {cc.Point} destination
     * @param {Number} segments
     */
    drawCubicBezier:function (origin, control1, control2, destination, segments) {
        this.lazy_init();

        var vertices = new Float32Array((segments + 1) * 2);

        var t = 0;
        for (var i = 0; i < segments; i++) {
            vertices[i * 2] = Math.pow(1 - t, 3) * origin.x + 3.0 * Math.pow(1 - t, 2) * t * control1.x + 3.0 * (1 - t) * t * t * control2.x + t * t * t * destination.x;
            vertices[i * 2 + 1] = Math.pow(1 - t, 3) * origin.y + 3.0 * Math.pow(1 - t, 2) * t * control1.y + 3.0 * (1 - t) * t * t * control2.y + t * t * t * destination.y;
            t += 1.0 / segments;
        }
        vertices[segments * 2] = destination.x;
        vertices[segments * 2 + 1] = destination.y;

        this._shader.use();
        this._shader.setUniformForModelViewProjectionMatrix();
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        this._shader.setUniformLocationWith4fv(this._colorLocation, new Float32Array(this._color._arrayBuffer,0,4), 1);

        var pointBuffer = this._renderContext.createBuffer();
        this._renderContext.bindBuffer(this._renderContext.ARRAY_BUFFER, pointBuffer);
        this._renderContext.bufferData(this._renderContext.ARRAY_BUFFER, vertices, this._renderContext.STATIC_DRAW);
        this._renderContext.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, this._renderContext.FLOAT, false, 0, 0);
        this._renderContext.drawArrays(this._renderContext.LINE_STRIP, 0, segments + 1);

        cc.INCREMENT_GL_DRAWS(1);
    },

    /**
     * draw a catmull rom line
     * @param {Array} points
     * @param {Number} segments
     */
    drawCatmullRom:function (points, segments) {
        this.drawCardinalSpline(points, 0.5, segments);
    },

    /**
     * draw a cardinal spline path
     * @param {Array} config
     * @param {Number} tension
     * @param {Number} segments
     */
    drawCardinalSpline:function (config, tension, segments) {
        this.lazy_init();

        var vertices = new Float32Array((segments + 1) * 2);
        var p, lt, deltaT = 1.0 / config.length;
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

            var newPos = cc.CardinalSplineAt(
                cc.getControlPointAt(config, p - 1),
                cc.getControlPointAt(config, p),
                cc.getControlPointAt(config, p + 1),
                cc.getControlPointAt(config, p + 2),
                tension, lt);
            // Interpolate

            vertices[i * 2] = newPos.x;
            vertices[i * 2 + 1] = newPos.y;
        }

        this._shader.use();
        this._shader.setUniformForModelViewProjectionMatrix();
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        this._shader.setUniformLocationWith4fv(this._colorLocation, new Float32Array(this._color._arrayBuffer,0,4), 1);

        var pointBuffer = this._renderContext.createBuffer();
        this._renderContext.bindBuffer(this._renderContext.ARRAY_BUFFER, pointBuffer);
        this._renderContext.bufferData(this._renderContext.ARRAY_BUFFER, vertices, this._renderContext.STATIC_DRAW);
        this._renderContext.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, this._renderContext.FLOAT, false, 0, 0);
        this._renderContext.drawArrays(this._renderContext.LINE_STRIP, 0, segments + 1);

        cc.INCREMENT_GL_DRAWS(1);
    },

    /**
     * set the drawing color with 4 unsigned bytes
     * @param {Number} r red value (0 to 255)
     * @param {Number} r green value (0 to 255)
     * @param {Number} r blue value (0 to 255)
     * @param {Number} a Alpha value (0 to 255)
     */
    setDrawColor4B:function (r, g, b, a) {
        this._color.r = r / 255.0;
        this._color.g = g / 255.0;
        this._color.b = b / 255.0;
        this._color.a = a / 255.0;
    },

    /**
     * set the drawing color with 4 floats
     * @param {Number} r red value (0 to 1)
     * @param {Number} r green value (0 to 1)
     * @param {Number} r blue value (0 to 1)
     * @param {Number} a Alpha value (0 to 1)
     */
    setDrawColor4F:function (r, g, b, a) {
        this._color.r = r;
        this._color.g = g;
        this._color.b = b;
        this._color.a = a;
    },

    /**
     * set the point size in points. Default 1.
     * @param {Number} pointSize
     */
    setPointSize:function (pointSize) {
        this._pointSize = pointSize * cc.CONTENT_SCALE_FACTOR();
    },

    /**
     * set the line width. Default 1.
     * @param {Number} width
     */
    setLineWidth:function (width) {
        if(this._renderContext.lineWidth)
            this._renderContext.lineWidth(width);
    }
});

cc.PI2 = Math.PI * 2;
