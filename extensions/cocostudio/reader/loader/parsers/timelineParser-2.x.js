(function(load, baseParser){

    var DEBUG = true;

    var Parser = baseParser.extend({

        parse: function(file, json){
            var resourcePath = this._dirname(file);
            this.pretreatment(json, resourcePath);
            var node = this.parseNode(this.getNodeJson(json), resourcePath);
            this.deferred(json, resourcePath, node, file);
            return node;
        },

        getNodeJson: function(json){
            return json["Content"]["Content"]["ObjectData"];
        },

        getClass: function(json){
            return json["ctype"];
        },

        addSpriteFrame: function(textures, plists, resourcePath){
            if(!textures) return;
            for (var i = 0; i < textures.length; i++) {
                cc.spriteFrameCache.addSpriteFrames(
                        resourcePath + textures[i],
                        resourcePath + plists[i]
                );
            }
        },

        pretreatment: function(json, resourcePath, file){
            this.addSpriteFrame(json["textures"], json["texturesPng"], resourcePath);
            ccs.actionTimelineCache.loadAnimationActionWithContent(file, json);
        }

    });
    var parser = new Parser();


    //////////
    // NODE //
    //////////

    parser.generalAttributes = function(node, json){
        if(json["Name"] != null)
            node.setName(json["Name"]);

        var position = json["Position"];
        if(position != null && (position["X"] != null || position["Y"] != null))
            node.setPosition(cc.p(position["X"]||0, position["Y"]||0));

        var scale = json["Scale"];
        if(scale != null){
            if(scale["ScaleX"] != null)
                node.setScaleX(scale["ScaleX"]);
            if(scale["ScaleY"] != null)
                node.setScaleY(scale["ScaleY"]);
        }

        var rotationSkewX = json["RotationSkewX"];
        if (rotationSkewX != null)
            node.setRotationX(rotationSkewX);
        //rotationSkewX
        var rotationSkewY = json["RotationSkewY"];
        if (json["RotationSkewY"] != null)
            node.setRotationY(rotationSkewY);
        //rotationSkewY

        //todo check it
        var anchor = json["AnchorPoint"];
        if(anchor && (anchor["ScaleX"] || anchor["ScaleY"]))
            node.setAnchorPoint(cc.p(anchor["ScaleX"]||0.5, anchor["ScaleY"]||0.5));

        if (json["ZOrder"] != null)
            node.setLocalZOrder(json["ZOrder"]);

        var visible = json["VisibleForFrame"];
        if (visible != null)
            node.setVisible(visible == "True");


        var contentSize = json["Size"];
        if(contentSize != null && (contentSize["X"] != null || contentSize["Y"] != null))
            node.setContentSize(cc.size(contentSize["X"]||0, contentSize["Y"]||0));

        if (json["Alpha"] != null)
            node.setOpacity(json["Alpha"]);
        var color = json["CColor"];
        if(color != null && (color["R"] != null || color["G"] != null || color["B"] != null))
            node.setColor(cc.color(color["R"]||255, color["G"]||255, color["B"]||255));

        if (json["Tag"] != null)
            node.setTag(json["Tag"]);

        if (json["ActionTag"] != null)
            node.setUserObject(new ccs.ActionTimelineData(json["ActionTag"]));

        node.setCascadeColorEnabled(true);
        node.setCascadeOpacityEnabled(true);
    };

    parser.parseChild = function(node, children, resourcePath){
        if(!children) return;
        for (var i = 0; i < children.length; i++) {
            var child = this.parseNode(children[i], resourcePath);
            if(child){
                if(node instanceof ccui.PageView){
                    if(child instanceof ccui.Layout)
                        node.addPage(child);
                } else {
                    if(node instanceof ccui.ListView){
                        if(child instanceof ccui.Widget)
                            node.pushBackCustomItem(child);
                    } else {
                        if(!(node instanceof ccui.Layout) && child instanceof ccui.Widget) {
                            if(child.getPositionType() == ccui.Widget.POSITION_PERCENT) {
                                var position = child.getPositionPercent();
                                var anchor = node.getAnchorPoint();
                                child.setPositionPercent(cc.p(position.x + anchor.x, position.y + anchor.y));
                            }
                            var AnchorPointIn = node.getAnchorPointInPoints();
                            child.setPosition(cc.p(child.getPositionX() + AnchorPointIn.x, child.getPositionY() + AnchorPointIn.y));
                        }
                        node.addChild(child);
                    }
                }
            }
        }
    };

    /**
     * SingleNode
     * @param json
     * @returns {cc.Node}
     */
    parser.initSingleNode = function(json){
        var node = new cc.Node();

        this.generalAttributes(node, json);

        return node;
    };

    /**
     * Sprite
     * @param json
     * @returns {cc.Sprite}
     */
    parser.initSprite = function(json, resourcePath){
        var node =  new cc.Sprite();

        this.generalAttributes(node, json);

        loadTexture(json["FileData"], resourcePath, function(path, type){
            node.setTexture(path);
        });

        if(json["FlipX"])
            node.setFlippedX(true);
        if(json["FlipY"])
            node.setFlippedY(true);

        return node;
    };

    /**
     * Particle
     * @param json
     * @returns {*}
     */
    parser.initParticle = function(json){
        var fileData = json["FileData"];
        var node;
        if(fileData){
            node = new cc.ParticleSystemQuad();
            this.generalAttributes(node, json);
        }
        return node;
    };


    ////////////
    // WIDGET //
    ////////////

    parser.widgetAttributes = function(widget, json){
        var name = json["Name"];
        if(name)
            widget.setName(name);

        var actionTag = json["ActionTag"];
        if(actionTag){
            widget.setActionTag(actionTag);
            widget.setUserObject(new ccs.ActionTimelineData(actionTag));
        }

        var rotationSkewX = json["RotationSkewX"];
        if(rotationSkewX)
            widget.setRotationX(rotationSkewX);

        var rotationSkewY = json["RotationSkewY"];
        if(rotationSkewY)
            widget.setRotationX(rotationSkewY);

        //var rotation = json["Rotation"];

        var flipX = json["FlipX"];
        if(flipX)
            widget.setFlippedX(true);

        var flipY = json["FlipY"];
        if(flipY)
            widget.setFlippedY(true);

        var zOrder = json["zOrder"];
        if(zOrder != null)
            widget.setLocalZOrder(zOrder);

        //var visible = json["Visible"];

        var visible = json["VisibleForFrame"];
        if(visible != null)
            widget.setVisible(visible);

        var alpha = json["Alpha"];
        if(alpha != null)
            widget.setOpacity(alpha);

        var tag = json["Tag"];
        if(tag != null)
            widget.setTag(tag);

        var touchEnabled = json["TouchEnabled"];
        if(touchEnabled != null)
            widget.setTouchEnabled(touchEnabled);

        // -- var frameEvent = json["FrameEvent"];

        var callBackType = json["CallBackType"];
        if(callBackType != null)
            widget.setCallbackType(callBackType);

        var callBackName = json["CallBackName"];
        if(callBackName)
            widget.setCallbackName(callBackName);

        var position = json["Position"];
        if(position != null)
            widget.setPosition(position["X"] || 0, position["Y"] || 0);

        var scale = json["Scale"];
        if(scale != null){
            widget.setScaleX(scale["ScaleX"] || 1);
            widget.setScaleY(scale["ScaleY"] || 1);
        }

        var anchorPoint = json["AnchorPoint"];
        if(anchorPoint != null)
            widget.setAnchorPoint(anchorPoint["ScaleX"] || 0.5, anchorPoint["ScaleY"] || 0.5);

        var color = json["CColor"];
        if(color != null && color["R"] != null &&color["G"] != null &&color["B"] != null)
            widget.setColor(color["R"], color["G"], color["B"]);
//
//        var size = json["Size"];
//        if(size != null)
//            widget.setContentSize(size["X"]||0, size["Y"]||0);

        if(widget instanceof ccui.Layout){
            //todo update UILayoutComponent.bindLayoutComponent
            var positionXPercentEnabled = json["PositionPercentXEnable"];
            var positionYPercentEnabled = json["PositionPercentYEnable"];
            var sizeXPercentEnable = json["PercentWidthEnable"];
            var sizeYPercentEnable = json["PercentHeightEnable"];
            var stretchHorizontalEnabled = json["StretchWidthEnable"];
            var stretchVerticalEnabled = json["StretchHeightEnable"];
            var horizontalEdge = json["HorizontalEdge"];
            var verticalEdge = json["VerticalEdge"];
            var leftMargin = json["LeftMargin"];
            var rightMargin = json["RightMargin"];
            var topMargin = json["TopMargin"];
            var bottomMargin = json["BottomMargin"];
            //var prePosition = json["PrePosition"];
            //if(prePosition)
            //    prePosition["X"], prePosition["Y"]

            //var preSize = json["PreSize"];
            //if(preSize)
            //    preSize["X"], preSize["Y"]
        }

    };

    /**
     * Layout
     * @param json
     * @param resourcePath
     * @returns {ccui.Layout}
     */
    parser.initPanel = function(json, resourcePath){
        var widget = new ccui.Layout();

        this.widgetAttributes(widget, json);

        var clipEnabled = json["ClipAple"];
        if(clipEnabled != null)
            widget.setClippingEnabled(clipEnabled);

        var colorType = json["ComboBoxIndex"];
        if(colorType != null)
            widget.setBackGroundColorType(colorType);

        var bgColorOpacity = json["BackColorAlpha"];
        if(bgColorOpacity != null)
            widget.setBackGroundColorOpacity(bgColorOpacity);

        var backGroundScale9Enabled = json["Scale9Enable"];
        if(backGroundScale9Enabled != null)
            widget.setBackGroundImageScale9Enabled(backGroundScale9Enabled);

        var scale9OriginX = json["Scale9OriginX"];
        var scale9OriginY = json["Scale9OriginY"];

        var scale9Width = json["Scale9Width"];
        var scale9Height = json["Scale9Height"];

        var bgStartColor = json["FirstColor"];
        var bgEndColor = json["EndColor"];
        if(bgStartColor != null && bgEndColor != null){
            bgStartColor["R"] == undefined && (bgStartColor["R"] = 255);
            bgStartColor["G"] == undefined && (bgStartColor["G"] = 255);
            bgStartColor["B"] == undefined && (bgStartColor["B"] = 255);
            bgEndColor["R"] == undefined && (bgEndColor["R"] = 255);
            bgEndColor["G"] == undefined && (bgEndColor["G"] = 255);
            bgEndColor["B"] == undefined && (bgEndColor["B"] = 255);
            widget.setBackGroundColor(
                cc.color(bgStartColor["R"], bgStartColor["G"], bgStartColor["B"]),
                cc.color(bgEndColor["R"], bgEndColor["G"], bgEndColor["B"])
            );
        }



        var colorVector = json["ColorVector"];
        if(colorVector != null)
            colorVector["ScaleX"];

        loadTexture(json["FileData"], resourcePath, function(path, type){
            widget.setBackGroundImage(path, type);
        });

        return widget;
    };

    /**
     * Text
     * @param json
     * @param resourcePath
     */
    parser.initText = function(json, resourcePath){

        var widget = new ccui.Text();

        this.widgetAttributes(widget, json);

        var touchScaleEnabled = json["TouchScaleChangeAble"];
        if(touchScaleEnabled != null)
            widget.setTouchScaleChangeEnabled(touchScaleEnabled);

        var text = json["LabelText"];
        if(text != null)
            widget.setString(text);

        var fontSize = json["FontSize"];
        if(fontSize != null)
            widget.setFontSize(fontSize);

        var fontName = json["FontName"];
        if(fontName != null)
            widget.setFontName(fontName);

        var areaWidth = json["AreaWidth"];
        var areaHeight = json["areaHeight"];
        if(areaWidth && areaHeight)
            widget.setTextAreaSize(cc.size(areaWidth, areaHeight));

        var h_alignment = json["HorizontalAlignmentType"];
        switch(h_alignment){
            case "HT_Right":
                h_alignment = 2; break;
            case "HT_Center":
                h_alignment = 1; break;
            case "HT_Left":
            default:
                h_alignment = 0;
        }
        widget.setTextHorizontalAlignment(h_alignment);

        var v_alignment = json["VerticalAlignmentType"];
        switch(v_alignment){
            case "VT_Bottom":
                v_alignment = 2; break;
            case "VT_Center":
                v_alignment = 1; break;
            case "VT_Top":
            default:
                v_alignment = 0;
        }
        widget.setTextVerticalAlignment(v_alignment);

        //todo check it
        var isCustomSize = json["IsCustomSize"];
        widget.ignoreContentAdaptWithSize(!isCustomSize);

        var path, resoutceType, plistFile;
        var fontResource = json["FontResource"];
        if(fontResource != null){
            path = fontResource["Path"];
            resoutceType = fontResource["Type"];
            plistFile = fontResource["Plist"];
        }

        widget.setUnifySizeEnabled(false);

        if(widget.isIgnoreContentAdaptWithSize()){
            var size = json["Size"];
            if(size != null)
                widget.setContentSize(cc.size(size["X"]||0, size["Y"]||0));
        }

        return widget;

    };

    /**
     * Button
     * @param json
     * @param resourcePath
     */
    parser.initButton = function(json, resourcePath){

        var widget = new ccui.Button();

        this.widgetAttributes(widget, json);

        var scale9Enabled = json["Scale9Enable"];
        if(scale9Enabled){
            widget.setScale9Enabled(scale9Enabled);
            widget.setUnifySizeEnabled(false);
            widget.ignoreContentAdaptWithSize(false);

            var capInsets = cc.rect(
                    json["Scale9OriginX"] || 0,
                    json["Scale9OriginY"] || 0,
                    json["Scale9Width"] || 0,
                    json["Scale9Height"] || 0
            );

            widget.setCapInsets(capInsets);

        }

        var size = json["Size"];
        if(size != null){
            widget.setContentSize(size["X"] || 0, size["Y"] || 0);
        }

        var text = json["ButtonText"];
        if(text != null)
            widget.setTitleText(text);

        var fontSize = json["FontSize"];
        if(fontSize != null)
            widget.setTitleFontSize(fontSize);

        var fontName = json["FontName"];
        if(fontName != null)
            widget.setTitleFontName(fontName);

        var displaystate = json["DisplayState"];
        if(displaystate != null){
            widget.setBright(displaystate);
            widget.setEnabled(displaystate);
        }

        var textColor = json["TextColor"];
        if(textColor != null){
            textColor["R"] = textColor["R"] != null ? textColor["R"] : 255;
            textColor["G"] = textColor["G"] != null ? textColor["G"] : 255;
            textColor["B"] = textColor["B"] != null ? textColor["B"] : 255;
            widget.setTitleColor(cc.color(textColor["R"], textColor["G"], textColor["B"]));
        }

        var dataList = [
            {json: json["DisabledFileData"], handle: function(path, type){
                widget.loadTextureDisabled(path, type);
            }},
            {json: json["PressedFileData"], handle: function(path, type){
                widget.loadTexturePressed(path, type);
            }},
            {json: json["NormalFileData"], handle: function(path, type){
                widget.loadTextureNormal(path, type);
            }}
        ];

        dataList.forEach(function(item){
            loadTexture(item.json, resourcePath, item.handle);
        });

        //var fontResourcePath, fontResourceResourceType, fontResourcePlistFile;
        //var fontResource = json["FontResource"];
        //if(fontResource != null){
        //    fontResourcePath = fontResource["Path"];
        //    fontResourceResourceType = fontResource["Type"] == "Default" ? 0 : 1;
        //    fontResourcePlistFile = fontResource["Plist"];
        //}

        return widget;

    };

    /**
     * CheckBox
     * @param json
     * @param resourcePath
     */
    parser.initCheckBox = function(json, resourcePath){

        var widget = new ccui.CheckBox();

        this.widgetAttributes(widget, json);

        var selectedState = json["CheckedState"];
        if(selectedState)
            widget.setSelected(true);

        var displaystate = json["DisplayState"];
        if(displaystate){
            widget.setBright(displaystate);
            widget.setEnabled(displaystate);
        }

        var dataList = [
            {json: json["NormalBackFileData"], handle: function(path, type){
                widget.loadTextureBackGround(path, type);
            }},
            {json: json["PressedBackFileData"], handle: function(path, type){
                widget.loadTextureBackGroundSelected(path, type);
            }},
            {json: json["NodeNormalFileData"], handle: function(path, type){
                widget.loadTextureFrontCross(path, type);
            }},
            {json: json["DisableBackFileData"], handle: function(path, type){
                widget.loadTextureBackGroundDisabled(path, type);
            }},
            {json: json["NodeDisableFileData"], handle: function(path, type){
                widget.loadTextureFrontCrossDisabled(path, type);
            }}
        ];

        dataList.forEach(function(item){
            loadTexture(item.json, resourcePath, item.handle);
        });

        return widget;
    };

    /**
     * ScrollView
     * @param json
     * @param resourcePath
     */
    parser.initScrollView = function(json, resourcePath){
        var widget = new ccui.ScrollView();

        this.widgetAttributes(widget, json);

        var clipEnabled = json["ClipAble"];
        if(clipEnabled)
            widget.setClippingEnabled(true);

        var colorType = json["ComboBoxIndex"];
        if(colorType != null)
            widget.setBackGroundColorType(colorType);

        var bgColorOpacity = json["BackColorAlpha"];
        if(bgColorOpacity)
            widget.setBackGroundColorOpacity(bgColorOpacity);

        var backGroundScale9Enabled = json["Scale9Enable"];
        if(backGroundScale9Enabled){
            widget.setBackGroundImageScale9Enabled(true);
        }

        var scale9OriginX = json["Scale9OriginX"];
        var scale9OriginY = json["Scale9OriginY"];

        var scale9Width = json["Scale9Width"];
        var scale9Height = json["Scale9Height"];

        var scale9Size = json["Size"];
        if(scale9Size){
            scale9Size = cc.size(scale9Size["X"] || 0, scale9Size["Y"] || 0);
        }


        if(json["FirstColor"] && json["EndColor"]){
            var bgStartColor, bgEndColor;
            bgStartColor = setColor(json["FirstColor"]);
            bgEndColor = setColor(json["EndColor"]);
            widget.setBackGroundColor(bgStartColor, bgEndColor);
        }else{
            widget.setBackGroundColor(setColor(json["SingleColor"]));
        }


        var colorVector = json["ColorVector"];
        if(colorVector){
            widget.setBackGroundColorVector(cc.p(colorVector["ScaleX"] || 1, colorVector["ScaleY"] || 1));
        }

        loadTexture(json["FileData"], resourcePath, function(path, type){
            widget.setBackGroundImage(path, type);
        });

        var innerNodeSize = json["InnerNodeSize"];
        var innerSize = cc.size(
            innerNodeSize["width"] || 0,
            innerNodeSize["height"] || 0
        );
        widget.setInnerContainerSize(innerSize);

        var direction = 0;
        if(json["ScrollDirectionType"] == "Vertical") direction = 1;
        if(json["ScrollDirectionType"] == "Horizontal") direction = 2;
        if(json["ScrollDirectionType"] == "Vertical_Horizontal") direction = 3;
        widget.setDirection(direction);

        var bounceEnabled = json["IsBounceEnabled"];
        if(bounceEnabled)
            widget.setBounceEnabled(bounceEnabled);

        return widget;
    };

    /**
     * ImageView
     * @param json
     * @param resourcePath
     */
    parser.initImageView = function(json, resourcePath){

        var widget = new ccui.ImageView();

        this.widgetAttributes(widget, json);

        var scale9Enabled = json["Scale9Enable"];
        if(scale9Enabled){
            widget.setScale9Enabled(true);
            widget.setUnifySizeEnabled(false);
            widget.ignoreContentAdaptWithSize(false);

            var scale9OriginX = json["Scale9OriginX"];
            var scale9OriginY = json["Scale9OriginY"];
            var scale9Width = json["Scale9Width"];
            var scale9Height = json["Scale9Height"];
            widget.setCapInsets(cc.rect(
                scale9OriginX || 0,
                scale9OriginY || 0,
                scale9Width || 0,
                scale9Height || 0
            ));
        }


        var scale9Size = json["Size"];
        if(scale9Size)
            widget.setContentSize(cc.size(scale9Size["X"] || 0, scale9Size["Y"] || 0));

        loadTexture(json["FileData"], resourcePath, function(path, type){
            widget.loadTexture(path, type);
        });

        return widget;
    };

    /**
     *
     * @param json
     * @param resourcePath
     * @returns {ccui.LoadingBar}
     */
    parser.initLoadingBar = function(json, resourcePath){

        var widget = new ccui.LoadingBar();

        this.widgetAttributes(widget, json);

        var direction = json["ProgressType"] == "Left_To_Right" ? 0 : 1;
        widget.setDirection(direction);

        var percent = json["ProgressInfo"] != null ? json["ProgressInfo"] : 0;
        widget.setPercent(percent);

        loadTexture(json["ImageFileData"], resourcePath, function(path, type){
            widget.loadTexture(path, type);
        });

        return widget;

    };

    /**
     *
     * @param json
     * @param resourcePath
     */
    parser.initSlider = function(json, resourcePath){

        var widget = new ccui.Slider();

        this.widgetAttributes(widget, json);

        var percent = json["PercentInfo"];
        if(percent != null)
            widget.setPercent(percent);

        var displaystate = json["DisplayState"];
        if(displaystate != null){
            widget.setBright(displaystate);
            widget.setEnabled(displaystate);
        }

        loadTexture(json["BackGroundData"], resourcePath, function(path, type){
            widget.loadBarTexture(path, type);
        });
        loadTexture(json["BallNormalData"], resourcePath, function(path, type){
            widget.loadSlidBallTextureNormal(path, type);
        });
        loadTexture(json["BallPressedData"], resourcePath, function(path, type){
            widget.loadSlidBallTexturePressed(path, type);
        });
        loadTexture(json["BallDisabledData"], resourcePath, function(path, type){
            widget.loadSlidBallTextureDisabled(path, type);
        });
        loadTexture(json["ProgressBarData"], resourcePath, function(path, type){
            widget.loadProgressBarTexture(path, type);
        });


        return widget;
    };

    /**
     *
     * @param json
     * @param resourcePath
     */
    parser.initPageView = function(json, resourcePath){

        var widget = ccui.PageView();

        this.widgetAttributes(widget, json);

        var percent = json["PercentInfo"];

        var displaystate = json["DisplayState"];

        return widget;

    };

    var loadTexture = function(json, resourcePath, cb){
        if(json != null){
            var path = json["Path"];
            var type;
            if(json["Type"] == "Default" || json["Type"] == "Normal")
                type = 0;
            else
                type = 1;
            var plist = json["Plist"];
            if(plist)
                cc.spriteFrameCache.addSpriteFrames(resourcePath + plist);
            if(type !== 0)
                cb(path, type);
            else
                cb(resourcePath + path, type);
        }
    };

    var setColor = function(json){
        if(!json) return;
        var r = json["R"] != null ? json["R"] : 255;
        var g = json["G"] != null ? json["G"] : 255;
        var b = json["B"] != null ? json["B"] : 255;
        return cc.size(r, g, b);
    };



    var register = [
        {name: "SingleNodeObjectData", handle: parser.initSingleNode},
        {name: "SpriteObjectData", handle: parser.initSprite},
        {name: "ParticleObjectData", handle: parser.initParticle},
        {name: "PanelObjectData", handle: parser.initPanel},
        {name: "TextObjectData", handle: parser.initText},
        {name: "ButtonObjectData", handle: parser.initButton},
        {name: "CheckBoxObjectData", handle: parser.initCheckBox},
        {name: "ScrollViewObjectData", handle: parser.initScrollView},
        {name: "ImageViewObjectData", handle: parser.initImageView},
        {name: "LoadingBarObjectData", handle: parser.initLoadingBar},
        {name: "SliderObjectData", handle: parser.initSlider},
        {name: "PageViewObjectData", handle: parser.initPageView}
    ];

    register.forEach(function(item){
        parser.registerParser(item.name, function(options, parse, resourcePath){
            var node = item.handle.call(this, options, resourcePath);
            this.parseChild(node, options["Children"], resourcePath);
            DEBUG && (node.__parserName = item.name);
            return node;
        });
    });


    load.registerParser("timeline", "2.*", parser);


})(ccs.loadNode, ccs._parser);