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

/** @file
 * Internal TMX parser
 *
 * IMPORTANT: These classed should not be documented using doxygen strings
 * since the user should not use them.
 *
 */


cc.TMXLayerAttribNone = 1 << 0;
cc.TMXLayerAttribBase64 = 1 << 1;
cc.TMXLayerAttribGzip = 1 << 2;
cc.TMXLayerAttribZlib = 1 << 3;

cc.TMXPropertyNone = null;
cc.TMXPropertyMap = null;
cc.TMXPropertyLayer = null;
cc.TMXPropertyObjectGroup = null;
cc.TMXPropertyObject = null;
cc.TMXPropertyTile = null;

/** @brief cc.TMXLayerInfo contains the information about the layers like:
 - Layer name
 - Layer size
 - Layer opacity at creation time (it can be modified at runtime)
 - Whether the layer is visible (if it's not visible, then the CocosNode won't be created)

 This information is obtained from the TMX file.
 */
cc.TMXLayerInfo = cc.Class.extend({
    _properties:[],
    name:"",
    _layerSize:null,
    _tiles:[],
    visible:null,
    _opacity:null,
    ownTiles:true,
    _minGID:100000,
    _maxGID:0,
    offset:cc.PointZero(),
    getProperties:function () {
        return this._properties;
    },
    setProperties:function (Var) {
        this._properties = Var;
    }
});

/** @brief cc.TMXTilesetInfo contains the information about the tilesets like:
 - Tileset name
 - Tilset spacing
 - Tileset margin
 - size of the tiles
 - Image used for the tiles
 - Image size

 This information is obtained from the TMX file.
 */
cc.TMXTilesetInfo = cc.Class.extend({
    name:null,
    firstGid:0,
    _tileSize:cc.SizeZero(),
    spacing:0,
    margin:0,
    //! filename containing the tiles (should be spritesheet / texture atlas)
    sourceImage:null,
    //! size in pixels of the image
    imageSize:cc.SizeZero(),
    rectForGID:function (gid) {
        var rect = cc.RectZero();
        rect.size = this._tileSize;
        gid = gid - parseInt(this.firstGid);
        var max_x = parseInt((this.imageSize.width - this.margin * 2 + this.spacing) / (this._tileSize.width + this.spacing));
        rect.origin.x = parseInt((gid % max_x) * (this._tileSize.width + this.spacing) + this.margin);
        rect.origin.y = parseInt(parseInt(gid / max_x) * (this._tileSize.height + this.spacing) + this.margin);
        return rect;
    }
});

/** @brief cc.TMXMapInfo contains the information about the map like:
 - Map orientation (hexagonal, isometric or orthogonal)
 - Tile size
 - Map size

 And it also contains:
 - Layers (an array of TMXLayerInfo objects)
 - Tilesets (an array of TMXTilesetInfo objects)
 - ObjectGroups (an array of TMXObjectGroupInfo objects)

 This information is obtained from the TMX file.

 */
