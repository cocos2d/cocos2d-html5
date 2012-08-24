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
 * @constant
 * @type Number
 */
cc.TGA_OK = 0;

/**
 * @constant
 * @type Number
 */
cc.TGA_ERROR_FILE_OPEN = 1;

/**
 * @constant
 * @type Number
 */
cc.TGA_ERROR_READING_FILE = 2;

/**
 * @constant
 * @type Number
 */
cc.TGA_ERROR_INDEXED_COLOR = 3;

/**
 * @constant
 * @type Number
 */
cc.TGA_ERROR_MEMORY = 4;

/**
 * @constant
 * @type Number
 */
cc.TGA_ERROR_COMPRESSED_FILE = 5;

function cc.ImageTGA(status, type, pixelDepth, width, height, imageData, flipped) {
    this.status = status;
    this.type = type;
    this.pixelDepth = pixelDepth;
    /** map width */
    this.width = width;
    /** map height */
    this.height = height;
    /** raw data */
    this.imageData = imageData;
    this.flipped = flipped;
}

/**
 * <p>cc.TileMapAtlas is a subclass of cc.AtlasNode.</p>
 *
 * <p>It knows how to render a map based of tiles.<br/>
 * The tiles must be in a .PNG format while the map must be a .TGA file. </p>
 *
 * <p>For more information regarding the format, please see this post: <br/>
 * http://www.cocos2d-iphone.org/archives/27 </p>
 *
 * <p>All features from cc.AtlasNode are valid in cc.TileMapAtlas</p>
 *
 * <p>IMPORTANT: <br/>
 * This class is deprecated. It is maintained for compatibility reasons only.<br/>
 * You SHOULD not use this class. <br/>
 * Instead, use the newer TMX file format: cc.TMXTiledMap </p>
 * @class
 * @extends cc.AtlasNode
 */
