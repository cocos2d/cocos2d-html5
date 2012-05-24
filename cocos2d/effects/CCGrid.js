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
    _m_bActive:null,
    _m_nReuseGrid:null,
    _m_sGridSize:null,
    _m_pTexture:null,
    _m_obStep:new cc.Point(),
    _m_pGrabber:null,
    _m_bIsTextureFlipped:null,
    /** wheter or not the grid is active */
    isActive:function () {
        return this._m_bActive;
    },
    setActive:function (bActive) {
        this._m_bActive = bActive;
        if (!bActive) {
            var pDirector = cc.Director.sharedDirector();
            var proj = pDirector.getProjection();
            pDirector.setProjection(proj);
        }
    },

    /** number of times that the grid will be reused */
    getReuseGrid:function () {
        return this._m_nReuseGrid;
    },
    setReuseGrid:function (nReuseGrid) {
        this._m_nReuseGrid = nReuseGrid;
    },

    /** size of the grid */
    getGridSize:function () {
        return this._m_sGridSize;
    },
    setGridSize:function (gridSize) {
        this._m_sGridSize.x = parseInt(gridSize.x);
        this._m_sGridSize.y = parseInt(gridSize.y);
    },

    /** pixels between the grids */
    getStep:function () {
        return this._m_obStep;
    },
    setStep:function (step) {
        this._m_obStep = step;
    },

    /** is texture flipped */
    isTextureFlipped:function () {
        return this._m_bIsTextureFlipped;
    },
    setIsTextureFlipped:function (bFlipped) {
        if (this._m_bIsTextureFlipped != bFlipped) {
            this._m_bIsTextureFlipped = bFlipped;
            this.calculateVertexPoints();
        }
    },

    initWithSize:function (gridSize, pTexture, bFlipped) {
        var argnum = arguments.length;
        if (argnum = 1) {
            var pDirector = cc.Director.sharedDirector();
            var s = pDirector.getWinSizeInPixels();

            var POTWide = cc.NextPOT(s.width);
            var POTHigh = cc.NextPOT(s.height);

            // we only use rgba8888
            var format = cc.kCCTexture2DPixelFormat_RGBA8888;

            var pTextureTemp = new cc.Texture2D();
            pTextureTemp.initWithData(format, POTWide, POTHigh, s);
            if (!pTextureTemp) {
                cc.LOG("cocos2d: CCGrid: error creating texture");
                return false;
            }
            pTexture = pTextureTemp;

            bFlipped = false;
        }


        var bRet = true;

        this._m_bActive = false;
        this._m_nReuseGrid = 0;
        this._m_sGridSize = gridSize;
        this._m_pTexture = pTexture;
        this._m_bIsTextureFlipped = bFlipped;

        var texSize = this._m_pTexture.getContentSizeInPixels();
        this._m_obStep.x = texSize.width / this._m_sGridSize.x;
        this._m_obStep.y = texSize.height / this._m_sGridSize.y;

        this._m_pGrabber = new cc.Grabber();
        if (this._m_pGrabber) {
            this._m_pGrabber.grab(this._m_pTexture);
        }
        else {
            bRet = false;
        }


        this.calculateVertexPoints();

        return bRet;

    },

    beforeDraw:function () {
        this.set2DProjection();
        this._m_pGrabber.beforeRender(this._m_pTexture);
    },
    afterDraw:function (pTarget) {
        this._m_pGrabber.afterRender(this._m_pTexture);

        this.set3DProjection();
        this._applyLandscape();

        if (pTarget.getCamera().getDirty()) {
            var offset = pTarget.getAnchorPointInPixels();

            //
            // XXX: Camera should be applied in the AnchorPoint
            //
            //todo gl
            //ccglTranslate(offset.x, offset.y, 0);
            pTarget.getCamera().locate();
            //ccglTranslate(-offset.x, -offset.y, 0);
        }
//todo gl
        //glBindTexture(GL_TEXTURE_2D, this._m_pTexture.getName());

        // restore projection for default FBO .fixed bug #543 #544
        cc.Director.sharedDirector().setProjection(cc.Director.sharedDirector().getProjection());
        cc.Director.sharedDirector().applyOrientation();
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
        var winSize = cc.Director.sharedDirector().getWinSizeInPixels();
//todo gl
        /* glLoadIdentity();

         // set view port for user FBO, fixed bug #543 #544
         glViewport(0, 0, winSize.width, winSize.height);
         glMatrixMode(GL_PROJECTION);
         glLoadIdentity();
         ccglOrtho(0, winSize.width, 0, winSize.height, -1024, 1024);
         glMatrixMode(GL_MODELVIEW);*/
    },
    set3DProjection:function () {
        var winSize = cc.Director.sharedDirector().getDisplaySizeInPixels();
//todo gl
        /* // set view port for user FBO, fixed bug #543 #544
         glViewport(0, 0, winSize.width, winSize.height);
         glMatrixMode(GL_PROJECTION);
         glLoadIdentity();
         gluPerspective(60, winSize.width/winSize.height, 0.5, 1500.0);

         glMatrixMode(GL_MODELVIEW);
         glLoadIdentity();
         gluLookAt( winSize.width/2, winSize.height/2, cc.Director.sharedDirector().getZEye(),
         winSize.width/2, winSize.height/2, 0,
         0.0, 1.0, 0.0
         );*/
    },
    _applyLandscape:function () {
        var pDirector = cc.Director.sharedDirector();

        var winSize = pDirector.getDisplaySizeInPixels();
        var w = winSize.width / 2;
        var h = winSize.height / 2;

        var orientation = pDirector.getDeviceOrientation();

        switch (orientation) {
            //todo gl
            case cc.DeviceOrientationLandscapeLeft:
                /*glTranslatef(w,h,0);
                 glRotatef(-90,0,0,1);
                 glTranslatef(-h,-w,0);*/
                break;
            case cc.DeviceOrientationLandscapeRight:
                /*glTranslatef(w,h,0);
                 glRotatef(90,0,0,1);
                 glTranslatef(-h,-w,0);*/
                break;
            case cc.DeviceOrientationPortraitUpsideDown:
                /*glTranslatef(w,h,0);
                 glRotatef(180,0,0,1);
                 glTranslatef(-w,-h,0);*/
                break;
            default:
                break;
        }
    }
});
cc.GridBase.gridWithSize = function () {
    var pGridBase = new cc.GridBase();
    return pGridBase;
};