cc.TMXMapInfo = cc.SAXParser.extend({
    /// map orientation
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
    _properties:null,
    //! tmx filename
    _TMXFileName:null,
//! current string
    _currentString:null,
//! tile properties
    _tileProperties:[],
    getOrientation:function () {
        return this._orientation;
    },
    setOrientation:function (Var) {
        this._orientation = Var;
    },
    /// map width & height
    getMapSize:function () {
        return this._mapSize;
    },
    setMapSize:function (Var) {
        this._mapSize = Var;
    },
    /// tiles width & height
    getTileSize:function () {
        return this._tileSize;
    },
    setTileSize:function (Var) {
        this._tileSize = Var;
    },
    /// Layers
    getLayers:function () {
        return this._layers;
    },
    setLayers:function (Var) {
        this._layers.push(Var);
    },
    /// tilesets
    getTilesets:function () {
        return this._tileSets;
    },
    setTilesets:function (Var) {
        this._tileSets.push(Var);
    },
    /// ObjectGroups
    getObjectGroups:function () {
        return this._objectGroups;
    },
    setObjectGroups:function (Var) {
        this._objectGroups.push(Var);
    },
    /// parent element
    getParentElement:function () {
        return this._parentElement;
    },
    setParentElement:function (Var) {
        this._parentElement = Var;
    },
    /// parent GID
    getParentGID:function () {
        return this._parentGID;
    },
    setParentGID:function (Var) {
        this._parentGID = Var;
    },
    /// layer attribs
    getLayerAttribs:function () {
        return this._layerAttribs;
    },
    setLayerAttribs:function (Var) {
        this._layerAttribs = Var;
    },
    /// is stroing characters?
    getStoringCharacters:function () {
        return this._storingCharacters;
    },
    setStoringCharacters:function (Var) {
        this._storingCharacters = Var;
    },
    /// properties
    getProperties:function () {
        return this._properties;
    },
    setProperties:function (Var) {
        this._properties.push(Var);
    },
    /** initializes a TMX format witha  tmx file */
    initWithTMXFile:function (tmxFile) {
        this._tileSets = [];
        this._layers = [];
        this._TMXFileName = tmxFile;
        this._objectGroups = [];
        this._properties = [];
        this._tileProperties = [];

        // tmp vars
        this._currentString = "";
        this._storingCharacters = false;
        this._layerAttribs = cc.TMXLayerAttribNone;
        this._parentElement = cc.TMXPropertyNone;

        return this.parseXMLFile(this._TMXFileName);
    },
    /** initalises parsing of an XML file, either a tmx (Map) file or tsx (Tileset) file */
    parseXMLFile:function (xmlFilename) {
        var mapXML = cc.SAXParser.shareParser().tmxParse(xmlFilename);

        // PARSE <map>
        var map = mapXML.documentElement;

        var version = map.getAttribute('version');
        var orientationStr = map.getAttribute('orientation');

        if (map.nodeName == "map") {
            if (version != "1.0" && version !== null) {
                cc.LOG("cocos2d: TMXFormat: Unsupported TMX version:" + version);
            }

            if (orientationStr == "orthogonal")
                this.setOrientation(cc.TMXOrientationOrtho);
            else if (orientationStr == "isometric")
                this.setOrientation(cc.TMXOrientationIso);
            else if (orientationStr == "hexagonal")
                this.setOrientation(cc.TMXOrientationHex);
            else if (orientationStr !== null)
                cc.LOG("cocos2d: TMXFomat: Unsupported orientation:" + this.getOrientation());

            var s = new cc.Size();
            s.width = parseFloat(map.getAttribute('width'));
            s.height = parseFloat(map.getAttribute('height'));
            this.setMapSize(s);

            s = new cc.Size();
            s.width = parseFloat(map.getAttribute('tilewidth'));
            s.height = parseFloat(map.getAttribute('tileheight'));
            this.setTileSize(s)

            // The parent element is now "map"
            this.setParentElement(cc.TMXPropertyMap);
        }

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
            var imgpath = xmlFilename.substring(0, xmlFilename.lastIndexOf("/") + 1);
            if (externalTilesetFilename) {
                this.parseXMLFile(imgpath + externalTilesetFilename);
            }
            else {
                var tileset = new cc.TMXTilesetInfo();
                tileset.name = t.getAttribute('name') || "";
                tileset.firstGid = parseInt(t.getAttribute('firstgid')) || 1;
                tileset.spacing = parseInt(t.getAttribute('spacing')) || 0;
                tileset.margin = parseInt(t.getAttribute('margin')) || 0;

                var s = cc.Size;
                s.width = parseFloat(t.getAttribute('tilewidth'));
                s.height = parseFloat(t.getAttribute('tileheight'));
                tileset._tileSize = s;

                var image = t.getElementsByTagName('image')[0];
                var imgSource = image.getAttribute('source');
                if (imgSource) {
                    imgSource = imgpath + imgSource;
                }
                tileset.sourceImage = imgSource;
                this.setTilesets(tileset);
            }
        }

        // PARSE  <tile>
        var tiles = map.getElementsByTagName('tile');
        if (tiles) {
            for (var i = 0, len = tiles.length; i < len; i++) {
                var info = this.getTilesets()[0];
                var t = tiles[i];
                this.setParentGID(info.firstGid + parseInt(t.getAttribute('id')));
                this.setTileProperties(this.getParentGID());
                this.setParentElement(cc.TMXPropertyTile);
            }
        }

        // PARSE  <layer>
        var layers = map.getElementsByTagName('layer');
        if (layers) {
            for (var i = 0, len = layers.length; i < len; i++) {
                var l = layers[i];
                var data = l.getElementsByTagName('data')[0];

                var layer = new cc.TMXLayerInfo();
                layer.name = l.getAttribute('name')

                var s = new cc.Size;
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
                layer.offset = cc.ccp(x, y);

                // Firefox has a 4KB limit on node values. It will split larger
                // nodes up into multiple nodes. So, we'll stitch them back
                // together.
                var nodeValue = ''
                for (var j = 0; j < data.childNodes.length; j++) {
                    nodeValue += data.childNodes[j].nodeValue
                }

                // Unpack the tilemap data
                var compression = data.getAttribute('compression');
                cc.Assert(compression == null || compression == "gzip" || compression == "zlib", "TMX: unsupported compression method");
                switch (compression) {
                    case 'gzip':
                        layer._tiles = cc.unzipBase64AsArray(nodeValue, 4);
                        break;
                    case 'zlib':
                        //layer._tiles = JXG.Util.Unzip(nodeValue);
                        break;
                    // Uncompressed
                    case null:
                        layer._tiles = cc.base64.decodeAsArray(nodeValue, 4);
                        break;
                    default:
                        cc.Assert(this.getLayerAttribs() != cc.TMXLayerAttribNone, "TMX tile map: Only base64 and/or gzip/zlib maps are supported");
                }
                this.setLayers(layer);
                // The parent element is now "layer"
                this.setParentElement(cc.TMXPropertyLayer);
            }
        }

        // PARSE <objectgroup>
        var objectgroups = map.getElementsByTagName('objectgroup');
        if (objectgroups) {
            for (var i = 0; i < objectgroups.length; i++) {
                var g = objectgroups[i];
                var objectGroup = new cc.TMXObjectGroup();
                objectGroup.setGroupName(g.getAttribute('name'));
                var positionOffset = new cc.Point();
                positionOffset.x = parseFloat(g.getAttribute('x')) * this.getTileSize().width || 0;
                positionOffset.y = parseFloat(g.getAttribute('y')) * this.getTileSize().height || 0;
                objectGroup.setPositionOffset(positionOffset);

                var objects = g.querySelectorAll('object')
                if (objects) {
                    for (var j = 0; j < objects.length; j++) {
                        var o = objects[j]
                        // The value for "type" was blank or not a valid class name
                        // Create an instance of TMXObjectInfo to store the object and its properties
                        var dict = new Object();

                        // Set the name of the object to the value for "name"
                        dict["name"] = o.getAttribute('name') || "";

                        // Assign all the attributes as key/name pairs in the properties dictionary
                        dict["type"] = o.getAttribute('type') || "";

                        dict["x"] = parseInt(o.getAttribute('x') || 0) + objectGroup.getPositionOffset().x;

                        var y = parseInt(o.getAttribute('y') || 0) + objectGroup.getPositionOffset().y;
                        // Correct y position. (Tiled uses Flipped, cocos2d uses Standard)
                        y = parseInt(this.getMapSize().height * this.getTileSize().height) - y - parseInt(o.getAttribute('height'));
                        dict["y"] = y;

                        dict["width"] = parseInt(o.getAttribute('width'));

                        dict["height"] = parseInt(o.getAttribute('height'));

                        // Add the object to the objectGroup
                        objectGroup.setObjects(dict);
                        // The parent element is now "object"
                        this.setParentElement(cc.TMXPropertyObject);
                    }
                }

                this.setObjectGroups(objectGroup);
                // The parent element is now "objectgroup"
                this.setParentElement(cc.TMXPropertyObjectGroup);
            }
        }

        // PARSE <map><property>
        var properties = mapXML.querySelectorAll('map > properties > property')
        if (properties) {
            for (i = 0; i < properties.length; i++) {
                var property = properties[i]

                if (this.getParentElement() == cc.TMXPropertyNone) {
                    cc.LOG("TMX tile map: Parent element is unsupported. Cannot add property named " + property.getAttribute('name') + " with value " + property.getAttribute('value'));
                }
                else if (this.getParentElement() == cc.TMXPropertyMap) {
                    // The parent element is the map
                    var value = new String(property.getAttribute('value'));
                    var key = property.getAttribute('name');
                    this.getProperties()[key] = value;
                }
                else if (this.getParentElement() == cc.TMXPropertyLayer) {
                    // The parent element is the last layer
                    var layer = this.getLayers()[0];
                    var value = new String(property.getAttribute('value'));
                    var key = property.getAttribute('name');
                    // Add the property to the layer
                    layer.getProperties()[key] = value;
                }
                else if (this.getParentElement() == cc.TMXPropertyObjectGroup) {
                    // The parent element is the last object group
                    var objectGroup = this.getObjectGroups()[0];
                    var value = new String(property.getAttribute('value'));
                    var key = property.getAttribute('name');
                    objectGroup.getProperties()[key] = value;
                }
                else if (this.getParentElement() == cc.TMXPropertyObject) {
                    // The parent element is the last object
                    var objectGroup = this.getObjectGroups()[0];
                    var dict = objectGroup.getObjects()[0];

                    var propertyName = property.getAttribute('name');
                    var propertyValue = new String(property.getAttribute('value'));
                    dict[propertyName] = propertyValue;
                }
                else if (this.getParentElement() == cc.TMXPropertyTile) {
                    var dict;
                    dict = this.getTileProperties()[this.getParentGID()];

                    var propertyName = property.getAttribute('name');
                    var propertyValue = new String(property.getAttribute('name'));

                    dict[propertyName] = propertyValue;
                }
            }
        }

        return map;
    },

    getTileProperties:function () {
        return this._tileProperties;
    },
    setTileProperties:function (tileProperties) {
        this._tileProperties[tileProperties] = {};
    },

    getCurrentString:function () {
        return this._currentString;
    },
    setCurrentString:function (currentString) {
        this._currentString = currentString;
    },
    getTMXFileName:function () {
        return this._TMXFileName;
    },
    setTMXFileName:function (fileName) {
        this._TMXFileName = fileName;
    }
});

/** creates a TMX Format with a tmx file */
cc.TMXMapInfo.formatWithTMXFile = function (tmxFile) {
    var ret = new cc.TMXMapInfo();
    if (ret.initWithTMXFile(tmxFile)) {
        return ret;
    }
    return null;
};