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

        var tp = jsonPath;
        var backGroundFileName = backGroundDic["path"];
        switch (backGroundType)
        {
            case 0:
            {
                var backGroundFileName_tp = backGroundFileName ?
                    tp + backGroundFileName :
                    null;
                checkBox.loadTextureBackGround(backGroundFileName_tp);
                break;
            }
            case 1:
            {
                checkBox.loadTextureBackGround(backGroundFileName, 1/*ui::UI_TEX_TYPE_PLIST*/);
                break;
            }
            default:
                break;
        }
    
        var backGroundSelectedDic = options["backGroundBoxSelectedData"];
        var backGroundSelectedType = backGroundSelectedDic["resourceType"];
        var backGroundSelectedFileName = backGroundSelectedDic["path"];
        if(backGroundSelectedFileName === null){
            backGroundSelectedType = backGroundType;
            backGroundSelectedFileName = backGroundFileName;
        }

        switch (backGroundSelectedType)
        {
            case 0:
            {
                var backGroundSelectedFileName_tp = backGroundSelectedFileName ?
                    tp + backGroundSelectedFileName :
                    null;
                checkBox.loadTextureBackGroundSelected(backGroundSelectedFileName_tp);
                break;
            }
            case 1:
            {
                checkBox.loadTextureBackGroundSelected(backGroundSelectedFileName, 1/*ui::UI_TEX_TYPE_PLIST*/);
                break;
            }
            default:
                break;
        }
    
        var frontCrossDic = options["frontCrossData"];
        var frontCrossType = frontCrossDic["resourceType"];
        var frontCrossFileName = frontCrossDic["path"];
        switch (frontCrossType)
        {
            case 0:
            {
                var frontCrossFileName_tp = frontCrossFileName ?
                    tp + frontCrossFileName :
                    null;
                checkBox.loadTextureFrontCross(frontCrossFileName_tp);
                break;
            }
            case 1:
            {
                checkBox.loadTextureFrontCross(frontCrossFileName, 1/*ui::UI_TEX_TYPE_PLIST*/);
                break;
            }
            default:
                break;
        }
    
        var backGroundDisabledDic = options["backGroundBoxDisabledData"];
        var backGroundDisabledType = backGroundDisabledDic["resourceType"];
        var backGroundDisabledFileName = backGroundDisabledDic["path"];
        switch (backGroundDisabledType)
        {
            case 0:
            {
                var backGroundDisabledFileName_tp = backGroundDisabledFileName ?
                    tp + backGroundDisabledFileName :
                    null;
                checkBox.loadTextureBackGroundDisabled(backGroundDisabledFileName_tp);
                break;
            }
            case 1:
            {
                checkBox.loadTextureBackGroundDisabled(backGroundDisabledFileName, 1/*ui::UI_TEX_TYPE_PLIST*/);
                break;
            }
            default:
                break;
        }
    
        var frontCrossDisabledDic = options["frontCrossDisabledData"];
        var frontCrossDisabledType = frontCrossDisabledDic["resourceType"];
        var frontCrossDisabledFileName = options["path"];
        switch (frontCrossDisabledType)
        {
            case 0:
            {
                var frontCrossDisabledFileName_tp = frontCrossDisabledFileName ?
                    tp + frontCrossDisabledFileName :
                    null;
                checkBox.loadTextureFrontCrossDisabled(frontCrossDisabledFileName_tp);
                break;
            }
            case 1:
            {
                checkBox.loadTextureFrontCrossDisabled(frontCrossDisabledFileName, 1/*ui::UI_TEX_TYPE_PLIST*/);
                break;
            }
            default:
                break;
        }

        ccs.WidgetReader.setColorPropsFromJsonDictionary.call(this, widget, options);
    }
};