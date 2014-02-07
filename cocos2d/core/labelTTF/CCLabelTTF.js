/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

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
 * cc.LabelTTF is a subclass of cc.TextureNode that knows how to render text labels<br/>
 * All features from cc.TextureNode are valid in cc.LabelTTF<br/>
 * cc.LabelTTF objects are slow for js-binding on mobile devices.Consider using cc.LabelAtlas or cc.LabelBMFont instead. <br/>
 * Consider using cc.LabelAtlas or cc.LabelBMFont instead.<br/>
 * @class
 * @extends cc.Sprite
 */
cc.LabelTTF = cc.Sprite.extend(/** @lends cc.LabelTTF# */{
    _dimensions:null,
    _hAlignment:cc.TEXT_ALIGNMENT_CENTER,
    _vAlignment:cc.VERTICAL_TEXT_ALIGNMENT_TOP,
    _fontName: null,
    _fontSize:0.0,
    _string:"",
    _originalText: null,
    _isMultiLine:false,
    _fontStyleStr:null,

    // font shadow
    _shadowEnabled:false,
    _shadowOffset:null,
    _shadowOpacity:0,
    _shadowBlur:0,
    _shadowColorStr:null,

    // font stroke
    _strokeEnabled:false,
    _strokeColor:null,
    _strokeSize:0,
    _strokeColorStr:null,

    // font tint
    _textFillColor:null,
    _fillColorStr:null,

    _strokeShadowOffsetX:0,
    _strokeShadowOffsetY:0,
    _needUpdateTexture:false,

    _labelCanvas:null,
    _labelContext:null,
    _lineWidths:null,

    /**
     * Constructor
     */
    ctor:function () {
        cc.Sprite.prototype.ctor.call(this);

        this._dimensions = cc.SizeZero();
        this._hAlignment = cc.TEXT_ALIGNMENT_LEFT;
        this._vAlignment = cc.VERTICAL_TEXT_ALIGNMENT_TOP;
        this._opacityModifyRGB = false;
        this._fontStyleStr = "";
        this._fontName = "Arial";
        this._isMultiLine = false;

        this._shadowEnabled = false;
        this._shadowOffset = cc.SizeZero();
        this._shadowOpacity = 0;
        this._shadowBlur = 0;
        this._shadowColorStr = "rgba(128, 128, 128, 0.5)";

        this._strokeEnabled = false;
        this._strokeColor = cc.white();
        this._strokeSize = 0;
        this._strokeColorStr = "";

        this._textFillColor = cc.white();
        this._fillColorStr = "rgba(255,255,255,1)";
        this._strokeShadowOffsetX = 0;
        this._strokeShadowOffsetY = 0;
        this._needUpdateTexture = false;

        this._lineWidths = [];

        this._setColorsString();
    },

    init:function () {
        return this.initWithString(" ", this._fontName, this._fontSize);
    },

    _measureConfig: function() {
        this._getLabelContext().font = this._fontStyleStr;
    },
    _measure: function(text) {
        return this._getLabelContext().measureText(text).width;
    },
    _checkNextline: function( text, width){
        var tWidth = this._measure(text);
        // Estimated word number per line
        var baseNb = Math.floor( text.length * width / tWidth );
        // Next line is a line with line break
        var nextlinebreak = text.indexOf('\n');
        if(baseNb*0.8 >= nextlinebreak && nextlinebreak > 0) return nextlinebreak+1;
        // Text width smaller than requested width
        if(tWidth < width) return text.length;

        var found = false, l = width + 1, idfound = -1, index = baseNb, result,
            re = cc.LabelTTF._checkRegEx,
            reversre = cc.LabelTTF._reverseCheckRegEx,
            enre = cc.LabelTTF._checkEnRegEx,
            substr = text.substr(baseNb);

        // Forward check
        // Find next special caracter or chinese caracters
        while (result = re.exec(substr)) {
            index += result[0].length;
	        var tem = text.substr(0, index);
	        l = this._measure(tem);
            if(result[2] == '\n' && l < width) {
                found = true;
                idfound = index;
                break;
            }
            if(l > width) {
                if(idfound != -1)
                    found = true;
                break;
            }
            idfound = index;
            substr = text.substr(index);
        }
        if(found) return idfound;

        // Backward check when forward check failed
        substr = text.substr(0, baseNb);
        idfound = baseNb;
        while (result = reversre.exec(substr)) {
            // BUG: Not secured if check with result[0]
            idfound = result[1].length;
            substr = result[1];
            l = this._measure(substr);
            if(l < width) {
                if(enre.test(result[2]))
                    idfound++;
                break;
            }
        }

        // Avoid when idfound == 0, the process may enter in a infinite loop
        return idfound || 1;
    },

    /**
     * Prints out a description of this class
     * @return {String}
     */
    description:function () {
        return "<cc.LabelTTF | FontName =" + this._fontName + " FontSize = " + this._fontSize.toFixed(1) + ">";
    },

    setColor: null,

    _setColorForCanvas: function (color3) {
        cc.NodeRGBA.prototype.setColor.call(this, color3);

        this._setColorsStringForCanvas();
    },

    _setColorsString: null,

    _setColorsStringForCanvas: function () {
        this._needUpdateTexture = true;

        var locDisplayColor = this._displayedColor, locDisplayedOpacity = this._displayedOpacity;
        var locStrokeColor = this._strokeColor, locFontFillColor = this._textFillColor;

        this._shadowColorStr = "rgba(" + (0 | (locDisplayColor.r * 0.5)) + "," + (0 | (locDisplayColor.g * 0.5)) + "," + (0 | (locDisplayColor.b * 0.5)) + "," + this._shadowOpacity + ")";
        this._fillColorStr = "rgba(" + (0 | (locDisplayColor.r /255 * locFontFillColor.r)) + "," + (0 | (locDisplayColor.g / 255 * locFontFillColor.g)) + ","
            + (0 | (locDisplayColor.b / 255 * locFontFillColor.b)) + ", " + locDisplayedOpacity / 255 + ")";
        this._strokeColorStr = "rgba(" + (0 | (locDisplayColor.r / 255 * locStrokeColor.r)) + "," + (0 | (locDisplayColor.g / 255 * locStrokeColor.g)) + ","
            + (0 | (locDisplayColor.b / 255 * locStrokeColor.b)) + ", " + locDisplayedOpacity / 255 + ")";
    },

    _setColorsStringForWebGL:function(){
        this._needUpdateTexture = true;
        var locStrokeColor = this._strokeColor, locFontFillColor = this._textFillColor;
        this._shadowColorStr = "rgba(128,128,128," + this._shadowOpacity + ")";
        this._fillColorStr = "rgba(" + (0 | locFontFillColor.r) + "," + (0 | locFontFillColor.g) + "," + (0 | locFontFillColor.b) + ", 1)";
        this._strokeColorStr = "rgba(" + (0 | locStrokeColor.r) + "," + (0 | locStrokeColor.g) + "," + (0 | locStrokeColor.b) + ", 1)";
    },

    updateDisplayedColor:null,
    _updateDisplayedColorForCanvas:function(parentColor){
        cc.NodeRGBA.prototype.updateDisplayedColor.call(this,parentColor);
        this._setColorsString();
    },

    setOpacity: null,

    _setOpacityForCanvas: function (opacity) {
        if (this._opacity === opacity)
            return;
        cc.Sprite.prototype.setOpacity.call(this, opacity);
        this._setColorsString();
        this._needUpdateTexture = true;
    },

    updateDisplayedOpacity: null,
    updateDisplayedOpacityForCanvas: function(parentOpacity){
        cc.NodeRGBA.prototype.updateDisplayedOpacity.call(this, parentOpacity);
        this._setColorsString();
    },

    /**
     * returns the text of the label
     * @return {String}
     */
    getString:function () {
        return this._string;
    },

    /**
     * return Horizontal Alignment of cc.LabelTTF
     * @return {cc.TEXT_ALIGNMENT_LEFT|cc.TEXT_ALIGNMENT_CENTER|cc.TEXT_ALIGNMENT_RIGHT}
     */
    getHorizontalAlignment:function () {
        return this._hAlignment;
    },

    /**
     * return Vertical Alignment of cc.LabelTTF
     * @return {cc.VERTICAL_TEXT_ALIGNMENT_TOP|cc.VERTICAL_TEXT_ALIGNMENT_CENTER|cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM}
     */
    getVerticalAlignment:function () {
        return this._vAlignment;
    },

    /**
     * return Dimensions of cc.LabelTTF
     * @return {cc.Size}
     */
    getDimensions:function () {
        return cc.size(this._dimensions.width, this._dimensions.height);
    },

    /**
     * return font size of cc.LabelTTF
     * @return {Number}
     */
    getFontSize:function () {
        return this._fontSize;
    },

    /**
     * return font name of cc.LabelTTF
     * @return {String}
     */
    getFontName:function () {
        return this._fontName;
    },

    /**
     * initializes the cc.LabelTTF with a font name, alignment, dimension and font size
     * @param {String} label string
     * @param {String} fontName
     * @param {Number} fontSize
     * @param {cc.Size} [dimensions=]
     * @param {Number} [hAlignment=]
     * @param {Number} [vAlignment=]
     * @return {Boolean} return false on error
     */
    initWithString:function (label, fontName, fontSize, dimensions, hAlignment, vAlignment) {
        var strInfo;
        if(label)
            strInfo = label + "";
        else
            strInfo = "";

        fontSize = fontSize || 16;
        dimensions = dimensions || cc.size(0, fontSize);
        hAlignment = hAlignment || cc.TEXT_ALIGNMENT_LEFT;
        vAlignment = vAlignment || cc.VERTICAL_TEXT_ALIGNMENT_TOP;

        if (cc.Sprite.prototype.init.call(this)) {
            this._opacityModifyRGB = false;
            this._dimensions = cc.size(dimensions.width, dimensions.height);
            this._fontName = fontName || "Arial";
            this._hAlignment = hAlignment;
            this._vAlignment = vAlignment;

            //this._fontSize = (cc.renderContextType === cc.CANVAS) ? fontSize : fontSize * cc.CONTENT_SCALE_FACTOR();
            this._fontSize = fontSize;
            this._fontStyleStr = this._fontSize + "px '" + fontName + "'";
            this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(fontName,this._fontSize);
            this.setString(strInfo);
            this._setColorsString();
            this._updateTexture();
            this._needUpdateTexture = false;
            return true;
        }
        return false;
    },

    /**
     * initializes the CCLabelTTF with a font name, alignment, dimension and font size
     * @param {String} text
     * @param {cc.FontDefinition} textDefinition
     * @return {Boolean}
     */
    initWithStringAndTextDefinition:null,

    _initWithStringAndTextDefinitionForCanvas:function(text, textDefinition){
        if(!cc.Sprite.prototype.init.call(this))
            return false;

        // prepare everything needed to render the label
        this._updateWithTextDefinition(textDefinition, false);

        // set the string
        this.setString(text);

        return true;
    },

    _initWithStringAndTextDefinitionForWebGL:function(text, textDefinition){
        if(!cc.Sprite.prototype.init.call(this))
            return false;

        // shader program
        this.setShaderProgram(cc.ShaderCache.getInstance().programForKey(cc.LabelTTF._SHADER_PROGRAM));

        // prepare everything needed to render the label
        this._updateWithTextDefinition(textDefinition, false);

        // set the string
        this.setString(text);

        return true;
    },

    /**
     * set the text definition used by this label
     * @param {cc.FontDefinition} theDefinition
     */
    setTextDefinition:function(theDefinition){
        if (theDefinition)
            this._updateWithTextDefinition(theDefinition, true);
    },

    /**
     * get the text definition used by this label
     * @return {cc.FontDefinition}
     */
    getTextDefinition:function(){
        return this._prepareTextDefinition(false);
    },

    /**
     * enable or disable shadow for the label
     * @param {cc.Size} shadowOffset
     * @param {Number} shadowOpacity (0 to 1)
     * @param {Number} shadowBlur
     * @param {Boolean} [mustUpdateTexture=false] This parameter is not used. It's kept for cocos2d-x JSB compatibility
     */
    enableShadow:function(shadowOffset, shadowOpacity, shadowBlur, mustUpdateTexture){
        shadowOpacity = shadowOpacity || 0.5;
        if (false === this._shadowEnabled)
            this._shadowEnabled = true;

        var locShadowOffset = this._shadowOffset;
        if (locShadowOffset && (locShadowOffset.width != shadowOffset.width) || (locShadowOffset.height != shadowOffset.height)) {
            locShadowOffset.width  = shadowOffset.width;
            locShadowOffset.height = shadowOffset.height;
        }

        if (this._shadowOpacity != shadowOpacity ){
            this._shadowOpacity = shadowOpacity;
        }
        this._setColorsString();

        if (this._shadowBlur != shadowBlur)
            this._shadowBlur = shadowBlur;

        this._needUpdateTexture = true;
    },

    /**
     * disable shadow rendering
     * @param {Boolean} [mustUpdateTexture=false] This parameter is not used. It's kept for cocos2d-x JSB compatibility
     */
    disableShadow:function(mustUpdateTexture){
        if (this._shadowEnabled) {
            this._shadowEnabled = false;
            this._needUpdateTexture = true;
        }
    },

    /**
     * enable or disable stroke
     * @param {cc.Color3B} strokeColor
     * @param {Number} strokeSize
     * @param {Boolean} [mustUpdateTexture=false]  This parameter is not used. It's kept for cocos2d-x JSB compatibility
     */
    enableStroke:function(strokeColor, strokeSize, mustUpdateTexture){
        if(this._strokeEnabled === false)
            this._strokeEnabled = true;

        var locStrokeColor = this._strokeColor;
        if ( (locStrokeColor.r !== strokeColor.r) || (locStrokeColor.g !== strokeColor.g) || (locStrokeColor.b !== strokeColor.b) ) {
            locStrokeColor.r = strokeColor.r;
            locStrokeColor.g = strokeColor.g;
            locStrokeColor.b = strokeColor.b;
            this._setColorsString();
        }

        if (this._strokeSize!== strokeSize)
            this._strokeSize = strokeSize || 0;

        this._needUpdateTexture = true;
    },

    /**
     * disable stroke
     * @param {Boolean} [mustUpdateTexture=false] This parameter is not used. It's kept for cocos2d-x JSB compatibility
     */
    disableStroke:function(mustUpdateTexture){
        if (this._strokeEnabled){
            this._strokeEnabled = false;
            this._needUpdateTexture = true;
        }
    },

    /**
     * set text tinting
     * @param {cc.Color3B} tintColor
     * @param {Boolean} [mustUpdateTexture=false]  This parameter is not used. It's kept for cocos2d-x JSB compatibility
     */
    setFontFillColor:null,

    _setFontFillColorForCanvas: function (tintColor, mustUpdateTexture) {
        //mustUpdateTexture = (mustUpdateTexture == null) ? true : mustUpdateTexture;
        var locTextFillColor = this._textFillColor;
        if (locTextFillColor.r != tintColor.r || locTextFillColor.g != tintColor.g || locTextFillColor.b != tintColor.b) {
            locTextFillColor.r = tintColor.r;
            locTextFillColor.g = tintColor.g;
            locTextFillColor.b = tintColor.b;

            this._setColorsString();
            this._needUpdateTexture = true;
        }
    },

    _setFontFillColorForWebGL: function (tintColor, mustUpdateTexture) {
        var locTextFillColor = this._textFillColor;
        if (locTextFillColor.r != tintColor.r || locTextFillColor.g != tintColor.g || locTextFillColor.b != tintColor.b) {
            locTextFillColor.r = tintColor.r;
            locTextFillColor.g = tintColor.g;
            locTextFillColor.b = tintColor.b;
            this._setColorsString();
            this._needUpdateTexture = true;
        }
    },

    //set the text definition for this label
    _updateWithTextDefinition:function(textDefinition, mustUpdateTexture){
        if(textDefinition.fontDimensions){
            this._dimensions.width = textDefinition.fontDimensions.width;
            this._dimensions.height = textDefinition.fontDimensions.height;
        } else {
            this._dimensions.width = 0;
            this._dimensions.height = 0;
        }

        this._hAlignment  = textDefinition.fontAlignmentH;
        this._vAlignment  = textDefinition.fontAlignmentV;

        this._fontName   = textDefinition.fontName;
        this._fontSize   = textDefinition.fontSize||12;
        this._fontStyleStr = this._fontSize + "px '" + this._fontName + "'";
        this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(this._fontName,this._fontSize);

        // shadow
        if ( textDefinition.shadowEnabled)
            this.enableShadow(textDefinition.shadowOffset, textDefinition.shadowOpacity, textDefinition.shadowBlur, false);

        // stroke
        if ( textDefinition.strokeEnabled )
            this.enableStroke(textDefinition.strokeColor, textDefinition.strokeSize, false);

        // fill color
        this.setFontFillColor(textDefinition.fontFillColor, false);

        if (mustUpdateTexture)
            this._updateTexture();
    },

    _prepareTextDefinition:function(adjustForResolution){
        var texDef = new cc.FontDefinition();

        if (adjustForResolution){
            //texDef.fontSize = (cc.renderContextType === cc.CANVAS) ? this._fontSize : this._fontSize * cc.CONTENT_SCALE_FACTOR();
            texDef.fontSize = this._fontSize;
            texDef.fontDimensions = cc.SIZE_POINTS_TO_PIXELS(this._dimensions);
        } else {
            texDef.fontSize = this._fontSize;
            texDef.fontDimensions = cc.size(this._dimensions.width, this._dimensions.height);
        }

        texDef.fontName       =  this._fontName;
        texDef.fontAlignmentH =  this._hAlignment;
        texDef.fontAlignmentV =  this._vAlignment;

        // stroke
        if ( this._strokeEnabled ){
            texDef.strokeEnabled = true;
            var locStrokeColor = this._strokeColor;
            texDef.strokeColor   = new cc.Color3B(locStrokeColor.r, locStrokeColor.g, locStrokeColor.b);
            texDef.strokeSize = this._strokeSize;
        }else
            texDef.strokeEnabled = false;

        // shadow
        if ( this._shadowEnabled ){
            texDef.shadowEnabled = true;
            texDef.shadowBlur = this._shadowBlur;
            texDef.shadowOpacity = this._shadowOpacity;

            texDef.shadowOffset = adjustForResolution ? cc.SIZE_POINTS_TO_PIXELS(this._shadowOffset)
                : cc.size(this._shadowOffset.width,this._shadowOffset.height);
        }else
            texDef._shadowEnabled = false;

        // text tint
        var locTextFillColor = this._textFillColor;
        texDef.fontFillColor = new cc.Color3B(locTextFillColor.r, locTextFillColor.g, locTextFillColor.b);
        return texDef;
    },

    _fontClientHeight:18,
    /**
     * changes the string to render
     * @warning Changing the string is as expensive as creating a new cc.LabelTTF. To obtain better performance use cc.LabelAtlas
     * @param {String} text text for the label
     */
    setString:function (text) {
        text = String(text);
        if (this._originalText != text) {
            this._originalText = text + "";

            this._updateString();

            // Force update
            this._needUpdateTexture = true;
        }
    },
    _updateString: function() {
        this._string = this._originalText;
    },
    /**
     * set Horizontal Alignment of cc.LabelTTF
     * @param {cc.TEXT_ALIGNMENT_LEFT|cc.TEXT_ALIGNMENT_CENTER|cc.TEXT_ALIGNMENT_RIGHT} alignment Horizontal Alignment
     */
    setHorizontalAlignment:function (alignment) {
        if (alignment !== this._hAlignment) {
            this._hAlignment = alignment;

            // Force update
            this._needUpdateTexture = true;
        }
    },

    /**
     * set Vertical Alignment of cc.LabelTTF
     * @param {cc.VERTICAL_TEXT_ALIGNMENT_TOP|cc.VERTICAL_TEXT_ALIGNMENT_CENTER|cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM} verticalAlignment
     */
    setVerticalAlignment:function (verticalAlignment) {
        if (verticalAlignment != this._vAlignment) {
            this._vAlignment = verticalAlignment;

            // Force update
            this._needUpdateTexture = true;
        }
    },

    /**
     * set Dimensions of cc.LabelTTF
     * @param {cc.Size} dim
     */
    setDimensions:function (dim) {
        if (dim.width != this._dimensions.width || dim.height != this._dimensions.height) {
            this._dimensions = dim;
            this._updateString();
            // Force udpate
            this._needUpdateTexture = true;
        }
    },

    /**
     * set font size of cc.LabelTTF
     * @param {Number} fontSize
     */
    setFontSize:function (fontSize) {
        if (this._fontSize !== fontSize) {
            this._fontSize = fontSize;
            this._fontStyleStr = fontSize + "px '" + this._fontName + "'";
            this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(this._fontName,fontSize);
            // Force update
            this._needUpdateTexture = true;
        }
    },

    /**
     * set font name of cc.LabelTTF
     * @param {String} fontName
     */
    setFontName:function (fontName) {
        if (this._fontName && this._fontName != fontName ) {
            this._fontName = fontName;
            this._fontStyleStr = this._fontSize + "px '" + fontName + "'";
            this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(fontName,this._fontSize);
            // Force update
            this._needUpdateTexture = true;
        }
    },

    _drawTTFInCanvas: function (context) {
        if (!context)
            return;
        var locStrokeShadowOffsetX = this._strokeShadowOffsetX, locStrokeShadowOffsetY = this._strokeShadowOffsetY;
        var locContentSizeHeight = this._contentSize._height - locStrokeShadowOffsetY, locVAlignment = this._vAlignment, locHAlignment = this._hAlignment,
            locFontHeight = this._fontClientHeight, locStrokeSize = this._strokeSize;

        context.setTransform(1, 0, 0, 1, 0 + locStrokeShadowOffsetX * 0.5 , locContentSizeHeight + locStrokeShadowOffsetY * 0.5);

        //this is fillText for canvas
        if (context.font != this._fontStyleStr)
            context.font = this._fontStyleStr;
        context.fillStyle = this._fillColorStr;

        var xOffset = 0, yOffset = 0;
        //stroke style setup
        var locStrokeEnabled = this._strokeEnabled;
        if (locStrokeEnabled) {
            context.lineWidth = locStrokeSize * 2;
            context.strokeStyle = this._strokeColorStr;
        }

        //shadow style setup
        if (this._shadowEnabled) {
            var locShadowOffset = this._shadowOffset;
            context.shadowColor = this._shadowColorStr;
            context.shadowOffsetX = locShadowOffset.width;
            context.shadowOffsetY = -locShadowOffset.height;
            context.shadowBlur = this._shadowBlur;
        }

        context.textBaseline = cc.LabelTTF._textBaseline[locVAlignment];
        context.textAlign = cc.LabelTTF._textAlign[locHAlignment];

        var locContentWidth = this._contentSize._width - locStrokeShadowOffsetX;
        if (locHAlignment === cc.TEXT_ALIGNMENT_RIGHT)
            xOffset += locContentWidth;
        else if (locHAlignment === cc.TEXT_ALIGNMENT_CENTER)
            xOffset += locContentWidth / 2;
        else
            xOffset += 0;
        if (this._isMultiLine) {
            var locStrLen = this._strings.length;
            if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM)
                yOffset = locFontHeight + locContentSizeHeight - locFontHeight * locStrLen;
            else if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_CENTER)
                yOffset = locFontHeight / 2 + (locContentSizeHeight - locFontHeight * locStrLen) / 2;

            for (var i = 0; i < locStrLen; i++) {
                var line = this._strings[i];
                var tmpOffsetY = -locContentSizeHeight + (locFontHeight * i) + yOffset;
                if (locStrokeEnabled)
                    context.strokeText(line, xOffset, tmpOffsetY);
                context.fillText(line, xOffset, tmpOffsetY);
            }
        } else {
            if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM) {
                if (locStrokeEnabled)
                    context.strokeText(this._string, xOffset, yOffset);
                context.fillText(this._string, xOffset, yOffset);
            } else if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_TOP) {
                yOffset -= locContentSizeHeight ;
                if (locStrokeEnabled)
                    context.strokeText(this._string, xOffset, yOffset);
                context.fillText(this._string, xOffset, yOffset);
            } else {
                yOffset -= locContentSizeHeight * 0.5;
                if (locStrokeEnabled)
                    context.strokeText(this._string, xOffset, yOffset);
                context.fillText(this._string, xOffset, yOffset);
            }
        }
    },

    _getLabelContext:function () {
        if (this._labelContext)
            return this._labelContext;

        if (!this._labelCanvas) {
            var locCanvas = document.createElement("canvas");
            var labelTexture = new cc.Texture2D();
            labelTexture.initWithElement(locCanvas);
            this.setTexture(labelTexture);
            this._labelCanvas = locCanvas;
        }
        this._labelContext = this._labelCanvas.getContext("2d");
        return this._labelContext;
    },

    _updateTTF: function () {
        var locDimensionsWidth = this._dimensions.width, i, strLength;
        var locLineWidth = this._lineWidths;
        locLineWidth.length = 0;

        this._isMultiLine = false ;
        this._measureConfig();
        if (locDimensionsWidth !== 0) {
            // Content processing
            var text = this._string;
            this._strings = [];
            for (i = 0, strLength = this._string.length; i < strLength;) {
                // Find the index of next line
                var next = this._checkNextline(text.substr(i), locDimensionsWidth);
                var append = text.substr(i, next);
                this._strings.push(append);
                i += next;
            }
        } else {
            this._strings = this._string.split('\n');
            for (i = 0, strLength = this._strings.length; i < strLength; i++) {
                locLineWidth.push(this._measure(this._strings[i]));
            }
        }

        if (this._strings.length > 0)
            this._isMultiLine = true;

        var locSize, locStrokeShadowOffsetX = 0, locStrokeShadowOffsetY = 0;
        if (this._strokeEnabled)
            locStrokeShadowOffsetX = locStrokeShadowOffsetY = this._strokeSize * 2;
        if (this._shadowEnabled) {
            var locOffsetSize = this._shadowOffset;
            locStrokeShadowOffsetX += Math.abs(locOffsetSize.width) * 2;
            locStrokeShadowOffsetY += Math.abs(locOffsetSize.height) * 2;
        }

        //get offset for stroke and shadow
        if (locDimensionsWidth === 0) {
            if (this._isMultiLine)
                locSize = cc.size(0 | (Math.max.apply(Math, locLineWidth) + locStrokeShadowOffsetX),
                    0 | ((this._fontClientHeight * this._strings.length) + locStrokeShadowOffsetY));
            else
                locSize = cc.size(0 | (this._measure(this._string) + locStrokeShadowOffsetX), 0 | (this._fontClientHeight + locStrokeShadowOffsetY));
        } else {
            if (this._dimensions.height === 0) {
                if (this._isMultiLine)
                    locSize = cc.size(0 | (locDimensionsWidth + locStrokeShadowOffsetX), 0 | ((this._fontClientHeight * this._strings.length) + locStrokeShadowOffsetY));
                else
                    locSize = cc.size(0 | (locDimensionsWidth + locStrokeShadowOffsetX), 0 | (this._fontClientHeight + locStrokeShadowOffsetY));
            } else {
                //dimension is already set, contentSize must be same as dimension
                locSize = cc.size(0 | (locDimensionsWidth + locStrokeShadowOffsetX), 0 | (this._dimensions.height + locStrokeShadowOffsetY));
            }
        }
        this.setContentSize(locSize);
        this._strokeShadowOffsetX = locStrokeShadowOffsetX;
        this._strokeShadowOffsetY = locStrokeShadowOffsetY;

        // need computing _anchorPointInPoints
        var locAP = this._anchorPoint;
        this._anchorPointInPoints._x = (locStrokeShadowOffsetX * 0.5) + ((locSize.width - locStrokeShadowOffsetX) * locAP._x);
        this._anchorPointInPoints._y = (locStrokeShadowOffsetY * 0.5) + ((locSize.height - locStrokeShadowOffsetY) * locAP._y);
    },

    getContentSize:function(){
        if(this._needUpdateTexture)
            this._updateTTF();
        return cc.Sprite.prototype.getContentSize.call(this);
    },

    _updateTexture:function () {
        var locContext = this._getLabelContext(), locLabelCanvas = this._labelCanvas;
        var locContentSize = this._contentSize;

        if(this._string.length === 0){
            locLabelCanvas.width = 1;
            locLabelCanvas.height = locContentSize._height;
            this.setTextureRect(cc.rect(0, 0, 1, locContentSize._height));
            return true;
        }

        //set size for labelCanvas
        locContext.font = this._fontStyleStr;
        this._updateTTF();
        var width = locContentSize._width, height = locContentSize._height;
        var flag = locLabelCanvas.width == width && locLabelCanvas.height == height;
        locLabelCanvas.width = width;
        locLabelCanvas.height = height;
        if(flag) locContext.clearRect(0, 0, width, height);

        //draw text to labelCanvas
        this._drawTTFInCanvas(locContext);
        this._texture.handleLoadedTexture();

        this.setTextureRect(cc.rect(0, 0, width, height));
        return true;
    },

    visit:function(ctx){
        if(!this._string || this._string == "")
            return;
        if(this._needUpdateTexture ){
            this._needUpdateTexture = false;
            this._updateTexture();
        }
        var context = ctx || cc.renderContext;
        cc.Sprite.prototype.visit.call(this,context);
    },

    draw: null,

    /**
     * draw sprite to canvas
     * @param {WebGLRenderingContext} ctx 3d context of canvas
     */
    _drawForWebGL: function (ctx) {
        if (!this._string || this._string == "")
            return;

        var gl = ctx || cc.renderContext, locTexture = this._texture;

        if (locTexture && locTexture._isLoaded) {
            this._shaderProgram.use();
            this._shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4();

            cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);
            cc.glBindTexture2D(locTexture);

            cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);

            gl.bindBuffer(gl.ARRAY_BUFFER, this._quadWebBuffer);
            if (this._quadDirty) {
                gl.bufferData(gl.ARRAY_BUFFER, this._quad.arrayBuffer, gl.STATIC_DRAW);
                this._quadDirty = false;
            }
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, gl.FLOAT, false, 24, 0);
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 24, 16);
            gl.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, gl.UNSIGNED_BYTE, true, 24, 12);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }

        if (cc.SPRITE_DEBUG_DRAW === 1) {
            // draw bounding box
            var locQuad = this._quad;
            var verticesG1 = [
                cc.p(locQuad.tl.vertices.x, locQuad.tl.vertices.y),
                cc.p(locQuad.bl.vertices.x, locQuad.bl.vertices.y),
                cc.p(locQuad.br.vertices.x, locQuad.br.vertices.y),
                cc.p(locQuad.tr.vertices.x, locQuad.tr.vertices.y)
            ];
            cc.drawingUtil.drawPoly(verticesG1, 4, true);
        } else if (cc.SPRITE_DEBUG_DRAW === 2) {
            // draw texture box
            var drawSizeG2 = this.getTextureRect()._size;
            var offsetPixG2 = this.getOffsetPosition();
            var verticesG2 = [cc.p(offsetPixG2.x, offsetPixG2.y), cc.p(offsetPixG2.x + drawSizeG2.width, offsetPixG2.y),
                cc.p(offsetPixG2.x + drawSizeG2.width, offsetPixG2.y + drawSizeG2.height), cc.p(offsetPixG2.x, offsetPixG2.y + drawSizeG2.height)];
            cc.drawingUtil.drawPoly(verticesG2, 4, true);
        } // CC_SPRITE_DEBUG_DRAW
        cc.g_NumberOfDraws++;
    },

    _setTextureRectForCanvas: function (rect, rotated, untrimmedSize) {
        this._rectRotated = rotated || false;
        untrimmedSize = untrimmedSize || rect._size;

        this.setContentSize(untrimmedSize);
        this.setVertexRect(rect);

        var locTextureCoordRect = this._textureRect_Canvas;
        locTextureCoordRect.x = rect.x;
        locTextureCoordRect.y = rect.y;
        locTextureCoordRect.width = rect.width;
        locTextureCoordRect.height = rect.height;
        locTextureCoordRect.validRect = !(locTextureCoordRect.width === 0 || locTextureCoordRect.height === 0
            || locTextureCoordRect.x < 0 || locTextureCoordRect.y < 0);

        var relativeOffset = this._unflippedOffsetPositionFromCenter;
        if (this._flippedX)
            relativeOffset._x = -relativeOffset._x;
        if (this._flippedY)
            relativeOffset._y = -relativeOffset._y;
        this._offsetPosition._x = relativeOffset.x + (this._contentSize._width - this._rect.width) / 2;
        this._offsetPosition._y = relativeOffset.y + (this._contentSize._height - this._rect.height) / 2;

        // rendering using batch node
        if (this._batchNode) {
            this._dirty = true;
        }
    },

    _setTextureCoords:function (rect) {
        var tex = this._batchNode ? this._textureAtlas.getTexture() : this._texture;
        if (!tex)
            return;

        var atlasWidth = tex.getPixelsWide();
        var atlasHeight = tex.getPixelsHigh();

        var left, right, top, bottom, tempSwap, locQuad = this._quad;
        if (this._rectRotated) {
            if (cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL) {
                left = (2 * rect.x + 1) / (2 * atlasWidth);
                right = left + (rect.height * 2 - 2) / (2 * atlasWidth);
                top = (2 * rect.y + 1) / (2 * atlasHeight);
                bottom = top + (rect.width * 2 - 2) / (2 * atlasHeight);
            } else {
                left = rect.x / atlasWidth;
                right = (rect.x + rect.height) / atlasWidth;
                top = rect.y / atlasHeight;
                bottom = (rect.y + rect.width) / atlasHeight;
            }// CC_FIX_ARTIFACTS_BY_STRECHING_TEXEL

            if (this._flippedX) {
                tempSwap = top;
                top = bottom;
                bottom = tempSwap;
            }

            if (this._flippedY) {
                tempSwap = left;
                left = right;
                right = tempSwap;
            }

            locQuad.bl.texCoords.u = left;
            locQuad.bl.texCoords.v = top;
            locQuad.br.texCoords.u = left;
            locQuad.br.texCoords.v = bottom;
            locQuad.tl.texCoords.u = right;
            locQuad.tl.texCoords.v = top;
            locQuad.tr.texCoords.u = right;
            locQuad.tr.texCoords.v = bottom;
        } else {
            if (cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL) {
                left = (2 * rect.x + 1) / (2 * atlasWidth);
                right = left + (rect.width * 2 - 2) / (2 * atlasWidth);
                top = (2 * rect.y + 1) / (2 * atlasHeight);
                bottom = top + (rect.height * 2 - 2) / (2 * atlasHeight);
            } else {
                left = rect.x / atlasWidth;
                right = (rect.x + rect.width) / atlasWidth;
                top = rect.y / atlasHeight;
                bottom = (rect.y + rect.height) / atlasHeight;
            } // ! CC_FIX_ARTIFACTS_BY_STRECHING_TEXEL

            if (this._flippedX) {
                tempSwap = left;
                left = right;
                right = tempSwap;
            }

            if (this._flippedY) {
                tempSwap = top;
                top = bottom;
                bottom = tempSwap;
            }

            locQuad.bl.texCoords.u = left;
            locQuad.bl.texCoords.v = bottom;
            locQuad.br.texCoords.u = right;
            locQuad.br.texCoords.v = bottom;
            locQuad.tl.texCoords.u = left;
            locQuad.tl.texCoords.v = top;
            locQuad.tr.texCoords.u = right;
            locQuad.tr.texCoords.v = top;
        }
        this._quadDirty = true;
    }
});

