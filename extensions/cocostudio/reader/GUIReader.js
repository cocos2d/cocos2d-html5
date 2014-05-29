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
/**
 * @namespace Base object for ccs.uiReader
 */
ccs.uiReader = /** @lends ccs.uiReader# */{
    _filePath: "",
    _olderVersion: false,
    _fileDesignSizes: {},

    /**
     * get version
     * @param {String} str
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
        var s;
        if (pos == -1) {
            s = strVersion;
        } else {
            s = strVersion.substr(0, pos);
        }

        var it = parseInt(t);
        var ih = parseInt(h);
        var ite = parseInt(te);
        var is = parseInt(s);

        var version = it * 1000 + ih * 100 + ite * 10 + is;
        return version;
    },

    /**
     * store file designSize
     * @param {String} fileName
     * @param {cc.Size} size
     */
    storeFileDesignSize: function (fileName, size) {
        this._fileDesignSizes[fileName] = size;
    },

    /**
     *
     * @param {String} fileName
     * @returns {cc.Size}
     */
    getFileDesignSize: function (fileName) {
        return this._fileDesignSizes[fileName];
    },

    /**
     *  create uiWidget from a josn file that exported by cocostudio UI editor
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
     * Clear data: Release all actions.
     */
    clear: function () {
        this._filePath = "";
        this._olderVersion = false;
        this._fileDesignSizes = {};
    }
};


