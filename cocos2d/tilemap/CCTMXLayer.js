/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

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
 *
 * @property {Array}                tiles               - Tiles for layer
 * @property {cc.TMXTilesetInfo}    tileset             - Tileset for layer
 * @property {Number}               layerOrientation    - Layer orientation
 * @property {Array}                properties          - Properties from the layer. They can be added using tilemap editors
 * @property {String}               layerName           - Name of the layer
 * @property {Number}               layerWidth          - Width of the layer
 * @property {Number}               layerHeight         - Height of the layer
 * @property {Number}               tileWidth           - Width of a tile
 * @property {Number}               tileHeight          - Height of a tile
 */
cc.TMXLayer = cc.SpriteBatchNode.extend(/** @lends cc.TMXLayer# */{
	tiles: null,
	tileset: null,
	layerOrientation: null,
	properties: null,
	layerName: "",

    //size of the layer in tiles
    _layerSize: null,
    _mapTileSize: null,
    //TMX Layer supports opacity
    _opacity: 255,
    _minGID: null,
    _maxGID: null,
    //Only used when vertexZ is used
    _vertexZvalue: null,
    _useAutomaticVertexZ: null,
    //used for optimization
    _reusedTile: null,
    _atlasIndexArray: null,
    //used for retina display
    _contentScaleFactor: null,

    _cacheCanvas:null,
    _cacheContext:null,
    _cacheTexture:null,
    _className:"TMXLayer",

    /**
     * Creates a cc.TMXLayer with an tile set info, a layer info and a map info   <br/>
     * Constructor of cc.TMXLayer
     * @param {cc.TMXTilesetInfo} tilesetInfo
     * @param {cc.TMXLayerInfo} layerInfo
     * @param {cc.TMXMapInfo} mapInfo
     */
    ctor:function (tilesetInfo, layerInfo, mapInfo) {
        cc.SpriteBatchNode.prototype.ctor.call(this);
        this._descendants = [];

        this._layerSize = cc.size(0, 0);
        this._mapTileSize = cc.size(0, 0);

        if(cc._renderType === cc._RENDER_TYPE_CANVAS){
            var locCanvas = cc._canvas;
            var tmpCanvas = cc.newElement('canvas');
            tmpCanvas.width = locCanvas.width;
            tmpCanvas.height = locCanvas.height;
            this._cacheCanvas = tmpCanvas;
            this._cacheContext = this._cacheCanvas.getContext('2d');
            var tempTexture = new cc.Texture2D();
            tempTexture.initWithElement(tmpCanvas);
            tempTexture.handleLoadedTexture();
            this._cacheTexture = tempTexture;
            this.width = locCanvas.width;
	        this.height = locCanvas.height;
	        // This class uses cache, so its default cachedParent should be himself
	        this._cachedParent = this;
        }
        if(mapInfo !== undefined)
            this.initWithTilesetInfo(tilesetInfo, layerInfo, mapInfo);
    },

    _initRendererCmd: function(){
        if(cc._renderType === cc._RENDER_TYPE_CANVAS)
            this._rendererCmd = new cc.TMXLayerRenderCmdCanvas(this);
        else
            this._rendererCmd = new cc.TMXLayerRenderCmdWebGL(this);
    },

    /**
     * Sets the untransformed size of the TMXLayer.
     * @override
     * @param {cc.Size|Number} size The untransformed size of the TMXLayer or The untransformed size's width of the TMXLayer.
     * @param {Number} [height] The untransformed size's height of the TMXLayer.
     */
    setContentSize:function (size, height) {
        var locContentSize = this._contentSize;
	    cc.Node.prototype.setContentSize.call(this, size, height);

        if(cc._renderType === cc._RENDER_TYPE_CANVAS){
            var locCanvas = this._cacheCanvas;
            var scaleFactor = cc.contentScaleFactor();
            locCanvas.width = 0 | (locContentSize.width * 1.5 * scaleFactor);
            locCanvas.height = 0 | (locContentSize.height * 1.5 * scaleFactor);

            if(this.layerOrientation === cc.TMX_ORIENTATION_HEX)
                this._cacheContext.translate(0, locCanvas.height - (this._mapTileSize.height * 0.5));                  //translate for hexagonal
            else
                this._cacheContext.translate(0, locCanvas.height);
            var locTexContentSize = this._cacheTexture._contentSize;
            locTexContentSize.width = locCanvas.width;
            locTexContentSize.height = locCanvas.height;

            // Init sub caches if needed
            var totalPixel = locCanvas.width * locCanvas.height;
            if(totalPixel > this._maxCachePixel) {
                if(!this._subCacheCanvas) this._subCacheCanvas = [];
                if(!this._subCacheContext) this._subCacheContext = [];

                this._subCacheCount = Math.ceil( totalPixel / this._maxCachePixel );
                var locSubCacheCanvas = this._subCacheCanvas, i;
                for(i = 0; i < this._subCacheCount; i++) {
                    if(!locSubCacheCanvas[i]) {
                        locSubCacheCanvas[i] = document.createElement('canvas');
                        this._subCacheContext[i] = locSubCacheCanvas[i].getContext('2d');
                    }
                    var tmpCanvas = locSubCacheCanvas[i];
                    tmpCanvas.width = this._subCacheWidth = Math.round( locCanvas.width / this._subCacheCount );
                    tmpCanvas.height = locCanvas.height;
                }
                // Clear wasted cache to release memory
                for(i = this._subCacheCount; i < locSubCacheCanvas.length; i++) {
                    tmpCanvas.width = 0;
                    tmpCanvas.height = 0;
                }
            }
            // Otherwise use count as a flag to disable sub caches
            else this._subCacheCount = 0;
        }
    },

    /**
     * Return texture of cc.SpriteBatchNode
     * @function
     * @return {cc.Texture2D}
     */
	getTexture: null,

    _getTextureForCanvas:function () {
        return this._cacheTexture;
    },

    /**
     * don't call visit on it's children ( override visit of cc.Node )
     * @function
     * @override
     * @param {CanvasRenderingContext2D} ctx
     */
    visit: null,

    _visitForCanvas: function (ctx) {
        //TODO it will implement dynamic compute child cutting automation.
        var i, len, locChildren = this._children;
        // quick return if not visible
        if (!this._visible || !locChildren || locChildren.length === 0)
            return;

        if( this._parent)
            this._curLevel = this._parent._curLevel + 1;

        this.transform();

        if (this._cacheDirty) {
            var locCacheContext = this._cacheContext, locCanvas = this._cacheCanvas, locView = cc.view,
                instanceID = this.__instanceId, renderer = cc.renderer;
            //begin cache
            renderer._turnToCacheMode(instanceID);

            this.sortAllChildren();
            for (i = 0, len =  locChildren.length; i < len; i++) {
                if (locChildren[i]){
                    locChildren[i].visit();
                    locChildren[i]._cacheDirty = false;
                }
            }

            //copy cached render cmd array to TMXLayer renderer
            this._rendererCmd._copyRendererCmds(renderer._cacheToCanvasCmds[instanceID]);

            locCacheContext.save();
            locCacheContext.clearRect(0, 0, locCanvas.width, -locCanvas.height);
            var t = cc.affineTransformInvert(this._transformWorld);
            locCacheContext.transform(t.a, t.c, t.b, t.d, t.tx * locView.getScaleX(), -t.ty * locView.getScaleY());

            //draw to cache canvas
            renderer._renderingToCacheCanvas(locCacheContext, instanceID);
            locCacheContext.restore();
            this._cacheDirty = false;
        }
        cc.renderer.pushRenderCommand(this._rendererCmd);
    },

    //set the cache dirty flag for canvas
    _setNodeDirtyForCache: function () {
        this._cacheDirty  = true;
        if(cc.renderer._transformNodePool.indexOf(this) === -1)
            cc.renderer.pushDirtyNode(this);
        this._renderCmdDiry = true;
    },

    /**
     * draw cc.SpriteBatchNode (override draw of cc.Node)
     * @function
     * @param {CanvasRenderingContext2D} ctx
     */
    draw:null,

    _drawForCanvas:function (ctx) {
        var context = ctx || cc._renderContext;
        //context.globalAlpha = this._opacity / 255;
        var posX = 0 | ( -this._anchorPointInPoints.x), posY = 0 | ( -this._anchorPointInPoints.y);
        var eglViewer = cc.view;
        var locCacheCanvas = this._cacheCanvas;
        //direct draw image by canvas drawImage
        if (locCacheCanvas) {
            var locSubCacheCount = this._subCacheCount, locCanvasHeight = locCacheCanvas.height * eglViewer._scaleY;
            var halfTileSize = this._mapTileSize.height * 0.5 * eglViewer._scaleY;
            if(locSubCacheCount > 0) {
                var locSubCacheCanvasArr = this._subCacheCanvas;
                for(var i = 0; i < locSubCacheCount; i++){
                    var selSubCanvas = locSubCacheCanvasArr[i];
                    if (this.layerOrientation === cc.TMX_ORIENTATION_HEX)
                        context.drawImage(locSubCacheCanvasArr[i], 0, 0, selSubCanvas.width, selSubCanvas.height,
                                posX + i * this._subCacheWidth * eglViewer._scaleX, -(posY + locCanvasHeight) + halfTileSize, selSubCanvas.width * eglViewer._scaleX, locCanvasHeight);
                    else
                        context.drawImage(locSubCacheCanvasArr[i], 0, 0, selSubCanvas.width, selSubCanvas.height,
                                posX + i * this._subCacheWidth * eglViewer._scaleX, -(posY + locCanvasHeight), selSubCanvas.width * eglViewer._scaleX, locCanvasHeight);
                }
            } else{
                if (this.layerOrientation === cc.TMX_ORIENTATION_HEX)
                    context.drawImage(locCacheCanvas, 0, 0, locCacheCanvas.width, locCacheCanvas.height,
                        posX, -(posY + locCanvasHeight) + halfTileSize, locCacheCanvas.width * eglViewer._scaleX, locCanvasHeight);
                else
                    context.drawImage(locCacheCanvas, 0, 0, locCacheCanvas.width, locCacheCanvas.height,
                        posX, -(posY + locCanvasHeight), locCacheCanvas.width * eglViewer._scaleX, locCanvasHeight);
            }
        }
    },

    /**
     * Gets layer size.
     * @return {cc.Size}
     */
    getLayerSize:function () {
        return cc.size(this._layerSize.width, this._layerSize.height);
    },

    /**
     * Set layer size
     * @param {cc.Size} Var
     */
    setLayerSize:function (Var) {
        this._layerSize.width = Var.width;
        this._layerSize.height = Var.height;
    },

	_getLayerWidth: function () {
		return this._layerSize.width;
	},
	_setLayerWidth: function (width) {
		this._layerSize.width = width;
	},
	_getLayerHeight: function () {
		return this._layerSize.height;
	},
	_setLayerHeight: function (height) {
		this._layerSize.height = height;
	},

    /**
     * Size of the map's tile (could be different from the tile's size)
     * @return {cc.Size}
     */
    getMapTileSize:function () {
        return cc.size(this._mapTileSize.width,this._mapTileSize.height);
    },

    /**
     * Set the map tile size.
     * @param {cc.Size} Var
     */
    setMapTileSize:function (Var) {
        this._mapTileSize.width = Var.width;
        this._mapTileSize.height = Var.height;
    },

	_getTileWidth: function () {
		return this._mapTileSize.width;
	},
	_setTileWidth: function (width) {
		this._mapTileSize.width = width;
	},
	_getTileHeight: function () {
		return this._mapTileSize.height;
	},
	_setTileHeight: function (height) {
		this._mapTileSize.height = height;
	},

    /**
     * Pointer to the map of tiles
     * @return {Array}
     */
    getTiles:function () {
        return this.tiles;
    },

    /**
     * Pointer to the map of tiles
     * @param {Array} Var
     */
    setTiles:function (Var) {
        this.tiles = Var;
    },

    /**
     * Tile set information for the layer
     * @return {cc.TMXTilesetInfo}
     */
    getTileset:function () {
        return this.tileset;
    },

    /**
     * Tile set information for the layer
     * @param {cc.TMXTilesetInfo} Var
     */
    setTileset:function (Var) {
        this.tileset = Var;
    },

    /**
     * Layer orientation, which is the same as the map orientation
     * @return {Number}
     */
    getLayerOrientation:function () {
        return this.layerOrientation;
    },

    /**
     * Layer orientation, which is the same as the map orientation
     * @param {Number} Var
     */
    setLayerOrientation:function (Var) {
        this.layerOrientation = Var;
    },

    /**
     * properties from the layer. They can be added using Tiled
     * @return {Array}
     */
    getProperties:function () {
        return this.properties;
    },

    /**
     * properties from the layer. They can be added using Tiled
     * @param {Array} Var
     */
    setProperties:function (Var) {
        this.properties = Var;
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
            texture = cc.textureCache.addImage(tilesetInfo.sourceImage);

        if (this.initWithTexture(texture, capacity)) {
            // layerInfo
            this.layerName = layerInfo.name;
            this._layerSize = size;
            this.tiles = layerInfo._tiles;
            this._minGID = layerInfo._minGID;
            this._maxGID = layerInfo._maxGID;
            this._opacity = layerInfo._opacity;
            this.properties = layerInfo.properties;
            this._contentScaleFactor = cc.director.getContentScaleFactor();

            // tilesetInfo
            this.tileset = tilesetInfo;

            // mapInfo
            this._mapTileSize = mapInfo.getTileSize();
            this.layerOrientation = mapInfo.orientation;

            // offset (after layer orientation is set);
            var offset = this._calculateLayerOffset(layerInfo.offset);
            this.setPosition(cc.pointPixelsToPoints(offset));

            this._atlasIndexArray = [];
            this.setContentSize(cc.sizePixelsToPoints(cc.size(this._layerSize.width * this._mapTileSize.width,
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
        if (this.tiles)
            this.tiles = null;

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
     * @param {cc.Point|Number} pos or x
     * @param {Number} [y]
     * @return {cc.Sprite}
     */
    getTileAt: function (pos, y) {
        if(!pos)
            throw "cc.TMXLayer.getTileAt(): pos should be non-null";
        if(y !== undefined)
            pos = cc.p(pos, y);
        if(pos.x >= this._layerSize.width || pos.y >= this._layerSize.height || pos.x < 0 || pos.y < 0)
            throw "cc.TMXLayer.getTileAt(): invalid position";
        if(!this.tiles || !this._atlasIndexArray){
            cc.log("cc.TMXLayer.getTileAt(): TMXLayer: the tiles map has been released");
            return null;
        }

        var tile = null, gid = this.getTileGIDAt(pos);

        // if GID == 0, then no tile is present
        if (gid === 0)
            return tile;

        var z = 0 | (pos.x + pos.y * this._layerSize.width);
        tile = this.getChildByTag(z);
        // tile not created yet. create it
        if (!tile) {
            var rect = this.tileset.rectForGID(gid);
            rect = cc.rectPixelsToPoints(rect);

            tile = new cc.Sprite();
            tile.initWithTexture(this.texture, rect);
            tile.batchNode = this;
            tile.setPosition(this.getPositionAt(pos));
            tile.vertexZ = this._vertexZForPos(pos);
            tile.anchorX = 0;
	        tile.anchorY = 0;
            tile.opacity = this._opacity;

            var indexForZ = this._atlasIndexForExistantZ(z);
            this.addSpriteWithoutQuad(tile, indexForZ, z);
        }
        return tile;
    },

    /**
     * Returns the tile gid at a given tile coordinate. <br />
     * if it returns 0, it means that the tile is empty. <br />
     * This method requires the the tile map has not been previously released (eg. don't call layer.releaseMap())<br />
     * @param {cc.Point|Number} pos or x
     * @param {Number} [y]
     * @return {Number}
     */
    getTileGIDAt:function (pos, y) {
        if(!pos)
            throw "cc.TMXLayer.getTileGIDAt(): pos should be non-null";
        if(y !== undefined)
            pos = cc.p(pos, y);
        if(pos.x >= this._layerSize.width || pos.y >= this._layerSize.height || pos.x < 0 || pos.y < 0)
            throw "cc.TMXLayer.getTileGIDAt(): invalid position";
        if(!this.tiles || !this._atlasIndexArray){
            cc.log("cc.TMXLayer.getTileGIDAt(): TMXLayer: the tiles map has been released");
            return null;
        }

        var idx = 0 | (pos.x + pos.y * this._layerSize.width);
        // Bits on the far end of the 32-bit global tile ID are used for tile flags
        var tile = this.tiles[idx];

        return (tile & cc.TMX_TILE_FLIPPED_MASK) >>> 0;
    },
    // XXX: deprecated
    // tileGIDAt:getTileGIDAt,

    /**
     *  lipped tiles can be changed dynamically
     * @param {cc.Point|Number} pos or x
     * @param {Number} [y]
     * @return {Number}
     */
    getTileFlagsAt:function (pos, y) {
        if(!pos)
            throw "cc.TMXLayer.getTileFlagsAt(): pos should be non-null";
        if(y !== undefined)
            pos = cc.p(pos, y);
        if(pos.x >= this._layerSize.width || pos.y >= this._layerSize.height || pos.x < 0 || pos.y < 0)
            throw "cc.TMXLayer.getTileFlagsAt(): invalid position";
        if(!this.tiles || !this._atlasIndexArray){
            cc.log("cc.TMXLayer.getTileFlagsAt(): TMXLayer: the tiles map has been released");
            return null;
        }

        var idx = 0 | (pos.x + pos.y * this._layerSize.width);
        // Bits on the far end of the 32-bit global tile ID are used for tile flags
        var tile = this.tiles[idx];

        return (tile & cc.TMX_TILE_FLIPPED_ALL) >>> 0;
    },
    // XXX: deprecated
    // tileFlagAt:getTileFlagsAt,

    /**
     * <p>Sets the tile gid (gid = tile global id) at a given tile coordinate.<br />
     * The Tile GID can be obtained by using the method "tileGIDAt" or by using the TMX editor . Tileset Mgr +1.<br />
     * If a tile is already placed at that position, then it will be removed.</p>
     * @param {Number} gid
     * @param {cc.Point|Number} posOrX position or x
     * @param {Number} flagsOrY flags or y
     * @param {Number} [flags]
     */
    setTileGID: function(gid, posOrX, flagsOrY, flags) {
        if(!posOrX)
            throw "cc.TMXLayer.setTileGID(): pos should be non-null";
        var pos;
        if (flags !== undefined) {
            pos = cc.p(posOrX, flagsOrY);
        } else {
            pos = posOrX;
            flags = flagsOrY;
        }
        if(pos.x >= this._layerSize.width || pos.y >= this._layerSize.height || pos.x < 0 || pos.y < 0)
            throw "cc.TMXLayer.setTileGID(): invalid position";
        if(!this.tiles || !this._atlasIndexArray){
            cc.log("cc.TMXLayer.setTileGID(): TMXLayer: the tiles map has been released");
            return;
        }
        if(gid !== 0 && gid < this.tileset.firstGid){
            cc.log( "cc.TMXLayer.setTileGID(): invalid gid:" + gid);
            return;
        }

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
                    var rect = this.tileset.rectForGID(gid);
                    rect = cc.rectPixelsToPoints(rect);

                    sprite.setTextureRect(rect, false);
                    if (flags != null)
                        this._setupTileSprite(sprite, pos, gidAndFlags);

                    this.tiles[z] = gidAndFlags;
                } else
                    this._updateTileForGID(gidAndFlags, pos);
            }
        }
    },

    /**
     * Removes a tile at given tile coordinate
     * @param {cc.Point|Number} pos position or x
     * @param {Number} [y]
     */
    removeTileAt:function (pos, y) {
        if(!pos)
            throw "cc.TMXLayer.removeTileAt(): pos should be non-null";
        if(y !== undefined)
            pos = cc.p(pos, y);
        if(pos.x >= this._layerSize.width || pos.y >= this._layerSize.height || pos.x < 0 || pos.y < 0)
            throw "cc.TMXLayer.removeTileAt(): invalid position";
        if(!this.tiles || !this._atlasIndexArray){
            cc.log("cc.TMXLayer.removeTileAt(): TMXLayer: the tiles map has been released");
            return;
        }

        var gid = this.getTileGIDAt(pos);
        if (gid !== 0) {
            if (cc._renderType === cc._RENDER_TYPE_CANVAS)
                this._setNodeDirtyForCache();
            var z = 0 | (pos.x + pos.y * this._layerSize.width);
            var atlasIndex = this._atlasIndexForExistantZ(z);
            // remove tile from GID map
            this.tiles[z] = 0;

            // remove tile from atlas position array
            this._atlasIndexArray.splice(atlasIndex, 1);

            // remove it from sprites and/or texture atlas
            var sprite = this.getChildByTag(z);

            if (sprite)
                cc.SpriteBatchNode.prototype.removeChild.call(this, sprite, true);           //this.removeChild(sprite, true);
            else {
                if(cc._renderType === cc._RENDER_TYPE_WEBGL)
                    this.textureAtlas.removeQuadAtIndex(atlasIndex);

                // update possible children
                if (this._children) {
                    var locChildren = this._children;
                    for (var i = 0, len = locChildren.length; i < len; i++) {
                        var child = locChildren[i];
                        if (child) {
                            var ai = child.atlasIndex;
                            if (ai >= atlasIndex)
                                child.atlasIndex = ai - 1;
                        }
                    }
                }
            }
        }
    },

    /**
     * Returns the position in pixels of a given tile coordinate
     * @param {cc.Point|Number} pos position or x
     * @param {Number} [y]
     * @return {cc.Point}
     */
    getPositionAt:function (pos, y) {
        if (y !== undefined)
            pos = cc.p(pos, y);
        var ret = cc.p(0,0);
        switch (this.layerOrientation) {
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
        return cc.pointPixelsToPoints(ret);
    },
    // XXX: Deprecated. For backward compatibility only
    // positionAt:getPositionAt,

    /**
     * Return the value for the specific property name
     * @param {String} propertyName
     * @return {*}
     */
    getProperty:function (propertyName) {
        return this.properties[propertyName];
    },

    /**
     * Creates the tiles
     */
    setupTiles:function () {
        // Optimization: quick hack that sets the image size on the tileset
        if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
            this.tileset.imageSize = this._originalTexture.getContentSizeInPixels();
        } else {
            this.tileset.imageSize = this.textureAtlas.texture.getContentSizeInPixels();

            // By default all the tiles are aliased
            // pros:
            //  - easier to render
            // cons:
            //  - difficult to scale / rotate / etc.
            this.textureAtlas.texture.setAliasTexParameters();
        }

        // Parse cocos2d properties
        this._parseInternalProperties();
        if (cc._renderType === cc._RENDER_TYPE_CANVAS)
            this._setNodeDirtyForCache();

        var locLayerHeight = this._layerSize.height, locLayerWidth = this._layerSize.width;
        for (var y = 0; y < locLayerHeight; y++) {
            for (var x = 0; x < locLayerWidth; x++) {
                var pos = x + locLayerWidth * y;
                var gid = this.tiles[pos];

                // XXX: gid == 0 -. empty tile
                if (gid !== 0) {
                    this._appendTileForGID(gid, cc.p(x, y));
                    // Optimization: update min and max GID rendered by the layer
                    this._minGID = Math.min(gid, this._minGID);
                    this._maxGID = Math.max(gid, this._maxGID);
                }
            }
        }

        if (!((this._maxGID >= this.tileset.firstGid) && (this._minGID >= this.tileset.firstGid))) {
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
        cc.log("addChild: is not supported on cc.TMXLayer. Instead use setTileGID or tileAt.");
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

        if(this._children.indexOf(sprite) === -1){
            cc.log("cc.TMXLayer.removeChild(): Tile does not belong to TMXLayer");
            return;
        }

        if (cc._renderType === cc._RENDER_TYPE_CANVAS)
            this._setNodeDirtyForCache();
        var atlasIndex = sprite.atlasIndex;
        var zz = this._atlasIndexArray[atlasIndex];
        this.tiles[zz] = 0;
        this._atlasIndexArray.splice(atlasIndex, 1);
        cc.SpriteBatchNode.prototype.removeChild.call(this, sprite, cleanup);
        cc.renderer.childrenOrderDirty = true;
    },

    /**
     * Gets the layer name
     * @return {String}
     */
    getLayerName:function () {
        return this.layerName;
    },

    /**
     * Set the layer name
     * @param {String} layerName
     */
    setLayerName:function (layerName) {
        this.layerName = layerName;
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
        var ret = cc.p(0,0);
        switch (this.layerOrientation) {
            case cc.TMX_ORIENTATION_ORTHO:
                ret = cc.p(pos.x * this._mapTileSize.width, -pos.y * this._mapTileSize.height);
                break;
            case cc.TMX_ORIENTATION_ISO:
                ret = cc.p((this._mapTileSize.width / 2) * (pos.x - pos.y),
                    (this._mapTileSize.height / 2 ) * (-pos.x - pos.y));
                break;
            case cc.TMX_ORIENTATION_HEX:
                if(pos.x !== 0 || pos.y !== 0)
                    cc.log("offset for hexagonal map not implemented yet");
                break;
        }
        return ret;
    },

    _appendTileForGID:function (gid, pos) {
        var rect = this.tileset.rectForGID(gid);
        rect = cc.rectPixelsToPoints(rect);

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
        this._atlasIndexArray.splice(indexForZ, 0, z);
        return tile;
    },

    _insertTileForGID:function (gid, pos) {
        var rect = this.tileset.rectForGID(gid);
        rect = cc.rectPixelsToPoints(rect);

        var z = 0 | (pos.x + pos.y * this._layerSize.width);
        var tile = this._reusedTileWithRect(rect);
        this._setupTileSprite(tile, pos, gid);

        // get atlas index
        var indexForZ = this._atlasIndexForNewZ(z);

        // Optimization: add the quad without adding a child
        this.insertQuadFromSprite(tile, indexForZ);

        // insert it into the local atlasindex array
        this._atlasIndexArray.splice(indexForZ, 0, z);
        // update possible children
        if (this._children) {
            var locChildren = this._children;
            for (var i = 0, len = locChildren.length; i < len; i++) {
                var child = locChildren[i];
                if (child) {
                    var ai = child.atlasIndex;
                    if (ai >= indexForZ)
                        child.atlasIndex = ai + 1;
                }
            }
        }
        this.tiles[z] = gid;
        return tile;
    },

    _updateTileForGID:function (gid, pos) {
        var rect = this.tileset.rectForGID(gid);
        var locScaleFactor = this._contentScaleFactor;
        rect = cc.rect(rect.x / locScaleFactor, rect.y / locScaleFactor,
            rect.width / locScaleFactor, rect.height / locScaleFactor);
        var z = pos.x + pos.y * this._layerSize.width;

        var tile = this._reusedTileWithRect(rect);
        this._setupTileSprite(tile, pos, gid);

        // get atlas index
        tile.atlasIndex = this._atlasIndexForExistantZ(z);
        tile.dirty = true;
        tile.updateTransform();
        this.tiles[z] = gid;

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

                if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
                    this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLORALPHATEST);
                    var alphaValueLocation = cc._renderContext.getUniformLocation(this.shaderProgram.getProgram(), cc.UNIFORM_ALPHA_TEST_VALUE_S);
                    // NOTE: alpha test shader is hard-coded to use the equivalent of a glAlphaFunc(GL_GREATER) comparison
                    this.shaderProgram.use();
                    this.shaderProgram.setUniformLocationWith1f(alphaValueLocation, alphaFuncValue);
                }
            } else
                this._vertexZvalue = parseInt(vertexz, 10);
        }
    },

    _setupTileSprite:function (sprite, pos, gid) {
        var z = pos.x + pos.y * this._layerSize.width;
        sprite.setPosition(this.getPositionAt(pos));
        if (cc._renderType === cc._RENDER_TYPE_WEBGL)
            sprite.vertexZ = this._vertexZForPos(pos);
        else
            sprite.tag = z;

        sprite.anchorX = 0;
	    sprite.anchorY = 0;
        sprite.opacity = this._opacity;
        if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
            sprite.rotation = 0.0;
        }

        sprite.setFlippedX(false);
        sprite.setFlippedY(false);

        // Rotation in tiled is achieved using 3 flipped states, flipping across the horizontal, vertical, and diagonal axes of the tiles.
        if ((gid & cc.TMX_TILE_DIAGONAL_FLAG) >>> 0) {
            // put the anchor in the middle for ease of rotation.
            sprite.anchorX = 0.5;
	        sprite.anchorY = 0.5;
            sprite.x = this.getPositionAt(pos).x + sprite.width / 2;
	        sprite.y = this.getPositionAt(pos).y + sprite.height / 2;

            var flag = (gid & (cc.TMX_TILE_HORIZONTAL_FLAG | cc.TMX_TILE_VERTICAL_FLAG) >>> 0) >>> 0;
            // handle the 4 diagonally flipped states.
            if (flag == cc.TMX_TILE_HORIZONTAL_FLAG)
                sprite.rotation = 90;
            else if (flag == cc.TMX_TILE_VERTICAL_FLAG)
                sprite.rotation = 270;
            else if (flag == (cc.TMX_TILE_VERTICAL_FLAG | cc.TMX_TILE_HORIZONTAL_FLAG) >>> 0) {
                sprite.rotation = 90;
	            sprite.setFlippedX(true);
            } else {
                sprite.rotation = 270;
	            sprite.setFlippedX(true);
            }
        } else {
            if ((gid & cc.TMX_TILE_HORIZONTAL_FLAG) >>> 0) {
                sprite.setFlippedX(true);
            }

            if ((gid & cc.TMX_TILE_VERTICAL_FLAG) >>> 0) {
                sprite.setFlippedY(true);
            }
        }
    },

    _reusedTileWithRect:function (rect) {
        if(cc._renderType === cc._RENDER_TYPE_WEBGL){
            if (!this._reusedTile) {
                this._reusedTile = new cc.Sprite();
                this._reusedTile.initWithTexture(this.texture, rect, false);
                this._reusedTile.batchNode = this;
            } else {
                // XXX HACK: Needed because if "batch node" is nil,
                // then the Sprite'squad will be reset
                this._reusedTile.batchNode = null;

                // Re-init the sprite
                this._reusedTile.setTextureRect(rect, false);

                // restore the batch node
                this._reusedTile.batchNode = this;
            }
        } else {
            this._reusedTile = new cc.Sprite();
            this._reusedTile.initWithTexture(this._textureForCanvas, rect, false);
            this._reusedTile.batchNode = this;
            this._reusedTile.parent = this;
            this._reusedTile._cachedParent = this;
        }
        return this._reusedTile;
    },

    _vertexZForPos:function (pos) {
        var ret = 0;
        var maxVal = 0;
        if (this._useAutomaticVertexZ) {
            switch (this.layerOrientation) {
                case cc.TMX_ORIENTATION_ISO:
                    maxVal = this._layerSize.width + this._layerSize.height;
                    ret = -(maxVal - (pos.x + pos.y));
                    break;
                case cc.TMX_ORIENTATION_ORTHO:
                    ret = -(this._layerSize.height - pos.y);
                    break;
                case cc.TMX_ORIENTATION_HEX:
                    cc.log("TMX Hexa zOrder not supported");
                    break;
                default:
                    cc.log("TMX invalid value");
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
        if(!cc.isNumber(item))
            cc.log("cc.TMXLayer._atlasIndexForExistantZ(): TMX atlas index not found. Shall not happen");
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

var _p = cc.TMXLayer.prototype;

if(cc._renderType == cc._RENDER_TYPE_WEBGL){
	_p.draw = cc.SpriteBatchNode.prototype.draw;
    _p.visit = cc.SpriteBatchNode.prototype.visit;
	_p.getTexture = cc.SpriteBatchNode.prototype.getTexture;
}else{
    _p.draw = _p._drawForCanvas;
    _p.visit = _p._visitForCanvas;
	_p.getTexture = _p._getTextureForCanvas;
}

/** @expose */
cc.defineGetterSetter(_p, "texture", _p.getTexture, _p.setTexture);

// Extended properties
/** @expose */
_p.layerWidth;
cc.defineGetterSetter(_p, "layerWidth", _p._getLayerWidth, _p._setLayerWidth);
/** @expose */
_p.layerHeight;
cc.defineGetterSetter(_p, "layerHeight", _p._getLayerHeight, _p._setLayerHeight);
/** @expose */
_p.tileWidth;
cc.defineGetterSetter(_p, "tileWidth", _p._getTileWidth, _p._setTileWidth);
/** @expose */
_p.tileHeight;
cc.defineGetterSetter(_p, "tileHeight", _p._getTileHeight, _p._setTileHeight);


/**
 * Creates a cc.TMXLayer with an tile set info, a layer info and a map info
 * @deprecated since v3.0 please use new cc.TMXLayer(tilesetInfo, layerInfo, mapInfo) instead.
 * @param {cc.TMXTilesetInfo} tilesetInfo
 * @param {cc.TMXLayerInfo} layerInfo
 * @param {cc.TMXMapInfo} mapInfo
 * @return {cc.TMXLayer|Null}
 */
cc.TMXLayer.create = function (tilesetInfo, layerInfo, mapInfo) {
    return new cc.TMXLayer(tilesetInfo, layerInfo, mapInfo);
};
