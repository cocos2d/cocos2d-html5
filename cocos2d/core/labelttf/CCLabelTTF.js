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
 * cc.LabelTTF is a subclass of cc.TextureNode that knows how to render text labels<br/>
 * All features from cc.TextureNode are valid in cc.LabelTTF<br/>
 * cc.LabelTTF objects are slow for js-binding on mobile devices.Consider using cc.LabelAtlas or cc.LabelBMFont instead. <br/>
 * Consider using cc.LabelAtlas or cc.LabelBMFont instead.<br/>
 * @class
 * @extends cc.Sprite
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
 *
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
     * creates a cc.LabelTTF from a font name, alignment, dimension and font size
     * Constructor of cc.LabelTTF
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
     */
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
        }
        else {
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
    _checkNextline: function (text, width) {
        var tWidth = this._measure(text);
        // Estimated word number per line
        var baseNb = Math.floor(text.length * width / tWidth);
        // Next line is a line with line break
        var nextlinebreak = text.indexOf('\n');
        if (baseNb * 0.8 >= nextlinebreak && nextlinebreak > 0) return nextlinebreak + 1;
        // Text width smaller than requested width
        if (tWidth < width) return text.length;

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
            if (result[2] == '\n' && l < width) {
                found = true;
                idfound = index;
                break;
            }
            if (l > width) {
                if (idfound != -1)
                    found = true;
                break;
            }
            idfound = index;
            substr = text.substr(index);
        }
        if (found) return idfound;

        // Backward check when forward check failed
        substr = text.substr(0, baseNb);
        idfound = baseNb;
        while (result = reversre.exec(substr)) {
            // BUG: Not secured if check with result[0]
            idfound = result[1].length;
            substr = result[1];
            l = this._measure(substr);
            if (l < width) {
                if (enre.test(result[2]))
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
    description: function () {
        return "<cc.LabelTTF | FontName =" + this._fontName + " FontSize = " + this._fontSize.toFixed(1) + ">";
    },

    setColor: null,

    _setColorsString: null,

    updateDisplayedColor: null,
    setOpacity: null,

    updateDisplayedOpacity: null,
    updateDisplayedOpacityForCanvas: function (parentOpacity) {
        cc.NodeRGBA.prototype.updateDisplayedOpacity.call(this, parentOpacity);
        this._setColorsString();
    },

    /**
     * returns the text of the label
     * @return {String}
     */
    getString: function () {
        return this._string;
    },

    /**
     * return Horizontal Alignment of cc.LabelTTF
     * @return {cc.TEXT_ALIGNMENT_LEFT|cc.TEXT_ALIGNMENT_CENTER|cc.TEXT_ALIGNMENT_RIGHT}
     */
    getHorizontalAlignment: function () {
        return this._hAlignment;
    },

    /**
     * return Vertical Alignment of cc.LabelTTF
     * @return {cc.VERTICAL_TEXT_ALIGNMENT_TOP|cc.VERTICAL_TEXT_ALIGNMENT_CENTER|cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM}
     */
    getVerticalAlignment: function () {
        return this._vAlignment;
    },

    /**
     * return Dimensions of cc.LabelTTF
     * @return {cc.Size}
     */
    getDimensions: function () {
        return cc.size(this._dimensions.width, this._dimensions.height);
    },

    /**
     * return font size of cc.LabelTTF
     * @return {Number}
     */
    getFontSize: function () {
        return this._fontSize;
    },

    /**
     * return font name of cc.LabelTTF
     * @return {String}
     */
    getFontName: function () {
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
    initWithString: function (label, fontName, fontSize, dimensions, hAlignment, vAlignment) {
        var strInfo;
        if (label)
            strInfo = label + "";
        else
            strInfo = "";

        fontSize = fontSize || 16;
        dimensions = dimensions || cc.size(0, fontSize);
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
        this._needUpdateTexture = false;
        return true;
    },

    /**
     * initializes the CCLabelTTF with a font name, alignment, dimension and font size
     * @param {String} text
     * @param {cc.FontDefinition} textDefinition
     * @return {Boolean}
     */
    initWithStringAndTextDefinition: null,

    /**
     * set the text definition used by this label
     * @param {cc.FontDefinition} theDefinition
     */
    setTextDefinition: function (theDefinition) {
        if (theDefinition)
            this._updateWithTextDefinition(theDefinition, true);
    },

    /**
     * get the text definition used by this label
     * @return {cc.FontDefinition}
     */
    getTextDefinition: function () {
        return this._prepareTextDefinition(false);
    },

    /**
     * enable or disable shadow for the label
     * @param {cc.Point} shadowOffset
     * @param {Number} shadowOpacity (0 to 1)
     * @param {Number} shadowBlur
     */
    enableShadow: function (shadowOffsetX, shadowOffsetY, shadowOpacity, shadowBlur) {
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

        this._needUpdateTexture = true;
    },

    _getShadowOffsetX: function () {
        return this._shadowOffset.x;
    },
    _setShadowOffsetX: function (x) {
        if (false === this._shadowEnabled)
            this._shadowEnabled = true;

        if (this._shadowOffset.x != x) {
            this._shadowOffset.x = x;
            this._needUpdateTexture = true;
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
            this._needUpdateTexture = true;
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
            this._needUpdateTexture = true;
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
            this._needUpdateTexture = true;
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
            this._needUpdateTexture = true;
        }
    },

    /**
     * disable shadow rendering
     */
    disableShadow: function () {
        if (this._shadowEnabled) {
            this._shadowEnabled = false;
            this._needUpdateTexture = true;
        }
    },

    /**
     * enable or disable stroke
     * @param {cc.Color} strokeColor
     * @param {Number} strokeSize
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

        this._needUpdateTexture = true;
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

            this._needUpdateTexture = true;
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
            this._needUpdateTexture = true;
        }
    },

    /**
     * disable stroke
     */
    disableStroke: function () {
        if (this._strokeEnabled) {
            this._strokeEnabled = false;
            this._needUpdateTexture = true;
        }
    },

    /**
     * set text tinting
     * @function
     * @param {cc.Color} tintColor
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
     * changes the string to render
     * @warning Changing the string is as expensive as creating a new cc.LabelTTF. To obtain better performance use cc.LabelAtlas
     * @param {String} text text for the label
     */
    setString: function (text) {
        text = String(text);
        if (this._originalText != text) {
            this._originalText = text + "";

            this._updateString();

            // Force update
            this._needUpdateTexture = true;
        }
    },
    _updateString: function () {
        this._string = this._originalText;
    },
    /**
     * set Horizontal Alignment of cc.LabelTTF
     * @param {cc.TEXT_ALIGNMENT_LEFT|cc.TEXT_ALIGNMENT_CENTER|cc.TEXT_ALIGNMENT_RIGHT} alignment Horizontal Alignment
     */
    setHorizontalAlignment: function (alignment) {
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
    setVerticalAlignment: function (verticalAlignment) {
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
    setDimensions: function (dim) {
        if (dim.width != this._dimensions.width || dim.height != this._dimensions.height) {
            this._dimensions = dim;
            this._updateString();
            // Force udpate
            this._needUpdateTexture = true;
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
            this._needUpdateTexture = true;
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
            this._needUpdateTexture = true;
        }
    },

    /**
     * set font size of cc.LabelTTF
     * @param {Number} fontSize
     */
    setFontSize: function (fontSize) {
        if (this._fontSize !== fontSize) {
            this._fontSize = fontSize;
            this._fontStyleStr = fontSize + "px '" + this._fontName + "'";
            this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(this._fontName, fontSize);
            // Force update
            this._needUpdateTexture = true;
        }
    },

    /**
     * set font name of cc.LabelTTF
     * @param {String} fontName
     */
    setFontName: function (fontName) {
        if (this._fontName && this._fontName != fontName) {
            this._fontName = fontName;
            this._fontStyleStr = this._fontSize + "px '" + fontName + "'";
            this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(fontName, this._fontSize);
            // Force update
            this._needUpdateTexture = true;
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
            this._needUpdateTexture = true;
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

    _updateTTF: function () {
        var locDimensionsWidth = this._dimensions.width, i, strLength;
        var locLineWidth = this._lineWidths;
        locLineWidth.length = 0;

        this._isMultiLine = false;
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
            locLabelCanvas.height = locContentSize.height;
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

    /**
     * Draw sprite to canvas
     * @function
     * @param {CanvasRenderingContext2D|WebGLRenderingContext} ctx Render context of canvas, 2d or 3d
     */
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
        cc.NodeRGBA.prototype.setColor.call(this, color3);

        this._setColorsString();
    };

    _p._setColorsString = function () {
        this._needUpdateTexture = true;

        var locDisplayColor = this._displayedColor, locDisplayedOpacity = this._displayedOpacity;
        var locStrokeColor = this._strokeColor, locFontFillColor = this._textFillColor;

        this._shadowColorStr = "rgba(" + (0 | (locDisplayColor.r * 0.5)) + "," + (0 | (locDisplayColor.g * 0.5)) + "," + (0 | (locDisplayColor.b * 0.5)) + "," + this._shadowOpacity + ")";
        this._fillColorStr = "rgba(" + (0 | (locDisplayColor.r / 255 * locFontFillColor.r)) + "," + (0 | (locDisplayColor.g / 255 * locFontFillColor.g)) + ","
            + (0 | (locDisplayColor.b / 255 * locFontFillColor.b)) + ", " + locDisplayedOpacity / 255 + ")";
        this._strokeColorStr = "rgba(" + (0 | (locDisplayColor.r / 255 * locStrokeColor.r)) + "," + (0 | (locDisplayColor.g / 255 * locStrokeColor.g)) + ","
            + (0 | (locDisplayColor.b / 255 * locStrokeColor.b)) + ", " + locDisplayedOpacity / 255 + ")";
    };

    _p.updateDisplayedColor = function (parentColor) {
        cc.NodeRGBA.prototype.updateDisplayedColor.call(this, parentColor);
        this._setColorsString();
    };

    _p.setOpacity = function (opacity) {
        if (this._opacity === opacity)
            return;
        cc.Sprite.prototype.setOpacity.call(this, opacity);
        this._setColorsString();
        this._needUpdateTexture = true;
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
            this._needUpdateTexture = true;
        }
    };

    _p.draw = cc.Sprite.prototype.draw;

    _p.setTextureRect = function (rect, rotated, untrimmedSize) {
        this._rectRotated = rotated || false;
        untrimmedSize = untrimmedSize || rect;

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
    cc.assert(typeof cc._tmp.WebGLLabelTTF === "function", cc._LogInfos.MissingFile, "LabelTTFWebGL.js");
    cc._tmp.WebGLLabelTTF();
    delete cc._tmp.WebGLLabelTTF;
}

cc.assert(typeof cc._tmp.PrototypeLabelTTF === "function", cc._LogInfos.MissingFile, "LabelTTFPropertyDefine.js");
cc._tmp.PrototypeLabelTTF();
delete cc._tmp.PrototypeLabelTTF;

cc.LabelTTF._textAlign = ["left", "center", "right"];

cc.LabelTTF._textBaseline = ["top", "middle", "bottom"];

// Class static properties for measure util
cc.LabelTTF._checkRegEx = /(.+?)([\s\n\r\-\/\\\:]|[\u4E00-\u9FA5]|[\uFE30-\uFFA0])/;
cc.LabelTTF._reverseCheckRegEx = /(.*)([\s\n\r\-\/\\\:]|[\u4E00-\u9FA5]|[\uFE30-\uFFA0])/;
cc.LabelTTF._checkEnRegEx = /[\s\-\/\\\:]/;

// Only support style in this format: "18px Verdana" or "18px 'Helvetica Neue'"
cc.LabelTTF._fontStyleRE = /^(\d+)px\s+['"]?([\w\s\d]+)['"]?$/;

/**
 * creates a cc.LabelTTF from a font name, alignment, dimension and font size
 * @param {String} text
 * @param {String|cc.FontDefinition} [fontName="Arial"]
 * @param {Number} [fontSize=16]
 * @param {cc.Size} [dimensions=cc.size(0,0)]
 * @param {Number} [hAlignment=cc.TEXT_ALIGNMENT_LEFT]
 * @param {Number} [vAlignment=cc.VERTICAL_TEXT_ALIGNMENT_TOP]
 * @return {cc.LabelTTF|Null}
 * @example
 * // Example
 * 1.
 * var myLabel = cc.LabelTTF.create('label text',  'Times New Roman', 32, cc.size(320,32), cc.TEXT_ALIGNMENT_LEFT);
 * 2.
 * var fontDef = new cc.FontDefinition();
 * fontDef.fontName = "Arial";
 * fontDef.fontSize = "32";
 * var myLabel = cc.LabelTTF.create('label text',  fontDef);
 */
cc.LabelTTF.create = function (text, fontName, fontSize, dimensions, hAlignment, vAlignment) {
    return new cc.LabelTTF(text, fontName, fontSize, dimensions, hAlignment, vAlignment);
};


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