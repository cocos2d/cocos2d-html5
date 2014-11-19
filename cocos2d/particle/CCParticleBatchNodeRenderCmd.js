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

/**
 * cc.Layer's rendering objects of Canvas
 */
(function(){
    cc.ParticleBatchNode.CanvasRenderCmd = function(renderableObject){
        cc.Node.CanvasRenderCmd.call(this, renderableObject);
        this._needDraw = true;
    };

    var proto = cc.ParticleBatchNode.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    proto.constructor = cc.ParticleBatchNode.CanvasRenderCmd;

    proto.rendering =
    proto._initWithTexture =
    proto.draw =
    proto.visit = function(){};
})();

/**
 * cc.Layer's rendering objects of WebGL
 */
(function(){

    cc.ParticleBatchNode.WebGLRenderCmd = function(renderableObject){
        cc.Node.WebGLRenderCmd.call(this, renderableObject);
        this._needDraw = true;
    };

    var proto = cc.ParticleBatchNode.WebGLRenderCmd.prototype = Object.create(cc.Node.WebGLRenderCmd.prototype);
    proto.constructor = cc.ParticleBatchNode.WebGLRenderCmd;

    proto.rendering = function (ctx) {
        var _t = this._node;
        if (_t.textureAtlas.totalQuads == 0)
            return;

        _t._shaderProgram.use();
        _t._shaderProgram._setUniformForMVPMatrixWithMat4(_t._stackMatrix);
        cc.glBlendFuncForParticle(_t._blendFunc.src, _t._blendFunc.dst);
        _t.textureAtlas.drawQuads();
    };

    proto._initWithTexture = function(){
        this._node.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
    };

    proto.draw = function(){
        var ndoe = this._node;
        //cc.PROFILER_STOP("CCParticleBatchNode - draw");
        if (ndoe.textureAtlas.totalQuads == 0)
            return;

        cc.nodeDrawSetup(ndoe);
        cc.glBlendFuncForParticle(ndoe._blendFunc.src, ndoe._blendFunc.dst);
        ndoe.textureAtlas.drawQuads();

        //cc.PROFILER_STOP("CCParticleBatchNode - draw");
    };

    proto.visit = function(){
        var node = this._node;
        // CAREFUL:
        // This visit is almost identical to cc.Node#visit
        // with the exception that it doesn't call visit on it's children
        //
        // The alternative is to have a void cc.Sprite#visit, but
        // although this is less mantainable, is faster
        //
        if (!node._visible)
            return;

        var currentStack = cc.current_stack;
        currentStack.stack.push(currentStack.top);
        cc.kmMat4Assign(node._stackMatrix, currentStack.top);
        currentStack.top = node._stackMatrix;

        node.transform(ctx);
        //this.draw(ctx);
        cc.renderer.pushRenderCommand(this);

        cc.kmGLPopMatrix();
    };
})();