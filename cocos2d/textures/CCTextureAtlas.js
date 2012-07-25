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
    _indices:[],
    //0: vertex  1: indices
    _buffersVBO:[0, 1],
    //indicates whether or not the array buffer of the VBO needs to be updated
    _dirty:false,
    _capacity:0,
    _texture:null,
    _quads:[],
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
    },

    /**
     * Description
     * @return {String}
     */
    description:function () {
        return '<CCTextureAtlas | totalQuads =' + this._totalQuads + '>';
    },
    _initIndices:function () {
        if (this._capacity == 0)
            return;

        for (var i = 0; i < this._capacity; i++) {
            this._indices[i * 6 + 0] = i * 4 + 0;
            this._indices[i * 6 + 1] = i * 4 + 0;
            this._indices[i * 6 + 2] = i * 4 + 2;
            this._indices[i * 6 + 3] = i * 4 + 1;
            this._indices[i * 6 + 4] = i * 4 + 3;
            this._indices[i * 6 + 5] = i * 4 + 3;
        }
    },

    /**
     * <p>Initializes a TextureAtlas with a filename and with a certain capacity for Quads.<br />
     * The TextureAtlas capacity can be increased in runtime.<br />
     * WARNING: Do not reinitialize the TextureAtlas because it will leak memory. </p>
     * @param {String} file
     * @param {Number} capacity
     * @return {Boolean|Null}
     * @example
     * //example
     * var textureAtlas = new cc.TextureAtlas();
     * textureAtlas.initWithTexture("hello.png", 3);
     */
    initWithFile:function (file, capacity) {
        // retained in property
        var texture = cc.TextureCache.getInstance().addImage(file);

        if (texture) {
            return this.initWithTexture(texture, capacity);
        } else {
            cc.log("cocos2d: Could not open file: " + file);
            return null;
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
        cc.Assert(texture != null, "TextureAtlas.initWithTexture():texture should not be null");
        this._capacity = capacity;

        // retained in property
        this._texture = texture;

        // Re-initialization is not allowed
        cc.Assert(this._quads.length == 0 && this._indices.length == 0, "TextureAtlas.initWithTexture():_quads and _indices should not be null");

        //TODO init array
        this._quads = [];
        this._indices = [];

        if (!( this._quads && this._indices) && this._capacity > 0) {
            return false;
        }

        this._dirty = true;
        this._initIndices();
        return true;
    },

    /**
     * <p>Updates a Quad (texture, vertex and color) at a certain index <br />
     * index must be between 0 and the atlas capacity - 1 </p>
     * @param {cc.V2F_C4B_T2F_Quad} quad
     * @param {Number} index
     */
    updateQuad:function (quad, index) {
        this._quads[index] = quad;
        this._dirty = true;
    },

    /**
     * <p>Inserts a Quad (texture, vertex and color) at a certain index<br />
     * index must be between 0 and the atlas capacity - 1 </p>
     * @param {cc.V2F_C4B_T2F_Quad} quad
     * @param {Number} index
     */
    insertQuad:function (quad, index) {
        this._quads = cc.ArrayAppendObjectToIndex(this._quads, quad, index);
        this._dirty = true;
    },

    /**
     * <p>Removes the quad that is located at a certain index and inserts it at a new index <br />
     * This operation is faster than removing and inserting in a quad in 2 different steps</p>
     * @param {Number} fromIndex
     * @param {Number} newIndex
     */
    insertQuadFromIndex:function (fromIndex, newIndex) {
        if (fromIndex == newIndex)
            return;

        var quad = this._quads[fromIndex];
        cc.ArrayRemoveObjectAtIndex(this._quads, fromIndex);
        if (fromIndex > newIndex) {
            this._quads = cc.ArrayAppendObjectToIndex(this._quads, quad, newIndex);
        } else {
            this._quads = cc.ArrayAppendObjectToIndex(this._quads, quad, newIndex - 1);
        }

        this._dirty = true;
    },

    /**
     * <p>Removes a quad at a given index number.<br />
     * The capacity remains the same, but the total number of quads to be drawn is reduced in 1 </p>
     * @param {Number} index
     */
    removeQuadAtIndex:function (index) {
        cc.ArrayRemoveObjectAtIndex(this._quads, index);

        this._dirty = true;
    },

    /**
     * <p>Removes all Quads. <br />
     * The TextureAtlas capacity remains untouched. No memory is freed.<br />
     * The total number of quads to be drawn will be 0</p>
     */
    removeAllQuads:function () {
        this._quads.length = 0;
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
        if (newCapacity == this._capacity) {
            return true;
        }

        this._totalQuads = Math.min(this._totalQuads, newCapacity);
        this._capacity = newCapacity;

        return true;
    },

    /**
     * <p>Draws n quads from an index (offset). <br />
     * n + start can't be greater than the capacity of the atlas</p>
     * @param {Number} n
     * @param {Number} start
     */
    drawNumberOfQuads:function (n, start) {
        if (0 == n)
            return;
    },
    /**
     * Draws all the Atlas's Quads
     */
    drawQuads:function () {
        this.drawNumberOfQuads(this._quads.length, 0);
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
    if (textureAtlas && textureAtlas.initWithFile(file, capacity)) {
        return textureAtlas;
    }
    return null;
};

/**
 * <p>Creates a TextureAtlas with a previously initialized Texture2D object, and with an initial capacity for n Quads.
 * The TextureAtlas capacity can be increased in runtime.</p>
 * @param {Image} texture
 * @param {Number} capacity
 * @return {cc.TextureAtlas}
 * @example
 * //example
 * var texture = cc.TextureCache.getInstance().addImage("hello.png");
 * var textureAtlas = cc.TextureAtlas.createWithTexture(texture, 3);
 */
cc.TextureAtlas.createWithTexture = function (texture, capacity) {
    var textureAtlas = new cc.TextureAtlas();
    if (textureAtlas && textureAtlas.initWithTexture(texture, capacity)) {
        return textureAtlas;
    }
    return null;
};
