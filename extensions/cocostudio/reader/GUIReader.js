/****************************************************************************
 Copyright (c) 2011-2012 cocos2d-x.org
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

(function(){
    var factoryCreate = ccs.objectFactory;

    factoryCreate.registerType({_className:"ButtonReader", _fun: ccs.buttonReader});
    factoryCreate.registerType({_className: "CheckBoxReader", _fun: ccs.checkBoxReader});
    factoryCreate.registerType({_className: "SliderReader", _fun: ccs.sliderReader});
    factoryCreate.registerType({_className: "ImageViewReader", _fun: ccs.imageViewReader});
    factoryCreate.registerType({_className: "LoadingBarReader", _fun: ccs.loadingBarReader});
    factoryCreate.registerType({_className: "TextAtlasReader", _fun: ccs.labelAtlasReader});
    factoryCreate.registerType({_className: "TextReader", _fun: ccs.labelReader});
    factoryCreate.registerType({_className: "TextBMFontReader", _fun: ccs.labelBMFontReader});
    factoryCreate.registerType({_className: "TextFieldReader", _fun: ccs.textFieldReader});
    factoryCreate.registerType({_className: "LayoutReader", _fun: ccs.layoutReader});
    factoryCreate.registerType({_className: "PageViewReader", _fun: ccs.pageViewReader});
    factoryCreate.registerType({_className: "ScrollViewReader", _fun: ccs.scrollViewReader});
    factoryCreate.registerType({_className: "ListViewReader", _fun: ccs.listViewReader});
    factoryCreate.registerType({_className: "WidgetReader", _fun: ccs.widgetReader});

    factoryCreate.registerType({_className: "Button", _fun: ccui.Button});
    factoryCreate.registerType({_className: "CheckBox", _fun: ccui.CheckBox});
    factoryCreate.registerType({_className: "ImageView", _fun: ccui.ImageView});
    factoryCreate.registerType({_className: "Text", _fun: ccui.Text});
    factoryCreate.registerType({_className: "TextAtlas", _fun: ccui.TextAtlas});
    factoryCreate.registerType({_className: "TextBMFont", _fun: ccui.TextBMFont});
    factoryCreate.registerType({_className: "LoadingBar", _fun: ccui.LoadingBar});
    factoryCreate.registerType({_className: "Slider", _fun: ccui.Slider});
    factoryCreate.registerType({_className: "TextField", _fun: ccui.TextField});
    factoryCreate.registerType({_className: "Layout", _fun: ccui.Layout});
    factoryCreate.registerType({_className: "ListView", _fun: ccui.ListView});
    factoryCreate.registerType({_className: "PageView", _fun: ccui.PageView});
    factoryCreate.registerType({_className: "ScrollView", _fun: ccui.ScrollView});

})();

/**
 * ccs.uiReader is a singleton object which is the reader for Cocos Studio ui.
 * @class
 * @name ccs.uiReader
 */
ccs.uiReader = /** @lends ccs.uiReader# */{
    _filePath: "",
    _olderVersion: false,
    _fileDesignSizes: {},
    _mapObject: {},
    _mapParseSelector: {},

    /**
     * Gets the version number by version string.
     * @param {String} str version string.
     * @returns {Number}
     */
    getVersionInteger: function (str) {
        if(!str)
            return 0;
        var strVersion = str;
        var versionLength = strVersion.length;
        if (versionLength < 7) {
            return 0;
        }
        var pos = strVersion.indexOf(".");
        var t = strVersion.substr(0, pos);
        strVersion = strVersion.substr(pos + 1, versionLength - 1);

        pos = strVersion.indexOf(".");
        var h = strVersion.substr(0, pos);
        strVersion = strVersion.substr(pos + 1, versionLength - 1);

        pos = strVersion.indexOf(".");
        var te = strVersion.substr(0, pos);
        strVersion = strVersion.substr(pos + 1, versionLength - 1);

        pos = strVersion.indexOf(".");
        var s = (pos == -1) ? strVersion : strVersion.substr(0, pos);

        var it = parseInt(t);
        var ih = parseInt(h);
        var ite = parseInt(te);
        var is = parseInt(s);

        return (it * 1000 + ih * 100 + ite * 10 + is);
    },

    /**
     * stores the designSize of UI file.
     * @param {String} fileName
     * @param {cc.Size} size
     */
    storeFileDesignSize: function (fileName, size) {
        this._fileDesignSizes[fileName] = size;
    },

    /**
     * Gets the design size by filename.
     * @param {String} fileName
     * @returns {cc.Size}
     */
    getFileDesignSize: function (fileName) {
        return this._fileDesignSizes[fileName];
    },

    /**
     * Creates uiWidget from a json file that exported by cocostudio UI editor
     * @param {String} fileName
     * @returns {ccui.Widget}
     */
    widgetFromJsonFile: function (fileName) {
        var jsonDict = cc.loader.getRes(fileName);
        if(!jsonDict) throw "Please load the resource first : " + fileName;

        var tempFilePath = cc.path.dirname(fileName);
        this._filePath = tempFilePath == "" ? tempFilePath : tempFilePath + "/";

        var fileVersion = jsonDict["version"];
        var pReader, widget;
        var versionInteger = this.getVersionInteger(fileVersion);
        if (fileVersion) {
            if (versionInteger < 250) {
                pReader = new ccs.WidgetPropertiesReader0250();
                widget = pReader.createWidget(jsonDict, this._filePath, fileName);
            } else {
                pReader = new ccs.WidgetPropertiesReader0300();
                widget = pReader.createWidget(jsonDict, this._filePath, fileName);
            }
        } else {
            pReader = new ccs.WidgetPropertiesReader0250();
            widget = pReader.createWidget(jsonDict, this._filePath, fileName);
        }

        if (!fileVersion || versionInteger < 250) {
            this._olderVersion = true;
        }
        jsonDict = null;
        return widget;
    },

    /**
     * Resets the states and clear the file design sizes.
     */
    clear: function () {
        this._filePath = "";
        this._olderVersion = false;
        this._fileDesignSizes = {};
    },

    /**
     * Registers class type and callback.
     * @param {String} classType
     * @param {ccs.objectFactory} ins
     * @param {Object} object
     * @param {function} callback
     */
    registerTypeAndCallBack: function(classType, ins, object, callback){
        var factoryCreate = ccs.objectFactory;
        var t = new ccs.TInfo(classType, ins);
        factoryCreate.registerType(t);

        if(object)
            this._mapObject[classType] = object;
        if(callback)
            this._mapParseSelector[classType] = callback;
    },

    /**
     * Returns the file path
     * @returns {string}
     */
    getFilePath: function(){
        return this._filePath;
    },

    setFilePath: function(path){
        this._filePath = path;
    },

    /**
     * Returns the parsed object map.
     * @returns {Object}
     */
    getParseObjectMap: function(){
        return this._mapObject;
    },

    /**
     * Returns the parsed callback map.
     * @returns {*}
     */
    getParseCallBackMap: function(){
        return this._mapParseSelector;
    }
};

/**
 * The base class of widget properties reader. It parse the foundation properties of widget.
 * @class
 * @extends ccs.Class
 */
ccs.WidgetPropertiesReader = ccs.Class.extend(/** @lends ccs.WidgetPropertiesReader# */{
    _filePath: "",

    /**
     * Create a widget object by json object.
     * @param {Object} jsonDict
     * @param {String} fullPath
     * @param {String} fileName
     */
    createWidget: function (jsonDict, fullPath, fileName) {
    },

    /**
     * Parses the widget properties.
     * @param {Object} data
     */
    widgetFromJsonDictionary: function (data) {
    },

    _createGUI: function(className){
        var name = this._getGUIClassName(className);
        return ccs.objectFactory.createObject(name);
    },

    _getGUIClassName: function(name){
        var convertedClassName = name;
        if (name == "Panel")
            convertedClassName = "Layout";
        else if (name == "TextArea")
            convertedClassName = "Text";
        else if (name == "TextButton")
            convertedClassName = "Button";
        else if (name == "Label")
            convertedClassName = "Text";
        else if (name == "LabelAtlas")
            convertedClassName = "TextAtlas";
        else if (name == "LabelBMFont")
            convertedClassName = "TextBMFont";
        else if (name == "Node")
            convertedClassName = "Layout";
        return convertedClassName;
    },

    _getWidgetReaderClassName: function(className){
        // create widget reader to parse properties of widget
        var readerName = className;
        if (readerName == "Panel")
            readerName = "Layout";
        else if (readerName == "TextArea")
            readerName = "Text";
        else if (readerName == "TextButton")
            readerName = "Button";
        else if (readerName == "Label")
            readerName = "Text";
        else if (readerName == "LabelAtlas")
            readerName = "TextAtlas";
        else if (readerName == "LabelBMFont")
            readerName = "TextBMFont";
        readerName += "Reader";
        return readerName;
    },

    _getWidgetReaderClassNameFromWidget: function(widget){
        var readerName = "";
        // 1st., custom widget parse properties of parent widget with parent widget reader
        if (widget instanceof ccui.Button)
            readerName = "ButtonReader";
        else if (widget instanceof ccui.CheckBox)
            readerName = "CheckBoxReader";
        else if (widget instanceof ccui.ImageView)
            readerName = "ImageViewReader";
        else if (widget instanceof ccui.TextAtlas)
            readerName = "TextAtlasReader";
        else if (widget instanceof ccui.TextBMFont)
            readerName = "TextBMFontReader";
        else if (widget instanceof ccui.Text)
            readerName = "TextReader";
        else if (widget instanceof ccui.LoadingBar)
            readerName = "LoadingBarReader";
        else if (widget instanceof ccui.Slider)
            readerName = "SliderReader";
        else if (widget instanceof ccui.TextField)
            readerName = "TextFieldReader";
        else if (widget instanceof ccui.ListView)
            readerName = "ListViewReader";
        else if (widget instanceof ccui.PageView)
            readerName = "PageViewReader";
        else if (widget instanceof ccui.ScrollView)
            readerName = "ScrollViewReader";
        else if (widget instanceof ccui.Layout)
            readerName = "LayoutReader";
        else if (widget instanceof ccui.Widget)
            readerName = "WidgetReader";

        return readerName;
    },

    _createWidgetReaderProtocol: function(className){
        return ccs.objectFactory.createObject(className);
    }
});

