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
    var len = array.length;
    if (len > 0 && i >= 0 && i < len) {
        array[i] = array[len - 1];
        array.length--;
    }
}

var ACTIVATE_V4 = true;
var CACHING_BUFFER = false;
if (ACTIVATE_V4) {
    CACHING_BUFFER = true;
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
    _needUpdateBuffer = CACHING_BUFFER ? true : false,
    _updateBufferNextFrame = false;

function createVirtualBuffer (buffer, vertexOffset, matrixOrigin, matrixOffset, indexOffset, totalBufferSize, totalIndexSize, count, data) {
    data = data || new Uint32Array(totalBufferSize / 4);
    var vBuf = {
        // The object contains real WebGL buffers, it's created or retrieved via getBatchBuffer
        buffer: buffer,
        // The vertex data array (Uint32Array)
        dataArray: data,
        // The start offset in the vertex buffer, in bytes
        vertexOffset: vertexOffset,
        // The offset of all matrix data, in bytes
        matrixOrigin: matrixOrigin,
        // The start offset after the origin of matrix data in the vertex buffer, in bytes
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

    if (CACHING_BUFFER) {
        _virtualBuffers.push(vBuf);
    }
    return vBuf;
}

function clearVirtualBuffers () {
    for (var i = _virtualBuffers.length-1; i >= 0; --i) {
        var vbuffer = _virtualBuffers[i];
        if (vbuffer.buffer) {
            _batchBufferPool.push(vbuffer.buffer);
        }
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
        if (!ACTIVATE_V4 && CACHING_BUFFER && this.childrenOrderDirty) {
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
            vbuffer = cmd._vBuffer,
            indexSize = cmd.indicesPerUnit;

        // Reset current buffer and batched info
        cmd.getBatchInfo(_batchedInfo);
        _currentBuffer = null;

        // A simple solution temporarily
        if (!ACTIVATE_V4) {
            _currentBuffer = vbuffer;
            return vbuffer.count;
        }

        // Protection, vbuffer invalid or doesn't match the command
        if (cmd._vertexOffset !== vbuffer.vertexOffset || !vbuffer.buffer) {
            cmd._vBuffer = null;
            for (; last < length; ++last) {
                cmd = renderCmds[last];
                if (vbuffer !== cmd._vBuffer) {
                    break;
                }
                cmd._vBuffer = null;
            }
            _updateBufferNextFrame = true;
            return 0;
        }

        // Forward check
        var matrixBuffer, martixOrigin;
        for (; last < length; ++last) {
            cmd = renderCmds[last];
            if (vbuffer !== cmd._vBuffer) {
                break;
            }

            // Lazy update transform matrix in buffer
            if (cmd._matrixDirty) {
                if (!matrixBuffer) {
                    // Bind buffer
                    matrixBuffer = vbuffer;
                    martixOrigin = matrixBuffer.matrixOrigin / 4;
                    gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer.buffer.arrayBuffer);
                }
                cmd.batchVertexBuffer(matrixBuffer.dataArray, cmd._vertexOffset, martixOrigin, cmd._matrixOffset);
                cmd._matrixDirty = false;
            }
            indexSize += cmd.indicesPerUnit;
        }
        // Send last buffer to WebGLBuffer
        if (matrixBuffer) {
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, matrixBuffer.dataArray);
        }

        var size = last - first;
        // no problem
        if (vbuffer.count === size) {
            _currentBuffer = vbuffer;
            return size;
        }
        // New render commands have been inserted, 
        // need to create new virtual buffer for the current frame
        // and if the inserted command can be batched, mark _needUpdateBuffer as true
        // because we need to update the buffers by rerun _forwardBatch
        else if (vbuffer.count > size) {
            // Roll back to previous command
            cmd = renderCmds[last-1];
            var secondIndexSize = vbuffer.totalIndexSize - indexSize;
            var secondCount = vbuffer.count - size;
            if (size > 1) {
                // Update first part vbuffer
                vbuffer.count = size;
                vbuffer.totalIndexSize = indexSize;
                _currentBuffer = vbuffer;
            }
            else {
                // First part only contain 1 command, remove the virtual buffer
                cmd._vBuffer = null;
                removeByLastSwap(_virtualBuffers, _virtualBuffers.indexOf(vbuffer));
            }

            var newBuffer;
            if (secondCount > 1) {
                // Create second part vbuffer reusing the same buffer and data array
                newBuffer = createVirtualBuffer(vbuffer.buffer, 
                                                cmd._vertexOffset * 4 + cmd.vertexBytesPerUnit, 
                                                vbuffer.matrixOrigin,
                                                cmd._matrixOffset * 4 + cmd.matrixBytesPerUnit, 
                                                vbuffer.indexOffset + indexSize, 
                                                vbuffer.totalBufferSize, 
                                                secondIndexSize, 
                                                secondCount,
                                                vbuffer.data);
                
            }
            else {
                // Second part only contain 1 command
                newBuffer = null;
            }
            // Update second part commands _vBuffer
            for (last = last+1; last < length; ++last) {
                cmd = renderCmds[last];
                if (vbuffer !== cmd._vBuffer) {
                    break;
                }
                cmd._vBuffer = newBuffer;
            }

            // The breaking command
            cmd = renderCmds[first+size];
            if (cmd._supportBatch) {
                cmd.getBatchInfo(_currentInfo);
                cmd = renderCmds[first];
                cmd.getBatchInfo(_batchedInfo);
                // Can be batched together, update buffer in next frame
                if (_currentInfo.texture === _batchedInfo.texture &&
                    _currentInfo.blendSrc === _batchedInfo.blendSrc &&
                    _currentInfo.blendDst === _batchedInfo.blendDst &&
                    _currentInfo.shader === _batchedInfo.shader) {
                    _updateBufferNextFrame = true;
                }
            }
            return size;
        }
        // Render commands removed
        // need to update all commands and update buffer in next frame
        else {
            for (last = first; last < first + size; ++last) {
                cmd = renderCmds[last];
                cmd._vBuffer = null;
            }
            _updateBufferNextFrame = true;
            return 0;
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
        if (!_batchedInfo.texture)
            return 0;
        var matrixOrigin = cmd.vertexBytesPerUnit;
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
            // Some render command inserted before existing batching cmds
            // Need to rebuild virtual buffers
            else if (CACHING_BUFFER && cmd._vBuffer) {
                _updateBufferNextFrame = true;
                break;
            }
            else {
                matrixOrigin += cmd.vertexBytesPerUnit;
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
                                          matrixOrigin,
                                          0,
                                          0, 
                                          totalBufferSize, 
                                          totalIndexSize, 
                                          count);
        _currentBuffer = vbuffer;
        var uploadBuffer = vbuffer.dataArray;

        //all of the divisions by 4 are just because we work with uint32arrays instead of uint8 arrays so all indexes need to be shortened by the factor of 4
        var totalVertexData = matrixOrigin / 4;
        var vertexDataOffset = 0;
        var matrixDataOffset = 0;

        // Bind vertex data buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer.buffer.arrayBuffer);

        // Fill in vertex data command by command
        var i;
        for (i = first; i < last; ++i) {
            cmd = renderCmds[i];
            cmd.batchVertexBuffer(uploadBuffer, vertexDataOffset, totalVertexData, matrixDataOffset);

            if (CACHING_BUFFER) {
                cmd._vBuffer = vbuffer;
                cmd._vertexOffset = vertexDataOffset;
                cmd._matrixOffset = matrixDataOffset;
            }

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

        if (!CACHING_BUFFER) {
            _batchBufferPool.push(buffer);
        }
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

        var vertexOffset = _currentBuffer.vertexOffset;
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, vertexOffset);
        gl.vertexAttribPointer(1, 4, gl.UNSIGNED_BYTE, true, 24, vertexOffset + 12);
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 24, vertexOffset + 16);
        
        var i;
        var matrixOffset = _currentBuffer.matrixOrigin + _currentBuffer.matrixOffset;
        // Enable matrix vertex attribs row by row (vec4 * 4)
        for (i = 0; i < 4; ++i) {
            gl.enableVertexAttribArray(cc.VERTEX_ATTRIB_MVMAT0 + i);
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_MVMAT0 + i, 4, gl.FLOAT, false, bytesPerRow * 4, matrixOffset + bytesPerRow * i); //stride is one row
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _currentBuffer.buffer.elementBuffer);
        gl.drawElements(gl.TRIANGLES, _currentBuffer.totalIndexSize, gl.UNSIGNED_SHORT, _currentBuffer.indexOffset);

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

            if (!_needUpdateBuffer) {
                // Already batched in buffer
                if (cmd._vBuffer) {
                    batchCount = this._forwardCheck(i);
                    if (batchCount > 1) {
                        this._batchRendering();
                        // i will increase by 1 each loop
                        i += batchCount - 1;
                        continue;
                    }
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
        // Update virtual buffers in next frame
        if (_updateBufferNextFrame) {
            _needUpdateBuffer = true;
            _updateBufferNextFrame = false;
        }
    }
};
})();