ccs.WidgetPropertiesReader = ccs.Class.extend({
    _filePath: "",
    createWidget: function (jsonDict, fullPath, fileName) {
    },
    widgetFromJsonDictionary: function (data) {
    }
});
ccs.WidgetPropertiesReader0250 = ccs.WidgetPropertiesReader.extend({
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
        }
        else {
            ccs.uiReader.storeFileDesignSize(fileName, cc.size(fileDesignWidth, fileDesignHeight));
        }
        var widgetTree = jsonDict["widgetTree"];
        var widget = this.widgetFromJsonDictionary(widgetTree);

        var size = widget.getContentSize();
        if (size.width == 0 && size.height == 0) {
            widget.setSize(cc.size(fileDesignWidth, fileDesignHeight));
        }

        var actions = jsonDict["animation"];
        var rootWidget = widget;
        ccs.actionManager.initWithDictionary(fileName, actions, rootWidget);

        widgetTree = null;
        actions = null;
        return widget;
    },
    widgetFromJsonDictionary: function (data) {
        var widget = null;
        var classname = data["classname"];
        var uiOptions = data["options"];
        if (classname == "Button") {
            widget = ccui.Button.create();
            this.setPropsForButtonFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "CheckBox") {
            widget = ccui.CheckBox.create();
            this.setPropsForCheckBoxFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "Label") {
            widget = ccui.Text.create();
            this.setPropsForLabelFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "LabelAtlas") {
            widget = ccui.TextAtlas.create();
            this.setPropsForLabelAtlasFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "LoadingBar") {
            widget = ccui.LoadingBar.create();
            this.setPropsForLoadingBarFromJsonDictionary(widget, uiOptions);
        } else if (classname == "ScrollView") {
            widget = ccui.ScrollView.create();
            this.setPropsForScrollViewFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "TextArea") {
            widget = ccui.Text.create();
            this.setPropsForLabelFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "TextButton") {
            widget = ccui.Button.create();
            this.setPropsForButtonFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "TextField") {
            widget = ccui.TextField.create();
            this.setPropsForTextFieldFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "ImageView") {
            widget = ccui.ImageView.create();
            this.setPropsForImageViewFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "Panel") {
            widget = ccui.Layout.create();
            this.setPropsForLayoutFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "Slider") {
            widget = ccui.Slider.create();
            this.setPropsForSliderFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "LabelBMFont") {
            widget = ccui.TextBMFont.create();
            this.setPropsForLabelBMFontFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "DragPanel") {
            widget = ccui.ScrollView.create();
            this.setPropsForScrollViewFromJsonDictionary(widget, uiOptions);
        }
        var children = data["children"];
        for (var i = 0; i < children.length; i++) {
            var subData = children[i];
            var child = this.widgetFromJsonDictionary(subData);
            if (child) {
                widget.addChild(child);
            }
            subData = null;
        }

        uiOptions = null;
        return widget;
    },


    setPropsForWidgetFromJsonDictionary: function (widget, options) {
        if (options["ignoreSize"] !== undefined) {
            widget.ignoreContentAdaptWithSize(options["ignoreSize"]);
        }

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
        widget.setPosition(x, y);
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

            if (useMergedTexture) {
                button.loadTextures(normalFileName, pressedFileName, disabledFileName, ccui.Widget.PLIST_TEXTURE);
            }
            else {
                button.loadTextures(normalFileName_tp, pressedFileName_tp, disabledFileName_tp);
            }
            //button.setCapInsets(cc.rect(cx, cy, cw, ch));
            if (options["scale9Width"] !== undefined && options["scale9Height"] !== undefined) {
                var swf = options["scale9Width"];
                var shf = options["scale9Height"];
                button.setSize(cc.size(swf, shf));
            }
        }
        else {
            if (useMergedTexture) {
                button.loadTextures(normalFileName, pressedFileName, disabledFileName, ccui.Widget.PLIST_TEXTURE);
            }
            else {
                button.loadTextures(normalFileName_tp, pressedFileName_tp, disabledFileName_tp);
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

        checkBox.setSelectedState(options["selectedState"] || false);
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    setPropsForImageViewFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);

        var imageView = widget;
        var imageFileName = options["fileName"];
        var scale9Enable = options["scale9Enable"] || false;
        imageView.setScale9Enabled(scale9Enable);

        var tp_i = this._filePath;
        var imageFileName_tp = null;
        if (imageFileName) {
            imageFileName_tp = tp_i + imageFileName;
        }

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

    setPropsForLabelAtlasFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var labelAtlas = widget;
        var sv = (options["stringValue"] !== undefined);
        var cmf = (options["charMapFile"] !== undefined);
        var iw = (options["itemWidth"] !== undefined);
        var ih = (options["itemHeight"] !== undefined);
        var scm = (options["startCharMap"] !== undefined);
        if (sv && cmf && iw && ih && scm && options["charMapFile"]) {
            var cmft = options["charMapFile"];
            var cmf_tp = this._filePath + cmft;

            labelAtlas.setProperty(options["stringValue"], cmf_tp, options["itemWidth"], options["itemHeight"], options["startCharMap"]);
        }
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

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

    setPropsForContainerWidgetFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var containerWidget = widget;
        if (containerWidget instanceof ccui.ScrollView ||
            containerWidget instanceof ccui.ListView) {
            containerWidget.setClippingEnabled(options["clipAble"]);
        }
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

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
                }
                else {
                    slider.loadBarTexture(imageFileName_tp);
                }
                slider.setSize(cc.size(barLength, slider.getContentSize().height));
            }
            else {
                var imageFileName = options["barFileName"];
                var imageFileName_tp = imageFileName ? this._filePath + imageFileName : null;
                if (useMergedTexture) {
                    slider.loadBarTexture(imageFileName, ccui.Widget.PLIST_TEXTURE);
                }
                else {
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
        }
        else {
            slider.loadSlidBallTextures(normalFileName_tp, pressedFileName_tp, disabledFileName_tp);
        }
        slider.setPercent(options["percent"]);

        var imageFileName = options["progressBarFileName"];
        var imageFileName_tp = imageFileName ? this._filePath + imageFileName : null;
        if (useMergedTexture) {
            slider.loadProgressBarTexture(imageFileName, ccui.Widget.PLIST_TEXTURE);
        }
        else {
            slider.loadProgressBarTexture(imageFileName_tp);
        }
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    setPropsForTextAreaFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var textArea = widget;
        textArea.setString(options["text"]);
        if (options["fontSize"] !== undefined) {
            textArea.setFontSize(options["fontSize"]);
        }
        var cr = options["colorR"]
        var cg = options["colorG"];
        var cb = options["colorB"];
        textArea.setColor(cc.color(cr, cg, cb));
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

    setPropsForTextButtonFromJsonDictionary: function (widget, options) {
        this.setPropsForButtonFromJsonDictionary(widget, options);

        var textButton = widget;
        textButton.setTitleText(options["text"] || "");
        var cri = options["textColorR"] !== undefined ? options["textColorR"] : 255;
        var cgi = options["textColorG"] !== undefined ? options["textColorG"] : 255;
        var cbi = options["textColorB"] !== undefined ? options["textColorB"] : 255;
        textButton.setTitleColor(cc.color(cri, cgi, cbi));
        if (options["fontSize"] !== undefined) {
            textButton.setTitleFontSize(options["fontSize"]);
        }
        if (options["fontName"] !== undefined) {
            textButton.setTitleFontName(options["fontName"]);
        }
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

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

    setPropsForLoadingBarFromJsonDictionary: function (widget, options) {

        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var loadingBar = widget;
        var useMergedTexture = options["useMergedTexture"];
        var imageFileName = options["texture"];
        var imageFileName_tp = imageFileName ? this._filePath + imageFileName : null;
        if (useMergedTexture) {
            loadingBar.loadTexture(imageFileName, ccui.Widget.PLIST_TEXTURE);
        }
        else {
            loadingBar.loadTexture(imageFileName_tp);
        }
        loadingBar.setDirection(options["direction"]);
        loadingBar.setPercent(options["percent"]);
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    setPropsForListViewFromJsonDictionary: function (widget, options) {
        this.setPropsForLayoutFromJsonDictionary(widget, options);
    },

    setPropsForPageViewFromJsonDictionary: function (widget, options) {
        this.setPropsForLayoutFromJsonDictionary(widget, options);
    },

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

ccs.WidgetPropertiesReader0300 = ccs.WidgetPropertiesReader.extend({
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
        }
        else {
            ccs.uiReader.storeFileDesignSize(fileName, cc.size(fileDesignWidth, fileDesignHeight));
        }
        var widgetTree = jsonDict["widgetTree"];
        var widget = this.widgetFromJsonDictionary(widgetTree);

        var size = widget.getContentSize();
        if (size.width == 0 && size.height == 0) {
            widget.setSize(cc.size(fileDesignWidth, fileDesignHeight));
        }

        var actions = jsonDict["animation"];
        var rootWidget = widget;
        ccs.actionManager.initWithDictionary(fileName, actions, rootWidget);

        widgetTree = null;
        actions = null;
        return widget;
    },
    widgetFromJsonDictionary: function (data) {
        var widget = null;
        var classname = data["classname"];
        var uiOptions = data["options"];
        if (classname == "Button") {
            widget = ccui.Button.create();
            this.setPropsForButtonFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "CheckBox") {
            widget = ccui.CheckBox.create();
            this.setPropsForCheckBoxFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "Label") {
            widget = ccui.Text.create();
            this.setPropsForLabelFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "LabelAtlas") {
            widget = ccui.TextAtlas.create();
            this.setPropsForLabelAtlasFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "LoadingBar") {
            widget = ccui.LoadingBar.create();
            this.setPropsForLoadingBarFromJsonDictionary(widget, uiOptions);
        } else if (classname == "ScrollView") {
            widget = ccui.ScrollView.create();
            this.setPropsForScrollViewFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "TextArea") {
            widget = ccui.Text.create();
            this.setPropsForLabelFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "TextButton") {
            widget = ccui.Button.create();
            this.setPropsForButtonFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "TextField") {
            widget = ccui.TextField.create();
            this.setPropsForTextFieldFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "ImageView") {
            widget = ccui.ImageView.create();
            this.setPropsForImageViewFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "Panel") {
            widget = ccui.Layout.create();
            this.setPropsForLayoutFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "Slider") {
            widget = ccui.Slider.create();
            this.setPropsForSliderFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "LabelBMFont") {
            widget = ccui.TextBMFont.create();
            this.setPropsForLabelBMFontFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "DragPanel") {
            widget = ccui.ScrollView.create();
            this.setPropsForScrollViewFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "ListView") {
            widget = ccui.ListView.create();
            this.setPropsForListViewFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "PageView") {
            widget = ccui.PageView.create();
            this.setPropsForPageViewFromJsonDictionary(widget, uiOptions);
        }
        var children = data["children"];
        for (var i = 0; i < children.length; i++) {
            var subData = children[i];
            var child = this.widgetFromJsonDictionary(subData);
            if (child) {
                if (widget instanceof ccui.PageView && child instanceof ccui.Layout) {
                    widget.addPage(child);
                } else if (widget instanceof ccui.ListView) {
                    widget.pushBackCustomItem(child);
                } else {
                    widget.addChild(child);
                }
            }
            subData = null;
        }

        uiOptions = null;
        return widget;
    },


    setPropsForWidgetFromJsonDictionary: function (widget, options) {
        var name = options["name"];
        var widgetName = name ? name : "default";
        widget.setName(widgetName);

        if (options["ignoreSize"] !== undefined) {
            widget.ignoreContentAdaptWithSize(options["ignoreSize"]);
        }
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
        widget.setPosition(x, y);
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

        widget.setLocalZOrder(options["ZOrder"]);
        var layoutParameterDic = options["layoutParameter"];
        if (layoutParameterDic) {
            var paramType = layoutParameterDic["type"];
            var parameter;
            switch (paramType) {
                case 0:
                    break;
                case 1:
                    parameter = ccui.LinearLayoutParameter.create();
                    var gravity = layoutParameterDic["gravity"];
                    parameter.setGravity(gravity);
                    break;
                case 2:
                    parameter = ccui.RelativeLayoutParameter.create();
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
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

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

    setPropsForTextAreaFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var textArea = widget;
        textArea.setString(options["text"]);
        if (options["fontSize"] !== undefined) {
            textArea.setFontSize(options["fontSize"]);
        }
        var cr = options["colorR"]
        var cg = options["colorG"];
        var cb = options["colorB"];
        textArea.setColor(cc.color(cr, cg, cb));
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

    setPropsForTextButtonFromJsonDictionary: function (widget, options) {
        this.setPropsForButtonFromJsonDictionary(widget, options);

        var textButton = widget;
        textButton.setTitleText(options["text"] || "");
        var cri = options["textColorR"] !== undefined ? options["textColorR"] : 255;
        var cgi = options["textColorG"] !== undefined ? options["textColorG"] : 255;
        var cbi = options["textColorB"] !== undefined ? options["textColorB"] : 255;
        textButton.setTitleColor(cc.color(cri, cgi, cbi));
        if (options["fontSize"] !== undefined) {
            textButton.setTitleFontSize(options["fontSize"]);
        }
        if (options["fontName"] !== undefined) {
            textButton.setTitleFontName(options["fontName"]);
        }
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

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

    setPropsForListViewFromJsonDictionary: function (widget, options) {
        this.setPropsForLayoutFromJsonDictionary(widget, options);
        var innerWidth = options["innerWidth"] || 0;
        var innerHeight = options["innerHeight"] || 0;
        widget.setInnerContainerSize(cc.size(innerWidth, innerHeight));
        widget.setDirection(options["direction"] || 0);
        widget.setGravity(options["gravity"] || 0);
        widget.setItemsMargin(options["itemMargin"] || 0);
    },

    setPropsForPageViewFromJsonDictionary: function (widget, options) {
        this.setPropsForLayoutFromJsonDictionary(widget, options);
    },

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
    }
});
