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

cc.AtlasNode.WebGLRenderCmd = function(renderableObject){
    cc.Node.WebGLRenderCmd.call(this, renderableObject);
    this._needDraw = true;
};

cc.AtlasNode.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
cc.AtlasNode.WebGLRenderCmd.prototype.constructor = cc.AtlasNode.WebGLRenderCmd;

cc.AtlasNode.WebGLRenderCmd.prototype.rendering = function (ctx) {
    var context = ctx || cc._renderContext, node = this._node;

    node._shaderProgram.use();
    node._shaderProgram._setUniformForMVPMatrixWithMat4(node._stackMatrix);

    cc.glBlendFunc(node._blendFunc.src, node._blendFunc.dst);
    if (node._uniformColor && node._colorF32Array) {
        context.uniform4fv(node._uniformColor, node._colorF32Array);
        node.textureAtlas.drawNumberOfQuads(node.quadsToDraw, 0);
    }
};