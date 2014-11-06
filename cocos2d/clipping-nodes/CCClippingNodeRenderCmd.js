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

cc.ClippingNode.CanvasSaveRenderCmd = function(renderableObject){
    cc.Node.CanvasRenderCmd.call(this, renderableObject);
    this._needDraw = true;
};

cc.ClippingNode.CanvasSaveRenderCmd.prototype.rendering = function (ctx, scaleX, scaleY) {
    var node = this._node;
    var context = ctx || cc._renderContext;

    if (node._clipElemType) {
        var locCache = cc.ClippingNode._getSharedCache();
        var canvas = context.canvas;
        locCache.width = canvas.width;
        locCache.height = canvas.height;
        var locCacheCtx = locCache.getContext("2d");
        locCacheCtx.drawImage(canvas, 0, 0);
        context.save();
    } else {
        node.transform();
        var t = node._transformWorld;
        context.save();
        context.save();
        context.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);
    }
};

cc.ClippingNode.CanvasSaveRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
cc.ClippingNode.CanvasSaveRenderCmd.prototype.constructor = cc.ClippingNode.CanvasSaveRenderCmd;

cc.ClippingNode.CanvasClipRenderCmd = function (renderableObject) {
    cc.Node.CanvasRenderCmd.call(this, renderableObject);
    this._needDraw = true;
};

cc.ClippingNode.CanvasClipRenderCmd.prototype.rendering = function (ctx, scaleX, scaleY) {
    var node = this._node;
    var context = ctx || cc._renderContext;

    if (node._clipElemType) {
        context.globalCompositeOperation = node.inverted ? "destination-out" : "destination-in";
        var t = node._transformWorld;
        context.transform(t.a, t.c, t.b, t.d, t.tx * scaleX, -t.ty * scaleY);
    } else {
        context.restore();
        if (node.inverted) {
            var canvas = context.canvas;
            context.save();

            context.setTransform(1, 0, 0, 1, 0, 0);

            context.moveTo(0, 0);
            context.lineTo(0, canvas.height);
            context.lineTo(canvas.width, canvas.height);
            context.lineTo(canvas.width, 0);
            context.lineTo(0, 0);

            context.restore();
        }
        context.clip();
    }
};

cc.ClippingNode.CanvasClipRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
cc.ClippingNode.CanvasClipRenderCmd.prototype.constructor = cc.ClippingNode.CanvasClipRenderCmd;

cc.ClippingNode.CanvasRestoreRenderCmd = function (renderableObject) {
    cc.Node.CanvasRenderCmd.call(this, renderableObject);
    this._needDraw = true;
};

cc.ClippingNode.CanvasRestoreRenderCmd.prototype.rendering = function (ctx, scaleX, scaleY) {
    var node = this._node;
    var locCache = cc.ClippingNode._getSharedCache();
    var context = ctx || cc._renderContext;
    if (node._clipElemType) {
        context.restore();

        // Redraw the cached canvas, so that the cliped area shows the background etc.
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.globalCompositeOperation = "destination-over";
        context.drawImage(locCache, 0, 0);
        context.restore();
    } else {
        context.restore();
    }
};

cc.ClippingNode.CanvasRestoreRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
cc.ClippingNode.CanvasRestoreRenderCmd.prototype.constructor = cc.ClippingNode.CanvasRestoreRenderCmd;

cc.ClippingNode.WebGLRenderCmd = function(renderableObject, callback){
    cc.Node.WebGLRenderCmd.call(this, renderableObject);
    this._needDraw = true;
    this._callback = callback;
};

cc.ClippingNode.WebGLRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
cc.ClippingNode.WebGLRenderCmd.prototype.constructor = cc.ClippingNode.WebGLRenderCmd;

cc.ClippingNode.WebGLRenderCmd.prototype.rendering = function (ctx) {
    if (!this._callback)
        return;
    this._callback.call(this._node, ctx);
};