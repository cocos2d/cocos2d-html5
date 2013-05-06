/****************************************************************************
 Copyright (c) 2010-2013 cocos2d-x.org
 Copyright (c) 2009      On-Core
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
 * Base class for cc.Grid
 * @class
 * @extends cc.Class
 */
cc.GridBase = cc.Class.extend(/** @lends cc.GridBase# */{
    _active:false,
    _reuseGrid:0,
    _gridSize:null,
    _texture:null,
    _step:null,
    _grabber:null,
    _isTextureFlipped:false,
    _shaderProgram:null,
    _directorProjection:0,

    _dirty:false,

    ctor:function () {
        this._step = cc.p(0, 0);
    },

    /**
     * return wheter or not the grid is active
     * @return {Boolean}
     */
    isActive:function () {
        return this._active;
    },

    /**
     * set wheter or not the grid is active
     * @param {Number} active
     */
    setActive:function (active) {
        this._active = active;
        if (!active) {
            var director = cc.Director.getInstance();
            var proj = director.getProjection();
            director.setProjection(proj);
        }
    },

    /**
     * get number of times that the grid will be reused
     * @return {Number}
     */
    getReuseGrid:function () {
        return this._reuseGrid;
    },
    /**
     * set number of times that the grid will be reused
     * @param reuseGrid
     */
    setReuseGrid:function (reuseGrid) {
        this._reuseGrid = reuseGrid;
    },

    /**
     * get size of the grid
     * @return {cc.GridSize}
     */
    getGridSize:function () {
        return this._gridSize;
    },

    /**
     * set size of the grid
     * @param {cc.size} gridSize
     */
    setGridSize:function (gridSize) {
        this._gridSize.width = parseInt(gridSize.width);
        this._gridSize.height = parseInt(gridSize.height);
    },

    /**
     * get pixels between the grids
     * @return {cc.Point}
     */
    getStep:function () {
        return this._step;
    },

    /**
     * set pixels between the grids
     * @param {cc.Point} step
     */
    setStep:function (step) {
        this._step = step;
    },

    /**
     * get wheter or not the texture is flipped
     * @return {Boolean}
     */
    isTextureFlipped:function () {
        return this._isTextureFlipped;
    },

    /**
     * set wheter or not the texture is flipped
     * @param {Boolean} flipped
     */
    setTextureFlipped:function (flipped) {
        if (this._isTextureFlipped != flipped) {
            this._isTextureFlipped = flipped;
            this.calculateVertexPoints();
        }
    },

    initWithSize:function (gridSize, texture, flipped) {
        if (!texture) {
            var director = cc.Director.getInstance();
            var winSize = director.getWinSizeInPixels();

            var POTWide = cc.NextPOT(winSize.width);
            var POTHigh = cc.NextPOT(winSize.height);

            var data = new Uint8Array(POTWide * POTHigh * 4);
            if (!data) {
                cc.log("cocos2d: CCGrid: not enough memory.");
                return false;
            }

            texture = new cc.Texture2D();
            // we only use rgba8888
            texture.initWithData(data, cc.TEXTURE_2D_PIXEL_FORMAT_RGBA8888, POTWide, POTHigh, winSize);
            if (!texture) {
                cc.log("cocos2d: CCGrid: error creating texture");
                return false;
            }
        }

        flipped = flipped || false;

        this._active = false;
        this._reuseGrid = 0;
        this._gridSize = gridSize;
        this._texture = texture;
        this._isTextureFlipped = flipped;

        var texSize = this._texture.getContentSize();
        this._step.x = texSize.width / this._gridSize.width;
        this._step.y = texSize.height / this._gridSize.height;

        this._grabber = new cc.Grabber();
        if (!this._grabber)
            return false;
        this._grabber.grab(this._texture);
        this._shaderProgram = cc.ShaderCache.getInstance().programForKey(cc.SHADER_POSITION_TEXTURE);
        this.calculateVertexPoints();
        return true;
    },

    beforeDraw:function () {
        // save projection
        this._directorProjection = cc.Director.getInstance().getProjection();

        // 2d projection
        //    [director setProjection:kCCDirectorProjection2D];
        this.set2DProjection();
        this._grabber.beforeRender(this._texture);
    },

    afterDraw:function (target) {
        this._grabber.afterRender(this._texture);

        // restore projection
        cc.Director.getInstance().setProjection(this._directorProjection);

        if (target.getCamera().isDirty()) {
            var offset = target.getAnchorPointInPoints();

            //
            // XXX: Camera should be applied in the AnchorPoint
            //
            cc.kmGLTranslatef(offset.x, offset.y, 0);
            target.getCamera().locate();
            cc.kmGLTranslatef(-offset.x, -offset.y, 0);
        }

        cc.glBindTexture2D(this._texture);

        // restore projection for default FBO .fixed bug #543 #544
        //TODO:         CCDirector::sharedDirector().setProjection(CCDirector::sharedDirector().getProjection());
        //TODO:         CCDirector::sharedDirector().applyOrientation();
        this.blit();
    },

    blit:function () {
        cc.Assert(0, "");
    },

    reuse:function () {
        cc.Assert(0, "");
    },

    calculateVertexPoints:function () {
        cc.Assert(0, "");
    },

    set2DProjection:function () {
        var winSize = cc.Director.getInstance().getWinSizeInPixels();

        var gl = cc.renderContext;
        gl.viewport(0, 0, winSize.width * cc.CONTENT_SCALE_FACTOR(), winSize.height * cc.CONTENT_SCALE_FACTOR());
        cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
        cc.kmGLLoadIdentity();

        var orthoMatrix = new cc.kmMat4();
        cc.kmMat4OrthographicProjection(orthoMatrix, 0, winSize.width * cc.CONTENT_SCALE_FACTOR(), 0, winSize.height * cc.CONTENT_SCALE_FACTOR(), -1, 1);
        cc.kmGLMultMatrix(orthoMatrix);

        cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
        cc.kmGLLoadIdentity();
        cc.setProjectionMatrixDirty()
    }
});

