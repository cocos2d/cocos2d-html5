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
    _isMultiLine:false,
    _fontStyleStr:null,
    _colorStyleStr:null,

    // font shadow
    _shadowEnabled:false,
    _shadowOffset:null,
    _shadowOpacity:0,
    _shadowBlur:0,

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
    _originalPosition:null,
    _needUpdateTexture:false,

    _labelCanvas:null,
    _labelContext:null,

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
        this._colorStyleStr = "";
        this._fontName = "Arial";
        this._isMultiLine = false;

        this._shadowEnabled = false;
        this._shadowOffset = cc.SizeZero();
        this._shadowOpacity = 0;
        this._shadowBlur = 0;

        this._strokeEnabled = false;
        this._strokeColor = cc.white();
        this._strokeSize = 0;
        this._strokeColorStr = "";

        this._textFillColor = cc.white();
        this._fillColorStr = "rgba(255,255,255,1)";
        this._strokeShadowOffsetX = 0;
        this._strokeShadowOffsetY = 0;
        this._originalPosition = cc.PointZero();
        this._needUpdateTexture = false;

        this._setColorStyleStr();
    },

    init:function () {
        return this.initWithString(" ", this._fontName, this._fontSize);
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
        this.setFontFillColor(color3, true);
    },

    getColor: null,

    _getColorForCanvas: function () {
        return this._textFillColor;
    },

    setOpacity: null,

    _setOpacityForCanvas: function (opacity) {
        if (this._opacity === opacity)
            return;
        cc.Sprite.prototype.setOpacity.call(this, opacity);
        this._setColorStyleStr();
        this._needUpdateTexture = true;
    },

    _setColorStyleStr:function () {
        var locFillColor = this._textFillColor;
        this._colorStyleStr = "rgba(" + locFillColor.r + "," + locFillColor.g + "," + locFillColor.b + ", " + this._displayedOpacity / 255 + ")";
        if(this._strokeEnabled){
            var locStrokeColor = this._strokeColor;
            this._strokeColorStr = "rgba(" + locStrokeColor.r + "," + locStrokeColor.g + "," + locStrokeColor.b + ", " + this._displayedOpacity / 255 + ")";
        }
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
        var strInfo = label + "";
        cc.Assert(strInfo != null, "cc.LabelTTF.initWithString() label is null");

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
            this._fontSize = fontSize * cc.CONTENT_SCALE_FACTOR();
            this._fontStyleStr = this._fontSize + "px '" + fontName + "'";
            this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(fontName,this._fontSize);
            this.setString(strInfo);
            this._setColorStyleStr();
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
     * @param {Number} shadowOpacity
     * @param {Number} shadowBlur
     * @param {Boolean} [mustUpdateTexture=false]
     */
    enableShadow:function(shadowOffset, shadowOpacity, shadowBlur, mustUpdateTexture){
        if (false === this._shadowEnabled)
            this._shadowEnabled = true;

        var locShadowOffset = this._shadowOffset;
        if (locShadowOffset && (locShadowOffset.width != shadowOffset.width) || (locShadowOffset.height != shadowOffset.height)) {
            locShadowOffset.width  = shadowOffset.width;
            locShadowOffset.height = shadowOffset.height;
        }

        if (this._shadowOpacity != shadowOpacity )
            this._shadowOpacity = shadowOpacity;

        if (this._shadowBlur != shadowBlur)
            this._shadowBlur = shadowBlur;

        this._needUpdateTexture = true;
    },

    /**
     * disable shadow rendering
     * @param {Boolean} [mustUpdateTexture=false]
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
     * @param {Boolean} [mustUpdateTexture=false]
     */
    enableStroke:function(strokeColor, strokeSize, mustUpdateTexture){
        if(this._strokeEnabled === false)
            this._strokeEnabled = true;

        var locStrokeColor = this._strokeColor;
        if ( (locStrokeColor.r !== strokeColor.r) || (locStrokeColor.g !== strokeColor.g) || (locStrokeColor.b !== strokeColor.b) ) {
            this._strokeColor = strokeColor;
            this._strokeColorStr = "rgba("+ (0 | strokeColor.r) + "," + (0 | strokeColor.g) + "," + (0 | strokeColor.b) + ", 1)";
        }

        if (this._strokeSize!== strokeSize)
            this._strokeSize = strokeSize || 0;

        this._needUpdateTexture = true;
    },

    /**
     * disable stroke
     * @param {Boolean} [mustUpdateTexture=false]
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
     * @param {Boolean} [mustUpdateTexture=false]
     */
    setFontFillColor:null,

    _setFontFillColorForCanvas: function (tintColor, mustUpdateTexture) {
        var locTextFillColor = this._textFillColor;
        if (locTextFillColor.r != tintColor.r || locTextFillColor.g != tintColor.g || locTextFillColor.b != tintColor.b) {
            this._textFillColor = tintColor;
            this._setColorStyleStr();
            this._needUpdateTexture = true;
        }
    },

    _setFontFillColorForWebGL: function (tintColor, mustUpdateTexture) {
        var locTextFillColor = this._textFillColor;
        if (locTextFillColor.r != tintColor.r || locTextFillColor.g != tintColor.g || locTextFillColor.b != tintColor.b) {
            this._textFillColor = tintColor;
            this._fillColorStr = "rgba(" + (0 | tintColor.r) + "," + (0 | tintColor.g) + "," + (0 | tintColor.b) + ", 1)";
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
            texDef.fontSize = this._fontSize * cc.CONTENT_SCALE_FACTOR();
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
            texDef.strokeSize = adjustForResolution ? this._strokeSize * cc.CONTENT_SCALE_FACTOR() : this._strokeSize;
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
        if (this._string != text) {
            this._string = text + "";

            // Force update
            this._needUpdateTexture = true;
        }
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

        var locContentSizeHeight = this._contentSize.height, locVAlignment = this._vAlignment, locHAlignment = this._hAlignment,
            locFontHeight = this._fontClientHeight;

        context.setTransform(1, 0, 0, 1, 0, locContentSizeHeight);
        //this is fillText for canvas
        if (context.font != this._fontStyleStr)
            context.font = this._fontStyleStr;
        if(cc.renderContextType === cc.CANVAS)
            context.fillStyle = this._colorStyleStr;
        else
            context.fillStyle = "rgba(255,255,255,1)";

        //stroke style setup
        var locStrokeEnabled = this._strokeEnabled;
        if (locStrokeEnabled) {
            context.lineWidth = this._strokeSize;
            context.strokeStyle = this._strokeColorStr;
        }

        var isNegForOffsetX = false, isNegForOffsetY = false;
        //shadow style setup
        if (this._shadowEnabled) {
            var locShadowOffset = this._shadowOffset;
            context.shadowColor = "rgba(128,128,128,1)";
            isNegForOffsetX = locShadowOffset.width < 0;
            isNegForOffsetY = locShadowOffset.height < 0;
            context.shadowOffsetX = locShadowOffset.width;
            context.shadowOffsetY = -locShadowOffset.height;
            context.shadowBlur = this._shadowBlur;
        }

        context.textBaseline = cc.LabelTTF._textBaseline[locVAlignment];
        context.textAlign = cc.LabelTTF._textAlign[locHAlignment];

        var xOffset = 0, locStrokeShadowOffsetX = this._strokeShadowOffsetX, locStrokeShadowOffsetY = this._strokeShadowOffsetY;
        var yOffset = 0;
        var locContentWidth = this._contentSize.width - locStrokeShadowOffsetX;
        if (locHAlignment === cc.TEXT_ALIGNMENT_RIGHT)
            xOffset = isNegForOffsetX ? locContentWidth + locStrokeShadowOffsetX : locContentWidth;
        else if (locHAlignment === cc.TEXT_ALIGNMENT_CENTER)
            xOffset = isNegForOffsetX ? locContentWidth / 2 + locStrokeShadowOffsetX : locContentWidth / 2;
        else
            xOffset = isNegForOffsetX ? locStrokeShadowOffsetX : 0;
        if (this._isMultiLine) {
            var locStrLen = this._strings.length;
            if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM){
                yOffset = locFontHeight + locContentSizeHeight - locFontHeight * locStrLen;
                if(isNegForOffsetY)
                    yOffset -= locStrokeShadowOffsetY;
            } else if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_CENTER){
                yOffset = locFontHeight / 2 + (locContentSizeHeight - locFontHeight * locStrLen) / 2;
                if(isNegForOffsetY)
                    yOffset -= locStrokeShadowOffsetY;
            } else{
                if(isNegForOffsetY)
                    yOffset -= locStrokeShadowOffsetY/2;
                else
                    yOffset += locStrokeShadowOffsetY/2;
            }

            for (var i = 0; i < locStrLen; i++) {
                var line = this._strings[i];
                var tmpOffsetY = -locContentSizeHeight + (locFontHeight * i) + yOffset;
                if (locStrokeEnabled)
                    context.strokeText(line, xOffset, tmpOffsetY);
                context.fillText(line, xOffset, tmpOffsetY);
            }
        } else {
            if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM) {
                yOffset = isNegForOffsetY ? -locStrokeShadowOffsetY : 0;
                if (locStrokeEnabled)
                    context.strokeText(this._string, xOffset, yOffset);
                context.fillText(this._string, xOffset, yOffset);
            } else if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_TOP) {
                yOffset = isNegForOffsetY ? -locStrokeShadowOffsetY/2 -locContentSizeHeight :  - locContentSizeHeight + locStrokeShadowOffsetY/2;
                if (locStrokeEnabled)
                    context.strokeText(this._string, xOffset, yOffset);
                context.fillText(this._string, xOffset, yOffset);
            } else {
                yOffset = isNegForOffsetY ? -locStrokeShadowOffsetY -locContentSizeHeight / 2 : - locContentSizeHeight / 2;
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

    _updateTTF:function () {
        var locDimensionsWidth = this._dimensions.width, locLabelContext = this._labelContext;

        var stringWidth = locLabelContext.measureText(this._string).width;
        if(this._string.indexOf('\n') !== -1 || (locDimensionsWidth !== 0 && stringWidth > locDimensionsWidth && this._string.indexOf(" ") !== -1)) {
            var strings = this._strings = this._string.split('\n');
            var lineWidths = this._lineWidths = [];
            for (var i = 0; i < strings.length; i++) {
                if (strings[i].indexOf(" ") !== -1 && locDimensionsWidth > 0) {
                    var percent = locDimensionsWidth / locLabelContext.measureText(this._strings[i]).width;
                    var startSearch = 0 | (percent * strings[i].length + 1);
                    var cutoff = startSearch;
                    var tempLineWidth = 0;
                    if (percent < 1) {
                        do {
                            cutoff = strings[i].lastIndexOf(" ", cutoff - 1);
                            var str = strings[i].substring(0, cutoff);
                            tempLineWidth = locLabelContext.measureText(str).width;
                            if (cutoff === -1) {
                                cutoff = strings[i].indexOf(" ", startSearch);
                                break;
                            }
                        } while (tempLineWidth > locDimensionsWidth);
                        var newline = strings[i].substr(cutoff + 1);
                        strings.splice(i + 1, 0, newline);
                        strings[i] = str;
                    }
                }
                lineWidths[i] = tempLineWidth || locLabelContext.measureText(strings[i]).width;
            }
            this._isMultiLine = true;
        } else
            this._isMultiLine = false;

        var locSize, locStrokeShadowOffsetX = 0, locStrokeShadowOffsetY = 0;
        if(this._strokeEnabled)
            locStrokeShadowOffsetX = locStrokeShadowOffsetY = this._strokeSize * 2;
        if(this._shadowEnabled){
            var locOffsetSize = this._shadowOffset;
            locStrokeShadowOffsetX += Math.abs(locOffsetSize.width);
            locStrokeShadowOffsetY += Math.abs(locOffsetSize.height);
        }

        //get offset for stroke and shadow
        if (locDimensionsWidth === 0) {
            if (this._isMultiLine)
                locSize = cc.size(0 | (Math.max.apply(Math, this._lineWidths) + locStrokeShadowOffsetX),
                    0 | ((this._fontClientHeight * this._strings.length) + locStrokeShadowOffsetY));
            else
                locSize = cc.size(0 | (stringWidth + locStrokeShadowOffsetX), 0 | (this._fontClientHeight + locStrokeShadowOffsetY));
        } else {
            if(this._dimensions.height === 0){
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

        this._anchorPointInPoints.x = this._contentSize.width * this._anchorPoint.x;
        this._anchorPointInPoints.y = this._contentSize.height * this._anchorPoint.y;

        this.setPosition(this._originalPosition);
    },

    setPosition:function(posX, posY){
        var locOriginalPosition = this._originalPosition;
        if (arguments.length == 2){
            locOriginalPosition.x = posX;
            locOriginalPosition.y = posY;
        }else {
            locOriginalPosition.x = posX.x;
            locOriginalPosition.y = posX.y;
        }

        //get real position
        var locStrokeShadowOffsetX = 0, locStrokeShadowOffsetY = 0;
        if(this._strokeEnabled)
            locStrokeShadowOffsetX = locStrokeShadowOffsetY = this._strokeSize * 2;
        if (this._shadowEnabled) {
            var locOffsetSize = this._shadowOffset;
            locStrokeShadowOffsetX += locOffsetSize.width > 0 ? 0 : locOffsetSize.width;
            locStrokeShadowOffsetY += locOffsetSize.height > 0 ? 0 : locOffsetSize.height;
        }
        var realPosition = cc.p(locOriginalPosition.x + locStrokeShadowOffsetX, locOriginalPosition.y + locStrokeShadowOffsetY);
        cc.Sprite.prototype.setPosition.call(this, realPosition);
    },

    setPositionX:function(x){
        this._originalPosition.x = x;
        cc.Sprite.prototype.setPositionX.call(this, x);
    },

    setPositionY:function(y){
        this._originalPosition.y = y;
        cc.Sprite.prototype.setPositionY.call(this, y);
    },

    getPosition:function(){
        return cc.p(this._originalPosition.x, this._originalPosition.y);
    },

    _updateTexture:function () {
        var locContext = this._getLabelContext(), locLabelCanvas = this._labelCanvas;
        var locContentSize = this._contentSize;

        if(this._string.length === 0){
            locLabelCanvas.width = 1;
            locLabelCanvas.height = locContentSize.height;
            this.setTextureRect(cc.rect(0, 0, 1, locContentSize.height));
            return true;
        }

        //set size for labelCanvas
        locContext.font = this._fontStyleStr;
        this._updateTTF();
        var width = locContentSize.width, height = locContentSize.height;
        locLabelCanvas.width = width;
        locLabelCanvas.height = height;

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
        //cc.Assert(!this._batchNode, "If cc.Sprite is being rendered by cc.SpriteBatchNode, cc.Sprite#draw SHOULD NOT be called");

        if (locTexture && locTexture._isLoaded) {
            this._shaderProgram.use();
            this._shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4();

            cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);
            //cc.glBindTexture2D(locTexture);
            cc._currentBoundTexture[0] = locTexture;
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, locTexture._webTextureObj);

            cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSCOLORTEX);

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
            var drawSizeG2 = this.getTextureRect().size;
            var offsetPixG2 = this.getOffsetPosition();
            var verticesG2 = [cc.p(offsetPixG2.x, offsetPixG2.y), cc.p(offsetPixG2.x + drawSizeG2.width, offsetPixG2.y),
                cc.p(offsetPixG2.x + drawSizeG2.width, offsetPixG2.y + drawSizeG2.height), cc.p(offsetPixG2.x, offsetPixG2.y + drawSizeG2.height)];
            cc.drawingUtil.drawPoly(verticesG2, 4, true);
        } // CC_SPRITE_DEBUG_DRAW
        cc.g_NumberOfDraws++;
    }
});

