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

(function (load, baseParser) {

    var _stack = new Array(50);

    var Parser = baseParser.extend({

        addSpriteFrame: function (textures, resourcePath) {
            if (!textures) return;
            for (var i = 0; i < textures.length; i++) {
                cc.spriteFrameCache.addSpriteFrames(resourcePath + textures[i]);
            }
        },

        pretreatment: function (json, resourcePath) {
            this.addSpriteFrame(json["textures"], resourcePath);
        },

        parseRecursive: function (json, resourcePath) {
            var index = 1;
            var rootNode = null;
            var parser, curr, className, options, position, anchor, anchorPP,
                node, parent, child, children;
            _stack[0] = json;
            while (index > 0) {
                index--;
                curr = _stack[index];
                // Avoid memory leak
                _stack[index] = null;
                if (!curr) continue;

                // Parse node
                className = curr["classname"];
                parser = this.parsers[className];
                if (!parser) {
                    cc.log("Can't find the parser : %s", className);
                    continue;
                }
                node = new parser.object();
                if (!node) continue;
                if (!rootNode) {
                    rootNode = node;
                }

                // Parse attributes
                options = curr["options"];
                this.generalAttributes(node, options);
                parser.handle(node, options, resourcePath);
                this.colorAttributes(node, options);
                
                parent = curr.parent;
                curr.parent = null;
                if (parent instanceof ccui.PageView) {
                    parent.addPage(node);
                }
                else if (parent instanceof ccui.ListView) {
                    parent.pushBackCustomItem(node);
                } 
                else if (parent) {
                    if (!(parent instanceof ccui.Layout)) {
                        if (node.getPositionType() === ccui.Widget.POSITION_PERCENT) {
                            position = node._positionPercent;
                            anchor = parent._anchorPoint;
                            node._positionPercent.x = position.x + anchor.x;
                            node._positionPercent.y = position.y + anchor.y;
                        }
                        anchorPP = parent._renderCmd._anchorPointInPoints;
                        node._position.x += anchorPP.x;
                        node._position.y += anchorPP.y;
                        node.setNodeDirty();
                    }
                    parent.addChild(node);
                }

                children = curr["children"];
                if (children && children.length > 0) {
                    for (var i = children.length - 1; i >= 0; i--) {
                        _stack[index] = children[i];
                        _stack[index].parent = node;
                        index++;
                    }
                }
            }
            return rootNode;
        },

        parse: function (file, json, resourcePath) {
            resourcePath = resourcePath || this._dirname(file);
            this.pretreatment(json, resourcePath);

            var node = this.parseRecursive(json["widgetTree"], resourcePath);

            node && this.deferred(json, resourcePath, node, file);
            return node;
        },

        deferred: function (json, resourcePath, node, file) {
            if (node) {
                ccs.actionManager.initWithDictionary(file, json["animation"], node);
                node.setContentSize(json["designWidth"], json["designHeight"]);
            }
        }

    });
    var parser = new Parser();

    parser.generalAttributes = function (widget, options) {
        widget._ignoreSize = options["ignoreSize"] || true;
        widget._sizeType = options["sizeType"] || 0;
        widget._positionType = options["positionType"] || 0;

        widget._sizePercent.x = options["sizePercentX"] || 0;
        widget._sizePercent.y = options["sizePercentY"] || 0;
        widget._positionPercent.x = options["positionPercentX"] || 0;
        widget._positionPercent.y = options["positionPercentY"] || 0;

        /* adapt screen */
        var w = 0, h = 0;
        var adaptScreen = options["adaptScreen"];
        if (adaptScreen) {
            var screenSize = cc.director.getWinSize();
            w = screenSize.width;
            h = screenSize.height;
        } else {
            w = options["width"] || 0;
            h = options["height"] || 0;
        }

        var anchorPointX = options["anchorPointX"];
        var anchorPointY = options["anchorPointY"];

        widget._anchorPoint.x = isNaN(anchorPointX) ? 0.5 : anchorPointX;
        widget._anchorPoint.y = isNaN(anchorPointY) ? 0.5 : anchorPointY;

        widget.setContentSize(w, h);

        widget.setTag(options["tag"]);
        widget.setActionTag(options["actiontag"]);
        widget.setTouchEnabled(options["touchAble"]);

        widget._name = options["name"] || "default";

        widget._position.x = options["x"] || 0;
        widget._position.y = options["y"] || 0;
        widget._scaleX = options["scaleX"] || 1;
        widget._scaleY = options["scaleY"] || 1;
        widget._rotationX = widget._rotationY = options["rotation"] || 0;

        widget._visible = options["visible"] || false;
        widget._localZOrder = options["ZOrder"] || 0;

        var layout = options["layoutParameter"];
        if (layout != null) {
            var layoutParameterDic = options["layoutParameter"];
            var paramType = isNaN(layoutParameterDic["type"]) ? 2 : layoutParameterDic["type"];
            var parameter = null;

            switch (paramType) {
                case 0:
                    break;
                case 1:
                    parameter = new ccui.LinearLayoutParameter();
                    parameter._linearGravity = layoutParameterDic["gravity"] || 0;
                    break;
                case 2:
                    parameter = new ccui.RelativeLayoutParameter();
                    parameter._relativeLayoutName = layoutParameterDic["relativeName"];
                    parameter._relativeWidgetName = layoutParameterDic["relativeToName"];
                    parameter._relativeAlign = layoutParameterDic["align"] || 0;
                    break;
                default:
                    break;
            }
            if (parameter != null) {
                var margin = parameter._margin;
                margin.left = layoutParameterDic["marginLeft"] || 0;
                margin.top = layoutParameterDic["marginTop"] || 0;
                margin.right = layoutParameterDic["marginRight"] || 0;
                margin.bottom = layoutParameterDic["marginDown"] || 0;
                widget.setLayoutParameter(parameter);
            }
        }
    };

    parser.colorAttributes = function (widget, options) {
        var op = options["opacity"] !== null ? options["opacity"] : 255;
        if (op != null)
            widget.setOpacity(op);
        var colorR = options["colorR"];
        var colorG = options["colorG"];
        var colorB = options["colorB"];
        widget.setColor(cc.color((colorR == null) ? 255 : colorR, (colorG == null) ? 255 : colorG, (colorB == null) ? 255 : colorB));

        widget.setFlippedX(options["flipX"]);
        widget.setFlippedY(options["flipY"]);
    };

    var getPath = function (res, type, path, cb) {
        if (path) {
            if (type === 0)
                cb(res + path, type);
            else
                cb(path, type);
        }
    };

    /**
     * Panel parser (UILayout)
     */
    parser.LayoutAttributes = function (widget, options, resourcePath) {
        var w = 0, h = 0;
        var adaptScreen = options["adaptScreen"];
        if (adaptScreen) {
            var screenSize = cc.director.getWinSize();
            w = screenSize.width;
            h = screenSize.height;
        } else {
            w = options["width"] || 0;
            h = options["height"] || 0;
        }
        widget.setSize(cc.size(w, h));

        widget.setClippingEnabled(options["clipAble"]);

        var backGroundScale9Enable = options["backGroundScale9Enable"];
        widget.setBackGroundImageScale9Enabled(backGroundScale9Enable);
        var cr = options["bgColorR"] || 0;
        var cg = options["bgColorG"] || 0;
        var cb = options["bgColorB"] || 0;

        var scr = isNaN(options["bgStartColorR"]) ? 255 : options["bgStartColorR"];
        var scg = isNaN(options["bgStartColorG"]) ? 255 : options["bgStartColorG"];
        var scb = isNaN(options["bgStartColorB"]) ? 255 : options["bgStartColorB"];

        var ecr = isNaN(options["bgEndColorR"]) ? 255 : options["bgEndColorR"];
        var ecg = isNaN(options["bgEndColorG"]) ? 255 : options["bgEndColorG"];
        var ecb = isNaN(options["bgEndColorB"]) ? 255 : options["bgEndColorB"];

        var bgcv1 = options["vectorX"] || 0;
        var bgcv2 = options["vectorY"] || 0;
        widget.setBackGroundColorVector(cc.p(bgcv1, bgcv2));

        var co = options["bgColorOpacity"] || 0;

        var colorType = options["colorType"] || 0;
        widget.setBackGroundColorType(colorType/*ui.LayoutBackGroundColorType(colorType)*/);
        widget.setBackGroundColor(cc.color(scr, scg, scb), cc.color(ecr, ecg, ecb));
        widget.setBackGroundColor(cc.color(cr, cg, cb));
        widget.setBackGroundColorOpacity(co);


        var imageFileNameDic = options["backGroundImageData"];
        if (imageFileNameDic) {
            getPath(resourcePath, imageFileNameDic["resourceType"] || 0, imageFileNameDic["path"], function (path, type) {
                widget.setBackGroundImage(path, type);
            });
        }

        if (backGroundScale9Enable) {
            var cx = options["capInsetsX"] || 0;
            var cy = options["capInsetsY"] || 0;
            var cw = isNaN(options["capInsetsWidth"]) ? 1 : options["capInsetsWidth"];
            var ch = isNaN(options["capInsetsHeight"]) ? 1 : options["capInsetsHeight"];
            widget.setBackGroundImageCapInsets(cc.rect(cx, cy, cw, ch));
        }
        if (options["layoutType"]) {
            widget.setLayoutType(options["layoutType"]);
        }
    };
    /**
     * Button parser (UIButton)
     */
    parser.ButtonAttributes = function (widget, options, resourcePath) {
        var button = widget;
        var scale9Enable = options["scale9Enable"];
        button.setScale9Enabled(scale9Enable);

        var normalDic = options["normalData"];
        getPath(resourcePath, normalDic["resourceType"] || 0, normalDic["path"], function (path, type) {
            button.loadTextureNormal(path, type);
        });
        var pressedDic = options["pressedData"];
        getPath(resourcePath, pressedDic["resourceType"] || 0, pressedDic["path"], function (path, type) {
            button.loadTexturePressed(path, type);
        });
        var disabledDic = options["disabledData"];
        getPath(resourcePath, disabledDic["resourceType"] || 0, disabledDic["path"], function (path, type) {
            button.loadTextureDisabled(path, type);
        });
        if (scale9Enable) {
            var cx = options["capInsetsX"] || 0;
            var cy = options["capInsetsY"] || 0;
            var cw = isNaN(options["capInsetsWidth"]) ? 1 : options["capInsetsWidth"];
            var ch = isNaN(options["capInsetsHeight"]) ? 1 : options["capInsetsHeight"];

            button.setCapInsets(cc.rect(cx, cy, cw, ch));
            var sw = options["scale9Width"] || 0;
            var sh = options["scale9Height"] || 0;
            if (sw != null && sh != null)
                button.setSize(cc.size(sw, sh));
        }
        var text = options["text"] || "";
        if (text) {
            button.setTitleText(text);

            var cr = options["textColorR"];
            var cg = options["textColorG"];
            var cb = options["textColorB"];
            var cri = (cr !== null) ? options["textColorR"] : 255;
            var cgi = (cg !== null) ? options["textColorG"] : 255;
            var cbi = (cb !== null) ? options["textColorB"] : 255;

            button.setTitleColor(cc.color(cri, cgi, cbi));
            var fs = options["fontSize"];
            if (fs != null)
                button.setTitleFontSize(options["fontSize"]);
            var fn = options["fontName"];
            if (fn)
                button.setTitleFontName(options["fontName"]);
        }
    };
    /**
     * CheckBox parser (UICheckBox)
     */
    parser.CheckBoxAttributes = function (widget, options, resourcePath) {
        //load background image
        var backGroundDic = options["backGroundBoxData"];
        getPath(resourcePath, backGroundDic["resourceType"] || 0, backGroundDic["path"], function (path, type) {
            widget.loadTextureBackGround(path, type);
        });

        //load background selected image
        var backGroundSelectedDic = options["backGroundBoxSelectedData"];
        getPath(
            resourcePath,
            backGroundSelectedDic["resourceType"] || backGroundDic["resourceType"],
            backGroundSelectedDic["path"] || backGroundDic["path"],
            function (path, type) {
                widget.loadTextureBackGroundSelected(path, type);
            });

        //load frontCross image
        var frontCrossDic = options["frontCrossData"];
        getPath(resourcePath, frontCrossDic["resourceType"] || 0, frontCrossDic["path"], function (path, type) {
            widget.loadTextureFrontCross(path, type);
        });

        //load backGroundBoxDisabledData
        var backGroundDisabledDic = options["backGroundBoxDisabledData"];
        getPath(
            resourcePath,
            backGroundDisabledDic["resourceType"] || frontCrossDic["resourceType"],
            backGroundDisabledDic["path"] || frontCrossDic["path"],
            function (path, type) {
                widget.loadTextureBackGroundDisabled(path, type);
            });

        ///load frontCrossDisabledData
        var frontCrossDisabledDic = options["frontCrossDisabledData"];
        getPath(resourcePath, frontCrossDisabledDic["resourceType"] || 0, frontCrossDisabledDic["path"], function (path, type) {
            widget.loadTextureFrontCrossDisabled(path, type);
        });

        if (options["selectedState"])
            widget.setSelected(options["selectedState"]);
    };
    /**
     * ImageView parser (UIImageView)
     */
    parser.ImageViewAttributes = function (widget, options, resourcePath) {
        var imageFileNameDic = options["fileNameData"]
        getPath(resourcePath, imageFileNameDic["resourceType"] || 0, imageFileNameDic["path"], function (path, type) {
            widget.loadTexture(path, type);
        });

        var scale9EnableExist = options["scale9Enable"];
        var scale9Enable = false;
        if (scale9EnableExist) {
            scale9Enable = options["scale9Enable"];
        }
        widget.setScale9Enabled(scale9Enable);

        if (scale9Enable) {
            var sw = options["scale9Width"] || 0;
            var sh = options["scale9Height"] || 0;
            if (sw && sh) {
                var swf = options["scale9Width"] || 0;
                var shf = options["scale9Height"] || 0;
                widget.setSize(cc.size(swf, shf));
            }

            var cx = options["capInsetsX"] || 0;
            var cy = options["capInsetsY"] || 0;
            var cw = isNaN(options["capInsetsWidth"]) ? 1 : options["capInsetsWidth"];
            var ch = isNaN(options["capInsetsHeight"]) ? 1 : options["capInsetsHeight"];

            widget.setCapInsets(cc.rect(cx, cy, cw, ch));

        }
    };
    /**
     * TextAtlas parser (UITextAtlas)
     */
    parser.TextAtlasAttributes = function (widget, options, resourcePath) {
        var sv = options["stringValue"];
        var cmf = options["charMapFileData"];   // || options["charMapFile"];
        var iw = options["itemWidth"];
        var ih = options["itemHeight"];
        var scm = options["startCharMap"];
        if (sv != null && cmf && iw != null && ih != null && scm != null) {
            var cmftDic = options["charMapFileData"];
            var cmfType = cmftDic["resourceType"] || 0;
            switch (cmfType) {
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
    parser.TextBMFontAttributes = function (widget, options, resourcePath) {
        var cmftDic = options["fileNameData"];
        var cmfType = cmftDic["resourceType"] || 0;
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

        var text = options["text"] || "";
        widget.setString(text);
    };
    /**
     * Text parser (UIText)
     */
    var regTTF = /\.ttf$/;
    parser.TextAttributes = function (widget, options, resourcePath) {
        var touchScaleChangeAble = options["touchScaleEnable"];
        widget.setTouchScaleChangeEnabled(touchScaleChangeAble);
        var text = options["text"] || "";
        if(text) {
            widget._setString(text);
        }

        var fs = options["fontSize"];
        if (fs != null) {
            widget._setFontSize(options["fontSize"]);
        }
        var fn = options["fontName"];
        if (fn != null) {
            if (cc.sys.isNative) {
                if (regTTF.test(fn)) {
                    widget.setFontName(cc.path.join(cc.loader.resPath, resourcePath, fn));
                } else {
                    widget.setFontName(fn);
                }
            } else {
                widget._setFontName(fn.replace(regTTF, ''));
            }
        }
        var aw = options["areaWidth"] || 0;
        var ah = options["areaHeight"] || 0;
        if (aw && ah) {
            var size = cc.size(options["areaWidth"], options["areaHeight"]);
            widget._setTextAreaSize(size);
        }
        var ha = options["hAlignment"] || 0;
        if (ha != null) {
            widget._setTextHorizontalAlignment(ha);
        }
        var va = options["vAlignment"] || 0;
        if (va != null) {
            widget._setTextVerticalAlignment(va);
        }
        widget._updateUITextContentSize();
    };
    /**
     * ListView parser (UIListView)
     */
    parser.ListViewAttributes = function (widget, options, resoutcePath) {
        parser.ScrollViewAttributes(widget, options, resoutcePath);
        var direction = options["direction"] || 1;
        widget.setDirection(direction);
        var gravity = options["gravity"] || 0;
        widget.setGravity(gravity);
        var itemMargin = options["itemMargin"] || 0;
        widget.setItemsMargin(itemMargin);
    };
    /**
     * LoadingBar parser (UILoadingBar)
     */
    parser.LoadingBarAttributes = function (widget, options, resourcePath) {
        var imageFileNameDic = options["textureData"];
        getPath(resourcePath, imageFileNameDic["resourceType"] || 0, imageFileNameDic["path"], function (path, type) {
            widget.loadTexture(path, type);
        });

        var scale9Enable = options["scale9Enable"];
        widget.setScale9Enabled(scale9Enable);

        if (scale9Enable) {
            var cx = options["capInsetsX"] || 0;
            var cy = options["capInsetsY"] || 0;
            var cw = isNaN(options["capInsetsWidth"]) ? 1 : options["capInsetsWidth"];
            var ch = isNaN(options["capInsetsHeight"]) ? 1 : options["capInsetsHeight"];

            widget.setCapInsets(cc.rect(cx, cy, cw, ch));

            var width = options["width"] || 0;
            var height = options["height"] || 0;
            widget.setSize(cc.size(width, height));
        }

        widget.setDirection(options["direction"] || 0);
        widget.setPercent(options["percent"] || 0);
    };
    /**
     * PageView parser (UIPageView)
     */
    parser.PageViewAttributes = parser.LayoutAttributes;
    /**
     * ScrollView parser (UIScrollView)
     */
    parser.ScrollViewAttributes = function (widget, options, resoutcePath) {
        parser.LayoutAttributes(widget, options, resoutcePath);
        var innerWidth = options["innerWidth"] != null ? options["innerWidth"] : 200;
        var innerHeight = options["innerHeight"] != null ? options["innerHeight"] : 200;
        widget.setInnerContainerSize(cc.size(innerWidth, innerHeight));

        var direction = options["direction"] != null ? options["direction"] : 1;
        widget.setDirection(direction);
        widget.setBounceEnabled(options["bounceEnable"]);
    };
    /**
     * Slider parser (UISlider)
     */
    parser.SliderAttributes = function (widget, options, resourcePath) {

        var slider = widget;

        var barTextureScale9Enable = options["scale9Enable"];
        slider.setScale9Enabled(barTextureScale9Enable);
        var bt = options["barFileName"];
        var barLength = options["length"];

        var imageFileNameDic = options["barFileNameData"];
        var imageFileType = imageFileNameDic["resourceType"] || 0;
        var imageFileName = imageFileNameDic["path"];

        if (bt != null) {
            if (barTextureScale9Enable) {
                getPath(resourcePath, imageFileType, imageFileName, function (path, type) {
                    slider.loadBarTexture(path, type);
                });
                slider.setSize(cc.size(barLength, slider.getContentSize().height));
            }
        } else {
            getPath(resourcePath, imageFileType, imageFileName, function (path, type) {
                slider.loadBarTexture(path, type);
            });
        }

        var normalDic = options["ballNormalData"];
        getPath(resourcePath, normalDic["resourceType"] || 0, normalDic["path"], function (path, type) {
            slider.loadSlidBallTextureNormal(path, type);
        });

        var pressedDic = options["ballPressedData"];
        getPath(
            resourcePath,
            pressedDic["resourceType"] || normalDic["resourceType"],
            pressedDic["path"] || normalDic["path"],
            function (path, type) {
                slider.loadSlidBallTexturePressed(path, type);
            });

        var disabledDic = options["ballDisabledData"];
        getPath(resourcePath, disabledDic["resourceType"] || 0, disabledDic["path"], function (path, type) {
            slider.loadSlidBallTextureDisabled(path, type);
        });

        var progressBarDic = options["progressBarData"];
        getPath(resourcePath, progressBarDic["resourceType"] || 0, progressBarDic["path"], function (path, type) {
            slider.loadProgressBarTexture(path, type);
        });
    };
    /**
     * TextField parser (UITextField)
     */
    parser.TextFieldAttributes = function (widget, options, resourcePath) {
        var ph = options["placeHolder"] || "";
        if (ph)
            widget.setPlaceHolder(ph);
        widget.setString(options["text"] || "");
        var fs = options["fontSize"];
        if (fs)
            widget.setFontSize(fs);
        var fn = options["fontName"];
        if (fn != null) {
            if (cc.sys.isNative) {
                if (regTTF.test(fn)) {
                    widget.setFontName(cc.path.join(cc.loader.resPath, resourcePath, fn));
                } else {
                    widget.setFontName(fn);
                }
            } else {
                widget.setFontName(fn.replace(regTTF, ''));
            }
        }
        var tsw = options["touchSizeWidth"] || 0;
        var tsh = options["touchSizeHeight"] || 0;
        if (tsw != null && tsh != null)
            widget.setTouchSize(tsw, tsh);

        var dw = options["width"] || 0;
        var dh = options["height"] || 0;
        if (dw > 0 || dh > 0) {
            //textField.setSize(cc.size(dw, dh));
        }
        var maxLengthEnable = options["maxLengthEnable"];
        widget.setMaxLengthEnabled(maxLengthEnable);

        if (maxLengthEnable) {
            var maxLength = options["maxLength"];
            widget.setMaxLength(maxLength);
        }
        var passwordEnable = options["passwordEnable"];
        widget.setPasswordEnabled(passwordEnable);
        if (passwordEnable)
            widget.setPasswordStyleText(options["passwordStyleText"]);

        var aw = options["areaWidth"] || 0;
        var ah = options["areaHeight"] || 0;
        if (aw && ah) {
            var size = cc.size(aw, ah);
            widget.setTextAreaSize(size);
        }
        var ha = options["hAlignment"] || 0;
        if (ha)
            widget.setTextHorizontalAlignment(ha);
        var va = options["vAlignment"] || 0;
        if (va)
            widget.setTextVerticalAlignment(va);

        var r = isNaN(options["colorR"]) ? 255 : options["colorR"];
        var g = isNaN(options["colorG"]) ? 255 : options["colorG"];
        var b = isNaN(options["colorB"]) ? 255 : options["colorB"];
        widget.setTextColor(cc.color(r, g, b));
    };

    parser.parsers = {
        "Panel": {object: ccui.Layout, handle: parser.LayoutAttributes},
        "Button": {object: ccui.Button, handle: parser.ButtonAttributes},
        "CheckBox": {object: ccui.CheckBox, handle: parser.CheckBoxAttributes},
        "ImageView": {object: ccui.ImageView, handle: parser.ImageViewAttributes},
        "LabelAtlas": {object: ccui.TextAtlas, handle: parser.TextAtlasAttributes},
        "LabelBMFont": {object: ccui.TextBMFont, handle: parser.TextBMFontAttributes},
        "Label": {object: ccui.Text, handle: parser.TextAttributes},
        "ListView": {object: ccui.ListView, handle: parser.ListViewAttributes},
        "LoadingBar": {object: ccui.LoadingBar, handle: parser.LoadingBarAttributes},
        "PageView": {object: ccui.PageView, handle: parser.PageViewAttributes},
        "ScrollView": {object: ccui.ScrollView, handle: parser.ScrollViewAttributes},
        "Slider": {object: ccui.Slider, handle: parser.SliderAttributes},
        "TextField": {object: ccui.TextField, handle: parser.TextFieldAttributes}
    };

    load.registerParser("ccui", "*", parser);

})(ccs._load, ccs._parser);