/**
 * create one cc.GridBase Object
 * @param {cc.GridSize} gridSize
 * @param {cc.Texture2D} texture
 * @param {Boolean} flipped
 * @return {cc.GridBase}
 */
cc.GridBase.create = function (gridSize, texture, flipped) {
    var gridBase = new cc.GridBase();
    if (gridBase && gridBase.initWithSize(gridSize, texture, flipped))
        return gridBase;
    return null;
};

/**
 * cc.Grid3D is a 3D grid implementation. Each vertex has 3 dimensions: x,y,z
 * @class
 * @extends cc.GridBase
 */
cc.Grid3D = cc.GridBase.extend(/** @lends cc.Grid3D# */{
    _texCoordinates:null,
    _vertices:null,
    _originalVertices:null,
    _indices:null,

    _texCoordinateBuffer:null,
    _verticesBuffer:null,
    _indicesBuffer:null,

    ctor:function () {
        this._super();
    },

    /**
     * returns the vertex at a given position
     * @param {cc.GridSize} pos
     * @return {cc.Vertex3F}
     */
    vertex:function (pos) {
        var index = 0 | ((pos.x * (this._gridSize.height + 1) + pos.y) * 3);
        return new cc.Vertex3F(this._vertices[index], this._vertices[index + 1], this._vertices[index + 2]);
    },

    /**
     * returns the original (non-transformed) vertex at a given position
     * @param {cc.GridSize} pos
     * @return {cc.Vertex3F}
     */
    originalVertex:function (pos) {
        var index = 0 | ((pos.x * (this._gridSize.height + 1) + pos.y) * 3);
        return new cc.Vertex3F(this._originalVertices[index], this._originalVertices[index + 1], this._originalVertices[index + 2]);
    },

    /**
     * sets a new vertex at a given position
     * @param {cc.GridSize} pos
     * @param {cc.Vertex3F} vertex
     */
    setVertex:function (pos, vertex) {
        var index = 0 | ((pos.x * (this._gridSize.height + 1) + pos.y) * 3);
        var vertArray = this._vertices;
        vertArray[index] = vertex.x;
        vertArray[index + 1] = vertex.y;
        vertArray[index + 2] = vertex.z;
        this._dirty = true;
    },

    blit:function () {
        var n = this._gridSize.width * this._gridSize.height;
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_TEXCOORDS);
        this._shaderProgram.use();
        this._shaderProgram.setUniformsForBuiltins();

        var gl = cc.renderContext;
        //
        // Attributes
        //
        // position
        gl.bindBuffer(gl.ARRAY_BUFFER, this._verticesBuffer);
        if (this._dirty)
            gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 0, 0);

        // texCoords
        gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordinateBuffer);
        if (this._dirty)
            gl.bufferData(gl.ARRAY_BUFFER, this._texCoordinates, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indicesBuffer);
        if (this._dirty)
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.STATIC_DRAW);
        gl.drawElements(gl.TRIANGLES, n * 6, gl.UNSIGNED_SHORT, 0);
        if (this._dirty)
            this._dirty = false;
        cc.INCREMENT_GL_DRAWS(1);
    },

    reuse:function () {
        if (this._reuseGrid > 0) {
            for (var i = 0; i < this._vertices.length; i++)
                this._originalVertices[i] = this._vertices[i];
            --this._reuseGrid;
        }
    },

    calculateVertexPoints:function () {
        var gl = cc.renderContext;

        var width = this._texture.getPixelsWide();
        var height = this._texture.getPixelsHigh();
        var imageH = this._texture.getContentSizeInPixels().height;

        var numOfPoints = (this._gridSize.width + 1) * (this._gridSize.height + 1);
        this._vertices = new Float32Array(numOfPoints * 3);
        this._texCoordinates = new Float32Array(numOfPoints * 2);
        this._indices = new Uint16Array(this._gridSize.width * this._gridSize.height * 6);

        this._verticesBuffer = gl.createBuffer();
        this._texCoordinateBuffer = gl.createBuffer();
        this._indicesBuffer = gl.createBuffer();

        var x, y, i;
        for (x = 0; x < this._gridSize.width; ++x) {
            for (y = 0; y < this._gridSize.height; ++y) {
                var idx = (y * this._gridSize.width) + x;
                var x1 = x * this._step.x;
                var x2 = x1 + this._step.x;
                var y1 = y * this._step.y;
                var y2 = y1 + this._step.y;

                var a = (x * (this._gridSize.height + 1) + y);
                var b = ((x + 1) * (this._gridSize.height + 1) + y);
                var c = ((x + 1) * (this._gridSize.height + 1) + (y + 1));
                var d = (x * (this._gridSize.height + 1) + (y + 1));

                this._indices[idx * 6] = a;
                this._indices[idx * 6 + 1] = b;
                this._indices[idx * 6 + 2] = d;
                this._indices[idx * 6 + 3] = b;
                this._indices[idx * 6 + 4] = c;
                this._indices[idx * 6 + 5] = d;

                var l1 = [a * 3, b * 3, c * 3, d * 3];
                var e = new cc.Vertex3F(x1, y1, 0);
                var f = new cc.Vertex3F(x2, y1, 0);
                var g = new cc.Vertex3F(x2, y2, 0);
                var h = new cc.Vertex3F(x1, y2, 0);

                var l2 = [e, f, g, h];
                var tex1 = [a * 2, b * 2, c * 2, d * 2];
                var tex2 = [cc.p(x1, y1), cc.p(x2, y1), cc.p(x2, y2), cc.p(x1, y2)];
                for (i = 0; i < 4; ++i) {
                    this._vertices[l1[i]] = l2[i].x;
                    this._vertices[l1[i] + 1] = l2[i].y;
                    this._vertices[l1[i] + 2] = l2[i].z;
                    this._texCoordinates[tex1[i]] = tex2[i].x / width;
                    if (this._isTextureFlipped)
                        this._texCoordinates[tex1[i] + 1] = (imageH - tex2[i].y) / height;
                    else
                        this._texCoordinates[tex1[i] + 1] = tex2[i].y / height;
                }
            }
        }
        this._originalVertices = new Float32Array(this._vertices);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordinateBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this._texCoordinates, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indicesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.STATIC_DRAW);
        this._dirty = true;
    }
});

