(function(load, baseParser){

    var loadedPlist = {};

    var Parser = baseParser.extend({

        getNodeJson: function(json){
            return json["nodeTree"];
        },

        addSpriteFrame: function(plists, pngs, resourcePath){
            if(!plists || !pngs || plists.length != pngs.length)
                return;
            for (var i = 0; i < plists.length; i++) {
                var plist = resourcePath + plists[i];
                if(!cc.loader.getRes(plist) && !loadedPlist[plist])
                    cc.log("%s need to pre load", plist);
                else
                    loadedPlist[plist] = true;
                cc.spriteFrameCache.addSpriteFrames(
                    plist,
                    resourcePath + pngs[i]
                );
            }
        },

        pretreatment: function(json, resourcePath, file){
            this.addSpriteFrame(json["textures"], json["texturesPng"], resourcePath);
        }

    });
    var parser = new Parser();

    parser.generalAttributes = function(node, options){
        var width         = options[ccui.CSLoaderStatic.WIDTH]          !=null ? options[ccui.CSLoaderStatic.WIDTH] : 0;
        var height        = options[ccui.CSLoaderStatic.HEIGHT]         !=null ? options[ccui.CSLoaderStatic.HEIGHT] : 0;
        var x             = options[ccui.CSLoaderStatic.X]              !=null ? options[ccui.CSLoaderStatic.X] : 0;
        var y             = options[ccui.CSLoaderStatic.Y]              !=null ? options[ccui.CSLoaderStatic.Y] : 0;
        var scalex        = options[ccui.CSLoaderStatic.SCALE_X]        !=null ? options[ccui.CSLoaderStatic.SCALE_X] : 1;
        var scaley        = options[ccui.CSLoaderStatic.SCALE_Y]        !=null ? options[ccui.CSLoaderStatic.SCALE_Y] : 1;
        var rotation      = options[ccui.CSLoaderStatic.ROTATION]       !=null ? options[ccui.CSLoaderStatic.ROTATION] : 0;
        var rotationSkewX = options[ccui.CSLoaderStatic.ROTATION_SKEW_X]!=null ? options[ccui.CSLoaderStatic.ROTATION_SKEW_X] : 0;
        var rotationSkewY = options[ccui.CSLoaderStatic.ROTATION_SKEW_Y]!=null ? options[ccui.CSLoaderStatic.ROTATION_SKEW_Y] : 0;
        var skewx         = options[ccui.CSLoaderStatic.SKEW_X]         !=null ? options[ccui.CSLoaderStatic.SKEW_X] : 0;
        var skewy         = options[ccui.CSLoaderStatic.SKEW_Y]         !=null ? options[ccui.CSLoaderStatic.SKEW_Y] : 0;
        var anchorx       = options[ccui.CSLoaderStatic.ANCHOR_X]       !=null ? options[ccui.CSLoaderStatic.ANCHOR_X] : 0.5;
        var anchory       = options[ccui.CSLoaderStatic.ANCHOR_Y]       !=null ? options[ccui.CSLoaderStatic.ANCHOR_Y] : 0.5;
        var alpha         = options[ccui.CSLoaderStatic.ALPHA]          !=null ? options[ccui.CSLoaderStatic.ALPHA] : 255;
        var red           = options[ccui.CSLoaderStatic.RED]            !=null ? options[ccui.CSLoaderStatic.RED] : 255;
        var green         = options[ccui.CSLoaderStatic.GREEN]          !=null ? options[ccui.CSLoaderStatic.GREEN] : 255;
        var blue          = options[ccui.CSLoaderStatic.BLUE]           !=null ? options[ccui.CSLoaderStatic.BLUE] : 255;
        var zorder        = options[ccui.CSLoaderStatic.ZORDER]         !=null ? options[ccui.CSLoaderStatic.ZORDER] : 0;
        var tag           = options[ccui.CSLoaderStatic.TAG]            !=null ? options[ccui.CSLoaderStatic.TAG] : 0;
        var actionTag     = options[ccui.CSLoaderStatic.ACTION_TAG]     !=null ? options[ccui.CSLoaderStatic.ACTION_TAG] : 0;
        var visible       = options[ccui.CSLoaderStatic.VISIBLE]        !=null ? options[ccui.CSLoaderStatic.VISIBLE] : true;

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
    };

    parser.parseComponent = function(node, options){
        if(!options) return;
        for (var i = 0; i < options.length; ++i){
            var dic = options[i];
            var component = this.loadComponent(dic);
            if (component){
                node.addComponent(component);
            }
        }
    };

    parser.parseChild = function(parse, widget, options, resourcePath){
        var children = options["children"];
        for (var i = 0; i < children.length; i++) {
            var child = this.parseNode(children[i], resourcePath);
            if(child){
                if(widget instanceof ccui.PageView){
                    if(child instanceof ccui.Layout)
                        widget.addPage(child);
                } else {
                    if(widget instanceof ccui.ListView){
                        if(child instanceof ccui.Widget)
                            widget.pushBackCustomItem(child);
                    } else {
                        if(!(widget instanceof ccui.Layout) && child instanceof ccui.Widget) {
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

    parser.initNode = function(options){
        var node = new cc.Node();
        this.generalAttributes(node, options);
        return node;
    };
    parser.initSubGraph = function(options){
        var filePath = options["fileName"];

        var node;
        if (filePath && "" != filePath){
            node = this.createNode(filePath);
        }else{
            node = new ccs.Node();
        }
        this.generalAttributes(node, options);
        return node;
    };
    parser.initSprite = function(options, resourcePath){
        var path = options["fileName"];
        var sprite;
        if(path != null){
            var spriteFrame = cc.spriteFrameCache.getSpriteFrame(path);
            if(!spriteFrame){
                path = resourcePath + path;
                sprite = new ccs.Sprite(path);
            }else{
                sprite = ccs.Sprite.createWithSpriteFrame(spriteFrame);
            }

            if(!sprite){
                sprite = new cc.Sprite();
                cc.log("filePath is empty. Create a sprite with no texture");
            }
        }else{
            sprite = new ccs.Sprite();
        }
        this.generalAttributes(sprite, options);
        var flipX = options["flipX"];
        var flipY = options["flipY"];

        if(flipX != false)
            sprite.setFlippedX(flipX);
        if(flipY != false)
            sprite.setFlippedY(flipY);
        return sprite;
    };
    parser.initParticle = function(options, resourcePath){
        var filePath = options["plistFile"];
        var num = options["tmxFile"];
        var particle = new cc.ParticleSystemQuad(filePath);
        particle.setTotalParticles(num);
        this.generalAttributes(particle, options);
        return particle;
    };
    parser.initTMXTiledMap = function(options, resourcePath){
        var tmxFile = options[ccui.CSLoaderStatic.TMX_FILE];
        var tmxString = options[ccui.CSLoaderStatic.TMX_STRING];
        //todo check path and resourcePath
        var path = options[ccui.CSLoaderStatic.RESOURCE_PATH];

        var tmx = null;
        if (tmxFile && "" != tmxFile){
            tmx = new cc.TMXTiledMap(tmxFile);
        }else if (tmxString && "" != tmxString && path && "" != path){
            tmx = new cc.TMXTiledMap(tmxString, path);
        }
        return tmx;
    };
    var uiParser = load.getParser("ccui")["1.*"];
    parser.initWidget = function(options, resourcePath){
        var type = options["classname"];

        var parser = uiParser.parsers[type];
        if(!parser)
            return cc.log("%s parser is not found", type);

        var node = parser.call(uiParser, options, resourcePath);
        if(node){
            var rotationSkewX = options["rotationSkewX"];
            var rotationSkewY = options["rotationSkewY"];
            var skewx         = options["skewX"];
            var skewy         = options["skewY"];
            if(rotationSkewX != 0)
                node.setRotationX(rotationSkewX);
            if(rotationSkewY != 0)
                node.setRotationY(rotationSkewY);
            if(skewx != 0)
                node.setSkewX(skewx);
            if(skewy != 0)
                node.setSkewY(skewy);

            var actionTag = options[ccui.CSLoaderStatic.ACTION_TAG];
            node.setUserObject(new ccs.ActionTimelineData(actionTag));
        }
        return node;
    };

    var register = [
        {name: "Node", handle: parser.initNode},
        {name: "SubGraph", handle: parser.initSubGraph},
        {name: "Sprite", handle: parser.initSprite},
        {name: "Particle", handle: parser.initParticle},
        {name: "TMXTiledMap", handle: parser.initTMXTiledMap},

        {name: "Widget", handle: parser.initWidget},
        {name: "Panel", handle: parser.initWidget},
        {name: "Button", handle: parser.initWidget},
        {name: "CheckBox", handle: parser.initWidget},
        {name: "ImageView", handle: parser.initWidget},
        {name: "LabelAtlas", handle: parser.initWidget},
        {name: "LabelBMFont", handle: parser.initWidget},
        {name: "Label", handle: parser.initWidget},
        {name: "ListView", handle: parser.initWidget},
        {name: "LoadingBar", handle: parser.initWidget},
        {name: "PageView", handle: parser.initWidget},
        {name: "ScrollView", handle: parser.initWidget},
        {name: "Slider", handle: parser.initWidget},
        {name: "TextField", handle: parser.initWidget}
    ];

    register.forEach(function(item){
        parser.registerParser(item.name, function(options, parse, resourcePath){
            var node = item.handle.call(this, options["options"]);
            this.parseComponent(node, options["components"]);
            this.parseChild(parse, node, options, resourcePath);
            return node;
        });
    });

    load.registerParser("timeline", "1.*", parser);

})(ccs._load, ccs._parser);