if(cc.Browser.supportWebGL){
    cc.LabelTTF.prototype.setColor = cc.Sprite.prototype.setColor;
    cc.LabelTTF.prototype._setColorsString = cc.LabelTTF.prototype._setColorsStringForWebGL;
    cc.LabelTTF.prototype.updateDisplayedColor = cc.Sprite.prototype.updateDisplayedColor;
    cc.LabelTTF.prototype.setOpacity = cc.Sprite.prototype.setOpacity;
    cc.LabelTTF.prototype.updateDisplayedOpacity = cc.Sprite.prototype.updateDisplayedOpacity;
    cc.LabelTTF.prototype.initWithStringAndTextDefinition = cc.LabelTTF.prototype._initWithStringAndTextDefinitionForWebGL;
    cc.LabelTTF.prototype.setFontFillColor = cc.LabelTTF.prototype._setFontFillColorForWebGL;
    cc.LabelTTF.prototype.draw = cc.LabelTTF.prototype._drawForWebGL;
    cc.LabelTTF.prototype.setTextureRect = cc.Sprite.prototype._setTextureRectForWebGL;
} else {
    cc.LabelTTF.prototype.setColor = cc.LabelTTF.prototype._setColorForCanvas;
    cc.LabelTTF.prototype._setColorsString = cc.LabelTTF.prototype._setColorsStringForCanvas;
    cc.LabelTTF.prototype.updateDisplayedColor = cc.LabelTTF.prototype._updateDisplayedColorForCanvas;
    cc.LabelTTF.prototype.setOpacity = cc.LabelTTF.prototype._setOpacityForCanvas;
    cc.LabelTTF.prototype.updateDisplayedOpacity = cc.LabelTTF.prototype._updateDisplayedOpacityForCanvas;
    cc.LabelTTF.prototype.initWithStringAndTextDefinition = cc.LabelTTF.prototype._initWithStringAndTextDefinitionForCanvas;
    cc.LabelTTF.prototype.setFontFillColor = cc.LabelTTF.prototype._setFontFillColorForCanvas;
    cc.LabelTTF.prototype.draw = cc.Sprite.prototype.draw;
    cc.LabelTTF.prototype.setTextureRect = cc.LabelTTF.prototype._setTextureRectForCanvas;
}

