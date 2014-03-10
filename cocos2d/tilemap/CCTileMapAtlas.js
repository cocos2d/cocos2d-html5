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
 *
 * @property {cc.ImageTGA}  tgaInfo - TGA Info
 */
cc.TileMapAtlas = cc.AtlasNode.extend(/** @lends cc.TileMapAtlas# */{
    tgaInfo:null,

	indices:null,
    //numbers of tiles to render
    _itemsToRender:0,
    //x,y to altas dictionary
    _posToAtlasIndex:null,
    _className:"TileMapAtlas",

    /**
     * @return {cc.ImageTGA}
     */
    getTGAInfo:function () {
        return this.tgaInfo;
    },

    /**
     * @param  {cc.ImageTGA} Var
     */
    setTGAInfo:function (Var) {
        this.tgaInfo = Var;
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
        this._calculateItemsToRender();
        if (cc.AtlasNode.prototype.initWithTileFile.call(this, tile, tileWidth, tileHeight, this._itemsToRender)) {
            this._color = cc.color.WHITE;
            this._posToAtlasIndex = {};
            this._updateAtlasValues();
            this.width = this.tgaInfo.width * this._itemWidth;
	        this.height = this.tgaInfo.height * this._itemHeight;
            return true;
        }
        return false;
    },

    /**
     * <p>Returns a tile from position x,y.<br />
     * For the moment only channel R is used. </p>
     * @param {cc.Point} position
     * @return {cc.Color}
     */
    getTileAt:function (position) {
        if(!this.tgaInfo){
            cc.log("cc.TileMapAtlas.getTileAt(): tgaInfo must not be null");
            return null;
        }
        if(position.x >= this.tgaInfo.width || position.y >= this.tgaInfo.height)
            throw "cc.TileMapAtlas.getTileAt(): Invalid position";

        var colorPos = 0|(position.x * 3 + position.y * this.tgaInfo.width * 3);
        var locTGAImageData = this.tgaInfo.imageData;
        return cc.color(locTGAImageData[colorPos], locTGAImageData[colorPos + 1], locTGAImageData[colorPos + 2]);
    },

    /**
     * Sets a tile at position x,y.
     * For the moment only channel R is used
     * @param {cc.Color} tile
     * @param {cc.Point} position
     */
    setTile:function (tile, position) {
        if(!this.tgaInfo){
            cc.log("cc.TileMapAtlas.setTile(): tgaInfo must not be null");
            return;
        }
        if(!this._posToAtlasIndex){
            cc.log("cc.TileMapAtlas.setTile(): posToAtlasIndex must not be null");
            return;
        }
        if(position.x >= this.tgaInfo.width || position.y >= this.tgaInfo.height)
            throw "cc.TileMapAtlas.setTile(): Invalid position";
        if(!tile || tile.r == 0)
            throw "cc.TileMapAtlas.setTile(): tile should be non-null and tile.r should be non-nil";

        var colorPos = 0 | (position.x * 3 + position.y * this.tgaInfo.width * 3);
        if (this.tgaInfo.imageData[colorPos] == 0)
            cc.log("cocos2d: Value.r must be non 0.");
        else {
            this.tgaInfo.imageData[colorPos] = tile.r;
            this.tgaInfo.imageData[colorPos + 1] = tile.g;
            this.tgaInfo.imageData[colorPos + 2] = tile.b;

            var num = this._posToAtlasIndex[position.x + "_" + position.y];
            this._updateAtlasValueAt(position, tile, num);
        }
    },

    /**
     * Dealloc the map from memory
     */
    releaseMap:function () {
        if (this.tgaInfo) {
            cc.tgaDestroy(this.tgaInfo);
        }
        this.tgaInfo = null;
    },

    _calculateItemsToRender:function () {
        if(!this.tgaInfo){
            cc.log("cc.TileMapAtlas._calculateItemsToRender(): tgaInfo must not be null");
            return;
        }

        this._itemsToRender = 0;
        var locWidth = this.tgaInfo.width, locHeight = this.tgaInfo.height, locImageData = this.tgaInfo.imageData;
        for (var x = 0; x < locWidth; x++) {
            for (var y = 0; y < locHeight; y++) {
                if (locImageData[x * 3 + y * locWidth * 3])
                    ++this._itemsToRender;
            }
        }
    },

    /**
     * @param {cc.Point|cc.GridSize} pos
     * @param {cc.Color} value
     * @param {Number} index
     * @private
     */
    _updateAtlasValueAt:function (pos, value, index) {
        var locTextureAtlas = this.textureAtlas;
        if(index < 0 && index >= locTextureAtlas.getCapacity())
            throw "cc.TileMapAtlas._updateAtlasValueAt(): Invalid index";
        var quad = locTextureAtlas.quads[index];

        var x = pos.x;
        var y = pos.y;
        var row = (value.r % this._itemsPerRow);
        var col = (value.r / this._itemsPerRow);

        var tex = locTextureAtlas.texture, textureWide = tex.pixelsWidth, textureHigh = tex.pixelsHeight;

        var locItemWidth = this._itemWidth;
        var locItemHeight = this._itemHeight;
        var itemWidthInPixels = locItemWidth * cc.CONTENT_SCALE_FACTOR();
        var itemHeightInPixels = locItemHeight * cc.CONTENT_SCALE_FACTOR();

        var left, right, top, bottom;
        if (cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL) {
            left = (2 * row * itemWidthInPixels + 1) / (2 * textureWide);
            right = left + (itemWidthInPixels * 2 - 2) / (2 * textureWide);
            top = (2 * col * itemHeightInPixels + 1) / (2 * textureHigh);
            bottom = top + (itemHeightInPixels * 2 - 2) / (2 * textureHigh);
        } else {
            left = (row * itemWidthInPixels) / textureWide;
            right = left + itemWidthInPixels / textureWide;
            top = (col * itemHeightInPixels) / textureHigh;
            bottom = top + itemHeightInPixels / textureHigh;
        }

        quad.tl.texCoords.u = left;
        quad.tl.texCoords.v = top;
        quad.tr.texCoords.u = right;
        quad.tr.texCoords.v = top;
        quad.bl.texCoords.u = left;
        quad.bl.texCoords.v = bottom;
        quad.br.texCoords.u = right;
        quad.br.texCoords.v = bottom;

        quad.bl.vertices.x = (x * locItemWidth);
        quad.bl.vertices.y = (y * locItemHeight);
        quad.bl.vertices.z = 0.0;
        quad.br.vertices.x = (x * locItemWidth + locItemWidth);
        quad.br.vertices.y = (y * locItemHeight);
        quad.br.vertices.z = 0.0;
        quad.tl.vertices.x = (x * locItemWidth);
        quad.tl.vertices.y = (y * locItemHeight + locItemHeight);
        quad.tl.vertices.z = 0.0;
        quad.tr.vertices.x = (x * locItemWidth + locItemWidth);
        quad.tr.vertices.y = (y * locItemHeight + locItemHeight);
        quad.tr.vertices.z = 0.0;

        var locColor = this._displayedColor;
        var color = {r: locColor.r, g: locColor.g, b: locColor.b, a: this._displayedOpacity};
        quad.tr.colors = color;
        quad.tl.colors = color;
        quad.br.colors = color;
        quad.bl.colors = color;

        locTextureAtlas.dirty = true;
        var totalQuads = locTextureAtlas.totalQuads;
        if (index + 1 > totalQuads)
            locTextureAtlas.increaseTotalQuadsWith(index + 1 - totalQuads);
    },

    _updateAtlasValues:function () {
        if(!this.tgaInfo){
            cc.log("cc.TileMapAtlas._updateAtlasValues(): tgaInfo must not be null");
            return;
        }

        var total = 0;
        var locTGAInfo = this.tgaInfo;
        var locTGAInfoWidth = locTGAInfo.width, locTGAInfoHeight = locTGAInfo.height, locItemsToRender = this._itemsToRender;
        for (var x = 0; x < locTGAInfoWidth; x++) {
            for (var y = 0; y < locTGAInfoHeight; y++) {
                if (total < locItemsToRender) {
                    var colorPos = x * 3 + y * locTGAInfoWidth * 3;
                    var value = cc.color(locTGAInfo.imageData[colorPos], locTGAInfo.imageData[colorPos + 1], locTGAInfo.imageData[colorPos + 2]);
                    if (value.r != 0) {
                        this._updateAtlasValueAt(cc.p(x, y), value, total);
                        this._posToAtlasIndex[x + "_" + y] = total;
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
