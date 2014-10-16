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
 * The ccui.TextBMFont's properties reader for GUIReader.
 * @class
 * @name ccs.LabelBMFontReader
 **/
ccs.labelBMFontReader = /** @lends ccs.LabelBMFontReader# */{
    /**
     * Gets the ccs.LabelBMFontReader.
     * @deprecated since v3.0, please use ccs.LabelBMFontReader directly.
     * @returns {ccs.LabelBMFontReader}
     */
    getInstance: function(){
        return ccs.labelBMFontReader;
    },

    /**
     * Sets ccui.TextBMFont's properties from json dictionary.
     * @param {ccui.TextBMFont} widget
     * @param {Object} options
     */
    setPropsFromJsonDictionary: function(widget, options){
        ccs.widgetReader.setPropsFromJsonDictionary.call(this, widget, options);

        var jsonPath = ccs.uiReader.getFilePath();
    
        var labelBMFont = widget;
    
        var cmftDic = options["fileNameData"];
        var cmfType = cmftDic["resourceType"];
        switch (cmfType) {
            case 0:
                var tp_c = jsonPath;
                var cmfPath = cmftDic["path"];
                var cmf_tp = tp_c + cmfPath;
                labelBMFont.setFntFile(cmf_tp);
                break;
            case 1:
                cc.log("Wrong res type of LabelAtlas!");
                break;
            default:
                break;
        }
    
        var text = options["text"];
        labelBMFont.setString(text);
        ccs.widgetReader.setColorPropsFromJsonDictionary.call(this, widget, options);
    },

    setPropsFromProtocolBuffers: function(widget, nodeTree){
        ccs.widgetReader.setPropsFromProtocolBuffers.call(this, widget, nodeTree);

        var jsonPath = ccs.uiReader.getFilePath();

        var labelBMFont = widget;
        var options = nodeTree.textBMFontOptions;


        if(options){
            var cmftDic = options.fileNameData;
            var cmfType = cmftDic.resourceType;
            switch (cmfType)
            {
                case 0:
                {
                    var tp_c = jsonPath;
                    var cmfPath = cmftDic.path;
                    var cmf_tp = tp_c + cmfPath;
                    labelBMFont.setFntFile(cmf_tp);
                    break;
                }
                case 1:
                    cc.log("Wrong res type of LabelAtlas!");
                    break;
                default:
                    break;
            }

            var text = options.text!==null ? options.text : "Text Label";
            labelBMFont.setString(text);
        }


        // other commonly protperties
        ccs.widgetReader.setColorPropsFromProtocolBuffers.call(this, widget, nodeTree);
    },

    setPropsFromXML: function(widget, nodeTree){
        widgetReader.setPropsFromXML(widget, objectData);

        var labelBMFont = widget;

        var xmlPath = ccs.uiReader.getFilePath();

        var text = "";

        var opacity = 255;

        // attributes
        var attribute = objectData.FirstAttribute();
        while (attribute)
        {
            var name = attribute.Name();
            var value = attribute.Value();

            if (name == "LabelText")
            {
                text = value;
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

            if (name == "LabelBMFontFile_CNB")
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
                        labelBMFont.setFntFile(xmlPath + path);
                        break;
                    }

                    default:
                        break;
                }
            }

            child = child.NextSiblingElement();
        }

        labelBMFont.setString(text);

        labelBMFont.setOpacity(opacity);
    
    }
};