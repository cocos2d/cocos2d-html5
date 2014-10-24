/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
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
 * <p>cc.LabelTTF is a subclass of cc.TextureNode that knows how to render text labels with system font or a ttf font file<br/>
 * All features from cc.Sprite are valid in cc.LabelTTF<br/>
 * cc.LabelTTF objects are slow for js-binding on mobile devices.<br/>
 * Consider using cc.LabelAtlas or cc.LabelBMFont instead.<br/>
 * You can create a cc.LabelTTF from a font name, alignment, dimension and font size or a cc.FontDefinition object.</p>
 * @class
 * @extends cc.Sprite
 *
 * @param {String} text
 * @param {String|cc.FontDefinition} [fontName="Arial"]
 * @param {Number} [fontSize=16]
 * @param {cc.Size} [dimensions=cc.size(0,0)]
 * @param {Number} [hAlignment=cc.TEXT_ALIGNMENT_LEFT]
 * @param {Number} [vAlignment=cc.VERTICAL_TEXT_ALIGNMENT_TOP]
 * @example
 * var myLabel = new cc.LabelTTF('label text',  'Times New Roman', 32, cc.size(320,32), cc.TEXT_ALIGNMENT_LEFT);
 *
 * var fontDef = new cc.FontDefinition();
 * fontDef.fontName = "Arial";
 * fontDef.fontSize = "32";
 * var myLabel = new cc.LabelTTF('label text',  fontDef);
 *
 * @property {String}       string          - Content string of label
 * @property {Number}       textAlign       - Horizontal Alignment of label: cc.TEXT_ALIGNMENT_LEFT|cc.TEXT_ALIGNMENT_CENTER|cc.TEXT_ALIGNMENT_RIGHT
 * @property {Number}       verticalAlign   - Vertical Alignment of label: cc.VERTICAL_TEXT_ALIGNMENT_TOP|cc.VERTICAL_TEXT_ALIGNMENT_CENTER|cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM
 * @property {Number}       fontSize        - Font size of label
 * @property {String}       fontName        - Font name of label
 * @property {String}       font            - The label font with a style string: e.g. "18px Verdana"
 * @property {Number}       boundingWidth   - Width of the bounding box of label, the real content width is limited by boundingWidth
 * @property {Number}       boundingHeight  - Height of the bounding box of label, the real content height is limited by boundingHeight
 * @property {cc.Color}     fillStyle       - The fill color
 * @property {cc.Color}     strokeStyle     - The stroke color
 * @property {Number}       lineWidth       - The line width for stroke
 * @property {Number}       shadowOffsetX   - The x axis offset of shadow
 * @property {Number}       shadowOffsetY   - The y axis offset of shadow
 * @property {Number}       shadowOpacity   - The opacity of shadow
 * @property {Number}       shadowBlur      - The blur size of shadow
 */
