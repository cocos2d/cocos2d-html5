/****************************************************************************
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

(function(studio){

    var timeline = {
        ClassName_Node: "Node",
        ClassName_SubGraph: "SubGraph",
        ClassName_Sprite: "Sprite",
        ClassName_Particle: "Particle",

        ClassName_Panel: "Panel",
        ClassName_Button: "Button",
        ClassName_CheckBox: "CheckBox",
        ClassName_ImageView: "ImageView",
        ClassName_TextAtlas: "TextAtlas",
        ClassName_LabelAtlas: "LabelAtlas",
        ClassName_LabelBMFont: "LabelBMFont",
        ClassName_TextBMFont: "TextBMFont",
        ClassName_Text: "Text",
        ClassName_LoadingBar: "LoadingBar",
        ClassName_TextField: "TextField",
        ClassName_Slider: "Slider",
        ClassName_Layout: "Layout",
        ClassName_ScrollView: "ScrollView",
        ClassName_ListView: "ListView",
        ClassName_PageView: "PageView",
        ClassName_Widget: "Widget",
        ClassName_Label: "Label",


        NODE: "nodeTree",
        CHILDREN: "children",
        CLASSNAME: "classname",
        FILE_PATH: "fileName",
        PLIST_FILE: "plistFile",
        TAG: "tag",
        ACTION_TAG: "actionTag",

        OPTIONS: "options",

        WIDTH: "width",
        HEIGHT: "height",
        X: "x",
        Y: "y",
        SCALE_X: "scaleX",
        SCALE_Y: "scaleY",
        SKEW_X: "skewX",
        SKEW_Y: "skewY",
        ROTATION: "rotation",
        ROTATION_SKEW_X: "rotationSkewX",
        ROTATION_SKEW_Y: "rotationSkewY",
        ANCHOR_X: "anchorPointX",
        ANCHOR_Y: "anchorPointY",
        ALPHA: "opacity",
        RED: "colorR",
        GREEN: "colorG",
        BLUE: "colorB",
        ZORDER: "ZOrder",
        PARTICLE_NUM: "particleNum",
        FLIPX: "flipX",
        FLIPY: "flipY",
        VISIBLE: "visible",

        TEXTURES: "textures",
        TEXTURES_PNG: "texturesPng"
    };

    /**
     * Node Reader
     * @name ccs.nodeReader
     * @namespace
     */
    studio.NodeReader = {

        _funcs: null,
        _recordJsonPath: true,
        _jsonPath: "",
        _sharedNodeReader: null,

        init: function(){
            this._funcs = {};

            this._funcs[timeline.ClassName_Node] = studio.NodeReader._loadSimpleNode.bind(this);
            this._funcs[timeline.ClassName_SubGraph] = studio.NodeReader._loadSubGraph.bind(this);
            this._funcs[timeline.ClassName_Sprite] = studio.NodeReader._loadSprite.bind(this);
            this._funcs[timeline.ClassName_Particle] = studio.NodeReader._loadParticle.bind(this);
            this._funcs[timeline.ClassName_LabelAtlas] = studio.NodeReader._loadWidget.bind(this);
            this._funcs[timeline.ClassName_LabelBMFont] = studio.NodeReader._loadWidget.bind(this);
            this._funcs[timeline.ClassName_Panel] = studio.NodeReader._loadWidget.bind(this);
            this._funcs[timeline.ClassName_Button] = studio.NodeReader._loadWidget.bind(this);
            this._funcs[timeline.ClassName_CheckBox] = studio.NodeReader._loadWidget.bind(this);
            this._funcs[timeline.ClassName_ImageView] = studio.NodeReader._loadWidget.bind(this);
            this._funcs[timeline.ClassName_TextAtlas] = studio.NodeReader._loadWidget.bind(this);
            this._funcs[timeline.ClassName_TextBMFont] = studio.NodeReader._loadWidget.bind(this);
            this._funcs[timeline.ClassName_Text] = studio.NodeReader._loadWidget.bind(this);
            this._funcs[timeline.ClassName_LoadingBar] = studio.NodeReader._loadWidget.bind(this);
            this._funcs[timeline.ClassName_TextField] = studio.NodeReader._loadWidget.bind(this);
            this._funcs[timeline.ClassName_Slider] = studio.NodeReader._loadWidget.bind(this);
            this._funcs[timeline.ClassName_Layout] = studio.NodeReader._loadWidget.bind(this);
            this._funcs[timeline.ClassName_ScrollView] = studio.NodeReader._loadWidget.bind(this);
            this._funcs[timeline.ClassName_ListView] = studio.NodeReader._loadWidget.bind(this);
            this._funcs[timeline.ClassName_PageView] = studio.NodeReader._loadWidget.bind(this);
            this._funcs[timeline.ClassName_Widget] = studio.NodeReader._loadWidget.bind(this);
            this._funcs[timeline.ClassName_Label] = studio.NodeReader._loadWidget.bind(this);

        },

        /**
         * Create node with file
         * @param {string} filename
         * @returns {cc.Node}
         */
        createNode: function(filename){
            if(this._recordJsonPath){
                var jsonPath = filename.substr(0, filename.lastIndexOf('/') + 1);
                studio.uiReader.setFilePath(jsonPath);

                this._jsonPath = jsonPath;
            }else{
                studio.uiReader.setFilePath("");
                this._jsonPath = "";
            }

            return this.loadNodeWithFile(filename);
        },

        /**
         * load file
         * @param {string} fileName
         * @returns {cc.Node}
         */
        loadNodeWithFile: function(fileName){
            // Read content from file
            //std::string contentStr = FileUtils::getInstance()->getStringFromFile(fileName);
            var json = cc.loader.getRes(fileName);

            var node = this.loadNodeWithContent(json);

            // Load animation data from file
            studio.ActionTimelineCache.loadAnimationActionWithContent(fileName, json);

            return node;

        },

        /**
         * load node with data.
         * @param {Object} json
         * @returns {cc.Node}
         */
        loadNodeWithContent: function(json){
            // decode plist
            var length = json[timeline.TEXTURES].length;

            for(var i=0; i<length; i++)
            {
                var plist = json[timeline.TEXTURES][i];
                var png   = json[timeline.TEXTURES_PNG][i];
                plist = this._jsonPath + plist;
                png   = this._jsonPath + png;
                cc.spriteFrameCache.addSpriteFrames(plist, png);
            }

            // decode node tree
            var subJson = json[timeline.NODE];
            return this._loadNode(subJson);

        },

        /**
         * Set record Json path
         * @param {boolean} record
         */
        setRecordJsonPath: function(record){
            this._recordJsonPath = record;
        },

        /**
         * Gets the record Json path.
         * @returns {boolean}
         */
        isRecordJsonPath: function(){
            return this._recordJsonPath;
        },

        /**
         * Set the json path.
         * @param {string} jsonPath
         */
        setJsonPath: function(jsonPath){
            this._jsonPath = jsonPath;
        },

        /**
         * Gets the json path.
         * @returns {string}
         */
        getJsonPath: function(){
            return this._jsonPath;
        },

        _loadNode: function(json){
            var node = null;
            var nodeType = json[timeline.CLASSNAME];

            var func = this._funcs[nodeType];
            if (func != null)
            {
                var options = json[timeline.OPTIONS];
                node = func(options);
            }

            if(node)
            {
                var length = (json[timeline.CHILDREN] && json[timeline.CHILDREN].length) ? json[timeline.CHILDREN].length : 0;
                for (var i = 0; i<length; i++)
                {
                    var dic = json[timeline.CHILDREN][i];
                    var child = this._loadNode(dic);
                    if (child)
                    {
                        var widgetChild = child;
                        if (widgetChild
                            && node instanceof ccui.Widget
                            && !(node instanceof ccui.Layout))
                        {
                            if (widgetChild.getPositionType() == ccui.Widget.POSITION_PERCENT)
                            {
                                widgetChild.setPositionPercent(cc.p(widgetChild.getPositionPercent().x + node.getAnchorPoint().x, widgetChild.getPositionPercent().y + node.getAnchorPoint().y));
                            }
                            widgetChild.setPosition(cc.p(widgetChild.getPositionX() + node.getAnchorPointInPoints().x, widgetChild.getPositionY() + node.getAnchorPointInPoints().y));
                        }

                        node.addChild(child);
                    }
                }
            }
            else
            {
                cc.log("Not supported NodeType: %s", nodeType.c_str());
            }

            return node;
        },

        //NOT DEFINED
        //_locateNodeWithMulresPosition: function(node, json){},

        _initNode: function(node, json){
            var width         = json[timeline.WIDTH];
            var height        = json[timeline.HEIGHT];
            var x             = json[timeline.X];
            var y             = json[timeline.Y];
            var scalex        = json[timeline.SCALE_X] || 1;
            var scaley        = json[timeline.SCALE_Y] || 1;
            var rotation      = json[timeline.ROTATION];
            var rotationSkewX = json[timeline.ROTATION_SKEW_X];
            var rotationSkewY = json[timeline.ROTATION_SKEW_Y];
            var skewx         = json[timeline.SKEW_X];
            var skewy         = json[timeline.SKEW_Y];
            var anchorx       = json[timeline.ANCHOR_X] || 0.5;
            var anchory       = json[timeline.ANCHOR_Y] || 0.5;
            var alpha         = json[timeline.ALPHA] || 255;
            var red           = json[timeline.RED] || 255;
            var green         = json[timeline.GREEN] || 255;
            var blue          = json[timeline.BLUE] || 255;
            var zorder	      = json[timeline.ZORDER];
            var tag           = json[timeline.TAG];
            var actionTag     = json[timeline.ACTION_TAG];
            var visible       = json[timeline.VISIBLE];

            if(x && y && (x != 0 || y != 0))
                node.setPosition(x, y);
            if(scalex != 1)
                node.setScaleX(scalex);
            if(scaley != 1)
                node.setScaleY(scaley);
            if (rotation && rotation != 0)
                node.setRotation(rotation);
            //rotationSkewX != 0 and not undefined
            if(rotationSkewX)
                node.setRotationSkewX(rotationSkewX);
            //rotationSkewY != 0 and not undefined
            if(rotationSkewY)
                node.setRotationSkewY(rotationSkewY);
            //skewx != 0 and not undefined
            if(skewx)
                node.setSkewX(skewx);
            //skewy != 0 and not undefined
            if(skewy)
                node.setSkewY(skewy);
            if(anchorx != 0.5 || anchory != 0.5)
                node.setAnchorPoint(cc.p(anchorx, anchory));
            if(width && height && (width != 0 || height != 0))
                node.setContentSize(cc.size(width, height));
            //zorder != 0 and not undefined
            if(zorder)
                node.setLocalZOrder(zorder);
            if(visible !== undefined && visible != true)
                node.setVisible(visible);

            if(alpha != 255){
                node.setOpacity(alpha);
            }
            if(red != 255 || green != 255 || blue != 255){
                node.setColor(cc.color(red, green, blue));
            }

            if(tag != null)
                node.setTag(tag);
            if(actionTag)
                node.setUserObject(new studio.ActionTimelineData(actionTag));
        },

        _loadSimpleNode: function(json){
            var node = new cc.Node();

            this._initNode(node, json);

            return node;
        },

        _loadSubGraph: function(json){
            var filePath = json[timeline.FILE_PATH];

            var node = null;
            if (filePath && "" != filePath)
            {
                node = this.createNode(filePath);
            }
            else
            {
                node = new cc.Node();
            }

            node.retain();

            this._initNode(node, json);

            return node;
        },

        _loadSprite: function(json){
            var filePath = json[timeline.FILE_PATH];
            var sprite = null;

            if(filePath != null){
                var path = filePath;

                var spriteFrame = cc.spriteFrameCache.getSpriteFrame(path);
                if(!spriteFrame){
                    path = this._jsonPath + path;
                    sprite = new cc.Sprite(path);
                }else{
                    sprite = cc.Sprite.createWithSpriteFrame(spriteFrame);
                }

                if(!sprite){
                    sprite = new cc.Sprite();
                    cc.log("filePath is empty. Create a sprite with no texture");
                }
            }else{
                sprite = new cc.Sprite();
            }

            sprite.retain();

            this._initNode(sprite, json);

            var flipX          = json[timeline.FLIPX];
            var flipY          = json[timeline.FLIPY];

            if(flipX != false)
                sprite.setFlippedX(flipX);
            if(flipY != false)
                sprite.setFlippedY(flipY);

            return sprite;
        },

        _loadParticle: function(json){
            var filePath = json[timeline.PLIST_FILE];
            var num = json[timeline.PARTICLE_NUM];

            var particle = new studio.ParticleSystemQuad(filePath);
            particle.setTotalParticles(num);
            particle.retain();

            this._initNode(particle, json);

            return particle;

        },

        _loadWidget: function(json){
            var str = json[timeline.CLASSNAME];
            if(str == null)
                return null;

            var classname = str;

            if (classname == "Panel")
            {
                classname = "Layout";
            }
            else if (classname == "TextArea")
            {
                classname = "Text";
            }
            else if (classname == "TextButton")
            {
                classname = "Button";
            }
            else if (classname == "Label")
            {
                classname = "Text";
            }
            else if (classname == "LabelAtlas")
            {
                classname = "TextAtlas";
            }
            else if (classname == "LabelBMFont")
            {
                classname = "TextBMFont";
            }

            var readerName = classname;
            readerName.append("Reader");

            var widget = studio.objectFactory.createObject(classname);

            var reader = studio.objectFactory.createObject(readerName);

            var guiReader = new studio.WidgetPropertiesReader0300();
            guiReader.setPropsForAllWidgetFromJsonDictionary(reader, widget, json);

            var actionTag = json[timeline.ACTION_TAG];
            widget.setUserObject(new studio.ActionTimelineData(actionTag));

            this._initNode(widget, json);

            return widget;
        }
    };

    studio.NodeReader.init();
})(ccs);
