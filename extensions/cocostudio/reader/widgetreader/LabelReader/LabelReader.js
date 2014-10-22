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
ccs.labelReader = /** @lends ccs.LabelReader# */{

    /**
     * Sets ccui.Text's properties from json dictionary.
     * @param {ccui.Text} widget
     * @param {Object} options
     */
    setPropsFromJsonDictionary: function(widget, options){
        ccs.widgetReader.setPropsFromJsonDictionary.call(this, widget, options);

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
        ccs.widgetReader.setColorPropsFromJsonDictionary.call(this, widget, options);
    },

    setPropsFromProtocolBuffers: function(widget, nodeTree){
		var label = widget;
        var options = nodeTree["textOptions"];

		var IsCustomSize = options["IsCustomSize"];
		label.ignoreContentAdaptWithSize(!IsCustomSize);

        ccs.widgetReader.setPropsFromProtocolBuffers.call(this, widget, nodeTree);

        label.setUnifySizeEnabled(false);

        var protocolBuffersPath = ccs.uiReader.getFilePath();

        var touchScaleChangeAble = options["touchScaleEnable"];
        label.setTouchScaleChangeEnabled(touchScaleChangeAble);
        var text = options["text"]!==null ? options["text"] : "Text Label";
        label.setString(text);

        var fontSize = options["fontSize"]!==null ? options["fontSize"] : 20;
        label.setFontSize(fontSize);

        var fontName = options["fontName"]!==null ? options["fontName"] : "微软雅黑";
        label.setFontName(fontName);

        var aw = options["areaWidth"];
        var ah = options["areaHeight"];
        if (aw !== null && ah !== null)
        {
            var size = cc.size(aw, ah);
            label.setTextAreaSize(size);
        }
        var ha = options["hAlignment"];
        if (ha)
        {
            label.setTextHorizontalAlignment(ha);
        }
        var va = options["vAlignment"];
        if (va)
        {
            label.setTextVerticalAlignment(va);
        }

		if (options["fontResource"])
		{
			var resourceData = options["fontResource"];
		    label.setFontName(protocolBuffersPath + resourceData["path"]);
		}

        // other commonly protperties
        ccs.widgetReader.setColorPropsFromProtocolBuffers.call(this, widget, nodeTree);
    }
};