/**
 * The widget properties reader to parse Cocostudio exported file v0.3 -- v1.0
 * @class
 * @extends ccs.WidgetPropertiesReader
 */
ccs.WidgetPropertiesReader0250 = ccs.WidgetPropertiesReader.extend(/** @lends ccs.WidgetPropertiesReader0250# */{
    /**
     * Creates a widget by json object.
     * @param {Object} jsonDict
     * @param {string} fullPath
     * @param {string} fileName
     * @returns {*}
     */
    createWidget: function (jsonDict, fullPath, fileName) {
        this._filePath = fullPath == "" ? fullPath : cc.path.join(fullPath, "/");
        var textures = jsonDict["textures"];
        for (var i = 0; i < textures.length; i++) {
            var file = textures[i];
            var tp = fullPath;
            tp += file;
            cc.spriteFrameCache.addSpriteFrames(tp);
        }
        var fileDesignWidth = jsonDict["designWidth"];
        var fileDesignHeight = jsonDict["designHeight"];
        if (fileDesignWidth <= 0 || fileDesignHeight <= 0) {
            cc.log("Read design size error!");
            var winSize = cc.director.getWinSize();
            ccs.uiReader.storeFileDesignSize(fileName, winSize);
        } else
            ccs.uiReader.storeFileDesignSize(fileName, cc.size(fileDesignWidth, fileDesignHeight));
        var widgetTree = jsonDict["widgetTree"];
        var widget = this.widgetFromJsonDictionary(widgetTree);

        var size = widget.getContentSize();
        if (size.width == 0 && size.height == 0)
            widget.setSize(cc.size(fileDesignWidth, fileDesignHeight));

        var actions = jsonDict["animation"];
        ccs.actionManager.initWithDictionary(fileName, actions, widget);
        widgetTree = null;
        actions = null;
        return widget;
    },

    /**
     * Creates a widget by json dictionary.
     * @param {Object} data
     * @returns {ccui.Widget}
     */
    widgetFromJsonDictionary: function (data) {
        var widget = null;
        var classname = data["classname"];
        var uiOptions = data["options"];
        if (classname == "Button") {
            widget = new ccui.Button();
            this.setPropsForButtonFromJsonDictionary(widget, uiOptions);
        } else if (classname == "CheckBox") {
            widget = new ccui.CheckBox();
            this.setPropsForCheckBoxFromJsonDictionary(widget, uiOptions);
        } else if (classname == "Label") {
            widget = new ccui.Text();
            this.setPropsForLabelFromJsonDictionary(widget, uiOptions);
        } else if (classname == "LabelAtlas") {
            widget = new ccui.TextAtlas();
            this.setPropsForLabelAtlasFromJsonDictionary(widget, uiOptions);
        } else if (classname == "LoadingBar") {
            widget = new ccui.LoadingBar();
            this.setPropsForLoadingBarFromJsonDictionary(widget, uiOptions);
        } else if (classname == "ScrollView") {
            widget = new ccui.ScrollView();
            this.setPropsForScrollViewFromJsonDictionary(widget, uiOptions);
        } else if (classname == "TextArea") {
            widget = new ccui.Text();
            this.setPropsForLabelFromJsonDictionary(widget, uiOptions);
        } else if (classname == "TextButton") {
            widget = new ccui.Button();
            this.setPropsForButtonFromJsonDictionary(widget, uiOptions);
        } else if (classname == "TextField") {
            widget = new ccui.TextField();
            this.setPropsForTextFieldFromJsonDictionary(widget, uiOptions);
        } else if (classname == "ImageView") {
            widget = new ccui.ImageView();
            this.setPropsForImageViewFromJsonDictionary(widget, uiOptions);
        } else if (classname == "Panel") {
            widget = new ccui.Layout();
            this.setPropsForLayoutFromJsonDictionary(widget, uiOptions);
        } else if (classname == "Slider") {
            widget = new ccui.Slider();
            this.setPropsForSliderFromJsonDictionary(widget, uiOptions);
        } else if (classname == "LabelBMFont") {
            widget = new ccui.TextBMFont();
            this.setPropsForLabelBMFontFromJsonDictionary(widget, uiOptions);
        } else if (classname == "DragPanel") {
            widget = new ccui.ScrollView();
            this.setPropsForScrollViewFromJsonDictionary(widget, uiOptions);
        }
        var children = data["children"];
        for (var i = 0; i < children.length; i++) {
            var subData = children[i];
            var child = this.widgetFromJsonDictionary(subData);
            if (child)
                widget.addChild(child);
            subData = null;
        }
        uiOptions = null;
        return widget;
    },

    /**
     * Sets widget's properties from json dictionary.
     * @param {ccui.Widget} widget
     * @param {Object} options the json dictionary.
     */
    setPropsForWidgetFromJsonDictionary: function (widget, options) {
        if (options["ignoreSize"] !== undefined)
            widget.ignoreContentAdaptWithSize(options["ignoreSize"]);

        var w = options["width"];
        var h = options["height"];
        widget.setSize(cc.size(w, h));

        widget.setTag(options["tag"]);
        widget.setActionTag(options["actiontag"]);
        widget.setTouchEnabled(options["touchAble"]);
        var name = options["name"];
        var widgetName = name ? name : "default";
        widget.setName(widgetName);
        var x = options["x"];
        var y = options["y"];
        widget.setPosition(cc.p(x, y));
        if (options["scaleX"] !== undefined) {
            widget.setScaleX(options["scaleX"]);
        }
        if (options["scaleY"] !== undefined) {
            widget.setScaleY(options["scaleY"]);
        }
        if (options["rotation"] !== undefined) {
            widget.setRotation(options["rotation"]);
        }
        if (options["visible"] !== undefined) {
            widget.setVisible(options["visible"]);
        }

        var z = options["ZOrder"];
        widget.setLocalZOrder(z);
    },

    /**
     * Sets all widgets' properties from json dictionary.
     */
    setPropsForAllWidgetFromJsonDictionary: function(){},

    /**
     * Sets all custom widget's properties from json dictionary.
     */
    setPropsForAllCustomWidgetFromJsonDictionary: function(){},

    /**
     * Sets widget's color, anchor point, flipped properties from json object.
     * @param {ccui.Widget} widget
     * @param {Object} options json object.
     */
    setColorPropsForWidgetFromJsonDictionary: function (widget, options) {
        if (options["opacity"] !== undefined) {
            widget.setOpacity(options["opacity"]);
        }
        var colorR = options["colorR"] !== undefined ? options["colorR"] : 255;
        var colorG = options["colorG"] !== undefined ? options["colorG"] : 255;
        var colorB = options["colorB"] !== undefined ? options["colorB"] : 255;
        widget.setColor(cc.color(colorR, colorG, colorB));
        var apx = options["anchorPointX"] !== undefined ? options["anchorPointX"] : ((widget.getWidgetType() == ccui.Widget.TYPE_WIDGET) ? 0.5 : 0);
        var apy = options["anchorPointY"] !== undefined ? options["anchorPointY"] : ((widget.getWidgetType() == ccui.Widget.TYPE_WIDGET) ? 0.5 : 0);
        widget.setAnchorPoint(apx, apy);
        var flipX = options["flipX"];
        var flipY = options["flipY"];
        widget.setFlippedX(flipX);
        widget.setFlippedY(flipY);
    },

    /**
     * Sets ccui.Button's properties from json object.
     * @param {ccui.Button} widget
     * @param {Object} options
     */
    setPropsForButtonFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var button = widget;
        var scale9Enable = options["scale9Enable"];
        button.setScale9Enabled(scale9Enable);

        var normalFileName = options["normal"];
        var pressedFileName = options["pressed"];
        var disabledFileName = options["disabled"];

        var normalFileName_tp = normalFileName ? this._filePath + normalFileName : null;
        var pressedFileName_tp = pressedFileName ? this._filePath + pressedFileName : null;
        var disabledFileName_tp = disabledFileName ? this._filePath + disabledFileName : null;
        var useMergedTexture = options["useMergedTexture"];
        if (scale9Enable) {
            var cx = options["capInsetsX"];
            var cy = options["capInsetsY"];
            var cw = options["capInsetsWidth"];
            var ch = options["capInsetsHeight"];

            if (useMergedTexture)
                button.loadTextures(normalFileName, pressedFileName, disabledFileName, ccui.Widget.PLIST_TEXTURE);
            else
                button.loadTextures(normalFileName_tp, pressedFileName_tp, disabledFileName_tp);
            //button.setCapInsets(cc.rect(cx, cy, cw, ch));
            if (options["scale9Width"] !== undefined && options["scale9Height"] !== undefined) {
                var swf = options["scale9Width"];
                var shf = options["scale9Height"];
                button.setSize(cc.size(swf, shf));
            }
        } else {
            if (useMergedTexture)
                button.loadTextures(normalFileName, pressedFileName, disabledFileName, ccui.Widget.PLIST_TEXTURE);
            else
                button.loadTextures(normalFileName_tp, pressedFileName_tp, disabledFileName_tp);
        }
        if (options["text"] !== undefined) {
            var text = options["text"] || "";
            if (text)
                button.setTitleText(text);
        }
        if (options["fontSize"] !== undefined) {
            button.setTitleFontSize(options["fontSize"]);
        }
        if (options["fontName"] !== undefined) {
            button.setTitleFontName(options["fontName"]);
        }
        var cr = options["textColorR"] !== undefined ? options["textColorR"] : 255;
        var cg = options["textColorG"] !== undefined ? options["textColorG"] : 255;
        var cb = options["textColorB"] !== undefined ? options["textColorB"] : 255;
        var tc = cc.color(cr, cg, cb);
        button.setTitleColor(tc);
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    /**
     * Sets ccui.CheckBox's properties from json object.
     * @param {ccui.CheckBox} widget
     * @param {Object} options
     */
    setPropsForCheckBoxFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var checkBox = widget;
        var backGroundFileName = options["backGroundBox"];
        var backGroundSelectedFileName = options["backGroundBoxSelected"];
        var frontCrossFileName = options["frontCross"];
        var backGroundDisabledFileName = options["backGroundBoxDisabled"];
        var frontCrossDisabledFileName = options["frontCrossDisabled"];

        var locFilePath = this._filePath;

        var backGroundFileName_tp = backGroundFileName ? locFilePath + backGroundFileName : null;
        var backGroundSelectedFileName_tp = backGroundSelectedFileName ? locFilePath + backGroundSelectedFileName : null;
        var frontCrossFileName_tp = frontCrossFileName ? locFilePath + frontCrossFileName : null;
        var backGroundDisabledFileName_tp = backGroundDisabledFileName ? locFilePath + backGroundDisabledFileName : null;
        var frontCrossDisabledFileName_tp = frontCrossDisabledFileName ? locFilePath + frontCrossDisabledFileName : null;
        var useMergedTexture = options["useMergedTexture"];

        if (useMergedTexture) {
            checkBox.loadTextures(backGroundFileName, backGroundSelectedFileName, frontCrossFileName, backGroundDisabledFileName, frontCrossDisabledFileName, ccui.Widget.PLIST_TEXTURE);
        }
        else {
            checkBox.loadTextures(backGroundFileName_tp, backGroundSelectedFileName_tp, frontCrossFileName_tp, backGroundDisabledFileName_tp, frontCrossDisabledFileName_tp);
        }

        checkBox.setSelected(options["selectedState"] || false);
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    /**
     * Sets ccui.ImageView's properties from json object.
     * @param {ccui.ImageView} widget
     * @param {Object} options
     */
    setPropsForImageViewFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);

        var imageView = widget;
        var imageFileName = options["fileName"];
        var scale9Enable = options["scale9Enable"] || false;
        imageView.setScale9Enabled(scale9Enable);

        var tp_i = this._filePath;
        var imageFileName_tp = null;
        if (imageFileName)
            imageFileName_tp = tp_i + imageFileName;

        var useMergedTexture = options["useMergedTexture"];
        if (scale9Enable) {
            if (useMergedTexture) {
                imageView.loadTexture(imageFileName, ccui.Widget.PLIST_TEXTURE);
            }
            else {
                imageView.loadTexture(imageFileName_tp);
            }

            if (options["scale9Width"] !== undefined && options["scale9Height"] !== undefined) {
                var swf = options["scale9Width"];
                var shf = options["scale9Height"];
                imageView.setSize(cc.size(swf, shf));
            }

            var cx = options["capInsetsX"];
            var cy = options["capInsetsY"];
            var cw = options["capInsetsWidth"];
            var ch = options["capInsetsHeight"];
            imageView.setCapInsets(cc.rect(cx, cy, cw, ch));

        }
        else {
            if (useMergedTexture) {
                imageView.loadTexture(imageFileName, ccui.Widget.PLIST_TEXTURE);
            }
            else {
                imageView.loadTexture(imageFileName_tp);
            }
        }
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    /**
     * Sets ccui.Text's properties from json object.
     * @param {ccui.Text} widget
     * @param {Object} options json dictionary
     */
    setPropsForLabelFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var label = widget;
        var touchScaleChangeAble = options["touchScaleEnable"];
        label.setTouchScaleChangeEnabled(touchScaleChangeAble);
        var text = options["text"];
        label.setString(text);
        if (options["fontSize"] !== undefined) {
            label.setFontSize(options["fontSize"]);
        }
        if (options["fontName"] !== undefined) {
            label.setFontName(options["fontName"]);
        }
        if (options["areaWidth"] !== undefined && options["areaHeight"] !== undefined) {
            var size = cc.size(options["areaWidth"], options["areaHeight"]);
            label.setTextAreaSize(size);
        }
        if (options["hAlignment"]) {
            label.setTextHorizontalAlignment(options["hAlignment"]);
        }
        if (options["vAlignment"]) {
            label.setTextVerticalAlignment(options["vAlignment"]);
        }
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    /**
     * Sets ccui.TextAtlas' properties from json object.
     * @param {ccui.TextAtlas} widget
     * @param {Object} options
     */
    setPropsForLabelAtlasFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var labelAtlas = widget;

        var cmft = options["charMapFileData"], svValue = options["stringValue"], iwValue = options["itemWidth"];
        var ihValue = options["itemHeight"], scmValue = options["startCharMap"];
        var sv = (svValue !== undefined);
        var cmf = (cmft !== undefined);
        var iw = (iwValue !== undefined);
        var ih = (ihValue !== undefined);
        var scm = (scmValue !== undefined);
        if (sv && cmf && iw && ih && scm && cmft) {
            var cmf_tp = this._filePath + cmft;
            labelAtlas.setProperty(svValue, cmf_tp, iwValue, ihValue, scmValue);
        }
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    /**
     * Sets ccui.Layout's properties from json object.
     * @param {ccui.Layout} widget
     * @param {Object} options
     */
    setPropsForLayoutFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var containerWidget = widget;
        if (!(containerWidget instanceof ccui.ScrollView) && !(containerWidget instanceof ccui.ListView)) {
            containerWidget.setClippingEnabled(options["clipAble"]);
        }
        var panel = widget;
        var backGroundScale9Enable = options["backGroundScale9Enable"];
        panel.setBackGroundImageScale9Enabled(backGroundScale9Enable);
        var cr = options["bgColorR"];
        var cg = options["bgColorG"];
        var cb = options["bgColorB"];

        var scr = options["bgStartColorR"];
        var scg = options["bgStartColorG"];
        var scb = options["bgStartColorB"];

        var ecr = options["bgEndColorR"];
        var ecg = options["bgEndColorG"];
        var ecb = options["bgEndColorB"];

        var bgcv1 = options["vectorX"];
        var bgcv2 = options["vectorY"];
        panel.setBackGroundColorVector(cc.p(bgcv1, bgcv2));

        var co = options["bgColorOpacity"];

        var colorType = options["colorType"];
        panel.setBackGroundColorType(colorType);
        panel.setBackGroundColor(cc.color(scr, scg, scb), cc.color(ecr, ecg, ecb));
        panel.setBackGroundColor(cc.color(cr, cg, cb));
        panel.setBackGroundColorOpacity(co);

        var imageFileName = options["backGroundImage"];
        var imageFileName_tp = imageFileName ? this._filePath + imageFileName : null;
        var useMergedTexture = options["useMergedTexture"];
        if (useMergedTexture) {
            panel.setBackGroundImage(imageFileName, ccui.Widget.PLIST_TEXTURE);
        }
        else {
            panel.setBackGroundImage(imageFileName_tp);
        }
        if (backGroundScale9Enable) {
            var cx = options["capInsetsX"];
            var cy = options["capInsetsY"];
            var cw = options["capInsetsWidth"];
            var ch = options["capInsetsHeight"];
            panel.setBackGroundImageCapInsets(cc.rect(cx, cy, cw, ch));
        }
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    /**
     * Sets ccui.ScrollView's properties from json dictionary.
     * @param {ccui.ScrollView} widget
     * @param {Object} options json dictionary.
     */
    setPropsForScrollViewFromJsonDictionary: function (widget, options) {
        this.setPropsForLayoutFromJsonDictionary(widget, options);
        var scrollView = widget;
        var innerWidth = options["innerWidth"];
        var innerHeight = options["innerHeight"];
        scrollView.setInnerContainerSize(cc.size(innerWidth, innerHeight));
        var direction = options["direction"];
        scrollView.setDirection(direction);
        scrollView.setBounceEnabled(options["bounceEnable"]);
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    /**
     * Sets the container's properties from json dictionary.
     * @param {ccui.Widget} widget
     * @param {Object} options json dictionary.
     */
    setPropsForContainerWidgetFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var containerWidget = widget;
        if (containerWidget instanceof ccui.ScrollView ||
            containerWidget instanceof ccui.ListView) {
            containerWidget.setClippingEnabled(options["clipAble"]);
        }
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    /**
     * Sets ccui.Slider's properties from json dictionary.
     * @param {ccui.Slider} widget
     * @param {Object} options json dictionary.
     */
    setPropsForSliderFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var slider = widget;

        var barTextureScale9Enable = options["barTextureScale9Enable"] || false;
        slider.setScale9Enabled(barTextureScale9Enable);
        var barLength = options["length"];
        var useMergedTexture = options["useMergedTexture"];
        var bt = (options["barFileName"] !== undefined);
        if (bt) {
            if (barTextureScale9Enable) {
                var imageFileName = options["barFileName"];
                var imageFileName_tp = imageFileName ? this._filePath + imageFileName : null;
                if (useMergedTexture) {
                    slider.loadBarTexture(imageFileName, ccui.Widget.PLIST_TEXTURE);
                } else {
                    slider.loadBarTexture(imageFileName_tp);
                }
                slider.setSize(cc.size(barLength, slider.getContentSize().height));
            } else {
                var imageFileName = options["barFileName"];
                var imageFileName_tp = imageFileName ? this._filePath + imageFileName : null;
                if (useMergedTexture) {
                    slider.loadBarTexture(imageFileName, ccui.Widget.PLIST_TEXTURE);
                } else {
                    slider.loadBarTexture(imageFileName_tp);
                }
            }
        }

        var normalFileName = options["ballNormal"];
        var pressedFileName = options["ballPressed"];
        var disabledFileName = options["ballDisabled"];

        var normalFileName_tp = normalFileName ? this._filePath + normalFileName : null;
        var pressedFileName_tp = pressedFileName ? this._filePath + pressedFileName : null;
        var disabledFileName_tp = disabledFileName ? this._filePath + disabledFileName : null;
        if (useMergedTexture) {
            slider.loadSlidBallTextures(normalFileName, pressedFileName, disabledFileName, ccui.Widget.PLIST_TEXTURE);
        } else {
            slider.loadSlidBallTextures(normalFileName_tp, pressedFileName_tp, disabledFileName_tp);
        }
        slider.setPercent(options["percent"]);

        var imageFileName = options["progressBarFileName"];
        var imageFileName_tp = imageFileName ? this._filePath + imageFileName : null;
        if (useMergedTexture) {
            slider.loadProgressBarTexture(imageFileName, ccui.Widget.PLIST_TEXTURE);
        } else {
            slider.loadProgressBarTexture(imageFileName_tp);
        }
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    /**
     * Sets ccui.TextField's properties from json object.
     * @param {ccui.TextField} widget
     * @param {Object} options
     */
    setPropsForTextAreaFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var textArea = widget;
        textArea.setString(options["text"]);
        if (options["fontSize"] !== undefined) {
            textArea.setFontSize(options["fontSize"]);
        }
        var cr = options["colorR"];
        var cg = options["colorG"];
        var cb = options["colorB"];
        textArea.setColor(cc.color((cr == null) ? 255 : cr, (cg == null) ? 255 : cg, (cb == null) ? 255 : cb));
        textArea.setFontName(options["fontName"]);
        if (options["areaWidth"] !== undefined && options["areaHeight"] !== undefined) {
            var size = cc.size(options["areaWidth"], options["areaHeight"]);
            textArea.setTextAreaSize(size);
        }
        if (options["hAlignment"]) {
            textArea.setTextHorizontalAlignment(options["hAlignment"]);
        }
        if (options["vAlignment"]) {
            textArea.setTextVerticalAlignment(options["vAlignment"]);
        }
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    /**
     * Sets ccui.Button's text properties from json dictionary.
     * @param {ccui.Button} widget
     * @param {Object} options
     */
    setPropsForTextButtonFromJsonDictionary: function (widget, options) {
        this.setPropsForButtonFromJsonDictionary(widget, options);

        var textButton = widget;
        textButton.setTitleText(options["text"] || "");
        var cri = options["textColorR"] !== undefined ? options["textColorR"] : 255;
        var cgi = options["textColorG"] !== undefined ? options["textColorG"] : 255;
        var cbi = options["textColorB"] !== undefined ? options["textColorB"] : 255;
        textButton.setTitleColor(cc.color(cri, cgi, cbi));
        if (options["fontSize"] !== undefined)
            textButton.setTitleFontSize(options["fontSize"]);
        if (options["fontName"] !== undefined)
            textButton.setTitleFontName(options["fontName"]);
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    /**
     * Sets ccui.TextField's properties from json dictionary.
     * @param {ccui.TextField} widget
     * @param {Object} options json dictionary
     */
    setPropsForTextFieldFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var textField = widget;
        if (options["placeHolder"] !== undefined) {
            textField.setPlaceHolder(options["placeHolder"]);
        }
        textField.setString(options["text"]);
        if (options["fontSize"] !== undefined) {
            textField.setFontSize(options["fontSize"]);
        }
        if (options["fontName"] !== undefined) {
            textField.setFontName(options["fontName"]);
        }
        if (options["touchSizeWidth"] !== undefined && options["touchSizeHeight"] !== undefined) {
            textField.setTouchSize(cc.size(options["touchSizeWidth"], options["touchSizeHeight"]));
        }

        var dw = options["width"];
        var dh = options["height"];
        if (dw > 0.0 || dh > 0.0) {
            //textField.setSize(CCSizeMake(dw, dh));
        }
        var maxLengthEnable = options["maxLengthEnable"];
        textField.setMaxLengthEnabled(maxLengthEnable);

        if (maxLengthEnable) {
            var maxLength = options["maxLength"];
            textField.setMaxLength(maxLength);
        }
        var passwordEnable = options["passwordEnable"];
        textField.setPasswordEnabled(passwordEnable);
        if (passwordEnable) {
            textField.setPasswordStyleText(options["passwordStyleText"]);
        }
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    /**
     * Sets ccui.LoadingBar's properties from json dictionary.
     * @param {ccui.LoadingBar} widget
     * @param {Object} options json dictionary
     */
    setPropsForLoadingBarFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var loadingBar = widget;
        var useMergedTexture = options["useMergedTexture"];
        var imageFileName = options["texture"];
        var imageFileName_tp = imageFileName ? this._filePath + imageFileName : null;
        if (useMergedTexture) {
            loadingBar.loadTexture(imageFileName, ccui.Widget.PLIST_TEXTURE);
        } else {
            loadingBar.loadTexture(imageFileName_tp);
        }
        loadingBar.setDirection(options["direction"]);
        loadingBar.setPercent(options["percent"]);
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    /**
     * Sets ccui.ListView's properties from json dictionary.
     * @param {ccui.ListView} widget
     * @param {Object} options json dictionary
     */
    setPropsForListViewFromJsonDictionary: function (widget, options) {
        this.setPropsForLayoutFromJsonDictionary(widget, options);
    },

    /**
     * Sets ccui.PageView's properties from json dictionary.
     * @param {ccui.PageView} widget
     * @param {Object} options json dictionary
     */
    setPropsForPageViewFromJsonDictionary: function (widget, options) {
        this.setPropsForLayoutFromJsonDictionary(widget, options);
    },

    /**
     * Sets ccui.TextBMFont's properties from json dictionary.
     * @param {ccui.TextBMFont} widget
     * @param {Object} options json dictionary
     */
    setPropsForLabelBMFontFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var labelBMFont = widget;
        var cmft = options["fileName"];
        var cmf_tp = this._filePath + cmft;
        labelBMFont.setFntFile(cmf_tp);
        var text = options["text"];
        labelBMFont.setString(text);
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    }
});

