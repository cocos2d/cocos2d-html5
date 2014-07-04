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

ccs.SliderReader = {

    getInstance: function(){
        return ccs.SliderReader;
    },

    setPropsFromJsonDictionary: function(widget, options){

        ccs.WidgetReader.setPropsFromJsonDictionary.call(this, widget, options);

        var jsonPath = ccs.uiReader.getFilePath();

        var slider = widget;

        var barTextureScale9Enable = options["scale9Enable"];
        slider.setScale9Enabled(barTextureScale9Enable);
        var bt = options["barFileName"];
        var barLength = options["length"];
        if(bt){
            if(barTextureScale9Enable){
                var imageFileNameDic = options["barFileNameData"];
                var imageFileType = options["resourceType"];
                switch(imageFileType){
                    case 0:
                        var tp_b = jsonPath;
                        var imageFileName = imageFileNameDic["path"];
                        var imageFileName_tp = (imageFileName && imageFileName !== "" ) ?
                            ( tp_b + imageFileName ) :
                            null;
                        slider.loadBarTexture(imageFileName_tp);
                        break;
                    case 1:
                        var imageFileName = imageFileNameDic["path"];
                        slider.loadBarTexture(imageFileName, 1 /*ui::UI_TEX_TYPE_PLIST*/);
                        break;
                    default:
                        break;
                }
                slider.setSize(cc.size(barLength, slider.getContentSize().height));
            }
        }else{
            var imageFileNameDic = options["barFileNameData"];
            var imageFileType = imageFileNameDic["resourceType"];
            switch(imageFileType){
                case 0:
                    var tp_b = jsonPath;
                    var imageFileName = imageFileNameDic["path"];
                    var imageFileName_tp = ( imageFileName && imageFileName !== "" ) ?
                        tp_b + imageFileName :
                        null;
                        slider.loadBarTexture(imageFileName_tp);
                    break;
                case 1:
                    var imageFileName = imageFileNameDic["path"];
                    slider.loadBarTexture(imageFileName, 1 /*ui::UI_TEX_TYPE_PLIST*/);
                    break;
                default:
                    break;
            }
        }
        var normalDic = options["ballNormalData"];
        var normalType = normalDic["resourceType"];
        switch(normalType){
            case 0:
                var tp_n = jsonPath;
                var normalFileName = normalDic["path"];
                var normalFileName_tp = ( normalFileName && (normalFileName !== "") ) ?
                    tp_n + normalFileName :
                    null;
                slider.loadSlidBallTextureNormal(normalFileName_tp);
                break;
            case 1:
                var normalFileName = normalDic["path"];
                slider.loadSlidBallTextureNormal(normalFileName, 1/*ui::UI_TEX_TYPE_PLIST*/);
                break;
            default:
                break;
        }

        var pressedDic = options["ballPressedData"];
        var pressedType = pressedDic["resourceType"];
        switch(pressedType){
            case 0:
                var tp_p = jsonPath;
                var pressedFileName = pressedDic["path"];
                var pressedFileName_tp = ( pressedFileName && pressedFileName !== "" ) ?
                    tp_p + pressedFileName :
                    null;
                slider.loadSlidBallTexturePressed(pressedFileName_tp);
                break;
            case 1:
                var pressedFileName = pressedDic["path"];
                slider.loadSlidBallTexturePressed(pressedFileName, 1/*ui::UI_TEX_TYPE_PLIST*/);
                break;
            default:
                break;
        }
        var disabledDic = options["ballDisabledData"];
        var disabledType = disabledDic["resourceType"];
        switch(disabledType){
            case 0:
                var tp_d = jsonPath;
                var disabledFileName = disabledDic["path"];
                var disabledFileName_tp = ( disabledFileName && disabledFileName !== "" ) ?
                    tp_d + disabledFileName :
                    null;
                slider.loadSlidBallTextureDisabled(disabledFileName_tp);
                break;
            case 1:
                var disabledFileName = disabledDic["path"];
                slider.loadSlidBallTextureDisabled(disabledFileName, 1/*ui::UI_TEX_TYPE_PLIST*/);
                break;
            default:
                break;
        }
        var progressBarDic = options["progressBarData"];
        var progressBarType = progressBarDic["resourceType"];
        switch (progressBarType){
            case 0:
                var tp_b = jsonPath;
                var imageFileName = progressBarDic["path"];
                var imageFileName_tp = ( imageFileName &&  imageFileName !== "" ) ?
                    (tp_b + imageFileName) :
                    null;
                slider.loadProgressBarTexture(imageFileName_tp);
                break;
            case 1:
                var imageFileName = progressBarDic["path"];
                slider.loadProgressBarTexture(imageFileName, 1/*ui::UI_TEX_TYPE_PLIST*/);
                break;
            default:
                break;
        }

        ccs.WidgetReader.setColorPropsFromJsonDictionary.call(this, widget, options);
    }
};