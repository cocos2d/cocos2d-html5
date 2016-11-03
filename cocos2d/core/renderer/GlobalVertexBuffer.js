/****************************************************************************
 Copyright (c) 2016 Chukong Technologies Inc.

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

var GlobalVertexBuffer = (function () {

var VERTICES_SIZE = 888;

var GlobalVertexBuffer = function (gl) {
    // WebGL buffer
    this.gl = gl;
    this.vertexBuffer = gl.createBuffer();

    this.size = VERTICES_SIZE;
    this.byteLength = VERTICES_SIZE * 4 * cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
    
    // buffer data and views
    this.data = new ArrayBuffer(this.byteLength);
    this.dataArray = new Float32Array(this.data);

    // Init buffer data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.dataArray, gl.DYNAMIC_DRAW);

    this._dirty = false;
    this._spaces = {
        0: this.byteLength
    };
};
GlobalVertexBuffer.prototype = {
    constructor: GlobalVertexBuffer,

    allocBuffer: function (offset, size) {
        var space = this._spaces[offset];
        if (space && space >= size) {
            // Remove the space
            delete this._spaces[offset];
            if (space > size) {
                var newOffset = offset + size;
                this._spaces[newOffset] = space - size;
            }
            return true;
        }
        else {
            return false;
        }
    },

    requestBuffer: function (size) {
        var key, offset, available;
        for (key in this._spaces) {
            offset = parseInt(key);
            available = this._spaces[key];
            if (available >= size && this.allocBuffer(offset, size)) {
                return {
                    buffer: this,
                    offset: offset,
                    size: size
                };
            }
        }
        return null;
    },

    freeBuffer: function (offset, size) {
        var spaces = this._spaces;
        var i, key, end;
        // Merge with previous space
        for (key in spaces) {
            i = parseInt(key);
            if (i > offset) {
                break;
            }
            if (i + spaces[key] >= offset) {
                size = size + offset - i;
                offset = i;
                break;
            }
        }

        end = offset + size;
        // Merge with next space 
        if (this._spaces[end]) {
            size += this._spaces[end];
            delete this._spaces[end];
        }

        this._spaces[offset] = size;
    },

    setDirty: function () {
        this._dirty = true;
    },

    update: function () {
        if (this._dirty) {
            this.gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            // Note: Can memorize different dirty zones and update them separately, maybe faster
            this.gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.dataArray);
            this._dirty = false;
        }
    },

    destroy: function () {
        this.gl.deleteBuffer(this.vertexBuffer);

        this.data = null;
        this.positions = null;
        this.colors = null;
        this.texCoords = null;

        this.vertexBuffer = null;
    }
};

return GlobalVertexBuffer;

})();