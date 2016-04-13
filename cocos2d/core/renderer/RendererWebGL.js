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

function removeByLastSwap (array, i) {
    if (array.length > 0) {
        array[i] = array[array.length - 1];
        array.length--;
    }
}

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
    // to compare with the batched info
    _currentInfo = {
        texture: null,
        blendSrc: null,
        blendDst: null,
        shader: null
    },
    // The current virtual buffer
    _currentBuffer = null,
    _batchBufferPool = [],
    _virtualBuffers = [],
    _needUpdateBuffer = true;

function createVirtualBuffer (buffer, vertexOffset, matrixOffset, indexOffset, totalBufferSize, totalIndexSize, count) {
    var data = new Uint32Array(totalBufferSize / 4);
    var vBuf = {
        // The object contains real WebGL buffers, it's created or retrieved via getBatchBuffer
        buffer: buffer,
        // The vertex data array (Uint32Array)
        dataArray: data,
        // The start offset in the vertex buffer, in bytes
        vertexOffset: vertexOffset,
        // The start offset of matrix data in the vertex buffer, in bytes
        matrixOffset: matrixOffset,
        // The start offset in the index buffer
        indexOffset: indexOffset,
        // Total vertex array buffer size, including vertex data and matrix data, in bytes
        totalBufferSize: totalBufferSize,
        // Index array size
        totalIndexSize: totalIndexSize,
        // Render command count
        count: count
    };

    _virtualBuffers.push(vBuf);
    return vBuf;
}

