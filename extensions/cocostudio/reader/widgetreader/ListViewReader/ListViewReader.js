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
 * The ccui.ListView's properties reader for GUIReader.
 * @class
 * @name ccs.ListViewReader
 **/
ccs.listViewReader = /** @lends ccs.ListViewReader# */{
    /**
     * Gets the ccs.ListViewReader.
     * @deprecated since v3.0, please use ccs.ListViewReader directly.
     * @returns {ccs.ListViewReader}
     */
    getInstance: function(){
        return ccs.listViewReader;
    },

    /**
     * Sets ccui.ListView's properties from json dictionary.
     * @param {ccui.ListView} widget
     * @param {Object} options
     */
    setPropsFromJsonDictionary: function(widget, options){
        ccs.scrollViewReader.setPropsFromJsonDictionary.call(this, widget, options);

        var listView = widget;

        var direction = options["direction"];
        listView.setDirection(direction);

        var gravity = options["gravity"];
        listView.setGravity(gravity);

        var itemMargin = options["itemMargin"];
        listView.setItemsMargin(itemMargin);
    },

    setPropsFromProtocolBuffers: function(widget, nodeTree){
        ccs.widgetReader.prototype.setPropsFromProtocolBuffers.call(this, widget, nodeTree);

        var listView = widget;
        var options = nodeTree["listviewOptions"];

		var protocolBuffersPath = ccs.uiReader.getFilePath();

        listView.setClippingEnabled(options["clipAble"]);

        var backGroundScale9Enable = options["backGroundScale9enAble"];
        listView.setBackGroundImageScale9Enabled(backGroundScale9Enable);


        var cr;
        var cg;
        var cb;
        var scr;
        var scg;
        var scb;
        var ecr;
        var ecg;
        var ecb;



        cr = options["bgColorR"]!==null ? options["bgColorR"] : 150;
        cg = options["bgColorG"]!==null ? options["bgColorG"] : 150;
        cb = options["bgColorB"]!==null ? options["bgColorB"] : 255;

        scr = options["bgStartColorR"]!==null ? options["bgStartColorR"] : 255;
        scg = options["bgStartColorG"]!==null ? options["bgStartColorG"] : 255;
        scb = options["bgStartColorB"]!==null ? options["bgStartColorB"] : 255;

        ecr = options["bgEndColorR"]!==null ? options["bgEndColorR"] : 150;
        ecg = options["bgEndColorG"]!==null ? options["bgEndColorG"] : 150;
        ecb = options["bgEndColorB"]!==null ? options["bgEndColorB"] : 255;

        var bgcv1 = options["vectorX"];
        var bgcv2 = options["ectorY"]!==null ? options["vectorY"] : -0.5;
        listView.setBackGroundColorVector(cc.p(bgcv1, bgcv2));

        var co = options["bgColorOpacity"]!==null ? options["bgColorOpacity"] : 100;

        var colorType = options["colorType"]!==null ? options["colorType"] : 1;
        listView.setBackGroundColorType(colorType);

        listView.setBackGroundColor(cc.color(scr, scg, scb),cc.color(ecr, ecg, ecb));
        listView.setBackGroundColor(cc.color(cr, cg, cb));
        listView.setBackGroundColorOpacity(co);


		var imageFileNameDic = options["backGroundImageData"];
        var imageFileNameType = imageFileNameDic["resourceType"];
		if (imageFileNameType == 1)
		{
			cc.spriteFrameCache.addSpriteFrames(protocolBuffersPath + imageFileNameDic["plistFile"]);
		}
        var imageFileName = ccs.widgetReader.getResourcePath(imageFileNameDic["path"], imageFileNameType);
        listView.setBackGroundImage(imageFileName, imageFileNameType);


        if (backGroundScale9Enable)
        {
            var cx = options["capInsetsX"];
            var cy = options["capInsetsY"];
            var cw = options["capInsetsWidth"]!==null ? options["capInsetsWidth"] : 1;
            var ch = options["capInsetsHeight"]!==null ? options["capInsetsHeight"] : 1;
            listView.setBackGroundImageCapInsets(cc.rect(cx, cy, cw, ch));

            var sw = options["scale9width"];
            var sh = options["scale9height"];
            if (sw && sh)
            {
                var swf = options["scale9width"];
                var shf = options["scale9height"];
                listView.setContentSize(cc.size(swf, shf));
            }
        }

        var widgetOptions = nodeTree["widgetOptions"];

        var red = widgetOptions["colorR"]!==null ? widgetOptions["colorR"] : 255;
        var green = widgetOptions["colorG"]!==null ? widgetOptions["colorG"] : 255;
        var blue = widgetOptions["colorB"]!==null ? widgetOptions["colorB"] : 255;
        listView.setColor(cc.color(red, green, blue));

        var opacity = widgetOptions["Alpha"]!=null ? widgetOptions["Alpha"] : 255;
        listView.setOpacity(opacity);

//        var bgimgcr = widgetOptions.has_colorr() ? widgetOptions.colorr() : 255;
//        var bgimgcg = widgetOptions.has_colorg() ? widgetOptions.colorg() : 255;
//        var bgimgcb = widgetOptions.has_colorb() ? widgetOptions.colorb() : 255;
//        listView.setBackGroundImageColor(cc.color(bgimgcr, bgimgcg, bgimgcb));
//
//        var bgimgopacity = widgetOptions.has_opacity() ? widgetOptions.opacity() : 255;
//        listView.setBackGroundImageOpacity(bgimgopacity);

        var innerWidth = options["innerWidth"]!==null ? options["innerWidth"] : 200;
        var innerHeight = options["innerHeight"]!==null ? options["innerHeight"] : 200;
        listView.setInnerContainerSize(cc.size(innerWidth, innerHeight));
        listView.setBounceEnabled(options["bounceEnable"]);

        var direction = options["direction"]!=null ? options["direction"] : 2;
        listView.setDirection(direction);

        var gravityValue = options["gravity"]!==null ? options["gravity"] : 3;
        var gravity = gravityValue;
        listView.setGravity(gravity);

        var itemMargin = options["itemMargin"];
        listView.setItemsMargin(itemMargin);


        // other commonly protperties
        ccs.widgetReader.setAnchorPointForWidget(widget, nodeTree);

        var flipX = widgetOptions["flipX"];
        var flipY = widgetOptions["flipY"];
        widget.setFlippedX(flipX);
        widget.setFlippedY(flipY);
    },

    setPropsFromXML: function(widget, objectData){
        ccs.widgetReader.setPropsFromXML.call(this, widget, objectData);

        var listView = widget;

        var xmlPath = ccs.uiReader.getFilePath();

        var scale9Enabled = false;
        var width = 0, height = 0;
        var cx = 0, cy = 0, cw = 0, ch = 0;

        var colorType = ccui.Layout.BG_COLOR_NONE;
        var color_opacity = 255, bgimg_opacity = 255, opacity = 255;
        var red = 255, green = 255, blue = 255;
        var bgimg_red = 255, bgimg_green = 255, bgimg_blue = 255;
        var singleRed = 255, singleGreen = 255, singleBlue = 255;
        var start_red = 255, start_green = 255, start_blue = 255;
        var end_red = 255, end_green = 255, end_blue = 255;
        var vector_color_x = 0.0, vector_color_y = -0.5;

        var resourceType = 0;
        var path = "", plistFile = "";

        // attributes
        var attribute = objectData.FirstAttribute();
        while (attribute)
        {
            var name = attribute.Name();
            var value = attribute.Value();

            if (name == "ClipAble")
            {
                listView.setClippingEnabled((value == "True") ? true : false);
            }
            else if (name == "ComboBoxIndex")
            {
                colorType = value;
            }
            else if (name == "BackColorAlpha")
            {
                color_opacity = value;
            }
            else if (name == "Alpha")
            {
                opacity = value;
                bgimg_opacity = value;
            }
            else if (name == "Scale9Enable")
            {
                scale9Enabled = (value == "True") ? true : false;
            }
            else if (name == "Scale9OriginX")
            {
                cx = value;
            }
            else if (name == "Scale9OriginY")
            {
                cy = value;
            }
            else if (name == "Scale9Width")
            {
                cw = value;
            }
            else if (name == "Scale9Height")
            {
                ch = value;
            }
            else if (name == "DirectionType")
            {
                if (value == "Vertical")
                {
                    listView.setDirection(ccui.ScrollView.DIR_VERTICAL);

                    var attribute = objectData.FirstAttribute();
                    while (attribute)
                    {
                        var name = attribute.Name();
                        var value = attribute.Value();

                        if (name == "HorizontalType")
                        {
                            if (value == "HORIZONTAL_LEFT")
                            {
                                listView.setGravity(ccui.ListView.GRAVITY_LEFT);
                            }
                            else if (value == "HORIZONTAL_RIGHT")
                            {
                                listView.setGravity(ccui.ListView.GRAVITY_RIGHT);
                            }
                            else if (value == "HORIZONTAL_CENTER")
                            {
                                listView.setGravity(ccui.ListView.GRAVITY_CENTER_HORIZONTAL);
                            }
                        }

                        attribute = attribute.Next();
                    }
                }
                else if (value == "Horizontal")
                {
                    listView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);

                    var attribute = objectData.FirstAttribute();
                    while (attribute)
                    {
                        var name = attribute.Name();
                        var value = attribute.Value();

                        if (name == "VerticalType")
                        {
                            if (value == "VERTICAL_TOP")
                            {
                                listView.setGravity(ccui.ListView.GRAVITY_TOP);
                            }
                            else if (value == "VERTICAL_BOTTOM")
                            {
                                listView.setGravity(ccui.ListView.GRAVITY_BOTTOM);
                            }
                            else if (value == "VERTICAL_CENTER")
                            {
                                listView.setGravity(ccui.ListView.GRAVITY_CENTER_VERTICAL);
                            }
                        }

                        attribute = attribute.Next();
                    }
                }
            }
            else if (name == "IsBounceEnabled")
            {
                listView.setBounceEnabled((value == "True") ? true : false);
            }
            else if (name == "ItemMargin")
            {
                listView.setItemsMargin(value);
            }

            attribute = attribute.Next();
        }

        // child elements
        var child = objectData.FirstChildElement();
        while (child)
        {
            var name = child.Name();

            if (name == "InnerNodeSize")
            {
                var attribute = child.FirstAttribute();
                var width = 0, height = 0;

                while (attribute)
                {
                    var name = attribute.Name();
                    var value = attribute.Value();

                    if (name == "Width")
                    {
                        width = value;
                    }
                    else if (name == "Height")
                    {
                        height = value;
                    }

                    attribute = attribute.Next();
                }

                ccui.listView.prototype.setInnerContainerSize(cc.size(width, height));
            }
            else if (name == "Size")
            {
                var attribute = child.FirstAttribute();

                while (attribute)
                {
                    var name = attribute.Name();
                    var value = attribute.Value();

                    if (name == "X")
                    {
                        width = value;
                    }
                    else if (name == "Y")
                    {
                        height = value;
                    }

                    attribute = attribute.Next();
                }
            }
            else if (name == "CColor")
            {
                var attribute = child.FirstAttribute();

                while (attribute)
                {
                    var name = attribute.Name();
                    var value = attribute.Value();

                    if (name == "R")
                    {
                        red = value;
                        bgimg_red = value;
                    }
                    else if (name == "G")
                    {
                        green = value;
                        bgimg_green = value;
                    }
                    else if (name == "B")
                    {
                        blue = value;
                        bgimg_blue = value;
                    }

                    attribute = attribute.Next();
                }
            }
            else if (name == "SingleColor")
            {
                var attribute = child.FirstAttribute();
                while (attribute)
                {
                    var name = attribute.Name();
                    var value = attribute.Value();

                    if (name == "R")
                    {
                        singleRed = value;
                    }
                    else if (name == "G")
                    {
                        singleGreen = value;
                    }
                    else if (name == "B")
                    {
                        singleBlue = value;
                    }

                    attribute = attribute.Next();
                }
            }
            else if (name == "EndColor")
            {
                var attribute = child.FirstAttribute();
                while (attribute)
                {
                    var name = attribute.Name();
                    var value = attribute.Value();

                    if (name == "R")
                    {
                        end_red = value;
                    }
                    else if (name == "G")
                    {
                        end_green = value;
                    }
                    else if (name == "B")
                    {
                        end_blue = value;
                    }

                    attribute = attribute.Next();
                }
            }
            else if (name == "FirstColor")
            {
                var attribute = child.FirstAttribute();
                while (attribute)
                {
                    var name = attribute.Name();
                    var value = attribute.Value();

                    if (name == "R")
                    {
                        start_red = value;
                    }
                    else if (name == "G")
                    {
                        start_green = value;
                    }
                    else if (name == "B")
                    {
                        start_blue = value;
                    }

                    attribute = attribute.Next();
                }
            }
            else if (name == "ColorVector")
            {
                var attribute = child.FirstAttribute();
                while (attribute)
                {
                    var name = attribute.Name();
                    var value = attribute.Value();

                    if (name == "ScaleX")
                    {
                        vector_color_x = value;
                    }
                    else if (name == "ScaleY")
                    {
                        vector_color_y = value;
                    }

                    attribute = attribute.Next();
                }
            }
            else if (name == "FileData")
            {
                var attribute = child.FirstAttribute();

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
            }

            child = child.NextSiblingElement();
        }

        listView.setColor(cc.color(red, green, blue));
        listView.setOpacity(opacity);

        listView.setBackGroundColorType(colorType);
        switch (colorType)
        {
            case ccui.Layout.BG_COLOR_SOLID:
                listView.setBackGroundColor(cc.color(singleRed, singleGreen, singleBlue));
                break;

            case ccui.Layout.BG_COLOR_GRADIENT:
                listView.setBackGroundColor(cc.color(start_red, start_green, start_blue),
                                             cc.color(end_red, end_green, end_blue));
                listView.setBackGroundColorVector(cc.p(vector_color_x, vector_color_y));
                break;

            default:
                break;
        }

        listView.setBackGroundColorOpacity(color_opacity);

        switch (resourceType)
        {
            case 0:
            {
                listView.setBackGroundImage(xmlPath + path, ccui.Widget.LOCAL_TEXTURE);
                break;
            }

            case 1:
            {
                cc.spriteFrameCache.addSpriteFrames(xmlPath + plistFile);
                listView.setBackGroundImage(path, ccui.Widget.PLIST_TEXTURE);
                break;
            }

            default:
                break;
        }

        if (path != "")
        {
            if (scale9Enabled)
            {
                listView.setBackGroundImageScale9Enabled(scale9Enabled);
                listView.setBackGroundImageCapInsets(cc.rect(cx, cy, cw, ch));
                listView.setContentSize(cc.size(width, height));
            }
        }

//        listView.setBackGroundImageColor(cc.color(bgimg_red, bgimg_green, bgimg_blue));
//        listView.setBackGroundImageOpacity(bgimg_opacity);
    }
};