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
ccs.LoadingBarReader = /** @lends ccs.LoadingBarReader# */{
    /**
     * Gets the ccs.LoadingBarReader.
     * @deprecated since v3.0, please use ccs.LoadingBarReader directly.
     * @returns {ccs.LoadingBarReader}
     */
    getInstance: function(){
        return ccs.LoadingBarReader;
    },

    /**
     * Sets ccui.LoadingBar's properties from json dictionary.
     * @param {ccui.LoadingBar} widget
     * @param {Object} options
     */
    setPropsFromJsonDictionary: function(widget, options){
        ccs.WidgetReader.setPropsFromJsonDictionary.call(this, widget, options);


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

        ccs.WidgetReader.setColorPropsFromJsonDictionary.call(this, widget, options);
    },

    setPropsFromProtocolBuffers: function(widget, nodeTree){
        ccs.WidgetReader.prototype.setPropsFromProtocolBuffers.call(this, widget, nodeTree);

        var loadingBar = widget;
        var options = nodeTree.loadingbaroptions();

		var protocolBuffersPath = ccs.uiReader.getFilePath();

		var imageFileNameDic = options.texturedata();
        var imageFileNameType = imageFileNameDic.resourcetype();
		if (imageFileNameType == 1)
		{
			cc.SpriteFrameCache.addSpriteFramesWithFile(protocolBuffersPath + imageFileNameDic.plistfile());
		}
        var imageFileName = this.getResourcePath(imageFileNameDic.path(), imageFileNameType);
        loadingBar.loadTexture(imageFileName, imageFileNameType);


        /* gui mark add load bar scale9 parse */
        var scale9Enable = options.scale9enable();
        loadingBar.setScale9Enabled(scale9Enable);


        var cx = options.capinsetsx();
        var cy = options.capinsetsy();
        var cw = options.has_capinsetswidth() ? options.capinsetswidth() : 1;
        var ch = options.has_capinsetsheight() ? options.capinsetsheight() : 1;

        if (scale9Enable) {
            loadingBar.setCapInsets(cc.rect(cx, cy, cw, ch));

        }

		var widgetOptions = nodeTree.widgetoptions();
        var width = widgetOptions.width();
        var height = widgetOptions.height();
        loadingBar.setContentSize(cc.size(width, height));

        /**/

        loadingBar.setDirection(LoadingBar.Direction(options.direction()));
        var percent = options.has_percent() ? options.percent() : 100;
        loadingBar.setPercent(percent);


        // other commonly protperties
        ccs.WidgetReader.prototype.setColorPropsFromProtocolBuffers.call(this, widget, nodeTree);
    },

    setPropsFromXML: function(){
        ccs.WidgetReader.prototype.setPropsFromXML.call(this, widget, objectData);

        var loadingBar = widget;

        var xmlPath = ccs.GUIReader.getFilePath();

        var scale9Enabled = false;
        var cx = 0, cy = 0, cw = 0, ch = 0;
        var swf = 0, shf = 0;
        var direction = 0;

        var percent = 0;

        var opacity = 255;

        // attributes
        var attribute = objectData.FirstAttribute();
        while (attribute)
        {
            var name = attribute.Name();
            var value = attribute.Value();

            if (name == "ProgressType")
            {
                direction = (value == "Left_To_Right") ? 0 : 1;
            }
            else if (name == "ProgressInfo")
            {
                percent = atoi(value());
            }
            else if (name == "Scale9Enable")
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
            else if (name == "Alpha")
            {
                opacity = atoi(value());
            }

            attribute = attribute.Next();
        }

        // child elements
        var child = objectData.FirstChildElement();
        while (child)
        {
            var name = child.Name();

            if (name == "ImageFileData")
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
                        loadingBar.loadTexture(xmlPath + path, ccui.Widget.TextureResType.LOCAL);
                        break;
                    }

                    case 1:
                    {
                        cc.SpriteFrameCache.addSpriteFramesWithFile(xmlPath + plistFile);
                        loadingBar.loadTexture(path, ccui.Widget.TextureResType.PLIST);
                        break;
                    }

                    default:
                        break;
                }
            }

            child = child.NextSiblingElement();
        }

        loadingBar.setDirection(direction);
        loadingBar.setPercent(percent);

        loadingBar.setOpacity(opacity);
    }
};