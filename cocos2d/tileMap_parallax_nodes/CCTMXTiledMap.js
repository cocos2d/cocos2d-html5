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

/** Possible oritentations of the TMX map */
/** Orthogonal orientation */
cc.TMXOrientationOrtho = 1;
/** Hexagonal orientation */
cc.TMXOrientationHex = 2;
/** Isometric orientation */
cc.TMXOrientationIso = 3;

/** @brief cc.TMXTiledMap knows how to parse and render a TMX map.

 It adds support for the TMX tiled map format used by http://www.mapeditor.org
 It supports isometric, hexagonal and orthogonal tiles.
 It also supports object groups, objects, and properties.

 Features:
 - Each tile will be treated as an cc.Sprite
 - The sprites are created on demand. They will be created only when you call "layer.tileAt(position)"
 - Each tile can be rotated / moved / scaled / tinted / "opacitied", since each tile is a cc.Sprite
 - Tiles can be added/removed in runtime
 - The z-order of the tiles can be modified in runtime
 - Each tile has an anchorPoint of (0,0)
 - The anchorPoint of the TMXTileMap is (0,0)
 - The TMX layers will be added as a child
 - The TMX layers will be aliased by default
 - The tileset image will be loaded using the cc.TextureCache
 - Each tile will have a unique tag
 - Each tile will have a unique z value. top-left: z=1, bottom-right: z=max z
 - Each object group will be treated as an cc.MutableArray
 - Object class which will contain all the properties in a dictionary
 - Properties can be assigned to the Map, Layer, Object Group, and Object

 Limitations:
 - It only supports one tileset per layer.
 - Embeded images are not supported
 - It only supports the XML format (the JSON format is not supported)

 Technical description:
 Each layer is created using an cc.TMXLayer (subclass of cc.SpriteBatchNode). If you have 5 layers, then 5 cc.TMXLayer will be created,
 unless the layer visibility is off. In that case, the layer won't be created at all.
 You can obtain the layers (cc.TMXLayer objects) at runtime by:
 - map.getChildByTag(tag_number);  // 0=1st layer, 1=2nd layer, 2=3rd layer, etc...
 - map.layerNamed(name_of_the_layer);

 Each object group is created using a cc.TMXObjectGroup which is a subclass of cc.MutableArray.
 You can obtain the object groups at runtime by:
 - map.objectGroupNamed(name_of_the_object_group);

 Each object is a cc.TMXObject.

 Each property is stored as a key-value pair in an cc.MutableDictionary.
 You can obtain the properties at runtime by:

 map.propertyNamed(name_of_the_property);
 layer.propertyNamed(name_of_the_property);
 objectGroup.propertyNamed(name_of_the_property);
 object.propertyNamed(name_of_the_property);

 @since v0.8.1
 */
