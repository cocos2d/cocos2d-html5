/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

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
 * <p>A class that implements a Texture Atlas. <br />
 * Supported features: <br />
 * The atlas file can be a PNG, JPG. <br />
 * Quads can be updated in runtime <br />
 * Quads can be added in runtime <br />
 * Quads can be removed in runtime <br />
 * Quads can be re-ordered in runtime <br />
 * The TextureAtlas capacity can be increased or decreased in runtime.</p>
 * @class
 * @extends cc.Class
 */
cc.TextureAtlas = cc.Class.extend(/** @lends cc.TextureAtlas# */{
    _indices:null,
    //0: vertex  1: indices
    _buffersVBO:null,
    //indicates whether or not the array buffer of the VBO needs to be updated
    _dirty:false,
    _capacity:0,
    _texture:null,

    _quads:null,
    _quadsArrayBuffer:null,
    _quadsWebBuffer:null,
    _quadsReader:null,

    ctor:function () {
        this._buffersVBO = [];
    },

    /**
     * Quantity of quads that are going to be drawn.
     * @return {Number}
     */
    getTotalQuads:function () {
        return this._quads.length;
    },

    /**
     * Quantity of quads that can be stored with the current texture atlas size
     * @return {Number}
     */
    getCapacity:function () {
        return this._capacity;
    },

    /**
     * Texture of the texture atlas
     * @return {Image}
     */
    getTexture:function () {
        return this._texture;
    },

    /**
     * @param {Image} texture
     */
    setTexture:function (texture) {
        this._texture = texture;
    },

    setDirty:function (dirty) {
        this._dirty = dirty;
    },

    getDirty:function () {
        return this._dirty;
    },

    /**
     * Quads that are going to be rendered
     * @return {Array}
     */
    getQuads:function () {
        return this._quads;
    },

    /**
     * @param {Array} quads
     */
    setQuads:function (quads) {
        this._quads = quads;
        //TODO need re-binding
    },

    _copyQuadsToTextureAtlas:function(quads, index){
        if(!quads)
            return;

        for(var i = 0; i < quads.length ; i++){
            this._setQuadToArray(quads[i], index + i);
        }
    },

    _setQuadToArray: function (quad, index) {
        if (!this._quads[index]) {
            this._quads[index] = new cc.V3F_C4B_T2F_Quad(quad.tl, quad.bl, quad.tr, quad.br, this._quadsArrayBuffer, index * cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT);
            return;
        }
        this._quads[index].bl = quad.bl;
        this._quads[index].br = quad.br;
        this._quads[index].tl = quad.tl;
        this._quads[index].tr = quad.tr;
    },

    /**
     * Description
     * @return {String}
     */
    description:function () {
        return '<cc.TextureAtlas | totalQuads =' + this._totalQuads + '>';
    },

    _setupIndices:function () {
        if (this._capacity === 0)
            return;

        for (var i = 0; i < this._capacity; i++) {
            if (cc.TEXTURE_ATLAS_USE_TRIANGLE_STRIP) {
                this._indices[i * 6 + 0] = i * 4 + 0;
                this._indices[i * 6 + 1] = i * 4 + 0;
                this._indices[i * 6 + 2] = i * 4 + 2;
                this._indices[i * 6 + 3] = i * 4 + 1;
                this._indices[i * 6 + 4] = i * 4 + 3;
                this._indices[i * 6 + 5] = i * 4 + 3;
            } else {
                this._indices[i * 6 + 0] = i * 4 + 0;
                this._indices[i * 6 + 1] = i * 4 + 1;
                this._indices[i * 6 + 2] = i * 4 + 2;

                // inverted index. issue #179
                this._indices[i * 6 + 3] = i * 4 + 3;
                this._indices[i * 6 + 4] = i * 4 + 2;
                this._indices[i * 6 + 5] = i * 4 + 1;
            }
        }
    },

    _setupVBO:function () {
        var gl = cc.renderContext;
        //create WebGLBuffer
        this._buffersVBO[0] = gl.createBuffer();
        this._buffersVBO[1] = gl.createBuffer();

        this._quadsWebBuffer = gl.createBuffer();
        this._mapBuffers();
    },

    _mapBuffers:function () {
        var gl = cc.renderContext;

        gl.bindBuffer(gl.ARRAY_BUFFER, this._quadsWebBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this._quadsArrayBuffer, gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1]);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.STATIC_DRAW);

        //cc.CHECK_GL_ERROR_DEBUG();
    },

    /**
     * <p>Initializes a TextureAtlas with a filename and with a certain capacity for Quads.<br />
     * The TextureAtlas capacity can be increased in runtime.<br />
     * WARNING: Do not reinitialize the TextureAtlas because it will leak memory. </p>
     * @param {String} file
     * @param {Number} capacity
     * @return {Boolean}
     * @example
     * //example
     * var textureAtlas = new cc.TextureAtlas();
     * textureAtlas.initWithTexture("hello.png", 3);
     */
    initWithFile:function (file, capacity) {
        // retained in property
        var texture = cc.TextureCache.getInstance().addImage(file);
        if (texture)
            return this.initWithTexture(texture, capacity);
        else {
            cc.log("cocos2d: Could not open file: " + file);
            return false;
        }
    },

    /**
     * <p>Initializes a TextureAtlas with a previously initialized Texture2D object, and<br />
     * with an initial capacity for Quads.<br />
     * The TextureAtlas capacity can be increased in runtime.<br />
     * WARNING: Do not reinitialize the TextureAtlas because it will leak memory</p>
     * @param {Image} texture
     * @param {Number} capacity
     * @return {Boolean}
     * @example
     * //example
     * var texture = cc.TextureCache.getInstance().addImage("hello.png");
     * var textureAtlas = new cc.TextureAtlas();
     * textureAtlas.initWithTexture(texture, 3);
     */
    initWithTexture:function (texture, capacity) {
        //cc.Assert(texture != null, "TextureAtlas.initWithTexture():texture should not be null");
        this._capacity = 0 | (capacity);
        this._totalQuads = 0;

        // retained in property
        this._texture = texture;

        // Re-initialization is not allowed
        cc.Assert(this._quads == null && this._indices == null, "TextureAtlas.initWithTexture():_quads and _indices should not be null");

        this._quads = [];
        this._indices = new Uint16Array(this._capacity * 6);
        this._quadsArrayBuffer = new ArrayBuffer(cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT * this._capacity);
        this._quadsReader = new Uint8Array(this._quadsArrayBuffer);

        if (!( this._quads && this._indices) && this._capacity > 0)
            return false;

        this._setupIndices();
        this._setupVBO();
        this._dirty = true;
        return true;
    },

    /**
     * <p>Updates a Quad (texture, vertex and color) at a certain index <br />
     * index must be between 0 and the atlas capacity - 1 </p>
     * @param {cc.V2F_C4B_T2F_Quad} quad
     * @param {Number} index
     */
    updateQuad:function (quad, index) {
        //cc.Assert(index >= 0 && index < this._capacity, "updateQuadWithTexture: Invalid index");
        this._totalQuads = Math.max(index + 1, this._totalQuads);
        this._setQuadToArray(quad, index);
        this._dirty = true;
    },

    /**
     * <p>Inserts a Quad (texture, vertex and color) at a certain index<br />
     * index must be between 0 and the atlas capacity - 1 </p>
     * @param {cc.V2F_C4B_T2F_Quad} quad
     * @param {Number} index
     */
    insertQuad:function (quad, index) {
        cc.Assert(index < this._capacity, "insertQuadWithTexture: Invalid index");

        this._totalQuads++;
        cc.Assert(this._totalQuads <= this._capacity, "invalid totalQuads");

        var quadSize = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
        // issue #575. index can be > totalQuads
        var remaining = (this._totalQuads-1) - index;
        var startOffset = index * quadSize;
        var moveLength = remaining * quadSize;
        this._quads[this._totalQuads -1] = new cc.V3F_C4B_T2F_Quad(null, null, null, null, this._quadsArrayBuffer, (this._totalQuads -1) * quadSize);
        this._quadsReader.set(this._quadsReader.subarray(startOffset, startOffset + moveLength), startOffset + quadSize);

        this._setQuadToArray(quad, index);
        this._dirty = true;
    },

    /**
     * <p>
     *      Inserts a c array of quads at a given index                                           <br />
     *      index must be between 0 and the atlas capacity - 1                                    <br />
     *      this method doesn't enlarge the array when amount + index > totalQuads                <br />
     * </p>
     * @param {Array} quads
     * @param {Number} index
     * @param {Number} amount
     */
    insertQuads:function (quads, index, amount) {
        amount = amount || quads.length;
        var quadSize = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;

        cc.Assert(index + amount <= this._capacity, "insertQuadWithTexture: Invalid index + amount");
        this._totalQuads += amount;
        cc.Assert(this._totalQuads <= this._capacity, "invalid totalQuads");

        // issue #575. index can be > totalQuads
        var remaining = (this._totalQuads-1) - index - amount;
        var startOffset = index * quadSize;
        var moveLength = remaining * quadSize;
        var lastIndex = (this._totalQuads-1)  - amount;

        var i;
        for(i = 0; i < amount;i++)
            this._quads[lastIndex + i] = new cc.V3F_C4B_T2F_Quad(null, null, null, null, this._quadsArrayBuffer, (this._totalQuads -1) * quadSize);
        this._quadsReader.set(this._quadsReader.subarray(startOffset, startOffset + moveLength), startOffset + quadSize * amount);
        for(i = 0; i < amount; i++)
            this._setQuadToArray(quads[i], index + i);

        this._dirty = true;
    },

    /**
     * <p>Removes the quad that is located at a certain index and inserts it at a new index <br />
     * This operation is faster than removing and inserting in a quad in 2 different steps</p>
     * @param {Number} fromIndex
     * @param {Number} newIndex
     */
    insertQuadFromIndex:function (fromIndex, newIndex) {
        cc.Assert(newIndex >= 0 && newIndex < this._totalQuads, "insertQuadFromIndex:atIndex: Invalid index");
        cc.Assert(fromIndex >= 0 && fromIndex < this._totalQuads, "insertQuadFromIndex:atIndex: Invalid index");
        if (fromIndex === newIndex)
            return;

        var quadSize = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
        var sourceArr = this._quadsReader.subarray(fromIndex * quadSize,quadSize);
        var startOffset, moveLength;
        if(fromIndex > newIndex){
            startOffset = newIndex * quadSize;
            moveLength = (fromIndex - newIndex) * quadSize;
            this._quadsReader.set(this._quadsReader.subarray(startOffset, startOffset + moveLength),startOffset + quadSize);
            this._quadsReader.set(sourceArr,startOffset);
        }else{
            startOffset = (fromIndex + 1) * quadSize;
            moveLength = (newIndex - fromIndex) * quadSize;
            this._quadsReader.set(this._quadsReader.subarray(startOffset, startOffset + moveLength),startOffset - quadSize);
            this._quadsReader.set(sourceArr, newIndex * quadSize);
        }
        this._dirty = true;
    },

    /**
     * <p>Removes a quad at a given index number.<br />
     * The capacity remains the same, but the total number of quads to be drawn is reduced in 1 </p>
     * @param {Number} index
     */
    removeQuadAtIndex:function (index) {
        cc.Assert(index < this._totalQuads, "removeQuadAtIndex: Invalid index");
        var quadSize = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
        this._totalQuads--;
        this._quads.length = this._totalQuads;
        if(index !== this._totalQuads){
            //move data
            var startOffset = (index + 1) * quadSize;
            var moveLength = (this._totalQuads - index) * quadSize;
            this._quadsReader.set(this._quadsReader.subarray(startOffset, startOffset + moveLength), startOffset - quadSize);
        }
        this._dirty = true;
    },

    removeQuadsAtIndex:function (index, amount) {
        cc.Assert(index + amount <= this._totalQuads, "removeQuadAtIndex: index + amount out of bounds");
        this._totalQuads -= amount;

        if(index !== this._totalQuads){
            //move data
            var quadSize = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
            var srcOffset = (index + amount) * quadSize;
            var moveLength = (this._totalQuads - index) * quadSize;
            var dstOffset = index * quadSize;
            this._quadsReader.set(this._quadsReader.subarray(srcOffset,srcOffset + moveLength),dstOffset);
        }
        this._dirty = true;
    },

    /**
     * <p>Removes all Quads. <br />
     * The TextureAtlas capacity remains untouched. No memory is freed.<br />
     * The total number of quads to be drawn will be 0</p>
     */
    removeAllQuads:function () {
        //this._quads.length = 0;
        this._totalQuads = 0;
    },

    /**
     * <p>Resize the capacity of the CCTextureAtlas.<br />
     * The new capacity can be lower or higher than the current one<br />
     * It returns YES if the resize was successful. <br />
     * If it fails to resize the capacity it will return NO with a new capacity of 0. <br />
     * no used for js</p>
     * @param {Number} newCapacity
     * @return {Boolean}
     */
    resizeCapacity:function (newCapacity) {
        if (newCapacity == this._capacity)
            return true;

        var quadSize = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
        var oldCapacity = this._capacity;
        // update capacity and totolQuads
        this._totalQuads = Math.min(this._totalQuads, newCapacity);
        this._capacity = 0 | newCapacity;
        var i, capacity = this._capacity;

        if (this._quads == null) {
            this._quads = [];
            this._quadsArrayBuffer = new ArrayBuffer(quadSize * capacity);
            this._quadsReader = new Uint8Array(this._quadsArrayBuffer);
        } else {
            var newQuads, newArrayBuffer, quads = this._quads;
            if (capacity > oldCapacity) {
                newQuads = [];
                newArrayBuffer = new ArrayBuffer(quadSize * capacity);

                for(i = 0; i < this._totalQuads;i++){
                     newQuads[i] = new cc.V3F_C4B_T2F_Quad(quads[i].tl,quads[i].bl,quads[i].tr,quads[i].br,
                         newArrayBuffer,i * quadSize);
                }
                this._quadsReader = new Uint8Array(newArrayBuffer);
                this._quads = newQuads;
                this._quadsArrayBuffer = newArrayBuffer;
            } else {
                var count = Math.max(this._totalQuads, capacity);
                newQuads = [];
                newArrayBuffer = new ArrayBuffer(quadSize * capacity);
                for(i = 0; i < count;i++){
                    newQuads[i] = new cc.V3F_C4B_T2F_Quad(quads[i].tl,quads[i].bl,quads[i].tr,quads[i].br,
                        newArrayBuffer,i * quadSize);
                }
                this._quadsReader = new Uint8Array(newArrayBuffer);
                this._quads = newQuads;
                this._quadsArrayBuffer = newArrayBuffer;
            }
        }

        if (this._indices == null) {
            this._indices = new Uint16Array(capacity * 6);
        } else {
            if (capacity > oldCapacity) {
                var tempIndices = new Uint16Array(capacity * 6);
                tempIndices.set(this._indices, 0);
                this._indices = tempIndices;
            } else {
                this._indices = this._indices.subarray(0, capacity * 6);
            }
        }

        this._setupIndices();
        this._mapBuffers();
        this._dirty = true;
        return true;
    },

    /**
     * Used internally by CCParticleBatchNode                                    <br/>
     * don't use this unless you know what you're doing
     * @param {Number} amount
     */
    increaseTotalQuadsWith:function (amount) {
        this._totalQuads += amount;
    },

    /**
     * Moves an amount of quads from oldIndex at newIndex
     * @param {Number} oldIndex
     * @param {Number} amount
     * @param {Number} newIndex
     */
    moveQuadsFromIndex: function (oldIndex, amount, newIndex) {
        if (arguments.length == 2) {
            newIndex = amount;
            amount = this._totalQuads - oldIndex;
            cc.Assert(newIndex + (this._totalQuads - oldIndex) <= this._capacity, "moveQuadsFromIndex move is out of bounds");
            if(amount === 0)
                return;
        }else{
            cc.Assert(newIndex + amount <= this._totalQuads, "moveQuadsFromIndex:newIndex: Invalid index");
            cc.Assert(oldIndex < this._totalQuads, "moveQuadsFromIndex:oldIndex: Invalid index");

            if (oldIndex == newIndex)
                return;
        }

        var quadSize = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
        var srcOffset = oldIndex * quadSize;
        var srcLength = amount * quadSize;
        var sourceArr = this._quadsReader.subarray(srcOffset, srcOffset + srcLength);
        var dstOffset = newIndex * quadSize;
        var moveLength, moveStart;
        if (newIndex < oldIndex) {
            moveLength = (oldIndex - newIndex) * quadSize;
            moveStart = newIndex * quadSize;
            this._quadsReader.set(this._quadsReader.subarray(moveStart, moveStart + moveLength), moveStart + srcLength)
        } else {
            moveLength = (newIndex - oldIndex) * quadSize;
            moveStart = (oldIndex + amount) * quadSize;
            this._quadsReader.set(this._quadsReader.subarray(moveStart, moveStart + moveLength), srcOffset);
        }
        this._quadsReader.set(sourceArr, dstOffset);
        this._dirty = true;
    },

    /**
     * Ensures that after a realloc quads are still empty                                <br/>
     * Used internally by CCParticleBatchNode
     * @param {Number} index
     * @param {Number} amount
     */
    fillWithEmptyQuadsFromIndex:function (index, amount) {
        var count = amount * cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
        var clearReader = new Uint8Array(this._quadsArrayBuffer, index * cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT, count);
        for (var i = 0; i < count; i++)
            clearReader[i] = 0;
    },

    // TextureAtlas - Drawing

    /**
     * <p>Draws n quads from an index (offset). <br />
     * n + start can't be greater than the capacity of the atlas</p>
     * @param {Number} n
     * @param {Number} start
     */
    drawNumberOfQuads:function (n, start) {
        start = start || 0;
        if (0 === n || !this._texture || !this._texture.isLoaded())
            return;

        var gl = cc.renderContext;
        cc.glBindTexture2D(this._texture);

        //
        // Using VBO without VAO
        //
        //vertices
        //gl.bindBuffer(gl.ARRAY_BUFFER, this._buffersVBO[0]);
        // XXX: update is done in draw... perhaps it should be done in a timer
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSCOLORTEX);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._quadsWebBuffer);
        if (this._dirty)
            gl.bufferData(gl.ARRAY_BUFFER, this._quadsArrayBuffer, gl.DYNAMIC_DRAW);

        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0);               // vertices
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);          // colors
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 24, 16);            // tex coords

        if (this._dirty)
            this._dirty = false;

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1]);

        if (cc.TEXTURE_ATLAS_USE_TRIANGLE_STRIP)
            gl.drawElements(gl.TRIANGLE_STRIP, n * 6, gl.UNSIGNED_SHORT, start * 6 * this._indices.BYTES_PER_ELEMENT);
        else
            gl.drawElements(gl.TRIANGLES, n * 6, gl.UNSIGNED_SHORT, start * 6 * this._indices.BYTES_PER_ELEMENT);

        cc.g_NumberOfDraws++;
        //cc.CHECK_GL_ERROR_DEBUG();
    },

    /**
     * Draws all the Atlas's Quads
     */
    drawQuads:function () {
        this.drawNumberOfQuads(this._totalQuads, 0);
    }
});

