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

ccui.CSLoaderStatic = {
    ClassName_Node         : "Node",
    ClassName_SubGraph     : "SubGraph",
    ClassName_Sprite       : "Sprite",
    ClassName_Particle     : "Particle",
    ClassName_TMXTiledMap     : "TMXTiledMap",

    ClassName_Panel          : "Panel",
    ClassName_Button         : "Button",
    ClassName_CheckBox       : "CheckBox",
    ClassName_ImageView      : "ImageView",
    ClassName_TextAtlas      : "TextAtlas",
    ClassName_LabelAtlas     : "LabelAtlas",
    ClassName_LabelBMFont    : "LabelBMFont",
    ClassName_TextBMFont     : "TextBMFont",
    ClassName_Text           : "Text",
    ClassName_LoadingBar     : "LoadingBar",
    ClassName_TextField      : "TextField",
    ClassName_Slider         : "Slider",
    ClassName_Layout         : "Layout",
    ClassName_ScrollView     : "ScrollView",
    ClassName_ListView       : "ListView",
    ClassName_PageView       : "PageView",
    ClassName_Widget         : "Widget",
    ClassName_Label          : "Label",

    ClassName_ComAudio     : "ComAudio",

    NODE            : "nodeTree",
    CHILDREN        : "children",
    CLASSNAME       : "classname",
    FILE_PATH       : "fileName",
    PLIST_FILE      : "plistFile",
    TMX_FILE      : "tmxFile",
    TMX_STRING      : "tmxString",
    RESOURCE_PATH      : "resourcePath",

    COMPONENTS         : "components",
    COMPONENT_TYPE         : "componentType",
    COMPONENT_NAME      : "componentName",
    COMPONENT_ENABLED      : "componentEnabled",
    COMPONENT_AUDIO_FILE_PATH      : "comAudioFilePath",
    COMPONENT_LOOP      : "comAudioloop",

    TAG             : "tag",
    ACTION_TAG      : "actionTag",

    OPTIONS         : "options",

    WIDTH                : "width",
    HEIGHT               : "height",
    X                    : "x",
    Y                    : "y",
    SCALE_X              : "scaleX",
    SCALE_Y              : "scaleY",
    SKEW_X               : "skewX",
    SKEW_Y               : "skewY",
    ROTATION             : "rotation",
    ROTATION_SKEW_X      : "rotationSkewX",
    ROTATION_SKEW_Y      : "rotationSkewY",
    ANCHOR_X             : "anchorPointX",
    ANCHOR_Y             : "anchorPointY",
    ALPHA                : "opacity",
    RED                  : "colorR",
    GREEN                : "colorG",
    BLUE                 : "colorB",
    ZORDER               : "ZOrder",
    PARTICLE_NUM         : "particleNum",
    FLIPX                : "flipX",
    FLIPY                : "flipY",
    VISIBLE              : "visible",

    TEXTURES         : "textures",
    TEXTURES_PNG     : "texturesPng",

    MONO_COCOS2D_VERSION         : "cocos2dVersion"
};

