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
cc.TMXLayerAttribNone = 1 << 0;
/**
 * @constant
 * @type Number
 */
cc.TMXLayerAttribBase64 = 1 << 1;
/**
 * @constant
 * @type Number
 */
cc.TMXLayerAttribGzip = 1 << 2;
/**
 * @constant
 * @type Number
 */
cc.TMXLayerAttribZlib = 1 << 3;

/**
 * @constant
 * @type Number
 */
cc.TMXPropertyNone = 0;

/**
 * @constant
 * @type Number
 */
cc.TMXPropertyMap = 1;

/**
 * @constant
 * @type Number
 */
cc.TMXPropertyLayer = 2;

/**
 * @constant
 * @type Number
 */
cc.TMXPropertyObjectGroup = 3;

/**
 * @constant
 * @type Number
 */
cc.TMXPropertyObject = 4;

/**
 * @constant
 * @type Number
 */
cc.TMXPropertyTile = 5;

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
cc.TMX_TILE_ALL_FLAGS = (cc.TMX_TILE_HORIZONTAL_FLAG | cc.TMX_TILE_VERTICAL_FLAG | cc.TMX_TILE_DIAGONAL_FLAG) >>> 0;

/**
 * @constant
 * @type Number
 */
cc.TMX_TILE_ALL_FLAGS_MASK = (~(cc.TMX_TILE_ALL_FLAGS)) >>> 0;

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
    _tiles:[],
    visible:null,
    _opacity:null,
    ownTiles:true,
    _minGID:100000,
    _maxGID:0,
    offset:cc.PointZero(),
    ctor:function () {
        this._properties = [];
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
        this._properties.push(Var);
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
    _tileSize:cc.SizeZero(),

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
    imageSize:cc.SizeZero(),

    /**
     * @param {Number} gid
     * @return {cc.Rect}
     */
    rectForGID:function (gid) {
        var rect = cc.RectZero();
        rect.size = this._tileSize;
        gid &= cc.TMX_TILE_ALL_FLAGS_MASK;
        gid = gid - parseInt(this.firstGid,10);
        var max_x = parseInt((this.imageSize.width - this.margin * 2 + this.spacing) / (this._tileSize.width + this.spacing),10);
        rect.origin.x = parseInt((gid % max_x) * (this._tileSize.width + this.spacing) + this.margin,10);
        rect.origin.y = parseInt(parseInt(gid / max_x,10) * (this._tileSize.height + this.spacing) + this.margin,10);
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
    _mapSize:cc.SizeZero(),
    _tileSize:cc.SizeZero(),
    _layers:null,
    _tileSets:null,
    _objectGroups:null,
    _parentElement:null,
    _parentGID:null,
    _layerAttribs:0,
    _storingCharacters:false,
    _properties:[],
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
     * @return {String}
     */
    initWithTMXFile:function (tmxFile, resourcePath) {
        this._internalInit(tmxFile, resourcePath);
        return this.parseXMLFile(this._TMXFileName);
    },

    /** Initalises parsing of an XML file, either a tmx (Map) file or tsx (Tileset) file
     * @param {String} tmxFile
     * @return {Element}
     */
    parseXMLFile:function (tmxFile) {
        var mapXML = cc.SAXParser.getInstance().tmxParse(tmxFile);

        // PARSE <map>
        var map = mapXML.documentElement;

        var version = map.getAttribute('version');
        var orientationStr = map.getAttribute('orientation');

        if (map.nodeName == "map") {
            if (version != "1.0" && version !== null) {
                cc.log("cocos2d: TMXFormat: Unsupported TMX version:" + version);
            }

            if (orientationStr == "orthogonal")
                this.setOrientation(cc.TMXOrientationOrtho);
            else if (orientationStr == "isometric")
                this.setOrientation(cc.TMXOrientationIso);
            else if (orientationStr == "hexagonal")
                this.setOrientation(cc.TMXOrientationHex);
            else if (orientationStr !== null)
                cc.log("cocos2d: TMXFomat: Unsupported orientation:" + this.getOrientation());

            var s = cc.size(0, 0);
            s.width = parseFloat(map.getAttribute('width'));
            s.height = parseFloat(map.getAttribute('height'));
            this.setMapSize(s);

            s = cc.size(0, 0);
            s.width = parseFloat(map.getAttribute('tilewidth'));
            s.height = parseFloat(map.getAttribute('tileheight'));
            this.setTileSize(s)

            // The parent element is the map
            var mp = map.querySelectorAll("map > properties >  property");
            if (mp) {
                for (var k = 0; k < mp.length; k++) {
                    var dict = {};
                    var name = mp[k].getAttribute('name');
                    var value = mp[k].getAttribute('value');
                    dict[name] = value;
                    this.setProperties(dict);
                }
            }
        }

        //todo fixed
        // PARSE <tileset>
        var tilesets = map.getElementsByTagName('tileset');
        if (map.nodeName !== "map") {
            tilesets = []
            tilesets.push(map);
        }

        for (var i = 0, len = tilesets.length; i < len; i++) {
            var t = tilesets[i];
            // If this is an external tileset then start parsing that
            var externalTilesetFilename = t.getAttribute('source');
            if (externalTilesetFilename) {
                this.parseXMLFile(cc.FileUtils.getInstance().fullPathFromRelativeFile(externalTilesetFilename, tmxFile));
            }
            else {
                var tileset = new cc.TMXTilesetInfo();
                tileset.name = t.getAttribute('name') || "";
                tileset.firstGid = parseInt(t.getAttribute('firstgid')) || 1;
                tileset.spacing = parseInt(t.getAttribute('spacing')) || 0;
                tileset.margin = parseInt(t.getAttribute('margin')) || 0;

                var s = cc.size(0, 0);
                s.width = parseFloat(t.getAttribute('tilewidth'));
                s.height = parseFloat(t.getAttribute('tileheight'));
                tileset._tileSize = s;

                var image = t.getElementsByTagName('image')[0];
                var imgSource = image.getAttribute('source');
                if (imgSource) {
                    if (this._resources) {
                        imgSource = this._resources + "/" + imgSource;
                    }
                    else {
                        imgSource = cc.FileUtils.getInstance().fullPathFromRelativeFile(imgSource, tmxFile);
                    }
                }
                tileset.sourceImage = imgSource;
                this.setTilesets(tileset);
            }
        }

        // PARSE  <tile>
        var tiles = map.querySelectorAll('tile');
        if (tiles) {
            for (var i = 0, len = tiles.length; i < len; i++) {
                var info = this._tileSets[0];
                var t = tiles[i];
                this.setParentGID(parseInt(info.firstGid) + parseInt(t.getAttribute('id') || 0));
                var tp = t.querySelectorAll("properties > property")[0];

                if (tp) {
                    var dict = {};
                    var name = tp.getAttribute('name');
                    var value = tp.getAttribute('value');
                    dict[name] = value;
                    this._tileProperties[this.getParentGID()] = dict;
                }
            }
        }

        // PARSE  <layer>
        var layers = map.getElementsByTagName('layer');
        if (layers) {
            for (var i = 0, len = layers.length; i < len; i++) {
                var l = layers[i];
                var data = l.getElementsByTagName('data')[0];

                var layer = new cc.TMXLayerInfo();
                layer.name = l.getAttribute('name');

                var s = cc.size(0, 0);
                s.width = parseFloat(l.getAttribute('width'));
                s.height = parseFloat(l.getAttribute('height'));
                layer._layerSize = s;

                var visible = l.getAttribute('visible')
                layer.visible = !(visible == "0");

                var opacity = l.getAttribute('opacity') || 1;

                if (opacity) {
                    layer._opacity = parseInt(255 * parseFloat(opacity));
                }
                else {
                    layer._opacity = 255;
                }

                var x = parseFloat(l.getAttribute('x')) || 0;
                var y = parseFloat(l.getAttribute('y')) || 0;
                layer.offset = cc.p(x, y);

                var nodeValue = ''
                for (var j = 0; j < data.childNodes.length; j++) {
                    nodeValue += data.childNodes[j].nodeValue
                }

                // Unpack the tilemap data
                var compression = data.getAttribute('compression');
                var encoding = data.getAttribute('encoding');
                cc.Assert(compression == null || compression == "gzip" || compression == "zlib", "TMX: unsupported compression method");
                switch (compression) {
                    case 'gzip':
                        layer._tiles = cc.unzipBase64AsArray(nodeValue, 4);
                        break;
                    case 'zlib':
                        //Not Implemented
                        break;
                    // Uncompressed
                    case null:
                    case '':
                        if (encoding == "base64") {
                            layer._tiles = cc.Codec.Base64.decodeAsArray(nodeValue, 4);
                        }
                        else {
                            layer._tiles = cc.StringToArray(nodeValue);
                        }
                        break;
                    default:
                        cc.Assert(this.getLayerAttribs() != cc.TMXLayerAttribNone, "TMX tile map: Only base64 and/or gzip/zlib maps are supported");
                }

                // The parent element is the last layer
                var lp = l.querySelectorAll("properties > property");
                if (lp) {
                    for (var k = 0; k < lp.length; k++) {
                        var dict = {};
                        var name = lp[k].getAttribute('name');
                        var value = lp[k].getAttribute('value');
                        dict[name] = value;

                        layer.setProperties(dict);
                    }
                }

                this.setLayers(layer);
            }
        }

        // PARSE <objectgroup>
        var objectgroups = map.getElementsByTagName('objectgroup');
        if (objectgroups) {

            for (var i = 0; i < objectgroups.length; i++) {
                var g = objectgroups[i];
                var objectGroup = new cc.TMXObjectGroup();
                objectGroup.setGroupName(g.getAttribute('name'));
                var positionOffset = cc.p(0, 0);
                positionOffset.x = parseFloat(g.getAttribute('x')) * this.getTileSize().width || 0;
                positionOffset.y = parseFloat(g.getAttribute('y')) * this.getTileSize().height || 0;
                objectGroup.setPositionOffset(positionOffset);

                var gp = g.querySelectorAll("objectgroup > properties > property");
                if (gp) {
                    for (var k = 0; k < gp.length; k++) {
                        var dict = {};
                        var name = gp[k].getAttribute('name');
                        var value = gp[k].getAttribute('value');
                        dict[name] = value;

                        // Add the property to the layer
                        objectGroup.setProperties(dict);
                    }
                }

                var objects = g.querySelectorAll('object')
                if (objects) {
                    for (var j = 0; j < objects.length; j++) {
                        var o = objects[j]
                        // The value for "type" was blank or not a valid class name
                        // Create an instance of TMXObjectInfo to store the object and its properties
                        var dict = {};

                        // Set the name of the object to the value for "name"
                        dict["name"] = o.getAttribute('name') || "";

                        // Assign all the attributes as key/name pairs in the properties dictionary
                        dict["type"] = o.getAttribute('type') || "";

                        dict["x"] = parseInt(o.getAttribute('x') || 0) + objectGroup.getPositionOffset().x;

                        var y = parseInt(o.getAttribute('y') || 0) + objectGroup.getPositionOffset().y;

                        dict["width"] = parseInt(o.getAttribute('width')) || 0;

                        dict["height"] = parseInt(o.getAttribute('height')) || 0;

                        // Correct y position. (Tiled uses Flipped, cocos2d uses Standard)
                        y = parseInt(this.getMapSize().height * this.getTileSize().height) - y - dict["height"];
                        dict["y"] = y;

                        var op = o.querySelectorAll("properties > property");
                        if (op) {
                            for (var k = 0; k < op.length; k++) {
                                var name = op[k].getAttribute('name');
                                var value = op[k].getAttribute('value');
                                dict[name] = value;
                            }
                        }

                        // Add the object to the objectGroup
                        objectGroup.setObjects(dict);
                    }
                }

                this.setObjectGroups(objectGroup);
            }
        }
        return map;
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
        this._layerAttribs = cc.TMXLayerAttribNone;
        this._parentElement = cc.TMXPropertyNone;
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
    if (ret.initWithTMXFile(tmxFile, resourcePath)) {
        return ret;
    }
    return null;
};
