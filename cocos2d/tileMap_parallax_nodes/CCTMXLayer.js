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
    _m_tLayerSize:cc.SizeZero(),
    _m_tMapTileSize:cc.SizeZero(),
    _m_pTiles:null,
    _m_pTileSet:null,
    _m_uLayerOrientation:null,
    _m_pProperties:null,
    //! name of the layer
    _m_sLayerName:"",
    //! TMX Layer supports opacity
    _m_cOpacity:null,
    _m_uMinGID:null,
    _m_uMaxGID:null,
    //! Only used when vertexZ is used
    _m_nVertexZvalue:null,
    _m_bUseAutomaticVertexZ:null,
    _m_fAlphaFuncValue:null,
    //! used for optimization
    _m_pReusedTile:null,
    _m_pAtlasIndexArray:null,
    // used for retina display
    _m_fContentScaleFactor:null,
    ctor:function(){
        this._m_pChildren = [];
        this._m_pobDescendants = [];
    },
    getLayerSize:function () {
        return this._m_tLayerSize;
    },
    setLayerSize:function (Var) {
        this._m_tLayerSize = Var;
    },

    /** size of the map's tile (could be differnt from the tile's size) */
    getMapTileSize:function () {
        return this._m_tMapTileSize;
    },
    setMapTileSize:function (Var) {
        this._m_tMapTileSize = Var;
    },
    /** pointer to the map of tiles */
    getTiles:function () {
        return this._m_pTiles;
    },
    setTiles:function (Var) {
        this._m_pTiles = Var;
    },
    /** Tilset information for the layer */
    getTileSet:function () {
        return this._m_pTileSet;
    },
    setTileSet:function (Var) {
        this._m_pTileSet = Var;
    },
    /** Layer orientation, which is the same as the map orientation */
    getLayerOrientation:function () {
        return this._m_uLayerOrientation;
    },
    setLayerOrientation:function (Var) {
        this._m_uLayerOrientation = Var;
    },
    /** properties from the layer. They can be added using Tiled */
    getProperties:function () {
        return this._m_pProperties;
    },
    setProperties:function (Var) {
        this._m_pProperties = Var;
    },
    /** initializes a cc.TMXLayer with a tileset info, a layer info and a map info */
    initWithTilesetInfo:function (tilesetInfo, layerInfo, mapInfo) {
    // XXX: is 35% a good estimate ?
        var size = layerInfo._m_tLayerSize;
        var totalNumberOfTiles = parseInt(size.width * size.height);
        var capacity = totalNumberOfTiles * 0.35 + 1; // 35 percent is occupied ?

        var texture = null;
        if(tilesetInfo){
            texture = cc.TextureCache.sharedTextureCache().addImage(tilesetInfo.m_sSourceImage.toString());
        }
        if (this.initWithTexture(texture, capacity)){
            // layerInfo
            this._m_sLayerName = layerInfo.m_sName;
            this._m_tLayerSize = layerInfo._m_tLayerSize;
            this._m_pTiles = layerInfo._m_pTiles;
            this._m_uMinGID = layerInfo._m_uMinGID;
            this._m_uMaxGID = layerInfo._m_uMaxGID;
            this._m_cOpacity = layerInfo._m_cOpacity;
            this._m_pProperties = layerInfo.getProperties();
            this._m_fContentScaleFactor = cc.Director.sharedDirector().getContentScaleFactor();

            // tilesetInfo
            this._m_pTileSet = tilesetInfo;

            // mapInfo
            this._m_tMapTileSize = mapInfo.getTileSize();
            this._m_uLayerOrientation = mapInfo.getOrientation();

            // offset (after layer orientation is set);
            var offset = this._calculateLayerOffset(layerInfo.m_tOffset);
            this.setPosition(offset);

            this._m_pAtlasIndexArray = new Array(totalNumberOfTiles);

            this.setContentSizeInPixels(cc.SizeMake(this._m_tLayerSize.width * this._m_tMapTileSize.width, this._m_tLayerSize.height * this._m_tMapTileSize.height));
            this._m_tMapTileSize.width /= this._m_fContentScaleFactor;
            this._m_tMapTileSize.height /= this._m_fContentScaleFactor;

            this._m_bUseAutomaticVertexZ = false;
            this._m_nVertexZvalue = 0;
            this._m_fAlphaFuncValue = 0;
            return true;
        }
        return false;
    },

    /** dealloc the map that contains the tile position from memory.
     Unless you want to know at runtime the tiles positions, you can safely call this method.
     If you are going to call layer.tileGIDAt() then, don't release the map
     */
    releaseMap:function () {
        if( this._m_pTiles ) {
            this._m_pTiles = null;
        }

        if( this._m_pAtlasIndexArray ){
            this._m_pAtlasIndexArray = null;
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
        cc.Assert( pos.x < this._m_tLayerSize.width && pos.y < this._m_tLayerSize.height && pos.x >=0 && pos.y >=0, "TMXLayer: invalid position");
        cc.Assert( this._m_pTiles && this._m_pAtlasIndexArray, "TMXLayer: the tiles map has been released");

        var tile = null;
        var gid = this.tileGIDAt(pos);

        // if GID == 0, then no tile is present
        if(gid){
            var z = pos.x + pos.y * this._m_tLayerSize.width;

            tile = this.getChildByTag(z);

            // tile not created yet. create it
            if( ! tile ){
                var rect = this._m_pTileSet.rectForGID(gid);
                rect = cc.RectMake(rect.origin.x / this._m_fContentScaleFactor, rect.origin.y / this._m_fContentScaleFactor, rect.size.width/ this._m_fContentScaleFactor, rect.size.height/ this._m_fContentScaleFactor);

                tile = new cc.Sprite();

                tile.initWithBatchNode(this, rect);
                tile.setPosition(this.positionAt(pos));
                tile.setVertexZ(this._vertexZForPos(pos));
                tile.setAnchorPoint(cc.PointZero());
                tile.setOpacity(this._m_cOpacity);

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
        cc.Assert( pos.x < this._m_tLayerSize.width && pos.y < this._m_tLayerSize.height && pos.x >=0 && pos.y >=0, "TMXLayer: invalid position");
        cc.Assert( this._m_pTiles && this._m_pAtlasIndexArray, "TMXLayer: the tiles map has been released");

        var idx = pos.x + pos.y * this._m_tLayerSize.width;
        return this._m_pTiles[ idx ];
    },

    /** sets the tile gid (gid = tile global id) at a given tile coordinate.
     The Tile GID can be obtained by using the method "tileGIDAt" or by using the TMX editor . Tileset Mgr +1.
     If a tile is already placed at that position, then it will be removed.
     */
    setTileGID:function (gid, pos) {
        cc.Assert( pos.x < this._m_tLayerSize.width && pos.y < this._m_tLayerSize.height && pos.x >=0 && pos.y >=0, "TMXLayer: invalid position");
        cc.Assert( this._m_pTiles && this._m_pAtlasIndexArray, "TMXLayer: the tiles map has been released");
        cc.Assert( gid !== 0 || !(gid >= this._m_pTileSet.m_uFirstGid) ,  "TMXLayer: invalid gid:"+gid );

        var currentGID = this.tileGIDAt(pos);

        if( currentGID != gid ){
            // setting gid=0 is equal to remove the tile
            if( gid == 0 ){
                this.removeTileAt(pos);
            }

            // empty tile. create a new one
            else if( currentGID == 0 ) {
                this._insertTileForGID(gid, pos);
            }

            // modifying an existing tile with a non-empty tile
            else{
                var z = pos.x + pos.y * this._m_tLayerSize.width;
                var sprite = new cc.Sprite();
                sprite.getChildByTag(z);
                if(sprite){
                    var rect = this._m_pTileSet.rectForGID(gid);
                    rect = cc.RectMake(rect.origin.x / this._m_fContentScaleFactor, rect.origin.y / this._m_fContentScaleFactor, rect.size.width/ this._m_fContentScaleFactor, rect.size.height/ this._m_fContentScaleFactor);

                    sprite.setTextureRectInPixels(rect, false, rect.size);
                    this._m_pTiles[z] = gid;
                }
                else{
                    this._updateTileForGID(gid, pos);
                }
            }
        }
    },

    /** removes a tile at given tile coordinate */
    removeTileAt:function (pos) {
        cc.Assert( pos.x < this._m_tLayerSize.width && pos.y < this._m_tLayerSize.height && pos.x >=0 && pos.y >=0, "TMXLayer: invalid position");
        cc.Assert( this._m_pTiles && this._m_pAtlasIndexArray, "TMXLayer: the tiles map has been released");

        var gid = this.tileGIDAt(pos);

        if( gid ){
            var z = pos.x + pos.y * this._m_tLayerSize.width;
            var atlasIndex = this._atlasIndexForExistantZ(z);

            // remove tile from GID map
            this._m_pTiles[z] = 0;

            // remove tile from atlas position array
            cc.ArrayRemoveObjectAtIndex(this._m_pAtlasIndexArray, atlasIndex);

            // remove it from sprites and/or texture atlas
            var sprite =this.getChildByTag(z);

            if(sprite){
                this.removeChild(sprite, true);
            }
            else{
                this._m_pobTextureAtlas.removeQuadAtIndex(atlasIndex);

                // update possible children
                if (this._m_pChildren){
                    for(var i = 0,len=this._m_pChildren.length;i<len;i++){
                        var pChild = this._m_pChildren[i];
                        if (pChild) {
                            var ai = pChild.getAtlasIndex();
                            if ( ai >= atlasIndex ) {
                                pChild.setAtlasIndex(ai-1);
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
        switch( this._m_uLayerOrientation ){
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
        return this._m_pProperties[propertyName];
    },

    /** Creates the tiles */
    setupTiles:function () {
// Optimization: quick hack that sets the image size on the tileset
        var textureCache = this._m_pobTextureAtlas.getTexture();
        this._m_pTileSet.m_tImageSize = new cc.Size(textureCache.width,textureCache.height);

        // By default all the tiles are aliased
        // pros:
        //  - easier to render
        // cons:
        //  - difficult to scale / rotate / etc.
        //this._m_pobTextureAtlas.getTexture().setAliasTexParameters();

        //CFByteOrder o = CFByteOrderGetCurrent();

        // Parse cocos2d properties
        this._parseInternalProperties();

        for(var y=0; y < this._m_tLayerSize.height; y++) {
            for(var x=0; x < this._m_tLayerSize.width; x++){
                var pos = x + this._m_tLayerSize.width * y;
                var gid = this._m_pTiles[pos];
                // gid are stored in little endian.
                // if host is big endian, then swap
                //if( o == CFByteOrderBigEndian )
                //	gid = CFSwapInt32( gid );
                /* We support little endian.*/

                // XXX: gid == 0 -. empty tile
               if(gid != 0) {
                    this._appendTileForGID(gid, cc.ccp(x, y));
                    // Optimization: update min and max GID rendered by the layer
                    this._m_uMinGID = Math.min(gid, this._m_uMinGID);
                    this._m_uMaxGID = Math.max(gid, this._m_uMaxGID);
                }
            }
        }

        cc.Assert( this._m_uMaxGID >= this._m_pTileSet.m_uFirstGid &&
            this._m_uMinGID >= this._m_pTileSet.m_uFirstGid, "TMX: Only 1 tilset per layer is supported");
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
        if(!sprite)
            return;

        cc.Assert(cc.ArrayContainsObject(this._m_pChildren,sprite), "Tile does not belong to TMXLayer");

        var atlasIndex = sprite.getAtlasIndex();
        var zz = this._m_pAtlasIndexArray[atlasIndex];
        this._m_pTiles[zz] = 0;
        cc.ArrayRemoveObjectAtIndex(this._m_pAtlasIndexArray, atlasIndex);

        this._super(sprite, cleanup);
    },
    draw:function () {
        //cc.Log("Start TMXLayer Draw()");
        if( this._m_bUseAutomaticVertexZ ) {
            //TODO need to fix
            //glEnable(GL_ALPHA_TEST);
            //glAlphaFunc(GL_GREATER, this._m_fAlphaFuncValue);
        }

        this._super();

        if( this._m_bUseAutomaticVertexZ ){
            //glDisable(GL_ALPHA_TEST);
        }
    },

    getLayerName:function () {
        return this._m_sLayerName.toString();
    },
    setLayerName:function (layerName) {
        this._m_sLayerName = layerName;
    },
    /*private:*/
    _positionForIsoAt:function (pos) {
        var xy = cc.PointMake(this._m_tMapTileSize.width /2 * ( this._m_tLayerSize.width + pos.x - pos.y - 1),
            this._m_tMapTileSize.height /2 * (( this._m_tLayerSize.height * 2 - pos.x - pos.y) - 2));
        return xy;
    },
    _positionForOrthoAt:function (pos) {
        var xy = cc.PointMake(pos.x * this._m_tMapTileSize.width,
            (this._m_tLayerSize.height - pos.y - 1) * this._m_tMapTileSize.height);
        return xy;
    },
    _positionForHexAt:function (pos) {
        var diffY = 0;
        if( pos.x % 2 == 1 ){
            diffY = -this._m_tMapTileSize.height/2 ;
        }

        var xy = cc.PointMake(pos.x * this._m_tMapTileSize.width*3/4,
            (this._m_tLayerSize.height - pos.y - 1) * this._m_tMapTileSize.height + diffY);
        return xy;
    },

    _calculateLayerOffset:function (pos) {
        var ret = cc.PointZero;
        switch( this._m_uLayerOrientation ){
            case cc.TMXOrientationOrtho:
                ret = cc.ccp( pos.x * this._m_tMapTileSize.width, -pos.y *this._m_tMapTileSize.height);
                break;
            case cc.TMXOrientationIso:
                ret = cc.ccp( (this._m_tMapTileSize.width /2) * (pos.x - pos.y),
                    (this._m_tMapTileSize.height /2 ) * (-pos.x - pos.y) );
                break;
            case cc.TMXOrientationHex:
                ret = cc.ccp(0,0);
                cc.LOG("cocos2d:offset for hexagonal map not implemented yet");
                break;
        }
        return ret;
    },

    /* optimization methos */
    _appendTileForGID:function (gid, pos) {
        var rect = this._m_pTileSet.rectForGID(gid);
        rect = cc.RectMake(rect.origin.x / this._m_fContentScaleFactor, rect.origin.y / this._m_fContentScaleFactor, rect.size.width/ this._m_fContentScaleFactor, rect.size.height/ this._m_fContentScaleFactor);

        var z = pos.x + pos.y * this._m_tLayerSize.width;

        this._m_pReusedTile = new cc.Sprite();
        this._m_pReusedTile.initWithBatchNode(this, rect);
        this._m_pReusedTile.setPosition(this.positionAt(pos));
        this._m_pReusedTile.setVertexZ(this._vertexZForPos(pos));
        this._m_pReusedTile.setAnchorPoint(cc.PointZero());
        this._m_pReusedTile.setOpacity(this._m_cOpacity);
        this._m_pReusedTile.setTag(z);

        // optimization:
        // The difference between _appendTileForGID and _insertTileForGID is that append is faster, since
        // it appends the tile at the end of the texture atlas
        //todo fix
        var indexForZ = this._m_pAtlasIndexArray.length;

        // don't add it using the "standard" way.
        this.addQuadFromSprite(this._m_pReusedTile, indexForZ);

        // append should be after addQuadFromSprite since it modifies the quantity values
        cc.ArrayAppendObjectToIndex(this._m_pAtlasIndexArray, z, indexForZ);
        return this._m_pReusedTile;
    },
    _insertTileForGID:function (gid, pos) {
        var rect = this._m_pTileSet.rectForGID(gid);
        rect = cc.RectMake(rect.origin.x / this._m_fContentScaleFactor, rect.origin.y / this._m_fContentScaleFactor, rect.size.width/ this._m_fContentScaleFactor, rect.size.height/ this._m_fContentScaleFactor);

        var z = parseInt(pos.x + pos.y * this._m_tLayerSize.width);

        if( ! this._m_pReusedTile ) {
            this._m_pReusedTile = new cc.Sprite();
            this._m_pReusedTile.initWithBatchNode(this, rect);
        }
        else {
            this._m_pReusedTile.initWithBatchNode(this, rect);
        }
        this._m_pReusedTile.setPositionInPixels(this.positionAt(pos));
        this._m_pReusedTile.setVertexZ(this._vertexZForPos(pos));
        this._m_pReusedTile.setAnchorPoint(cc.PointZero);
        this._m_pReusedTile.setOpacity(this._m_cOpacity);

        // get atlas index
        var indexForZ = this._atlasIndexForNewZ(z);

        // Optimization: add the quad without adding a child
        this.addQuadFromSprite(this._m_pReusedTile, indexForZ);

        // insert it into the local atlasindex array
        cc.ArrayAppendObjectToIndex(this._m_pAtlasIndexArray, z, indexForZ);

        // update possible children
        if (this._m_pChildren) {
            for(var i =0,len =this._m_pChildren.length;i<len;i++){
                var pChild = this._m_pChildren[i];
                if (pChild) {
                    var ai = pChild.getAtlasIndex();
                    if ( ai >= indexForZ ){
                        pChild.setAtlasIndex(ai+1);
                    }
                }
            }
        }
        this._m_pTiles[z] = gid;
        return this._m_pReusedTile;
    },
    _updateTileForGID:function (gid, pos) {
        var rect = this._m_pTileSet.rectForGID(gid);
        rect = cc.RectMake(rect.origin.x / this._m_fContentScaleFactor, rect.origin.y / this._m_fContentScaleFactor, rect.size.width/ this._m_fContentScaleFactor, rect.size.height/ this._m_fContentScaleFactor);
        var z = pos.x + pos.y * this._m_tLayerSize.width;

        if( ! this._m_pReusedTile ) {
            this._m_pReusedTile = new cc.Sprite();
            this._m_pReusedTile.initWithBatchNode(this, rect);
        }
        else{
            this._m_pReusedTile.initWithBatchNode(this, rect);
        }

        this._m_pReusedTile.setPositionInPixels(this.positionAt(pos));
        this._m_pReusedTile.setVertexZ(this._vertexZForPos(pos));
        this._m_pReusedTile.setAnchorPoint(cc.PointZero);
        this._m_pReusedTile.setOpacity(this._m_cOpacity);

        // get atlas index
        var indexForZ = this._atlasIndexForExistantZ(z);
        this._m_pReusedTile.setAtlasIndex(indexForZ);
        this._m_pReusedTile.setDirty(true);
        this._m_pReusedTile.updateTransform();
        this._m_pTiles[z] = gid;

        return this._m_pReusedTile;
    },

    /* The layer recognizes some special properties, like cc_vertez */
    _parseInternalProperties:function () {
// if cc_vertex=automatic, then tiles will be rendered using vertexz

        var vertexz = this.propertyNamed("cc_vertexz");
        if( vertexz ){
            if( vertexz == "automatic" ){
                this._m_bUseAutomaticVertexZ = true;
            }
            else{
                this._m_nVertexZvalue = parseInt(vertexz);
            }
        }

        var alphaFuncVal = this.propertyNamed("cc_alpha_func");
        if (alphaFuncVal) {
            this._m_fAlphaFuncValue = parseInt(alphaFuncVal);
        }
    },
    _vertexZForPos:function (pos) {
        var ret = 0;
        var maxVal = 0;
        if( this._m_bUseAutomaticVertexZ ) {
            switch( this._m_uLayerOrientation )
            {
                case cc.TMXOrientationIso:
                    maxVal = this._m_tLayerSize.width + this._m_tLayerSize.height;
                    ret = -(maxVal - (pos.x + pos.y));
                    break;
                case cc.TMXOrientationOrtho:
                    ret = -(this._m_tLayerSize.height-pos.y);
                    break;
                case cc.TMXOrientationHex:
                    cc.Assert(0, "TMX Hexa zOrder not supported");
                    break;
                default:
                    cc.Assert(0, "TMX invalid value");
                    break;
            }
        }
        else{
            ret = this._m_nVertexZvalue;
        }
        return ret;
    },

// index
    _atlasIndexForExistantZ:function (z) {
        var item = this._m_pAtlasIndexArray[z];
        if(item){
            return z;
        }
        else{
            cc.LOG( item, "TMX atlas index not found. Shall not happen");
        }
    },
    _atlasIndexForNewZ:function (z) {
        for(var i=0; i< this._m_pAtlasIndexArray.length ; i++){
            var val =  this._m_pAtlasIndexArray[i];
            if( z < val )
                break;
        }
        return i;
    }
});

/** creates a cc.TMXLayer with an tileset info, a layer info and a map info */
cc.TMXLayer.layerWithTilesetInfo = function (tilesetInfo, layerInfo, mapInfo) {
    var pRet = new cc.TMXLayer();
    if (pRet.initWithTilesetInfo(tilesetInfo, layerInfo, mapInfo)){
        return pRet;
    }
    return null;
};

// cc.TMXLayer - atlasIndex and Z
cc.compareInts = function(a,b)
{
    return a - b;
}