/**
 * create one Grid3D object
 * @param {cc.GridSize} gridSize
 * @param {cc.Texture2D} texture
 * @param {Boolean} flipped
 * @return {cc.Grid3D}
 */
cc.Grid3D.create = function (gridSize, texture, flipped) {
    var grid3D = new cc.Grid3D();
    if (grid3D && grid3D.initWithSize(gridSize, texture, flipped))
        return grid3D;
    return null;
};


/**
 * cc.TiledGrid3D is a 3D grid implementation. It differs from Grid3D in that   <br/>
 * the tiles can be separated from the grid.
 * @class
 * @extends cc.GridBase
 */
cc.TiledGrid3D = cc.GridBase.extend(/** @lends cc.TiledGrid3D# */{
    _texCoordinates:null,
    _vertices:null,
    _originalVertices:null,
    _indices:null,

    _texCoordinateBuffer:null,
    _verticesBuffer:null,
    _indicesBuffer:null,

    ctor:function () {
        this._super();
    },

    /**
     * returns the tile at the given position
     * @param {cc.GridSize} pos
     * @return {cc.Quad3}
     */
    tile:function (pos) {
        var idx = (this._gridSize.height * pos.x + pos.y) * 4 * 3;
        return new cc.Quad3(new cc.Vertex3F(this._vertices[idx], this._vertices[idx + 1], this._vertices[idx + 2]),
            new cc.Vertex3F(this._vertices[idx + 3], this._vertices[idx + 4], this._vertices[idx + 5]),
            new cc.Vertex3F(this._vertices[idx + 6 ], this._vertices[idx + 7], this._vertices[idx + 8]),
            new cc.Vertex3F(this._vertices[idx + 9], this._vertices[idx + 10], this._vertices[idx + 11]));
    },

    /**
     * returns the original tile (untransformed) at the given position
     * @param {cc.GridSize} pos
     * @return {cc.Quad3}
     */
    originalTile:function (pos) {
        var idx = (this._gridSize.height * pos.x + pos.y) * 4 * 3;
        return new cc.Quad3(new cc.Vertex3F(this._originalVertices[idx], this._originalVertices[idx + 1], this._originalVertices[idx + 2]),
            new cc.Vertex3F(this._originalVertices[idx + 3], this._originalVertices[idx + 4], this._originalVertices[idx + 5]),
            new cc.Vertex3F(this._originalVertices[idx + 6 ], this._originalVertices[idx + 7], this._originalVertices[idx + 8]),
            new cc.Vertex3F(this._originalVertices[idx + 9], this._originalVertices[idx + 10], this._originalVertices[idx + 11]));
    },

    /**
     * sets a new tile
     * @param {cc.GridSize} pos
     * @param {cc.Quad3} coords
     */
    setTile:function (pos, coords) {
        var idx = (this._gridSize.height * pos.x + pos.y) * 12;
        this._vertices[idx] = coords.bl.x;
        this._vertices[idx + 1] = coords.bl.y;
        this._vertices[idx + 2] = coords.bl.z;
        this._vertices[idx + 3] = coords.br.x;
        this._vertices[idx + 4] = coords.br.y;
        this._vertices[idx + 5] = coords.br.z;
        this._vertices[idx + 6] = coords.tl.x;
        this._vertices[idx + 7] = coords.tl.y;
        this._vertices[idx + 8] = coords.tl.z;
        this._vertices[idx + 9] = coords.tr.x;
        this._vertices[idx + 10] = coords.tr.y;
        this._vertices[idx + 11] = coords.tr.z;
        this._dirty = true;
    },

    blit:function () {
        var n = this._gridSize.width * this._gridSize.height;

        this._shaderProgram.use();
        this._shaderProgram.setUniformsForBuiltins();

        //
        // Attributes
        //
        var gl = cc.renderContext;
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_TEXCOORDS);

        // position
        gl.bindBuffer(gl.ARRAY_BUFFER, this._verticesBuffer);
        if (this._dirty)
            gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 0, this._vertices);

        // texCoords
        gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordinateBuffer);
        if (this._dirty)
            gl.bufferData(gl.ARRAY_BUFFER, this._texCoordinates, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 0, this._texCoordinates);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indicesBuffer);
        if (this._dirty)
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.STATIC_DRAW);
        gl.drawElements(gl.TRIANGLES, n * 6, gl.UNSIGNED_SHORT, 0);
        if (this._dirty)
            this._dirty = false;
        cc.INCREMENT_GL_DRAWS(1);
    },

    reuse:function () {
        if (this._reuseGrid > 0) {
            for (var i = 0; i < this._vertices.length; i++)
                this._originalVertices[i] = this._vertices[i];
            --this._reuseGrid;
        }
    },

    calculateVertexPoints:function () {
        var width = this._texture.getPixelsWide();
        var height = this._texture.getPixelsHigh();
        var imageH = this._texture.getContentSizeInPixels().height;

        var numQuads = this._gridSize.width * this._gridSize.height;
        this._vertices = new Float32Array(numQuads * 12);
        this._texCoordinates = new Float32Array(numQuads * 8);
        this._indices = new Uint16Array(numQuads * 6);

        var gl = cc.renderContext;
        this._verticesBuffer = gl.createBuffer();
        this._texCoordinateBuffer = gl.createBuffer();
        this._indicesBuffer = gl.createBuffer();

        var x, y, i = 0;
        for (x = 0; x < this._gridSize.width; x++) {
            for (y = 0; y < this._gridSize.height; y++) {
                var x1 = x * this._step.x;
                var x2 = x1 + this._step.x;
                var y1 = y * this._step.y;
                var y2 = y1 + this._step.y;

                this._vertices[i * 12] = x1;
                this._vertices[i * 12 + 1] = y1;
                this._vertices[i * 12 + 2] = 0;
                this._vertices[i * 12 + 3] = x2;
                this._vertices[i * 12 + 4] = y1;
                this._vertices[i * 12 + 5] = 0;
                this._vertices[i * 12 + 6] = x1;
                this._vertices[i * 12 + 7] = y2;
                this._vertices[i * 12 + 8] = 0;
                this._vertices[i * 12 + 9] = x2;
                this._vertices[i * 12 + 10] = y2;
                this._vertices[i * 12 + 11] = 0;

                var newY1 = y1;
                var newY2 = y2;

                if (this._isTextureFlipped) {
                    newY1 = imageH - y1;
                    newY2 = imageH - y2;
                }

                this._texCoordinates[i * 8] = x1 / width;
                this._texCoordinates[i * 8 + 1] = newY1 / height;
                this._texCoordinates[i * 8 + 2] = x2 / width;
                this._texCoordinates[i * 8 + 3] = newY1 / height;
                this._texCoordinates[i * 8 + 4] = x1 / width;
                this._texCoordinates[i * 8 + 5] = newY2 / height;
                this._texCoordinates[i * 8 + 6] = x2 / width;
                this._texCoordinates[i * 8 + 7] = newY2 / height;
                i++;
            }
        }

        for (x = 0; x < numQuads; x++) {
            this._indices[x * 6 + 0] = (x * 4 + 0);
            this._indices[x * 6 + 1] = (x * 4 + 1);
            this._indices[x * 6 + 2] = (x * 4 + 2);

            this._indices[x * 6 + 3] = (x * 4 + 1);
            this._indices[x * 6 + 4] = (x * 4 + 2);
            this._indices[x * 6 + 5] = (x * 4 + 3);
        }
        this._originalVertices = new Float32Array(this._vertices);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordinateBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this._texCoordinates, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indicesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.DYNAMIC_DRAW);
        this._dirty = true;
    }
});

/**
 * create one TiledGrid3D object
 * @param {cc.GridSize} gridSize
 * @param {cc.Texture2D} texture
 * @param {Boolean} flipped
 * @return {cc.TiledGrid3D}
 */
cc.TiledGrid3D.create = function (gridSize, texture, flipped) {
    var ret = new cc.TiledGrid3D();
    ret.initWithSize(gridSize, texture, flipped);
    return ret;
};