function clearVirtualBuffers () {
    for (var i = _virtualBuffers.length-1; i >= 0; --i) {
        var vbuffer = _virtualBuffers[i];
        _batchBufferPool.push(vbuffer.buffer);
        vbuffer.buffer = null;
        vbuffer.dataArray = null;
    }
    _virtualBuffers.length = 0;
}

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
        // Straight forward buffer update logic, order dirty then update
        if (this.childrenOrderDirty) {
            _needUpdateBuffer = true;
        }
        this.childrenOrderDirty = false;
        this._transformNodePool.length = 0;
    },

    //update the transform data
    transform: function () {
        var locPool = this._transformNodePool;
        //sort the pool
        locPool.sort(this._sortNodeByLevelAsc);
        //transform node
        var i, len, cmd, currVBuffer, totalVertexData;
        for (i = 0, len = locPool.length; i < len; i++) {
            cmd = locPool[i];
            cmd.updateStatus();

            if (cmd._vBuffer && cmd._vBuffer.buffer) {
                if (currVBuffer !== cmd._vBuffer) {
                    // Send previous buffer to WebGLBuffer
                    if (currVBuffer) {
                        gl.bufferSubData(gl.ARRAY_BUFFER, 0, currVBuffer.dataArray);
                    }
                    // Bind buffer
                    currVBuffer = cmd._vBuffer;
                    totalVertexData = currVBuffer.matrixOffset / 4;
                    gl.bindBuffer(gl.ARRAY_BUFFER, currVBuffer.buffer.arrayBuffer);
                }
                cmd.batchVertexBuffer(currVBuffer.dataArray, cmd._vertexOffset, totalVertexData, cmd._matrixOffset);
            }
            // Ugly work around for Node type like Scale9Sprite
            else if (cmd._customUpdateBuffer) {
                currVBuffer = cmd._customUpdateBuffer(currVBuffer);
            }
        }
        // Send last buffer to WebGLBuffer
        if (currVBuffer) {
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, currVBuffer.dataArray);
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
    createBatchBuffer: function (bufferSize, indexSize) {
        var arrayBuffer = gl.createBuffer();
        var elementBuffer = gl.createBuffer();

        this.initBatchBuffers(arrayBuffer, elementBuffer, bufferSize, indexSize);

        return {arrayBuffer: arrayBuffer, elementBuffer: elementBuffer, bufferSize: bufferSize, indexSize: indexSize};
    },

    // Auto batch implementation inspired from @Heishe 's PR
    // Ref: https://github.com/cocos2d/cocos2d-html5/pull/3248
    initBatchBuffers: function (arrayBuffer, elementBuffer, bufferSize, indexSize) {
        gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, bufferSize, gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexSize, gl.DYNAMIC_DRAW);
    },

    // Auto batch implementation inspired from @Heishe 's PR
    // Ref: https://github.com/cocos2d/cocos2d-html5/pull/3248

    // Returns an object with {arrayBuffer, elementBuffer, size}, 
    // where size denotes how many unit fit in the buffer (no need for bufferData if it's already big enough, bufferSubData enough)
    getBatchBuffer: function(bufferSize, indexSize)
    {
        if (_batchBufferPool.length <= 0) {
            return this.createBatchBuffer(bufferSize, indexSize);
        }

        var minBuf = null;  //we also track the smallest found buffer because that one will be re-initialized and returned if no fitting buffer can be found
        var minSize = Number.MAX_VALUE; 
        var minBufIndex = -1;
        for (var i = _batchBufferPool.length - 1; i >= 0; --i) {
            var buf = _batchBufferPool[i];
            // Find available buffer with suitable size
            if (buf.bufferSize >= bufferSize && buf.indexSize >= indexSize) {
                removeByLastSwap(_batchBufferPool, i);
                this.initBatchBuffers(buf.arrayBuffer, buf.elementBuffer, bufferSize, indexSize);
                buf.bufferSize = bufferSize;
                buf.indexSize = indexSize;
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
        removeByLastSwap(_batchBufferPool, minBufIndex);
        this.initBatchBuffers(minBuf.arrayBuffer, minBuf.elementBuffer, bufferSize, indexSize);
        minBuf.bufferSize = bufferSize;
        minBuf.indexSize = indexSize;
        return minBuf;
    },

    // Forward search commands that are in the same virtual buffer, 
    // If size match then no problem to render
    // Otherwise, the virtual buffer need to be updated
    _forwardCheck: function (first) {
        var renderCmds = this._renderCmds,
            cmd = renderCmds[first],
            last = first + 1, length = renderCmds.length,
            vbuffer = cmd._vBuffer;

        // A simple solution temporarily
        cmd.getBatchInfo(_batchedInfo);
        _currentBuffer = vbuffer;
        return vbuffer.count;

        for (; last < length; ++last) {
            cmd = renderCmds[last];
            if (vbuffer !== cmd._vBuffer) {
                break;
            }
        }

        var size = last - first;
        // no problem
        if (vbuffer.count === size) {
            return size;
        }
        // New render commands have been inserted, 
        // need to create new virtual buffer for the current frame
        // and if the inserted command can be batched, mark _needUpdateBuffer as true
        // because we need to update the buffers by rerun _forwardBatch
        else if (vbuffer.count > size) {

        }
        // Render commands removed
        // need to split virtual buffer into separate parts without touch the buffer itself
        else {

        }
    },

    // Auto batch implementation inspired from @Heishe 's PR
    // Ref: https://github.com/cocos2d/cocos2d-html5/pull/3248
    // Forward search commands that can be batched together
    _forwardBatch: function (first) {
        var renderCmds = this._renderCmds,
            cmd = renderCmds[first],
            last = first + 1, length = renderCmds.length;

        if (!cmd || !cmd._supportBatch)
            return 0;

        // Initialize batched info
        cmd.getBatchInfo(_batchedInfo);
        var matrixOffset = cmd.vertexBytesPerUnit;
        var totalBufferSize = cmd.bytesPerUnit;
        var totalIndexSize = cmd.indicesPerUnit;

        // Forward search and collect batch informations
        cmd = renderCmds[last];
        while (cmd) {
            if (cmd._supportBatch) {
                cmd.getBatchInfo(_currentInfo);
            }
            else {
                break;
            }
            // Batch info don't match, break batching
            if (_currentInfo.texture !== _batchedInfo.texture ||
                _currentInfo.blendSrc !== _batchedInfo.blendSrc ||
                _currentInfo.blendDst !== _batchedInfo.blendDst ||
                _currentInfo.shader !== _batchedInfo.shader) {
                break;
            }
            else {
                matrixOffset += cmd.vertexBytesPerUnit;
                totalBufferSize += cmd.bytesPerUnit;
                totalIndexSize += cmd.indicesPerUnit;
            }
            ++last;
            cmd = renderCmds[last];
        }

        var count = last - first;
        // Can't batch, fall back to original render command
        if (count <= 1) {
            return count;
        }

        var buffer = this.getBatchBuffer(totalBufferSize, totalIndexSize * 2); // *2 because we use shorts for indices

        // Create a virtual buffer
        var vbuffer = createVirtualBuffer(buffer, 
                                          0, 
                                          matrixOffset, 
                                          0, 
                                          totalBufferSize, 
                                          totalIndexSize, 
                                          count);
        _currentBuffer = vbuffer;
        var uploadBuffer = vbuffer.dataArray;

        //all of the divisions by 4 are just because we work with uint32arrays instead of uint8 arrays so all indexes need to be shortened by the factor of 4
        var totalVertexData = matrixOffset / 4;
        var totalBufferData = totalBufferSize / 4;
        var vertexDataOffset = 0;
        var matrixDataOffset = 0;

        // Bind vertex data buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer.buffer.arrayBuffer);

        // Fill in vertex data command by command
        var i;
        for (i = first; i < last; ++i) {
            cmd = renderCmds[i];
            cmd.batchVertexBuffer(uploadBuffer, vertexDataOffset, totalVertexData, matrixDataOffset);

            cmd._vBuffer = vbuffer;
            cmd._vertexOffset = vertexDataOffset;
            cmd._matrixOffset = matrixDataOffset;

            vertexDataOffset += cmd.vertexBytesPerUnit / 4;
            matrixDataOffset += cmd.matrixBytesPerUnit / 4;
        }

        // Submit vertex data in one bufferSubData call
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, uploadBuffer);

        // Bind element buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbuffer.buffer.elementBuffer);

        var indices = new Uint16Array(totalIndexSize);

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
        var count = _currentBuffer.count;

        var bytesPerRow = 16; //4 floats with 4 bytes each

        shader.use();
        shader._updateProjectionUniform();

        cc.glBlendFunc(_batchedInfo.blendSrc, _batchedInfo.blendDst);
        cc.glBindTexture2DN(0, texture);                   // = cc.glBindTexture2D(texture);

        gl.bindBuffer(gl.ARRAY_BUFFER, _currentBuffer.buffer.arrayBuffer);

        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);

        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);                   //cc.VERTEX_ATTRIB_POSITION
        gl.vertexAttribPointer(1, 4, gl.UNSIGNED_BYTE, true, 24, 12);           //cc.VERTEX_ATTRIB_COLOR
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 24, 16);                  //cc.VERTEX_ATTRIB_TEX_COORDS
        
        var i;
        // Enable matrix vertex attribs row by row (vec4 * 4)
        for (i = 0; i < 4; ++i) {
            gl.enableVertexAttribArray(cc.VERTEX_ATTRIB_MVMAT0 + i);
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_MVMAT0 + i, 4, gl.FLOAT, false, bytesPerRow * 4, _currentBuffer.matrixOffset + bytesPerRow * i); //stride is one row
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _currentBuffer.buffer.elementBuffer);
        gl.drawElements(gl.TRIANGLES, _currentBuffer.totalIndexSize, gl.UNSIGNED_SHORT, 0);

        for (i = 0; i < 4; ++i) {
            gl.disableVertexAttribArray(cc.VERTEX_ATTRIB_MVMAT0 + i);
        }

        cc.g_NumberOfDraws++;
    },

    /**
     * drawing all renderer command to context (default is cc._renderContext)
     * @param {WebGLRenderingContext} [ctx=cc._renderContext]
     */
    rendering: function (ctx) {
        var locCmds = this._renderCmds,
            i, len, cmd, next, batchCount,
            context = ctx || cc._renderContext;

        // Need to rebuild all virtual buffers in forward batching
        if (_needUpdateBuffer) {
            clearVirtualBuffers();
        }

        for (i = 0, len = locCmds.length; i < len; i++) {
            cmd = locCmds[i];
            next = locCmds[i+1];

            // Already batched in buffer
            if (cmd._vBuffer) {
                // No need to update buffer then try to check and reuse the buffer
                if (!_needUpdateBuffer) {
                    batchCount = this._forwardCheck(i);
                    if (batchCount > 1) {
                        this._batchRendering();
                        // i will increase by 1 each loop
                        i += batchCount - 1;
                        continue;
                    }
                }
                // Need to update buffer, clear vBuffer in commands
                else {
                    cmd._vBuffer = null;
                }
            }
            
            // Batching or direct rendering
            if (cmd._supportBatch && next && next._supportBatch) {
                batchCount = this._forwardBatch(i);
                if (batchCount > 1) {
                    this._batchRendering();
                    // i will increase by 1 each loop
                    i += batchCount - 1;
                    continue;
                }
            }

            cmd.rendering(context);
        }
        if (_needUpdateBuffer) {
            _needUpdateBuffer = false;
        }
    }
};
})();