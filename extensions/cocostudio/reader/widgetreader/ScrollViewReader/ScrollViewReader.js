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
 * The ccui.ScrollView's properties reader for GUIReader.
 * @class
 * @name ccs.ScrollViewReader
 **/
ccs.ScrollViewReader = /** @lends ccs.ScrollViewReader# */{
    /**
     * Gets the ccs.ScrollViewReader.
     * @deprecated since v3.0, please use ccs.ScrollViewReader directly.
     * @returns {ccs.ScrollViewReader}
     */
    getInstance: function(){
        return ccs.ScrollViewReader;
    },

    /**
     * Sets ccui.ScrollView's properties from json dictionary.
     * @param {ccui.ScrollView} widget
     * @param {Object} options
     */
    setPropsFromJsonDictionary: function(widget, options){
        ccs.LayoutReader.setPropsFromJsonDictionary.call(this, widget, options);

        var scrollView = widget;
        var innerWidth = options["innerWidth"] || 200;
        var innerHeight = options["innerHeight"] || 200;
        scrollView.setInnerContainerSize(cc.size(innerWidth, innerHeight));

        var direction = options["direction"] || 1;
        scrollView.setDirection(direction);
        scrollView.setBounceEnabled(options["bounceEnable"]);

        ccs.WidgetReader.setColorPropsFromJsonDictionary.call(this, widget, options);
    },

    setPropsFromProtocolBuffers: function(widget, nodeTree){
        ccs.WidgetReader.prototype.setPropsFromProtocolBuffers.call(this, widget, nodeTree);


        var scrollView = widget;
		var options = nodeTree.scrollviewoptions();

		var protocolBuffersPath = ccs.uiReader.getFilePath();

        scrollView.setClippingEnabled(options.clipable());

        var backGroundScale9Enable = options.backgroundscale9enable();
        scrollView.setBackGroundImageScale9Enabled(backGroundScale9Enable);


        var cr;
        var cg;
        var cb;
        var scr;
        var scg;
        var scb;
        var ecr;
        var ecg;
        var ecb;



        cr = options.has_bgcolorr() ? options.bgcolorr() : 255;
        cg = options.has_bgcolorg() ? options.bgcolorg() : 150;
        cb = options.has_bgcolorb() ? options.bgcolorb() : 100;

        scr = options.has_bgstartcolorr() ? options.bgstartcolorr() : 255;
        scg = options.has_bgstartcolorg() ? options.bgstartcolorg() : 255;
        scb = options.has_bgstartcolorb() ? options.bgstartcolorb() : 255;

        ecr = options.has_bgendcolorr() ? options.bgendcolorr() : 255;
        ecg = options.has_bgendcolorg() ? options.bgendcolorg() : 150;
        ecb = options.has_bgendcolorb() ? options.bgendcolorb() : 100;

		var bgcv1 = 0;
        var bgcv2 = -0.5;
		if(options.has_vectorx())
		{
			bgcv1 = options.vectorx();
		}
		if(options.has_vectory())
		{
			bgcv2 = options.vectory();
		}
        scrollView.setBackGroundColorVector(cc.p(bgcv1, bgcv2));

        var co = options.has_bgcoloropacity() ? options.bgcoloropacity() : 100;

        var colorType = options.has_colortype() ? options.colortype() : 1;
        scrollView.setBackGroundColorType(Layout.BackGroundColorType(colorType));

        scrollView.setBackGroundColor(cc.color(scr, scg, scb),Color3B(ecr, ecg, ecb));
        scrollView.setBackGroundColor(cc.color(cr, cg, cb));
        scrollView.setBackGroundColorOpacity(co);


		var imageFileNameDic = options.backgroundimagedata();
        var imageFileNameType = imageFileNameDic.resourcetype();
		if (imageFileNameType == 1)
		{
			cc.SpriteFrameCache.addSpriteFramesWithFile(protocolBuffersPath + imageFileNameDic.plistfile());
		}
        var imageFileName = this.getResourcePath(imageFileNameDic.path(), imageFileNameType);
        scrollView.setBackGroundImage(imageFileName, imageFileNameType);


        if (backGroundScale9Enable)
        {
            var cx = options.capinsetsx();
            var cy = options.capinsetsy();
            var cw = options.has_capinsetswidth() ? options.capinsetswidth() : 1;
            var ch = options.has_capinsetsheight() ? options.capinsetsheight() : 1;
            scrollView.setBackGroundImageCapInsets(cc.rect(cx, cy, cw, ch));
            var sw = options.has_scale9width();
            var sh = options.has_scale9height();
            if (sw && sh)
            {
                var swf = options.scale9width();
                var shf = options.scale9height();
                scrollView.setContentSize(cc.size(swf, shf));
            }
        }

        scrollView.setLayoutType(options.layouttype());

        var widgetOptions = nodeTree.widgetoptions();

        var red = widgetOptions.has_colorr() ? widgetOptions.colorr() : 255;
        var green = widgetOptions.has_colorg() ? widgetOptions.colorg() : 255;
        var blue = widgetOptions.has_colorb() ? widgetOptions.colorb() : 255;
        scrollView.setColor(cc.color(red, green, blue));

        var opacity = widgetOptions.has_alpha() ? widgetOptions.alpha() : 255;
        scrollView.setOpacity(opacity);

//        var bgimgcr = widgetOptions.has_colorr() ? widgetOptions.colorr() : 255;
//        var bgimgcg = widgetOptions.has_colorg() ? widgetOptions.colorg() : 255;
//        var bgimgcb = widgetOptions.has_colorb() ? widgetOptions.colorb() : 255;
//        scrollView.setBackGroundImageColor(Color3B(bgimgcr, bgimgcg, bgimgcb));
//        
//        var bgimgopacity = widgetOptions.has_opacity() ? widgetOptions.opacity() : 255;
//        scrollView.setBackGroundImageOpacity(bgimgopacity);




        var innerWidth = options.has_innerwidth() ? options.innerwidth() : 200;
        var innerHeight = options.has_innerheight() ? options.innerheight() : 200;
        scrollView.setInnerContainerSize(cc.size(innerWidth, innerHeight));
        var direction = options.has_direction() ? options.direction() : 1;
        scrollView.setDirection(direction);
        scrollView.setBounceEnabled(options.bounceenable());


        // other commonly protperties
        this.setAnchorPointForWidget(widget, nodeTree);

        var flipX = widgetOptions.flipx();
        var flipY = widgetOptions.flipy();
        widget.setFlippedX(flipX);
        widget.setFlippedY(flipY);
    },

    setPropsFromXML: function(widget, objectData){
        ccs.WidgetReader.prototype.setPropsFromXML.call(this, widget, objectData);

        var scrollView = widget;

        var xmlPath = ccs.uiReader.getFilePath();

        var scale9Enabled = false;
        var width = 0, height = 0;
        var cx = 0, cy = 0, cw = 0, ch = 0.0;

        var colorType = ccui.Layout.BackGroundColorType.NONE;
        var color_opacity = 255, bgimg_opacity = 255, opacity = 255;
        var red = 255, green = 255, blue = 255;
        var bgimg_red = 255, bgimg_green = 255, bgimg_blue = 255;
        var singleRed = 255, singleGreen = 255, singleBlue = 255;
        var start_red = 255, start_green = 255, start_blue = 255;
        var end_red = 255, end_green = 255, end_blue = 255;
        var vector_color_x = 0, vector_color_y = -0;

        var direction = 1;

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
                scrollView.setClippingEnabled((value == "True") ? true : false);
            }
            else if (name == "ComboBoxIndex")
            {
                colorType = atoi(value.c_str());
            }
            else if (name == "BackColorAlpha")
            {
                color_opacity = atoi(value.c_str());
            }
            else if (name == "Alpha")
            {
                opacity = atoi(value.c_str());
                bgimg_opacity = atoi(value.c_str());
            }
            else if (name == "Scale9Enable")
            {
                scale9Enabled = (value == "True") ? true : false;
            }
            else if (name == "Scale9OriginX")
            {
                cx = atof(value.c_str());
            }
            else if (name == "Scale9OriginY")
            {
                cy = atof(value.c_str());
            }
            else if (name == "Scale9Width")
            {
                cw = atof(value.c_str());
            }
            else if (name == "Scale9Height")
            {
                ch = atof(value.c_str());
            }
            else if (name == "ScrollDirectionType")
            {
                if (value == "Vertical")
                {
                    direction = 1;
                }
                else if (value == "Horizontal")
                {
                    direction = 2;
                }
                else if (value == "Vertical_Horizontal")
                {
                    direction = 3;
                }
            }
            else if (name == "IsBounceEnabled")
            {
                scrollView.setBounceEnabled((value == "True") ? true : false);
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
                        width = atof(value.c_str());
                    }
                    else if (name == "Height")
                    {
                        height = atof(value.c_str());
                    }

                    attribute = attribute.Next();
                }

                ccui.scrollView.prototype.setInnerContainerSize.call(this, cc.size(width, height));
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
                        width = atof(value.c_str());
                    }
                    else if (name == "Y")
                    {
                        height = atof(value.c_str());
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
                        red = atoi(value.c_str());
                        bgimg_red = atoi(value.c_str());
                    }
                    else if (name == "G")
                    {
                        green = atoi(value.c_str());
                        bgimg_green = atoi(value.c_str());
                    }
                    else if (name == "B")
                    {
                        blue = atoi(value.c_str());
                        bgimg_blue = atoi(value.c_str());
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
                        singleRed = atoi(value.c_str());
                    }
                    else if (name == "G")
                    {
                        singleGreen = atoi(value.c_str());
                    }
                    else if (name == "B")
                    {
                        singleBlue = atoi(value.c_str());
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
                        end_red = atoi(value.c_str());
                    }
                    else if (name == "G")
                    {
                        end_green = atoi(value.c_str());
                    }
                    else if (name == "B")
                    {
                        end_blue = atoi(value.c_str());
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
                        start_red = atoi(value.c_str());
                    }
                    else if (name == "G")
                    {
                        start_green = atoi(value.c_str());
                    }
                    else if (name == "B")
                    {
                        start_blue = atoi(value.c_str());
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
                        vector_color_x = atof(value.c_str());
                    }
                    else if (name == "ScaleY")
                    {
                        vector_color_y = atof(value.c_str());
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

        scrollView.setColor(cc.color(red, green, blue));
        scrollView.setOpacity(opacity);

        scrollView.setBackGroundColorType(colorType);
        switch (colorType)
        {
            case Layout.BackGroundColorType.SOLID:
                scrollView.setBackGroundColor(cc.color(singleRed, singleGreen, singleBlue));
                break;

            case Layout.BackGroundColorType.GRADIENT:
                scrollView.setBackGroundColor(cc.color(start_red, start_green, start_blue),
                                               cc.color(end_red, end_green, end_blue));
                scrollView.setBackGroundColorVector(cc.p(vector_color_x, vector_color_y));
                break;

            default:
                break;
        }

        scrollView.setBackGroundColorOpacity(color_opacity);

        switch (resourceType)
        {
            case 0:
            {
                scrollView.setBackGroundImage(xmlPath + path, ccui.Widget.TextureResType.LOCAL);
                break;
            }

            case 1:
            {
                cc.SpriteFrameCache.addSpriteFramesWithFile(xmlPath + plistFile);
                scrollView.setBackGroundImage(path, ccui.Widget.TextureResType.PLIST);
                break;
            }

            default:
                break;
        }

        if (path != "")
        {
            if (scale9Enabled)
            {
                scrollView.setBackGroundImageScale9Enabled(scale9Enabled);
                scrollView.setBackGroundImageCapInsets(cc.rect(cx, cy, cw, ch));
                scrollView.setContentSize(cc.size(width, height));
            }
        }

        scrollView.setDirection(direction);

//        scrollView.setBackGroundImageColor(Color3B(bgimg_red, bgimg_green, bgimg_blue));
//        scrollView.setBackGroundImageOpacity(bgimg_opacity);
    }
};