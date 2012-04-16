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
    _m_pProperties:[],
    m_sName:"",
    _m_tLayerSize:null,
    _m_pTiles:[],
    m_bVisible:null,
    _m_cOpacity:null,
    m_bOwnTiles:true,
    _m_uMinGID:100000,
    _m_uMaxGID:0,
    m_tOffset:cc.PointZero(),
    getProperties:function () {
        return this._m_pProperties;
    },
    setProperties:function (Var) {
        this._m_pProperties = Var;
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
    m_sName:null,
    m_uFirstGid:0,
    _m_tTileSize:cc.SizeZero(),
    m_uSpacing:0,
    m_uMargin:0,
    //! filename containing the tiles (should be spritesheet / texture atlas)
    m_sSourceImage:null,
    //! size in pixels of the image
    m_tImageSize:cc.SizeZero(),
    rectForGID:function (gid) {
        var rect = new cc.Rect;
        rect.size = this._m_tTileSize;
        gid = gid - parseInt(this.m_uFirstGid);
        var max_x = parseInt((this.m_tImageSize.width - this.m_uMargin * 2 + this.m_uSpacing) / (this._m_tTileSize.width + this.m_uSpacing));
        rect.origin.x = parseInt((gid % max_x) * (this._m_tTileSize.width + this.m_uSpacing) + this.m_uMargin);
        rect.origin.y = parseInt(parseInt(gid / max_x) * (this._m_tTileSize.height + this.m_uSpacing) + this.m_uMargin);
        //console.log(gid , max_x,rect)
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
    _m_nOrientation:null,
    _m_tMapSize:cc.SizeZero(),
    _m_tTileSize:cc.SizeZero(),
    _m_pLayers:null,
    _m_pTileSets:null,
    _m_pObjectGroups:null,
    _m_nParentElement:null,
    _m_uParentGID:null,
    _m_nLayerAttribs:0,
    _m_bStoringCharacters:false,
    _m_pProperties:null,
    //! tmx filename
    _m_sTMXFileName:null,
//! current string
    _m_sCurrentString:null,
//! tile properties
    _m_pTileProperties:[],
    getOrientation:function () {
        return this._m_nOrientation;
    },
    setOrientation:function (Var) {
        this._m_nOrientation = Var;
    },
    /// map width & height
    getMapSize:function () {
        return this._m_tMapSize;
    },
    setMapSize:function (Var) {
        this._m_tMapSize = Var;
    },
    /// tiles width & height
    getTileSize:function () {
        return this._m_tTileSize;
    },
    setTileSize:function (Var) {
        this._m_tTileSize = Var;
    },
    /// Layers
    getLayers:function () {
        return this._m_pLayers;
    },
    setLayers:function (Var) {
        this._m_pLayers = Var;
    },
    /// tilesets
    getTilesets:function () {
        return this._m_pTileSets;
    },
    setTilesets:function (Var) {
        this._m_pTileSets = Var;
    },
    /// ObjectGroups
    getObjectGroups:function () {
        return this._m_pObjectGroups;
    },
    setObjectGroups:function (Var) {
        this._m_pObjectGroups = Var;
    },
    /// parent element
    getParentElement:function () {
        return this._m_nParentElement;
    },
    setParentElement:function (Var) {
        this._m_nParentElement = Var;
    },
    /// parent GID
    getParentGID:function () {
        return this._m_uParentGID;
    },
    setParentGID:function (Var) {
        this._m_uParentGID = Var;
    },
    /// layer attribs
    getLayerAttribs:function () {
        return this._m_nLayerAttribs;
    },
    setLayerAttribs:function (Var) {
        this._m_nLayerAttribs = Var;
    },
    /// is stroing characters?
    getStoringCharacters:function () {
        return this._m_bStoringCharacters;
    },
    setStoringCharacters:function (Var) {
        this._m_bStoringCharacters = Var;
    },
    /// properties
    getProperties:function () {
        return this._m_pProperties;
    },
    setProperties:function (Var) {
        this._m_pProperties = Var;
    },
    /** initializes a TMX format witha  tmx file */
    initWithTMXFile:function (tmxFile) {
        this._m_pTileSets = [];
        this._m_pLayers = [];
        this._m_sTMXFileName = tmxFile;
        this._m_pObjectGroups = [];
        this._m_pProperties = [];
        this._m_pTileProperties = [];

        // tmp vars
        this._m_sCurrentString = "";
        this._m_bStoringCharacters = false;
        this._m_nLayerAttribs = cc.TMXLayerAttribNone;
        this._m_nParentElement = cc.TMXPropertyNone;

        return this.parseXMLFile(this._m_sTMXFileName);
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

            var s = new cc.Size;
            s.width = parseFloat(map.getAttribute('width'));
            s.height = parseFloat(map.getAttribute('height'));
            this.setMapSize(s);

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
                tileset.m_sName = t.getAttribute('name') || "";
                tileset.m_uFirstGid = parseInt(t.getAttribute('firstgid')) || 1;
                tileset.m_uSpacing = parseInt(t.getAttribute('spacing')) || 0;
                tileset.m_uMargin = parseInt(t.getAttribute('margin')) || 0;

                var s = cc.Size;
                s.width = parseFloat(t.getAttribute('tilewidth'));
                s.height = parseFloat(t.getAttribute('tileheight'));
                tileset._m_tTileSize = s;

                var image = t.getElementsByTagName('image')[0];
                var imgSource = image.getAttribute('source');
                if (imgSource) {
                    imgSource = imgpath + imgSource;
                }
                tileset.m_sSourceImage = imgSource;
                this.getTilesets().push(tileset);
            }
        }

        // PARSE  <tile>
        var tiles = map.getElementsByTagName('tile');
        if (tiles) {
            for (var i = 0, len = tiles.length; i < len; i++) {
                var info = this.getTilesets()[0];
                var t = tiles[i];
                this.setParentGID(info.m_uFirstGid + parseInt(t.getAttribute('id')));
                this.getTileProperties()[this.getParentGID()] = {};
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
                layer.m_sName = l.getAttribute('name')

                var s = new cc.Size;
                s.width = parseFloat(l.getAttribute('width'));
                s.height = parseFloat(l.getAttribute('height'));
                layer._m_tLayerSize = s;

                var visible = l.getAttribute('visible')
                layer.m_bVisible = !(visible == "0");

                var opacity = l.getAttribute('opacity') || 1;

                if (opacity) {
                    layer._m_cOpacity = parseInt(255 * parseFloat(opacity));
                }
                else {
                    layer._m_cOpacity = 255;
                }

                var x = parseFloat(l.getAttribute('x')) || 0;
                var y = parseFloat(l.getAttribute('y')) || 0;
                layer.m_tOffset = cc.ccp(x, y);

                // Firefox has a 4KB limit on node values. It will split larger
                // nodes up into multiple nodes. So, we'll stitch them back
                // together.
                var nodeValue = ''
                for (var j = 0, jen = data.childNodes.length; j < jen; j++) {
                    nodeValue += data.childNodes[j].nodeValue
                }

                // Unpack the tilemap data
                var compression = data.getAttribute('compression');
                cc.Assert(compression == null || compression == "gzip" || compression == "zlib", "TMX: unsupported compression method");
                switch (compression) {
                    case 'gzip':
                        layer._m_pTiles = cc.unzipBase64AsArray(nodeValue, 4);
                        break;
                    case 'zlib':
                        //layer._m_pTiles = JXG.Util.Unzip(nodeValue);
                        break;
                    // Uncompressed
                    case null:
                        layer._m_pTiles = cc.base64.decodeAsArray(nodeValue, 4);
                        break;
                    default:
                        cc.Assert(this.getLayerAttribs() != cc.TMXLayerAttribNone, "TMX tile map: Only base64 and/or gzip/zlib maps are supported");
                }
                this.getLayers().push(layer);
                // The parent element is now "layer"
                this.setParentElement(cc.TMXPropertyLayer);
            }
        }

        // PARSE <objectgroup>
        var objectgroups = map.getElementsByTagName('objectgroup')
        if (objectgroups) {
            for (var i = 0, len = objectgroups.length; i < len; i++) {
                var g = objectgroups[i];
                var objectGroup = new cc.TMXObjectGroup();
                objectGroup.setGroupName(g.getAttribute('name'));
                var positionOffset = new cc.Point();
                positionOffset.x = parseFloat(g.getAttribute('x')) * this.getTileSize().width || 0;
                positionOffset.y = parseFloat(g.getAttribute('y')) * this.getTileSize().height || 0;
                objectGroup.setPositionOffset(positionOffset);

                this.getObjectGroups().push(objectGroup);
                // The parent element is now "objectgroup"
                this.setParentElement(cc.TMXPropertyObjectGroup);
            }
        }

        // PARSE <object>
        var objects = map.getElementsByTagName('object')
        if (objects) {
            for (var i = 0, len = objects.length; i < len; i++) {
                var o = objects[i]
                var objectGroup = this.getObjectGroups()[0];

                // The value for "type" was blank or not a valid class name
                // Create an instance of TMXObjectInfo to store the object and its properties
                var dict = [];

                // Set the name of the object to the value for "name"
                dict["name"] = o.getAttribute('name') || "";

                // Assign all the attributes as key/name pairs in the properties dictionary
                dict["type"] = o.getAttribute('type') || "";

                dict["x"] = parseInt(o.getAttribute('x') || 0) + objectGroup.getPositionOffset().x;

                var y = parseInt(o.getAttribute('y') || 0) + objectGroup.getPositionOffset().y;

                // Correct y position. (Tiled uses Flipped, cocos2d uses Standard)
                y = this.getMapSize().height * this.getTileSize().height - y - parseInt(o.getAttribute('height'));
                dict["y"] = y;

                dict["width"] = parseInt(o.getAttribute('width'));

                dict["height"] = parseInt(o.getAttribute('height'));

                // Add the object to the objectGroup
                objectGroup.getObjects().push(dict);

                // The parent element is now "object"
                this.setParentElement(cc.TMXPropertyObject);
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
        return this._m_pTileProperties;
    },
    setTileProperties:function (tileProperties) {
        this._m_pTileProperties = tileProperties;
    },

    getCurrentString:function () {
        return this._m_sCurrentString;
    },
    setCurrentString:function (currentString) {
        this._m_sCurrentString = currentString;
    },
    getTMXFileName:function () {
        return this._m_sTMXFileName;
    },
    setTMXFileName:function (fileName) {
        this._m_sTMXFileName = fileName;
    }
});

/** creates a TMX Format with a tmx file */
cc.TMXMapInfo.formatWithTMXFile = function (tmxFile) {
    var pRet = new cc.TMXMapInfo();
    if (pRet.initWithTMXFile(tmxFile)) {
        return pRet;
    }
    return null;
};