/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org

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
var kCCSVersion = 1.0;
cc.CCSGUIReader = cc.Class.extend({
    _filePath: "",
    _olderVersion: false,
    ctor: function () {
        this._filePath = "";
        this._olderVersion = false;
    },

    purgeCCSGUIReader: function () {
        this._instance = null;
    },

    getVersionInteger: function (str) {
        /*********temp***********/
        var strVersion = str;
        var length = strVersion.length;
        if (length < 7) {
            return 0;
        }
        var pos = strVersion.indexOf(".");
        var t = strVersion.substr(0, pos);
        strVersion = strVersion.substr(pos + 1, strVersion.length - 1);

        pos = strVersion.indexOf(".");
        var h = strVersion.substr(0, pos);
        strVersion = strVersion.substr(pos + 1, strVersion.length - 1);

        pos = strVersion.indexOf(".");
        var te = strVersion.substr(0, pos);
        strVersion = strVersion.substr(pos + 1, strVersion.length - 1);

        pos = strVersion.indexOf(".");
        var s;
        if(pos==-1){
            s = strVersion;
        }else{
            s = strVersion.substr(0, pos);
        }

        var it = parseInt(t);
        var ih = parseInt(h);
        var ite = parseInt(te);
        var is = parseInt(s);

        var version = it * 1000 + ih * 100 + ite * 10 + is;
        return version;
    },

    widgetFromJsonDictionary: function (data) {
        var widget = null;
        var classname = data["classname"];
        var uiOptions = data["options"];
        if (classname == "Button") {
            widget = cc.UIButton.create();
            this.setPropsForButtonFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "CheckBox") {
            widget = cc.UICheckBox.create();
            this.setPropsForCheckBoxFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "Label") {
            widget = cc.UILabel.create();
            this.setPropsForLabelFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "LabelAtlas") {
            widget = cc.UILabelAtlas.create();
            this.setPropsForLabelAtlasFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "LoadingBar") {
            widget = cc.UILoadingBar.create();
            this.setPropsForLoadingBarFromJsonDictionary(widget, uiOptions);
        } else if (classname == "ScrollView") {
            widget = cc.UIScrollView.create();
            this.setPropsForScrollViewFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "TextArea") {
            widget = cc.UITextArea.create();
            this.setPropsForTextAreaFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "TextButton") {
            widget = cc.UITextButton.create();
            this.setPropsForTextButtonFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "TextField") {
            widget = cc.UITextField.create();
            this.setPropsForTextFieldFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "ImageView") {
            widget = cc.UIImageView.create();
            this.setPropsForImageViewFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "Panel") {
            widget = cc.UIPanel.create();
            this.setPropsForPanelFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "Slider") {
            widget = cc.UISlider.create();
            this.setPropsForSliderFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "ListView") {
//        widget = UIListView.create();
//        setPropsForListViewFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "PageView") {
            widget = cc.UIPageView.create();
            this.setPropsForPageViewFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "LabelBMFont") {
            widget = cc.UILabelBMFont.create();
            this.setPropsForLabelBMFontFromJsonDictionary(widget, uiOptions);
        }
        else if (classname == "DragPanel") {
            widget = cc.UIDragPanel.create();
            this.setPropsForDragPanelFromJsonDictionary(widget, uiOptions);
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


    widgetFromJsonFile: function (fileName) {
        this._olderVersion = false;
        var des = null;
        var jsonpath = "";
        var jsonDict = null;
        jsonpath = cc.FileUtils.getInstance().fullPathForFilename(fileName);

        var size = 0;
        des = cc.FileUtils.getInstance().getTextFileData(jsonpath, "r", size);
        if (!des) {
            cc.log("read json file[" + fileName + "] error!");
            return null;
        }
        var strDes = des;
        jsonDict = JSON.parse(strDes);

        var fileVersion = jsonDict["version"];
        if (!fileVersion || this.getVersionInteger(fileVersion) < 250) {
            this._olderVersion = true;
        }

        var textures = jsonDict["textures"];
        var pos = jsonpath.lastIndexOf('/');
        this._filePath = jsonpath.substr(0, pos + 1);
        for (var i = 0; i < textures.length; i++) {
            var file = textures[i];
            var tp = this._filePath;
            tp+=file;
            cc.UIHelper.getInstance().addSpriteFrame(tp);
        }
        var fileDesignWidth = jsonDict["designWidth"];
        var fileDesignHeight = jsonDict["designHeight"];
        if (fileDesignWidth <= 0 || fileDesignHeight <= 0) {
            cc.log("Read design size error!");
            var winSize = cc.Director.getInstance().getWinSize();
            cc.UIHelper.getInstance().setFileDesignWidth(winSize.width);
            cc.UIHelper.getInstance().setFileDesignHeight(winSize.height);
        }
        else {
            cc.UIHelper.getInstance().setFileDesignWidth(fileDesignWidth);
            cc.UIHelper.getInstance().setFileDesignHeight(fileDesignHeight);
        }
        var widgetTree = jsonDict["widgetTree"];
        var widget = this.widgetFromJsonDictionary(widgetTree);

        var size = widget.getContentSize();
        if (size.width == 0 && size.height == 0) {
            widget.setSize(cc.size(fileDesignWidth, fileDesignHeight));
        }

        var actions = jsonDict["animation"];

        var rootWidget = widget;
        cc.CCSActionManager.getInstance().initWithDictionary(fileName, actions, rootWidget);

        widgetTree = null;
        actions = null;
        jsonDict = null;
        des = null;
        return widget;
    },

    setPropsForWidgetFromJsonDictionary: function (widget, options) {
        var ignoreSizeExsit = options["ignoreSize"];
        if (ignoreSizeExsit) {
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
        widget.setPosition(cc.p(x, y));
        var sx = options["scaleX"];
        if (sx) {
            widget.setScaleX(options["scaleX"]);
        }
        var sy = options["scaleY"];
        if (sy) {
            widget.setScaleY(options["scaleY"]);
        }
        var rt = options["rotation"];
        if (rt) {
            widget.setRotation(options["rotation"]);
        }
        var vb = options["visible"];
        if (vb) {
            widget.setVisible(options["visible"]);
        }
//    widget.setUseMergedTexture(options["useMergedTexture"));
        var z = options["ZOrder"];
        widget.setZOrder(z);
    },

    setColorPropsForWidgetFromJsonDictionary: function (widget, options) {
        var op = options["opacity"];
        if (op) {
            widget.setOpacity(options["opacity"]);
        }
        var colorR = options["colorR"];
        var colorG = options["colorG"];
        var colorB = options["colorB"];
        colorR = (colorR || colorR == 0) ? options["colorR"] : 255;
        colorG = (colorG || colorG == 0) ? options["colorG"] : 255;
        colorB = (colorB || colorB == 0) ? options["colorB"] : 255;
        widget.setColor(cc.c3b(colorR, colorG, colorB));
        var apx = options["anchorPointX"];
        apx = (apx || apx == 0) ? apx : ((widget.getWidgetType() == cc.WidgetType.Widget) ? 0.5 : 0);
        var apy = options["anchorPointY"];
        apy = (apy || apy == 0) ? apy : ((widget.getWidgetType() == cc.WidgetType.Widget) ? 0.5 : 0);
        widget.setAnchorPoint(cc.p(apx, apy));
        var flipX = options["flipX"];
        var flipY = options["flipY"];
        widget.setFlippedX(flipX);
        widget.setFlippedY(flipY);
    },

    setPropsForButtonFromJsonDictionary: function (widget, options) {
        if (this._olderVersion) {
            this.setPropsForWidgetFromJsonDictionary(widget, options);
            var button = widget;
            var scale9Enable = options["scale9Enable"];
            button.setScale9Enabled(scale9Enable);

            var tp_n = this._filePath;
            var tp_p = this._filePath;
            var tp_d = this._filePath;

            var normalFileName = options["normal"];
            var pressedFileName = options["pressed"];
            var disabledFileName = options["disabled"];

            var normalFileName_tp = normalFileName ? tp_n + normalFileName : null;
            var pressedFileName_tp = pressedFileName ? tp_p + pressedFileName : null;
            var disabledFileName_tp = disabledFileName ? tp_d + disabledFileName : null;
            var useMergedTexture = options["useMergedTexture"];
            if (scale9Enable) {
                var cx = options["capInsetsX"];
                var cy = options["capInsetsY"];
                var cw = options["capInsetsWidth"];
                var ch = options["capInsetsHeight"];

                if (useMergedTexture) {
                    button.loadTextures(normalFileName, pressedFileName, disabledFileName, cc.TextureResType.PLIST);
                }
                else {
                    button.loadTextures(normalFileName_tp, pressedFileName_tp, disabledFileName_tp);
                }
                button.setCapInsets(cc.rect(cx, cy, cw, ch));
                var sw = options["scale9Width"];
                var sh = options["scale9Height"];
                if (sw && sh) {
                    var swf = options["scale9Width"];
                    var shf = options["scale9Height"];
                    button.setSize(cc.size(swf, shf));
                }
            }
            else {
                if (useMergedTexture) {
                    button.loadTextures(normalFileName, pressedFileName, disabledFileName, cc.TextureResType.PLIST);
                }
                else {
                    button.loadTextures(normalFileName_tp, pressedFileName_tp, disabledFileName_tp);
                }
            }
            this.setColorPropsForWidgetFromJsonDictionary(widget, options);
        }
        else {
            this.setPropsForWidgetFromJsonDictionary(widget, options);
            var button = widget;
            var scale9Enable = options["scale9Enable"];
            button.setScale9Enabled(scale9Enable);

            var normalDic = options["normalData"];
            var normalType = normalDic["resourceType"];
            switch (normalType) {
                case 0:
                    var tp_n = this._filePath;
                    var normalFileName = normalDic["path"];
                    var normalFileName_tp = normalFileName ? tp_n + normalFileName : null;
                    button.loadTextureNormal(normalFileName_tp);
                    break;
                case 1:
                    var normalFileName = normalDic["path"];
                    button.loadTextureNormal(normalFileName, cc.TextureResType.PLIST);
                    break;
                default:
                    break;
            }
            normalDic = null;
            var pressedDic = options["pressedData"];
            var pressedType = pressedDic["resourceType"];
            switch (pressedType) {
                case 0:
                {
                    var tp_p = this._filePath;
                    var pressedFileName = pressedDic["path"];
                    var pressedFileName_tp = pressedFileName ? tp_p + pressedFileName : null;
                    button.loadTexturePressed(pressedFileName_tp);
                    break;
                }
                case 1:
                {
                    var pressedFileName = pressedDic["path"];
                    button.loadTexturePressed(pressedFileName, cc.TextureResType.PLIST);
                    break;
                }
                default:
                    break;
            }
            pressedDic = null;
            var disabledDic = options["disabledData"];
            var disabledType = disabledDic["resourceType"];
            switch (disabledType) {
                case 0:
                    var tp_d = this._filePath;
                    var disabledFileName = disabledDic["path"];
                    var disabledFileName_tp = disabledFileName ? tp_d + disabledFileName : null;
                    button.loadTextureDisabled(disabledFileName_tp);
                    break;
                case 1:
                    var disabledFileName = disabledDic["path"];
                    button.loadTextureDisabled(disabledFileName, cc.TextureResType.PLIST);
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
                var sw = options["scale9Width"];
                var sh = options["scale9Height"];
                if (sw && sh) {
                    var swf = options["scale9Width"];
                    var shf = options["scale9Height"];
                    button.setSize(cc.size(swf, shf));
                }
            }
            this.setColorPropsForWidgetFromJsonDictionary(widget, options);
        }
    },

    setPropsForCheckBoxFromJsonDictionary: function (widget, options) {
        if (this._olderVersion) {
            this.setPropsForWidgetFromJsonDictionary(widget, options);
            var checkBox = widget;
            var backGroundFileName = options["backGroundBox"];
            var backGroundSelectedFileName = options["backGroundBoxSelected"];
            var frontCrossFileName = options["frontCross"];
            var backGroundDisabledFileName = options["backGroundBoxDisabled"];
            var frontCrossDisabledFileName = options["frontCrossDisabled"];


            var tp_b = this._filePath;
            var tp_bs = this._filePath;
            var tp_c = this._filePath;
            var tp_bd = this._filePath;
            var tp_cd = this._filePath;

            var backGroundFileName_tp = backGroundFileName ? tp_b + backGroundFileName : null;
            var backGroundSelectedFileName_tp = backGroundSelectedFileName ? tp_bs + backGroundSelectedFileName : null;
            var frontCrossFileName_tp = frontCrossFileName ? tp_c + frontCrossFileName : null;
            var backGroundDisabledFileName_tp = backGroundDisabledFileName ? tp_bd + backGroundDisabledFileName : null;
            var frontCrossDisabledFileName_tp = frontCrossDisabledFileName ? tp_cd + frontCrossDisabledFileName : null;
            var useMergedTexture = options["useMergedTexture"];

            if (useMergedTexture) {
                checkBox.loadTextures(backGroundFileName, backGroundSelectedFileName, frontCrossFileName, backGroundDisabledFileName, frontCrossDisabledFileName, cc.TextureResType.PLIST);
            }
            else {
                checkBox.loadTextures(backGroundFileName_tp, backGroundSelectedFileName_tp, frontCrossFileName_tp, backGroundDisabledFileName_tp, frontCrossDisabledFileName_tp);
            }

            this.setColorPropsForWidgetFromJsonDictionary(widget, options);
        }
        else {
            this.setPropsForWidgetFromJsonDictionary(widget, options);
            var checkBox = widget;

            var backGroundDic = options["backGroundBoxData"];
            var backGroundType = backGroundDic["resourceType"];
            switch (backGroundType) {
                case 0:
                    var tp_b = this._filePath;
                    var backGroundFileName = backGroundDic["path"];
                    var backGroundFileName_tp = backGroundFileName ? tp_b + backGroundFileName : null;
                    checkBox.loadTextureBackGround(backGroundFileName_tp);
                    break;
                case 1:
                    var backGroundFileName = backGroundDic["path"];
                    checkBox.loadTextureBackGround(backGroundFileName, cc.RESOURCE_TYPE.PLIST);
                    break;
                default:
                    break;
            }
            backGroundDic = null;

            var backGroundSelectedDic = options["backGroundBoxSelectedData"];
            var backGroundSelectedType = backGroundSelectedDic["resourceType"];
            switch (backGroundSelectedType) {
                case 0:
                    var tp_bs = this._filePath;
                    var backGroundSelectedFileName = backGroundSelectedDic["path"];
                    var backGroundSelectedFileName_tp = backGroundSelectedFileName ? tp_bs + backGroundSelectedFileName : null;
                    checkBox.loadTextureBackGroundSelected(backGroundSelectedFileName_tp);
                    break;
                case 1:
                    var backGroundSelectedFileName = backGroundSelectedDic["path"];
                    checkBox.loadTextureBackGroundSelected(backGroundSelectedFileName, cc.RESOURCE_TYPE.PLIST);
                    break;
                default:
                    break;
            }
            backGroundSelectedDic = null;

            var frontCrossDic = options["frontCrossData"];
            var frontCrossType = frontCrossDic["resourceType"];
            switch (frontCrossType) {
                case 0:
                    var tp_c = this._filePath;
                    var frontCrossFileName = frontCrossDic["path"];
                    var frontCrossFileName_tp = frontCrossFileName ? tp_c + frontCrossFileName : null;
                    checkBox.loadTextureFrontCross(frontCrossFileName_tp);
                    break;
                case 1:
                    var frontCrossFileName = frontCrossDic["path"];
                    checkBox.loadTextureFrontCross(frontCrossFileName, cc.RESOURCE_TYPE.PLIST);
                    break;
                default:
                    break;
            }
            frontCrossDic = null;

            var backGroundDisabledDic = options["backGroundBoxDisabledData"];
            var backGroundDisabledType = backGroundDisabledDic["resourceType"];
            switch (backGroundDisabledType) {
                case 0:
                    var tp_bd = this._filePath;
                    var backGroundDisabledFileName = backGroundDisabledDic["path"];
                    var backGroundDisabledFileName_tp = backGroundDisabledFileName ? tp_bd + backGroundDisabledFileName : null;
                    checkBox.loadTextureBackGroundDisabled(backGroundDisabledFileName_tp);
                    break;
                case 1:
                    var backGroundDisabledFileName = backGroundDisabledDic["path"];
                    checkBox.loadTextureBackGroundDisabled(backGroundDisabledFileName, cc.RESOURCE_TYPE.PLIST);
                    break;
                default:
                    break;
            }
            backGroundDisabledDic = null;

            var frontCrossDisabledDic = options["frontCrossDisabledData"];
            var frontCrossDisabledType = frontCrossDisabledDic["resourceType"];
            switch (frontCrossDisabledType) {
                case 0:
                    var tp_cd = this._filePath;
                    var frontCrossDisabledFileName = options["path"];
                    var frontCrossDisabledFileName_tp = frontCrossDisabledFileName ? tp_cd + frontCrossDisabledFileName : null;
                    checkBox.loadTextureFrontCrossDisabled(frontCrossDisabledFileName_tp);
                    break;
                case 1:
                    var frontCrossDisabledFileName = options["path"];
                    checkBox.loadTextureFrontCrossDisabled(frontCrossDisabledFileName, cc.RESOURCE_TYPE.PLIST);
                    break;
                default:
                    break;
            }
            frontCrossDisabledDic = null;

            this.setColorPropsForWidgetFromJsonDictionary(widget, options);
        }
    },

    setPropsForImageViewFromJsonDictionary: function (widget, options) {
        if (this._olderVersion) {
            this.setPropsForWidgetFromJsonDictionary(widget, options);

            var imageView = widget;
            var imageFileName = options["fileName"];
            var scale9EnableExist = options["scale9Enable"];
            var scale9Enable = false;
            if (scale9EnableExist) {
                scale9Enable = options["scale9Enable"];
            }
            imageView.setScale9Enabled(scale9Enable);

            var tp_i = this._filePath;
            var imageFileName_tp = null;
            if (imageFileName) {
                imageFileName_tp = tp_i + imageFileName;
            }

            var useMergedTexture = options["useMergedTexture"];
            if (scale9Enable) {
                if (useMergedTexture) {
                    imageView.loadTexture(imageFileName, cc.RESOURCE_TYPE.PLIST);
                }
                else {
                    imageView.loadTexture(imageFileName_tp);
                }

                var sw = options["scale9Width"];
                var sh = options["scale9Height"];
                if (sw && sh) {
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
                    imageView.loadTexture(imageFileName, cc.RESOURCE_TYPE.PLIST);
                }
                else {
                    imageView.loadTexture(imageFileName_tp);
                }
            }
            this.setColorPropsForWidgetFromJsonDictionary(widget, options);
        }
        else {
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
                    imageView.loadTexture(imageFileName, cc.RESOURCE_TYPE.PLIST);
                    break;
                default:
                    break;
            }
            imageFileNameDic = null;

            var scale9EnableExist = options["scale9Enable"];
            var scale9Enable = false;
            if (scale9EnableExist) {
                scale9Enable = options["scale9Enable"];
            }
            imageView.setScale9Enabled(scale9Enable);


            if (scale9Enable) {
                var sw = options["scale9Width"];
                var sh = options["scale9Height"];
                if (sw && sh) {
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
        }
    },

    setPropsForLabelFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var label = widget;
        var touchScaleChangeAble = options["touchScaleEnable"];
        label.setTouchScaleChangeAble(touchScaleChangeAble);
        var text = options["text"];
        label.setText(text);
        var fs = options["fontSize"];
        if (fs) {
            label.setFontSize(options["fontSize"]);
        }
        var fn = options["fontName"];
        if (fn) {
            label.setFontName(options["fontName"]);
        }
        var cro = options["colorR"];
        var cgo = options["colorG"];
        var cbo = options["colorB"];
        var cr = cro ? options["colorR"] : 255;
        var cg = cgo ? options["colorG"] : 255;
        var cb = cbo ? options["colorB"] : 255;
        var tc = cc.c3b(cr, cg, cb);
        label.setColor(tc);
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    setPropsForLabelAtlasFromJsonDictionary: function (widget, options) {
        if (this._olderVersion) {
            this.setPropsForWidgetFromJsonDictionary(widget, options);
            var labelAtlas = widget;
            var sv = options.hasOwnProperty("stringValue");
            var cmf = options.hasOwnProperty("charMapFile");
            var iw = options.hasOwnProperty("itemWidth");
            var ih = options.hasOwnProperty("itemHeight");
            var scm = options.hasOwnProperty("startCharMap");
            if (sv && cmf && iw && ih && scm && options["charMapFile"]) {
                var tp_c = this._filePath;
                var cmf_tp = null;
                var cmft = options["charMapFile"];
                cmf_tp = tp_c + cmft;

                labelAtlas.setProperty(options["stringValue"], cmf_tp, options["itemWidth"], options["itemHeight"], options["startCharMap"]);
            }
            this.setColorPropsForWidgetFromJsonDictionary(widget, options);
        }
        else {
            this.setPropsForWidgetFromJsonDictionary(widget, options);
            var labelAtlas = widget;
            var sv = options.hasOwnProperty("stringValue");
            var cmf = options.hasOwnProperty("charMapFile");
            var iw = options.hasOwnProperty("itemWidth");
            var ih = options.hasOwnProperty("itemHeight");
            var scm = options.hasOwnProperty("startCharMap");
            if (sv && cmf && iw && ih && scm) {

                var cmftDic = options["charMapFileData"];
                var cmfType = cmftDic["resourceType"];
                switch (cmfType) {
                    case 0:
                        var tp_c = this._filePath;
                        var cmfPath = cmftDic["path"];
                        var cmf_tp = tp_c+cmfPath;
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
        }
    },

    setPropsForContainerWidgetFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var containerWidget = widget;
        if (containerWidget instanceof cc.UIScrollView ||
            containerWidget instanceof cc.UIListView ||
            containerWidget instanceof cc.UIDragPanel) {
            containerWidget.setClippingEnable(options["clipAble"]);
        }
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    setPropsForPanelFromJsonDictionary: function (widget, options) {
        if (this._olderVersion) {
            this.setPropsForContainerWidgetFromJsonDictionary(widget, options);
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
            panel.setBackGroundColor(cc.c3b(scr, scg, scb), cc.c3b(ecr, ecg, ecb));
            panel.setBackGroundColor(cc.c3b(cr, cg, cb));
            panel.setBackGroundColorOpacity(co);

            var tp_b = this._filePath;
            var imageFileName = options["backGroundImage"];
            var imageFileName_tp = imageFileName ? tp_b + imageFileName : null;
            var useMergedTexture = options["useMergedTexture"];
            if (backGroundScale9Enable) {
                var cx = options["capInsetsX"];
                var cy = options["capInsetsY"];
                var cw = options["capInsetsWidth"];
                var ch = options["capInsetsHeight"];
                if (useMergedTexture) {
                    panel.setBackGroundImage(imageFileName, cc.RESOURCE_TYPE.PLIST);
                }
                else {
                    panel.setBackGroundImage(imageFileName_tp);
                }
                panel.setBackGroundImageCapInsets(cc.rect(cx, cy, cw, ch));
            }
            else {

                if (useMergedTexture) {
                    panel.setBackGroundImage(imageFileName, cc.RESOURCE_TYPE.PLIST);
                }
                else {
                    panel.setBackGroundImage(imageFileName_tp);
                }
            }
            this.setColorPropsForWidgetFromJsonDictionary(widget, options);
        }
        else {
            this.setPropsForContainerWidgetFromJsonDictionary(widget, options);
            var panel = widget;
            var backGroundScale9Enable = options["backGroundScale9Enable"];
            panel.setBackGroundImageScale9Enabled(backGroundScale9Enable);
            var cr = options["bgColorR"];
            var cg = options["bgColorG"]
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
            panel.setBackGroundColor(cc.c3b(scr, scg, scb), cc.c3b(ecr, ecg, ecb));
            panel.setBackGroundColor(cc.c3b(cr, cg, cb));
            panel.setBackGroundColorOpacity(co);


            var imageFileNameDic = options["backGroundImageData"]||{};
            var imageFileNameType = imageFileNameDic["resourceType"];
            switch (imageFileNameType) {
                case 0:
                    var tp_b = this._filePath;
                    var imageFileName = imageFileNameDic["path"];
                    var imageFileName_tp = imageFileName ? tp_b + imageFileName : null;
                    panel.setBackGroundImage(imageFileName_tp);
                    break;
                case 1:
                    var imageFileName = imageFileNameDic["path"];
                    panel.setBackGroundImage(imageFileName, cc.RESOURCE_TYPE.PLIST);
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
            this.setColorPropsForWidgetFromJsonDictionary(widget, options);
        }
    },

    setPropsForScrollViewFromJsonDictionary: function (widget, options) {
        this.setPropsForPanelFromJsonDictionary(widget, options);
        var scrollView = widget;
        var innerWidth = options["innerWidth"];
        var innerHeight = options["innerHeight"];
        scrollView.setInnerContainerSize(cc.size(innerWidth, innerHeight));
        /* gui mark */
        var direction = options["direction"];
        scrollView.setDirection(direction);
        /**/
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    setPropsForSliderFromJsonDictionary: function (widget, options) {
        if (this._olderVersion) {
            this.setPropsForWidgetFromJsonDictionary(widget, options);
            var slider = widget;

            var barTextureScale9Enable = options["barTextureScale9Enable"];
            slider.setScale9Enabled(barTextureScale9Enable);
            var bt = options["barFileName"];
            var barLength = options["length"];
            var useMergedTexture = options["useMergedTexture"];
            if (bt) {
                if (barTextureScale9Enable) {
                    var tp_b = this._filePath;
                    var imageFileName = options["barFileName"];
                    var imageFileName_tp = imageFileName ? tp_b + imageFileName : null;
                    if (useMergedTexture) {
                        slider.loadBarTexture(imageFileName, cc.RESOURCE_TYPE.PLIST);
                    }
                    else {
                        slider.loadBarTexture(imageFileName_tp);
                    }
                    slider.setSize(cc.size(barLength, slider.getContentSize().height));
                }
                else {
                    var tp_b = this._filePath;
                    var imageFileName = options["barFileName"];
                    var imageFileName_tp = imageFileName ? tp_b + imageFileName : null;
                    if (useMergedTexture) {
                        slider.loadBarTexture(imageFileName, cc.RESOURCE_TYPE.PLIST);
                    }
                    else {
                        slider.loadBarTexture(imageFileName_tp);
                    }
                }
            }
            var tp_n = this._filePath;
            var tp_p = this._filePath;
            var tp_d = this._filePath;

            var normalFileName = options["ballNormal"];
            var pressedFileName = options["ballPressed"];
            var disabledFileName = options["ballDisabled"];

            var normalFileName_tp = normalFileName ? tp_n + normalFileName : null;
            var pressedFileName_tp = pressedFileName ? tp_p + pressedFileName : null;
            var disabledFileName_tp = disabledFileName ? tp_d + disabledFileName : null;
            if (useMergedTexture) {
                slider.loadSlidBallTextures(normalFileName, pressedFileName, disabledFileName, cc.RESOURCE_TYPE.PLIST);
            }
            else {
                slider.loadSlidBallTextures(normalFileName_tp, pressedFileName_tp, disabledFileName_tp);
            }
            slider.setPercent(options["percent"]);

            var tp_b = this._filePath;
            var imageFileName = options["progressBarFileName"];
            var imageFileName_tp = imageFileName ? tp_b + imageFileName : null;
            if (useMergedTexture) {
                slider.loadProgressBarTexture(imageFileName, cc.RESOURCE_TYPE.PLIST);
            }
            else {
                slider.loadProgressBarTexture(imageFileName_tp);
            }
            this.setColorPropsForWidgetFromJsonDictionary(widget, options);
        }
        else {
            this.setPropsForWidgetFromJsonDictionary(widget, options);
            var slider = widget;

            var barTextureScale9Enable = options["barTextureScale9Enable"];
            slider.setScale9Enabled(barTextureScale9Enable);
            var bt = options["barFileName"];
            var barLength = options["length"];
            if (bt) {
                if (barTextureScale9Enable) {

                    var imageFileNameDic = options["barFileNameData"];
                    var imageFileType = imageFileNameDic["resourceType"];
                    switch (imageFileType) {
                        case 0:
                            var tp_b = this._filePath;
                            var imageFileName = imageFileNameDic["path"];
                            var imageFileName_tp = imageFileName ? tp_b + imageFileName : null;
                            slider.loadBarTexture(imageFileName_tp);
                            break;
                        case 1:
                            var imageFileName = imageFileNameDic["path"];
                            slider.loadBarTexture(imageFileName, cc.RESOURCE_TYPE.PLIST);
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
                            var tp_b = this._filePath;
                            var imageFileName = imageFileNameDic["path"];
                            var imageFileName_tp = imageFileName ? tp_b + imageFileName : null;
                            slider.loadBarTexture(imageFileName_tp);
                            break;
                        case 1:
                            var imageFileName = imageFileNameDic["path"];
                            slider.loadBarTexture(imageFileName, cc.RESOURCE_TYPE.PLIST);
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
                    var tp_n = this._filePath;
                    var normalFileName = normalDic["path"];
                    var normalFileName_tp = normalFileName ? tp_n + normalFileName : null;
                    slider.loadSlidBallTextureNormal(normalFileName_tp);
                    break;
                case 1:
                    var normalFileName = normalDic["path"];
                    slider.loadSlidBallTextureNormal(normalFileName, cc.RESOURCE_TYPE.PLIST);
                    break;
                default:
                    break;
            }
            normalDic = null;

            var pressedDic = options["ballPressedData"];
            var pressedType = pressedDic["resourceType"];
            switch (pressedType) {
                case 0:
                    var tp_p = this._filePath;
                    var pressedFileName = pressedDic["path"];
                    var pressedFileName_tp = pressedFileName ? tp_p + pressedFileName : null;
                    slider.loadSlidBallTexturePressed(pressedFileName_tp);
                    break;
                case 1:
                    var pressedFileName = pressedDic["path"];
                    slider.loadSlidBallTexturePressed(pressedFileName, cc.RESOURCE_TYPE.PLIST);
                    break;
                default:
                    break;
            }
            pressedDic = null;

            var disabledDic = options["ballDisabledData"];
            var disabledType = disabledDic["resourceType"];
            switch (disabledType) {
                case 0:
                    var tp_d = this._filePath;
                    var disabledFileName = disabledDic["path"];
                    var disabledFileName_tp = disabledFileName ? tp_d + disabledFileName : null;
                    slider.loadSlidBallTextureDisabled(disabledFileName_tp);
                    break;
                case 1:
                    var disabledFileName = disabledDic["path"];
                    slider.loadSlidBallTextureDisabled(disabledFileName, cc.RESOURCE_TYPE.PLIST);
                    break;
                default:
                    break;
            }
            disabledDic = null;

            slider.setPercent(options["percent"]);

            var progressBarDic = options["progressBarData"];
            var progressBarType = progressBarDic["resourceType"];
            switch (progressBarType) {
                case 0:
                    var tp_b = this._filePath;
                    var imageFileName = progressBarDic["path"];
                    var imageFileName_tp = imageFileName ? tp_b + imageFileName : null;
                    slider.loadProgressBarTexture(imageFileName_tp);
                    break;
                case 1:
                    var imageFileName = progressBarDic["path"];
                    slider.loadProgressBarTexture(imageFileName, cc.RESOURCE_TYPE.PLIST);
                    break;
                default:
                    break;
            }
            this.setColorPropsForWidgetFromJsonDictionary(widget, options);
        }
    },

    setPropsForTextAreaFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var textArea = widget;
        textArea.setText(options["text"]);
        var fs = options["fontSize"];
        if (fs) {
            textArea.setFontSize(options["fontSize"]);
        }
        var cr = options["colorR"]
        var cg = options["colorG"];
        var cb = options["colorB"];
        textArea.setColor(cc.c3b(cr, cg, cb));
        textArea.setFontName(options["fontName"]);
        var aw = options["areaWidth"];
        var ah = options["areaHeight"];
        if (aw && ah) {
            var size = cc.size(options["areaWidth"], options["areaHeight"]);
            textArea.setTextAreaSize(size);
        }
        var ha = options["hAlignment"];
        if (ha) {
            textArea.setTextHorizontalAlignment(options["hAlignment"]);
        }
        var va = options["vAlignment"];
        if (va) {
            textArea.setTextVerticalAlignment(options["vAlignment"]);
        }
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    setPropsForTextButtonFromJsonDictionary: function (widget, options) {
        this.setPropsForButtonFromJsonDictionary(widget, options);

        var textButton = widget;
        textButton.setTitleText(options["text"]||"");
        var cr = options["textColorR"];
        var cg = options["textColorG"];
        var cb = options["textColorB"];
        var cri = cr ? options["textColorR"] : 255;
        var cgi = cg ? options["textColorG"] : 255;
        var cbi = cb ? options["textColorB"] : 255;
        textButton.setTitleColor(cc.c3b(cri, cgi, cbi));
        var fs = options["fontSize"];
        if (fs) {
            textButton.setTitleFontSize(options["fontSize"]);
        }
        var fn = options["fontName"];
        if (fn) {
            textButton.setTitleFontName(options["fontName"]);
        }
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    setPropsForTextFieldFromJsonDictionary: function (widget, options) {
        this.setPropsForWidgetFromJsonDictionary(widget, options);
        var textField = widget;
        var ph = options["placeHolder"];
        if (ph) {
            textField.setPlaceHolder(options["placeHolder"]);
        }
        textField.setText(options["text"]);
        var fs = options["fontSize"];
        if (fs) {
            textField.setFontSize(options["fontSize"]);
        }
        var fn = options["fontName"];
        if (fn) {
            textField.setFontName(options["fontName"]);
        }
        var tsw = options["touchSizeWidth"];
        var tsh = options["touchSizeHeight"];
        if (tsw && tsh) {
            textField.setTouchSize(cc.size(options["touchSizeWidth"], options["touchSizeHeight"]));
        }

        var dw = options["width"];
        var dh = options["height"];
        if (dw > 0.0 || dh > 0.0) {
            //textField.setSize(CCSizeMake(dw, dh));
        }
        var maxLengthEnable = options["maxLengthEnable"];
        textField.setMaxLengthEnable(maxLengthEnable);

        if (maxLengthEnable) {
            var maxLength = options["maxLength"];
            textField.setMaxLength(maxLength);
        }
        var passwordEnable = options["passwordEnable"];
        textField.setPasswordEnable(passwordEnable);
        if (passwordEnable) {
            textField.setPasswordStyleText(options["passwordStyleText"]);
        }
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    setPropsForLoadingBarFromJsonDictionary: function (widget, options) {
        if (this._olderVersion) {
            this.setPropsForWidgetFromJsonDictionary(widget, options);
            var loadingBar = widget;
            var useMergedTexture = options["useMergedTexture"];
            var tp_b = this._filePath;
            var imageFileName = options["texture"];
            var imageFileName_tp = imageFileName ? tp_b + imageFileName : null;
            if (useMergedTexture) {
                loadingBar.loadTexture(imageFileName, cc.RESOURCE_TYPE.PLIST);
            }
            else {
                loadingBar.loadTexture(imageFileName_tp);
            }
            loadingBar.setDirection(options["direction"]);
            loadingBar.setPercent(options["percent"]);
            this.setColorPropsForWidgetFromJsonDictionary(widget, options);
        }
        else {
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
                    loadingBar.loadTexture(imageFileName, cc.RESOURCE_TYPE.PLIST);
                    break;
                default:
                    break;
            }
            imageFileNameDic = null;

            /* gui mark add load bar scale9 parse */
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
            /**/

            loadingBar.setDirection(options["direction"]);
            loadingBar.setPercent(options["percent"]);
            this.setColorPropsForWidgetFromJsonDictionary(widget, options);
        }
    },

    setPropsForListViewFromJsonDictionary: function (widget, options) {
        this.setPropsForScrollViewFromJsonDictionary(widget, options);
    },

    setPropsForPageViewFromJsonDictionary: function (widget, options) {
        this.setPropsForPanelFromJsonDictionary(widget, options);
        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    },

    setPropsForLabelBMFontFromJsonDictionary: function (widget, options) {
        if (this._olderVersion) {
            this.setPropsForWidgetFromJsonDictionary(widget, options);

            var labelBMFont = widget;

            var tp_c = this._filePath;
            var cmf_tp = null;
            var cmft = options["fileName"];
            cmf_tp = tp_c + cmft;

            labelBMFont.setFntFile(cmf_tp);

            var text = options["text"];
            labelBMFont.setText(text);

            this.setColorPropsForWidgetFromJsonDictionary(widget, options);
        }
        else {
            this.setPropsForWidgetFromJsonDictionary(widget, options);

            var labelBMFont = widget;

            var cmftDic = options["fileNameData"];
            var cmfType = cmftDic["resourceType"];
            switch (cmfType) {
                case 0:
                    var tp_c = this._filePath;
                    var cmfPath = cmftDic["path"];
                    var cmf_tp = tp_c + cmfPath;
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
            labelBMFont.setText(text);

            this.setColorPropsForWidgetFromJsonDictionary(widget, options);
        }
    },

    setPropsForDragPanelFromJsonDictionary: function (widget, options) {
        this.setPropsForPanelFromJsonDictionary(widget, options);

        var dragPanel = widget;

        var bounceEnable = options["bounceEnable"];
        dragPanel.setBounceEnabled(bounceEnable);

        var innerWidth = options["innerWidth"];
        var innerHeight = options["innerHeight"];
        dragPanel.setInnerContainerSize(cc.size(innerWidth, innerHeight));

        this.setColorPropsForWidgetFromJsonDictionary(widget, options);
    }
});
cc.CCSGUIReader._instance = null;
cc.CCSGUIReader.getInstance = function () {
    if (!this._instance) {
        this._instance = new cc.CCSGUIReader();
    }
    return this._instance;
};