ccs.csLoader = {

    _recordJsonPath: true,
    _jsonPath: "",
    _monoCocos2dxVersion: "",

    init: function(){
        this._funcs = {};
        this._componentFuncs = {};

        this._funcs[ccui.CSLoaderStatic.ClassName_Node] = ccs.csLoader.loadSimpleNode.bind(this);
        this._funcs[ccui.CSLoaderStatic.ClassName_SubGraph] = ccs.csLoader.loadSubGraph.bind(this);
        this._funcs[ccui.CSLoaderStatic.ClassName_Sprite] = ccs.csLoader.loadSprite.bind(this);
        this._funcs[ccui.CSLoaderStatic.ClassName_Particle] = ccs.csLoader.loadParticle.bind(this);
        this._funcs[ccui.CSLoaderStatic.ClassName_TMXTiledMap] = ccs.csLoader.loadTMXTiledMap.bind(this);
        this._funcs[ccui.CSLoaderStatic.ClassName_LabelAtlas] = ccs.csLoader.loadWidget.bind(this);
        this._funcs[ccui.CSLoaderStatic.ClassName_LabelBMFont] = ccs.csLoader.loadWidget.bind(this);
        this._funcs[ccui.CSLoaderStatic.ClassName_Panel] = ccs.csLoader.loadWidget.bind(this);
        this._funcs[ccui.CSLoaderStatic.ClassName_Button] = ccs.csLoader.loadWidget.bind(this);
        this._funcs[ccui.CSLoaderStatic.ClassName_CheckBox] = ccs.csLoader.loadWidget.bind(this);
        this._funcs[ccui.CSLoaderStatic.ClassName_ImageView] = ccs.csLoader.loadWidget.bind(this);
        this._funcs[ccui.CSLoaderStatic.ClassName_TextAtlas] = ccs.csLoader.loadWidget.bind(this);
        this._funcs[ccui.CSLoaderStatic.ClassName_TextBMFont] = ccs.csLoader.loadWidget.bind(this);
        this._funcs[ccui.CSLoaderStatic.ClassName_Text] = ccs.csLoader.loadWidget.bind(this);
        this._funcs[ccui.CSLoaderStatic.ClassName_LoadingBar] = ccs.csLoader.loadWidget.bind(this);
        this._funcs[ccui.CSLoaderStatic.ClassName_TextField] = ccs.csLoader.loadWidget.bind(this);
        this._funcs[ccui.CSLoaderStatic.ClassName_Slider] = ccs.csLoader.loadWidget.bind(this);
        this._funcs[ccui.CSLoaderStatic.ClassName_Layout] = ccs.csLoader.loadWidget.bind(this);
        this._funcs[ccui.CSLoaderStatic.ClassName_ScrollView] = ccs.csLoader.loadWidget.bind(this);
        this._funcs[ccui.CSLoaderStatic.ClassName_ListView] = ccs.csLoader.loadWidget.bind(this);
        this._funcs[ccui.CSLoaderStatic.ClassName_PageView] = ccs.csLoader.loadWidget.bind(this);
        this._funcs[ccui.CSLoaderStatic.ClassName_Widget] = ccs.csLoader.loadWidget.bind(this);
        this._funcs[ccui.CSLoaderStatic.ClassName_Label] = ccs.csLoader.loadWidget.bind(this);

        this._componentFuncs[ccui.CSLoaderStatic.ClassName_ComAudio] =  ccs.csLoader.loadComAudio.bind(this);

    },

    createNode: function(filename){
        var path = filename;
        var pos = path.lastIndexOf('.');
        var suffix = path.substr(pos + 1, path.length);
        //cc.log("suffix = %s", suffix);

        var load = ccs.csLoader;

        if (suffix == "csb")
        {
            throw "Does not support protobuf";
        }
        else if (suffix == "json" || suffix == "ExportJson")
        {
            return load.createNodeFromJson(filename);
        }

        return null;
    },
    createTimeline: function(filename){
        var path = filename;
        var pos = path.lastIndexOf('.');
        var suffix = path.substr(pos + 1, path.length);
        //cc.log("suffix = %s", suffix);

        var cache = ccs.actionTimelineCache;

        if (suffix == "csb")
        {
            throw "Does not support protobuf";
        }
        else if (suffix == "json" || suffix == "ExportJson")
        {
            return cache.createActionFromJson(filename);
        }

        return null;
    },
    createNodeFromJson: function(filename){
       if (this._recordJsonPath)
       {
           var jsonPath = filename.substr(0, filename.lastIndexOf('/') + 1);
           ccs.uiReader.setFilePath(jsonPath);

           this._jsonPath = jsonPath;
       }
       else
       {
           ccs.uiReader.setFilePath("");
           this._jsonPath = "";
       }

       return this.loadNodeWithFile(filename);
    },
    loadNodeWithFile: function(fileName){
        // Read content from file
        var contentStr = cc.loader.getRes(fileName);

        var node = this.loadNodeWithContent(contentStr);

        // Load animation data from file
        ccs.actionTimelineCache.loadAnimationActionWithContent(fileName, contentStr);

        return node;
    },
    loadNodeWithContent: function(data){

        // cocos2dx version mono editor is based on
        this._monoCocos2dxVersion = data[ccui.CSLoaderStatic.MONO_COCOS2D_VERSION] || data["version"];

        // decode plist
        var texture = data[ccui.CSLoaderStatic.TEXTURES];
        var texturePng = data[ccui.CSLoaderStatic.TEXTURES_PNG];
        var length = texture.length;

        for(var i=0; i<length; i++)
        {
            var plist = texture[i];
            var png   = texturePng[i];
            plist = this._jsonPath + plist;
            png   = this._jsonPath + png;
            cc.spriteFrameCache.addSpriteFrames(plist, png);
        }

        // decode node tree
        var subJson = data[ccui.CSLoaderStatic.NODE];
        return this.loadNode(subJson);
    },

    setRecordJsonPath: function(record){
        this._recordJsonPath = record;
    },
    isRecordJsonPath: function(){
        return this._recordJsonPath;
    },

    setJsonPath: function(jsonPath){
        this._jsonPath = jsonPath;
    },
    getJsonPath: function(){
        return this._jsonPath;
    },

    //protected
    loadNode: function(json){
        var node = null;
        var nodeType = json[ccui.CSLoaderStatic.CLASSNAME];

        var func = this._funcs[nodeType];
        if (func != null)
        {
            var options = json[ccui.CSLoaderStatic.OPTIONS];
            node = func(options);

            // component
            if (node)
            {
                var components = options[ccui.CSLoaderStatic.COMPONENTS];
                var componentSize = options[ccui.CSLoaderStatic.COMPONENTS] || 0;
                for (var i = 0; i < componentSize; ++i)
                {
                    var dic = components[ccui.CSLoaderStatic.COMPONENTS][i];
                    var component = this.loadComponent(dic);
                    if (component)
                    {
                        node.addComponent(component);
                    }
                }
            }
        }

        if(node)
        {
            var length = json[ccui.CSLoaderStatic.CHILDREN].length || 0;
            for (var i = 0; i<length; i++)
            {
                var dic = json[ccui.CSLoaderStatic.CHILDREN][i];
                var child = this.loadNode(dic);
                if (child)
                {
                    var pageView = node;
                    var listView = node;
                    if (pageView instanceof ccui.PageView)
                    {
                        var layout = child;
                        if (layout instanceof ccui.Layout)
                        {
                            pageView.addPage(layout);
                        }
                    }
                    else if (listView instanceof ccui.ListView)
                    {
                        var widget = child;
                        if (widget instanceof ccui.Widget)
                        {
                            listView.pushBackCustomItem(widget);
                        }
                    }
                    else
                    {
                        if (this._monoCocos2dxVersion != "3.x")
                        {
                            var widget = child;
                            var parent = node;
                            if (widget instanceof ccui.Widget
                                && parent instanceof ccui.Widget
                                && !(parent instanceof ccui.Layout))
                            {
                                if (widget.getPositionType() == ccui.Widget.POSITION_PERCENT)
                                {
                                    widget.setPositionPercent(cc.p(widget.getPositionPercent().x + parent.getAnchorPoint().x, widget.getPositionPercent().y + parent.getAnchorPoint().y));
                                    widget.setPosition(cc.p(widget.getPositionX() + parent.getAnchorPointInPoints().x, widget.getPositionY() + parent.getAnchorPointInPoints().y));
                                }
                                else
                                {
                                    var parentSize = parent.getContentSize();
                                    widget.setPosition(cc.p(widget.getPositionX() + parentSize.width * parent.getAnchorPoint().x,
                                                             widget.getPositionY() + parentSize.height * parent.getAnchorPoint().y));
                                }
                            }
                        }

                        node.addChild(child);
                    }
                }
            }
        }
        else
        {
            cc.log("Not supported NodeType: %s", nodeType);
        }

        return node;
    },

    locateNodeWithMulresPosition: function(node, json){

    },

    initNode: function(node, json){
        var width         = json[ccui.CSLoaderStatic.WIDTH]          !=null ? json[ccui.CSLoaderStatic.WIDTH] : 0;
        var height        = json[ccui.CSLoaderStatic.HEIGHT]         !=null ? json[ccui.CSLoaderStatic.HEIGHT] : 0;
        var x             = json[ccui.CSLoaderStatic.X]              !=null ? json[ccui.CSLoaderStatic.X] : 0;
        var y             = json[ccui.CSLoaderStatic.Y]              !=null ? json[ccui.CSLoaderStatic.Y] : 0;
        var scalex        = json[ccui.CSLoaderStatic.SCALE_X]        !=null ? json[ccui.CSLoaderStatic.SCALE_X] : 1;
        var scaley        = json[ccui.CSLoaderStatic.SCALE_Y]        !=null ? json[ccui.CSLoaderStatic.SCALE_Y] : 1;
        var rotation      = json[ccui.CSLoaderStatic.ROTATION]       !=null ? json[ccui.CSLoaderStatic.ROTATION] : 0;
        var rotationSkewX = json[ccui.CSLoaderStatic.ROTATION_SKEW_X]!=null ? json[ccui.CSLoaderStatic.ROTATION_SKEW_X] : 0;
        var rotationSkewY = json[ccui.CSLoaderStatic.ROTATION_SKEW_Y]!=null ? json[ccui.CSLoaderStatic.ROTATION_SKEW_Y] : 0;
        var skewx         = json[ccui.CSLoaderStatic.SKEW_X]         !=null ? json[ccui.CSLoaderStatic.SKEW_X] : 0;
        var skewy         = json[ccui.CSLoaderStatic.SKEW_Y]         !=null ? json[ccui.CSLoaderStatic.SKEW_Y] : 0;
        var anchorx       = json[ccui.CSLoaderStatic.ANCHOR_X]       !=null ? json[ccui.CSLoaderStatic.ANCHOR_X] : 0.5;
        var anchory       = json[ccui.CSLoaderStatic.ANCHOR_Y]       !=null ? json[ccui.CSLoaderStatic.ANCHOR_Y] : 0.5;
        var alpha         = json[ccui.CSLoaderStatic.ALPHA]          !=null ? json[ccui.CSLoaderStatic.ALPHA] : 255;
        var red           = json[ccui.CSLoaderStatic.RED]            !=null ? json[ccui.CSLoaderStatic.RED] : 255;
        var green         = json[ccui.CSLoaderStatic.GREEN]          !=null ? json[ccui.CSLoaderStatic.GREEN] : 255;
        var blue          = json[ccui.CSLoaderStatic.BLUE]           !=null ? json[ccui.CSLoaderStatic.BLUE] : 255;
        var zorder        = json[ccui.CSLoaderStatic.ZORDER]         !=null ? json[ccui.CSLoaderStatic.ZORDER] : 0;
        var tag           = json[ccui.CSLoaderStatic.TAG]            !=null ? json[ccui.CSLoaderStatic.TAG] : 0;
        var actionTag     = json[ccui.CSLoaderStatic.ACTION_TAG]     !=null ? json[ccui.CSLoaderStatic.ACTION_TAG] : 0;
        var visible       = json[ccui.CSLoaderStatic.VISIBLE]        !=null ? json[ccui.CSLoaderStatic.VISIBLE] : true;
    
        if(x != 0 || y != 0)
            node.setPosition(cc.p(x, y));
        if(scalex != 1)
            node.setScaleX(scalex);
        if(scaley != 1)
            node.setScaleY(scaley);
        if (rotation != 0)
            node.setRotation(rotation);
        if(rotationSkewX != 0)
            node.setRotationX(rotationSkewX);
        if(rotationSkewY != 0)
            node.setRotationY(rotationSkewY);
        if(skewx != 0)
            node.setSkewX(skewx);
        if(skewy != 0)
            node.setSkewY(skewy);
        if(anchorx != 0.5 || anchory != 0.5)
            node.setAnchorPoint(cc.p(anchorx, anchory));
        if(width != 0 || height != 0)
            node.setContentSize(cc.size(width, height));
        if(zorder != 0)
            node.setLocalZOrder(zorder);
        if(visible != true)
            node.setVisible(visible);
    
        if(alpha != 255)
        {
            node.setOpacity(alpha);
        }
        if(red != 255 || green != 255 || blue != 255)
        {
            node.setColor(cc.color(red, green, blue));
        }
    
    
        node.setTag(tag);
        node.setUserObject(new ccs.ActionTimelineData(actionTag));
    },

    // load nodes
    loadSimpleNode: function(json){
        var node = new ccs.Node();

        this.initNode(node, json);

        return node;
    },
    loadSubGraph: function(json){
        var filePath = json[ccui.CSLoaderStatic.FILE_PATH];

        var node = null;
        if (filePath && "" != filePath)
        {
            node = this.createNode(filePath);
        }
        else
        {
            node = new ccs.Node();
        }

        this.initNode(node, json);

        return node;
    },
    loadSprite: function(json){
        var filePath = json[ccui.CSLoaderStatic.FILE_PATH];
        var sprite = null;

        if(filePath != null)
        {
            var path = filePath;

            var spriteFrame = cc.spriteFrameCache.getSpriteFrame(path);
            if(!spriteFrame)
            {
                path = this._jsonPath + path;
                sprite = new ccs.Sprite(path);
            }
            else
            {
                sprite = ccs.Sprite.createWithSpriteFrame(spriteFrame);
            }

            if(!sprite)
            {
                sprite = new cc.Sprite();
                cc.log("filePath is empty. Create a sprite with no texture");
            }
        }
        else
        {
            sprite = new ccs.Sprite();
        }

        this.initNode(sprite, json);

        var flipX          = json[ccui.CSLoaderStatic.FLIPX];
        var flipY          = json[ccui.CSLoaderStatic.FLIPY];

        if(flipX != false)
            sprite.setFlippedX(flipX);
        if(flipY != false)
            sprite.setFlippedY(flipY);

        return sprite;
    },
    loadParticle: function(json){
        var filePath = json[ccui.CSLoaderStatic.PLIST_FILE];
        var num = json[ccui.CSLoaderStatic.PARTICLE_NUM];
    
        var particle = new cc.ParticleSystemQuad(filePath);
        particle.setTotalParticles(num);
    
        this.initNode(particle, json);
    
        return particle;
    },
    loadTMXTiledMap: function(json){
        var tmxFile = json[ccui.CSLoaderStatic.TMX_FILE];
        var tmxString = json[ccui.CSLoaderStatic.TMX_STRING];
        var resourcePath = json[ccui.CSLoaderStatic.RESOURCE_PATH];
    
        var tmx = null;
    
        if (tmxFile && "" != tmxFile)
        {
            tmx = new cc.TMXTiledMap(tmxFile);
        }
        else if ((tmxString && "" != tmxString)
                 && (resourcePath && "" != resourcePath))
        {
            tmx = new cc.TMXTiledMap(tmxString, resourcePath);
        }
    
        return tmx;
    },

    // load gui
    loadWidget: function(json){
        var str = json[ccui.CSLoaderStatic.CLASSNAME];
        if(str == null)
            return null;
    
        var classname = str;
    
        var widgetPropertiesReader = new ccs.WidgetPropertiesReader0300();
        var widget = null;
    
        if (this.isWidget(classname))
        {
            var readerName = this.getGUIClassName(classname);
            readerName += "Reader";
    
            var guiClassName = this.getGUIClassName(classname);
            widget = ccs.objectFactory.createObject(guiClassName);
    
            var reader = ccs.objectFactory.createObject(readerName);
    
            widgetPropertiesReader.setPropsForAllWidgetFromJsonDictionary(reader, widget, json);
        }
        else if (this.isCustomWidget(classname))
        {
            widget = ccs.objectFactory.createObject(classname);
    
            //
            // 1st., custom widget parse properties of parent widget with parent widget reader
            var readerName = this.getWidgetReaderClassName(widget);
            var reader = ccs.objectFactory.createObject(readerName);
            if (reader && widget)
            {
                widgetPropertiesReader.setPropsForAllWidgetFromJsonDictionary(reader, widget, json);
    
                // 2nd., custom widget parse with custom reader
                var customJsonDict = json["customProperty"];
    
                widgetPropertiesReader.setPropsForAllCustomWidgetFromJsonDictionary(classname, widget, customJsonDict);
            }
            else
            {
                cc.log("Widget or WidgetReader doesn't exists!!!  Please check your file.");
            }
        }
    
        if (widget)
        {
            var rotationSkewX = json[ccui.CSLoaderStatic.ROTATION_SKEW_X];
            var rotationSkewY = json[ccui.CSLoaderStatic.ROTATION_SKEW_Y];
            var skewx         = json[ccui.CSLoaderStatic.SKEW_X];
            var skewy         = json[ccui.CSLoaderStatic.SKEW_Y];
            if(rotationSkewX != 0)
                widget.setRotationX(rotationSkewX);
            if(rotationSkewY != 0)
                widget.setRotationY(rotationSkewY);
            if(skewx != 0)
                widget.setSkewX(skewx);
            if(skewy != 0)
                widget.setSkewY(skewy);
    
            var actionTag = json[ccui.CSLoaderStatic.ACTION_TAG];
            widget.setUserObject(new ccs.ActionTimelineData(actionTag));
        }
    
        return widget;

},

    // load component
    loadComponent: function(json){
        var component = null;
    
        var componentType = json[ccui.CSLoaderStatic.COMPONENT_TYPE];
    
        var func = this._componentFuncs[componentType];
    
        if (func != null)
        {
            component = func(json);
        }
    
        return component;
    },
    loadComAudio: function(json){
        var audio = new ccs.ComAudio();
    
        var name = json[ccui.CSLoaderStatic.COMPONENT_NAME];
        var enabled = json[ccui.CSLoaderStatic.COMPONENT_ENABLED];
    
        audio.setName(name);
        audio.setEnabled(enabled);
    
        var filePath = json[ccui.CSLoaderStatic.COMPONENT_AUDIO_FILE_PATH];
        var loop = json[ccui.CSLoaderStatic.COMPONENT_LOOP];
    
        audio.setFile(filePath);
        audio.setLoop(loop);
    
        return audio;
    },

    isWidget: function(type){
        return (type == ccui.CSLoaderStatic.ClassName_Panel
                || type == ccui.CSLoaderStatic.ClassName_Button
                || type == ccui.CSLoaderStatic.ClassName_CheckBox
                || type == ccui.CSLoaderStatic.ClassName_ImageView
                || type == ccui.CSLoaderStatic.ClassName_TextAtlas
                || type == ccui.CSLoaderStatic.ClassName_LabelAtlas
                || type == ccui.CSLoaderStatic.ClassName_LabelBMFont
                || type == ccui.CSLoaderStatic.ClassName_TextBMFont
                || type == ccui.CSLoaderStatic.ClassName_Text
                || type == ccui.CSLoaderStatic.ClassName_LoadingBar
                || type == ccui.CSLoaderStatic.ClassName_TextField
                || type == ccui.CSLoaderStatic.ClassName_Slider
                || type == ccui.CSLoaderStatic.ClassName_Layout
                || type == ccui.CSLoaderStatic.ClassName_ScrollView
                || type == ccui.CSLoaderStatic.ClassName_ListView
                || type == ccui.CSLoaderStatic.ClassName_PageView
                || type == ccui.CSLoaderStatic.ClassName_Widget
                || type == ccui.CSLoaderStatic.ClassName_Label);
    
    },
    isCustomWidget: function(type){
        var widget = ccs.objectFactory.createObject(type);
        if (widget)
        {
            return true;
        }
    
        return false;
    },

    getGUIClassName: function(name){
        var convertedClassName = name;
        if (name == "Panel")
        {
            convertedClassName = "Layout";
        }
        else if (name == "TextArea")
        {
            convertedClassName = "Text";
        }
        else if (name == "TextButton")
        {
            convertedClassName = "Button";
        }
        else if (name == "Label")
        {
            convertedClassName = "Text";
        }
        else if (name == "LabelAtlas")
        {
            convertedClassName = "TextAtlas";
        }
        else if (name == "LabelBMFont")
        {
            convertedClassName = "TextBMFont";
        }
    
    
        return convertedClassName;
    },
    getWidgetReaderClassName: function(widget){
        var readerName;
    
        // 1st., custom widget parse properties of parent widget with parent widget reader
        if (widget instanceof ccui.Button)
        {
            readerName = "ButtonReader";
        }
        else if (widget instanceof ccui.CheckBox)
        {
            readerName = "CheckBoxReader";
        }
        else if (widget instanceof ccui.ImageView)
        {
            readerName = "ImageViewReader";
        }
        else if (widget instanceof ccui.TextAtlas)
        {
            readerName = "TextAtlasReader";
        }
        else if (widget instanceof ccui.TextBMFont)
        {
            readerName = "TextBMFontReader";
        }
        else if (widget instanceof ccui.Text)
        {
            readerName = "TextReader";
        }
        else if (widget instanceof ccui.LoadingBar)
        {
            readerName = "LoadingBarReader";
        }
        else if (widget instanceof ccui.Slider)
        {
            readerName = "SliderReader";
        }
        else if (widget instanceof ccui.TextField)
        {
            readerName = "TextFieldReader";
        }
        else if (widget instanceof ccui.ListView)
        {
            readerName = "ListViewReader";
        }
        else if (widget instanceof ccui.PageView)
        {
            readerName = "PageViewReader";
        }
        else if (widget instanceof ccui.ScrollView)
        {
            readerName = "ScrollViewReader";
        }
    
        else if (widget instanceof ccui.Layout)
        {
            readerName = "LayoutReader";
        }
        else if (widget instanceof ccui.Widget)
        {
            readerName = "WidgetReader";
        }
    
        return readerName;
    }

};
ccs.csLoader.init();
