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

var cc = cc = cc || {};

/** Base class for other
 */
cc.GridBase = cc.Class.extend({
    _active:null,
    _reuseGrid:null,
    _gridSize:null,
    _texture:null,
    _step:cc.p(0, 0),
    _grabber:null,
    _isTextureFlipped:null,
    /** wheter or not the grid is active */
    isActive:function () {
        return this._active;
    },
    setActive:function (active) {
        this._active = active;
        if (!active) {
            var director = cc.Director.getInstance();
            var proj = director.getProjection();
            director.setProjection(proj);
        }
    },

    /** number of times that the grid will be reused */
    getReuseGrid:function () {
        return this._reuseGrid;
    },
    setReuseGrid:function (reuseGrid) {
        this._reuseGrid = reuseGrid;
    },

    /** size of the grid */
    getGridSize:function () {
        return this._gridSize;
    },
    setGridSize:function (gridSize) {
        this._gridSize.x = parseInt(gridSize.x);
        this._gridSize.y = parseInt(gridSize.y);
    },

    /** pixels between the grids */
    getStep:function () {
        return this._step;
    },
    setStep:function (step) {
        this._step = step;
    },

    /** is texture flipped */
    isTextureFlipped:function () {
        return this._isTextureFlipped;
    },
    setIsTextureFlipped:function (flipped) {
        if (this._isTextureFlipped != flipped) {
            this._isTextureFlipped = flipped;
            this.calculateVertexPoints();
        }
    },

    initWithSize:function (gridSize, texture, flipped) {
        var argnum = arguments.length;
        if (argnum == 1) {
            var director = cc.Director.getInstance();
            var s = director.getWinSizeInPixels();

            var POTWide = cc.NextPOT(s.width);
            var POTHigh = cc.NextPOT(s.height);

            // we only use rgba8888
            var format = cc.TEXTURE_PIXELFORMAT_RGBA8888;

            var pTextureTemp = new cc.Texture2D();
            pTextureTemp.initWithData(format, POTWide, POTHigh, s);
            if (!pTextureTemp) {
                cc.log("cocos2d: CCGrid: error creating texture");
                return false;
            }
            texture = pTextureTemp;

            flipped = false;
        }


        var ret = true;

        this._active = false;
        this._reuseGrid = 0;
        this._gridSize = gridSize;
        this._texture = texture;
        this._isTextureFlipped = flipped;

        var texSize = this._texture.getContentSizeInPixels();
        this._step.x = texSize.width / this._gridSize.x;
        this._step.y = texSize.height / this._gridSize.y;

        this._grabber = new cc.Grabber();
        if (this._grabber) {
            this._grabber.grab(this._texture);
        }
        else {
            ret = false;
        }


        this.calculateVertexPoints();

        return ret;

    },

    beforeDraw:function () {
        this.set2DProjection();
        this._grabber.beforeRender(this._texture);
    },
    afterDraw:function (target) {
        this._grabber.afterRender(this._texture);

        this.set3DProjection();

        if (target.getCamera().getDirty()) {
            var offset = target.getAnchorPointInPixels();

            //
            // XXX: Camera should be applied in the AnchorPoint
            //
            //todo gl
            //ccglTranslate(offset.x, offset.y, 0);
            target.getCamera().locate();
            //ccglTranslate(-offset.x, -offset.y, 0);
        }
//todo gl
        //glBindTexture(GL_TEXTURE_2D, this._texture.getName());

        // restore projection for default FBO .fixed bug #543 #544
        //cc.Director.getInstance().setProjection(cc.Director.getInstance().getProjection());
        //cc.Director.getInstance().applyOrientation();
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

        //todo gl
        /* glViewport(0, 0, (GLsizei)(size.width * CC_CONTENT_SCALE_FACTOR()), (GLsizei)(size.height * CC_CONTENT_SCALE_FACTOR()) );
         kmGLMatrixMode(KM_GL_PROJECTION);
         kmGLLoadIdentity();

         kmMat4 orthoMatrix;
         kmMat4OrthographicProjection(&orthoMatrix, 0, size.width * CC_CONTENT_SCALE_FACTOR(), 0, size.height * CC_CONTENT_SCALE_FACTOR(), -1, 1);
         kmGLMultMatrix( &orthoMatrix );

         kmGLMatrixMode(KM_GL_MODELVIEW);
         kmGLLoadIdentity();


         ccSetProjectionMatrixDirty();*/
    }
});
cc.GridBase.create = function () {
    return new cc.GridBase();
};

/**
 cc.Grid3D is a 3D grid implementation. Each vertex has 3 dimensions: x,y,z
 */
