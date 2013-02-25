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
cc.TMX_LAYER_ATTRIB_NONE = 1 << 0;
/**
 * @constant
 * @type Number
 */
cc.TMX_LAYER_ATTRIB_BASE64 = 1 << 1;
/**
 * @constant
 * @type Number
 */
cc.TMX_LAYER_ATTRIB_GZIP = 1 << 2;
/**
 * @constant
 * @type Number
 */
cc.TMX_LAYER_ATTRIB_ZLIB = 1 << 3;

/**
 * @constant
 * @type Number
 */
cc.TMX_PROPERTY_NONE = 0;

/**
 * @constant
 * @type Number
 */
cc.TMX_PROPERTY_MAP = 1;

/**
 * @constant
 * @type Number
 */
cc.TMX_PROPERTY_LAYER = 2;

/**
 * @constant
 * @type Number
 */
cc.TMX_PROPERTY_OBJECTGROUP = 3;

/**
 * @constant
 * @type Number
 */
cc.TMX_PROPERTY_OBJECT = 4;

/**
 * @constant
 * @type Number
 */
cc.TMX_PROPERTY_TILE = 5;

/**
 * @constant
 * @type Number
 */
cc.TMX_TILE_HORIZONTAL_FLAG = 0x80000000;


/**
 * @constant
 * @type Number
 */
cc.TMX_TILE_VERTICAL_FLAG = 0x40000000;

/**
 * @constant
 * @type Number
 */
cc.TMX_TILE_DIAGONAL_FLAG = 0x20000000;

/**
 * @constant
 * @type Number
 */
cc.TMX_TILE_FLIPPED_ALL = (cc.TMX_TILE_HORIZONTAL_FLAG | cc.TMX_TILE_VERTICAL_FLAG | cc.TMX_TILE_DIAGONAL_FLAG) >>> 0;

/**
 * @constant
 * @type Number
 */
cc.TMX_TILE_FLIPPED_MASK = (~(cc.TMX_TILE_FLIPPED_ALL)) >>> 0;

// Bits on the far end of the 32-bit global tile ID (GID's) are used for tile flags

/**
 * <p>cc.TMXLayerInfo contains the information about the layers like: <br />
 * - Layer name<br />
 * - Layer size <br />
 * - Layer opacity at creation time (it can be modified at runtime)  <br />
 * - Whether the layer is visible (if it's not visible, then the CocosNode won't be created) <br />
 *  <br />
 * This information is obtained from the TMX file.</p>
 * @class
 * @extends cc.Class
 */
cc.TMXLayerInfo = cc.Class.extend(/** @lends cc.TMXLayerInfo# */{
    _properties:null,
    name:"",
    _layerSize:null,
    _tiles:null,
    visible:null,
    _opacity:null,
    ownTiles:true,
    _minGID:100000,
    _maxGID:0,
    offset:null,

    ctor:function () {
        this._properties = [];
        this._tiles = [];
        this._offset = cc.PointZero();
    },

    /**
     * @return {Array}
     */
    getProperties:function () {
        return this._properties;
    },

    /**
     * @param {object} Var
     */
    setProperties:function (Var) {
        this._properties = Var;
    }
});

/**
 * <p>cc.TMXTilesetInfo contains the information about the tilesets like: <br />
 * - Tileset name<br />
 * - Tileset spacing<br />
 * - Tileset margin<br />
 * - size of the tiles<br />
 * - Image used for the tiles<br />
 * - Image size<br />
 *
 * This information is obtained from the TMX file. </p>
 * @class
 * @extends cc.Class
 */
cc.TMXTilesetInfo = cc.Class.extend(/** @lends cc.TMXTilesetInfo# */{

    /**
     * Tileset name
     */
    name:"",

    /**
     * First grid
     */
    firstGid:0,
    _tileSize:null,

    /**
     * Spacing
     */
    spacing:0,

    /**
     *  Margin
     */
    margin:0,

    /**
     * Filename containing the tiles (should be sprite sheet / texture atlas)
     */
    sourceImage:"",

    /**
     * Size in pixels of the image
     */
    imageSize:null,

    ctor:function () {
        this._tileSize = cc.SizeZero();
        this.imageSize = cc.SizeZero();
    },

    /**
     * @param {Number} gid
     * @return {cc.Rect}
     */
    rectForGID:function (gid) {
        var rect = cc.RectZero();
        rect.size = this._tileSize;
        gid &= cc.TMX_TILE_FLIPPED_MASK;
        gid = gid - parseInt(this.firstGid, 10);
        var max_x = parseInt((this.imageSize.width - this.margin * 2 + this.spacing) / (this._tileSize.width + this.spacing), 10);
        rect.origin.x = parseInt((gid % max_x) * (this._tileSize.width + this.spacing) + this.margin, 10);
        rect.origin.y = parseInt(parseInt(gid / max_x, 10) * (this._tileSize.height + this.spacing) + this.margin, 10);
        return rect;
    }
});