/**
 cc.Grid3D is a 3D grid implementation. Each vertex has 3 dimensions: x,y,z
 */
cc.Grid3D = cc.GridBase.extend({
    _m_pTexCoordinates:null,
    _m_pVertices:null,
    _m_pOriginalVertices:null,
    _m_pIndices:null,
    /** returns the vertex at a given position */
    vertex:function (pos) {
        var index = (pos.x * (this._m_sGridSize.y + 1) + pos.y) * 3;
        var vertArray = this._m_pVertices;

        var vert = new cc.Vertex3F(vertArray[index], vertArray[index + 1], vertArray[index + 2]);

        return vert;
    },
    /** returns the original (non-transformed) vertex at a given position */
    originalVertex:function (pos) {
        var index = (pos.x * (this._m_sGridSize.y + 1) + pos.y) * 3;
        var vertArray = this._m_pOriginalVertices;

        var vert = new cc.Vertex3F(vertArray[index], vertArray[index + 1], vertArray[index + 2]);

        return vert;
    },
    /** sets a new vertex at a given position */
    setVertex:function (pos, vertex) {
        var index = (pos.x * (this._m_sGridSize.y + 1) + pos.y) * 3;
        var vertArray = this._m_pVertices;
        vertArray[index] = vertex.x;
        vertArray[index + 1] = vertex.y;
        vertArray[index + 2] = vertex.z;
    },

    blit:function () {
        var n = this._m_sGridSize.x * this._m_sGridSize.y;

        // Default GL states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_TEXTURE_COORD_ARRAY
        // Needed states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_TEXTURE_COORD_ARRAY
        // Unneeded states: GL_COLOR_ARRAY
        //todo gl
        /*glDisableClientState(GL_COLOR_ARRAY);

         glVertexPointer(3, GL_FLOAT, 0, this._m_pVertices);
         glTexCoordPointer(2, GL_FLOAT, 0, this._m_pTexCoordinates);
         glDrawElements(GL_TRIANGLES, n*6, GL_UNSIGNED_SHORT, this._m_pIndices);

         // restore default GL state
         glEnableClientState(GL_COLOR_ARRAY);*/
    },
    reuse:function () {
        if (this._m_nReuseGrid > 0) {
            --this._m_nReuseGrid;
        }
    },
    calculateVertexPoints:function () {
        var width = this._m_pTexture.getPixelsWide();
        var height = this._m_pTexture.getPixelsHigh();
        var imageH = this._m_pTexture.getContentSizeInPixels().height;

        var numQuads = this._m_sGridSize.x * this._m_sGridSize.y;

        this._m_pVertices = [];
        this._m_pOriginalVertices = [];
        this._m_pTexCoordinates = [];
        this._m_pIndices = [];

        var vertArray = this._m_pVertices;
        var texArray = this._m_pTexCoordinates;
        var idxArray = this._m_pIndices;

        var x, y;

        for (x = 0; x < this._m_sGridSize.x; x++) {
            for (y = 0; y < this._m_sGridSize.y; y++) {
                var x1 = x * this._m_obStep.x;
                var x2 = x1 + this._m_obStep.x;
                var y1 = y * this._m_obStep.y;
                var y2 = y1 + this._m_obStep.y;

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

                if (this._m_bIsTextureFlipped) {
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

cc.Grid3D.gridWithSize = function (gridSize, pTexture, bFlipped) {

};
cc.Grid3D.gridWithSize = function (gridSize) {

};

/**
 cc.TiledGrid3D is a 3D grid implementation. It differs from Grid3D in that
 the tiles can be separated from the grid.
 */
cc.TiledGrid3D = cc.GridBase.extend({
    _m_pTexCoordinates:null,
    _m_pVertices:null,
    _m_pOriginalVertices:null,
    _m_pIndices:null,
    /** returns the tile at the given position */
    tile:function (pos) {
        var idx = (this._m_sGridSize.y * pos.x + pos.y) * 4 * 3;
        var vertArray = this._m_pVertices;
        var ret = new cc.Quad3();
        return ret;
    },
    /** returns the original tile (untransformed) at the given position */
    originalTile:function (pos) {
        var idx = (this._m_sGridSize.y * pos.x + pos.y) * 4 * 3;
        var vertArray = this._m_pOriginalVertices;

        var ret = new cc.Quad3(vertArray[idx], vertArray[idx + 1], vertArray[idx + 2], vertArray[idx + 3]);

        return ret;
    },
    /** sets a new tile */
    setTile:function (pos, coords) {
        var idx = (this._m_sGridSize.y * pos.x + pos.y) * 4 * 3;
        var vertArray = this._m_pVertices;
        vertArray[idx] = coords;
    },

    blit:function () {
        var n = this._m_sGridSize.x * this._m_sGridSize.y;

        // Default GL states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_COLOR_ARRAY, GL_TEXTURE_COORD_ARRAY
        // Needed states: GL_TEXTURE_2D, GL_VERTEX_ARRAY, GL_TEXTURE_COORD_ARRAY
        // Unneeded states: GL_COLOR_ARRAY
        //todo gl
        /*glDisableClientState(GL_COLOR_ARRAY);

         glVertexPointer(3, GL_FLOAT, 0, this._m_pVertices);
         glTexCoordPointer(2, GL_FLOAT, 0, this._m_pTexCoordinates);
         glDrawElements(GL_TRIANGLES, (GLsizei)n*6, GL_UNSIGNED_SHORT, this._m_pIndices);

         // restore default GL state
         glEnableClientState(GL_COLOR_ARRAY);*/
    },
    reuse:function () {
        if (this._m_nReuseGrid > 0) {
            var numQuads = this._m_sGridSize.x * this._m_sGridSize.y;
            for (var i = 0, len = numQuads.length * 12; i < len; i++) {
                this._m_pOriginalVertices.push(this._m_pVertices[i])
            }
            //todo fix
            //memcpy(this._m_pOriginalVertices, this._m_pVertices, numQuads * 12 * sizeof(GLfloat));
            --this._m_nReuseGrid;
        }
    },
    calculateVertexPoints:function () {
        var width = this._m_pTexture.getPixelsWide();
        var height = this._m_pTexture.getPixelsHigh();
        var imageH = this._m_pTexture.getContentSizeInPixels().height;

        var numQuads = this._m_sGridSize.x * this._m_sGridSize.y;

        this._m_pVertices = [];
        this._m_pOriginalVertices = [];
        this._m_pTexCoordinates = [];
        this._m_pIndices = [];

        var vertArray = this._m_pVertices;
        var texArray = this._m_pTexCoordinates;
        var idxArray = this._m_pIndices;

        var x, y;

        for (x = 0; x < this._m_sGridSize.x; x++) {
            for (y = 0; y < this._m_sGridSize.y; y++) {
                var x1 = x * this._m_obStep.x;
                var x2 = x1 + this._m_obStep.x;
                var y1 = y * this._m_obStep.y;
                var y2 = y1 + this._m_obStep.y;

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

                if (this._m_bIsTextureFlipped) {
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
            this._m_pOriginalVertices.push(this._m_pVertices[i])
        }
        //todo fix
        //memcpy(this._m_pOriginalVertices, this._m_pVertices, numQuads * 12 * sizeof(GLfloat));
    }
});

cc.TiledGrid3D.gridWithSize = function (gridSize, pTexture, bFlipped) {
    var pRet = new cc.TiledGrid3D();
    pRet.initWithSize(gridSize, pTexture, bFlipped)
    return pRet;
};