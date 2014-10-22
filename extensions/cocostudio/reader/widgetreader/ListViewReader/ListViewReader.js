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
        ccs.widgetReader.setPropsFromProtocolBuffers.call(this, widget, nodeTree);

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
            if (sw!=null && sh!=null)
            {
                listView.setContentSize(cc.size(sw, sh));
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
    }
};