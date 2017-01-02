/****************************************************************************
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

//-----------------------//
//  1. cc.Layer          //
//  2. cc.LayerColor     //
//  3. cc.LayerGradient  //
//-----------------------//

/**
 * cc.Layer's rendering objects of WebGL
 */
(function () {
    cc.Layer.WebGLRenderCmd = function (renderable) {
        this._rootCtor(renderable);
        this._isBaked = false;
    };

    var proto = cc.Layer.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    proto.constructor = cc.Layer.WebGLRenderCmd;
    proto._layerCmdCtor = cc.Layer.WebGLRenderCmd;

    proto.bake = function () {
    };

    proto.unbake = function () {
    };

    proto._bakeForAddChild = function () {
    };
})();

/**
 * cc.LayerColor's rendering objects of WebGL
 */
(function () {
    var FLOAT_PER_VERTEX = 4;

    cc.LayerColor.WebGLRenderCmd = function (renderable) {
        this._layerCmdCtor(renderable);
        this._needDraw = true;

        this._matrix = null;

        this.initData(4);
        this._color = new Uint32Array(1);
        this._vertexBuffer = null;

        this._shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_COLOR);
    };
    var proto = cc.LayerColor.WebGLRenderCmd.prototype = Object.create(cc.Layer.WebGLRenderCmd.prototype);
    proto.constructor = cc.LayerColor.WebGLRenderCmd;

    proto.initData = function (vertexCount) {
        this._data = new ArrayBuffer(16 * vertexCount);
        this._positionView = new Float32Array(this._data);
        this._colorView = new Uint32Array(this._data);
        this._dataDirty = true;
    };

    proto.transform = function (parentCmd, recursive) {
        this.originTransform(parentCmd, recursive);

        var node = this._node,
            width = node._contentSize.width,
            height = node._contentSize.height;

        var pos = this._positionView;
        pos[FLOAT_PER_VERTEX] = width;          // br.x
        pos[FLOAT_PER_VERTEX * 2 + 1] = height; // tl.y
        pos[FLOAT_PER_VERTEX * 3] = width;      // tr.x
        pos[FLOAT_PER_VERTEX * 3 + 1] = height; // tr.y
        pos[2].z = 
        pos[FLOAT_PER_VERTEX + 2] = 
        pos[FLOAT_PER_VERTEX * 2 + 2] = 
        pos[FLOAT_PER_VERTEX * 3 + 2] = node._vertexZ;

        this._dataDirty = true;
    };

    proto._updateColor = function () {
        var color = this._displayedColor;
        this._color[0] = ((this._displayedOpacity << 24) | (color.b << 16) | (color.g << 8) | color.r);

        var colors = this._colorView;
        for (var i = 0; i < 4; i++) {
            colors[i * FLOAT_PER_VERTEX + 3] = this._color[0];
        }
        this._dataDirty = true;
    };

    proto.rendering = function (ctx) {
        var gl = ctx || cc._renderContext;
        var node = this._node;

        if (!this._matrix) {
            this._matrix = new cc.math.Matrix4();
            this._matrix.identity();
        }

        var wt = this._worldTransform;
        this._matrix.mat[0] = wt.a;
        this._matrix.mat[4] = wt.c;
        this._matrix.mat[12] = wt.tx;
        this._matrix.mat[1] = wt.b;
        this._matrix.mat[5] = wt.d;
        this._matrix.mat[13] = wt.ty;

        if (this._dataDirty) {
            if (!this._vertexBuffer) {
                this._vertexBuffer = gl.createBuffer();
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this._data, gl.DYNAMIC_DRAW);
            this._dataDirty = false;
        }

        this._shaderProgram.use();
        this._shaderProgram._setUniformForMVPMatrixWithMat4(this._matrix);
        cc.glBlendFunc(node._blendFunc.src, node._blendFunc.dst);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.enableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION);
        gl.enableVertexAttribArray(cc.VERTEX_ATTRIB_COLOR);

        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 16, 0);
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 16, 12);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    proto.updateBlendFunc = function (blendFunc) {
    };
})();

/**
 * cc.LayerGradient's rendering objects of WebGL
 */