cc.TileMapAtlas = cc.AtlasNode.extend(/** @lends cc.TileMapAtlas# */{
    _GAInfo:null,
    indices:null,
    //numbers of tiles to render
    _itemsToRender:0,
    //x,y to altas dictionary
    _posToAtlasIndex:null,

    /**
     * @return {cc.ImageTGA}
     */
    getTGAInfo:function () {
        return this._GAInfo;
    },

    /**
     * @param  {cc.ImageTGA} Var
     */
    setTGAInfo:function (Var) {
        this._GAInfo = Var;
    },

    /**
     * Initializes a cc.TileMap with a tile file (atlas) with a map file and the width and height of each tile in points.<br />
     * The file will be loaded using the TextureMgr.
     * @param {String} tile
     * @param {String} mapFile
     * @param {Number} tileWidth
     * @param {Number} tileHeight
     * @return {Boolean}
     * @example
     * //example
     * var tmpAtlas = new cc.TileMapAtlas();
     * tmpAtlas.initWithTileFile("hello.png", "hello.tga", 16, 16);
     */
    initWithTileFile:function (tile, mapFile, tileWidth, tileHeight) {
        this._loadTGAfile(mapFile);
        this._calculateItemsToRender();
        if (this.initWithTileFile(tile, tileWidth, tileHeight, this._itemsToRender)) {
            this._color = cc.white();
            this._posToAtlasIndex = new Object();
            this._updateAtlasValues();
            this.setContentSize(cc.size((this._GAInfo.width * this._itemWidth),
                (this._GAInfo.height * this._itemHeight)));
            return true;
        }
        return false;
    },

    /**
     * <p>Returns a tile from position x,y.<br />
     * For the moment only channel R is used. </p>
     * @param {cc.Point} position
     * @return {cc.Sprite}
     */
    tileAt:function (position) {
        cc.Assert(this._GAInfo != null, "tgaInfo must not be nil");
        cc.Assert(position.x < this._GAInfo.width, "Invalid position.x");
        cc.Assert(position.y < this._GAInfo.height, "Invalid position.y");

        var ptr = this._GAInfo.imageData;
        var value = ptr[position.x + position.y * this._GAInfo.width];

        return value;
    },

    /**
     * Sets a tile at position x,y.
     * For the moment only channel R is used
     * @param {cc.Sprite} tile
     * @param {cc.Point} position
     */
    setTile:function (tile, position) {
        cc.Assert(this._GAInfo != null, "tgaInfo must not be nil");
        cc.Assert(this._posToAtlasIndex != null, "posToAtlasIndex must not be nil");
        cc.Assert(position.x < this._GAInfo.width, "Invalid position.x");
        cc.Assert(position.y < this._GAInfo.height, "Invalid position.x");
        cc.Assert(tile.r != 0, "R component must be non 0");

        var ptr = this._GAInfo.imageData;
        var value = ptr[position.x + position.y * this._GAInfo.width];
        if (value.r == 0) {
            cc.log("cocos2d: Value.r must be non 0.");
        } else {
            ptr[position.x + position.y * this._GAInfo.width] = tile;

            var num = this._posToAtlasIndex[position.x + "" + position.y];
            this._updateAtlasValueAt(position, tile, num);
        }
    },

    /**
     * Dealloc the map from memory
     */
    releaseMap:function () {
        if (this._GAInfo) {
            cc.tgaDestroy(this._GAInfo);
        }
        this._GAInfo = null;
    },

    _loadTGAfile:function (file) {
        cc.Assert(file != null, "file must be non-nil");

        //	//Find the path of the file
        //	NSBundle *mainBndl = [cc.Director sharedDirector].loadingBundle;
        //	cc.String *resourcePath = [mainBndl resourcePath];
        //	cc.String * path = [resourcePath stringByAppendingPathComponent:file];

        this._GAInfo = cc.tgaLoad(cc.FileUtils.getInstance().fullPathFromRelativePath(file));
        if (this._GAInfo.status != cc.TGA_OK) {
            cc.Assert(0, "TileMapAtlasLoadTGA : TileMapAtas cannot load TGA file");
        }
    },

    _calculateItemsToRender:function () {
        cc.Assert(this._GAInfo != null, "tgaInfo must be non-nil");

        this._itemsToRender = 0;
        for (var x = 0; x < this._GAInfo.width; x++) {
            for (var y = 0; y < this._GAInfo.height; y++) {
                var ptr = this._GAInfo.imageData;
                var value = ptr[x + y * this._GAInfo.width];
                if (value.r) {
                    ++this._itemsToRender;
                }
            }
        }
    },

    _updateAtlasValueAt:function (pos, value, index) {
        var quad = new cc.V3F_C4B_T2F_Quad();

        var x = pos.x;
        var y = pos.y;
        var row = (value.r % this._itemsPerRow);
        var col = (value.r / this._itemsPerRow);

        var textureWide = this._textureAtlas.getTexture().getPixelsWide();
        var textureHigh = this._textureAtlas.getTexture().getPixelsHigh();

        var itemWidthInPixels = this._itemWidth * cc.CONTENT_SCALE_FACTOR();
        var itemHeightInPixels = this._itemHeight * cc.CONTENT_SCALE_FACTOR();

        if (cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL) {
            var left = (2 * row * itemWidthInPixels + 1) / (2 * textureWide);
            var right = left + (itemWidthInPixels * 2 - 2) / (2 * textureWide);
            var top = (2 * col * itemHeightInPixels + 1) / (2 * textureHigh);
            var bottom = top + (itemHeightInPixels * 2 - 2) / (2 * textureHigh);
        } else {
            var left = (row * itemWidthInPixels) / textureWide;
            var right = left + itemWidthInPixels / textureWide;
            var top = (col * itemHeightInPixels) / textureHigh;
            var bottom = top + itemHeightInPixels / textureHigh;
        }

        quad.tl.texCoords.u = left;
        quad.tl.texCoords.v = top;
        quad.tr.texCoords.u = right;
        quad.tr.texCoords.v = top;
        quad.bl.texCoords.u = left;
        quad.bl.texCoords.v = bottom;
        quad.br.texCoords.u = right;
        quad.br.texCoords.v = bottom;

        quad.bl.vertices.x = (x * this._itemWidth);
        quad.bl.vertices.y = (y * this._itemHeight);
        quad.bl.vertices.z = 0.0;
        quad.br.vertices.x = (x * this._itemWidth + this._itemWidth);
        quad.br.vertices.y = (y * this._itemHeight);
        quad.br.vertices.z = 0.0;
        quad.tl.vertices.x = (x * this._itemWidth);
        quad.tl.vertices.y = (y * this._itemHeight + this._itemHeight);
        quad.tl.vertices.z = 0.0;
        quad.tr.vertices.x = (x * this._itemWidth + this._itemWidth);
        quad.tr.vertices.y = (y * this._itemHeight + this._itemHeight);
        quad.tr.vertices.z = 0.0;

        var color = new cc.Color4B(this._color.r, this._color.g, this._color.b, this._opacity);
        quad.tr.colors = color;
        quad.tl.colors = color;
        quad.br.colors = color;
        quad.bl.colors = color;

        this._textureAtlas.updateQuad(quad, index);
    },

    _updateAtlasValues:function () {
        cc.Assert(this._GAInfo != null, "tgaInfo must be non-nil");

        var total = 0;

        for (var x = 0; x < this._GAInfo.width; x++) {
            for (var y = 0; y < this._GAInfo.height; y++) {
                if (total < this._itemsToRender) {
                    var ptr = this._GAInfo.imageData;
                    var value = ptr[x + y * this._GAInfo.width];

                    if (value.r != 0) {
                        this._updateAtlasValueAt(cc.g(x, y), value, total);
                        this._posToAtlasIndex[x + "" + y] = total;

                        total++;
                    }
                }
            }
        }
    }
});

/**
 * <p>Creates a cc.TileMap with a tile file (atlas) with a map file and the width and height of each tile in points.<br />
 * The tile file will be loaded using the TextureMgr. </p>
 * @param {String} tile
 * @param {String} mapFile
 * @param {Number} tileWidth
 * @param {Number} tileHeight
 * @return {Boolean|Null}
 * @example
 * //example
 * var tmpAtlas = new cc.TileMapAtlas();
 *  tmpAtlas.initWithTileFile("hello.png", "hello.tga", 16, 16);
 */
cc.TileMapAtlas.create = function (tile, mapFile, tileWidth, tileHeight) {
    var ret = new cc.TileMapAtlas();
    if (ret.initWithTileFile(tile, mapFile, tileWidth, tileHeight)) {
        return ret;
    }
    return null;
};