cc.Grid3D = cc.GridBase.extend({
    _texCoordinates:null,
    _vertices:null,
    _originalVertices:null,
    _indices:null,
    /** returns the vertex at a given position */
    vertex:function (pos) {
        var index = (pos.x * (this._gridSize.y + 1) + pos.y) * 3;
        var vertArray = this._vertices;

        var vert = new cc.Vertex3F(vertArray[index], vertArray[index + 1], vertArray[index + 2]);

        return vert;
    },
    /** returns the original (non-transformed) vertex at a given position */
    originalVertex:function (pos) {
        var index = (pos.x * (this._gridSize.y + 1) + pos.y) * 3;
        var vertArray = this._originalVertices;

        var vert = new cc.Vertex3F(vertArray[index], vertArray[index + 1], vertArray[index + 2]);

        return vert;
    },
    /** sets a new vertex at a given position */
    setVertex:function (pos, vertex) {
        var index = (pos.x * (this._gridSize.y + 1) + pos.y) * 3;
        var vertArray = this._vertices;
        vertArray[index] = vertex.x;
        vertArray[index + 1] = vertex.y;
        vertArray[index + 2] = vertex.z;
    },

    blit:function () {
        var n = this._gridSize.x * this._gridSize.y;

        // Default GL states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_TEXTURE_COORD_ARRAY
        // Needed states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_TEXTURE_COORD_ARRAY
        // Unneeded states: GL_COLOR_ARRAY
        //todo gl
        /*glDisableClientState(GL_COLOR_ARRAY);

         glVertexPointer(3, GL_FLOAT, 0, this._vertices);
         glTexCoordPointer(2, GL_FLOAT, 0, this._texCoordinates);
         glDrawElements(GL_TRIANGLES, n*6, GL_UNSIGNED_SHORT, this._indices);

         // restore default GL state
         glEnableClientState(GL_COLOR_ARRAY);*/
    },
    reuse:function () {
        if (this._reuseGrid > 0) {
            --this._reuseGrid;
        }
    },
    calculateVertexPoints:function () {
        var width = this._texture.getPixelsWide();
        var height = this._texture.getPixelsHigh();
        var imageH = this._texture.getContentSizeInPixels().height;

        var numQuads = this._gridSize.x * this._gridSize.y;

        this._vertices = [];
        this._originalVertices = [];
        this._texCoordinates = [];
        this._indices = [];

        var vertArray = this._vertices;
        var texArray = this._texCoordinates;
        var idxArray = this._indices;

        var x, y;

        for (x = 0; x < this._gridSize.x; x++) {
            for (y = 0; y < this._gridSize.y; y++) {
                var x1 = x * this._step.x;
                var x2 = x1 + this._step.x;
                var y1 = y * this._step.y;
                var y2 = y1 + this._step.y;

                vertArray[x * y] = x1;
                vertArray[x * y + 1] = y1;
                vertArray[x * y + 2] = 0;
                vertArray[x * y + 3] = x2;
                vertArray[x * y + 4] = y1;
                vertArray[x * y + 5] = 0;
                vertArray[x * y + 6] = x1;
                vertArray[x * y + 7] = y2;
                vertArray[x * y + 8] = 0;
                vertArray[x * y + 9] = x2;
                vertArray[x * y + 10] = y2;
                vertArray[x * y + 11] = 0;

                var newY1 = y1;
                var newY2 = y2;

                if (this._isTextureFlipped) {
                    newY1 = imageH - y1;
                    newY2 = imageH - y2;
                }

                texArray[x * y + 12] = x1 / width;
                texArray[x * y + 13] = newY1 / height;
                texArray[x * y + 14] = x2 / width;
                texArray[x * y + 15] = newY1 / height;
                texArray[x * y + 16] = x1 / width;
                texArray[x * y + 17] = newY2 / height;
                texArray[x * y + 18] = x2 / width;
                texArray[x * y + 19] = newY2 / height;
            }
        }

        for (x = 0; x < numQuads; x++) {
            idxArray[x * 6 + 0] = x * 4 + 0;
            idxArray[x * 6 + 1] = x * 4 + 1;
            idxArray[x * 6 + 2] = x * 4 + 2;

            idxArray[x * 6 + 3] = x * 4 + 1;
            idxArray[x * 6 + 4] = x * 4 + 2;
            idxArray[x * 6 + 5] = x * 4 + 3;
        }

    }
});

cc.Grid3D.create = function (gridSize, texture, flipped) {

};

/**
 cc.TiledGrid3D is a 3D grid implementation. It differs from Grid3D in that
 the tiles can be separated from the grid.
 */