cc.LabelTTF._textAlign = ["left", "center", "right"];

cc.LabelTTF._textBaseline = ["top", "middle", "bottom"];

// Class static properties for measure util
cc.LabelTTF._checkRegEx = /(.+?)([\s\n\r\-\/\\\:]|[\u4E00-\u9FA5]|[\uFE30-\uFFA0])/;
cc.LabelTTF._reverseCheckRegEx = /(.*)([\s\n\r\-\/\\\:]|[\u4E00-\u9FA5]|[\uFE30-\uFFA0])/;
cc.LabelTTF._checkEnRegEx = /[\s\-\/\\\:]/;

/**
 * creates a cc.LabelTTF from a font name, alignment, dimension and font size
 * @param {String} label
 * @param {String} fontName
 * @param {Number} fontSize
 * @param {cc.Size} [dimensions=cc.SIZE_ZERO]
 * @param {Number} [hAlignment=]
 * @param {Number} [vAlignment=cc.VERTICAL_TEXT_ALIGNMENT_TOP]
 * @return {cc.LabelTTF|Null}
 * @example
 * // Example
 * var myLabel = cc.LabelTTF.create('label text',  'Times New Roman', 32, cc.size(32,16), cc.TEXT_ALIGNMENT_LEFT);
 */
cc.LabelTTF.create = function (label, fontName, fontSize, dimensions, hAlignment, vAlignment) {
    var ret = new cc.LabelTTF();
    if (ret.initWithString(label, fontName, fontSize, dimensions, hAlignment, vAlignment))
        return ret;
    return null;
};

