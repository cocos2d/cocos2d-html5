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
 * The ccui.LoadingBar's properties reader for GUIReader.
 * @class
 * @name ccs.LoadingBarReader
 **/
ccs.loadingBarReader = /** @lends ccs.LoadingBarReader# */{
    /**
     * Gets the ccs.LoadingBarReader.
     * @deprecated since v3.0, please use ccs.LoadingBarReader directly.
     * @returns {ccs.LoadingBarReader}
     */
    getInstance: function(){
        return ccs.loadingBarReader;
    },

    /**
     * Sets ccui.LoadingBar's properties from json dictionary.
     * @param {ccui.LoadingBar} widget
     * @param {Object} options
     */
    setPropsFromJsonDictionary: function(widget, options){
        ccs.widgetReader.setPropsFromJsonDictionary.call(this, widget, options);


        var jsonPath = ccs.uiReader.getFilePath();

        var loadingBar = widget;

        var imageFileNameDic = options["textureData"];
        var imageFileNameType = imageFileNameDic["resourceType"];
        switch (imageFileNameType){
            case 0:
                var tp_i = jsonPath;
                var imageFileName = imageFileNameDic["path"];
                var imageFileName_tp = null;
                if (imageFileName && (imageFileName !== "")){
                    imageFileName_tp = tp_i + imageFileName;
                    loadingBar.loadTexture(imageFileName_tp);
                }
                break;
            case 1:
                var imageFileName = imageFileNameDic["path"];
                loadingBar.loadTexture(imageFileName, 1/*ui.UI_TEX_TYPE_PLIST*/);
                break;
            default:
                break;
        }

        var scale9Enable = options["scale9Enable"];
        loadingBar.setScale9Enabled(scale9Enable);

        if (scale9Enable){
            var cx = options["capInsetsX"];
            var cy = options["capInsetsY"];
            var cw = options["capInsetsWidth"];
            var ch = options["capInsetsHeight"];

            loadingBar.setCapInsets(cc.rect(cx, cy, cw, ch));

            var width = options["width"];
            var height = options["height"];
            loadingBar.setSize(cc.size(width, height));
        }

        loadingBar.setDirection(options["direction"]/*ui.LoadingBarType(options["direction"])*/);
        loadingBar.setPercent(options["percent"]);

        ccs.widgetReader.setColorPropsFromJsonDictionary.call(this, widget, options);
    },

    setPropsFromProtocolBuffers: function(widget, nodeTree){
        ccs.widgetReader.setPropsFromProtocolBuffers.call(this, widget, nodeTree);

        var loadingBar = widget;
        var options = nodeTree["loadingBarOptions"];

		var protocolBuffersPath = ccs.uiReader.getFilePath();

		var imageFileNameDic = options["textureData"];
        var imageFileNameType = imageFileNameDic["resourceType"];
		if (imageFileNameType == 1)
		{
			cc.spriteFrameCache.addSpriteFrames(protocolBuffersPath + imageFileNameDic["plistFile"]);
		}
        var imageFileName = ccs.widgetReader.getResourcePath(imageFileNameDic["path"], imageFileNameType);
        loadingBar.loadTexture(imageFileName, imageFileNameType);


        /* gui mark add load bar scale9 parse */
        var scale9Enable = options["scale9Enable"];
        loadingBar.setScale9Enabled(scale9Enable);


        var cx = options["capinsetsX"];
        var cy = options["capinsetsY"];
        var cw = options["capinsetsWidth"]!=null ? options["capinsetsWidth"] : 1;
        var ch = options["capinsetsHeight"]!=null ? options["capinsetsHeight"] : 1;

        if (scale9Enable) {
            loadingBar.setCapInsets(cc.rect(cx, cy, cw, ch));

        }

		var widgetOptions = nodeTree["widgetOptions"];
        var width = widgetOptions["width"];
        var height = widgetOptions["height"];
        loadingBar.setContentSize(cc.size(width, height));

        /**/

        loadingBar.setDirection(options["direction"]);
        var percent = options["percent"]!==null ? options["percent"] : 100;
        loadingBar.setPercent(percent);


        // other commonly protperties
        ccs.widgetReader.setColorPropsFromProtocolBuffers.call(this, widget, nodeTree);
    }
};