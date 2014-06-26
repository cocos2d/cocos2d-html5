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

ccs.CheckBoxReader = {

    getInstance: function(){
        return ccs.CheckBoxReader;
    },

    setPropsFromJsonDictionary: function(widget, options){

        ccs.WidgetReader.setPropsFromJsonDictionary.call(this, widget, options);
    
    
        var jsonPath = ccs.uiReader.getFilePath();
    
        var checkBox = widget;
    
        var backGroundDic = options["backGroundBoxData"];
        var backGroundType = backGroundDic["resourceType"];
        switch (backGroundType)
        {
            case 0:
            {
                var tp_b = jsonPath;
                var backGroundFileName = backGroundDic["path"];
                var backGroundFileName_tp = (backGroundFileName && backGroundFileName !== "") ?
                    tp_b + backGroundFileName :
                    null;
                checkBox.loadTextureBackGround(backGroundFileName_tp);
                break;
            }
            case 1:
            {
                var backGroundFileName = backGroundDic["path"];
                checkBox.loadTextureBackGround(backGroundFileName, 1/*ui::UI_TEX_TYPE_PLIST*/);
                break;
            }
            default:
                break;
        }
    
        var backGroundSelectedDic = options["backGroundBoxSelectedData"];
        var backGroundSelectedType = backGroundSelectedDic["resourceType"];
        switch (backGroundSelectedType)
        {
            case 0:
            {
                var tp_bs = jsonPath;
                var backGroundSelectedFileName = backGroundSelectedDic["path"];
                var backGroundSelectedFileName_tp = (backGroundSelectedFileName && backGroundSelectedFileName !== "") ?
                    tp_bs + backGroundSelectedFileName :
                    null;
                checkBox.loadTextureBackGroundSelected(backGroundSelectedFileName_tp);
                break;
            }
            case 1:
            {
                var backGroundSelectedFileName = backGroundSelectedDic["path"];
                checkBox.loadTextureBackGroundSelected(backGroundSelectedFileName, 1/*ui::UI_TEX_TYPE_PLIST*/);
                break;
            }
            default:
                break;
        }
    
        var frontCrossDic = options["frontCrossData"];
        var frontCrossType = frontCrossDic["resourceType"];
        switch (frontCrossType)
        {
            case 0:
            {
                var tp_c = jsonPath;
                var frontCrossFileName = frontCrossDic["path"];
                var frontCrossFileName_tp = (frontCrossFileName && frontCrossFileName !== "") ?
                    tp_c + frontCrossFileName :
                    null;
                checkBox.loadTextureFrontCross(frontCrossFileName_tp);
                break;
            }
            case 1:
            {
                var frontCrossFileName = frontCrossDic["path"];
                checkBox.loadTextureFrontCross(frontCrossFileName, 1/*ui::UI_TEX_TYPE_PLIST*/);
                break;
            }
            default:
                break;
        }
    
        var backGroundDisabledDic = options["backGroundBoxDisabledData"];
        var backGroundDisabledType = backGroundDisabledDic["resourceType"];
        switch (backGroundDisabledType)
        {
            case 0:
            {
                var tp_bd = jsonPath;
                var backGroundDisabledFileName = backGroundDisabledDic["path"];
                var backGroundDisabledFileName_tp = (backGroundDisabledFileName && backGroundDisabledFileName !== "") ?
                    tp_bd + backGroundDisabledFileName :
                    null;
                checkBox.loadTextureBackGroundDisabled(backGroundDisabledFileName_tp);
                break;
            }
            case 1:
            {
                var backGroundDisabledFileName = backGroundDisabledDic["path"];
                checkBox.loadTextureBackGroundDisabled(backGroundDisabledFileName, 1/*ui::UI_TEX_TYPE_PLIST*/);
                break;
            }
            default:
                break;
        }
    
        var frontCrossDisabledDic = options["frontCrossDisabledData"];
        var frontCrossDisabledType = frontCrossDisabledDic["resourceType"];
        switch (frontCrossDisabledType)
        {
            case 0:
            {
                var tp_cd = jsonPath;
                var frontCrossDisabledFileName = options["path"];
                var frontCrossDisabledFileName_tp = (frontCrossDisabledFileName && frontCrossDisabledFileName !== "") ?
                    tp_cd + frontCrossDisabledFileName :
                    null;
                checkBox.loadTextureFrontCrossDisabled(frontCrossDisabledFileName_tp);
                break;
            }
            case 1:
            {
                var frontCrossDisabledFileName = options["path"];
                checkBox.loadTextureFrontCrossDisabled(frontCrossDisabledFileName, 1/*ui::UI_TEX_TYPE_PLIST*/);
                break;
            }
            default:
                break;
        }
    
    
        ccs.WidgetReader.setColorPropsFromJsonDictionary.call(this, widget, options);
    }
};