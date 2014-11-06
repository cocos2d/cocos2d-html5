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

cc.rendererWebGL = {
    childrenOrderDirty: true,
    _transformNodePool: [],                              //save nodes transform dirty
    _renderCmds: [],                                     //save renderer commands

    _isCacheToBufferOn: false,                          //a switch that whether cache the rendererCmd to cacheToCanvasCmds
    _cacheToBufferCmds: {},                              // an array saves the renderer commands need for cache to other canvas
    _cacheInstanceIds: [],
    _currentID: 0,

    getRenderCmd: function (renderableObject) {
        //TODO Add renderCmd pool here
        return renderableObject._createRenderCmd();
    },

    /**
     * drawing all renderer command to context (default is cc._renderContext)
     * @param {WebGLRenderingContext} [ctx=cc._renderContext]
     */
    rendering: function (ctx) {
        var locCmds = this._renderCmds,
            i,
            len;
        var context = ctx || cc._renderContext;
        for (i = 0, len = locCmds.length; i < len; i++) {
            locCmds[i].rendering(context);
        }
    },

    _turnToCacheMode: function (renderTextureID) {
        this._isCacheToBufferOn = true;
        renderTextureID = renderTextureID || 0;
        this._cacheToBufferCmds[renderTextureID] = [];
        this._cacheInstanceIds.push(renderTextureID);
        this._currentID = renderTextureID;
    },

    _turnToNormalMode: function () {
        this._isCacheToBufferOn = false;
    },

    /**
     * drawing all renderer command to cache canvas' context
     * @param {Number} [renderTextureId]
     */
    _renderingToBuffer: function (renderTextureId) {
        renderTextureId = renderTextureId || this._currentID;
        var locCmds = this._cacheToBufferCmds[renderTextureId], i, len;
        var ctx = cc._renderContext, locIDs = this._cacheInstanceIds;
        for (i = 0, len = locCmds.length; i < len; i++) {
            locCmds[i].rendering(ctx);
        }
        locCmds.length = 0;
        delete this._cacheToBufferCmds[renderTextureId];
        cc.arrayRemoveObject(locIDs, renderTextureId);

        if (locIDs.length === 0)
            this._isCacheToBufferOn = false;
        else
            this._currentID = locIDs[locIDs.length - 1];
    },

    //reset renderer's flag
    resetFlag: function () {
        this.childrenOrderDirty = false;
        this._transformNodePool.length = 0;
    },

    //update the transform data
    transform: function () {
        var locPool = this._transformNodePool;
        //sort the pool
        locPool.sort(this._sortNodeByLevelAsc);
        //transform node
        for (var i = 0, len = locPool.length; i < len; i++) {
            if (locPool[i]._renderCmdDiry)
                locPool[i]._transformForRenderer();
        }
        locPool.length = 0;
    },

    transformDirty: function () {
        return this._transformNodePool.length > 0;
    },

    _sortNodeByLevelAsc: function (n1, n2) {
        return n1._curLevel - n2._curLevel;
    },

    pushDirtyNode: function (node) {
        //if (this._transformNodePool.indexOf(node) === -1)
        this._transformNodePool.push(node);
    },

    clearRenderCommands: function () {
        this._renderCmds.length = 0;
    },

    pushRenderCommand: function (cmd) {
        if(!cmd._needDraw)
            return;
        if (this._isCacheToBufferOn) {
            var currentId = this._currentID, locCmdBuffer = this._cacheToBufferCmds;
            var cmdList = locCmdBuffer[currentId];
            if (cmdList.indexOf(cmd) === -1)
                cmdList.push(cmd);
        } else {
            if (this._renderCmds.indexOf(cmd) === -1)
                this._renderCmds.push(cmd);
        }
    }
};
if (cc._renderType === cc._RENDER_TYPE_WEBGL)
    cc.renderer = cc.rendererWebGL;

cc.ParticleRenderCmdWebGL = function (node) {
    this._node = node;
};

cc.ParticleRenderCmdWebGL.prototype.rendering = function (ctx) {
    var _t = this._node;
    if (!_t._texture)
        return;

    var gl = ctx || cc._renderContext;

    _t._shaderProgram.use();
    _t._shaderProgram._setUniformForMVPMatrixWithMat4(_t._stackMatrix);//setUniformForModelViewAndProjectionMatrixWithMat4();

    cc.glBindTexture2D(_t._texture);
    cc.glBlendFuncForParticle(_t._blendFunc.src, _t._blendFunc.dst);

    //cc.assert(this._particleIdx == this.particleCount, "Abnormal error in particle quad");

    //
    // Using VBO without VAO
    //
    cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);

    gl.bindBuffer(gl.ARRAY_BUFFER, _t._buffersVBO[0]);
    gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0);               // vertices
    gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);          // colors
    gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 24, 16);            // tex coords

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _t._buffersVBO[1]);
    gl.drawElements(gl.TRIANGLES, _t._particleIdx * 6, gl.UNSIGNED_SHORT, 0);
};

cc.ArmatureRenderCmdWebGL = function (node) {
    this._node = node;
};

cc.ArmatureRenderCmdWebGL.prototype.rendering = function (ctx) {
    var _t = this._node;

    cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
    cc.kmGLPushMatrix();
    cc.kmGLLoadMatrix(_t._stackMatrix);

    //TODO REMOVE THIS FUNCTION
    if (_t._parentBone == null && _t._batchNode == null) {
        //        CC_NODE_DRAW_SETUP();
    }

    var locChildren = _t._children;
    var alphaPremultiplied = cc.BlendFunc.ALPHA_PREMULTIPLIED, alphaNonPremultipled = cc.BlendFunc.ALPHA_NON_PREMULTIPLIED;
    for (var i = 0, len = locChildren.length; i < len; i++) {
        var selBone = locChildren[i];
        if (selBone && selBone.getDisplayRenderNode) {
            var node = selBone.getDisplayRenderNode();

            if (null == node)
                continue;

            node.setShaderProgram(_t._shaderProgram);

            switch (selBone.getDisplayRenderNodeType()) {
                case ccs.DISPLAY_TYPE_SPRITE:
                    if (node instanceof ccs.Skin) {
                        node.updateTransform();

                        var func = selBone.getBlendFunc();
                        if (func.src != alphaPremultiplied.src || func.dst != alphaPremultiplied.dst)
                            node.setBlendFunc(selBone.getBlendFunc());
                        else {
                            if ((_t._blendFunc.src == alphaPremultiplied.src && _t._blendFunc.dst == alphaPremultiplied.dst)
                                && !node.getTexture().hasPremultipliedAlpha())
                                node.setBlendFunc(alphaNonPremultipled);
                            else
                                node.setBlendFunc(_t._blendFunc);
                        }
                        node.draw(ctx);
                    }
                    break;
                case ccs.DISPLAY_TYPE_ARMATURE:
                    node.draw(ctx);
                    break;
                default:
                    node.visit(ctx);                           //TODO need fix soon
                    break;
            }
        } else if (selBone instanceof cc.Node) {
            selBone.setShaderProgram(_t._shaderProgram);       //TODO need fix soon
            selBone.visit(ctx);
            //            CC_NODE_DRAW_SETUP();
        }
    }

    cc.kmGLPopMatrix();
};
//}