/**
 * <p>Creates a TextureAtlas with an filename and with an initial capacity for Quads. <br />
 * The TextureAtlas capacity can be increased in runtime. </p>
 * @param {String} file
 * @param {Number} capacity
 * @return {cc.TextureAtlas|Null}
 * @example
 * //example
 * var textureAtlas = cc.TextureAtlas.create("hello.png", 3);
 */
cc.TextureAtlas.create = function (file, capacity) {
    var textureAtlas = new cc.TextureAtlas();
    if (textureAtlas && textureAtlas.initWithFile(file, capacity))
        return textureAtlas;
    return null;
};

/**
 * <p>Creates a TextureAtlas with a previously initialized Texture2D object, and with an initial capacity for n Quads.
 * The TextureAtlas capacity can be increased in runtime.</p>
 * @param {Image|cc.Texture2D} texture
 * @param {Number} capacity
 * @return {cc.TextureAtlas}
 * @example
 * //example
 * var texture = cc.TextureCache.getInstance().addImage("hello.png");
 * var textureAtlas = cc.TextureAtlas.createWithTexture(texture, 3);
 */
cc.TextureAtlas.createWithTexture = function (texture, capacity) {
    var textureAtlas = new cc.TextureAtlas();
    if (textureAtlas && textureAtlas.initWithTexture(texture, capacity))
        return textureAtlas;
    return null;
};