/**
 * Create a label with string and a font definition
 * @param {String} text
 * @param {cc.FontDefinition} textDefinition
 * @return {cc.LabelTTF|Null}
 */
cc.LabelTTF.createWithFontDefinition = function(text, textDefinition){
    var ret = new cc.LabelTTF();
    if(ret && ret.initWithStringAndTextDefinition(text, textDefinition))
        return ret;
    return null;
};

if(cc.USE_LA88_LABELS)
    cc.LabelTTF._SHADER_PROGRAM = cc.SHADER_POSITION_TEXTURECOLOR;
else
    cc.LabelTTF._SHADER_PROGRAM = cc.SHADER_POSITION_TEXTUREA8COLOR;

cc.LabelTTF.__labelHeightDiv = document.createElement("div");
cc.LabelTTF.__labelHeightDiv.style.fontFamily = "Arial";
cc.LabelTTF.__labelHeightDiv.style.position = "absolute";
cc.LabelTTF.__labelHeightDiv.style.left = "-100px";
cc.LabelTTF.__labelHeightDiv.style.top = "-100px";
cc.LabelTTF.__labelHeightDiv.style.lineHeight = "normal";
document.body.appendChild(cc.LabelTTF.__labelHeightDiv);

cc.LabelTTF.__getFontHeightByDiv = function(fontName, fontSize){
    var clientHeight = cc.LabelTTF.__fontHeightCache[fontName + "." + fontSize];
    if (clientHeight > 0) return clientHeight;
    var labelDiv = cc.LabelTTF.__labelHeightDiv;
    labelDiv.innerHTML = "ajghl~!";
    labelDiv.style.fontFamily = fontName;
    labelDiv.style.fontSize = fontSize + "px";
    clientHeight = labelDiv.clientHeight ;
    cc.LabelTTF.__fontHeightCache[fontName + "." + fontSize] = clientHeight;
    labelDiv.innerHTML = "";
    return clientHeight;
};

cc.LabelTTF.__fontHeightCache = {};



