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
 * <p>cc.TMXLayer represents the TMX layer. </p>
 *
 * <p>It is a subclass of cc.SpriteBatchNode. By default the tiles are rendered using a cc.TextureAtlas. <br />
 * If you modify a tile on runtime, then, that tile will become a cc.Sprite, otherwise no cc.Sprite objects are created. <br />
 * The benefits of using cc.Sprite objects as tiles are: <br />
 * - tiles (cc.Sprite) can be rotated/scaled/moved with a nice API </p>
 *
 * <p>If the layer contains a property named "cc.vertexz" with an integer (in can be positive or negative), <br />
 * then all the tiles belonging to the layer will use that value as their OpenGL vertex Z for depth. </p>
 *
 * <p>On the other hand, if the "cc.vertexz" property has the "automatic" value, then the tiles will use an automatic vertex Z value. <br />
 * Also before drawing the tiles, GL_ALPHA_TEST will be enabled, and disabled after drawing them. The used alpha func will be:  </p>
 *
 * glAlphaFunc( GL_GREATER, value ) <br />
 *
 * <p>"value" by default is 0, but you can change it from Tiled by adding the "cc_alpha_func" property to the layer. <br />
 * The value 0 should work for most cases, but if you have tiles that are semi-transparent, then you might want to use a different value, like 0.5.</p>
 * @class
 * @extends cc.SpriteBatchNode
 */
