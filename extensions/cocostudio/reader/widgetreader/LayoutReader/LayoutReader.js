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
 * The ccui.Layout's properties reader for GUIReader.
 * @class
 * @name ccs.LayoutReader
 **/
ccs.layoutReader = /** @lends ccs.LayoutReader# */{

    /**
     * Sets ccui.Layout's properties from json dictionary.
     * @param {ccui.Layout} widget
     * @param {Object} options
     */
    setPropsFromJsonDictionary: function(widget, options){
        ccs.widgetReader.setPropsFromJsonDictionary.call(this, widget, options);
        var jsonPath = ccs.uiReader.getFilePath();

        var panel = widget;

        var w = 0, h = 0;
        var adaptScreen = options["adaptScreen"];
        if (adaptScreen){
            var screenSize = cc.director.getWinSize();
            w = screenSize.width;
            h = screenSize.height;
        }else{
            w = options["width"];
            h = options["height"];
        }
        panel.setSize(cc.size(w, h));

        panel.setClippingEnabled(options["clipAble"]);

        var backGroundScale9Enable = options["backGroundScale9Enable"];
        panel.setBackGroundImageScale9Enabled(backGroundScale9Enable);
        var cr = options["bgColorR"];
        var cg = options["bgColorG"];
        var cb = options["bgColorB"];

        var scr = options["bgStartColorR"];
        var scg = options["bgStartColorG"];
        var scb = options["bgStartColorB"];

        var ecr = options["bgEndColorR"];
        var ecg = options["bgEndColorG"];
        var ecb = options["bgEndColorB"];

        var bgcv1 = options["vectorX"];
        var bgcv2 = options["vectorY"];
        panel.setBackGroundColorVector(cc.p(bgcv1, bgcv2));

        var co = options["bgColorOpacity"];

        var colorType = options["colorType"];
        panel.setBackGroundColorType(colorType/*ui.LayoutBackGroundColorType(colorType)*/);
        panel.setBackGroundColor(cc.color(scr, scg, scb), cc.color(ecr, ecg, ecb));
        panel.setBackGroundColor(cc.color(cr, cg, cb));
        panel.setBackGroundColorOpacity(co);


        var imageFileNameDic = options["backGroundImageData"];
        if(imageFileNameDic){
            var imageFileNameType = imageFileNameDic["resourceType"];
            switch (imageFileNameType)
            {
                case 0:
                {
                    var tp_b = jsonPath;
                    var imageFileName = imageFileNameDic["path"];
                    var imageFileName_tp = (imageFileName && (imageFileName !== "")) ?
                        tp_b + imageFileName :
                        null;
                    panel.setBackGroundImage(imageFileName_tp);
                    break;
                }
                case 1:
                {
                    var imageFileName = imageFileNameDic["path"];
                    panel.setBackGroundImage(imageFileName, 1/*ui.UI_TEX_TYPE_PLIST*/);
                    break;
                }
                default:
                    break;
            }
        }

        if (backGroundScale9Enable)
        {
            var cx = options["capInsetsX"];
            var cy = options["capInsetsY"];
            var cw = options["capInsetsWidth"];
            var ch = options["capInsetsHeight"];
            panel.setBackGroundImageCapInsets(cc.rect(cx, cy, cw, ch));
        }
        panel.setLayoutType(options["layoutType"]);
        ccs.widgetReader.setColorPropsFromJsonDictionary.call(this, widget, options);
    },

    setPropsFromProtocolBuffers: function(widget, nodeTree){
        ccs.widgetReader.setPropsFromProtocolBuffers.call(this, widget, nodeTree);

        var panel = widget;
		var options = nodeTree["PanelOptions"];
        if(!options)
            return;

		var protocolBuffersPath = ccs.uiReader.getFilePath();

        panel.setClippingEnabled(options["clipAble"]);

        var backGroundScale9Enable = options["backGroundScale9Enable"];
        panel.setBackGroundImageScale9Enabled(backGroundScale9Enable);


        var cr;
        var cg;
        var cb;
        var scr;
        var scg;
        var scb;
        var ecr;
        var ecg;
        var ecb;

        if (widget instanceof ccui.PageView)
        {
            cr = 150;
            cg = 150;
            cb = 150;

            scr = 255;
            scg = 255;
            scb = 255;

            ecr = 255;
            ecg = 150;
            ecb = 100;
        }
        else if(widget instanceof ccui.ListView)
        {
            cr = 150;
            cg = 150;
            cb = 255;

            scr = 255;
            scg = 255;
            scb = 255;

            ecr = 150;
            ecg = 150;
            ecb = 255;
        }
        else if(widget instanceof ccui.ScrollView)
        {
            cr = 255;
            cg = 150;
            cb = 100;

            scr = 255;
            scg = 255;
            scb = 255;

            ecr = 255;
            ecg = 150;
            ecb = 100;
        }
        else
        {
            cr = 150;
            cg = 200;
            cb = 255;

            scr = 255;
            scg = 255;
            scb = 255;

            ecr = 150;
            ecg = 200;
            ecb = 255;
        }

        cr = options["bgColorR"]!==null ? options["bgColorR"] : cr;
        cg = options["bgColorG"]!==null ? options["bgColorG"] : cg;
        cb = options["bgColorB"]!==null ? options["bgColorB"] : cb;

        scr = options["bgStartColorR"]!==null ? options["bgStartColorR"] : scr;
        scg = options["bgStartColorG"]!==null ? options["bgStartColorG"] : scg;
        scb = options["bgStartColorB"]!==null ? options["bgStartColorB"] : scb;

        ecr = options["bgEndColorR"]!==null ? options["bgEndColorR"] : ecr;
        ecg = options["bgEndColorG"]!==null ? options["bgEndColorG"] : ecg;
        ecb = options["bgEndColorB"]!==null ? options["bgEndColorB"] : ecb;

        var bgcv1 = 0;
        var bgcv2 = -0.5;
		if(options["vectorX"]!==null)
		{
			bgcv1 = options["vectorX"];
		}
		if(options["vectorY"])
		{
			bgcv2 = options["vectorY"];
		}
        panel.setBackGroundColorVector(cc.p(bgcv1, bgcv2));

        var co = options["bgColorOpacity"]!==null ? options["bgColorOpacity"] : 100;

        var colorType = options["colorType"]!==null ? options["colorType"] : 1;
        panel.setBackGroundColorType(colorType);

        panel.setBackGroundColor(cc.color(scr, scg, scb),cc.color(ecr, ecg, ecb));
        panel.setBackGroundColor(cc.color(cr, cg, cb));
        panel.setBackGroundColorOpacity(co);


		var imageFileNameDic = options["backGroundImageData"];
        if(imageFileNameDic){
            var imageFileNameType = imageFileNameDic["resourceType"];

            var imageFileName = ccs.widgetReader.getResourcePath(imageFileNameDic["path"], imageFileNameType);
            panel.setBackGroundImage(imageFileName, imageFileNameType);
        }


        if (backGroundScale9Enable)
        {
            //var cx = options["capInsetsX"] || 0;
            //var cy = options["capInsetsY"] || 0;
            //var cw = options["capInsetsWidth"]!==null ? options["capInsetsWidth"] : 1;
            //var ch = options["capInsetsHeight"]!==null ? options["capInsetsHeight"] : 1;
            //panel.setBackGroundImageCapInsets(cc.rect(cx, cy, cw, ch));

            var sw = options["scale9Width"];
            var sh = options["scale9Height"];
            if (sw!=null && sh !==null)
            {
                panel.setContentSize(cc.size(sw, sh));
            }
        }

        panel.setLayoutType(options["layoutType"]);

        var widgetOptions = nodeTree["widgetOptions"];

        var red = widgetOptions["colorR"]!==null ? widgetOptions["colorR"] : 255;
        var green = widgetOptions["colorG"]!==null ? widgetOptions["colorG"] : 255;
        var blue = widgetOptions["colorB"]!==null ? widgetOptions["colorB"] : 255;
        panel.setColor(cc.color(red, green, blue));

        var opacity = widgetOptions["Alpha"]!==null ? widgetOptions["Alpha"] : 255;
        panel.setOpacity(opacity);

//        var bgimgcr = widgetOptions.has_colorr() ? widgetOptions.colorr() : 255;
//        var bgimgcg = widgetOptions.has_colorg() ? widgetOptions.colorg() : 255;
//        var bgimgcb = widgetOptions.has_colorb() ? widgetOptions.colorb() : 255;
//        panel.setBackGroundImageColor(Color3B(bgimgcr, bgimgcg, bgimgcb));
//
//        var bgimgopacity = widgetOptions.has_opacity() ? widgetOptions.opacity() : 255;
//        panel.setBackGroundImageOpacity(bgimgopacity);


        // other commonly protperties
        ccs.widgetReader._setAnchorPointForWidget(widget, nodeTree);

        var flipX = widgetOptions["flipX"];
        var flipY = widgetOptions["flipY"];
        widget.setFlippedX(flipX);
        widget.setFlippedY(flipY);
    }
};