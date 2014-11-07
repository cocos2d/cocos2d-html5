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

cc.PhysicsDebugNode.CanvasRenderCmd = function(renderableObject){
    cc.Node.CanvasRenderCmd.call(this, renderableObject);
    this._buffer = renderableObject._buffer;
    this._needDraw = true;
};

cc.PhysicsDebugNode.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
cc.PhysicsDebugNode.CanvasRenderCmd.prototype.constructor = cc.PhysicsDebugNode.CanvasRenderCmd;

cc.PhysicsDebugNode.CanvasRenderCmd.prototype.rendering = function(ctx, scaleX, scaleY){
    var node = this._node;
    if (!node._space)
        return;
    node._space.eachShape(cc.DrawShape.bind(node));
    node._space.eachConstraint(cc.DrawConstraint.bind(node));
    cc.DrawNode.CanvasRenderCmd.prototype.rendering.call(this, ctx, scaleX, scaleY);
    node.clear();
};

cc.PhysicsDebugNode.CanvasRenderCmd.prototype._drawDot = cc.DrawNode.CanvasRenderCmd.prototype._drawDot;
cc.PhysicsDebugNode.CanvasRenderCmd.prototype._drawSegment = cc.DrawNode.CanvasRenderCmd.prototype._drawSegment;
cc.PhysicsDebugNode.CanvasRenderCmd.prototype._drawPoly = cc.DrawNode.CanvasRenderCmd.prototype._drawPoly;


cc.PhysicsDebugNode.WebGLRenderCmd = function (renderableObject) {
    cc.Node.WebGLRenderCmd.call(this, renderableObject);
    this._needDraw = true;
};

cc.PhysicsDebugNode.WebGLRenderCmd.prototype.rendering = function (ctx) {
    var node = this._node;
    if (!node._space)
        return;

    node._space.eachShape(cc.DrawShape.bind(node));
    node._space.eachConstraint(cc.DrawConstraint.bind(node));
    cc.DrawNode.prototype.draw.call(node);
    node.clear();
};