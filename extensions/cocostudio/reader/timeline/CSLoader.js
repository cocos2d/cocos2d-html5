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

var CSLoaderStatic = {
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

ccs.CSLoader = {

    _recordJsonPath: true,
    _jsonPath: "",
    _recordProtocolBuffersPath: true,
    _protocolBuffersPath: "",
    _recordXMLPath: "",
    _xmlPath: "",
    _monoCocos2dxVersion: "",

    init: function(){
        this._funcs = {};
        this._componentFuncs = {};

        this._funcs[CSLoaderStatic.ClassName_Node] = ccs.CSLoader.loadSimpleNode.bind(this);
        this._funcs[CSLoaderStatic.ClassName_SubGraph] = ccs.CSLoader.loadSubGraph.bind(this);
        this._funcs[CSLoaderStatic.ClassName_Sprite] = ccs.CSLoader.loadSprite.bind(this);
        this._funcs[CSLoaderStatic.ClassName_Particle] = ccs.CSLoader.loadParticle.bind(this);
        this._funcs[CSLoaderStatic.ClassName_TMXTiledMap] = ccs.CSLoader.loadTMXTiledMap.bind(this);
        this._funcs[CSLoaderStatic.ClassName_LabelAtlas] = ccs.CSLoader.loadWidget.bind(this);
        this._funcs[CSLoaderStatic.ClassName_LabelBMFont] = ccs.CSLoader.loadWidget.bind(this);
        this._funcs[CSLoaderStatic.ClassName_Panel] = ccs.CSLoader.loadWidget.bind(this);
        this._funcs[CSLoaderStatic.ClassName_Button] = ccs.CSLoader.loadWidget.bind(this);
        this._funcs[CSLoaderStatic.ClassName_CheckBox] = ccs.CSLoader.loadWidget.bind(this);
        this._funcs[CSLoaderStatic.ClassName_ImageView] = ccs.CSLoader.loadWidget.bind(this);
        this._funcs[CSLoaderStatic.ClassName_TextAtlas] = ccs.CSLoader.loadWidget.bind(this);
        this._funcs[CSLoaderStatic.ClassName_TextBMFont] = ccs.CSLoader.loadWidget.bind(this);
        this._funcs[CSLoaderStatic.ClassName_Text] = ccs.CSLoader.loadWidget.bind(this);
        this._funcs[CSLoaderStatic.ClassName_LoadingBar] = ccs.CSLoader.loadWidget.bind(this);
        this._funcs[CSLoaderStatic.ClassName_TextField] = ccs.CSLoader.loadWidget.bind(this);
        this._funcs[CSLoaderStatic.ClassName_Slider] = ccs.CSLoader.loadWidget.bind(this);
        this._funcs[CSLoaderStatic.ClassName_Layout] = ccs.CSLoader.loadWidget.bind(this);
        this._funcs[CSLoaderStatic.ClassName_ScrollView] = ccs.CSLoader.loadWidget.bind(this);
        this._funcs[CSLoaderStatic.ClassName_ListView] = ccs.CSLoader.loadWidget.bind(this);
        this._funcs[CSLoaderStatic.ClassName_PageView] = ccs.CSLoader.loadWidget.bind(this);
        this._funcs[CSLoaderStatic.ClassName_Widget] = ccs.CSLoader.loadWidget.bind(this);
        this._funcs[CSLoaderStatic.ClassName_Label] = ccs.CSLoader.loadWidget.bind(this);

        this._componentFuncs[CSLoaderStatic.ClassName_ComAudio] =  ccs.CSLoader.loadComAudio.bind(this);

    },

    createNode: function(filename){
        var path = filename;
        var pos = path.lastIndexOf('.');
        var suffix = path.substr(pos + 1, path.length);
        cc.log("suffix = %s", suffix);

        var load = ccs.CSLoader;

        if (suffix == "csb")
        {
            return load.createNodeFromProtocolBuffers(filename);
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
        cc.log("suffix = %s", suffix);

        var cache = ccs.ActionTimelineCache;

        if (suffix == "csb")
        {
            return cache.createActionFromProtocolBuffers(filename);
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
    loadNodeWithFile: function(filename){
        // Read content from file
        var contentStr = FileUtils.getInstance().getStringFromFile(fileName);

        var node = this.loadNodeWithContent(contentStr);

        // Load animation data from file
        ccs.ActionTimelineCache.getInstance().loadAnimationActionWithContent(fileName, contentStr);

        return node;
    },
    loadNodeWithContent: function(filename){
        var doc;
        doc.Parse(content);
        if (doc.HasParseError())
        {
            cc.log("GetParseError %s\n", doc.GetParseError());
        }

        // cocos2dx version mono editor is based on
        this._monoCocos2dxVersion = doc[CSLoaderStatic.MONO_COCOS2D_VERSION] || "";

        // decode plist
        var length = doc[CSLoaderStatic.TEXTURES];

        for(var i=0; i<length; i++)
        {
            var plist = doc[CSLoaderStatic.TEXTURES][i];
            var png   = doc[CSLoaderStatic.TEXTURES_PNG][i];
            plist = this._jsonPath + plist;
            png   = this._jsonPath + png;
            cc.SpriteFrameCache.addSpriteFramesWithFile(plist, png);
        }

        // decode node tree
        var subJson = doc[CSLoaderStatic.NODE];
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

    createNodeFromProtocolBuffers: function(filename){
        if(this._recordProtocolBuffersPath)
        {
            var protocolBuffersPath = filename.substr(0, filename.lastIndexOf('/') + 1);
            cc.log("protocolBuffersPath = %s", protocolBuffersPath);
            ccs.uiReader.setFilePath(protocolBuffersPath);
    
            this._protocolBuffersPath = protocolBuffersPath;
        }
        else
        {
            ccs.uiReader.setFilePath("");
            this._protocolBuffersPath = "";
        }

        return this.nodeFromProtocolBuffersFile(filename);
    },
    nodeFromProtocolBuffersFile: function(fileName){
        var path = fileName;
        var pos = path.lastIndexOf('/');
        //    _protocolBuffersPath = path.substr(0, pos + 1);
    
        var binary = cc.loader.getRes(fileName);
//        var gpbwp;//protobufReader
        //    protocolbuffers.GUIProtocolBuffersProtobuf gpbwp;
//        if (!gpbwp.ParseFromArray(content.getBytes(), content.getSize()))
//        {
//            return null;
//        }
        var buffer = PBP.CSParseBinary.decode(binary);
        /*
         cc.log("dataScale = %d", gpbwp.datascale());
         cc.log("designHeight = %d", gpbwp.designheight());
         cc.log("designWidth = %d", gpbwp.designwidth());
         cc.log("version = %s", gpbwp.version().c_str());
         */
    
        // decode plist
        var textureSize = buffer.textures.length;
        cc.log("textureSize = %d", textureSize);
        for (var i = 0; i < textureSize; ++i)
        {
            var plist = buffer.textures[i];
            cc.log("plist = %s", plist);
            var png = buffer.texturesPng[i];
            cc.log("png = %s", png);
            plist = this._protocolBuffersPath + plist;
            png = this._protocolBuffersPath + png;
            cc.spriteFrameCache.addSpriteFrames(plist, png);
        }
        var fileDesignWidth = buffer.designWidth;
        var fileDesignHeight = buffer.designHeight;
        if (fileDesignWidth <= 0 || fileDesignHeight <= 0)
        {
            cc.log("Read design size error!\n");
            var winSize = cc.director.getWinSize();
            ccs.uiReader.storeFileDesignSize(fileName, winSize);
        }
        else
        {
            ccs.uiReader.storeFileDesignSize(fileName, cc.size(fileDesignWidth, fileDesignHeight));
        }

        var node = this.nodeFromProtocolBuffers(buffer.nodeTree);
    
        return node;
    },
    nodeFromProtocolBuffers: function(nodetree){
        var node = null;
    
        var classname = nodetree.classname;
        cc.log("classname = %s", classname);
    
        var curOptions;
    
        if (classname == "Node")
        {
            node = ccs.Node.create();
            var options = nodetree.widgetOptions;
            this.setPropsForNodeFromProtocolBuffers(node, options);
    
            curOptions = options;
        }
        else if (classname == "SingleNode")
        {
            node = ccs.Node.create();
            var options = nodetree.widgetOptions;
            this.setPropsForSingleNodeFromProtocolBuffers(node, options);
    
            curOptions = options;
        }
        else if (classname == "Sprite")
        {
            node = cc.Sprite.create();
            var nodeOptions = nodetree.widgetOptions;
            var options = nodetree.spriteOptions;
            this.setPropsForSpriteFromProtocolBuffers(node, options, nodeOptions);
    
            curOptions = nodeOptions;
        }
        else if (classname == "ProjectNode")
        {
            var nodeOptions = nodetree.widgetOptions;
            var options = nodetree.projectNodeOptions;
    
            var filePath = options.filename();
            cc.log("filePath = %s", filePath);
    		if(filePath != "")
    		{
                node = this.createNodeFromProtocolBuffers(this._protocolBuffersPath + filePath);
                this.setPropsForProjectNodeFromProtocolBuffers(node, options, nodeOptions);
    
                var action = ccs.ActionTimelineCache.createActionFromProtocolBuffers(this._protocolBuffersPath + filePath);
                if(action)
                {
                    node.runAction(action);
                    action.gotoFrameAndPlay(0);
                }
    		}
    
            curOptions = nodeOptions;
        }
        else if (classname == "Particle")
        {
            var nodeOptions = nodetree.widgetOptions;
            var options = nodetree.particleSystemOptions;
    		node = this.createParticleFromProtocolBuffers(options, nodeOptions);
    
            curOptions = nodeOptions;
        }
        else if (classname == "GameMap")
        {
            var nodeOptions = nodetree.widgetOptions;
            var options = nodetree.tmxTiledMapOptions;
    		node = this.createTMXTiledMapFromProtocolBuffers(options, nodeOptions);
    
            curOptions = nodeOptions;
        }
    	else if (classname == "SimpleAudio")
    	{
            node = Node.create();
            var options = nodetree.widgetOptions;
            this.setPropsForSimpleAudioFromProtocolBuffers(node, options);
    
    		curOptions = options;
    	}
        else if (isWidget(classname))
        {
            var guiClassName = this.getGUIClassName(classname);
            var readerName = guiClassName;
            readerName.append("Reader");
    
            var widget = cc.objectFactory.createObject(guiClassName);
    
            var reader = ccs.objectFactory.createObject(readerName);
            reader.setPropsFromProtocolBuffers(widget, nodetree);
    
            var widgetOptions = nodetree.widgetOptions;
            var actionTag = widgetOptions.actionTag;
            widget.setUserObject(ccs.ActionTimelineData.create(actionTag));
    
            node = widget;
        }
        else if (this.isCustomWidget(classname))
        {
            var widget = ccs.objectFactory.createObject(classname);
    
            //
            // 1st., custom widget parse properties of parent widget with parent widget reader
            var readerName = this.getWidgetReaderClassName(widget);
            var reader = ccs.objectFactory.createObject(readerName);
            if (reader && widget)
            {
                var widgetPropertiesReader = new ccs.WidgetPropertiesReader0300();
                widgetPropertiesReader.setPropsForAllWidgetFromProtocolBuffers(reader, widget, nodetree);
    
                // 2nd., custom widget parse with custom reader
                var widgetOptions = nodetree.widgetOptions;
                var customJsonDict = widgetOptions.customProperty;
//                var customJsonDict;
//                customJsonDict.ParsecustomProperty;
//                if (customJsonDict.HasParseError())
//                {
//                    cc.log("GetParseError %s\n", customJsonDict.GetParseError());
//                }
    
                widgetPropertiesReader.setPropsForAllCustomWidgetFromJsonDictionary(classname, widget, customJsonDict);
            }
            else
            {
                cc.log("Widget or WidgetReader doesn't exists!!!  Please check your protocol buffers file.");
            }
            //
    
            var widgetOptions = nodetree.widgetOptions;
            var actionTag = widgetOptions.actionTag;
            widget.setUserObject(ccs.ActionTimelineData.create(actionTag));
    
            node = widget;
        }
    
        // component
        var componentSize = curOptions.componentOptions.length;
        for (var i = 0; i < componentSize; ++i)
        {
    
            var componentOptions = curOptions.componentOptions[i];
            var component = this.createComponentFromProtocolBuffers(componentOptions);
    
            if (component)
            {
                node.addComponent(component);
            }
        }
    
        var size = nodetree.children.length;
        cc.log("size = %d", size);
        for (var i = 0; i < size; ++i)
        {
            var subNodeTree = nodetree.children[i];
            var child = this.nodeFromProtocolBuffers(subNodeTree);
            cc.log("child = %p", child);
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
                    node.addChild(child);
                }
            }
        }
    
        return node;

},

    setRecordProtocolBuffersPath: function(record){
        this._recordProtocolBuffersPath = record;
    },
    isRecordProtocolBuffersPath: function(){
        return this._recordProtocolBuffersPath;
    },

    setProtocolBuffersPath: function(protocolBuffersPath){
        this._protocolBuffersPath = protocolBuffersPath;
    },
    getProtocolBuffersPath: function(){
        return this._protocolBuffersPath;
    },

    createNodeFromXML: function(filename){
        if(this._recordXMLPath)
        {
            var xmlPath = filename.substr(0, filename.lastIndexOf('/') + 1);
            cc.log("xmlPath = %s", xmlPath);
            ccs.uiReader.setFilePath(xmlPath);

            this._xmlPath = xmlPath;
        }
        else
        {
            ccs.uiReader.setFilePath("");
            this._xmlPath = "";
        }

        var node = this.nodeFromXMLFile(filename);

        return node;
    },
    nodeFromXMLFile: function(filename){
        var node = null;
    
        // xml read
        var fullpath = FileUtils.getInstance().fullPathForFilename(fileName)();
        var size;
        var content = FileUtils.getInstance().getFileData(fullpath, "r", size);
    
        // xml parse
        var document = new tinyxml2.XMLDocument();
        document.Parse(content());
    
        var rootElement = document.RootElement();// Root
        cc.log("rootElement name = %s", rootElement.Name());
    
    
        var element = rootElement.FirstChildElement();
    
        var createEnabled = false;
        var rootType = "";
    
        while (element)
        {
            cc.log("entity name = %s", element.Name());
    
            if ("Content" != element.Name())
            {
                var attribute = element.FirstAttribute();
    
                if (!attribute)
                {
                    createEnabled = true;
                    rootType = "NodeObjectData";
                }
                //
    
                //
                //            while (attribute)
                //            {
                //                var name = attribute.Name();
                //                var value = attribute.Value();
                //                cc.log("attribute name = %s, value = %s", name, value);
                //                if (name == "")
                //                {
                //                    serializeEnabled = true;
                //                    rootType = (strcmp("", value) == 0) ? "Node" : value;
                //                }
                //
                //                if (serializeEnabled)
                //                {
                //                    break;
                //                }
                //
                //                attribute = attribute.Next();
                //            }
                //
            }
    
            if (createEnabled)
            {
                break;
            }
    
            var child = element.FirstChildElement();
            if (child)
            {
                element = child;
            }
            else
            {
                element = element.NextSiblingElement();
            }
        }
    
    
        // create
        if (createEnabled)
        {
            var protobuf;//protobuf reader
    
            var child = element.FirstChildElement();
    
            while (child)
            {
                var name = child.Name();
    
                if (name == "ObjectData") // nodeTree
                {
                    var objectData = child;
                    node = this.nodeFromXML(objectData, rootType);
                }
    
                child = child.NextSiblingElement();
            }
        }
    
        return node;
    },
    nodeFromXML: function(objectData, classType){
        var node = null;
    
        var classname = classType.substr(0, classType.indexOf("ObjectData"));
        cc.log("classname = %s", classname);
    
        if (classname == "Node")
        {
            node = cc.Node.create();
            this.setPropsForNodeFromXML(node, objectData);
        }
        else if (classname == "SingleNode")
        {
            node = cc.Node.create();
            this.setPropsForSingleNodeFromXML(node, objectData);
        }
        else if (classname == "Sprite")
        {
            node = cc.Sprite.create();
            this.setPropsForSpriteFromXML(node, objectData);
        }
        else if (classname == "GameMap")
        {
            node = this.createTMXTiledMapFromXML(objectData);
        }
        else if (classname == "Particle")
        {
            node = this.createParticleFromXML(objectData);
        }
        else if (classname == "ProjectNode")
        {
            // FileData
            var child = objectData.FirstChildElement();
            while (child)
            {
                var name = child.Name();
    
                if (name == "FileData")
                {
                    var attribute = child.FirstAttribute();
    
                    while (attribute)
                    {
                        var name = attribute.Name();
                        var value = attribute.Value();
    
                        if (name == "Path")
                        {
                            node = createNodeFromXML(_xmlPath + value);
                            this.setPropsForProjectNodeFromXML(node, objectData);
    
                            var action = ccs.actionTimelineCache.createActionFromXML(this._xmlPath + value);
                            if(action)
                            {
                                node.runAction(action);
                                action.gotoFrameAndPlay(0);
                            }
    
                            break;
                        }
    
                        attribute = attribute.Next();
                    }
    
                    break;
                }
    
                child = child.NextSiblingElement();
            }
        }
        else if (classname == "SimpleAudio")
        {
            // process as component options
            node = ccs.Node.create();
            this.setPropsForSimpleAudioFromXML(node, objectData);
    
            var component = this.createComponentFromXML(objectData, "ComAudio");
    
            if (component)
            {
                node.addComponent(component);
            }
        }
        else if (this.isWidget(classname))
        {
            var guiClassName = this.getGUIClassName(classname);
            var readerName = guiClassName;
            readerName.append("Reader");

            var widget = cc.objectFactory.createObject(guiClassName);

            var reader = ccs.objectFactory.createObject(readerName);
            reader.setPropsFromXML(widget, objectData);
    
            node = widget;
        }
    
    
        // children
        var containChildrenElement = false;
        objectData = objectData.FirstChildElement();
    
        while (objectData)
        {
            cc.log("objectData name = %s", objectData.Name());
    
            if ("Children" != objectData.Name())
            {
                containChildrenElement = true;
                break;
            }
    
            objectData = objectData.NextSiblingElement();
        }
    
        if (containChildrenElement)
        {
            objectData = objectData.FirstChildElement();
            cc.log("element name = %s", objectData.Name());
    
            while (objectData)
            {
                var attribute = objectData.FirstAttribute();
                var bHasType = false;
    
                while (attribute)
                {
                    var name = attribute.Name();
                    var value = attribute.Value();
    
                    if (name == "ctype")
                    {
                        bHasType = true;
                        var child = this.nodeFromXML(objectData, value);
                        cc.log("child = %p", child);
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
                                node.addChild(child);
                            }
                        }
    
                        break;
                    }
    
                    attribute = attribute.Next();
                }
    
                if (!bHasType)
                {
                    var child = this.nodeFromXML(objectData, "NodeObjectData");
                    cc.log("child = %p", child);
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
                            node.addChild(child);
                        }
                    }
                }
    
                objectData = objectData.NextSiblingElement();
            }
        }
        //
    
        return node;
    },

    setRecordXMLPath: function(record){
        this._recordXMLPath =- record;
    },
    isRecordXMLPath: function(){
        return this._recordXMLPath;
    },

    setXMLPath: function(xmlPath){
        this._xmlPath = xmlPath;
    },
    getXMLPath: function(){
        return this._xmlPath;
    },


    //protected
    loadNode: function(json){
        var node = null;
        var nodeType = json[CSLoaderStatic.CLASSNAME];

        var func = this._funcs[nodeType];
        if (func != null)
        {
            var options = json[CSLoaderStatic.OPTIONS];
            node = func(options);

            // component
            if (node)
            {
                var components = options[CSLoaderStatic.COMPONENTS];
                var componentSize = options[CSLoaderStatic.COMPONENTS] || 0;
                for (var i = 0; i < componentSize; ++i)
                {
                    var dic = components[CSLoaderStatic.COMPONENTS][i];
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
            var length = json[CHILDREN] || 0;
            for (var i = 0; i<length; i++)
            {
                var dic = json[CSLoaderStatic.CHILDREN][i];
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
                                if (widget.getPositionType() == ccui.Widget.PositionType.PERCENT)
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
        var width         = json[CSLoaderStatic.WIDTH];
        var height        = json[CSLoaderStatic.HEIGHT];
        var x             = json[CSLoaderStatic.X];
        var y             = json[CSLoaderStatic.Y];
        var scalex        = json[CSLoaderStatic.SCALE_X] || 1;
        var scaley        = json[CSLoaderStatic.SCALE_Y] || 1;
        var rotation      = json[CSLoaderStatic.ROTATION]
        var rotationSkewX = json[CSLoaderStatic.ROTATION_SKEW_X];
        var rotationSkewY = json[CSLoaderStatic.ROTATION_SKEW_Y];
        var skewx         = json[CSLoaderStatic.SKEW_X];
        var skewy         = json[CSLoaderStatic.SKEW_Y];
        var anchorx       = json[CSLoaderStatic.ANCHOR_X] || 0.5;
        var anchory       = json[CSLoaderStatic.ANCHOR_Y] || 0.5;
        var alpha       = json[CSLoaderStatic.ALPHA] || 255;
        var red         = json[CSLoaderStatic.RED] || 255;
        var green       = json[CSLoaderStatic.GREEN] || 255;
        var blue        = json[CSLoaderStatic.BLUE] || 255;
        var zorder		    = json[CSLoaderStatic.ZORDER];
        var tag             = json[CSLoaderStatic.TAG];
        var actionTag       = json[CSLoaderStatic.ACTION_TAG];
        var visible        = json[CSLoaderStatic.VISIBLE];
    
        if(x != 0 || y != 0)
            node.setPosition(Point(x, y));
        if(scalex != 1)
            node.setScaleX(scalex);
        if(scaley != 1)
            node.setScaleY(scaley);
        if (rotation != 0)
            node.setRotation(rotation);
        if(rotationSkewX != 0)
            node.setRotationSkewX(rotationSkewX);
        if(rotationSkewY != 0)
            node.setRotationSkewY(rotationSkewY);
        if(skewx != 0)
            node.setSkewX(skewx);
        if(skewy != 0)
            node.setSkewY(skewy);
        if(anchorx != 0.5 || anchory != 0.5)
            node.setAnchorPoint(Point(anchorx, anchory));
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
        node.setUserObject(cc.ActionTimelineData.create(actionTag));
    },

    // load nodes
    loadSimpleNode: function(json){
        var node = ccs.Node.create();

        this.initNode(node, json);

        return node;
    },
    loadSubGraph: function(json){
        var filePath = json[CSLoaderStatic.FILE_PATH];

        var node = null;
        if (filePath && "" != filePath)
        {
            node = this.createNode(filePath);
        }
        else
        {
            node = ccs.Node.create();
        }

        this.initNode(node, json);

        return node;
    },
    loadSprite: function(json){
        var filePath = json[CSLoaderStatic.FILE_PATH];
        var sprite = null;

        if(filePath != null)
        {
            var path = filePath;

            var spriteFrame = cc.SpriteFrameCache.getSpriteFrameByName(path);
            if(!spriteFrame)
            {
                path = this._jsonPath + path;
                sprite = ccs.Sprite.create(path);
            }
            else
            {
                sprite = ccs.Sprite.createWithSpriteFrame(spriteFrame);
            }

            if(!sprite)
            {
                sprite = cc.Sprite.create();
                cc.log("filePath is empty. Create a sprite with no texture");
            }
        }
        else
        {
            sprite = ccs.Sprite.create();
        }

        this.initNode(sprite, json);

        var flipX          = json[CSLoaderStatic.FLIPX];
        var flipY          = json[CSLoaderStatic.FLIPY];

        if(flipX != false)
            sprite.setFlippedX(flipX);
        if(flipY != false)
            sprite.setFlippedY(flipY);

        return sprite;
    },
    loadParticle: function(json){
        var filePath = json[CSLoaderStatic.PLIST_FILE];
        var num = json[CSLoaderStatic.PARTICLE_NUM];
    
        var particle = cc.ParticleSystemQuad.create(filePath);
        particle.setTotalParticles(num);
    
        this.initNode(particle, json);
    
        return particle;
    },
    loadTMXTiledMap: function(json){
        var tmxFile = json[CSLoaderStatic.TMX_FILE];
        var tmxString = json[CSLoaderStatic.TMX_STRING];
        var resourcePath = json[CSLoaderStatic.RESOURCE_PATH];
    
        var tmx = null;
    
        if (tmxFile && "" != tmxFile)
        {
            tmx = cc.TMXTiledMap.create(tmxFile);
        }
        else if ((tmxString && "" != tmxString)
                 && (resourcePath && "" != resourcePath))
        {
            tmx = cc.TMXTiledMap.createWithXML(tmxString, resourcePath);
        }
    
        return tmx;
    },

    // load gui
    loadWidget: function(json){
        var str = json[CSLoaderStatic.CLASSNAME];
        if(str == null)
            return null;
    
        var classname = str;
    
        var widgetPropertiesReader = new ccs.WidgetPropertiesReader0300();
        var widget = null;
    
        if (this.isWidget(classname))
        {
            var readerName = this.getGUIClassName(classname);
            readerName.append("Reader");
    
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
                var customProperty = json["customProperty"];
                var customJsonDict;
                customJsonDict.Parse(customProperty);
                if (customJsonDict.HasParseError())
                {
                    cc.log("GetParseError %s\n", customJsonDict.GetParseError());
                }
    
                widgetPropertiesReader.setPropsForAllCustomWidgetFromJsonDictionary(classname, widget, customJsonDict);
            }
            else
            {
                cc.log("Widget or WidgetReader doesn't exists!!!  Please check your protocol buffers file.");
            }
        }
    
        if (widget)
        {
            var rotationSkewX = json[CSLoaderStatic.ROTATION_SKEW_X];
            var rotationSkewY = json[CSLoaderStatic.ROTATION_SKEW_Y];
            var skewx         = json[CSLoaderStatic.SKEW_X];
            var skewy         = json[CSLoaderStatic.SKEW_Y];
            if(rotationSkewX != 0)
                widget.setRotationSkewX(rotationSkewX);
            if(rotationSkewY != 0)
                widget.setRotationSkewY(rotationSkewY);
            if(skewx != 0)
                widget.setSkewX(skewx);
            if(skewy != 0)
                widget.setSkewY(skewy);
    
            var actionTag = json[CSLoaderStatic.ACTION_TAG];
            widget.setUserObject(ccs.ActionTimelineData.create(actionTag));
        }
    
        return widget;

},

    // load component
    loadComponent: function(json){
        var component = null;
    
        var componentType = json[CSLoaderStatic.COMPONENT_TYPE];
    
        var func = this._componentFuncs[componentType];
    
        if (func != null)
        {
            component = func(json);
        }
    
        return component;
    },
    loadComAudio: function(json){
        var audio = ccs.ComAudio.create();
    
        var name = json[CSLoaderStatic.COMPONENT_NAME];
        var enabled = json[CSLoaderStatic.COMPONENT_ENABLED];
    
        audio.setName(name);
        audio.setEnabled(enabled);
    
        var filePath = json[CSLoaderStatic.COMPONENT_AUDIO_FILE_PATH];
        var loop = json[CSLoaderStatic.COMPONENT_LOOP];
    
        audio.setFile(filePath);
        audio.setLoop(loop);
    
        return audio;
    },

    setPropsForNodeFromProtocolBuffers: function(node, nodeOptions){
        var options = nodeOptions;
    
        var name          = options.name;
        var x             = options.x;
        var y             = options.y;
        var scalex        = options.scaleX;
        var scaley        = options.scaleY;
        var rotation      = options.rotation;
        var rotationSkewX = options.rotationSkewX !==null ? options.rotationSkewX : 0;
        var rotationSkewY = options.rotationSkewY !==null ? options.rotationSkewY : 0;
        var anchorx       = options.anchorPointX  !==null ? options.anchorPointX  : 0.5;
        var anchory       = options.anchorPointY  !==null ? options.anchorPointY  : 0.5;
        var zorder		  = options.zorder;
        var tag           = options.tag;
        var actionTag     = options.actionTag;
        var visible       = options.visible;
    
        node.setName(name);
    
        if(x != 0 || y != 0)
            node.setPosition(cc.p(x, y));
        if(scalex != 1)
            node.setScaleX(scalex);
        if(scaley != 1)
            node.setScaleY(scaley);
        if (rotation != 0)
            node.setRotation(rotation);
        if (rotationSkewX != 0)
            node.setRotationSkewX(rotationSkewX);
        if (rotationSkewY != 0)
            node.setRotationSkewY(rotationSkewY);
        if(anchorx != 0.5 || anchory != 0.5)
            node.setAnchorPoint(cc.p(anchorx, anchory));
        if(zorder != 0)
            node.setLocalZOrder(zorder);
        if(visible != true)
            node.setVisible(visible);
    
        node.setTag(tag);
        node.setUserObject(ccs.ActionTimelineData.create(actionTag));
    
        node.setCascadeColorEnabled(true);
        node.setCascadeOpacityEnabled(true);
    },
    setPropsForSingleNodeFromProtocolBuffers: function(node, nodeOptions){
        this.setPropsForNodeFromProtocolBuffers(node, nodeOptions);
    },
    setPropsForSpriteFromProtocolBuffers: function(node, spriteOptions, nodeOptions){
        var sprite = node;
        var options = spriteOptions;
    
        var fileNameData = options.fileNameData;
        var resourceType = fileNameData.resourceType;
        switch (resourceType)
        {
            case 0:
            {
                var path = this._protocolBuffersPath + fileNameData.path();
    			if (path != "")
    			{
    				sprite.setTexture(path);
    			}
                break;
            }
    
            case 1:
            {
    			cc.spriteFrameCache.addSpriteFrames(this._protocolBuffersPath + fileNameData.plistFile);
                var path = fileNameData.path;
    			if (path != "")
    			{
    				sprite.setSpriteFrame(path);
    			}
                break;
            }
    
            default:
                break;
        }
    
        /*
         const char* filePath = options.filename()();
         cc.log("filePath = %s", filePath);
         Sprite *sprite = static_cast<Sprite*>(node);
         
         if(filePath != nullptr && strcmp(filePath, "") != 0)
         {
         var path = filePath;
         
         SpriteFrame* spriteFrame = SpriteFrameCache.getInstance().getSpriteFrameByName(path);
         if(!spriteFrame)
         {
         path = _protocolBuffersPath + path;
         sprite.setTexture(path);
         }
         else
         {
         sprite.setSpriteFrame(spriteFrame);
         }
         }
         else
         {
         cc.log("filePath is empty. Create a sprite with no texture");
         }
         */
    
        this.setPropsForNodeFromProtocolBuffers(sprite, nodeOptions);
    
        var alpha       = nodeOptions.Alpha !==null ? nodeOptions.Alpha  : 255;
        var red         = nodeOptions.colorR!==null ? nodeOptions.colorR : 255;
        var green       = nodeOptions.colorG!==null ? nodeOptions.colorG : 255;
        var blue        = nodeOptions.colorB!==null ? nodeOptions.colorB : 255;

        if (alpha != 255)
        {
            sprite.setOpacity(alpha);
        }
        if (red != 255 || green != 255 || blue != 255)
        {
            sprite.setColor(cc.color(red, green, blue));
        }
    
    	var flipX   = spriteOptions.flippedX;
        var flipY   = spriteOptions.flippedY;
    
        if(flipX)
            sprite.setFlippedX(flipX);
        if(flipY)
            sprite.setFlippedY(flipY);
    },
    createParticleFromProtocolBuffers: function(particleSystemOptions, nodeOptions){
    	var node = null;
    
    	var options = particleSystemOptions;
    
        /*
        const std.string& filePath = options.plistfile();
        var num = options.totalparticles();
         */
    
        var fileNameData = options.fileNameData;
        var resourceType = fileNameData.resourceType;
        switch (resourceType)
        {
            case 0:
            {
    
                var path = this._protocolBuffersPath + fileNameData.path;
    			if (path != "")
    			{
    				node = cc.ParticleSystemQuad.create(path);
    			}
                break;
            }
    
            default:
                break;
        }
    
    	if (node)
    	{
    		this.setPropsForNodeFromProtocolBuffers(node, nodeOptions);
    	}
    
    	return node;
    },
    createTMXTiledMapFromProtocolBuffers: function(tmxTiledMapOptions, nodeOptions){
    	var node = null;
    	var options = tmxTiledMapOptions;
    
    	var fileNameData = options.fileNameData;
        var resourceType = fileNameData.resourceType;
        switch (resourceType)
        {
            case 0:
            {
                var path = this._protocolBuffersPath + fileNameData.path;
                var tmxFile = path;
    
                if (tmxFile && "" != tmxFile)
                {
                    node = cc.TMXTiledMap.create(tmxFile);
                }
                break;
            }
    
            default:
                break;
        }
    
    	if (node)
    	{
    		this.setPropsForNodeFromProtocolBuffers(node, nodeOptions);
    	}
    
    	return node;
    },
    setPropsForProjectNodeFromProtocolBuffers: function(node, projectNodeOptions, nodeOptions){
        var options = projectNodeOptions;
        this.setPropsForNodeFromProtocolBuffers(node, nodeOptions);
    },
    setPropsForSimpleAudioFromProtocolBuffers: function(node, nodeOptions){
        this.setPropsForNodeFromProtocolBuffers(node, nodeOptions);
    },

    createComponentFromProtocolBuffers: function(componentOptions){
        var component = null;
    
        var componentType = componentOptions.type;
    
        if (componentType == "ComAudio")
        {
            component = ccs.ComAudio.create();
            var options = componentOptions.comAudioOptions;
            this.setPropsForComAudioFromProtocolBuffers(component, options);
        }
    
        return component;
    },
    setPropsForComponentFromProtocolBuffers: function(component, componentOptions){
        var componentType = componentOptions.type;
    
        if (componentType == "ComAudio")
        {
            component = ccs.ComAudio.create();
            var options = componentOptions.comAudioOptions;
            this.setPropsForComAudioFromProtocolBuffers(component, options);
        }
    },
    setPropsForComAudioFromProtocolBuffers: function(component, comAudioOptions){
        var options = comAudioOptions;
        var audio = component;
    
        var fileNameData = options.fileNameData;
        var resourceType = fileNameData.resourceType;
        switch (resourceType)
        {
            case 0:
            {
                var path = this._protocolBuffersPath + fileNameData.path;
                audio.setFile(path);
                break;
            }
    
            default:
                break;
        }
    
        var loop = options.loop;
        audio.setLoop(loop);
    
        audio.setName(options.name);
        audio.setLoop(options.loop);
    },

    setPropsForNodeFromXML: function(node, nodeObjectData){
        node.setCascadeColorEnabled(true);
        node.setCascadeOpacityEnabled(true);
    
        node.setScale(0.0, 0.0);
    
        var name = nodeObjectData.Name();
        cc.log("entity name = %s", name);
    
        // attributes
        var attribute = nodeObjectData.FirstAttribute();
        while (attribute)
        {
            var name = attribute.Name();
            var value = attribute.Value();
    
            if (name == "Name")
            {
                node.setName(value);
            }
            else if (name == "ActionTag")
            {
                //atoi(value)
                node.setUserObject(ccs.ActionTimelineData.create(value));
            }
            else if (name == "RotationSkewX")
            {
                node.setRotationSkewX(atof(value));
            }
            else if (name == "RotationSkewY")
            {
                node.setRotationSkewY(atof(value));
            }
            else if (name == "Rotation")
            {
    //            node.setRotation(atoi(value));
            }
            else if (name == "ZOrder")
            {
                node.setZOrder(atoi(value));
            }
            else if (name == "Visible")
            {
                node.setVisible((value == "True") ? true : false);
            }
            else if (name == "VisibleForFrame")
            {
    //            node.setVisible((value == "True") ? true : false);
            }
            else if (name == "Alpha")
            {
                node.setOpacity(atoi(value));
            }
            else if (name == "Tag")
            {
                node.setTag(atoi(value));
            }
    
            attribute = attribute.Next();
        }
    
        var child = nodeObjectData.FirstChildElement();
        while (child)
        {
            var name = child.Name();
            if (name == "Children")
            {
                break;
            }
            else if (name == "Position")
            {
                var attribute = child.FirstAttribute();
    
                while (attribute)
                {
                    var name = attribute.Name();
                    var value = attribute.Value();
    
                    if (name == "X")
                    {
                        node.setPositionX(atof(value));
                    }
                    else if (name == "Y")
                    {
                        node.setPositionY(atof(value));
                    }
    
                    attribute = attribute.Next();
                }
            }
            else if (name == "Scale")
            {
                var attribute = child.FirstAttribute();
    
                while (attribute)
                {
                    var name = attribute.Name();
                    var value = attribute.Value();
    
                    if (name == "ScaleX")
                    {
                        node.setScaleX(atof(value));
                    }
                    else if (name == "ScaleY")
                    {
                        node.setScaleY(atof(value));
                    }
    
                    attribute = attribute.Next();
                }
            }
            else if (name == "AnchorPoint")
            {
                var attribute = child.FirstAttribute();
    
                var anchorX = 0.0;
                var anchorY = 0.0;
    
                while (attribute)
                {
                    var name = attribute.Name();
                    var value = attribute.Value();
    
                    if (name == "ScaleX")
                    {
                        anchorX = atof(value);
                    }
                    else if (name == "ScaleY")
                    {
                        anchorY = atof(value);
                    }
    
                    attribute = attribute.Next();
                }
    
                node.setAnchorPoint(Vec2(anchorX, anchorY));
            }
            else if (name == "CColor")
            {
                var attribute = child.FirstAttribute();
                var opacity = 255, red = 255, green = 255, blue = 255;
    
                while (attribute)
                {
                    var name = attribute.Name();
                    var value = attribute.Value();
    
                    if (name == "A")
                    {
                        opacity = atoi(value);
                    }
                    else if (name == "R")
                    {
                        red = atoi(value);
                    }
                    else if (name == "G")
                    {
                        green = atoi(value);
                    }
                    else if (name == "B")
                    {
                        blue = atoi(value);
                    }
    
                    attribute = attribute.Next();
                }
    
                node.setOpacity(opacity);
                node.setColor(cc.color(red, green, blue));
            }
            else if (name == "Size")
            {
                var attribute = child.FirstAttribute();
                var width = 0, height = 0;
    
                while (attribute)
                {
                    var name = attribute.Name();
                    var value = attribute.Value();
    
                    if (name == "X")
                    {
                        width = atof(value);
                    }
                    else if (name == "Y")
                    {
                        height = atof(value);
                    }
    
                    attribute = attribute.Next();
                }
    
                node.setContentSize(cc.size(width, height));
            }
    
            child = child.NextSiblingElement();
        }
    },
    setPropsForSingleNodeFromXML: function(node, nodeObjectData){
        this.setPropsForNodeFromXML(node, nodeObjectData);
    },
    setPropsForSpriteFromXML: function(node, spriteObjectData){
        this.setPropsForNodeFromXML(node, spriteObjectData);
    
        var sprite = node;
        var opacity = 255;
    
        // attributes
        var attribute = this.spriteObjectData.FirstAttribute();
        while (attribute)
        {
            var name = attribute.Name();
            var value = attribute.Value();
    
            if (name == "Alpha")
            {
                opacity = atoi(value.c_str());
            }
            else if (name == "FlipX")
            {
                sprite.setFlippedX((value == "True") ? true : false);
            }
            else if (name == "FlipY")
            {
                sprite.setFlippedY((value == "True") ? true : false);
            }
    
            attribute = attribute.Next();
        }
    
    
        // FileData
        var child = spriteObjectData.FirstChildElement();
        while (child)
        {
            var name = child.Name();
    
            if (name == "FileData")
            {
                var attribute = child.FirstAttribute();
                var resourceType = 0;
                var path = "", plistFile = "";
    
                while (attribute)
                {
                    var name = attribute.Name();
                    var value = attribute.Value();
    
                    if (name == "Path")
                    {
                        path = value;
                    }
                    else if (name == "Type")
                    {
                        resourceType = (value == "Normal" || value == "Default" || value == "MarkedSubImage") ? 0 : 1;
                    }
                    else if (name == "Plist")
                    {
                        plistFile = value;
                    }
    
                    attribute = attribute.Next();
                }
    
                switch (resourceType)
                {
                    case 0:
                    {
                        if (path != "")
                        {
                            sprite.setTexture(this._xmlPath + path);
                        }
                        break;
                    }
    
                    case 1:
                    {
                        cc.SpriteFrameCache.addSpriteFramesWithFile(this._xmlPath + plistFile);
                        if (path != "")
                        {
                            sprite.setSpriteFrame(path);
                        }
                        break;
                    }
    
                    default:
                        break;
                }
            }
    
            child = child.NextSiblingElement();
        }
    
        sprite.setOpacity(opacity);
    },
    createParticleFromXML: function(particleObjectData){
    	var node = null;
    
        // child elements
        var child = particleObjectData.FirstChildElement();
        while (child)
        {
            var name = child.Name();
    
            if (name == "FileData")
            {
                var attribute = child.FirstAttribute();
                var resourceType = 0;
                var path = "", plistFile = "";
    
                while (attribute)
                {
                    var name = attribute.Name();
                    var value = attribute.Value();
    
                    if (name == "Path")
                    {
                        path = value;
                    }
                    else if (name == "Type")
                    {
                        resourceType = (value == "Normal" || value == "Default" || value == "MarkedSubImage") ? 0 : 1;
                    }
                    else if (name == "Plist")
                    {
                        plistFile = value;
                    }
    
                    attribute = attribute.Next();
                }
    
                switch (resourceType)
                {
                    case 0:
                    {
                        if (path != "")
                        {
                            node = cc.ParticleSystemQuad.create(this._xmlPath + path);
                        }
                        break;
                    }
    
                    default:
                        break;
                }
            }
    
            child = child.NextSiblingElement();
        }
    
    	if (node)
    	{
            this.setPropsForNodeFromXML(node, particleObjectData);
    	}
    
    	return node;
    },
    createTMXTiledMapFromXML: function(tmxTiledMapObjectData){
    	var node = null;
    
        // child elements
        var child = tmxTiledMapObjectData.FirstChildElement();
        while (child)
        {
            var name = child.Name();
    
            if (name == "FileData")
            {
                var attribute = child.FirstAttribute();
                var resourceType = 0;
                var path = "", plistFile = "";
    
                while (attribute)
                {
                    var name = attribute.Name();
                    var value = attribute.Value();
    
                    if (name == "Path")
                    {
                        path = value;
                    }
                    else if (name == "Type")
                    {
                        resourceType = (value == "Normal" || value == "Default" || value == "MarkedSubImage") ? 0 : 1;
                    }
                    else if (name == "Plist")
                    {
                        plistFile = value;
                    }
    
                    attribute = attribute.Next();
                }
    
                switch (resourceType)
                {
                    case 0:
                    {
    					var tmxFile_str = this._xmlPath + path;
                        var tmxFile = tmxFile_str;
    
                        if (tmxFile && "" != tmxFile)
                        {
                            node = cc.TMXTiledMap.create(tmxFile);
                        }
                        break;
                    }
    
                    default:
                        break;
                }
            }
    
            child = child.NextSiblingElement();
        }
    
    
    	if (node)
    	{
            this.setPropsForNodeFromXML(node, tmxTiledMapObjectData);
    	}
    
    	return node;
    },
    setPropsForProjectNodeFromXML: function(node, projectNodeObjectData){
        this.setPropsForNodeFromXML(node, projectNodeObjectData);
    },
    setPropsForSimpleAudioFromXML: function(node, simpleAudioObjectData){
        this.setPropsForNodeFromXML(node, simpleAudioObjectData);
    },

    createComponentFromXML: function(componentObjectData, componentType){
        var component = null;
    
        if (componentType == "ComAudio")
        {
            component = ccs.ComAudio.create();
            this.setPropsForComAudioFromXML(component, componentObjectData);
        }
    
        return component;
    },
    setPropsForComponentFromXML: function(component, componentObjectData){},
    setPropsForComAudioFromXML: function(component, comAudioObjectData){
        var audio = component;
    
        audio.setEnabled(true);
    
        var attribute = comAudioObjectData.FirstAttribute();
        while (attribute)
        {
            var name = attribute.Name();
            var value = attribute.Value();
    
            if (name == "Loop")
            {
                audio.setLoop((value == "True") ? true : false);
            }
            else if (name == "Name")
            {
                audio.setName(value);
            }
    
            attribute = attribute.Next();
        }
    
        // FileData
        var child = comAudioObjectData.FirstChildElement();
        while (child)
        {
            var name = child.Name();
    
            if (name == "FileData")
            {
                var attribute = child.FirstAttribute();
                var resourceType = 0;
                var path = "", plistFile = "";
    
                while (attribute)
                {
                    var name = attribute.Name();
                    var value = attribute.Value();
    
                    if (name == "Path")
                    {
                        path = value;
                    }
                    else if (name == "Type")
                    {
                        resourceType = (value == "Normal" || value == "Default" || value == "MarkedSubImage") ? 0 : 1;
                    }
                    else if (name == "Plist")
                    {
                        plistFile = value;
                    }
    
                    attribute = attribute.Next();
                }
    
                switch (resourceType)
                {
                    case 0:
                    {
                        audio.setFile((this._xmlPath + path));
                        break;
                    }
    
                    default:
                        break;
                }
            }
    
            child = child.NextSiblingElement();
        }
    },

    isWidget: function(type){
        return (type == CSLoaderStatic.ClassName_Panel
                || type == CSLoaderStatic.ClassName_Button
                || type == CSLoaderStatic.ClassName_CheckBox
                || type == CSLoaderStatic.ClassName_ImageView
                || type == CSLoaderStatic.ClassName_TextAtlas
                || type == CSLoaderStatic.ClassName_LabelAtlas
                || type == CSLoaderStatic.ClassName_LabelBMFont
                || type == CSLoaderStatic.ClassName_TextBMFont
                || type == CSLoaderStatic.ClassName_Text
                || type == CSLoaderStatic.ClassName_LoadingBar
                || type == CSLoaderStatic.ClassName_TextField
                || type == CSLoaderStatic.ClassName_Slider
                || type == CSLoaderStatic.ClassName_Layout
                || type == CSLoaderStatic.ClassName_ScrollView
                || type == CSLoaderStatic.ClassName_ListView
                || type == CSLoaderStatic.ClassName_PageView
                || type == CSLoaderStatic.ClassName_Widget
                || type == CSLoaderStatic.ClassName_Label);
    
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

    /*
    typedef std.function<cocos2d.Node*(const rapidjson.Value& json)> NodeCreateFunc;
    typedef std.pair<std.string, NodeCreateFunc> Pair;

    std.unordered_map<std.string, NodeCreateFunc> _funcs;

    typedef std.function<cocos2d.Component*(const rapidjson.Value& json)> ComponentCreateFunc;
    typedef std.pair<std.string, ComponentCreateFunc> ComponentPair;

    std.unordered_map<std.string, ComponentCreateFunc> _componentFuncs;
     */



};