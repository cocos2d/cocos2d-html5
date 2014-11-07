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

cc.RenderTexture.WebGLRenderCmd = function(renderableObject){
    cc.Node.WebGLRenderCmd.call(this, renderableObject);
    this._needDraw = true;
};

cc.RenderTexture.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
cc.RenderTexture.WebGLRenderCmd.prototype.constructor = cc.RenderTexture.WebGLRenderCmd;

cc.RenderTexture.WebGLRenderCmd.prototype.rendering = function (ctx) {
    var gl = ctx || cc._renderContext;
    var node = this._node;
    if (node.autoDraw) {
        node.begin();

        var locClearFlags = node.clearFlags;
        if (locClearFlags) {
            var oldClearColor = [0.0, 0.0, 0.0, 0.0];
            var oldDepthClearValue = 0.0;
            var oldStencilClearValue = 0;

            // backup and set
            if (locClearFlags & gl.COLOR_BUFFER_BIT) {
                oldClearColor = gl.getParameter(gl.COLOR_CLEAR_VALUE);
                gl.clearColor(node._clearColor.r / 255, node._clearColor.g / 255, node._clearColor.b / 255, node._clearColor.a / 255);
            }

            if (locClearFlags & gl.DEPTH_BUFFER_BIT) {
                oldDepthClearValue = gl.getParameter(gl.DEPTH_CLEAR_VALUE);
                gl.clearDepth(node.clearDepthVal);
            }

            if (locClearFlags & gl.STENCIL_BUFFER_BIT) {
                oldStencilClearValue = gl.getParameter(gl.STENCIL_CLEAR_VALUE);
                gl.clearStencil(node.clearStencilVal);
            }

            // clear
            gl.clear(locClearFlags);

            // restore
            if (locClearFlags & gl.COLOR_BUFFER_BIT)
                gl.clearColor(oldClearColor[0], oldClearColor[1], oldClearColor[2], oldClearColor[3]);

            if (locClearFlags & gl.DEPTH_BUFFER_BIT)
                gl.clearDepth(oldDepthClearValue);

            if (locClearFlags & gl.STENCIL_BUFFER_BIT)
                gl.clearStencil(oldStencilClearValue);
        }

        //! make sure all children are drawn
        node.sortAllChildren();
        var locChildren = node._children;
        for (var i = 0; i < locChildren.length; i++) {
            var getChild = locChildren[i];
            if (getChild != node.sprite)
                getChild.visit();
        }
        node.end();
    }
};