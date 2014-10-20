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
 * The ccui.Slider's properties reader for GUIReader.
 * @class
 * @name ccs.SliderReader
 **/
ccs.sliderReader = /** @lends ccs.SliderReader# */{

    /**
     * Sets ccui.Slider's properties from json dictionary.
     * @param {ccui.Slider} widget
     * @param {Object} options
     */
    setPropsFromJsonDictionary: function(widget, options){
        ccs.widgetReader.setPropsFromJsonDictionary.call(this, widget, options);

        var jsonPath = ccs.uiReader.getFilePath();

        var slider = widget;
        var tp = jsonPath;

        var barTextureScale9Enable = options["scale9Enable"];
        slider.setScale9Enabled(barTextureScale9Enable);
        var bt = options["barFileName"];
        var barLength = options["length"];

        var imageFileNameDic = options["barFileNameData"];
        var imageFileType = imageFileNameDic["resourceType"];
        var imageFileName = imageFileNameDic["path"];
        var imageFileName_tp;

        if(bt != null){
            if(barTextureScale9Enable){
                switch(imageFileType){
                    case 0:
                        imageFileName_tp = imageFileName ?
                            ( tp + imageFileName ) :
                            null;
                        slider.loadBarTexture(imageFileName_tp);
                        break;
                    case 1:
                        slider.loadBarTexture(imageFileName, 1 /*ui.UI_TEX_TYPE_PLIST*/);
                        break;
                    default:
                        break;
                }
                slider.setSize(cc.size(barLength, slider.getContentSize().height));
            }
        }else{
            switch(imageFileType){
                case 0:
                    imageFileName_tp = imageFileName ?
                        tp + imageFileName :
                        null;
                        slider.loadBarTexture(imageFileName_tp);
                    break;
                case 1:
                    slider.loadBarTexture(imageFileName, 1 /*ui.UI_TEX_TYPE_PLIST*/);
                    break;
                default:
                    break;
            }
        }
        var normalDic = options["ballNormalData"];
        var normalType = normalDic["resourceType"];
        var normalFileName = normalDic["path"];
        switch(normalType){
            case 0:
                var normalFileName_tp = normalFileName ?
                    tp + normalFileName :
                    null;
                slider.loadSlidBallTextureNormal(normalFileName_tp);
                break;
            case 1:
                slider.loadSlidBallTextureNormal(normalFileName, 1/*ui.UI_TEX_TYPE_PLIST*/);
                break;
            default:
                break;
        }

        var pressedDic = options["ballPressedData"];
        var pressedType = pressedDic["resourceType"];
        var pressedFileName = pressedDic["path"];
        if(pressedFileName === null){
            pressedType = normalType;
            pressedFileName = normalFileName;
        }
        switch(pressedType){
            case 0:
                var pressedFileName_tp = pressedFileName ?
                    tp + pressedFileName :
                    null;
                slider.loadSlidBallTexturePressed(pressedFileName_tp);
                break;
            case 1:
                slider.loadSlidBallTexturePressed(pressedFileName, 1/*ui.UI_TEX_TYPE_PLIST*/);
                break;
            default:
                break;
        }
        var disabledDic = options["ballDisabledData"];
        var disabledType = disabledDic["resourceType"];
        var disabledFileName = disabledDic["path"];
        switch(disabledType){
            case 0:
                var disabledFileName_tp = disabledFileName ?
                    tp + disabledFileName :
                    null;
                slider.loadSlidBallTextureDisabled(disabledFileName_tp);
                break;
            case 1:
                slider.loadSlidBallTextureDisabled(disabledFileName, 1/*ui.UI_TEX_TYPE_PLIST*/);
                break;
            default:
                break;
        }
        var progressBarDic = options["progressBarData"];
        var progressBarType = progressBarDic["resourceType"];
        var imageProgressFileName = progressBarDic["path"];
        switch (progressBarType){
            case 0:
                var imageProgressFileName_tp = imageProgressFileName ?
                    (tp + imageProgressFileName) :
                    null;
                slider.loadProgressBarTexture(imageProgressFileName_tp);
                break;
            case 1:
                slider.loadProgressBarTexture(imageProgressFileName, 1/*ui.UI_TEX_TYPE_PLIST*/);
                break;
            default:
                break;
        }

        ccs.widgetReader.setColorPropsFromJsonDictionary.call(this, widget, options);
    },

    setPropsFromProtocolBuffers: function(widget, nodeTree){
        ccs.widgetReader.setPropsFromProtocolBuffers.call(this, widget, nodeTree);

        var slider = widget;
        var options = nodeTree["sliderOptions"];

		var protocolBuffersPath = ccs.uiReader.getFilePath();

        var barTextureScale9Enable = !!options["scale9Enable"];
        if(barTextureScale9Enable)
            slider.setUnifySizeEnabled(false);
        slider.setScale9Enabled(barTextureScale9Enable);

        slider.setPercent(options["percent"]);


        //        var bt = DICTOOL.checkObjectExist_json(options, P_BarFileName);
        var barLength = options["length"]!==null ? options["length"] : 290;

		var imageFileNameDic = options["barFileNameData"];
        var imageFileNameType = imageFileNameDic["resourceType"];

        var imageFileName = ccs.widgetReader.getResourcePath(imageFileNameDic["path"], imageFileNameType);
        slider.loadBarTexture(imageFileName, imageFileNameType);

        if (barTextureScale9Enable)
        {
            slider.setContentSize(cc.size(barLength, slider.getContentSize().height));
        }

        //loading normal slider ball texture
        var normalDic = options["ballNormalData"];
        var normalType = normalDic["resourceType"];

        imageFileName = ccs.widgetReader.getResourcePath(normalDic["path"], normalType);
        slider.loadSlidBallTextureNormal(imageFileName, normalType);


        //loading slider ball press texture
        var pressedDic = options["ballPressedData"];
        var pressedType = pressedDic["resourceType"];

        var pressedFileName = ccs.widgetReader.getResourcePath(pressedDic["path"], pressedType);
        slider.loadSlidBallTexturePressed(pressedFileName, pressedType);

        //loading silder ball disable texture
        var disabledDic = options["ballDisabledData"];
        var disabledType = disabledDic["resourceType"];

        var disabledFileName = ccs.widgetReader.getResourcePath(disabledDic["path"], disabledType);
        slider.loadSlidBallTextureDisabled(disabledFileName, disabledType);

        //load slider progress texture
        var progressBarDic = options["progressBarData"];
        var progressBarType = progressBarDic["resourceType"];

        var progressBarFileName = ccs.widgetReader.getResourcePath(progressBarDic["path"], progressBarType);
        slider.loadProgressBarTexture(progressBarFileName, progressBarType);

        var displaystate = true;
		if(options["displaystate"]!==null)
		{
			displaystate = options["displaystate"];
		}
		slider.setBright(displaystate);

        // other commonly protperties
        ccs.widgetReader.setColorPropsFromProtocolBuffers.call(this, widget, nodeTree);
    }
};