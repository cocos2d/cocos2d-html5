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
ccs.ListViewReader = /** @lends ccs.ListViewReader# */{
    /**
     * Gets the ccs.ListViewReader.
     * @deprecated since v3.0, please use ccs.ListViewReader directly.
     * @returns {ccs.ListViewReader}
     */
    getInstance: function(){
        return ccs.ListViewReader;
    },

    /**
     * Sets ccui.ListView's properties from json dictionary.
     * @param {ccui.ListView} widget
     * @param {Object} options
     */
    setPropsFromJsonDictionary: function(widget, options){
        ccs.ScrollViewReader.setPropsFromJsonDictionary.call(this, widget, options);

        var listView = widget;

        var direction = options["direction"];
        listView.setDirection(direction);

        var gravity = options["gravity"];
        listView.setGravity(gravity);

        var itemMargin = options["itemMargin"];
        listView.setItemsMargin(itemMargin);
    },

    setPropsFromProtocolBuffers: function(widget, nodeTree){
        ccs.WidgetReader.prototype.setPropsFromProtocolBuffers.call(this, widget, nodeTree);

        var listView = widget;
        var options = nodeTree.listviewoptions();

		var protocolBuffersPath = ccs.uiReader.getFilePath();

        listView.setClippingEnabled(options.clipable());

        var backGroundScale9Enable = options.backgroundscale9enable();
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



        cr = options.has_bgcolorr() ? options.bgcolorr() : 150;
        cg = options.has_bgcolorg() ? options.bgcolorg() : 150;
        cb = options.has_bgcolorb() ? options.bgcolorb() : 255;

        scr = options.has_bgstartcolorr() ? options.bgstartcolorr() : 255;
        scg = options.has_bgstartcolorg() ? options.bgstartcolorg() : 255;
        scb = options.has_bgstartcolorb() ? options.bgstartcolorb() : 255;

        ecr = options.has_bgendcolorr() ? options.bgendcolorr() : 150;
        ecg = options.has_bgendcolorg() ? options.bgendcolorg() : 150;
        ecb = options.has_bgendcolorb() ? options.bgendcolorb() : 255;

        var bgcv1 = options.vectorx();
        var bgcv2 = options.has_vectory() ? options.vectory() : -0.5;
        listView.setBackGroundColorVector(cc.p(bgcv1, bgcv2));

        var co = options.has_bgcoloropacity() ? options.bgcoloropacity() : 100;

        var colorType = options.has_colortype() ? options.colortype() : 1;
        listView.setBackGroundColorType(Layout.BackGroundColorType(colorType));

        listView.setBackGroundColor(cc.color(scr, scg, scb),cc.color(ecr, ecg, ecb));
        listView.setBackGroundColor(cc.color(cr, cg, cb));
        listView.setBackGroundColorOpacity(co);


		var imageFileNameDic = options.backgroundimagedata();
        var imageFileNameType = imageFileNameDic.resourcetype();
		if (imageFileNameType == 1)
		{
			cc.SpriteFrameCache.addSpriteFramesWithFile(protocolBuffersPath + imageFileNameDic.plistfile());
		}
        var imageFileName = this.getResourcePath(imageFileNameDic.path(), imageFileNameType);
        listView.setBackGroundImage(imageFileName, imageFileNameType);


        if (backGroundScale9Enable)
        {
            var cx = options.capinsetsx();
            var cy = options.capinsetsy();
            var cw = options.has_capinsetswidth() ? options.capinsetswidth() : 1;
            var ch = options.has_capinsetsheight() ? options.capinsetsheight() : 1;
            listView.setBackGroundImageCapInsets(cc.rect(cx, cy, cw, ch));

            var sw = options.has_scale9width();
            var sh = options.has_scale9height();
            if (sw && sh)
            {
                var swf = options.scale9width();
                var shf = options.scale9height();
                listView.setContentSize(cc.size(swf, shf));
            }
        }

        var widgetOptions = nodeTree.widgetoptions();

        var red = widgetOptions.has_colorr() ? widgetOptions.colorr() : 255;
        var green = widgetOptions.has_colorg() ? widgetOptions.colorg() : 255;
        var blue = widgetOptions.has_colorb() ? widgetOptions.colorb() : 255;
        listView.setColor(cc.color(red, green, blue));

        var opacity = widgetOptions.has_alpha() ? widgetOptions.alpha() : 255;
        listView.setOpacity(opacity);

//        var bgimgcr = widgetOptions.has_colorr() ? widgetOptions.colorr() : 255;
//        var bgimgcg = widgetOptions.has_colorg() ? widgetOptions.colorg() : 255;
//        var bgimgcb = widgetOptions.has_colorb() ? widgetOptions.colorb() : 255;
//        listView.setBackGroundImageColor(cc.color(bgimgcr, bgimgcg, bgimgcb));
//
//        var bgimgopacity = widgetOptions.has_opacity() ? widgetOptions.opacity() : 255;
//        listView.setBackGroundImageOpacity(bgimgopacity);





        var innerWidth = options.has_innerwidth() ? options.innerwidth() : 200;
        var innerHeight = options.has_innerheight() ? options.innerheight() : 200;
        listView.setInnerContainerSize(Size(innerWidth, innerHeight));
        listView.setBounceEnabled(options.bounceenable());

        var direction = options.has_direction() ? options.direction() : 2;
        listView.setDirection(direction);

        var gravityValue = options.has_gravity() ? options.gravity() : 3;
        var gravity = gravityValue;
        listView.setGravity(gravity);

        var itemMargin = options.itemmargin();
        listView.setItemsMargin(itemMargin);


        // other commonly protperties
        this.setAnchorPointForWidget(widget, nodeTree);

        var flipX = widgetOptions.flipx();
        var flipY = widgetOptions.flipy();
        widget.setFlippedX(flipX);
        widget.setFlippedY(flipY);
    },

    setPropsFromXML: function(){
        ccs.WidgetReader.prototype.setPropsFromXML.call(this, widget, objectData);

        var listView = widget;

        var xmlPath = ccs.uiReader.getFilePath();

        var scale9Enabled = false;
        var width = 0, height = 0;
        var cx = 0, cy = 0, cw = 0, ch = 0;

        var colorType = Layout.BackGroundColorType.NONE;
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
                colorType = atoi(value);
            }
            else if (name == "BackColorAlpha")
            {
                color_opacity = atoi(value);
            }
            else if (name == "Alpha")
            {
                opacity = atoi(value);
                bgimg_opacity = atoi(value);
            }
            else if (name == "Scale9Enable")
            {
                scale9Enabled = (value == "True") ? true : false;
            }
            else if (name == "Scale9OriginX")
            {
                cx = atof(value);
            }
            else if (name == "Scale9OriginY")
            {
                cy = atof(value);
            }
            else if (name == "Scale9Width")
            {
                cw = atof(value);
            }
            else if (name == "Scale9Height")
            {
                ch = atof(value);
            }
            else if (name == "DirectionType")
            {
                if (value == "Vertical")
                {
                    listView.setDirection(ccui.ScrollView.Direction.VERTICAL);

                    var attribute = objectData.FirstAttribute();
                    while (attribute)
                    {
                        var name = attribute.Name();
                        var value = attribute.Value();

                        if (name == "HorizontalType")
                        {
                            if (value == "HORIZONTAL_LEFT")
                            {
                                listView.setGravity(ListView.Gravity.LEFT);
                            }
                            else if (value == "HORIZONTAL_RIGHT")
                            {
                                listView.setGravity(ListView.Gravity.RIGHT);
                            }
                            else if (value == "HORIZONTAL_CENTER")
                            {
                                listView.setGravity(ListView.Gravity.CENTER_HORIZONTAL);
                            }
                        }

                        attribute = attribute.Next();
                    }
                }
                else if (value == "Horizontal")
                {
                    listView.setDirection(ScrollView.Direction.HORIZONTAL);

                    var attribute = objectData.FirstAttribute();
                    while (attribute)
                    {
                        var name = attribute.Name();
                        var value = attribute.Value();

                        if (name == "VerticalType")
                        {
                            if (value == "VERTICAL_TOP")
                            {
                                listView.setGravity(ListView.Gravity.TOP);
                            }
                            else if (value == "VERTICAL_BOTTOM")
                            {
                                listView.setGravity(ListView.Gravity.BOTTOM);
                            }
                            else if (value == "VERTICAL_CENTER")
                            {
                                listView.setGravity(ListView.Gravity.CENTER_VERTICAL);
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
                listView.setItemsMargin(atoi(value));
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
                        width = atof(value);
                    }
                    else if (name == "Height")
                    {
                        height = atof(value);
                    }

                    attribute = attribute.Next();
                }

                listView.setInnerContainerSize(Size(width, height));
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
                        width = atof(value);
                    }
                    else if (name == "Y")
                    {
                        height = atof(value);
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
                        red = atoi(value);
                        bgimg_red = atoi(value);
                    }
                    else if (name == "G")
                    {
                        green = atoi(value);
                        bgimg_green = atoi(value);
                    }
                    else if (name == "B")
                    {
                        blue = atoi(value);
                        bgimg_blue = atoi(value);
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
                        singleRed = atoi(value);
                    }
                    else if (name == "G")
                    {
                        singleGreen = atoi(value);
                    }
                    else if (name == "B")
                    {
                        singleBlue = atoi(value);
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
                        end_red = atoi(value);
                    }
                    else if (name == "G")
                    {
                        end_green = atoi(value);
                    }
                    else if (name == "B")
                    {
                        end_blue = atoi(value);
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
                        start_red = atoi(value);
                    }
                    else if (name == "G")
                    {
                        start_green = atoi(value);
                    }
                    else if (name == "B")
                    {
                        start_blue = atoi(value);
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
                        vector_color_x = atof(value);
                    }
                    else if (name == "ScaleY")
                    {
                        vector_color_y = atof(value);
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
            case Layout.BackGroundColorType.SOLID:
                listView.setBackGroundColor(cc.color(singleRed, singleGreen, singleBlue));
                break;

            case Layout.BackGroundColorType.GRADIENT:
                listView.setBackGroundColor(cc.color(start_red, start_green, start_blue),
                                             cc.color(end_red, end_green, end_blue));
                listView.setBackGroundColorVector(Vec2(vector_color_x, vector_color_y));
                break;

            default:
                break;
        }

        listView.setBackGroundColorOpacity(color_opacity);

        switch (resourceType)
        {
            case 0:
            {
                listView.setBackGroundImage(xmlPath + path, Widget.TextureResType.LOCAL);
                break;
            }

            case 1:
            {
                SpriteFrameCache.getInstance().addSpriteFramesWithFile(xmlPath + plistFile);
                listView.setBackGroundImage(path, Widget.TextureResType.PLIST);
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
                listView.setBackGroundImageCapInsets(Rect(cx, cy, cw, ch));
                listView.setContentSize(Size(width, height));
            }
        }

//        listView.setBackGroundImageColor(cc.color(bgimg_red, bgimg_green, bgimg_blue));
//        listView.setBackGroundImageOpacity(bgimg_opacity);
    }
};