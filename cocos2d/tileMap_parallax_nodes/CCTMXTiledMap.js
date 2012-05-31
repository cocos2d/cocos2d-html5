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
    _mapSize:cc.SizeZero(),
    _tileSize:cc.SizeZero(),
    _properties:null,
    _objectGroups:null,
    _mapOrientation:null,
    //! tile properties
    _tMXLayers:null,
    _tileProperties:[],
    getMapSize:function () {
        return this._mapSize;
    },
    setMapSize:function (Var) {
        this._mapSize = Var;
    },
    getTileSize:function () {
        return this._tileSize;
    },
    setTileSize:function (Var) {
        this._tileSize = Var;
    },
    /** map orientation */
    getMapOrientation:function () {
        return this._mapOrientation;
    },
    setMapOrientation:function (Var) {
        this._mapOrientation = Var;
    },
    /** object groups */
    getObjectGroups:function () {
        return this._objectGroups;
    },
    setObjectGroups:function (Var) {
        this._objectGroups = Var;
    },
    /** properties */
    getProperties:function () {
        return this._properties;
    },
    setProperties:function (Var) {
        this._properties = Var;
    },
    /*public:*/
    initWithTMXFile:function (tmxFile) {
        cc.Assert(tmxFile != null && tmxFile.length > 0, "TMXTiledMap: tmx file should not be nil");

        this.setContentSize(cc.SizeZero());

        var mapInfo = cc.TMXMapInfo.formatWithTMXFile(tmxFile);

        if (!mapInfo) {
            return false;
        }
        cc.Assert(mapInfo.getTilesets().length != 0, "TMXTiledMap: Map not found. Please check the filename.");

        this._mapSize = mapInfo.getMapSize();
        this._tileSize = mapInfo.getTileSize();
        this._properties = mapInfo.getOrientation();
        this.setObjectGroups(mapInfo.getObjectGroups());
        this.setProperties(mapInfo.getProperties());
        this._tileProperties = mapInfo.getTileProperties();

        var idx = 0;

        var layers = mapInfo.getLayers();
        if (layers) {
            this._tMXLayers = new Object();

            var layerInfo = null;
            for (var i = 0, len = layers.length; i < len; i++) {
                layerInfo = layers[i];
                if (layerInfo && layerInfo.visible) {
                    var child = this.parseLayer(layerInfo, mapInfo);
                    this.addChild(child, idx, idx);
                    //todo add layer
                    // record the cc.TMXLayer object by it's name
                    var layerName = child.getLayerName();
                    this._tMXLayers[layerName] = child;

                    // update content size with the max size
                    var childSize = child.getContentSize();
                    var currentSize = this.getContentSize();
                    currentSize.width = Math.max(currentSize.width, childSize.width);
                    currentSize.height = Math.max(currentSize.height, childSize.height);
                    this.setContentSize(currentSize);

                    idx++;
                }
            }
        }
        return true;
    },

    /** return the TMXLayer for the specific layer */
    layerNamed:function (layerName) {
        if(this._tMXLayers.hasOwnProperty(layerName)){
            return this._tMXLayers[layerName];
        }
        return null;
    },

    /** return the TMXObjectGroup for the secific group */
    objectGroupNamed:function (groupName) {
        if (this._objectGroups) {
            for (var i = 0; i < this._objectGroups.length; i++) {
                var objectGroup = this._objectGroups[i];
                if (objectGroup && objectGroup.getGroupName() == groupName) {
                    return objectGroup;
                }
            }
        }
        // objectGroup not found
        return null;
    },

    /** return the value for the specific property name */
    propertyNamed:function (propertyName) {
        return this._properties[propertyName.toString()];
    },

    /** return properties dictionary for tile GID */
    propertiesForGID:function (GID) {
        return this._tileProperties[GID];
    },
    /*private:*/
    parseLayer:function (layerInfo, mapInfo) {
        var tileset = this.tilesetForLayer(layerInfo, mapInfo);
        var layer = cc.TMXLayer.layerWithTilesetInfo(tileset, layerInfo, mapInfo);
        // tell the layerinfo to release the ownership of the tiles map.
        layerInfo.ownTiles = false;
        layer.setupTiles();

        return layer;
    },
    tilesetForLayer:function (layerInfo, mapInfo) {
        var size = layerInfo._layerSize;
        var tilesets = mapInfo.getTilesets();
        if (tilesets) {
            var tileset = null;
            for (var i = tilesets.length - 1; i >= 0; i--) {
                tileset = tilesets[i];
                if (tileset) {
                    for (var y = 0; y < size.height; y++) {
                        for (var x = 0; x < size.width; x++) {
                            var pos = (x + size.width * y).toString();
                            var gid = layerInfo._tiles[pos];
                            // gid are stored in little endian.
                            // if host is big endian, then swap
                            //if( o == CFByteOrderBigEndian )
                            //	gid = CFSwapInt32( gid );
                            /* We support little endian.*/

                            // XXX: gid == 0 --> empty tile
                            // Optimization: quick return
                            // if the layer is invalid (more than 1 tileset per layer) an cc.Assert will be thrown later
                            if (gid !== 0 && gid >= tileset.firstGid) {
                                return tileset;
                            }

                        }
                    }
                }
            }
        }

        // If all the tiles are 0, return empty tileset
        cc.LOG("cocos2d: Warning: TMX Layer " + layerInfo.name + " has no tiles");
        return null;
    }

});

/** creates a TMX Tiled Map with a TMX file.*/
// implementation cc.TMXTiledMap
cc.TMXTiledMap.tiledMapWithTMXFile = function (tmxFile) {
    var ret = new cc.TMXTiledMap();
    if (ret.initWithTMXFile(tmxFile)) {
        return ret;
    }
    return null;
};