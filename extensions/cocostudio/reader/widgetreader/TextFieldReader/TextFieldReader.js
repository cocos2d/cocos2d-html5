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
 * The ccui.TextField's properties reader for GUIReader.
 * @class
 * @name ccs.TextFieldReader
 **/
ccs.textFieldReader = /** @lends ccs.TextFieldReader# */{

    /**
     * Sets ccui.TextField's properties from json dictionary.
     * @param {ccui.TextField} widget
     * @param {Object} options
     */
    setPropsFromJsonDictionary: function(widget, options){
        ccs.widgetReader.setPropsFromJsonDictionary.call(this, widget, options);

        var textField = widget;
        var ph = options["placeHolder"];
        if(ph)
            textField.setPlaceHolder(ph);
        textField.setString(options["text"] || "Text Field");
        var fs = options["fontSize1"];
        if(fs)
            textField.setFontSize(fs);
        var fn = options["fontName"];
        if(fn)
            textField.setFontName(fn);
        var tsw = options["touchSizeWidth"];
        var tsh = options["touchSizeHeight"];
        if(tsw!=null && tsh!=null)
            textField.setTouchSize(tsw, tsh);

        var dw = options["width"];
        var dh = options["height"];
        if(dw > 0 || dh > 0){
            //textField.setSize(cc.size(dw, dh));
        }
        var maxLengthEnable = options["maxLengthEnable"];
        textField.setMaxLengthEnabled(maxLengthEnable);

        if(maxLengthEnable){
            var maxLength = options["maxLength"];
            textField.setMaxLength(maxLength);
        }
        var passwordEnable = options["passwordEnable"];
        textField.setPasswordEnabled(passwordEnable);
        if(passwordEnable)
            textField.setPasswordStyleText(options["passwordStyleText"]);

        var aw = options["areaWidth"];
        var ah = options["areaHeight"];
        if(aw!=null && ah!=null){
            var size = cc.size(aw, ah);
            textField.setTextAreaSize(size);
        }
        var ha = options["hAlignment"];
        if(ha)
            textField.setTextHorizontalAlignment(ha);
        var va = options["vAlignment"];
        if(va)
            textField.setTextVerticalAlignment(va);

        ccs.widgetReader.setColorPropsFromJsonDictionary.call(this, widget, options);
    },

    setPropsFromProtocolBuffers: function(widget, nodeTree){
        var textField = widget;
        var options = nodeTree["textfieldOptions"];

        var protocolBuffersPath = ccs.uiReader.getFilePath();

		var IsCustomSize = options["isCustomSize"];
		widget.ignoreContentAdaptWithSize(!IsCustomSize);

        if (IsCustomSize)
        {
            var widgetOptions = nodeTree["widgetOptions"];
            textField.setContentSize(cc.size(widgetOptions["width"], widgetOptions["height"]));
        }

        ccs.widgetReader.setPropsFromProtocolBuffers.call(this, widget, nodeTree);
        ccs.widgetReader.setAnchorPointForWidget.call(this, widget, nodeTree);

        textField.setUnifySizeEnabled(false);

        var ph = options["placeholder"];
        if (ph!==null)
        {
            var placeholder = options["placeholder"]!==null ? options["placeholder"] : "inputs words here";
            textField.setPlaceHolder(placeholder);
        }
        var text = options["text"]!==null ? options["text"] : "Text Field";
        textField.setString(text);

        var fontSize = options["fontSize"] ? options["fontSize"] : 20;
        textField.setFontSize(fontSize);


        var fontName = options["fontName"]!==null ? options["fontName"] : "微软雅黑";
        textField.setFontName(fontName);

        //        var tsw = options.has_touchsizewidth();
        //        var tsh = options.has_touchsizeheight();
        //        if (tsw && tsh)
        //        {
        //            textField.setTouchSize(Size(options.touchsizewidth(), options.touchsizeheight()));
        //        }

        //        var dw = DICTOOL.getFloatValue_json(options, "width");
        //        var dh = DICTOOL.getFloatValue_json(options, "height");
        //        if (dw > 0.0f || dh > 0.0f)
        //        {
        //            //textField.setSize(Size(dw, dh));
        //        }
        var maxLengthEnable = options["maxlengthEnable"];
        textField.setMaxLengthEnabled(maxLengthEnable);

        if (maxLengthEnable)
        {
            var maxLength = options["maxLength"]!==null ? options["maxLength"] : 10;
            textField.setMaxLength(maxLength);
        }
        var passwordEnable = options["passwordEnable"];
        textField.setPasswordEnabled(passwordEnable);
        if (passwordEnable)
        {
            var passwordStyleText = options["passwordStyleText"]!==null ? options["passwordStyleText"] : "*";
            textField.setPasswordStyleText(passwordStyleText);
        }

		if (options["fontResource"]!==null)
		{
			var resourceData = options["fontresource"];
		    textField.setFontName(protocolBuffersPath + resourceData["path"]);
		}

        // other commonly protperties
        ccs.widgetReader.setColorPropsFromProtocolBuffers.call(this, widget, nodeTree);
    }
};