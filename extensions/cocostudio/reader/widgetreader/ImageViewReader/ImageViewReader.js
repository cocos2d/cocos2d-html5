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
 * The ccui.ImageView's properties reader for GUIReader.
 * @class
 * @name ccs.ImageViewReader
 **/
ccs.ImageViewReader = /** @lends ccs.ImageViewReader# */{
    /**
     * Gets the ccs.ImageViewReader.
     * @deprecated since v3.0, please use ccs.ImageViewReader directly.
     * @returns {ccs.ImageViewReader}
     */
    getInstance: function(){
        return ccs.ImageViewReader;
    },

    /**
     * Sets ccui.ImageView's properties from json dictionary.
     * @param {ccui.ImageView} widget
     * @param {Object} options
     */
    setPropsFromJsonDictionary: function(widget, options){
        ccs.WidgetReader.setPropsFromJsonDictionary.call(this, widget, options);

        var jsonPath = ccs.uiReader.getFilePath();
    
        var imageView = widget;
    
        var imageFileNameDic = options["fileNameData"], imageFileNameType = imageFileNameDic["resourceType"];
        switch (imageFileNameType){
            case 0:
                var tp_i = jsonPath;
                var imageFileName = imageFileNameDic["path"];
                var imageFileName_tp = null;
                if (imageFileName && imageFileName !== "") {
                    imageFileName_tp = tp_i + imageFileName;
                    imageView.loadTexture(imageFileName_tp);
                }
                break;
            case 1:
                var imageFileName = imageFileNameDic["path"];
                imageView.loadTexture(imageFileName, 1/*ui.UI_TEX_TYPE_PLIST*/);
                break;
            default:
                break;
        }
    
        var scale9EnableExist = options["scale9Enable"];
        var scale9Enable = false;
        if (scale9EnableExist)
        {
            scale9Enable = options["scale9Enable"];
        }
        imageView.setScale9Enabled(scale9Enable);

        if (scale9Enable)
        {
            var sw = options["scale9Width"];
            var sh = options["scale9Height"];
            if (sw && sh)
            {
                var swf = options["scale9Width"];
                var shf = options["scale9Height"];
                imageView.setSize(cc.size(swf, shf));
            }

            var cx = options["capInsetsX"];
            var cy = options["capInsetsY"];
            var cw = options["capInsetsWidth"];
            var ch = options["capInsetsHeight"];
    
            imageView.setCapInsets(cc.rect(cx, cy, cw, ch));
    
        }
        ccs.WidgetReader.setColorPropsFromJsonDictionary.call(this, widget, options);
    },

    setPropsFromProtocolBuffers: function(widget, nodeTree){
        ccs.WidgetReader.setPropsFromProtocolBuffers.call(this, widget, nodeTree);

        var options = nodeTree.imageViewOptions;
        var imageView = widget;

		var protocolBuffersPath = ccs.uiReader.getFilePath();

        var imageFileNameDic = options.fileNameData;
        var imageFileNameType = imageFileNameDic.resourceType;
		if (imageFileNameType == 1)
		{
			cc.spriteFrameCache.addSpriteFrames(protocolBuffersPath + imageFileNameDic.plistFile);
		}
        var imageFileName = ccs.WidgetReader.getResourcePath(imageFileNameDic.path, imageFileNameType);
        imageView.loadTexture(imageFileName, imageFileNameType);


        var scale9EnableExist = options.scale9Enable!==null;
        var scale9Enable = false;
        if (scale9EnableExist)
        {
            scale9Enable = options.scale9Enable;
        }
        imageView.setScale9Enabled(scale9Enable);


        if (scale9Enable)
        {
            imageView.setUnifySizeEnabled(false);
            imageView.ignoreContentAdaptWithSize(false);

            var swf = options.scale9width!==null ? options.scale9Width : 80;
            var shf = options.scale9height!==null ? options.scale9Height : 80;
            imageView.setContentSize(cc.size(swf, shf));


            var cx = options.capInsetsX;
            var cy = options.capInsetsY;
            var cw = options.capInsetsWidth!==null ? options.capInsetsWidth : 1.0;
            var ch = options.capInsetsHeight!==null ? options.capInsetsHeight : 1.0;

            imageView.setCapInsets(cc.rect(cx, cy, cw, ch));

        }

        // other commonly protperties
        ccs.WidgetReader.setColorPropsFromProtocolBuffers.call(this, widget, nodeTree);

		var flipX   = options.flippedX;
		var flipY   = options.flippedY;

		if(flipX != false)
			imageView.setFlippedX(flipX);
		if(flipY != false)
			imageView.setFlippedY(flipY);
    },

    setPropsFromXML: function(widget, objectData){
        ccs.WidgetReader.prototype.setPropsFromXML.call(this, widget, objectData);

        var imageView = widget;

        var xmlPath = ccs.uiReader.getFilePath();

        var scale9Enabled = false;
        var cx = 0, cy = 0, cw = 0, ch = 0;
        var swf = 0, shf = 0;

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
                cx = atof(value);
            }
            else if (name == "Scale9OriginY")
            {
                cy = atof(value);
            }
            else if (name == "Scale9Width")
            {
                cw = atof(value);
            }
            else if (name == "Scale9Height")
            {
                ch = atof(value);
            }
            else if (name == "Alpha")
            {
                opacity = atoi(value);
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
                        swf = atof(value);
                    }
                    else if (name == "Y")
                    {
                        shf = atof(value);
                    }

                    attribute = attribute.Next();
                }
            }
            else if (name == "FileData")
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
                        imageView.loadTexture(xmlPath + path, ccui.Widget.LOCAL_TEXTURE);
                        break;
                    }

                    case 1:
                    {
                        cc.SpriteFrameCache.addSpriteFramesWithFile(xmlPath + plistFile);
                        imageView.loadTexture(path, ccui.Widget.PLIST_TEXTURE);
                        break;
                    }

                    default:
                        break;
                }
            }

            child = child.NextSiblingElement();
        }

        imageView.setScale9Enabled(scale9Enabled);

        if (scale9Enabled)
        {
            imageView.setCapInsets(cc.rect(cx, cy, cw, ch));
            imageView.setContentSize(cc.size(swf, shf));
        }

        imageView.setOpacity(opacity);
    }
    
};