/**
 * <p>cc.TMXMapInfo contains the information about the map like: <br/>
 *- Map orientation (hexagonal, isometric or orthogonal)<br/>
 *- Tile size<br/>
 *- Map size</p>
 *
 * <p>And it also contains: <br/>
 * - Layers (an array of TMXLayerInfo objects)<br/>
 * - Tilesets (an array of TMXTilesetInfo objects) <br/>
 * - ObjectGroups (an array of TMXObjectGroupInfo objects) </p>
 *
 * <p>This information is obtained from the TMX file. </p>
 * @class
 * @extends cc.SAXParser
 */
cc.TMXMapInfo = cc.SAXParser.extend(/** @lends cc.TMXMapInfo# */{
    // map orientation
    _orientation:null,
    _mapSize:null,
    _tileSize:null,
    _layers:null,
    _tileSets:null,
    _objectGroups:null,
    _parentElement:null,
    _parentGID:null,
    _layerAttribs:0,
    _storingCharacters:false,
    _properties:null,
    // tmx filename
    _TMXFileName:null,
    //current string
    _currentString:null,
    // tile properties
    _tileProperties:null,
    _resources:null,

    ctor:function () {
        this._tileSets = [];
        this._tileProperties = [];
        this._properties = [];
        this._mapSize = cc.SizeZero();
        this._tileSize = cc.SizeZero();
    },
    /**
     * @return {Number}
     */
    getOrientation:function () {
        return this._orientation;
    },

    /**
     * @param {Number} Var
     */
    setOrientation:function (Var) {
        this._orientation = Var;
    },

    /**
     * Map width & height
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
     * Tiles width & height
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
     * Layers
     * @return {Array}
     */
    getLayers:function () {
        return this._layers;
    },

    /**
     * @param {cc.TMXLayerInfo} Var
     */
    setLayers:function (Var) {
        this._layers.push(Var);
    },

    /**
     * tilesets
     * @return {Array}
     */
    getTilesets:function () {
        return this._tileSets;
    },

    /**
     * @param {cc.TMXTilesetInfo} Var
     */
    setTilesets:function (Var) {
        this._tileSets.push(Var);
    },

    /**
     * ObjectGroups
     * @return {Array}
     */
    getObjectGroups:function () {
        return this._objectGroups;
    },

    /**
     * @param {cc.TMXObjectGroup} Var
     */
    setObjectGroups:function (Var) {
        this._objectGroups.push(Var);
    },

    /**
     * parent element
     * @return {Number}
     */
    getParentElement:function () {
        return this._parentElement;
    },

    /**
     * @param {Number} Var
     */
    setParentElement:function (Var) {
        this._parentElement = Var;
    },

    /**
     * parent GID
     * @return {Number}
     */
    getParentGID:function () {
        return this._parentGID;
    },

    /**
     * @param {Number} Var
     */
    setParentGID:function (Var) {
        this._parentGID = Var;
    },

    /**
     *  layer attribute
     * @return {Number}
     */
    getLayerAttribs:function () {
        return this._layerAttribs;
    },

    /**
     * @param {Number} Var
     */
    setLayerAttribs:function (Var) {
        this._layerAttribs = Var;
    },

    /**
     * is string characters?
     * @return {Boolean}
     */
    getStoringCharacters:function () {
        return this._storingCharacters;
    },

    /**
     * @param {Boolean} Var
     */
    setStoringCharacters:function (Var) {
        this._storingCharacters = Var;
    },

    /**
     * Properties
     * @return {Array}
     */
    getProperties:function () {
        return this._properties;
    },

    /**
     * @param {object} Var
     */
    setProperties:function (Var) {
        this._properties.push(Var);
    },

    /**
     * Initializes a TMX format with a  tmx file
     * @param {String} tmxFile
     * @param {String} resourcePath
     * @return {String}
     */
    initWithTMXFile:function (tmxFile, resourcePath) {
        this._internalInit(tmxFile, resourcePath);
        return this.parseXMLFile(this._TMXFileName);
    },

    /**
     * initializes a TMX format with an XML string and a TMX resource path
     * @param {String} tmxString
     * @param {String} resourcePath
     * @return {Boolean}
     */
    initWithXML:function (tmxString, resourcePath) {
        this._internalInit(null, resourcePath);
        return this.parseXMLString(tmxString);
    },

    /** Initalises parsing of an XML file, either a tmx (Map) file or tsx (Tileset) file
     * @param {String} tmxFile
     * @return {Element}
     */
    parseXMLFile:function (tmxFile, isXmlString) {
        isXmlString = isXmlString || false;
        var mapXML = cc.SAXParser.getInstance().tmxParse(tmxFile, isXmlString);
        var i, j;

        var i, j;

        // PARSE <map>
        var map = mapXML.documentElement;

        var version = map.getAttribute('version');
        var orientationStr = map.getAttribute('orientation');

        if (map.nodeName == "map") {
            if (version != "1.0" && version !== null)
                cc.log("cocos2d: TMXFormat: Unsupported TMX version:" + version);

            if (orientationStr == "orthogonal")
                this.setOrientation(cc.TMX_ORIENTATION_ORTHO);
            else if (orientationStr == "isometric")
                this.setOrientation(cc.TMX_ORIENTATION_ISO);
            else if (orientationStr == "hexagonal")
                this.setOrientation(cc.TMX_ORIENTATION_HEX);
            else if (orientationStr !== null)
                cc.log("cocos2d: TMXFomat: Unsupported orientation:" + this.getOrientation());

            var mapSize = cc.size(0, 0);
            mapSize.width = parseFloat(map.getAttribute('width'));
            mapSize.height = parseFloat(map.getAttribute('height'));
            this.setMapSize(mapSize);

            mapSize = cc.size(0, 0);
            mapSize.width = parseFloat(map.getAttribute('tilewidth'));
            mapSize.height = parseFloat(map.getAttribute('tileheight'));
            this.setTileSize(mapSize);

            // The parent element is the map
            var propertyArr = map.querySelectorAll("map > properties >  property");
            if (propertyArr) {
                for (i = 0; i < propertyArr.length; i++) {
                    var aProperty = {};
                    aProperty[propertyArr[i].getAttribute('name')] = propertyArr[i].getAttribute('value');
                    this.setProperties(aProperty);
                }
            }
        }

        // PARSE <tileset>
        var tilesets = map.getElementsByTagName('tileset');
        if (map.nodeName !== "map") {
            tilesets = [];
            tilesets.push(map);
        }

        for (i = 0; i < tilesets.length; i++) {
            var selTileset = tilesets[i];
            // If this is an external tileset then start parsing that
            var externalTilesetFilename = selTileset.getAttribute('source');
            if (externalTilesetFilename) {
                this.parseXMLFile(cc.FileUtils.getInstance().fullPathFromRelativeFile(externalTilesetFilename, isXmlString ? this._resources + "/" : tmxFile));
            } else {
                var tileset = new cc.TMXTilesetInfo();
                tileset.name = selTileset.getAttribute('name') || "";
                tileset.firstGid = parseInt(selTileset.getAttribute('firstgid')) || 1;
                tileset.spacing = parseInt(selTileset.getAttribute('spacing')) || 0;
                tileset.margin = parseInt(selTileset.getAttribute('margin')) || 0;

                var tilesetSize = cc.size(0, 0);
                tilesetSize.width = parseFloat(selTileset.getAttribute('tilewidth'));
                tilesetSize.height = parseFloat(selTileset.getAttribute('tileheight'));
                tileset._tileSize = tilesetSize;

                var image = selTileset.getElementsByTagName('image')[0];
                var imgSource = image.getAttribute('source');
                if (imgSource) {
                    if (this._resources)
                        imgSource = this._resources + "/" + imgSource;
                    else
                        imgSource = cc.FileUtils.getInstance().fullPathFromRelativeFile(imgSource, tmxFile);
                }
                tileset.sourceImage = imgSource;
                this.setTilesets(tileset);
            }
        }

        // PARSE  <tile>
        var tiles = map.querySelectorAll('tile');
        if (tiles) {
            for (i = 0; i < tiles.length; i++) {
                var info = this._tileSets[0];
                var t = tiles[i];
                this.setParentGID(parseInt(info.firstGid) + parseInt(t.getAttribute('id') || 0));
                var tp = t.querySelectorAll("properties > property");
                if (tp) {
                    var dict = {};
                    for (j = 0; j < tp.length; j++) {
                        var name = tp[j].getAttribute('name');
                        var value = tp[j].getAttribute('value');
                        dict[name] = value;
                    }
                    this._tileProperties[this.getParentGID()] = dict;
                }
            }
        }

        // PARSE  <layer>
        var layers = map.getElementsByTagName('layer');
        if (layers) {
            for (i = 0; i < layers.length; i++) {
                var selLayer = layers[i];
                var data = selLayer.getElementsByTagName('data')[0];

                var layer = new cc.TMXLayerInfo();
                layer.name = selLayer.getAttribute('name');

                var layerSize = cc.size(0, 0);
                layerSize.width = parseFloat(selLayer.getAttribute('width'));
                layerSize.height = parseFloat(selLayer.getAttribute('height'));
                layer._layerSize = layerSize;

                var visible = selLayer.getAttribute('visible');
                layer.visible = !(visible == "0");

                var opacity = selLayer.getAttribute('opacity') || 1;

                if (opacity)
                    layer._opacity = parseInt(255 * parseFloat(opacity));
                else
                    layer._opacity = 255;
                layer.offset = cc.p(parseFloat(selLayer.getAttribute('x')) || 0, parseFloat(selLayer.getAttribute('y')) || 0);

                var nodeValue = '';
                for (j = 0; j < data.childNodes.length; j++) {
                    nodeValue += data.childNodes[j].nodeValue
                }
                nodeValue = nodeValue.trim();

                // Unpack the tilemap data
                var compression = data.getAttribute('compression');
                var encoding = data.getAttribute('encoding');
                cc.Assert(compression == null || compression === "gzip" || compression === "zlib", "TMX: unsupported compression method");
                switch (compression) {
                    case 'gzip':
                        layer._tiles = cc.unzipBase64AsArray(nodeValue, 4);
                        break;
                    case 'zlib':
                        var inflator = new Zlib.Inflate(cc.Codec.Base64.decodeAsArray(nodeValue, 1));
                        layer._tiles = cc.uint8ArrayToUint32Array(inflator.decompress());
                        break;
                    case null:
                    case '':
                        // Uncompressed
                        if (encoding == "base64")
                            layer._tiles = cc.Codec.Base64.decodeAsArray(nodeValue, 4);
                        else if (encoding === "csv") {
                            layer._tiles = [];
                            var csvTiles = nodeValue.split(',');
                            for (var csvIdx = 0; csvIdx < csvTiles.length; csvIdx++)
                                layer._tiles.push(parseInt(csvTiles[csvIdx]));
                        } else {
                            //XML format
                            var selDataTiles = data.getElementsByTagName("tile");
                            layer._tiles = [];
                            for (var xmlIdx = 0; xmlIdx < selDataTiles.length; xmlIdx++)
                                layer._tiles.push(parseInt(selDataTiles[xmlIdx].getAttribute("gid")));
                        }
                        break;
                    default:
                        cc.Assert(this.getLayerAttribs() != cc.TMX_LAYER_ATTRIB_NONE, "TMX tile map: Only base64 and/or gzip/zlib maps are supported");
                }

                // The parent element is the last layer
                var layerProps = selLayer.querySelectorAll("properties > property");
                if (layerProps) {
                    var layerProp = {};
                    for (j = 0; j < layerProps.length; j++) {
                        layerProp[layerProps[j].getAttribute('name')] = layerProps[j].getAttribute('value');
                    }
                    layer.setProperties(layerProp);
                }
                this.setLayers(layer);
            }
        }

        // PARSE <objectgroup>
        var objectGroups = map.getElementsByTagName('objectgroup');
        if (objectGroups) {
            for (i = 0; i < objectGroups.length; i++) {
                var selGroup = objectGroups[i];
                var objectGroup = new cc.TMXObjectGroup();
                objectGroup.setGroupName(selGroup.getAttribute('name'));
                objectGroup.setPositionOffset(cc.p(parseFloat(selGroup.getAttribute('x')) * this.getTileSize().width || 0,
                    parseFloat(selGroup.getAttribute('y')) * this.getTileSize().height || 0));

                var groupProps = selGroup.querySelectorAll("objectgroup > properties > property");
                if (groupProps) {
                    for (j = 0; j < groupProps.length; j++) {
                        var groupProp = {};
                        groupProp[groupProps[j].getAttribute('name')] = groupProps[j].getAttribute('value');
                        // Add the property to the layer
                        objectGroup.setProperties(groupProp);
                    }
                }

                var objects = selGroup.querySelectorAll('object');
                if (objects) {
                    for (j = 0; j < objects.length; j++) {
                        var selObj = objects[j];
                        // The value for "type" was blank or not a valid class name
                        // Create an instance of TMXObjectInfo to store the object and its properties
                        var objectProp = {};

                        // Set the name of the object to the value for "name"
                        objectProp["name"] = selObj.getAttribute('name') || "";

                        // Assign all the attributes as key/name pairs in the properties dictionary
                        objectProp["type"] = selObj.getAttribute('type') || "";

                        objectProp["x"] = parseInt(selObj.getAttribute('x') || 0) + objectGroup.getPositionOffset().x;
                        var y = parseInt(selObj.getAttribute('y') || 0) + objectGroup.getPositionOffset().y;

                        objectProp["width"] = parseInt(selObj.getAttribute('width')) || 0;
                        objectProp["height"] = parseInt(selObj.getAttribute('height')) || 0;

                        // Correct y position. (Tiled uses Flipped, cocos2d uses Standard)
                        objectProp["y"] = parseInt(this.getMapSize().height * this.getTileSize().height) - y - objectProp["height"];

                        var docObjProps = selObj.querySelectorAll("properties > property");
                        if (docObjProps) {
                            for (var k = 0; k < docObjProps.length; k++)
                                objectProp[docObjProps[k].getAttribute('name')] = docObjProps[k].getAttribute('value');
                        }

                        // Add the object to the objectGroup
                        objectGroup.setObjects(objectProp);
                    }
                }

                this.setObjectGroups(objectGroup);
            }
        }
        return map;
    },

    /**
     * initializes parsing of an XML string, either a tmx (Map) string or tsx (Tileset) string
     * @param {String} xmlString
     * @return {Boolean}
     */
    parseXMLString:function (xmlString) {
        return this.parseXMLFile(xmlString, true);
    },

    /**
     * @return {object}
     */
    getTileProperties:function () {
        return this._tileProperties;
    },

    /**
     * @param {object} tileProperties
     */
    setTileProperties:function (tileProperties) {
        this._tileProperties.push(tileProperties);
    },

    /**
     * @return {String}
     */
    getCurrentString:function () {
        return this._currentString;
    },

    /**
     * @param {String} currentString
     */
    setCurrentString:function (currentString) {
        this._currentString = currentString;
    },

    /**
     * @return {String}
     */
    getTMXFileName:function () {
        return this._TMXFileName;
    },

    /**
     * @param {String} fileName
     */
    setTMXFileName:function (fileName) {
        this._TMXFileName = fileName;
    },

    _internalInit:function (tmxFileName, resourcePath) {
        this._tileSets = [];
        this._layers = [];

        this._TMXFileName = cc.FileUtils.getInstance().fullPathFromRelativePath(tmxFileName);

        if (resourcePath) {
            this._resources = resourcePath;
        }

        this._objectGroups = [];

        this._properties = [];
        this._tileProperties = [];

        // tmp vars
        this._currentString = "";
        this._storingCharacters = false;
        this._layerAttribs = cc.TMX_LAYER_ATTRIB_NONE;
        this._parentElement = cc.TMX_PROPERTY_NONE;
    }
});

/**
 * Creates a TMX Format with a tmx file
 * @param {String} tmxFile
 * @param {String} resourcePath
 * @return {cc.TMXMapInfo}
 */
cc.TMXMapInfo.create = function (tmxFile, resourcePath) {
    var ret = new cc.TMXMapInfo();
    if (ret.initWithTMXFile(tmxFile, resourcePath))
        return ret;
    return null;
};

/**
 * creates a TMX Format with an XML string and a TMX resource path
 * @param {String} tmxString
 * @param {String} resourcePath
 * @return {cc.TMXMapInfo}
 */
cc.TMXMapInfo.createWithXML = function (tmxString, resourcePath) {
    var ret = new cc.TMXMapInfo();
    if (ret.initWithXML(tmxString, resourcePath))
        return ret;
    return null;
};