cc.LabelTTF = cc.Sprite.extend(/** @lends cc.LabelTTF# */{
    _dimensions: null,
    _hAlignment: cc.TEXT_ALIGNMENT_CENTER,
    _vAlignment: cc.VERTICAL_TEXT_ALIGNMENT_TOP,
    _fontName: null,
    _fontSize: 0.0,
    _string: "",
    _originalText: null,
    _isMultiLine: false,
    _fontStyleStr: null,

    // font shadow
    _shadowEnabled: false,
    _shadowOffset: null,
    _shadowOpacity: 0,
    _shadowBlur: 0,
    _shadowColorStr: null,
    _shadowColor: null,

    // font stroke
    _strokeEnabled: false,
    _strokeColor: null,
    _strokeSize: 0,
    _strokeColorStr: null,

    // font tint
    _textFillColor: null,
    _fillColorStr: null,

    _strokeShadowOffsetX: 0,
    _strokeShadowOffsetY: 0,
    _needUpdateTexture: false,

    _labelCanvas: null,
    _labelContext: null,
    _lineWidths: null,
    _className: "LabelTTF",

    /**
     * Initializes the cc.LabelTTF with a font name, alignment, dimension and font size, do not call it by yourself,
     * you should pass the correct arguments in constructor to initialize the label.
     * @param {String} label string
     * @param {String} fontName
     * @param {Number} fontSize
     * @param {cc.Size} [dimensions=]
     * @param {Number} [hAlignment=]
     * @param {Number} [vAlignment=]
     * @return {Boolean} return false on error
     */
    initWithString: function (label, fontName, fontSize, dimensions, hAlignment, vAlignment) {
        var strInfo;
        if (label)
            strInfo = label + "";
        else
            strInfo = "";

        fontSize = fontSize || 16;
        dimensions = dimensions || cc.size(0, 0/*fontSize*/);
        hAlignment = hAlignment || cc.TEXT_ALIGNMENT_LEFT;
        vAlignment = vAlignment || cc.VERTICAL_TEXT_ALIGNMENT_TOP;

        this._opacityModifyRGB = false;
        this._dimensions = cc.size(dimensions.width, dimensions.height);
        this._fontName = fontName || "Arial";
        this._hAlignment = hAlignment;
        this._vAlignment = vAlignment;

        //this._fontSize = (cc._renderType === cc._RENDER_TYPE_CANVAS) ? fontSize : fontSize * cc.contentScaleFactor();
        this._fontSize = fontSize;
        this._fontStyleStr = this._fontSize + "px '" + fontName + "'";
        this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(fontName, this._fontSize);
        this.string = strInfo;
        this._setColorsString();
        this._updateTexture();
        this._setUpdateTextureDirty();
        return true;
    },

    _setUpdateTextureDirty: function(){
        this._renderCmdDiry = this._needUpdateTexture = true;
        cc.renderer.pushDirtyNode(this);
    },

    ctor: function (text, fontName, fontSize, dimensions, hAlignment, vAlignment) {
        cc.Sprite.prototype.ctor.call(this);

        this._dimensions = cc.size(0, 0);
        this._hAlignment = cc.TEXT_ALIGNMENT_LEFT;
        this._vAlignment = cc.VERTICAL_TEXT_ALIGNMENT_TOP;
        this._opacityModifyRGB = false;
        this._fontStyleStr = "";
        this._fontName = "Arial";
        this._isMultiLine = false;

        this._shadowEnabled = false;
        this._shadowOffset = cc.p(0, 0);
        this._shadowOpacity = 0;
        this._shadowBlur = 0;
        this._shadowColorStr = "rgba(128, 128, 128, 0.5)";

        this._strokeEnabled = false;
        this._strokeColor = cc.color(255, 255, 255, 255);
        this._strokeSize = 0;
        this._strokeColorStr = "";

        this._textFillColor = cc.color(255, 255, 255, 255);
        this._fillColorStr = "rgba(255,255,255,1)";
        this._strokeShadowOffsetX = 0;
        this._strokeShadowOffsetY = 0;
        this._needUpdateTexture = false;

        this._lineWidths = [];

        this._setColorsString();

        if (fontName && fontName instanceof cc.FontDefinition) {
            this.initWithStringAndTextDefinition(text, fontName);
        } else {
            cc.LabelTTF.prototype.initWithString.call(this, text, fontName, fontSize, dimensions, hAlignment, vAlignment);
        }
    },

    init: function () {
        return this.initWithString(" ", this._fontName, this._fontSize);
    },

    _measureConfig: function () {
        this._getLabelContext().font = this._fontStyleStr;
    },
    _measure: function (text) {
        return this._getLabelContext().measureText(text).width;
    },

    description: function () {
        return "<cc.LabelTTF | FontName =" + this._fontName + " FontSize = " + this._fontSize.toFixed(1) + ">";
    },

    setColor: null,

    _setColorsString: null,

    updateDisplayedColor: null,

    setOpacity: null,

    updateDisplayedOpacity: null,

    updateDisplayedOpacityForCanvas: function (parentOpacity) {
        cc.Node.prototype.updateDisplayedOpacity.call(this, parentOpacity);
        this._setColorsString();
    },

    /**
     * Returns the text of the label
     * @return {String}
     */
    getString: function () {
        return this._string;
    },

    /**
     * Returns Horizontal Alignment of cc.LabelTTF
     * @return {cc.TEXT_ALIGNMENT_LEFT|cc.TEXT_ALIGNMENT_CENTER|cc.TEXT_ALIGNMENT_RIGHT}
     */
    getHorizontalAlignment: function () {
        return this._hAlignment;
    },

    /**
     * Returns Vertical Alignment of cc.LabelTTF
     * @return {cc.VERTICAL_TEXT_ALIGNMENT_TOP|cc.VERTICAL_TEXT_ALIGNMENT_CENTER|cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM}
     */
    getVerticalAlignment: function () {
        return this._vAlignment;
    },

    /**
     * Returns the dimensions of cc.LabelTTF, the dimension is the maximum size of the label, set it so that label will automatically change lines when necessary.
     * @see cc.LabelTTF#setDimensions, cc.LabelTTF#boundingWidth and cc.LabelTTF#boundingHeight
     * @return {cc.Size}
     */
    getDimensions: function () {
        return cc.size(this._dimensions);
    },

    /**
     * Returns font size of cc.LabelTTF
     * @return {Number}
     */
    getFontSize: function () {
        return this._fontSize;
    },

    /**
     * Returns font name of cc.LabelTTF
     * @return {String}
     */
    getFontName: function () {
        return this._fontName;
    },

    /**
     * Initializes the CCLabelTTF with a font name, alignment, dimension and font size, do not call it by yourself, you should pass the correct arguments in constructor to initialize the label.
     * @param {String} text
     * @param {cc.FontDefinition} textDefinition
     * @return {Boolean}
     */
    initWithStringAndTextDefinition: null,

    /**
     * Sets the text definition used by this label
     * @param {cc.FontDefinition} theDefinition
     */
    setTextDefinition: function (theDefinition) {
        if (theDefinition)
            this._updateWithTextDefinition(theDefinition, true);
    },

    /**
     * Extract the text definition used by this label
     * @return {cc.FontDefinition}
     */
    getTextDefinition: function () {
        return this._prepareTextDefinition(false);
    },

    /**
     * Enable or disable shadow for the label
     * @param {cc.Color | Number} a Color or The x axis offset of the shadow
     * @param {cc.Size | Number} b Size or The y axis offset of the shadow
     * @param {Number} c The blur size of the shadow or The opacity of the shadow (0 to 1)
     * @param {null | Number} d Null or The blur size of the shadow
     * @example
     *   old:
     *     labelttf.enableShadow(shadowOffsetX, shadowOffsetY, shadowOpacity, shadowBlur);
     *   new:
     *     labelttf.enableShadow(shadowColor, offset, blurRadius);
     */
    enableShadow: function (a, b, c, d) {
        if(a.r != null && a.g != null && a.b != null && a.a != null){
            this._enableShadow(a, b, c);
        }else{
            this._enableShadowNoneColor(a, b, c, d)
        }
    },

    _enableShadowNoneColor: function(shadowOffsetX, shadowOffsetY, shadowOpacity, shadowBlur){
        shadowOpacity = shadowOpacity || 0.5;
        if (false === this._shadowEnabled)
            this._shadowEnabled = true;

        var locShadowOffset = this._shadowOffset;
        if (locShadowOffset && (locShadowOffset.x != shadowOffsetX) || (locShadowOffset._y != shadowOffsetY)) {
            locShadowOffset.x = shadowOffsetX;
            locShadowOffset.y = shadowOffsetY;
        }

        if (this._shadowOpacity != shadowOpacity) {
            this._shadowOpacity = shadowOpacity;
        }
        this._setColorsString();

        if (this._shadowBlur != shadowBlur)
            this._shadowBlur = shadowBlur;
        this._setUpdateTextureDirty();
    },

    _enableShadow: function(shadowColor, offset, blurRadius){

        if(!this._shadowColor){
            this._shadowColor = cc.color(255, 255, 255, 128);
        }
        this._shadowColor.r = shadowColor.r;
        this._shadowColor.g = shadowColor.g;
        this._shadowColor.b = shadowColor.b;

        var x, y, a, b;
        x = offset.width || offset.x || 0;
        y = offset.height || offset.y || 0;
        a = (shadowColor.a != null) ? (shadowColor.a / 255) : 0.5;
        b = blurRadius;

        this._enableShadowNoneColor(x, y, a, b);
    },

    _getShadowOffsetX: function () {
        return this._shadowOffset.x;
    },
    _setShadowOffsetX: function (x) {
        if (false === this._shadowEnabled)
            this._shadowEnabled = true;

        if (this._shadowOffset.x != x) {
            this._shadowOffset.x = x;
            this._setUpdateTextureDirty();
        }
    },

    _getShadowOffsetY: function () {
        return this._shadowOffset._y;
    },
    _setShadowOffsetY: function (y) {
        if (false === this._shadowEnabled)
            this._shadowEnabled = true;

        if (this._shadowOffset._y != y) {
            this._shadowOffset._y = y;
            this._setUpdateTextureDirty();
        }
    },

    _getShadowOffset: function () {
        return cc.p(this._shadowOffset.x, this._shadowOffset.y);
    },
    _setShadowOffset: function (offset) {
        if (false === this._shadowEnabled)
            this._shadowEnabled = true;

        if (this._shadowOffset.x != offset.x || this._shadowOffset.y != offset.y) {
            this._shadowOffset.x = offset.x;
            this._shadowOffset.y = offset.y;
            this._setUpdateTextureDirty();
        }
    },

    _getShadowOpacity: function () {
        return this._shadowOpacity;
    },
    _setShadowOpacity: function (shadowOpacity) {
        if (false === this._shadowEnabled)
            this._shadowEnabled = true;

        if (this._shadowOpacity != shadowOpacity) {
            this._shadowOpacity = shadowOpacity;
            this._setColorsString();
            this._setUpdateTextureDirty();
        }
    },

    _getShadowBlur: function () {
        return this._shadowBlur;
    },
    _setShadowBlur: function (shadowBlur) {
        if (false === this._shadowEnabled)
            this._shadowEnabled = true;

        if (this._shadowBlur != shadowBlur) {
            this._shadowBlur = shadowBlur;
            this._setUpdateTextureDirty();
        }
    },

    /**
     * Disable shadow rendering
     */
    disableShadow: function () {
        if (this._shadowEnabled) {
            this._shadowEnabled = false;
            this._setUpdateTextureDirty();
        }
    },

    /**
     * Enable label stroke with stroke parameters
     * @param {cc.Color} strokeColor The color of stroke
     * @param {Number} strokeSize The size of stroke
     */
    enableStroke: function (strokeColor, strokeSize) {
        if (this._strokeEnabled === false)
            this._strokeEnabled = true;

        var locStrokeColor = this._strokeColor;
        if ((locStrokeColor.r !== strokeColor.r) || (locStrokeColor.g !== strokeColor.g) || (locStrokeColor.b !== strokeColor.b)) {
            locStrokeColor.r = strokeColor.r;
            locStrokeColor.g = strokeColor.g;
            locStrokeColor.b = strokeColor.b;
            this._setColorsString();
        }

        if (this._strokeSize !== strokeSize)
            this._strokeSize = strokeSize || 0;
        this._setUpdateTextureDirty();
    },

    _getStrokeStyle: function () {
        return this._strokeColor;
    },
    _setStrokeStyle: function (strokeStyle) {
        if (this._strokeEnabled === false)
            this._strokeEnabled = true;

        var locStrokeColor = this._strokeColor;
        if ((locStrokeColor.r !== strokeStyle.r) || (locStrokeColor.g !== strokeStyle.g) || (locStrokeColor.b !== strokeStyle.b)) {
            locStrokeColor.r = strokeStyle.r;
            locStrokeColor.g = strokeStyle.g;
            locStrokeColor.b = strokeStyle.b;
            this._setColorsString();
            this._setUpdateTextureDirty();
        }
    },

    _getLineWidth: function () {
        return this._strokeSize;
    },
    _setLineWidth: function (lineWidth) {
        if (this._strokeEnabled === false)
            this._strokeEnabled = true;
        if (this._strokeSize !== lineWidth) {
            this._strokeSize = lineWidth || 0;
            this._setUpdateTextureDirty();
        }
    },

    /**
     * Disable label stroke
     */
    disableStroke: function () {
        if (this._strokeEnabled) {
            this._strokeEnabled = false;
            this._setUpdateTextureDirty();
        }
    },

    /**
     * Sets the text fill color
     * @function
     * @param {cc.Color} fillColor The fill color of the label
     */
    setFontFillColor: null,

    _getFillStyle: function () {
        return this._textFillColor;
    },

    //set the text definition for this label
    _updateWithTextDefinition: function (textDefinition, mustUpdateTexture) {
        if (textDefinition.fontDimensions) {
            this._dimensions.width = textDefinition.boundingWidth;
            this._dimensions.height = textDefinition.boundingHeight;
        } else {
            this._dimensions.width = 0;
            this._dimensions.height = 0;
        }

        this._hAlignment = textDefinition.textAlign;
        this._vAlignment = textDefinition.verticalAlign;

        this._fontName = textDefinition.fontName;
        this._fontSize = textDefinition.fontSize || 12;
        this._fontStyleStr = this._fontSize + "px '" + this._fontName + "'";
        this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(this._fontName, this._fontSize);

        // shadow
        if (textDefinition.shadowEnabled)
            this.enableShadow(textDefinition.shadowOffsetX,
                textDefinition.shadowOffsetY,
                textDefinition.shadowOpacity,
                textDefinition.shadowBlur);

        // stroke
        if (textDefinition.strokeEnabled)
            this.enableStroke(textDefinition.strokeStyle, textDefinition.lineWidth);

        // fill color
        this.setFontFillColor(textDefinition.fillStyle);

        if (mustUpdateTexture)
            this._updateTexture();
    },

    _prepareTextDefinition: function (adjustForResolution) {
        var texDef = new cc.FontDefinition();

        if (adjustForResolution) {
            //texDef.fontSize = (cc._renderType === cc._RENDER_TYPE_CANVAS) ? this._fontSize : this._fontSize * cc.contentScaleFactor();
            texDef.fontSize = this._fontSize;
            texDef.boundingWidth = cc.contentScaleFactor() * this._dimensions.width;
            texDef.boundingHeight = cc.contentScaleFactor() * this._dimensions.height;
        } else {
            texDef.fontSize = this._fontSize;
            texDef.boundingWidth = this._dimensions.width;
            texDef.boundingHeight = this._dimensions.height;
        }

        texDef.fontName = this._fontName;
        texDef.textAlign = this._hAlignment;
        texDef.verticalAlign = this._vAlignment;

        // stroke
        if (this._strokeEnabled) {
            texDef.strokeEnabled = true;
            var locStrokeColor = this._strokeColor;
            texDef.strokeStyle = cc.color(locStrokeColor.r, locStrokeColor.g, locStrokeColor.b);
            texDef.lineWidth = this._strokeSize;
        } else
            texDef.strokeEnabled = false;

        // shadow
        if (this._shadowEnabled) {
            texDef.shadowEnabled = true;
            texDef.shadowBlur = this._shadowBlur;
            texDef.shadowOpacity = this._shadowOpacity;

            texDef.shadowOffsetX = (adjustForResolution ? cc.contentScaleFactor() : 1) * this._shadowOffset.x;
            texDef.shadowOffsetY = (adjustForResolution ? cc.contentScaleFactor() : 1) * this._shadowOffset.y;
        } else
            texDef._shadowEnabled = false;

        // text tint
        var locTextFillColor = this._textFillColor;
        texDef.fillStyle = cc.color(locTextFillColor.r, locTextFillColor.g, locTextFillColor.b);
        return texDef;
    },

    _fontClientHeight: 18,

    /**
     * Changes the text content of the label
     * @warning Changing the string is as expensive as creating a new cc.LabelTTF. To obtain better performance use cc.LabelAtlas
     * @param {String} text Text content for the label
     */
    setString: function (text) {
        text = String(text);
        if (this._originalText != text) {
            this._originalText = text + "";

            this._updateString();

            // Force update
            this._setUpdateTextureDirty();
        }
    },
    _updateString: function () {
        this._string = this._originalText;
    },

    /**
     * Sets Horizontal Alignment of cc.LabelTTF
     * @param {cc.TEXT_ALIGNMENT_LEFT|cc.TEXT_ALIGNMENT_CENTER|cc.TEXT_ALIGNMENT_RIGHT} alignment Horizontal Alignment
     */
    setHorizontalAlignment: function (alignment) {
        if (alignment !== this._hAlignment) {
            this._hAlignment = alignment;

            // Force update
            this._setUpdateTextureDirty();
        }
    },

    /**
     * Sets Vertical Alignment of cc.LabelTTF
     * @param {cc.VERTICAL_TEXT_ALIGNMENT_TOP|cc.VERTICAL_TEXT_ALIGNMENT_CENTER|cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM} verticalAlignment
     */
    setVerticalAlignment: function (verticalAlignment) {
        if (verticalAlignment != this._vAlignment) {
            this._vAlignment = verticalAlignment;

            // Force update
            this._setUpdateTextureDirty();
        }
    },

    /**
     * Set Dimensions of cc.LabelTTF, the dimension is the maximum size of the label, set it so that label will automatically change lines when necessary.
     * @param {cc.Size|Number} dim dimensions or width of dimensions
     * @param {Number} [height] height of dimensions
     */
    setDimensions: function (dim, height) {
        var width;
        if(height === undefined){
            width = dim.width;
            height = dim.height;
        }else
            width = dim;

        if (width != this._dimensions.width || height != this._dimensions.height) {
            this._dimensions.width = width;
            this._dimensions.height = height;
            this._updateString();
            // Force udpate
            this._setUpdateTextureDirty();
        }
    },

    _getBoundingWidth: function () {
        return this._dimensions.width;
    },
    _setBoundingWidth: function (width) {
        if (width != this._dimensions.width) {
            this._dimensions.width = width;
            this._updateString();
            // Force udpate
            this._setUpdateTextureDirty();
        }
    },

    _getBoundingHeight: function () {
        return this._dimensions.height;
    },
    _setBoundingHeight: function (height) {
        if (height != this._dimensions.height) {
            this._dimensions.height = height;
            this._updateString();
            // Force udpate
            this._setUpdateTextureDirty();
        }
    },

    /**
     * Sets font size of cc.LabelTTF
     * @param {Number} fontSize
     */
    setFontSize: function (fontSize) {
        if (this._fontSize !== fontSize) {
            this._fontSize = fontSize;
            this._fontStyleStr = fontSize + "px '" + this._fontName + "'";
            this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(this._fontName, fontSize);
            // Force update
            this._setUpdateTextureDirty();
        }
    },

    /**
     * Sets font name of cc.LabelTTF
     * @param {String} fontName
     */
    setFontName: function (fontName) {
        if (this._fontName && this._fontName != fontName) {
            this._fontName = fontName;
            this._fontStyleStr = this._fontSize + "px '" + fontName + "'";
            this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(fontName, this._fontSize);
            // Force update
            this._setUpdateTextureDirty();
        }
    },

    _getFont: function () {
        return this._fontStyleStr;
    },
    _setFont: function (fontStyle) {
        var res = cc.LabelTTF._fontStyleRE.exec(fontStyle);
        if (res) {
            this._fontSize = parseInt(res[1]);
            this._fontName = res[2];
            this._fontStyleStr = fontStyle;
            this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(this._fontName, this._fontSize);
            // Force update
            this._setUpdateTextureDirty();
        }
    },

    _drawTTFInCanvas: function (context) {
        if (!context)
            return;
        var locStrokeShadowOffsetX = this._strokeShadowOffsetX, locStrokeShadowOffsetY = this._strokeShadowOffsetY;
        var locContentSizeHeight = this._contentSize.height - locStrokeShadowOffsetY, locVAlignment = this._vAlignment, locHAlignment = this._hAlignment,
            locFontHeight = this._fontClientHeight, locStrokeSize = this._strokeSize;

        context.setTransform(1, 0, 0, 1, 0 + locStrokeShadowOffsetX * 0.5, locContentSizeHeight + locStrokeShadowOffsetY * 0.5);

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
            context.shadowOffsetX = locShadowOffset.x;
            context.shadowOffsetY = -locShadowOffset.y;
            context.shadowBlur = this._shadowBlur;
        }

        context.textBaseline = cc.LabelTTF._textBaseline[locVAlignment];
        context.textAlign = cc.LabelTTF._textAlign[locHAlignment];

        var locContentWidth = this._contentSize.width - locStrokeShadowOffsetX;
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
                yOffset -= locContentSizeHeight;
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

    _getLabelContext: function () {
        if (this._labelContext)
            return this._labelContext;

        if (!this._labelCanvas) {
            var locCanvas = cc.newElement("canvas");
            var labelTexture = new cc.Texture2D();
            labelTexture.initWithElement(locCanvas);
            this.texture = labelTexture;
            this._labelCanvas = locCanvas;
        }
        this._labelContext = this._labelCanvas.getContext("2d");
        return this._labelContext;
    },

    _checkWarp: function(strArr, i, maxWidth){
        var text = strArr[i];
        var allWidth = this._measure(text);
        if(allWidth > maxWidth && text.length > 1){

            var fuzzyLen = text.length * ( maxWidth / allWidth ) | 0;
            var tmpText = text.substr(fuzzyLen);
            var width = allWidth - this._measure(tmpText);
            var sLine;
            var pushNum = 0;

            //Increased while cycle maximum ceiling. default 100 time
            var checkWhile = 0;

            //Exceeded the size
            while(width > maxWidth && checkWhile++ < 100){
                fuzzyLen *= maxWidth / width;
                fuzzyLen = fuzzyLen | 0;
                tmpText = text.substr(fuzzyLen);
                width = allWidth - this._measure(tmpText);
            }

            checkWhile = 0;

            //Find the truncation point
            while(width < maxWidth && checkWhile++ < 100){

                if(tmpText){
                    var exec = cc.LabelTTF._wordRex.exec(tmpText);
                    pushNum = exec ? exec[0].length : 1;
                    sLine = tmpText;
                }

                fuzzyLen = fuzzyLen + pushNum;

                tmpText = text.substr(fuzzyLen);

                width = allWidth - this._measure(tmpText);
            }

            fuzzyLen -= pushNum;

            var sText = text.substr(0, fuzzyLen);

            //symbol in the first
            if(cc.LabelTTF.wrapInspection){
                if(cc.LabelTTF._symbolRex.test(sLine || tmpText)){
                    var result = cc.LabelTTF._lastWordRex.exec(sText);
                    fuzzyLen -= result ? result[0].length : 0;

                    sLine = text.substr(fuzzyLen);
                    sText = text.substr(0, fuzzyLen);
                }
            }

            //To judge whether a English words are truncated
            if(cc.LabelTTF._firsrEnglish.test(sLine)){
                var result = cc.LabelTTF._lastEnglish.exec(sText);
                if(result && sText !== result[0]){
                    fuzzyLen -= result[0].length;
                    sLine = text.substr(fuzzyLen);
                    sText = text.substr(0, fuzzyLen);
                }
            }

            strArr[i] = sLine || tmpText;
            strArr.splice(i, 0, sText);
        }
    },

    _updateTTF: function () {
        var locDimensionsWidth = this._dimensions.width, i, strLength;
        var locLineWidth = this._lineWidths;
        locLineWidth.length = 0;

        this._isMultiLine = false;
        this._measureConfig();
        if (locDimensionsWidth !== 0) {
            // Content processing
            this._strings = this._string.split('\n');

            for(i = 0; i < this._strings.length; i++){
                this._checkWarp(this._strings, i, locDimensionsWidth);
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
            locStrokeShadowOffsetX += Math.abs(locOffsetSize.x) * 2;
            locStrokeShadowOffsetY += Math.abs(locOffsetSize.y) * 2;
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
        this._anchorPointInPoints.x = (locStrokeShadowOffsetX * 0.5) + ((locSize.width - locStrokeShadowOffsetX) * locAP.x);
        this._anchorPointInPoints.y = (locStrokeShadowOffsetY * 0.5) + ((locSize.height - locStrokeShadowOffsetY) * locAP.y);
    },

    /**
     * Returns the actual content size of the label, the content size is the real size that the label occupied while dimension is the outer bounding box of the label.
     * @returns {cc.Size} The content size
     */
    getContentSize: function () {
        if (this._needUpdateTexture)
            this._updateTTF();
        return cc.Sprite.prototype.getContentSize.call(this);
    },

    _getWidth: function () {
        if (this._needUpdateTexture)
            this._updateTTF();
        return cc.Sprite.prototype._getWidth.call(this);
    },
    _getHeight: function () {
        if (this._needUpdateTexture)
            this._updateTTF();
        return cc.Sprite.prototype._getHeight.call(this);
    },

    _updateTexture: function () {
        var locContext = this._getLabelContext(), locLabelCanvas = this._labelCanvas;
        var locContentSize = this._contentSize;

        if (this._string.length === 0) {
            locLabelCanvas.width = 1;
            locLabelCanvas.height = locContentSize.height || 1;
            this._texture && this._texture.handleLoadedTexture();
            this.setTextureRect(cc.rect(0, 0, 1, locContentSize.height));
            return true;
        }

        //set size for labelCanvas
        locContext.font = this._fontStyleStr;
        this._updateTTF();
        var width = locContentSize.width, height = locContentSize.height;
        var flag = locLabelCanvas.width == width && locLabelCanvas.height == height;
        locLabelCanvas.width = width;
        locLabelCanvas.height = height;
        if (flag) locContext.clearRect(0, 0, width, height);

        //draw text to labelCanvas
        this._drawTTFInCanvas(locContext);
        this._texture && this._texture.handleLoadedTexture();

        this.setTextureRect(cc.rect(0, 0, width, height));
        return true;
    },

    visit: function (ctx) {
        if (!this._string || this._string == "")
            return;
        if (this._needUpdateTexture) {
            this._needUpdateTexture = false;
            this._updateTexture();
        }
        var context = ctx || cc._renderContext;
        cc.Sprite.prototype.visit.call(this, context);
    },

    draw: null,

    _setTextureCoords: function (rect) {
        var tex = this._batchNode ? this.textureAtlas.texture : this._texture;
        if (!tex)
            return;

        var atlasWidth = tex.pixelsWidth;
        var atlasHeight = tex.pixelsHeight;

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

if (cc._renderType === cc._RENDER_TYPE_CANVAS) {

    var _p = cc.LabelTTF.prototype;

    _p.setColor = function (color3) {
        cc.Node.prototype.setColor.call(this, color3);
        this._setColorsString();
    };

    _p._transformForRenderer = function(){
        if (this._needUpdateTexture) {
            this._needUpdateTexture = false;
            this._updateTexture();
        }
        cc.Node.prototype._transformForRenderer.call(this);
    };

    _p._setColorsString = function () {
        this._setUpdateTextureDirty();

        var locDisplayColor = this._displayedColor,
            locDisplayedOpacity = this._displayedOpacity,
            locShadowColor = this._shadowColor || this._displayedColor;
        var locStrokeColor = this._strokeColor, locFontFillColor = this._textFillColor;

        this._shadowColorStr = "rgba(" + (0 | (locShadowColor.r * 0.5)) + "," + (0 | (locShadowColor.g * 0.5)) + "," + (0 | (locShadowColor.b * 0.5)) + "," + this._shadowOpacity + ")";
        this._fillColorStr = "rgba(" + (0 | (locDisplayColor.r / 255 * locFontFillColor.r)) + "," + (0 | (locDisplayColor.g / 255 * locFontFillColor.g)) + ","
            + (0 | (locDisplayColor.b / 255 * locFontFillColor.b)) + ", " + locDisplayedOpacity / 255 + ")";
        this._strokeColorStr = "rgba(" + (0 | (locDisplayColor.r / 255 * locStrokeColor.r)) + "," + (0 | (locDisplayColor.g / 255 * locStrokeColor.g)) + ","
            + (0 | (locDisplayColor.b / 255 * locStrokeColor.b)) + ", " + locDisplayedOpacity / 255 + ")";
    };

    _p.updateDisplayedColor = function (parentColor) {
        cc.Node.prototype.updateDisplayedColor.call(this, parentColor);
        this._setColorsString();
    };

    _p.setOpacity = function (opacity) {
        if (this._opacity === opacity)
            return;
        cc.Sprite.prototype.setOpacity.call(this, opacity);
        this._setColorsString();
        this._setUpdateTextureDirty();
    };

    //TODO: _p._updateDisplayedOpacityForCanvas
    _p.updateDisplayedOpacity = cc.Sprite.prototype.updateDisplayedOpacity;

    _p.initWithStringAndTextDefinition = function (text, textDefinition) {
        // prepare everything needed to render the label
        this._updateWithTextDefinition(textDefinition, false);

        // set the string
        this.string = text;

        return true;
    };

    _p.setFontFillColor = function (tintColor) {
        var locTextFillColor = this._textFillColor;
        if (locTextFillColor.r != tintColor.r || locTextFillColor.g != tintColor.g || locTextFillColor.b != tintColor.b) {
            locTextFillColor.r = tintColor.r;
            locTextFillColor.g = tintColor.g;
            locTextFillColor.b = tintColor.b;

            this._setColorsString();
            this._setUpdateTextureDirty();
        }
    };

    _p.draw = cc.Sprite.prototype.draw;

    _p.setTextureRect = function (rect, rotated, untrimmedSize) {
        this._rectRotated = rotated || false;
        untrimmedSize = untrimmedSize || rect;

        this.setContentSize(untrimmedSize);
        this.setVertexRect(rect);

        var locTextureCoordRect = this._rendererCmd._textureCoord;
        locTextureCoordRect.x = rect.x;
        locTextureCoordRect.y = rect.y;
        locTextureCoordRect.renderX = rect.x;
        locTextureCoordRect.renderY = rect.y;
        locTextureCoordRect.width = rect.width;
        locTextureCoordRect.height = rect.height;
        locTextureCoordRect.validRect = !(locTextureCoordRect.width === 0 || locTextureCoordRect.height === 0
            || locTextureCoordRect.x < 0 || locTextureCoordRect.y < 0);

        var relativeOffset = this._unflippedOffsetPositionFromCenter;
        if (this._flippedX)
            relativeOffset.x = -relativeOffset.x;
        if (this._flippedY)
            relativeOffset.y = -relativeOffset.y;
        this._offsetPosition.x = relativeOffset.x + (this._contentSize.width - this._rect.width) / 2;
        this._offsetPosition.y = relativeOffset.y + (this._contentSize.height - this._rect.height) / 2;

        // rendering using batch node
        if (this._batchNode) {
            this.dirty = true;
        }
    };
    _p = null;

} else {
    cc.assert(cc.isFunction(cc._tmp.WebGLLabelTTF), cc._LogInfos.MissingFile, "LabelTTFWebGL.js");
    cc._tmp.WebGLLabelTTF();
    delete cc._tmp.WebGLLabelTTF;
}

cc.assert(cc.isFunction(cc._tmp.PrototypeLabelTTF), cc._LogInfos.MissingFile, "LabelTTFPropertyDefine.js");
cc._tmp.PrototypeLabelTTF();
delete cc._tmp.PrototypeLabelTTF;

cc.LabelTTF._textAlign = ["left", "center", "right"];

cc.LabelTTF._textBaseline = ["top", "middle", "bottom"];

//check the first character
cc.LabelTTF.wrapInspection = true;

//Support: English French German
//Other as Oriental Language
cc.LabelTTF._wordRex = /([a-zA-Z0-9ÄÖÜäöüßéèçàùêâîôû]+|\S)/;
cc.LabelTTF._symbolRex = /^[!,.:;}\]%\?>、‘“》？。，！]/;
cc.LabelTTF._lastWordRex = /([a-zA-Z0-9ÄÖÜäöüßéèçàùêâîôû]+|\S)$/;
cc.LabelTTF._lastEnglish = /[a-zA-Z0-9ÄÖÜäöüßéèçàùêâîôû]+$/;
cc.LabelTTF._firsrEnglish = /^[a-zA-Z0-9ÄÖÜäöüßéèçàùêâîôû]/;

// Only support style in this format: "18px Verdana" or "18px 'Helvetica Neue'"
cc.LabelTTF._fontStyleRE = /^(\d+)px\s+['"]?([\w\s\d]+)['"]?$/;

/**
 * creates a cc.LabelTTF from a font name, alignment, dimension and font size
 * @deprecated since v3.0, please use the new construction instead
 * @see cc.LabelTTF
 * @static
 * @param {String} text
 * @param {String|cc.FontDefinition} [fontName="Arial"]
 * @param {Number} [fontSize=16]
 * @param {cc.Size} [dimensions=cc.size(0,0)]
 * @param {Number} [hAlignment=cc.TEXT_ALIGNMENT_LEFT]
 * @param {Number} [vAlignment=cc.VERTICAL_TEXT_ALIGNMENT_TOP]
 * @return {cc.LabelTTF|Null}
 */
cc.LabelTTF.create = function (text, fontName, fontSize, dimensions, hAlignment, vAlignment) {
    return new cc.LabelTTF(text, fontName, fontSize, dimensions, hAlignment, vAlignment);
};

/**
 * @deprecated since v3.0, please use the new construction instead
 * @function
 * @static
 */
cc.LabelTTF.createWithFontDefinition = cc.LabelTTF.create;

if (cc.USE_LA88_LABELS)
    cc.LabelTTF._SHADER_PROGRAM = cc.SHADER_POSITION_TEXTURECOLOR;
else
    cc.LabelTTF._SHADER_PROGRAM = cc.SHADER_POSITION_TEXTUREA8COLOR;

cc.LabelTTF.__labelHeightDiv = cc.newElement("div");
cc.LabelTTF.__labelHeightDiv.style.fontFamily = "Arial";
cc.LabelTTF.__labelHeightDiv.style.position = "absolute";
cc.LabelTTF.__labelHeightDiv.style.left = "-100px";
cc.LabelTTF.__labelHeightDiv.style.top = "-100px";
cc.LabelTTF.__labelHeightDiv.style.lineHeight = "normal";

document.body ?
    document.body.appendChild(cc.LabelTTF.__labelHeightDiv) :
    cc._addEventListener(window, 'load', function () {
        this.removeEventListener('load', arguments.callee, false);
        document.body.appendChild(cc.LabelTTF.__labelHeightDiv);
    }, false);


cc.LabelTTF.__getFontHeightByDiv = function (fontName, fontSize) {
    var clientHeight = cc.LabelTTF.__fontHeightCache[fontName + "." + fontSize];
    if (clientHeight > 0) return clientHeight;
    var labelDiv = cc.LabelTTF.__labelHeightDiv;
    labelDiv.innerHTML = "ajghl~!";
    labelDiv.style.fontFamily = fontName;
    labelDiv.style.fontSize = fontSize + "px";
    clientHeight = labelDiv.clientHeight;
    cc.LabelTTF.__fontHeightCache[fontName + "." + fontSize] = clientHeight;
    labelDiv.innerHTML = "";
    return clientHeight;
};

cc.LabelTTF.__fontHeightCache = {};