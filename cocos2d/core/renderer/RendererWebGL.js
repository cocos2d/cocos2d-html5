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

    //LayerColor renderer command
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
}