cc.TMXLayer = cc.SpriteBatchNode.extend(/** @lends cc.TMXLayer# */{
    //size of the layer in tiles
    _layerSize: null,
    _mapTileSize: null,
    _tiles: null,
    _tileSet: null,
    _layerOrientation: null,
    _properties: null,
    //name of the layer
    _layerName: "",
    //TMX Layer supports opacity
    _opacity: 255,
    _minGID: null,
    _maxGID: null,
    //Only used when vertexZ is used
    _vertexZvalue: null,
    _useAutomaticVertexZ: null,
    _alphaFuncValue: null,
    //used for optimization
    _reusedTile: null,
    _atlasIndexArray: null,
    //used for retina display
    _contentScaleFactor: null,

    _cacheCanvas:null,
    _cacheContext:null,
    _cacheTexture:null,

    /**
     *  Constructor
     */
    ctor:function () {
        cc.SpriteBatchNode.prototype.ctor.call(this);
        this._children = [];
        this._descendants = [];

        this._layerSize = cc.SizeZero();
        this._mapTileSize = cc.SizeZero();

        if(cc.renderContextType === cc.CANVAS){
            var locCanvas = cc.canvas;
            var tmpCanvas = document.createElement('canvas');
            tmpCanvas.width = locCanvas.width;
            tmpCanvas.height = locCanvas.height;
            this._cacheCanvas = tmpCanvas;
            this._cacheContext = this._cacheCanvas.getContext('2d');
            var tempTexture = new cc.Texture2D();
            tempTexture.initWithElement(tmpCanvas);
            tempTexture.handleLoadedTexture();
            this._cacheTexture = tempTexture;
            this.setContentSize(cc.size(locCanvas.width, locCanvas.height));
        }
    },

    setContentSize:function (size) {
        if (!size)
            return;
        cc.Node.prototype.setContentSize.call(this, size);

        if(cc.renderContextType === cc.CANVAS){
            var locCanvas = this._cacheCanvas;
            locCanvas.width = 0|(size.width * 1.5);
            locCanvas.height = 0|(size.height * 1.5);
            this._cacheContext.translate(0, locCanvas.height);
            var locContentSize = this._cacheTexture._contentSize;
            locContentSize.width = locCanvas.width;
            locContentSize.height = locCanvas.height;
        }
    },

    /**
     * Return texture of cc.SpriteBatchNode
     * @return {cc.Texture2D}
     */
    getTexture:function () {
        if(cc.renderContextType === cc.CANVAS)
            return this._cacheTexture;
        else
            return cc.SpriteBatchNode.prototype.getTexture.call(this);
    },

    /**
     * don't call visit on it's children ( override visit of cc.Node )
     * @override
     * @param {CanvasRenderingContext2D} ctx
     */
    visit:function (ctx) {
        if (cc.renderContextType === cc.WEBGL) {
            cc.SpriteBatchNode.prototype.visit.call(this, ctx);
            return;
        }
        var context = ctx || cc.renderContext;
        // quick return if not visible
        if (!this._visible)
            return;

        context.save();
        this.transform(ctx);
        var i, locChildren = this._children;

        if (this._cacheDirty) {
            //add dirty region
            var locCacheContext = this._cacheContext, locCacheCanvas = this._cacheCanvas;
            locCacheContext.clearRect(0, 0, locCacheCanvas.width, -locCacheCanvas.height);
            locCacheContext.save();
            locCacheContext.translate(this._anchorPointInPoints.x, -(this._anchorPointInPoints.y ));
            if (locChildren) {
                this.sortAllChildren();
                for (i = 0; i < locChildren.length; i++) {
                    if (locChildren[i])
                        locChildren[i].visit(locCacheContext);
                }
            }
            locCacheContext.restore();
            this._cacheDirty = false;
        }
        // draw RenderTexture
        this.draw(ctx);
        context.restore();
    },

    /**
     * draw cc.SpriteBatchNode (override draw of cc.Node)
     * @param {CanvasRenderingContext2D} ctx
     */
    draw:null,

    _drawForCanvas:function (ctx) {
        var context = ctx || cc.renderContext;
        //context.globalAlpha = this._opacity / 255;
        var posX = 0 | ( -this._anchorPointInPoints.x), posY = 0 | ( -this._anchorPointInPoints.y);
        var locCacheCanvas = this._cacheCanvas;
        //direct draw image by canvas drawImage
        if (locCacheCanvas)
            context.drawImage(locCacheCanvas, posX, -(posY + locCacheCanvas.height));
    },

    /**
     * @return {cc.Size}
     */
    getLayerSize:function () {
        return cc.size(this._layerSize.width, this._layerSize.height);
    },

    /**
     * @param {cc.Size} Var
     */
    setLayerSize:function (Var) {
        this._layerSize.width = Var.width;
        this._layerSize.height = Var.height;
    },

    /**
     * Size of the map's tile (could be different from the tile's size)
     * @return {cc.Size}
     */
    getMapTileSize:function () {
        return cc.size(this._mapTileSize.width,this._mapTileSize.height);
    },

    /**
     * @param {cc.Size} Var
     */
    setMapTileSize:function (Var) {
        this._mapTileSize.width = Var.width;
        this._mapTileSize.height = Var.height;
    },

    /**
     * Pointer to the map of tiles
     * @return {Array}
     */
    getTiles:function () {
        return this._tiles;
    },

    /**
     * @param {Array} Var
     */
    setTiles:function (Var) {
        this._tiles = Var;
    },

    /**
     * Tile set information for the layer
     * @return {cc.TMXTilesetInfo}
     */
    getTileSet:function () {
        return this._tileSet;
    },

    /**
     * @param {cc.TMXTilesetInfo} Var
     */
    setTileSet:function (Var) {
        this._tileSet = Var;
    },

    /**
     * Layer orientation, which is the same as the map orientation
     * @return {Number}
     */
    getLayerOrientation:function () {
        return this._layerOrientation;
    },

    /**
     * @param {Number} Var
     */
    setLayerOrientation:function (Var) {
        this._layerOrientation = Var;
    },

    /**
     * properties from the layer. They can be added using Tiled
     * @return {Array}
     */
    getProperties:function () {
        return this._properties;
    },

    /**
     * @param {Array} Var
     */
    setProperties:function (Var) {
        this._properties = Var;
    },

    /**
     * Initializes a cc.TMXLayer with a tileset info, a layer info and a map info
     * @param {cc.TMXTilesetInfo} tilesetInfo
     * @param {cc.TMXLayerInfo} layerInfo
     * @param {cc.TMXMapInfo} mapInfo
     * @return {Boolean}
     */
    initWithTilesetInfo:function (tilesetInfo, layerInfo, mapInfo) {
        // XXX: is 35% a good estimate ?
        var size = layerInfo._layerSize;
        var totalNumberOfTiles = parseInt(size.width * size.height);
        var capacity = totalNumberOfTiles * 0.35 + 1; // 35 percent is occupied ?
        var texture;
        if (tilesetInfo)
            texture = cc.TextureCache.getInstance().addImage(tilesetInfo.sourceImage);

        if (this.initWithTexture(texture, capacity)) {
            // layerInfo
            this._layerName = layerInfo.name;
            this._layerSize = size;
            this._tiles = layerInfo._tiles;
            this._minGID = layerInfo._minGID;
            this._maxGID = layerInfo._maxGID;
            this._opacity = layerInfo._opacity;
            this.setProperties(layerInfo.getProperties());
            this._contentScaleFactor = cc.Director.getInstance().getContentScaleFactor();

            // tilesetInfo
            this._tileSet = tilesetInfo;

            // mapInfo
            this._mapTileSize = mapInfo.getTileSize();
            this._layerOrientation = mapInfo.getOrientation();

            // offset (after layer orientation is set);
            var offset = this._calculateLayerOffset(layerInfo.offset);
            this.setPosition(cc.POINT_PIXELS_TO_POINTS(offset));

            this._atlasIndexArray = [];
            this.setContentSize(cc.SIZE_PIXELS_TO_POINTS(cc.size(this._layerSize.width * this._mapTileSize.width,
                this._layerSize.height * this._mapTileSize.height)));
            this._useAutomaticVertexZ = false;
            this._vertexZvalue = 0;
            return true;
        }
        return false;
    },

    /**
     * <p>Dealloc the map that contains the tile position from memory. <br />
     * Unless you want to know at runtime the tiles positions, you can safely call this method. <br />
     * If you are going to call layer.getTileGIDAt() then, don't release the map</p>
     */
    releaseMap:function () {
        if (this._tiles)
            this._tiles = null;

        if (this._atlasIndexArray)
            this._atlasIndexArray = null;
    },

    /**
     * <p>Returns the tile (cc.Sprite) at a given a tile coordinate. <br/>
     * The returned cc.Sprite will be already added to the cc.TMXLayer. Don't add it again.<br/>
     * The cc.Sprite can be treated like any other cc.Sprite: rotated, scaled, translated, opacity, color, etc. <br/>
     * You can remove either by calling: <br/>
     * - layer.removeChild(sprite, cleanup); <br/>
     * - or layer.removeTileAt(ccp(x,y)); </p>
     * @param {cc.Point} pos
     * @return {cc.Sprite}
     */
    getTileAt: function (pos) {
        cc.Assert(pos.x < this._layerSize.width && pos.y < this._layerSize.height && pos.x >= 0 && pos.y >= 0, "TMXLayer: invalid position");
        cc.Assert(this._tiles && this._atlasIndexArray, "TMXLayer: the tiles map has been released");

        var tile = null;
        var gid = this.getTileGIDAt(pos);

        // if GID == 0, then no tile is present
        if (gid === 0)
            return tile;

        var z = 0 | (pos.x + pos.y * this._layerSize.width);
        tile = this.getChildByTag(z);
        // tile not created yet. create it
        if (!tile) {
            var rect = this._tileSet.rectForGID(gid);
            rect = cc.RECT_PIXELS_TO_POINTS(rect);

            tile = new cc.Sprite();
            tile.initWithTexture(this.getTexture(), rect);
            tile.setBatchNode(this);
            tile.setPosition(this.getPositionAt(pos));
            tile.setVertexZ(this._vertexZForPos(pos));
            tile.setAnchorPoint(cc.PointZero());
            tile.setOpacity(this._opacity);

            var indexForZ = this._atlasIndexForExistantZ(z);
            this.addSpriteWithoutQuad(tile, indexForZ, z);
        }
        return tile;
    },

    /**
     * Returns the tile gid at a given tile coordinate. <br />
     * if it returns 0, it means that the tile is empty. <br />
     * This method requires the the tile map has not been previously released (eg. don't call layer.releaseMap())<br />
     * @param {cc.Point} pos
     * @return {Number}
     */
    getTileGIDAt:function (pos) {
        cc.Assert(pos.x < this._layerSize.width && pos.y < this._layerSize.height && pos.x >= 0 && pos.y >= 0, "TMXLayer: invalid position");
        cc.Assert(this._tiles && this._atlasIndexArray, "TMXLayer: the tiles map has been released");

        var idx = 0 | (pos.x + pos.y * this._layerSize.width);
        // Bits on the far end of the 32-bit global tile ID are used for tile flags
        var tile = this._tiles[idx];

        return (tile & cc.TMX_TILE_FLIPPED_MASK) >>> 0;
    },
    // XXX: deprecated
    // tileGIDAt:getTileGIDAt,

    /**
     *  lipped tiles can be changed dynamically
     * @param {cc.Point} pos
     * @return {Number}
     */
    getTileFlagsAt:function (pos) {
        cc.Assert(pos.x < this._layerSize.width && pos.y < this._layerSize.height && pos.x >= 0 && pos.y >= 0, "TMXLayer: invalid position");
        cc.Assert(this._tiles && this._atlasIndexArray, "TMXLayer: the tiles map has been released");

        var idx = 0 | (pos.x + pos.y * this._layerSize.width);
        // Bits on the far end of the 32-bit global tile ID are used for tile flags
        var tile = this._tiles[idx];

        return (tile & cc.TMX_TILE_FLIPPED_ALL) >>> 0;
    },
    // XXX: deprecated
    // tileFlagAt:getTileFlagsAt,

    /**
     * <p>Sets the tile gid (gid = tile global id) at a given tile coordinate.<br />
     * The Tile GID can be obtained by using the method "tileGIDAt" or by using the TMX editor . Tileset Mgr +1.<br />
     * If a tile is already placed at that position, then it will be removed.</p>
     * @param {Number} gid
     * @param {cc.Point} pos
     * @param {Number} flags
     */
    setTileGID:function (gid, pos, flags) {
        cc.Assert(pos.x < this._layerSize.width && pos.y < this._layerSize.height && pos.x >= 0 && pos.y >= 0, "TMXLayer: invalid position");
        cc.Assert(this._tiles && this._atlasIndexArray, "TMXLayer: the tiles map has been released");
        cc.Assert(gid !== 0 || !(gid >= this._tileSet.firstGid), "TMXLayer: invalid gid:" + gid);

        flags = flags || 0;
        this._setNodeDirtyForCache();

        var currentFlags = this.getTileFlagsAt(pos);
        var currentGID = this.getTileGIDAt(pos);

        if (currentGID != gid || currentFlags != flags) {
            var gidAndFlags = (gid | flags) >>> 0;
            // setting gid=0 is equal to remove the tile
            if (gid === 0)
                this.removeTileAt(pos);
            else if (currentGID === 0)            // empty tile. create a new one
                this._insertTileForGID(gidAndFlags, pos);
            else {                // modifying an existing tile with a non-empty tile
                var z = pos.x + pos.y * this._layerSize.width;
                var sprite = this.getChildByTag(z);
                if (sprite) {
                    var rect = this._tileSet.rectForGID(gid);
                    rect = cc.RECT_PIXELS_TO_POINTS(rect);

                    sprite.setTextureRect(rect, false, rect.size);
                    if (flags != null)
                        this._setupTileSprite(sprite, pos, gidAndFlags);

                    this._tiles[z] = gidAndFlags;
                } else
                    this._updateTileForGID(gidAndFlags, pos);
            }
        }
    },

    /**
     * Removes a tile at given tile coordinate
     * @param {cc.Point} pos
     */
    removeTileAt:function (pos) {
        cc.Assert(pos.x < this._layerSize.width && pos.y < this._layerSize.height && pos.x >= 0 && pos.y >= 0, "TMXLayer: invalid position");
        cc.Assert(this._tiles && this._atlasIndexArray, "TMXLayer: the tiles map has been released");

        var gid = this.getTileGIDAt(pos);
        if (gid !== 0) {
            if (cc.renderContextType === cc.CANVAS)
                this._setNodeDirtyForCache();
            var z = 0 | (pos.x + pos.y * this._layerSize.width);
            var atlasIndex = this._atlasIndexForExistantZ(z);
            // remove tile from GID map
            this._tiles[z] = 0;

            // remove tile from atlas position array
            cc.ArrayRemoveObjectAtIndex(this._atlasIndexArray, atlasIndex);

            // remove it from sprites and/or texture atlas
            var sprite = this.getChildByTag(z);

            if (sprite)
                cc.SpriteBatchNode.prototype.removeChild.call(this, sprite, true);           //this.removeChild(sprite, true);
            else {
                if(cc.renderContextType === cc.WEBGL)
                    this._textureAtlas.removeQuadAtIndex(atlasIndex);

                // update possible children
                if (this._children) {
                    var locChildren = this._children;
                    for (var i = 0, len = locChildren.length; i < len; i++) {
                        var child = locChildren[i];
                        if (child) {
                            var ai = child.getAtlasIndex();
                            if (ai >= atlasIndex)
                                child.setAtlasIndex(ai - 1);
                        }
                    }
                }
            }
        }
    },

    /**
     * Returns the position in pixels of a given tile coordinate
     * @param {cc.Point} pos
     * @return {cc.Point}
     */
    getPositionAt:function (pos) {
        var ret = cc.PointZero();
        switch (this._layerOrientation) {
            case cc.TMX_ORIENTATION_ORTHO:
                ret = this._positionForOrthoAt(pos);
                break;
            case cc.TMX_ORIENTATION_ISO:
                ret = this._positionForIsoAt(pos);
                break;
            case cc.TMX_ORIENTATION_HEX:
                ret = this._positionForHexAt(pos);
                break;
        }
        return cc.POINT_PIXELS_TO_POINTS(ret);
    },
    // XXX: Deprecated. For backward compatibility only
    // positionAt:getPositionAt,

    /**
     * Return the value for the specific property name
     * @param {String} propertyName
     * @return {*}
     */
    getProperty:function (propertyName) {
        return this._properties[propertyName];
    },

    /**
     * Creates the tiles
     */
    setupTiles:function () {
        // Optimization: quick hack that sets the image size on the tileset
        if (cc.renderContextType === cc.CANVAS) {
            this._tileSet.imageSize = this._originalTexture.getContentSizeInPixels();
        } else {
            this._tileSet.imageSize = this._textureAtlas.getTexture().getContentSizeInPixels();

            // By default all the tiles are aliased
            // pros:
            //  - easier to render
            // cons:
            //  - difficult to scale / rotate / etc.
            this._textureAtlas.getTexture().setAliasTexParameters();
        }

        // Parse cocos2d properties
        this._parseInternalProperties();
        if (cc.renderContextType === cc.CANVAS)
            this._setNodeDirtyForCache();

        var locLayerHeight = this._layerSize.height, locLayerWidth = this._layerSize.width;
        for (var y = 0; y < locLayerHeight; y++) {
            for (var x = 0; x < locLayerWidth; x++) {
                var pos = x + locLayerWidth * y;
                var gid = this._tiles[pos];

                // XXX: gid == 0 -. empty tile
                if (gid !== 0) {
                    this._appendTileForGID(gid, cc.p(x, y));
                    // Optimization: update min and max GID rendered by the layer
                    this._minGID = Math.min(gid, this._minGID);
                    this._maxGID = Math.max(gid, this._maxGID);
                }
            }
        }

        if (!((this._maxGID >= this._tileSet.firstGid) && (this._minGID >= this._tileSet.firstGid))) {
            cc.log("cocos2d:TMX: Only 1 tileset per layer is supported");
        }
    },

    /**
     * cc.TMXLayer doesn't support adding a cc.Sprite manually.
     * @warning addChild(child); is not supported on cc.TMXLayer. Instead of setTileGID.
     * @param {cc.Node} child
     * @param {number} zOrder
     * @param {number} tag
     */
    addChild:function (child, zOrder, tag) {
        cc.Assert(0, "addChild: is not supported on cc.TMXLayer. Instead use setTileGID:at:/tileAt:");
    },

    /**
     * Remove child
     * @param  {cc.Sprite} sprite
     * @param  {Boolean} cleanup
     */
    removeChild:function (sprite, cleanup) {
        // allows removing nil objects
        if (!sprite)
            return;

        cc.Assert(cc.ArrayContainsObject(this._children, sprite), "Tile does not belong to TMXLayer");

        if (cc.renderContextType === cc.CANVAS)
            this._setNodeDirtyForCache();
        var atlasIndex = sprite.getAtlasIndex();         //cc.ArrayGetIndexOfObject(this._children, sprite);
        var zz = this._atlasIndexArray[atlasIndex];
        this._tiles[zz] = 0;
        cc.ArrayRemoveObjectAtIndex(this._atlasIndexArray, atlasIndex);
        cc.SpriteBatchNode.prototype.removeChild.call(this, sprite, cleanup);
    },

    /**
     * @return {String}
     */
    getLayerName:function () {
        return this._layerName.toString();
    },

    /**
     * @param {String} layerName
     */
    setLayerName:function (layerName) {
        this._layerName = layerName;
    },

    _positionForIsoAt:function (pos) {
        return cc.p(this._mapTileSize.width / 2 * ( this._layerSize.width + pos.x - pos.y - 1),
            this._mapTileSize.height / 2 * (( this._layerSize.height * 2 - pos.x - pos.y) - 2));
    },

    _positionForOrthoAt:function (pos) {
        return cc.p(pos.x * this._mapTileSize.width,
            (this._layerSize.height - pos.y - 1) * this._mapTileSize.height);
    },

    _positionForHexAt:function (pos) {
        var diffY = (pos.x % 2 == 1) ? (-this._mapTileSize.height / 2) : 0;
        return cc.p(pos.x * this._mapTileSize.width * 3 / 4,
            (this._layerSize.height - pos.y - 1) * this._mapTileSize.height + diffY);
    },

    _calculateLayerOffset:function (pos) {
        var ret = cc.PointZero();
        switch (this._layerOrientation) {
            case cc.TMX_ORIENTATION_ORTHO:
                ret = cc.p(pos.x * this._mapTileSize.width, -pos.y * this._mapTileSize.height);
                break;
            case cc.TMX_ORIENTATION_ISO:
                ret = cc.p((this._mapTileSize.width / 2) * (pos.x - pos.y),
                    (this._mapTileSize.height / 2 ) * (-pos.x - pos.y));
                break;
            case cc.TMX_ORIENTATION_HEX:
                cc.Assert((pos.x == 0 && pos.y == 0), "offset for hexagonal map not implemented yet");
                break;
        }
        return ret;
    },

    _appendTileForGID:function (gid, pos) {
        var rect = this._tileSet.rectForGID(gid);
        rect = cc.RECT_PIXELS_TO_POINTS(rect);

        var z = 0 | (pos.x + pos.y * this._layerSize.width);
        var tile = this._reusedTileWithRect(rect);
        this._setupTileSprite(tile, pos, gid);

        // optimization:
        // The difference between appendTileForGID and insertTileforGID is that append is faster, since
        // it appends the tile at the end of the texture atlas
        var indexForZ = this._atlasIndexArray.length;

        // don't add it using the "standard" way.
        this.insertQuadFromSprite(tile, indexForZ);

        // append should be after addQuadFromSprite since it modifies the quantity values
        this._atlasIndexArray = cc.ArrayAppendObjectToIndex(this._atlasIndexArray, z, indexForZ);
        return tile;
    },

    _insertTileForGID:function (gid, pos) {
        var rect = this._tileSet.rectForGID(gid);
        rect = cc.RECT_PIXELS_TO_POINTS(rect);

        var z = 0 | (pos.x + pos.y * this._layerSize.width);
        var tile = this._reusedTileWithRect(rect);
        this._setupTileSprite(tile, pos, gid);

        // get atlas index
        var indexForZ = this._atlasIndexForNewZ(z);

        // Optimization: add the quad without adding a child
        this.insertQuadFromSprite(tile, indexForZ);

        // insert it into the local atlasindex array
        this._atlasIndexArray = cc.ArrayAppendObjectToIndex(this._atlasIndexArray, z, indexForZ);
        // update possible children
        if (this._children) {
            var locChildren = this._children;
            for (var i = 0, len = locChildren.length; i < len; i++) {
                var child = locChildren[i];
                if (child) {
                    var ai = child.getAtlasIndex();
                    if (ai >= indexForZ)
                        child.setAtlasIndex(ai + 1);
                }
            }
        }
        this._tiles[z] = gid;
        return tile;
    },

    _updateTileForGID:function (gid, pos) {
        var rect = this._tileSet.rectForGID(gid);
        var locScaleFactor = this._contentScaleFactor;
        rect = cc.rect(rect.x / locScaleFactor, rect.y / locScaleFactor,
            rect.width / locScaleFactor, rect.height / locScaleFactor);
        var z = pos.x + pos.y * this._layerSize.width;

        var tile = this._reusedTileWithRect(rect);
        this._setupTileSprite(tile, pos, gid);

        // get atlas index
        var indexForZ = this._atlasIndexForExistantZ(z);
        tile.setAtlasIndex(indexForZ);
        tile.setDirty(true);
        tile.updateTransform();
        this._tiles[z] = gid;

        return tile;
    },

    //The layer recognizes some special properties, like cc_vertez
    _parseInternalProperties:function () {
        // if cc_vertex=automatic, then tiles will be rendered using vertexz
        var vertexz = this.getProperty("cc_vertexz");
        if (vertexz) {
            if (vertexz == "automatic") {
                this._useAutomaticVertexZ = true;
                var alphaFuncVal = this.getProperty("cc_alpha_func");
                var alphaFuncValue = 0;
                if (alphaFuncVal)
                    alphaFuncValue = parseFloat(alphaFuncVal);

                if (cc.renderContextType === cc.WEBGL) {
                    this.setShaderProgram(cc.ShaderCache.getInstance().programForKey(cc.SHADER_POSITION_TEXTURECOLORALPHATEST));
                    var alphaValueLocation = cc.renderContext.getUniformLocation(this.getShaderProgram().getProgram(), cc.UNIFORM_ALPHA_TEST_VALUE_S);
                    // NOTE: alpha test shader is hard-coded to use the equivalent of a glAlphaFunc(GL_GREATER) comparison
                    this.getShaderProgram().use();
                    this.getShaderProgram().setUniformLocationWith1f(alphaValueLocation, alphaFuncValue);
                }
            } else
                this._vertexZvalue = parseInt(vertexz, 10);
        }
    },

    _setupTileSprite:function (sprite, pos, gid) {
        var z = pos.x + pos.y * this._layerSize.width;
        sprite.setPosition(this.getPositionAt(pos));
        if (cc.renderContextType === cc.WEBGL)
            sprite.setVertexZ(this._vertexZForPos(pos));
        else
            sprite.setTag(z);

        sprite.setAnchorPoint(cc.PointZero());
        sprite.setOpacity(this._opacity);
        if (cc.renderContextType === cc.WEBGL) {
            sprite.setRotation(0.0);
        }

        sprite.setFlippedX(false);
        sprite.setFlippedY(false);

        // Rotation in tiled is achieved using 3 flipped states, flipping across the horizontal, vertical, and diagonal axes of the tiles.
        if ((gid & cc.TMX_TILE_DIAGONAL_FLAG) >>> 0) {
            // put the anchor in the middle for ease of rotation.
            sprite.setAnchorPoint(cc.p(0.5, 0.5));
            sprite.setPosition(this.getPositionAt(pos).x + sprite.getContentSize().height / 2,
                this.getPositionAt(pos).y + sprite.getContentSize().width / 2);

            var flag = (gid & (cc.TMX_TILE_HORIZONTAL_FLAG | cc.TMX_TILE_VERTICAL_FLAG) >>> 0) >>> 0;
            // handle the 4 diagonally flipped states.
            if (flag == cc.TMX_TILE_HORIZONTAL_FLAG)
                sprite.setRotation(90);
            else if (flag == cc.TMX_TILE_VERTICAL_FLAG)
                sprite.setRotation(270);
            else if (flag == (cc.TMX_TILE_VERTICAL_FLAG | cc.TMX_TILE_HORIZONTAL_FLAG) >>> 0) {
                sprite.setRotation(90);
                sprite.setFlippedX(true);
            } else {
                sprite.setRotation(270);
                sprite.setFlippedX(true);
            }
        } else {
            if ((gid & cc.TMX_TILE_HORIZONTAL_FLAG) >>> 0)
                sprite.setFlippedX(true);

            if ((gid & cc.TMX_TILE_VERTICAL_FLAG) >>> 0)
                sprite.setFlippedY(true);
        }
    },

    _reusedTileWithRect:function (rect) {
        if(cc.renderContextType === cc.WEBGL){
            if (!this._reusedTile) {
                this._reusedTile = new cc.Sprite();
                this._reusedTile.initWithTexture(this.getTexture(), rect, false);
                this._reusedTile.setBatchNode(this);
            } else {
                // XXX HACK: Needed because if "batch node" is nil,
                // then the Sprite'squad will be reset
                this._reusedTile.setBatchNode(null);

                // Re-init the sprite
                this._reusedTile.setTextureRect(rect, false, rect.size);

                // restore the batch node
                this._reusedTile.setBatchNode(this);
            }
        } else {
            this._reusedTile = new cc.Sprite();
            this._reusedTile.initWithTexture(this._textureForCanvas, rect, false);
            this._reusedTile.setBatchNode(this);
            this._reusedTile.setParent(this);
        }
        return this._reusedTile;
    },

    _vertexZForPos:function (pos) {
        var ret = 0;
        var maxVal = 0;
        if (this._useAutomaticVertexZ) {
            switch (this._layerOrientation) {
                case cc.TMX_ORIENTATION_ISO:
                    maxVal = this._layerSize.width + this._layerSize.height;
                    ret = -(maxVal - (pos.x + pos.y));
                    break;
                case cc.TMX_ORIENTATION_ORTHO:
                    ret = -(this._layerSize.height - pos.y);
                    break;
                case cc.TMX_ORIENTATION_HEX:
                    cc.Assert(0, "TMX Hexa zOrder not supported");
                    break;
                default:
                    cc.Assert(0, "TMX invalid value");
                    break;
            }
        } else
            ret = this._vertexZvalue;
        return ret;
    },

    _atlasIndexForExistantZ:function (z) {
        var item;
        if (this._atlasIndexArray) {
            var locAtlasIndexArray = this._atlasIndexArray;
            for (var i = 0, len = locAtlasIndexArray.length; i < len; i++) {
                item = locAtlasIndexArray[i];
                if (item == z)
                    break;
            }
        }
        cc.Assert(item != null, "TMX atlas index not found. Shall not happen");
        return i;
    },

    _atlasIndexForNewZ:function (z) {
        var locAtlasIndexArray = this._atlasIndexArray;
        for (var i = 0, len = locAtlasIndexArray.length; i < len; i++) {
            var val = locAtlasIndexArray[i];
            if (z < val)
                break;
        }
        return i;
    }
});

if(cc.Browser.supportWebGL){
    cc.TMXLayer.prototype.draw = cc.SpriteBatchNode.prototype.draw;
}else{
    cc.TMXLayer.prototype.draw = cc.TMXLayer.prototype._drawForCanvas;
}

/**
 * Creates a cc.TMXLayer with an tile set info, a layer info and a map info
 * @param {cc.TMXTilesetInfo} tilesetInfo
 * @param {cc.TMXLayerInfo} layerInfo
 * @param {cc.TMXMapInfo} mapInfo
 * @return {cc.TMXLayer|Null}
 */
cc.TMXLayer.create = function (tilesetInfo, layerInfo, mapInfo) {
    var ret = new cc.TMXLayer();
    if (ret.initWithTilesetInfo(tilesetInfo, layerInfo, mapInfo))
        return ret;
    return null;
};
