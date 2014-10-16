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
 * The ccui.TextAtlas's properties reader for GUIReader.
 * @class
 * @name ccs.LabelAtlasReader
 **/
ccs.LabelAtlasReader = /** @lends ccs.LabelAtlasReader# */{
    /**
     * Gets the ccs.LabelAtlasReader.
     * @deprecated since v3.0, please use ccs.LabelAtlasReader directly.
     * @returns {ccs.LabelAtlasReader}
     */
    getInstance: function(){
        return ccs.LabelAtlasReader;
    },

    /**
     * Sets ccui.TextAtlas's properties from json dictionary.
     * @param {ccui.TextAtlas} widget
     * @param {Object} options
     */
    setPropsFromJsonDictionary: function(widget, options){
        ccs.WidgetReader.setPropsFromJsonDictionary.call(this, widget, options);

        var jsonPath = ccs.uiReader.getFilePath();
    
        var labelAtlas = widget;
        var sv = options["stringValue"];
        var cmf = options["charMapFileData"];   // || options["charMapFile"];
        var iw = options["itemWidth"];
        var ih = options["itemHeight"];
        var scm = options["startCharMap"];
        if (sv != null && cmf && iw != null && ih != null && scm != null){
            var cmftDic = options["charMapFileData"];
            var cmfType = cmftDic["resourceType"];
            switch (cmfType){
                case 0:
                    var tp_c = jsonPath;
                    var cmfPath = cmftDic["path"];
                    var cmf_tp = tp_c + cmfPath;
                    labelAtlas.setProperty(sv, cmf_tp, iw, ih, scm);
                    break;
                case 1:
                    cc.log("Wrong res type of LabelAtlas!");
                    break;
                default:
                    break;
            }
        }
        ccs.WidgetReader.setColorPropsFromJsonDictionary.call(this, widget, options);

    },

    setPropsFromProtocolBuffers: function(widget, nodeTree){
        ccs.WidgetReader.setPropsFromProtocolBuffers.call(this, widget, nodeTree);

        var jsonPath = ccs.uiReader.getFilePath();

        var labelAtlas = widget;
        var options = nodeTree.textAtlasOptions;
        //        var sv = DICTOOL.checkObjectExist_json(options, P_StringValue);
        //        var cmf = DICTOOL.checkObjectExist_json(options, P_CharMapFile);
        //        var iw = DICTOOL.checkObjectExist_json(options, P_ItemWidth);
        //        var ih = DICTOOL.checkObjectExist_json(options, P_ItemHeight);
        //        var scm = DICTOOL.checkObjectExist_json(options, P_StartCharMap);

        var cmftDic = options.charMapFileData;
        var cmfType = cmftDic.resourceType;
        switch (cmfType)
        {
            case 0:
            {
                var tp_c = jsonPath;
                var cmfPath = cmftDic.path;
                var cmf_tp = tp_c += cmfPath;
                var stringValue = options.stringValue!==null ? options.stringValue : "12345678";
                var itemWidth = options.itemWidth!==null ? options.itemWidth : 24;
                var itemHeight = options.has_itemheight ? options.itemHeight : 32;
                labelAtlas.setProperty(stringValue,
                                        cmf_tp,
                                        itemWidth,
                                        itemHeight,
                                        options.startCharMap);
                break;
            }
            case 1:
                cc.log("Wrong res type of LabelAtlas!");
                break;
            default:
                break;
        }


        // other commonly protperties
        ccs.WidgetReader.setColorPropsFromProtocolBuffers.call(this, widget, nodeTree);
    },

    setPropsFromXML: function(widget, objectData){
        ccs.WidgetReader.setPropsFromXML.call(this, widget, objectData);

        var labelAtlas = widget;

        var xmlPath = ccs.uiReader.getFilePath();

        var stringValue = "", startChar = "";
        var itemWidth = 0, itemHeight = 0;
        var resourceType = 0;
        var path = "", plistFile = "";

        var opacity = 255;


        // attributes
        var attribute = objectData.FirstAttribute();
        while (attribute)
        {
            var name = attribute.Name();
            var value = attribute.Value();

            if (name == "LabelText")
            {
                stringValue = value;
            }
            else if (name == "CharWidth")
            {
                itemWidth = atoi(value.c_str());
            }
            else if (name == "CharHeight")
            {
                itemHeight = atoi(value.c_str());
            }
            else if (name == "StartChar")
            {
                startChar = value;
            }
            else if (name == "Alpha")
            {
                opacity = atoi(value.c_str());
            }

            attribute = attribute.Next();
        }

        // child elements
        var child = objectData.FirstChildElement();
        while (child)
        {
            var name = child.Name();

            if (name == "LabelAtlasFileImage_CNB")
            {
                var attribute = child.FirstAttribute();

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
            }

            child = child.NextSiblingElement();
        }

        labelAtlas.setProperty(stringValue, xmlPath + path, itemWidth, itemHeight, startChar);

        labelAtlas.setOpacity(opacity);
    }
};