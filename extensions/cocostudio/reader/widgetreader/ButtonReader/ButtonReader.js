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
 * The ccui.Button's properties reader for GUIReader.
 * @class
 * @name ccs.ButtonReader
 **/
ccs.ButtonReader = /** @lends ccs.ButtonReader# */{
    /**
     * Gets the ccs.ButtonReader.
     * @deprecated since v3.0, please use ccs.ButtonReader directly.
     * @returns {ccs.ButtonReader}
     */
    getInstance: function(){
        return ccs.ButtonReader;
    },

    /**
     * Sets ccui.Button's properties from json dictionary.
     * @param {ccui.Button} widget
     * @param {Object} options
     */
    setPropsFromJsonDictionary: function(widget, options){
        ccs.WidgetReader.setPropsFromJsonDictionary.call(this, widget, options);
        var jsonPath = ccs.uiReader.getFilePath();

        var button = widget;
        var scale9Enable = options["scale9Enable"];
        button.setScale9Enabled(scale9Enable);
    
        var normalDic = options["normalData"], normalType = normalDic["resourceType"];
        switch (normalType) {
            case 0:
                var tp_n = jsonPath;
                var normalFileName = normalDic["path"];
                var normalFileName_tp = (normalFileName && normalFileName !== "") ?
                    tp_n + normalFileName : null;
                button.loadTextureNormal(normalFileName_tp);
                break;
            case 1:
                var normalFileName = normalDic["path"];
                button.loadTextureNormal(normalFileName, 1/*ui.UI_TEX_TYPE_PLIST*/);
                break;
            default:
                break;
        }
        var pressedDic = options["pressedData"];
        var pressedType = pressedDic["resourceType"];
        switch (pressedType) {
            case 0:
                var tp_p = jsonPath;
                var pressedFileName = pressedDic["path"];
                var pressedFileName_tp = (pressedFileName && pressedFileName !== "") ?
                    tp_p + pressedFileName : null;
                button.loadTexturePressed(pressedFileName_tp);
                break;
            case 1:
                var pressedFileName = pressedDic["path"];
                button.loadTexturePressed(pressedFileName, 1/*ui.UI_TEX_TYPE_PLIST*/);
                break;
            default:
                break;
        }
        var disabledDic = options["disabledData"];
        var disabledType = disabledDic["resourceType"];
        switch (disabledType){
            case 0:
                var tp_d = jsonPath;
                var disabledFileName = disabledDic["path"];
                var disabledFileName_tp = (disabledFileName && disabledFileName !== "") ?
                    tp_d + disabledFileName : null;
                button.loadTextureDisabled(disabledFileName_tp);
                break;
            case 1:
                var disabledFileName = disabledDic["path"];
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
        var cri = cr?options["textColorR"]:255;
        var cgi = cg?options["textColorG"]:255;
        var cbi = cb?options["textColorB"]:255;
    
        button.setTitleColor(cc.color(cri,cgi,cbi));
        var fs = options["fontSize"];
        if (fs != null)
            button.setTitleFontSize(options["fontSize"]);
        var fn = options["fontName"];
        if (fn)
            button.setTitleFontName(options["fontName"]);
        ccs.WidgetReader.setColorPropsFromJsonDictionary.call(this, widget, options);
    },

    setPropsFromProtocolBuffers: function(widget, nodeTree){
            ccs.WidgetReader.prototype.setPropsFromProtocolBuffers.call(this, widget, nodeTree);
    
            var button = widget;
            var options = nodeTree.buttonoptions();
    
            var protocolBuffersPath = ccs.uiReader.getFilePath();
    
            var scale9Enable = options.scale9enable();
            button.setScale9Enabled(scale9Enable);
    
    
    		var normalDic = options.normaldata();
            var normalType = normalDic.resourcetype();
    		if (normalType == 1)
    		{
    			cc.SpriteFrameCache.addSpriteFramesWithFile(protocolBuffersPath + normalDic.plistfile());
    		}
            var normalTexturePath = this.getResourcePath(normalDic.path(), normalType);
            button.loadTextureNormal(normalTexturePath, normalType);
    
    
            var pressedDic = options.presseddata();
            var pressedType = pressedDic.resourcetype();
    		if (pressedType == 1)
    		{
    			cc.SpriteFrameCache.addSpriteFramesWithFile(protocolBuffersPath + pressedDic.plistfile());
    		}
            var pressedTexturePath = this.getResourcePath(pressedDic.path(), pressedType);
            button.loadTexturePressed(pressedTexturePath, pressedType);
    
    
            var disabledDic = options.disableddata();
            var disabledType = disabledDic.resourcetype();
    		if (disabledType == 1)
    		{
    			cc.SpriteFrameCache.addSpriteFramesWithFile(protocolBuffersPath + disabledDic.plistfile());
    		}
            var disabledTexturePath = this.getResourcePath(disabledDic.path(), disabledType);
            button.loadTextureDisabled(disabledTexturePath, disabledType);
    
            if (scale9Enable)
            {
                button.setUnifySizeEnabled(false);
                button.ignoreContentAdaptWithSize(false);
    
                var cx = options.capinsetsx();
                var cy = options.capinsetsy();
                var cw = options.capinsetswidth();
                var ch = options.capinsetsheight();
    
                button.setCapInsets(Rect(cx, cy, cw, ch));
                var sw = options.has_scale9width();
                var sh = options.has_scale9height();
                if (sw && sh)
                {
                    var swf = options.scale9width();
                    var shf = options.scale9height();
                    button.setContentSize(cc.size(swf, shf));
                }
            }
            var tt = options.has_text();
            if (tt)
            {
                var text = options.text();
                if (text)
                {
                    button.setTitleText(text);
                }
            }
    
    
            var cri = options.has_textcolorr() ? options.textcolorr() : 255;
            var cgi = options.has_textcolorg() ? options.textcolorg() : 255;
            var cbi = options.has_textcolorb() ? options.textcolorb() : 255;
            button.setTitleColor(cc.color(cri,cgi,cbi));
    
    
            var fontSize = options.has_fontsize() ? options.fontsize() : 14;
            button.setTitleFontSize(fontSize);
    
    		var displaystate = true;
    		if(options.has_displaystate())
    		{
    			displaystate = options.displaystate();
    		}
    		button.setBright(displaystate);
    
            var fontName = options.has_fontname() ? options.fontname() : "微软雅黑";
            button.setTitleFontName(fontName);
    
            if (options.has_fontresource())
    		{
    			var resourceData = options.fontresource();
    		    button.setTitleFontName(protocolBuffersPath + resourceData.path());
    		}
    
            var widgetOption = nodeTree.widgetoptions();
            button.setColor(cc.color(widgetOption.colorr(), widgetOption.colorg(), widgetOption.colorb()));
            button.setOpacity(widgetOption.has_alpha() ? widgetOption.alpha() : 255);
    
    
            // other commonly protperties
            ccs.WidgetReader.prototype.setColorPropsFromProtocolBuffers.call(this, widget, nodeTree);
    },

    setPropsFromXML: function(widget, objectData){
            ccs.WidgetReader.prototype.setPropsFromXML.call(this, widget, objectData);

            var button = widget;
    
            var xmlPath = ccs.uiReader.getFilePath();
    
            var scale9Enabled = false;
            var cx = 0, cy = 0, cw = 0, ch = 0;
            var swf = 0, shf = 0;
            var text = "";
            var fontName = "微软雅黑";
            var fontSize = 0;
            var title_color_red = 255, title_color_green = 255, title_color_blue = 255;
            var cri = 255, cgi = 255, cbi = 255;
            var opacity = 255;
    
            // attributes
            var attribute = objectData.FirstAttribute();
            while (attribute)
            {
                var name = attribute.Name();
                var value = attribute.Value();
    
                if (name == "Scale9Enable")
                {
                    if (value == "True")
                    {
                        scale9Enabled = true;
                    }
                }
                else if (name == "Scale9OriginX")
                {
                    cx = atof(value());
                }
                else if (name == "Scale9OriginY")
                {
                    cy = atof(value());
                }
                else if (name == "Scale9Width")
                {
                    cw = atof(value());
                }
                else if (name == "Scale9Height")
                {
                    ch = atof(value());
                }
                else if (name == "ButtonText")
                {
                    text = value;
                }
                else if (name == "FontSize")
                {
                    fontSize = atoi(value);
                }
                else if (name == "FontName")
                {
                    fontName = value;
                }
                else if (name == "Alpha")
                {
                    opacity = atoi(value());
                }
                else if (name == "DisplayState")
                {
                    button.setBright((value == "True") ? true : false);
                }
    
                attribute = attribute.Next();
            }
    
            // child elements
            var child = objectData.FirstChildElement();
            while (child)
            {
                var name = child.Name();
    
                if (name == "Size" && scale9Enabled)
                {
                    var attribute = child.FirstAttribute();
    
                    while (attribute)
                    {
                        var name = attribute.Name();
                        var value = attribute.Value();
    
                        if (name == "X")
                        {
                            swf = atof(value());
                        }
                        else if (name == "Y")
                        {
                            shf = atof(value());
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
                            cri = atoi(value());
                        }
                        else if (name == "G")
                        {
                            cgi = atoi(value());
                        }
                        else if (name == "B")
                        {
                            cbi = atoi(value());
                        }
    
                        attribute = attribute.Next();
                    }
                }
                else if (name == "TextColor")
                {
                    var attribute = child.FirstAttribute();
                    while (attribute)
                    {
                        var name = attribute.Name();
                        var value = attribute.Value();
    
                        if (name == "R")
                        {
                            title_color_red = atoi(value());
                        }
                        else if (name == "G")
                        {
                            title_color_green = atoi(value());
                        }
                        else if (name == "B")
                        {
                            title_color_blue = atoi(value());
                        }
    
                        attribute = attribute.Next();
                    }
                }
                else if (name == "DisabledFileData")
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
                            button.loadTextureDisabled(xmlPath + path, Widget.TextureResType.LOCAL);
                            break;
                        }
    
                        case 1:
                        {
                            SpriteFrameCache.getInstance().addSpriteFramesWithFile(xmlPath + plistFile);
                            button.loadTextureDisabled(path, Widget.TextureResType.PLIST);
                            break;
                        }
    
                        default:
                            break;
                    }
                }
                else if (name == "PressedFileData")
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
                            button.loadTexturePressed(xmlPath + path, Widget.TextureResType.LOCAL);
                            break;
                        }
    
                        case 1:
                        {
                            cc.SpriteFrameCache.addSpriteFramesWithFile(xmlPath + plistFile);
                            button.loadTexturePressed(path, Widget.TextureResType.PLIST);
                            break;
                        }
    
                        default:
                            break;
                    }
                }
                else if (name == "NormalFileData")
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
                            button.loadTextureNormal(xmlPath + path, Widget.TextureResType.LOCAL);
                            break;
                        }
    
                        case 1:
                        {
                            cc.SpriteFrameCache.addSpriteFramesWithFile(xmlPath + plistFile);
                            button.loadTextureNormal(path, Widget.TextureResType.PLIST);
                            break;
                        }
    
                        default:
                            break;
                    }
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
                            resourceType = (value == "Normal" || value == "Default") ? 0 : 1;
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
                            fontName = xmlPath + path;
                            break;
                        }
    
                        default:
                            break;
                    }
                }
    
                child = child.NextSiblingElement();
            }
    
            button.setScale9Enabled(scale9Enabled);
    
    
            if (scale9Enabled)
            {
                button.setUnifySizeEnabled(false);
                button.ignoreContentAdaptWithSize(false);
    
                button.setCapInsets(cc.rect(cx, cy, cw, ch));
                button.setContentSize(cc.size(swf, shf));
            }
    
            button.setTitleText(text);
            button.setTitleColor(cc.color(title_color_red, title_color_green, title_color_blue));
            button.setTitleFontSize(fontSize);
            button.setTitleFontName(fontName);
    
            button.setColor(cc.color(cri,cgi,cbi));
            button.setOpacity(opacity);
    }
};