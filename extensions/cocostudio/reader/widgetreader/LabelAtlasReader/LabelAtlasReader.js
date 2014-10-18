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
ccs.labelAtlasReader = /** @lends ccs.LabelAtlasReader# */{

    /**
     * Sets ccui.TextAtlas's properties from json dictionary.
     * @param {ccui.TextAtlas} widget
     * @param {Object} options
     */
    setPropsFromJsonDictionary: function(widget, options){
        ccs.widgetReader.setPropsFromJsonDictionary.call(this, widget, options);

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
        ccs.widgetReader.setColorPropsFromJsonDictionary.call(this, widget, options);

    },

    setPropsFromProtocolBuffers: function(widget, nodeTree){
        ccs.widgetReader.setPropsFromProtocolBuffers.call(this, widget, nodeTree);

        var jsonPath = ccs.uiReader.getFilePath();

        var labelAtlas = widget;
        var options = nodeTree["textAtlasOptions"];

        var cmftDic = options["charMapFileData"];
        var cmfType = cmftDic["resourceType"];
        switch (cmfType)
        {
            case 0:
            {
                var tp_c = jsonPath;
                var cmfPath = cmftDic["path"];
                var cmf_tp = tp_c += cmfPath;
                var stringValue = options["stringValue"]!==null ? options["stringValue"] : "12345678";
                var itemWidth = options["itemWidth"]!==null ? options["itemWidth"] : 24;
                var itemHeight = options["itemHeight"]!==null ? options["itemHeight"] : 32;
                labelAtlas.setProperty(stringValue,
                                        cmf_tp,
                                        itemWidth,
                                        itemHeight,
                                        options["startCharMap"]);
                break;
            }
            case 1:
                cc.log("Wrong res type of LabelAtlas!");
                break;
            default:
                break;
        }


        // other commonly protperties
        ccs.widgetReader.setColorPropsFromProtocolBuffers.call(this, widget, nodeTree);
    }
};