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

cc.SpriteBatchNode.CanvasRenderCmd = function(renderable){
    cc.Node.CanvasRenderCmd.call(this, renderable);

    this._texture = null;
};

cc.SpriteBatchNode.WebGLRenderCmd = function(renderableObject){
    cc.Node.WebGLRenderCmd.call(this, renderableObject);
    this._needDraw = true;
};

cc.SpriteBatchNode.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
cc.SpriteBatchNode.WebGLRenderCmd.prototype.constructor = cc.SpriteBatchNode.WebGLRenderCmd;

cc.SpriteBatchNode.WebGLRenderCmd.prototype.rendering = function () {
    var node = this._node;
    if (node.textureAtlas.totalQuads === 0)
        return;

    //cc.nodeDrawSetup(this);
    this._shaderProgram.use();
    this._shaderProgram._setUniformForMVPMatrixWithMat4(this._stackMatrix);
    node._arrayMakeObjectsPerformSelector(node._children, cc.Node._stateCallbackType.updateTransform);
    cc.glBlendFunc(node._blendFunc.src, node._blendFunc.dst);

    node.textureAtlas.drawQuads();
};