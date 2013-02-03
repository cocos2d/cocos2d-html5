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
 Orthogonal orientation
 * @constant
 * @type Number
 */
cc.TMX_ORIENTATION_ORTHO = 0;

/**
 * Hexagonal orientation
 * @constant
 * @type Number
 */

cc.TMX_ORIENTATION_HEX = 1;

/**
 * Isometric orientation
 * @constant
 * @type Number
 */
cc.TMX_ORIENTATION_ISO = 2;

/**
 * <p>cc.TMXTiledMap knows how to parse and render a TMX map.</p>
 *
 * <p>It adds support for the TMX tiled map format used by http://www.mapeditor.org <br />
 * It supports isometric, hexagonal and orthogonal tiles.<br />
 * It also supports object groups, objects, and properties.</p>
 *
 * <p>Features: <br />
 * - Each tile will be treated as an cc.Sprite<br />
 * - The sprites are created on demand. They will be created only when you call "layer.tileAt(position)" <br />
 * - Each tile can be rotated / moved / scaled / tinted / "opacitied", since each tile is a cc.Sprite<br />
 * - Tiles can be added/removed in runtime<br />
 * - The z-order of the tiles can be modified in runtime<br />
 * - Each tile has an anchorPoint of (0,0) <br />
 * - The anchorPoint of the TMXTileMap is (0,0) <br />
 * - The TMX layers will be added as a child <br />
 * - The TMX layers will be aliased by default <br />
 * - The tileset image will be loaded using the cc.TextureCache <br />
 * - Each tile will have a unique tag<br />
 * - Each tile will have a unique z value. top-left: z=1, bottom-right: z=max z<br />
 * - Each object group will be treated as an cc.MutableArray <br />
 * - Object class which will contain all the properties in a dictionary<br />
 * - Properties can be assigned to the Map, Layer, Object Group, and Object</p>
 *
 * <p>Limitations: <br />
 * - It only supports one tileset per layer. <br />
 * - Embeded images are not supported <br />
 * - It only supports the XML format (the JSON format is not supported)</p>
 *
 * <p>Technical description: <br />
 * Each layer is created using an cc.TMXLayer (subclass of cc.SpriteBatchNode). If you have 5 layers, then 5 cc.TMXLayer will be created, <br />
 * unless the layer visibility is off. In that case, the layer won't be created at all. <br />
 * You can obtain the layers (cc.TMXLayer objects) at runtime by: <br />
 * - map.getChildByTag(tag_number);  // 0=1st layer, 1=2nd layer, 2=3rd layer, etc...<br />
 * - map.getLayer(name_of_the_layer); </p>
 *
 * <p>Each object group is created using a cc.TMXObjectGroup which is a subclass of cc.MutableArray.<br />
 * You can obtain the object groups at runtime by: <br />
 * - map.getObjectGroup(name_of_the_object_group); </p>
 *
 * <p>Each object is a cc.TMXObject.</p>
 *
 * <p>Each property is stored as a key-value pair in an cc.MutableDictionary.<br />
 * You can obtain the properties at runtime by: </p>
 *
 * <p>map.getProperty(name_of_the_property); <br />
 * layer.getProperty(name_of_the_property); <br />
 * objectGroup.getProperty(name_of_the_property); <br />
 * object.getProperty(name_of_the_property);</p>
 * @class
 * @extends cc.Node
 */
