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

cc.rendererWebGL = (function () {

function objEqual (a, b) {
    if (!a || !b) return false;

    for (var key in a) {
        if (!b[key] || a[key] !== b[key]) {
            return false;
        }
    }
    return true;
}

function removeByLastSwap (array, i) {
    if (array.length > 0) {
        array[i] = array[array.length - 1];
        array.length--;
    }
}

// Internal variables
    // Batching general informations
var _batchedInfo = {
        // Total vertex array buffer size, including vertex data and matrix data, in bytes
        totalBufferSize: 0,
        // All vertex data size for the current batch, in bytes
        totalVertexData: 0,
        // Index array size
        totalIndexSize: 0,
        // The batched texture, all batching element should have the same texture
        texture: null,
        // The batched blend source, all batching element should have the same blend source
        blendSrc: null,
        // The batched blend destination, all batching element should have the same blend destination
        blendDst: null,
        // The batched shader, all batching element should have the same shader
        shader: null
    },
    _batchedCount,
    _batchBuffer,
    _batchElementBuffer,
    _batchBufferPool = [],
    _pooledBuffer;

return {
    childrenOrderDirty: true,
    assignedZ: 0,
    assignedZStep: 1/10000,

    _transformNodePool: [],                              //save nodes transform dirty
    _renderCmds: [],                                     //save renderer commands

    _isCacheToBufferOn: false,                          //a switch that whether cache the rendererCmd to cacheToCanvasCmds
    _cacheToBufferCmds: {},                              // an array saves the renderer commands need for cache to other canvas
    _cacheInstanceIds: [],
    _currentID: 0,
    _clearColor: cc.color(),                            //background color,default BLACK

    getRenderCmd: function (renderableObject) {
        //TODO Add renderCmd pool here
        return renderableObject._createRenderCmd();
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
             locPool[i].updateStatus();
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

    clear: function () {
        var gl = cc._renderContext;
        gl.clearColor(this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearColor.a);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    },

    setDepthTest: function (enable){
        var gl = cc._renderContext;
        if(enable){
            gl.clearDepth(1.0);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
        }
        else{
            gl.disable(gl.DEPTH_TEST);
        }
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
    },

    // Auto batch implementation inspired from @Heishe 's PR
    // Ref: https://github.com/cocos2d/cocos2d-html5/pull/3248
    createBatchBuffer: function (bufferSize, indiceSize) {
        var arrayBuffer = gl.createBuffer();
        var elementBuffer = gl.createBuffer();

        this.initBatchBuffers(arrayBuffer, elementBuffer, bufferSize, indiceSize);

        return {arrayBuffer: arrayBuffer, elementBuffer: elementBuffer, bufferSize: bufferSize, indiceSize: indiceSize};
    },

    // Auto batch implementation inspired from @Heishe 's PR
    // Ref: https://github.com/cocos2d/cocos2d-html5/pull/3248
    initBatchBuffers: function (arrayBuffer, elementBuffer, bufferSize, indiceSize) {
        gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, bufferSize, gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indiceSize, gl.DYNAMIC_DRAW);
    },

    // Auto batch implementation inspired from @Heishe 's PR
    // Ref: https://github.com/cocos2d/cocos2d-html5/pull/3248

    // Returns an object with {arrayBuffer, elementBuffer, size}, 
    // where size denotes how many unit fit in the buffer (no need for bufferData if it's already big enough, bufferSubData enough)
    getBatchBuffer: function(bufferSize, indiceSize)
    {
        var pool = _batchBufferPool;

        if (pool.length <= 0) {
            return this.createBatchBuffer(bufferSize, indiceSize);
        }
        else {
            var minBuf = null;  //we also track the smallest found buffer because that one will be re-initialized and returned if no fitting buffer can be found
            var minSize = Number.MAX_VALUE; 
            var minBufIndex = -1;
            for (var i = pool.length - 1; i >= 0; --i) {
                var buf = pool[i];
                if (buf.bufferSize >= bufferSize && buf.indiceSize >= indiceSize) {
                    removeByLastSwap(pool, i);
                    this.initBatchBuffers(buf.arrayBuffer, buf.elementBuffer, bufferSize, indiceSize);
                    buf.bufferSize = bufferSize;
                    buf.indiceSize = indiceSize;
                    return buf;
                }

                if (buf.bufferSize < minSize)
                {
                    minSize = buf.bufferSize;
                    minBuf = buf;
                    minBufIndex = i;
                }
            }

            // we only get here if no properly sized buffer was found
            // in that case, take smallest buffer in pool, resize it and return it
            removeByLastSwap(pool, minBufIndex);
            this.initBatchBuffers(minBuf.arrayBuffer, minBuf.elementBuffer, bufferSize, indiceSize);
            minBuf.bufferSize = bufferSize;
            minBuf.indiceSize = indiceSize;
            return minBuf;
        }
    },

    // Auto batch implementation inspired from @Heishe 's PR
    // Ref: https://github.com/cocos2d/cocos2d-html5/pull/3248
    storeBatchBuffer: function(buffer) {
        var pool = _batchBufferPool;
        pool.push(buffer);
    },

    // Auto batch implementation inspired from @Heishe 's PR
    // Ref: https://github.com/cocos2d/cocos2d-html5/pull/3248
    // Forward search commands that can be batched together
    _forwardBatch: function (first) {
        var renderCmds = this._renderCmds,
            cmd = renderCmds[first];
        if (!cmd || !cmd._supportBatch) return 0;

        var info = {}, last;

        // Initialize batched info
        cmd.getBatchInfo(_batchedInfo);
        _batchedInfo.totalVertexData = 0;
        _batchedInfo.totalBufferSize = 0;
        _batchedInfo.totalIndexSize = 0;

        // Forward search and collect batch informations
        for (last = first; last < renderCmds.length; ++last) {
            cmd = renderCmds[last];
            if (cmd._supportBatch) {
                cmd.getBatchInfo(info);
            }
            else {
                break;
            }
            // Batch info don't match, break batching
            if (!objEqual(info, _batchedInfo)) {
                break;
            }
            else {
                _batchedInfo.totalVertexData += cmd.vertexBytesPerUnit;
                _batchedInfo.totalBufferSize += cmd.bytesPerUnit;
                _batchedInfo.totalIndexSize += cmd.indicesPerUnit;
            }
        }

        var count = last - first;
        // Can't batch, fall back to original render command
        if (count <= 1) {
            return count;
        }

        _batchedCount = count;

        var bufferSize = _batchedInfo.totalBufferSize;
        var indiceSize = _batchedInfo.totalIndexSize * 2; // *2 because we use shorts for indices
        _pooledBuffer = this.getBatchBuffer(bufferSize, indiceSize);
        _batchBuffer = _pooledBuffer.arrayBuffer;
        _batchElementBuffer = _pooledBuffer.elementBuffer;

        //all of the divisions by 4 are just because we work with uint32arrays instead of uint8 arrays so all indexes need to be shortened by the factor of 4
        var totalVertexData = _batchedInfo.totalVertexData / 4;
        var totalBufferSize = _batchedInfo.totalBufferSize / 4;
        var vertexDataOffset = 0;
        var matrixDataOffset = 0;

        var uploadBuffer = new Uint32Array(totalBufferSize);

        // Bind vertex data buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, _batchBuffer);

        // Fill in vertex data command by command
        var i;
        for (i = first; i < last; ++i) {
            cmd = renderCmds[i];
            cmd.batchVertexBuffer(uploadBuffer, vertexDataOffset, totalVertexData, matrixDataOffset);

            vertexDataOffset += cmd.vertexBytesPerUnit / 4;
            matrixDataOffset += cmd.matrixBytesPerUnit / 4;
        }

        // Submit vertex data in one bufferSubData call
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, uploadBuffer);

        // Bind element buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _batchElementBuffer);

        var indices = new Uint16Array(_batchedInfo.totalIndexSize);

        // Fill in element buffer command by command
        var currentVertex = 0;
        var index = 0;
        for (i = first; i < last; ++i) {
            cmd = renderCmds[i];
            cmd.batchIndexBuffer(indices, index, currentVertex);

            currentVertex += cmd.verticesPerUnit;
            index += cmd.indicesPerUnit;
        }

        gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, indices);
        return count;
    },

    // Auto batch implementation inspired from @Heishe 's PR
    // Ref: https://github.com/cocos2d/cocos2d-html5/pull/3248
    // Batch rendering using result collected in `_forwardBatch`
    _batchRendering: function () {
        // var node = this._node;
        var texture = _batchedInfo.texture;
        var shader = _batchedInfo.shader;
        var count = _batchedCount;

        var bytesPerRow = 16; //4 floats with 4 bytes each
        var totalVertexBytes = _batchedInfo.totalVertexData;

        shader.use();
        shader._updateProjectionUniform();

        cc.glBlendFunc(_batchedInfo.blendSrc, _batchedInfo.blendDst);
        cc.glBindTexture2DN(0, texture);                   // = cc.glBindTexture2D(texture);

        gl.bindBuffer(gl.ARRAY_BUFFER, _batchBuffer);

        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);

        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);                   //cc.VERTEX_ATTRIB_POSITION
        gl.vertexAttribPointer(1, 4, gl.UNSIGNED_BYTE, true, 24, 12);           //cc.VERTEX_ATTRIB_COLOR
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 24, 16);                  //cc.VERTEX_ATTRIB_TEX_COORDS
        
        var i;
        // Enable matrix vertex attribs row by row (vec4 * 4)
        for (i = 0; i < 4; ++i) {
            gl.enableVertexAttribArray(cc.VERTEX_ATTRIB_MVMAT0 + i);
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_MVMAT0 + i, 4, gl.FLOAT, false, bytesPerRow * 4, totalVertexBytes + bytesPerRow * i); //stride is one row
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _batchElementBuffer);
        gl.drawElements(gl.TRIANGLES, _batchedInfo.totalIndexSize, gl.UNSIGNED_SHORT, 0);

        for (i = 0; i < 4; ++i) {
            gl.disableVertexAttribArray(cc.VERTEX_ATTRIB_MVMAT0 + i);
        }

        this.storeBatchBuffer(_pooledBuffer);

        cc.g_NumberOfDraws++;
    },

    /**
     * drawing all renderer command to context (default is cc._renderContext)
     * @param {WebGLRenderingContext} [ctx=cc._renderContext]
     */
    rendering: function (ctx) {
        var locCmds = this._renderCmds,
            i, len, cmd,
            context = ctx || cc._renderContext;

        for (i = 0, len = locCmds.length; i < len; i++) {
            cmd = locCmds[i];
            
            // Batching or direct rendering
            var batchCount = this._forwardBatch(i);
            if (batchCount > 1) {
                this._batchRendering();
                // i will increase by 1 each loop
                i += batchCount - 1;
            }
            else {
                cmd.rendering(context);
            }
        }
    }
};
})();