/**
 * The widget properties reader to parse Cocostudio exported file v1.0 higher.
 * @class
 * @extends ccs.WidgetPropertiesReader
 */
ccs.WidgetPropertiesReader0300 = ccs.WidgetPropertiesReader.extend(/** @lends ccs.WidgetPropertiesReader0300# */{
    /**
     * Creates widget by json object.
     * @param {Object} jsonDict json dictionary
     * @param {String} fullPath
     * @param {String} fileName
     * @returns {ccui.Widget}
     */
    createWidget: function (jsonDict, fullPath, fileName) {
        this._filePath = fullPath == "" ? fullPath : cc.path.join(fullPath, "/");
        var textures = jsonDict["textures"];
        for (var i = 0; i < textures.length; i++) {
            var file = textures[i];
            var tp = fullPath;
            tp += file;
            cc.spriteFrameCache.addSpriteFrames(tp);
        }
        var fileDesignWidth = jsonDict["designWidth"];
        var fileDesignHeight = jsonDict["designHeight"];
        if (fileDesignWidth <= 0 || fileDesignHeight <= 0) {
            cc.log("Read design size error!");
            var winSize = cc.director.getWinSize();
            ccs.uiReader.storeFileDesignSize(fileName, winSize);
        } else
            ccs.uiReader.storeFileDesignSize(fileName, cc.size(fileDesignWidth, fileDesignHeight));
        var widgetTree = jsonDict["widgetTree"];
        var widget = this.widgetFromJsonDictionary(widgetTree);

        var size = widget.getContentSize();
        if (size.width == 0 && size.height == 0)
            widget.setSize(cc.size(fileDesignWidth, fileDesignHeight));

        var actions = jsonDict["animation"];
        ccs.actionManager.initWithDictionary(fileName, actions, widget);

        widgetTree = null;
        actions = null;
        return widget;
    },

    /**
     * Sets widget's foundation properties from json dictionary.
     * @param {Object} reader widget reader
     * @param {ccui.Widget} widget
     * @param {Object} options json dictionary
     */
    setPropsForAllWidgetFromJsonDictionary: function(reader, widget, options){
        if(reader && reader.setPropsFromJsonDictionary)
            reader.setPropsFromJsonDictionary(widget, options);
    },

    /**
     * Sets widget's custom properties from json dictionary
     * @param {String} classType class type
     * @param {ccui.Widget} widget
     * @param {Object} customOptions
     */
    setPropsForAllCustomWidgetFromJsonDictionary: function(classType, widget, customOptions){
        var guiReader = ccs.uiReader;
        var object_map = guiReader.getParseObjectMap();
        var object = object_map[classType];

        var selector_map = guiReader.getParseCallBackMap();
        var selector = selector_map[classType];

        if (object && selector)
            selector.call(object, classType, widget, customOptions);
    },

    /**
     * Creates a widget from json dictionary.
     * @param {Object} data json data
     * @returns {ccui.Widget}
     */
    widgetFromJsonDictionary: function (data) {
        var classname = data["classname"];
        var uiOptions = data["options"];
        var widget = this._createGUI(classname);

        var readerName = this._getWidgetReaderClassName(classname);
        var reader = this._createWidgetReaderProtocol(readerName);

        if (reader){
            // widget parse with widget reader
            this.setPropsForAllWidgetFromJsonDictionary(reader, widget, uiOptions);
        } else {
            readerName = this._getWidgetReaderClassNameFromWidget(widget);

            reader = ccs.objectFactory.createObject(readerName);

            if (reader && widget) {
                this.setPropsForAllWidgetFromJsonDictionary(reader, widget, uiOptions);

                // 2nd., custom widget parse with custom reader
                var customProperty = uiOptions["customProperty"];
                var customJsonDict = JSON.parse(customProperty);
                this.setPropsForAllCustomWidgetFromJsonDictionary(classname, widget, customJsonDict);
            }else{
                cc.log("Widget or WidgetReader doesn't exists!!!  Please check your json file.");
            }

        }

        var childrenItem = data["children"];
        for(var i=0; i<childrenItem.length; i++){
            var child = this.widgetFromJsonDictionary(childrenItem[i]);
            if(child){
                if(widget instanceof ccui.PageView)
                    widget.addPage(child);
                else {
                    if(widget instanceof ccui.ListView){
                        widget.pushBackCustomItem(child);
                    } else {
                        if(!(widget instanceof ccui.Layout)) {
                            if(child.getPositionType() == ccui.Widget.POSITION_PERCENT) {
                                var position = child.getPositionPercent();
                                var anchor = widget.getAnchorPoint();
                                child.setPositionPercent(cc.p(position.x + anchor.x, position.y + anchor.y));
                            }
                            var AnchorPointIn = widget.getAnchorPointInPoints();
                            child.setPosition(cc.p(child.getPositionX() + AnchorPointIn.x, child.getPositionY() + AnchorPointIn.y));
                        }
                        widget.addChild(child);
                    }
                }
            }
        }
        return widget;
    },

    /**
     * Sets widget's foundation properties from json dictionary.
     * @param {ccui.Widget} widget
     * @param {Object} options json dictionary
     */
    setPropsForWidgetFromJsonDictionary: function (widget, options) {
        var name = options["name"];
        var widgetName = name ? name : "default";
        widget.setName(widgetName);

        if (options["ignoreSize"] !== undefined)
            widget.ignoreContentAdaptWithSize(options["ignoreSize"]);

        widget.setSizeType(options["sizeType"]);
        widget.setPositionType(options["positionType"]);

        widget.setSizePercent(cc.p(options["sizePercentX"], options["sizePercentY"]));
        widget.setPositionPercent(cc.p(options["positionPercentX"], options["positionPercentY"]));

        var w = options["width"];
        var h = options["height"];
        widget.setSize(cc.size(w, h));

        widget.setTag(options["tag"]);
        widget.setActionTag(options["actiontag"]);
        widget.setTouchEnabled(options["touchAble"]);

        var x = options["x"];
        var y = options["y"];
        widget.setPosition(cc.p(x, y));

        if (options["scaleX"] !== undefined)
            widget.setScaleX(options["scaleX"]);
        if (options["scaleY"] !== undefined)
            widget.setScaleY(options["scaleY"]);
        if (options["rotation"] !== undefined)
            widget.setRotation(options["rotation"]);
        if (options["visible"] !== undefined)
            widget.setVisible(options["visible"]);

        widget.setLocalZOrder(options["ZOrder"]);
        var layoutParameterDic = options["layoutParameter"];
        if (layoutParameterDic) {
            var paramType = layoutParameterDic["type"];
            var parameter;
            switch (paramType) {
                case 0:
                    break;
                case 1:
                    parameter = new ccui.LinearLayoutParameter();
                    var gravity = layoutParameterDic["gravity"];
                    parameter.setGravity(gravity);
                    break;
                case 2:
                    parameter = new ccui.RelativeLayoutParameter();
                    var relativeName = layoutParameterDic["relativeName"];
                    parameter.setRelativeName(relativeName);
                    var relativeToName = layoutParameterDic["relativeToName"];
                    parameter.setRelativeToWidgetName(relativeToName);
                    parameter.setAlign(layoutParameterDic["align"]);
                    break;
                default:
                    break;
            }
            var mgl = layoutParameterDic["marginLeft"];
            var mgt = layoutParameterDic["marginTop"];
            var mgr = layoutParameterDic["marginRight"];
            var mgb = layoutParameterDic["marginDown"];
            parameter.setMargin(new ccui.Margin(mgl, mgt, mgr, mgb));
            widget.setLayoutParameter(parameter);
        }
    },

    /**
     * Sets widget's color, anchor point, flipped properties from json dictionary.
     * @param {ccui.Widget} widget
     * @param {Object} options json dictionary
     */
    setColorPropsForWidgetFromJsonDictionary: function (widget, options) {
        if (options["opacity"] !== undefined) {
            widget.setOpacity(options["opacity"]);
        }
        var colorR = options["colorR"] !== undefined ? options["colorR"] : 255;
        var colorG = options["colorG"] !== undefined ? options["colorG"] : 255;
        var colorB = options["colorB"] !== undefined ? options["colorB"] : 255;
        widget.setColor(cc.color(colorR, colorG, colorB));
        var apx = options["anchorPointX"] !== undefined ? options["anchorPointX"] : ((widget.getWidgetType() == ccui.Widget.TYPE_WIDGET) ? 0.5 : 0);
        var apy = options["anchorPointY"] !== undefined ? options["anchorPointY"] : ((widget.getWidgetType() == ccui.Widget.TYPE_WIDGET) ? 0.5 : 0);
        widget.setAnchorPoint(apx, apy);
        var flipX = options["flipX"];
        var flipY = options["flipY"];
        widget.setFlippedX(flipX);
        widget.setFlippedY(flipY);
    },

    /**
     * Sets ccui.Button's properties from json dictionary.
     * @param {ccui.Button} widget
     * @param {Object} options json dictionary
     */
    setPropsForButtonFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var button = widget;
        var scale9Enable = options["scale9Enable"];
        button.setScale9Enabled(scale9Enable);

        var normalDic = options["normalData"];
        var normalType = normalDic["resourceType"];
        switch (normalType) {
            case 0:
                var normalFileName = normalDic["path"];
                var normalFileName_tp = normalFileName ? this._filePath + normalFileName : null;
                button.loadTextureNormal(normalFileName_tp);
                break;
            case 1:
                var normalFileName = normalDic["path"];
                button.loadTextureNormal(normalFileName, ccui.Widget.PLIST_TEXTURE);
                break;
            default:
                break;
        }
        normalDic = null;
        var pressedDic = options["pressedData"];
        var pressedType = pressedDic["resourceType"];
        switch (pressedType) {
            case 0:
                var pressedFileName = pressedDic["path"];
                var pressedFileName_tp = pressedFileName ? this._filePath + pressedFileName : null;
                button.loadTexturePressed(pressedFileName_tp);
                break;
            case 1:
                var pressedFileName = pressedDic["path"];
                button.loadTexturePressed(pressedFileName, ccui.Widget.PLIST_TEXTURE);
                break;
            default:
                break;
        }
        pressedDic = null;
        var disabledDic = options["disabledData"];
        var disabledType = disabledDic["resourceType"];
        switch (disabledType) {
            case 0:
                var disabledFileName = disabledDic["path"];
                var disabledFileName_tp = disabledFileName ? this._filePath + disabledFileName : null;
                button.loadTextureDisabled(disabledFileName_tp);
                break;
            case 1:
                var disabledFileName = disabledDic["path"];
                button.loadTextureDisabled(disabledFileName, ccui.Widget.PLIST_TEXTURE);
                break;
            default:
                break;
        }
        disabledDic = null;
        if (scale9Enable) {
            var cx = options["capInsetsX"];
            var cy = options["capInsetsY"];
            var cw = options["capInsetsWidth"];
            var ch = options["capInsetsHeight"];

            button.setCapInsets(cc.rect(cx, cy, cw, ch));
            if (options["scale9Width"] !== undefined && options["scale9Height"] !== undefined) {
                var swf = options["scale9Width"];
                var shf = options["scale9Height"];
                button.setSize(cc.size(swf, shf));
            }
        }
        if (options["text"] !== undefined) {
            var text = options["text"] || "";
            if (text)
                button.setTitleText(text);
        }
        if (options["fontSize"] !== undefined) {
            button.setTitleFontSize(options["fontSize"]);
        }
        if (options["fontName"] !== undefined) {
            button.setTitleFontName(options["fontName"]);
        }
        var cr = options["textColorR"] !== undefined ? options["textColorR"] : 255;
        var cg = options["textColorG"] !== undefined ? options["textColorG"] : 255;
        var cb = options["textColorB"] !== undefined ? options["textColorB"] : 255;
        var tc = cc.color(cr, cg, cb);
        button.setTitleColor(tc);
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    /**
     * Sets ccui.CheckBox's properties from json dictionary.
     * @param {ccui.CheckBox} widget
     * @param {Object} options json dictionary
     */
    setPropsForCheckBoxFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var checkBox = widget;
        var backGroundDic = options["backGroundBoxData"];
        var backGroundType = backGroundDic["resourceType"];
        switch (backGroundType) {
            case 0:
                var backGroundFileName = backGroundDic["path"];
                var backGroundFileName_tp = backGroundFileName ? this._filePath + backGroundFileName : null;
                checkBox.loadTextureBackGround(backGroundFileName_tp);
                break;
            case 1:
                var backGroundFileName = backGroundDic["path"];
                checkBox.loadTextureBackGround(backGroundFileName, ccui.Widget.PLIST_TEXTURE);
                break;
            default:
                break;
        }
        backGroundDic = null;
        var backGroundSelectedDic = options["backGroundBoxSelectedData"];
        var backGroundSelectedType = backGroundSelectedDic["resourceType"];
        switch (backGroundSelectedType) {
            case 0:
                var backGroundSelectedFileName = backGroundSelectedDic["path"];
                var backGroundSelectedFileName_tp = backGroundSelectedFileName ? this._filePath + backGroundSelectedFileName : null;
                checkBox.loadTextureBackGroundSelected(backGroundSelectedFileName_tp);
                break;
            case 1:
                var backGroundSelectedFileName = backGroundSelectedDic["path"];
                checkBox.loadTextureBackGroundSelected(backGroundSelectedFileName, ccui.Widget.PLIST_TEXTURE);
                break;
            default:
                break;
        }
        backGroundSelectedDic = null;

        var frontCrossDic = options["frontCrossData"];
        var frontCrossType = frontCrossDic["resourceType"];
        switch (frontCrossType) {
            case 0:
                var frontCrossFileName = frontCrossDic["path"];
                var frontCrossFileName_tp = frontCrossFileName ? this._filePath + frontCrossFileName : null;
                checkBox.loadTextureFrontCross(frontCrossFileName_tp);
                break;
            case 1:
                var frontCrossFileName = frontCrossDic["path"];
                checkBox.loadTextureFrontCross(frontCrossFileName, ccui.Widget.PLIST_TEXTURE);
                break;
            default:
                break;
        }
        frontCrossDic = null;

        var backGroundDisabledDic = options["backGroundBoxDisabledData"];
        var backGroundDisabledType = backGroundDisabledDic["resourceType"];
        switch (backGroundDisabledType) {
            case 0:
                var backGroundDisabledFileName = backGroundDisabledDic["path"];
                var backGroundDisabledFileName_tp = backGroundDisabledFileName ? this._filePath + backGroundDisabledFileName : null;
                checkBox.loadTextureBackGroundDisabled(backGroundDisabledFileName_tp);
                break;
            case 1:
                var backGroundDisabledFileName = backGroundDisabledDic["path"];
                checkBox.loadTextureBackGroundDisabled(backGroundDisabledFileName, ccui.Widget.PLIST_TEXTURE);
                break;
            default:
                break;
        }
        backGroundDisabledDic = null;

        var frontCrossDisabledDic = options["frontCrossDisabledData"];
        var frontCrossDisabledType = frontCrossDisabledDic["resourceType"];
        switch (frontCrossDisabledType) {
            case 0:
                var frontCrossDisabledFileName = options["path"];
                var frontCrossDisabledFileName_tp = frontCrossDisabledFileName ? this._filePath + frontCrossDisabledFileName : null;
                checkBox.loadTextureFrontCrossDisabled(frontCrossDisabledFileName_tp);
                break;
            case 1:
                var frontCrossDisabledFileName = options["path"];
                checkBox.loadTextureFrontCrossDisabled(frontCrossDisabledFileName, ccui.Widget.PLIST_TEXTURE);
                break;
            default:
                break;
        }
        frontCrossDisabledDic = null;

        var selectedState = options["selectedState"] || false;
        widget.setSelectedState(selectedState);
        checkBox.setSelectedState(options, "selectedState");
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    /**
     * Sets ccui.ImageView's properties from json dictionary.
     * @param {ccui.ImageView} widget
     * @param {Object} options json dictionary
     */
    setPropsForImageViewFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);

        var imageView = widget;

        var imageFileNameDic = options["fileNameData"];
        var imageFileNameType = imageFileNameDic["resourceType"];
        switch (imageFileNameType) {
            case 0:
                var tp_i = this._filePath;
                var imageFileName = imageFileNameDic["path"];
                var imageFileName_tp = null;
                if (imageFileName) {
                    imageFileName_tp = tp_i + imageFileName;
                    imageView.loadTexture(imageFileName_tp);
                }
                break;
            case 1:
                var imageFileName = imageFileNameDic["path"];
                imageView.loadTexture(imageFileName, ccui.Widget.PLIST_TEXTURE);
                break;
            default:
                break;
        }
        imageFileNameDic = null;

        var scale9Enable = options["scale9Enable"] || false;
        imageView.setScale9Enabled(scale9Enable);

        if (scale9Enable) {
            if (options["scale9Width"] !== undefined && options["scale9Height"] !== undefined) {
                var swf = options["scale9Width"];
                var shf = options["scale9Height"];
                imageView.setSize(cc.size(swf, shf));
            }

            var cx = options["capInsetsX"];
            var cy = options["capInsetsY"];
            var cw = options["capInsetsWidth"];
            var ch = options["capInsetsHeight"];

            imageView.setCapInsets(cc.rect(cx, cy, cw, ch));

        }
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    /**
     * Sets ccui.Text's properties from json dictionary.
     * @param {ccui.Text} widget
     * @param {Object} options json dictionary
     */
    setPropsForLabelFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var label = widget;
        var touchScaleChangeAble = options["touchScaleEnable"];
        label.setTouchScaleChangeEnabled(touchScaleChangeAble);
        var text = options["text"];

        label.setString(text);
        if (options["fontSize"] !== undefined) {
            label.setFontSize(options["fontSize"]);
        }
        if (options["fontName"] !== undefined) {
            label.setFontName(options["fontName"]);
        }
        if (options["areaWidth"] !== undefined && options["areaHeight"] !== undefined) {
            var size = cc.size(options["areaWidth"], options["areaHeight"]);
            label.setTextAreaSize(size);
        }
        if (options["hAlignment"]) {
            label.setTextHorizontalAlignment(options["hAlignment"]);
        }
        if (options["vAlignment"]) {
            label.setTextVerticalAlignment(options["vAlignment"]);
        }
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    /**
     * Sets ccui.TextAtlas's properties from json dictionary.
     * @param {ccui.TextAtlas} widget
     * @param {Object} options json dictionary
     */
    setPropsForLabelAtlasFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var labelAtlas = widget;
        var sv = (options["stringValue"] !== undefined);
        var cmf = (options["charMapFile"] !== undefined);
        var iw = (options["itemWidth"] !== undefined);
        var ih = (options["itemHeight"] !== undefined);
        var scm = (options["startCharMap"] !== undefined);
        if (sv && cmf && iw && ih && scm) {

            var cmftDic = options["charMapFileData"];
            var cmfType = cmftDic["resourceType"];
            switch (cmfType) {
                case 0:
                    var cmfPath = cmftDic["path"];
                    var cmf_tp = this._filePath + cmfPath;
                    labelAtlas.setProperty(options["stringValue"], cmf_tp, options["itemWidth"], options["itemHeight"], options["startCharMap"]);
                    break;
                case 1:
                    cc.log("Wrong res type of LabelAtlas!");
                    break;
                default:
                    break;
            }
            cmftDic = null;
        }
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    /**
     * Sets ccui.Layout's properties from json dictionary.
     * @param {ccui.Layout} widget
     * @param {Object} options json dictionary
     */
    setPropsForLayoutFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var panel = widget;
        if (!(panel instanceof ccui.ScrollView) && !(panel instanceof ccui.ListView)) {
            panel.setClippingEnabled(options["clipAble"]);
        }
        var backGroundScale9Enable = options["backGroundScale9Enable"];
        panel.setBackGroundImageScale9Enabled(backGroundScale9Enable);
        var cr = options["bgColorR"];
        var cg = options["bgColorG"];
        var cb = options["bgColorB"];

        var scr = options["bgStartColorR"];
        var scg = options["bgStartColorG"]
        var scb = options["bgStartColorB"];

        var ecr = options["bgEndColorR"];
        var ecg = options["bgEndColorG"];
        var ecb = options["bgEndColorB"];

        var bgcv1 = options["vectorX"];
        var bgcv2 = options["vectorY"];
        panel.setBackGroundColorVector(cc.p(bgcv1, bgcv2));

        var co = options["bgColorOpacity"];

        var colorType = options["colorType"];
        panel.setBackGroundColorType(colorType);
        panel.setBackGroundColor(cc.color(scr, scg, scb), cc.color(ecr, ecg, ecb));
        panel.setBackGroundColor(cc.color(cr, cg, cb));
        panel.setBackGroundColorOpacity(co);


        var imageFileNameDic = options["backGroundImageData"] || {};
        var imageFileNameType = imageFileNameDic["resourceType"];
        switch (imageFileNameType) {
            case 0:
                var imageFileName = imageFileNameDic["path"];
                var imageFileName_tp = imageFileName ? this._filePath + imageFileName : null;
                panel.setBackGroundImage(imageFileName_tp);
                break;
            case 1:
                var imageFileName = imageFileNameDic["path"];
                panel.setBackGroundImage(imageFileName, ccui.Widget.PLIST_TEXTURE);
                break;
            default:
                break;
        }
        imageFileNameDic = null;

        if (backGroundScale9Enable) {
            var cx = options["capInsetsX"];
            var cy = options["capInsetsY"];
            var cw = options["capInsetsWidth"];
            var ch = options["capInsetsHeight"];
            panel.setBackGroundImageCapInsets(cc.rect(cx, cy, cw, ch));
        }
        panel.setLayoutType(options["layoutType"]);
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    /**
     * Sets ccui.ScrollView's properties from json dictionary.
     * @param {ccui.ScrollView} widget
     * @param {Object} options json dictionary
     */
    setPropsForScrollViewFromJsonDictionary: function (widget, options) {
        this.setPropsForLayoutFromJsonDictionary(widget, options);
        var scrollView = widget;
        var innerWidth = options["innerWidth"];
        var innerHeight = options["innerHeight"];
        scrollView.setInnerContainerSize(cc.size(innerWidth, innerHeight));
        var direction = options["direction"];
        scrollView.setDirection(direction);
        scrollView.setBounceEnabled(options["bounceEnable"]);
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    /**
     * Sets ccui.Slider's properties from json dictionary.
     * @param {ccui.Slider} widget
     * @param {Object} options json dictionary
     */
    setPropsForSliderFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var slider = widget;

        var barTextureScale9Enable = options["barTextureScale9Enable"] || false;
        slider.setScale9Enabled(barTextureScale9Enable);
        var barLength = options["length"];
        var bt = (options["barFileName"] !== undefined);
        if (bt) {
            if (barTextureScale9Enable) {
                var imageFileNameDic = options["barFileNameData"];
                var imageFileType = imageFileNameDic["resourceType"];
                switch (imageFileType) {
                    case 0:
                        var imageFileName = imageFileNameDic["path"];
                        var imageFileName_tp = imageFileName ? this._filePath + imageFileName : null;
                        slider.loadBarTexture(imageFileName_tp);
                        break;
                    case 1:
                        var imageFileName = imageFileNameDic["path"];
                        slider.loadBarTexture(imageFileName, ccui.Widget.PLIST_TEXTURE);
                        break;
                    default:
                        break;
                }

                slider.setSize(cc.size(barLength, slider.getContentSize().height));
                imageFileNameDic = null;
            }
            else {
                var imageFileNameDic = options["barFileNameData"];
                var imageFileType = imageFileNameDic["resourceType"];
                switch (imageFileType) {
                    case 0:
                        var imageFileName = imageFileNameDic["path"];
                        var imageFileName_tp = imageFileName ? this._filePath + imageFileName : null;
                        slider.loadBarTexture(imageFileName_tp);
                        break;
                    case 1:
                        var imageFileName = imageFileNameDic["path"];
                        slider.loadBarTexture(imageFileName, ccui.Widget.PLIST_TEXTURE);
                        break;
                    default:
                        break;
                }
                imageFileNameDic = null;
            }
        }

        var normalDic = options["ballNormalData"];
        var normalType = normalDic["resourceType"];
        switch (normalType) {
            case 0:
                var normalFileName = normalDic["path"];
                var normalFileName_tp = normalFileName ? this._filePath + normalFileName : null;
                slider.loadSlidBallTextureNormal(normalFileName_tp);
                break;
            case 1:
                var normalFileName = normalDic["path"];
                slider.loadSlidBallTextureNormal(normalFileName, ccui.Widget.PLIST_TEXTURE);
                break;
            default:
                break;
        }
        normalDic = null;

        var pressedDic = options["ballPressedData"];
        var pressedType = pressedDic["resourceType"];
        switch (pressedType) {
            case 0:
                var pressedFileName = pressedDic["path"];
                var pressedFileName_tp = pressedFileName ? this._filePath + pressedFileName : null;
                slider.loadSlidBallTexturePressed(pressedFileName_tp);
                break;
            case 1:
                var pressedFileName = pressedDic["path"];
                slider.loadSlidBallTexturePressed(pressedFileName, ccui.Widget.PLIST_TEXTURE);
                break;
            default:
                break;
        }
        pressedDic = null;

        var disabledDic = options["ballDisabledData"];
        var disabledType = disabledDic["resourceType"];
        switch (disabledType) {
            case 0:
                var disabledFileName = disabledDic["path"];
                var disabledFileName_tp = disabledFileName ? this._filePath + disabledFileName : null;
                slider.loadSlidBallTextureDisabled(disabledFileName_tp);
                break;
            case 1:
                var disabledFileName = disabledDic["path"];
                slider.loadSlidBallTextureDisabled(disabledFileName, ccui.Widget.PLIST_TEXTURE);
                break;
            default:
                break;
        }
        disabledDic = null;

        var progressBarDic = options["progressBarData"];
        var progressBarType = progressBarDic["resourceType"];
        switch (progressBarType) {
            case 0:
                var imageFileName = progressBarDic["path"];
                var imageFileName_tp = imageFileName ? this._filePath + imageFileName : null;
                slider.loadProgressBarTexture(imageFileName_tp);
                break;
            case 1:
                var imageFileName = progressBarDic["path"];
                slider.loadProgressBarTexture(imageFileName, ccui.Widget.PLIST_TEXTURE);
                break;
            default:
                break;
        }
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);

        slider.setPercent(options["percent"]);
    },

    /**
     * Sets ccui.TextField's properties from json dictionary.
     * @param {ccui.TextField} widget
     * @param {Object} options json dictionary
     */
    setPropsForTextAreaFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var textArea = widget;
        textArea.setString(options["text"]);
        if (options["fontSize"] !== undefined)
            textArea.setFontSize(options["fontSize"]);
        var cr = options["colorR"];
        var cg = options["colorG"];
        var cb = options["colorB"];
        textArea.setColor(cc.color((cr==null)?255:cr, (cg==null)?255:cg, (cb==null)?255:cb));
        textArea.setFontName(options["fontName"]);
        if (options["areaWidth"] !== undefined && options["areaHeight"] !== undefined) {
            var size = cc.size(options["areaWidth"], options["areaHeight"]);
            textArea.setTextAreaSize(size);
        }
        if (options["hAlignment"])
            textArea.setTextHorizontalAlignment(options["hAlignment"]);
        if (options["vAlignment"])
            textArea.setTextVerticalAlignment(options["vAlignment"]);
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    /**
     * Sets ccui.Button's text properties from json dictionary.
     * @param {ccui.Button} widget
     * @param {Object} options json dictionary
     */
    setPropsForTextButtonFromJsonDictionary: function (widget, options) {
        this.setPropsForButtonFromJsonDictionary(widget, options);

        var textButton = widget;
        textButton.setTitleText(options["text"] || "");
        var cri = options["textColorR"] !== undefined ? options["textColorR"] : 255;
        var cgi = options["textColorG"] !== undefined ? options["textColorG"] : 255;
        var cbi = options["textColorB"] !== undefined ? options["textColorB"] : 255;
        textButton.setTitleColor(cc.color(cri, cgi, cbi));
        if (options["fontSize"] !== undefined)
            textButton.setTitleFontSize(options["fontSize"]);
        if (options["fontName"] !== undefined)
            textButton.setTitleFontName(options["fontName"]);
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    /**
     * Sets ccui.TextField's text properties from json dictionary.
     * @param {ccui.TextField} widget
     * @param {Object} options json dictionary
     */
    setPropsForTextFieldFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var textField = widget;
        if (options["placeHolder"] !== undefined) {
            textField.setPlaceHolder(options["placeHolder"]);
        }
        textField.setString(options["text"]);
        if (options["fontSize"] !== undefined) {
            textField.setFontSize(options["fontSize"]);
        }
        if (options["fontName"] !== undefined) {
            textField.setFontName(options["fontName"]);
        }
        if (options["touchSizeWidth"] !== undefined && options["touchSizeHeight"] !== undefined) {
            textField.setTouchSize(cc.size(options["touchSizeWidth"], options["touchSizeHeight"]));
        }

        var dw = options["width"];
        var dh = options["height"];
        if (dw > 0.0 || dh > 0.0) {
            //textField.setSize(CCSizeMake(dw, dh));
        }
        var maxLengthEnable = options["maxLengthEnable"];
        textField.setMaxLengthEnabled(maxLengthEnable);

        if (maxLengthEnable) {
            var maxLength = options["maxLength"];
            textField.setMaxLength(maxLength);
        }
        var passwordEnable = options["passwordEnable"];
        textField.setPasswordEnabled(passwordEnable);
        if (passwordEnable) {
            textField.setPasswordStyleText(options["passwordStyleText"]);
        }
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    /**
     * Sets ccui.LoadingBar's properties from json dictionary.
     * @param {ccui.LoadingBar} widget
     * @param {Object} options json dictionary
     */
    setPropsForLoadingBarFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var loadingBar = widget;

        var imageFileNameDic = options["textureData"];
        var imageFileNameType = imageFileNameDic["resourceType"];
        switch (imageFileNameType) {
            case 0:
                var tp_i = this._filePath;
                var imageFileName = imageFileNameDic["path"];
                var imageFileName_tp = null;
                if (imageFileName) {
                    imageFileName_tp = tp_i + imageFileName;
                    loadingBar.loadTexture(imageFileName_tp);
                }
                break;
            case 1:
                var imageFileName = imageFileNameDic["path"];
                loadingBar.loadTexture(imageFileName, ccui.Widget.PLIST_TEXTURE);
                break;
            default:
                break;
        }
        imageFileNameDic = null;

        var scale9Enable = options["scale9Enable"];
        loadingBar.setScale9Enabled(scale9Enable);

        if (scale9Enable) {
            var cx = options["capInsetsX"];
            var cy = options["capInsetsY"];
            var cw = options["capInsetsWidth"];
            var ch = options["capInsetsHeight"];

            loadingBar.setCapInsets(cc.rect(cx, cy, cw, ch));

            var width = options["width"];
            var height = options["height"];
            loadingBar.setSize(cc.size(width, height));
        }

        loadingBar.setDirection(options["direction"]);
        loadingBar.setPercent(options["percent"]);
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);

    },

    /**
     * Sets ccui.ListView's properties from json dictionary.
     * @param {ccui.ListView} widget
     * @param {Object} options json dictionary
     */
    setPropsForListViewFromJsonDictionary: function (widget, options) {
        this.setPropsForLayoutFromJsonDictionary(widget, options);
        var innerWidth = options["innerWidth"] || 0;
        var innerHeight = options["innerHeight"] || 0;
        widget.setInnerContainerSize(cc.size(innerWidth, innerHeight));
        widget.setDirection(options["direction"] || 0);
        widget.setGravity(options["gravity"] || 0);
        widget.setItemsMargin(options["itemMargin"] || 0);
    },

    /**
     * Sets ccui.PageView's properties from json dictionary.
     * @param {ccui.PageView} widget
     * @param {Object} options json dictionary
     */
    setPropsForPageViewFromJsonDictionary: function (widget, options) {
        this.setPropsForLayoutFromJsonDictionary(widget, options);
    },

    /**
     * Sets ccui.TextBMFont's properties from json dictionary.
     * @param {ccui.TextBMFont} widget
     * @param {Object} options json dictionary
     */
    setPropsForLabelBMFontFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);

        var labelBMFont = widget;

        var cmftDic = options["fileNameData"];
        var cmfType = cmftDic["resourceType"];
        switch (cmfType) {
            case 0:
                var cmfPath = cmftDic["path"];
                var cmf_tp = this._filePath + cmfPath;
                labelBMFont.setFntFile(cmf_tp);
                break;
            case 1:
                cc.log("Wrong res type of LabelAtlas!");
                break;
            default:
                break;
        }
        cmftDic = null;

        var text = options["text"];
        labelBMFont.setString(text);

        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    widgetFromXML: function(objectData, classType){
        var classname = classType.substr(0, classType.find("ObjectData"));
        //cc.log("classname = %s", classname);

        var widget = this.createGUI(classname);
        var readerName = this.getWidgetReaderClassName(classname);

        var reader = this.createWidgetReaderProtocol(readerName);

        if (reader)
        {
            // widget parse with widget reader
            this.setPropsForAllWidgetFromXML(reader, widget, objectData);
        }
        else
        {
            //
            // 1st., custom widget parse properties of parent widget with parent widget reader
            readerName = this.getWidgetReaderClassName(widget);
            reader =  this.createWidgetReaderProtocol(readerName);
            if (reader && widget)
            {
                this.setPropsForAllWidgetFromXML(reader, widget, objectData);

                // 2nd., custom widget parse with custom reader
                //                const protocolbuffers::WidgetOptions& widgetOptions = nodetree.widgetoptions();
                //                const char* customProperty = widgetOptions.customproperty().c_str();
                var customProperty = "";
                var customJsonDict;
                customJsonDict.Parse(customProperty);
                if (customJsonDict.HasParseError())
                {
                    cc.log("GetParseError %s\n", customJsonDict.GetParseError());
                }
                this.setPropsForAllCustomWidgetFromJsonDictionary(classname, widget, customJsonDict);
            }
            else
            {
                cc.log("Widget or WidgetReader doesn't exists!!!  Please check your json file.");
            }
            //
        }





        // children
        var containChildrenElement = false;
        objectData = objectData.FirstChildElement();

        while (objectData)
        {
            //cc.log("objectData name = %s", objectData.Name());

            if ("Children" !== objectData.Name())
            {
                containChildrenElement = true;
                break;
            }

            objectData = objectData.NextSiblingElement();
        }

        if (containChildrenElement)
        {
            objectData = objectData.FirstChildElement();
            //cc.log("objectData name = %s", objectData.Name());

            while (objectData)
            {
                var attribute = objectData.FirstAttribute();
                while (attribute)
                {
                    var name = attribute.Name();
                    var value = attribute.Value();

                    if (name == "ctype")
                    {
                        var child = this.widgetFromXML(objectData, value);
                        //cc.log("child = %p", child);
                        if (child)
                        {
                            var pageView = widget;
                            var listView = widget;
                            if (pageView instanceof ccui.PageView)
                            {
                                var layout = child;
                                if (layout instanceof ccui.Layout)
                                {
                                    pageView.addPage(layout);
                                }
                            }
                            else if (listView)
                            {
                                var widgetChild = child;
                                if (widgetChild instanceof ccui.Widget)
                                {
                                    listView.pushBackCustomItem(widgetChild);
                                }
                            }
                            else
                            {
                                widget.addChild(child);
                            }
                        }

                        break;
                    }

                    attribute = attribute.Next();
                }

                //            Node* child = nodeFromXML(objectData, value);
                //            CCLOG("child = %p", child);
                //            if (child)
                //            {
                //                PageView* pageView = dynamic_cast<PageView*>(node);
                //                ListView* listView = dynamic_cast<ListView*>(node);
                //                if (pageView)
                //                {
                //                    Layout* layout = dynamic_cast<Layout*>(child);
                //                    if (layout)
                //                    {
                //                        pageView.addPage(layout);
                //                    }
                //                }
                //                else if (listView)
                //                {
                //                    Widget* widget = dynamic_cast<Widget*>(child);
                //                    if (widget)
                //                    {
                //                        listView.pushBackCustomItem(widget);
                //                    }
                //                }
                //                else
                //                {
                //                    node.addChild(child);
                //                }
                //            }

                objectData = objectData.NextSiblingElement();
            }
        }
        //

        //cc.log("widget = %p", widget);

        return widget;
    },

    setPropsForAllWidgetFromXML: function(reader, widget, objectData){
        reader.setPropsFromXML(widget, objectData);
    }

});
