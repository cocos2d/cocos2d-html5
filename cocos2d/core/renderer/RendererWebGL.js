/****************************************************************************
 Copyright (c) 2013-2016 Chukong Technologies Inc.

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

cc.rendererWebGL = (function () {

// Internal variables
    // Batching general informations
var _batchedInfo = {
        // The batched texture, all batching element should have the same texture
        texture: null,
        // The batched blend source, all batching element should have the same blend source
        blendSrc: null,
        // The batched blend destination, all batching element should have the same blend destination
        blendDst: null,
        // The batched shader, all batching element should have the same shader
        shader: null
    },

    _quadIndexBuffer = null,
    _quadVertexBuffer = null,
    // Total vertex size
    _vertexSize = 0,
    // Current batching vertex size
    _batchingSize = 0,
    _sizePerVertex = 6,
    // buffer data and views
    _vertexData = null,
    _vertexDataSize = 0,
    _vertexDataF32 = null,
    _vertexDataUI32 = null,
    _IS_IOS = false;


// Inspired from @Heishe's gotta-batch-them-all branch
// https://github.com/Talisca/cocos2d-html5/commit/de731f16414eb9bcaa20480006897ca6576d362c
function updateQuadBuffer (numQuads) {
    var gl = cc._renderContext;
    // Update index buffer and fill up
    if (_quadIndexBuffer) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _quadIndexBuffer);

        var indices = new Uint16Array(numQuads * 6);
        var currentQuad = 0;
        for (var i = 0, len = numQuads * 6; i < len; i += 6) {
            indices[i] = currentQuad + 0;
            indices[i + 1] = currentQuad + 1;
            indices[i + 2] = currentQuad + 2;
            indices[i + 3] = currentQuad + 1;
            indices[i + 4] = currentQuad + 2;
            indices[i + 5] = currentQuad + 3;
            currentQuad += 4;
        }
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    }

    if (_quadVertexBuffer) {
        _vertexDataSize = numQuads * 4 * _sizePerVertex;
        var byteLength = _vertexDataSize * 4;
        _vertexData = new ArrayBuffer(byteLength);
        _vertexDataF32 = new Float32Array(_vertexData);
        _vertexDataUI32 = new Uint32Array(_vertexData);
        // Init buffer data
        gl.bindBuffer(gl.ARRAY_BUFFER, _quadVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, _vertexDataF32, gl.DYNAMIC_DRAW);
    }
    _vertexSize = numQuads * 4;
}

// Inspired from @Heishe's gotta-batch-them-all branch
// https://github.com/Talisca/cocos2d-html5/commit/de731f16414eb9bcaa20480006897ca6576d362c
function initQuadBuffer (numQuads) {
    var gl = cc._renderContext;
    if (_quadIndexBuffer === null) {
        // TODO do user need to release the memory ?
        _quadVertexBuffer = gl.createBuffer();
        _quadIndexBuffer = gl.createBuffer();

        updateQuadBuffer(numQuads);
    }
    else {
        updateQuadBuffer(numQuads);
    }
}

return {
    mat4Identity: null,

    childrenOrderDirty: true,
    assignedZ: 0,
    assignedZStep: 1 / 100,

    _transformNodePool: [],                              //save nodes transform dirty
    _renderCmds: [],                                     //save renderer commands

    _isCacheToBufferOn: false,                          //a switch that whether cache the rendererCmd to cacheToCanvasCmds
    _cacheToBufferCmds: {},                              // an array saves the renderer commands need for cache to other canvas
    _cacheInstanceIds: [],
    _currentID: 0,
    _clearColor: cc.color(),                            //background color,default BLACK

    init: function () {
        var gl = cc._renderContext;
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.DEPTH_TEST);

        this.mat4Identity = new cc.math.Matrix4();
        this.mat4Identity.identity();
        initQuadBuffer(500);
        if (cc.sys.os === cc.sys.OS_IOS) {
            _IS_IOS = true;
        }
    },

    getVertexSize: function () {
        return _vertexSize;
    },

    getRenderCmd: function (renderableObject) {
        //TODO Add renderCmd pool here
        return renderableObject._createRenderCmd();
    },

    _turnToCacheMode: function (renderTextureID) {
        this._isCacheToBufferOn = true;
        renderTextureID = renderTextureID || 0;
        if (!this._cacheToBufferCmds[renderTextureID]) {
            this._cacheToBufferCmds[renderTextureID] = [];
        }
        else {
            this._cacheToBufferCmds[renderTextureID].length = 0;
        }
        if (this._cacheInstanceIds.indexOf(renderTextureID) === -1) {
            this._cacheInstanceIds.push(renderTextureID);
        }
        this._currentID = renderTextureID;
    },

    _turnToNormalMode: function () {
        this._isCacheToBufferOn = false;
    },

    _removeCache: function (instanceID) {
        instanceID = instanceID || this._currentID;
        var cmds = this._cacheToBufferCmds[instanceID];
        if (cmds) {
            cmds.length = 0;
            delete this._cacheToBufferCmds[instanceID];
        }

        var locIDs = this._cacheInstanceIds;
        cc.arrayRemoveObject(locIDs, instanceID);
    },

    /**
     * drawing all renderer command to cache canvas' context
     * @param {Number} [renderTextureId]
     */
    _renderingToBuffer: function (renderTextureId) {
        renderTextureId = renderTextureId || this._currentID;
        var locCmds = this._cacheToBufferCmds[renderTextureId];
        var ctx = cc._renderContext;
        this.rendering(ctx, locCmds);
        this._removeCache(renderTextureId);

        var locIDs = this._cacheInstanceIds;
        if (locIDs.length === 0)
            this._isCacheToBufferOn = false;
        else
            this._currentID = locIDs[locIDs.length - 1];
    },

    //reset renderer's flag
    resetFlag: function () {
        if (this.childrenOrderDirty) {
            this.childrenOrderDirty = false;
        }
        this._transformNodePool.length = 0;
    },

    //update the transform data
    transform: function () {
        var locPool = this._transformNodePool;
        //sort the pool
        locPool.sort(this._sortNodeByLevelAsc);
        //transform node
        var i, len, cmd;
        for (i = 0, len = locPool.length; i < len; i++) {
            cmd = locPool[i];
            cmd.updateStatus();
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
        // Copy previous command list for late check in rendering
        this._renderCmds.length = 0;
    },

    clear: function () {
        var gl = cc._renderContext;
        gl.clearColor(this._clearColor.r / 255, this._clearColor.g / 255, this._clearColor.b / 255, this._clearColor.a / 255);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    },

    setDepthTest: function (enable) {
        var gl = cc._renderContext;
        if (enable) {
            gl.clearDepth(1.0);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
        }
        else {
            gl.disable(gl.DEPTH_TEST);
        }
    },
    
    pushRenderCommand: function (cmd) {
        if (!cmd.needDraw())
            return;
        if (this._isCacheToBufferOn) {
            var currentId = this._currentID, locCmdBuffer = this._cacheToBufferCmds;
            var cmdList = locCmdBuffer[currentId];
            if (cmdList.indexOf(cmd) === -1)
                cmdList.push(cmd);
        } else {
            if (this._renderCmds.indexOf(cmd) === -1) {
                this._renderCmds.push(cmd);
            }
        }
    },

    _increaseBatchingSize: function (increment) {
        _batchingSize += increment;
    },

    _uploadBufferData: function (cmd) {
        if (_batchingSize >= _vertexSize) {
            this._batchRendering();
        }

        // Check batching
        var node = cmd._node;
        var texture = node._texture || (node._spriteFrame ? node._spriteFrame._texture : null);
        if (!texture) {
            return;
        }
        var blendSrc = node._blendFunc.src;
        var blendDst = node._blendFunc.dst;
        var shader = cmd._shaderProgram;
        if (_batchedInfo.texture !== texture ||
            _batchedInfo.blendSrc !== blendSrc ||
            _batchedInfo.blendDst !== blendDst ||
            _batchedInfo.shader !== shader) {
            // Draw batched elements
            this._batchRendering();
            // Update _batchedInfo
            _batchedInfo.texture = texture;
            _batchedInfo.blendSrc = blendSrc;
            _batchedInfo.blendDst = blendDst;
            _batchedInfo.shader = shader;
        }

        // Upload vertex data
        var len = cmd.uploadData(_vertexDataF32, _vertexDataUI32, _batchingSize * _sizePerVertex);
        if (len > 0) {
            _batchingSize += len;
        }
    },

    _batchRendering: function () {
        if (_batchingSize === 0 || !_batchedInfo.texture) {
            return;
        }

        var gl = cc._renderContext;
        var texture = _batchedInfo.texture;
        var shader = _batchedInfo.shader;
        var count = _batchingSize / 4;

        if (shader) {
            shader.use();
            shader._updateProjectionUniform();
        }

        cc.glBlendFunc(_batchedInfo.blendSrc, _batchedInfo.blendDst);
        cc.glBindTexture2DN(0, texture);                   // = cc.glBindTexture2D(texture);

        gl.bindBuffer(gl.ARRAY_BUFFER, _quadVertexBuffer);
        // upload the vertex data to the gl buffer
        if (_batchingSize > _vertexSize * 0.5) {
            gl.bufferData(gl.ARRAY_BUFFER, _vertexDataF32, gl.DYNAMIC_DRAW);
        }
        else {
            var view = _vertexDataF32.subarray(0, _batchingSize * _sizePerVertex);
            gl.bufferData(gl.ARRAY_BUFFER, view, gl.DYNAMIC_DRAW);
        }

        gl.enableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION);
        gl.enableVertexAttribArray(cc.VERTEX_ATTRIB_COLOR);
        gl.enableVertexAttribArray(cc.VERTEX_ATTRIB_TEX_COORDS);
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0);
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 24, 16);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _quadIndexBuffer);
        gl.drawElements(gl.TRIANGLES, count * 6, gl.UNSIGNED_SHORT, 0);

        cc.g_NumberOfDraws++;

        _batchingSize = 0;
    },

    /**
     * drawing all renderer command to context (default is cc._renderContext)
     * @param {WebGLRenderingContext} [ctx=cc._renderContext]
     */
    rendering: function (ctx, cmds) {
        var locCmds = cmds || this._renderCmds,
            i, len, cmd, next, batchCount,
            context = ctx || cc._renderContext;

        // Reset buffer for rendering
        context.bindBuffer(gl.ARRAY_BUFFER, null);

        for (i = 0, len = locCmds.length; i < len; ++i) {
            cmd = locCmds[i];

            if (cmd.uploadData) {
                this._uploadBufferData(cmd);
            }
            else {
                if (_batchingSize > 0) {
                    this._batchRendering();
                }
                cmd.rendering(context);
            }
        }
        this._batchRendering();
        _batchedInfo.texture = null;
    }
};
})();