if(cc.Browser.supportWebGL){
    cc.LabelTTF.prototype.setColor = cc.Sprite.prototype.setColor;
    cc.LabelTTF.prototype.getColor = cc.Sprite.prototype.getColor;
    cc.LabelTTF.prototype.setOpacity = cc.Sprite.prototype.setOpacity;
    cc.LabelTTF.prototype.initWithStringAndTextDefinition = cc.LabelTTF.prototype._initWithStringAndTextDefinitionForWebGL;
    cc.LabelTTF.prototype.setFontFillColor = cc.LabelTTF.prototype._setFontFillColorForWebGL;
    cc.LabelTTF.prototype.draw = cc.LabelTTF.prototype._drawForWebGL;
} else {
    cc.LabelTTF.prototype.setColor = cc.LabelTTF.prototype._setColorForCanvas;
    cc.LabelTTF.prototype.getColor = cc.LabelTTF.prototype._getColorForCanvas;
    cc.LabelTTF.prototype.setOpacity = cc.LabelTTF.prototype._setOpacityForCanvas;
    cc.LabelTTF.prototype.initWithStringAndTextDefinition = cc.LabelTTF.prototype._initWithStringAndTextDefinitionForCanvas;
    cc.LabelTTF.prototype.setFontFillColor = cc.LabelTTF.prototype._setFontFillColorForCanvas;
    cc.LabelTTF.prototype.draw = cc.Sprite.prototype.draw;
}

cc.LabelTTF._textAlign = ["left", "center", "right"];

cc.LabelTTF._textBaseline = ["top", "middle", "bottom"];

/**
 * creates a cc.LabelTTF from a fontname, alignment, dimension and font size
 * @param {String} label
 * @param {String} fontName
 * @param {Number} fontSize
 * @param {cc.Size} [dimensions=cc.SIZE_ZERO]
 * @param {Number} [hAlignment]
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