cc.TMXTiledMap = cc.Node.extend({
    /*the map's size property measured in tiles */
    _m_tMapSize:cc.SizeZero(),
    _m_tTileSize:cc.SizeZero(),
    _m_pProperties:null,
    _m_pObjectGroups:null,
    _m_nMapOrientation:null,
    //! tile properties
    _m_pTMXLayers:null,
    _m_pTileProperties:[],
    getMapSize:function () {
        return this._m_tMapSize;
    },
    setMapSize:function (Var) {
        this._m_tMapSize = Var;
    },
    getTileSize:function () {
        return this._m_tTileSize;
    },
    setTileSize:function (Var) {
        this._m_tTileSize = Var;
    },
    setAnchorPoint:function(point){
        if(point == this.getAnchorPoint()){
            return;
        }
        this._super(point);
        for(var key in this._m_pTMXLayers ){
            this._m_pTMXLayers[key].setAnchorPoint(point);
        }
    },
    setScale:function(newScale){
        if(newScale == this.getScaleX()&&newScale==this.getScaleY()){
            return;
        }
        this._super(newScale);
        for(var key in this._m_pTMXLayers ){
            this._m_pTMXLayers[key].setScale(newScale);
        }
    },
    setScaleX:function(newScaleX){
        if(newScaleX == this.getScaleX()){
            return;
        }
        this._super(newScaleX);
        for(var key in this._m_pTMXLayers ){
            this._m_pTMXLayers[key].setScaleX(newScaleX);
        }
    },
    setScaleY:function(newScaleY){
        if(newScaleY == this.getScaleY()){
            return;
        }
        this._super(newScaleY);
        for(var key in this._m_pTMXLayers ){
            this._m_pTMXLayers[key].setScaleY(newScaleY);
        }
    },
    /** map orientation */
    getMapOrientation:function () {
        return this._m_nMapOrientation;
    },
    setMapOrientation:function (Var) {
        this._m_nMapOrientation = Var;
    },
    /** object groups */
    getObjectGroups:function () {
        return this._m_pObjectGroups;
    },
    setObjectGroups:function (Var) {
        this._m_pObjectGroups = Var;
    },
    /** properties */
    getProperties:function () {
        return this._m_pProperties;
    },
    setProperties:function (Var) {
        this._m_pProperties = Var;
    },
    setPosition:function(position){
        this._super(position);
        for(var key in this._m_pTMXLayers){
            this._m_pTMXLayers[key].setPosition(position);
        }
    },
    /*public:*/
    initWithTMXFile:function (tmxFile) {
        cc.Assert(tmxFile != null && tmxFile.length>0, "TMXTiledMap: tmx file should not bi nil");

        this.setContentSize(cc.SizeZero());

        var mapInfo = cc.TMXMapInfo.formatWithTMXFile(tmxFile);

        if (!mapInfo){
            return false;
        }
        cc.Assert( mapInfo.getTilesets().length != 0, "TMXTiledMap: Map not found. Please check the filename.");

        this._m_tMapSize = mapInfo.getMapSize();
        this._m_tTileSize = mapInfo.getTileSize();
        this._m_pProperties = mapInfo.getOrientation();
        this.setObjectGroups(mapInfo.getObjectGroups());
        this.setProperties(mapInfo.getProperties());
        this._m_pTileProperties = mapInfo.getTileProperties();

        var idx = 0;

        var layers = mapInfo.getLayers();
        if (layers){
            if (this._m_pTMXLayers == null) {
                this._m_pTMXLayers = new Object();
                cc.Assert(this._m_pTMXLayers, "Allocate memory failed!");
            }

            var layerInfo = null;
            for(var i = 0,len=layers.length;i<len;i++) {
                layerInfo = layers[i];
                if (layerInfo && layerInfo.m_bVisible) {
                    var child = this.parseLayer(layerInfo, mapInfo);
                    this.addChild(child, idx, idx);
                    //todo add layer
                    // record the cc.TMXLayer object by it's name
                    var layerName = child.getLayerName();
                    this._m_pTMXLayers[layerName] = child;

                    // update content size with the max size
                    var childSize = child.getContentSize();
                    var currentSize = this.getContentSize();
                    currentSize.width = Math.max( currentSize.width, childSize.width );
                    currentSize.height = Math.max( currentSize.height, childSize.height );
                    this.setContentSize(currentSize);

                    idx++;
                }
            }


        }
        return true;
    },

    /** return the TMXLayer for the specific layer */
    layerNamed:function (layerName) {
        var sLayerName = layerName;
        var pRet = new cc.TMXLayer();
        pRet = this._m_pTMXLayers[sLayerName];
        return pRet;
    },

    /** return the TMXObjectGroup for the secific group */
    objectGroupNamed:function (groupName) {
        var sGroupName = groupName;
        if (this._m_pObjectGroups) {
            var objectGroup;
            for (var i=0,len=this._m_pObjectGroups.length;i<len;i++)
            {
                objectGroup = this._m_pObjectGroups[i];
                if (objectGroup && objectGroup.getGroupName() == sGroupName)
                {
                    return objectGroup;
                }
            }
        }

        // objectGroup not found
        return null;
    },

    /** return the value for the specific property name */
    propertyNamed:function (propertyName) {
        return this._m_pProperties[propertyName.toString()];
    },

    /** return properties dictionary for tile GID */
    propertiesForGID:function (GID) {
        return this._m_pTileProperties[GID];
    },
    /*private:*/
    parseLayer:function (layerInfo, mapInfo) {
        var tileset = this.tilesetForLayer(layerInfo, mapInfo);
        var layer = cc.TMXLayer.layerWithTilesetInfo(tileset, layerInfo, mapInfo);
        // tell the layerinfo to release the ownership of the tiles map.
        layerInfo.m_bOwnTiles = false;
        layer.setupTiles();

        return layer;
    },
    tilesetForLayer:function (layerInfo, mapInfo) {
        var size = layerInfo._m_tLayerSize;
        var tilesets = mapInfo.getTilesets();
        if (tilesets) {
            var tileset = null;
            for (var i=0,len=tilesets.length;i<len;i++){
                tileset = tilesets[i];
                if (tileset){
                    for( var y=0; y < size.height; y++ ){
                        for( var x=0; x < size.width; x++ ){
                            var pos = (x + size.width * y).toString();
                            var gid = layerInfo._m_pTiles[pos];
                            // gid are stored in little endian.
                            // if host is big endian, then swap
                            //if( o == CFByteOrderBigEndian )
                            //	gid = CFSwapInt32( gid );
                            /* We support little endian.*/

                            // XXX: gid == 0 --> empty tile
                            // Optimization: quick return
                            // if the layer is invalid (more than 1 tileset per layer) an cc.Assert will be thrown later
                           if( gid !== 0 && gid >= tileset.m_uFirstGid) {
                                    return tileset;
                            }

                        }
                    }
                }
            }
        }

        // If all the tiles are 0, return empty tileset
        cc.LOG("cocos2d: Warning: TMX Layer "+layerInfo.m_sName+" has no tiles");
        return null;
    }

});

/** creates a TMX Tiled Map with a TMX file.*/
// implementation cc.TMXTiledMap
cc.TMXTiledMap.tiledMapWithTMXFile = function (tmxFile) {
    var pRet = new cc.TMXTiledMap();
    if (pRet.initWithTMXFile(tmxFile)){
        return pRet;
    }
    return null;
};