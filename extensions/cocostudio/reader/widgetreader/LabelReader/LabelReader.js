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
 * The ccui.Text's properties reader for GUIReader.
 * @class
 * @name ccs.LabelReader
 **/
ccs.LabelReader = /** @lends ccs.LabelReader# */{
    /**
     * Gets the ccs.LabelReader.
     * @deprecated since v3.0, please use ccs.LabelReader directly.
     * @returns {ccs.LabelReader}
     */
    getInstance: function(){
        return ccs.LabelReader;
    },

    /**
     * Sets ccui.Text's properties from json dictionary.
     * @param {ccui.Text} widget
     * @param {Object} options
     */
    setPropsFromJsonDictionary: function(widget, options){
        ccs.WidgetReader.setPropsFromJsonDictionary.call(this, widget, options);

        var label = widget;
        var touchScaleChangeAble = options["touchScaleEnable"];
        label.setTouchScaleChangeEnabled(touchScaleChangeAble);
        var text = options["text"];
        label.setString(text);
        var fs = options["fontSize"];
        if (fs != null)
        {
            label.setFontSize(options["fontSize"]);
        }
        var fn = options["fontName"];
        if (fn != null)
        {
            label.setFontName(options["fontName"]);
        }
        var aw = options["areaWidth"];
        var ah = options["areaHeight"];
        if (aw != null && ah != null)
        {
            var size = cc.size(options["areaWidth"], options["areaHeight"]);
            label.setTextAreaSize(size);
        }
        var ha = options["hAlignment"];
        if (ha != null)
        {
            label.setTextHorizontalAlignment(options["hAlignment"]);
        }
        var va = options["vAlignment"];
        if (va != null)
        {
            label.setTextVerticalAlignment(options["vAlignment"]);
        }
        ccs.WidgetReader.setColorPropsFromJsonDictionary.call(this, widget, options);
    },

    setPropsFromProtocolBuffers: function(widget, nodeTree){
		var label = widget;
        var options = nodeTree.textOptions;

		var IsCustomSize = options.IsCustomSize;
		label.ignoreContentAdaptWithSize(!IsCustomSize);

        ccs.WidgetReader.setPropsFromProtocolBuffers.call(this, widget, nodeTree);

        label.setUnifySizeEnabled(false);

        var protocolBuffersPath = ccs.uiReader.getFilePath();

        var touchScaleChangeAble = options.touchScaleEnable;
        label.setTouchScaleChangeEnabled(touchScaleChangeAble);
        var text = options.text!==null ? options.text : "Text Label";
        label.setString(text);

        var fontSize = options.fontSize!==null ? options.fontSize : 20;
        label.setFontSize(fontSize);

        var fontName = options.fontName!==null ? options.fontName : "微软雅黑";
        label.setFontName(fontName);
//        var fontFilePath = protocolBuffersPath.append(fontName);
//		if (FileUtils.getInstance().isFileExist(fontFilePath))
//		{
//			label.setFontName(fontFilePath);
//		}
//		else{
//			label.setFontName(fontName);
//		}

        var aw = options.areaWidth;
        var ah = options.areaHeight;
        if (aw && ah)
        {
            var size = cc.size(aw, ah);
            label.setTextAreaSize(size);
        }
        var ha = options.hAlignment;
        if (ha)
        {
            label.setTextHorizontalAlignment(ha);
        }
        var va = options.vAlignment;
        if (va)
        {
            label.setTextVerticalAlignment(va);
        }

		if (options.fontResource)
		{
			var resourceData = options.fontResource;
		    label.setFontName(protocolBuffersPath + resourceData.path);
		}

        // other commonly protperties
        ccs.WidgetReader.setColorPropsFromProtocolBuffers.call(this, widget, nodeTree);
    },

    setPropsFromXML: function(widget, objectData){
        ccs.WidgetReader.setPropsFromXML.call(this, widget, objectData);

        var label = widget;

        var xmlPath = ccs.uiReader.getFilePath();

        var areaWidth = 0, areaHeight = 0;
        var halignment = 0, valignment = 0;

        var opacity = 255;

        label.setUnifySizeEnabled(false);

        label.setFontName("微软雅黑");

        // attributes
        var attribute = objectData.FirstAttribute();
        while (attribute)
        {
            var name = attribute.Name();
            var value = attribute.Value();

            if (name == "TouchScaleChangeAble")
            {
                label.setTouchScaleChangeEnabled((value == "True") ? true : false);
            }
            else if (name == "LabelText")
            {
                label.setString(value);
            }
            else if (name == "FontSize")
            {
                label.setFontSize(atoi(value.c_str()));
            }
            else if (name == "FontName")
            {
                label.setFontName(value);
            }
            else if (name == "AreaWidth")
            {
                areaWidth = atoi(value.c_str());
            }
            else if (name == "AreaHeight")
            {
                areaHeight = atoi(value.c_str());
            }
            else if (name == "HorizontalAlignmentType")
            {
                if (value == "HT_Left")
                {
                    halignment = 0;
                }
                else if (value == "HT_Center")
                {
                    halignment = 1;
                }
                else if (value == "HT_Right")
                {
                    halignment = 2;
                }
            }
            else if (name == "VerticalAlignmentType")
            {
                if (value == "VT_Top")
                {
                    valignment = 0;
                }
                else if (value == "VT_Center")
                {
                    valignment = 1;
                }
                else if (value == "VT_Bottom")
                {
                    valignment = 2;
                }
            }
            else if (name == "Alpha")
            {
                opacity = atoi(value.c_str());
            }

            attribute = attribute.Next();
        }

        // child elements
        var child = objectData.FirstChildElement();
        while (child)
        {
            var name = child.Name();

            if (name == "Size")
            {
                var attribute = child.FirstAttribute();
                var width = 0, height = 0;

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

                label.ignoreContentAdaptWithSize(false);
                label.setContentSize(cc.size(width, height));
            }
            else if (name == "FontResource")
            {
                var attribute = child.FirstAttribute();
                var resourceType = 0;
                var path = "", plistFile = "";

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

                switch (resourceType)
                {
                    case 0:
                    {
                        label.setFontName(xmlPath + path);
                        break;
                    }

                    default:
                        break;
                }
            }

            child = child.NextSiblingElement();
        }

        if (areaWidth != 0 || areaHeight != 0)
        {
            label.setTextAreaSize(cc.size(areaWidth, areaHeight));
        }

        label.setTextHorizontalAlignment(halignment);
        label.setTextVerticalAlignment(valignment);

        label.setOpacity(opacity);
    }
};