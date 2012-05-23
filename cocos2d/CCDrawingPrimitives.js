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
var cc = cc = cc || {};

/**
 @file
 Drawing primitives Utility Class. this class contain some primitive Drawing Method:
 - drawPoint
 - drawLine
 - drawPoly
 - drawCircle
 - drawQuadBezier
 - drawCubicBezier

 You can change the color, width and other property by calling the
 glColor4ub(), glLineWidth(), glPointSize().

 @warning These functions draws the Line, Point, Polygon, immediately. They aren't batched. If you are going to make a game that depends on these primitives, I suggest creating a batch.
 */

cc.DrawingPrimitive = cc.Class.extend({
    _renderContext:null,
    setRenderContext:function (context) {
        this._renderContext = context;
    },
    getRenderContext:function () {
        return this._renderContext;
    },

    ctor:function (renderContext) {
        this._renderContext = renderContext;
    },


    /** draws a point given x and y coordinate measured in points */
    drawPoint:function (point) {
        cc.log("DrawingPrimitive.drawPoint() not implement!");
    },

    /** draws an array of points.
     @since v0.7.2
     */
    drawPoints:function (points, numberOfPoints) {
        cc.log("DrawingPrimitive.drawPoints() not implement!");
    },

    /** draws a line given the origin and destination point measured in points */
    drawLine:function (origin, destination) {
        cc.log("DrawingPrimitive.drawLine() not implement!");
    },

    /** draws a poligon given a pointer to CCPoint coordiantes and the number of vertices measured in points.
     The polygon can be closed or open
     The polygon can be closed or open and optionally filled with current GL color
     */
    drawPoly:function (vertices, numOfVertices, closePolygon, fill) {
        cc.log("DrawingPrimitive.drawPoly() not implement!");
    },

    /** draws a circle given the center, radius and number of segments. */
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
            var addPoint = new cc.Point(j * cc.CONTENT_SCALE_FACTOR(), k * cc.CONTENT_SCALE_FACTOR());
            vertices.push(addPoint);
        }

        if (drawLineToCenter) {
            var lastPoint = new cc.Point(center.x * cc.CONTENT_SCALE_FACTOR(), center.y * cc.CONTENT_SCALE_FACTOR());
            vertices.push(lastPoint);
        }

        this.drawPoly(vertices, segments + 2, true, false);
    },

    /** draws a quad bezier path
     @since v0.8
     */
    drawQuadBezier:function (origin, control, destination, segments) {
        cc.log("DrawingPrimitive.drawQuadBezier() not implement!");
    },

    /** draws a cubic bezier path
     @since v0.8
     */
    drawCubicBezier:function (origin, control1, control2, destination, segments) {
        cc.log("DrawingPrimitive.drawCubicBezier() not implement!");
    },

    drawImage:function (image, sourcePoint, sourceSize, destPoint, destSize) {
        cc.log("DrawingPrimitive.drawImage() not implement!");
    },

    fillText:function () {
        cc.log("DrawingPrimitive.fillText() not implement!");
    }
});

/**
 * @brief DrawingPrimitive's canvas implemention version
 */
cc.DrawingPrimitiveCanvas = cc.DrawingPrimitive.extend({
    drawPoint:function (point, size) {
        if (!size) {
            size = 1;
        }
        var newPoint = new cc.Point(point.x * cc.CONTENT_SCALE_FACTOR(), point.y * cc.CONTENT_SCALE_FACTOR());
        this._renderContext.beginPath();
        this._renderContext.arc(newPoint.x, -newPoint.y, size * cc.CONTENT_SCALE_FACTOR(), 0, Math.PI * 2, false);
        this._renderContext.closePath();
        this._renderContext.fill();
    },

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

    drawLine:function (origin, destination) {
        this._renderContext.beginPath();
        this._renderContext.moveTo(origin.x * cc.CONTENT_SCALE_FACTOR(), -origin.y * cc.CONTENT_SCALE_FACTOR());
        this._renderContext.lineTo(destination.x * cc.CONTENT_SCALE_FACTOR(), -destination.y * cc.CONTENT_SCALE_FACTOR());
        this._renderContext.closePath();
        this._renderContext.stroke();
    },

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

    drawCircle:function (center, radius, angle, segments, drawLineToCenter) {
        this._renderContext.beginPath();
        var endAngle = angle - Math.PI * 2;
        this._renderContext.arc(0|center.x,0|-(center.y),radius,-angle,-endAngle,false);
        if(drawLineToCenter){
            this._renderContext.lineTo(0|center.x,0|-(center.y));
        }
        this._renderContext.stroke();
    },

    drawQuadBezier:function (origin, control, destination, segments) {
        //this is OpenGL Algorithm
        var vertices = [];

        var t = 0.0;
        for (var i = 0; i < segments; i++) {
            var x = Math.pow(1 - t, 2) * origin.x + 2.0 * (1 - t) * t * control.x + t * t * destination.x;
            var y = Math.pow(1 - t, 2) * origin.y + 2.0 * (1 - t) * t * control.y + t * t * destination.y;
            vertices.push(new cc.Point(x * cc.CONTENT_SCALE_FACTOR(), y * cc.CONTENT_SCALE_FACTOR()));
            t += 1.0 / segments;
        }
        vertices.push(new cc.Point(destination.x * cc.CONTENT_SCALE_FACTOR(), destination.y * cc.CONTENT_SCALE_FACTOR()));

        this.drawPoly(vertices, segments + 1, false, false);
    },

    drawCubicBezier:function (origin, control1, control2, destination, segments) {
        //this is OpenGL Algorithm
        var vertices = [];

        var t = 0;
        for (var i = 0; i < segments; i++) {
            var x = Math.pow(1 - t, 3) * origin.x + 3.0 * Math.pow(1 - t, 2) * t * control1.x + 3.0 * (1 - t) * t * t * control2.x + t * t * t * destination.x;
            var y = Math.pow(1 - t, 3) * origin.y + 3.0 * Math.pow(1 - t, 2) * t * control1.y + 3.0 * (1 - t) * t * t * control2.y + t * t * t * destination.y;
            vertices.push(new cc.Point(x * cc.CONTENT_SCALE_FACTOR(), y * cc.CONTENT_SCALE_FACTOR()));
            t += 1.0 / segments;
        }
        vertices.push(new cc.Point(destination.x * cc.CONTENT_SCALE_FACTOR(), destination.y * cc.CONTENT_SCALE_FACTOR()));

        this.drawPoly(vertices, segments + 1, false, false);
    },

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
    fillText:function (strText, x, y) {
        this._renderContext.fillText(strText, x, -y);
    }
});