cc.TMXTiledMap = cc.Node.extend(/** @lends cc.TMXTiledMap# */{
    //the map's size property measured in tiles
    _mapSize:null,
    _tileSize:null,
    _properties:null,
    _objectGroups:null,
    _mapOrientation:null,
    //tile properties
    //todo delete
    _TMXLayers:null,
    _tileProperties:null,

    ctor:function(){
        this._super();
        this._mapSize = cc.SizeZero();
        this._tileSize = cc.SizeZero();

        this._tileProperties = [];
    },

    /**
     * @return {cc.Size}
     */
    getMapSize:function () {
        return this._mapSize;
    },

    /**
     * @param {cc.Size} Var
     */
    setMapSize:function (Var) {
        this._mapSize = Var;
    },

    /**
     * @return {cc.Size}
     */
    getTileSize:function () {
        return this._tileSize;
    },

    /**
     * @param {cc.Size} Var
     */
    setTileSize:function (Var) {
        this._tileSize = Var;
    },

    /**
     * map orientation
     * @return {Number}
     */
    getMapOrientation:function () {
        return this._mapOrientation;
    },

    /**
     * @param {Number} Var
     */
    setMapOrientation:function (Var) {
        this._mapOrientation = Var;
    },

    /**
     * object groups
     * @return {Array}
     */
    getObjectGroups:function () {
        return this._objectGroups;
    },

    /**
     * @param {Array} Var
     */
    setObjectGroups:function (Var) {
        this._objectGroups = Var;
    },

    /**
     * properties
     * @return {object}
     */
    getProperties:function () {
        return this._properties;
    },

    /**
     * @param {object} Var
     */
    setProperties:function (Var) {
        this._properties = Var;
    },

    /**
     * @param {String} tmxFile
     * @return {Boolean}
     * @example
     * //example
     * var map = new cc.TMXTiledMap()
     * map.initWithTMXFile("hello.tmx");
     */
    initWithTMXFile:function (tmxFile,resourcePath) {
        cc.Assert(tmxFile != null && tmxFile.length > 0, "TMXTiledMap: tmx file should not be nil");
        this.setContentSize(cc.SizeZero());
        var mapInfo = cc.TMXMapInfo.create(tmxFile,resourcePath);
        if (!mapInfo)
            return false;

        cc.Assert(mapInfo.getTilesets().length != 0, "TMXTiledMap: Map not found. Please check the filename.");
        this._buildWithMapInfo(mapInfo);
        return true;
    },

    initWithXML:function(tmxString, resourcePath){
        this.setContentSize(cc.SizeZero());

        var mapInfo = cc.TMXMapInfo.createWithXML(tmxString, resourcePath);

        cc.Assert( mapInfo.getTilesets().length != 0, "TMXTiledMap: Map not found. Please check the filename.");
        this._buildWithMapInfo(mapInfo);
        return true;
    },

    _buildWithMapInfo:function (mapInfo) {
        this._mapSize = mapInfo.getMapSize();
        this._tileSize = mapInfo.getTileSize();
        this._mapOrientation = mapInfo.getOrientation();
        this._objectGroups = mapInfo.getObjectGroups();
        this._properties = mapInfo.getProperties();
        this._tileProperties = mapInfo.getTileProperties();

        var idx = 0;
        var layers = mapInfo.getLayers();
        if (layers) {
            var layerInfo = null;
            for (var i = 0, len = layers.length; i < len; i++) {
                layerInfo = layers[i];
                if (layerInfo && layerInfo.visible) {
                    var child = this._parseLayer(layerInfo, mapInfo);
                    this.addChild(child, idx, idx);

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
    },
    /** return the TMXLayer for the specific layer
     * @param {String} layerName
     * @return {cc.TMXLayer}
     */
    getLayer:function (layerName) {
        cc.Assert(layerName != null && layerName.length > 0, "Invalid layer name!");

        for (var i = 0; i < this._children.length; i++) {
            var layer = this._children[i];
            if (layer) {
                if (layer.getLayerName() == layerName) {
                    return layer;
                }
            }
        }

        // layer not found
        return null;
    },

    /**
     * Return the TMXObjectGroup for the secific group
     * @param {String} groupName
     * @return {cc.TMXObjectGroup}
     */
    getObjectGroup:function (groupName) {
        cc.Assert(groupName != null && groupName.length > 0, "Invalid group name!");
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

    /**
     * Return the value for the specific property name
     * @param {String} propertyName
     * @return {String}
     */
    getProperty:function (propertyName) {
        return this._properties[propertyName.toString()];
    },

    /**
     * Return properties dictionary for tile GID
     * @param {Number} GID
     * @return {object}
     */
    propertiesForGID:function (GID) {
        return this._tileProperties[GID];
    },

    _parseLayer:function (layerInfo, mapInfo) {
        var tileset = this._tilesetForLayer(layerInfo, mapInfo);
        var layer = cc.TMXLayer.create(tileset, layerInfo, mapInfo);
        // tell the layerinfo to release the ownership of the tiles map.
        layerInfo.ownTiles = false;
        layer.setupTiles();
        return layer;
    },

    _tilesetForLayer:function (layerInfo, mapInfo) {
        var size = layerInfo._layerSize;
        var tilesets = mapInfo.getTilesets();
        if (tilesets) {
            for (var i = tilesets.length - 1; i >= 0; i--) {
                var tileset = tilesets[i];
                if (tileset) {
                    for (var y = 0; y < size.height; y++) {
                        for (var x = 0; x < size.width; x++) {
                            var pos = x + size.width * y;
                            var gid = layerInfo._tiles[pos];
                            if (gid != 0) {
                                // Optimization: quick return
                                // if the layer is invalid (more than 1 tileset per layer) an cc.Assert will be thrown later
                                if (((gid & cc.TMX_TILE_FLIPPED_MASK)>>>0) >= tileset.firstGid) {
                                    return tileset;
                                }
                            }

                        }
                    }
                }
            }
        }

        // If all the tiles are 0, return empty tileset
        cc.log("cocos2d: Warning: TMX Layer " + layerInfo.name + " has no tiles");
        return null;
    }
});

/**
 * Creates a TMX Tiled Map with a TMX file.
 * Implementation cc.TMXTiledMap
 * @param {String} tmxFile
 * @param {String} resourcePath
 * @return {cc.TMXTiledMap|undefined}
 * @example
 * //example
 * var map = cc.TMXTiledMap.create("hello.tmx");
 */
cc.TMXTiledMap.create = function (tmxFile, resourcePath) {
    var ret = new cc.TMXTiledMap();
    if (ret.initWithTMXFile(tmxFile,resourcePath)) {
        return ret;
    }
    return null;
};

/**
 * initializes a TMX Tiled Map with a TMX formatted XML string and a path to TMX resources
 * @param {String} tmxString
 * @param {String} resourcePath
 * @return {cc.TMXTiledMap|undefined}
 */
cc.TMXTiledMap.createWithXML = function(tmxString, resourcePath){
    var tileMap = new cc.TMXTiledMap();
    if(tileMap.initWithXML(tmxString,resourcePath))
        return tileMap;
    return null;
};
