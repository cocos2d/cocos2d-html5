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
     * draws a circle given the center, radius and number of segments.
     * @param {cc.Point} center center of circle
     * @param {Number} radius
     * @param {Number} angle angle in radians
     * @param {Number} segments
     * @param {Boolean} drawLineToCenter
     */
    drawCircle:function (center, radius, angle, segments, drawLineToCenter) {
        //WEBGL version
        if ((segments == "undefined") || (segments == 0)) {
            return;
        }
        var additionalSegment = 1;
        if (drawLineToCenter) {
            ++additionalSegment;
        }

        var coef = 2.0 * Math.PI / segments;

        var vertices = [];

        for (var i = 0; i <= segments; i++) {
            var rads = i * coef;
            var j = radius * Math.cos(rads + angle) + center.x;
            var k = radius * Math.sin(rads + angle) + center.y;
            var addPoint = cc.p(j * cc.CONTENT_SCALE_FACTOR(), k * cc.CONTENT_SCALE_FACTOR());
            vertices.push(addPoint);
        }

        if (drawLineToCenter) {
            var lastPoint = cc.p(center.x * cc.CONTENT_SCALE_FACTOR(), center.y * cc.CONTENT_SCALE_FACTOR());
            vertices.push(lastPoint);
        }

        this.drawPoly(vertices, segments + 2, true, false);
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
                cc.getControlPointAt( config, p - 1),
                cc.getControlPointAt( config, p - 0),
                cc.getControlPointAt( config, p + 1),
                cc.getControlPointAt( config, p + 2),
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
    }
});

cc.PI2 = Math.PI * 2;
