(function(load, baseParser){

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

    parser.initSingleNode = function(json){
        var node = new cc.Node();

        this.generalAttributes(node, json);

        return node;
    };

    parser.initSprite = function(json){
        var node =  new cc.Sprite();

        this.generalAttributes(node, json);

        var fileData = json["FileData"];
        if(fileData){
            switch(fileData["Type"]){
                case 1:
                    var spriteFrame = cc.spriteFrameCache.getSpriteFrameByName();
                    if(spriteFrame)
                        node.setSpriteFrame(spriteFrame);
                    break;
                default:
                    if(fileData["Path"])
                        node.setTexture(fileData["Path"]);
            }

        }
//        if (!fileExist)
//        {
//            auto label = Label::create();
//            label->setString(__String::createWithFormat("%s missed", errorFilePath.c_str())->getCString());
//            sprite->addChild(label);
//        }

        if(json["FlipX"])
            node.setFlippedX(true);
        if(json["FlipY"])
            node.setFlippedY(true);

        return node;
    };

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
        if(callBackType != nul)
            widget.setCallbackType(callBackType);

        var callBackName = json["CallBackName"];
        if(callBackName)
            widget.setCallbackName(callBackName);
    };

    parser.initPanel = function(json){
        var widget = new ccui.Layout();




        return node;
    };

    var register = [
        {name: "SingleNodeObjectData", handle: parser.initSingleNode},
        {name: "SpriteObjectData", handle: parser.initSprite},
        {name: "ParticleObjectData", handle: parser.initParticle},
        {name: "PanelObjectData", handle: parser.initPanel}
    ];

    register.forEach(function(item){
        parser.registerParser(item.name, function(options, parse, resourcePath){
            var node = item.handle.call(this, options);
            this.parseChild(node, options["Children"], resourcePath);
            return node;
        });
    });


    load.registerParser("timeline", "2.*", parser);


})(ccs.loadNode, ccs._parser);