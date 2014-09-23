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

if(cc._renderType === cc._RENDER_TYPE_WEBGL){
    cc.rendererWebGL = {
        childrenOrderDirty: true,
        _transformNodePool: [],                              //save nodes transform dirty
        _renderCmds: [],                                     //save renderer commands

        _isCacheToCanvasOn: false,                          //a switch that whether cache the rendererCmd to cacheToCanvasCmds
        _cacheToCanvasCmds: [],                              // an array saves the renderer commands need for cache to other canvas

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
                if (locPool[i]._renderCmdDiry)        //TODO need modify name for LabelTTF
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
            if (this._isCacheToCanvasOn) {
                if (this._cacheToCanvasCmds.indexOf(cmd) === -1)
                    this._cacheToCanvasCmds.push(cmd);
            } else {
                if (this._renderCmds.indexOf(cmd) === -1)
                    this._renderCmds.push(cmd);
            }
        }
    };
    cc.renderer = cc.rendererWebGL;

    //sprite renderer command
    cc.TextureRenderCmdWebGL = function(node){
        this._node = node;
    };

    cc.TextureRenderCmdWebGL.prototype.rendering = function(ctx){
        var _t = this._node;
        if (!_t._textureLoaded)
            return;

        var gl = ctx || cc._renderContext, locTexture = _t._texture;
        //cc.assert(!_t._batchNode, "If cc.Sprite is being rendered by cc.SpriteBatchNode, cc.Sprite#draw SHOULD NOT be called");

        if (locTexture) {
            if (locTexture._isLoaded) {
                _t._shaderProgram.use();
                _t._shaderProgram._setUniformForMVPMatrixWithMat4(_t._stackMatrix);

                cc.glBlendFunc(_t._blendFunc.src, _t._blendFunc.dst);
                //optimize performance for javascript
                cc.glBindTexture2DN(0, locTexture);                   // = cc.glBindTexture2D(locTexture);
                cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);

                gl.bindBuffer(gl.ARRAY_BUFFER, _t._quadWebBuffer);
                if (_t._quadDirty) {
                    gl.bufferData(gl.ARRAY_BUFFER, _t._quad.arrayBuffer, gl.DYNAMIC_DRAW);
                    _t._quadDirty = false;
                }
                gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);                   //cc.VERTEX_ATTRIB_POSITION
                gl.vertexAttribPointer(1, 4, gl.UNSIGNED_BYTE, true, 24, 12);           //cc.VERTEX_ATTRIB_COLOR
                gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 24, 16);                  //cc.VERTEX_ATTRIB_TEX_COORDS

                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            }
        } else {
            _t._shaderProgram.use();
            _t._shaderProgram._setUniformForMVPMatrixWithMat4(_t._stackMatrix);

            cc.glBlendFunc(_t._blendFunc.src, _t._blendFunc.dst);
            cc.glBindTexture2D(null);

            cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_COLOR);

            gl.bindBuffer(gl.ARRAY_BUFFER, _t._quadWebBuffer);
            if (_t._quadDirty) {
                gl.bufferData(gl.ARRAY_BUFFER, _t._quad.arrayBuffer, gl.STATIC_DRAW);
                _t._quadDirty = false;
            }
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0);
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        cc.g_NumberOfDraws++;
    };

    //LayerColor render command
    cc.RectRenderCmdWebGL = function(node){
        this._node = node;
    };

    cc.RectRenderCmdWebGL.prototype.rendering = function(ctx){
        var context = ctx || cc._renderContext;
        var node = this._node;

        node._shaderProgram.use();
        node._shaderProgram._setUniformForMVPMatrixWithMat4(node._stackMatrix);
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_COLOR);

        //
        // Attributes
        //
        context.bindBuffer(context.ARRAY_BUFFER, node._verticesFloat32Buffer);
        context.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, context.FLOAT, false, 0, 0);

        context.bindBuffer(context.ARRAY_BUFFER, node._colorsUint8Buffer);
        context.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, context.UNSIGNED_BYTE, true, 0, 0);

        cc.glBlendFunc(node._blendFunc.src, node._blendFunc.dst);
        context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
    };

    cc.DrawNodeRenderCmdWebGL = function (node) {
        this._node = node;
    };

    cc.DrawNodeRenderCmdWebGL.prototype.rendering = function(ctx){
        var _t = this._node;
        cc.glBlendFunc(_t._blendFunc.src, _t._blendFunc.dst);
        _t._shaderProgram.use();
        _t._shaderProgram.setUniformsForBuiltins();
        _t._render();
    };

    cc.MontionStreakCmdWebGL = function(node){
        this._node = node;
    };

    cc.MontionStreakCmdWebGL.prototype.rendering = function(ctx){
        var _t = this._node;
        if (_t._nuPoints <= 1)
            return;

        if(_t.texture && _t.texture.isLoaded()){
            ctx = ctx || cc._renderContext;
            cc.nodeDrawSetup(_t);
            cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);
            cc.glBlendFunc(_t._blendFunc.src, _t._blendFunc.dst);

            cc.glBindTexture2D(_t.texture);

            //position
            ctx.bindBuffer(ctx.ARRAY_BUFFER, _t._verticesBuffer);
            ctx.bufferData(ctx.ARRAY_BUFFER, _t._vertices, ctx.DYNAMIC_DRAW);
            ctx.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, ctx.FLOAT, false, 0, 0);

            //texcoords
            ctx.bindBuffer(ctx.ARRAY_BUFFER, _t._texCoordsBuffer);
            ctx.bufferData(ctx.ARRAY_BUFFER, _t._texCoords, ctx.DYNAMIC_DRAW);
            ctx.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, ctx.FLOAT, false, 0, 0);

            //colors
            ctx.bindBuffer(ctx.ARRAY_BUFFER, _t._colorPointerBuffer);
            ctx.bufferData(ctx.ARRAY_BUFFER, _t._colorPointer, ctx.DYNAMIC_DRAW);
            ctx.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, ctx.UNSIGNED_BYTE, true, 0, 0);

            ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, _t._nuPoints * 2);
            cc.g_NumberOfDraws ++;
        }
    };

    cc.ProgressRenderCmdWebGL = function (node) {
        this._node = node;
    };

    cc.ProgressRenderCmdWebGL.prototype.rendering = function(ctx){
        var _t = this._node;
        var context = ctx || cc._renderContext;
        if (!_t._vertexData || !_t._sprite)
            return;

        _t._shaderProgram.use();
        _t._shaderProgram._setUniformForMVPMatrixWithMat4(_t._stackMatrix);

        var blendFunc = _t._sprite.getBlendFunc();
        cc.glBlendFunc(blendFunc.src, blendFunc.dst);
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);

        cc.glBindTexture2D(_t._sprite.texture);

        context.bindBuffer(context.ARRAY_BUFFER, _t._vertexWebGLBuffer);
        if(_t._vertexDataDirty){
            context.bufferData(context.ARRAY_BUFFER, _t._vertexArrayBuffer, context.DYNAMIC_DRAW);
            _t._vertexDataDirty = false;
        }
        var locVertexDataLen = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT;
        context.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, context.FLOAT, false, locVertexDataLen, 0);
        context.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, context.UNSIGNED_BYTE, true, locVertexDataLen, 8);
        context.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, context.FLOAT, false, locVertexDataLen, 12);

        if (_t._type === cc.ProgressTimer.TYPE_RADIAL)
            context.drawArrays(context.TRIANGLE_FAN, 0, _t._vertexDataCount);
        else if (_t._type == cc.ProgressTimer.TYPE_BAR) {
            if (!_t._reverseDirection)
                context.drawArrays(context.TRIANGLE_STRIP, 0, _t._vertexDataCount);
            else {
                context.drawArrays(context.TRIANGLE_STRIP, 0, _t._vertexDataCount / 2);
                context.drawArrays(context.TRIANGLE_STRIP, 4, _t._vertexDataCount / 2);
                // 2 draw calls
                cc.g_NumberOfDraws++;
            }
        }
        cc.g_NumberOfDraws++;
    };

    cc.ParticleRenderCmdWebGL = function(node){
        this._node = node;
    };

    cc.ParticleRenderCmdWebGL.prototype.rendering = function(ctx){
        var _t = this._node;
        if(!_t._texture)
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

    //RenderTexture render command
    cc.RenderTextureRenderCmdWebGL = function(node){
        this._node = node;
    };

    cc.RenderTextureRenderCmdWebGL.prototype.rendering = function(ctx){
        var gl = ctx || cc._renderContext;
        var node = this._node;
        if (node.autoDraw) {
            node.begin();

            var locClearFlags = this.clearFlags;
            if (locClearFlags) {
                var oldClearColor = [0.0, 0.0, 0.0, 0.0];
                var oldDepthClearValue = 0.0;
                var oldStencilClearValue = 0;

                // backup and set
                if (locClearFlags & gl.COLOR_BUFFER_BIT) {
                    oldClearColor = gl.getParameter(gl.COLOR_CLEAR_VALUE);
                    gl.clearColor(node._clearColor.r/255, node._clearColor.g/255, node._clearColor.b/255, node._clearColor.a/255);
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

    cc.SpriteBatchNodeRenderCmdWebGL = function(node){
        this._node = node;
    };

    cc.SpriteBatchNodeRenderCmdWebGL.prototype.rendering = function(ctx){
        var node = this._node;
        if (node.textureAtlas.totalQuads === 0)
            return;

        //cc.nodeDrawSetup(this);
        node._shaderProgram.use();
        node._shaderProgram._setUniformForMVPMatrixWithMat4(node._stackMatrix);
        node._arrayMakeObjectsPerformSelector(node._children, cc.Node._StateCallbackType.updateTransform);
        cc.glBlendFunc(node._blendFunc.src, node._blendFunc.dst);

        node.textureAtlas.drawQuads();
    };

    cc.AtlasNodeRenderCmdWebGL = function(node){
        this._node = node;
    };

    cc.AtlasNodeRenderCmdWebGL.prototype.rendering = function(ctx){
        var context = ctx || cc._renderContext, node = this._node;

        node._shaderProgram.use();
        node._shaderProgram._setUniformForMVPMatrixWithMat4(node._stackMatrix);

        cc.glBlendFunc(node._blendFunc.src, node._blendFunc.dst);
        if(node._uniformColor && node._colorF32Array){
            context.uniform4fv(node._uniformColor, node._colorF32Array);
            node.textureAtlas.drawNumberOfQuads(node.quadsToDraw, 0);
        }
    };

    cc.CustomRenderCmdWebGL = function(node, func){
        this._node = node;
        this._callback = func;
    };

    cc.CustomRenderCmdWebGL.prototype.rendering = function(ctx){
        if(!this._callback)
            return;
        this._callback.call(this.node, ctx);
    };
}
