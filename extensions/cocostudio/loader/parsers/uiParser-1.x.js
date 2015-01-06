(function(load, baseParser){

    var Parser = baseParser.extend({

        addSpriteFrame: function(textures, resourcePath){
            if(!textures) return;
            for (var i = 0; i < textures.length; i++) {
                cc.spriteFrameCache.addSpriteFrames(resourcePath + textures[i]);
            }
        },

        pretreatment: function(json, resourcePath){
            this.addSpriteFrame(json["textures"], resourcePath);
        },

        deferred: function(json, resourcePath, node, file){
            if(node){
                ccs.actionManager.initWithDictionary(file, json["animation"], node);
                node.setContentSize(cc.size(json["designWidth"], json["designHeight"]));
            }
        }

    });
    var parser = new Parser();


    parser.generalAttributes = function(widget, options){
        var ignoreSizeExsit = options["ignoreSize"];
        if(ignoreSizeExsit != null)
            widget.ignoreContentAdaptWithSize(ignoreSizeExsit);

        widget.setSizeType(options["sizeType"]);
        widget.setPositionType(options["positionType"]);

        widget.setSizePercent(cc.p(options["sizePercentX"], options["sizePercentY"]));
        widget.setPositionPercent(cc.p(options["positionPercentX"], options["positionPercentY"]));

        /* adapt screen */
        var w = 0, h = 0;
        var adaptScreen = options["adaptScreen"];
        if (adaptScreen) {
            var screenSize = cc.director.getWinSize();
            w = screenSize.width;
            h = screenSize.height;
        } else {
            w = options["width"];
            h = options["height"];
        }
        widget.setContentSize(w, h);

        widget.setTag(options["tag"]);
        widget.setActionTag(options["actiontag"]);
        widget.setTouchEnabled(options["touchAble"]);
        var name = options["name"];
        var widgetName = name ? name : "default";
        widget.setName(widgetName);

        var x = options["x"];
        var y = options["y"];
        widget.setPosition(x, y);

        var sx = options["scaleX"]!=null ? options["scaleX"] : 1;
        widget.setScaleX(sx);

        var sy = options["scaleY"]!=null ? options["scaleY"] : 1;
        widget.setScaleY(sy);

        var rt = options["rotation"] || 0;
        widget.setRotation(rt);

        var vb = options["visible"] || false;
        if(vb != null)
            widget.setVisible(vb);
        widget.setLocalZOrder(options["ZOrder"]);

        var layout = options["layoutParameter"];
        if(layout != null){
            var layoutParameterDic = options["layoutParameter"];
            var paramType = layoutParameterDic["type"];
            var parameter = null;

            switch(paramType){
                case 0:
                    break;
                case 1:
                    parameter = new ccui.LinearLayoutParameter();
                    var gravity = layoutParameterDic["gravity"];
                    parameter.setGravity(gravity);
                    break;
                case 2:
                    parameter = new ccui.RelativeLayoutParameter();
                    var rParameter = parameter;
                    var relativeName = layoutParameterDic["relativeName"];
                    rParameter.setRelativeName(relativeName);
                    var relativeToName = layoutParameterDic["relativeToName"];
                    rParameter.setRelativeToWidgetName(relativeToName);
                    var align = layoutParameterDic["align"];
                    rParameter.setAlign(align);
                    break;
                default:
                    break;
            }
            if(parameter != null){
                var mgl = layoutParameterDic["marginLeft"]||0;
                var mgt = layoutParameterDic["marginTop"]||0;
                var mgr = layoutParameterDic["marginRight"]||0;
                var mgb = layoutParameterDic["marginDown"]||0;
                parameter.setMargin(mgl, mgt, mgr, mgb);
                widget.setLayoutParameter(parameter);
            }
        }
    };

    parser.colorAttributes = function(widget, options){
        var op = options["opacity"];
        if(op != null)
            widget.setOpacity(op);
        var colorR = options["colorR"];
        var colorG = options["colorG"];
        var colorB = options["colorB"];
        widget.setColor(cc.color((colorR == null) ? 255 : colorR, (colorG == null) ? 255 : colorG, (colorB == null) ? 255 : colorB));

        widget.setFlippedX(options["flipX"]);
        widget.setFlippedY(options["flipY"]);
    };

    parser.anchorPointAttributes = function(widget, options){
        var isAnchorPointXExists = options["anchorPointX"];
        var anchorPointXInFile;
        if (isAnchorPointXExists != null)
            anchorPointXInFile = options["anchorPointX"];
        else
            anchorPointXInFile = widget.getAnchorPoint().x;

        var isAnchorPointYExists = options["anchorPointY"];
        var anchorPointYInFile;
        if (isAnchorPointYExists != null)
            anchorPointYInFile = options["anchorPointY"];
        else
            anchorPointYInFile = widget.getAnchorPoint().y;

        if (isAnchorPointXExists != null || isAnchorPointYExists != null)
            widget.setAnchorPoint(cc.p(anchorPointXInFile, anchorPointYInFile));
    };

    parser.parseChild = function(parse, widget, options, resourcePath){
        var children = options["children"];
        for (var i = 0; i < children.length; i++) {
            var child = this.parseNode(children[i], resourcePath);
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
    };

    /**
     * Panel parser (UILayout)
     */
    parser.LayoutAttributes = function(widget, options, resourcePath){
        var w = 0, h = 0;
        var adaptScreen = options["adaptScreen"];
        if (adaptScreen){
            var screenSize = cc.director.getWinSize();
            w = screenSize.width;
            h = screenSize.height;
        }else{
            w = options["width"];
            h = options["height"];
        }
        widget.setSize(cc.size(w, h));

        widget.setClippingEnabled(options["clipAble"]);

        var backGroundScale9Enable = options["backGroundScale9Enable"];
        widget.setBackGroundImageScale9Enabled(backGroundScale9Enable);
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
        widget.setBackGroundColorVector(cc.p(bgcv1, bgcv2));

        var co = options["bgColorOpacity"];

        var colorType = options["colorType"];
        widget.setBackGroundColorType(colorType/*ui.LayoutBackGroundColorType(colorType)*/);
        widget.setBackGroundColor(cc.color(scr, scg, scb), cc.color(ecr, ecg, ecb));
        widget.setBackGroundColor(cc.color(cr, cg, cb));
        widget.setBackGroundColorOpacity(co);


        var imageFileNameDic = options["backGroundImageData"];
        if(imageFileNameDic){
            var imageFileName,
                imageFileNameType = imageFileNameDic["resourceType"];
            switch (imageFileNameType)
            {
                case 0:
                {
                    var tp_b = resourcePath;
                    imageFileName = imageFileNameDic["path"];
                    var imageFileName_tp = (imageFileName && (imageFileName !== "")) ?
                        tp_b + imageFileName :
                        null;
                    widget.setBackGroundImage(imageFileName_tp);
                    break;
                }
                case 1:
                {
                    imageFileName = imageFileNameDic["path"];
                    widget.setBackGroundImage(imageFileName, 1/*ui.UI_TEX_TYPE_PLIST*/);
                    break;
                }
                default:
                    break;
            }
        }

        if (backGroundScale9Enable)
        {
            var cx = options["capInsetsX"];
            var cy = options["capInsetsY"];
            var cw = options["capInsetsWidth"];
            var ch = options["capInsetsHeight"];
            widget.setBackGroundImageCapInsets(cc.rect(cx, cy, cw, ch));
        }
        widget.setLayoutType(options["layoutType"]);
    };
    /**
     * Button parser (UIButton)
     */
    parser.ButtonAttributes = function(widget, options, resourcePath){
        var button = widget;
        var scale9Enable = options["scale9Enable"];
        button.setScale9Enabled(scale9Enable);

        var normalFileName,
            normalDic = options["normalData"],
            normalType = normalDic["resourceType"];
        switch (normalType) {
            case 0:
                var tp_n = resourcePath;
                normalFileName = normalDic["path"];
                var normalFileName_tp = (normalFileName && normalFileName !== "") ?
                    tp_n + normalFileName : null;
                button.loadTextureNormal(normalFileName_tp);
                break;
            case 1:
                normalFileName = normalDic["path"];
                button.loadTextureNormal(normalFileName, 1/*ui.UI_TEX_TYPE_PLIST*/);
                break;
            default:
                break;
        }
        var pressedFileName,
            pressedDic = options["pressedData"],
            pressedType = pressedDic["resourceType"];
        switch (pressedType) {
            case 0:
                var tp_p = resourcePath;
                pressedFileName = pressedDic["path"];
                var pressedFileName_tp = (pressedFileName && pressedFileName !== "") ?
                    tp_p + pressedFileName : null;
                button.loadTexturePressed(pressedFileName_tp);
                break;
            case 1:
                pressedFileName = pressedDic["path"];
                button.loadTexturePressed(pressedFileName, 1/*ui.UI_TEX_TYPE_PLIST*/);
                break;
            default:
                break;
        }
        var disabledFileName,
            disabledDic = options["disabledData"],
            disabledType = disabledDic["resourceType"];
        switch (disabledType){
            case 0:
                var tp_d = resourcePath;
                disabledFileName = disabledDic["path"];
                var disabledFileName_tp = (disabledFileName && disabledFileName !== "") ?
                    tp_d + disabledFileName : null;
                button.loadTextureDisabled(disabledFileName_tp);
                break;
            case 1:
                disabledFileName = disabledDic["path"];
                button.loadTextureDisabled(disabledFileName, 1/*ui.UI_TEX_TYPE_PLIST*/);
                break;
            default:
                break;
        }
        if (scale9Enable) {
            var cx = options["capInsetsX"];
            var cy = options["capInsetsY"];
            var cw = options["capInsetsWidth"];
            var ch = options["capInsetsHeight"];

            button.setCapInsets(cc.rect(cx, cy, cw, ch));
            var sw = options["scale9Width"];
            var sh = options["scale9Height"];
            if (sw != null && sh != null)
                button.setSize(cc.size(sw, sh));
        }
        var text = options["text"];
        if (text != null)
            button.setTitleText(text);

        var cr = options["textColorR"];
        var cg = options["textColorG"];
        var cb = options["textColorB"];
        var cri = cr!==null?options["textColorR"]:255;
        var cgi = cg!==null?options["textColorG"]:255;
        var cbi = cb!==null?options["textColorB"]:255;

        button.setTitleColor(cc.color(cri,cgi,cbi));
        var fs = options["fontSize"];
        if (fs != null)
            button.setTitleFontSize(options["fontSize"]);
        var fn = options["fontName"];
        if (fn)
            button.setTitleFontName(options["fontName"]);
    };
    /**
     * CheckBox parser (UICheckBox)
     */
    parser.CheckBoxAttributes = function(widget, options, resourcePath){
        //load background image
        var backGroundDic = options["backGroundBoxData"];
        var backGroundType = backGroundDic["resourceType"];
        var backGroundTexturePath = resourcePath + backGroundDic["path"];
        widget.loadTextureBackGround(backGroundTexturePath, backGroundType);

        //load background selected image
        var backGroundSelectedDic = options["backGroundBoxSelectedData"];
        var backGroundSelectedType = backGroundSelectedDic["resourceType"];
        var backGroundSelectedTexturePath = resourcePath + backGroundSelectedDic["path"];
        if(!backGroundSelectedTexturePath){
            backGroundSelectedType = backGroundType;
            backGroundSelectedTexturePath = backGroundTexturePath;
        }
        widget.loadTextureBackGroundSelected(backGroundSelectedTexturePath, backGroundSelectedType);

        //load frontCross image
        var frontCrossDic = options["frontCrossData"];
        var frontCrossType = frontCrossDic["resourceType"];
        var frontCrossFileName = resourcePath + frontCrossDic["path"];
        widget.loadTextureFrontCross(frontCrossFileName, frontCrossType);

        //load backGroundBoxDisabledData
        var backGroundDisabledDic = options["backGroundBoxDisabledData"];
        var backGroundDisabledType = backGroundDisabledDic["resourceType"];
        var backGroundDisabledFileName = resourcePath + backGroundDisabledDic["path"];
        if(!backGroundDisabledFileName){
            backGroundDisabledType = frontCrossType;
            backGroundDisabledFileName = frontCrossFileName;
        }
        widget.loadTextureBackGroundDisabled(backGroundDisabledFileName, backGroundDisabledType);

        ///load frontCrossDisabledData
        var frontCrossDisabledDic = options["frontCrossDisabledData"];
        var frontCrossDisabledType = frontCrossDisabledDic["resourceType"];
        var frontCrossDisabledFileName = resourcePath + frontCrossDisabledDic["path"];
        widget.loadTextureFrontCrossDisabled(frontCrossDisabledFileName, frontCrossDisabledType);

        if (options["selectedState"])
            widget.setSelected(options["selectedState"]);
    };
    /**
     * ImageView parser (UIImageView)
     */
    parser.ImageViewAttributes = function(widget, options, resourcePath){
        var imageFileName,
            imageFileNameDic = options["fileNameData"],
            imageFileNameType = imageFileNameDic["resourceType"];
        switch (imageFileNameType){
            case 0:
                var tp_i = resourcePath;
                imageFileName = imageFileNameDic["path"];
                var imageFileName_tp = null;
                if (imageFileName && imageFileName !== "") {
                    imageFileName_tp = tp_i + imageFileName;
                    widget.loadTexture(imageFileName_tp);
                }
                break;
            case 1:
                imageFileName = imageFileNameDic["path"];
                widget.loadTexture(imageFileName, 1/*ui.UI_TEX_TYPE_PLIST*/);
                break;
            default:
                break;
        }

        var scale9EnableExist = options["scale9Enable"];
        var scale9Enable = false;
        if (scale9EnableExist){
            scale9Enable = options["scale9Enable"];
        }
        widget.setScale9Enabled(scale9Enable);

        if (scale9Enable){
            var sw = options["scale9Width"];
            var sh = options["scale9Height"];
            if (sw && sh)
            {
                var swf = options["scale9Width"];
                var shf = options["scale9Height"];
                widget.setSize(cc.size(swf, shf));
            }

            var cx = options["capInsetsX"];
            var cy = options["capInsetsY"];
            var cw = options["capInsetsWidth"];
            var ch = options["capInsetsHeight"];

            widget.setCapInsets(cc.rect(cx, cy, cw, ch));

        }
    };
    /**
     * TextAtlas parser (UITextAtlas)
     */
    parser.TextAtlasAttributes = function(widget, options, resourcePath){
        var sv = options["stringValue"];
        var cmf = options["charMapFileData"];   // || options["charMapFile"];
        var iw = options["itemWidth"];
        var ih = options["itemHeight"];
        var scm = options["startCharMap"];
        if (sv != null && cmf && iw != null && ih != null && scm != null){
            var cmftDic = options["charMapFileData"];
            var cmfType = cmftDic["resourceType"];
            switch (cmfType){
                case 0:
                    var tp_c = resourcePath;
                    var cmfPath = cmftDic["path"];
                    var cmf_tp = tp_c + cmfPath;
                    widget.setProperty(sv, cmf_tp, iw, ih, scm);
                    break;
                case 1:
                    cc.log("Wrong res type of LabelAtlas!");
                    break;
                default:
                    break;
            }
        }
    };
    /**
     * TextBMFont parser (UITextBMFont)
     */
    parser.TextBMFontAttributes = function(widget, options, resourcePath){
        var cmftDic = options["fileNameData"];
        var cmfType = cmftDic["resourceType"];
        switch (cmfType) {
            case 0:
                var tp_c = resourcePath;
                var cmfPath = cmftDic["path"];
                var cmf_tp = tp_c + cmfPath;
                widget.setFntFile(cmf_tp);
                break;
            case 1:
                cc.log("Wrong res type of LabelAtlas!");
                break;
            default:
                break;
        }

        var text = options["text"];
        widget.setString(text);
    };
    /**
     * Text parser (UIText)
     */
    parser.TextAttributes = function(widget, options, resourcePath){
        var touchScaleChangeAble = options["touchScaleEnable"];
        widget.setTouchScaleChangeEnabled(touchScaleChangeAble);
        var text = options["text"];
        widget.setString(text);
        var fs = options["fontSize"];
        if (fs != null){
            widget.setFontSize(options["fontSize"]);
        }
        var fn = options["fontName"];
        if (fn != null){
            widget.setFontName(options["fontName"]);
        }
        var aw = options["areaWidth"];
        var ah = options["areaHeight"];
        if (aw != null && ah != null){
            var size = cc.size(options["areaWidth"], options["areaHeight"]);
            widget.setTextAreaSize(size);
        }
        var ha = options["hAlignment"];
        if (ha != null){
            widget.setTextHorizontalAlignment(options["hAlignment"]);
        }
        var va = options["vAlignment"];
        if (va != null){
            widget.setTextVerticalAlignment(options["vAlignment"]);
        }
    };
    /**
     * ListView parser (UIListView)
     */
    parser.ListViewAttributes = function(widget, options, resoutcePath){
        parser.ScrollViewAttributes(widget, options,resoutcePath);
        var direction = options["direction"];
        widget.setDirection(direction);
        var gravity = options["gravity"];
        widget.setGravity(gravity);
        var itemMargin = options["itemMargin"];
        widget.setItemsMargin(itemMargin);
    };
    /**
     * LoadingBar parser (UILoadingBar)
     */
    parser.LoadingBarAttributes = function(widget, options, resoutcePath){
        var imageFileName,
            imageFileNameDic = options["textureData"],
            imageFileNameType = imageFileNameDic["resourceType"];
        switch (imageFileNameType){
            case 0:
                var tp_i = resoutcePath;
                imageFileName = imageFileNameDic["path"];
                var imageFileName_tp = null;
                if (imageFileName && (imageFileName !== "")){
                    imageFileName_tp = tp_i + imageFileName;
                    widget.loadTexture(imageFileName_tp);
                }
                break;
            case 1:
                imageFileName = imageFileNameDic["path"];
                widget.loadTexture(imageFileName, 1/*ui.UI_TEX_TYPE_PLIST*/);
                break;
            default:
                break;
        }

        var scale9Enable = options["scale9Enable"];
        widget.setScale9Enabled(scale9Enable);

        if (scale9Enable){
            var cx = options["capInsetsX"];
            var cy = options["capInsetsY"];
            var cw = options["capInsetsWidth"];
            var ch = options["capInsetsHeight"];

            widget.setCapInsets(cc.rect(cx, cy, cw, ch));

            var width = options["width"];
            var height = options["height"];
            widget.setSize(cc.size(width, height));
        }

        widget.setDirection(options["direction"]);
        widget.setPercent(options["percent"]);
    };
    /**
     * PageView parser (UIPageView)
     */
    parser.PageViewAttributes = parser.LayoutAttributes;
    /**
     * ScrollView parser (UIScrollView)
     */
    parser.ScrollViewAttributes = function(widget, options, resoutcePath){
        parser.LayoutAttributes(widget, options,resoutcePath);
        var innerWidth = options["innerWidth"]!=null ? options["innerWidth"] : 200;
        var innerHeight = options["innerHeight"]!=null ? options["innerHeight"] : 200;
        widget.setInnerContainerSize(cc.size(innerWidth, innerHeight));

        var direction = options["direction"]!=null ? options["direction"] : 1;
        widget.setDirection(direction);
        widget.setBounceEnabled(options["bounceEnable"]);
    };
    /**
     * Slider parser (UISlider)
     */
    parser.SliderAttributes = function(widget, options, resoutcePath){

        var slider = widget;
        var tp = resoutcePath;

        var barTextureScale9Enable = options["scale9Enable"];
        slider.setScale9Enabled(barTextureScale9Enable);
        var bt = options["barFileName"];
        var barLength = options["length"];

        var imageFileNameDic = options["barFileNameData"];
        var imageFileType = imageFileNameDic["resourceType"];
        var imageFileName = imageFileNameDic["path"];
        var imageFileName_tp;

        if(bt != null){
            if(barTextureScale9Enable){
                switch(imageFileType){
                    case 0:
                        imageFileName_tp = imageFileName ?
                            ( tp + imageFileName ) :
                            null;
                        slider.loadBarTexture(imageFileName_tp);
                        break;
                    case 1:
                        slider.loadBarTexture(imageFileName, 1 /*ui.UI_TEX_TYPE_PLIST*/);
                        break;
                    default:
                        break;
                }
                slider.setSize(cc.size(barLength, slider.getContentSize().height));
            }
        }else{
            switch(imageFileType){
                case 0:
                    imageFileName_tp = imageFileName ?
                        tp + imageFileName :
                        null;
                    slider.loadBarTexture(imageFileName_tp);
                    break;
                case 1:
                    slider.loadBarTexture(imageFileName, 1 /*ui.UI_TEX_TYPE_PLIST*/);
                    break;
                default:
                    break;
            }
        }
        var normalDic = options["ballNormalData"];
        var normalType = normalDic["resourceType"];
        var normalFileName = normalDic["path"];
        switch(normalType){
            case 0:
                var normalFileName_tp = normalFileName ?
                    tp + normalFileName :
                    null;
                slider.loadSlidBallTextureNormal(normalFileName_tp);
                break;
            case 1:
                slider.loadSlidBallTextureNormal(normalFileName, 1/*ui.UI_TEX_TYPE_PLIST*/);
                break;
            default:
                break;
        }

        var pressedDic = options["ballPressedData"];
        var pressedType = pressedDic["resourceType"];
        var pressedFileName = pressedDic["path"];
        if(pressedFileName === null){
            pressedType = normalType;
            pressedFileName = normalFileName;
        }
        switch(pressedType){
            case 0:
                var pressedFileName_tp = pressedFileName ?
                    tp + pressedFileName :
                    null;
                slider.loadSlidBallTexturePressed(pressedFileName_tp);
                break;
            case 1:
                slider.loadSlidBallTexturePressed(pressedFileName, 1/*ui.UI_TEX_TYPE_PLIST*/);
                break;
            default:
                break;
        }
        var disabledDic = options["ballDisabledData"];
        var disabledType = disabledDic["resourceType"];
        var disabledFileName = disabledDic["path"];
        switch(disabledType){
            case 0:
                var disabledFileName_tp = disabledFileName ?
                    tp + disabledFileName :
                    null;
                slider.loadSlidBallTextureDisabled(disabledFileName_tp);
                break;
            case 1:
                slider.loadSlidBallTextureDisabled(disabledFileName, 1/*ui.UI_TEX_TYPE_PLIST*/);
                break;
            default:
                break;
        }
        var progressBarDic = options["progressBarData"];
        var progressBarType = progressBarDic["resourceType"];
        var imageProgressFileName = progressBarDic["path"];
        switch (progressBarType){
            case 0:
                var imageProgressFileName_tp = imageProgressFileName ?
                    (tp + imageProgressFileName) :
                    null;
                slider.loadProgressBarTexture(imageProgressFileName_tp);
                break;
            case 1:
                slider.loadProgressBarTexture(imageProgressFileName, 1/*ui.UI_TEX_TYPE_PLIST*/);
                break;
            default:
                break;
        }
    };
    /**
     * TextField parser (UITextField)
     */
    parser.TextFieldAttributes = function(widget, options, resoutcePath){
        var ph = options["placeHolder"];
        if(ph)
            widget.setPlaceHolder(ph);
        widget.setString(options["text"]||"");
        var fs = options["fontSize1"];
        if(fs)
            widget.setFontSize(fs);
        var fn = options["fontName"];
        if(fn)
            widget.setFontName(fn);
        var tsw = options["touchSizeWidth"];
        var tsh = options["touchSizeHeight"];
        if(tsw!=null && tsh!=null)
            widget.setTouchSize(tsw, tsh);

        var dw = options["width"];
        var dh = options["height"];
        if(dw > 0 || dh > 0){
            //textField.setSize(cc.size(dw, dh));
        }
        var maxLengthEnable = options["maxLengthEnable"];
        widget.setMaxLengthEnabled(maxLengthEnable);

        if(maxLengthEnable){
            var maxLength = options["maxLength"];
            widget.setMaxLength(maxLength);
        }
        var passwordEnable = options["passwordEnable"];
        widget.setPasswordEnabled(passwordEnable);
        if(passwordEnable)
            widget.setPasswordStyleText(options["passwordStyleText"]);

        var aw = options["areaWidth"];
        var ah = options["areaHeight"];
        if(aw && ah){
            var size = cc.size(aw, ah);
            widget.setTextAreaSize(size);
        }
        var ha = options["hAlignment"];
        if(ha)
            widget.setTextHorizontalAlignment(ha);
        var va = options["vAlignment"];
        if(va)
            widget.setTextVerticalAlignment(va);
    };

    var register = [
        {name: "Panel", object: ccui.Layout, handle: parser.LayoutAttributes},
        {name: "Button", object: ccui.Button, handle: parser.ButtonAttributes},
        {name: "CheckBox", object: ccui.CheckBox, handle: parser.CheckBoxAttributes},
        {name: "ImageView", object: ccui.ImageView, handle: parser.ImageViewAttributes},
        {name: "LabelAtlas", object: ccui.TextAtlas, handle: parser.TextAtlasAttributes},
        {name: "LabelBMFont", object: ccui.TextBMFont, handle: parser.TextBMFontAttributes},
        {name: "Label", object: ccui.Text, handle: parser.TextAttributes},
        {name: "ListView", object: ccui.ListView, handle: parser.ListViewAttributes},
        {name: "LoadingBar", object: ccui.LoadingBar, handle: parser.LoadingBarAttributes},
        {name: "PageView", object: ccui.PageView, handle: parser.PageViewAttributes},
        {name: "ScrollView", object: ccui.ScrollView, handle: parser.ScrollViewAttributes},
        {name: "Slider", object: ccui.Slider, handle: parser.SliderAttributes},
        {name: "TextField", object: ccui.TextField, handle: parser.TextFieldAttributes}
    ];

    register.forEach(function(item){
        parser.registerParser(item.name, function(options, resourcePath){
            var widget = new item.object;
            var uiOptions = options["options"];
            parser.generalAttributes(widget, uiOptions);
            item.handle(widget, uiOptions, resourcePath);
            parser.colorAttributes(widget, uiOptions);
            parser.anchorPointAttributes(widget, uiOptions);
            parser.parseChild.call(this, parse, widget, options, resourcePath);
            return widget;
        });
    });

    load.registerParser("ccui", "1.*", parser);


})(ccs._load, ccs._parser);