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
 * cc.LabelTTF is a subclass of cc.TextureNode that knows how to render text labels (Canvas implement)<br/>
 * All features from cc.TextureNode are valid in cc.LabelTTF<br/>
 * cc.LabelTTF objects are slow for js-binding on mobile devices.Consider using CCLabelAtlas or CCLabelBMFont instead. <br/>
 * Consider using cc.LabelAtlas or cc.LabelBMFont instead.<br/>
 * @class
 * @extends cc.Sprite
 */
cc.LabelTTFCanvas = cc.Sprite.extend(/** @lends cc.LabelTTFCanvas# */{
    /// ---- common properties start    ----
    _dimensions:null,
    _hAlignment:cc.TEXT_ALIGNMENT_CENTER,
    _vAlignment:cc.VERTICAL_TEXT_ALIGNMENT_TOP,
    _fontName:"Arial",
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

    /**
     * Constructor
     */
    ctor:function () {
        cc.Sprite.prototype.ctor.call(this);
        this._dimensions = cc.SizeZero();
        this._hAlignment = cc.TEXT_ALIGNMENT_CENTER;
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
        this._setColorStyleStr();
    },

    init:function () {
        return this.initWithString([" ", this._fontName, this._fontSize]);
    },
    /**
     * Prints out a description of this class
     * @return {String}
     */
    description:function () {
        return "<cc.LabelTTF | FontName =" + this._fontName + " FontSize = " + this._fontSize.toFixed(1) + ">";
    },

    setColor:function (color3) {
        this.setFontFillColor(color3, true);
    },

    setOpacity:function (opacity) {
        if (this._opacity === opacity)
            return;
        cc.Sprite.prototype.setOpacity.call(this, opacity);
        this._setColorStyleStr();
    },

    _setColorStyleStr:function () {
        this._colorStyleStr = "rgba(" + this._textFillColor.r + "," + this._textFillColor.g + "," + this._textFillColor.b + ", " + this._realOpacity / 255 + ")";
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
        return this._dimensions;
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
     * @param {String} initialize string
     * @param {String} fontName
     * @param {Number} fontSize
     * @param {cc.Size} dimensions
     * @param {cc.TEXT_ALIGNMENT_LEFT|cc.TEXT_ALIGNMENT_CENTER|cc.TEXT_ALIGNMENT_RIGHT} alignment
     * @return {Boolean} return false on error
     */
    initWithString:function (arg) {
        var strInfo = arg[0] + "", fontName, fontSize, dimensions, hAlignment, vAlignment;
        cc.Assert(strInfo != null, "cc.LabelTTF.initWithString() label is null");
        if (arg.length == 6) {
            fontName = arg[1];
            fontSize = arg[2];
            dimensions = arg[3];
            hAlignment = arg[4];
            vAlignment = arg[5];
        } else if (arg.length == 5) {
            fontName = arg[1];
            fontSize = arg[2];
            dimensions = arg[3];
            hAlignment = arg[4];
            vAlignment = cc.VERTICAL_TEXT_ALIGNMENT_TOP;
        } else {
            fontName = arg[1] || "Arial";
            fontSize = arg[2] || 16;
            dimensions = cc.size(0, arg[2]);
            hAlignment = cc.TEXT_ALIGNMENT_LEFT;
            vAlignment = cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM;
        }

        if (cc.Sprite.prototype.init.call(this)) {
            this._opacityModifyRGB = false;
            this._dimensions = cc.size(dimensions.width, dimensions.height);
            this._fontName = fontName;
            this._hAlignment = hAlignment;
            this._vAlignment = vAlignment;
            this._fontSize = fontSize;
            this._fontStyleStr = this._fontSize + "px '" + this._fontName + "'";
            this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(this._fontName,this._fontSize);
            this.setString(strInfo);
            return true;
        }

        return false;
    },
    /// ---- common properties end      ----

    /**
     * initializes the CCLabelTTF with a font name, alignment, dimension and font size
     * @param {String} text
     * @param {cc.FontDefinition} textDefinition
     * @return {Boolean}
     */
    initWithStringAndTextDefinition:function(text, textDefinition){
        if(!cc.Sprite.prototype.init.call(this))
            return false;

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

        if ((this._shadowOffset.width != shadowOffset.width) || (this._shadowOffset.height != shadowOffset.height)) {
            this._shadowOffset.width  = shadowOffset.width;
            this._shadowOffset.height = shadowOffset.height;
        }

        if (this._shadowOpacity != shadowOpacity )
            this._shadowOpacity = shadowOpacity;

        if (this._shadowBlur != shadowBlur)
            this._shadowBlur = shadowBlur;
    },

    /**
     * disable shadow rendering
     * @param {Boolean} [mustUpdateTexture=false]
     */
    disableShadow:function(mustUpdateTexture){
        if (this._shadowEnabled) {
            this._shadowEnabled = false;
        }
    },

    /**
     * enable or disable stroke
     * @param {cc.Color3B} strokeColor
     * @param {Number} strokeSize
     * @param {Boolean} [mustUpdateTexture=]
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
            this._strokeSize = strokeSize;
    },

    /**
     * disable stroke
     * @param {Boolean} mustUpdateTexture
     */
    disableStroke:function(mustUpdateTexture){
        if (this._strokeEnabled){
            this._strokeEnabled = false;
        }
    },

    /**
     * set text tinting
     * @param {cc.Color3B} tintColor
     * @param {Boolean} mustUpdateTexture
     */
    setFontFillColor:function(tintColor, mustUpdateTexture){
        var locTextFillColor = this._textFillColor;
        if (locTextFillColor.r != tintColor.r || locTextFillColor.g != tintColor.g || locTextFillColor.b != tintColor.b){
            this._textFillColor = tintColor;
            this._setColorStyleStr();
        }
    },

    //set the text definition for this label
    _updateWithTextDefinition:function(textDefinition, mustUpdateTexture){
        this._dimensions = cc.SizeMake(textDefinition.fontDimensions.width, textDefinition.fontDimensions.height);
        this._hAlignment  = textDefinition.fontAlignmentH;
        this._vAlignment  = textDefinition.fontAlignmentV;

        this._fontName   = textDefinition.fontName;
        this._fontSize   = textDefinition.fontSize;
        this._fontStyleStr = this._fontSize + "px '" + this._fontName + "'";


        // shadow
        if ( textDefinition.shadowEnabled)
            this.enableShadow(textDefinition.shadowOffset, textDefinition.shadowOpacity, textDefinition.shadowBlur, false);

        // stroke
        if ( textDefinition.strokeEnabled )
            this.enableStroke(textDefinition.strokeColor, textDefinition.strokeSize, false);

        // fill color
        this.setFontFillColor(textDefinition.fontFillColor, false);
    },

    _prepareTextDefinition:function(adjustForResolution){
        var texDef = new cc.FontDefinition();

        if (adjustForResolution){
            texDef.fontSize = this._fontSize * cc.CONTENT_SCALE_FACTOR();
            texDef.fontDimensions = cc.SIZE_POINTS_TO_PIXELS(this._dimensions);
        } else {
            texDef.fontSize = this._fontSize;
            texDef.fontDimensions = cc.SizeMake(this._dimensions.width, this._dimensions.height);
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
            if (this._string.length > 0)
                this._updateTTF();
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
            if (this._string.length > 0)
                this._updateTTF();
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
            if (this._string.length > 0)
                this._updateTTF();
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
            if (this._string.length > 0)
                this._updateTTF();
        }
    },

    /**
     * set font size of cc.LabelTTF
     * @param {Number} fontSize
     */
    setFontSize:function (fontSize) {
        if (this._fontSize != fontSize) {
            this._fontSize = fontSize;
            this._fontStyleStr = this._fontSize + "px '" + this._fontName + "'";
            this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(this._fontName,this._fontSize);
            // Force update
            if (this._string.length > 0)
                this._updateTTF();
        }
    },

    /**
     * set font name of cc.LabelTTF
     * @param {String} fontName
     */
    setFontName:function (fontName) {
        if (this._fontName != fontName) {
            this._fontName = new String(fontName);
            this._fontStyleStr = this._fontSize + "px '" + this._fontName + "'";
            this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(this._fontName,this._fontSize);
            // Force update
            if (this._string.length > 0)
                this._updateTTF();
        }
    },

    _updateTTF:function () {
        var context = cc.renderContext;
        if (context.font != this._fontStyleStr)
            context.font = this._fontStyleStr;
        // we need to find out if the label needs multiline, if its automatic new line or specified newline
        var stringWidth = context.measureText(this._string).width;
        var locDimensionsWidth = this._dimensions.width;
        if (this._string.indexOf('\n') !== -1 || (locDimensionsWidth !== 0 && stringWidth > locDimensionsWidth && this._string.indexOf(" ") !== -1)) {
            var strings = this._strings = this._string.split('\n');
            var lineWidths = this._lineWidths = [];
            for (var i = 0; i < strings.length; i++) {
                if (strings[i].indexOf(" ") !== -1 && locDimensionsWidth > 0) {
                    var percent = locDimensionsWidth / context.measureText(this._strings[i]).width;
                    var startSearch = 0 | (percent * strings[i].length + 1);
                    var cutoff = startSearch;
                    var tempLineWidth = 0;
                    if (percent < 1) {
                        do {
                            cutoff = strings[i].lastIndexOf(" ", cutoff - 1);
                            var str = strings[i].substring(0, cutoff);
                            tempLineWidth = context.measureText(str).width;
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
                lineWidths[i] = tempLineWidth || context.measureText(strings[i]).width;
            }
            this._isMultiLine = true;
        } else
            this._isMultiLine = false;

        // we will need to change contentSize to cater this
        //if dimension is not set, set contentSize according to actual size
        if (locDimensionsWidth === 0) {
            if (this._isMultiLine)
                this.setContentSize(cc.size(Math.max.apply(Math, this._lineWidths), this._fontClientHeight * this._strings.length));
            else
                this.setContentSize(cc.size(stringWidth, this._fontClientHeight));
        } else {
            if(this._dimensions.height === 0) {
                if (this._isMultiLine)
                    this.setContentSize(cc.size(locDimensionsWidth, this._fontClientHeight * this._strings.length));
                else
                    this.setContentSize(cc.size(locDimensionsWidth, this._fontClientHeight));
            } else {
                //dimension is already set, contentSize must be same as dimension
                this.setContentSize(cc.size(locDimensionsWidth, this._dimensions.height));
            }
        }
        this._anchorPointInPoints.x = this._contentSize.width * this._anchorPoint.x;
        this._anchorPointInPoints.y = this._contentSize.height * this._anchorPoint.y;
    },
    /**
     * renders the label
     * @param {CanvasRenderingContext2D|Null} ctx
     * @param {Number} renderType
     */
    draw:function (ctx, renderType) {
        var context = ctx || cc.renderContext;
        if (this._flipX)
            context.scale(-1, 1);
        if (this._flipY)
            context.scale(1, -1);

        //this is fillText for canvas
        context.fillStyle = this._colorStyleStr;

        if (context.font != this._fontStyleStr)
            context.font = this._fontStyleStr;

        //stroke style setup
        if(this._strokeEnabled){
            context.lineWidth = this._strokeSize;
            context.strokeStyle = this._strokeColorStr;
        }

        //shadow style setup
        if(this._shadowEnabled){
            var locShadowOffset = this._shadowOffset;
            context.shadowColor = "rgba(128,128,128,1)";
            context.shadowOffsetX = locShadowOffset.width;
            context.shadowOffsetY = -locShadowOffset.height;
            context.shadowBlur = this._shadowBlur;
        }

        var locVAlignment = this._vAlignment, locHAlignment = this._hAlignment,
            locContentSizeWidth = this._contentSize.width* cc.CONTENT_SCALE_FACTOR(),
            locContentSizeHeight = this._contentSize.height* cc.CONTENT_SCALE_FACTOR();
        var locFontHeight = this._fontClientHeight* cc.CONTENT_SCALE_FACTOR();

        context.textBaseline = cc.LabelTTF._textBaseline[locVAlignment];
        context.textAlign = cc.LabelTTF._textAlign[locHAlignment];
        var xoffset = 0;
        if (locHAlignment === cc.TEXT_ALIGNMENT_RIGHT)
            xoffset = locContentSizeWidth;
        else if (locHAlignment === cc.TEXT_ALIGNMENT_CENTER)
            xoffset = locContentSizeWidth / 2;
        if (this._isMultiLine) {
            var yOffset = 0, strLen = this._strings.length;
            if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM)
                yOffset = locFontHeight + locContentSizeHeight - locFontHeight * strLen;
            else if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_CENTER)
                yOffset = locFontHeight / 2 + (locContentSizeHeight - locFontHeight * strLen) / 2;

            for (var i = 0; i < strLen; i++) {
                var line = this._strings[i];
                context.fillText(line, xoffset, -locContentSizeHeight + (locFontHeight * i) + yOffset);
            }
        } else {
            if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM){
                context.fillText(this._string, xoffset, 0);
                if(this._strokeEnabled)
                    context.strokeText(this._string, xoffset, 0);
            }else if(locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_TOP){
                context.fillText(this._string, xoffset, -locContentSizeHeight);
                if(this._strokeEnabled)
                    context.strokeText(this._string, xoffset, -locContentSizeHeight);
            }else{
                context.fillText(this._string, xoffset, -locContentSizeHeight/2);
                if(this._strokeEnabled)
                    context.strokeText(this._string, xoffset, -locContentSizeHeight/2);
            }
        }

        if (cc.SPRITE_DEBUG_DRAW === 1) {
            context.fillStyle = "rgba(255,0,0,0.2)";
            context.lineWidth = 1;
            context.shadowColor = "";
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.shadowBlur = 0;
            context.fillRect(this._offsetPosition.x, this._offsetPosition.y, locContentSizeWidth, -locContentSizeHeight);
        }
        cc.INCREMENT_GL_DRAWS(1);
    }
});

cc.LabelTTFCanvas._textAlign = ["left", "center", "right"];

cc.LabelTTFCanvas._textBaseline = ["top", "middle", "bottom"];

/**
 * creates a cc.LabelTTF from a fontname, alignment, dimension and font size
 * @param {String} label
 * @param {String} fontName
 * @param {Number} fontSize
 * @param {cc.Size} dimensions
 * @param {cc.TEXT_ALIGNMENT_LEFT|cc.TEXT_ALIGNMENT_CENTER|cc.TEXT_ALIGNMENT_RIGHT} alignment
 * @return {cc.LabelTTF|Null}
 * @example
 * // Example
 * var myLabel = cc.LabelTTF.create('label text',  'Times New Roman', 32, cc.size(32,16), cc.TEXT_ALIGNMENT_LEFT);
 */
cc.LabelTTFCanvas.create = function (/* Multi arguments */) {
    var ret = new cc.LabelTTFCanvas();
    if (ret.initWithString(arguments))
        return ret;
    return null;
};

/**
 * Create a label with string and a font definition
 * @param {String} text
 * @param {cc.FontDefinition} textDefinition
 * @return {cc.LabelTTF|Null}
 */
cc.LabelTTFCanvas.createWithFontDefinition = function(text, textDefinition){
    var ret = new cc.LabelTTF();
    if(ret && ret.initWithStringAndTextDefinition(text, textDefinition))
        return ret;
    return null;
};

/**
 * cc.LabelTTF is a subclass of cc.TextureNode that knows how to render text labels (WebGL implement)<br/>
 * All features from cc.TextureNode are valid in cc.LabelTTF<br/>
 * cc.LabelTTF objects are slow for js-binding on mobile devices.<br/>
 * Consider using cc.LabelAtlas or cc.LabelBMFont instead.<br/>
 * @class
 * @extends cc.Sprite
 */
cc.LabelTTFWebGL = cc.Sprite.extend(/** @lends cc.LabelTTFWebGL# */{
    /// ---- common properties start    ----
    _dimensions:null,
    _hAlignment:cc.TEXT_ALIGNMENT_CENTER,
    _vAlignment:cc.VERTICAL_TEXT_ALIGNMENT_TOP,
    _fontName : null,
    _fontSize:0.0,
    _string:"",
    _isMultiLine:false,
    _fontStyleStr:null,
    _scaledFontStyleStr:null,
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

    /**
     * Constructor
     */
    ctor:function () {
        cc.Sprite.prototype.ctor.call(this);
        this._dimensions = cc.SizeZero();
        this._hAlignment = cc.TEXT_ALIGNMENT_CENTER;
        this._vAlignment = cc.VERTICAL_TEXT_ALIGNMENT_TOP;
        this._opacityModifyRGB = false;
        this._fontStyleStr = "";
        this._scaledFontStyleStr = "";
        this._colorStyleStr = "";
        this._fontName = "Arial";
        this._opacity = 255;
        this._color = cc.white();
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

        this._setColorStyleStr();
    },

    init:function () {
        return this.initWithString([" ", this._fontName, this._fontSize]);
    },
    /**
     * Prints out a description of this class
     * @return {String}
     */
    description:function () {
        return "<cc.LabelTTF | FontName =" + this._fontName + " FontSize = " + this._fontSize.toFixed(1) + ">";
    },

    setOpacity:function (opacity) {
        if (this._opacity === opacity)
            return;
        cc.Sprite.prototype.setOpacity.call(this, opacity);
        this._setColorStyleStr();
    },

    _setColorStyleStr:function () {
        this._colorStyleStr = "rgba(" + this._color.r + "," + this._color.g + "," + this._color.b + ", " + this._opacity / 255 + ")";
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
        return this._dimensions;
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
     * @param {String} initialize string
     * @param {String} fontName
     * @param {Number} fontSize
     * @param {cc.Size} dimensions
     * @param {cc.TEXT_ALIGNMENT_LEFT|cc.TEXT_ALIGNMENT_CENTER|cc.TEXT_ALIGNMENT_RIGHT} alignment
     * @return {Boolean} return false on error
     */
    initWithString:function (arg) {
        var strInfo = (arg[0] == undefined ) ? " " : arg[0] + "", fontName, fontSize, dimensions, hAlignment, vAlignment;
        cc.Assert(strInfo != null, "cc.LabelTTF.initWithString() label is null");
        if (arg.length == 6) {
            fontName = arg[1];
            fontSize = arg[2];
            dimensions = arg[3];
            hAlignment = arg[4];
            vAlignment = arg[5];
        } else if (arg.length == 5) {
            fontName = arg[1];
            fontSize = arg[2];
            dimensions = arg[3];
            hAlignment = arg[4];
            vAlignment = cc.VERTICAL_TEXT_ALIGNMENT_TOP;
        } else {
            fontName = arg[1] || "Arial";
            fontSize = arg[2] || 16;
            dimensions = cc.size(0, arg[2]);
            hAlignment = cc.TEXT_ALIGNMENT_LEFT;
            vAlignment = cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM;
        }

        if (cc.Sprite.prototype.init.call(this)) {
            this._opacityModifyRGB = false;
            this._dimensions = cc.size(dimensions.width, dimensions.height);
            this._fontName = fontName;
            this._hAlignment = hAlignment;
            this._vAlignment = vAlignment;
            this._fontSize = fontSize;
            this._fontStyleStr = this._fontSize + "px '" + this._fontName + "'";
            this._scaledFontStyleStr = this._fontSize * cc.CONTENT_SCALE_FACTOR() + "px '" + this._fontName + "'";
            this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(this._fontName,this._fontSize);
            this.setString(strInfo);
            this._updateTexture();
            this._needUpdateTexture = false;
            return true;
        }
        return false;
    },
    /// ---- common properties end  ----

    /**
     * initializes the CCLabelTTF with a font name, alignment, dimension and font size
     * @param {String} text
     * @param {cc.FontDefinition} textDefinition
     * @return {Boolean}
     */
    initWithStringAndTextDefinition:function(text, textDefinition){
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


        if(this._shadowOffset){
            if ((this._shadowOffset.width != shadowOffset.width) || (this._shadowOffset.height != shadowOffset.height)) {
                this._shadowOffset.width  = shadowOffset.width;
                this._shadowOffset.height = shadowOffset.height;
            }
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
    setFontFillColor:function(tintColor, mustUpdateTexture){
        var locTextFillColor = this._textFillColor;
        if (locTextFillColor.r != tintColor.r || locTextFillColor.g != tintColor.g || locTextFillColor.b != tintColor.b){
            this._textFillColor = tintColor;
            this._fillColorStr = "rgba("+ (0 | tintColor.r) + "," + (0 | tintColor.g) + "," + (0 | tintColor.b) + ", 1)";
            this._needUpdateTexture = true;
        }
    },

    //set the text definition for this label
    _updateWithTextDefinition:function(textDefinition, mustUpdateTexture){
        if(textDefinition.fontDimensions)
            this._dimensions = cc.SizeMake(textDefinition.fontDimensions.width, textDefinition.fontDimensions.height);
        else
            this._dimensions = cc.SizeMake(0,0);

        this._hAlignment  = textDefinition.fontAlignmentH;
        this._vAlignment  = textDefinition.fontAlignmentV;

        this._fontName   = textDefinition.fontName;
        this._fontSize   = textDefinition.fontSize || 12;
        this._fontStyleStr = this._fontSize + "px '" + this._fontName + "'";
        this._scaledFontStyleStr = this._fontSize * cc.CONTENT_SCALE_FACTOR() + "px '" + this._fontName + "'";
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

        //Do these reference to CONTENT_SCALE_FACTOR need to be removed ?
        if (adjustForResolution){
            texDef.fontSize = this._fontSize * cc.CONTENT_SCALE_FACTOR();
            texDef.fontDimensions = cc.SIZE_POINTS_TO_PIXELS(this._dimensions);
        } else {
            texDef.fontSize = this._fontSize;
            texDef.fontDimensions = cc.SizeMake(this._dimensions.width, this._dimensions.height);
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
        if (alignment != this._hAlignment) {
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
        if (this._fontSize != fontSize) {
            this._fontSize = fontSize;
            this._fontStyleStr = fontSize + "px '" + this._fontName + "'";
            this._scaledFontStyleStr = this._fontSize * cc.CONTENT_SCALE_FACTOR() + "px '" + this._fontName + "'";
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
        if (this._fontName && this._fontName != fontName) {
            this._fontName = fontName;
            this._fontStyleStr = this._fontSize + "px '" + fontName + "'";
            this._scaledFontStyleStr = this._fontSize * cc.CONTENT_SCALE_FACTOR() + "px '" + this._fontName + "'";
            this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(fontName,this._fontSize);
            // Force update
            this._needUpdateTexture = true;
        }
    },

    _drawTTFInCanvasForWebGL: function (context) {
        if (!context)
            return;

        var locContentSizeHeight = this._contentSize.height, locVAlignment = this._vAlignment, locHAlignment = this._hAlignment,
            locFontHeight = this._fontClientHeight;

        context.setTransform(1, 0, 0, 1, 0, locContentSizeHeight);
        //this is fillText for canvas
        if (context.font != this._scaledFontStyleStr)
            context.font = this._scaledFontStyleStr;
        context.fillStyle = this._fillColorStr;

        //stroke style setup
        if (this._strokeEnabled) {
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
                context.fillText(line, xOffset, tmpOffsetY);
                if (this._strokeEnabled)
                    context.strokeText(line, xOffset, tmpOffsetY);
            }
        } else {
            if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM) {
                yOffset = isNegForOffsetY ? -locStrokeShadowOffsetY : 0;
                context.fillText(this._string, xOffset, yOffset);
                if (this._strokeEnabled)
                    context.strokeText(this._string, xOffset, yOffset);
            } else if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_TOP) {
                yOffset = isNegForOffsetY ? -locStrokeShadowOffsetY/2 -locContentSizeHeight :  - locContentSizeHeight + locStrokeShadowOffsetY/2;
                context.fillText(this._string, xOffset, yOffset);
                if (this._strokeEnabled)
                    context.strokeText(this._string, xOffset, yOffset);
            } else {
                yOffset = isNegForOffsetY ? -locStrokeShadowOffsetY -locContentSizeHeight / 2 : - locContentSizeHeight / 2;
                context.fillText(this._string, xOffset, yOffset);
                if (this._strokeEnabled)
                    context.strokeText(this._string, xOffset, yOffset);
            }
        }
    },

    _getLabelContext:function () {
        if (this._labelContext)
            return this._labelContext;

        if (!this._labelCanvas) {
            this._labelCanvas = document.createElement("canvas");
            var labelTexture = new cc.Texture2D();
            labelTexture.initWithElement(this._labelCanvas);
            this.setTexture(labelTexture);
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
                locSize = cc.size(Math.max.apply(Math, this._lineWidths) + locStrokeShadowOffsetX, (this._fontClientHeight * this._strings.length) + locStrokeShadowOffsetY);
            else
                locSize = cc.size(stringWidth + locStrokeShadowOffsetX, this._fontClientHeight + locStrokeShadowOffsetY);
        } else {
            if(this._dimensions.height === 0){
                if (this._isMultiLine)
                    locSize = cc.size(locDimensionsWidth + locStrokeShadowOffsetX, (this._fontClientHeight * this._strings.length) + locStrokeShadowOffsetY);
                else
                    locSize = cc.size(locDimensionsWidth + locStrokeShadowOffsetX, this._fontClientHeight + locStrokeShadowOffsetY);
            } else {
                //dimension is already set, contentSize must be same as dimension
                locSize = cc.size(locDimensionsWidth + locStrokeShadowOffsetX, this._dimensions.height + locStrokeShadowOffsetY);
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
        if(posY)
            this._originalPosition = cc.p(posX, posY);
        else
            this._originalPosition = cc.p(posX.x, posX.y);

        //get real position
        var locStrokeShadowOffsetX = 0, locStrokeShadowOffsetY = 0;
        if(this._strokeEnabled)
            locStrokeShadowOffsetX = locStrokeShadowOffsetY = this._strokeSize * 2;
        if(this._shadowEnabled){
            var locOffsetSize = this._shadowOffset;
            locStrokeShadowOffsetX += locOffsetSize.width> 0?0:locOffsetSize.width;
            locStrokeShadowOffsetY += locOffsetSize.height>0?0:locOffsetSize.height;
        }
        var realPosition = cc.p(this._originalPosition.x + locStrokeShadowOffsetX, this._originalPosition.y + locStrokeShadowOffsetY);
        cc.Sprite.prototype.setPosition.call(this, realPosition);
    },

    getPosition:function(){
        return cc.p(this._originalPosition.x, this._originalPosition.y);
    },

    _updateTexture:function () {
        this._labelContext = this._getLabelContext();

        if(this._string.length === 0){
            this._labelCanvas.width = 1;
            this._labelCanvas.height = this._contentSize.height;
            this.setTextureRect(cc.rect(0, 0, 1, this._contentSize.height));
            return true;
        }

        //set size for labelCanvas
        this._labelContext.font = this._fontStyleStr;
        this._updateTTF();
        var width = this._contentSize.width, height = this._contentSize.height;
        this._labelCanvas.width = width * cc.CONTENT_SCALE_FACTOR();
        this._labelCanvas.height = height * cc.CONTENT_SCALE_FACTOR();;

        //draw text to labelCanvas
        this._drawTTFInCanvasForWebGL(this._labelContext);

        this._texture.handleLoadedTexture();

        this.setTextureRect(cc.rect(0, 0, width, height));
        return true;
    },

    _needUpdateTexture:false,
    visit:function(){
        if(this._needUpdateTexture ){
            this._needUpdateTexture = false;
            this._updateTexture();
        }
        cc.Sprite.prototype.visit.call(this);
    },

    /**
     * draw sprite to canvas
     * @param {WebGLRenderingContext} ctx 3d context of canvas
     */
    draw:function (ctx) {
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
            var verticesG1 = [
                cc.p(this._quad.tl.vertices.x, this._quad.tl.vertices.y),
                cc.p(this._quad.bl.vertices.x, this._quad.bl.vertices.y),
                cc.p(this._quad.br.vertices.x, this._quad.br.vertices.y),
                cc.p(this._quad.tr.vertices.x, this._quad.tr.vertices.y)
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
    },

    releaseTexture:function(){
        if(this._texture)
            this._texture.releaseTexture();
    }
});

cc.LabelTTFWebGL._textAlign = ["left", "center", "right"];

cc.LabelTTFWebGL._textBaseline = ["top", "middle", "bottom"];

/**
 * creates a cc.LabelTTF from a fontname, alignment, dimension and font size
 * @param {String} label
 * @param {String} fontName
 * @param {Number} fontSize
 * @param {cc.Size} dimensions
 * @param {cc.TEXT_ALIGNMENT_LEFT|cc.TEXT_ALIGNMENT_CENTER|cc.TEXT_ALIGNMENT_RIGHT} alignment
 * @return {cc.LabelTTF|Null}
 * @example
 * // Example
 * var myLabel = cc.LabelTTF.create('label text',  'Times New Roman', 32, cc.size(32,16), cc.TEXT_ALIGNMENT_LEFT);
 */
cc.LabelTTFWebGL.create = function (/* Multi arguments */) {
    var ret = new cc.LabelTTFWebGL();
    if (ret.initWithString(arguments))
        return ret;
    return null;
};

/**
 * Create a label with string and a font definition
 * @param {String} text
 * @param {cc.FontDefinition} textDefinition
 * @return {cc.LabelTTF|Null}
 */
cc.LabelTTFWebGL.createWithFontDefinition = function(text, textDefinition){
    var ret = new cc.LabelTTF();
    if(ret && ret.initWithStringAndTextDefinition(text, textDefinition))
        return ret;
    return null;
};

cc.LabelTTF = (cc.Browser.supportWebGL) ? cc.LabelTTFWebGL : cc.LabelTTFCanvas;

if(cc.USE_LA88_LABELS)
    cc.LabelTTF._SHADER_PROGRAM = cc.SHADER_POSITION_TEXTURECOLOR;
else
    cc.LabelTTF._SHADER_PROGRAM = cc.SHADER_POSITION_TEXTUREA8COLOR;

cc.LabelTTF.__labelHeightDiv = document.createElement("div");
cc.LabelTTF.__labelHeightDiv.style.fontFamily = "Arial";
cc.LabelTTF.__labelHeightDiv.innerHTML = "ajghl~!";
cc.LabelTTF.__labelHeightDiv.style.position = "absolute";
cc.LabelTTF.__labelHeightDiv.style.left = "-100px";
cc.LabelTTF.__labelHeightDiv.style.top = "-100px";
cc.LabelTTF.__labelHeightDiv.style.lineHeight = "normal";
document.body.appendChild(cc.LabelTTF.__labelHeightDiv);

cc.LabelTTF.__getFontHeightByDiv = function(fontName, fontSize){
    var labelDiv = cc.LabelTTF.__labelHeightDiv;
    labelDiv.style.fontFamily = fontName;
    labelDiv.style.fontSize = fontSize + "px";
    return labelDiv.clientHeight ;
};