(function () {
    var FLOAT_PER_VERTEX = 4;

    cc.LayerGradient.WebGLRenderCmd = function (renderable) {
        cc.LayerColor.WebGLRenderCmd.call(this, renderable);
        this._needDraw = true;
        this._clipRect = new cc.Rect();
        this._clippingRectDirty = false;
    };
    var proto = cc.LayerGradient.WebGLRenderCmd.prototype = Object.create(cc.LayerColor.WebGLRenderCmd.prototype);
    proto.constructor = cc.LayerGradient.WebGLRenderCmd;

    proto.updateStatus = function () {
        var flags = cc.Node._dirtyFlags, locFlag = this._dirtyFlag;
        if (locFlag & flags.gradientDirty) {
            this._dirtyFlag |= flags.colorDirty;
            this._updateVertex();
            this._dirtyFlag &= ~flags.gradientDirty;
        }

        this.originUpdateStatus();
    };

    proto._syncStatus = function (parentCmd) {
        var flags = cc.Node._dirtyFlags, locFlag = this._dirtyFlag;
        if (locFlag & flags.gradientDirty) {
            this._dirtyFlag |= flags.colorDirty;
            this._updateVertex();
            this._dirtyFlag &= ~flags.gradientDirty;
        }

        this._originSyncStatus(parentCmd);
    };

    proto.transform = function (parentCmd, recursive) {
        this.originTransform(parentCmd, recursive);
        this._updateVertex();
    };

    proto._updateVertex = function () {
        var node = this._node, stops = node._colorStops;
        if (!stops || stops.length < 2)
            return;

        this._clippingRectDirty = true;
        var i, stopsLen = stops.length, verticesLen = stopsLen * 2, contentSize = node._contentSize;
        if (this._positionView.length / FLOAT_PER_VERTEX < verticesLen) {
            this.initData(verticesLen);
        }

        //init vertex
        var angle = Math.PI + cc.pAngleSigned(cc.p(0, -1), node._alongVector), locAnchor = cc.p(contentSize.width / 2, contentSize.height / 2);
        var degrees = Math.round(cc.radiansToDegrees(angle));
        var transMat = cc.affineTransformMake(1, 0, 0, 1, locAnchor.x, locAnchor.y);
        transMat = cc.affineTransformRotate(transMat, angle);
        var a, b;
        if (degrees < 90) {
            a = cc.p(-locAnchor.x, locAnchor.y);
            b = cc.p(locAnchor.x, locAnchor.y);
        } else if (degrees < 180) {
            a = cc.p(locAnchor.x, locAnchor.y);
            b = cc.p(locAnchor.x, -locAnchor.y);
        } else if (degrees < 270) {
            a = cc.p(locAnchor.x, -locAnchor.y);
            b = cc.p(-locAnchor.x, -locAnchor.y);
        } else {
            a = cc.p(-locAnchor.x, -locAnchor.y);
            b = cc.p(-locAnchor.x, locAnchor.y);
        }

        var sin = Math.sin(angle), cos = Math.cos(angle);
        var tx = Math.abs((a.x * cos - a.y * sin) / locAnchor.x), ty = Math.abs((b.x * sin + b.y * cos) / locAnchor.y);
        transMat = cc.affineTransformScale(transMat, tx, ty);
        var pos = this._positionView;
        for (i = 0; i < stopsLen; i++) {
            var stop = stops[i], y = stop.p * contentSize.height;
            var p0 = cc.pointApplyAffineTransform(-locAnchor.x, y - locAnchor.y, transMat);
            var offset = i * 2 * FLOAT_PER_VERTEX;
            pos[offset] = p0.x;
            pos[offset + 1] = p0.y;
            pos[offset + 2] = node._vertexZ;
            var p1 = cc.pointApplyAffineTransform(contentSize.width - locAnchor.x, y - locAnchor.y, transMat);
            offset += FLOAT_PER_VERTEX;
            pos[offset] = p1.x;
            pos[offset + 1] = p1.y;
            pos[offset + 2] = node._vertexZ;
        }

        this._dataDirty = true;
    };

    proto._updateColor = function () {
        var node = this._node, stops = node._colorStops;
        if (!stops || stops.length < 2)
            return;

        var stopsLen = stops.length,
            stopColor,
            offset,
            colors = this._colorView,
            opacityf = this._displayedOpacity / 255;
        for (i = 0; i < stopsLen; i++) {
            stopColor = stops[i].color;
            this._color[0] = ((stopColor.a*opacityf) << 24) | (stopColor.b << 16) | (stopColor.g << 8) | stopColor.r;
            
            offset = i * 2 * FLOAT_PER_VERTEX;
            colors[offset + 3] = this._color[0];
            offset += FLOAT_PER_VERTEX;
            colors[offset + 3] = this._color[0];
        }
        this._dataDirty = true;
    };

    proto.rendering = function (ctx) {
        var context = ctx || cc._renderContext, node = this._node;

        if (!this._matrix) {
            this._matrix = new cc.math.Matrix4();
            this._matrix.identity();
        }

        //it is too expensive to use stencil to clip, so it use Scissor,
        //but it has a bug when layer rotated and layer's content size less than canvas's size.
        var clippingRect = this._getClippingRect();
        context.enable(context.SCISSOR_TEST);
        cc.view.setScissorInPoints(clippingRect.x, clippingRect.y, clippingRect.width, clippingRect.height);

        var wt = this._worldTransform;
        this._matrix.mat[0] = wt.a;
        this._matrix.mat[4] = wt.c;
        this._matrix.mat[12] = wt.tx;
        this._matrix.mat[1] = wt.b;
        this._matrix.mat[5] = wt.d;
        this._matrix.mat[13] = wt.ty;

        if (this._dataDirty) {
            if (!this._vertexBuffer) {
                this._vertexBuffer = gl.createBuffer();
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this._data, gl.DYNAMIC_DRAW);
            this._dataDirty = false;
        }

        //draw gradient layer
        this._shaderProgram.use();
        this._shaderProgram._setUniformForMVPMatrixWithMat4(this._matrix);
        cc.glBlendFunc(node._blendFunc.src, node._blendFunc.dst);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.enableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION);
        gl.enableVertexAttribArray(cc.VERTEX_ATTRIB_COLOR);

        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 16, 0);
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 16, 12);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        context.disable(context.SCISSOR_TEST);
    };

    proto._getClippingRect = function () {
        if (this._clippingRectDirty) {
            var node = this._node;
            var rect = cc.rect(0, 0, node._contentSize.width, node._contentSize.height);
            var trans = node.getNodeToWorldTransform();
            this._clipRect = cc._rectApplyAffineTransformIn(rect, trans);
        }
        return this._clipRect;
    };
})();
