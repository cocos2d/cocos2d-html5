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
ccs.buttonReader = /** @lends ccs.buttonReader# */{

    /**
     * Sets ccui.Button's properties from json dictionary.
     * @param {ccui.Button} widget
     * @param {Object} options
     */
    setPropsFromJsonDictionary: function(widget, options){
        ccs.widgetReader.setPropsFromJsonDictionary.call(this, widget, options);
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
        ccs.widgetReader.setColorPropsFromJsonDictionary.call(this, widget, options);
    },

    setPropsFromProtocolBuffers: function(widget, nodeTree){
            ccs.widgetReader.setPropsFromProtocolBuffers.call(this, widget, nodeTree);
    
            var button = widget;
            var options = nodeTree["buttonOptions"];
    
            var protocolBuffersPath = ccs.uiReader.getFilePath();
    
            var scale9Enable = options["scale9Enable"];
            button.setScale9Enabled(scale9Enable);
    
    
    		var normalDic = options["normalData"];
            var normalType = normalDic["resourceType"];

            var normalTexturePath = ccs.widgetReader.getResourcePath(normalDic["path"], normalType);
            button.loadTextureNormal(normalTexturePath, normalType);
    
    
            var pressedDic = options["pressedData"];
            var pressedType = pressedDic["resourceType"];

            var pressedTexturePath = ccs.widgetReader.getResourcePath(pressedDic["path"], pressedType);
            button.loadTexturePressed(pressedTexturePath, pressedType);
    
    
            var disabledDic = options["disabledData"];
            var disabledType = disabledDic["resourceType"];

            var disabledTexturePath = ccs.widgetReader.getResourcePath(disabledDic["path"], disabledType);
            button.loadTextureDisabled(disabledTexturePath, disabledType);
    
            if (scale9Enable)
            {
                button.setUnifySizeEnabled(false);
                button.ignoreContentAdaptWithSize(false);
    
                var cx = options["capInsetsX"];
                var cy = options["capInsetsY"];
                var cw = options["capInsetsWidth"];
                var ch = options["capInsetsHeight"];
    
                button.setCapInsets(cc.rect(cx, cy, cw, ch));
                var sw = options["scale9Width"];
                var sh = options["scale9Height"];
                if (sw && sh)
                {
                    button.setContentSize(cc.size(sw, sh));
                }
            }
            var tt = options["text"];
            if (tt)
            {
                button.setTitleText(tt);
            }
    
    
            var cri = options["textColorR"]!==null ? options["textColorR"] : 255;
            var cgi = options["textColorG"]!==null ? options["textColorG"] : 255;
            var cbi = options["textColorB"]!==null ? options["textColorB"] : 255;
            button.setTitleColor(cc.color(cri,cgi,cbi));
    
    
            var fontSize = options["fontSize"]!==null ? options["fontSize"] : 14;
            button.setTitleFontSize(fontSize);
    
    		var displaystate = true;
    		if(options["displaystate"]!==null)
    		{
    			displaystate = options["displaystate"];
    		}
    		button.setBright(displaystate);
    
            var fontName = options["fontName"]!==null ? options["fontName"] : "微软雅黑";
            button.setTitleFontName(fontName);
    
            if (options["fontResource"])
    		{
    			var resourceData = options["fontResource"];
    		    button.setTitleFontName(protocolBuffersPath + resourceData["path"]);
    		}
    
            var widgetOption = nodeTree["widgetOptions"];
            button.setColor(cc.color(widgetOption["colorR"], widgetOption["colorG"], widgetOption["colorB"]));
            button.setOpacity(widgetOption["Alpha"]!==null ? widgetOption["Alpha"] : 255);
    
    
            // other commonly protperties
            ccs.widgetReader.setColorPropsFromProtocolBuffers.call(this, widget, nodeTree);
    }
};