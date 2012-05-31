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

/** @brief cc.TMXLayer represents the TMX layer.

 It is a subclass of cc.SpriteBatchNode. By default the tiles are rendered using a cc.TextureAtlas.
 If you modify a tile on runtime, then, that tile will become a cc.Sprite, otherwise no cc.Sprite objects are created.
 The benefits of using cc.Sprite objects as tiles are:
 - tiles (cc.Sprite) can be rotated/scaled/moved with a nice API

 If the layer contains a property named "cc_vertexz" with an integer (in can be positive or negative),
 then all the tiles belonging to the layer will use that value as their OpenGL vertex Z for depth.

 On the other hand, if the "cc_vertexz" property has the "automatic" value, then the tiles will use an automatic vertex Z value.
 Also before drawing the tiles, GL_ALPHA_TEST will be enabled, and disabled after drawin them. The used alpha func will be:

 glAlphaFunc( GL_GREATER, value )

 "value" by default is 0, but you can change it from Tiled by adding the "cc_alpha_func" property to the layer.
 The value 0 should work for most cases, but if you have tiles that are semi-transparent, then you might want to use a differnt
 value, like 0.5.
 */
cc.TMXLayer = cc.SpriteBatchNode.extend({
    /** size of the layer in tiles */
    _layerSize:cc.SizeZero(),
    _mapTileSize:cc.SizeZero(),
    _tiles:null,
    _tileSet:null,
    _layerOrientation:null,
    _properties:null,
    //! name of the layer
    _layerName:"",
    //! TMX Layer supports opacity
    _opacity:255,
    _minGID:null,
    _maxGID:null,
    //! Only used when vertexZ is used
    _vertexZvalue:null,
    _useAutomaticVertexZ:null,
    _alphaFuncValue:null,
    //! used for optimization
    _reusedTile:null,
    _atlasIndexArray:null,
    // used for retina display
    _contentScaleFactor:null,
    ctor:function () {
        this._super();
        this._children = [];
        this._descendants = [];
        this._isUseCache = true;
    },
    getLayerSize:function () {
        return this._layerSize;
    },
    setLayerSize:function (Var) {
        this._layerSize = Var;
    },

    /** size of the map's tile (could be differnt from the tile's size) */
    getMapTileSize:function () {
        return this._mapTileSize;
    },
    setMapTileSize:function (Var) {
        this._mapTileSize = Var;
    },
    /** pointer to the map of tiles */
    getTiles:function () {
        return this._tiles;
    },
    setTiles:function (Var) {
        this._tiles = Var;
    },
    /** Tilset information for the layer */
    getTileSet:function () {
        return this._tileSet;
    },
    setTileSet:function (Var) {
        this._tileSet = Var;
    },
    /** Layer orientation, which is the same as the map orientation */
    getLayerOrientation:function () {
        return this._layerOrientation;
    },
    setLayerOrientation:function (Var) {
        this._layerOrientation = Var;
    },
    /** properties from the layer. They can be added using Tiled */
    getProperties:function () {
        return this._properties;
    },
    setProperties:function (Var) {
        this._properties = Var;
    },
    /** initializes a cc.TMXLayer with a tileset info, a layer info and a map info */
    initWithTilesetInfo:function (tilesetInfo, layerInfo, mapInfo) {
        // XXX: is 35% a good estimate ?
        var size = layerInfo._layerSize;
        var totalNumberOfTiles = parseInt(size.width * size.height);
        var capacity = totalNumberOfTiles * 0.35 + 1; // 35 percent is occupied ?

        var texture = null;
        if (tilesetInfo) {
            texture = cc.TextureCache.sharedTextureCache().addImage(tilesetInfo.sourceImage.toString());
        }
        if (this.initWithTexture(texture, capacity)) {
            // layerInfo
            this._layerName = layerInfo.name;
            this._layerSize = layerInfo._layerSize;
            this._tiles = layerInfo._tiles;
            this._minGID = layerInfo._minGID;
            this._maxGID = layerInfo._maxGID;
            this._opacity = layerInfo._opacity;
            this._properties = layerInfo.getProperties();
            this._contentScaleFactor = cc.Director.sharedDirector().getContentScaleFactor();

            // tilesetInfo
            this._tileSet = tilesetInfo;

            // mapInfo
            this._mapTileSize = mapInfo.getTileSize();
            this._layerOrientation = mapInfo.getOrientation();

            // offset (after layer orientation is set);
            var offset = this._calculateLayerOffset(layerInfo.offset);
            this.setPosition(offset);

            this._atlasIndexArray = [];

            this.setContentSizeInPixels(cc.SizeMake(this._layerSize.width * this._mapTileSize.width,
                this._layerSize.height * this._mapTileSize.height));
            this._mapTileSize.width /= this._contentScaleFactor;
            this._mapTileSize.height /= this._contentScaleFactor;

            this._useAutomaticVertexZ = false;
            this._vertexZvalue = 0;
            this._alphaFuncValue = 0;
            return true;
        }
        return false;
    },

    /** dealloc the map that contains the tile position from memory.
     Unless you want to know at runtime the tiles positions, you can safely call this method.
     If you are going to call layer.tileGIDAt() then, don't release the map
     */
    releaseMap:function () {
        if (this._tiles) {
            this._tiles = null;
        }

        if (this._atlasIndexArray) {
            this._atlasIndexArray = null;
        }
    },

    /** returns the tile (cc.Sprite) at a given a tile coordinate.
     The returned cc.Sprite will be already added to the cc.TMXLayer. Don't add it again.
     The cc.Sprite can be treated like any other cc.Sprite: rotated, scaled, translated, opacity, color, etc.
     You can remove either by calling:
     - layer.removeChild(sprite, cleanup);
     - or layer.removeTileAt(ccp(x,y));
     */
    tileAt:function (pos) {
        cc.Assert(pos.x < this._layerSize.width && pos.y < this._layerSize.height && pos.x >= 0 && pos.y >= 0, "TMXLayer: invalid position");
        cc.Assert(this._tiles && this._atlasIndexArray, "TMXLayer: the tiles map has been released");

        var tile = null;
        var gid = this.tileGIDAt(pos);

        // if GID == 0, then no tile is present
        if (gid) {
            var z = pos.x + pos.y * this._layerSize.width;

            tile = this.getChildByTag(z);

            // tile not created yet. create it
            if (!tile) {
                var rect = this._tileSet.rectForGID(gid);
                rect = cc.RectMake(rect.origin.x / this._contentScaleFactor, rect.origin.y / this._contentScaleFactor,
                    rect.size.width / this._contentScaleFactor, rect.size.height / this._contentScaleFactor);

                tile = new cc.Sprite();
                tile.initWithBatchNode(this, rect);
                tile.setPosition(this.positionAt(pos));
                tile.setVertexZ(this._vertexZForPos(pos));
                tile.setAnchorPoint(cc.PointZero());
                tile.setOpacity(this._opacity);

                var indexForZ = this._atlasIndexForExistantZ(z);
                this.addSpriteWithoutQuad(tile, indexForZ, z);
            }
        }
        return tile;
    },

    /** returns the tile gid at a given tile coordinate.
     if it returns 0, it means that the tile is empty.
     This method requires the the tile map has not been previously released (eg. don't call layer.releaseMap())
     */
    tileGIDAt:function (pos) {
        cc.Assert(pos.x < this._layerSize.width && pos.y < this._layerSize.height && pos.x >= 0 && pos.y >= 0, "TMXLayer: invalid position");
        cc.Assert(this._tiles && this._atlasIndexArray, "TMXLayer: the tiles map has been released");

        var idx = pos.x + pos.y * this._layerSize.width;
        return this._tiles[ idx ];
    },

    /** sets the tile gid (gid = tile global id) at a given tile coordinate.
     The Tile GID can be obtained by using the method "tileGIDAt" or by using the TMX editor . Tileset Mgr +1.
     If a tile is already placed at that position, then it will be removed.
     */
    setTileGID:function (gid, pos) {
        cc.Assert(pos.x < this._layerSize.width && pos.y < this._layerSize.height && pos.x >= 0 && pos.y >= 0, "TMXLayer: invalid position");
        cc.Assert(this._tiles && this._atlasIndexArray, "TMXLayer: the tiles map has been released");
        cc.Assert(gid !== 0 || !(gid >= this._tileSet.firstGid), "TMXLayer: invalid gid:" + gid);

        this._setNodeDirtyForCache();
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        var currentGID = this.tileGIDAt(pos);

        if (currentGID != gid) {
            // setting gid=0 is equal to remove the tile
            if (gid == 0) {
                this.removeTileAt(pos);
            }

            // empty tile. create a new one
            else if (currentGID == 0) {
                this._insertTileForGID(gid, pos);
            }

            // modifying an existing tile with a non-empty tile
            else {
                var z = pos.x + pos.y * this._layerSize.width;
                var sprite = this.getChildByTag(z);
                if (sprite) {
                    var rect = this._tileSet.rectForGID(gid);
                    rect = cc.RectMake(rect.origin.x / this._contentScaleFactor, rect.origin.y / this._contentScaleFactor, rect.size.width / this._contentScaleFactor, rect.size.height / this._contentScaleFactor);
                    sprite.setTextureRectInPixels(rect, false, rect.size);
                    this._tiles[z] = gid;
                }
                else {
                    this._updateTileForGID(gid, pos);
                }
            }
        }
    },

    /** removes a tile at given tile coordinate */
    removeTileAt:function (pos) {
        cc.Assert(pos.x < this._layerSize.width && pos.y < this._layerSize.height && pos.x >= 0 && pos.y >= 0, "TMXLayer: invalid position");
        cc.Assert(this._tiles && this._atlasIndexArray, "TMXLayer: the tiles map has been released");

        this._setNodeDirtyForCache();
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        var gid = this.tileGIDAt(pos);

        if (gid) {
            var z = pos.x + pos.y * this._layerSize.width;
            var atlasIndex = this._atlasIndexForExistantZ(z);
            // remove tile from GID map
            this._tiles[z] = 0;

            // remove tile from atlas position array
            cc.ArrayRemoveObjectAtIndex(this._atlasIndexArray, atlasIndex);

            // remove it from sprites and/or texture atlas
            var sprite = this.getChildByTag(z);

            if (sprite) {
                this.removeChild(sprite, true);
            }
            else {
                this._textureAtlas.removeQuadAtIndex(atlasIndex);

                // update possible children
                if (this._children) {
                    for (var i = 0, len = this._children.length; i < len; i++) {
                        var child = this._children[i];
                        if (child) {
                            var ai = child.getAtlasIndex();
                            if (ai >= atlasIndex) {
                                child.setAtlasIndex(ai - 1);
                            }
                        }
                    }
                }
            }
        }
    },

    /** returns the position in pixels of a given tile coordinate */
    positionAt:function (pos) {
        var ret = cc.PointZero();
        switch (this._layerOrientation) {
            case cc.TMXOrientationOrtho:
                ret = this._positionForOrthoAt(pos);
                break;
            case cc.TMXOrientationIso:
                ret = this._positionForIsoAt(pos);
                break;
            case cc.TMXOrientationHex:
                ret = this._positionForHexAt(pos);
                break;
        }
        return ret;
    },

    /** return the value for the specific property name */
    propertyNamed:function (propertyName) {
        return this._properties[propertyName];
    },

    /** Creates the tiles */
    setupTiles:function () {
// Optimization: quick hack that sets the image size on the tileset
        var textureCache = this._textureAtlas.getTexture();
        this._tileSet.imageSize = new cc.Size(textureCache.width, textureCache.height);

        // By default all the tiles are aliased
        // pros:
        //  - easier to render
        // cons:
        //  - difficult to scale / rotate / etc.
        //this._textureAtlas.getTexture().setAliasTexParameters();

        //CFByteOrder o = CFByteOrderGetCurrent();

        // Parse cocos2d properties
        this._parseInternalProperties();
        this._setNodeDirtyForCache();
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());

        for (var y = 0; y < this._layerSize.height; y++) {
            for (var x = 0; x < this._layerSize.width; x++) {
                var pos = x + this._layerSize.width * y;
                var gid = this._tiles[pos];
                // gid are stored in little endian.
                // if host is big endian, then swap
                //if( o == CFByteOrderBigEndian )
                //	gid = CFSwapInt32( gid );
                /* We support little endian.*/

                // XXX: gid == 0 -. empty tile
                if (gid != 0) {
                    this._appendTileForGID(gid, cc.ccp(x, y));
                    // Optimization: update min and max GID rendered by the layer
                    this._minGID = Math.min(gid, this._minGID);
                    this._maxGID = Math.max(gid, this._maxGID);
                }
            }
        }

        cc.Assert(this._maxGID >= this._tileSet.firstGid &&
            this._minGID >= this._tileSet.firstGid, "TMX: Only 1 tilset per layer is supported");
    },

    /** cc.TMXLayer doesn't support adding a cc.Sprite manually.
     @warning addchild(z, tag); is not supported on cc.TMXLayer. Instead of setTileGID.
     */
    addChild:function (child) {
        cc.Assert(0, "addChild: is not supported on cc.TMXLayer. Instead use setTileGID:at:/tileAt:");
    },
// super method
    removeChild:function (child, cleanup) {
        var sprite = child;

        // allows removing nil objects
        if (!sprite)
            return;

        cc.Assert(cc.ArrayContainsObject(this._children, sprite), "Tile does not belong to TMXLayer");

        this._setNodeDirtyForCache();
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        var atlasIndex = sprite.getAtlasIndex();
        var zz = this._atlasIndexArray[atlasIndex];
        this._tiles[zz] = 0;
        cc.ArrayRemoveObjectAtIndex(this._atlasIndexArray, atlasIndex);

        this._super(sprite, cleanup);
    },
    draw:function () {
        if (this._useAutomaticVertexZ) {
            //TODO need to fix
            //glEnable(GL_ALPHA_TEST);
            //glAlphaFunc(GL_GREATER, this._alphaFuncValue);
        }

        this._super();

        if (this._useAutomaticVertexZ) {
            //glDisable(GL_ALPHA_TEST);
        }
    },

    getLayerName:function () {
        return this._layerName.toString();
    },
    setLayerName:function (layerName) {
        this._layerName = layerName;
    },
    /*private:*/
    _positionForIsoAt:function (pos) {
        var xy = cc.PointMake(this._mapTileSize.width / 2 * ( this._layerSize.width + pos.x - pos.y - 1),
            this._mapTileSize.height / 2 * (( this._layerSize.height * 2 - pos.x - pos.y) - 2));
        return xy;
    },
    _positionForOrthoAt:function (pos) {
        var xy = cc.PointMake(pos.x * this._mapTileSize.width,
            (this._layerSize.height - pos.y - 1) * this._mapTileSize.height);
        return xy;
    },
    _positionForHexAt:function (pos) {
        var diffY = 0;
        if (pos.x % 2 == 1) {
            diffY = -this._mapTileSize.height / 2;
        }

        var xy = cc.PointMake(pos.x * this._mapTileSize.width * 3 / 4,
            (this._layerSize.height - pos.y - 1) * this._mapTileSize.height + diffY);
        return xy;
    },

    _calculateLayerOffset:function (pos) {
        var ret = cc.PointZero();
        switch (this._layerOrientation) {
            case cc.TMXOrientationOrtho:
                ret = cc.ccp(pos.x * this._mapTileSize.width, -pos.y * this._mapTileSize.height);
                break;
            case cc.TMXOrientationIso:
                ret = cc.ccp((this._mapTileSize.width / 2) * (pos.x - pos.y),
                    (this._mapTileSize.height / 2 ) * (-pos.x - pos.y));
                break;
            case cc.TMXOrientationHex:
                ret = cc.ccp(0, 0);
                cc.LOG("cocos2d:offset for hexagonal map not implemented yet");
                break;
        }
        return ret;
    },

    /* optimization methos */
    _appendTileForGID:function (gid, pos) {
        var rect = this._tileSet.rectForGID(gid);
        rect = cc.RectMake(rect.origin.x / this._contentScaleFactor, rect.origin.y / this._contentScaleFactor,
            rect.size.width / this._contentScaleFactor, rect.size.height / this._contentScaleFactor);
        this._setNodeDirtyForCache();
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        var z = pos.x + pos.y * this._layerSize.width;
        this._reusedTile = new cc.Sprite();
        this._reusedTile.setParent(this);
        this._reusedTile.initWithBatchNode(this, rect);
        this._reusedTile.setPosition(this.positionAt(pos));
        this._reusedTile.setVertexZ(this._vertexZForPos(pos));
        this._reusedTile.setAnchorPoint(cc.PointZero());
        this._reusedTile.setOpacity(this._opacity);
        this._reusedTile.setTag(z);
        // optimization:
        // The difference between _appendTileForGID and _insertTileForGID is that append is faster, since
        // it appends the tile at the end of the texture atlas
        //todo fix
        var indexForZ = this._atlasIndexArray.length;

        // don't add it using the "standard" way.
        this.addQuadFromSprite(this._reusedTile, indexForZ);

        // append should be after addQuadFromSprite since it modifies the quantity values
        this._atlasIndexArray = cc.ArrayAppendObjectToIndex(this._atlasIndexArray, z, indexForZ);
        return this._reusedTile;
    },
    _insertTileForGID:function (gid, pos) {
        var rect = this._tileSet.rectForGID(gid);
        rect = cc.RectMake(rect.origin.x / this._contentScaleFactor, rect.origin.y / this._contentScaleFactor, rect.size.width / this._contentScaleFactor, rect.size.height / this._contentScaleFactor);

        var z = parseInt(pos.x + pos.y * this._layerSize.width);
        this._setNodeDirtyForCache();
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this._reusedTile = new cc.Sprite();
        this._reusedTile.setParent(this);
        this._reusedTile.initWithBatchNode(this, rect);
        this._reusedTile.setPositionInPixels(this.positionAt(pos));
        this._reusedTile.setVertexZ(this._vertexZForPos(pos));
        this._reusedTile.setAnchorPoint(cc.PointZero());
        this._reusedTile.setOpacity(this._opacity);

        // get atlas index
        var indexForZ = this._atlasIndexForNewZ(z);

        // Optimization: add the quad without adding a child
        this.addQuadFromSprite(this._reusedTile, indexForZ);

        // insert it into the local atlasindex array
        this._atlasIndexArray = cc.ArrayAppendObjectToIndex(this._atlasIndexArray, z, indexForZ);
        // update possible children
        if (this._children) {
            for (var i = 0, len = this._children.length; i < len; i++) {
                var child = this._children[i];
                if (child) {
                    var ai = child.getAtlasIndex();
                    if (ai >= indexForZ) {
                        child.setAtlasIndex(ai + 1);
                    }
                }
            }
        }
        this._tiles[z] = gid;
        return this._reusedTile;
    },
    _updateTileForGID:function (gid, pos) {
        var rect = this._tileSet.rectForGID(gid);
        rect = cc.RectMake(rect.origin.x / this._contentScaleFactor, rect.origin.y / this._contentScaleFactor,
            rect.size.width / this._contentScaleFactor, rect.size.height / this._contentScaleFactor);
        var z = pos.x + pos.y * this._layerSize.width;

        this._setNodeDirtyForCache();
        //this._addDirtyRegionToDirector(this.boundingBoxToWorld());
        this._reusedTile = new cc.Sprite();
        this._reusedTile.initWithBatchNode(this, rect);

        this._reusedTile.setPositionInPixels(this.positionAt(pos));
        this._reusedTile.setVertexZ(this._vertexZForPos(pos));
        this._reusedTile.setAnchorPoint(cc.PointZero());
        this._reusedTile.setOpacity(this._opacity);

        // get atlas index
        var indexForZ = this._atlasIndexForExistantZ(z);
        this._reusedTile.setAtlasIndex(indexForZ);
        this._reusedTile.setDirty(true);
        this._reusedTile.updateTransform();
        this._tiles[z] = gid;

        return this._reusedTile;
    },

    /* The layer recognizes some special properties, like cc_vertez */
    _parseInternalProperties:function () {
// if cc_vertex=automatic, then tiles will be rendered using vertexz

        var vertexz = this.propertyNamed("cc_vertexz");
        if (vertexz) {
            if (vertexz == "automatic") {
                this._useAutomaticVertexZ = true;
            }
            else {
                this._vertexZvalue = parseInt(vertexz);
            }
        }

        var alphaFuncVal = this.propertyNamed("cc_alpha_func");
        if (alphaFuncVal) {
            this._alphaFuncValue = parseInt(alphaFuncVal);
        }
    },
    _vertexZForPos:function (pos) {
        var ret = 0;
        var maxVal = 0;
        if (this._useAutomaticVertexZ) {
            switch (this._layerOrientation) {
                case cc.TMXOrientationIso:
                    maxVal = this._layerSize.width + this._layerSize.height;
                    ret = -(maxVal - (pos.x + pos.y));
                    break;
                case cc.TMXOrientationOrtho:
                    ret = -(this._layerSize.height - pos.y);
                    break;
                case cc.TMXOrientationHex:
                    cc.Assert(0, "TMX Hexa zOrder not supported");
                    break;
                default:
                    cc.Assert(0, "TMX invalid value");
                    break;
            }
        }
        else {
            ret = this._vertexZvalue;
        }
        return ret;
    },

// index
    _atlasIndexForExistantZ:function (z) {
        var item;
        if (this._atlasIndexArray) {
            for (var i = 0; i < this._atlasIndexArray.length; i++) {
                item = this._atlasIndexArray[i]
                if (item == z) {
                    break;
                }
            }
        }
        cc.Assert(item, "TMX atlas index not found. Shall not happen");
        return i;
    },
    _atlasIndexForNewZ:function (z) {
        for (var i = 0; i < this._atlasIndexArray.length; i++) {
            var val = this._atlasIndexArray[i];
            if (z < val)
                break;
        }
        return i;
    }
});

/** creates a cc.TMXLayer with an tileset info, a layer info and a map info */
cc.TMXLayer.layerWithTilesetInfo = function (tilesetInfo, layerInfo, mapInfo) {
    var ret = new cc.TMXLayer();
    if (ret.initWithTilesetInfo(tilesetInfo, layerInfo, mapInfo)) {
        return ret;
    }
    return null;
};

// cc.TMXLayer - atlasIndex and Z
cc.compareInts = function (a, b) {
    return a - b;
};