cc.TiledGrid3D = cc.GridBase.extend({
    _texCoordinates:null,
    _vertices:null,
    _originalVertices:null,
    _indices:null,
    /** returns the tile at the given position */
    tile:function (pos) {
        var idx = (this._gridSize.y * pos.x + pos.y) * 4 * 3;
        var vertArray = this._vertices;
        var ret = new cc.Quad3();
        return ret;
    },
    /** returns the original tile (untransformed) at the given position */
    originalTile:function (pos) {
        var idx = (this._gridSize.y * pos.x + pos.y) * 4 * 3;
        var vertArray = this._originalVertices;

        var ret = new cc.Quad3(vertArray[idx], vertArray[idx + 1], vertArray[idx + 2], vertArray[idx + 3]);

        return ret;
    },
    /** sets a new tile */
    setTile:function (pos, coords) {
        var idx = (this._gridSize.y * pos.x + pos.y) * 4 * 3;
        var vertArray = this._vertices;
        vertArray[idx] = coords;
    },

    blit:function () {
        var n = this._gridSize.x * this._gridSize.y;

        // Default GL states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_TEXTURE_COORD_ARRAY
        // Needed states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_TEXTURE_COORD_ARRAY
        // Unneeded states: GL_COLOR_ARRAY
        //todo gl
        /*glDisableClientState(GL_COLOR_ARRAY);

         glVertexPointer(3, GL_FLOAT, 0, this._vertices);
         glTexCoordPointer(2, GL_FLOAT, 0, this._texCoordinates);
         glDrawElements(GL_TRIANGLES, (GLsizei)n*6, GL_UNSIGNED_SHORT, this._indices);

         // restore default GL state
         glEnableClientState(GL_COLOR_ARRAY);*/
    },
    reuse:function () {
        if (this._reuseGrid > 0) {
            var numQuads = this._gridSize.x * this._gridSize.y;
            for (var i = 0, len = numQuads.length * 12; i < len; i++) {
                this._originalVertices.push(this._vertices[i])
            }
            //todo fix
            //memcpy(this._originalVertices, this._vertices, numQuads * 12 * sizeof(GLfloat));
            --this._reuseGrid;
        }
    },
    calculateVertexPoints:function () {
        var width = this._texture.getPixelsWide();
        var height = this._texture.getPixelsHigh();
        var imageH = this._texture.getContentSizeInPixels().height;

        var numQuads = this._gridSize.x * this._gridSize.y;

        this._vertices = [];
        this._originalVertices = [];
        this._texCoordinates = [];
        this._indices = [];

        var vertArray = this._vertices;
        var texArray = this._texCoordinates;
        var idxArray = this._indices;

        var x, y;

        for (x = 0; x < this._gridSize.x; x++) {
            for (y = 0; y < this._gridSize.y; y++) {
                var x1 = x * this._step.x;
                var x2 = x1 + this._step.x;
                var y1 = y * this._step.y;
                var y2 = y1 + this._step.y;

                vertArray[x * y] = x1;
                vertArray[x * y + 1] = y1;
                vertArray[x * y + 2] = 0;
                vertArray[x * y + 3] = x2;
                vertArray[x * y + 4] = y1;
                vertArray[x * y + 5] = 0;
                vertArray[x * y + 6] = x1;
                vertArray[x * y + 7] = y2;
                vertArray[x * y + 8] = 0;
                vertArray[x * y + 9] = x2;
                vertArray[x * y + 10] = y2;
                vertArray[x * y + 11] = 0;
                var newY1 = y1;
                var newY2 = y2;

                if (this._isTextureFlipped) {
                    newY1 = imageH - y1;
                    newY2 = imageH - y2;
                }

                texArray[x * y + 12] = x1 / width;
                texArray[x * y + 13] = newY1 / height;
                texArray[x * y + 14] = x2 / width;
                texArray[x * y + 15] = newY1 / height;
                texArray[x * y + 16] = x1 / width;
                texArray[x * y + 17] = newY2 / height;
                texArray[x * y + 18] = x2 / width;
                texArray[x * y + 19] = newY2 / height;
            }
        }

        for (x = 0; x < numQuads; x++) {
            idxArray[x * 6 + 0] = x * 4 + 0;
            idxArray[x * 6 + 1] = x * 4 + 1;
            idxArray[x * 6 + 2] = x * 4 + 2;

            idxArray[x * 6 + 3] = x * 4 + 1;
            idxArray[x * 6 + 4] = x * 4 + 2;
            idxArray[x * 6 + 5] = x * 4 + 3;
        }
        for (var i = 0, len = numQuads.length * 12; i < len; i++) {
            this._originalVertices.push(this._vertices[i])
        }
        //todo fix
        //memcpy(this._originalVertices, this._vertices, numQuads * 12 * sizeof(GLfloat));
    }
});

cc.TiledGrid3D.create = function (gridSize, texture, flipped) {
    var ret = new cc.TiledGrid3D();
    ret.initWithSize(gridSize, texture, flipped)
    return ret;
};
